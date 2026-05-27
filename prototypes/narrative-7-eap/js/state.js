/* ═══════════════════════════════════════════════════════
   STATE.JS — Application state and transitions
   ═══════════════════════════════════════════════════════ */

var EAP = EAP || {};

// ── Tab config — change display labels here, IDs are stable ──
// To rename a tab: edit the label only. IDs never change.
EAP.tabConfig = [
  { id: 'backlog',   label: 'Backlog' },
  { id: 'planning',  label: 'Planning' },
  { id: 'timeline',  label: 'Timeline' },
  { id: 'board',     label: 'Kanban' },
  { id: 'hierarchy', label: 'Hierarchy' },
  { id: 'analytics', label: 'Analytics' }
];

EAP.state = {
  // Context — what scope the user is viewing
  context: 'art',                    // portfolio | solution-train | art | team
  contextName: 'Digital Banking ART',
  contextId: 'art1',

  // Level — what entity type is shown (driven by context)
  level: 'Feature',                  // Epic | Capability | Feature | WorkItem

  // Tab — which view is active (uses stable IDs from tabConfig)
  tab: 'backlog',

  // Filters
  mineOnly: false,
  mineOverrides: {},                  // per-tab manual overrides — beats persona defaults
  ownerFilter: [],                    // multi-select owner filter (keys from EAP.people)

  // View options
  splitView: true,
  insightsOpen: true,
  showDeps: false,

  // Board options
  boardDensity: 'default',           // default | compact (per tab session)

  // Kanban tab — local view selector (independent of global PI selector)
  // 'current-pi' | 'pi-26' | 'pi-25' | 'pi-24' | 'sprint'
  kanbanView: 'current-pi',

  // Accordion open states
  openAccordions: {},

  // Sprint goal strip open states (WorkItem/Planning only)
  openGoals: {},

  // Hierarchy expand states
  openHierarchy: {},

  // Pagination state per group
  pagination: {},

  // WSJF sort state (null = default order, 'desc' = sorted)
  wsjfSort: null,

  // Grouping selectors per view ('default' = each level's natural grouping)
  tlGroupBy: 'default',
  hierGroupBy: 'goal',

  // Timeline zoom (1 = fit-to-width, 2 = 2×, 3 = 3×)
  tlZoom: 1,

  // Task Board chip selections (multi-select arrays)
  trackMembers: [],
  trackTeams: []
};

// ── State transitions ──────────────────────────────────

EAP.setContext = function(type, name, id) {
  var s = EAP.state;
  s.context = type;
  s.contextName = name;
  s.contextId = id;

  if (type === 'space') {
    // Space context: set tab to the space's defaultTab
    var sp = EAP.spaces && EAP.spaces[id];
    s.spaceData = sp || null;
    s.tab = (sp && sp.defaultTab) ? sp.defaultTab : 'board';
    s.level = null;
    // Clear space-specific UI state on each space navigation
    // Pre-select first doc so the detail panel is never empty
    s._openDocId = (sp && sp.docs && sp.docs.length) ? sp.docs[0].id : null;
    s._spaceListFilter = {};
    s._spaceListPage = 1;
    s._spaceListOrder = null;
  } else {
    s.spaceData = null;
    // Auto-set level to default for new context
    s.level = EAP.defaultLevel[type];
  }

  // Reset transient UI state
  s.openAccordions = {};
  s.wsjfSort = null;
  s.pagination = {};
  EAP.render();
};

// Returns the tab config appropriate for the current context.
// For space contexts, only the tabs enabled for that space are shown.
EAP.activeTabConfig = function() {
  var s = EAP.state;
  if (s.context === 'space' && s.spaceData) {
    var spaceTabLabels = { board: 'Board', list: 'List', docs: 'Docs' };
    return (s.spaceData.tabs || []).map(function(id) {
      return { id: id, label: spaceTabLabels[id] || id };
    });
  }
  return EAP.tabConfig;
};

