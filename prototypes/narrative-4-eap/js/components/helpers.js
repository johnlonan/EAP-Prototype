/* ═══════════════════════════════════════════════════════
   HELPERS.JS — Shared HTML builders used across tabs
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

// Drag grip
EAP._G = '<span class="dg">' + (EAP.icon ? EAP.icon.grip(12) : '') + '</span>';
EAP._GT = '<td style="width:24px;padding:8px 4px">' + EAP._G + '</td>';
EAP._ADD = EAP.icon ? EAP.icon('plus', 12) : '';
EAP._TH0 = '<th style="width:24px;padding:8px 4px"></th>';

// Detail panel opens via delegated click on .item-nm / .record-num / .bcard
// See render.js renderContent() for the event delegation logic.

// Type icon colours
// Type identity colours — intentionally distinct from status tokens.
// Defect uses --color-error (#e2161c), feature uses --color-info (#2a6edc).
EAP._typeColors = { goal:'#4d4c4a', epic:'#6d28d9', capability:'#0369a1', feature:'#2a6edc', story:'#8B5CF6', defect:'#e2161c',
  Goal:'#4d4c4a', Epic:'#6d28d9', Capability:'#0369a1', Feature:'#2a6edc', Story:'#8B5CF6', Defect:'#e2161c', 'Case Task':'#db2777', 'Work Item':'#8B5CF6' };

// Type pill — filled tinted pill with type icon + label.
// Differentiates from state pill (no icon) by containing an icon glyph.
EAP.typeCell = function(type) {
  if (!type) return '';
  var key = type.toLowerCase();
  var iconKey = key === 'case task' ? 'clipboard-check' : key;
  var slug = key.replace(/\s+/g, '-');
  var iconHtml = EAP.icon ? EAP.icon(iconKey, 11) : '';
  return '<span class="type-pill type-pill-' + slug + '">' + iconHtml + ' ' + type + '</span>';
};

// Avatar — renders image or initials fallback
EAP.avatar = function(ownerKey, size) {
  var sz = size || 24;
  var p = EAP.people ? EAP.people[ownerKey] : null;
  if (!p) return '';
  if (p.avatar) {
    return '<img src="' + p.avatar + '" alt="' + p.initials + '" title="' + p.name + '" style="width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1.5px solid rgba(255,255,255,0.8);">';
  }
  return '<span title="' + p.name + '" style="display:inline-flex;align-items:center;justify-content:center;width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;background:' + p.color + ';color:#fff;font-size:' + Math.round(sz * 0.4) + 'px;font-weight:600;flex-shrink:0;border:1.5px solid rgba(255,255,255,0.8);">' + p.initials + '</span>';
};

// State pill
EAP.pill = function(st) { return '<span class="st-pill ' + EAP.stateClass(st) + '">' + st + '</span>'; };

// Progress bar
EAP.pbar = function(p, st) {
  if (p === undefined || p === null) return '';
  return '<div class="pb"><div class="pb-t"><div class="pb-f ' + EAP.progressBarClass(st) + '" style="width:' + Math.min(p, 100) + '%"></div></div><span class="pb-l">' + p + '%</span></div>';
};

// Subtle pill (for board cards)
EAP.subtlePill = function(st) {
  var m = {
    Funnel: 'rgba(0,0,0,0.04);color:var(--text-tertiary)', Backlog: 'rgba(0,0,0,0.04);color:var(--text-tertiary)',
    Implementation: 'rgba(154,52,18,0.08);color:#9a3412', Blocked: 'rgba(226,22,28,0.08);color:var(--color-error)',
    'In Progress': 'rgba(42,110,220,0.08);color:var(--color-info)', Done: 'rgba(0,131,79,0.08);color:var(--color-success)',
    Analysis: 'rgba(109,40,217,0.08);color:#6d28d9', Draft: 'rgba(0,0,0,0.04);color:var(--text-tertiary)',
    Planned: 'rgba(0,0,0,0.04);color:var(--text-tertiary)', 'To Do': 'rgba(0,0,0,0.04);color:var(--text-tertiary)',
    'In Review': 'rgba(109,40,217,0.08);color:#6d28d9', 'At Risk': 'rgba(141,110,0,0.08);color:var(--color-warning)'
  };
  return '<span style="display:inline-flex;font-size:9px;font-weight:400;padding:2px 6px;border-radius:9999px;white-space:nowrap;background:' + (m[st] || m.Funnel) + '">' + st + '</span>';
};

// ── Pagination ────────────────────────────────────────
// State: EAP.state.pagination[groupId] = {page:0, perPage:10}
EAP.pgGet = function(gid) {
  if (!EAP.state.pagination) EAP.state.pagination = {};
  if (!EAP.state.pagination[gid]) EAP.state.pagination[gid] = {page: 0, perPage: 10};
  return EAP.state.pagination[gid];
};

// Slice items for current page (returns all if search active)
EAP.pgSlice = function(items, gid) {
  var si = document.querySelector('.chrome-search');
  if (si && si.value && si.value.trim()) return items; // bypass during search
  var pg = EAP.pgGet(gid);
  if (pg.perPage <= 0) return items; // "All"
  var start = pg.page * pg.perPage;
  return items.slice(start, start + pg.perPage);
};

// Render pagination footer
EAP.pgFooter = function(total, gid) {
  var pg = EAP.pgGet(gid);
  var perPage = pg.perPage;
  if (perPage <= 0) perPage = total; // "All" mode
  var pages = Math.max(1, Math.ceil(total / perPage));
  if (pg.page >= pages) pg.page = pages - 1;
  var start = pg.page * perPage + 1;
  var end = Math.min(start + perPage - 1, total);
  if (total === 0) { start = 0; end = 0; }
  var isFirst = pg.page === 0, isLast = pg.page >= pages - 1;

  return '<div class="pg-footer" data-pg="' + gid + '">' +
    '<div class="pg-left"><span class="pg-label">Rows per page</span>' +
    '<select class="pg-select" data-pg-select="' + gid + '">' +
      [10, 25, 50].map(function(n) { return '<option value="' + n + '"' + (pg.perPage === n ? ' selected' : '') + '>' + n + '</option>'; }).join('') +
      '<option value="0"' + (pg.perPage <= 0 ? ' selected' : '') + '>All</option>' +
    '</select></div>' +
    '<div class="pg-right"><span class="pg-range">' + start + '–' + end + ' of ' + total + '</span>' +
    '<button class="pg-btn' + (isFirst ? ' disabled' : '') + '" data-pg-prev="' + gid + '"' + (isFirst ? ' disabled' : '') + '>‹</button>' +
    '<button class="pg-btn' + (isLast ? ' disabled' : '') + '" data-pg-next="' + gid + '"' + (isLast ? ' disabled' : '') + '>›</button></div>' +
  '</div>';
};

// Wire pagination events (call after render)
EAP.pgWire = function() {
  document.querySelectorAll('[data-pg-select]').forEach(function(sel) {
    sel.addEventListener('change', function() {
      var gid = sel.getAttribute('data-pg-select');
      var pg = EAP.pgGet(gid);
      pg.perPage = parseInt(sel.value, 10);
      pg.page = 0;
      EAP.render();
    });
  });
  document.querySelectorAll('[data-pg-prev]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var gid = btn.getAttribute('data-pg-prev');
      var pg = EAP.pgGet(gid);
      if (pg.page > 0) { pg.page--; EAP.render(); }
    });
  });
  document.querySelectorAll('[data-pg-next]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var gid = btn.getAttribute('data-pg-next');
      var pg = EAP.pgGet(gid);
      var perPage = pg.perPage <= 0 ? Infinity : pg.perPage;
      // We need total count — stored in data attribute
      var footer = btn.closest('.pg-footer');
      var rangeText = footer ? footer.querySelector('.pg-range') : null;
      if (rangeText) {
        var m = rangeText.textContent.match(/of (\d+)/);
        if (m) {
          var total = parseInt(m[1], 10);
          var pages = Math.ceil(total / perPage);
          if (pg.page < pages - 1) { pg.page++; EAP.render(); }
        }
      }
    });
  });
};

// ── WSJF rank action ──────────────────────────────────
// Header with sort button
EAP._wsjfTh = function() {
  var active = EAP.state.wsjfSort === 'desc';
  return '<th>WSJF <button class="wsjf-rank' + (active ? ' active' : '') + '" data-wsjf-rank title="Rank by WSJF">' +
    '<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><polygon points="5,1 9,6 1,6"/></svg>' +
    '</button></th>';
};

// Sort items by WSJF descending (returns new array)
EAP.wsjfSorted = function(items) {
  if (EAP.state.wsjfSort !== 'desc') return items;
  return items.slice().sort(function(a, b) { return (b.wsjf || 0) - (a.wsjf || 0); });
};

// Wire WSJF rank buttons
EAP.wsjfWire = function() {
  document.querySelectorAll('[data-wsjf-rank]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      EAP.state.wsjfSort = EAP.state.wsjfSort === 'desc' ? null : 'desc';
      // Reset pagination to page 0 when sorting
      EAP.state.pagination = {};
      EAP.render();
    });
  });
};

// WSJF tier — colour the value by priority band.
// Range across N4 data is ~4–18; hard cutoffs read more legibly than
// runtime quartile against a shifting visible set.
EAP.wsjfTier = function(v) {
  if (v == null) return '';
  if (v >= 12) return 'wsjf-high';
  if (v >= 7)  return 'wsjf-mid';
  return 'wsjf-low';
};

EAP.wsjfCell = function(item) {
  if (!item || item.wsjf == null) return '<span class="wsjf">—</span>';
  return '<span class="wsjf ' + EAP.wsjfTier(item.wsjf) + '" data-wsjf-id="' + item.id + '" tabindex="0">' + item.wsjf + '</span>';
};

// ── WSJF breakdown — deterministic from item id ───────
// SAFe WSJF = CoD / Size where CoD = BV + TC + RR.
// We don't store sub-scores; we derive plausible 0–10 values from
// a hash of the item id so each item shows a stable breakdown.
EAP.wsjfBreakdown = function(item) {
  if (!item || !item.wsjf) return null;
  var id = item.id || '';
  var hash = 0;
  for (var i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  hash = Math.abs(hash);
  var bv = 5 + (hash % 5);                  // 5..9
  var tc = 3 + ((hash >> 4) % 6);           // 3..8
  var rr = 2 + ((hash >> 8) % 6);           // 2..7
  var size = Math.max(1, Math.min(10, Math.round((bv + tc + rr) / item.wsjf)));
  return { bv: bv, tc: tc, rr: rr, size: size, total: item.wsjf };
};

// Find an item by id across all data sources (for popover lookup)
EAP._findItemById = function(id) {
  if (!id) return null;
  var pools = [].concat(EAP.allFeatures || [], (EAP.epics && EAP.epics.all) || [], (EAP.capabilities && EAP.capabilities.all) || []);
  (EAP.workItems && EAP.workItems.sprints || []).forEach(function(sp) { pools = pools.concat(sp.items || []); });
  var bl = (EAP.workItems && EAP.workItems.backlog) || {};
  ['Story','Defect','CaseTask'].forEach(function(k) { pools = pools.concat(bl[k] || []); });
  for (var i = 0; i < pools.length; i++) if (pools[i].id === id) return pools[i];
  return null;
};

// ── WSJF popover ──────────────────────────────────────
EAP._wsjfHoverTimer = null;
EAP._wsjfHidetimer = null;
EAP._wsjfSticky = false;

EAP.showWsjfPopover = function(anchor, item, sticky) {
  var br = EAP.wsjfBreakdown(item);
  if (!br) return;
  EAP.hideWsjfPopover(true);
  EAP._wsjfSticky = !!sticky;

  var pop = document.createElement('div');
  pop.id = 'wsjf-popover';
  pop.className = 'wsjf-popover' + (sticky ? ' is-sticky' : '');
  var components = [
    { lbl: 'Business Value',   v: br.bv,   bg: 'var(--color-info)' },
    { lbl: 'Time Criticality', v: br.tc,   bg: '#D97706' },
    { lbl: 'Risk Reduction',   v: br.rr,   bg: 'var(--color-success)' },
    { lbl: 'Job Size',         v: br.size, bg: 'var(--text-tertiary)', dim: true }
  ];
  var rows = components.map(function(c) {
    return '<div class="wsjf-pop-row">' +
      '<span class="wsjf-pop-lbl">' + c.lbl + '</span>' +
      '<div class="wsjf-pop-bar"><div class="wsjf-pop-fill" style="width:' + (c.v * 10) + '%;background:' + c.bg + ';' + (c.dim ? 'opacity:0.6;' : '') + '"></div></div>' +
      '<span class="wsjf-pop-val">' + c.v + '<span class="wsjf-pop-max">/10</span></span>' +
      '</div>';
  }).join('');
  pop.innerHTML =
    '<div class="wsjf-pop-hd">' +
      '<span class="wsjf-pop-hd-lbl">WSJF Score</span>' +
      '<span class="wsjf-pop-hd-val">' + br.total + '</span>' +
    '</div>' +
    '<div class="wsjf-pop-formula">CoD ÷ Job Size = (BV + TC + RR) ÷ Size</div>' +
    '<div class="wsjf-pop-rows">' + rows + '</div>';

  document.body.appendChild(pop);
  var aR = anchor.getBoundingClientRect();
  var w = pop.offsetWidth, h = pop.offsetHeight;
  var vw = window.innerWidth, vh = window.innerHeight;
  var left = Math.min(Math.max(8, aR.left + aR.width / 2 - w / 2), vw - w - 8);
  var top = aR.top - h - 10;
  if (top < 8) top = Math.min(aR.bottom + 10, vh - h - 8);
  pop.style.left = left + 'px';
  pop.style.top = top + 'px';

  // Hover-bridge: keep popover open while pointer is over it
  pop.addEventListener('mouseenter', function() { clearTimeout(EAP._wsjfHidetimer); });
  pop.addEventListener('mouseleave', function() {
    if (!EAP._wsjfSticky) EAP._wsjfHidetimer = setTimeout(EAP.hideWsjfPopover, 100);
  });
};

EAP.hideWsjfPopover = function(force) {
  if (EAP._wsjfSticky && !force) return;
  var existing = document.getElementById('wsjf-popover');
  if (existing) existing.remove();
  EAP._wsjfSticky = false;
};

// Wire delegated hover/click on .wsjf cells. Call once after render.
EAP.wsjfPopoverWire = function() {
  // Use document-level delegation so we don't need to re-wire after every render
  if (EAP._wsjfWired) return;
  EAP._wsjfWired = true;

  document.addEventListener('mouseover', function(e) {
    var el = e.target.closest && e.target.closest('.wsjf');
    if (!el || EAP._wsjfSticky) return;
    var id = el.getAttribute('data-wsjf-id');
    if (!id) return;
    clearTimeout(EAP._wsjfHoverTimer);
    clearTimeout(EAP._wsjfHidetimer);
    EAP._wsjfHoverTimer = setTimeout(function() {
      var item = EAP._findItemById(id);
      if (item) EAP.showWsjfPopover(el, item, false);
    }, 200);
  });
  document.addEventListener('mouseout', function(e) {
    var el = e.target.closest && e.target.closest('.wsjf');
    if (!el || EAP._wsjfSticky) return;
    clearTimeout(EAP._wsjfHoverTimer);
    EAP._wsjfHidetimer = setTimeout(EAP.hideWsjfPopover, 100);
  });
  document.addEventListener('click', function(e) {
    var el = e.target.closest && e.target.closest('.wsjf');
    if (el) {
      e.stopPropagation();
      var id = el.getAttribute('data-wsjf-id');
      var item = id ? EAP._findItemById(id) : null;
      if (item) EAP.showWsjfPopover(el, item, true);
      return;
    }
    // Click outside: clear sticky
    if (EAP._wsjfSticky && !e.target.closest('#wsjf-popover')) {
      EAP._wsjfSticky = false;
      EAP.hideWsjfPopover();
    }
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && EAP._wsjfSticky) {
      EAP._wsjfSticky = false;
      EAP.hideWsjfPopover();
    }
  });
};

// ── Goal cell — truncated for table display ───────────
EAP.goalCell = function(gid) {
  var name = EAP.goalName(gid);
  if (!name) return '<span class="par">—</span>';
  var short = name.length > 28 ? name.substring(0, 26) + '…' : name;
  return '<span class="par" title="' + name + '">' + short + '</span>';
};

// ── Owner cell — avatar + name ─────────────────────────
EAP.ownerCell = function(key) {
  if (!key) return '<span class="par">—</span>';
  var p = EAP.people ? EAP.people[key] : null;
  var name = p ? p.name : key;
  return '<span class="owner-cell">' + EAP.avatar(key, 20) + ' ' + name + '</span>';
};

// ── Backlog column definitions ─────────────────────────
EAP.bkCols = function() {
  var s = EAP.state;
  if (s.level === 'Epic') return {
    h: EAP._TH0 + '<th>Number</th><th>Name</th><th>State</th><th>Parent</th><th>Owner</th>' + EAP._wsjfTh() + '<th>ST</th><th>Primary Goal</th>',
    r: function(i) { return EAP._GT + '<td><span class="record-num">' + (i.num || '') + '</span></td><td><span class="item-nm">' + i.name + '</span></td><td>' + EAP.pill(i.state) + '</td><td><span class="par">' + (i.parent || '—') + '</span></td><td>' + EAP.ownerCell(i.owner) + '</td><td>' + EAP.wsjfCell(i) + '</td><td><span class="tm">' + (i.st || '—') + '</span></td><td>' + EAP.goalCell(i.goal) + '</td>'; }
  };
  if (s.level === 'Capability') return {
    h: EAP._TH0 + '<th>Number</th><th>Name</th><th>State</th><th>Parent</th><th>Owner</th>' + EAP._wsjfTh() + '<th>ART</th><th>Primary Goal</th>',
    r: function(i) { return EAP._GT + '<td><span class="record-num">' + (i.num || '') + '</span></td><td><span class="item-nm">' + i.name + '</span></td><td>' + EAP.pill(i.state) + '</td><td><span class="par">' + (i.parent || '—') + '</span></td><td>' + EAP.ownerCell(i.owner) + '</td><td>' + EAP.wsjfCell(i) + '</td><td><span class="tm">' + (i.art || '—') + '</span></td><td>' + EAP.goalCell(i.goal) + '</td>'; }
  };
  if (s.level === 'WorkItem') return {
    h: EAP._TH0 + '<th>Number</th><th>Name</th><th>Type</th><th>State</th><th>Parent</th><th>Assigned to</th><th>Pts</th><th>Team</th><th>Primary Goal</th>',
    r: function(i) { return EAP._GT + '<td><span class="record-num">' + (i.num || '') + '</span></td><td><span class="item-nm">' + i.name + '</span></td><td>' + EAP.typeCell(i.type || 'Story') + '</td><td>' + EAP.pill(i.state) + '</td><td><span class="par">' + (i.parent || '—') + '</span></td><td>' + EAP.ownerCell(i.owner) + '</td><td><span class="sz">' + (i.pts || '') + '</span></td><td><span class="tm">' + (i.team || '—') + '</span></td><td>' + EAP.goalCell(i.goal) + '</td>'; }
  };
  // Feature
  return {
    h: EAP._TH0 + '<th>Number</th><th>Name</th><th>State</th><th>Parent</th><th>Owner</th>' + EAP._wsjfTh() + '<th>Team</th><th>Primary Goal</th>',
    r: function(i) { return EAP._GT + '<td><span class="record-num">' + (i.num || '') + '</span></td><td><span class="item-nm">' + i.name + '</span></td><td>' + EAP.pill(i.state) + '</td><td><span class="par">' + (i.parent || '—') + '</span></td><td>' + EAP.ownerCell(i.owner) + '</td><td>' + EAP.wsjfCell(i) + '</td><td><span class="tm">' + (i.team || '—') + '</span></td><td>' + EAP.goalCell(i.goal) + '</td>'; }
  };
};

// ── List/Board view column definitions ─────────────────
EAP.lsCols = function() {
  var s = EAP.state;
  if (s.level === 'Epic') return {
    h: EAP._TH0 + '<th>Number</th><th>Name</th><th>State</th><th>Parent</th><th>Owner</th>' + EAP._wsjfTh() + '<th>ST</th><th>% Complete</th><th>Primary Goal</th>',
    r: function(i) { return EAP._GT + '<td><span class="record-num">' + (i.num || '') + '</span></td><td><span class="item-nm">' + i.name + '</span></td><td>' + EAP.pill(i.state) + '</td><td><span class="par">' + (i.parent || '—') + '</span></td><td>' + EAP.ownerCell(i.owner) + '</td><td>' + EAP.wsjfCell(i) + '</td><td><span class="tm">' + (i.st || '') + '</span></td><td>' + EAP.pbar(i.pct, i.state) + '</td><td>' + EAP.goalCell(i.goal) + '</td>'; }
  };
  if (s.level === 'Capability') return {
    h: EAP._TH0 + '<th>Number</th><th>Name</th><th>State</th><th>Parent</th><th>Owner</th>' + EAP._wsjfTh() + '<th>ART</th><th>% Complete</th><th>Primary Goal</th>',
    r: function(i) { return EAP._GT + '<td><span class="record-num">' + (i.num || '') + '</span></td><td><span class="item-nm">' + i.name + '</span></td><td>' + EAP.pill(i.state) + '</td><td><span class="par">' + (i.parent || '—') + '</span></td><td>' + EAP.ownerCell(i.owner) + '</td><td>' + EAP.wsjfCell(i) + '</td><td><span class="tm">' + (i.art || '') + '</span></td><td>' + EAP.pbar(i.pct, i.state) + '</td><td>' + EAP.goalCell(i.goal) + '</td>'; }
  };
  if (s.level === 'WorkItem') return {
    h: EAP._TH0 + '<th>Number</th><th>Name</th><th>Type</th><th>State</th><th>Parent</th><th>Assigned to</th><th>Pts</th><th>% Complete</th><th>Team</th><th>Primary Goal</th>',
    r: function(i) { return EAP._GT + '<td><span class="record-num">' + (i.num || '') + '</span></td><td><span class="item-nm">' + i.name + '</span></td><td>' + EAP.typeCell(i.type || 'Story') + '</td><td>' + EAP.pill(i.state) + '</td><td><span class="par">' + (i.parent || '—') + '</span></td><td>' + EAP.ownerCell(i.owner) + '</td><td><span class="sz">' + (i.pts || '') + '</span></td><td>' + EAP.pbar(i.pct, i.state) + '</td><td><span class="tm">' + (i.team || '') + '</span></td><td>' + EAP.goalCell(i.goal) + '</td>'; }
  };
  // Feature
  return {
    h: EAP._TH0 + '<th>Number</th><th>Name</th><th>State</th><th>Parent</th><th>Owner</th>' + EAP._wsjfTh() + '<th>Team</th><th>% Complete</th><th>Primary Goal</th>',
    r: function(i) { return EAP._GT + '<td><span class="record-num">' + (i.num || '') + '</span></td><td><span class="item-nm">' + i.name + '</span></td><td>' + EAP.pill(i.state) + '</td><td><span class="par">' + (i.parent || '—') + '</span></td><td>' + EAP.ownerCell(i.owner) + '</td><td>' + EAP.wsjfCell(i) + '</td><td><span class="tm">' + (i.team || '') + '</span></td><td>' + EAP.pbar(i.pct, i.state) + '</td><td>' + EAP.goalCell(i.goal) + '</td>'; }
  };
};

// ── List backlog columns — no % Complete, no State, no Type for non-WI ──
EAP.lsBlCols = function() {
  var s = EAP.state;
  if (s.level === 'Epic') return {
    h: EAP._TH0 + '<th>Number</th><th>Name</th><th>Parent</th><th>Owner</th>' + EAP._wsjfTh() + '<th>ST</th><th>Primary Goal</th>',
    r: function(i) { return EAP._GT + '<td><span class="record-num">' + (i.num || '') + '</span></td><td><span class="item-nm">' + i.name + '</span></td><td><span class="par">' + (i.parent || '—') + '</span></td><td>' + EAP.ownerCell(i.owner) + '</td><td>' + EAP.wsjfCell(i) + '</td><td><span class="tm">' + (i.st || '') + '</span></td><td>' + EAP.goalCell(i.goal) + '</td>'; }
  };
  if (s.level === 'Capability') return {
    h: EAP._TH0 + '<th>Number</th><th>Name</th><th>Parent</th><th>Owner</th>' + EAP._wsjfTh() + '<th>ART</th><th>Primary Goal</th>',
    r: function(i) { return EAP._GT + '<td><span class="record-num">' + (i.num || '') + '</span></td><td><span class="item-nm">' + i.name + '</span></td><td><span class="par">' + (i.parent || '—') + '</span></td><td>' + EAP.ownerCell(i.owner) + '</td><td>' + EAP.wsjfCell(i) + '</td><td><span class="tm">' + (i.art || '') + '</span></td><td>' + EAP.goalCell(i.goal) + '</td>'; }
  };
  if (s.level === 'WorkItem') return {
    h: EAP._TH0 + '<th>Number</th><th>Name</th><th>Type</th><th>Parent</th><th>Assigned to</th><th>Pts</th><th>Team</th><th>Primary Goal</th>',
    r: function(i) { return EAP._GT + '<td><span class="record-num">' + (i.num || '') + '</span></td><td><span class="item-nm">' + i.name + '</span></td><td>' + EAP.typeCell(i.type || 'Story') + '</td><td><span class="par">' + (i.parent || '—') + '</span></td><td>' + EAP.ownerCell(i.owner) + '</td><td><span class="sz">' + (i.pts || '') + '</span></td><td><span class="tm">' + (i.team || '') + '</span></td><td>' + EAP.goalCell(i.goal) + '</td>'; }
  };
  // Feature
  return {
    h: EAP._TH0 + '<th>Number</th><th>Name</th><th>Parent</th><th>Owner</th>' + EAP._wsjfTh() + '<th>Team</th><th>Primary Goal</th>',
    r: function(i) { return EAP._GT + '<td><span class="record-num">' + (i.num || '') + '</span></td><td><span class="item-nm">' + i.name + '</span></td><td><span class="par">' + (i.parent || '—') + '</span></td><td>' + EAP.ownerCell(i.owner) + '</td><td>' + EAP.wsjfCell(i) + '</td><td><span class="tm">' + (i.team || '') + '</span></td><td>' + EAP.goalCell(i.goal) + '</td>'; }
  };
};
