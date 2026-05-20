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

// ── Sprint lookup helper ──────────────────────────────
function dpFindSprint(id) {
  var found = null;
  (EAP.workItems.sprints || []).forEach(function(sp) {
    (sp.items || []).forEach(function(wi) { if (wi.id === id) found = sp; });
  });
  return found;
}

// ── Blocker callout ───────────────────────────────────
function dpRenderBlocker(item) {
  if (!item.blocked && !item.blockReason) return '';
  var reason = item.blockReason || 'This item is blocked.';
  return '<div class="dp-blocker">' +
    '<span class="dp-blocker-icon">' + EAP.icon('alert-triangle', 14) + '</span>' +
    '<div class="dp-blocker-body">' +
      '<span class="dp-blocker-label">Blocked</span>' +
      '<p class="dp-blocker-reason">' + reason + '</p>' +
    '</div>' +
  '</div>';
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

// ── Dependencies section ──────────────────────────────
var DP_DEP_META = {
  conflict:  { icon:'alert-triangle', label:'Conflict',  blocksVerb:'Blocks',      dependsVerb:'Blocked by' },
  risk:      { icon:'clock',          label:'Risk',      blocksVerb:'Feeds into',  dependsVerb:'Waiting on' },
  satisfied: { icon:'check-square',   label:'Satisfied', blocksVerb:'Feeds into',  dependsVerb:'Depends on' }
};

function dpRenderDeps(item) {
  var deps = [].concat(EAP.featureDeps || [], EAP.wiDeps || []);
  var outbound = deps.filter(function(d) { return d.from === item.id; }); // item is prerequisite
  var inbound  = deps.filter(function(d) { return d.to === item.id; });   // item is dependent
  if (!outbound.length && !inbound.length) return '';

  function row(dep, direction) {
    var meta = DP_DEP_META[dep.type] || DP_DEP_META.satisfied;
    var otherId = direction === 'outbound' ? dep.to : dep.from;
    var other = dpFind(otherId);
    if (!other) return '';
    var verb = direction === 'outbound' ? meta.blocksVerb : meta.dependsVerb;
    return '<div class="dp-dep-row dp-dep-' + dep.type + '" data-dep-target="' + otherId + '">' +
      '<span class="dp-dep-icon">' + EAP.icon(meta.icon, 14) + '</span>' +
      '<div class="dp-dep-body">' +
        '<span class="dp-dep-verb">' + verb + '</span>' +
        '<span class="dp-dep-name">' + other.name + '</span>' +
        '<span class="dp-dep-meta">' + (other.num ? other.num + ' · ' : '') + (other.state || '') + '</span>' +
      '</div>' +
      '</div>';
  }

  var rows = outbound.map(function(d) { return row(d, 'outbound'); }).join('') +
             inbound.map(function(d) { return row(d, 'inbound'); }).join('');
  return '<div class="dp-section"><span class="dp-section-label">Dependencies</span><div class="dp-dep-list">' + rows + '</div></div>';
}

// ── Signals section (AI-bundled customer/exec/team signals) ──
// Three glass-clustered cards by source. Restraint over decoration:
// hairline borders, soft radial bloom in the corner of each cluster,
// type-led hierarchy. Top 3 items per cluster + "+N more" expander.
var DP_SIGNAL_META = {
  outlook:  { label:'Exec emails',      iconBg:'rgba(0, 120, 212, 0.10)',  iconFg:'#006abf', svg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3 7 12 13 21 7"/></svg>' },
  teams:    { label:'Teams threads',    iconBg:'rgba(98, 100, 167, 0.12)', iconFg:'#4b51a8', svg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>' },
  customer: { label:'Customer tickets', iconBg:'rgba(184, 51, 230, 0.12)', iconFg:'#9f2dc7', svg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a4 4 0 014-4h6a4 4 0 014 4v2"/></svg>' }
};

function dpRenderSignalCluster(kind, cluster) {
  if (!cluster || !cluster.items || !cluster.items.length) return '';
  var meta = DP_SIGNAL_META[kind] || DP_SIGNAL_META.outlook;
  var rows = cluster.items.map(function(s) {
    return '<div class="dp-signal-row">' +
      '<div class="dp-signal-row-hd">' +
        '<span class="dp-signal-sender">' + s.sender + '</span>' +
        (s.role ? '<span class="dp-signal-role">' + s.role + '</span>' : '') +
        (s.time ? '<span class="dp-signal-time">' + s.time + '</span>' : '') +
      '</div>' +
      (s.subject ? '<div class="dp-signal-subject">' + s.subject + '</div>' : '') +
      '<p class="dp-signal-snippet">' + s.snippet + '</p>' +
    '</div>';
  }).join('');
  var more = (cluster.total > cluster.items.length)
    ? '<button class="dp-signal-more" type="button">+ ' + (cluster.total - cluster.items.length) + ' more</button>'
    : '';
  return '<div class="dp-signal-cluster dp-sig-' + kind + '">' +
    '<div class="dp-signal-cluster-hd">' +
      '<span class="dp-signal-icon" style="background:' + meta.iconBg + ';color:' + meta.iconFg + ';">' + meta.svg + '</span>' +
      '<span class="dp-signal-cluster-lbl">' + meta.label + '</span>' +
      '<span class="dp-signal-cluster-count">' + cluster.total + '</span>' +
    '</div>' +
    '<div class="dp-signal-list">' + rows + more + '</div>' +
  '</div>';
}

function dpRenderSignals(item) {
  if (!item || !item.signals) return '';
  var sig = item.signals;
  var total = (sig.outlook ? sig.outlook.total : 0) + (sig.teams ? sig.teams.total : 0) + (sig.customer ? sig.customer.total : 0);
  return '<div class="dp-section dp-section-signals">' +
    '<div class="dp-signals-hd">' +
      '<span class="dp-section-label">Customer signals</span>' +
      '<span class="dp-signals-total">' + total + ' bundled · 3 sources</span>' +
    '</div>' +
    (item.signalsSummary ? '<p class="dp-signals-summary">' + item.signalsSummary + '</p>' : '') +
    '<div class="dp-signal-clusters">' +
      dpRenderSignalCluster('outlook',  sig.outlook) +
      dpRenderSignalCluster('teams',    sig.teams) +
      dpRenderSignalCluster('customer', sig.customer) +
    '</div>' +
  '</div>';
}

// ── Structured PR section ─────────────────────────────
function dpRenderPR(item) {
  if (!item.pr) return '';
  var pr = item.pr;
  var prColors = { merged:'#16A34A', 'in-review':'#D97706', open:'#2563EB', draft:'#797874' };
  var prBgs    = { merged:'rgba(22,163,74,0.12)', 'in-review':'rgba(217,119,6,0.12)', open:'rgba(37,99,235,0.12)', draft:'rgba(0,0,0,0.08)' };
  var prLabels = { merged:'Merged', 'in-review':'In Review', open:'Open', draft:'Draft' };
  var pc = prColors[pr.status] || prColors.open;
  var pb = prBgs[pr.status]    || prBgs.open;
  var pl = prLabels[pr.status] || pr.status;
  var blockMod = (item.ci && item.ci.status === 'failing') ? 'dp-pr-block-fail'
    : pr.status === 'merged'    ? 'dp-pr-block-merged'
    : pr.status === 'in-review' ? 'dp-pr-block-review'
    : pr.status === 'open'      ? 'dp-pr-block-open' : '';
  var h = '<div class="dp-section dp-pr-section">' +
    '<span class="dp-section-label">Pull Request</span>' +
    '<div class="dp-pr-block' + (blockMod ? ' ' + blockMod : '') + '">';

  // Header: status pill + PR number
  h += '<div class="dp-pr-head">' +
    '<span class="dp-pr-pill" style="color:' + pc + ';background:' + pb + ';">' + pl + '</span>' +
    (pr.number ? '<span class="dp-pr-num">#' + pr.number + '</span>' : '') +
  '</div>';

  // Detail grid — 2-column CSS grid, labels pinned at exact width
  h += '<div class="dp-pr-grid">';

  h += '<span class="dp-pr-lbl">Branch</span>' +
    '<span class="dp-pr-val dp-pr-branch">' + pr.branch + ' → main</span>';

  if (item.ci) {
    var ciC = { passing:'#16A34A', failing:'#DC2626', running:'#D97706' }[item.ci.status] || '#797874';
    var ciL = { passing:'Passing', failing:'Failing', running:'Running' }[item.ci.status] || item.ci.status;
    h += '<span class="dp-pr-lbl">Build</span>' +
      '<span class="dp-pr-val" style="color:' + ciC + ';">' + ciL + '</span>';
  }

  if (item.reviewers) {
    var rv = item.reviewers;
    var rvTxt = rv.approved + ' of ' + rv.count + ' ' +
      ({ approved:'approved', 'review-required':'awaiting review', 'changes-requested':'changes requested' }[rv.state] || rv.state);
    var rvC = rv.state === 'approved' ? '#16A34A' : rv.state === 'changes-requested' ? '#DC2626' : 'var(--text-secondary)';
    h += '<span class="dp-pr-lbl">Reviewers</span>' +
      '<span class="dp-pr-val" style="color:' + rvC + ';">' + rvTxt + '</span>';
  }

  if (item.env) {
    var envC = { deployed:'#16A34A', pending:'#797874', failed:'#DC2626' }[item.env.status] || '#797874';
    h += '<span class="dp-pr-lbl">Environment</span>' +
      '<span class="dp-pr-val"><span class="dp-pr-dot" style="background:' + envC + ';"></span>' +
      '<span style="color:' + envC + ';">' + item.env.target + '</span></span>';
  }

  h += '</div>';

  // Blockers callout — full-width, no label column
  if (pr.status !== 'merged') {
    var blockers = [];
    if (item.ci && item.ci.status === 'failing') blockers.push('Build failing');
    if (item.reviewers && item.reviewers.state === 'review-required') blockers.push('Review pending');
    if (pr.status === 'draft') blockers.push('Draft — not mergeable');
    if (blockers.length) {
      h += '<div class="dp-pr-blockers">' + blockers.join(' · ') + '</div>';
    }
  }

  return h + '</div></div>';
}

// ── DoD checklist section ─────────────────────────────
function dpRenderDoD(item) {
  if (!item.dod || !item.dod.length) return '';
  var done = item.dod.filter(function(d) { return d.done; }).length;
  var total = item.dod.length;
  var allDone = done === total;
  var h = '<div class="dp-section dp-dod-section">' +
    '<div class="dp-dod-hd">' +
      '<span class="dp-section-label">Definition of Done</span>' +
      '<span class="dp-dod-progress"' + (allDone ? ' style="color:#16A34A;"' : '') + '>' + done + '/' + total + '</span>' +
    '</div>' +
    '<div class="dp-dod-list dp-dod-list-bg">';
  item.dod.forEach(function(d) {
    var icon = d.done
      ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5.5" fill="rgba(22,163,74,0.18)"/><path d="M3 6l2 2 4-4" stroke="#16A34A" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      : '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5.5" stroke="#CCCBC8" stroke-width="1"/></svg>';
    h += '<div class="dp-dod-item"><span class="dp-dod-check">' + icon + '</span><span class="dp-dod-item-label' + (d.done ? ' dp-dod-item-done' : '') + '">' + d.label + '</span></div>';
  });
  return h + '</div></div>';
}

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
  if (item.carriedOver) h += '<div class="dp-carryover">' + EAP.icon('rotate-ccw', 11) + ' Carried over</div>';
  h += '</div>';

  // Blocker callout (shown prominently between header and fields)
  h += dpRenderBlocker(item);

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
  var sprintCtx = dpFindSprint(item.id);
  if (sprintCtx) fields.push({ label: 'Sprint', value: sprintCtx.name + (sprintCtx.active ? ' <span class="dp-sprint-active">Active</span>' : '') });
  if (item.openDefects) fields.push({ label: 'Open Defects', value: '<span style="font-family:var(--font-mono);color:#DC2626;">' + item.openDefects + '</span>' });
  if (item.atRisk) fields.push({ label: 'Risk', value: '<span class="dp-atrisk-badge">' + EAP.icon('alert-triangle', 11) + ' At risk</span>' });

  fields.forEach(function(f) {
    h += '<div class="dp-field"><span class="dp-field-label">' + f.label + '</span><span class="dp-field-value">' + f.value + '</span></div>';
  });
  h += '</div>';

  // Progress (if applicable)
  if (item.pct !== undefined && item.pct !== null) {
    h += '<div class="dp-section"><span class="dp-section-label">Progress</span>' + EAP.pbar(item.pct, item.state) + '</div>';
  }

  // Structured PR + DoD sections (appear before dependencies)
  var prHtml = dpRenderPR(item);
  if (prHtml) h += prHtml;
  var dodHtml = dpRenderDoD(item);
  if (dodHtml) h += dodHtml;

  // Dependencies (if any)
  var depsHtml = dpRenderDeps(item);
  if (depsHtml) h += depsHtml;

  // Signals (AI-bundled — leads when present, before generic description)
  var sigHtml = dpRenderSignals(item);
  if (sigHtml) h += sigHtml;

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

  // Double-RAF: first frame paints the panel at translateX(100%) so the
  // browser registers the starting state; second frame adds .open and the
  // CSS transition can play correctly.
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      var panel = document.getElementById('dp-panel');
      var overlay = document.getElementById('dp-overlay');
      if (panel) panel.classList.add('open');
      if (overlay) overlay.classList.add('open');
    });
  });

  // Wire close
  document.getElementById('dp-close').addEventListener('click', function() { EAP.closeDetail(); });
  document.getElementById('dp-overlay').addEventListener('click', function() { EAP.closeDetail(); });

  // Init trace ring popover (event-delegated, idempotent)
  if (EAP.initTracePopovers) EAP.initTracePopovers();

  // Wire dep rows to re-open detail for the linked item
  document.querySelectorAll('#dp-panel [data-dep-target]').forEach(function(el) {
    el.addEventListener('click', function() {
      var tid = el.getAttribute('data-dep-target');
      if (tid) EAP.openDetail(tid);
    });
  });

  // Signals "+N more" → mark cluster expanded (CSS-driven; no list expansion
  // since demo data only ships top 3 — clicking acknowledges the count).
  document.querySelectorAll('#dp-panel .dp-signal-more').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var cluster = btn.closest('.dp-signal-cluster');
      if (cluster) cluster.classList.toggle('is-expanded');
    });
  });
};

EAP.closeDetail = function() {
  var existing = document.getElementById('dp-container');
  if (existing) existing.remove();
};
