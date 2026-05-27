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
  var tl = { portfolio: 'Portfolio', 'solution-train': 'Sol. Train', art: 'ART', team: 'Team', space: 'Space' };
  var el = document.getElementById('chrome-bar');
  if (!el) return;

  // Capture active tab rect before DOM rebuild so slider can animate from it
  var _sliderFrom = null;
  var _oldGroup = document.querySelector('.tab-group');
  var _oldActive = _oldGroup ? _oldGroup.querySelector('.tab-item.active') : null;
  if (_oldActive) {
    var _gr = _oldGroup.getBoundingClientRect();
    var _ar = _oldActive.getBoundingClientRect();
    _sliderFrom = { left: _ar.left - _gr.left, width: _ar.width };
  }

  // Scope selector badge — indigo style for Space, standard grey for all other contexts
  var isSpace = s.context === 'space';
  var badgeStyle = isSpace
    ? 'background:rgba(99,102,241,0.12);color:#4338CA;border:1px solid rgba(99,102,241,0.22);'
    : '';

  // For space context, show parent team as a breadcrumb prefix
  var scopeLabel = s.contextName;
  if (isSpace && s.spaceData) {
    scopeLabel = '<span style="color:#9CA3AF;font-weight:400;">' + s.spaceData.teamName + ' &rsaquo;</span> ' + s.contextName;
  }

  el.innerHTML =
    '<div class="chrome-dd-wrap"><span class="chrome-dd-label">Scope</span>' +
      '<div class="art-sel" id="ctx-sel-btn">' +
        '<span class="art-sel-badge" style="' + badgeStyle + '">' + tl[s.context] + '</span>' +
        '<span class="art-sel-name">' + scopeLabel + '</span>' +
        '<span class="chev"></span>' +
      '</div></div>' +
    '<div class="chrome-center"><div class="tab-group">' +
      EAP.activeTabConfig().map(function(t) {
        return '<button class="tab-item' + (s.tab === t.id ? ' active' : '') + '" data-tab="' + t.id + '">' + t.label + '</button>';
      }).join('') +
    '</div></div>' +
    '<div style="flex:1;"></div>' +
    '<div class="search-wrap">' +
      '<input type="text" class="chrome-search" placeholder="Search features, stories, teams…">' +
      '<button class="search-send-btn" id="search-clear" title="Search"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>' +
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

  // Animate the tab slider from old position to new
  if (EAP.initTabSlider) EAP.initTabSlider(_sliderFrom);
};

