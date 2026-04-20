/* ═══════════════════════════════════════════════════════
   LIST.JS — List tab renderer (split view + accordions)
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

EAP.renderList = function() {
  var s = EAP.state, groups = EAP.getListGroups();
  var isT = (s.level === 'Feature' || s.level === 'WorkItem');
  var ll = { Epic: 'Epics', Capability: 'Capabilities', Feature: 'Features', WorkItem: 'Work Items' }[s.level] || 'Items';
  var cols = EAP.lsCols();

  // Default: Epic/Capability open all (grouped by ST/ART, no "current"); Feature/WorkItem open active only
  var openAll = (s.level === 'Epic' || s.level === 'Capability');
  groups.forEach(function(g) { if (EAP.state.openAccordions[g.id] === undefined) EAP.state.openAccordions[g.id] = openAll || !!g.active; });

  // Backlog panel (split view) — uses List backlog columns (no % Complete, no Type for non-WI)
  var blHtml = '';
  if (s.splitView) {
    var blD = EAP.wsjfSorted((s.level === 'WorkItem') ? EAP.getBacklogFlat() : EAP.getBacklogData());
    var bc = EAP.lsBlCols();
    var blPgId = 'ls-bl-split';
    var blPage = EAP.pgSlice(blD, blPgId);
    blHtml = '<div class="gpanel split-left"><div class="gpanel-hd"><div class="gpanel-hd-left"><span class="gpanel-title">Backlog</span><span class="gpanel-count">' + blD.length + '</span></div><button class="add-btn">' + EAP._ADD + 'New</button></div>' +
      '<div class="gpanel-scroll"><table class="dtbl"><thead><tr>' + bc.h + '</tr></thead><tbody>' +
      blPage.map(function(i) { return '<tr>' + bc.r(i) + '</tr>'; }).join('') +
      '</tbody></table></div>' + EAP.pgFooter(blD.length, blPgId) + '</div>' +
      '<div class="split-div"><div class="split-grip"><span></span><span></span><span></span><span></span><span></span></div></div>';
  }

  // Accordions
  var acc = '<div class="' + (s.splitView ? 'split-right' : '') + '" style="' + (s.splitView ? '' : 'flex:1;min-width:0;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:4px 4px 24px;') + '">';

  groups.forEach(function(g) {
    var isA = !!g.active, isO = !!EAP.state.openAccordions[g.id];
    var pgId = 'ls-' + g.id;
    acc += '<div class="pi-acc"><div class="pi-hd' + (isA ? ' active' : '') + '" data-pi-toggle="' + g.id + '">';
    acc += '<div class="pi-tog' + (isO ? ' open' : '') + '" id="pi-tog-' + g.id + '">' + (isO ? '−' : '+') + '</div>';
    acc += '<span class="pi-nm">' + g.name + '</span>';
    if (g.dates) acc += '<span class="pi-dates">' + g.dates + '</span>';
    if (isA) acc += '<span class="pi-badge">Current ' + (s.level === 'WorkItem' ? 'Sprint' : 'PI') + '</span>';
    acc += '<div class="pi-meta">';
    if (isT) {
      acc += '<span class="pi-mi"><span class="pi-ml">Capacity</span><span class="pi-mv">' + g.capPct + '%</span></span><span class="pi-ms">|</span>';
      acc += '<span class="pi-mi"><span class="pi-ml">Pts</span><span class="pi-mv">' + g.totalPts + '</span></span>';
      if (isA) acc += '<span class="pi-ms">|</span><span class="pi-mi"><span class="pi-ml">Done</span><span class="pi-mv">' + g.donePts + '</span></span>';
    } else {
      acc += '<span class="pi-mi"><span class="pi-ml">' + ll + '</span><span class="pi-mv">' + g.items.length + '</span></span><span class="pi-ms">|</span><span class="pi-mi"><span class="pi-ml">Pts</span><span class="pi-mv">0</span></span>';
    }
    acc += '<button class="add-btn" onclick="event.stopPropagation()">' + EAP._ADD + 'New</button>';
    if (isA) acc += '<button class="pi-complete">Complete ' + (s.level === 'WorkItem' ? 'Sprint' : 'PI') + ' ▸</button>';
    acc += '</div></div>';

    acc += '<div class="pi-body' + (isO ? ' open' : '') + '" id="pi-body-' + g.id + '"><div class="pi-pad">';
    if (g.items && g.items.length) {
      var pageItems = EAP.pgSlice(EAP.wsjfSorted(g.items), pgId);
      acc += '<table class="dtbl"><thead><tr>' + cols.h + '</tr></thead><tbody>' +
        pageItems.map(function(i) { return '<tr>' + cols.r(i) + '</tr>'; }).join('') + '</tbody></table>';
    } else {
      acc += '<div class="empty-state"><div class="empty-state-icon">' + EAP.icon('plus', 24) + '</div><div class="empty-state-text">No items assigned to this increment</div><div class="empty-state-cta">Drag items from the backlog or click <strong>New</strong> to create one</div></div>';
    }
    acc += '</div>';
    if (g.items && g.items.length) acc += EAP.pgFooter(g.items.length, pgId);
    acc += '</div></div>';
  });

  // Non-split: backlog section below accordions
  if (!s.splitView) {
    var blD2 = EAP.wsjfSorted((s.level === 'WorkItem') ? EAP.getBacklogFlat() : EAP.getBacklogData());
    var bc2 = EAP.lsBlCols();
    var blPgId2 = 'ls-bl-stack';
    var blPage2 = EAP.pgSlice(blD2, blPgId2);
    acc += '<div class="pi-acc" style="margin-top:4px;"><div class="gpanel-hd" style="border-radius:16px 16px 0 0;"><div class="gpanel-hd-left"><span class="gpanel-title">Backlog</span><span class="gpanel-count">' + blD2.length + '</span></div><button class="add-btn">' + EAP._ADD + 'New</button></div><div style="padding:10px 14px 14px;overflow-x:auto;"><table class="dtbl"><thead><tr>' + bc2.h + '</tr></thead><tbody>' + blPage2.map(function(i) { return '<tr>' + bc2.r(i) + '</tr>'; }).join('') + '</tbody></table>' + EAP.pgFooter(blD2.length, blPgId2) + '</div></div>';
  }

  acc += '</div>';
  return blHtml + acc;
};
