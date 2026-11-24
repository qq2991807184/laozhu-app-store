# -*- coding: utf-8 -*-
"""无边框窗口修复（针对 pywebview winforms 的窗口行为缺陷）：

1) 边缘拉伸失效 —— frameless 只是 FormBorderStyle=None。更关键的是：纯 popup
   样式下即使 WM_NCHITTEST 返回 HTLEFT/HTRIGHT 等值，系统也不会进入缩放
   模态循环（启动缩放的窗口必须带 WS_THICKFRAME）。
   解法：补回 WS_THICKFRAME | WS_CAPTION | WS_MAXIMIZEBOX（全部不可见）
   + 钩 WM_NCCALCSIZE：普通状态返回 0（隐形边框/标题栏并入客户区，
   外观仍是零边框纯客户区），边缘拉伸由系统接管。
2) 最大化遮任务栏 —— 无边框窗口客户区默认铺满全屏。补回 WS_THICKFRAME 后
   最大化窗口矩形又被系统外扩到工作区±隐形边框（所有 thick-frame 窗口皆然，
   普通应用靠默认 NCCALCSIZE 内缩客户区来回避）。
   解法：WM_NCCALCSIZE 在 IsZoomed 时把客户区设为工作区矩形，
   可见区域即不遮任务栏；同时 WM_GETMINMAXINFO 限定最大化边界为工作区。
3) 最大化还原吞尺寸 —— 普通状态 NCCALCSIZE 返回 0 已让外观=客户区，
   还原时无差值可吞；WM_SIZE 里仍保留还原重校兜底。

注意：SetWindowLongPtrW/CallWindowProcW 必须用 64 位指针版本，WndProc 地址是
64 位指针，用 SetWindowLongW(c_int) 会截断。
"""
import ctypes
import os
import tempfile
import threading
import time
from ctypes import wintypes

u32 = ctypes.windll.user32
msimg32 = ctypes.windll.msimg32

GWL_STYLE = -16
GWL_WNDPROC = -4
WM_GETMINMAXINFO = 0x0024
WM_SIZE = 0x0005
WM_ACTIVATE = 0x0006
WM_NCHITTEST = 0x0084
WM_NCCALCSIZE = 0x0083
WM_NCPAINT = 0x0085
WM_NCACTIVATE = 0x0086
WM_NCLBUTTONDOWN = 0x00A1
WM_NCLBUTTONDBLCLK = 0x00A3
WM_MOUSEMOVE = 0x0200
WM_LBUTTONUP = 0x0202
WM_CAPTURECHANGED = 0x0215
WM_WINDOWPOSCHANGING = 0x0046   # 注意：0x46 是 CHANGING，0x47 才是 CHANGED
WM_WINDOWPOSCHANGED = 0x0047
GCLP_HBRBACKGROUND = -10
SPI_GETWORKAREA = 0x0030
SWP_NOZORDER = 0x0004
SWP_NOSIZE = 0x0001
SWP_FRAMECHANGED = 0x0020
SIZE_RESTORED = 0
SIZE_MINIMIZED = 1
SIZE_MAXIMIZED = 2
HTCLIENT = 1
HTLEFT = 10
HTRIGHT = 11
HTTOP = 12
HTTOPLEFT = 13
HTTOPRIGHT = 14
HTBOTTOM = 15
HTBOTTOMLEFT = 16
HTBOTTOMRIGHT = 17

# 拉伸样式（仅取系统行为，肉眼不可见：NCCALCSIZE 返回 0 后无可见非客户区）
WS_THICKFRAME = 0x00040000
WS_CAPTION = 0x00C00000
WS_MAXIMIZEBOX = 0x00010000
RESIZE_STYLES = WS_THICKFRAME | WS_CAPTION | WS_MAXIMIZEBOX

# MINMAXINFO 偏移（Win32, POINT=8 字节）：ptMaxSize@8, ptMaxPosition@16
_OFF_MAX_SIZE = 8
_OFF_MAX_POS = 16