// ── Filter Bar ─────────────────────────────────────────
EAP.renderFilterBar = function() {
  var s = EAP.state, levels = EAP.contextLevels[s.context] || [];
  var el = document.getElementById('filter-bar');
  if (!el) return;
  if (EAP.closeFilterPopover) EAP.closeFilterPopover();
  // Spaces have no EAP-level filter bar
  if (s.context === 'space') { el.innerHTML = ''; return; }
  var h = '';

  // Scope-redundant grouping dimensions — shared by Hierarchy and Timeline dropdowns.
  var redundantByScope = { 'team': ['team','art','st'], 'art': ['art','st'], 'solution-train': ['st'] }[s.context] || [];

  if (s.tab === 'hierarchy') {
    s.hierHide = s.hierHide || {};
    var hgv = s.hierGroupBy || 'goal';
    var hgActive = (hgv !== 'goal') ? ' fbar-select-on' : '';
    h += '<select class="fbar-select' + hgActive + '" id="hier-group-select" data-prefix="' + EAP.icon('layout-list', 12) + '">' +
      EAP.renderGroupByOptions(hgv, redundantByScope, null) +
      '</select>' +
      '<div class="fbar-sep"></div><span class="fbar-label">PI</span>' +
      '<select class="fbar-select" id="hier-pi-sel"><option value="All">All PIs</option><option value="PI 26">PI 26 — Current</option><option value="PI 27">PI 27</option></select>' +
      '<div class="fbar-sep"></div><span class="fbar-label">Show</span>' +
      ['Capability', 'Feature', 'Story', 'Defect'].map(function(lv) {
        var checked = !s.hierHide[lv];
        var iconName = checked ? 'check-square' : 'square';
        return '<span class="hier-check-pill' + (checked ? ' checked' : '') + '" data-hier-check="' + lv + '">' +
          EAP.icon(iconName, 14) + ' ' + lv + '</span>';
      }).join('') +
      '<div class="fbar-spacer"></div>';
  } else {
    // Level icon prefix + select
    var levelIconKey = s.level === 'WorkItem' ? 'story' : s.level.toLowerCase();
    h += '<span class="fbar-label">Level</span>' +
      '<div class="fbar-select-wrap">' +
        '<span class="fbar-sel-prefix">' + EAP.icon(levelIconKey, 14) + '</span>' +
        '<select class="fbar-select fbar-select-prefixed" id="level-select">' +
        levels.map(function(l) { return '<option value="' + l.value + '"' + (s.level === l.value ? ' selected' : '') + '>' + l.label + '</option>'; }).join('') +
        '</select>' +
      '</div>';

    // Kanban-local PI/Sprint selector — custom dropdown, always visible on board tab
    if (s.tab === 'board') {
      var kv = s.kanbanView || 'current-pi';
      var isPortfolioST = (s.context === 'portfolio' || s.context === 'solution-train');

      // Resolve current PI name + active sprint name from live data
      var activePi  = (EAP.features && EAP.features.pis || []).filter(function(p) { return p.active; })[0];
      var curPiName = activePi ? activePi.name : 'PI 26';          // e.g. "PI 26"
      var curPiNum  = curPiName.replace('PI ', '');                 // e.g. "26"
      var activeSp  = (EAP.workItems && EAP.workItems.sprints || []).filter(function(sp) { return sp.active; })[0];
      var curSpName = activeSp ? activeSp.name : 'Current Sprint';  // e.g. "Sprint 2"

      // Build future PI options (current + 3 ahead)
      var piOpts = [];
      for (var _pi = 0; _pi < 4; _pi++) {
        var _piNum  = parseInt(curPiNum, 10) + _pi;
        var _piId   = _pi === 0 ? 'current-pi' : 'pi-' + _piNum;
        var _piLbl  = 'PI ' + _piNum + (_pi === 0 ? ' — Current' : '');
        piOpts.push({ id: _piId, label: _piLbl, active: kv === _piId });
      }

      // Trigger label
      var trigLabel;
      if (kv === 'sprint') {
        trigLabel = curSpName;
      } else {
        var selPiOpt = piOpts.filter(function(o) { return o.id === kv; })[0];
        trigLabel = selPiOpt ? selPiOpt.label : piOpts[0].label;
      }

      h += '<div class="fbar-sep"></div>' +
        '<div class="kv-dd-wrap" id="kv-dd-wrap">' +
          '<button class="kv-dd-trigger fbar-select-on" id="kv-dd-trigger">' +
            EAP.icon('calendar', 12) +
            '<span id="kv-dd-label">' + trigLabel + '</span>' +
            EAP.icon('chevron-down', 10) +
          '</button>' +
          '<div class="kv-dd-panel" id="kv-dd-panel">' +
            '<div class="kv-dd-section-hd">Program Increment</div>' +
            piOpts.map(function(o) {
              return '<div class="kv-dd-opt' + (o.active ? ' active' : '') + '" data-kv="' + o.id + '">' +
                (o.active ? EAP.icon('check', 13) : '<span class="kv-dd-spacer"></span>') +
                o.label +
              '</div>';
            }).join('') +
            (!isPortfolioST ?
              '<div class="kv-dd-divider"></div>' +
              '<div class="kv-dd-section-hd">Sprint</div>' +
              '<div class="kv-dd-opt' + (kv === 'sprint' ? ' active' : '') + '" data-kv="sprint">' +
                (kv === 'sprint' ? EAP.icon('check', 13) : '<span class="kv-dd-spacer"></span>') +
                curSpName + ' · ' + curPiName +
              '</div>'
            : '') +
          '</div>' +
        '</div>';
    }

    if (s.tab === 'planning' && s.level === 'WorkItem') {
      h += '<div class="fbar-sep"></div><span class="fbar-label">' + EAP.icon('calendar', 12) + '</span>' +
        '<select class="fbar-select" id="pi-select"><option>PI 26 — Current</option><option>PI 25</option><option>PI 24</option></select>';
    }

    var ownerActive = (s.ownerFilter && s.ownerFilter.length > 0) || (s.mineOnly && !(s.tab === 'board' && s.kanbanView === 'sprint'));
    var filterCount = ownerActive ? 1 : 0;  // count of active categories, not individual values
    var filterActive = ownerActive;
    h += '<div class="fbar-sep"></div>' +
      '<button class="fbar-filter-btn' + (filterActive ? ' active' : '') + '" id="filter-btn" title="Filter by owner">' +
        EAP.icon('filter', 14) +
      '</button>';
    if (filterActive) {
      var displayOwners = (s.ownerFilter || []).slice();
      if (s.mineOnly && !(s.tab === 'board' && s.kanbanView === 'sprint') && displayOwners.indexOf(EAP.ME) === -1) {
        displayOwners = displayOwners.concat([EAP.ME]);
      }
      var pillPrefix, pillLabel;
      if (displayOwners.length === 1) {
        var ok = displayOwners[0];
        var op = EAP.people && EAP.people[ok];
        pillPrefix = EAP.avatar(ok, 18);
        pillLabel = 'Owner · ' + (op ? op.name.split(' ')[0] : ok);
      } else {
        pillPrefix = EAP.icon('users', 11);
        pillLabel = 'Owner: ' + displayOwners.length;
      }
      h += '<span class="fbar-owner-pill" id="owner-pill">' +
        pillPrefix + ' ' + pillLabel +
        ' <span class="cx" id="owner-pill-clear">' + EAP.icon('x', 10) + '</span>' +
      '</span>';
    }
    h += '<div class="fbar-spacer"></div>';
  }

  // Group-by dropdown — Timeline only.
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
    h += '<select class="fbar-select' + gActive + '" id="tl-group-select" data-prefix="' + EAP.icon('layout-list', 12) + '">' +
      '<option value="default"' + (gv === 'default' ? ' selected' : '') + '>Group by: ' + def.label + '</option>' +
      EAP.renderGroupByOptions(gv, redundantByScope, def.redundant) +
      '</select>';
  }

  // Right-side toggles — all with icons
  if (s.tab === 'planning') h += '<span class="fbar-vtog' + (s.splitView ? ' on' : '') + '" id="split-toggle">' + EAP.icon('columns', 14) + ' Split</span>';
  if (s.tab === 'backlog' && s.level === 'Feature') h += '<span class="fbar-vtog" id="pm-map-btn">' + EAP.icon('layout-list', 14) + ' Priority Map</span>';
  if ((s.tab === 'board' || s.tab === 'timeline') && (s.level === 'Feature' || s.level === 'WorkItem')) {
    // Single dropdown: Hide / All / Conflicts / Risks / Satisfied. Selection determines both on/off and filter.
    var dv = s.showDeps ? (s.depFilter || 'all') : 'hide';
    var activeClass = s.showDeps ? ' fbar-select-on' : '';
    h += '<select class="fbar-select dep-select' + activeClass + '" id="dep-select" data-prefix="' + EAP.icon('link', 12) + '">' +
      '<option value="hide"' + (dv === 'hide' ? ' selected' : '') + '>Dependencies: Off</option>' +
      '<option value="all"' + (dv === 'all' ? ' selected' : '') + '>Dependencies: All</option>' +
      '<option value="conflict"' + (dv === 'conflict' ? ' selected' : '') + '>Dependencies: Conflicts only</option>' +
      '<option value="risk"' + (dv === 'risk' ? ' selected' : '') + '>Dependencies: Risks only</option>' +
      '<option value="satisfied"' + (dv === 'satisfied' ? ' selected' : '') + '>Dependencies: Satisfied only</option>' +
      '</select>';
  }
  if (s.tab === 'board' && s.kanbanView !== 'sprint') h += '<span class="fbar-vtog' + (s.boardDensity === 'compact' ? ' on' : '') + '" id="density-toggle">' + EAP.icon('rows', 14) + ' Compact</span>';
  h += '<span class="fbar-vtog' + (s.insightsOpen ? ' on' : '') + '" id="insights-toggle">' + EAP.icon('sparkle', 14) + ' Insights</span>';

  el.innerHTML = h;

  // Wire events
  var ls = document.getElementById('level-select');
  if (ls) ls.addEventListener('change', function() { EAP.setLevel(this.value); });
  // Kanban-local PI/Sprint custom dropdown
  if (EAP._kvCloseHandler) { document.removeEventListener('click', EAP._kvCloseHandler); EAP._kvCloseHandler = null; }
  var kvTrigger = document.getElementById('kv-dd-trigger');
  var kvPanel   = document.getElementById('kv-dd-panel');
  if (kvTrigger && kvPanel) {
    kvTrigger.addEventListener('click', function(e) {
      e.stopPropagation();
      var open = kvPanel.classList.contains('open');
      kvPanel.classList.toggle('open', !open);
    });
    kvPanel.querySelectorAll('[data-kv]').forEach(function(opt) {
      opt.addEventListener('click', function(e) {
        e.stopPropagation();
        kvPanel.classList.remove('open');
        EAP.setKanbanView(opt.dataset.kv);
      });
    });
    EAP._kvCloseHandler = function() { kvPanel.classList.remove('open'); };
    document.addEventListener('click', EAP._kvCloseHandler);
  }
  var fb = document.getElementById('filter-btn');
  if (fb) fb.addEventListener('click', function(e) { e.stopPropagation(); EAP.openFilterPopover(); });
  var opc = document.getElementById('owner-pill-clear');
  if (opc) opc.addEventListener('click', function(e) {
    e.stopPropagation();
    EAP.clearOwnerFilter(false);
  });
  var sb = document.getElementById('split-toggle');
  if (sb) sb.addEventListener('click', function() { EAP.toggleSplit(); });
  var pmb = document.getElementById('pm-map-btn');
  if (pmb) pmb.addEventListener('click', function() { EAP.openPriorityMap(); });
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

  // Space context — routes to space-specific tab renderers
  if (s.context === 'space') {
    if (s.tab === 'board') h = EAP.renderSpaceBoard ? EAP.renderSpaceBoard() : '';
    if (s.tab === 'list')  h = EAP.renderSpaceList  ? EAP.renderSpaceList()  : '';
    if (s.tab === 'docs')  h = EAP.renderSpaceDocs  ? EAP.renderSpaceDocs()  : '';
    el.innerHTML = h;
    el.classList.remove('tab-enter'); void el.offsetWidth; el.classList.add('tab-enter');
    // Wire interactive elements post-render
    if (s.tab === 'docs'  && EAP.wireSpaceDocClicks)   EAP.wireSpaceDocClicks();
    if (s.tab === 'list'  && EAP.wireSpaceListFilters) EAP.wireSpaceListFilters();
    return;
  }

  if (s.tab === 'backlog')   h = EAP.renderBacklog();
  if (s.tab === 'planning')  h = EAP.renderList();
  if (s.tab === 'timeline')  h = EAP.renderTimeline();
  if (s.tab === 'board') {
    // Kanban tab: sprint view uses the track renderer, PI views use the board renderer
    h = (s.kanbanView === 'sprint') ? EAP.renderTrack() : EAP.renderBoard();
  }
  if (s.tab === 'analytics') h = EAP.renderAnalytics ? EAP.renderAnalytics() : '';
  if (s.tab === 'hierarchy') h = EAP.renderHierarchy();
  // Analytics manages its own layout (including insights panel placement)
  if (s.insightsOpen && s.tab !== 'analytics') h += '<div class="gpanel ins-panel" id="insights-panel"></div>';

  el.innerHTML = h;

  // Fade-in on every tab switch
  el.classList.remove('tab-enter');
  void el.offsetWidth;
  el.classList.add('tab-enter');

  // Analytics charts need a tick for the DOM to settle
  if (s.tab === 'analytics' && EAP.initAnalyticsCharts) {
    setTimeout(function() { EAP.initAnalyticsCharts(); }, 50);
  }
  // Trace ring popover — idempotent, works via event delegation on any tab
  if (EAP.initTracePopovers) EAP.initTracePopovers();

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
    s.ownerFilter = [];
    s.trackMember = 'All';
    s.trackMembers = [];
    s.trackTeam = 'All';
    s.trackTeams = [];
    EAP.render();
  });

  // Wire track member/team chips
  el.querySelectorAll('[data-track-member]').forEach(function(chip) {
    chip.addEventListener('click', function() { EAP.toggleTrackMember(chip.dataset.trackMember); });
  });
  el.querySelectorAll('[data-track-team]').forEach(function(chip) {
    chip.addEventListener('click', function() { EAP.toggleTrackTeam(chip.dataset.trackTeam); });
  });

  // Wire hierarchy expand/collapse buttons (scoped to el — same pattern as data-hier-toggle)
  el.querySelectorAll('[data-hier-expand]').forEach(function(b) {
    b.addEventListener('click', function(e) { e.stopPropagation(); EAP.setAllHier(EAP.buildHierarchyTree(), true); EAP.render(); });
  });
  el.querySelectorAll('[data-hier-collapse]').forEach(function(b) {
    b.addEventListener('click', function(e) { e.stopPropagation(); EAP.setAllHier(EAP.buildHierarchyTree(), false); EAP.render(); });
  });

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
        ['Story','Defect','Incident','Problem'].forEach(function(k) { searchByNameOrNum(EAP.workItems.backlog[k] || []); });
        if (found) EAP.openDetail(found.id);
      }
    }
  });

  // Wire pagination controls (scoped to el — prevents accumulation across renders)
  EAP.pgWire(el);

  // Wire WSJF rank buttons (scoped to el)
  EAP.wsjfWire(el);

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

    // Rich bar popover — glass card with hover-bridge so footer is clickable
    var tlPop = document.getElementById('tl-pop');
    if (!tlPop) {
      tlPop = document.createElement('div');
      tlPop.id = 'tl-pop';
      document.body.appendChild(tlPop);
    }
    var tlHideTimer = null;
    var MO = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    function tlFmtD(ds) { if (!ds) return ''; var d = new Date(ds + 'T00:00:00'); return MO[d.getMonth()] + ' ' + d.getDate(); }
    var tlPiLabel = { pi26:'PI 26', pi27:'PI 27', pi28:'PI 28', pi29:'PI 29' };

    function tlShowPop(bar) {
      clearTimeout(tlHideTimer);
      var name      = bar.getAttribute('data-tl-name') || '';
      var state     = bar.getAttribute('data-tl-state') || '';
      var pct       = parseInt(bar.getAttribute('data-tl-pct') || '0', 10);
      var pts       = parseInt(bar.getAttribute('data-tl-pts') || '0', 10);
      var ownerName = bar.getAttribute('data-tl-owner') || '';
      var ownerKey  = bar.getAttribute('data-tl-owner-key') || '';
      var team      = bar.getAttribute('data-tl-team') || '';
      var parent    = bar.getAttribute('data-tl-parent') || '';
      var blocked   = bar.getAttribute('data-tl-blocked') === 'true';
      var atRisk    = bar.getAttribute('data-tl-atrisk') === 'true';
      var startDate = bar.getAttribute('data-tl-start') || '';
      var endDate   = bar.getAttribute('data-tl-end') || '';
      var sprint    = bar.getAttribute('data-tl-sprint') || '';
      var pi        = bar.getAttribute('data-tl-pi') || '';
      var itemId    = bar.getAttribute('data-item-id') || '';

      var fillCol = (typeof tlCol === 'function') ? tlCol(state) : '#94a3b8';

      var html = '<div class="tl-pop-body">';
      html += '<div class="tl-pop-title">' + name + '</div>';
      html += '<div class="tl-pop-badges">';
      if (state && EAP.pill) html += EAP.pill(state);
      if (blocked) html += '<span class="tl-pop-badge tl-pop-badge-blocked">Blocked</span>';
      else if (atRisk) html += '<span class="tl-pop-badge tl-pop-badge-risk">At risk</span>';
      html += '</div>';

      if (pct > 0) {
        html += '<div class="tl-pop-prog">';
        html += '<div class="tl-pop-pbar"><div class="tl-pop-pbar-fill" style="width:' + pct + '%;background:' + fillCol + ';"></div></div>';
        html += '<span class="tl-pop-pct-lbl">' + pct + '%</span>';
        html += '</div>';
      }

      html += '<hr class="tl-pop-divider">';

      if (startDate) {
        var ctx = sprint || (pi ? tlPiLabel[pi] || pi : '');
        html += '<div class="tl-pop-dates">' + tlFmtD(startDate) + ' – ' + tlFmtD(endDate);
        if (ctx) html += '<span class="tl-pop-ctx"> · ' + ctx + '</span>';
        html += '</div>';
      }
      if (parent) html += '<div class="tl-pop-row"><span class="tl-pop-lbl">Parent</span><span class="tl-pop-val tl-pop-muted">' + parent + '</span></div>';
      if (pts > 0) html += '<div class="tl-pop-row"><span class="tl-pop-lbl">Pts</span><span class="tl-pop-val">' + pts + '</span></div>';
      if (ownerName) {
        var av = (ownerKey && EAP.avatar) ? EAP.avatar(ownerKey, 20) : '';
        html += '<div class="tl-pop-row"><span class="tl-pop-lbl">Owner</span><span class="tl-pop-val tl-pop-owner">' + av + ownerName + '</span></div>';
      }
      if (team) html += '<div class="tl-pop-row"><span class="tl-pop-lbl">Team</span><span class="tl-pop-val">' + team + '</span></div>';
      html += '</div>';
      html += '<div class="tl-pop-footer" data-tl-open="' + itemId + '">Open detail' + EAP.icon('chevron-right', 12) + '</div>';

      tlPop.innerHTML = html;
      tlPop.style.display = 'block';
      requestAnimationFrame(function() { tlPop.classList.add('tl-pop-visible'); });

      var r  = bar.getBoundingClientRect();
      var pw = tlPop.offsetWidth, ph = tlPop.offsetHeight;
      var vw = window.innerWidth;
      var lx = Math.max(8, Math.min(r.left + r.width / 2 - pw / 2, vw - pw - 8));
      var ty = r.top - ph - 10;
      if (ty < 8) ty = r.bottom + 8;
      tlPop.style.left = lx + 'px';
      tlPop.style.top  = ty + 'px';
    }

    function tlHidePop(delay) {
      clearTimeout(tlHideTimer);
      tlHideTimer = setTimeout(function() {
        tlPop.classList.remove('tl-pop-visible');
        setTimeout(function() { if (!tlPop.classList.contains('tl-pop-visible')) tlPop.style.display = 'none'; }, 140);
      }, delay || 0);
    }

    document.querySelectorAll('.tl-bar[data-tl-name]').forEach(function(bar) {
      bar.addEventListener('mouseenter', function() { tlShowPop(bar); });
      bar.addEventListener('mouseleave', function() { tlHidePop(160); });
    });

    // Hover bridge: pointer can move from bar into popover without it closing
    tlPop.addEventListener('mouseenter', function() { clearTimeout(tlHideTimer); });
    tlPop.addEventListener('mouseleave', function() { tlHidePop(100); });

    // "Open detail" footer click
    tlPop.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-tl-open]');
      if (!btn) return;
      var id = btn.getAttribute('data-tl-open');
      tlHidePop(0);
      if (id && EAP.openDetail) EAP.openDetail(id);
    });

    // Staggered reveal of bar progress fills — demo eye-catcher on load
    setTimeout(function() {
      document.querySelectorAll('.tl-bar-fill').forEach(function(el, i) {
        el.style.animationDelay = (i * 30) + 'ms';
        el.classList.add('tl-fill-in');
      });
    }, 900);

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
  if (s.tab === 'board' && EAP.boardClearFocus) {
    var board = document.querySelector('.content-area > div:first-child');
    if (board) board.addEventListener('click', function(e) {
      // Click on empty board area (not a card, not a dep icon, not popover) clears focus
      if (!e.target.closest('.bcard') && !e.target.closest('.dep-svg') && !e.target.closest('.dep-popover')) {
        EAP.boardClearFocus();
      }
    });
  }
};

