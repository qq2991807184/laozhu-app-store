# -*- coding: utf-8 -*-
"""老朱应用商店 - 桌面后端（pywebview js_api）。

职责：
  设置读写（默认下载/安装到 D 盘）、原生目录选择；
  真实下载（断点续传 .part + Range 头；官网页自动解析直链，解析失败回退打开页面）；
  静默安装（NSIS /D、Inno /DIR、msi、通用 /S）；安装队列串行执行；
  已安装软件扫描（注册表 Uninstall，评分匹配）与卸载；
  托盘 / Windows 通知 / 任务栏进度条 / 提示音（nativefx）。
"""
import hashlib
import json
import os
import re
import shutil
import ssl
import subprocess
import sys
import threading
import time
import urllib.parse
import urllib.request
import webbrowser
import winreg

import nativefx
import store_data

BASE = os.path.dirname(os.path.abspath(__file__))
_RES_DIR = getattr(sys, "_MEIPASS", BASE)


def _pick_write_dir():
    """可写数据目录。

    装到 D:\\Program Files\\老朱应用商店 后，exe 同目录只有管理员能写，
    普通用户运行存不了 settings.json，所以配置改放 %APPDATA%\\老朱应用商店。
    开发态仍写源码目录；旧版放在 exe 旁的 settings.json 首次启动时搬过来。
    """
    if not getattr(sys, "frozen", False):
        return BASE
    appdata = os.environ.get("APPDATA") or os.path.expanduser("~")
    d = os.path.join(appdata, "老朱应用商店")
    try:
        os.makedirs(d, exist_ok=True)
    except Exception:
        return os.path.dirname(sys.executable)
    new_p = os.path.join(d, "settings.json")
    old_p = os.path.join(os.path.dirname(sys.executable), "settings.json")
    if not os.path.isfile(new_p) and os.path.isfile(old_p):
        try:
            shutil.copy2(old_p, new_p)
        except Exception:
            pass
    return d


_WRITE_DIR = _pick_write_dir()
SETTINGS_PATH = os.path.join(_WRITE_DIR, "settings.json")
ICONS_MAP = os.path.join(_RES_DIR, "icons_map.json")

_CTX = ssl.create_default_context()
_CTX.check_hostname = False
_CTX.verify_mode = ssl.CERT_NONE
_UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}


def default_download_dir():
    """优先 D 盘，没有 D 盘退回系统下载目录。"""
    if os.path.isdir("D:\\"):
        return r"D:\老朱应用商店\下载"
    return os.path.join(os.path.expanduser("~"), "Downloads", "老朱应用商店")


def default_install_dir():
    if os.path.isdir("D:\\"):
        return r"D:\老朱应用商店\安装"
    return os.environ.get("ProgramFiles", r"C:\Program Files")


def default_package_dir():
    """本地安装包目录（不进 exe 包体，只是「指过去」。

    优先用桌面上的「安装包」文件夹，没有就用下载目录的上一级 packages/。
    exe 里不带任何安装包，扫的就是用户自己攒的这些文件。
    """
    desktop = os.path.join(os.path.expanduser("~"), "Desktop")
    for cand in (os.path.join(desktop, "安装包"), os.path.join(desktop, "packages")):
        if os.path.isdir(cand):
            return cand
    return os.path.join(desktop, "安装包")


# 本地面板认的安装包/程序扩展名
_PKG_EXT = (".exe", ".msi", ".msix", ".appx", ".zip", ".7z", ".rar")
# 明显不是「给人装软件用」的可执行文件，扫到也别列（扫 440 个文件时很吵）
_PKG_SKIP = ("unins", "uninst", "卸载", "update", "upgrade", "setup_helper",
             "crashpad", "vc_redist", "bugreport")


def _safe_dirname(name):
    """应用名转合法目录名（去掉 Windows 不允许的字符，避免 makedirs 抛异常）。"""
    bad = '\\/:*?"<>|'
    out = "".join("_" if c in bad else c for c in str(name)).strip(" .")
    return out or "app"


