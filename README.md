# 老朱应用商店

[![Release](https://img.shields.io/github/v/release/qq2991807184/laozhu-app-store?label=%E6%9C%80%E6%96%B0%E7%89%88)](https://github.com/qq2991807184/laozhu-app-store/releases/latest)
[![License](https://img.shields.io/github/license/qq2991807184/laozhu-app-store)](LICENSE)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11-0078D6)

参考火绒应用商店的界面布局与交互，打造的一款**简洁、安全、易用**的 Windows 桌面软件商店。
品牌色为「金 + 深蓝」，呼应店标（金色 Z 徽章）。**无边框窗口**设计，自定义标题栏支持拖拽移动、双击最大化、边缘拉伸。

- 仓库地址：<https://github.com/qq2991807184/laozhu-app-store>
- 当前版本：**v1.0.0**

## 下载安装

普通用户直接去 [Releases](https://github.com/qq2991807184/laozhu-app-store/releases/latest) 下载 `老朱应用商店_Setup_v1.0.exe`，双击安装即可，无需 Python 环境。

- 系统要求：Windows 10 / 11（x64），WebView2 运行时（Win11 自带；Win10 安装包会自动检测并装上）
- 默认安装到 `D:\Program Files\老朱应用商店`，向导里可改
- 安装后自动建桌面快捷方式 + 开始菜单文件夹「老朱应用商店」，控制面板「程序和功能」可卸载

## 从源码运行

- **桌面调试**：`py main.py`（需 `pip install pywebview pyinstaller pillow`）
- **浏览器预览**：双击 `index.html`（数据内联，file:// 直接可用，但无下载/安装/窗口控制能力）
- **自行打包**：见下文「打包」与「安装包构建」两节

## 收录原则

1. 除 **AI 专区** 外，优先收录**国内可直接下载**的软件（含主流国外开发工具）；
2. AI 专区可含国外主流产品（ChatGPT / Claude / Gemini / Cursor 等）；
3. 消费类分类精选最常用、口碑最好的 2~5 款；**编程软件按用途铺开**（编辑器 / 运行环境 / IDE / 数据库 / 接口调试 / 版本控制 / 终端），同一用途留 1~2 款代表；
4. 优先常见、主流、稳定、适合日常使用的软件。

当前共 **23 个分类、110 款应用、78 个真实图标**。

## 功能

- **软件分类浏览**：左侧只放 7 个一级入口（全部 / AI 专区 / 游戏娱乐 / 办公教育 / 编程软件 / 已安装软件 / 本地安装包），23 个分类平铺在主区顶部两行胶囊栏（火绒同款），点选即筛。
- **关键词搜索**：顶栏搜索框实时过滤；按 `/` 快速聚焦。
- **应用详情**：点击卡片弹窗展示评分、版本、大小、标签、简介。
- **已安装识别**：注册表 Uninstall 三根扫描 + 名称评分匹配，命中后卡片按钮变「启动」，同时定位主程序 exe（DisplayIcon → InstallLocation → 卸载程序所在目录）。
- **已安装软件列表**：火绒式一行一款 —— 图标 + 名称/厂商 + 安装日期 + 占用体积 + 卸载/打开，数据来自注册表全量（本机 190+ 条，不只商店那 110 款），日期和体积缺失时用主程序创建时间兜底。
- **批量卸载**：已安装视图点「批量卸载」进入勾选模式，全选 / 清空后一次卸载多款；没有注册卸载程序的条目（驱动、MSIX）自动跳过并提示。
- **本地安装包**：扫一个本地目录（默认桌面「安装包」，可在面板里更换，不打包进 exe），把那里的 exe / msi / 压缩包列出来，点「安装」直接运行、点「位置」在资源管理器里定位。
- **启动 / 打开目录**：`launch_app` 用定位到的 exe 直接运行（cwd=exe 目录），`open_install_dir` 在资源管理器打开真实安装位置，失败会给出具体原因。
- **下载与安装**：直链应用下载到「下载位置」并可一键静默安装到「安装位置」；其余应用一键打开官方下载页。安装前弹「安装到」对话框，可换盘。
- **下载管理**：右上角抽屉记录每次下载，带实时进度条。
- **设置**：下载位置 / 安装位置，可浏览自由选择，可恢复默认。
- **无边框窗口**：自定义标题栏（拖拽移动、双击最大化、最小化/最大化/关闭按钮齐全），窗口边缘可直接拉伸。

## 项目结构

```
老朱应用商店/
├── main.py             # 桌面入口（pywebview，frameless + WS_THICKFRAME 补丁）
├── store_api.py        # 后端 API：设置/目录选择/下载/安装/窗口控制
├── store_data.py       # ★ 权威数据源：分类 + 应用清单（改这里）
├── gen_data_js.py      # 由 store_data + icons_map.json 生成前端 data.js
├── fetch_icons.py      # 抓取官网 favicon 转真实图标，生成 icons_map.json
├── winfix.py           # Win32 窗口补丁（无边框拉伸/圆角/DWM）
├── nativefx.py         # 原生特效（阴影、亚克力、窗口动画）
├── setup.iss           # Inno Setup 安装包脚本
├── version_info.txt    # exe 版本资源（PyInstaller 引用）
├── 老朱应用商店.spec    # PyInstaller 打包配置
├── assets/
│   ├── css/style.css   # 样式（标题栏/卡片/弹窗/抽屉/响应式）
│   ├── js/app.js       # 交互逻辑
│   ├── js/data.js      # 自动生成，勿手改
│   └── img/            # logo + 应用真实图标(apps/)
└── index.html          # 页面结构
```

## 如何增删应用

编辑 `store_data.py` 的 `APPS` 数组（字段见文件头注释），然后依次执行：

```bash
py fetch_icons.py     # 抓新应用的官网图标
py gen_data_js.py     # 重新生成前端 data.js
# 桌面版直接生效（读 store_data.py）；重新打包 pyinstaller 见下
```

重新打包 exe（用装了 pywebview 的 Python 3.12，命令里的 3.13 环境没装 pywebview，打出来会缺 webview 模块）：

```bash
"C:\Program Files\Python312\python.exe" -m PyInstaller --noconfirm --clean "老朱应用商店.spec"
```

exe 的版本资源（右键属性 → 详细信息里看到的公司/产品/版本/版权）由 `version_info.txt` 提供，spec 里用 `EXE(version='version_info.txt')` 引用。改版本号时三处要一起改：`version_info.txt` 的 `filevers`/`prodvers` 与四个 `StringStruct`、`setup.iss` 的 `AppVersion` 与 `VersionInfo*`、`老朱应用商店.spec` 无版本号可改。

## 安装包构建

安装包用 Inno Setup 7 制作，脚本 `setup.iss`；编译器放在项目内 `build/tools/InnoSetup/`，不写系统目录，换机器拷走即可用。

```bash
build\tools\InnoSetup\ISCC.exe setup.iss
# 产物：dist_installer\老朱应用商店_Setup_v1.0.exe
```

安装包行为：

- 默认目录 `D:\Program Files\老朱应用商店`（D 盘不是固定磁盘时自动退回系统程序目录），向导里可改
- 自动创建桌面快捷方式（公共桌面，所有用户可见）与开始菜单文件夹「老朱应用商店」
- 控制面板「程序和功能」注册项：名称 `老朱应用商店 1.0`、发行者、安装位置、占用大小、卸载入口
- 卸载前自动结束正在运行的实例，随后清掉安装目录、两处快捷方式、开始菜单文件夹、注册表项、`%APPDATA%\老朱应用商店`、`%LOCALAPPDATA%\老朱应用商店`
- 运行时数据不落安装目录：配置在 `%APPDATA%\老朱应用商店\settings.json`，WebView2 缓存与日志在 `%LOCALAPPDATA%\老朱应用商店\`（装进 Program Files 后普通用户无写权限，写在自己目录才不会丢设置）
- 安装包内不含任何第三方安装器、不写计划任务、不改浏览器主页

## 技术说明

- 技术栈：Python + pywebview（系统 Edge WebView2 渲染），前端原生 HTML/CSS/JS。
- 无边框实现：`create_window(frameless=True)` + 启动后 `SetWindowLong` 补 `WS_THICKFRAME`（pywebview 自带无边框**不支持边缘拉伸**，此补丁恢复拉伸且无可见边框）；最大化/最小化走原生 `ShowWindow`。
- 拖拽移动：pywebview 原生支持 CSS `-webkit-app-region: drag`。
- 图标：优先抓官网彩色 favicon（>32px 才采用），抓不到用 emoji + 品牌色兜底；部分 SPA 官网抓不到，可手动放 PNG 到 `assets/img/apps/{id}.png` 并登记进 `icons_map.json`。
- 下载链接均指向官方渠道；直链会随版本变动，建议定期核对（直链失效时自动回退打开官方下载页）。

## 发布到 GitHub

仓库：<https://github.com/qq2991807184/laozhu-app-store>（公开，MIT）

日常改代码后提交推送：

```bash
git add -A
git commit -m "说明这次改了什么"
git push
```

发新版（先同步改版本号、重新打 exe 与安装包，再执行）：

```bash
set GH_TOKEN=ghp_xxxxxxxxxxxxxxxx
py publish_release.py --version 1.0.1
```

`publish_release.py` 会打 tag、建 Release、把安装包与绿色版一起传上去。GitHub Releases 的资产名只接受 ASCII（传中文会被静默剥成 `_Setup_v1.0.exe` 这种残名），脚本自动命名成 `LaozhuStore_Setup_v1.0.1.exe` / `LaozhuStore_Portable_v1.0.1.exe`，中文名写在 Release 说明里。

## 许可证

MIT，见 [LICENSE](LICENSE)。收录的软件名称、图标、安装包版权归各自厂商所有，本项目只做索引与展示，不代理分发。