EAP.setLevel = function(level) {
  EAP.state.level = level;
  EAP.state.openAccordions = {};
  EAP.state.wsjfSort = null;
  EAP.state.pagination = {};
  EAP.render();
};

EAP.setTab = function(tab) {
  var s = EAP.state;
  s.tab = tab;
  s.wsjfSort = null;
  s.pagination = {};

  // Kanban tab: apply persona's default kanbanView if no override exists.
  // Guard: space context uses its own board renderer — never apply EAP kanban logic.
  if (tab === 'board' && s.context !== 'space') {
    var p = EAP.personas[s.persona];
    var personaKanbanView = (p && p.defaults && p.defaults.kanbanView) ? p.defaults.kanbanView : 'current-pi';
    if (!s._kanbanViewOverride) s.kanbanView = personaKanbanView;
    // Sprint view requires ART or Team context + WorkItem level
    if (s.kanbanView === 'sprint') {
      if (s.context !== 'art' && s.context !== 'team') {
        s.context = 'art';
        s.contextName = 'Digital Banking ART';
        s.contextId = 'art1';
      }
      s.level = 'WorkItem';
    }
    s.openAccordions = {};
  }

  // mineOnly: per-tab user override beats persona default
  s.mineOverrides = s.mineOverrides || {};
  if (s.mineOverrides[tab] !== undefined) {
    s.mineOnly = s.mineOverrides[tab];
  } else {
    s.mineOnly = EAP.personaWantsMineOn(EAP.personas[s.persona], tab);
  }

  EAP.render();
};

EAP.setKanbanView = function(view) {
  var s = EAP.state;
  s.kanbanView = view;
  s._kanbanViewOverride = true;  // user explicitly changed — don't reset on tab re-enter
  // Sprint view: force WorkItem level and require ART/Team context
  if (view === 'sprint') {
    if (s.context !== 'art' && s.context !== 'team') {
      s.context = 'art';
      s.contextName = 'Digital Banking ART';
      s.contextId = 'art1';
    }
    s.level = 'WorkItem';
  }
  EAP.render();
};

EAP.toggleMineOnly = function() {
  var s = EAP.state;
  s.mineOnly = !s.mineOnly;
  s.mineOverrides = s.mineOverrides || {};
  s.mineOverrides[s.tab] = s.mineOnly;       // remember manual override for this tab
  s.pagination = {};                          // reset paging — total list size has changed
  EAP.render();
};

EAP.toggleSplit = function() {
  EAP.state.splitView = !EAP.state.splitView;
  // Reset accordions: only active group open in both modes
  var groups = EAP.getListGroups();
  groups.forEach(function(g) {
    EAP.state.openAccordions[g.id] = !!g.active;
  });
  EAP.render();
};

EAP.toggleInsights = function() {
  EAP.state.insightsOpen = !EAP.state.insightsOpen;
  EAP.render();
};

EAP.toggleAccordion = function(id) {
  EAP.state.openAccordions[id] = !EAP.state.openAccordions[id];
  // Full re-render to ensure pagination and layout are correct
  EAP.render();
};

// toggleHierarchy defined in js/tabs/hierarchy.js (uses re-render)

// ── Personas (entry-slide + persona switcher) ──────────
// EAP.ME is the active persona's owner-key, set by EAP.applyPersona().
// "Owned by me" / "Assigned to me" filter does strict ownership against ME.
EAP.personas = {
  ananya: {
    key: 'ananya',
    me: 'Ananya',
    name: 'Ananya Krishnan',
    role: 'Product Manager',
    avatar: '../../assets/images/SN Avatar-4.png',
    defaults: {
      tab: 'backlog',
      context: 'art', contextName: 'Digital Banking ART', contextId: 'art1',
      level: 'Feature',
      kanbanView: 'current-pi'   // ART PM sees feature Kanban by default
    },
    // PM auto-filters across planning views
    mineOnTabs: ['backlog', 'planning', 'timeline', 'board']
  },
  james: {
    key: 'james',
    me: 'James',
    name: 'James Carter',
    role: 'Senior Developer · Auth Team',
    avatar: '../../assets/images/SN Avatar-7.png',
    defaults: {
      tab: 'board',
      context: 'team', contextName: 'Auth Team', contextId: 'team-auth',
      level: 'WorkItem',
      kanbanView: 'sprint'       // Dev lands on current sprint board
    },
    // Dev auto-filters to his own items in sprint view
    mineOnTabs: ['board']
  }
};