// ── Filter Popover ──────────────────────────────────────────────────

EAP._fpop = null;
EAP._fpopState = 'main'; // 'main' | 'owner'

EAP.closeFilterPopover = function() {
  if (EAP._fpop && EAP._fpop.parentNode) EAP._fpop.parentNode.removeChild(EAP._fpop);
  EAP._fpop = null;
  document.removeEventListener('click', EAP._fpopOutside);
};

EAP._fpopOutside = function(e) {
  if (EAP._fpop && !EAP._fpop.contains(e.target)) EAP.closeFilterPopover();
};

EAP.openFilterPopover = function() {
  if (EAP._fpop) { EAP.closeFilterPopover(); return; }
  EAP._fpop = document.createElement('div');
  EAP._fpop.className = 'fpop';
  document.body.appendChild(EAP._fpop);
  EAP._fpopShowMain();
  var btn = document.getElementById('filter-btn');
  if (btn) {
    var r = btn.getBoundingClientRect();
    EAP._fpop.style.top = (r.bottom + 6) + 'px';
    EAP._fpop.style.left = r.left + 'px';
  }
  setTimeout(function() { document.addEventListener('click', EAP._fpopOutside); }, 0);
};

EAP._fpopShowMain = function() {
  var s = EAP.state;
  var isTaskboard = (s.tab === 'board' && s.kanbanView === 'sprint');
  var fields = [
    { key: 'owner', label: 'Owner', icon: 'user', active: (s.ownerFilter && s.ownerFilter.length > 0) || s.mineOnly, flyout: true },
    { key: 'state', label: 'State', icon: 'check-square', active: false, flyout: false },
    { key: 'size',  label: 'Size',  icon: 'diamond',      active: false, flyout: false },
    { key: 'type',  label: 'Type',  icon: 'feature',      active: false, flyout: false }
  ];
  if (isTaskboard) fields = fields.filter(function(f) { return f.key !== 'owner'; });

  var h = '<div class="fpop-header">Filter</div>';
  fields.forEach(function(f) {
    var activeClass = f.active ? ' fpop-item-active' : '';
    var dimClass = f.flyout ? '' : ' fpop-item-dim';
    h += '<div class="fpop-item' + activeClass + dimClass + '" data-fpop-field="' + f.key + '">' +
      '<span class="fpop-item-icon">' + EAP.icon(f.icon, 13) + '</span>' +
      '<span class="fpop-item-label">' + f.label + '</span>' +
      (f.active ? '<span class="fpop-item-dot"></span>' : '') +
      (f.flyout ? '<span class="fpop-item-chev">' + EAP.icon('chevron-right', 11) + '</span>' : '<span class="fpop-item-coming">soon</span>') +
    '</div>';
  });

  if (EAP.hasClearableFilters()) {
    h += '<div class="fpop-footer"><button class="fpop-clear-all" id="fpop-clear-all">Clear all filters</button></div>';
  }

  EAP._fpop.innerHTML = h;

  EAP._fpop.querySelectorAll('[data-fpop-field]').forEach(function(row) {
    row.addEventListener('click', function(e) {
      e.stopPropagation();
      var field = row.dataset.fpopField;
      if (field === 'owner') EAP._fpopShowOwner();
    });
  });

  var ca = document.getElementById('fpop-clear-all');
  if (ca) ca.addEventListener('click', function(e) {
    e.stopPropagation();
    EAP.clearOwnerFilter(true);
  });
};