# 拉伸命中边宽：SM_CXFRAME(32) + SM_CXPADDEDBORDER(92)，DPI 96 下典型值 12
BORDER = u32.GetSystemMetrics(32) + u32.GetSystemMetrics(92)

# 顶部非客户区高度。固定 0：不保留任何隐形边框环。
TOP_INSET = 0

# 左右下隐形边框环宽度。固定 0：客户区 = 整个窗口矩形。
# 原因：DWM 合成下顶层窗口的非客户区由系统绘制（类背景刷/主题边框），
# 往 GetWindowDC 上用 GDI 刷什么颜色都不会进入最终画面，留多宽就露多宽
# 的白边/黑边。边缘拉伸改由页面边缘按下 + 光标轮询驱动（见 store_api）。
SIDE_INSET = 0

# 单实例唤醒消息：第二个进程发现已有实例时 PostMessage 这条消息，
# 由已有实例自己在 UI 线程里 restore + 前置，避免第二个进程直接操作别人的窗口。
ACTIVATE_MSG = u32.RegisterWindowMessageW("LaoZhuStore-Activate-9F3A")
_activate_cb = None


def set_activate_handler(fn):
    """注册「被第二个实例唤醒」时的回调（在 WndProc 内触发，回调需自行异步）。"""
    global _activate_cb
    _activate_cb = fn

_CallWindowProc = u32.CallWindowProcW
_CallWindowProc.argtypes = [ctypes.c_void_p, wintypes.HWND, wintypes.UINT,
                            wintypes.WPARAM, wintypes.LPARAM]
_CallWindowProc.restype = ctypes.c_long

_SetWindowLongPtr = u32.SetWindowLongPtrW
_SetWindowLongPtr.argtypes = [wintypes.HWND, ctypes.c_int, ctypes.c_void_p]
_SetWindowLongPtr.restype = ctypes.c_void_p

_GetWindowLongPtr = u32.GetWindowLongPtrW
_GetWindowLongPtr.argtypes = [wintypes.HWND, ctypes.c_int]
_GetWindowLongPtr.restype = ctypes.c_void_p

_WNDPROC = ctypes.WINFUNCTYPE(ctypes.c_long, wintypes.HWND, wintypes.UINT,
                              wintypes.WPARAM, wintypes.LPARAM)

_orig_proc = None   # 原子 WndProc（c_void_p 地址值）
_hook_proc = None   # 回调引用必须常驻，防 GC 后崩溃
_target = None      # 期望客户区尺寸 (cw, ch)，最大化/最小化还原后强制重校
_was_max = False    # 上一个 WM_SIZE 是否为最大化态（区分“还原”与普通拖拽）
_was_min = False    # 是否刚经历最小化（再从最小化还原同样要重校）
_drag = None        # 手动拉伸状态 [hit, last_x, last_y]
_correcting = False # 还原重校线程是否在跑（防重入）
_guard_until = 0.0  # 还原守门期截止时间戳：期间强制窗口尺寸=目标值
_DEBUG = bool(os.environ.get("WINFIX_DEBUG"))
_DBG_FILE = os.path.join(tempfile.gettempdir(), "winfix_debug.log")

# 窗口最小尺寸（客户区 min_size + 隐形边框环）
MIN_W = 980 + 2 * SIDE_INSET
MIN_H = 640 + 2 * SIDE_INSET + TOP_INSET

_RESIZE_HITS = (HTLEFT, HTRIGHT, HTTOP, HTBOTTOM,
                HTTOPLEFT, HTTOPRIGHT, HTBOTTOMLEFT, HTBOTTOMRIGHT)

# 顶栏同色深蓝刷：客户区外那一圈隐形边框环（NC 区）默认被系统刷成
# 窗口类浅底色，窗口最顶部因此露出一条浅色边。NCPAINT 里手动刷深蓝。
#
# 环色必须和「紧邻它的页面颜色」完全一致，否则就是一条看得见的边框：
#   上 = 顶栏渐变起点（横向渐变，与 .topbar 的 100deg 渐变对齐）
#   左右下 = 页面底 bg（#f3f5f8）
_NC_TOP_LEFT = (0x0F, 0x1F, 0x3A)    # #0f1f3a
_NC_TOP_RIGHT = (0x24, 0x36, 0x5A)   # #24365a
_NC_SIDE = (0xF3, 0xF5, 0xF8)        # #f3f5f8