// Does the active persona want mineOnly auto-applied on this tab?
EAP.personaWantsMineOn = function(persona, tab) {
  if (!persona || !persona.mineOnTabs) return false;
  return persona.mineOnTabs.indexOf(tab) !== -1;
};

// Build an id → parentId map from the hierarchy tree (lazy, cached).
EAP._parentMap = null;
EAP._buildParentMap = function() {
  var m = {};
  function walk(node, parentId) {
    if (!node) return;
    m[node.id] = parentId || null;
    if (node.children) node.children.forEach(function(c) { walk(c, node.id); });
  }
  (EAP.hierarchy || []).forEach(function(root) { walk(root, null); });
  return m;
};
EAP.parentIdOf = function(id) {
  if (!EAP._parentMap) EAP._parentMap = EAP._buildParentMap();
  return EAP._parentMap[id] || null;
};

// Walk up the hierarchy from a node id until an Epic is found, return its product.
EAP._productViaHierarchy = function(id) {
  var pid = EAP.parentIdOf(id);
  var guard = 10;
  while (pid && guard-- > 0) {
    var ep = (EAP.epics && EAP.epics.all || []).filter(function(e) { return e.id === pid; })[0];
    if (ep) return ep.product || null;
    pid = EAP.parentIdOf(pid);
  }
  return null;
};

// Resolve the product for any item. Caps/Features walk hierarchy by id;
// Work items don't share ids with the hierarchy tree, so they match by feature name first.
EAP.resolveProduct = function(item, type) {
  if (!item) return null;
  if (type === 'Epic') return item.product || null;
  if (type === 'Capability' || type === 'Feature') return EAP._productViaHierarchy(item.id);
  if (type === 'WorkItem') {
    var f = (EAP.allFeatures || []).filter(function(ff) { return ff.name === item.parent; })[0];
    if (!f) return null;
    return EAP._productViaHierarchy(f.id);
  }
  return null;
};

// Generic walker — find an attribute on the nearest Epic ancestor.
EAP._epicAttrViaHierarchy = function(id, attr) {
  var pid = EAP.parentIdOf(id);
  var guard = 10;
  while (pid && guard-- > 0) {
    var ep = (EAP.epics && EAP.epics.all || []).filter(function(e) { return e.id === pid; })[0];
    if (ep) return ep[attr] || null;
    pid = EAP.parentIdOf(pid);
  }
  return null;
};

// Team → ART and ART → ST fallback maps. Used when the parent-chain
// walk via hierarchy can't find the value (e.g. features added to
// allFeatures but not in EAP.hierarchy).
EAP._teamToArt = {
  'Auth':              'Digital Banking ART',
  'Payments':          'Digital Banking ART',
  'Fraud':             'Digital Banking ART',
  'Mobile':            'Digital Banking ART',
  'Accounts':          'Digital Banking ART',
  'Onboard':           'Digital Banking ART',
  'Mortgages':         'Lending & Mortgages ART',
  'Lending Risk':      'Lending & Mortgages ART',
  // long-form team names
  'Auth Team':         'Digital Banking ART',
  'Payments Team':     'Digital Banking ART',
  'Fraud Team':        'Digital Banking ART',
  'Mobile Exp Team':   'Digital Banking ART',
  'Accounts Team':     'Digital Banking ART',
  'Onboarding Team':   'Digital Banking ART',
  'Mortgages Team':    'Lending & Mortgages ART',
  'Lending Risk Team': 'Lending & Mortgages ART'
};
EAP._artToSt = {
  'Digital Banking ART':     'Digital & Payments ST',
  'Lending & Mortgages ART': 'Lending & Mortgages ST'
};

