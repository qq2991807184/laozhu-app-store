# -*- coding: utf-8 -*-
"""老朱应用商店 - 桌面入口（pywebview）。"""
import ctypes
import os
import sys
import threading
import traceback
from ctypes import wintypes

import webview

from store_api import Api

TITLE = "老朱应用商店"
# 单实例互斥体名：Local\ 前缀表示仅当前登录会话内互斥（多用户各自可开一个）。
# 名字里带项目标记位，避免和别家程序撞名。
MUTEX_NAME = "Local\\LaoZhuStore_SingleInstance_9F3A"
ERROR_ALREADY_EXISTS = 183

_u32 = ctypes.windll.user32
_k32 = ctypes.WinDLL("kernel32", use_last_error=True)
_k32.CreateMutexW.restype = wintypes.HANDLE
_k32.CreateMutexW.argtypes = [ctypes.c_void_p, wintypes.BOOL, wintypes.LPCWSTR]
_mutex = None   # 全局持有，进程退出前不 CloseHandle，否则互斥体提前释放


def resource_path(rel):
    """兼容 PyInstaller 单文件打包后的资源路径。"""
    base = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base, rel)


BASE_DIR = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
# 可写日志目录：frozen 下走 %LOCALAPPDATA%\老朱应用商店（安装目录在 Program Files，普通用户不可写），
# 开发态为脚本目录，再退 TEMP
try:
    if getattr(sys, "frozen", False):
        LOG_DIR = os.path.join(os.environ.get("LOCALAPPDATA") or os.environ.get("TEMP", BASE_DIR),
                               "老朱应用商店")
        os.makedirs(LOG_DIR, exist_ok=True)
    else:
        LOG_DIR = os.path.dirname(os.path.abspath(__file__))
    open(os.path.join(LOG_DIR, "launch.log"), "a").close()
except Exception:
    LOG_DIR = os.environ.get("TEMP", BASE_DIR)


def _log(msg):
    try:
        with open(os.path.join(LOG_DIR, "launch.log"), "a", encoding="utf-8") as f:
            f.write(msg + "\n")
    except Exception:
        pass


def acquire_single_instance():
    """抢占单实例互斥体。

    返回 True = 本进程是当前会话里唯一的实例；False = 已有实例在跑。
    CreateMutexW 是「创建并打开」语义：名字已存在时返回已有句柄并把
    last error 置为 ERROR_ALREADY_EXISTS，所以必须用 use_last_error 的
    WinDLL 读 ctypes.get_last_error()，ctypes.windll 的 GetLastError 会被
    Python 自身的 API 调用污染。"""
    global _mutex
    _mutex = _k32.CreateMutexW(None, False, MUTEX_NAME)
    if not _mutex:
        _log("CreateMutexW failed err=%d" % ctypes.get_last_error())
        return True          # 互斥体拿不到时不该拦住用户，放行
    if ctypes.get_last_error() == ERROR_ALREADY_EXISTS:
        return False
    return True


def find_existing_window():
    """找已在运行的实例窗口。隐藏到托盘（SW_HIDE）的窗口依然能被找到。"""
    hwnd = _u32.FindWindowW(None, TITLE)
    if hwnd and _u32.IsWindow(hwnd):
        return hwnd
    found = []
    EnumProc = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)

    def cb(h, _lp):
        n = _u32.GetWindowTextLengthW(h)
        if n:
            buf = ctypes.create_unicode_buffer(n + 1)
            _u32.GetWindowTextW(h, buf, n + 1)
            if buf.value.startswith(TITLE) and _u32.IsWindow(h):
                found.append(h)
        return True

    _u32.EnumWindows(EnumProc(cb), 0)
    return found[0] if found else 0


def notify_existing(hwnd):
    """把激活消息投给已有实例，由它自己在 UI 线程里 restore + 前置。"""
    import winfix
    _u32.PostMessageW(hwnd, winfix.ACTIVATE_MSG, 0, 0)


