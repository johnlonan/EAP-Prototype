/* ═══════════════════════════════════════════════════════
   BACKLOG.JS — Backlog tab renderer
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

EAP.renderBacklog = function() {
  if (EAP.state.level === 'WorkItem') return EAP.renderBacklogGrouped();
  var d = EAP.getBacklogData();
  var l = { Epic: 'Epics', Capability: 'Capabilities', Feature: 'Features' }[EAP.state.level] || 'Items';
  var c = EAP.bkCols();
  return '<div class="gpanel" style="flex:1;min-width:0;"><div class="gpanel-hd"><div class="gpanel-hd-left"><span class="gpanel-title">' + l + '</span><span class="gpanel-count">' + d.length + '</span></div><button class="add-btn">' + EAP._ADD + 'New</button></div><div class="gpanel-scroll"><table class="dtbl"><thead><tr>' + c.h + '</tr></thead><tbody>' + d.map(function(i) { return '<tr>' + c.r(i) + '</tr>'; }).join('') + '</tbody></table></div></div>';
};

EAP.renderBacklogGrouped = function() {
  var bl = EAP.workItems.backlog;
  var grps = [
    { key: 'Story', label: 'Story', items: bl.Story || [] },
    { key: 'Defect', label: 'Defect', items: bl.Defect || [] },
    { key: 'CaseTask', label: 'Case Task', items: bl.CaseTask || [] }
  ];
  var total = grps.reduce(function(a, g) { return a + g.items.length; }, 0);
  var h = '<div class="gpanel" style="flex:1;min-width:0;"><div class="gpanel-hd"><div class="gpanel-hd-left"><span class="gpanel-title">Work Items</span><span class="gpanel-count">' + total + '</span></div><button class="add-btn">' + EAP._ADD + 'New</button></div><div class="gpanel-scroll">';

  grps.forEach(function(g) {
    var gId = 'wigrp-' + g.key;
    var isOpen = EAP.state.openAccordions[gId] !== false;
    if (EAP.state.openAccordions[gId] === undefined) EAP.state.openAccordions[gId] = true;

    h += '<div style="border-bottom:1px solid rgba(0,0,0,0.04);">' +
      '<div data-pi-toggle="' + gId + '" style="padding:8px 14px;display:flex;align-items:center;gap:8px;cursor:pointer;background:var(--color-primary);user-select:none;">' +
      '<div class="pi-tog' + (isOpen ? ' open' : '') + '" id="pi-tog-' + gId + '" style="width:16px;height:16px;font-size:9px;background:rgba(255,255,255,0.18);border-color:rgba(255,255,255,0.3);color:#fff;">' + (isOpen ? '−' : '+') + '</div>' +
      '<span style="font-size:11px;font-weight:500;color:#fff;">' + g.label + '</span>' +
      '<span style="font-size:10px;color:rgba(255,255,255,0.6);font-family:var(--font-mono);">' + g.items.length + '</span></div>';

    h += '<div class="pi-body' + (isOpen ? ' open' : '') + '" id="pi-body-' + gId + '"><table class="dtbl wi-grp-tbl"><thead><tr>' +
      '<th></th><th>Number</th><th>Name</th><th>Epic</th><th>Pts</th><th>Type</th></tr></thead><tbody>' +
      g.items.map(function(i) {
        return '<tr>' + EAP._GT + '<td><span style="font-family:var(--font-mono);font-size:11px;color:#9CA3AF;">' + (i.num || '') + '</span></td><td><span class="item-nm">' + i.name + '</span></td><td><span class="par">' + (i.epic || '—') + '</span></td><td><span class="sz">' + (i.pts || '') + '</span></td><td>' + EAP.typeCell(i.type || '') + '</td></tr>';
      }).join('') +
      '</tbody></table></div></div>';
  });

  return h + '</div></div>';
};
