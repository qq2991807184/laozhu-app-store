# -*- coding: utf-8 -*-
"""抓取每个应用的真实图标：
  优先官网 favicon.ico（彩色原图标，ICO 取最大帧转 PNG）；
  抓不到或太小的保留 emoji（前端兜底）。
产出：
  assets/img/apps/{id}.png   真实图标
  icons_map.json             {id: "assets/img/apps/{id}.png"}
"""
import io
import json
import os
import ssl
import urllib.request
from urllib.parse import urlparse

from PIL import Image

from store_data import APPS

BASE = os.path.dirname(os.path.abspath(__file__))
APPS_IMG = os.path.join(BASE, "assets", "img", "apps")
MAP_PATH = os.path.join(BASE, "icons_map.json")

CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

MIN_SIDE = 32   # favicon 最大帧边长 >=32 才用，否则太小会糊


def _fetch(url, timeout=12):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=timeout, context=CTX).read()


def _ico_to_png(data, out_png):
    """把 ICO 数据取最大帧转 PNG；返回最大边长，失败返回 0。"""
    try:
        im = Image.open(io.BytesIO(data))
        # 选择最大尺寸的帧
        sizes = []
        try:
            sizes = list(im.ico.sizes())
        except Exception:
            pass
        if sizes:
            best = max(sizes, key=lambda s: s[0] * s[1])
            im = Image.open(io.BytesIO(data))
            im.size = best
            im.load()
        if im.mode != "RGBA":
            im = im.convert("RGBA")
        side = max(im.size)
        if side < MIN_SIDE:
            return 0
        # 统一输出 128 尺寸（保持比例，居中放透明底）
        canvas = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
        im2 = im.copy()
        im2.thumbnail((128, 128), Image.LANCZOS)
        canvas.paste(im2, ((128 - im2.width) // 2, (128 - im2.height) // 2), im2)
        canvas.save(out_png)
        return side
    except Exception:
        return 0


def _candidate_urls(app):
    """官网 favicon 候选地址：website 根域 + download_url 根域。"""
    urls = []
    for u in (app.get("website"), app.get("download_url")):
        if not u:
            continue
        p = urlparse(u)
        if p.netloc:
            urls.append("{}://{}/favicon.ico".format(p.scheme or "https", p.netloc))
    # 去重
    seen = set()
    out = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out


def fetch_all():
    os.makedirs(APPS_IMG, exist_ok=True)
    icons = {}
    ok = emoji = 0
    for app in APPS:
        aid = app["id"]
        got = False
        for url in _candidate_urls(app):
            try:
                data = _fetch(url)
                out_png = os.path.join(APPS_IMG, aid + ".png")
                side = _ico_to_png(data, out_png)
                if side:
                    icons[aid] = "assets/img/apps/{}.png".format(aid)
                    print("  [图标] %-14s <- %s (%dpx)" % (aid, url, side))
                    got = True
                    break
            except Exception:
                continue
        if got:
            ok += 1
        else:
            emoji += 1
            print("  [emoji兜底] %s %s" % (app["icon"], aid))
    with open(MAP_PATH, "w", encoding="utf-8") as f:
        json.dump(icons, f, ensure_ascii=False, indent=2)
    print("\n真实图标 %d 个，emoji 兜底 %d 个" % (ok, emoji))
    print("映射写入", MAP_PATH)


if __name__ == "__main__":
    fetch_all()
