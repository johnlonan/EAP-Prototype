/* ═══════════════════════════════════════════════════════
   RENDER.JS — Orchestrator (chrome, filter bar, routing)
   Tab renderers are in js/tabs/*.js
   Shared helpers in js/components/helpers.js
   Insights in js/components/insights.js
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

// ── Main render ────────────────────────────────────────
EAP.render = function() {
  EAP.renderChrome();
  EAP.renderFilterBar();
  EAP.renderContent();
  EAP.renderInsights();
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
      ['Backlog', 'List', 'Board', 'Hierarchy'].map(function(t) {
        return '<button class="tab-item' + (s.tab === t ? ' active' : '') + '" data-tab="' + t + '">' + t + '</button>';
      }).join('') +
    '</div></div>' +
    '<div style="flex:1;"></div>' +
    '<input type="text" class="chrome-search" placeholder="Search features, stories, teams…">';

  el.querySelectorAll('[data-tab]').forEach(function(b) {
    b.addEventListener('click', function() { EAP.setTab(b.dataset.tab); });
  });
};

// ── Filter Bar ─────────────────────────────────────────
EAP.renderFilterBar = function() {
  var s = EAP.state, levels = EAP.contextLevels[s.context] || [];
  var el = document.getElementById('filter-bar');
  if (!el) return;
  var h = '';

  if (s.tab === 'Hierarchy') {
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
    h += '<span class="fbar-label">Level</span><select class="fbar-select" id="level-select">' +
      levels.map(function(l) { return '<option value="' + l.value + '"' + (s.level === l.value ? ' selected' : '') + '>' + l.label + '</option>'; }).join('') +
      '</select>';

    if ((s.tab === 'Board' || s.tab === 'List') && s.level === 'WorkItem') {
      h += '<div class="fbar-sep"></div><span class="fbar-label">PI</span>' +
        '<select class="fbar-select" id="pi-select"><option>PI 26 — Current</option><option>PI 25</option><option>PI 24</option></select>';
    }

    h += '<div class="fbar-sep"></div>' +
      '<button class="fbar-filter">' + EAP.icon('filter', 14) + 'Filter</button>' +
      '<span class="fbar-chip' + (s.mineOnly ? ' on' : '') + '" id="mine-toggle">Mine only' + (s.mineOnly ? ' <span class="cx">' + EAP.icon('x', 12) + '</span>' : '') + '</span>' +
      '<div class="fbar-spacer"></div>';
  }

  // Right-side toggles
  if (s.tab === 'List') h += '<span class="fbar-vtog' + (s.splitView ? ' on' : '') + '" id="split-toggle">' + EAP.icon('columns', 14) + ' Split</span>';
  if (s.tab === 'Board' && s.level === 'WorkItem') h += '<span class="fbar-vtog' + (s.boardView === 'track' ? ' on' : '') + '" id="track-toggle">Track</span>';
  if (s.tab === 'Board' && (s.level === 'Feature' || s.level === 'WorkItem')) h += '<span class="fbar-vtog' + (s.showDeps ? ' on' : '') + '" id="deps-toggle">Dependencies</span>';
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
  var tb = document.getElementById('track-toggle');
  if (tb) tb.addEventListener('click', function() { EAP.state.boardView = EAP.state.boardView === 'track' ? 'grid' : 'track'; EAP.render(); });
  var db = document.getElementById('deps-toggle');
  if (db) db.addEventListener('click', function() { EAP.state.showDeps = !EAP.state.showDeps; EAP.render(); });

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
  if (s.tab === 'Backlog')   h = EAP.renderBacklog();
  if (s.tab === 'List')      h = EAP.renderList();
  if (s.tab === 'Board')     h = EAP.renderBoard();
  if (s.tab === 'Hierarchy') h = EAP.renderHierarchy();
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

  // Wire hierarchy expand/collapse buttons
  var eb = document.getElementById('hier-expand');
  if (eb) eb.addEventListener('click', function() { EAP.setAllHier(EAP.hierarchy, true); EAP.render(); });
  var cb = document.getElementById('hier-collapse');
  if (cb) cb.addEventListener('click', function() { EAP.setAllHier(EAP.hierarchy, false); EAP.render(); });
};