// Resolve ART for any item. Epics/Caps/Features may have it directly;
// otherwise walk hierarchy, otherwise fall back to team→ART map.
EAP.resolveART = function(item, type) {
  if (!item) return null;
  if (item.art) return item.art;
  if (type === 'Capability' || type === 'Feature') {
    var a = EAP._epicAttrViaHierarchy(item.id, 'art');
    if (a) return a;
  }
  if (type === 'WorkItem') {
    var f = (EAP.allFeatures || []).filter(function(ff) { return ff.name === item.parent; })[0];
    if (f) {
      var fa = f.art || EAP._epicAttrViaHierarchy(f.id, 'art');
      if (fa) return fa;
    }
  }
  // Fallback: team → ART map
  if (item.team && EAP._teamToArt[item.team]) return EAP._teamToArt[item.team];
  return null;
};

// Resolve Solution Train. Only Epics have it directly; otherwise walk
// hierarchy, otherwise derive from ART via ART→ST map.
EAP.resolveST = function(item, type) {
  if (!item) return null;
  if (type === 'Epic') return item.st || null;
  if (type === 'Capability' || type === 'Feature') {
    var s = EAP._epicAttrViaHierarchy(item.id, 'st');
    if (s) return s;
  }
  if (type === 'WorkItem') {
    var f = (EAP.allFeatures || []).filter(function(ff) { return ff.name === item.parent; })[0];
    if (f) {
      var fs = EAP._epicAttrViaHierarchy(f.id, 'st');
      if (fs) return fs;
    }
  }
  // Fallback: derive ST from ART (which may itself fall back to team)
  var art = EAP.resolveART(item, type);
  if (art && EAP._artToSt[art]) return EAP._artToSt[art];
  return null;
};

// Risk bucket — derived from existing flags on items. Order: Blocked > At Risk > Stale > Healthy.
EAP.riskBucketOf = function(item) {
  if (!item) return 'Healthy';
  if (item.blocked || item.state === 'Blocked') return 'Blocked';
  if (item.atRisk) return 'At Risk';
  if (item.stalePIs && item.stalePIs >= 3) return 'Stale';
  return 'Healthy';
};

// Size bucket — Epics/Caps/Features have `size`; Work Items derive from `pts`.
EAP.sizeBucketOf = function(item, type) {
  if (!item) return null;
  if (item.size) return item.size;
  if (type === 'WorkItem' && item.pts != null) {
    if (item.pts >= 13) return 'XL';
    if (item.pts >= 8)  return 'L';
    if (item.pts >= 5)  return 'M';
    if (item.pts >= 3)  return 'S';
    return 'XS';
  }
  return null;
};

EAP.ME = 'Ananya';                  // updated by applyPersona() at boot

EAP.applyPersona = function(key) {
  var p = EAP.personas[key];
  if (!p) return false;
  EAP.ME = p.me;
  EAP.state.persona = key;
  EAP.state.tab         = p.defaults.tab;
  EAP.state.context     = p.defaults.context;
  EAP.state.contextName = p.defaults.contextName;
  EAP.state.contextId   = p.defaults.contextId;
  EAP.state.level       = p.defaults.level;
  EAP.state.kanbanView  = p.defaults.kanbanView || 'current-pi';
  EAP.state._kanbanViewOverride = false;  // fresh persona session resets any user override
  // Fresh persona session — clear any prior tab-level overrides, then apply
  // the persona's mineOnly default for the landing tab.
  EAP.state.mineOverrides = {};
  EAP.state.mineOnly      = EAP.personaWantsMineOn(p, EAP.state.tab);
  // Task Board: when persona is a team member, preselect them in the member chip
  EAP.state.trackMember = (key === 'james') ? 'James' : 'All';
  EAP.state.trackMembers = (key === 'james') ? ['James'] : [];
  EAP.state.trackTeam = 'All';
  EAP.state.trackTeams = [];
  EAP.state.ownerFilter = [];
  try { localStorage.setItem('eap.persona', key); } catch (e) {}
  return true;
};

