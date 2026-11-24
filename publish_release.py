#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
把构建好的安装包/绿色版发到 GitHub Release。

用法（在项目根目录）：
    set GH_TOKEN=ghp_xxx
    py publish_release.py --version 1.0.0

默认取 dist_installer\\老朱应用商店_Setup_v*.exe 与 dist\\老朱应用商店.exe。
资产名强制转成 ASCII（GitHub Releases 只接受 ASCII 文件名），
中文名写进 Release 说明里。
"""
import argparse
import glob
import json
import os
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request

OWNER = "qq2991807184"
REPO = "laozhu-app-store"
API = "https://api.github.com"
UPLOAD = "https://uploads.github.com"

# GitHub 的资产名只留 ASCII：中文被静默剥离，会变成 "_Setup_v1.0.exe" 这种残名
ASCII_NAMES = {
    "setup": "LaozhuStore_Setup_v{v}.exe",
    "portable": "LaozhuStore_Portable_v{v}.exe",
}

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE


def api(method, url, data=None, ctype="application/json"):
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", "Bearer " + os.environ["GH_TOKEN"])
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("User-Agent", "laozhu-store-publisher")
    if data is not None:
        req.add_header("Content-Type", ctype)
    try:
        with urllib.request.urlopen(req, context=CTX) as r:
            raw = r.read()
            return r.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            return e.code, json.loads(raw or b"{}")
        except Exception:
            return e.code, {"message": raw[:300].decode("utf-8", "replace")}


def find_one(pattern, hint):
    hits = sorted(glob.glob(pattern))
    if not hits:
        sys.exit("找不到%s：%s" % (hint, pattern))
    return hits[-1]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--version", required=True, help="版本号，如 1.0.0")
    ap.add_argument("--setup", help="安装包路径，默认自动找 dist_installer")
    ap.add_argument("--portable", help="绿色版路径，默认自动找 dist")
    ap.add_argument("--notes", help="Release 正文文件，默认用内置模板")
    ap.add_argument("--draft", action="store_true", help="建草稿，不直接发布")
    args = ap.parse_args()

    if not os.environ.get("GH_TOKEN"):
        sys.exit("缺少环境变量 GH_TOKEN（GitHub Personal Access Token，需 repo 权限）")

    v = args.version
    tag = "v" + v
    setup = args.setup or find_one(os.path.join("dist_installer", "老朱应用商店_Setup_v*.exe"), "安装包")
    portable = args.portable or find_one(os.path.join("dist", "老朱应用商店.exe"), "绿色版")

    notes = open(args.notes, encoding="utf-8").read() if args.notes else (
        "## 老朱应用商店 %s\n\n"
        "仿火绒应用商店的 Windows 桌面软件商店，无边框窗口，金 + 深蓝配色。\n\n"
        "### 下载\n\n"
        "| 文件 | 说明 |\n|---|---|\n"
        "| `LaozhuStore_Setup_%s.exe` | 安装版，双击安装，自动建桌面与开始菜单快捷方式 |\n"
        "| `LaozhuStore_Portable_%s.exe` | 绿色版单文件，免安装 |\n\n"
        "> 资产名用英文是 GitHub Releases 只接受 ASCII 文件名的限制，"
        "程序本身与安装后的目录、快捷方式都是中文「老朱应用商店」。\n" % (tag, v, v)
    )

    st, rel = api("POST", "%s/repos/%s/%s/releases" % (API, OWNER, REPO),
                  json.dumps({"tag_name": tag, "name": "老朱应用商店 " + tag, "body": notes,
                              "draft": args.draft, "prerelease": False},
                             ensure_ascii=False).encode("utf-8"),
                  "application/json; charset=utf-8")
    if st not in (200, 201):
        sys.exit("创建 Release 失败：HTTP %s %s" % (st, rel.get("message")))
    rid = rel["id"]
    print("Release 已创建：%s" % rel["html_url"])

    for kind, path in (("setup", setup), ("portable", portable)):
        name = ASCII_NAMES[kind].format(v=v)
        raw = open(path, "rb").read()
        url = "%s/repos/%s/%s/releases/%s/assets?name=%s" % (
            UPLOAD, OWNER, REPO, rid, urllib.parse.quote(name))
        st, d = api("POST", url, raw, "application/octet-stream")
        if st in (200, 201) and d.get("state") == "uploaded":
            print("  上传 %s  %d 字节  OK" % (d.get("name"), d.get("size", len(raw))))
        else:
            sys.exit("  上传 %s 失败：HTTP %s %s" % (name, st, d.get("message")))

    print("完成：%s/releases/tag/%s" % ("https://github.com/%s/%s" % (OWNER, REPO), tag))


if __name__ == "__main__":
    main()
