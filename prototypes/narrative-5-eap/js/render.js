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
    var hgv = s.hierGroupBy || 'goal';
    var hgActive = (hgv !== 'goal') ? ' fbar-select-on' : '';
    // Hide scope-redundant groupings (same logic as Timeline dropdown)
    var hRedundantByScope = {
      'team':           ['team', 'art', 'st'],
      'art':            ['art', 'st'],
      'solution-train': ['st']
    }[s.context] || [];
    function hOpt(value, label) {
      if (hRedundantByScope.indexOf(value) !== -1) return '';
      return '<option value="' + value + '"' + (hgv === value ? ' selected' : '') + '>Group by: ' + label + '</option>';
    }
    h += '<select class="fbar-select' + hgActive + '" id="hier-group-select" data-prefix="' + EAP.icon('layout-list', 12) + '">' +
      hOpt('goal', 'Goal') +
      '<optgroup label="Strategy">' +
        hOpt('product', 'Product') +
        '<option disabled>Group by: Initiative · coming</option>' +
        '<option disabled>Group by: Value Stream · coming</option>' +
      '</optgroup>' +
      '<optgroup label="Classification">' +
        hOpt('size', 'Size') +
      '</optgroup>' +
      '<optgroup label="Org &amp; accountability">' +
        hOpt('owner', 'Owner') +
        hOpt('art', 'ART') +
        hOpt('st', 'Solution Train') +
      '</optgroup>' +
      '<optgroup label="Status">' +
        hOpt('state', 'State') +
        hOpt('risk', 'Risk') +
      '</optgroup>' +
      '</select>' +
      '<div class="fbar-sep"></div><span class="fbar-label">PI</span>' +
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

  // Group-by dropdown — Timeline only. Sectioned by lens (Strategy /
   // Classification / Org & accountability / Status). Default option +
   // ART/Solution Train hidden when redundant with the level's natural default.
   // ALL options carry the "Group by:" prefix so the selected state always
   // shows the dimension name with its label (matches the Dependencies dropdown).
   // Hide scope-redundant options: at narrower scopes, dimensions you've already
   // filtered to don't make sense as a grouping.
  if (s.tab === 'timeline') {
    var defMap = {
      Epic:       { label: 'Goal',  redundant: 'goal' },
      Capability: { label: 'ART',   redundant: 'art' },
      Feature:    { label: 'PI',    redundant: null },
      WorkItem:   { label: 'Team',  redundant: null }
    };
    var def = defMap[s.level] || { label: 'Default', redundant: null };
    var gv = s.tlGroupBy || 'default';
    var gActive = (gv !== 'default') ? ' fbar-select-on' : '';
    // Scope-redundant: at e.g. Team scope, grouping by Team is pointless
    var redundantByScope = {
      'team':           ['team', 'art', 'st'],
      'art':            ['art', 'st'],
      'solution-train': ['st']
    }[s.context] || [];
    h += '<select class="fbar-select' + gActive + '" id="tl-group-select" data-prefix="' + EAP.icon('layout-list', 12) + '">';
    h += '<option value="default"' + (gv === 'default' ? ' selected' : '') + '>Group by: ' + def.label + '</option>';
    function tlOpt(value, label) {
      if (def.redundant === value) return '';
      if (redundantByScope.indexOf(value) !== -1) return '';
      return '<option value="' + value + '"' + (gv === value ? ' selected' : '') + '>Group by: ' + label + '</option>';
    }
    h += '<optgroup label="Strategy">';
    h += tlOpt('goal',    'Goal');
    h += tlOpt('product', 'Product');
    h += '<option disabled>Group by: Initiative · coming</option>';
    h += '<option disabled>Group by: Value Stream · coming</option>';
    h += '</optgroup>';
    h += '<optgroup label="Classification">';
    h += tlOpt('size',    'Size');
    h += '</optgroup>';
    h += '<optgroup label="Org &amp; accountability">';
    h += tlOpt('owner',   'Owner');
    h += tlOpt('art',     'ART');
    h += tlOpt('st',      'Solution Train');
    h += '</optgroup>';
    h += '<optgroup label="Status">';
    h += tlOpt('state',   'State');
    h += tlOpt('risk',    'Risk');
    h += '</optgroup>';
    h += '</select>';
  }

  // Right-side toggles — all with icons
  if (s.tab === 'planning') h += '<span class="fbar-vtog' + (s.splitView ? ' on' : '') + '" id="split-toggle">' + EAP.icon('columns', 14) + ' Split</span>';
  if ((s.tab === 'board' || s.tab === 'taskboard' || s.tab === 'timeline') && (s.level === 'Feature' || s.level === 'WorkItem')) {
    // Single dropdown: Hide / All / Conflicts / Risks / Satisfied. Selection determines both on/off and filter.
    var dv = s.showDeps ? (s.depFilter || 'all') : 'hide';
    var activeClass = s.showDeps ? ' fbar-select-on' : '';
    h += '<select class="fbar-select dep-select' + activeClass + '" id="dep-select" data-prefix="' + EAP.icon('link', 12) + '">' +
      '<option value="hide"' + (dv === 'hide' ? ' selected' : '') + '>Dependencies: Hide</option>' +
      '<option value="all"' + (dv === 'all' ? ' selected' : '') + '>Dependencies: All</option>' +
      '<option value="conflict"' + (dv === 'conflict' ? ' selected' : '') + '>Dependencies: Conflicts</option>' +
      '<option value="risk"' + (dv === 'risk' ? ' selected' : '') + '>Dependencies: Risks</option>' +
      '<option value="satisfied"' + (dv === 'satisfied' ? ' selected' : '') + '>Dependencies: Satisfied</option>' +
      '</select>';
  }
  if (s.tab === 'board') h += '<span class="fbar-vtog' + (s.boardDensity === 'compact' ? ' on' : '') + '" id="density-toggle">' + EAP.icon('rows', 14) + ' Compact</span>';
  h += '<span class="fbar-vtog' + (s.insightsOpen ? ' on' : '') + '" id="insights-toggle">' + EAP.icon('sparkle', 16) + ' Insights</span>';

  el.innerHTML = h;

  // Wire events
  var ls = document.getElementById('level-select');
  if (ls) ls.addEventListener('change', function() { EAP.setLevel(this.value); });
  var mt = document.getElementById('mine-toggle');
  if (mt) mt.addEventListener('click', function() { EAP.toggleMineOnly(); });
  var sb = document.getElementById('split-toggle');
  if (sb) sb.addEventListener('click', function() { EAP.toggleSplit(); });
  document.getElementById('insights-toggle').addEventListener('click', function() { EAP.toggleInsights(); });
  var dsel = document.getElementById('dep-select');
  if (dsel) dsel.addEventListener('change', function() {
    var v = dsel.value;
    if (v === 'hide') { EAP.state.showDeps = false; EAP.state.depFilter = 'all'; }
    else { EAP.state.showDeps = true; EAP.state.depFilter = v; }
    EAP.render();
  });
  var dn = document.getElementById('density-toggle');
  if (dn) dn.addEventListener('click', function() { EAP.state.boardDensity = EAP.state.boardDensity === 'compact' ? 'default' : 'compact'; EAP.render(); });
  var tg = document.getElementById('tl-group-select');
  if (tg) tg.addEventListener('change', function() { EAP.state.tlGroupBy = this.value; EAP.render(); });
  var hg = document.getElementById('hier-group-select');
  if (hg) hg.addEventListener('change', function() {
    EAP.state.hierGroupBy = this.value;
    // Reset open state so the new tree opens at top-level by default
    EAP.state.openHierarchy = {};
    EAP.render();
  });

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

  // Wire empty-state Clear-filters button — remember the clear for this tab
  // so it doesn't snap back when the persona-default would re-apply.
  var esc = document.getElementById('empty-state-clear');
  if (esc) esc.addEventListener('click', function() {
    var s = EAP.state;
    s.mineOnly = false;
    s.mineOverrides = s.mineOverrides || {};
    s.mineOverrides[s.tab] = false;
    s.trackMember = 'All';
    s.trackTeam = 'All';
    EAP.render();
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
  if (eb) eb.addEventListener('click', function() { EAP.setAllHier(EAP.buildHierarchyTree(), true); EAP.render(); });
  var cb = document.getElementById('hier-collapse');
  if (cb) cb.addEventListener('click', function() { EAP.setAllHier(EAP.buildHierarchyTree(), false); EAP.render(); });

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

  // Wire WSJF breakdown popover (delegated; idempotent)
  if (EAP.wsjfPopoverWire) EAP.wsjfPopoverWire();

  // Wire insight action links
  if (EAP.wireInsightActions) EAP.wireInsightActions();

  // Timeline: zoom buttons, scroll sync, scroll-to-today
  if (s.tab === 'timeline') {
    var scroller = document.querySelector('.tl-body-rscroll');

    // Scroll-to-today (reusable)
    function tlScrollToToday(smooth) {
      var todayEl = document.querySelector('.tl-today');
      if (todayEl && scroller) {
        var left = todayEl.offsetLeft - scroller.clientWidth / 2;
        scroller.scrollTo({ left: Math.max(0, left), behavior: smooth ? 'smooth' : 'instant' });
      }
    }

    // Today button
    var stt = document.getElementById('tl-scroll-today');
    if (stt) stt.addEventListener('click', function() { tlScrollToToday(true); });

    // Zoom buttons
    var zoomGroup = document.querySelector('.tl-zoom-group');
    if (zoomGroup) zoomGroup.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-tl-zoom]');
      if (!btn) return;
      var z = parseInt(btn.getAttribute('data-tl-zoom'), 10);
      if (z === EAP.state.tlZoom) return;
      EAP.state.tlZoom = z;
      EAP.render();
    });

    // Scroll sync: header bands and milestone row mirror body scroll
    if (scroller) scroller.addEventListener('scroll', function() {
      var hdrRight = document.querySelector('.tl-hdr-right');
      var msRight = document.querySelector('.tl-ms-right');
      if (hdrRight) hdrRight.scrollLeft = scroller.scrollLeft;
      if (msRight) msRight.scrollLeft = scroller.scrollLeft;
    });

    // Auto-scroll to today on render (no animation — instant position)
    tlScrollToToday(false);
  }

  // Wire legend popover on Timeline
  var legBtn = document.getElementById('tl-legend-btn');
  var leg = document.getElementById('tl-legend');
  if (legBtn && leg) {
    legBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      leg.hidden = !leg.hidden;
    });
    document.addEventListener('click', function(e) {
      if (!leg.hidden && !leg.contains(e.target) && e.target !== legBtn && !legBtn.contains(e.target)) leg.hidden = true;
    });
  }

  // Focus mode is driven by clicking dependency icons only (Timeline + Board).
  // Clicking a bar/card continues to open the detail panel as before.
  // Click on empty canvas clears focus.
  if (s.tab === 'timeline' && EAP.tlClearFocus) {
    var tlBody = document.querySelector('.tl-body-right');
    if (tlBody) tlBody.addEventListener('click', function(e) {
      if (e.target === tlBody || e.target.classList.contains('tl-row-bg') || e.target.classList.contains('tl-grp-band')) {
        EAP.tlClearFocus();
      }
    });
  }
  if ((s.tab === 'board' || s.tab === 'taskboard') && EAP.boardClearFocus) {
    var board = document.querySelector('.content-area > div:first-child');
    if (board) board.addEventListener('click', function(e) {
      // Click on empty board area (not a card, not a dep icon, not popover) clears focus
      if (!e.target.closest('.bcard') && !e.target.closest('.dep-svg') && !e.target.closest('.dep-popover')) {
        EAP.boardClearFocus();
      }
    });
  }
};