EAP.toggleTrackMember = function(key) {
  var s = EAP.state;
  s.trackMembers = s.trackMembers || [];
  if (key === 'All') {
    s.trackMembers = [];
    s.trackMember = 'All';
  } else {
    var idx = s.trackMembers.indexOf(key);
    if (idx === -1) { s.trackMembers.push(key); }
    else { s.trackMembers.splice(idx, 1); }
    s.trackMember = s.trackMembers.length > 0 ? s.trackMembers[0] : 'All';
  }
  EAP.render();
};

EAP.toggleTrackTeam = function(key) {
  var s = EAP.state;
  s.trackTeams = s.trackTeams || [];
  if (key === 'All') {
    s.trackTeams = [];
    s.trackTeam = 'All';
  } else {
    var idx = s.trackTeams.indexOf(key);
    if (idx === -1) { s.trackTeams.push(key); }
    else { s.trackTeams.splice(idx, 1); }
    s.trackTeam = s.trackTeams.length > 0 ? s.trackTeams[0] : 'All';
  }
  EAP.render();
};

EAP.bootPersona = function() {
  var key = null;
  var tabOverride = null;
  var kvOverride = null;
  try {
    var qs = new URLSearchParams(window.location.search);
    if (qs.get('p')) key = qs.get('p');
    if (qs.get('tab')) tabOverride = qs.get('tab');
    if (qs.get('kv')) kvOverride = qs.get('kv');
  } catch (e) {}
  if (!key) {
    try { key = localStorage.getItem('eap.persona'); } catch (e) {}
  }
  if (!key || !EAP.personas[key]) key = 'ananya';
  EAP.applyPersona(key);
  // URL param overrides — e.g. ?tab=board&kv=sprint for deep links
  if (tabOverride && EAP.tabConfig.some(function(t) { return t.id === tabOverride; })) {
    EAP.state.tab = tabOverride;
    if (kvOverride) { EAP.state.kanbanView = kvOverride; EAP.state._kanbanViewOverride = true; }
  }
};

EAP.isMine = function(item) {
  return !!item && item.owner === EAP.ME;
};

EAP.applyMineFilter = function(items) {
  if (!Array.isArray(items)) return items;
  var result = items;
  if (EAP.state.mineOnly) {
    result = result.filter(EAP.isMine);
  }
  var of = EAP.state.ownerFilter;
  if (of && of.length > 0) {
    result = result.filter(function(item) { return of.indexOf(item.owner) !== -1; });
  }
  return result;
};

// Filter items by current team context (when s.context === 'team').
// Tolerant of short ('Auth') vs long ('Auth Team') team names.
EAP.applyTeamScope = function(items) {
  var s = EAP.state;
  if (s.context !== 'team' || !s.contextName) return items;
  if (!Array.isArray(items)) return items;
  var tn = s.contextName;
  return items.filter(function(it) {
    if (!it || !it.team) return false;
    return it.team === tn || (it.team + ' Team') === tn;
  });
};

