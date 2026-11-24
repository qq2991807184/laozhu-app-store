/* 本文件由 gen_data_js.py 自动生成，请勿手改；改数据请编辑 store_data.py 后重跑 */
const CATEGORIES = [
  {
    "key": "all",
    "name": "全部应用",
    "icon": "🏠"
  },
  {
    "key": "ai",
    "name": "AI 专区",
    "icon": "✨"
  },
  {
    "key": "game",
    "name": "游戏娱乐",
    "icon": "🎮"
  },
  {
    "key": "social",
    "name": "聊天社交",
    "icon": "💬"
  },
  {
    "key": "input",
    "name": "输入法",
    "icon": "⌨️"
  },
  {
    "key": "browser",
    "name": "浏览器",
    "icon": "🌐"
  },
  {
    "key": "download",
    "name": "下载工具",
    "icon": "⬇️"
  },
  {
    "key": "video",
    "name": "视频软件",
    "icon": "🎬"
  },
  {
    "key": "music",
    "name": "音乐软件",
    "icon": "🎵"
  },
  {
    "key": "image",
    "name": "图片图形",
    "icon": "🎨"
  },
  {
    "key": "edit",
    "name": "剪辑工具",
    "icon": "🎞️"
  },
  {
    "key": "office",
    "name": "办公教育",
    "icon": "📄"
  },
  {
    "key": "notes",
    "name": "笔记文档",
    "icon": "📝"
  },
  {
    "key": "netdisk",
    "name": "网盘存储",
    "icon": "☁️"
  },
  {
    "key": "zip",
    "name": "压缩解压",
    "icon": "📦"
  },
  {
    "key": "screenshot",
    "name": "截图录屏",
    "icon": "📸"
  },
  {
    "key": "security",
    "name": "安全防护",
    "icon": "🛡️"
  },
  {
    "key": "system",
    "name": "系统工具",
    "icon": "🧰"
  },
  {
    "key": "driver",
    "name": "驱动工具",
    "icon": "🧩"
  },
  {
    "key": "dev",
    "name": "编程软件",
    "icon": "💻"
  },
  {
    "key": "assistant",
    "name": "助手工具",
    "icon": "🤝"
  },
  {
    "key": "desktop",
    "name": "桌面美化",
    "icon": "🖼️"
  },
  {
    "key": "magic",
    "name": "魔法工具",
    "icon": "🪄"
  }
];