# ---------------------------------------------------------------- 已安装扫描
_UNINSTALL_KEYS = [
    (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall", winreg.KEY_WOW64_64KEY),
    (winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall", winreg.KEY_WOW64_32KEY),
    (winreg.HKEY_CURRENT_USER,  r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall", 0),
]


def _iter_uninstall_entries():
    """遍历全部卸载注册表项，产出 {name, version, uninstall, location, icon, publisher, date, size}。

    publisher/date/size 给「已安装软件」列表用（火绒那种一行一款的样式：
    名称 + 厂商 + 安装日期 + 占用体积）。size 单位 KB（注册表 EstimatedSize 的原值），
    缺失时返回 0，前端显示「—」。
    """
    for root, sub, sam in _UNINSTALL_KEYS:
        try:
            with winreg.OpenKey(root, sub, 0, winreg.KEY_READ | sam) as k:
                i = 0
                while True:
                    try:
                        key_name = winreg.EnumKey(k, i)
                        i += 1
                    except OSError:
                        break
                    try:
                        with winreg.OpenKey(k, key_name, 0, winreg.KEY_READ) as sk:
                            def gv(n):
                                try:
                                    return winreg.QueryValueEx(sk, n)[0]
                                except OSError:
                                    return ""
                            name = gv("DisplayName")
                            if not name:
                                continue
                            size = gv("EstimatedSize")
                            yield {
                                "name": name,
                                "version": gv("DisplayVersion"),
                                "uninstall": gv("UninstallString"),
                                "location": gv("InstallLocation"),
                                "icon": gv("DisplayIcon"),
                                "publisher": gv("Publisher"),
                                "date": gv("InstallDate"),
                                "size": int(size) if isinstance(size, int) else 0,
                            }
                    except OSError:
                        continue
        except OSError:
            continue


def _name_score(detects, name):
    """检测名对 DisplayName 的得分，阈值 0.6。

    基础分 = len(检测名)/len(DisplayName)，防「QQ」误匹配「QQ浏览器」（0.4）。
    但 Inno 会把 DisplayName 写成「TRAE CN (User)」这种带后缀的形式，
    「trae cn」按长度比只有 0.5，会被阈值挡掉——所以前缀+分隔符命中给满分。
    """
    n = (name or "").lower().strip()
    best = 0.0
    for d in detects or []:
        d = (d or "").lower().strip()
        if not d or d not in n:
            continue
        if n == d or n.startswith(d + " ") or n.startswith(d + "(") or n.startswith(d + "-"):
            score = 1.0
        else:
            score = len(d) / max(len(n), 1)
        best = max(best, score)
    return best


# ---------------------------------------------------------------- 文件系统探测
# 第三路来源：注册表里没有痕迹的「解包版 / MSIX 解包 / 绿色版」。
# ChatGPT 桌面版就是这种：装在 D:\ChatGPT\App\app\ChatGPT.exe，不写 Uninstall 项，
# 只靠注册表永远认不出来。做法是把常见安装根目录的一级子目录建成索引，
# 用应用名/英文名/检测名去命中目录名，再进去找主程序。
_FS_INDEX = None


def _flat(s):
    """归一化名字：去空格、下划线、点、横杠、括号，转小写。"""
    return re.sub(r"[\s_\-.()（）]+", "", str(s or "").lower())


def _install_roots():
    roots = []
    for base in (os.environ.get("ProgramFiles"), os.environ.get("ProgramFiles(x86)"),
                 os.path.join(os.environ.get("LOCALAPPDATA") or "", "Programs"),
                 os.environ.get("LOCALAPPDATA"), os.environ.get("APPDATA")):
        if base and os.path.isdir(base):
            roots.append(base)
    for drive in ("C:\\", "D:\\", "E:\\", "F:\\"):
        if os.path.isdir(drive):
            roots.append(drive)
    return roots


def _fs_index():
    """常见安装根下的一级目录索引：{归一化目录名: 全路径}。

    Program Files / 盘根 一级目录通常几百个，全部建索引一次约几十毫秒，
    之后 70 款应用查表即可，不用每个应用都遍历磁盘。
    """
    global _FS_INDEX
    if _FS_INDEX is not None:
        return _FS_INDEX
    idx = {}
    for root in _install_roots():
        try:
            entries = list(os.scandir(root))[:800]
        except OSError:
            continue
        for e in entries:
            try:
                if e.is_dir():
                    idx.setdefault(_flat(e.name), e.path)
            except OSError:
                continue
    _FS_INDEX = idx
    return idx


def reset_fs_index():
    """安装/卸载后目录结构变了，索引要重建。"""
    global _FS_INDEX
    _FS_INDEX = None


def _probe_fs(app, taken=None):
    """在文件系统里找某应用的主程序，找不到返回空串。

    目录名匹配只做单向：应用名要出现在目录名里（chatgpt → D:\\ChatGPT，
    trae → Trae CN）。绝不能反过来判断「目录名出现在应用名里」——
    盘根那些 ai / re / d 这类两字母目录会把 baiduinput、cursor 全吃掉，
    实测一次能刷出十几个假阳性。

    要求名字归一化后 ≥5 字符、且占目录名 60% 以上，防短名误伤。
    """
    idx = _fs_index()
    hints = [app.get("name"), app.get("en"), app.get("id")]
    hints += list(app.get("detect") or [])
    hlist = [_flat(h) for h in hints if h]
    taken = taken or set()

    def ok(exe):
        return bool(exe) and os.path.normcase(exe) not in taken

    # 1) 目录名与应用名完全一致
    for h in hlist:
        if len(h) < 4:            # 「360」「qq」这种太短的会命中盘根公共目录，跳过
            continue
        p = idx.get(h)
        if p:
            exe, _ = _scan_dir_for_exe(p, hlist, depth=3)
            if ok(exe):
                return exe
    # 2) 应用名是目录名的一部分（长度与占比双门槛）
    for k, p in idx.items():
        if len(k) < 5:
            continue
        for h in hlist:
            if len(h) < 5:
                continue
            if h in k and len(h) / len(k) >= 0.6:
                exe, _ = _scan_dir_for_exe(p, hlist, depth=3)
                if ok(exe):
                    return exe
    return ""


def _fallback_entry(app, target):
    """在指定安装目录里找主程序，拼成一条已安装记录（注册表没有痕迹时用）。

    有些安装器（便携版、不写 Uninstall 项的自解压包）装完没有注册表项，
    但文件确实落地了。用它填一条记录，至少「启动」「打开目录」可用。
    """
    if not (app and target and os.path.isdir(target)):
        return None
    hints = [app.get("name", ""), app.get("en", ""), app.get("id", "")]
    hints += list(app.get("detect") or [])
    hints += list(_EXE_HINTS.get(app.get("id"), []))
    exe, score = _scan_dir_for_exe(target, hints, depth=3)
    if not exe:
        return None
    return {"name": app["name"], "version": "", "uninstall": "",
            "location": os.path.dirname(exe), "exe": exe,
            "publisher": "", "date": "", "size": 0}


def scan_installed(app_dirs=None):
    """返回 {app_id: {name, version, uninstall, location, exe}}，评分匹配防误伤。

    三路来源，按可靠性排序：
      1) 注册表 Uninstall 三根 —— 正常安装的软件都在这里，DisplayName 做评分匹配
         （阈值 0.6：「QQ浏览器」对 qq 得 0.4 被丢弃，「QQ」得 1.0 命中）；
      2) 商店自己装过的目录（settings.app_dirs）—— 用户选过 D 盘、安装器又没写
         注册表时，这条最准；
      3) 文件系统常见根目录 —— 覆盖解包版/绿色版（ChatGPT 桌面版这类）。

    exe 是主程序全路径，前端「启动」直接用它；location 优先取 exe 所在目录
    （注册表 InstallLocation 经常是空的或带尾部反斜杠）。
    """
    entries = list(_iter_uninstall_entries())
    result = {}
    used = set()
    for e in entries:
        n = e["name"].lower()
        best_id, best_score, best_app = None, 0.0, None
        for a in store_data.APPS:
            if a.get("web"):
                continue
            score = _name_score(a["detect"], n)
            if score > best_score:
                best_id, best_score, best_app = a["id"], score, a
        if not best_id or best_score < 0.6 or best_id in used:
            continue
        used.add(best_id)
        exe = _find_exe(best_app, e)
        loc = os.path.dirname(exe) if exe else ""
        if not loc:
            loc = (e.get("location") or "").strip().strip('"').rstrip("\\/")
            if loc and not os.path.isdir(loc):
                loc = ""
        result[best_id] = {
            "name": e["name"], "version": e["version"],
            "uninstall": e["uninstall"], "location": loc, "exe": exe,
            "publisher": e.get("publisher") or "", "date": e.get("date") or "",
            "size": e.get("size") or 0,
        }

    # 第二路：商店装过的目录（注册表还没写、或安装器根本不写时兜底）
    for app_id, d in (app_dirs or {}).items():
        if app_id in result or not d or not os.path.isdir(d):
            continue
        app = store_data.get_app(app_id)
        if not app or app.get("web"):
            continue
        fb = _fallback_entry(app, d)
        if fb:
            result[app_id] = fb

    # 第三路：文件系统常见根目录（解包版 / 绿色版）
    # 同一个 exe 只能归给一个应用，否则 D:\qq\Bin\QQ.exe 会被 QQ音乐、QQ浏览器、
    # 腾讯视频一起认领，卡片上全变「启动」，全是假的。
    taken = {os.path.normcase(v["exe"]) for v in result.values() if v.get("exe")}
    for a in store_data.APPS:
        if a.get("web") or a["id"] in result:
            continue
        exe = _probe_fs(a, taken)
        if exe:
            taken.add(os.path.normcase(exe))
            result[a["id"]] = {
                "name": a["name"], "version": "", "uninstall": "",
                "location": os.path.dirname(exe), "exe": exe,
                "publisher": "", "date": "", "size": 0,
            }
    return result


# ---------------------------------------------------------------- 主程序定位
# 这些名字的 exe 不是主程序：卸载器、更新器、崩溃上报、辅助进程。
# 拿它们当「启动」目标会一闪而过或静默退出，必须排掉。
_SKIP_EXE = (
    "unins", "uninst", "卸载", "update", "upgrade", "setup", "install",
    "maintenancetool", "crash", "helper", "report", "elevat", "vc_redist",
    "notification", "squirrel", "chrome_proxy", "ffmpeg", "7za", "uninstall",
    # LOL / 云顶之弈的代理与反作弊辅助进程，绝不是玩家的启动入口
    "crossproxy", "ace-helper", "bugreport", "exceptionreport", "fping",
    "startup_runner", "tinydl",
    # 微信 4.x 的 WeixinExt.exe 只是扩展宿主，启动它微信主窗口不出来
    "weixinext",
)

# 产品名和主程序名完全无关的软件，按 app_id 补名字线索。
# 英雄联盟装出来是 TCLS\client.exe / Launcher\Client.exe，用「英雄联盟」去匹配
# 全都是 0 分，最后一个字母序在前、恰好 0 分的 CrossProxy.exe 会被选中 ——
# 点了「启动」只会起个代理进程，游戏根本不弹。
_EXE_HINTS = {
    "lol": ["client", "leagueclient"],
}


def _exe_score(path, hints):
    """给一个 exe 打分：-1 表示排除，>=0 表示可作主程序，分数越高越像。

    名字完全等于应用名/英文名/检测名 → 100；互相包含 → 60；其余 0（兜底，
    很多主程序名和显示名不一致，如「微信」目录里是 Weixin.exe）。
    """
    low = os.path.basename(path).lower()
    if not low.endswith(".exe"):
        return -1
    stem = low[:-4]
    for s in _SKIP_EXE:
        if s in stem:
            return -1
    flat = re.sub(r"[\s_\-.]+", "", stem)
    best = 0
    for h in hints:
        h = re.sub(r"[\s_\-.]+", "", (h or "").lower())
        if not h:
            continue
        if flat == h:
            return 100
        if h in flat or flat in h:
            best = max(best, 60)
    return best


def _scan_dir_for_exe(d, hints, depth=1):
    """在目录里找主程序 exe（depth=1 表示再看一层子目录，如 app-1.2.3\\app.exe）。

    返回 (路径, 分数)。条目上限 400，避免扫进 node_modules 这类巨目录卡住。
    """
    best, best_score = "", -1
    try:
        entries = list(os.scandir(d))[:400]
    except OSError:
        return "", -1
    for e in entries:
        try:
            if e.is_file() and e.name.lower().endswith(".exe"):
                s = _exe_score(e.path, hints)
                if s > best_score:
                    best, best_score = e.path, s
            elif depth > 0 and e.is_dir():
                p, s = _scan_dir_for_exe(e.path, hints, depth - 1)
                if s > best_score:
                    best, best_score = p, s
        except OSError:
            continue
    return best, best_score


def _find_exe(app, entry):
    """定位某注册表项对应的主程序 exe，找不到返回空串。

    顺序：DisplayIcon（绝大多数安装器就是主程序）→ InstallLocation →
    卸载程序所在目录。任何一步拿到非辅助 exe 即返回。
    """
    hints = [app.get("name", ""), app.get("en", ""), app.get("id", "")]
    hints += list(app.get("detect") or [])
    hints += list(_EXE_HINTS.get(app.get("id"), []))

    icon = (entry.get("icon") or "").strip()
    if icon:
        p = icon.split(",")[0].strip().strip('"')
        if p.lower().endswith(".exe") and os.path.isfile(p) and _exe_score(p, hints) >= 0:
            return p

    cands = []
    loc = (entry.get("location") or "").strip().strip('"')
    if loc:
        cands.append(loc.rstrip("\\/"))
    us = (entry.get("uninstall") or "").strip()
    if us:
        # 卸载字符串三种写法：带引号、无引号但路径含空格、单 token。
        # 直接 split(" ") 会把 "D:\Program Files\bilibili\卸载.exe" 切成 "D:\Program"，
        # 目录就取错了 —— 先按 ".exe" 边界裁。
        m = re.match(r'^"([^"]+\.exe)"', us, re.I) or re.match(r'^(.*?\.exe)(?:\s|$)', us, re.I)
        if m:
            cands.append(os.path.dirname(m.group(1).strip()))

    best, best_score = "", -1
    for d in cands:
        if d and os.path.isdir(d):
            p, s = _scan_dir_for_exe(d, hints)
            if s > best_score:
                best, best_score = p, s
    return best


def _installed_location(app):
    """装完后从注册表反查真实安装目录。

    InstallLocation 多半是空的（Inno/NSIS 脚本不写这一项），此时取主程序
    exe 的所在目录。用户选了 D 盘、安装器却按自己的策略装到 C 盘时，
    靠这个把真实路径报回来。
    """
    best_score, best = 0.0, None
    for e in _iter_uninstall_entries():
        score = _name_score(app.get("detect") or [app["name"]], e["name"])
        if score > best_score:
            best_score, best = score, e
    if not best or best_score < 0.6:
        return ""
    exe = _find_exe(app, best)
    if exe:
        return os.path.dirname(exe)
    loc = (best.get("location") or "").strip().strip('"').rstrip("\\/")
    if loc and os.path.isdir(loc):
        return os.path.normpath(loc)
    icon = (best.get("icon") or "").strip().strip('"')
    if icon:
        d = os.path.dirname(icon.split(",")[0].strip())
        if d and os.path.isdir(d):
            return os.path.normpath(d)
    return ""


# ---------------------------------------------------------------- 安装包类型
def sniff_installer(path, declared="exe"):
    """按文件内容判定安装器类型，不盲信数据表里写的 type。

    Inno Setup 与 NSIS 的静默参数互不通用：Inno 认 /VERYSILENT /DIR=，
    NSIS 认 /S /D=。type 写错时参数被安装器直接忽略，它退回自己的默认
    策略（通常 %LOCALAPPDATA%\\Programs），用户指定的 D 盘就失效——
    Trae 那次装到 C 盘就是这么来的（声明 nsis，实际是 Inno Setup）。
    """
    low = path.lower()
    if low.endswith(".msi"):
        return "msi"
    try:
        with open(path, "rb") as f:
            head = f.read(8 * 1024 * 1024)   # 安装器头 + 资源段都在前 8MB 内
    except Exception:
        return declared
    if b"Inno Setup" in head:
        return "innosetup"
    if b"Nullsoft" in head or b"NSIS" in head:
        return "nsis"
    return declared


# ---------------------------------------------------------------- 直链解析
_EXE_LINK = re.compile(r'(?:href|src)=["\']([^"\']+?\.(?:exe|msi|msix|zip)(?:\?[^"\']*)?)["\']', re.I)


def _resolve_direct_url(page_url):
    """抓官方下载页，挑出 Windows 安装包直链。失败返回 None。"""
    try:
        req = urllib.request.Request(page_url, headers=_UA)
        with urllib.request.urlopen(req, timeout=15, context=_CTX) as r:
            raw = r.read(2 * 1024 * 1024)
        html = raw.decode("utf-8", "ignore")
        base = page_url
        cands = []
        for m in _EXE_LINK.finditer(html):
            href = m.group(1).replace("&amp;", "&")
            href = urllib.parse.urljoin(base, href)
            if not href.startswith("http"):
                continue
            low = href.lower()
            if any(k in low for k in ("mac", "darwin", "android", ".apk", "iphone", "ios", "linux", ".dmg")):
                continue
            score = 0
            if "win" in low: score += 2
            if any(k in low for k in ("setup", "install", "download", "setup_full")): score += 3
            if ".exe" in low: score += 1
            cands.append((score, href))
        if not cands:
            return None
        cands.sort(key=lambda x: -x[0])
        return cands[0][1]
    except Exception:
        return None


def _rlog(msg):
    """拉伸调试日志（RESIZE_DEBUG=1 时写盘）。"""
    if not os.environ.get("RESIZE_DEBUG"):
        return
    try:
        with open(os.path.join(_WRITE_DIR, "resize.log"), "a", encoding="utf-8") as f:
            f.write("%.3f %s\n" % (time.time(), msg))
    except Exception:
        pass


class Api:
    def __init__(self):
        self._settings = None
        self._resolved = {}          # app_id -> 解析出的直链（运行期缓存）
        self._queue = []             # 待处理任务 app_id
        self._active = {}            # app_id -> {"phase": "download"/"install", ...}
        self._queue_lock = threading.Lock()
        self._worker = None
        self._installed_cache = None
        self._all_cache = None       # id -> 注册表全量条目（批量卸载按 id 反查）
        self._targets = {}           # app_id -> 该应用本次的安装目录
        self._hwnd_val = 0
        self._resize_stop = threading.Event()   # 边缘拉伸的停止信号（前端 mouseup 触发）
        self._resize_stop.set()
        self._resize_gen = 0                    # 拉伸会话代号：新会话顶掉旧线程

    # ---------- 设置 ----------
    def _load_settings(self):
        if self._settings is not None:
            return self._settings
        s = {"download_dir": default_download_dir(),
             "install_dir": default_install_dir(),
             "package_dir": default_package_dir(),
             "resolved_urls": {},
             "app_dirs": {}}
        try:
            if os.path.isfile(SETTINGS_PATH):
                with open(SETTINGS_PATH, "r", encoding="utf-8") as f:
                    disk = json.load(f)
                if isinstance(disk, dict):
                    s.update({k: v for k, v in disk.items() if v})
        except Exception:
            pass
        self._settings = s
        self._resolved = dict(s.get("resolved_urls") or {})
        return s

    def _save_settings(self):
        try:
            s = self._load_settings()
            s["resolved_urls"] = self._resolved
            with open(SETTINGS_PATH, "w", encoding="utf-8") as f:
                json.dump(s, f, ensure_ascii=False, indent=2)
        except Exception:
            pass

    def get_settings(self):
        return self._load_settings()

    def save_settings(self, download_dir, install_dir):
        s = self._load_settings()
        if download_dir:
            s["download_dir"] = download_dir
        if install_dir:
            s["install_dir"] = install_dir
        self._save_settings()
        return {"ok": True, "settings": s}

    def reset_settings(self):
        self._settings = None
        try:
            if os.path.isfile(SETTINGS_PATH):
                os.remove(SETTINGS_PATH)
        except Exception:
            pass
        return self._load_settings()

    # ---------- 原生目录选择框 ----------
    def browse_dir(self, initial=None):
        try:
            import tkinter as tk
            from tkinter import filedialog
            root = tk.Tk()
            root.withdraw()
            root.attributes("-topmost", True)
            path = filedialog.askdirectory(initialdir=initial or os.path.expanduser("~"),
                                           title="选择文件夹", parent=root)
            root.destroy()
            return path or ""
        except Exception:
            return ""

    # ---------- 状态 ----------
    def get_state(self):
        icons = {}
        try:
            if os.path.isfile(ICONS_MAP):
                with open(ICONS_MAP, "r", encoding="utf-8") as f:
                    icons = json.load(f)
        except Exception:
            pass
        apps = []
        for a in store_data.APPS:
            d = dict(a)
            if a["id"] in icons:
                d["icon_img"] = icons[a["id"]]
            apps.append(d)
        return {
            "categories": store_data.CATEGORIES,
            "apps": apps,
            "settings": self._load_settings(),
            "installed": self.get_installed(),
        }

    def get_installed(self):
        """扫描已安装软件（缓存到 rescan 为止）。"""
        if self._installed_cache is None:
            self._installed_cache = self._scan()
        return self._installed_cache

    def _scan(self):
        return scan_installed(self._load_settings().get("app_dirs") or {})

    def rescan_installed(self):
        reset_fs_index()                       # 装/卸后目录结构变了，索引重建
        self._installed_cache = self._scan()
        self._emit('window.__installedChanged(%s)',
                   json.dumps(self._installed_cache, ensure_ascii=False))
        return self._installed_cache

    def list_all_installed(self):
        """本机全部已安装软件（注册表全量，包含商店没收录的）。

        「已安装软件」视图直接用它渲染成火绒那种一行一款的列表：名称 + 厂商 +
        安装日期 + 占用体积 + 卸载/打开。批量卸载按 id 回来查这张表，
        所以 id 用 name+uninstall 的哈希，进程内稳定。

        按 DisplayName 去重（同一软件常有 32/64 位两个注册表项）。
        """
        out, seen = [], set()
        for e in _iter_uninstall_entries():
            n = (e.get("name") or "").strip()
            if not n:
                continue
            key = n.lower()
            if key in seen:
                continue
            seen.add(key)
            exe = _find_exe({"name": n, "en": "", "id": "", "detect": [n]}, e)
            loc = os.path.dirname(exe) if exe else ""
            if not loc:
                loc = (e.get("location") or "").strip().strip('"').rstrip("\\/")
                if loc and not os.path.isdir(loc):
                    loc = ""
            item_id = hashlib.md5(
                (n + "|" + (e.get("uninstall") or "")).encode("utf-8")).hexdigest()[:12]
            date = (e.get("date") or "").strip()
            if not date:
                # 注册表 InstallDate 大多空着（尤其 Inno/NSIS），用主程序/安装目录的
                # 创建时间兜底，列表里至少有个像样的「安装时间」
                probe = exe or loc
                if probe and os.path.exists(probe):
                    try:
                        date = time.strftime("%Y%m%d", time.localtime(os.path.getctime(probe)))
                    except OSError:
                        date = ""
            out.append({
                "id": item_id,
                "name": n, "version": e.get("version") or "",
                "exe": exe, "location": loc,
                "publisher": (e.get("publisher") or "").strip(),
                "date": date,
                "size": e.get("size") or 0,
                "uninstall": e.get("uninstall") or "",
            })
        out.sort(key=lambda x: x["name"].lower())
        self._all_cache = {x["id"]: x for x in out}
        return out

    # ---------- 批量卸载 ----------
    def batch_uninstall(self, ids):
        """按 id 批量卸载（顺序执行，逐个等卸载程序退出）。

        只处理有卸载命令的项；没有的（绿色版、驱动、MSIX）跳过并在结果里列出，
        前端提示「N 款无法自动卸载」。
        """
        if self._all_cache is None:
            self.list_all_installed()
        targets, skipped = [], []
        for i in ids or []:
            it = (self._all_cache or {}).get(i)
            if not it:
                skipped.append({"id": i, "name": "未知条目", "reason": "缓存里找不到"})
            elif not (it.get("uninstall") or "").strip():
                skipped.append({"id": i, "name": it["name"], "reason": "没有注册卸载程序"})
            else:
                targets.append(it)
        if not targets:
            return {"ok": True, "count": 0, "skipped": skipped}
        t = threading.Thread(target=self._batch_uninstall_worker,
                             args=(targets, skipped), daemon=True)
        t.start()
        return {"ok": True, "count": len(targets), "skipped": skipped}

    def _batch_uninstall_worker(self, targets, skipped):
        total = len(targets)
        done = 0
        for it in targets:
            self._emit('window.__batchUninstProgress(%d,%d,%s)',
                       done, total, json.dumps(it["name"], ensure_ascii=False))
            try:
                self._run_uninstall_cmd(it.get("uninstall") or "")
            except Exception as e:
                self._emit('window.__batchUninstMsg(%s,%s)',
                           json.dumps(it["name"], ensure_ascii=False),
                           json.dumps("失败：" + str(e), ensure_ascii=False))
            done += 1
        time.sleep(1.5)
        reset_fs_index()
        self._installed_cache = None
        self._all_cache = None
        self._emit('window.__batchUninstDone(%d,%d,%s)',
                   done, total, json.dumps(skipped, ensure_ascii=False))
        nativefx.sound_ok()
        nativefx.notify("老朱应用商店", "批量卸载完成：%d 款" % total)

    @staticmethod
    def _run_uninstall_cmd(us):
        """执行一条卸载命令。msiexec 走 /X {GUID} /quiet，其余追加 /S 静默。"""
        us = (us or "").strip()
        if not us:
            return
        low = us.lower()
        if "msiexec" in low:
            m = re.search(r"\{[0-9A-Fa-f\-]{36}\}", us)
            if m:
                subprocess.run(["msiexec", "/X", m.group(0), "/quiet", "/norestart"],
                               timeout=600)
                return
            subprocess.run(us + " /quiet /norestart", shell=True, timeout=600)
            return
        if "/s" not in low:
            us = us + " /S"
        subprocess.run(us, shell=True, timeout=600)

    def _refresh_after_install(self, app_id, target=None):
        """安装完成后刷新已安装缓存，并推给前端。

        安装器退出时注册表项不一定已经落盘（Inno 的 [Registry] 段在收尾阶段写），
        立刻扫一次常常扫不到，卡片就一直停在「安装」。这里最多轮询 10 次 ×0.8s，
        命中即停；始终没命中的用安装目录里找到的 exe 兜底。
        """
        app = store_data.get_app(app_id)
        reset_fs_index()
        cache = {}
        for i in range(10):
            cache = self._scan()
            if app_id in cache:
                break
            if i >= 3:
                fb = _fallback_entry(app, target)
                if fb:
                    cache[app_id] = fb
                    break
            time.sleep(0.8)
        self._installed_cache = cache or self._scan()
        self._emit('window.__installedChanged(%s)',
                   json.dumps(self._installed_cache, ensure_ascii=False))
        return self._installed_cache

    # ---------- 本地安装包（离线包文件夹）----------
    def scan_packages(self, force_dir=None):
        """扫描「本地安装包」目录，返回 {dir, exists, items, total_size}。

        不把安装包打进 exe：只记住一个目录路径，运行时去读。
        默认落在桌面「安装包」，用户自己的压缩包、绿色版、官网下载的 exe
        都能在这里一键跑起来，不用再翻资源管理器。

        递归两层（真安装包/、绿色工具/ 这种子目录），跳过卸载器/更新器。
        """
        s = self._load_settings()
        d = (force_dir or s.get("package_dir") or default_package_dir()).strip('"')
        if not d or not os.path.isdir(d):
            return {"dir": d, "exists": False, "items": [], "total_size": 0,
                    "error": "目录不存在：%s" % d}
        items, total = [], 0
        root_len = len(d.rstrip("\\/")) + 1
        for cur, dirs, files in os.walk(d):
            depth = cur[root_len:].count(os.sep) if len(cur) > root_len else 0
            if depth >= 2:
                dirs[:] = []
            for fn in files:
                ext = os.path.splitext(fn)[1].lower()
                if ext not in _PKG_EXT:
                    continue
                low = fn.lower()
                if any(k in low for k in _PKG_SKIP):
                    continue
                p = os.path.join(cur, fn)
                try:
                    st = os.stat(p)
                except OSError:
                    continue
                total += st.st_size
                sub = os.path.relpath(cur, d)
                items.append({
                    "name": os.path.splitext(fn)[0],
                    "file": fn,
                    "path": p,
                    "sub": "" if sub == "." else sub,
                    "ext": ext.lstrip("."),
                    "size": st.st_size,
                    "mtime": int(st.st_mtime),
                })
        items.sort(key=lambda x: -x["mtime"])
        return {"dir": d, "exists": True, "items": items, "total_size": total}

    def set_package_dir(self, path):
        """换一个安装包目录，记住它（写进 settings.json，下次启动还在）。"""
        p = (path or "").strip().strip('"')
        if not p or not os.path.isdir(p):
            return {"ok": False, "error": "目录不存在"}
        s = self._load_settings()
        s["package_dir"] = os.path.normpath(p)
        self._save_settings()
        return {"ok": True, "dir": s["package_dir"]}

    def run_package(self, path):
        """直接运行一个安装包/程序（不静默，交给它自己的界面）。"""
        p = (path or "").strip().strip('"')
        if not p or not os.path.isfile(p):
            return {"ok": False, "error": "文件不存在"}
        try:
            if p.lower().endswith(".msi"):
                subprocess.Popen(["msiexec", "/i", p])
            else:
                os.startfile(p)
            return {"ok": True}
        except Exception as e:
            return {"ok": False, "error": str(e)}

    def open_package_folder(self, path=None):
        """打开安装包所在目录；path 给文件时打开它的父目录。"""
        p = (path or "").strip().strip('"')
        if p and os.path.isfile(p):
            subprocess.Popen(["explorer", "/select,", os.path.normpath(p)])
            return True
        d = p or self._load_settings().get("package_dir") or default_package_dir()
        if os.path.isdir(d):
            os.startfile(d)
            return True
        return False

    # ---------- 工具 ----------
    def open_website(self, url):
        webbrowser.open(url)
        return True

    def open_path(self, path):
        try:
            if path and os.path.isdir(path):
                os.startfile(path)
                return True
        except Exception:
            pass
        return False

    def _inst_info(self, app_id):
        """取某个 app 的已安装信息；缓存里没有就强制重扫一次再取。"""
        info = self.get_installed().get(app_id)
        if info:
            return info
        self._installed_cache = None
        return self.get_installed().get(app_id)

    def open_install_dir(self, app_id):
        """打开安装目录。location 空时退回 exe 所在目录，都失败返回错误文本。"""
        info = self._inst_info(app_id) or {}
        loc = (info.get("location") or "").rstrip("\\/")
        if not (loc and os.path.isdir(loc)):
            exe = info.get("exe") or ""
            loc = os.path.dirname(exe) if exe else ""
        if loc and os.path.isdir(loc):
            try:
                os.startfile(loc)
                return {"ok": True, "path": loc}
            except Exception as e:
                return {"ok": False, "error": "无法打开目录：%s" % e}
        return {"ok": False, "error": "没找到安装目录（软件可能已被移动或卸载）"}

    def launch_app(self, app_id):
        """点「启动」：直接跑主程序 exe，工作目录设为 exe 所在目录。

        很多程序依赖同目录资源，cwd 必须对；否则启动后立刻崩或找不到配置。
        """
        info = self._inst_info(app_id)
        if not info:
            return {"ok": False, "error": "未检测到该软件，可能已被卸载"}
        exe = info.get("exe") or ""
        if not exe or not os.path.isfile(exe):
            return {"ok": False, "error": "没定位到主程序，请用「打开目录」手动启动"}
        try:
            subprocess.Popen([exe], cwd=os.path.dirname(exe), close_fds=True)
            return {"ok": True, "exe": exe}
        except Exception as e:
            return {"ok": False, "error": "启动失败：%s" % e}

    # ---------- 下载（断点续传）----------
    def _app_url(self, app):
        """取直链：已配置 direct > 解析缓存 > 现场解析下载页 > None（回退打开页面）。"""
        if app.get("direct"):
            return app["download_url"]
        if app["id"] in self._resolved:
            return self._resolved[app["id"]]
        url = _resolve_direct_url(app["download_url"]) or _resolve_direct_url(app["website"])
        if url:
            self._resolved[app["id"]] = url
            self._save_settings()
        return url

    def _download_file(self, app):
        """下载到「下载位置」，.part 断点续传。返回安装包路径，失败返回 None。"""
        js = 'window.__dlProgress(%s,%s,%s,%s)'
        try:
            url = self._app_url(app)
            if not url:
                return None
            dl_dir = self._load_settings()["download_dir"]
            os.makedirs(dl_dir, exist_ok=True)
            fname = os.path.basename(urllib.parse.urlparse(url).path) or (app["id"] + ".exe")
            if not fname.lower().endswith((".exe", ".msi", ".zip")):
                fname += ".exe"
            dest = os.path.join(dl_dir, fname)
            part = dest + ".part"

            received = os.path.getsize(part) if os.path.isfile(part) else 0
            headers = dict(_UA)
            if received:
                headers["Range"] = "bytes=%d-" % received

            req = urllib.request.Request(url, headers=headers)
            try:
                resp = urllib.request.urlopen(req, timeout=30, context=_CTX)
            except urllib.error.HTTPError as e:
                if e.code == 416 and received:
                    # 断点已等于/超过文件实际大小（上次其实下完了）：HEAD 校验后改名
                    try:
                        rh = urllib.request.urlopen(
                            urllib.request.Request(url, method="HEAD", headers=_UA),
                            timeout=15, context=_CTX)
                        clen = int(rh.headers.get("Content-Length") or 0)
                        rh.close()
                        if clen and os.path.getsize(part) >= clen:
                            os.replace(part, dest)
                            self._emit('window.__dlDone(%s,true,%s,%s)',
                                       app["id"], "下载完成（断点校验通过）", dest)
                            return dest
                    except Exception:
                        pass
                    raise IOError("断点与文件大小不符，请删除 %s 后重试" % os.path.basename(part))
                if e.code in (403, 404, 410):
                    # 直链带版本号（Trae 这类 electron 应用按 build 号分目录），
                    # 厂商发新版后旧链接会 404。此处直接打开官网下载页兜底，
                    # 不做整页爬取——这类站点由前端 JS 拼装下载地址，静态页里没有。
                    if app.get("website"):
                        webbrowser.open(app["website"])
                        raise IOError("安装包链接已随版本更新失效，已为你打开官网下载页，请手动下载")
                raise
            with resp as r:
                total = int(r.headers.get("Content-Length") or 0)
                if r.status == 206:  # 续传：总量 = 已下载 + 剩余
                    total += received
                elif received and r.status == 200:
                    # 服务器不支持 Range，重头下
                    received = 0
                mode = "ab" if received else "wb"
                with open(part, mode) as f:
                    while True:
                        chunk = r.read(262144)
                        if not chunk:
                            break
                        f.write(chunk)
                        received += len(chunk)
                        pct = int(received * 100 / total) if total else 0
                        self._emit(js, app["id"], pct, received, total)
                        nativefx.taskbar_progress(pct, 100)
            if total and received < total:
                raise IOError("连接中断（%d/%d 字节），再点一次从断点继续" % (received, total))
            os.replace(part, dest)
            self._emit('window.__dlDone(%s,true,%s,%s)', app["id"], "下载完成", dest)
            return dest
        except Exception as e:
            msg = str(e)
            if "连接中断" not in msg:
                msg = "下载失败：" + msg
            self._emit('window.__dlDone(%s,false,%s,"")', app["id"], msg)
            return None

    # ---------- 安装 ----------
    def _run_installer(self, app, filepath, target=None):
        """静默安装到 target（默认 <安装位置>/<应用名>），返回 (ok, msg)。"""
        try:
            if not target:
                target = os.path.join(self._load_settings()["install_dir"],
                                      _safe_dirname(app["name"]))
            target = os.path.normpath(target)
            os.makedirs(target, exist_ok=True)
            inst = app.get("installer") or {}
            declared = (inst.get("type") or "exe").lower()
            itype = sniff_installer(filepath, declared)   # 以实际文件为准
            _rlog("install %s declared=%s detected=%s target=%s"
                  % (app["id"], declared, itype, target))
            ok = False
            if itype == "msi":
                r = subprocess.run(["msiexec", "/i", filepath, "/quiet", "/norestart",
                                    'TARGETDIR="%s"' % target])
                ok = (r.returncode in (0, 3010))
            elif itype == "innosetup":
                # Inno Setup：/VERYSILENT 全程无界面；/DIR 作为单独参数传入，
                # 含空格也不会被拆开。/SP- 去掉「准备安装」提示，/NORESTART 不自动重启
                r = subprocess.run([filepath, "/VERYSILENT", "/SUPPRESSMSGBOXES",
                                    "/NORESTART", "/SP-", "/DIR=%s" % target])
                ok = (r.returncode == 0)
            elif itype == "nsis":
                # NSIS：/D= 必须排在最后，且不能整体加引号（NSIS 从 "/D=" 取到行尾）
                cmd = '"%s" /S /D=%s' % (filepath, target)
                ok = (subprocess.run(cmd, shell=True).returncode == 0)
            else:
                args = inst.get("silent_args")
                argv = [filepath] + (args.split() if args else ["/S"])
                ok = (subprocess.run(argv).returncode == 0)
            if not ok:
                return False, "安装已退出（返回码非 0，可能已取消或不支持静默安装）"
            # 落地位置校验：安装器可能无视 /DIR（per-user 包强制 %LOCALAPPDATA%），
            # 这种情况必须把真实目录报出来，不能让界面显示成用户选的那条路径
            actual = _installed_location(app)
            if actual and os.path.normcase(actual) != os.path.normcase(target):
                return True, "安装完成，实际目录 %s" % actual
            return True, "安装完成 → %s" % target
        except Exception as e:
            return False, "安装失败：" + str(e)

    # ---------- 安装队列 ----------
    def install_app(self, app_id, install_dir=None):
        """一键安装：进队列，下载完自动静默安装。可指定该应用的安装目录。

        install_dir 是最终目录（不是根目录），由前端「选择安装位置」弹窗给出；
        留空则用 设置里的安装位置 + 应用名。
        """
        app = store_data.get_app(app_id)
        if not app:
            return {"ok": False, "error": "应用不存在"}
        if app.get("web"):
            webbrowser.open(app["website"])
            return {"ok": True, "mode": "page"}
        with self._queue_lock:
            if app_id in self._active or app_id in self._queue:
                return {"ok": True, "mode": "busy"}
            if install_dir:
                self._targets[app_id] = os.path.normpath(str(install_dir))
                # 记住该应用上次选的目录，下次弹窗直接带出来
                s = self._load_settings()
                s.setdefault("app_dirs", {})[app_id] = self._targets[app_id]
                self._save_settings()
            self._queue.append(app_id)
            self._ensure_worker()
        self._emit_queue()
        return {"ok": True, "mode": "queued"}

    def batch_install(self, app_ids, install_dir=None):
        """批量一键安装（分类页 全选/反选），串行执行。

        install_dir 是该批次的根目录，每个应用各取 <root>/<应用名> 为目录；
        不传则用设置里的全局安装位置。
        """
        n = 0
        for app_id in (app_ids or []):
            app = store_data.get_app(app_id)
            one = os.path.join(install_dir, _safe_dirname(app["name"])) if (app and install_dir) else None
            r = self.install_app(app_id, one)
            if r.get("ok"):
                n += 1
        return {"ok": True, "queued": n}

    def retry_download(self, app_id):
        """断点续传：同 install_app，已存在的 .part 会续传。"""
        return self.install_app(app_id)

    def _ensure_worker(self):
        if self._worker is None or not self._worker.is_alive():
            self._worker = threading.Thread(target=self._queue_worker, daemon=True)
            self._worker.start()

    def _queue_worker(self):
        while True:
            with self._queue_lock:
                if not self._queue:
                    return
                app_id = self._queue.pop(0)
                target = self._targets.pop(app_id, None)
                self._active[app_id] = {"phase": "download", "target": target}
            self._emit_queue()
            app = store_data.get_app(app_id)
            try:
                self._emit('window.__instStatus(%s,%s,null)', app_id, "正在下载…")
                nativefx.taskbar_state(nativefx.TBPF_NORMAL)
                dest = self._download_file(app)
                if not dest:
                    # 解析不到直链：回退打开官网下载页
                    webbrowser.open(app["download_url"])
                    self._emit('window.__instStatus(%s,%s,false)', app_id, "未找到直链，已打开官网下载页")
                    nativefx.sound_fail()
                    nativefx.notify("老朱应用商店", "%s：已打开官网下载页" % app["name"], error=True)
                else:
                    self._active[app_id]["phase"] = "install"
                    self._emit_queue()
                    self._emit('window.__instStatus(%s,%s,null)', app_id, "安装中…")
                    nativefx.taskbar_state(nativefx.TBPF_INDETERMINATE)
                    ok, msg = self._run_installer(app, dest, target)
                    self._emit('window.__instStatus(%s,%s,%s)', app_id, msg, "true" if ok else "false")
                    if ok:
                        nativefx.sound_ok()
                        nativefx.notify("老朱应用商店", "%s 安装完成" % app["name"])
                    else:
                        nativefx.sound_fail()
                        nativefx.notify("老朱应用商店", "%s：%s" % (app["name"], msg), error=True)
                    # 成功才轮询等注册表落盘（失败时立即重扫一次，别占着队列）
                    if ok:
                        self._refresh_after_install(app_id, target)
                    else:
                        self.rescan_installed()
            except Exception as e:
                self._emit('window.__instStatus(%s,%s,false)', app_id, "失败：" + str(e))
                nativefx.sound_fail()
            finally:
                with self._queue_lock:
                    self._active.pop(app_id, None)
                self._emit_queue()
                with self._queue_lock:
                    if not self._queue and not self._active:
                        nativefx.taskbar_clear()

    # ---------- 卸载 ----------
    def uninstall(self, app_id):
        app = store_data.get_app(app_id)
        info = self.get_installed().get(app_id)
        if not info:
            return {"ok": False, "error": "未检测到该软件"}
        us = (info.get("uninstall") or "").strip()
        if not us:
            return {"ok": False, "error": "该软件没有注册卸载程序"}
        t = threading.Thread(target=self._uninstall_worker, args=(app, us), daemon=True)
        t.start()
        return {"ok": True}

    def _uninstall_worker(self, app, us):
        name = app["name"] if app else "软件"
        try:
            self._emit('window.__instStatus(%s,%s,null)', app["id"], "卸载中…")
            low = us.lower()
            if "msiexec" in low:
                m = re.search(r"\{[0-9A-Fa-f\-]{36}\}", us)
                if m:
                    cmd = ["msiexec", "/X", m.group(0), "/quiet", "/norestart"]
                    r = subprocess.run(cmd)
                else:
                    r = subprocess.run(us + " /quiet /norestart", shell=True)
            else:
                # 卸载程序普遍支持 /S 静默；不支持的会弹原生卸载界面
                if "/s" not in low:
                    us = us + " /S"
                r = subprocess.run(us, shell=True)
            time.sleep(2)
            self.rescan_installed()
            gone = app["id"] not in self.get_installed()
            if gone:
                self._emit('window.__instStatus(%s,%s,true)', app["id"], "已卸载")
                nativefx.sound_ok()
                nativefx.notify("老朱应用商店", "%s 已卸载" % name)
            else:
                self._emit('window.__instStatus(%s,%s,null)', app["id"], "卸载程序已启动，请按其提示完成")
        except Exception as e:
            self._emit('window.__instStatus(%s,%s,false)', app["id"], "卸载失败：" + str(e))

    # ---------- 无边框窗口控制 ----------
    def _hwnd(self):
        h = getattr(self, "_hwnd_val", 0)
        if h:
            return h
        try:
            import ctypes
            h = ctypes.windll.user32.FindWindowW(None, "老朱应用商店")
            self._hwnd_val = h
        except Exception:
            h = 0
        return h

    def win_minimize(self):
        try:
            import ctypes
            ctypes.windll.user32.ShowWindow(self._hwnd(), 6)
            return True
        except Exception:
            return False

    def js_log(self, msg):
        """前端调试输出（RESIZE_DEBUG=1 时写入 resize.log）。"""
        _rlog("js: " + str(msg)[:200])
        return True

    # ---------- 边缘拉伸（客户区铺满窗口，无非客户区可命中） ----------
    def start_resize(self, edge):
        """页面边缘按下时启动拉伸。

        edge: 'l'/'r'/'t'/'b' 及其两两组合（'tl','br' …）。
        不能靠 WM_NCHITTEST：客户区被 WebView2 子窗口盖住，命中消息传不到主窗口，
        所以改成「JS 判定边缘 → Python 轮询光标 + 左键状态」自己算位移。
        """
        try:
            e = str(edge or "")
            _rlog("start_resize edge=%r" % e)
            if not e or any(c not in "lrtb" for c in e):
                return False
            self._resize_gen += 1
            gen = self._resize_gen
            self._resize_stop.clear()
            threading.Thread(target=self._resize_loop, args=(e, gen), daemon=True).start()
            return True
        except Exception:
            return False

    def stop_resize(self):
        """前端 mouseup / 失焦：结束拉伸轮询。"""
        try:
            self._resize_stop.set()
            return True
        except Exception:
            return False

    def _resize_loop(self, edge, gen=0):
        import ctypes
        from ctypes import wintypes

        u32 = ctypes.windll.user32
        hwnd = self._hwnd()
        if not hwnd or u32.IsZoomed(hwnd) or u32.IsIconic(hwnd):
            return

        p = wintypes.POINT()
        u32.GetCursorPos(ctypes.byref(p))
        last_x, last_y = p.x, p.y
        r = wintypes.RECT()
        u32.GetWindowRect(hwnd, ctypes.byref(r))
        l, t, rr, bb = r.left, r.top, r.right, r.bottom
        _rlog("loop begin edge=%s cursor=%d,%d rect=%d,%d,%d,%d down=%d"
              % (edge, p.x, p.y, l, t, rr, bb,
                 u32.GetAsyncKeyState(0x01) & 0x8000))

        mv_l, mv_r = "l" in edge, "r" in edge
        mv_t, mv_b = "t" in edge, "b" in edge
        # 无边框：窗口尺寸 == 客户区尺寸，最小 980x640 与 winfix.MIN_W/MIN_H 对应
        min_w, min_h = 980, 640
        SWP_NOZORDER = 0x0004

        # 左键按住期间持续跟随。停止条件三取一：
        #   1) 前端发来 mouseup（stop_resize）—— 主通道，光标在窗口边缘内移动，
        #      mouseup 一定落在 WebView2 里；
        #   2) GetAsyncKeyState 连续约 100ms 报告左键已抬起 —— 兜底，鼠标移出窗口时用；
        #   3) 超过 30s —— 防止信号丢失导致线程常驻。
        t0 = time.time()
        stalled = 0
        while not self._resize_stop.is_set() and gen == self._resize_gen:
            if time.time() - t0 > 30:
                _rlog("loop timeout")
                break
            u32.GetCursorPos(ctypes.byref(p))
            dx, dy = p.x - last_x, p.y - last_y
            if dx or dy:
                last_x, last_y = p.x, p.y
                nl, nt, nr, nb = l, t, rr, bb
                if mv_l: nl = l + dx
                if mv_r: nr = rr + dx
                if mv_t: nt = t + dy
                if mv_b: nb = bb + dy
                if nr - nl < min_w:
                    if mv_l: nl = nr - min_w
                    else: nr = nl + min_w
                if nb - nt < min_h:
                    if mv_t: nt = nb - min_h
                    else: nb = nt + min_h
                if (nl, nt, nr, nb) != (l, t, rr, bb):
                    l, t, rr, bb = nl, nt, nr, nb
                    u32.SetWindowPos(hwnd, 0, l, t, rr - l, bb - t, SWP_NOZORDER)
            if u32.GetAsyncKeyState(0x01) & 0x8000:
                stalled = 0
            else:
                stalled += 1
                if stalled > 8:
                    _rlog("loop key-up")
                    break
            time.sleep(0.012)

        # 拉伸结束：把结果写回 winfix 的目标尺寸，保证之后最小化/最大化还原一致
        try:
            import winfix
            rc = wintypes.RECT()
            u32.GetClientRect(hwnd, ctypes.byref(rc))
            w, h = rc.right - rc.left, rc.bottom - rc.top
            _rlog("loop end client=%dx%d" % (w, h))
            if w > 100 and h > 100:
                winfix._target = (w, h)
            winfix._guard_until = 0.0
        except Exception:
            pass

    def win_toggle_max(self):
        try:
            import ctypes
            u32 = ctypes.windll.user32
            hwnd = self._hwnd()
            if u32.IsZoomed(hwnd):
                u32.ShowWindow(hwnd, 9)
                return {"ok": True, "maxed": False}
            u32.ShowWindow(hwnd, 3)
            return {"ok": True, "maxed": True}
        except Exception as e:
            return {"ok": False, "error": str(e)}

    def win_close(self):
        """点 X：缩到托盘，不退出。"""
        try:
            nativefx.hide_window(self._hwnd())
            return True
        except Exception:
            return False

    def win_show(self):
        try:
            nativefx.show_window(self._hwnd())
            return True
        except Exception:
            return False

    def win_quit(self):
        """托盘菜单退出：真正关闭。"""
        try:
            import webview
            for w in list(webview.windows):
                w.destroy()
            return True
        except Exception:
            try:
                import ctypes
                ctypes.windll.user32.PostMessageW(self._hwnd(), 0x0010, 0, 0)
            except Exception:
                pass
            return False

    # ---------- 内部 ----------
    def _emit_queue(self):
        with self._queue_lock:
            n = len(self._queue) + len(self._active)
        self._emit('window.__queueChanged(%s)', n)

    def _emit(self, fmt, *args):
        try:
            import webview
            if not webview.windows:
                return
            js_args = []
            for a in args:
                if isinstance(a, str) and a in ("null", "true", "false"):
                    js_args.append(a)  # 原生布尔/空值，不加引号
                else:
                    js_args.append(json.dumps(a, ensure_ascii=False))
            webview.windows[0].evaluate_js(fmt % tuple(js_args))
        except Exception:
            pass
