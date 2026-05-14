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

  // Meta row — state + pts together, then team
  h += '<div class="bcard-meta">';
  h += EAP.subtlePill(item.state);
  if (item.pts) h += '<span class="bcard-pts">' + item.pts + 'pt</span>';
  if (opts.showTeam && item.team) h += '<span class="bcard-owner">' + item.team + '</span>';
  h += '</div>';

  // Progress bar — stays in content area
  if (item.pct > 0 && !isDone) {
    h += '<div class="bcard-progress">' + EAP.pbar(item.pct, item.state) + '</div>';
  }

  // Footer — avatar left; dep icon + separator (only if has dependency) + chevron right
  var ownerKey = item.owner || (opts.ownerField ? item[opts.ownerField] : null);
  var hasDep = EAP.hasDependency(item.id);
  if (ownerKey) {
    h += '<div class="bcard-footer">';
    h += EAP.avatar(ownerKey, 20);
    h += '<div class="bcard-footer-right">';
    if (hasDep) {
      h += '<span class="bcard-footer-dep" title="Has dependencies">' + EAP.icon('git-merge', 12) + '</span>';
      h += '<span class="bcard-footer-sep"></span>';
    }
    h += '<span class="bcard-footer-chev">' + EAP.icon('chevron-down', 12) + '</span>';
    h += '</div>';
    h += '</div>';
  }

  h += '</div>';
  return h;
}

