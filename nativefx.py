# -*- coding: utf-8 -*-
"""老朱应用商店 - 原生桌面效果：系统托盘、气球通知、任务栏进度条、提示音。

- 托盘：NotifyIcon（pythonnet/System.Windows.Forms），关窗缩托盘，双击/菜单恢复
- 通知：NotifyIcon.ShowBalloonTip（Win10/11 以 toast 形式弹出）
- 任务栏进度：ITaskbarList3 COM（ctypes 直连 vtable，无 comtypes 依赖）
- 提示音：winsound.MessageBeep，成功 MB_ICONASTERISK（叮咚），失败 MB_ICONHAND（低沉咚）
"""
import ctypes
import os
import sys
from ctypes import wintypes

_ole32 = ctypes.windll.ole32
_u32 = ctypes.windll.user32

# ---------------------------------------------------------------- 提示音
def sound_ok():
    """安装成功：叮咚。"""
    try:
        import winsound
        winsound.MessageBeep(winsound.MB_ICONASTERISK)
    except Exception:
        pass

def sound_fail():
    """安装失败：低沉的咚。"""
    try:
        import winsound
        winsound.MessageBeep(winsound.MB_ICONHAND)
    except Exception:
        pass

# ---------------------------------------------------------------- 任务栏进度条
class _GUID(ctypes.Structure):
    _fields_ = [("Data1", wintypes.ULONG), ("Data2", wintypes.USHORT),
                ("Data3", wintypes.USHORT), ("Data4", wintypes.BYTE * 8)]

def _guid(s):
    a, b, c, d1, d2 = s.split("-")
    g = _GUID()
    g.Data1 = int(a, 16); g.Data2 = int(b, 16); g.Data3 = int(c, 16)
    raw = bytes.fromhex(d1 + d2)  # Data4 = 8 字节（4+12 位十六进制）
    for i in range(8):
        g.Data4[i] = raw[i]
    return g

CLSID_TaskbarList = _guid("56FDF344-FD6D-11D0-958A-006097C9A090")
IID_ITaskbarList3 = _guid("EA1AFB91-9E28-4B86-90E9-9E9F8A5EEFAF")

TBPF_NOPROGRESS = 0
TBPF_INDETERMINATE = 1
TBPF_NORMAL = 2
TBPF_ERROR = 4
TBPF_PAUSED = 8

_HrInit = ctypes.WINFUNCTYPE(ctypes.HRESULT)
_ProtoSetVal = ctypes.WINFUNCTYPE(ctypes.HRESULT, wintypes.HWND,
                                  ctypes.c_ulonglong, ctypes.c_ulonglong)
_ProtoSetState = ctypes.WINFUNCTYPE(ctypes.HRESULT, wintypes.HWND, wintypes.DWORD)

_tbl = None       # ITaskbarList3 接口指针
_tbl_hwnd = 0


def _get_tbl():
    global _tbl
    if _tbl is not None:
        return _tbl
    try:
        _ole32.CoInitializeEx(None, 0)  # COINIT_APARTMENTTHREADED
    except Exception:
        pass
    ppv = ctypes.c_void_p()
    hr = _ole32.CoCreateInstance(ctypes.byref(CLSID_TaskbarList), None, 1,
                                 ctypes.byref(IID_ITaskbarList3),
                                 ctypes.byref(ppv))
    if hr != 0 or not ppv:
        return None
    _tbl = ppv
    return ppv


def _vtbl_call(proto, index, *args):
    ppv = _get_tbl()
    if not ppv:
        return
    try:
        vt = ctypes.cast(ppv, ctypes.POINTER(ctypes.c_void_p))[0]
        fn = ctypes.cast(vt + index * ctypes.sizeof(ctypes.c_void_p),
                         ctypes.POINTER(proto))[0]
        fn(*args)
    except Exception:
        pass


