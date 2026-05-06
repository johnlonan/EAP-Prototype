/* ═══════════════════════════════════════════════════════
   TRACK.JS — Track tab renderer (9-column workflow board)
   Works at ART or Team context, WorkItem level only.
   When entered from other contexts, auto-selects the
   persona's ART or Team.
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

// Column body style (shared constant)
var TCB = 'background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.4);border-top:none;border-radius:0 0 12px 12px;padding:8px;min-height:100px;flex:1;';

// ── Track card renderer (own copy — independent of Board) ──
function trackCard(item, opts) {
  opts = opts || {};
  var isBlocked = item.blocked || item.state === 'Blocked';
  var isAtRisk = item.atRisk && !isBlocked;
  var isDone = item.state === 'Done' || item.state === 'Complete';
  var cls = 'bcard' + (isBlocked ? ' bcard-blocked' : '') + (isAtRisk ? ' bcard-atrisk' : '') + (isDone ? ' bcard-done' : '');

  var h = '<div class="' + cls + '"' + (item.id ? ' id="tcard-' + item.id + '"' : '') + '>';

  // Blocked/at-risk banner
  if (isBlocked) {
    h += '<div class="bcard-banner bcard-banner-red">' + EAP.icon('info', 12) + (item.blockReason || 'Blocked') + '</div>';
  } else if (isAtRisk) {
    h += '<div class="bcard-banner bcard-banner-amber">' + (item.openDefects ? item.openDefects + ' open defects' : 'At risk') + '</div>';
  }

  // Type pill (WorkItem cards)
  var t = item.type;
  var isWI = t === 'Story' || t === 'Defect' || t === 'Case Task' || t === 'CaseTask';
  if (isWI) {
    h += '<div class="bcard-tags">' + EAP.typeCell(t) + '</div>';
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
  if (isTeamCtx && s.trackMember && s.trackMember !== 'All') {
    all = all.filter(function(i) { return i.owner === s.trackMember; });
  }
  if (!isTeamCtx && s.trackTeam && s.trackTeam !== 'All') {
    all = all.filter(function(i) { return i.team === s.trackTeam; });
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
  var blockedItems = all.filter(function(i) { return i.blocked || i.state === 'Blocked'; });
  var blockedCount = blockedItems.length;

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
    (blockedCount > 0 ?
      '<span class="track-ctx-vsep"></span>' +
      '<div class="track-ctx-group">' +
        '<span class="track-ctx-blocked">' + blockedCount + ' of ' + totalItems + ' items blocked</span>' +
      '</div>' : '') +
    '</div>';

  // ── Filter chips — team or member ──
  var filterHtml = '<div style="display:flex;align-items:center;gap:6px;margin-bottom:12px;flex-wrap:wrap;">';
  if (isTeamCtx) {
    var members = (EAP.teamMembers && EAP.teamMembers[s.contextName]) || [];
    var activeMember = s.trackMember || 'All';
    filterHtml += '<span class="track-chip' + (activeMember === 'All' ? ' active' : '') + '" data-track-member="All">' + EAP.icon('users', 14) + ' All</span>';
    members.forEach(function(m) {
      var p = EAP.people[m];
      if (!p) return;
      filterHtml += '<span class="track-chip' + (activeMember === m ? ' active' : '') + '" data-track-member="' + m + '">' + EAP.avatar(m, 20) + ' ' + p.name + '</span>';
    });
  } else {
    var teams = ['Auth Team', 'Payments Team', 'Fraud Team', 'Mobile Exp Team', 'Accounts Team', 'Onboarding Team'];
    var activeTeam = s.trackTeam || 'All';
    filterHtml += '<span class="track-chip' + (activeTeam === 'All' ? ' active' : '') + '" data-track-team="All">' + EAP.icon('users', 14) + ' All Teams</span>';
    teams.forEach(function(t) {
      var tc = EAP.teamColors[t] || '#6B7280';
      filterHtml += '<span class="track-chip' + (activeTeam === t ? ' active' : '') + '" data-track-team="' + t + '"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + tc + ';flex-shrink:0;"></span> ' + t + '</span>';
    });
  }
  filterHtml += '</div>';

  // Filter-aware empty state — when chips/persona empty the board, surface
  // a clear-filter affordance instead of rendering empty workflow columns.
  if (!all.length && EAP.hasClearableFilters()) {
    return '<div style="flex:1;display:flex;flex-direction:column;min-width:0;min-height:0;">' +
      filterHtml + contextHtml +
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
    filterHtml +
    contextHtml +
    '<div style="flex:1;min-height:0;overflow:auto;">' +
    '<div style="display:inline-flex;gap:8px;padding:4px 2px 16px;width:' + trackW + 'px;">';

  EAP.trackColumns.forEach(function(col) {
    var items = bk[col] || [];
    h += '<div style="width:' + colW + 'px;flex-shrink:0;display:flex;flex-direction:column;">';
    h += '<div style="padding:8px 10px;border-radius:10px 10px 0 0;background:linear-gradient(135deg, rgba(140,215,180,0.10), rgba(140,195,220,0.10));border-bottom:1px solid rgba(14,78,105,0.10);box-shadow:inset 0 1px 0 rgba(255,255,255,0.55);display:flex;align-items:center;justify-content:space-between;">';
    h += '<span style="font-size:10px;font-weight:500;color:#374151;text-transform:uppercase;letter-spacing:0.03em;">' + col + '</span>';
    h += '<span style="font-size:10px;font-family:var(--font-mono);color:#6B7280;">' + items.length + '</span></div>';
    h += '<div style="' + TCB + '">';
    items.forEach(function(wi) { h += trackCard(wi, {showTeam: true, ownerField: 'owner'}); });
    h += '</div></div>';
  });

  h += '</div></div></div>';
  return h;
};