EAP._fpopShowOwner = function() {
  var s = EAP.state;
  var people = EAP.people || {};
  var keys = Object.keys(people);
  var search = '';

  function renderOwnerFlyout(filter) {
    var h = '<div class="fpop-flyout-header">' +
      '<button class="fpop-back" id="fpop-back">' + EAP.icon('chevron-right', 12) + '</button>' +
      '<span>Owner</span>' +
    '</div>' +
    '<div class="fpop-search-wrap"><span class="fpop-search-icon">' + EAP.icon('search', 12) + '</span>' +
    '<input class="fpop-search" id="fpop-owner-search" placeholder="Search people…" value="' + filter + '"></div>';

    var filtered = keys.filter(function(k) {
      if (!filter) return true;
      var p = people[k];
      return p && p.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
    });

    filtered.forEach(function(k) {
      var p = people[k];
      if (!p) return;
      var isSelected = (s.ownerFilter && s.ownerFilter.indexOf(k) !== -1) ||
                       (s.mineOnly && k === EAP.ME);
      h += '<div class="fpop-flyout-item' + (isSelected ? ' selected' : '') + '" data-fpop-owner="' + k + '">' +
        EAP.avatar(k, 20) +
        '<span class="fpop-flyout-name">' + p.name + '</span>' +
        '<span class="fpop-flyout-check">' + (isSelected ? EAP.icon('check', 13) : '') + '</span>' +
      '</div>';
    });

    if (s.ownerFilter && s.ownerFilter.length > 0) {
      h += '<div class="fpop-footer"><button class="fpop-clear-all" id="fpop-clear-owner">Clear owner filter</button></div>';
    }

    EAP._fpop.innerHTML = h;

    document.getElementById('fpop-back').addEventListener('click', function(e) {
      e.stopPropagation(); EAP._fpopShowMain();
    });

    var searchInput = document.getElementById('fpop-owner-search');
    if (searchInput) {
      searchInput.focus();
      searchInput.addEventListener('input', function(e) {
        e.stopPropagation();
        renderOwnerFlyout(searchInput.value);
      });
      searchInput.addEventListener('click', function(e) { e.stopPropagation(); });
    }

    EAP._fpop.querySelectorAll('[data-fpop-owner]').forEach(function(row) {
      row.addEventListener('click', function(e) {
        e.stopPropagation();
        var key = row.dataset.fpopOwner;
        s.ownerFilter = s.ownerFilter || [];
        // If mineOnly was auto-applied for this person, clear it before toggling ownerFilter
        if (key === EAP.ME && s.mineOnly) {
          s.mineOnly = false;
          s.mineOverrides = s.mineOverrides || {};
          s.mineOverrides[s.tab] = false;
        }
        var idx = s.ownerFilter.indexOf(key);
        if (idx === -1) { s.ownerFilter.push(key); }
        else { s.ownerFilter.splice(idx, 1); }
        var currentSearch = document.getElementById('fpop-owner-search');
        renderOwnerFlyout(currentSearch ? currentSearch.value : '');
        EAP.renderFilterBar();
        EAP.renderContent();
      });
    });

    var co = document.getElementById('fpop-clear-owner');
    if (co) co.addEventListener('click', function(e) {
      e.stopPropagation();
      EAP.clearOwnerFilter(true);
    });
  }

  renderOwnerFlyout(search);
};