def taskbar_init(hwnd):
    """绑定窗口并 HrInit，之后才能用进度接口。"""
    global _tbl_hwnd
    _tbl_hwnd = hwnd
    _vtbl_call(_HrInit, 3)


def taskbar_progress(completed, total):
    """设置进度值（0..total）。"""
    if _tbl_hwnd:
        _vtbl_call(_ProtoSetVal, 9, _tbl_hwnd, int(completed), int(total))


def taskbar_state(flag):
    """TBPF_*：NORMAL/INDETERMINATE/ERROR/NOPROGRESS…"""
    if _tbl_hwnd:
        _vtbl_call(_ProtoSetState, 10, _tbl_hwnd, int(flag))


def taskbar_clear():
    taskbar_state(TBPF_NOPROGRESS)

# ---------------------------------------------------------------- 托盘 + 通知
_tray = None
_show_cb = None
_quit_cb = None


def _icon_path():
    """托盘/通知图标：打包后取 exe 自身图标，脚本态取 assets 图标。"""
    if getattr(sys, "frozen", False):
        return sys.executable
    base = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base, "assets", "img", "icon.ico")


def init_tray(title, on_show, on_quit):
    """在独立 STA 线程创建 NotifyIcon（阻塞式消息循环）。

    on_show: 托盘双击/菜单“打开”时回调（显示主窗口）
    on_quit: 菜单“退出”时回调（真正退出进程）
    """
    global _show_cb, _quit_cb
    _show_cb = on_show
    _quit_cb = on_quit

    def run():
        global _tray
        try:
            import clr  # pythonnet：pywebview winforms 后端已加载
            from System.Windows.Forms import (NotifyIcon, ContextMenuStrip,
                                              ToolStripMenuItem, Application,
                                              ApplicationContext, ToolTipIcon)
            from System.Drawing import Icon

            ico = Icon.ExtractAssociatedIcon(_icon_path())
            ni = NotifyIcon()
            ni.Icon = ico
            ni.Text = title
            ni.Visible = True

            menu = ContextMenuStrip()
            mi_show = ToolStripMenuItem("打开老朱应用商店")
            mi_quit = ToolStripMenuItem("退出")

            def do_show(s, e):
                try:
                    if _show_cb:
                        _show_cb()
                except Exception:
                    pass

            def do_quit(s, e):
                try:
                    ni.Visible = False
                    ni.Dispose()
                except Exception:
                    pass
                try:
                    if _quit_cb:
                        _quit_cb()
                except Exception:
                    pass

            mi_show.Click += do_show
            mi_quit.Click += do_quit
            menu.Items.Add(mi_show)
            menu.Items.Add(mi_quit)
            ni.ContextMenuStrip = menu
            ni.DoubleClick += do_show

            _tray = (ni, menu, ToolTipIcon)
            Application.Run(ApplicationContext())  # 消息循环（隐藏窗体应用）
        except Exception:
            _tray = None

    # WinForms 组件必须在 STA 线程：用 .NET 线程并显式指定单元状态
    from System.Threading import Thread, ThreadStart, ApartmentState
    th = Thread(ThreadStart(run))
    th.SetApartmentState(ApartmentState.STA)
    th.IsBackground = True
    th.Start()
    return th


def notify(title, msg, error=False):
    """Windows 通知（气球/toast）。error=True 用错误图标。"""
    if not _tray:
        return
    try:
        ni, menu, ToolTipIcon = _tray
        icon = ToolTipIcon.Error if error else ToolTipIcon.Info
        ni.ShowBalloonTip(5000, title, msg, icon)
    except Exception:
        pass

# ---------------------------------------------------------------- 窗口显隐
def hide_window(hwnd):
    _u32.ShowWindow(hwnd, 0)  # SW_HIDE


def show_window(hwnd):
    _u32.ShowWindow(hwnd, 5)            # SW_SHOW
    _u32.BringWindowToTop(hwnd)
    _u32.SetForegroundWindow(hwnd)