_NC_BRUSH = None
_CLASS_BRUSH = None


class _TRIVERTEX(ctypes.Structure):
    _fields_ = [("x", ctypes.c_long), ("y", ctypes.c_long),
                ("Red", ctypes.c_ushort), ("Green", ctypes.c_ushort),
                ("Blue", ctypes.c_ushort), ("Alpha", ctypes.c_ushort)]


class _GRADIENT_RECT(ctypes.Structure):
    _fields_ = [("UpperLeft", ctypes.c_ulong), ("LowerRight", ctypes.c_ulong)]


_GRADIENT_FILL_RECT_H = 0


def _rgb(c):
    return c[0] | (c[1] << 8) | (c[2] << 16)   # COLORREF: 0x00BBGGRR


def _nc_brush():
    """左右下三边的纯色刷（页面底色）。"""
    global _NC_BRUSH
    if _NC_BRUSH is None:
        _NC_BRUSH = ctypes.windll.gdi32.CreateSolidBrush(_rgb(_NC_SIDE))
    return _NC_BRUSH


def _ring_rects(hwnd):
    """返回 (上, 下, 左, 右) 四块环矩形 + 窗口尺寸，均为窗口相对坐标。"""
    rw = wintypes.RECT()
    u32.GetWindowRect(hwnd, ctypes.byref(rw))
    cr = wintypes.RECT()
    u32.GetClientRect(hwnd, ctypes.byref(cr))
    p = wintypes.POINT(0, 0)
    u32.ClientToScreen(hwnd, ctypes.byref(p))
    W, H = rw.right - rw.left, rw.bottom - rw.top
    cl, ct = p.x - rw.left, p.y - rw.top            # 客户区左上角（窗口相对）
    crr, cbb = cl + cr.right, ct + cr.bottom
    return (0, 0, W, ct), (0, cbb, W, H), (0, ct, cl, cbb), (crr, ct, W, cbb), W, ct


def _paint_nc_ring(hwnd):
    """只刷 NC 环（窗口矩形 - 客户区）四条边，不碰客户区内容。

    上边用与顶栏一致的横向渐变，其余三边用页面底色 —— 环和内容同色，
    视觉上等价于「窗口没有边框」。GetWindowDC 的坐标原点是窗口左上角。"""
    if u32.IsZoomed(hwnd) or u32.IsIconic(hwnd):
        return                       # 最大化没有可见环；最小化时没有可绘制的窗口面
    hdc = u32.GetWindowDC(hwnd)
    if not hdc:
        return
    gdi32 = ctypes.windll.gdi32
    try:
        top, bot, left, right, W, ct = _ring_rects(hwnd)
        brush = _nc_brush()
        for box in (bot, left, right):
            r = wintypes.RECT(*box)
            u32.FillRect(hdc, ctypes.byref(r), brush)
        if ct > 0:
            verts = (_TRIVERTEX * 2)()
            verts[0].x, verts[0].y = top[0], top[1]
            verts[0].Red, verts[0].Green, verts[0].Blue = (
                _NC_TOP_LEFT[0] << 8, _NC_TOP_LEFT[1] << 8, _NC_TOP_LEFT[2] << 8)
            verts[0].Alpha = 0
            verts[1].x, verts[1].y = top[2] - 1, top[3] - 1
            verts[1].Red, verts[1].Green, verts[1].Blue = (
                _NC_TOP_RIGHT[0] << 8, _NC_TOP_RIGHT[1] << 8, _NC_TOP_RIGHT[2] << 8)
            verts[1].Alpha = 0
            gr = _GRADIENT_RECT(0, 1)
            msimg32.GradientFill(hdc, verts, 2, ctypes.byref(gr), 1,
                                 _GRADIENT_FILL_RECT_H)
        # DC 回读自检：刚刷的颜色应能立即读回（WINFIX_DEBUG 时）
        if _DEBUG:
            _dbg("NCPAINT ring l=%d t=%d r=%d b=%d top(4,3)=#%06x left(3,%d)=#%06x" % (
                left[2], top[3], W - right[0], right[3],
                gdi32.GetPixel(hdc, 4, 3) & 0xFFFFFF,
                top[3] + 20, gdi32.GetPixel(hdc, 3, top[3] + 20) & 0xFFFFFF))
    finally:
        u32.ReleaseDC(hwnd, hdc)