def main():
    try:
        if not acquire_single_instance():
            hwnd = find_existing_window()
            _log("second instance detected, existing hwnd=%d" % hwnd)
            if hwnd:
                notify_existing(hwnd)
            return
        html = resource_path("index.html")
        if not os.path.isfile(html):
            raise FileNotFoundError("index.html 未找到：" + html)
        storage = os.path.join(os.environ.get("LOCALAPPDATA", os.path.expanduser("~")),
                               "老朱应用商店", "webview")
        os.makedirs(storage, exist_ok=True)
        _log("boot html=%s storage=%s" % (html, storage))

        # 默认 1280x800；小屏（工作区装不下）时自动缩小，保证窗口完整可见
        from ctypes import wintypes
        width, height = 1280, 800
        try:
            wa = wintypes.RECT()
            ctypes.windll.user32.SystemParametersInfoW(0x0030, 0, ctypes.byref(wa), 0)
            width = min(1280, max(980, wa.right - wa.left - 40))
            height = min(800, max(640, wa.bottom - wa.top - 60))
        except Exception:
            pass

        api = Api()
        webview.create_window(
            title="老朱应用商店",
            url=html,
            js_api=api,
            width=width, height=height, min_size=(1024, 680),
            background_color="#0f1f3a",
            frameless=True,
            # 关掉「点窗口任意位置都能拖动」的全局拖拽：
            # pywebview 的 easy_drag 会在 window 上挂 mousedown，导致点空白也进拖拽状态。
            # 关闭后只认 .pywebview-drag-region（顶栏 #dragHandle）这一块。
            easy_drag=False,
        )

        def on_started():
            import time
            import winfix
            # on_started 在 gui.create_window 之前触发且运行于独立线程：
            # native 需轮询等待真正赋值（见 pywebview start() 源码）
            hwnd = 0
            for _ in range(100):  # 最多等 10 秒
                try:
                    native = webview.windows[0].native
                    if native is not None:
                        hwnd = int(native.Handle.ToInt32())
                        break
                except Exception:
                    pass
                time.sleep(0.1)
            if not hwnd:
                hwnd = winfix.find_window_by_title("老朱应用商店")
            ok = winfix.patch(hwnd, (width, height))
            api._hwnd_val = hwnd

            def _on_activate():
                """被第二个实例唤醒：还原并前置已存在的窗口。"""
                def run():
                    try:
                        import nativefx
                        h = api._hwnd() or hwnd
                        nativefx.show_window(h)   # SW_SHOW + BringToTop + 前置
                        _u32.ShowWindow(h, 9)     # SW_RESTORE：最小化态一并还原
                        _u32.SetForegroundWindow(h)
                        _log("activated by second instance hwnd=%d" % h)
                    except Exception as e:
                        _log("activate fail: %r" % e)
                # WndProc 内同步回调 → GUI 操作必须另起线程，否则 Invoke 等 UI 线程死锁
                threading.Thread(target=run, daemon=True).start()

            winfix.set_activate_handler(_on_activate)
            # 任务栏进度条 + 系统托盘（关窗缩托盘）
            try:
                import nativefx
                nativefx.taskbar_init(hwnd)
                nativefx.init_tray("老朱应用商店", on_show=api.win_show, on_quit=api.win_quit)
            except Exception as e:
                _log("nativefx fail: %r" % e)
            # 客户区补偿到目标尺寸：pywebview 设 Size 在前、应用无边框在后，
            # 标准边框尺寸被永久扣除，需按当前样式差值拉回
            if ok:
                winfix.set_client_size(hwnd, width, height)
                # 同步 WinForms 自己的 Size：最小化/最大化还原时 Form 会按它
                # 记录的 RestoreBounds 重排窗口，若不同步就会还原成 pywebview
                # 创建时的 1280x800（窗口尺寸 ≠ 客户区尺寸，客户区因此少一圈边框）
                try:
                    webview.windows[0].resize(width, height)
                except Exception as e:
                    _log("sync form size fail: %r" % e)
            # 尺寸诊断：窗口逻辑尺寸 vs 实际矩形（排查 DPI 缩放）
            try:
                n = webview.windows[0].native
                r = wintypes.RECT()
                ctypes.windll.user32.GetWindowRect(hwnd, ctypes.byref(r))
                _log("started hwnd=%d patch=%s size=%s dpi=%s rect=%dx%d"
                     % (hwnd, ok, n.Size, n.DeviceDpi,
                        r.right - r.left, r.bottom - r.top))
            except Exception as e:
                _log("started hwnd=%d patch=%s diag=%r" % (hwnd, ok, e))

        # http_server 属于 start()，不是 create_window()
        webview.start(storage_path=storage, http_server=True, func=on_started)
    except Exception:
        err = traceback.format_exc()
        _log("FATAL:\n" + err)
        try:
            ctypes.windll.user32.MessageBoxW(0, err, "老朱应用商店 启动错误", 0x10)
        except Exception:
            pass


if __name__ == "__main__":
    main()