// ── Quality badge helper ──────────────────────────────
function qualityBadge(q) {
  var map = {
    'Excellent': { color: '#16A34A', bg: 'rgba(22,163,74,0.08)' },
    'Good':      { color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
    'Average':   { color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
    'Poor':      { color: '#DC2626', bg: 'rgba(220,38,38,0.08)' }
  };
  var s = map[q] || map['Average'];
  return '<span style="font-size:11px;font-weight:500;color:' + s.color + ';background:' + s.bg + ';padding:2px 7px;border-radius:10px;">' + q + '</span>';
}

// ── Team view renderer ────────────────────────────────
function renderTeamView(teamName, isTeamCtx) {
  var rows = [];
  var maxSp = 0;

  if (isTeamCtx) {
    rows = (EAP.teamProductivity || {})[teamName] || [];
    maxSp = rows.reduce(function(m, r) { return Math.max(m, r.spCompleted); }, 0) || 1;
  } else {
    // ART context — aggregate one row per team
    var teams = ['Auth Team', 'Payments Team', 'Fraud Team', 'Mobile Exp Team', 'Accounts Team', 'Onboarding Team'];
    teams.forEach(function(t) {
      var members = (EAP.teamProductivity || {})[t] || [];
      if (!members.length) return;
      var total = members.reduce(function(a, r) { return a + r.totalTasks; }, 0);
      var done  = members.reduce(function(a, r) { return a + r.completed; }, 0);
      var pend  = members.reduce(function(a, r) { return a + r.pending; }, 0);
      var util  = members.reduce(function(a, r) { return a + r.utilHrs; }, 0);
      var sp    = members.reduce(function(a, r) { return a + r.spCompleted; }, 0);
      var pct   = total > 0 ? Math.round((done / total) * 100) : 0;
      var q = pct >= 80 ? 'Excellent' : pct >= 70 ? 'Good' : pct >= 55 ? 'Average' : 'Poor';
      rows.push({ member: t, role: members.length + ' members', totalTasks: total, completed: done,
                  utilHrs: util, completionPct: pct, pending: pend, quality: q, spCompleted: sp });
    });
    maxSp = rows.reduce(function(m, r) { return Math.max(m, r.spCompleted); }, 0) || 1;
  }

  if (!rows.length) {
    return '<div style="padding:40px;text-align:center;color:#6B7280;font-size:13px;">No productivity data for this team.</div>';
  }

  // SP bar chart — compact horizontal bars above the table
  var chartHtml = '<div class="tteam-chart">' +
    '<div class="tteam-chart-title">Story points completed · ' + (isTeamCtx ? 'by member' : 'by team') + '</div>' +
    '<div class="tteam-bars">';
  rows.forEach(function(r) {
    var pct = Math.round((r.spCompleted / maxSp) * 100);
    var label = isTeamCtx ? r.member : r.member.replace(' Team', '');
    chartHtml +=
      '<div class="tteam-bar-row">' +
        '<span class="tteam-bar-label">' + label + '</span>' +
        '<div class="tteam-bar-track">' +
          '<div class="tteam-bar-fill" style="width:' + pct + '%"></div>' +
        '</div>' +
        '<span class="tteam-bar-val">' + r.spCompleted + '</span>' +
      '</div>';
  });
  chartHtml += '</div></div>';

  // Table
  var tableHtml = '<div class="tteam-table-wrap">' +
    '<table class="tteam-table">' +
    '<thead><tr>' +
      '<th>' + (isTeamCtx ? 'Member' : 'Team') + '</th>' +
      '<th>' + (isTeamCtx ? 'Role' : 'Size') + '</th>' +
      '<th>Tasks</th>' +
      '<th>Util hrs</th>' +
      '<th>Completion</th>' +
      '<th>Pending</th>' +
      '<th>Quality</th>' +
    '</tr></thead>' +
    '<tbody>';
  rows.forEach(function(r) {
    var pctColor = r.completionPct >= 80 ? '#16A34A' : r.completionPct >= 65 ? '#D97706' : '#DC2626';
    tableHtml +=
      '<tr>' +
        '<td class="tteam-td-name">' +
          (isTeamCtx ? EAP.avatar(r.member, 24) + '<span>' + r.member + '</span>' : '<span>' + r.member + '</span>') +
        '</td>' +
        '<td class="tteam-td-role">' + r.role + '</td>' +
        '<td class="tteam-td-num">' + r.completed + '<span class="tteam-td-total"> / ' + r.totalTasks + '</span></td>' +
        '<td class="tteam-td-num">' + r.utilHrs + ' hrs</td>' +
        '<td class="tteam-td-pct" style="color:' + pctColor + '">' + r.completionPct + '%</td>' +
        '<td class="tteam-td-num">' + r.pending + '</td>' +
        '<td>' + qualityBadge(r.quality) + '</td>' +
      '</tr>';
  });
  tableHtml += '</tbody></table></div>';

  return '<div class="tteam-view">' + chartHtml + tableHtml + '</div>';
}

// ── Main render ───────────────────────────────────────
EAP.renderTrack = function() {
  var s = EAP.state;
  var isTeamCtx = (s.context === 'team');
  var trackView = s.trackView || 'board';

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

  // ── Team view branch ──────────────────────────────────
  if (trackView === 'team') {
    return '<div style="flex:1;display:flex;flex-direction:column;min-width:0;min-height:0;">' +
      contextHtml +
      '<div style="flex:1;min-height:0;overflow:auto;padding:4px 2px 16px;">' +
        renderTeamView(s.contextName, isTeamCtx) +
      '</div>' +
    '</div>';
  }

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
    h += '<span style="font-family:var(--font-sans);font-style:normal;font-weight:400;font-size:11px;line-height:20px;color:#000000;flex:none;order:0;flex-grow:0;">' + col + '</span>';
    if (wOver) {
      h += '<span class="track-wip-badge"' + (wTip ? ' data-tip="' + wTip + '"' : '') + '>Over limit</span>';
    } else {
      h += '<span class="kbn-badge">' + items.length + '</span>';
    }
    h += '</div>';
    h += '<div style="' + TCB + '">';
    items.forEach(function(wi) { h += trackCard(wi, {showTeam: true, ownerField: 'owner'}); });
    h += '</div></div>';
  });

  h += '</div></div></div>';
  return h;
};