def _dbg(msg):
    if not _DEBUG:
        return
    try:
        with open(_DBG_FILE, "a", encoding="utf-8") as f:
            f.write(msg + "\n")
    except Exception:
        pass


def _workarea():
    wa = wintypes.RECT()
    u32.SystemParametersInfoW(SPI_GETWORKAREA, 0, ctypes.byref(wa), 0)
    return wa


def _restore_corrector(hwnd, cw, ch):
    """还原后持续短校正：WinForms 还原重排会覆盖单次 SetWindowPos。

    实测重排未必紧跟还原消息（可能延后几百毫秒），单次 SetWindowPos 与
    固定 0.5s 窗口都不够。改为最长 2s 轮询：连续 3 次（约 180ms）采样
    都等于目标值才认为稳定，期间每次不符就拉回。"""
    global _correcting
    if _correcting:
        return
    _correcting = True

    def run():
        global _correcting
        try:
            streak = 0
            deadline = time.time() + 2.0
            while time.time() < deadline:
                time.sleep(0.06)
                if u32.IsZoomed(hwnd) or u32.IsIconic(hwnd):
                    break            # 最大化交给 NCCALCSIZE；最小化等下次还原再校
                rc = wintypes.RECT()
                u32.GetClientRect(hwnd, ctypes.byref(rc))
                if (rc.right - rc.left, rc.bottom - rc.top) == (cw, ch):
                    streak += 1
                    if streak >= 3:
                        break
                else:
                    streak = 0
                    _set_client_size_impl(hwnd, cw, ch)
            _dbg("corrector done streak=%d" % streak)
        finally:
            _correcting = False

    threading.Thread(target=run, daemon=True).start()


