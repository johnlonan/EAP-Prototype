/* ═══════════════════════════════════════════════════════
   LIST.JS — List tab renderer (split view + accordions)
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

EAP.renderList = function() {
  var s = EAP.state, groups = EAP.getListGroups();
  var isT = (s.level === 'Feature' || s.level === 'WorkItem');
  var ll = { Epic: 'Epics', Capability: 'Capabilities', Feature: 'Features', WorkItem: 'Work Items' }[s.level] || 'Items';
  var cols = EAP.lsCols();

  // Filter-aware empty state — when the whole view is empty AND a clearable
  // filter is active, replace everything with the filter empty-state.
  var groupTotal = groups.reduce(function(a, g) { return a + ((g.items || []).length); }, 0);
  var blTotal = ((s.level === 'WorkItem') ? EAP.getBacklogFlat() : EAP.getBacklogData());
  blTotal = (blTotal && blTotal.length) || 0;
  if (groupTotal === 0 && blTotal === 0 && EAP.hasClearableFilters()) {
    return '<div class="gpanel" style="flex:1;min-width:0;display:flex;align-items:center;justify-content:center;">' + EAP.emptyState() + '</div>';
  }

  // Default: Epic/Capability open all (grouped by ST/ART, no "current"); Feature/WorkItem open active only
  var openAll = (s.level === 'Epic' || s.level === 'Capability');

  // Rolling wave: groups 2+ positions after the active one are less defined.
  // Compute activeIdx first so the open-state initialisation can use it.
  var activeIdx = -1;
  groups.forEach(function(g, i) { if (g.active) activeIdx = i; });
  groups.forEach(function(g, gi) {
    if (EAP.state.openAccordions[g.id] === undefined) {
      var isWave = activeIdx >= 0 && gi >= activeIdx + 2;
      EAP.state.openAccordions[g.id] = isWave ? false : (openAll || !!g.active);
    }
  });

  // Backlog panel (split view) — uses List backlog columns (no % Complete, no Type for non-WI)
  var blHtml = '';
  if (s.splitView) {
    var blD = EAP.wsjfSorted((s.level === 'WorkItem') ? EAP.getBacklogFlat() : EAP.getBacklogData());
    var bc = EAP.bkCols();
    var blPgId = 'ls-bl-split';
    var blPage = EAP.pgSlice(blD, blPgId);
    blHtml = '<div class="gpanel split-left"><div class="gpanel-hd"><div class="gpanel-hd-left"><span class="gpanel-title">Backlog</span><span class="gpanel-count">' + blD.length + '</span></div><button class="add-btn">' + EAP._ADD + 'New</button></div>' +
      '<div class="gpanel-scroll"><table class="dtbl"><thead><tr>' + bc.h + '</tr></thead><tbody>' +
      blPage.map(function(i) { return '<tr data-item-id="' + i.id + '">' + bc.r(i) + '</tr>'; }).join('') +
      '</tbody></table></div>' + EAP.pgFooter(blD.length, blPgId) + '</div>' +
      '<div class="split-div"><div class="split-grip"><span></span><span></span><span></span><span></span><span></span></div></div>';
  }

  // Accordions
  var acc = '<div class="' + (s.splitView ? 'split-right' : '') + '" style="' + (s.splitView ? '' : 'flex:1;min-width:0;min-height:0;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:4px 4px 24px;') + '">';

  groups.forEach(function(g, gi) {
    var isA = !!g.active, isO = !!EAP.state.openAccordions[g.id];
    var rollingWave = activeIdx >= 0 && gi >= activeIdx + 2;
    var isGoalOpen = s.level === 'WorkItem' && g.goal ? !!EAP.state.openGoals[g.id] : false;
    var pgId = 'ls-' + g.id;
    acc += '<div class="pi-acc"><div class="pi-hd' + (isA ? ' active' : '') + (rollingWave ? ' pi-hd-wave' : '') + '" data-pi-toggle="' + g.id + '">';
    acc += '<div class="pi-tog' + (isO ? ' open' : '') + '" id="pi-tog-' + g.id + '">' + (isO ? '−' : '+') + '</div>';
    acc += '<span class="pi-nm">' + g.name + '</span>';
    if (s.level === 'WorkItem' && g.goal) {
      acc += '<span class="sprint-goal-tog' + (isGoalOpen ? ' on' : '') + '" id="goal-tog-' + g.id + '"' +
        ' onclick="EAP.toggleSprintGoal(\'' + g.id + '\');event.stopPropagation()"' +
        ' onmouseenter="EAP.showGoalTip(\'' + g.id + '\',event)"' +
        ' onmouseleave="if(typeof hideTip===\'function\')hideTip()">' +
        EAP.iconFilled('flag', 13) + '</span>';
      EAP._sprintGoalLabels = EAP._sprintGoalLabels || {};
      EAP._sprintGoalLabels[g.id] = g.goal;
    }
    if (g.dates) acc += '<span class="pi-dates">' + g.dates + '</span>';
    if (isA) acc += '<span class="pi-badge">Current ' + (s.level === 'WorkItem' ? 'Sprint' : 'PI') + '</span>';
    acc += '<div class="pi-meta">';
    if (isT) {
      acc += '<span class="pi-mi"><span class="pi-ml">Capacity</span><span class="pi-mv">' + g.capPct + '%</span></span><span class="pi-ms">|</span>';
      acc += '<span class="pi-mi"><span class="pi-ml">Pts</span><span class="pi-mv">' + g.totalPts + '</span></span>';
      if (isA) acc += '<span class="pi-ms">|</span><span class="pi-mi"><span class="pi-ml">Done</span><span class="pi-mv">' + g.donePts + '</span></span>';
      // Velocity annotation for WorkItem level
      if (s.level === 'WorkItem' && EAP.velocityStats) {
        var vs = EAP.velocityStats;
        var velEntry = (EAP.velocityHistory || []).filter(function(v) { return v.id === g.id; })[0];
        if (velEntry && velEntry.partial) {
          // Active sprint: no annotation — done pts already shown
        } else if (!isA && !rollingWave) {
          acc += '<span class="pi-ms">|</span><span class="pi-mi"><span class="pi-ml">Target</span><span class="pi-mv">' + vs.low + '–' + vs.high + '</span></span>';
        } else if (rollingWave) {
          acc += '<span class="pi-ms">|</span><span class="pi-mi"><span class="pi-ml">Target</span><span class="pi-mv" style="color:var(--text-tertiary);">~' + vs.avg + '</span></span>';
        }
      }
    } else {
      acc += '<span class="pi-mi"><span class="pi-ml">' + ll + '</span><span class="pi-mv">' + g.items.length + '</span></span><span class="pi-ms">|</span><span class="pi-mi"><span class="pi-ml">Pts</span><span class="pi-mv">0</span></span>';
    }
    acc += '<button class="add-btn" onclick="event.stopPropagation()">' + EAP._ADD + 'New</button>';
    if (isA) acc += '<button class="pi-complete">Complete ' + (s.level === 'WorkItem' ? 'Sprint' : 'PI') + ' ▸</button>';
    acc += '</div></div>';

    if (s.level === 'WorkItem' && g.goal) {
      acc += '<div class="sprint-goal-strip' + (isGoalOpen ? ' open' : '') + '" id="goal-strip-' + g.id + '">' +
        '<div class="sprint-goal-inner"><span class="sprint-goal-lbl">Goal:</span><span>' + g.goal + '</span></div>' +
        '</div>';
    }

    acc += '<div class="pi-body' + (isO ? ' open' : '') + '" id="pi-body-' + g.id + '"><div class="pi-pad">';
    if (g.items && g.items.length) {
      var pageItems = EAP.pgSlice(EAP.wsjfSorted(g.items), pgId);
      acc += '<table class="dtbl"><thead><tr>' + cols.h + '</tr></thead><tbody>' +
        pageItems.map(function(i) { return '<tr data-item-id="' + i.id + '">' + cols.r(i) + '</tr>'; }).join('') + '</tbody></table>';
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
    var bc2 = EAP.bkCols();
    var blPgId2 = 'ls-bl-stack';
    var blPage2 = EAP.pgSlice(blD2, blPgId2);
    acc += '<div class="pi-acc" style="margin-top:4px;"><div class="gpanel-hd" style="border-radius:16px 16px 0 0;"><div class="gpanel-hd-left"><span class="gpanel-title">Backlog</span><span class="gpanel-count">' + blD2.length + '</span></div><button class="add-btn">' + EAP._ADD + 'New</button></div><div style="padding:10px 14px 14px;overflow-x:auto;"><table class="dtbl"><thead><tr>' + bc2.h + '</tr></thead><tbody>' + blPage2.map(function(i) { return '<tr data-item-id="' + i.id + '">' + bc2.r(i) + '</tr>'; }).join('') + '</tbody></table>' + EAP.pgFooter(blD2.length, blPgId2) + '</div></div>';
  }

  acc += '</div>';
  return blHtml + acc;
};

EAP.showGoalTip = function(id, event) {
  var goal = EAP._sprintGoalLabels && EAP._sprintGoalLabels[id];
  if (goal && typeof showTip === 'function') {
    showTip('<span style="font-weight:500;font-size:11px;">Sprint goal</span><br>' + goal, event);
  }
};

EAP.toggleSprintGoal = function(sprintId) {
  EAP.state.openGoals[sprintId] = !EAP.state.openGoals[sprintId];
  var open  = !!EAP.state.openGoals[sprintId];
  var strip = document.getElementById('goal-strip-' + sprintId);
  var tog   = document.getElementById('goal-tog-' + sprintId);
  if (strip) strip.classList.toggle('open', open);
  if (tog) {
    tog.classList.toggle('on', open);
    // Brighten when active — detect context from parent header
    var hd = tog.closest ? tog.closest('.pi-hd') : null;
    var isActiveSprint = hd && hd.classList.contains('active');
    tog.style.color = open
      ? (isActiveSprint ? '#fff' : 'var(--color-primary)')
      : (isActiveSprint ? 'rgba(255,255,255,0.65)' : 'rgba(14,78,105,0.55)');
  }
};
