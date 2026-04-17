/* ═══════════════════════════════════════════════════════
   BOARD.JS — Board tab renderer (workflow, feature, WI grid, track)
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

// Board styles (shared across sub-views)
var CS = 'background:rgba(255,255,255,0.65);border:1px solid rgba(0,0,0,0.08);border-radius:8px;padding:10px 10px 8px;margin-bottom:6px;cursor:grab;transition:box-shadow 0.15s ease;';
var CS_BLOCKED = 'background:rgba(220,38,38,0.03);border:1px solid rgba(220,38,38,0.15);border-left:3px solid #DC2626;border-radius:8px;padding:10px 10px 8px;margin-bottom:6px;cursor:grab;';
var CS_ATRISK = 'background:rgba(217,119,6,0.03);border:1px solid rgba(217,119,6,0.12);border-left:3px solid #D97706;border-radius:8px;padding:10px 10px 8px;margin-bottom:6px;cursor:grab;';
var CS_DONE = 'background:rgba(22,163,74,0.03);border:1px solid rgba(22,163,74,0.1);border-left:3px solid #16A34A;border-radius:8px;padding:10px 10px 8px;margin-bottom:6px;cursor:grab;opacity:0.7;';
var CB = 'background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.4);border-top:none;border-radius:0 0 12px 12px;padding:8px;min-height:100px;flex:1;';

function cardStyle(item) {
  if (item.state === 'Blocked' || item.blocked) return CS_BLOCKED;
  if (item.state === 'Done' || item.state === 'Complete') return CS_DONE;
  if (item.atRisk) return CS_ATRISK;
  return CS;
}
function colHd(isActive) {
  return 'padding:8px 12px;border-radius:12px 12px 0 0;display:flex;align-items:center;justify-content:space-between;' +
    (isActive ? 'background:var(--color-primary);color:#fff;' : 'background:rgba(14,78,105,0.12);color:var(--text-primary);');
}

// Router
EAP.renderBoard = function() {
  var s = EAP.state;
  if (s.level === 'Epic' || s.level === 'Capability') return EAP.renderWorkflowBoard();
  if (s.level === 'Feature') return EAP.renderFeatureBoard();
  if (s.level === 'WorkItem') return s.boardView === 'track' ? EAP.renderTrackBoard() : EAP.renderWIGrid();
  return '';
};

// Workflow kanban (Epic / Capability)
EAP.renderWorkflowBoard = function() {
  var s = EAP.state, data = s.level === 'Epic' ? EAP.epics : EAP.capabilities;
  var all = (data.backlog || []).slice();
  (data.groups || []).forEach(function(g) { all = all.concat(g.items || []); });
  var bk = {};
  EAP.workflowColumns.forEach(function(c) { bk[c] = []; });
  all.forEach(function(i) { var st = i.state === 'In Progress' ? 'Implementation' : i.state; if (bk[st]) bk[st].push(i); else bk.Backlog.push(i); });

  var h = '<div style="flex:1;overflow-x:auto;"><div style="display:flex;gap:10px;padding:4px 2px 16px;width:100%;">';
  EAP.workflowColumns.forEach(function(c) {
    var items = bk[c] || [];
    h += '<div style="flex:1;min-width:160px;display:flex;flex-direction:column;">';
    h += '<div style="' + colHd(false) + '"><span style="font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.04em;">' + c + '</span><span style="font-size:10px;font-family:var(--font-mono);opacity:0.5;">' + items.length + '</span></div>';
    h += '<div style="' + CB + '">';
    items.forEach(function(i) {
      h += '<div style="' + cardStyle(i) + '">';
      h += '<div class="item-nm" style="font-size:12px;margin-bottom:6px;">' + i.name + '</div>';
      h += '<div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">' + EAP.subtlePill(i.state);
      if (i.wsjf) h += '<span style="font-size:10px;font-family:var(--font-mono);color:#6B7280;">WSJF ' + i.wsjf + '</span>';
      h += '</div>';
      if (i.pct > 0) h += '<div style="margin-top:6px;">' + EAP.pbar(i.pct, i.state) + '</div>';
      h += '</div>';
    });
    h += '</div></div>';
  });
  return h + '</div></div>';
};

// Feature PI kanban
EAP.renderFeatureBoard = function() {
  var pis = EAP.features.pis, bl = EAP.features.backlog();
  var piCols = pis.map(function(pi) { return {id:pi.id, name:pi.name, active:pi.active, items: EAP.features.byPI(pi.id)}; });
  var cols = [{ id: 'backlog', name: 'Backlog', active: false, items: bl }].concat(piCols);
  var h = '<div style="flex:1;overflow-x:auto;"><div style="display:flex;gap:10px;padding:4px 2px 16px;width:100%;">';

  cols.forEach(function(pi) {
    var items = pi.items || [], isA = !!pi.active;
    h += '<div style="flex:1;min-width:180px;display:flex;flex-direction:column;">';
    h += '<div style="' + colHd(isA) + '"><span style="font-size:12px;font-weight:500;flex:1;">' + pi.name + '</span>';
    if (isA) h += '<span style="font-size:9px;font-weight:500;padding:2px 7px;border-radius:3px;background:rgba(255,255,255,0.2);">Current PI</span>';
    h += '<span style="font-size:10px;font-family:var(--font-mono);opacity:0.5;margin-left:6px;">' + items.length + '</span></div>';
    h += '<div style="' + CB + '">';
    items.forEach(function(f) {
      h += '<div style="' + cardStyle(f) + '" id="fcard-' + f.id + '">';
      // Blocked banner
      if (f.blocked || f.state === 'Blocked') {
        h += '<div style="font-size:10px;font-weight:500;color:#DC2626;margin-bottom:4px;display:flex;align-items:center;gap:4px;">' + EAP.icon('info', 12) + ' ' + (f.blockReason || 'Blocked') + '</div>';
      }
      // At risk banner
      if (f.atRisk && f.state !== 'Blocked') {
        h += '<div style="font-size:10px;font-weight:500;color:#D97706;margin-bottom:4px;">' + (f.openDefects ? f.openDefects + ' open defects' : 'At risk') + '</div>';
      }
      h += '<div class="item-nm" style="font-size:12px;margin-bottom:6px;">' + f.name + '</div>';
      h += '<div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">' + EAP.subtlePill(f.state);
      if (f.team) h += '<span class="tm">' + f.team + '</span>';
      if (f.pts) h += '<span style="font-size:10px;font-family:var(--font-mono);color:#6B7280;">' + f.pts + 'pt</span>';
      h += '</div>';
      if (f.pct > 0) h += '<div style="margin-top:6px;">' + EAP.pbar(f.pct, f.state) + '</div>';
      h += '</div>';
    });
    h += '</div></div>';
  });
  return h + '</div></div>';
};

// Work Item grid (team × sprint)
EAP.renderWIGrid = function() {
  var sprints = EAP.workItems.sprints, blFlat = EAP.getBacklogFlat();
  var cols = [{ id: 'backlog', name: 'Backlog', active: false, items: blFlat }].concat(sprints);
  var teams = ['Auth Team', 'Payments Team', 'Fraud Team', 'Mobile Exp Team', 'Accounts Team', 'Onboarding Team'];
  var h = '<div style="flex:1;overflow:auto;">';

  teams.forEach(function(team) {
    // Get team capacity data
    var cap = EAP.teamCapacity[team] || {};
    h += '<div style="margin-bottom:16px;"><div style="padding:8px 12px;background:rgba(14,78,105,0.15);color:#374151;border-radius:8px;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;">' +
      '<span>' + team + '</span></div>';
    h += '<div style="display:flex;gap:8px;width:100%;">';
    cols.forEach(function(sp) {
      var items = (sp.items || []).filter(function(i) { return i.team === team; });
      var isA = !!sp.active;
      // Sprint capacity for this team
      var spKey = sp.id === 'backlog' ? null : sp.id.replace('sp','sp');
      var capVal = sp.id === 'sp2' ? cap.sp2 : sp.id === 'sp3' ? cap.sp3 : sp.id === 'sp4' ? cap.sp4 : sp.id === 'sp5' ? cap.ip : null;
      var capColor = capVal >= 100 ? '#DC2626' : capVal >= 85 ? '#D97706' : 'var(--color-primary)';

      h += '<div style="flex:1;min-width:140px;">';
      h += '<div style="' + colHd(isA) + 'border-radius:8px 8px 0 0;padding:6px 10px;flex-direction:column;align-items:stretch;gap:4px;">';
      h += '<div style="display:flex;align-items:center;justify-content:space-between;"><span style="font-size:10px;font-weight:500;">' + sp.name + '</span><span style="font-size:10px;font-family:var(--font-mono);opacity:0.5;">' + items.length + '</span></div>';
      // Capacity bar per sprint (not for backlog)
      if (capVal !== null && capVal !== undefined) {
        h += '<div style="display:flex;align-items:center;gap:4px;"><div style="flex:1;height:3px;background:rgba(0,0,0,0.06);border-radius:2px;overflow:hidden;"><div style="height:100%;width:' + Math.min(capVal, 100) + '%;background:' + capColor + ';border-radius:2px;opacity:0.6;"></div></div><span style="font-size:9px;font-family:var(--font-mono);color:' + (isA ? 'rgba(255,255,255,0.7)' : capColor) + ';">' + capVal + '%</span></div>';
      }
      h += '</div>';
      h += '<div style="' + CB + 'border-radius:0 0 8px 8px;padding:6px;min-height:50px;">';
      items.forEach(function(wi) {
        var wiStyle = (wi.blocked || wi.state === 'Blocked') ? CS_BLOCKED : CS;
        h += '<div style="' + wiStyle + 'padding:8px;font-size:11px;">';
        if (wi.blocked || wi.state === 'Blocked') {
          h += '<div style="font-size:9px;font-weight:500;color:#DC2626;margin-bottom:3px;">' + (wi.blockReason || 'Blocked') + '</div>';
        }
        h += '<div style="font-weight:500;color:#374151;line-height:1.3;margin-bottom:4px;">' + wi.name + '</div>';
        h += '<div style="display:flex;align-items:center;gap:4px;">' + EAP.subtlePill(wi.state);
        if (wi.pts) h += '<span style="font-size:10px;font-family:var(--font-mono);color:#6B7280;">' + wi.pts + 'pt</span>';
        if (wi.owner) h += '<span style="font-size:10px;color:#9CA3AF;">' + wi.owner + '</span>';
        h += '</div>';
        if (wi.pct > 0) h += '<div style="margin-top:4px;">' + EAP.pbar(wi.pct, wi.state) + '</div>';
        h += '</div>';
      });
      h += '</div></div>';
    });
    h += '</div></div>';
  });
  return h + '</div>';
};

// Track view (9-column workflow)
EAP.renderTrackBoard = function() {
  var all = [];
  EAP.workItems.sprints.forEach(function(sp) { all = all.concat(sp.items || []); });
  all = all.concat(EAP.getBacklogFlat());
  var bk = {};
  EAP.trackColumns.forEach(function(c) { bk[c] = []; });
  all.forEach(function(i) { var c = i.state; if (c === 'Planned' || c === 'To Do') c = 'Draft'; if (bk[c]) bk[c].push(i); else bk.Draft.push(i); });

  // Column border colours by workflow stage
  var colBorder = {'Draft':'#9CA3AF','Ready':'#6B7280','In Progress':'#2563EB','In Review':'#D97706','Testing':'#D97706','Ready for Acceptance':'#7c3aed','Accepted':'#16A34A','Complete':'#16A34A','Cancelled':'#9CA3AF'};

  var h = '<div style="flex:1;overflow-x:auto;"><div style="display:flex;gap:8px;padding:4px 2px 16px;width:100%;">';
  EAP.trackColumns.forEach(function(col) {
    var items = bk[col] || [];
    var bc = colBorder[col] || '#9CA3AF';
    h += '<div style="flex:1;min-width:140px;display:flex;flex-direction:column;">';
    // Column header with bottom accent
    h += '<div style="padding:8px 10px;border-radius:10px 10px 0 0;background:rgba(14,78,105,0.08);border-bottom:3px solid ' + bc + ';display:flex;align-items:center;justify-content:space-between;">';
    h += '<span style="font-size:10px;font-weight:500;color:#374151;text-transform:uppercase;letter-spacing:0.03em;">' + col + '</span>';
    h += '<span style="font-size:10px;font-family:var(--font-mono);color:#6B7280;font-variant-numeric:tabular-nums;">' + items.length + '</span></div>';
    // Column body
    h += '<div style="' + CB + 'border-radius:0 0 10px 10px;min-height:80px;">';
    items.forEach(function(wi) {
      var wiStyle = (wi.blocked || wi.state === 'Blocked') ? CS_BLOCKED : CS;
      h += '<div style="' + wiStyle + 'padding:8px;">';
      if (wi.blocked || wi.state === 'Blocked') {
        h += '<div style="font-size:9px;font-weight:500;color:#DC2626;margin-bottom:3px;">' + (wi.blockReason || 'Blocked') + '</div>';
      }
      h += '<div style="font-weight:500;color:#374151;font-size:11px;line-height:1.3;margin-bottom:4px;">' + wi.name + '</div>';
      h += '<div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">';
      if (wi.pts) h += '<span style="font-size:10px;font-family:var(--font-mono);color:#6B7280;background:rgba(0,0,0,0.04);padding:1px 4px;border-radius:3px;">' + wi.pts + 'pt</span>';
      if (wi.owner) h += '<span style="font-size:10px;color:#9CA3AF;">' + wi.owner + '</span>';
      if (wi.team) h += '<span style="font-size:9px;color:#9CA3AF;">· ' + wi.team + '</span>';
      h += '</div>';
      if (wi.pct > 0) h += '<div style="margin-top:4px;">' + EAP.pbar(wi.pct, wi.state) + '</div>';
      h += '</div>';
    });
    h += '</div></div>';
  });
  return h + '</div></div>';
};
