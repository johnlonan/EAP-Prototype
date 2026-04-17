/* ═══════════════════════════════════════════════════════
   STATE.JS — Application state and transitions
   ═══════════════════════════════════════════════════════ */

var EAP = EAP || {};

EAP.state = {
  // Context — what scope the user is viewing
  context: 'art',                    // portfolio | solution-train | art | team
  contextName: 'Digital Banking ART',
  contextId: 'art1',

  // Level — what entity type is shown (driven by context)
  level: 'Feature',                  // Epic | Capability | Feature | WorkItem

  // Tab — which view is active
  tab: 'Backlog',                    // Backlog | List | Board | Hierarchy

  // Filters
  mineOnly: true,

  // View options
  splitView: true,
  insightsOpen: true,
  showDeps: false,

  // Board sub-views
  boardView: 'grid',                 // grid | track (WorkItem only)
  boardDensity: 'default',           // default | compact (per tab session)

  // Accordion open states
  openAccordions: {},

  // Hierarchy expand states
  openHierarchy: {}
};

// ── State transitions ──────────────────────────────────

EAP.setContext = function(type, name, id) {
  var s = EAP.state;
  s.context = type;
  s.contextName = name;
  s.contextId = id;
  // Auto-set level to default for new context
  s.level = EAP.defaultLevel[type];
  // Reset accordion states
  s.openAccordions = {};
  // Re-render everything
  EAP.render();
};

EAP.setLevel = function(level) {
  EAP.state.level = level;
  EAP.state.openAccordions = {};
  EAP.render();
};

EAP.setTab = function(tab) {
  EAP.state.tab = tab;
  EAP.render();
};

EAP.toggleMineOnly = function() {
  EAP.state.mineOnly = !EAP.state.mineOnly;
  EAP.render();
};

EAP.toggleSplit = function() {
  EAP.state.splitView = !EAP.state.splitView;
  // When switching to stacked (non-split), collapse all except active
  if (!EAP.state.splitView) {
    var groups = EAP.getListGroups();
    groups.forEach(function(g) {
      EAP.state.openAccordions[g.id] = !!g.active;
    });
  }
  EAP.render();
};

EAP.toggleInsights = function() {
  EAP.state.insightsOpen = !EAP.state.insightsOpen;
  EAP.render();
};

EAP.toggleAccordion = function(id) {
  EAP.state.openAccordions[id] = !EAP.state.openAccordions[id];
  // Don't full re-render — just toggle the body
  var body = document.getElementById('pi-body-' + id);
  var tog = document.getElementById('pi-tog-' + id);
  if (body && tog) {
    var isOpen = EAP.state.openAccordions[id];
    body.classList.toggle('open', isOpen);
    tog.textContent = isOpen ? '−' : '+';
    tog.classList.toggle('open', isOpen);
  }
};

EAP.toggleHierarchy = function(id) {
  EAP.state.openHierarchy[id] = !EAP.state.openHierarchy[id];
  var kids = document.getElementById('hier-kids-' + id);
  var tog = document.getElementById('hier-tog-' + id);
  if (kids && tog) {
    var isOpen = EAP.state.openHierarchy[id];
    kids.classList.toggle('open', isOpen);
    tog.textContent = isOpen ? '−' : '+';
    tog.classList.toggle('open', isOpen);
  }
};

// ── Data accessors based on current state ──────────────

EAP.getBacklogData = function() {
  var s = EAP.state;
  if (s.level === 'Epic')       return typeof EAP.epics.backlog === 'function' ? EAP.epics.backlog() : EAP.epics.backlog;
  if (s.level === 'Capability') return typeof EAP.capabilities.backlog === 'function' ? EAP.capabilities.backlog() : EAP.capabilities.backlog;
  if (s.level === 'Feature')    return typeof EAP.features.backlog === 'function' ? EAP.features.backlog() : EAP.features.backlog;
  if (s.level === 'WorkItem')   return EAP.workItems.backlog;
  return [];
};

EAP.getBacklogFlat = function() {
  var s = EAP.state;
  if (s.level !== 'WorkItem') return EAP.getBacklogData();
  var bl = EAP.workItems.backlog;
  return (bl.Story || []).concat(bl.Defect || []).concat(bl.CaseTask || []);
};

EAP.getListGroups = function() {
  var s = EAP.state;
  if (s.level === 'Epic') {
    // Resolve epicIds to actual epic objects
    return EAP.epics.groups.map(function(g) {
      return {id:g.id, name:g.name, type:g.type, items: g.epicIds.map(function(eid) {
        return EAP.epics.all.filter(function(e){return e.id===eid;})[0];
      }).filter(Boolean)};
    });
  }
  if (s.level === 'Capability') {
    return EAP.capabilities.groups.map(function(g) {
      return {id:g.id, name:g.name, type:g.type, items: g.capIds.map(function(cid) {
        return EAP.capabilities.all.filter(function(c){return c.id===cid;})[0];
      }).filter(Boolean)};
    });
  }
  if (s.level === 'Feature') {
    // Build PI groups from consolidated feature array
    return EAP.features.pis.map(function(pi) {
      var items = EAP.features.byPI(pi.id);
      return {id:pi.id, name:pi.name, dates:pi.dates, active:pi.active, capPct:pi.capPct, totalPts:pi.totalPts, donePts:pi.donePts, items:items};
    });
  }
  if (s.level === 'WorkItem') return EAP.workItems.sprints;
  return [];
};

EAP.getInsightsKey = function() {
  var s = EAP.state;
  return s.context + '-' + s.level + '-' + s.tab;
};

EAP.getInsights = function() {
  var s = EAP.state;
  var data = EAP.insights[EAP.getInsightsKey()] || EAP.insights['art-Feature-' + s.tab] || {};
  var result = {};
  for (var k in data) result[k] = data[k];

  // Gauge + team capacity only at ART context + Feature level + List or Board tab
  var showCapacity = (s.context === 'art' && s.tab !== 'Backlog' && s.tab !== 'Hierarchy');
  if (!showCapacity) { delete result.gauge; delete result.teams; }

  // Team bars only at ART context (not team, portfolio, ST)
  if (s.context !== 'art') { delete result.teams; }

  return result;
};

// ── Helpers ────────────────────────────────────────────

EAP.stateClass = function(state) {
  var map = {
    'Funnel':         'st-funnel',
    'Backlog':        'st-backlog',
    'Review':         'st-analysis',
    'Analysis':       'st-analysis',
    'Implementation': 'st-impl',
    'In Progress':    'st-progress',
    'Blocked':        'st-blocked',
    'Done':           'st-done',
    'Complete':       'st-done',
    'Draft':          'st-backlog',
    'Planned':        'st-funnel',
    'To Do':          'st-backlog',
    'In Review':      'st-analysis',
    'Testing':        'st-analysis',
    'At Risk':        'st-impl'
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
