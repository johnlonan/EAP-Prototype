/* ═══════════════════════════════════════════════════════
   HIERARCHY.JS — Hierarchy tab renderer (flat table)
   Tree lines + disabled toggles for leaf nodes
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
  EAP.hierarchy.forEach(function(n, ni) { flatten(n, 0, true, ni === EAP.hierarchy.length - 1, []); });

  var h = '<div class="gpanel" style="flex:1;min-width:0;">' +
    '<div class="gpanel-hd"><div class="gpanel-hd-left"><span class="gpanel-title">Hierarchy</span>' +
    '<span style="font-size:11px;color:#6B7280;margin-left:8px;">Goal → Epic → Capability → Feature → Story → Defect</span></div>' +
    '<div style="display:flex;gap:6px;align-items:center;">' +
    '<button class="add-btn" id="hier-expand" style="height:22px;font-size:10px;">' + EAP.icon('expand', 12) + ' Expand all</button>' +
    '<button class="add-btn" id="hier-collapse" style="height:22px;font-size:10px;">' + EAP.icon('collapse', 12) + ' Collapse all</button>' +
    '</div></div>' +
    '<div class="gpanel-scroll">' +
    '<table class="dtbl hier-tbl"><thead><tr>' +
    '<th style="width:3%;">#</th>' +
    '<th style="width:28%;">Name</th>' +
    '<th style="width:8%;">Type</th>' +
    '<th style="width:10%;">State</th>' +
    '<th style="width:12%;">% Complete</th>' +
    '<th style="width:5%;">Pts</th>' +
    '<th style="width:10%;">Owner</th>' +
    '<th style="width:10%;">Team</th>' +
    '<th style="width:10%;">PI / Sprint</th>' +
    '</tr></thead><tbody>';

  var typeColors = { goal:'#374151', epic:'#6d28d9', capability:'#0369a1', feature:'#0d9488', story:'#6B7280', defect:'#DC2626' };

  rows.forEach(function(r, idx) {
    var n = r.node, d = r.depth, isG = n.type === 'goal', isE = n.type === 'epic';
    var display = r.visible ? '' : 'display:none;';
    var rowStyle = isG ? 'background:rgba(14,78,105,0.06);border-bottom:2px solid rgba(14,78,105,0.1);' : isE ? 'background:rgba(14,78,105,0.02);' : '';

    h += '<tr data-hier-row="' + n.id + '" style="' + rowStyle + display + '">';

    // #
    h += '<td style="text-align:center;font-family:var(--font-mono);font-size:10px;color:#9CA3AF;padding:8px 4px;">' + (idx + 1) + '</td>';

    // Name with tree lines
    var nameCell = '<td style="padding:8px 8px 8px ' + (8 + d * 20) + 'px;position:relative;">';

    // Draw tree connector lines
    if (d > 0) {
      for (var li = 0; li < d; li++) {
        var lineLeft = 8 + li * 20 + 10;
        var isAncestorLast = r.ancestors[li];
        if (!isAncestorLast) {
          // Vertical line continuing down
          nameCell += '<span style="position:absolute;left:' + lineLeft + 'px;top:0;bottom:0;width:1px;background:#E5E7EB;"></span>';
        }
      }
      // Horizontal stub connecting to this row
      var stubLeft = 8 + (d - 1) * 20 + 10;
      nameCell += '<span style="position:absolute;left:' + stubLeft + 'px;top:0;' + (r.isLast ? 'height:50%;' : 'height:100%;') + 'width:1px;background:#E5E7EB;"></span>';
      nameCell += '<span style="position:absolute;left:' + stubLeft + 'px;top:50%;width:8px;height:1px;background:#E5E7EB;"></span>';
    }

    // Toggle — always present, disabled for leaf nodes
    if (r.hasK) {
      nameCell += '<div class="pi-tog' + (r.isOpen ? ' open' : '') + '" id="hier-tog-' + n.id + '" data-hier-toggle="' + n.id + '" style="display:inline-flex;margin-right:6px;vertical-align:middle;cursor:pointer;position:relative;z-index:1;">' + (r.isOpen ? '−' : '+') + '</div>';
    } else {
      nameCell += '<div class="pi-tog" style="display:inline-flex;margin-right:6px;vertical-align:middle;opacity:0.15;cursor:default;position:relative;z-index:1;">·</div>';
    }

    // Level icon + name
    var iconColor = typeColors[n.type] || '#6B7280';
    nameCell += '<span style="display:inline-flex;vertical-align:middle;margin-right:4px;color:' + iconColor + ';">' + EAP.icon(n.type, 14) + '</span>';
    nameCell += '<span style="font-size:' + (isG ? '13px' : '12px') + ';font-weight:' + (isG ? '600' : isE ? '500' : '400') + ';color:' + (isG ? '#111827' : '#374151') + ';vertical-align:middle;">' + n.name + '</span>';
    nameCell += '</td>';
    h += nameCell;

    // Type
    h += '<td style="color:' + iconColor + ';font-size:11px;font-weight:400;text-transform:capitalize;">' + n.type + '</td>';

    // State
    h += '<td>' + (n.state ? EAP.pill(n.state) : '') + '</td>';

    // % Complete
    h += '<td>' + (n.pct !== undefined ? EAP.pbar(n.pct, n.state) : '') + '</td>';

    // Pts
    h += '<td><span class="sz">' + (n.pts || '') + '</span></td>';

    // Owner
    h += '<td>' + (n.owner ? '<span style="display:inline-flex;align-items:center;gap:4px;">' + EAP.avatar(n.owner, 18) + '<span class="par">' + n.owner + '</span></span>' : '') + '</td>';

    // Team
    h += '<td><span class="tm">' + (n.team || '') + '</span></td>';

    // PI / Sprint
    var piSprint = '';
    if (n.type === 'feature') {
      var matchF = EAP.allFeatures.filter(function(f) { return f.name === n.name && f.pi; })[0];
      if (matchF) {
        var piObj = EAP.features.pis.filter(function(p) { return p.id === matchF.pi; })[0];
        piSprint = piObj ? piObj.name : '';
      }
    } else if (n.type === 'story' || n.type === 'defect') {
      if (n.state === 'Done') piSprint = 'Sprint 1';
      else if (n.state === 'In Progress' || n.state === 'In Review' || n.state === 'Blocked') piSprint = 'Sprint 2';
    }
    h += '<td><span style="font-size:10px;color:#6B7280;">' + piSprint + '</span></td>';

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
