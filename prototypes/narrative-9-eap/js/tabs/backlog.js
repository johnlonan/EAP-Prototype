/* ═══════════════════════════════════════════════════════
   BACKLOG.JS — Backlog tab renderer
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

EAP.renderBacklog = function() {
  var s = EAP.state;
  var d = (s.level === 'WorkItem')
    ? EAP.getBacklogFlat()                  // combined Story+Defect+Incident+Problem, manually ranked
    : EAP.wsjfSorted(EAP.getBacklogData()); // Epic/Cap/Feature ordered by WSJF
  var l = { Epic: 'Epics', Capability: 'Capabilities', Feature: 'Features', WorkItem: 'Work Items' }[s.level] || 'Items';
  var c = EAP.bkCols();
  var pgId = 'bk-main';
  var pageItems = EAP.pgSlice(d, pgId);
  var head = '<div class="gpanel" style="flex:1;min-width:0;"><div class="gpanel-hd"><div class="gpanel-hd-left"><span class="gpanel-title">' + l + '</span><span class="gpanel-count">' + d.length + '</span></div><button class="add-btn">' + EAP._ADD + 'New</button></div>';
  if (!d.length) return head + '<div class="gpanel-scroll" style="display:flex;align-items:center;justify-content:center;">' + EAP.emptyState() + '</div></div>';
  return head + '<div class="gpanel-scroll"><table class="dtbl"><thead><tr>' + c.h + '</tr></thead><tbody>' + pageItems.map(function(i) { return '<tr data-item-id="' + i.id + '">' + c.r(i) + '</tr>'; }).join('') + '</tbody></table></div>' + EAP.pgFooter(d.length, pgId) + '</div>';
};
