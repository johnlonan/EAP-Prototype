/* ═══════════════════════════════════════════════════════
   TRACK.JS — Track tab renderer (9-column workflow board)
   Works at ART or Team context, WorkItem level only.
   When entered from other contexts, auto-selects the
   persona's ART or Team.
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

// Column body style (shared constant)
var TCB = EAP._colBodyStyle;

// ── Track card renderer (own copy — independent of Board) ──
function trackCard(item, opts) {
  opts = opts || {};
  var isBlocked = item.blocked || item.state === 'Blocked';
  var isAtRisk = item.atRisk && !isBlocked;
  var isDone = item.state === 'Done' || item.state === 'Complete';
  var cls = 'bcard' + (isBlocked ? ' bcard-blocked' : '') + (isAtRisk ? ' bcard-atrisk' : '') + (isDone ? ' bcard-done' : '');

  var h = '<div class="' + cls + '"' + (item.id ? ' id="tcard-' + item.id + '"' : '') + '>';

  // Blocked/at-risk banners
  if (isBlocked) {
    h += '<div class="bcard-banner bcard-banner-red">' + EAP.icon('info', 12) + (item.blockReason || 'Blocked') + '</div>';
  } else if (isAtRisk) {
    h += '<div class="bcard-banner bcard-banner-amber">' + (item.openDefects ? item.openDefects + ' open defects' : 'At risk') + '</div>';
  }

  // Type pill + carry-over tag (WorkItem cards)
  var t = item.type;
  var isWI = EAP.isWorkItemType(t);
  if (isWI) {
    var carryTag = item.carriedOver ? '<span class="bcard-carry-tag">↑ Carry-over</span>' : '';
    h += '<div class="bcard-tags">' + EAP.typeCell(t) + carryTag + '</div>';
  }

  // Title
  h += '<div class="bcard-title">' + item.name + '</div>';

  // Parent feature caption (WorkItem only)
  if (isWI && item.parent) {
    h += '<div class="bcard-parent" title="Parent feature">' + EAP.icon('chevron-up', 10) + ' ' + item.parent + '</div>';
  }

  // Meta row
  h += '<div class="bcard-meta">';
  h += EAP.subtlePill(item.state);
  if (opts.showTeam && item.team) h += '<span class="bcard-owner">' + item.team + '</span>';
  if (item.pts) h += '<span class="bcard-pts">' + item.pts + 'pt</span>';
  h += '</div>';

  // Footer — avatar + owner
  var ownerKey = item.owner || (opts.ownerField ? item[opts.ownerField] : null);
  h += '<div class="bcard-footer">';
  if (ownerKey) {
    h += '<span class="bcard-owner">' + ownerKey + '</span>';
  } else {
    h += '<span></span>';
  }
  if (ownerKey) h += EAP.avatar(ownerKey, 24);
  h += '</div>';

  // Progress bar
  if (item.pct > 0 && !isDone) {
    h += '<div class="bcard-progress">' + EAP.pbar(item.pct, item.state) + '</div>';
  }

  h += '</div>';
  return h;
}

// ── Main render ───────────────────────────────────────
EAP.renderTrack = function() {
  var s = EAP.state;
  var isTeamCtx = (s.context === 'team');

  // ── Gather + filter items first (stats depend on filtered set) ──
  var all = [];
  EAP.workItems.sprints.forEach(function(sp) { all = all.concat(sp.items || []); });
  all = all.concat(EAP.getBacklogFlat());

  // Pre-filter by team when scope selector is at team context
  if (isTeamCtx) {
    var scopeTeam = s.contextName; // e.g. "Auth Team" from scope selector
    all = all.filter(function(i) { return i.team === scopeTeam; });
  }

  // Then apply chip filters (member within team, or team within ART)
  var selMembers = s.trackMembers || [];
  if (isTeamCtx && selMembers.length > 0) {
    all = all.filter(function(i) { return selMembers.indexOf(i.owner) !== -1; });
  }
  var selTeams = s.trackTeams || [];
  if (!isTeamCtx && selTeams.length > 0) {
    all = all.filter(function(i) { return selTeams.indexOf(i.team) !== -1; });
  }

  // ── Compute stats from filtered set ──
  var activePi = EAP.features.pis.filter(function(p) { return p.active; })[0] || EAP.features.pis[0];
  var activeSprint = EAP.workItems.sprints.filter(function(sp) { return sp.active; })[0] || EAP.workItems.sprints[0];
  var spDays = EAP._sprintDays, spDay = EAP._dayInSprint;
  var totalItems = all.length;
  var totalPts = all.reduce(function(a, i) { return a + (i.pts || 0); }, 0);
  var doneItems = all.filter(function(i) { return i.state === 'Done' || i.state === 'Complete'; });
  var donePts = doneItems.reduce(function(a, i) { return a + (i.pts || 0); }, 0);
  var pct = totalPts > 0 ? Math.round((donePts / totalPts) * 100) : 0;
  var blockedCount = all.filter(function(i) { return i.blocked || i.state === 'Blocked'; }).length;
  var carriedCount = all.filter(function(i) { return i.carriedOver; }).length;
  var defectPts = all.filter(function(i) { return i.type === 'Defect'; }).reduce(function(a, i) { return a + (i.pts || 0); }, 0);
  var bugPct = totalPts > 0 ? Math.round((defectPts / totalPts) * 100) : 0;

  // Health signals grouped: blocked · carried · defects%
  var healthParts = [];
  if (blockedCount > 0) healthParts.push('<span class="track-ctx-blocked">' + blockedCount + ' blocked</span>');
  if (carriedCount > 0) healthParts.push('<span class="track-ctx-carried">' + carriedCount + ' carried over</span>');
  if (bugPct > 0) healthParts.push('<span class="track-ctx-defects"' + (bugPct > 25 ? ' style="color:var(--color-warning);"' : '') + '>' + bugPct + '% defects</span>');
  var healthHtml = healthParts.length > 0
    ? '<span class="track-ctx-vsep"></span><div class="track-ctx-group track-ctx-health">' +
        healthParts.join('<span class="track-ctx-sep"></span>') +
      '</div>'
    : '';

  // ── Context header — micro-dashboard ──
  var contextHtml = '<div class="track-context">' +
    '<div class="track-ctx-group">' +
      '<span class="track-ctx-label">Active Sprint</span>' +
      '<span class="track-ctx-sprint">' + activeSprint.name + '</span>' +
      '<span class="track-ctx-sep">·</span>' +
      '<span class="track-ctx-pi">' + activePi.name + '</span>' +
    '</div>' +
    '<span class="track-ctx-vsep"></span>' +
    '<div class="track-ctx-group">' +
      '<span class="track-ctx-dates">' + activeSprint.dates + '</span>' +
      '<span class="track-ctx-sep">·</span>' +
      '<span class="track-ctx-day">Day ' + spDay + ' of ' + spDays + '</span>' +
    '</div>' +
    '<span class="track-ctx-vsep"></span>' +
    '<div class="track-ctx-group">' +
      '<span class="track-ctx-metric">' + totalItems + ' items</span>' +
      '<span class="track-ctx-sep">·</span>' +
      '<span class="track-ctx-progress"><span class="track-ctx-pbar"><span class="track-ctx-pfill" style="width:' + pct + '%"></span></span>' + donePts + ' of ' + totalPts + ' pts (' + pct + '%)</span>' +
    '</div>' +
    healthHtml +
    '</div>';

  // ── Filter chips — team or member (inside board content, new row) ──
  var chipRowHtml = '<div class="track-chip-row">';
  if (isTeamCtx) {
    var members = (EAP.teamMembers && EAP.teamMembers[s.contextName]) || [];
    var selMbrs = s.trackMembers || [];
    chipRowHtml += '<span class="track-chip' + (selMbrs.length === 0 ? ' active' : '') + '" data-track-member="All">' + EAP.icon('users', 14) + ' All</span>';
    members.forEach(function(m) {
      var p = EAP.people[m];
      if (!p) return;
      chipRowHtml += '<span class="track-chip' + (selMbrs.indexOf(m) !== -1 ? ' active' : '') + '" data-track-member="' + m + '">' + EAP.avatar(m, 20) + ' ' + p.name + '</span>';
    });
  } else {
    var teams = ['Auth Team', 'Payments Team', 'Fraud Team', 'Mobile Exp Team', 'Accounts Team', 'Onboarding Team'];
    var selTms = s.trackTeams || [];
    chipRowHtml += '<span class="track-chip' + (selTms.length === 0 ? ' active' : '') + '" data-track-team="All">' + EAP.icon('users', 14) + ' All Teams</span>';
    teams.forEach(function(t) {
      var tc = EAP.teamColors[t] || '#6B7280';
      chipRowHtml += '<span class="track-chip' + (selTms.indexOf(t) !== -1 ? ' active' : '') + '" data-track-team="' + t + '"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + tc + ';flex-shrink:0;"></span> ' + t + '</span>';
    });
  }
  chipRowHtml += '</div>';

  // Filter-aware empty state — when chips/persona empty the board, surface
  // a clear-filter affordance instead of rendering empty workflow columns.
  if (!all.length && EAP.hasClearableFilters()) {
    return '<div style="flex:1;display:flex;flex-direction:column;min-width:0;min-height:0;">' +
      contextHtml + chipRowHtml +
      '<div style="flex:1;display:flex;align-items:center;justify-content:center;">' + EAP.emptyState() + '</div>' +
      '</div>';
  }

  // Bucket into workflow columns
  var bk = {};
  EAP.trackColumns.forEach(function(c) { bk[c] = []; });
  all.forEach(function(i) {
    var c = i.state;
    if (c === 'Planned' || c === 'To Do') c = 'Draft';
    if (bk[c]) bk[c].push(i); else bk.Draft.push(i);
  });

  // Render columns
  var colW = 310;
  var trackW = EAP.trackColumns.length * colW + (EAP.trackColumns.length - 1) * 8;
  var h = '<div style="flex:1;display:flex;flex-direction:column;min-width:0;min-height:0;">' +
    contextHtml + chipRowHtml +
    '<div style="flex:1;min-height:0;overflow:auto;">' +
    '<div style="display:inline-flex;gap:8px;padding:4px 2px 16px;width:' + trackW + 'px;">';

  EAP.trackColumns.forEach(function(col) {
    var items = bk[col] || [];
    h += '<div style="width:' + colW + 'px;flex-shrink:0;display:flex;flex-direction:column;">';
    var wLimit = EAP.wipLimits ? (EAP.wipLimits[col] || 0) : 0;
    var wOver = wLimit > 0 && items.length > wLimit;
    var wTip = wLimit > 0
      ? (wOver
          ? 'WIP limit: ' + wLimit + ' · ' + items.length + ' in column · Over by ' + (items.length - wLimit)
          : 'WIP limit: ' + wLimit + ' · ' + (wLimit - items.length) + ' slots available')
      : '';
    h += '<div class="track-col-hd"' + (!wOver && wTip ? ' data-tip="' + wTip + '"' : '') + '>';
    h += '<span style="font-size:10px;font-weight:500;color:#374151;text-transform:uppercase;letter-spacing:0.03em;">' + col + '</span>';
    if (wOver) {
      h += '<span class="track-wip-badge"' + (wTip ? ' data-tip="' + wTip + '"' : '') + '>Over limit</span>';
    } else {
      h += '<span style="font-size:10px;font-family:var(--font-mono);color:#6B7280;">' + items.length + '</span>';
    }
    h += '</div>';
    h += '<div style="' + TCB + '">';
    items.forEach(function(wi) { h += trackCard(wi, {showTeam: true, ownerField: 'owner'}); });
    h += '</div></div>';
  });

  h += '</div></div></div>';
  return h;
};
