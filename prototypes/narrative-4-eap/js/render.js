/* ═══════════════════════════════════════════════════════
   RENDER.JS — Orchestrator (chrome, filter bar, routing)
   Tab renderers are in js/tabs/*.js
   Shared helpers in js/components/helpers.js
   Insights in js/components/insights.js

   Tab names are defined in EAP.tabConfig (state.js).
   To rename a tab: edit the label there. IDs are stable.
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

// ── Main render ────────────────────────────────────────
EAP.render = function() {
  EAP.renderChrome();
  EAP.renderFilterBar();
  EAP.renderContent();
  EAP.renderInsights();
  if (EAP.renderCharts) EAP.renderCharts();
};

// ── Chrome ─────────────────────────────────────────────
EAP.renderChrome = function() {
  var s = EAP.state;
  var tl = { portfolio: 'Portfolio', 'solution-train': 'Sol. Train', art: 'ART', team: 'Team' };
  var el = document.getElementById('chrome-bar');
  if (!el) return;

  el.innerHTML =
    '<div class="chrome-dd-wrap"><span class="chrome-dd-label">Scope</span>' +
      '<div class="art-sel" id="ctx-sel-btn"><span class="art-sel-badge">' + tl[s.context] + '</span>' +
      '<span class="art-sel-name">' + s.contextName + '</span><span class="chev"></span></div></div>' +
    '<div class="chrome-center"><div class="tab-group">' +
      EAP.tabConfig.map(function(t) {
        return '<button class="tab-item' + (s.tab === t.id ? ' active' : '') + '" data-tab="' + t.id + '">' + t.label + '</button>';
      }).join('') +
    '</div></div>' +
    '<div style="flex:1;"></div>' +
    '<div class="search-wrap">' +
      '<input type="text" class="chrome-search" placeholder="Search features, stories, teams…">' +
      '<button class="search-clear" id="search-clear">' + EAP.icon('x', 12) + '</button>' +
    '</div>';

  el.querySelectorAll('[data-tab]').forEach(function(b) {
    b.addEventListener('click', function() { EAP.setTab(b.dataset.tab); });
  });

  // Search clear button
  var clearBtn = document.getElementById('search-clear');
  if (clearBtn) clearBtn.addEventListener('click', function() {
    var si = el.querySelector('.chrome-search');
    if (si) { si.value = ''; si.focus(); }
    EAP.applySearch('');
  });
};

// ── Filter Bar ─────────────────────────────────────────
EAP.renderFilterBar = function() {
  var s = EAP.state, levels = EAP.contextLevels[s.context] || [];
  var el = document.getElementById('filter-bar');
  if (!el) return;
  var h = '';

  if (s.tab === 'hierarchy') {
    s.hierHide = s.hierHide || {};
    h += '<span class="fbar-label">PI</span>' +
      '<select class="fbar-select" id="hier-pi-sel"><option value="All">All PIs</option><option value="PI 26">PI 26 — Current</option><option value="PI 27">PI 27</option></select>' +
      '<div class="fbar-sep"></div><span class="fbar-label">Show</span>' +
      ['Capability', 'Feature', 'Story'].map(function(lv) {
        var checked = !s.hierHide[lv];
        var iconName = checked ? 'check-square' : 'square';
        return '<span class="hier-check-pill' + (checked ? ' checked' : '') + '" data-hier-check="' + lv + '">' +
          EAP.icon(iconName, 14) + ' ' + lv + '</span>';
      }).join('') +
      '<div class="fbar-spacer"></div>';
  } else {
    // Level icon prefix + select
    var levelIconKey = s.level === 'WorkItem' ? 'story' : s.level.toLowerCase();
    var levelColor = EAP._typeColors ? (EAP._typeColors[s.level] || '#6B7280') : '#6B7280';
    h += '<span class="fbar-label">Level</span>' +
      '<span style="display:inline-flex;align-items:center;gap:4px;color:' + levelColor + ';">' + EAP.icon(levelIconKey, 14) + '</span>' +
      '<select class="fbar-select" id="level-select">' +
      levels.map(function(l) { return '<option value="' + l.value + '"' + (s.level === l.value ? ' selected' : '') + '>' + l.label + '</option>'; }).join('') +
      '</select>';

    if ((s.tab === 'board' || s.tab === 'planning') && s.level === 'WorkItem') {
      h += '<div class="fbar-sep"></div><span class="fbar-label">' + EAP.icon('calendar', 12) + '</span>' +
        '<select class="fbar-select" id="pi-select"><option>PI 26 — Current</option><option>PI 25</option><option>PI 24</option></select>';
    }

    h += '<div class="fbar-sep"></div>' +
      '<button class="fbar-filter">' + EAP.icon('filter', 14) + ' Filter</button>';
    if (s.tab !== 'taskboard') {
      var mineLabel = (s.level === 'WorkItem') ? 'Assigned to me' : 'Owned by me';
      h += '<span class="fbar-chip' + (s.mineOnly ? ' on' : '') + '" id="mine-toggle">' + EAP.icon('user', 12) + ' ' + mineLabel + (s.mineOnly ? ' <span class="cx">' + EAP.icon('x', 10) + '</span>' : '') + '</span>';
    }
    h += '<div class="fbar-spacer"></div>';
  }

  // Right-side toggles — all with icons
  if (s.tab === 'planning') h += '<span class="fbar-vtog' + (s.splitView ? ' on' : '') + '" id="split-toggle">' + EAP.icon('columns', 14) + ' Split</span>';
  if ((s.tab === 'board' || s.tab === 'taskboard' || s.tab === 'timeline') && (s.level === 'Feature' || s.level === 'WorkItem')) {
    h += '<span class="fbar-vtog' + (s.showDeps ? ' on' : '') + '" id="deps-toggle">' + EAP.icon('link', 14) + ' Dependencies</span>';
    if (s.showDeps) {
      var df = s.depFilter || 'all';
      h += '<span class="fbar-chip dep-chip' + (df === 'all' ? ' on' : '') + '" data-dep-filter="all">All</span>';
      h += '<span class="fbar-chip dep-chip dep-chip-conflict' + (df === 'conflict' ? ' on' : '') + '" data-dep-filter="conflict">Conflicts</span>';
      h += '<span class="fbar-chip dep-chip dep-chip-risk' + (df === 'risk' ? ' on' : '') + '" data-dep-filter="risk">Risks</span>';
      h += '<span class="fbar-chip dep-chip dep-chip-ok' + (df === 'ok' ? ' on' : '') + '" data-dep-filter="ok">Resolved</span>';
    }
  }
  if (s.tab === 'board') h += '<span class="fbar-vtog' + (s.boardDensity === 'compact' ? ' on' : '') + '" id="density-toggle">' + EAP.icon('rows', 14) + ' Compact</span>';
  h += '<span class="fbar-vtog' + (s.insightsOpen ? ' on' : '') + '" id="insights-toggle">' + EAP.icon('info', 14) + ' Insights</span>';

  el.innerHTML = h;

  // Wire events
  var ls = document.getElementById('level-select');
  if (ls) ls.addEventListener('change', function() { EAP.setLevel(this.value); });
  var mt = document.getElementById('mine-toggle');
  if (mt) mt.addEventListener('click', function() { EAP.toggleMineOnly(); });
  var sb = document.getElementById('split-toggle');
  if (sb) sb.addEventListener('click', function() { EAP.toggleSplit(); });
  document.getElementById('insights-toggle').addEventListener('click', function() { EAP.toggleInsights(); });
  var db = document.getElementById('deps-toggle');
  if (db) db.addEventListener('click', function() { EAP.state.showDeps = !EAP.state.showDeps; if (!EAP.state.showDeps) EAP.state.depFilter = 'all'; EAP.render(); });
  document.querySelectorAll('[data-dep-filter]').forEach(function(chip) {
    chip.addEventListener('click', function() { EAP.state.depFilter = chip.dataset.depFilter; EAP.render(); });
  });
  var dn = document.getElementById('density-toggle');
  if (dn) dn.addEventListener('click', function() { EAP.state.boardDensity = EAP.state.boardDensity === 'compact' ? 'default' : 'compact'; EAP.render(); });

  // Hierarchy show/hide toggles
  document.querySelectorAll('[data-hier-check]').forEach(function(pill) {
    pill.addEventListener('click', function() {
      var lv = pill.dataset.hierCheck;
      EAP.state.hierHide = EAP.state.hierHide || {};
      EAP.state.hierHide[lv] = !EAP.state.hierHide[lv];
      EAP.render();
    });
  });
};

// ── Content routing ────────────────────────────────────
EAP.renderContent = function() {
  var s = EAP.state;
  var el = document.getElementById('content-area');
  if (!el) return;

  var h = '';
  if (s.tab === 'backlog')   h = EAP.renderBacklog();
  if (s.tab === 'planning')  h = EAP.renderList();
  if (s.tab === 'timeline')  h = EAP.renderTimeline();
  if (s.tab === 'board')     h = EAP.renderBoard();
  if (s.tab === 'taskboard') h = EAP.renderTrack();
  if (s.tab === 'hierarchy') h = EAP.renderHierarchy();
  if (s.insightsOpen) h += '<div class="gpanel ins-panel" id="insights-panel"></div>';

  el.innerHTML = h;

  // Wire accordions
  el.querySelectorAll('[data-pi-toggle]').forEach(function(hd) {
    hd.addEventListener('click', function(e) {
      if (e.target.closest('.add-btn') || e.target.closest('.pi-complete')) return;
      EAP.toggleAccordion(hd.dataset.piToggle);
    });
  });

  // Wire hierarchy toggles
  el.querySelectorAll('[data-hier-toggle]').forEach(function(t) {
    t.addEventListener('click', function(e) { e.stopPropagation(); EAP.toggleHierarchy(t.dataset.hierToggle); });
  });

  // Wire track member/team chips
  el.querySelectorAll('[data-track-member]').forEach(function(chip) {
    chip.addEventListener('click', function() { EAP.state.trackMember = chip.dataset.trackMember; EAP.render(); });
  });
  el.querySelectorAll('[data-track-team]').forEach(function(chip) {
    chip.addEventListener('click', function() { EAP.state.trackTeam = chip.dataset.trackTeam; EAP.render(); });
  });

  // Wire hierarchy expand/collapse buttons
  var eb = document.getElementById('hier-expand');
  if (eb) eb.addEventListener('click', function() { EAP.setAllHier(EAP.hierarchy, true); EAP.render(); });
  var cb = document.getElementById('hier-collapse');
  if (cb) cb.addEventListener('click', function() { EAP.setAllHier(EAP.hierarchy, false); EAP.render(); });

  // Wire milestone hover tooltips
  el.querySelectorAll('[data-ms-tip]').forEach(function(ms) {
    ms.addEventListener('mouseenter', function(e) {
      var tip = document.createElement('div');
      tip.className = 'tl-ms-tip';
      tip.textContent = ms.getAttribute('data-ms-tip');
      document.body.appendChild(tip);
      var r = ms.getBoundingClientRect();
      tip.style.left = r.left + r.width / 2 + 'px';
      tip.style.top = (r.top - 6) + 'px';
      ms._tip = tip;
    });
    ms.addEventListener('mouseleave', function() {
      if (ms._tip) { ms._tip.remove(); ms._tip = null; }
    });
  });

  // Wire detail panel — delegated click on item names, record numbers, and cards
  el.addEventListener('click', function(e) {
    // Board/Track cards — id is on the card element (fcard-{id} or tcard-{id})
    var card = e.target.closest('.bcard');
    if (card && card.id) {
      var cardId = card.id.replace(/^[ft]card-/, '');
      if (cardId) { EAP.openDetail(cardId); return; }
    }
    // Table item name or record number with data-item-id
    var nm = e.target.closest('[data-item-id]');
    if (nm) { EAP.openDetail(nm.getAttribute('data-item-id')); return; }
    // Fallback: item-nm or record-num without data-item-id — find by name match
    var clickable = e.target.closest('.item-nm') || e.target.closest('.record-num');
    if (clickable) {
      var row = clickable.closest('tr');
      if (row) {
        var numEl = row.querySelector('.record-num');
        var nameEl = row.querySelector('.item-nm');
        var name = nameEl ? nameEl.textContent.trim() : '';
        var num = numEl ? numEl.textContent.trim() : '';
        // Search all data for matching item
        var found = null;
        function searchByNameOrNum(items) {
          items.forEach(function(item) {
            if (found) return;
            if ((num && item.num === num) || (name && item.name === name)) found = item;
          });
        }
        searchByNameOrNum(EAP.epics.all);
        searchByNameOrNum(EAP.capabilities.all);
        searchByNameOrNum(EAP.allFeatures);
        EAP.workItems.sprints.forEach(function(sp) { searchByNameOrNum(sp.items || []); });
        ['Story','Defect','CaseTask'].forEach(function(k) { searchByNameOrNum(EAP.workItems.backlog[k] || []); });
        if (found) EAP.openDetail(found.id);
      }
    }
  });

  // Wire pagination controls
  EAP.pgWire();

  // Wire WSJF rank buttons
  EAP.wsjfWire();

  // Wire insight action links
  if (EAP.wireInsightActions) EAP.wireInsightActions();
};