// Universal scope filter — handles Portfolio / Solution Train / ART / Team.
// Pass `levelType` ('Epic'|'Capability'|'Feature'|'WorkItem') so the right
// resolver is used (some scopes need parent-chain walks for items that
// don't have the scope field directly — e.g. work items don't have art).
EAP.applyScope = function(items, levelType) {
  var s = EAP.state;
  if (!s || s.context === 'portfolio') return items;       // Portfolio = no filter
  if (!Array.isArray(items)) return items;
  var ctxName = s.contextName;
  if (!ctxName) return items;

  return items.filter(function(it) {
    if (!it) return false;

    if (s.context === 'team') {
      // Team scope: STRICT. Un-teamed items genuinely don't belong to any
      // team (e.g. uncommitted backlog features) — exclude them.
      if (!it.team) return false;
      return it.team === ctxName || (it.team + ' Team') === ctxName;
    }

    if (s.context === 'art') {
      var art = EAP.resolveART ? EAP.resolveART(it, levelType) : (it.art || null);
      // PERMISSIVE: if ART can't be determined (un-committed backlog items
      // without team / art / hierarchy parent), they're visible at any ART —
      // backlog hasn't been allocated yet. Otherwise must match exactly.
      if (art === null) return true;
      return art === ctxName;
    }

    if (s.context === 'solution-train') {
      var st = EAP.resolveST ? EAP.resolveST(it, levelType) : (it.st || null);
      if (st === null) return true;        // permissive — same rationale as ART
      return st === ctxName;
    }

    return true;
  });
};

// ── Data accessors based on current state ──────────────

EAP.getBacklogData = function() {
  var s = EAP.state;
  if (s.level === 'Epic')       return EAP.applyScope(EAP.applyMineFilter(typeof EAP.epics.backlog === 'function' ? EAP.epics.backlog() : EAP.epics.backlog), 'Epic');
  if (s.level === 'Capability') return EAP.applyScope(EAP.applyMineFilter(typeof EAP.capabilities.backlog === 'function' ? EAP.capabilities.backlog() : EAP.capabilities.backlog), 'Capability');
  if (s.level === 'Feature')    return EAP.applyScope(EAP.applyMineFilter(typeof EAP.features.backlog === 'function' ? EAP.features.backlog() : EAP.features.backlog), 'Feature');
  if (s.level === 'WorkItem') {
    // Workitem backlog is keyed object {Story, Defect, Incident, Problem}; filter each bucket.
    var bl = EAP.workItems.backlog;
    return {
      Story:    EAP.applyScope(EAP.applyMineFilter(bl.Story    || []), 'WorkItem'),
      Defect:   EAP.applyScope(EAP.applyMineFilter(bl.Defect   || []), 'WorkItem'),
      Incident: EAP.applyScope(EAP.applyMineFilter(bl.Incident || []), 'WorkItem'),
      Problem:  EAP.applyScope(EAP.applyMineFilter(bl.Problem  || []), 'WorkItem')
    };
  }
  return [];
};

EAP.getBacklogFlat = function() {
  var s = EAP.state;
  if (s.level !== 'WorkItem') return EAP.getBacklogData();
  // getBacklogData() returns the keyed object {Story, Defect, Incident, Problem},
  // already mine-filtered when state.mineOnly is on.
  // Sort by manual PM rank — interleaves Story/Defect/Incident/Problem by priority,
  // not by type bucket.
  var bl = EAP.getBacklogData();
  var all = (bl.Story || []).concat(bl.Defect || []).concat(bl.Incident || []).concat(bl.Problem || []);
  return all.slice().sort(function(a, b) { return (a.rank || 999) - (b.rank || 999); });
};

