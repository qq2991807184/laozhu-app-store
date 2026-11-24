/* 老朱应用商店 - 前端交互逻辑
 * 桌面版(pywebview)：真实下载+静默安装（队列）、已安装检测、卸载、批量安装；
 * 浏览器(file://)：静态数据 + 跳转下载页。
 */
(function () {
  "use strict";

  // ---- 数据（桌面版会被后端 get_state 覆盖）----
  let CATS = typeof CATEGORIES !== "undefined" ? CATEGORIES : [];
  let APPS_DATA = typeof APPS !== "undefined" ? APPS : [];
  let SETTINGS = { download_dir: "", install_dir: "" };
  let INSTALLED = {};            // app_id -> {name, version, uninstall, location, exe}
  let ALL_INSTALLED = null;      // 注册表全量已装软件（懒加载，含商店未收录的）

  // ---- 状态 ----
  let currentCat = "all";
  let view = "cat";              // cat=按分类浏览 | installed=已安装软件 | packages=本地安装包
  let query = "";
  let sortBy = "hot";
  let batchMode = false;
  const batchSel = new Set();    // 批量安装选中的应用 id
  const dlRecords = new Map();   // app_id -> {status, state, pct, received, total, dest}
  let pendingInstall = null;     // 正在「选择安装位置」的应用对象

  // 已安装列表（火绒式一行一款）
  let instMode = false;          // 批量卸载选择模式
  let instSort = "name";         // name | date | size
  const instSel = new Set();     // 选中的已安装条目 id

  // 本地安装包视图
  let PKG = null;                // {dir, exists, items[], total_size}
  let pkgQuery = "";
  let pkgLoading = false;

  // 左侧一级入口：只保留少量常用项，其余分类全部放到主区顶部 chips 栏
  const SIDE_NAV = [
    { key: "all",         name: "全部应用",   icon: "🏠" },
    { key: "ai",          name: "AI 专区",    icon: "✨" },
    { key: "game",        name: "游戏娱乐",   icon: "🎮" },
    { key: "office",      name: "办公教育",   icon: "📄" },
    { key: "dev",         name: "编程软件",   icon: "💻" },
    { key: "__installed", name: "已安装软件", icon: "✅" },
    { key: "__packages",  name: "本地安装包", icon: "📦" },
  ];

  const isDesktop = () => !!(window.pywebview && window.pywebview.api);
  const api = () => window.pywebview.api;

  const $ = (id) => document.getElementById(id);
  const sideNav = $("sideNav");
  const catChips = $("catChips");
  const appGrid = $("appGrid");
  const emptyState = $("emptyState");
  const searchInput = $("searchInput");
  const clearSearch = $("clearSearch");
  const sortSelect = $("sortSelect");

  // ---- 工具 ----
  function findApp(id) { return APPS_DATA.find((x) => x.id === id); }
  function stars(r) { const f = Math.round(r); return "★".repeat(f) + "☆".repeat(5 - f); }
  function catName(key) { const c = CATS.find((c) => c.key === key); return c ? c.name : key; }
  function catCount(key) { return key === "all" ? APPS_DATA.length : APPS_DATA.filter((a) => a.category === key).length; }
  function sizeNum(s) { const m = (s || "").match(/([\d.]+)/); return m ? parseFloat(m[1]) : Infinity; }
  function iconInner(a) { return a.icon_img ? `<img class="app-img" src="${a.icon_img}" alt="">` : a.icon; }
  function iconCls(a, base) { return base + (a.icon_img ? " has-img" : ""); }
  function installedOf(id) { return INSTALLED[id]; }
  // 名字归一：注册表写「360压缩」、商店写「360 压缩」，空格/分隔符一律去掉再比
  const normName = (s) => String(s == null ? "" : s).trim().toLowerCase()
    .replace(/[\s\-_·.．]+/g, "");
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function fmtSize(b) {
    if (!b) return "0 B";
    if (b >= 1073741824) return (b / 1073741824).toFixed(2) + " GB";
    if (b > 1048576) return (b / 1048576).toFixed(1) + " MB";
    if (b > 1024) return (b / 1024).toFixed(1) + " KB";
    return b + " B";
  }

  // ---- 导航 / 分类栏 ----
  function renderNav() {
    const instN = ALL_INSTALLED ? ALL_INSTALLED.length : Object.keys(INSTALLED).length;
    const pkgN = PKG && PKG.items ? PKG.items.length : 0;
    sideNav.innerHTML = SIDE_NAV.map((it) => {
      const isInst = it.key === "__installed";
      const isPkg = it.key === "__packages";
      const active = isInst ? view === "installed"
        : isPkg ? view === "packages"
        : (view === "cat" && currentCat === it.key);
      const num = isInst ? instN : isPkg ? pkgN : catCount(it.key);
      return `
      <button class="nav-item ${active ? "active" : ""}" data-nav="${it.key}">
        <span class="cat-ico">${it.icon}</span><span>${it.name}</span>
        <span class="cat-num">${num}</span>
      </button>`;
    }).join("");
  }

  function renderChips() {
    // 分类数不做成角标：21 个分类带数字会被顶到第三行，去掉后稳定两行，观感更接近火绒
    catChips.innerHTML = CATS.map((c) => `
      <button class="chip ${view === "cat" && c.key === currentCat ? "active" : ""}"
              data-cat="${c.key}" title="${catCount(c.key)} 款应用">${c.name}</button>`).join("");
  }

  // ---- 过滤排序 ----
  function filteredApps() {
    let list = APPS_DATA.slice();
    if (currentCat !== "all") list = list.filter((a) => a.category === currentCat);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((a) => [a.name, a.en, a.desc, (a.tags || []).join(" ")].join(" ").toLowerCase().includes(q));
    }
    if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name, "zh"));
    else if (sortBy === "size") list.sort((a, b) => sizeNum(a.size) - sizeNum(b.size));
    return list;
  }

  // ---- 卡片 ----
  function actionBtn(a) {
    const rec = dlRecords.get(a.id);
    if (rec && rec.state === "busy") return `<button class="dl-btn busy" disabled>处理中</button>`;
    if (a.web) return `<button class="dl-btn" data-open="${a.id}">打开</button>`;
    if (installedOf(a.id)) return `<button class="dl-btn launch" data-launch="${a.id}">启动</button>`;
    return `<button class="dl-btn" data-dl="${a.id}">安装</button>`;
  }

  function cardHTML(a) {
    const inst = installedOf(a.id);
    const checked = batchSel.has(a.id) ? "checked" : "";
    const checkbox = batchMode && !a.web
      ? `<label class="card-check" onclick="event.stopPropagation()"><input type="checkbox" data-check="${a.id}" ${checked}></label>` : "";
    const instTag = inst ? `<span class="inst-tag" title="已安装${inst.version ? " v" + inst.version : ""}">已安装</span>` : "";
    return `
      <article class="card" data-id="${a.id}" style="--app-color:${a.color}">
        ${checkbox}
        <div class="${iconCls(a, "card-icon")}">${iconInner(a)}</div>
        <div class="card-body">
          <div class="card-title"><span class="card-name">${a.name}</span><span class="ver">v${a.version}</span>${instTag}</div>
          <div class="card-en">${a.en}</div>
          <p class="card-desc">${a.desc}</p>
          <div class="card-meta">
            <span class="stars">${stars(a.rating)} ${a.rating}</span><span>${a.size}</span>
          </div>
        </div>
        ${actionBtn(a)}
      </article>`;
  }

  function renderGrid() {
    const list = filteredApps();
    const title = query ? `搜索“${query}”` : catName(currentCat);
    $("currentCatName").textContent = title;
    $("resultCount").textContent = `共 ${list.length} 款`;
    $("emptyText").textContent = "没有找到相关应用";
    if (!list.length) { appGrid.innerHTML = ""; emptyState.hidden = false; return; }
    emptyState.hidden = true;
    appGrid.innerHTML = list.map(cardHTML).join("");
    $("bannerTitle").textContent = currentCat === "all" && !query ? "发现好用的软件" : catName(currentCat) + "精选";
    $("bannerSub").textContent = "精选国内外优质应用，官方直链，安全纯净，一键下载安装。";
  }

  function renderAll() { renderNav(); renderChips(); renderMain(); updateDlBadge(); renderDlList(); }

  // ============ 已安装软件：火绒式一行一款 ============
  // 主体是注册表全量（本机 190+ 条），商店内应用再补进来 ——
  // ChatGPT 这种 MSIX 解包版不进注册表，只有文件系统探测能认出来。
  const LETTER_COLORS = ["#2f6fed", "#e05d2b", "#1d9e57", "#8a4bd1",
                         "#d98a1f", "#0f8f9e", "#c94a6d", "#4a5fbf"];

  function letterIcon(name) {
    const s = String(name || "?").trim() || "?";
    const ch = s[0].toUpperCase();
    const idx = s.split("").reduce((n, c) => n + c.charCodeAt(0), 0) % LETTER_COLORS.length;
    return `<span class="inst-letter" style="background:${LETTER_COLORS[idx]}">${esc(ch)}</span>`;
  }

  function fmtRegDate(d) {
    const s = String(d || "").replace(/\D/g, "");
    if (s.length !== 8) return "—";
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  }

  // 注册表条目 -> 商店 app_id（优先按 INSTALLED 里记录的 DisplayName 精确对）
  function appIdOfName(name) {
    const n = normName(name);
    if (!n) return "";
    const ids = Object.keys(INSTALLED);
    for (const id of ids) {
      const v = INSTALLED[id] || {};
      if (normName(v.name) === n) return id;
    }
    for (const id of ids) {
      const a = findApp(id);
      if (a && normName(a.name) === n) return id;
    }
    // 模糊：只在名字够长时做互相包含，避免「QQ」吃掉一堆
    if (n.length >= 4) {
      for (const id of ids) {
        const v = INSTALLED[id] || {};
        const x = normName(v.name);
        if (x && x.length >= 4 && (x.includes(n) || n.includes(x))) return id;
      }
    }
    return "";
  }

  function buildInstRows() {
    const rows = [];
    const used = new Set();
    (ALL_INSTALLED || []).forEach((x) => {
      const appId = appIdOfName(x.name);
      if (appId) used.add(appId);
      rows.push({
        id: x.id, appId: appId || "",
        name: x.name, version: x.version || "",
        publisher: x.publisher || "", date: x.date || "",
        size: x.size || 0, exe: x.exe || "", location: x.location || "",
        uninstall: x.uninstall || "",
      });
    });
    // 商店内但注册表里没有的（解包版 / 绿色版）
    Object.keys(INSTALLED).forEach((id) => {
      if (used.has(id)) return;
      const v = INSTALLED[id] || {};
      const a = findApp(id);
      rows.push({
        id: "app:" + id, appId: id,
        name: (a && a.name) || v.name || id,
        version: v.version || "",
        publisher: (a && a.en) || "本机目录探测",
        date: "", size: 0,
        exe: v.exe || "", location: v.location || "",
        uninstall: v.uninstall || "",
      });
    });
    return rows;
  }

  function instRowHTML(r) {
    const a = r.appId ? findApp(r.appId) : null;
    const ico = a && a.icon_img
      ? `<span class="inst-ico has-img"><img src="${a.icon_img}" alt=""></span>`
      : a && a.icon
        ? `<span class="inst-ico emoji" style="--app-color:${a.color}"><span class="inst-emoji">${a.icon}</span></span>`
        : `<span class="inst-ico">${letterIcon(r.name)}</span>`;
    const sub = r.publisher || (r.location ? r.location : "—");
    const pick = instMode
      ? `<label class="inst-pick"><input type="checkbox" data-ipick="${esc(r.id)}" ${instSel.has(r.id) ? "checked" : ""}></label>`
      : "";
    const canUninst = !!(r.uninstall || (r.appId && r.location));
    return `
      <div class="inst-row ${instSel.has(r.id) ? "picked" : ""}" data-row="${esc(r.id)}">
        ${pick}
        ${ico}
        <div class="inst-main">
          <div class="inst-name" title="${esc(r.name)}">${esc(r.name)}</div>
          <div class="inst-sub" title="${esc(sub)}">${esc(sub)}${r.version ? ` · v${esc(r.version)}` : ""}</div>
        </div>
        <span class="inst-date">${fmtRegDate(r.date)}</span>
        <span class="inst-size">${r.size ? fmtSize(r.size * 1024) : "—"}</span>
        <div class="inst-ops">
          <button class="btn-outline" data-iuninst="${esc(r.id)}" ${canUninst ? "" : "disabled title=\"没有注册卸载程序\""}>卸载</button>
          <button class="btn-outline" data-iopen="${esc(r.id)}">打开</button>
        </div>
      </div>`;
  }

  function renderInstalled() {
    _instRows = buildInstRows();
    let rows = _instRows.slice();
    const q = (query || "").trim().toLowerCase();
    if (q) {
      rows = rows.filter((r) =>
        [r.name, r.publisher, r.location, r.version].join(" ").toLowerCase().includes(q));
    }
    if (instSort === "date") {
      rows.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    } else if (instSort === "size") {
      rows.sort((a, b) => (b.size || 0) - (a.size || 0));
    } else {
      rows.sort((a, b) => String(a.name).localeCompare(String(b.name), "zh"));
    }

    const totalKB = rows.reduce((n, r) => n + (r.size || 0), 0);
    $("currentCatName").textContent = q ? `搜索“${query}”` : "已安装软件";
    $("resultCount").textContent = totalKB
      ? `共 ${rows.length} 款 · 占用 ${fmtSize(totalKB * 1024)}`
      : `共 ${rows.length} 款`;

    if (!rows.length) {
      appGrid.className = "inst-list";
      appGrid.innerHTML = "";
      $("emptyText").textContent = q ? "没有匹配的已安装软件" : "还没有检测到已安装的软件";
      emptyState.hidden = false;
      return;
    }
    emptyState.hidden = true;
    appGrid.className = "inst-list";
    appGrid.innerHTML = rows.map(instRowHTML).join("");
    $("bannerTitle").textContent = "已安装软件";
    $("bannerSub").textContent = "本机全部已安装程序，可直接卸载或打开安装目录。";
  }

  function ensureAllInstalled(force) {
    if (!isDesktop()) { renderMain(); return; }
    if (ALL_INSTALLED && !force) { renderMain(); return; }
    if (!ALL_INSTALLED) toast("正在扫描已安装软件…");
    api().list_all_installed().then((l) => {
      ALL_INSTALLED = Array.isArray(l) ? l : [];
      _instRows = null;
      renderNav();
      renderMain();
    });
  }

  // ============ 本地安装包 ============
  function renderPackages() {
    const p = PKG;
    if (!p) {
      appGrid.className = "pkg-wrap";
      appGrid.innerHTML = `<div class="pkg-loading">正在扫描安装包目录…</div>`;
      if (!pkgLoading) ensurePackages();
      return;
    }
    const q = (pkgQuery || "").trim().toLowerCase();
    let items = p.items || [];
    if (q) items = items.filter((x) => (x.file + " " + x.sub).toLowerCase().includes(q));

    $("currentCatName").textContent = "本地安装包";
    $("resultCount").textContent = p.exists
      ? `${items.length} 个文件 · 共 ${fmtSize(p.total_size)}`
      : "目录未找到";
    $("bannerTitle").textContent = "本地安装包";
    $("bannerSub").textContent = "这里列的是你自己攒的安装包和绿色版，不进 exe 包体，点「安装」直接运行。";

    const head = `
      <div class="pkg-head">
        <div class="pkg-dirbox">
          <span class="pkg-dir-label">目录</span>
          <code class="pkg-dir" title="${esc(p.dir)}">${esc(p.dir)}</code>
        </div>
        <div class="pkg-tools">
          <input id="pkgSearch" class="pkg-search" type="text" placeholder="按文件名过滤…" value="${esc(pkgQuery)}">
          <button class="btn-mini ghost" data-pkgchange="1">更换目录</button>
          <button class="btn-mini ghost" data-pkgopen="1">打开文件夹</button>
          <button class="btn-mini ghost" data-pkgrefresh="1">重新扫描</button>
        </div>
      </div>`;

    if (!p.exists) {
      appGrid.className = "pkg-wrap";
      appGrid.innerHTML = head + `<div class="pkg-empty">目录不存在：${esc(p.dir)}<br>点「更换目录」选一个装着安装包的文件夹。</div>`;
      return;
    }
    if (!items.length) {
      appGrid.className = "pkg-wrap";
      appGrid.innerHTML = head + `<div class="pkg-empty">这个目录里没有找到 exe / msi / 压缩包。</div>`;
      return;
    }
    const rows = items.map((x) => `
      <div class="pkg-row">
        <span class="pkg-ext ext-${esc(x.ext)}">${esc(x.ext.toUpperCase())}</span>
        <div class="pkg-main">
          <div class="pkg-name" title="${esc(x.file)}">${esc(x.name)}</div>
          <div class="pkg-sub">${x.sub ? esc(x.sub) + " · " : ""}${fmtSize(x.size)}</div>
        </div>
        <div class="pkg-ops">
          <button class="btn-outline" data-pkgrun="${esc(x.path)}">安装</button>
          <button class="btn-outline" data-pkgdir="${esc(x.path)}">位置</button>
        </div>
      </div>`).join("");
    appGrid.className = "pkg-wrap";
    appGrid.innerHTML = head + `<div class="pkg-list">${rows}</div>`;
    const si = $("pkgSearch");
    if (si) si.addEventListener("input", (e) => {
      pkgQuery = e.target.value;
      const pos = e.target.selectionStart;
      renderPackages();
      const ni = $("pkgSearch");
      if (ni) { ni.focus(); ni.setSelectionRange(pos, pos); }
    });
  }

  function ensurePackages(force) {
    if (!isDesktop()) {
      PKG = { dir: "（浏览器模式不可用）", exists: false, items: [], total_size: 0 };
      renderPackages();
      return;
    }
    if (PKG && !force) { renderMain(); return; }
    pkgLoading = true;
    api().scan_packages().then((r) => {
      pkgLoading = false;
      PKG = r || { dir: "", exists: false, items: [], total_size: 0 };
      renderNav();
      renderMain();
    });
  }

  // 排序下拉的选项随视图切换（已安装视图按安装时间更有意义）
  const SORT_CAT = [["hot", "按热度"], ["rating", "按评分"], ["name", "按名称"], ["size", "按体积"]];
  const SORT_INST = [["name", "按名称"], ["date", "按安装时间"], ["size", "按体积"]];
  function syncSortOptions() {
    const el = $("sortSelect");
    if (!el) return;
    const list = view === "installed" ? SORT_INST : SORT_CAT;
    const cur = view === "installed" ? instSort : sortBy;
    el.innerHTML = list.map(([v, t]) =>
      `<option value="${v}"${v === cur ? " selected" : ""}>${t}</option>`).join("");
  }

  // 统一入口：按当前视图决定渲染哪套
  function renderMain() {
    const isInst = view === "installed";
    const isPkg = view === "packages";
    $("batchToggle").hidden = isInst || isPkg || batchMode;
    $("uninstToggle").hidden = !isInst || instMode;
    $("uninstBar").hidden = !(isInst && instMode);
    $("batchBar").hidden = !(batchMode && !isInst && !isPkg);
    $("sortSelect").parentElement.hidden = isPkg;
    syncSortOptions();
    if (isInst) { renderInstalled(); return; }
    if (isPkg) { renderPackages(); return; }
    appGrid.className = "app-grid";
    renderGrid();
  }

  // ---- 详情 ----
  function openDetail(id) {
    const a = findApp(id); if (!a) return;
    const inst = installedOf(a.id);
    let actions;
    if (a.web) {
      actions = `<button class="btn-primary" data-open="${a.id}">打开网页版</button>
                 <button class="btn-ghost" data-site="${a.website}">访问官网</button>`;
    } else if (inst) {
      actions = `<button class="btn-primary" data-launch="${a.id}">启动</button>
                 <button class="btn-ghost" data-opendir="${a.id}">打开目录</button>
                 <button class="btn-ghost" data-uninst="${a.id}">卸载</button>`;
    } else {
      const rec = dlRecords.get(a.id);
      const busy = rec && rec.state === "busy";
      actions = `<button class="btn-primary" data-dl="${a.id}" ${busy ? "disabled" : ""}>${busy ? "处理中…" : "一键安装"}</button>
                 <button class="btn-ghost" data-site="${a.website}">访问官网</button>`;
    }
    $("modalBody").innerHTML = `
      <div class="detail-head" style="--app-color:${a.color}">
        <div class="${iconCls(a, "detail-icon")}">${iconInner(a)}</div>
        <div>
          <div class="detail-name">${a.name}</div>
          <div class="detail-en">${a.en} · ${catName(a.category)}</div>
          <div class="detail-rating">${stars(a.rating)}<span>${a.rating} 分 · ${a.downloads} 次下载</span></div>
        </div>
      </div>
      <div class="detail-specs">
        <div class="spec"><div class="k">版本</div><div class="v">${a.version}</div></div>
        <div class="spec"><div class="k">大小</div><div class="v">${a.size}</div></div>
        <div class="spec"><div class="k">更新</div><div class="v">${a.updated}</div></div>
        ${inst ? `<div class="spec"><div class="k">本机已装</div><div class="v">${inst.version || "已安装"}</div></div>` : ""}
      </div>
      <div class="detail-tags">${(a.tags || []).map((t) => `<span class="tag">${t}</span>`).join("")}</div>
      <p class="detail-desc">${a.desc}</p>
      <div class="detail-actions">${actions}</div>`;
    $("detailModal").hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeDetail() { $("detailModal").hidden = true; document.body.style.overflow = ""; }

  // ---- 安装队列 ----
  function joinPath(dir, name) {
    const d = String(dir || "").replace(/[\\/]+$/, "");
    return d ? d + "\\" + name : name;
  }
  function parentPath(p) {
    const s = String(p || "").replace(/[\\/]+$/, "");
    const i = Math.max(s.lastIndexOf("\\"), s.lastIndexOf("/"));
    return i > 1 ? s.slice(0, i) : s;
  }

  // 安装前先让用户确认/修改安装目录（默认：该应用上次选的 > 全局安装位置 + 应用名）
  function askInstallDir(a) {
    pendingInstall = a;
    const remembered = (SETTINGS.app_dirs || {})[a.id];
    const def = remembered || joinPath(SETTINGS.install_dir || "", a.name);
    $("instDirApp").textContent = `${a.name} · ${a.en}`;
    $("instDirInput").value = def;
    $("instDirDefault").checked = false;
    $("instDirModal").hidden = false;
    setTimeout(() => { const el = $("instDirInput"); el.focus(); el.select(); }, 30);
  }
  function closeInstallDir() { $("instDirModal").hidden = true; }

  function startInstall(id) {
    const a = findApp(id); if (!a) return;
    if (a.web) {
      if (isDesktop()) api().open_website(a.website);
      else window.open(a.website, "_blank", "noopener");
      return;
    }
    if (!isDesktop()) { browserDownload(a); return; }
    askInstallDir(a);   // 目录确认后才真正入队
  }

  function queueInstall(a, dir) {
    upsertRec(a.id, { state: "busy", status: "排队中…", pct: 0 });
    updateDlBadge(); renderDlList(); openDrawer();
    api().install_app(a.id, dir || "");
    renderGrid();
  }

  function browserDownload(a) {
    const link = document.createElement("a");
    link.href = a.download_url; link.target = "_blank"; link.rel = "noopener";
    document.body.appendChild(link); link.click(); link.remove();
    upsertRec(a.id, { state: "", status: a.direct ? "已开始下载（浏览器）" : "已打开官方下载页", dest: "" });
    updateDlBadge(); renderDlList(); openDrawer();
  }

  function upsertRec(id, patch) {
    const cur = dlRecords.get(id) || { id, status: "", state: "", pct: 0, received: 0, total: 0, dest: "" };
    Object.assign(cur, patch);
    dlRecords.set(id, cur);
    return cur;
  }

  // ---- 启动 / 打开目录：都靠后端定位到主程序 exe ----
  function doLaunch(id) {
    if (!isDesktop()) return;
    api().launch_app(id).then((r) => {
      if (!r || !r.ok) toast((r && r.error) || "启动失败");
    });
  }
  function doOpenDir(id) {
    if (!isDesktop()) return;
    api().open_install_dir(id).then((r) => {
      if (!r || !r.ok) toast((r && r.error) || "找不到安装目录");
    });
  }

  // ---- 已安装列表：行动作 ----
  let _instRows = null;

  function findInstRow(id) {
    if (!_instRows) _instRows = buildInstRows();
    return _instRows.find((r) => r.id === id) || null;
  }

  // 商店内的走 launch_app（能定位主程序）；注册表里的其他软件直接跑 exe，
  // 没 exe 就打开安装目录，避免点了没反应。
  function openInstRow(row) {
    if (!row) return;
    if (!isDesktop()) { toast("浏览器模式不可用"); return; }
    if (row.appId && findApp(row.appId)) { doLaunch(row.appId); return; }
    if (row.exe) {
      api().run_package(row.exe).then((r) => { if (!r || !r.ok) toast((r && r.error) || "启动失败"); });
      return;
    }
    if (row.location) { api().open_package_folder(row.location); return; }
    toast("没定位到主程序，也没有安装目录");
  }

  function updateInstN() {
    $("uninstN").textContent = instSel.size;
    const all = (_instRows || []).length;
    $("uninstAll").textContent = all && instSel.size >= all ? "全不选" : "全选";
  }

  function uninstallRows(rows) {
    const list = (rows || []).filter(Boolean);
    if (!list.length) return;
    if (!isDesktop()) { toast("浏览器模式不可用"); return; }
    const regIds = list.filter((r) => !String(r.id).startsWith("app:") && r.uninstall).map((r) => r.id);
    const appIds = list.filter((r) => String(r.id).startsWith("app:")).map((r) => r.appId);
    const noCmd = list.filter((r) => !r.uninstall && !String(r.id).startsWith("app:"));
    if (!regIds.length && !appIds.length) {
      toast(`${noCmd.length} 款没有注册卸载程序，只能点「打开」到目录里手动清理`);
      return;
    }
    const ask = list.length === 1
      ? `确定卸载「${list[0].name}」？`
      : `确定卸载选中的 ${list.length} 款软件？` + (noCmd.length ? `（${noCmd.length} 款无卸载程序会跳过）` : "");
    if (!confirm(ask)) return;
    toast(`正在卸载 ${regIds.length + appIds.length} 款，请稍候…`);
    if (regIds.length) api().batch_uninstall(regIds);
    appIds.forEach((id) => api().uninstall(id));
    instMode = false;
    instSel.clear();
    renderMain();
    setTimeout(() => { ALL_INSTALLED = null; ensureAllInstalled(true); }, 3000);
  }

  // ---- 本地安装包 ----
  function runPackage(path) {
    if (!isDesktop()) { toast("浏览器模式不可用"); return; }
    api().run_package(path).then((r) => {
      if (r && r.ok) toast("已启动安装程序");
      else toast((r && r.error) || "启动失败");
    });
  }

  function changePackageDir() {
    if (!isDesktop()) return;
    api().browse_dir((PKG && PKG.dir) || "").then((p) => {
      if (!p) return;
      api().set_package_dir(p).then((r) => {
        if (r && r.ok) { PKG = null; pkgQuery = ""; ensurePackages(true); toast("已切换安装包目录"); }
        else toast((r && r.error) || "切换失败");
      });
    });
  }

  // 后端回调
  window.__dlProgress = function (id, pct, received, total) {
    const rec = dlRecords.get(id); if (!rec) return;
    rec.pct = pct; rec.received = received; rec.total = total; rec.state = "busy";
    rec.status = total ? `下载中 ${pct}%（${fmtSize(received)}/${fmtSize(total)}）` : `下载中 ${fmtSize(received)}`;
    renderDlList();
  };
  window.__dlDone = function (id, ok, msg, dest) {
    upsertRec(id, { state: ok ? "" : "fail", status: msg, dest: dest || "", downloading: false });
    renderDlList();
    if (!ok) { toast(msg); renderGrid(); }
  };
  window.__instStatus = function (id, msg, ok) {
    const rec = upsertRec(id, {
      status: msg,
      state: ok === true ? "ok" : ok === false ? "fail" : "busy",
    });
    if (ok === true) rec.pct = 100;
    renderDlList();
    const a = findApp(id);
    if (ok === true || ok === false) {
      toast(`${a ? a.name + "：" : ""}${msg}`);
      if (ok === true && isDesktop()) {
        // 后端 rescan 是异步推的，这里再主动拉一次，保证卡片立刻从「安装」变「启动」
        api().rescan_installed().then((res) => {
          if (res && typeof res === "object") { INSTALLED = res; }
          renderNav(); renderGrid();
        });
      } else {
        renderGrid();
      }
    }
  };
  window.__installedChanged = function (json) {
    try { INSTALLED = JSON.parse(json) || {}; } catch (e) { INSTALLED = {}; }
    ALL_INSTALLED = null;          // 装/卸后全量列表也过期了，下次进视图重拉
    _instRows = null;
    renderNav(); renderChips(); renderMain();
    if (view === "installed") ensureAllInstalled();
  };

  // 批量卸载进度（后端线程回调）
  window.__batchUninstProgress = function (done, total, name) {
    let n; try { n = JSON.parse(name); } catch (e) { n = name; }
    $("resultCount").textContent = `正在卸载 ${done + 1}/${total}：${n}`;
  };
  window.__batchUninstMsg = function (name, msg) {
    let n; try { n = JSON.parse(name); } catch (e) { n = name; }
    toast(`${n}：${msg}`);
  };
  window.__batchUninstDone = function (done, total, skipped) {
    let sk = []; try { sk = JSON.parse(skipped) || []; } catch (e) { sk = []; }
    toast(`批量卸载完成：${total} 款` + (sk.length ? `，${sk.length} 款跳过` : ""));
    ALL_INSTALLED = null;
    _instRows = null;
    ensureAllInstalled(true);
  };
  window.__queueChanged = function (n) {
    const b = $("dlCount");
    b.hidden = !n;
    b.textContent = n;
  };

  // ---- 下载管理抽屉 ----
  function updateDlBadge() {
    const n = dlRecords.size;
    const b = $("dlCount");
    b.hidden = n === 0;
    b.textContent = n;
  }
  function renderDlList() {
    const box = $("dlList");
    if (!dlRecords.size) { box.innerHTML = `<div class="dl-empty">暂无任务<br /><br />点击应用卡片上的「安装」即可开始</div>`; return; }
    box.innerHTML = Array.from(dlRecords.values()).map((r) => {
      const a = findApp(r.id);
      const prog = r.state === "busy" && r.total
        ? `<div class="dl-bar"><div class="dl-bar-fill" style="width:${r.pct}%"></div></div>` : "";
      let btn = "";
      if (isDesktop()) {
        if (r.state === "fail") btn = `<button class="btn-mini" data-retry="${r.id}" title="断点续传">重试</button>`;
        else if (r.state === "ok") btn = `<button class="btn-mini ghost" data-del="${r.id}">移除</button>`;
      }
      return `
      <div class="dl-item ${r.state === "ok" ? "is-ok" : r.state === "fail" ? "is-fail" : ""}" style="--app-color:${a.color}">
        <div class="${iconCls(a, "dl-ico")}">${iconInner(a)}</div>
        <div class="dl-info">
          <div class="dl-name">${a.name}</div>
          <div class="dl-status">${r.status}</div>
          ${prog}
        </div>
        ${btn}
      </div>`;
    }).join("");
  }
  function openDrawer() { renderDlList(); $("dlDrawer").hidden = false; }

  // ---- 批量安装 ----
  function setBatch(on) {
    batchMode = on;
    $("batchBar").hidden = !on;
    $("batchToggle").hidden = on;
    if (!on) batchSel.clear();
    updateBatchN();
    renderGrid();
  }
  function updateBatchN() {
    $("batchN").textContent = batchSel.size;
    const visible = filteredApps().filter((a) => !a.web);
    const allChecked = visible.length > 0 && visible.every((a) => batchSel.has(a.id));
    $("batchAll").textContent = allChecked ? "全不选" : "全选";
  }
  $("batchToggle").addEventListener("click", () => setBatch(true));
  $("batchOff").addEventListener("click", () => setBatch(false));
  $("batchAll").addEventListener("click", () => {
    const visible = filteredApps().filter((a) => !a.web);
    const allChecked = visible.every((a) => batchSel.has(a.id));
    visible.forEach((a) => allChecked ? batchSel.delete(a.id) : batchSel.add(a.id));
    updateBatchN(); renderGrid();
  });
  $("batchInv").addEventListener("click", () => {
    filteredApps().filter((a) => !a.web).forEach((a) =>
      batchSel.has(a.id) ? batchSel.delete(a.id) : batchSel.add(a.id));
    updateBatchN(); renderGrid();
  });
  $("batchGo").addEventListener("click", () => {
    if (!batchSel.size) { toast("请先勾选要安装的应用"); return; }
    if (!isDesktop()) { toast("浏览器模式无法自动安装"); return; }
    const ids = Array.from(batchSel);
    // 批量安装用设置里的全局安装位置，每个应用各建 <位置>\<应用名> 子目录
    api().batch_install(ids, SETTINGS.install_dir || "");
    ids.forEach((id) => upsertRec(id, { state: "busy", status: "排队中…", pct: 0 }));
    updateDlBadge(); renderDlList(); openDrawer();
    setBatch(false);
    renderGrid();
  });

  // ---- 设置弹窗 ----
  function openSettings() {
    const dlInput = $("setDownloadDir"), instInput = $("setInstallDir");
    if (isDesktop()) {
      $("desktopTip").textContent = "下载与安装均默认 D 盘（无 D 盘时回退系统目录），更改后点「保存设置」生效。";
      api().get_settings().then((s) => {
        SETTINGS = s; dlInput.value = s.download_dir; instInput.value = s.install_dir;
        dlInput.readOnly = false; instInput.readOnly = false;
      });
    } else {
      $("desktopTip").textContent = "当前为浏览器预览模式，无法更改下载/安装位置；请使用桌面版 exe。";
      dlInput.value = "（浏览器模式不可用）"; instInput.value = "（浏览器模式不可用）";
      dlInput.readOnly = true; instInput.readOnly = true;
    }
    $("settingsModal").hidden = false;
  }
  function browseDir(inputId, current) {
    if (!isDesktop()) return;
    api().browse_dir(current).then((p) => { if (p) $(inputId).value = p; });
  }

  // ---- 选择安装位置弹窗 ----
  function confirmInstallDir() {
    const dir = ($("instDirInput").value || "").trim();
    if (!dir) { toast("请填写安装目录"); return; }
    if (!/^[a-zA-Z]:[\\/]/.test(dir)) { toast("请填完整路径，例如 D:\\软件\\Trae"); return; }
    if ($("instDirDefault").checked) {
      // 勾了「设为默认」：把这条路径的父目录存成全局安装位置，
      // 之后每个应用默认落到 <父目录>\<应用名>
      const root = parentPath(dir);
      api().save_settings(SETTINGS.download_dir, root).then((r) => {
        if (r && r.ok) SETTINGS = r.settings;
      });
    }
    const a = pendingInstall;
    closeInstallDir();
    if (a) queueInstall(a, dir);
  }
  $("instDirBrowse").addEventListener("click", () => {
    if (!isDesktop()) return;
    api().browse_dir($("instDirInput").value).then((p) => {
      if (p) $("instDirInput").value = p;
    });
  });
  $("instDirClose").addEventListener("click", closeInstallDir);
  $("instDirCancel").addEventListener("click", closeInstallDir);
  $("instDirGo").addEventListener("click", confirmInstallDir);
  $("instDirModal").addEventListener("click", (e) => {
    if (e.target === $("instDirModal")) closeInstallDir();
  });
  $("instDirInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); confirmInstallDir(); }
  });

  // ---- 轻提示 ----
  let toastTimer = null;
  function toast(text) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div"); el.className = "toast";
      el.style.cssText = "position:fixed;left:50%;bottom:40px;transform:translateX(-50%);background:#0f1f3a;color:#e9cd77;padding:12px 24px;border-radius:999px;font-size:14px;z-index:300;box-shadow:0 8px 30px rgba(15,31,58,.4);opacity:0;transition:.25s;";
      document.body.appendChild(el);
    }
    el.textContent = text;
    requestAnimationFrame(() => (el.style.opacity = "1"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.style.opacity = "0"), 2200);
  }

  // ---- 事件 ----
  sideNav.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-nav]"); if (!btn) return;
    const key = btn.dataset.nav;
    if (key === "__installed") {
      view = "installed"; currentCat = "all";
      instMode = false; instSel.clear();
      ensureAllInstalled();          // 首次进这个视图时拉注册表全量
    } else if (key === "__packages") {
      view = "packages"; currentCat = "all";
      ensurePackages();
    } else {
      view = "cat"; currentCat = key;
    }
    renderNav(); renderChips(); renderMain(); updateBatchN();
  });
  catChips.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]"); if (!btn) return;
    view = "cat"; currentCat = btn.dataset.cat;
    instMode = false; instSel.clear();
    renderNav(); renderChips(); renderMain(); updateBatchN();
  });
  appGrid.addEventListener("click", (e) => {
    // ---- 已安装列表 ----
    const pick = e.target.closest("[data-ipick]");
    if (pick) {
      const id = pick.dataset.ipick;
      pick.checked ? instSel.add(id) : instSel.delete(id);
      updateInstN();
      const row = pick.closest(".inst-row");
      if (row) row.classList.toggle("picked", pick.checked);
      return;
    }
    const iu = e.target.closest("[data-iuninst]");
    if (iu) { e.stopPropagation(); uninstallRows([findInstRow(iu.dataset.iuninst)]); return; }
    const io = e.target.closest("[data-iopen]");
    if (io) { e.stopPropagation(); openInstRow(findInstRow(io.dataset.iopen)); return; }

    // ---- 本地安装包 ----
    const pr = e.target.closest("[data-pkgrun]");
    if (pr) { e.stopPropagation(); runPackage(pr.dataset.pkgrun); return; }
    const pd = e.target.closest("[data-pkgdir]");
    if (pd) { e.stopPropagation(); if (isDesktop()) api().open_package_folder(pd.dataset.pkgdir); return; }
    if (e.target.closest("[data-pkgopen]")) { if (isDesktop()) api().open_package_folder(""); return; }
    if (e.target.closest("[data-pkgrefresh]")) { PKG = null; ensurePackages(true); return; }
    if (e.target.closest("[data-pkgchange]")) { changePackageDir(); return; }

    const chk = e.target.closest("[data-check]");
    if (chk) {
      const id = chk.dataset.check;
      chk.checked ? batchSel.add(id) : batchSel.delete(id);
      updateBatchN();
      return;
    }
    const dl = e.target.closest("[data-dl]");
    if (dl) { e.stopPropagation(); startInstall(dl.dataset.dl); return; }
    const op = e.target.closest("[data-open]");
    if (op) { e.stopPropagation(); startInstall(op.dataset.open); return; }
    const lc = e.target.closest("[data-launch]");
    if (lc) { e.stopPropagation(); doLaunch(lc.dataset.launch); return; }
    // 已安装列表整行点击 = 打开（注意别和卡片 data-id 冲突）
    if (view === "installed") {
      const row = e.target.closest("[data-row]");
      if (row) { openInstRow(findInstRow(row.dataset.row)); return; }
    }
    const card = e.target.closest("[data-id]"); if (card) openDetail(card.dataset.id);
  });
  $("modalBody").addEventListener("click", (e) => {
    const t = e.target.closest("[data-dl],[data-site],[data-open],[data-uninst],[data-opendir],[data-launch]");
    if (!t) return;
    if (t.dataset.dl) { closeDetail(); startInstall(t.dataset.dl); }
    else if (t.dataset.open) { startInstall(t.dataset.open); }
    else if (t.dataset.launch) { doLaunch(t.dataset.launch); closeDetail(); }
    else if (t.dataset.uninst) {
      if (confirm("确定卸载该软件？")) {
        api().uninstall(t.dataset.uninst);
        closeDetail();
      }
    } else if (t.dataset.opendir) { doOpenDir(t.dataset.opendir); }
    else if (t.dataset.site) {
      isDesktop() ? api().open_website(t.dataset.site) : window.open(t.dataset.site, "_blank", "noopener");
    }
  });
  $("dlList").addEventListener("click", (e) => {
    const retry = e.target.closest("[data-retry]");
    if (retry) {
      const id = retry.dataset.retry;
      upsertRec(id, { state: "busy", status: "重试中（断点续传）…" });
      renderDlList();
      api().retry_download(id);
      return;
    }
    const del = e.target.closest("[data-del]");
    if (del) { dlRecords.delete(del.dataset.del); updateDlBadge(); renderDlList(); }
  });
  // ===== 批量卸载（已安装视图）=====
  function setInstMode(on) {
    instMode = on;
    if (!on) instSel.clear();
    updateInstN();
    renderMain();
  }
  $("uninstToggle").addEventListener("click", () => setInstMode(true));
  $("uninstOff").addEventListener("click", () => setInstMode(false));
  $("uninstNone").addEventListener("click", () => { instSel.clear(); updateInstN(); renderMain(); });
  $("uninstAll").addEventListener("click", () => {
    const rows = _instRows || [];
    if (instSel.size >= rows.length) instSel.clear();
    else rows.forEach((r) => instSel.add(r.id));
    updateInstN();
    renderMain();
  });
  $("uninstGo").addEventListener("click", () => {
    if (!instSel.size) { toast("先勾选要卸载的软件"); return; }
    const rows = [...instSel].map((id) => findInstRow(id)).filter(Boolean);
    uninstallRows(rows);
  });

  searchInput.addEventListener("input", () => {
    query = searchInput.value.trim();
    clearSearch.hidden = !query;
    if (view === "installed") renderInstalled(); else renderGrid();
    updateBatchN();
  });
  clearSearch.addEventListener("click", () => {
    searchInput.value = ""; query = ""; clearSearch.hidden = true;
    if (view === "installed") renderInstalled(); else renderGrid();
    searchInput.focus();
  });
  $("resetFilter").addEventListener("click", () => {
    searchInput.value = ""; query = ""; currentCat = "all"; view = "cat";
    instMode = false; instSel.clear();
    clearSearch.hidden = true;
    renderNav(); renderChips(); renderMain();
  });
  sortSelect.addEventListener("change", () => {
    if (view === "installed") { instSort = sortSelect.value; renderInstalled(); return; }
    sortBy = sortSelect.value;
    renderGrid();
  });

  $("modalClose").addEventListener("click", closeDetail);
  $("detailModal").addEventListener("click", (e) => { if (e.target.id === "detailModal") closeDetail(); });
  $("dlMgrBtn").addEventListener("click", openDrawer);
  $("drawerClose").addEventListener("click", () => ($("dlDrawer").hidden = true));
  $("dlDrawer").addEventListener("click", (e) => { if (e.target.id === "dlDrawer") $("dlDrawer").hidden = true; });
  $("clearDl").addEventListener("click", () => { dlRecords.clear(); updateDlBadge(); renderDlList(); });

  // 设置弹窗
  $("settingsBtn").addEventListener("click", openSettings);
  $("settingsClose").addEventListener("click", () => ($("settingsModal").hidden = true));
  $("settingsModal").addEventListener("click", (e) => { if (e.target.id === "settingsModal") $("settingsModal").hidden = true; });
  $("browseDownload").addEventListener("click", () => browseDir("setDownloadDir", $("setDownloadDir").value));
  $("browseInstall").addEventListener("click", () => browseDir("setInstallDir", $("setInstallDir").value));
  $("saveSettings").addEventListener("click", () => {
    if (!isDesktop()) return;
    api().save_settings($("setDownloadDir").value, $("setInstallDir").value).then((r) => {
      if (r && r.ok) { SETTINGS = r.settings; toast("设置已保存"); $("settingsModal").hidden = true; }
      else toast("保存失败");
    });
  });
  $("resetSettings").addEventListener("click", () => {
    if (!isDesktop()) return;
    api().reset_settings().then((s) => { SETTINGS = s; $("setDownloadDir").value = s.download_dir; $("setInstallDir").value = s.install_dir; toast("已恢复默认"); });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== searchInput) { e.preventDefault(); searchInput.focus(); }
    if (e.key === "Escape") { closeDetail(); $("dlDrawer").hidden = true; $("settingsModal").hidden = true; }
  });
  const scroller = document.querySelector(".layout"); // 内容滚动容器（body 已禁止滚动）
  const backTop = $("backTop");
  scroller.addEventListener("scroll", () => { backTop.hidden = scroller.scrollTop < 400; }, { passive: true });
  backTop.addEventListener("click", () => scroller.scrollTo({ top: 0, behavior: "smooth" }));

  // ---- 无边框窗口控制（仅桌面版生效） ----
  function updateMaxIcon(maxed) {
    const b = $("winMax");
    b.title = maxed ? "还原" : "最大化";
    b.innerHTML = maxed
      ? '<svg viewBox="0 0 24 24" width="13" height="13"><rect x="8" y="8" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 15V6a1 1 0 0 1 1-1h9" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>'
      : '<svg viewBox="0 0 24 24" width="13" height="13"><rect x="5" y="5" width="14" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
  }
  function toggleMax() {
    if (!isDesktop()) return;
    api().win_toggle_max().then((r) => { if (r && r.ok) updateMaxIcon(!!r.maxed); });
  }
  $("winMin").addEventListener("click", () => { if (isDesktop()) api().win_minimize(); });
  $("winMax").addEventListener("click", toggleMax);
  $("winClose").addEventListener("click", () => {
    if (isDesktop()) {
      api().win_close();
      toast("已缩到系统托盘，双击托盘图标恢复");
    }
  });
  // 拖拽仅由 #dragHandle（.pywebview-drag-region）触发，这里只处理双击最大化；
  // 顶栏其它空白区域不再绑定任何指针事件，点一下不会进入拖拽状态
  $("dragHandle").addEventListener("dblclick", (e) => { e.preventDefault(); toggleMax(); });

  // ---- 边缘拉伸 ----
  // 无边框窗口的客户区铺满整个窗口矩形（没有非客户区可命中），WebView2 子窗口
  // 会吞掉 WM_NCHITTEST，所以边缘判定放在页面这层：命中后通知后端轮询光标拉伸。
  const EDGE = 6;
  function edgeAt(x, y) {
    const w = window.innerWidth, h = window.innerHeight;
    let e = "";
    if (x <= EDGE) e += "l";
    else if (x >= w - EDGE - 1) e += "r";
    if (y <= EDGE) e += "t";
    else if (y >= h - EDGE - 1) e += "b";
    return e;
  }
  document.addEventListener("mousedown", (e) => {
    if (e.button !== 0 || !isDesktop()) return;
    const edge = edgeAt(e.clientX, e.clientY);
    if (!edge) return;
    e.preventDefault();
    e.stopPropagation();
    api().start_resize(edge);
  }, true);
  // 光标反馈：只在边缘环内切 resize 指针，离开立即还原，不影响按钮的 pointer
  document.addEventListener("mousemove", (e) => {
    if (!isDesktop()) return;
    const edge = edgeAt(e.clientX, e.clientY);
    if (!edge) { document.body.style.cursor = ""; return; }
    const diag = (edge.includes("l") || edge.includes("r")) && (edge.includes("t") || edge.includes("b"));
    const lr = edge.includes("l") || edge.includes("r");
    if (diag) {
      document.body.style.cursor = (edge === "lt" || edge === "rb") ? "nwse-resize" : "nesw-resize";
    } else {
      document.body.style.cursor = lr ? "ew-resize" : "ns-resize";
    }
  }, true);
  // 松开/失焦即结束拉伸（后端另有按键状态兜底）
  document.addEventListener("mouseup", () => { if (isDesktop()) api().stop_resize(); }, true);
  window.addEventListener("blur", () => { if (isDesktop()) api().stop_resize(); });
  document.addEventListener("mouseleave", () => { document.body.style.cursor = ""; });

  // ---- 启动 ----
  renderAll(); // 先用 data.js 渲染（file:// 立即可见）
  window.addEventListener("pywebviewready", () => {
    document.body.classList.add("desktop"); // 桌面无边框模式：显示窗口控制按钮
    api().get_state().then((st) => {
      if (st && st.apps && st.apps.length) {
        CATS = st.categories; APPS_DATA = st.apps; SETTINGS = st.settings;
        INSTALLED = st.installed || {};
        renderAll();
      }
      // 侧栏「已安装软件」的角标要用注册表全量，后台静默拉一次（不动当前视图）
      if (isDesktop()) {
        api().list_all_installed().then((l) => {
          ALL_INSTALLED = Array.isArray(l) ? l : [];
          _instRows = null;
          renderNav();
        });
      }
    });
  });
})();
