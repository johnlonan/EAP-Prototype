/* ═══════════════════════════════════════════════════════
   BOARD.JS — Board tab renderer
   Cards use CSS classes (.bcard) for consistent treatment
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

var CB = 'background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.4);border-top:none;border-radius:0 0 12px 12px;padding:8px;min-height:100px;flex:1;';

function colHd(isActive) {
  return 'padding:8px 12px;border-radius:12px 12px 0 0;display:flex;align-items:center;justify-content:space-between;' +
    (isActive ? 'background:var(--color-primary);color:#fff;' : 'background:rgba(14,78,105,0.12);color:#374151;');
}

// ── Card renderer — shared across all board views ──────
function renderCard(item, opts) {
  opts = opts || {};
  var compact = EAP.state.boardDensity === 'compact';
  var isBlocked = item.blocked || item.state === 'Blocked';
  var isAtRisk = item.atRisk && !isBlocked;
  var isDone = item.state === 'Done' || item.state === 'Complete';
  var cls = 'bcard' + (compact ? ' bcard-compact' : '') + (isBlocked ? ' bcard-blocked' : '') + (isAtRisk ? ' bcard-atrisk' : '') + (isDone ? ' bcard-done' : '');

  var h = '<div class="' + cls + '"' + (item.id ? ' id="fcard-' + item.id + '"' : '') + '>';

  // Blocked/at-risk banner (not in compact)
  if (!compact) {
    if (isBlocked) {
      h += '<div class="bcard-banner bcard-banner-red">' + EAP.icon('info', 12) + (item.blockReason || 'Blocked') + '</div>';
    } else if (isAtRisk) {
      h += '<div class="bcard-banner bcard-banner-amber">' + (item.openDefects ? item.openDefects + ' open defects' : 'At risk') + '</div>';
    }
  }

  // Title
  h += '<div class="bcard-title">' + item.name + '</div>';

  // Meta row — state + team/owner + points
  h += '<div class="bcard-meta">';
  if (compact) {
    // Compact: just a coloured dot + state text
    var dotColor = isBlocked ? '#DC2626' : isDone ? '#16A34A' : item.state === 'In Progress' ? '#2563EB' : '#9CA3AF';
    h += '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:' + dotColor + ';flex-shrink:0;"></span>';
    h += '<span style="font-size:10px;color:#6B7280;">' + item.state + '</span>';
  } else {
    h += EAP.subtlePill(item.state);
    if (opts.showTeam && item.team) h += '<span class="bcard-owner">' + item.team + '</span>';
  }
  if (item.pts) h += '<span class="bcard-pts">' + item.pts + 'pt</span>';
  h += '</div>';

  // Footer — avatar + owner (not in compact for space, unless there's room)
  var ownerKey = item.owner || (opts.ownerField ? item[opts.ownerField] : null);
  h += '<div class="bcard-footer">';
  if (!compact && ownerKey) {
    h += '<span class="bcard-owner">' + ownerKey + '</span>';
  } else {
    h += '<span></span>';
  }
  if (ownerKey) h += EAP.avatar(ownerKey, compact ? 20 : 24);
  h += '</div>';

  // Progress bar (hidden in compact via CSS)
  if (item.pct > 0 && !isDone) {
    h += '<div class="bcard-progress">' + EAP.pbar(item.pct, item.state) + '</div>';
  }

  h += '</div>';
  return h;
}

// Router
EAP.renderBoard = function() {
  var s = EAP.state;
  if (s.level === 'Epic' || s.level === 'Capability') return EAP.renderWorkflowBoard();
  if (s.level === 'Feature') return EAP.renderFeatureBoard();
  if (s.level === 'WorkItem') return s.boardView === 'track' ? EAP.renderTrackBoard() : EAP.renderWIGrid();
  return '';
};

// ── Workflow kanban (Epic / Capability) ────────────────
EAP.renderWorkflowBoard = function() {
  var s = EAP.state, data = s.level === 'Epic' ? EAP.epics : EAP.capabilities;
  var all = (typeof data.backlog === 'function' ? data.backlog() : data.backlog || []).slice();
  (data.groups || []).forEach(function(g) {
    var items = g.epicIds ? g.epicIds.map(function(id){ return data.all.filter(function(e){return e.id===id;})[0]; }).filter(Boolean) :
                g.capIds ? g.capIds.map(function(id){ return data.all.filter(function(c){return c.id===id;})[0]; }).filter(Boolean) : [];
    all = all.concat(items);
  });
  var bk = {};
  EAP.workflowColumns.forEach(function(c) { bk[c] = []; });
  all.forEach(function(i) { var st = i.state === 'In Progress' ? 'Implementation' : i.state; if (bk[st]) bk[st].push(i); else bk.Backlog.push(i); });

  var h = '<div style="flex:1;overflow-x:auto;"><div style="display:flex;gap:8px;padding:4px 2px 16px;width:100%;">';
  EAP.workflowColumns.forEach(function(c) {
    var items = bk[c] || [];
    h += '<div style="flex:1;min-width:160px;display:flex;flex-direction:column;">';
    h += '<div style="' + colHd(false) + '"><span style="font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.04em;">' + c + '</span><span style="font-size:10px;font-family:var(--font-mono);opacity:0.5;">' + items.length + '</span></div>';
    h += '<div style="' + CB + '">';
    items.forEach(function(i) { h += renderCard(i, {showTeam: false}); });
    h += '</div></div>';
  });
  return h + '</div></div>';
};

// ── Feature PI kanban ──────────────────────────────────
EAP.renderFeatureBoard = function() {
  var bl = EAP.features.backlog();
  var piCols = EAP.features.pis.map(function(pi) { return {id:pi.id, name:pi.name, active:pi.active, items: EAP.features.byPI(pi.id)}; });
  var cols = [{id:'backlog', name:'Backlog', active:false, items:bl}].concat(piCols);

  var h = '<div style="flex:1;overflow-x:auto;"><div style="display:flex;gap:8px;padding:4px 2px 16px;width:100%;">';
  cols.forEach(function(pi) {
    var items = pi.items || [], isA = !!pi.active;
    h += '<div style="flex:1;min-width:180px;display:flex;flex-direction:column;">';
    h += '<div style="' + colHd(isA) + '"><span style="font-size:12px;font-weight:500;flex:1;">' + pi.name + '</span>';
    if (isA) h += '<span style="font-size:9px;font-weight:500;padding:2px 7px;border-radius:3px;background:rgba(255,255,255,0.2);">Current PI</span>';
    h += '<span style="font-size:10px;font-family:var(--font-mono);opacity:0.5;margin-left:6px;">' + items.length + '</span></div>';
    h += '<div style="' + CB + '">';
    items.forEach(function(f) { h += renderCard(f, {showTeam: true, ownerField: 'owner'}); });
    h += '</div></div>';
  });
  return h + '</div></div>';
};

// ── Work Item grid (team × sprint) ─────────────────────
EAP.renderWIGrid = function() {
  var sprints = EAP.workItems.sprints, blFlat = EAP.getBacklogFlat();
  var cols = [{id:'backlog', name:'Backlog', active:false, items:blFlat}].concat(sprints);
  var teams = ['Auth Team', 'Payments Team', 'Fraud Team', 'Mobile Exp Team', 'Accounts Team', 'Onboarding Team'];

  var h = '<div style="flex:1;overflow:auto;">';
  teams.forEach(function(team) {
    var cap = EAP.teamCapacity[team] || {};
    h += '<div style="margin-bottom:16px;"><div style="padding:8px 12px;background:rgba(14,78,105,0.12);color:#374151;border-radius:8px;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px;">' + team + '</div>';
    h += '<div style="display:flex;gap:8px;width:100%;">';
    cols.forEach(function(sp) {
      var items = (sp.items || []).filter(function(i) { return i.team === team; });
      var isA = !!sp.active;
      var capVal = sp.id === 'sp2' ? cap.sp2 : sp.id === 'sp3' ? cap.sp3 : sp.id === 'sp4' ? cap.sp4 : sp.id === 'sp5' ? cap.ip : null;
      var capColor = capVal >= 100 ? '#DC2626' : capVal >= 85 ? '#D97706' : 'var(--color-primary)';

      h += '<div style="flex:1;min-width:140px;">';
      h += '<div style="' + colHd(isA) + 'border-radius:8px 8px 0 0;padding:6px 10px;flex-direction:column;align-items:stretch;gap:4px;">';
      h += '<div style="display:flex;align-items:center;justify-content:space-between;"><span style="font-size:10px;font-weight:500;">' + sp.name + '</span><span style="font-size:10px;font-family:var(--font-mono);opacity:0.5;">' + items.length + '</span></div>';
      if (capVal !== null && capVal !== undefined) {
        h += '<div style="display:flex;align-items:center;gap:4px;"><div style="flex:1;height:3px;background:rgba(0,0,0,0.06);border-radius:2px;overflow:hidden;"><div style="height:100%;width:' + Math.min(capVal, 100) + '%;background:' + capColor + ';border-radius:2px;opacity:0.6;"></div></div><span style="font-size:9px;font-family:var(--font-mono);color:' + (isA ? 'rgba(255,255,255,0.7)' : capColor) + ';">' + capVal + '%</span></div>';
      }
      h += '</div>';
      h += '<div style="' + CB + 'border-radius:0 0 8px 8px;padding:6px;min-height:50px;">';
      items.forEach(function(wi) { h += renderCard(wi, {showTeam: false, ownerField: 'owner'}); });
      h += '</div></div>';
    });
    h += '</div></div>';
  });
  return h + '</div>';
};

// ── Track view (9-column workflow) ─────────────────────
EAP.renderTrackBoard = function() {
  var all = [];
  EAP.workItems.sprints.forEach(function(sp) { all = all.concat(sp.items || []); });
  all = all.concat(EAP.getBacklogFlat());
  var bk = {};
  EAP.trackColumns.forEach(function(c) { bk[c] = []; });
  all.forEach(function(i) { var c = i.state; if (c === 'Planned' || c === 'To Do') c = 'Draft'; if (bk[c]) bk[c].push(i); else bk.Draft.push(i); });

  var colBorder = {'Draft':'#9CA3AF','Ready':'#6B7280','In Progress':'#2563EB','In Review':'#D97706','Testing':'#D97706','Ready for Acceptance':'#7c3aed','Accepted':'#16A34A','Complete':'#16A34A','Cancelled':'#9CA3AF'};

  var h = '<div style="flex:1;overflow-x:auto;"><div style="display:flex;gap:8px;padding:4px 2px 16px;width:100%;">';
  EAP.trackColumns.forEach(function(col) {
    var items = bk[col] || [];
    var bc = colBorder[col] || '#9CA3AF';
    h += '<div style="flex:1;min-width:140px;display:flex;flex-direction:column;">';
    h += '<div style="padding:8px 10px;border-radius:10px 10px 0 0;background:rgba(14,78,105,0.08);border-bottom:3px solid ' + bc + ';display:flex;align-items:center;justify-content:space-between;">';
    h += '<span style="font-size:10px;font-weight:500;color:#374151;text-transform:uppercase;letter-spacing:0.03em;">' + col + '</span>';
    h += '<span style="font-size:10px;font-family:var(--font-mono);color:#6B7280;">' + items.length + '</span></div>';
    h += '<div style="' + CB + 'border-radius:0 0 10px 10px;min-height:80px;">';
    items.forEach(function(wi) { h += renderCard(wi, {showTeam: true, ownerField: 'owner'}); });
    h += '</div></div>';
  });
  return h + '</div></div>';
};