EAP.getListGroups = function() {
  var s = EAP.state;
  var groups;
  if (s.level === 'Epic') {
    // Resolve epicIds to actual epic objects
    groups = EAP.epics.groups.map(function(g) {
      return {id:g.id, name:g.name, type:g.type, items: g.epicIds.map(function(eid) {
        return EAP.epics.all.filter(function(e){return e.id===eid;})[0];
      }).filter(Boolean)};
    });
  } else if (s.level === 'Capability') {
    groups = EAP.capabilities.groups.map(function(g) {
      return {id:g.id, name:g.name, type:g.type, items: g.capIds.map(function(cid) {
        return EAP.capabilities.all.filter(function(c){return c.id===cid;})[0];
      }).filter(Boolean)};
    });
  } else if (s.level === 'Feature') {
    // Build PI groups from consolidated feature array
    groups = EAP.features.pis.map(function(pi) {
      var items = EAP.features.byPI(pi.id);
      return {id:pi.id, name:pi.name, dates:pi.dates, active:pi.active, capPct:pi.capPct, totalPts:pi.totalPts, donePts:pi.donePts, items:items};
    });
  } else if (s.level === 'WorkItem') {
    groups = EAP.workItems.sprints;
  } else {
    return [];
  }
  // Apply mineOnly + scope filter to items inside each group
  groups = groups.map(function(g) {
    var copy = {}; for (var k in g) copy[k] = g[k];
    copy.items = EAP.applyScope(EAP.applyMineFilter(g.items || []), s.level);
    return copy;
  });
  return groups;
};

EAP.getInsightsKey = function() {
  var s = EAP.state;
  // Kanban sprint view maps to the former 'taskboard' insights key for backward compat
  var tabKey = (s.tab === 'board' && s.kanbanView === 'sprint') ? 'taskboard' : s.tab;
  return s.context + '-' + s.level + '-' + tabKey;
};

EAP.getInsights = function() {
  var s = EAP.state;
  var key = EAP.getInsightsKey();
  var data = EAP.insights[key] || EAP.insights['art-Feature-' + s.tab] || EAP.insights['art-Feature-backlog'] || {};
  var result = {};
  for (var k in data) result[k] = data[k];

  // Inject per-team burndown for board/kanban-sprint when viewing a specific team.
  // Overrides the generic team-WorkItem-board panelChart with team-specific data.
  if (s.context === 'team' && result.panelChart && EAP.teamBurndown && EAP.getTeamKey) {
    var _tk = EAP.getTeamKey(s.contextId);
    if (_tk && EAP.teamBurndown[_tk]) result.panelChart = EAP.teamBurndown[_tk];
  }

  // Gauge/predict only on views that have them (Planning, Board)
  var showGauge = (s.context === 'art' && (s.tab === 'planning' || s.tab === 'board'));
  if (!showGauge) { delete result.gauge; delete result.predict; }

  // Health heatmap only on views that need it (Planning, Board, Task Board at ART)
  var showHealth = (s.context === 'art' && (s.tab === 'planning' || s.tab === 'board'));
  if (!showHealth) delete result.health;

  // Flow distribution only on Backlog views
  if (s.tab !== 'backlog') delete result.flowDist;

  return result;
};

// ── Helpers ────────────────────────────────────────────

EAP.stateClass = function(state) {
  // Each state value gets a unique class — no two values share styling.
  var map = {
    'Funnel':         'st-funnel',
    'Planned':        'st-planned',
    'Draft':          'st-draft',
    'Backlog':        'st-backlog',
    'To Do':          'st-todo',
    'Review':         'st-review',
    'Analysis':       'st-analysis',
    'In Review':      'st-in-review',
    'Testing':        'st-testing',
    'Implementation': 'st-impl',
    'In Progress':    'st-progress',
    'At Risk':        'st-at-risk',
    'Blocked':        'st-blocked',
    'Done':           'st-done',
    'Complete':       'st-done',
    'On Track':       'st-on-track'
  };
  return map[state] || 'st-funnel';
};

EAP.progressBarClass = function(state) {
  if (state === 'Blocked') return 'red';
  if (state === 'Done' || state === 'Complete') return 'green';
  return '';
};

EAP.dragGripSvg = '<svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor"><circle cx="2" cy="2" r="1.2"/><circle cx="6" cy="2" r="1.2"/><circle cx="2" cy="6" r="1.2"/><circle cx="6" cy="6" r="1.2"/><circle cx="2" cy="10" r="1.2"/><circle cx="6" cy="10" r="1.2"/></svg>';

EAP.addBtnSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
