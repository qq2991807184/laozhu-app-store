# -*- coding: utf-8 -*-
"""由 store_data.py（权威数据）+ icons_map.json（真实图标路径）生成前端 assets/js/data.js。
前端静态预览（file:// 直开）与桌面版共用同一份数据。"""
import json
import os

from store_data import CATEGORIES, APPS

BASE = os.path.dirname(os.path.abspath(__file__))
MAP_PATH = os.path.join(BASE, "icons_map.json")
OUT = os.path.join(BASE, "assets", "js", "data.js")


def main():
    icons = {}
    if os.path.isfile(MAP_PATH):
        with open(MAP_PATH, "r", encoding="utf-8") as f:
            icons = json.load(f)
    apps = []
    for a in APPS:
        d = dict(a)
        if a["id"] in icons:
            d["icon_img"] = icons[a["id"]]
        apps.append(d)
    js = (
        "/* 本文件由 gen_data_js.py 自动生成，请勿手改；改数据请编辑 store_data.py 后重跑 */\n"
        "const CATEGORIES = " + json.dumps(CATEGORIES, ensure_ascii=False, indent=2) + ";\n\n"
        "const APPS = " + json.dumps(apps, ensure_ascii=False, indent=2) + ";\n"
    )
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(js)
    print("生成 data.js，应用数:", len(apps), "，带真实图标:", sum(1 for a in apps if "icon_img" in a))


if __name__ == "__main__":
    main()
