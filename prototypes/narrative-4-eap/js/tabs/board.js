/* ═══════════════════════════════════════════════════════
   BOARD.JS — Board tab renderer (workflow, feature, WI grid, track)
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

// Board styles (shared across sub-views)
var CS = 'background:rgba(255,255,255,0.6);border:1px solid rgba(0,0,0,0.1);border-radius:10px;padding:10px;margin-bottom:6px;cursor:grab;transition:box-shadow 0.15s ease;';
var CB = 'background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.4);border-top:none;border-radius:0 0 12px 12px;padding:8px;min-height:100px;flex:1;';
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
      h += '<div style="' + CS + '"><div class="item-nm" style="font-size:12px;margin-bottom:6px;">' + i.name + '</div>' + EAP.subtlePill(i.state);
      if (i.wsjf) h += ' <span class="wsjf" style="margin-left:4px;">' + i.wsjf + '</span>';
      h += '</div>';
    });
    h += '</div></div>';
  });
  return h + '</div></div>';
};

// Feature PI kanban
EAP.renderFeatureBoard = function() {
  var pis = EAP.features.pis, bl = EAP.features.backlog;
  var cols = [{ id: 'backlog', name: 'Backlog', active: false, items: bl }].concat(pis);
  var h = '<div style="flex:1;overflow-x:auto;"><div style="display:flex;gap:10px;padding:4px 2px 16px;width:100%;">';

  cols.forEach(function(pi) {
    var items = pi.items || [], isA = !!pi.active;
    h += '<div style="flex:1;min-width:180px;display:flex;flex-direction:column;">';
    h += '<div style="' + colHd(isA) + '"><span style="font-size:12px;font-weight:500;flex:1;">' + pi.name + '</span>';
    if (isA) h += '<span style="font-size:9px;font-weight:500;padding:2px 7px;border-radius:3px;background:rgba(255,255,255,0.2);">Current PI</span>';
    h += '<span style="font-size:10px;font-family:var(--font-mono);opacity:0.5;margin-left:6px;">' + items.length + '</span></div>';
    h += '<div style="' + CB + '">';
    items.forEach(function(f) {
      var bc = f.state === 'Blocked' ? '#dc2626' : f.state === 'Done' || f.state === 'Complete' ? '#16a34a' : 'rgba(0,0,0,0.08)';
      h += '<div style="' + CS + 'border-left:3px solid ' + bc + ';" id="fcard-' + f.id + '">';
      h += '<div class="item-nm" style="font-size:12px;margin-bottom:5px;">' + f.name + '</div>';
      h += '<div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">' + EAP.subtlePill(f.state);
      if (f.team) h += '<span class="tm">' + f.team + '</span>';
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
    h += '<div style="margin-bottom:14px;"><div style="padding:6px 12px;background:rgba(14,78,105,0.15);color:var(--text-primary);border-radius:8px;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px;">' + team + '</div>';
    h += '<div style="display:flex;gap:8px;width:100%;">';
    cols.forEach(function(sp) {
      var items = (sp.items || []).filter(function(i) { return i.team === team; });
      var isA = !!sp.active;
      h += '<div style="flex:1;min-width:140px;">';
      h += '<div style="' + colHd(isA) + 'border-radius:8px 8px 0 0;padding:6px 10px;"><span style="font-size:10px;font-weight:500;">' + sp.name + '</span><span style="font-size:10px;font-family:var(--font-mono);opacity:0.5;">' + items.length + '</span></div>';
      h += '<div style="' + CB + 'border-radius:0 0 8px 8px;padding:6px;min-height:50px;">';
      items.forEach(function(wi) {
        h += '<div style="' + CS + 'padding:8px;font-size:11px;"><div style="font-weight:500;color:var(--text-secondary);line-height:1.3;margin-bottom:4px;">' + wi.name + '</div>' + EAP.subtlePill(wi.state);
        if (wi.pts) h += ' <span class="sz">' + wi.pts + 'pt</span>';
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

  var h = '<div style="flex:1;overflow-x:auto;"><div style="display:flex;gap:8px;padding:4px 2px 16px;width:100%;">';
  EAP.trackColumns.forEach(function(col) {
    var items = bk[col] || [];
    h += '<div style="flex:1;min-width:140px;display:flex;flex-direction:column;">';
    h += '<div style="' + colHd(false) + 'border-radius:10px 10px 0 0;padding:8px 10px;"><span style="font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.03em;">' + col + '</span><span style="font-size:10px;font-family:var(--font-mono);opacity:0.5;">' + items.length + '</span></div>';
    h += '<div style="' + CB + 'border-radius:0 0 10px 10px;min-height:80px;">';
    items.forEach(function(wi) {
      h += '<div style="' + CS + 'padding:8px;font-size:11px;"><div style="font-weight:500;color:var(--text-secondary);line-height:1.3;margin-bottom:4px;">' + wi.name + '</div>';
      if (wi.pts) h += '<span class="sz">' + wi.pts + 'pt</span> ';
      if (wi.owner) h += '<span class="par">' + wi.owner + '</span>';
      h += '</div>';
    });
    h += '</div></div>';
  });
  return h + '</div></div>';
};