def _hook(hwnd, msg, wparam, lparam):
    global _was_max, _was_min, _target, _drag, _guard_until
    if msg == ACTIVATE_MSG:
        # 第二个实例请求唤醒：本进程已在运行，直接唤起已有窗口即可。
        # 回调不能在这里同步执行 GUI 操作（本函数就跑在 UI 线程上，会死锁），
        # 所以交给回调内部起线程。
        if _activate_cb is not None:
            try:
                _activate_cb()
            except Exception as e:
                _dbg("activate cb fail: %r" % e)
        return 0
    if msg == WM_NCLBUTTONDOWN or msg == WM_NCLBUTTONDBLCLK:
        # 在隐形边框环上按下：吞掉消息，改走手动拉伸。
        # WinForms 会把系统缩放循环（SC_SIZE）转成 HTCLIENT 键盘模式，
        # 实测鼠标拖不动，故不交给 DefWindowProc。
        if wparam in _RESIZE_HITS and not u32.IsZoomed(hwnd):
            p = wintypes.POINT()
            u32.GetCursorPos(ctypes.byref(p))
            _drag = [wparam, p.x, p.y]
            u32.SetCapture(hwnd)
            _dbg("NCLBUTTONDOWN hit=%d -> manual drag start" % wparam)
            return 0
    if msg == WM_MOUSEMOVE and _drag is not None:
        # 手动拉伸：按命中边移动对应窗口边缘，SetWindowPos 即时生效
        p = wintypes.POINT()
        u32.GetCursorPos(ctypes.byref(p))
        hit, lx, ly = _drag
        dx, dy = p.x - lx, p.y - ly
        if dx or dy:
            _drag[1], _drag[2] = p.x, p.y
            rw = wintypes.RECT()
            u32.GetWindowRect(hwnd, ctypes.byref(rw))
            l, t, r, b = rw.left, rw.top, rw.right, rw.bottom
            mv_l = hit in (HTLEFT, HTTOPLEFT, HTBOTTOMLEFT)
            mv_r = hit in (HTRIGHT, HTTOPRIGHT, HTBOTTOMRIGHT)
            mv_t = hit in (HTTOP, HTTOPLEFT, HTTOPRIGHT)
            mv_b = hit in (HTBOTTOM, HTBOTTOMLEFT, HTBOTTOMRIGHT)
            if mv_l: l += dx
            if mv_r: r += dx
            if mv_t: t += dy
            if mv_b: b += dy
            # 最小尺寸钳制：移动边被顶回
            if r - l < MIN_W:
                if mv_l: l = r - MIN_W
                else: r = l + MIN_W
            if b - t < MIN_H:
                if mv_t: t = b - MIN_H
                else: b = t + MIN_H
            u32.SetWindowPos(hwnd, 0, l, t, r - l, b - t, SWP_NOZORDER)
        return 0
    if msg == WM_LBUTTONUP and _drag is not None:
        _dbg("manual drag end")
        _drag = None
        u32.ReleaseCapture()
        return 0
    if msg == WM_CAPTURECHANGED:
        # 外部抢捕获（如 Alt+Tab）时终止拉伸
        _drag = None
    if msg == WM_NCPAINT:
        # 非客户区重绘的唯一权威入口：系统在激活切换、移动、尺寸变化、
        # 主题变化后都会发它。默认处理会用窗口类浅色刷把环刷白，
        # 所以这里不调原 WndProc，自己刷完直接返回 0。
        _paint_nc_ring(hwnd)
        return 0
    if msg == WM_NCACTIVATE:
        # 激活/失活时系统会重置标题栏绘制（WS_CAPTION 仍带标题栏语义），
        # 刷完再返回，避免激活后顶部又冒出一条浅边。
        res = _CallWindowProc(_orig_proc, hwnd, msg, wparam, lparam)
        _paint_nc_ring(hwnd)
        return res
    if msg == WM_WINDOWPOSCHANGING:
        # WINDOWPOS: hwnd(0) hwndAfter(8) x(16) y(20) cx(24) cy(28) flags(32)
        cx = ctypes.c_int.from_address(lparam + 24).value
        cy = ctypes.c_int.from_address(lparam + 28).value
        fl = ctypes.c_uint.from_address(lparam + 32).value
        _dbg("POSCHANGING %dx%d flags=0x%x iconic=%d zoom=%d dragging=%s target=%s" % (
            cx, cy, fl, u32.IsIconic(hwnd), u32.IsZoomed(hwnd),
            _drag is not None, _target))
        # 还原守门期：WinForms 在最小化/最大化还原后会把窗口重排回自己记录的
        # Size（pywebview 的 1280x800，那是窗口尺寸而非客户区尺寸），且发生
        # 时机不定（实测在还原后 100~600ms）。守门期内把任何非法尺寸改写回
        # 目标值，位置不动；用户手动拉伸（_drag）与最大化/最小化一律放行。
        if (_guard_until > time.time() and _target
                and _drag is None and not u32.IsZoomed(hwnd) and not u32.IsIconic(hwnd)
                and not (fl & SWP_NOSIZE)):
            want_w = _target[0] + 2 * SIDE_INSET
            want_h = _target[1] + 2 * SIDE_INSET + TOP_INSET
            if (cx, cy) != (want_w, want_h):
                ctypes.c_int.from_address(lparam + 24).value = want_w
                ctypes.c_int.from_address(lparam + 28).value = want_h
                _dbg("POSCHANGING guard: %dx%d -> %dx%d" % (cx, cy, want_w, want_h))
        return _CallWindowProc(_orig_proc, hwnd, msg, wparam, lparam)
    if msg == WM_WINDOWPOSCHANGED:
        # 位置/尺寸变化后补刷 NC 环：移动/拉伸过程中 NCPAINT 不一定及时到
        res = _CallWindowProc(_orig_proc, hwnd, msg, wparam, lparam)
        _paint_nc_ring(hwnd)
        return res
    if msg == WM_NCCALCSIZE:
        # wparam != 0：lparam 为 NCCALCSIZE_PARAMS*，rgrc[0] 在偏移 0，
        # 是建议的窗口矩形（顶层窗口为屏幕坐标），返回 0 表示客户区 = rgrc[0]。
        if wparam:
            if u32.IsZoomed(hwnd):
                # 最大化时窗口矩形被系统外扩到工作区±隐形边框（所有
                # thick-frame 窗口皆如此，该外扩区 DWM 不绘制、不可见）。
                # 普通做法靠默认 NCCALCSIZE 把客户区内缩回工作区；
                # 这里手动把客户区设为工作区，可见区域即不遮任务栏。
                wa = _workarea()
                ctypes.c_long.from_address(lparam).value = wa.left
                ctypes.c_long.from_address(lparam + 4).value = wa.top
                ctypes.c_long.from_address(lparam + 8).value = wa.right
                ctypes.c_long.from_address(lparam + 12).value = wa.bottom
                _dbg("NCCALCSIZE maximized -> client=workarea")
            else:
                # 普通状态：客户区 = 窗口矩形，不留任何非客户区。
                # DWM 合成下顶层窗口的 NC 区由系统绘制（类背景刷 / 主题边框色），
                # GDI 往 GetWindowDC 刷的颜色进不了最终画面 —— 留多宽就露多宽，
                # 表现为顶栏上方/窗口四周的一条白边或黑边，且随激活状态变色。
                # 所以这里直接返回 0 且不修改 rgrc：客户区铺满整个窗口。
                # 边缘拉伸改由页面边缘按下 + 光标轮询实现（不依赖 NC 命中）。
                _dbg("NCCALCSIZE normal -> client = window rect (no frame)")
            return 0
        return _CallWindowProc(_orig_proc, hwnd, msg, wparam, lparam)
    if msg == WM_GETMINMAXINFO:
        # 先让原 WndProc 填默认值（.NET 在此应用 MinimumSize 等），保留最小尺寸约束
        _CallWindowProc(_orig_proc, hwnd, msg, wparam, lparam)
        # 再覆盖最大化为工作区：无边框默认会铺满全屏（含任务栏区域）。
        # 普通状态的客户区内缩不影响最大化：最大化分支已把客户区设为
        # 工作区矩形，窗口矩形外扩部分仍是 DWM 不绘制的隐形边框。
        wa = _workarea()
        ctypes.c_long.from_address(lparam + _OFF_MAX_SIZE).value = wa.right - wa.left
        ctypes.c_long.from_address(lparam + _OFF_MAX_SIZE + 4).value = wa.bottom - wa.top
        ctypes.c_long.from_address(lparam + _OFF_MAX_POS).value = wa.left
        ctypes.c_long.from_address(lparam + _OFF_MAX_POS + 4).value = wa.top
        _dbg("GETMINMAXINFO -> maxsize=%d,%d maxpos=%d,%d" % (
            wa.right - wa.left, wa.bottom - wa.top, wa.left, wa.top))
        return 0
    if msg == WM_NCHITTEST:
        res = _CallWindowProc(_orig_proc, hwnd, msg, wparam, lparam)
        if res != HTCLIENT:
            _dbg("NCHITTEST res=%d (non-client)" % res)
            return res  # 标题栏按钮区等保持原样
        # 客户区内：边缘 BORDER 像素重写为拉伸命中区
        # （系统只认 WS_THICKFRAME 窗口的缩放命中，样式已补回，故此处生效）
        x = ctypes.c_short(lparam & 0xFFFF).value
        y = ctypes.c_short((lparam >> 16) & 0xFFFF).value
        rw = wintypes.RECT()
        u32.GetWindowRect(hwnd, ctypes.byref(rw))
        l, t = x - rw.left, y - rw.top            # 距左/上边
        r, b = rw.right - x, rw.bottom - y        # 距右/下边
        if l < BORDER and t < BORDER: return HTTOPLEFT
        if r < BORDER and t < BORDER: return HTTOPRIGHT
        if l < BORDER and b < BORDER: return HTBOTTOMLEFT
        if r < BORDER and b < BORDER: return HTBOTTOMRIGHT
        if l < BORDER: return HTLEFT
        if r < BORDER: return HTRIGHT
        if t < BORDER: return HTTOP
        if b < BORDER: return HTBOTTOM
        return res
    if msg == WM_SIZE:
        _dbg("WM_SIZE wp=%d was_max=%s was_min=%s target=%s" % (
            wparam, _was_max, _was_min, _target))
        if wparam == SIZE_MAXIMIZED:
            # 最大化可见区域已由 WM_NCCALCSIZE 限定为工作区，无需再校正
            _was_max = True
            _was_min = False
        elif wparam == SIZE_MINIMIZED:
            # 最小化也要记状态：WinForms 还原时用的是自己记录的 RestoredBounds
            # （pywebview 初始 Size 1280x800，是“客户区”而不是“窗口”尺寸），
            # 直接还原会让客户区少一圈边框 16x16，故还原路径同样要重校。
            _was_min = True
        elif wparam == SIZE_RESTORED and (_was_max or _was_min) and _target:
            # 最大化 / 最小化还原：WinForms 会按自己的边框理解重排窗口，
            # 单次 SetWindowPos 会被后续重排覆盖 → 立即拉一次 + 短线程持续校正。
            from_max = _was_max
            _was_max = False
            _was_min = False
            # 守门期：这段时间内任何非本意的尺寸改写都被 POSCHANGING 拦回
            _guard_until = time.time() + 1.5
            res = _CallWindowProc(_orig_proc, hwnd, msg, wparam, lparam)
            if not from_max:
                # 最小化还原：位置由系统恢复，只把尺寸拉回目标客户区
                _set_client_size_impl(hwnd, _target[0], _target[1])
            _restore_corrector(hwnd, _target[0], _target[1])
            return res
        elif wparam == SIZE_RESTORED and _target:
            # 普通拖拽拉伸结束：尊重用户拖出的尺寸，只更新目标跟踪值。
            # 还原校正期间不能更新：WinForms 重排与我们的 SetWindowPos 交织，
            # 此时读到的客户区是中间态（如 1264x784），会把目标值污染成
            # 窗口尺寸 1280x800，之后所有校正都按错误目标执行。
            if _correcting:
                return _CallWindowProc(_orig_proc, hwnd, msg, wparam, lparam)
            rc = wintypes.RECT()
            u32.GetClientRect(hwnd, ctypes.byref(rc))
            _target = (rc.right - rc.left, rc.bottom - rc.top)
        return _CallWindowProc(_orig_proc, hwnd, msg, wparam, lparam)
    return _CallWindowProc(_orig_proc, hwnd, msg, wparam, lparam)


