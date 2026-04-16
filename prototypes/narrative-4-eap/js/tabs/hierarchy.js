/* ═══════════════════════════════════════════════════════
   HIERARCHY.JS — Hierarchy tab renderer
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

  var h = '<div class="gpanel" style="flex:1;min-width:0;"><div class="gpanel-hd"><div class="gpanel-hd-left"><span class="gpanel-title">Hierarchy</span>' +
    '<span style="font-size:11px;color:var(--text-tertiary);margin-left:8px;">Goal → Epic → Capability → Feature → Story → Defect</span></div>' +
    '<div style="display:flex;gap:6px;align-items:center;">' +
    '<button class="add-btn" id="hier-expand" style="height:22px;font-size:10px;">Expand all</button>' +
    '<button class="add-btn" id="hier-collapse" style="height:22px;font-size:10px;">Collapse all</button>' +
    '</div></div>' +
    '<div class="gpanel-scroll" style="padding:4px 0;">';

  EAP.hierarchy.forEach(function(n) { h += EAP.hNode(n, 0); });
  return h + '</div></div>';
};

EAP.hNode = function(n, depth) {
  var s = EAP.state, hide = s.hierHide || {};
  var typeLabel = n.type.charAt(0).toUpperCase() + n.type.slice(1);
  if (hide[typeLabel]) {
    var out = '';
    if (n.children) n.children.forEach(function(c) { out += EAP.hNode(c, depth); });
    return out;
  }

  var hasK = n.children && n.children.length > 0;
  var isO = !!s.openHierarchy[n.id];
  var indent = depth * 20;
  var isG = n.type === 'goal', isE = n.type === 'epic';
  var tc = { goal: '#0e4e69', epic: '#1e6b8a', capability: '#4a90a4', feature: '#7ab0c4', story: '#a8ccd8', defect: '#e07a5f' };
  var bg = { goal: 'rgba(14,78,105,0.04)', epic: 'rgba(14,78,105,0.02)' };
  var rp = isG ? '11px' : isE ? '9px' : '7px';

  var h = '<div>';
  h += '<div style="padding:' + rp + ' 16px ' + rp + ' ' + (16 + indent) + 'px;display:flex;align-items:center;border-bottom:1px solid rgba(0,0,0,0.03);background:' + (bg[n.type] || 'transparent') + ';transition:background 100ms ease;" onmouseenter="this.style.background=\'rgba(14,78,105,0.04)\'" onmouseleave="this.style.background=\'' + (bg[n.type] || 'transparent') + '\'">';

  if (hasK) {
    h += '<div class="pi-tog' + (isO ? ' open' : '') + '" id="hier-tog-' + n.id + '" data-hier-toggle="' + n.id + '" style="margin-right:8px;cursor:pointer;">' + (isO ? '−' : '+') + '</div>';
  } else {
    h += '<div style="width:18px;margin-right:8px;"></div>';
  }

  h += '<span style="font-size:9px;font-weight:500;padding:1px 6px;border-radius:3px;background:' + (tc[n.type] || '#94a3b8') + ';color:#fff;margin-right:8px;text-transform:capitalize;flex-shrink:0;">' + n.type + '</span>';
  h += '<span style="flex:1;font-size:' + (isG ? '13px' : '12px') + ';font-weight:' + (isG ? '600' : isE ? '500' : '400') + ';color:var(--text-secondary);line-height:1.35;">' + n.name + '</span>';

  if (n.prog) {
    var pc = n.prog.indexOf('Blocked') !== -1 || n.prog.indexOf('Open') !== -1 ? '#8c1d1d' :
             n.prog.indexOf('At Risk') !== -1 || n.prog.indexOf('Behind') !== -1 ? '#9a3412' :
             n.prog.indexOf('Done') !== -1 || n.prog.indexOf('Complete') !== -1 ? '#166534' : 'var(--text-tertiary)';
    h += '<span style="font-size:10px;font-weight:400;color:' + pc + ';padding:2px 8px;background:rgba(0,0,0,0.03);border-radius:9999px;margin-left:12px;white-space:nowrap;">' + n.prog + '</span>';
  }

  h += '</div>';
  if (hasK) {
    h += '<div id="hier-kids-' + n.id + '" style="' + (isO ? '' : 'display:none;') + '">';
    n.children.forEach(function(c) { h += EAP.hNode(c, depth + 1); });
    h += '</div>';
  }
  return h + '</div>';
};

EAP.setAllHier = function(nodes, v) {
  nodes.forEach(function(n) { EAP.state.openHierarchy[n.id] = v; if (n.children) EAP.setAllHier(n.children, v); });
};

EAP.toggleHierarchy = function(id) {
  EAP.state.openHierarchy[id] = !EAP.state.openHierarchy[id];
  var k = document.getElementById('hier-kids-' + id);
  var t = document.getElementById('hier-tog-' + id);
  if (k) {
    var o = EAP.state.openHierarchy[id];
    k.style.display = o ? '' : 'none';
    if (t) { t.textContent = o ? '−' : '+'; t.classList.toggle('open', o); }
  }
};
