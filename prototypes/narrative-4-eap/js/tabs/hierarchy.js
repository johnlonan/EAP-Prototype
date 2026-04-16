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

  // Flatten tree
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
    '<button class="add-btn" id="hier-expand" style="height:22px;font-size:10px;">' + EAP.icon('expand', 12) + ' Expand all</button>' +
    '<button class="add-btn" id="hier-collapse" style="height:22px;font-size:10px;">' + EAP.icon('collapse', 12) + ' Collapse all</button>' +
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

  // Type icon + text (no coloured pill)
  var typeColors = { goal: '#374151', epic: '#6d28d9', capability: '#0369a1', feature: '#0d9488', story: '#6B7280', defect: '#DC2626' };

  rows.forEach(function(r, idx) {
    var n = r.node, d = r.depth, isG = n.type === 'goal', isE = n.type === 'epic';
    var indent = d * 18;
    var display = r.visible ? '' : 'display:none;';

    // Goal rows get distinct treatment
    var rowStyle = '';
    if (isG) {
      rowStyle = 'background:rgba(14,78,105,0.06);border-bottom:2px solid rgba(14,78,105,0.1);';
    } else if (isE) {
      rowStyle = 'background:rgba(14,78,105,0.02);';
    }

    h += '<tr data-hier-row="' + n.id + '" style="' + rowStyle + display + '">';

    // #
    h += '<td style="text-align:center;font-family:var(--font-mono);font-size:10px;color:#9CA3AF;padding:8px 4px;">' + (idx + 1) + '</td>';

    // Name — indented with toggle + icon
    h += '<td style="padding:8px 12px 8px ' + (12 + indent) + 'px;">';
    if (r.hasK) {
      h += '<div class="pi-tog' + (r.isOpen ? ' open' : '') + '" id="hier-tog-' + n.id + '" data-hier-toggle="' + n.id + '" style="display:inline-flex;margin-right:8px;vertical-align:middle;cursor:pointer;">' + (r.isOpen ? '−' : '+') + '</div>';
    } else {
      h += '<span style="display:inline-block;width:20px;margin-right:8px;"></span>';
    }
    // Level icon before name
    var iconColor = typeColors[n.type] || '#6B7280';
    h += '<span style="display:inline-flex;vertical-align:middle;margin-right:6px;color:' + iconColor + ';">' + EAP.icon(n.type, 14) + '</span>';
    h += '<span style="font-size:' + (isG ? '13px' : '12px') + ';font-weight:' + (isG ? '600' : isE ? '500' : '400') + ';color:' + (isG ? '#111827' : '#374151') + ';vertical-align:middle;">' + n.name + '</span></td>';

    // Type — plain text with icon color, no pill
    h += '<td style="color:' + iconColor + ';font-size:11px;font-weight:400;text-transform:capitalize;">' + n.type + '</td>';

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

EAP.toggleHierarchy = function(id) {
  EAP.state.openHierarchy[id] = !EAP.state.openHierarchy[id];
  // Re-render to recalculate visibility
  EAP.render();
};