def patch(hwnd, client_size=None):
    """对无边框窗体安装 WndProc 钩子（边缘拉伸 / 最大化边界 / 还原重校）。
    client_size: 期望客户区尺寸 (cw, ch)，用于初始补偿与最大化还原重校。"""
    global _orig_proc, _hook_proc, _target
    if not hwnd:
        return False
    if client_size:
        _target = tuple(client_size)
    if _hook_proc is None:
        _hook_proc = _WNDPROC(_hook)
        _orig_proc = _SetWindowLongPtr(hwnd, GWL_WNDPROC,
                                       ctypes.cast(_hook_proc, ctypes.c_void_p))
        if not _orig_proc:
            _hook_proc = None
            return False
    # 补回拉伸样式：必须先装钩子再改样式，FRAMECHANGED 立即触发的
    # WM_NCCALCSIZE 才能被钩住（否则隐形标题栏会真实占 30px 顶栏）
    style = int(_GetWindowLongPtr(hwnd, GWL_STYLE) or 0)
    if not (style & WS_THICKFRAME):
        _SetWindowLongPtr(hwnd, GWL_STYLE,
                          ctypes.c_void_p(style | RESIZE_STYLES))
        u32.SetWindowPos(hwnd, 0, 0, 0, 0, 0,
                         SWP_NOZORDER | SWP_FRAMECHANGED)
    # 初始补刷 NC 环（NCPAINT 分支是权威入口，这里兜底一次首帧）
    _set_class_bg(hwnd)
    _paint_nc_ring(hwnd)
    _kill_dwm_frame(hwnd)
    return True


