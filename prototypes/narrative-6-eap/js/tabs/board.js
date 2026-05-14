/* ═══════════════════════════════════════════════════════
   BOARD.JS — Board tab renderer
   Cards use CSS classes (.bcard) for consistent treatment
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

var CB = EAP._colBodyStyle;

function colHd(isActive, height) {
  var h = height || 42;
  var pad = h <= 36 ? '0 10px' : '8px 12px';
  var base = 'padding:' + pad + ';border-radius:12px 12px 0 0;display:flex;align-items:center;justify-content:space-between;height:' + h + 'px;box-sizing:border-box;border-width:1px 1px 2px 1px;border-style:solid;overflow:hidden;';
  return base + (isActive
    ? 'background:#383733;border-color:#383733;color:#fff;box-shadow:0 8px 16px rgba(0,0,0,0.20);'
    : 'background:#FFFFFF;border-color:#E3E2DF;color:#000000;box-shadow:0 8px 12px rgba(56,56,56,0.10);');
}

// ── Card renderer — shared across all board views ──────
function renderCard(item, opts) {
  opts = opts || {};
  var compact = EAP.state.boardDensity === 'compact';
  var isBlocked = item.blocked || item.state === 'Blocked';
  var isAtRisk = item.atRisk && !isBlocked;
  var isDone = item.state === 'Done' || item.state === 'Complete';
  var t = item.type;
  var isWI = EAP.isWorkItemType(t);
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

  // Type pill (WorkItem cards only — Feature/Epic/Cap are obvious from context)
  if (isWI && !compact) {
    h += '<div class="bcard-tags">' + EAP.typeCell(t) + '</div>';
  }

  // Title
  h += '<div class="bcard-title">' + item.name + '</div>';

  // Parent feature caption (WorkItem only)
  if (isWI && item.parent && !compact) {
    h += '<div class="bcard-parent" title="Parent feature">' + EAP.icon('chevron-up', 10) + ' ' + item.parent + '</div>';
  }

  // Block reason in compact mode (non-compact already has banner)
  if (compact && isBlocked && item.blockReason) {
    h += '<div class="bcard-block-compact">' + item.blockReason + '</div>';
  }

  // Meta row — state + pts together, then team
  h += '<div class="bcard-meta">';
  if (compact) {
    var dotColor = isBlocked ? '#DC2626' : isDone ? '#16A34A' : item.state === 'In Progress' ? '#2563EB' : '#9CA3AF';
    h += '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:' + dotColor + ';flex-shrink:0;"></span>';
    h += '<span style="font-size:10px;color:#6B7280;">' + item.state + '</span>';
    if (item.pts) h += '<span class="bcard-pts">' + item.pts + 'pt</span>';
  } else {
    h += EAP.subtlePill(item.state);
    if (item.pts) h += '<span class="bcard-pts">' + item.pts + 'pt</span>';
    if (opts.showTeam && item.team) h += '<span class="bcard-owner">' + item.team + '</span>';
  }
  h += '</div>';

  // Progress bar — stays in content area (hidden in compact via CSS)
  if (item.pct > 0 && !isDone) {
    h += '<div class="bcard-progress">' + EAP.pbar(item.pct, item.state) + '</div>';
  }

  // Footer — avatar left; dep icon + separator (only if has dependency) + chevron right
  var ownerKey = item.owner || (opts.ownerField ? item[opts.ownerField] : null);
  var hasDep = EAP.hasDependency(item.id);
  if (!compact && ownerKey) {
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

// Router
EAP.renderBoard = function() {
  var s = EAP.state;
  if (s.level === 'Epic' || s.level === 'Capability') return EAP.renderWorkflowBoard();
  if (s.level === 'Feature') return EAP.renderFeatureBoard();
  if (s.level === 'WorkItem') return EAP.renderWIGrid();
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
  // Apply persona "mine only" filter (Epic/Cap have no team field, so team scope is a no-op)
  all = EAP.applyMineFilter(all);
  if (!all.length && EAP.hasClearableFilters()) {
    return '<div style="flex:1;display:flex;align-items:center;justify-content:center;">' + EAP.emptyState() + '</div>';
  }
  var bk = {};
  EAP.workflowColumns.forEach(function(c) { bk[c] = []; });
  all.forEach(function(i) { var st = i.state === 'In Progress' ? 'Implementation' : i.state; if (bk[st]) bk[st].push(i); else bk.Backlog.push(i); });

  var h = '<div style="flex:1;overflow-x:auto;"><div style="display:flex;gap:8px;padding:4px 2px 16px;width:100%;">';
  EAP.workflowColumns.forEach(function(c) {
    var items = bk[c] || [];
    h += '<div style="flex:1;min-width:160px;display:flex;flex-direction:column;">';
    h += '<div style="' + colHd(false) + '"><span style="font-family:var(--font-sans);font-size:10px;font-weight:400;line-height:20px;color:#000000;">' + c + '</span><span class="kbn-badge">' + items.length + '</span></div>';
    h += '<div style="' + CB + '">';
    items.forEach(function(i) { h += renderCard(i, {showTeam: false}); });
    h += '</div></div>';
  });
  return h + '</div></div>';
};

// ── Feature PI kanban ──────────────────────────────────
EAP.renderFeatureBoard = function() {
  var bl = EAP.applyScope(EAP.applyMineFilter(EAP.features.backlog()), 'Feature');
  var piCols = EAP.features.pis.map(function(pi) {
    return {id:pi.id, name:pi.name, active:pi.active,
            items: EAP.applyScope(EAP.applyMineFilter(EAP.features.byPI(pi.id)), 'Feature')};
  });
  var cols = [{id:'backlog', name:'Backlog', active:false, items:bl}].concat(piCols);

  var totalItems = cols.reduce(function(a, c) { return a + c.items.length; }, 0);
  if (totalItems === 0 && EAP.hasClearableFilters()) {
    return '<div style="flex:1;display:flex;align-items:center;justify-content:center;">' + EAP.emptyState() + '</div>';
  }

  var h = '<div style="flex:1;overflow-x:auto;"><div style="display:flex;gap:8px;padding:4px 2px 16px;width:100%;">';
  cols.forEach(function(pi) {
    var items = pi.items || [], isA = !!pi.active;
    h += '<div style="flex:1;min-width:180px;display:flex;flex-direction:column;">';
    h += '<div style="' + colHd(isA) + '"><span style="font-family:var(--font-sans);font-size:12px;font-weight:400;line-height:20px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + pi.name + '</span>';
    if (isA) h += '<span style="font-size:9px;font-weight:500;padding:2px 6px;border-radius:3px;background:rgba(255,255,255,0.15);color:rgba(255,255,255,0.9);white-space:nowrap;margin-right:4px;">Current PI</span>';
    h += '<span class="kbn-badge' + (isA ? ' kbn-badge--active' : '') + '">' + items.length + '</span></div>';
    h += '<div style="' + CB + '">';
    items.forEach(function(f) { h += renderCard(f, {showTeam: true, ownerField: 'owner'}); });
    h += '</div></div>';
  });
  return h + '</div></div>';
};

// ── Work Item grid (team × sprint) ─────────────────────
EAP.renderWIGrid = function() {
  var s = EAP.state;
  var sprints = EAP.workItems.sprints, blFlat = EAP.getBacklogFlat();
  var cols = [{id:'backlog', name:'Backlog', active:false, items:blFlat}].concat(sprints);
  var teams = ['Auth Team', 'Payments Team', 'Fraud Team', 'Mobile Exp Team', 'Accounts Team', 'Onboarding Team'];

  // Team scope: when context is a single team, restrict the grid to that row.
  if (s.context === 'team' && s.contextName) {
    teams = teams.filter(function(t) { return t === s.contextName; });
  }

  // Compute total post-filter item count for empty-state decision.
  // (Mine filter is applied per-cell via getBacklogFlat for backlog
  // and via the team-scoped filter below for sprint cells.)
  var totalItems = teams.reduce(function(a, team) {
    return a + cols.reduce(function(b, sp) {
      var its = (sp.items || []).filter(function(i) { return i.team === team; });
      return b + EAP.applyMineFilter(its).length;
    }, 0);
  }, 0);
  if (totalItems === 0 && EAP.hasClearableFilters()) {
    return '<div style="flex:1;display:flex;align-items:center;justify-content:center;">' + EAP.emptyState() + '</div>';
  }

  var h = '<div style="flex:1;overflow:auto;">';
  teams.forEach(function(team) {
    var cap = EAP.teamCapacity[team] || {};
    var totalForTeam = cols.reduce(function(a, sp) {
      var its = (sp.items || []).filter(function(i) { return i.team === team; });
      return a + EAP.applyMineFilter(its).length;
    }, 0);
    var tc = EAP.teamColors[team] || '#6B7280';
    h += '<div style="margin-bottom:16px;">' +
      '<div class="wi-swim-hd" style="background:#E3E2DF;border-left:3px solid ' + tc + ';border-radius:0 8px 8px 0;margin-bottom:6px;">' +
      '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + tc + ';flex-shrink:0;"></span>' +
      '<span style="font-family:var(--font-sans);font-size:11px;font-weight:400;line-height:20px;color:#000000;">' + team + '</span>' +
      '<span style="font-family:var(--font-sans);font-size:10px;font-weight:500;color:#6B7280;">' + totalForTeam + ' items</span>' +
      '</div>';
    h += '<div style="display:flex;gap:8px;width:100%;">';
    cols.forEach(function(sp) {
      var items = EAP.applyMineFilter((sp.items || []).filter(function(i) { return i.team === team; }));
      var isA = !!sp.active;
      var capVal = sp.id === 'sp2' ? cap.sp2 : sp.id === 'sp3' ? cap.sp3 : sp.id === 'sp4' ? cap.sp4 : sp.id === 'sp5' ? cap.ip : null;
      var hasCap = (capVal !== null && capVal !== undefined && sp.id !== 'backlog');
      // Threshold bands — green < 85%, amber 85-100%, red > 100%
      var capColor = capVal > 100 ? 'var(--dv-error)' : capVal >= 85 ? 'var(--dv-warning)' : 'var(--dv-success)';

      // Column container is positioning context for the floating capacity chip.
      h += '<div style="flex:1;min-width:140px;position:relative;">';
      // Single-row header — uniform 32px height across all columns (Backlog included).
      h += '<div style="' + colHd(isA, 32) + '">';
      h += '<span style="font-family:var(--font-sans);font-size:11px;font-weight:400;line-height:20px;">' + sp.name + '</span>';
      h += '<span class="kbn-badge' + (isA ? ' kbn-badge--active' : '') + '">' + items.length + '</span></div>';
      // Capacity chip — floating pill half-overlapping the header bottom edge.
      // Wrapped in a `cap-chip-host` so the tooltip can sit OUTSIDE the chip's
      // clip region. Backlog gets none (clean negative space).
      if (hasCap) {
        var fillPct = Math.min(capVal, 100);
        h += '<div class="cap-chip-host" style="position:absolute;left:50%;top:21px;transform:translateX(-50%);z-index:3;">';
        h += '<div class="cap-chip" style="position:relative;height:22px;width:80px;border-radius:11px;background:#FFFFFF;border:1.5px solid ' + capColor + ';box-shadow:0 1px 3px rgba(0,0,0,0.08);overflow:hidden;display:flex;align-items:center;padding:0 9px;gap:5px;">';
        h += '<div style="position:absolute;inset:0;width:' + fillPct + '%;background:' + capColor + ';opacity:0.32;"></div>';
        h += '<span style="position:relative;z-index:1;display:inline-flex;color:' + capColor + ';">' + EAP.icon('gauge', 13, 'stroke-width="2.2"') + '</span>';
        h += '<span style="position:relative;z-index:1;font-size:11px;font-family:var(--font-mono);font-weight:600;color:var(--text-primary);">' + capVal + '%</span>';
        h += '</div>';
        h += '<div class="cap-chip-tip">Sprint capacity · ' + capVal + '%</div>';
        h += '</div>';
      }
      // Body — top padding clears the floating chip on sprint columns.
      h += '<div style="' + CB + 'border-radius:0 0 16px 16px;padding:' + (hasCap ? '20px 6px 6px' : '8px 6px 6px') + ';min-height:50px;">';
      if (items.length === 0 && EAP.hasClearableFilters()) {
        // Quiet per-cell hint so a filter-emptied cell reads as intentional, not broken.
        h += '<div style="font-size:10px;color:var(--text-tertiary);text-align:center;padding:14px 4px;font-style:italic;opacity:0.7;">No matching items</div>';
      } else {
        items.forEach(function(wi) { h += renderCard(wi, {showTeam: false, ownerField: 'owner'}); });
      }
      h += '</div></div>';
    });
    h += '</div></div>';
  });
  return h + '</div>';
};

// Track view moved to js/tabs/track.js
