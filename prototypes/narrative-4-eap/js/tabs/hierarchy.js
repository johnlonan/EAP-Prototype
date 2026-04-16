/* ═══════════════════════════════════════════════════════
   HIERARCHY.JS — Hierarchy tab renderer (flat table)
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

EAP.renderHierarchy = function() {
  var s = EAP.state;
  s.hierHide = s.hierHide || {};

  function initOpen(n) {
    if (['goal', 'epic', 'capability'].indexOf(n.type) !== -1 && s.openHierarchy[n.id] === undefined) s.openHierarchy[n.id] = true;
    if (n.children) n.children.forEach(initOpen);
  }
  EAP.hierarchy.forEach(initOpen);

  // Flatten the tree into rows with depth + visibility
  var rows = [];
  function flatten(node, depth, parentVisible) {
    var hide = s.hierHide || {};
    var typeLabel = node.type.charAt(0).toUpperCase() + node.type.slice(1);
    if (hide[typeLabel]) {
      if (node.children) node.children.forEach(function(c) { flatten(c, depth, parentVisible); });
      return;
    }
    var hasK = node.children && node.children.length > 0;
    var isOpen = !!s.openHierarchy[node.id];
    rows.push({ node: node, depth: depth, visible: parentVisible, hasK: hasK, isOpen: isOpen });
    if (hasK && node.children) {
      node.children.forEach(function(c) { flatten(c, depth + 1, parentVisible && isOpen); });
    }
  }
  EAP.hierarchy.forEach(function(n) { flatten(n, 0, true); });

  var h = '<div class="gpanel" style="flex:1;min-width:0;">' +
    '<div class="gpanel-hd"><div class="gpanel-hd-left"><span class="gpanel-title">Hierarchy</span>' +
    '<span style="font-size:11px;color:var(--text-tertiary);margin-left:8px;">Goal → Epic → Capability → Feature → Story → Defect</span></div>' +
    '<div style="display:flex;gap:6px;align-items:center;">' +
    '<button class="add-btn" id="hier-expand" style="height:22px;font-size:10px;">Expand all</button>' +
    '<button class="add-btn" id="hier-collapse" style="height:22px;font-size:10px;">Collapse all</button>' +
    '</div></div>' +
    '<div class="gpanel-scroll">' +
    '<table class="dtbl hier-tbl"><thead><tr>' +
    '<th style="width:3%;">#</th>' +
    '<th style="width:30%;">Name</th>' +
    '<th style="width:9%;">Type</th>' +
    '<th style="width:11%;">State</th>' +
    '<th style="width:14%;">% Complete</th>' +
    '<th style="width:6%;">Pts</th>' +
    '<th style="width:11%;">Owner</th>' +
    '<th style="width:11%;">Team</th>' +
    '</tr></thead><tbody>';

  var tc = { goal: '#0e4e69', epic: '#6d28d9', capability: '#0369a1', feature: '#0d9488', story: '#6b7280', defect: '#dc2626' };

  rows.forEach(function(r, idx) {
    var n = r.node, d = r.depth, isG = n.type === 'goal', isE = n.type === 'epic';
    var indent = d * 18;
    var bg = isG ? 'rgba(14,78,105,0.04)' : isE ? 'rgba(14,78,105,0.02)' : 'transparent';
    var display = r.visible ? '' : 'display:none;';

    h += '<tr data-hier-row="' + n.id + '" style="background:' + bg + ';' + display + '">';

    // #
    h += '<td style="text-align:center;font-family:var(--font-mono);font-size:10px;color:var(--text-disabled);padding:7px 4px;">' + (idx + 1) + '</td>';

    // Name — indented, with toggle
    h += '<td style="padding:7px 10px 7px ' + (10 + indent) + 'px;">';
    if (r.hasK) {
      h += '<div class="pi-tog' + (r.isOpen ? ' open' : '') + '" id="hier-tog-' + n.id + '" data-hier-toggle="' + n.id + '" style="display:inline-flex;margin-right:6px;vertical-align:middle;cursor:pointer;">' + (r.isOpen ? '−' : '+') + '</div>';
    } else {
      h += '<span style="display:inline-block;width:18px;margin-right:6px;"></span>';
    }
    h += '<span style="font-size:' + (isG ? '13px' : '12px') + ';font-weight:' + (isG ? '600' : isE ? '500' : '400') + ';color:var(--text-secondary);">' + n.name + '</span></td>';

    // Type
    h += '<td><span style="font-size:9px;font-weight:500;padding:1px 6px;border-radius:3px;background:' + (tc[n.type] || '#94a3b8') + ';color:#fff;text-transform:capitalize;">' + n.type + '</span></td>';

    // State
    h += '<td>' + (n.state ? EAP.pill(n.state) : '') + '</td>';

    // % Complete
    h += '<td>' + (n.pct !== undefined ? EAP.pbar(n.pct, n.state) : '') + '</td>';

    // Pts
    h += '<td><span class="sz">' + (n.pts || '') + '</span></td>';

    // Owner
    h += '<td><span class="par">' + (n.owner || '') + '</span></td>';

    // Team
    h += '<td><span class="tm">' + (n.team || '') + '</span></td>';

    h += '</tr>';
  });

  h += '</tbody></table></div></div>';
  return h;
};

EAP.setAllHier = function(nodes, v) {
  nodes.forEach(function(n) { EAP.state.openHierarchy[n.id] = v; if (n.children) EAP.setAllHier(n.children, v); });
};

// Toggle: show/hide children rows by walking the flat DOM
EAP.toggleHierarchy = function(id) {
  EAP.state.openHierarchy[id] = !EAP.state.openHierarchy[id];
  var tog = document.getElementById('hier-tog-' + id);
  var isOpen = EAP.state.openHierarchy[id];
  if (tog) { tog.textContent = isOpen ? '−' : '+'; tog.classList.toggle('open', isOpen); }

  // Re-render to recalculate visibility (simpler than walking DOM)
  EAP.render();
};
