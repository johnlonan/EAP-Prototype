/* ═══════════════════════════════════════════════════════
   DETAIL-PANEL.JS — Slide-in item detail panel
   Opens on click of item name, record number, or card.
   Shows item fields, description, acceptance criteria,
   and activity feed (static placeholder content).
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

// ── Lookup helpers ────────────────────────────────────
function dpFind(id) {
  // Search all data sources for an item by id
  var item = null;
  // Epics
  EAP.epics.all.forEach(function(e) { if (e.id === id) item = e; });
  // Capabilities
  EAP.capabilities.all.forEach(function(c) { if (c.id === id) item = c; });
  // Features
  EAP.allFeatures.forEach(function(f) { if (f.id === id) item = f; });
  // Sprint work items
  EAP.workItems.sprints.forEach(function(sp) {
    (sp.items || []).forEach(function(wi) { if (wi.id === id) item = wi; });
  });
  // Backlog work items
  var bl = EAP.workItems.backlog;
  ['Story','Defect','CaseTask'].forEach(function(k) {
    (bl[k] || []).forEach(function(wi) { if (wi.id === id) item = wi; });
  });
  // Hierarchy items (stories, defects nested in hierarchy)
  function searchHier(nodes) {
    (nodes || []).forEach(function(n) {
      if (n.id === id) item = n;
      if (n.children) searchHier(n.children);
    });
  }
  if (!item) searchHier(EAP.hierarchy);
  return item;
}

// ── Static placeholder content ────────────────────────
var DP_DESC = {
  Epic: 'This epic encompasses a strategic initiative spanning multiple PIs. It defines the high-level business outcome and is broken down into capabilities and features for execution by the ART.',
  Capability: 'This capability represents a cross-cutting functional area that enables business outcomes. It is decomposed into features assigned to specific teams within the ART.',
  Feature: 'This feature delivers a specific user-facing capability within the current or upcoming PI. It is sized to be delivered within a single PI and has defined acceptance criteria.',
  Story: 'This user story describes a specific piece of functionality from the end-user perspective. It is estimated in story points and assigned to a team member for the current sprint.',
  Defect: 'This defect was identified during testing or production monitoring. It includes steps to reproduce, expected vs actual behaviour, and severity classification.',
  'Case Task': 'This task supports the delivery process — documentation, compliance checks, or coordination activities required before a feature can be accepted.'
};

var DP_AC = [
  'Given a user is authenticated, when they access this feature, then the expected behaviour is displayed correctly.',
  'Given invalid input, the system displays an appropriate error message within 200ms.',
  'All edge cases documented in the specification are handled gracefully.'
];

var DP_ACTIVITY = [
  { who: 'Ananya', when: '2 days ago', text: 'Updated acceptance criteria based on stakeholder feedback.' },
  { who: 'Raj', when: '4 days ago', text: 'Moved to In Progress. Assigned to sprint backlog.' },
  { who: 'Priya', when: '1 week ago', text: 'Created from PI Planning session. Initial sizing complete.' }
];

// ── Render panel HTML ─────────────────────────────────
function dpRender(item) {
  if (!item) return '';
  var type = item.type || EAP.state.level;
  var tc = EAP._typeColors[type] || 'var(--text-tertiary)';
  var goalName = item.goal ? EAP.goalName(item.goal) : '';

  var h = '<div class="dp-overlay" id="dp-overlay"></div>';
  h += '<div class="dp-panel" id="dp-panel">';

  // Header
  h += '<div class="dp-header">';
  h += '<button class="dp-close" id="dp-close">' + EAP.icon('x', 16) + '</button>';
  h += '<div class="dp-type" style="color:' + tc + ';">' + EAP.icon(type.toLowerCase() === 'case task' ? 'clipboard-check' : type.toLowerCase(), 14) + ' ' + type + '</div>';
  if (item.num) h += '<span class="dp-num">' + item.num + '</span>';
  h += '<h2 class="dp-title">' + item.name + '</h2>';
  h += '<div class="dp-state">' + EAP.pill(item.state) + '</div>';
  h += '</div>';

  // Fields grid
  h += '<div class="dp-fields">';
  var fields = [];
  if (item.owner) fields.push({ label: type === 'Story' || type === 'Defect' || type === 'Case Task' ? 'Assigned to' : 'Owner', value: '<span class="dp-owner">' + EAP.avatar(item.owner, 20) + ' ' + (EAP.people[item.owner] ? EAP.people[item.owner].name : item.owner) + '</span>' });
  if (item.team) fields.push({ label: 'Team', value: item.team });
  if (item.parent) fields.push({ label: 'Parent', value: item.parent });
  if (item.wsjf) fields.push({ label: 'WSJF', value: '<span style="font-family:var(--font-mono);">' + item.wsjf + '</span>' });
  if (item.pts) fields.push({ label: 'Points', value: '<span style="font-family:var(--font-mono);">' + item.pts + '</span>' });
  if (item.size) fields.push({ label: 'Size', value: item.size });
  if (item.pi) fields.push({ label: 'PI', value: item.pi.toUpperCase().replace('PI', 'PI ') });
  if (item.art) fields.push({ label: 'ART', value: item.art });
  if (item.st) fields.push({ label: 'Solution Train', value: item.st });
  if (goalName) fields.push({ label: 'Primary Goal', value: goalName });

  fields.forEach(function(f) {
    h += '<div class="dp-field"><span class="dp-field-label">' + f.label + '</span><span class="dp-field-value">' + f.value + '</span></div>';
  });
  h += '</div>';

  // Progress (if applicable)
  if (item.pct !== undefined && item.pct !== null) {
    h += '<div class="dp-section"><span class="dp-section-label">Progress</span>' + EAP.pbar(item.pct, item.state) + '</div>';
  }

  // Description
  h += '<div class="dp-section"><span class="dp-section-label">Description</span><p class="dp-desc">' + (DP_DESC[type] || DP_DESC.Story) + '</p></div>';

  // Acceptance Criteria
  h += '<div class="dp-section"><span class="dp-section-label">Acceptance Criteria</span><ul class="dp-ac">';
  DP_AC.forEach(function(ac) { h += '<li>' + ac + '</li>'; });
  h += '</ul></div>';

  // Activity
  h += '<div class="dp-section"><span class="dp-section-label">Activity</span><div class="dp-activity">';
  DP_ACTIVITY.forEach(function(a) {
    h += '<div class="dp-act-item">' + EAP.avatar(a.who, 24) +
      '<div class="dp-act-body"><span class="dp-act-who">' + (EAP.people[a.who] ? EAP.people[a.who].name : a.who) + '</span><span class="dp-act-when">' + a.when + '</span><p class="dp-act-text">' + a.text + '</p></div></div>';
  });
  h += '</div></div>';

  h += '</div>';
  return h;
}

// ── Open / Close ──────────────────────────────────────
EAP.openDetail = function(id) {
  var item = dpFind(id);
  if (!item) return;

  // Remove existing panel
  EAP.closeDetail();

  var container = document.createElement('div');
  container.id = 'dp-container';
  container.innerHTML = dpRender(item);
  document.body.appendChild(container);

  // Animate in
  requestAnimationFrame(function() {
    var panel = document.getElementById('dp-panel');
    var overlay = document.getElementById('dp-overlay');
    if (panel) panel.classList.add('open');
    if (overlay) overlay.classList.add('open');
  });

  // Wire close
  document.getElementById('dp-close').addEventListener('click', function() { EAP.closeDetail(); });
  document.getElementById('dp-overlay').addEventListener('click', function() { EAP.closeDetail(); });
};

EAP.closeDetail = function() {
  var existing = document.getElementById('dp-container');
  if (existing) existing.remove();
};