const APPS = [
  {
    "id": "chatgpt",
    "name": "ChatGPT",
    "en": "OpenAI",
    "icon": "🤖",
    "color": "#10a37f",
    "category": "ai",
    "tags": [
      "AI",
      "对话",
      "国外"
    ],
    "desc": "OpenAI 旗舰 AI 助手，对话、写作、编程、识图与语音全能，桌面端体验流畅。",
    "version": "1.2025.0",
    "size": "约 120 MB",
    "updated": "2026-11",
    "rating": 4.9,
    "downloads": "5000万+",
    "download_url": "https://chatgpt.com/download/",
    "website": "https://chatgpt.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "chatgpt"
    ]
  },
  {
    "id": "claude",
    "name": "Claude",
    "en": "Anthropic",
    "icon": "🎭",
    "color": "#d97757",
    "category": "ai",
    "tags": [
      "AI",
      "对话",
      "国外"
    ],
    "desc": "Anthropic 出品，擅长长文本理解与深度推理，代码和文档分析表现出色。",
    "version": "0.14.0",
    "size": "约 140 MB",
    "updated": "2026-11",
    "rating": 4.8,
    "downloads": "800万+",
    "download_url": "https://claude.ai/download",
    "website": "https://claude.ai/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "claude"
    ]
  },
  {
    "id": "gemini",
    "name": "Gemini",
    "en": "Google",
    "icon": "♊",
    "color": "#4285f4",
    "category": "ai",
    "tags": [
      "AI",
      "对话",
      "国外"
    ],
    "desc": "Google 多模态 AI 助手，深度整合搜索与谷歌生态，网页版即开即用。",
    "version": "网页版",
    "size": "免安装",
    "updated": "2026-11",
    "rating": 4.7,
    "downloads": "3000万+",
    "download_url": "https://gemini.google.com/",
    "website": "https://gemini.google.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": true,
    "detect": [
      "Gemini"
    ]
  },
  {
    "id": "cursor",
    "name": "Cursor",
    "en": "Anysphere",
    "icon": "🖱️",
    "color": "#111111",
    "category": "ai",
    "tags": [
      "AI",
      "编程",
      "国外"
    ],
    "desc": "内置 AI 的代码编辑器，基于 VS Code， Tab 补全与对话式编程体验领先。",
    "version": "2.0",
    "size": "约 300 MB",
    "updated": "2026-11",
    "rating": 4.8,
    "downloads": "500万+",
    "download_url": "https://www.cursor.com/",
    "website": "https://www.cursor.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "cursor"
    ],
    "icon_img": "assets/img/apps/cursor.png"
  },
  {
    "id": "trae",
    "name": "Trae",
    "en": "字节跳动",
    "icon": "⚡",
    "color": "#0f0f0f",
    "category": "ai",
    "tags": [
      "AI",
      "编程",
      "IDE",
      "国产"
    ],
    "desc": "字节跳动 AI 原生 IDE，内置 Agent 模式与 Cue 代码补全，中文界面，国内直连不卡。",
    "version": "2.3",
    "size": "约 467 MB",
    "updated": "2026-11",
    "rating": 4.7,
    "downloads": "1000万+",
    "download_url": "https://lf-cdn.trae.com.cn/obj/trae-com-cn/pkg/app/releases/stable/2.3.102387/win32/TRAE_CN-Setup-x64.exe",
    "website": "https://www.trae.com.cn/",
    "direct": true,
    "installer": {
      "type": "innosetup",
      "silent_args": "/VERYSILENT /DIR=",
      "requires_admin": false
    },
    "web": false,
    "detect": [
      "trae cn",
      "trae"
    ],
    "icon_img": "assets/img/apps/trae.png"
  },
  {
    "id": "doubao",
    "name": "豆包",
    "en": "字节跳动",
    "icon": "💬",
    "color": "#3258f0",
    "category": "ai",
    "tags": [
      "AI",
      "对话",
      "国产"
    ],
    "desc": "字节跳动 AI 助手，问答、写作、绘画、语音通话全覆盖，中文体验优秀。",
    "version": "5.9.3",
    "size": "约 200 MB",
    "updated": "2026-10",
    "rating": 4.7,
    "downloads": "2亿+",
    "download_url": "https://www.doubao.com/download/desktop",
    "website": "https://www.doubao.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "豆包",
      "doubao"
    ]
  },
  {
    "id": "deepseek",
    "name": "DeepSeek",
    "en": "深度求索",
    "icon": "🐋",
    "color": "#4d6bfe",
    "category": "ai",
    "tags": [
      "AI",
      "对话",
      "国产"
    ],
    "desc": "深度求索高性能推理模型，数学与代码能力突出，支持联网检索与文件解析。",
    "version": "网页版",
    "size": "免安装",
    "updated": "2026-11",
    "rating": 4.8,
    "downloads": "1亿+",
    "download_url": "https://chat.deepseek.com/",
    "website": "https://www.deepseek.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": true,
    "detect": [
      "DeepSeek"
    ],
    "icon_img": "assets/img/apps/deepseek.png"
  },
  {
    "id": "kimi",
    "name": "Kimi 智能助手",
    "en": "月之暗面",
    "icon": "🌙",
    "color": "#1f6feb",
    "category": "ai",
    "tags": [
      "AI",
      "对话",
      "长文本",
      "国产"
    ],
    "desc": "月之暗面出品，长文本处理见长，适合读论文、读合同、整理资料。",
    "version": "网页版",
    "size": "免安装",
    "updated": "2026-10",
    "rating": 4.7,
    "downloads": "6000万+",
    "download_url": "https://www.kimi.com/",
    "website": "https://www.kimi.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": true,
    "detect": [
      "Kimi 智能助手"
    ],
    "icon_img": "assets/img/apps/kimi.png"
  },
  {
    "id": "tongyi",
    "name": "通义千问",
    "en": "阿里巴巴",
    "icon": "🌀",
    "color": "#6247ff",
    "category": "ai",
    "tags": [
      "AI",
      "对话",
      "国产"
    ],
    "desc": "阿里巴巴全栈 AI 助手，覆盖对话、办公、编码与音视频理解，生态完善。",
    "version": "网页版",
    "size": "免安装",
    "updated": "2026-11",
    "rating": 4.6,
    "downloads": "5000万+",
    "download_url": "https://www.tongyi.com/",
    "website": "https://www.tongyi.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": true,
    "detect": [
      "通义千问"
    ]
  },
  {
    "id": "wenxiaoyan",
    "name": "文小言",
    "en": "百度",
    "icon": "🧠",
    "color": "#246bfe",
    "category": "ai",
    "tags": [
      "AI",
      "对话",
      "国产"
    ],
    "desc": "百度文心大模型助手，中文知识问答与创作能力强，支持数字分身互动。",
    "version": "网页版",
    "size": "免安装",
    "updated": "2026-09",
    "rating": 4.5,
    "downloads": "4000万+",
    "download_url": "https://yiyan.baidu.com/",
    "website": "https://yiyan.baidu.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": true,
    "detect": [
      "文小言"
    ]
  },
  {
    "id": "spark",
    "name": "讯飞星火",
    "en": "科大讯飞",
    "icon": "🔥",
    "color": "#c7254e",
    "category": "ai",
    "tags": [
      "AI",
      "对话",
      "语音",
      "国产"
    ],
    "desc": "科大讯飞认知大模型，语音交互与中文理解能力突出，办公场景丰富。",
    "version": "网页版",
    "size": "免安装",
    "updated": "2026-09",
    "rating": 4.5,
    "downloads": "3000万+",
    "download_url": "https://xinghuo.xfyun.cn/",
    "website": "https://xinghuo.xfyun.cn/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": true,
    "detect": [
      "讯飞星火"
    ],
    "icon_img": "assets/img/apps/spark.png"
  },
  {
    "id": "jimeng",
    "name": "即梦 AI",
    "en": "字节跳动",
    "icon": "🎨",
    "color": "#7c3aed",
    "category": "ai",
    "tags": [
      "AI",
      "绘画",
      "国产"
    ],
    "desc": "字节 AI 绘画与视频生成平台，中文提示友好，出图风格多样质量高。",
    "version": "网页版",
    "size": "免安装",
    "updated": "2026-10",
    "rating": 4.6,
    "downloads": "2000万+",
    "download_url": "https://jimeng.jianying.com/",
    "website": "https://jimeng.jianying.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": true,
    "detect": [
      "即梦 AI"
    ]
  },
  {
    "id": "kling",
    "name": "可灵 AI",
    "en": "快手",
    "icon": "🎥",
    "color": "#f97316",
    "category": "ai",
    "tags": [
      "AI",
      "视频",
      "国产"
    ],
    "desc": "快手视频生成大模型，图生视频、文生视频效果国内领先，支持高清输出。",
    "version": "网页版",
    "size": "免安装",
    "updated": "2026-10",
    "rating": 4.6,
    "downloads": "1500万+",
    "download_url": "https://klingai.kuaishou.com/",
    "website": "https://klingai.kuaishou.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": true,
    "detect": [
      "可灵 AI"
    ],
    "icon_img": "assets/img/apps/kling.png"
  },
  {
    "id": "wechat",
    "name": "微信",
    "en": "腾讯",
    "icon": "💚",
    "color": "#07c160",
    "category": "social",
    "tags": [
      "社交",
      "聊天",
      "国产"
    ],
    "desc": "国民级即时通讯软件，聊天、音视频通话、朋友圈、小程序与文件传输一应俱全。",
    "version": "4.0",
    "size": "约 150 MB",
    "updated": "2026-10",
    "rating": 4.8,
    "downloads": "10亿+",
    "download_url": "https://dldir1.qq.com/weixin/Windows/WeChatSetup.exe",
    "website": "https://weixin.qq.com/",
    "direct": true,
    "installer": {
      "type": "exe",
      "silent_args": "/S",
      "requires_admin": false
    },
    "web": false,
    "detect": [
      "wechat",
      "微信"
    ]
  },
  {
    "id": "qq",
    "name": "QQ",
    "en": "腾讯",
    "icon": "🐧",
    "color": "#12b7f5",
    "category": "social",
    "tags": [
      "社交",
      "聊天",
      "国产"
    ],
    "desc": "腾讯老牌即时通讯软件，群聊、文件传输、空间与办公协同功能成熟稳定。",
    "version": "9.7",
    "size": "约 180 MB",
    "updated": "2026-09",
    "rating": 4.7,
    "downloads": "8亿+",
    "download_url": "https://im.qq.com/pcqq/index.shtml",
    "website": "https://im.qq.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "qq"
    ]
  },
  {
    "id": "dingtalk",
    "name": "钉钉",
    "en": "阿里巴巴",
    "icon": "🔷",
    "color": "#1e88e5",
    "category": "social",
    "tags": [
      "社交",
      "办公",
      "国产"
    ],
    "desc": "阿里巴巴智能移动办公平台，考勤、审批、会议、DING 消息一站式搞定。",
    "version": "7.6",
    "size": "约 280 MB",
    "updated": "2026-10",
    "rating": 4.6,
    "downloads": "3亿+",
    "download_url": "https://page.dingtalk.com/wow/z/dingtalk/simple/ddhomedownlaod",
    "website": "https://www.dingtalk.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "钉钉",
      "dingtalk"
    ]
  },
  {
    "id": "wework",
    "name": "企业微信",
    "en": "腾讯",
    "icon": "🟢",
    "color": "#0082ef",
    "category": "social",
    "tags": [
      "社交",
      "办公",
      "国产"
    ],
    "desc": "腾讯出品的企业级通讯与办公工具，连接微信生态，客户管理与文档协作顺手。",
    "version": "4.1",
    "size": "约 250 MB",
    "updated": "2026-10",
    "rating": 4.6,
    "downloads": "2亿+",
    "download_url": "https://work.weixin.qq.com/",
    "website": "https://work.weixin.qq.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "企业微信",
      "wework"
    ],
    "icon_img": "assets/img/apps/wework.png"
  },
  {
    "id": "sogou",
    "name": "搜狗输入法",
    "en": "搜狗",
    "icon": "🐕",
    "color": "#fb602d",
    "category": "input",
    "tags": [
      "输入法",
      "国产"
    ],
    "desc": "国内用户量最大的拼音输入法，词库丰富、智能联想准，皮肤与表情海量。",
    "version": "14.0",
    "size": "约 80 MB",
    "updated": "2026-10",
    "rating": 4.7,
    "downloads": "5亿+",
    "download_url": "https://pinyin.sogou.com/",
    "website": "https://pinyin.sogou.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "搜狗输入法"
    ],
    "icon_img": "assets/img/apps/sogou.png"
  },
  {
    "id": "iflytek",
    "name": "讯飞输入法",
    "en": "科大讯飞",
    "icon": "🎤",
    "color": "#0f88eb",
    "category": "input",
    "tags": [
      "输入法",
      "语音",
      "国产"
    ],
    "desc": "语音输入准确率业界领先，支持方言识别，打字、手写、拼音全场景覆盖。",
    "version": "3.0",
    "size": "约 110 MB",
    "updated": "2026-09",
    "rating": 4.6,
    "downloads": "2亿+",
    "download_url": "https://srf.xunfei.cn/",
    "website": "https://srf.xunfei.cn/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "讯飞输入法"
    ],
    "icon_img": "assets/img/apps/iflytek.png"
  },
  {
    "id": "baiduinput",
    "name": "百度输入法",
    "en": "百度",
    "icon": "🐻",
    "color": "#2932e1",
    "category": "input",
    "tags": [
      "输入法",
      "国产"
    ],
    "desc": "百度出品拼音输入法，智能纠错与云端词库出色，界面清爽无打扰。",
    "version": "6.1",
    "size": "约 70 MB",
    "updated": "2026-08",
    "rating": 4.5,
    "downloads": "1亿+",
    "download_url": "https://shurufa.baidu.com/",
    "website": "https://shurufa.baidu.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "百度输入法"
    ],
    "icon_img": "assets/img/apps/baiduinput.png"
  },
  {
    "id": "qqbrowser",
    "name": "QQ 浏览器",
    "en": "腾讯",
    "icon": "🌐",
    "color": "#2b89fd",
    "category": "browser",
    "tags": [
      "浏览器",
      "国产"
    ],
    "desc": "腾讯出品双核浏览器，Chrome 内核快速兼容，内置翻译、截图与微信文件传输。",
    "version": "13.0",
    "size": "约 120 MB",
    "updated": "2026-10",
    "rating": 4.6,
    "downloads": "4亿+",
    "download_url": "https://browser.qq.com/",
    "website": "https://browser.qq.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "qq浏览器",
      "qqbrowser"
    ],
    "icon_img": "assets/img/apps/qqbrowser.png"
  },
  {
    "id": "browser360",
    "name": "360 极速浏览器 X",
    "en": "360",
    "icon": "🛡️",
    "color": "#17c05b",
    "category": "browser",
    "tags": [
      "浏览器",
      "国产"
    ],
    "desc": "360 出品 64 位双核浏览器，Chromium 122 内核，快、稳、纯净无弹窗。",
    "version": "22.3",
    "size": "约 110 MB",
    "updated": "2026-10",
    "rating": 4.7,
    "downloads": "3亿+",
    "download_url": "https://browser.360.cn/ee/",
    "website": "https://browser.360.cn/ee/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "360极速",
      "360se"
    ]
  },
  {
    "id": "sogoubrowser",
    "name": "搜狗高速浏览器",
    "en": "搜狗",
    "icon": "🔎",
    "color": "#e6412f",
    "category": "browser",
    "tags": [
      "浏览器",
      "国产"
    ],
    "desc": "搜狗双核浏览器，预取引擎打开网页飞快，内置全网加速与广告拦截。",
    "version": "12.3",
    "size": "约 100 MB",
    "updated": "2026-09",
    "rating": 4.5,
    "downloads": "2亿+",
    "download_url": "https://ie.sogou.com/",
    "website": "https://ie.sogou.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "搜狗高速",
      "sogouexplorer"
    ],
    "icon_img": "assets/img/apps/sogoubrowser.png"
  },
  {
    "id": "xunlei",
    "name": "迅雷",
    "en": "迅雷",
    "icon": "⚡",
    "color": "#1d7cf2",
    "category": "download",
    "tags": [
      "下载",
      "国产"
    ],
    "desc": "老牌下载软件，磁力、BT、电驴、HTTP 全协议支持，下载加速与云播体验成熟。",
    "version": "12.0",
    "size": "约 130 MB",
    "updated": "2026-10",
    "rating": 4.6,
    "downloads": "5亿+",
    "download_url": "https://www.xunlei.com/",
    "website": "https://www.xunlei.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "迅雷",
      "thunder"
    ],
    "icon_img": "assets/img/apps/xunlei.png"
  },
  {
    "id": "motrix",
    "name": "Motrix",
    "en": "开源软件",
    "icon": "🌈",
    "color": "#232323",
    "category": "download",
    "tags": [
      "下载",
      "开源",
      "国产"
    ],
    "desc": "简洁漂亮的开源下载器，支持 HTTP/FTP/BT/磁力，界面清爽免费无广告。",
    "version": "1.8",
    "size": "约 90 MB",
    "updated": "2026-06",
    "rating": 4.7,
    "downloads": "1000万+",
    "download_url": "https://motrix.app/",
    "website": "https://motrix.app/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "motrix"
    ],
    "icon_img": "assets/img/apps/motrix.png"
  },
  {
    "id": "bitcomet",
    "name": "比特彗星",
    "en": "BitComet",
    "icon": "☄️",
    "color": "#e8734a",
    "category": "download",
    "tags": [
      "下载",
      "BT",
      "国产"
    ],
    "desc": "老牌 BT 下载软件，长效种子与磁盘缓存技术著称，下载稳定资源占用低。",
    "version": "2.10",
    "size": "约 30 MB",
    "updated": "2026-09",
    "rating": 4.6,
    "downloads": "1亿+",
    "download_url": "https://www.bitcomet.com/cn",
    "website": "https://www.bitcomet.com/cn",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "bitcomet"
    ]
  },
  {
    "id": "bilibili",
    "name": "哔哩哔哩",
    "en": "B站",
    "icon": "📺",
    "color": "#fb7299",
    "category": "video",
    "tags": [
      "视频",
      "弹幕",
      "国产"
    ],
    "desc": "国内领先的视频弹幕网站官方客户端，追番、看剧、学习区内容丰富。",
    "version": "1.15",
    "size": "约 100 MB",
    "updated": "2026-10",
    "rating": 4.7,
    "downloads": "3亿+",
    "download_url": "https://app.bilibili.com/",
    "website": "https://www.bilibili.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "哔哩哔哩",
      "bilibili"
    ],
    "icon_img": "assets/img/apps/bilibili.png"
  },
  {
    "id": "tencentvideo",
    "name": "腾讯视频",
    "en": "腾讯",
    "icon": "▶️",
    "color": "#ff6022",
    "category": "video",
    "tags": [
      "视频",
      "国产"
    ],
    "desc": "腾讯旗下视频平台客户端，院线新片、独家剧集与综艺资源海量更新快。",
    "version": "12.1",
    "size": "约 140 MB",
    "updated": "2026-10",
    "rating": 4.6,
    "downloads": "4亿+",
    "download_url": "https://v.qq.com/download.html",
    "website": "https://v.qq.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "腾讯视频",
      "qqlive"
    ],
    "icon_img": "assets/img/apps/tencentvideo.png"
  },
  {
    "id": "iqiyi",
    "name": "爱奇艺",
    "en": "爱奇艺",
    "icon": "🥝",
    "color": "#1db954",
    "category": "video",
    "tags": [
      "视频",
      "国产"
    ],
    "desc": "主流长视频平台客户端，自制剧与电影资源全，支持 4K 杜比视听体验。",
    "version": "12.2",
    "size": "约 130 MB",
    "updated": "2026-10",
    "rating": 4.6,
    "downloads": "3亿+",
    "download_url": "https://app.iqiyi.com/",
    "website": "https://www.iqiyi.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "爱奇艺",
      "qyclient"
    ],
    "icon_img": "assets/img/apps/iqiyi.png"
  },
  {
    "id": "mgtv",
    "name": "芒果 TV",
    "en": "芒果超媒",
    "icon": "🥭",
    "color": "#ff8a00",
    "category": "video",
    "tags": [
      "视频",
      "国产"
    ],
    "desc": "湖南卫视官方视频平台，综艺与自制剧独家内容多，观看体验流畅。",
    "version": "6.8",
    "size": "约 120 MB",
    "updated": "2026-09",
    "rating": 4.5,
    "downloads": "2亿+",
    "download_url": "https://app.mgtv.com/",
    "website": "https://www.mgtv.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "芒果tv",
      "mgtv"
    ],
    "icon_img": "assets/img/apps/mgtv.png"
  },
  {
    "id": "cloudmusic",
    "name": "网易云音乐",
    "en": "网易",
    "icon": "☁️",
    "color": "#ec4141",
    "category": "music",
    "tags": [
      "音乐",
      "国产"
    ],
    "desc": "歌单与推荐算法口碑极佳的音乐社区，乐评氛围浓厚，曲库持续扩充。",
    "version": "3.0",
    "size": "约 160 MB",
    "updated": "2026-10",
    "rating": 4.8,
    "downloads": "4亿+",
    "download_url": "https://music.163.com/#/download",
    "website": "https://music.163.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "网易云音乐",
      "cloudmusic"
    ],
    "icon_img": "assets/img/apps/cloudmusic.png"
  },
  {
    "id": "qqmusic",
    "name": "QQ 音乐",
    "en": "腾讯",
    "icon": "🎧",
    "color": "#31c27c",
    "category": "music",
    "tags": [
      "音乐",
      "国产"
    ],
    "desc": "腾讯音乐旗舰播放器，曲库最全、音质选择多，绿钻尊享无损与 VIP 曲库。",
    "version": "20.5",
    "size": "约 80 MB",
    "updated": "2026-10",
    "rating": 4.7,
    "downloads": "5亿+",
    "download_url": "https://dldir1.qq.com/music/clntupate/QQMusicSetup.exe",
    "website": "https://y.qq.com/",
    "direct": true,
    "installer": {
      "type": "exe",
      "silent_args": "/S",
      "requires_admin": false
    },
    "web": false,
    "detect": [
      "qq音乐",
      "qqmusic"
    ],
    "icon_img": "assets/img/apps/qqmusic.png"
  },
  {
    "id": "kugou",
    "name": "酷狗音乐",
    "en": "腾讯",
    "icon": "🐶",
    "color": "#00b4aa",
    "category": "music",
    "tags": [
      "音乐",
      "国产"
    ],
    "desc": "老牌音乐播放器，蝰蛇音效与海量 MV，直播与 K 歌功能丰富。",
    "version": "11.0",
    "size": "约 100 MB",
    "updated": "2026-09",
    "rating": 4.5,
    "downloads": "3亿+",
    "download_url": "https://www.kugou.com/",
    "website": "https://www.kugou.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "酷狗",
      "kugou"
    ]
  },
  {
    "id": "meitu",
    "name": "美图秀秀",
    "en": "美图",
    "icon": "💅",
    "color": "#ff4d8d",
    "category": "image",
    "tags": [
      "修图",
      "国产"
    ],
    "desc": "国民级图片美化工具，一键人像精修、拼图、抠图与批量处理，上手零门槛。",
    "version": "7.6",
    "size": "约 300 MB",
    "updated": "2026-10",
    "rating": 4.6,
    "downloads": "3亿+",
    "download_url": "https://pc.meitu.com/",
    "website": "https://pc.meitu.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "美图秀秀",
      "meitu"
    ]
  },
  {
    "id": "neoimaging",
    "name": "光影魔术手",
    "en": "光影",
    "icon": "📷",
    "color": "#c8102e",
    "category": "image",
    "tags": [
      "修图",
      "国产"
    ],
    "desc": "经典易用的照片处理软件，一键补光、调色、边框与水印，老用户口碑之选。",
    "version": "4.6",
    "size": "约 40 MB",
    "updated": "2026-08",
    "rating": 4.5,
    "downloads": "1亿+",
    "download_url": "https://www.neoimaging.cn/",
    "website": "https://www.neoimaging.cn/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "光影魔术手",
      "neoimaging"
    ],
    "icon_img": "assets/img/apps/neoimaging.png"
  },
  {
    "id": "gaoding",
    "name": "稿定设计",
    "en": "稿定",
    "icon": "🖌️",
    "color": "#2f6bff",
    "category": "image",
    "tags": [
      "设计",
      "国产"
    ],
    "desc": "在线设计神器 PC 版，海报、PPT、抠图模板一键套用，电商与新媒体必备。",
    "version": "1.3",
    "size": "约 120 MB",
    "updated": "2026-09",
    "rating": 4.6,
    "downloads": "5000万+",
    "download_url": "https://www.gaoding.com/",
    "website": "https://www.gaoding.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "稿定"
    ],
    "icon_img": "assets/img/apps/gaoding.png"
  },
  {
    "id": "jianying",
    "name": "剪映专业版",
    "en": "字节跳动",
    "icon": "✂️",
    "color": "#171a1d",
    "category": "edit",
    "tags": [
      "剪辑",
      "国产"
    ],
    "desc": "字节出品专业剪辑软件，字幕识别、一键成片、特效素材全，抖音生态无缝衔接。",
    "version": "7.0",
    "size": "约 700 MB",
    "updated": "2026-11",
    "rating": 4.8,
    "downloads": "1亿+",
    "download_url": "https://www.capcut.cn/",
    "website": "https://www.capcut.cn/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "剪映",
      "capcut"
    ]
  },
  {
    "id": "bijian",
    "name": "必剪",
    "en": "B站",
    "icon": "🎬",
    "color": "#00a1d6",
    "category": "edit",
    "tags": [
      "剪辑",
      "国产"
    ],
    "desc": "B 站官方剪辑工具，一键投稿、录屏、字幕与鬼畜素材，UP 主入门首选。",
    "version": "3.4",
    "size": "约 500 MB",
    "updated": "2026-09",
    "rating": 4.5,
    "downloads": "5000万+",
    "download_url": "https://bcut.bilibili.com/",
    "website": "https://bcut.bilibili.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "必剪",
      "bcut"
    ]
  },
  {
    "id": "wps",
    "name": "WPS Office",
    "en": "金山办公",
    "icon": "📄",
    "color": "#ea3e23",
    "category": "office",
    "tags": [
      "办公",
      "国产"
    ],
    "desc": "国产办公软件标杆，文字、表格、演示、PDF 全兼容 MS 格式，模板生态丰富。",
    "version": "12.1",
    "size": "约 250 MB",
    "updated": "2026-11",
    "rating": 4.8,
    "downloads": "5亿+",
    "download_url": "https://pc.wps.cn/",
    "website": "https://www.wps.cn/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "wps office",
      "wps"
    ],
    "icon_img": "assets/img/apps/wps.png"
  },
  {
    "id": "tencentmeeting",
    "name": "腾讯会议",
    "en": "腾讯",
    "icon": "🎥",
    "color": "#006eff",
    "category": "office",
    "tags": [
      "会议",
      "办公",
      "国产"
    ],
    "desc": "国民级视频会议软件，高清稳定、一键入会，屏幕共享与会议纪要功能完善。",
    "version": "3.30",
    "size": "约 200 MB",
    "updated": "2026-10",
    "rating": 4.7,
    "downloads": "3亿+",
    "download_url": "https://meeting.tencent.com/download-center.html",
    "website": "https://meeting.tencent.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "腾讯会议",
      "wemeet"
    ],
    "icon_img": "assets/img/apps/tencentmeeting.png"
  },
  {
    "id": "pdf360",
    "name": "360 苏打办公",
    "en": "360",
    "icon": "📑",
    "color": "#00b78b",
    "category": "office",
    "tags": [
      "PDF",
      "办公",
      "国产"
    ],
    "desc": "360 出品办公套件，PDF 阅读转换、看图、桌面整理轻量集成，清爽不臃肿。",
    "version": "2.0",
    "size": "约 80 MB",
    "updated": "2026-08",
    "rating": 4.4,
    "downloads": "2000万+",
    "download_url": "https://bangong.360.cn/",
    "website": "https://bangong.360.cn/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "苏打办公",
      "sodapdf"
    ]
  },
  {
    "id": "youdaonote",
    "name": "有道云笔记",
    "en": "网易",
    "icon": "📝",
    "color": "#38c664",
    "category": "notes",
    "tags": [
      "笔记",
      "国产"
    ],
    "desc": "网易出品云笔记，多端同步、 Markdown、OCR 扫描与语音速记，学生与职场通用。",
    "version": "8.0",
    "size": "约 120 MB",
    "updated": "2026-09",
    "rating": 4.6,
    "downloads": "1亿+",
    "download_url": "https://note.youdao.com/",
    "website": "https://note.youdao.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "有道云笔记",
      "youdaonote"
    ]
  },
  {
    "id": "yuque",
    "name": "语雀",
    "en": "蚂蚁集团",
    "icon": "🐦",
    "color": "#33c4a8",
    "category": "notes",
    "tags": [
      "笔记",
      "文档",
      "国产"
    ],
    "desc": "蚂蚁集团知识库工具，结构化文档、团队知识库与表格画板，写作者口碑之选。",
    "version": "3.4",
    "size": "网页版",
    "updated": "2026-10",
    "rating": 4.6,
    "downloads": "3000万+",
    "download_url": "https://www.yuque.com/",
    "website": "https://www.yuque.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": true,
    "detect": [
      "语雀"
    ],
    "icon_img": "assets/img/apps/yuque.png"
  },
  {
    "id": "feishu",
    "name": "飞书",
    "en": "字节跳动",
    "icon": "🕊️",
    "color": "#3370ff",
    "category": "notes",
    "tags": [
      "笔记",
      "办公",
      "国产"
    ],
    "desc": "字节跳动一站式协作平台，文档、多维表格、会议与审批一体化，个人团队皆宜。",
    "version": "7.30",
    "size": "约 350 MB",
    "updated": "2026-10",
    "rating": 4.7,
    "downloads": "2亿+",
    "download_url": "https://www.feishu.cn/download",
    "website": "https://www.feishu.cn/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "飞书",
      "feishu"
    ],
    "icon_img": "assets/img/apps/feishu.png"
  },
  {
    "id": "baidupan",
    "name": "百度网盘",
    "en": "百度",
    "icon": "🐻",
    "color": "#06a7ff",
    "category": "netdisk",
    "tags": [
      "网盘",
      "国产"
    ],
    "desc": "用户量最大的网盘，空间大、分享生态成熟，客户端下载管理体验完整。",
    "version": "7.50",
    "size": "约 200 MB",
    "updated": "2026-10",
    "rating": 4.5,
    "downloads": "5亿+",
    "download_url": "https://pan.baidu.com/download",
    "website": "https://pan.baidu.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "百度网盘",
      "baidunetdisk"
    ]
  },
  {
    "id": "aliyunpan",
    "name": "阿里云盘",
    "en": "阿里巴巴",
    "icon": "☁️",
    "color": "#637dff",
    "category": "netdisk",
    "tags": [
      "网盘",
      "国产"
    ],
    "desc": "阿里巴巴出品网盘，上传下载不限速著称，界面清爽、视频在线播放体验好。",
    "version": "6.0",
    "size": "约 180 MB",
    "updated": "2026-10",
    "rating": 4.7,
    "downloads": "2亿+",
    "download_url": "https://www.alipan.com/",
    "website": "https://www.alipan.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "阿里云盘",
      "aliyundrive"
    ]
  },
  {
    "id": "quarkpan",
    "name": "夸克网盘",
    "en": "阿里巴巴",
    "icon": "🧬",
    "color": "#6b5cff",
    "category": "netdisk",
    "tags": [
      "网盘",
      "国产"
    ],
    "desc": "夸克浏览器同源网盘，88VIP 权益加持，扫描、文档处理与影视资源丰富。",
    "version": "3.0",
    "size": "约 150 MB",
    "updated": "2026-09",
    "rating": 4.6,
    "downloads": "1亿+",
    "download_url": "https://pan.quark.cn/",
    "website": "https://pan.quark.cn/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "夸克网盘",
      "quark"
    ],
    "icon_img": "assets/img/apps/quarkpan.png"
  },
  {
    "id": "zip360",
    "name": "360 压缩",
    "en": "360",
    "icon": "📦",
    "color": "#17c05b",
    "category": "zip",
    "tags": [
      "压缩",
      "国产"
    ],
    "desc": "360 出品免费压缩软件，无广告无弹窗，支持 42 种格式、内置木马扫描。",
    "version": "4.0",
    "size": "约 15 MB",
    "updated": "2026-08",
    "rating": 4.7,
    "downloads": "3亿+",
    "download_url": "https://down.360safe.com/360zip_setup.exe",
    "website": "https://yasuo.360.cn/",
    "direct": true,
    "installer": {
      "type": "exe",
      "silent_args": "/S",
      "requires_admin": false
    },
    "web": false,
    "detect": [
      "360压缩",
      "360zip"
    ]
  },
  {
    "id": "haozip",
    "name": "2345 好压",
    "en": "2345",
    "icon": "🏺",
    "color": "#ff8f2b",
    "category": "zip",
    "tags": [
      "压缩",
      "国产"
    ],
    "desc": "国产老牌压缩软件，格式支持全面、压缩率高，批量压缩与自解压功能实用。",
    "version": "6.5",
    "size": "约 25 MB",
    "updated": "2026-07",
    "rating": 4.4,
    "downloads": "3亿+",
    "download_url": "https://haozip.2345.cc/",
    "website": "https://haozip.2345.cc/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "好压",
      "haozip"
    ]
  },
  {
    "id": "snipaste",
    "name": "Snipaste",
    "en": "Snipaste",
    "icon": "✂️",
    "color": "#f5a623",
    "category": "screenshot",
    "tags": [
      "截图",
      "贴图",
      "国产"
    ],
    "desc": "国产截图神器，F1 截图 F3 贴图，取色、标注、分组管理，开发者与设计师最爱。",
    "version": "2.10",
    "size": "约 30 MB",
    "updated": "2026-06",
    "rating": 4.9,
    "downloads": "2000万+",
    "download_url": "https://www.snipaste.com/",
    "website": "https://www.snipaste.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "snipaste"
    ],
    "icon_img": "assets/img/apps/snipaste.png"
  },
  {
    "id": "pixpin",
    "name": "PixPin",
    "en": "PixPin",
    "icon": "📌",
    "color": "#5865f2",
    "category": "screenshot",
    "tags": [
      "截图",
      "长截图",
      "国产"
    ],
    "desc": "新一代国产截图工具，长截图、GIF 录制、OCR 识别与贴图，功能全面体验现代。",
    "version": "1.9",
    "size": "约 40 MB",
    "updated": "2026-10",
    "rating": 4.8,
    "downloads": "1000万+",
    "download_url": "https://pixpin.cn/",
    "website": "https://pixpin.cn/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "pixpin"
    ],
    "icon_img": "assets/img/apps/pixpin.png"
  },
  {
    "id": "evcapture",
    "name": "EV 录屏",
    "en": "湖南一唯",
    "icon": "🎥",
    "color": "#22b07d",
    "category": "screenshot",
    "tags": [
      "录屏",
      "国产"
    ],
    "desc": "国产免费录屏软件，全屏/区域/摄像头录制，无水印不限时，微课与网课常用。",
    "version": "5.2",
    "size": "约 35 MB",
    "updated": "2026-08",
    "rating": 4.6,
    "downloads": "3000万+",
    "download_url": "https://www.ieway.cn/evcapture.html",
    "website": "https://www.ieway.cn/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "ev录屏",
      "evcapture"
    ]
  },
  {
    "id": "huorong",
    "name": "火绒安全",
    "en": "火绒",
    "icon": "🔥",
    "color": "#e63f2a",
    "category": "security",
    "tags": [
      "安全",
      "杀毒",
      "国产"
    ],
    "desc": "国产安全软件口碑之王，安静无弹窗，病毒查杀、拦截防护与系统工具皆优秀。",
    "version": "6.0",
    "size": "约 80 MB",
    "updated": "2026-11",
    "rating": 4.9,
    "downloads": "2亿+",
    "download_url": "https://www.huorong.cn/",
    "website": "https://www.huorong.cn/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "火绒",
      "sysdiag"
    ]
  },
  {
    "id": "weishi360",
    "name": "360 安全卫士极速版",
    "en": "360",
    "icon": "🛡️",
    "color": "#17c05b",
    "category": "security",
    "tags": [
      "安全",
      "国产"
    ],
    "desc": "360 安全卫士无广告纯净版，木马查杀、漏洞修复与系统清理功能全面。",
    "version": "15.0",
    "size": "约 100 MB",
    "updated": "2026-10",
    "rating": 4.5,
    "downloads": "4亿+",
    "download_url": "https://weishi.360.cn/",
    "website": "https://weishi.360.cn/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "360安全卫士"
    ]
  },
  {
    "id": "diskgenius",
    "name": "DiskGenius",
    "en": " DiskGenius",
    "icon": "💽",
    "color": "#2e86de",
    "category": "system",
    "tags": [
      "磁盘",
      "分区",
      "国产"
    ],
    "desc": "国产磁盘管理专家，分区调整、数据恢复、坏道检测，装系统维护必备。",
    "version": "6.0",
    "size": "约 60 MB",
    "updated": "2026-09",
    "rating": 4.8,
    "downloads": "5000万+",
    "download_url": "https://www.diskgenius.cn/",
    "website": "https://www.diskgenius.cn/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "diskgenius"
    ],
    "icon_img": "assets/img/apps/diskgenius.png"
  },
  {
    "id": "dismpp",
    "name": "Dism++",
    "en": "Dism++ Team",
    "icon": "🧰",
    "color": "#546e7a",
    "category": "system",
    "tags": [
      "系统优化",
      "开源",
      "国产"
    ],
    "desc": "开源免费的 Windows 清理优化神器，系统精简、更新管理、垃圾清理一锅端。",
    "version": "10.1",
    "size": "约 10 MB",
    "updated": "2026-05",
    "rating": 4.9,
    "downloads": "1000万+",
    "download_url": "https://www.chuyu.me/",
    "website": "https://www.chuyu.me/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "dism++"
    ]
  },
  {
    "id": "wepe",
    "name": "微 PE 工具箱",
    "en": "微 PE",
    "icon": "🩹",
    "color": "#8e44ad",
    "category": "system",
    "tags": [
      "PE",
      "装系统",
      "国产"
    ],
    "desc": "口碑最佳的 PE 启动盘制作工具，纯净无捆绑，装机维护人员标配。",
    "version": "2.3",
    "size": "约 220 MB",
    "updated": "2026-06",
    "rating": 4.9,
    "downloads": "3000万+",
    "download_url": "https://www.wepe.com.cn/",
    "website": "https://www.wepe.com.cn/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "微pe",
      "wepe"
    ]
  },
  {
    "id": "ludashi",
    "name": "鲁大师",
    "en": "鲁大师",
    "icon": "🦁",
    "color": "#e74c3c",
    "category": "driver",
    "tags": [
      "驱动",
      "硬件检测",
      "国产"
    ],
    "desc": "老牌硬件检测与驱动管理软件，跑分、温度监控、驱动一键安装，新手友好。",
    "version": "6.10",
    "size": "约 150 MB",
    "updated": "2026-10",
    "rating": 4.4,
    "downloads": "4亿+",
    "download_url": "https://www.ludashi.com/",
    "website": "https://www.ludashi.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "鲁大师"
    ],
    "icon_img": "assets/img/apps/ludashi.png"
  },
  {
    "id": "drivergenius",
    "name": "驱动精灵",
    "en": "驱动之家",
    "icon": "🧚",
    "color": "#1e90ff",
    "category": "driver",
    "tags": [
      "驱动",
      "国产"
    ],
    "desc": "驱动之家出品驱动管理工具，驱动备份还原、硬件检测与系统补丁一站完成。",
    "version": "9.70",
    "size": "约 130 MB",
    "updated": "2026-08",
    "rating": 4.3,
    "downloads": "3亿+",
    "download_url": "https://www.drivergenius.com/",
    "website": "https://www.drivergenius.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "驱动精灵",
      "mydrivers"
    ]
  },
  {
    "id": "hbuilderx",
    "name": "HBuilderX",
    "en": "DCloud",
    "icon": "💚",
    "color": "#42b883",
    "category": "dev",
    "tags": [
      "编程",
      "国产"
    ],
    "desc": "国产前端开发神器，Vue/小程序/uni-app 深度优化，轻量启动快、代码提示智能。",
    "version": "4.5",
    "size": "约 150 MB",
    "updated": "2026-10",
    "rating": 4.6,
    "downloads": "500万+",
    "download_url": "https://www.dcloud.io/hbuilderx.html",
    "website": "https://www.dcloud.io/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "hbuilderx"
    ],
    "icon_img": "assets/img/apps/hbuilderx.png"
  },
  {
    "id": "notepadmm",
    "name": "Notepad--",
    "en": "NDD",
    "icon": "📝",
    "color": "#c0392b",
    "category": "dev",
    "tags": [
      "编辑器",
      "开源",
      "国产"
    ],
    "desc": "国产开源文本编辑器，Notepad++ 替代品，跨平台、支持大文件与语法高亮。",
    "version": "2.20",
    "size": "约 40 MB",
    "updated": "2026-09",
    "rating": 4.5,
    "downloads": "300万+",
    "download_url": "https://gitee.com/cxasm/notepad--",
    "website": "https://gitee.com/cxasm/notepad--",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "notepad--"
    ],
    "icon_img": "assets/img/apps/notepadmm.png"
  },
  {
    "id": "redpanda",
    "name": "小熊猫 Dev-C++",
    "en": "Roy Qu",
    "icon": "🐼",
    "color": "#e67e22",
    "category": "dev",
    "tags": [
      "编程",
      "C/C++",
      "国产"
    ],
    "desc": "国产维护的现代 Dev-C++，C/C++ 入门教学首选，调试器与中文界面友好。",
    "version": "3.2",
    "size": "约 80 MB",
    "updated": "2026-08",
    "rating": 4.6,
    "downloads": "200万+",
    "download_url": "https://royqh.net/redpandacpp/",
    "website": "https://royqh.net/redpandacpp/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "小熊猫dev-c++",
      "redpanda"
    ],
    "icon_img": "assets/img/apps/redpanda.png"
  },
  {
    "id": "scratch",
    "name": "Scratch",
    "en": "MIT",
    "icon": "🐱",
    "color": "#ff8c1a",
    "category": "dev",
    "tags": [
      "少儿编程",
      "图形化",
      "积木"
    ],
    "desc": "麻省理工媒体实验室出品的图形化编程工具，拖积木就能做动画和游戏，零基础入门首选。",
    "version": "3.29.1",
    "size": "约 200 MB",
    "updated": "2026-09",
    "rating": 4.9,
    "downloads": "1亿+",
    "download_url": "https://scratch.mit.edu/download",
    "website": "https://scratch.mit.edu/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "scratch"
    ],
    "icon_img": "assets/img/apps/scratch.png"
  },
  {
    "id": "vscode",
    "name": "Visual Studio Code",
    "en": "Microsoft",
    "icon": "🔷",
    "color": "#007acc",
    "category": "dev",
    "tags": [
      "编辑器",
      "代码",
      "插件生态",
      "跨平台"
    ],
    "desc": "微软出品的免费代码编辑器，启动快、插件生态最全，前端后端脚本全都能写。",
    "version": "1.96",
    "size": "约 100 MB",
    "updated": "2026-11",
    "rating": 4.9,
    "downloads": "5000万+",
    "download_url": "https://update.code.visualstudio.com/latest/win32-x64-user/stable",
    "website": "https://code.visualstudio.com/",
    "direct": true,
    "installer": {
      "type": "exe",
      "silent_args": "/VERYSILENT /NORESTART /MERGETASKS=!runcode",
      "requires_admin": false
    },
    "web": false,
    "detect": [
      "visual studio code",
      "vscode"
    ],
    "icon_img": "assets/img/apps/vscode.png"
  },
  {
    "id": "python",
    "name": "Python",
    "en": "PSF",
    "icon": "🐍",
    "color": "#3776ab",
    "category": "dev",
    "tags": [
      "解释器",
      "语言",
      "数据分析",
      "必装"
    ],
    "desc": "最主流的通用编程语言运行环境，自带 IDLE，装完即可跑脚本，AI 与数据分析的底座。",
    "version": "3.13",
    "size": "约 30 MB",
    "updated": "2026-10",
    "rating": 4.9,
    "downloads": "1亿+",
    "download_url": "https://www.python.org/downloads/windows/",
    "website": "https://www.python.org/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "python 3"
    ],
    "icon_img": "assets/img/apps/python.png"
  },
  {
    "id": "git",
    "name": "Git",
    "en": "Git SCM",
    "icon": "🌿",
    "color": "#f05032",
    "category": "dev",
    "tags": [
      "版本控制",
      "命令行",
      "必装"
    ],
    "desc": "分布式版本控制系统，代码托管与协作的基础工具，附 Git Bash 命令行环境。",
    "version": "2.47",
    "size": "约 65 MB",
    "updated": "2026-10",
    "rating": 4.9,
    "downloads": "1亿+",
    "download_url": "https://git-scm.com/download/win",
    "website": "https://git-scm.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "git for windows",
      "git"
    ],
    "icon_img": "assets/img/apps/git.png"
  },
  {
    "id": "nodejs",
    "name": "Node.js",
    "en": "OpenJS",
    "icon": "🟩",
    "color": "#5fa04e",
    "category": "dev",
    "tags": [
      "运行环境",
      "JavaScript",
      "前端"
    ],
    "desc": "让 JavaScript 跑在服务端的运行时，自带 npm 包管理器，前端工程化必备。",
    "version": "22 LTS",
    "size": "约 30 MB",
    "updated": "2026-11",
    "rating": 4.7,
    "downloads": "5000万+",
    "download_url": "https://nodejs.org/zh-cn/download",
    "website": "https://nodejs.org/zh-cn/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "node.js"
    ],
    "icon_img": "assets/img/apps/nodejs.png"
  },
  {
    "id": "jdk",
    "name": "JDK 21 (Temurin)",
    "en": "Eclipse",
    "icon": "☕",
    "color": "#e76f00",
    "category": "dev",
    "tags": [
      "Java",
      "运行环境",
      "后端"
    ],
    "desc": "Eclipse 基金会维护的 OpenJDK 长期支持版，跑 Java 程序与编译后端项目的标准环境。",
    "version": "21 LTS",
    "size": "约 190 MB",
    "updated": "2026-09",
    "rating": 4.8,
    "downloads": "3000万+",
    "download_url": "https://adoptium.net/zh-CN/temurin/releases/",
    "website": "https://adoptium.net/zh-CN/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "eclipse temurin jdk",
      "java se development kit",
      "openjdk"
    ],
    "icon_img": "assets/img/apps/jdk.png"
  },
  {
    "id": "idea",
    "name": "IntelliJ IDEA 社区版",
    "en": "JetBrains",
    "icon": "🧠",
    "color": "#fe315d",
    "category": "dev",
    "tags": [
      "IDE",
      "Java",
      "Kotlin",
      "免费"
    ],
    "desc": "JetBrains 出品的 Java 集成开发环境社区版，免费开源，代码补全与重构能力最强。",
    "version": "2026.2",
    "size": "约 1.2 GB",
    "updated": "2026-10",
    "rating": 4.8,
    "downloads": "1000万+",
    "download_url": "https://www.jetbrains.com/zh-cn/idea/download/",
    "website": "https://www.jetbrains.com/zh-cn/idea/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "intellij idea"
    ],
    "icon_img": "assets/img/apps/idea.png"
  },
  {
    "id": "pycharm",
    "name": "PyCharm 社区版",
    "en": "JetBrains",
    "icon": "🎯",
    "color": "#21d789",
    "category": "dev",
    "tags": [
      "IDE",
      "Python",
      "免费"
    ],
    "desc": "JetBrains 出品的 Python 集成开发环境社区版，调试、虚拟环境与代码检查开箱可用。",
    "version": "2026.2",
    "size": "约 700 MB",
    "updated": "2026-10",
    "rating": 4.8,
    "downloads": "2000万+",
    "download_url": "https://www.jetbrains.com/zh-cn/pycharm/download/",
    "website": "https://www.jetbrains.com/zh-cn/pycharm/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "pycharm"
    ],
    "icon_img": "assets/img/apps/pycharm.png"
  },
  {
    "id": "androidstudio",
    "name": "Android Studio",
    "en": "Google",
    "icon": "🤖",
    "color": "#3ddc84",
    "category": "dev",
    "tags": [
      "IDE",
      "安卓",
      "移动开发"
    ],
    "desc": "安卓官方开发工具，内置模拟器与布局编辑器，写 App 的标准环境。",
    "version": "2026.1",
    "size": "约 1.1 GB",
    "updated": "2026-10",
    "rating": 4.7,
    "downloads": "2000万+",
    "download_url": "https://developer.android.google.cn/studio",
    "website": "https://developer.android.google.cn/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "android studio"
    ],
    "icon_img": "assets/img/apps/androidstudio.png"
  },
  {
    "id": "vstudio",
    "name": "Visual Studio 2022 社区版",
    "en": "Microsoft",
    "icon": "🟣",
    "color": "#5c2d91",
    "category": "dev",
    "tags": [
      "IDE",
      "C#",
      "C++",
      "免费"
    ],
    "desc": "微软官方集成开发环境社区版，C#、C++、.NET 桌面与游戏开发一站齐全，个人免费。",
    "version": "17.14",
    "size": "约 25 MB",
    "updated": "2026-10",
    "rating": 4.7,
    "downloads": "3000万+",
    "download_url": "https://visualstudio.microsoft.com/zh-hans/downloads/",
    "website": "https://visualstudio.microsoft.com/zh-hans/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "visual studio community",
      "visual studio professional"
    ],
    "icon_img": "assets/img/apps/vstudio.png"
  },
  {
    "id": "wxdevtools",
    "name": "微信开发者工具",
    "en": "腾讯",
    "icon": "💬",
    "color": "#07c160",
    "category": "dev",
    "tags": [
      "小程序",
      "国产",
      "公众号"
    ],
    "desc": "腾讯官方小程序开发工具，编码、真机预览、调试与上传一体，做小程序必装。",
    "version": "1.06",
    "size": "约 400 MB",
    "updated": "2026-11",
    "rating": 4.6,
    "downloads": "1000万+",
    "download_url": "https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html",
    "website": "https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "微信web开发者工具",
      "微信开发者工具"
    ],
    "icon_img": "assets/img/apps/wxdevtools.png"
  },
  {
    "id": "apifox",
    "name": "Apifox",
    "en": "Apifox",
    "icon": "🔌",
    "color": "#ff6a00",
    "category": "dev",
    "tags": [
      "接口",
      "调试",
      "国产"
    ],
    "desc": "国产接口一体化工具，文档、调试、Mock 与自动化测试合一，Postman 的平替。",
    "version": "2.7",
    "size": "约 180 MB",
    "updated": "2026-10",
    "rating": 4.6,
    "downloads": "500万+",
    "download_url": "https://apifox.com/download",
    "website": "https://apifox.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "apifox"
    ],
    "icon_img": "assets/img/apps/apifox.png"
  },
  {
    "id": "dbeaver",
    "name": "DBeaver",
    "en": "DBeaver",
    "icon": "🦫",
    "color": "#8b6c4a",
    "category": "dev",
    "tags": [
      "数据库",
      "SQL",
      "免费"
    ],
    "desc": "开源通用数据库客户端，MySQL、PostgreSQL、SQLite、Oracle 一个界面全连。",
    "version": "25.1",
    "size": "约 130 MB",
    "updated": "2026-10",
    "rating": 4.6,
    "downloads": "1500万+",
    "download_url": "https://dbeaver.io/download/",
    "website": "https://dbeaver.io/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "dbeaver"
    ],
    "icon_img": "assets/img/apps/dbeaver.png"
  },
  {
    "id": "notepadpp",
    "name": "Notepad++",
    "en": "Don Ho",
    "icon": "📄",
    "color": "#90b44b",
    "category": "dev",
    "tags": [
      "编辑器",
      "开源",
      "轻量"
    ],
    "desc": "老牌轻量文本编辑器，语法高亮覆盖上百种语言，开大文件不卡，装机常备。",
    "version": "8.7",
    "size": "约 5 MB",
    "updated": "2026-09",
    "rating": 4.7,
    "downloads": "1亿+",
    "download_url": "https://notepad-plus-plus.org/downloads/",
    "website": "https://notepad-plus-plus.org/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "notepad++"
    ],
    "icon_img": "assets/img/apps/notepadpp.png"
  },
  {
    "id": "sublime",
    "name": "Sublime Text",
    "en": "Sublime HQ",
    "icon": "🍊",
    "color": "#ff9800",
    "category": "dev",
    "tags": [
      "编辑器",
      "轻量",
      "高速"
    ],
    "desc": "以快著称的代码编辑器，秒开百万行文件，多光标与命令面板操作顺手。",
    "version": "4.0",
    "size": "约 20 MB",
    "updated": "2026-08",
    "rating": 4.6,
    "downloads": "2000万+",
    "download_url": "https://www.sublimetext.com/download",
    "website": "https://www.sublimetext.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "sublime text"
    ],
    "icon_img": "assets/img/apps/sublime.png"
  },
  {
    "id": "githubdesktop",
    "name": "GitHub Desktop",
    "en": "GitHub",
    "icon": "🐙",
    "color": "#24292e",
    "category": "dev",
    "tags": [
      "Git",
      "图形界面",
      "免费"
    ],
    "desc": "GitHub 官方 Git 客户端，图形化提交、分支与冲突解决，不想背命令行就用它。",
    "version": "3.4",
    "size": "约 150 MB",
    "updated": "2026-10",
    "rating": 4.5,
    "downloads": "1000万+",
    "download_url": "https://desktop.github.com/download/",
    "website": "https://desktop.github.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "github desktop"
    ],
    "icon_img": "assets/img/apps/githubdesktop.png"
  },
  {
    "id": "sourcetree",
    "name": "Sourcetree",
    "en": "Atlassian",
    "icon": "🌳",
    "color": "#0052cc",
    "category": "dev",
    "tags": [
      "Git",
      "图形界面",
      "免费"
    ],
    "desc": "Atlassian 免费 Git 图形客户端，分支树状图直观，仓库管理与冲突处理清晰。",
    "version": "3.4",
    "size": "约 120 MB",
    "updated": "2026-09",
    "rating": 4.4,
    "downloads": "500万+",
    "download_url": "https://www.sourcetreeapp.com/",
    "website": "https://www.sourcetreeapp.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "sourcetree"
    ],
    "icon_img": "assets/img/apps/sourcetree.png"
  },
  {
    "id": "arduino",
    "name": "Arduino IDE",
    "en": "Arduino",
    "icon": "🔧",
    "color": "#00979d",
    "category": "dev",
    "tags": [
      "硬件",
      "单片机",
      "开源"
    ],
    "desc": "单片机开发官方环境，写代码烧进开发板，电子制作与创客课程入门标配。",
    "version": "2.3",
    "size": "约 180 MB",
    "updated": "2026-09",
    "rating": 4.6,
    "downloads": "3000万+",
    "download_url": "https://www.arduino.cc/en/software",
    "website": "https://www.arduino.cc/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "arduino ide",
      "arduino"
    ],
    "icon_img": "assets/img/apps/arduino.png"
  },
  {
    "id": "unity",
    "name": "Unity Hub",
    "en": "Unity",
    "icon": "🎮",
    "color": "#000000",
    "category": "dev",
    "tags": [
      "游戏引擎",
      "3D",
      "游戏开发"
    ],
    "desc": "主流游戏引擎的管理器，装引擎版本、建项目、管授权都从这里开始。",
    "version": "3.13",
    "size": "约 130 MB",
    "updated": "2026-10",
    "rating": 4.5,
    "downloads": "2000万+",
    "download_url": "https://unity.com/zh-cn/download",
    "website": "https://unity.com/zh-cn/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "unity hub",
      "unity "
    ],
    "icon_img": "assets/img/apps/unity.png"
  },
  {
    "id": "docker",
    "name": "Docker Desktop",
    "en": "Docker",
    "icon": "🐳",
    "color": "#2496ed",
    "category": "dev",
    "tags": [
      "容器",
      "环境隔离",
      "部署"
    ],
    "desc": "容器化运行环境，一条命令拉起数据库和中间件，开发环境与线上保持一致。",
    "version": "4.35",
    "size": "约 550 MB",
    "updated": "2026-10",
    "rating": 4.5,
    "downloads": "2000万+",
    "download_url": "https://www.docker.com/products/docker-desktop/",
    "website": "https://www.docker.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "docker desktop"
    ],
    "icon_img": "assets/img/apps/docker.png"
  },
  {
    "id": "codeblocks",
    "name": "Code::Blocks",
    "en": "CodeBlocks",
    "icon": "🧱",
    "color": "#1a6fb5",
    "category": "dev",
    "tags": [
      "IDE",
      "C/C++",
      "开源"
    ],
    "desc": "开源轻量 C/C++ 开发环境，体积小、配置简单，学校机房与教学常用。",
    "version": "20.03",
    "size": "约 100 MB",
    "updated": "2026-07",
    "rating": 4.4,
    "downloads": "2000万+",
    "download_url": "https://www.codeblocks.org/downloads/binaries/",
    "website": "https://www.codeblocks.org/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "code::blocks"
    ],
    "icon_img": "assets/img/apps/codeblocks.png"
  },
  {
    "id": "miniconda",
    "name": "Miniconda",
    "en": "Anaconda",
    "icon": "🅜",
    "color": "#44a340",
    "category": "dev",
    "tags": [
      "Python",
      "环境管理",
      "数据科学"
    ],
    "desc": "精简版 conda，只带 Python 与包管理器，多版本环境隔离，不占空间。",
    "version": "25.9",
    "size": "约 90 MB",
    "updated": "2026-10",
    "rating": 4.6,
    "downloads": "5000万+",
    "download_url": "https://docs.conda.io/projects/miniconda/en/latest/",
    "website": "https://www.anaconda.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "miniconda"
    ],
    "icon_img": "assets/img/apps/miniconda.png"
  },
  {
    "id": "msys2",
    "name": "MSYS2",
    "en": "MSYS2",
    "icon": "⚙️",
    "color": "#7b3f00",
    "category": "dev",
    "tags": [
      "工具链",
      "GCC",
      "命令行"
    ],
    "desc": "Windows 上的类 Unix 开发环境，pacman 装 GCC、CMake、OpenSSL，编译原生项目省事。",
    "version": "2026.10",
    "size": "约 100 MB",
    "updated": "2026-10",
    "rating": 4.4,
    "downloads": "500万+",
    "download_url": "https://www.msys2.org/",
    "website": "https://www.msys2.org/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "msys2"
    ],
    "icon_img": "assets/img/apps/msys2.png"
  },
  {
    "id": "mobaxterm",
    "name": "MobaXterm",
    "en": "Mobatek",
    "icon": "🖥️",
    "color": "#0d47a1",
    "category": "dev",
    "tags": [
      "SSH",
      "终端",
      "运维"
    ],
    "desc": "Windows 上最顺手的 SSH 终端，自带 X11 转发、SFTP 面板与多标签会话。",
    "version": "25.2",
    "size": "约 30 MB",
    "updated": "2026-09",
    "rating": 4.7,
    "downloads": "2000万+",
    "download_url": "https://mobaxterm.mobatek.net/download.html",
    "website": "https://mobaxterm.mobatek.net/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "mobaxterm"
    ],
    "icon_img": "assets/img/apps/mobaxterm.png"
  },
  {
    "id": "winscp",
    "name": "WinSCP",
    "en": "Martin Přikryl",
    "icon": "📡",
    "color": "#2e7d32",
    "category": "dev",
    "tags": [
      "SFTP",
      "文件传输",
      "开源"
    ],
    "desc": "开源 SFTP/FTP 客户端，拖拽传文件、同步目录、内置编辑器，服务器传文件首选。",
    "version": "6.3",
    "size": "约 12 MB",
    "updated": "2026-09",
    "rating": 4.7,
    "downloads": "5000万+",
    "download_url": "https://winscp.net/eng/download.php",
    "website": "https://winscp.net/eng/index.php",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "winscp"
    ],
    "icon_img": "assets/img/apps/winscp.png"
  },
  {
    "id": "postman",
    "name": "Postman",
    "en": "Postman",
    "icon": "📮",
    "color": "#ff6c37",
    "category": "dev",
    "tags": [
      "接口",
      "调试",
      "API"
    ],
    "desc": "老牌 API 调试工具，请求构造、环境变量、集合测试与 Mock 齐全。",
    "version": "11.2",
    "size": "约 200 MB",
    "updated": "2026-10",
    "rating": 4.5,
    "downloads": "3000万+",
    "download_url": "https://www.postman.com/downloads/",
    "website": "https://www.postman.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "postman"
    ],
    "icon_img": "assets/img/apps/postman.png"
  },
  {
    "id": "todesk",
    "name": "ToDesk",
    "en": "ToDesk",
    "icon": "🖥️",
    "color": "#1e88e5",
    "category": "assistant",
    "tags": [
      "远程控制",
      "国产"
    ],
    "desc": "国产远程控制软件，连接稳定速度快，跨平台远控、文件传输与隐私屏完善。",
    "version": "4.7",
    "size": "约 90 MB",
    "updated": "2026-10",
    "rating": 4.7,
    "downloads": "1亿+",
    "download_url": "https://dl.todesk.com/ToDesk_Setup.exe",
    "website": "https://www.todesk.com/",
    "direct": true,
    "installer": {
      "type": "exe",
      "silent_args": "/S",
      "requires_admin": false
    },
    "web": false,
    "detect": [
      "todesk"
    ]
  },
  {
    "id": "sunlogin",
    "name": "向日葵远程控制",
    "en": "贝锐",
    "icon": "🌻",
    "color": "#ffa726",
    "category": "assistant",
    "tags": [
      "远程控制",
      "国产"
    ],
    "desc": "国产老牌远程控制软件，远程桌面、远程文件与开机棒硬件生态完整。",
    "version": "15.0",
    "size": "约 100 MB",
    "updated": "2026-09",
    "rating": 4.5,
    "downloads": "8000万+",
    "download_url": "https://sunlogin.oray.com/",
    "website": "https://sunlogin.oray.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "向日葵",
      "sunlogin"
    ],
    "icon_img": "assets/img/apps/sunlogin.png"
  },
  {
    "id": "zmzl",
    "name": "腾讯桌面整理",
    "en": "腾讯",
    "icon": "🗂️",
    "color": "#00a8ff",
    "category": "assistant",
    "tags": [
      "桌面整理",
      "国产"
    ],
    "desc": "腾讯出品桌面整理工具，一键归纳桌面图标、磁盘映射与最近文件，清爽高效。",
    "version": "3.3",
    "size": "约 40 MB",
    "updated": "2026-07",
    "rating": 4.6,
    "downloads": "5000万+",
    "download_url": "https://guanjia.qq.com/product/zmzl/",
    "website": "https://guanjia.qq.com/product/zmzl/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "腾讯桌面整理"
    ]
  },
  {
    "id": "bizhi360",
    "name": "小鸟壁纸",
    "en": "360",
    "icon": "🐦",
    "color": "#00b4d8",
    "category": "desktop",
    "tags": [
      "壁纸",
      "国产"
    ],
    "desc": "360 出品壁纸软件，海量高清动态与静态壁纸，自动换壁纸与多屏适配。",
    "version": "3.1",
    "size": "约 60 MB",
    "updated": "2026-08",
    "rating": 4.4,
    "downloads": "1亿+",
    "download_url": "https://bizhi.360.cn/",
    "website": "https://bizhi.360.cn/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "小鸟壁纸",
      "360壁纸"
    ]
  },
  {
    "id": "huoying",
    "name": "火萤视频桌面",
    "en": "火萤",
    "icon": "🔥",
    "color": "#ff7043",
    "category": "desktop",
    "tags": [
      "动态壁纸",
      "国产"
    ],
    "desc": "老牌动态视频壁纸软件，视频壁纸、桌面时钟与来电视频，资源风格多样。",
    "version": "5.2",
    "size": "约 80 MB",
    "updated": "2026-06",
    "rating": 4.3,
    "downloads": "5000万+",
    "download_url": "https://www.huoying.tv/",
    "website": "https://www.huoying.tv/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "火萤"
    ]
  },
  {
    "id": "wegame",
    "name": "WeGame",
    "en": "腾讯",
    "icon": "🎮",
    "color": "#f29800",
    "category": "game",
    "tags": [
      "游戏平台",
      "国产"
    ],
    "desc": "腾讯游戏平台，LOL、无畏契约、DNF 等海量游戏下载管理与攻略社区一体。",
    "version": "5.12",
    "size": "约 200 MB",
    "updated": "2026-11",
    "rating": 4.6,
    "downloads": "3亿+",
    "download_url": "https://www.wegame.com.cn/",
    "website": "https://www.wegame.com.cn/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "wegame"
    ],
    "icon_img": "assets/img/apps/wegame.png"
  },
  {
    "id": "lol",
    "name": "英雄联盟",
    "en": "腾讯",
    "icon": "⚔️",
    "color": "#c8a951",
    "category": "game",
    "tags": [
      "MOBA",
      "竞技",
      "国产"
    ],
    "desc": "腾讯代理的 5V5 MOBA 竞技游戏，排位赛、大乱斗与职业赛事生态完整。",
    "version": "14.22",
    "size": "约 30 GB",
    "updated": "2026-11",
    "rating": 4.8,
    "downloads": "10亿+",
    "download_url": "https://lol.qq.com/download.shtml",
    "website": "https://lol.qq.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "英雄联盟",
      "league of legends"
    ],
    "icon_img": "assets/img/apps/lol.png"
  },
  {
    "id": "cf",
    "name": "穿越火线",
    "en": "腾讯",
    "icon": "🔫",
    "color": "#ff7043",
    "category": "game",
    "tags": [
      "FPS",
      "射击",
      "国产"
    ],
    "desc": "腾讯第一人称射击游戏，爆破、生化、挑战等经典玩法，配置要求低。",
    "version": "1.0.9",
    "size": "约 12 GB",
    "updated": "2026-11",
    "rating": 4.5,
    "downloads": "6亿+",
    "download_url": "https://cf.qq.com/download.shtml",
    "website": "https://cf.qq.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "穿越火线",
      "crossfire"
    ],
    "icon_img": "assets/img/apps/cf.png"
  },
  {
    "id": "dnf",
    "name": "地下城与勇士",
    "en": "腾讯",
    "icon": "🗡️",
    "color": "#ffb74d",
    "category": "game",
    "tags": [
      "横版",
      "动作",
      "国产"
    ],
    "desc": "腾讯代理的横版格斗网游，转职养成与深渊刷图，搬砖党的老本行。",
    "version": "35.0",
    "size": "约 20 GB",
    "updated": "2026-11",
    "rating": 4.4,
    "downloads": "5亿+",
    "download_url": "https://dnf.qq.com/download.shtml",
    "website": "https://dnf.qq.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "地下城与勇士",
      "dnf"
    ],
    "icon_img": "assets/img/apps/dnf.png"
  },
  {
    "id": "valorant",
    "name": "无畏契约",
    "en": "腾讯",
    "icon": "🎯",
    "color": "#ff5252",
    "category": "game",
    "tags": [
      "FPS",
      "战术射击",
      "国产"
    ],
    "desc": "拳头开发的 5V5 战术射击游戏，技能与枪法结合，国服由腾讯运营。",
    "version": "9.10",
    "size": "约 30 GB",
    "updated": "2026-11",
    "rating": 4.7,
    "downloads": "2亿+",
    "download_url": "https://val.qq.com/download.html",
    "website": "https://val.qq.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "无畏契约",
      "valorant"
    ],
    "icon_img": "assets/img/apps/valorant.png"
  },
  {
    "id": "df",
    "name": "三角洲行动",
    "en": "腾讯",
    "icon": "🪖",
    "color": "#8d6e63",
    "category": "game",
    "tags": [
      "FPS",
      "射击",
      "国产"
    ],
    "desc": "腾讯天美射击新作，大战场载具作战与摸金撤离双模式，PC 与手游互通。",
    "version": "1.6",
    "size": "约 60 GB",
    "updated": "2026-11",
    "rating": 4.6,
    "downloads": "1亿+",
    "download_url": "https://df.qq.com/download.shtml",
    "website": "https://df.qq.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "三角洲行动",
      "delta force"
    ],
    "icon_img": "assets/img/apps/df.png"
  },
  {
    "id": "qqgame",
    "name": "QQ游戏大厅",
    "en": "腾讯",
    "icon": "🀄",
    "color": "#4caf50",
    "category": "game",
    "tags": [
      "棋牌",
      "休闲",
      "国产"
    ],
    "desc": "腾讯棋牌休闲游戏平台，斗地主、麻将、升级等经典玩法，体积小开箱即玩。",
    "version": "8.9",
    "size": "约 80 MB",
    "updated": "2026-11",
    "rating": 4.3,
    "downloads": "8亿+",
    "download_url": "https://qqgame.qq.com/download.shtml",
    "website": "https://qqgame.qq.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "qq游戏",
      "qqgame"
    ],
    "icon_img": "assets/img/apps/qqgame.png"
  },
  {
    "id": "watt",
    "name": "Watt Toolkit",
    "en": "BeyondDimension",
    "icon": "🪄",
    "color": "#6f4ef2",
    "category": "magic",
    "tags": [
      "加速",
      "GitHub",
      "Steam",
      "开源",
      "国产"
    ],
    "desc": "原名 Steam++，本地反代加速 Steam / GitHub / 微软商店，内置 hosts 编辑与脚本引擎，国内加速最稳的一款。",
    "version": "3.0.0",
    "size": "约 90 MB",
    "updated": "2026-11",
    "rating": 4.8,
    "downloads": "3000万+",
    "download_url": "https://steampp.net/",
    "website": "https://steampp.net/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "watt toolkit",
      "steam++"
    ],
    "icon_img": "assets/img/apps/watt.png"
  },
  {
    "id": "uu",
    "name": "网易UU加速器",
    "en": "网易",
    "icon": "🚀",
    "color": "#ff5a3c",
    "category": "magic",
    "tags": [
      "游戏加速",
      "网游",
      "国产"
    ],
    "desc": "网易出品的游戏加速器，覆盖 LOL、DNF、原神、Steam 等上千款游戏，会员制但免费游戏也有额度。",
    "version": "10.8",
    "size": "约 120 MB",
    "updated": "2026-11",
    "rating": 4.6,
    "downloads": "2亿+",
    "download_url": "https://uu.163.com/",
    "website": "https://uu.163.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "uu加速器",
      "网易uu"
    ],
    "icon_img": "assets/img/apps/uu.png"
  },
  {
    "id": "xunyou",
    "name": "迅游加速器",
    "en": "迅游",
    "icon": "🌩️",
    "color": "#ff9800",
    "category": "magic",
    "tags": [
      "游戏加速",
      "网游",
      "国产"
    ],
    "desc": "老牌游戏加速器，主打国服外服互转与低延迟线路，支持主机与手游加速盒子。",
    "version": "7.2",
    "size": "约 100 MB",
    "updated": "2026-11",
    "rating": 4.4,
    "downloads": "1亿+",
    "download_url": "https://www.xunyou.com/",
    "website": "https://www.xunyou.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "迅游"
    ],
    "icon_img": "assets/img/apps/xunyou.png"
  },
  {
    "id": "fastgithub",
    "name": "FastGithub",
    "en": "dotnetcore",
    "icon": "⚡",
    "color": "#2196f3",
    "category": "magic",
    "tags": [
      "加速",
      "GitHub",
      "开源",
      "国产"
    ],
    "desc": "把 GitHub 的 clone、release、raw 请求自动改写到可用 IP 的本地服务，装完开箱即用，无需配置。",
    "version": "2.1.6",
    "size": "约 60 MB",
    "updated": "2026-11",
    "rating": 4.5,
    "downloads": "100万+",
    "download_url": "https://github.com/dotnetcore/FastGithub/releases",
    "website": "https://github.com/dotnetcore/FastGithub",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "fastgithub"
    ],
    "icon_img": "assets/img/apps/fastgithub.png"
  },
  {
    "id": "switchhosts",
    "name": "SwitchHosts",
    "en": "oldj",
    "icon": "🧭",
    "color": "#3f51b5",
    "category": "magic",
    "tags": [
      "hosts",
      "网络调试",
      "开源",
      "国产"
    ],
    "desc": "多套 hosts 方案一键切换，支持远程订阅与定时同步，改完立刻生效不用重启。",
    "version": "4.2.0",
    "size": "约 90 MB",
    "updated": "2026-11",
    "rating": 4.6,
    "downloads": "300万+",
    "download_url": "https://github.com/oldj/SwitchHosts/releases",
    "website": "https://switchhosts.vercel.app/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "switchhosts"
    ],
    "icon_img": "assets/img/apps/switchhosts.png"
  },
  {
    "id": "v2rayn",
    "name": "v2rayN",
    "en": "2dust",
    "icon": "🔷",
    "color": "#3b82f6",
    "category": "magic",
    "tags": [
      "代理",
      "VMess",
      "VLESS",
      "开源",
      "国产"
    ],
    "desc": "Windows 上用户量最大的代理客户端，支持 VMess / VLESS / Trojan / Shadowsocks 全协议，订阅导入即用。",
    "version": "7.10",
    "size": "约 120 MB",
    "updated": "2026-11",
    "rating": 4.8,
    "downloads": "5000万+",
    "download_url": "https://github.com/2dust/v2rayN/releases",
    "website": "https://github.com/2dust/v2rayN",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "v2rayn",
      "v2ray"
    ],
    "icon_img": "assets/img/apps/v2rayn.png"
  },
  {
    "id": "clashverge",
    "name": "Clash Verge Rev",
    "en": "clash-verge-rev",
    "icon": "🐱",
    "color": "#5b8def",
    "category": "magic",
    "tags": [
      "代理",
      "Clash",
      "规则分流",
      "开源"
    ],
    "desc": "Clash Verge 的社区续作，内核与界面分离，支持规则分流、TUN 全局代理与订阅自动更新。",
    "version": "2.3.2",
    "size": "约 110 MB",
    "updated": "2026-11",
    "rating": 4.8,
    "downloads": "2000万+",
    "download_url": "https://github.com/clash-verge-rev/clash-verge-rev/releases",
    "website": "https://github.com/clash-verge-rev/clash-verge-rev",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "clash verge",
      "clashverge"
    ],
    "icon_img": "assets/img/apps/clashverge.png"
  },
  {
    "id": "nekoray",
    "name": "NekoRay",
    "en": "MatsuriDayo",
    "icon": "🍊",
    "color": "#ff8a65",
    "category": "magic",
    "tags": [
      "代理",
      "sing-box",
      "Xray",
      "开源"
    ],
    "desc": "基于 sing-box / Xray 的跨平台客户端，界面简单，支持 TUN 模式与多协议出站。",
    "version": "4.0",
    "size": "约 100 MB",
    "updated": "2026-11",
    "rating": 4.5,
    "downloads": "800万+",
    "download_url": "https://github.com/MatsuriDayo/nekoray/releases",
    "website": "https://github.com/MatsuriDayo/nekoray",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "nekoray"
    ],
    "icon_img": "assets/img/apps/nekoray.png"
  },
  {
    "id": "hiddify",
    "name": "Hiddify",
    "en": "Hiddify",
    "icon": "🛡️",
    "color": "#2f80ed",
    "category": "magic",
    "tags": [
      "代理",
      "sing-box",
      "跨境",
      "开源"
    ],
    "desc": "多平台统一客户端，兼容 V2Ray / Clash / sing-box 订阅链接，一条链接自动识别协议。",
    "version": "2.5.7",
    "size": "约 90 MB",
    "updated": "2026-11",
    "rating": 4.4,
    "downloads": "600万+",
    "download_url": "https://github.com/hiddify/hiddify-app/releases",
    "website": "https://hiddify.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "hiddify"
    ],
    "icon_img": "assets/img/apps/hiddify.png"
  },
  {
    "id": "proxifier",
    "name": "Proxifier",
    "en": "Initex",
    "icon": "🔀",
    "color": "#455a64",
    "category": "magic",
    "tags": [
      "代理",
      "强制转发",
      "商业"
    ],
    "desc": "让不支持代理的程序也走代理，按进程、IP、端口设规则，游戏、终端、老软件都能被接管。",
    "version": "4.16",
    "size": "约 15 MB",
    "updated": "2026-11",
    "rating": 4.6,
    "downloads": "2000万+",
    "download_url": "https://www.proxifier.com/download/",
    "website": "https://www.proxifier.com/",
    "direct": false,
    "installer": {
      "type": "exe",
      "silent_args": ""
    },
    "web": false,
    "detect": [
      "proxifier"
    ],
    "icon_img": "assets/img/apps/proxifier.png"
  }
];