def _kill_dwm_frame(hwnd):
    """关掉 DWM 给窗口加的两样东西：Win11 圆角 和 1px 系统边框。

    NCCALCSIZE 返回 0 后窗口没有非客户区，但 DWM 仍会对带 WS_THICKFRAME 的
    顶层窗口画圆角（左上/右上会啃掉内容）和一条描边（深色主题下是黑边、
    浅色主题下是白边）。两者都不属于窗口内容，只能通过 DWM 属性关掉。
    Win10 不支持这两个属性，调用失败直接忽略。"""
    try:
        dwm = ctypes.windll.dwmapi
    except Exception:
        return
    DWMWA_WINDOW_CORNER_PREFERENCE = 33
    DWMWA_BORDER_COLOR = 34
    DWMWCP_DONOTROUND = 1
    DWMWA_COLOR_NONE = 0xFFFFFFFE
    for attr, val in ((DWMWA_WINDOW_CORNER_PREFERENCE, ctypes.c_int(DWMWCP_DONOTROUND)),
                      (DWMWA_BORDER_COLOR, ctypes.c_uint(DWMWA_COLOR_NONE))):
        try:
            hr = dwm.DwmSetWindowAttribute(hwnd, attr, ctypes.byref(val),
                                           ctypes.sizeof(val))
            _dbg("DwmSetWindowAttribute attr=%d hr=0x%08x" % (attr, hr & 0xFFFFFFFF))
        except Exception as e:
            _dbg("DwmSetWindowAttribute attr=%d fail %r" % (attr, e))


