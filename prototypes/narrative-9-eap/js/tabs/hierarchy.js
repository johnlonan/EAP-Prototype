/* ═══════════════════════════════════════════════════════
   HIERARCHY.JS — Hierarchy tab renderer (flat table)
   Tree lines + disabled toggles for leaf nodes
   Re-rooting: Goal (default) | Product | Owner | State
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

// ── Tree builders — re-root from the canonical EAP.hierarchy ──

// Re-rooted by Product. Top: Product → Epic → Cap → Feature → Story/Defect.
// Epic.product comes from EAP.epics.all (the existing tree only has names).
function buildProductTree() {
  var products = {}, order = [];
  function epicProduct(epicId) {
    var ep = (EAP.epics && EAP.epics.all || []).filter(function(e) { return e.id === epicId; })[0];
    return ep ? (ep.product || null) : null;
  }
  (EAP.hierarchy || []).forEach(function(goal) {
    (goal.children || []).forEach(function(epic) {
      var prod = epicProduct(epic.id) || 'Unassigned';
      if (!products[prod]) {
        products[prod] = { id: 'prod-' + prod.toLowerCase().replace(/\s+/g, '-'), type: 'product', name: prod, children: [] };
        order.push(prod);
      }
      products[prod].children.push(epic);
    });
  });
  return order.map(function(p) { return products[p]; });
}

// Re-rooted by Owner. Top: Owner → flat list of items they own (any type).
// Children are flattened (no further nesting) — owner view is "what's mine across levels".
function buildOwnerTree() {
  var owners = {}, order = [];
  function visit(node) {
    if (node.owner) {
      if (!owners[node.owner]) {
        var displayName = (EAP.people && EAP.people[node.owner] && EAP.people[node.owner].name) || node.owner;
        owners[node.owner] = { id: 'owner-' + node.owner, type: 'owner', name: displayName, owner: node.owner, children: [] };
        order.push(node.owner);
      }
      owners[node.owner].children.push({
        id: node.id, type: node.type, name: node.name,
        state: node.state, pct: node.pct, pts: node.pts,
        owner: node.owner, team: node.team
      });
    }
    if (node.children) node.children.forEach(visit);
  }
  (EAP.hierarchy || []).forEach(visit);
  return order.sort().map(function(o) { return owners[o]; });
}

// Re-rooted by State. Top: State → flat list of items in that state.
function buildStateTree() {
  var states = {};
  var stateOrder = ['Funnel', 'Backlog', 'Draft', 'Planned', 'To Do', 'Review', 'Analysis', 'In Review', 'Implementation', 'In Progress', 'Blocked', 'Done', 'Complete'];
  function visit(node) {
    if (node.state) {
      if (!states[node.state]) {
        // Top-level state row — name carries the state; don't set `state` field
        // so the State column / pill don't duplicate the Name column.
        states[node.state] = { id: 'state-' + node.state.replace(/\s+/g, '-'), type: 'state', name: node.state, children: [] };
      }
      states[node.state].children.push({
        id: node.id, type: node.type, name: node.name,
        state: node.state, pct: node.pct, pts: node.pts,
        owner: node.owner, team: node.team
      });
    }
    if (node.children) node.children.forEach(visit);
  }
  (EAP.hierarchy || []).forEach(visit);
  var ordered = stateOrder.filter(function(st) { return states[st]; });
  Object.keys(states).forEach(function(st) { if (ordered.indexOf(st) === -1) ordered.push(st); });
  return ordered.map(function(st) { return states[st]; });
}

// Re-rooted by Size. Top: Size bucket (XL → XS) → flat list of items.
function buildSizeTree() {
  var buckets = {};
  var order = ['XL','L','M','S','XS'];
  function visit(node) {
    var sz = EAP.sizeBucketOf(node, node.type === 'feature' ? 'Feature'
      : node.type === 'capability' ? 'Capability'
      : node.type === 'epic' ? 'Epic'
      : (node.type === 'story' || node.type === 'defect') ? 'WorkItem' : null);
    if (sz && order.indexOf(sz) !== -1) {
      if (!buckets[sz]) buckets[sz] = { id: 'sz-' + sz, type: 'size', name: sz, children: [] };
      buckets[sz].children.push({
        id: node.id, type: node.type, name: node.name,
        state: node.state, pct: node.pct, pts: node.pts,
        owner: node.owner, team: node.team
      });
    }
    if (node.children) node.children.forEach(visit);
  }
  (EAP.hierarchy || []).forEach(visit);
  return order.filter(function(s) { return buckets[s]; }).map(function(s) { return buckets[s]; });
}

// Re-rooted by Risk. Top: risk bucket → flat items.
function buildRiskTree() {
  var buckets = {};
  var order = ['Blocked','At Risk','Stale','Healthy'];
  function visit(node) {
    var risk = EAP.riskBucketOf(node);
    if (!buckets[risk]) buckets[risk] = { id: 'risk-' + risk.replace(/\s+/g, '-'), type: 'risk', name: risk, children: [] };
    buckets[risk].children.push({
      id: node.id, type: node.type, name: node.name,
      state: node.state, pct: node.pct, pts: node.pts,
      owner: node.owner, team: node.team
    });
    if (node.children) node.children.forEach(visit);
  }
  (EAP.hierarchy || []).forEach(visit);
  return order.filter(function(r) { return buckets[r]; }).map(function(r) { return buckets[r]; });
}

// Re-rooted by ART. Top: ART → Epic/Cap/Feature/WI grouped under it.
function buildArtTree() {
  var buckets = {}, order = [];
  function visit(node, type) {
    var art = EAP.resolveART(node, type);
    if (!art) return;
    if (!buckets[art]) {
      buckets[art] = { id: 'art-' + art.replace(/\s+/g, '-'), type: 'art', name: art, children: [] };
      order.push(art);
    }
    buckets[art].children.push({
      id: node.id, type: node.type, name: node.name,
      state: node.state, pct: node.pct, pts: node.pts,
      owner: node.owner, team: node.team
    });
  }
  function walk(node) {
    var typeMap = { epic: 'Epic', capability: 'Capability', feature: 'Feature', story: 'WorkItem', defect: 'WorkItem' };
    if (typeMap[node.type]) visit(node, typeMap[node.type]);
    if (node.children) node.children.forEach(walk);
  }
  (EAP.hierarchy || []).forEach(walk);
  return order.sort().map(function(a) { return buckets[a]; });
}

// Re-rooted by Solution Train.
function buildStTree() {
  var buckets = {}, order = [];
  function visit(node, type) {
    var st = EAP.resolveST(node, type);
    if (!st) return;
    if (!buckets[st]) {
      buckets[st] = { id: 'st-' + st.replace(/\s+/g, '-'), type: 'st', name: st, children: [] };
      order.push(st);
    }
    buckets[st].children.push({
      id: node.id, type: node.type, name: node.name,
      state: node.state, pct: node.pct, pts: node.pts,
      owner: node.owner, team: node.team
    });
  }
  function walk(node) {
    var typeMap = { epic: 'Epic', capability: 'Capability', feature: 'Feature', story: 'WorkItem', defect: 'WorkItem' };
    if (typeMap[node.type]) visit(node, typeMap[node.type]);
    if (node.children) node.children.forEach(walk);
  }
  (EAP.hierarchy || []).forEach(walk);
  return order.sort().map(function(s) { return buckets[s]; });
}

EAP.buildHierarchyTree = function() {
  var g = (EAP.state && EAP.state.hierGroupBy) || 'goal';
  if (g === 'product') return buildProductTree();
  if (g === 'owner')   return buildOwnerTree();
  if (g === 'state')   return buildStateTree();
  if (g === 'size')    return buildSizeTree();
  if (g === 'risk')    return buildRiskTree();
  if (g === 'art')     return buildArtTree();
  if (g === 'st')      return buildStTree();
  return EAP.hierarchy || [];
};

// Top-level types (rendered with the prominent goal-style row treatment)
var TOP_TYPES = ['goal', 'product', 'owner', 'state', 'size', 'risk', 'art', 'st'];
// Map non-canonical types to existing icon names
function iconNameForType(t) {
  if (t === 'owner')   return 'user';
  if (t === 'state')   return 'flag';
  if (t === 'product') return 'feature';
  if (t === 'size')    return 'square';
  if (t === 'risk')    return 'alert-triangle';
  if (t === 'art')     return 'users';
  if (t === 'st')      return 'compass';
  return t; // goal, epic, capability, feature, story, defect already exist
}

// Caption text shown next to "Hierarchy" — adapts to the active grouping.
function captionForGrouping(g) {
  if (g === 'product') return 'Product → Epic → Capability → Feature → Story → Defect';
  if (g === 'owner')   return 'Owner → all items owned, across levels';
  if (g === 'state')   return 'State → all items in that state, across levels';
  if (g === 'size')    return 'Size → all items at that t-shirt size';
  if (g === 'risk')    return 'Risk → all items at that risk level';
  if (g === 'art')     return 'ART → all items inside that release train';
  if (g === 'st')      return 'Solution Train → all items inside that ST';
  return 'Goal → Epic → Capability → Feature → Story → Defect';
}

EAP.renderHierarchy = function() {
  var s = EAP.state;
  s.hierHide = s.hierHide || {};
  var tree = EAP.buildHierarchyTree();
  var grouping = s.hierGroupBy || 'goal';

  function initOpen(n) {
    if (TOP_TYPES.concat(['epic', 'capability']).indexOf(n.type) !== -1 && s.openHierarchy[n.id] === undefined) s.openHierarchy[n.id] = true;
    if (n.children) n.children.forEach(initOpen);
  }
  tree.forEach(initOpen);

  // Flatten tree with parent tracking for tree lines
  var rows = [];
  function flatten(node, depth, parentVisible, isLast, ancestors) {
    var hide = s.hierHide || {};
    var typeLabel = node.type.charAt(0).toUpperCase() + node.type.slice(1);
    if (hide[typeLabel]) {
      if (node.children) {
        node.children.forEach(function(c, ci) { flatten(c, depth, parentVisible, ci === node.children.length - 1, ancestors); });
      }
      return;
    }
    var hasK = node.children && node.children.length > 0;
    var isOpen = !!s.openHierarchy[node.id];
    rows.push({ node: node, depth: depth, visible: parentVisible, hasK: hasK, isOpen: isOpen, isLast: isLast, ancestors: ancestors.slice() });
    if (hasK && node.children) {
      var newAnc = ancestors.concat([isLast]);
      node.children.forEach(function(c, ci) { flatten(c, depth + 1, parentVisible && isOpen, ci === node.children.length - 1, newAnc); });
    }
  }
  tree.forEach(function(n, ni) { flatten(n, 0, true, ni === tree.length - 1, []); });

  var h = '<div class="gpanel" style="flex:1;min-width:0;">' +
    '<div class="gpanel-hd"><div class="gpanel-hd-left"><span class="gpanel-title">Hierarchy</span>' +
    '<span class="hier-subtitle">' + captionForGrouping(grouping) + '</span></div>' +
    '<div style="display:flex;gap:6px;align-items:center;">' +
    '<button class="add-btn" data-hier-expand style="height:22px;font-size:10px;">' + EAP.icon('expand', 12) + ' Expand all</button>' +
    '<button class="add-btn" data-hier-collapse style="height:22px;font-size:10px;">' + EAP.icon('collapse', 12) + ' Collapse all</button>' +
    '</div></div>' +
    '<div class="gpanel-scroll">' +
    '<table class="dtbl hier-tbl"><thead><tr>' +
    '<th style="width:3%;">No.</th>' +
    '<th style="width:28%;">Name</th>' +
    '<th style="width:8%;">Type</th>' +
    '<th style="width:10%;">State</th>' +
    '<th style="width:12%;">% Complete</th>' +
    '<th style="width:5%;">Pts</th>' +
    '<th style="width:10%;">Owner</th>' +
    '<th style="width:10%;">Team</th>' +
    '<th style="width:10%;">PI / Sprint</th>' +
    '</tr></thead><tbody>';

  var typeColors = { goal:'#374151', epic:'#6d28d9', capability:'#0369a1', feature:'#2563EB', story:'#8B5CF6', defect:'#DC2626',
                     product:'#0d9488', owner:'#374151', state:'#374151',
                     size:'#475569', risk:'#dc2626', art:'#1d4ed8', st:'#7C3AED' };

  rows.forEach(function(r, idx) {
    var n = r.node, d = r.depth;
    var isTop = TOP_TYPES.indexOf(n.type) !== -1;
    var isE = n.type === 'epic';
    var display = r.visible ? '' : 'display:none;';
    // Top-level rows: accent bar (left), tinted bg, thicker bottom border — eye-catchy but subtle.
    // Top-level rows share the same gradient as panel headers (Phase 4C).
    var rowStyle = isTop ? 'background:#E3E2DF;' : '';
    var rowClass = isTop ? ' hier-top-row' : '';

    h += '<tr data-hier-row="' + n.id + '" class="' + rowClass + '" style="' + rowStyle + display + '">';

    // #
    h += '<td style="text-align:center;font-family:var(--font-mono);font-size:10px;color:#9CA3AF;padding:8px 4px;">' + (idx + 1) + '</td>';

    // Name with tree lines
    var nameCell = '<td style="padding:8px 8px 8px ' + (8 + d * 20) + 'px;position:relative;">';

    // Draw tree connector lines
    if (d > 0) {
      // Start at li=1: goals are root-level, no trunk column for them.
      // Position for ancestor at depth li is 8+(li-1)*20+10 — the column
      // where that ancestor's own stub sits, so continuation lines align exactly.
      for (var li = 1; li < d; li++) {
        var lineLeft = 8 + (li - 1) * 20 + 10;
        var isAncestorLast = r.ancestors[li];
        if (!isAncestorLast) {
          nameCell += '<span style="position:absolute;left:' + lineLeft + 'px;top:0;bottom:0;width:1px;background:#CCCBC8;"></span>';
        }
      }
      // Stub: vertical from top (or top-half if last child) + horizontal elbow
      var stubLeft = 8 + (d - 1) * 20 + 10;
      nameCell += '<span style="position:absolute;left:' + stubLeft + 'px;top:0;' + (r.isLast ? 'height:50%;' : 'height:100%;') + 'width:1px;background:#CCCBC8;"></span>';
      nameCell += '<span style="position:absolute;left:' + stubLeft + 'px;top:50%;width:8px;height:1px;background:#CCCBC8;"></span>';
    }

    // Toggle — always present, disabled for leaf nodes
    if (r.hasK) {
      nameCell += '<div class="pi-tog' + (r.isOpen ? ' open' : '') + '" id="hier-tog-' + n.id + '" data-hier-toggle="' + n.id + '" style="display:inline-flex;margin-right:6px;vertical-align:middle;cursor:pointer;position:relative;z-index:1;">' + (r.isOpen ? '−' : '+') + '</div>';
    } else {
      nameCell += '<div class="pi-tog" style="display:inline-flex;margin-right:6px;vertical-align:middle;cursor:default;position:relative;z-index:1;background:rgba(0,0,0,0.06);border-color:rgba(0,0,0,0.12);color:#9CA3AF;">·</div>';
    }

    // Level icon + name (avatar substituted for owner-type top rows)
    var iconColor = typeColors[n.type] || '#6B7280';
    if (n.type === 'owner' && n.owner && EAP.avatar) {
      nameCell += '<span style="display:inline-flex;vertical-align:middle;margin-right:6px;">' + EAP.avatar(n.owner, 18) + '</span>';
    } else {
      nameCell += '<span style="display:inline-flex;vertical-align:middle;margin-right:4px;color:' + iconColor + ';">' + EAP.icon(iconNameForType(n.type), 14) + '</span>';
    }
    // Name styling tier — every leaf type gets a distinct treatment so rows in the same column don't read identically.
    var nameSize = '12px', nameWeight = '400', nameColor = '#374151';
    if (isTop)                       { nameSize = '13px'; nameWeight = '600'; nameColor = '#111827'; }
    else if (isE)                    { nameSize = '12px'; nameWeight = '500'; nameColor = '#374151'; }
    else if (n.type === 'capability'){ nameSize = '12px'; nameWeight = '500'; nameColor = '#374151'; }
    else if (n.type === 'feature')   { nameSize = '12px'; nameWeight = '400'; nameColor = '#374151'; }
    else if (n.type === 'story')     { nameSize = '11px'; nameWeight = '400'; nameColor = 'var(--text-tertiary)'; }
    else if (n.type === 'defect')    { nameSize = '11px'; nameWeight = '400'; nameColor = '#b91c1c'; }
    nameCell += '<span style="font-size:' + nameSize + ';font-weight:' + nameWeight + ';color:' + nameColor + ';vertical-align:middle;">' + n.name + '</span>';
    nameCell += '</td>';
    h += nameCell;

    // Type — render as a pill for visual differentiation
    var typeLabel = n.type.charAt(0).toUpperCase() + n.type.slice(1);
    h += '<td>' + (EAP.typeCell ? EAP.typeCell(typeLabel) : typeLabel) + '</td>';

    // State
    h += '<td>' + (n.state ? EAP.pill(n.state) : '') + '</td>';

    // % Complete
    h += '<td>' + (n.pct !== undefined ? EAP.pbar(n.pct, n.state) : '') + '</td>';

    // Pts
    h += '<td><span class="sz">' + (n.pts || '') + '</span></td>';

    // Owner
    h += '<td>' + (n.owner ? '<span style="display:inline-flex;align-items:center;gap:4px;">' + EAP.avatar(n.owner, 18) + '<span class="par">' + n.owner + '</span></span>' : '') + '</td>';

    // Team — coloured dot prefix differentiates teams at a glance
    var teamCell = '';
    if (n.team) {
      var tColor = (EAP.teamColors && EAP.teamColors[n.team]) || '#9CA3AF';
      teamCell = '<span style="display:inline-flex;align-items:center;gap:6px;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + tColor + ';flex-shrink:0;"></span><span class="tm">' + n.team + '</span></span>';
    }
    h += '<td>' + teamCell + '</td>';

    // PI / Sprint — active PI in primary 500-weight; others stay tertiary grey
    var piSprint = '', isActivePi = false;
    if (n.type === 'feature') {
      var matchF = EAP.allFeatures.filter(function(f) { return f.name === n.name && f.pi; })[0];
      if (matchF) {
        var piObj = EAP.features.pis.filter(function(p) { return p.id === matchF.pi; })[0];
        piSprint = piObj ? piObj.name : '';
        isActivePi = piObj ? !!piObj.active : false;
      }
    } else if (n.type === 'story' || n.type === 'defect') {
      if (n.state === 'Done') piSprint = 'Sprint 1';
      else if (n.state === 'In Progress' || n.state === 'In Review' || n.state === 'Blocked') { piSprint = 'Sprint 2'; isActivePi = true; }
    }
    var piStyle = isActivePi ? 'font-size:10px;color:var(--color-primary);font-weight:500;' : 'font-size:10px;color:#6B7280;';
    h += '<td><span style="' + piStyle + '">' + piSprint + '</span></td>';

    h += '</tr>';
  });

  h += '</tbody></table></div></div>';
  return h;
};

EAP.setAllHier = function(nodes, v) {
  nodes.forEach(function(n) { EAP.state.openHierarchy[n.id] = v; if (n.children) EAP.setAllHier(n.children, v); });
};

EAP.toggleHierarchy = function(id) {
  EAP.state.openHierarchy[id] = !EAP.state.openHierarchy[id];
  EAP.render();
};