def _set_class_bg(hwnd):
    """把窗口类背景刷改成页面底色。

    系统在少数时机绕过 WM_NCPAINT 直接用类刷擦非客户区（默认是浅灰/白），
    改成页面底色后即使漏刷也不会出现刺眼白条。"""
    global _CLASS_BRUSH
    if _CLASS_BRUSH is None:
        _CLASS_BRUSH = ctypes.windll.gdi32.CreateSolidBrush(_rgb(_NC_SIDE))
    try:
        u32.SetClassLongPtrW.argtypes = [wintypes.HWND, ctypes.c_int, ctypes.c_void_p]
        u32.SetClassLongPtrW.restype = ctypes.c_void_p
        u32.SetClassLongPtrW(hwnd, GCLP_HBRBACKGROUND, _CLASS_BRUSH)
    except Exception as e:
        _dbg("set class bg fail: %r" % e)


def find_window_by_title(title):
    """兜底：按顶层窗口标题找句柄。"""
    u32.FindWindowW.restype = wintypes.HWND
    return int(u32.FindWindowW(None, title) or 0)


def _set_client_size_impl(hwnd, cw, ch):
    # 客户区 = 窗口矩形（WM_NCCALCSIZE 不内缩），窗口尺寸即客户区尺寸。
    # 保留 + 2*SIDE_INSET + TOP_INSET 的写法，将来若恢复隐形边框环只需改常量。
    b = SIDE_INSET
    rc = wintypes.RECT()
    u32.GetWindowRect(hwnd, ctypes.byref(rc))
    u32.SetWindowPos(hwnd, 0, rc.left, rc.top, cw + 2 * b, ch + 2 * b + TOP_INSET,
                     SWP_NOZORDER | SWP_FRAMECHANGED)


def set_client_size(hwnd, cw, ch):
    """把窗口客户区精确设为 cw x ch（内容区尺寸）。

    pywebview 先按带边框样式设 Size、之后才应用 FormBorderStyle.None，
    标准边框（左右 SM_CXFRAME、上含标题栏 SM_CYCAPTION）被永久扣除，
    1600x900 实际只剩 1584x861。这里按“当前样式外观-客户区差”补偿，DPI 自适应。
    """
    global _target
    _target = (cw, ch)
    _set_client_size_impl(hwnd, cw, ch)
