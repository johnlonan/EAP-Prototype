/* ═══════════════════════════════════════════════════════
   BOARD.JS — Generic field-driven Kanban board renderer
   Conforms to the platform design team's generic Kanban
   pattern: columns AND swimlanes are both configurable by
   field (not hardcoded per hierarchy level). Config lives
   in EAP.state.boardCfg[level], persisted per session.
   Cards use CSS classes (.bcard) for consistent treatment.
   See js/components/board-dnd.js, board-filters.js,
   board-panel.js for DnD, filters/search, and the card
   editor — this file owns data + layout only.
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

// ── Feature PR aggregation — rolls up child story PR/CI state ──
function getFeaturePRSummary(featureName) {
  var all = [];
  EAP.workItems.sprints.forEach(function(sp) { all = all.concat(sp.items || []); });
  var children = all.filter(function(i) { return i.parent === featureName && i.pr; });
  if (!children.length) return null;
  var merged  = children.filter(function(i) { return i.pr.status === 'merged'; }).length;
  var failing = children.filter(function(i) { return i.ci && i.ci.status === 'failing'; }).length;
  return { total: children.length, merged: merged, failing: failing };
}

/* ═══════════════════════════════════════════════════════
   FIELD REGISTRY — what can drive columns / swimlanes /
   sort / condition-builder per hierarchy level. Every field
   def has get(item) so grouping never touches raw props
   directly — lets 'sprint' (positional, not a property)
   sit alongside plain-property fields like 'state'/'team'.
   ═══════════════════════════════════════════════════════ */
EAP._sprintOfItem = {}; // rebuilt on every getBoardItems('WorkItem') call

EAP.boardFieldDefs = function(level) {
  var state = { key: 'state', label: 'State', get: function(it) { return it.state || 'Unspecified'; } };
  var owner = { key: 'owner', label: 'Owner', get: function(it) { return it.owner || 'Unassigned'; } };
  var size  = { key: 'size',  label: 'Size',  get: function(it) { return it.size || 'Unsized'; }, valueOrder: ['XS', 'S', 'M', 'L', 'XL', 'Unsized'] };
  var team  = { key: 'team',  label: 'Team',  get: function(it) { return it.team || 'Unassigned'; } };
  // get() returns the raw id (matches item.goal's own domain, so
  // applyCardMove can write it straight back) — valueLabel resolves
  // the id to a display name, same split as the 'pi'/'sprint' fields.
  var goalById = {};
  (EAP.goals || []).forEach(function(g) { goalById[g.id] = g; });
  var goal = { key: 'goal', label: 'Goal', get: function(it) { return it.goal || 'none'; },
    valueLabel: function(v) { return v === 'none' ? 'No goal' : (goalById[v] ? goalById[v].name : v); } };

  if (level === 'Epic') return [state, owner, size, goal];
  if (level === 'Capability') return [state, owner, size, { key: 'art', label: 'ART', get: function(it) { return it.art || 'Unassigned'; } }];

  if (level === 'Feature') {
    var piById = {};
    (EAP.features.pis || []).forEach(function(p) { piById[p.id] = p; });
    var piOrder = ['backlog'].concat((EAP.features.pis || []).map(function(p) { return p.id; }));
    return [
      { key: 'pi', label: 'PI', get: function(it) { return it.pi || 'backlog'; },
        valueLabel: function(v) { return v === 'backlog' ? 'Backlog' : (piById[v] ? piById[v].name : v); },
        valueOrder: piOrder },
      state, team, owner, size
    ];
  }

  if (level === 'WorkItem') {
    var sprintById = {};
    (EAP.workItems.sprints || []).forEach(function(sp) { sprintById[sp.id] = sp; });
    var sprintOrder = ['backlog'].concat((EAP.workItems.sprints || []).map(function(sp) { return sp.id; }));
    // Workflow-ordered State (Draft -> ... -> Complete/Cancelled) — same
    // column list track.js's scrum task board used. 'State' (not 'Sprint')
    // is the correct default column for a team-scoped board: a team member
    // tracks stories moving across workflow states within the sprint they're
    // already in, not which sprint work is planned into (see EAP.getBoardCfg).
    // Raw item.state values ('To Do', 'Planned', 'Backlog') don't all match
    // EAP.trackColumns literally — fold them into 'Draft', same remapping
    // track.js itself used, so they don't show up as bogus extra columns.
    var wfState = { key: 'state', label: 'State', valueOrder: EAP.trackColumns,
      get: function(it) {
        var raw = it.state || 'Draft';
        return EAP.trackColumns.indexOf(raw) !== -1 ? raw : 'Draft';
      } };
    return [
      { key: 'sprint', label: 'Sprint', get: function(it) { return EAP._sprintOfItem[it.id] || 'backlog'; },
        valueLabel: function(v) { return v === 'backlog' ? 'Backlog' : (sprintById[v] ? sprintById[v].name : v); },
        valueOrder: sprintOrder },
      wfState, team, owner
    ];
  }
  return [];
};

EAP.boardFieldDef = function(level, key) {
  return EAP.boardFieldDefs(level).filter(function(f) { return f.key === key; })[0] || null;
};

// ── Raw, scoped item pool per level (grouping-agnostic) ──
EAP.getBoardItems = function(level) {
  if (level === 'Epic' || level === 'Capability') {
    var data = level === 'Epic' ? EAP.epics : EAP.capabilities;
    var all = (typeof data.backlog === 'function' ? data.backlog() : data.backlog || []).slice();
    (data.groups || []).forEach(function(g) {
      var items = g.epicIds ? g.epicIds.map(function(id) { return data.all.filter(function(e) { return e.id === id; })[0]; }).filter(Boolean) :
                  g.capIds ? g.capIds.map(function(id) { return data.all.filter(function(c) { return c.id === id; })[0]; }).filter(Boolean) : [];
      all = all.concat(items);
    });
    return EAP.applyMineFilter(all);
  }
  if (level === 'Feature') {
    return EAP.applyScope(EAP.applyMineFilter(EAP.allFeatures.slice()), 'Feature');
  }
  if (level === 'WorkItem') {
    EAP._sprintOfItem = {};
    var sprintItems = [];
    (EAP.workItems.sprints || []).forEach(function(sp) {
      (sp.items || []).forEach(function(it) { EAP._sprintOfItem[it.id] = sp.id; sprintItems.push(it); });
    });
    var flatBacklog = EAP.getBacklogFlat();
    sprintItems = EAP.applyMineFilter(EAP.applyTeamScope(sprintItems));
    return flatBacklog.concat(sprintItems);
  }
  return [];
};

EAP.findBoardItem = function(level, id) {
  var pool = EAP.getBoardItems(level);
  for (var i = 0; i < pool.length; i++) if (pool[i].id === id) return pool[i];
  return null;
};

// ── Structural move for WorkItem 'sprint' (array-positional,
//    not a plain property) — everything else is a direct set. ──
EAP.applyCardMove = function(item, level, fieldKey, toValue) {
  if (level === 'WorkItem' && fieldKey === 'sprint') {
    // Remove from wherever it currently lives
    var bl = EAP.workItems.backlog;
    ['Story', 'Defect', 'Incident', 'Problem'].forEach(function(k) {
      bl[k] = (bl[k] || []).filter(function(i) { return i.id !== item.id; });
    });
    (EAP.workItems.sprints || []).forEach(function(sp) {
      sp.items = (sp.items || []).filter(function(i) { return i.id !== item.id; });
    });
    // Re-home it
    if (toValue === 'backlog') {
      var bucket = bl[item.type] || (bl[item.type] = []);
      bucket.push(item);
    } else {
      var sprint = (EAP.workItems.sprints || []).filter(function(sp) { return sp.id === toValue; })[0];
      if (sprint) sprint.items.push(item);
    }
    return;
  }
  item[fieldKey] = (toValue === 'backlog' || toValue === 'none' || toValue === 'Unassigned' || toValue === 'Unsized' || toValue === 'Unspecified') ? null : toValue;
};

// Hook for disallowed-transition rules. Always permits today — no
// workflow-gating rule exists in this data model yet (deferred, see
// project_narrative9_kanban_conform memory). Kept as a real seam so
// the error/snap-back UI in board-dnd.js has something to call.
EAP.validateCardMove = function(item, level, fieldKey, fromValue, toValue) {
  return { ok: true };
};

// User-dragged column order (persisted per-level in cfg.columnOrder)
// overrides a groupByField() result's natural order, without disturbing
// which items are in which bucket.
EAP.applyColumnOrder = function(colGroup, cfg) {
  if (!cfg.columnOrder) return colGroup;
  var wanted = cfg.columnOrder.filter(function(v) { return colGroup.buckets[v]; });
  colGroup.order = wanted.concat(colGroup.order.filter(function(v) { return wanted.indexOf(v) === -1; }));
  return colGroup;
};

EAP.groupByField = function(items, fieldDef) {
  var buckets = {}, order = [];
  items.forEach(function(it) {
    var v = fieldDef.get(it);
    if (!buckets[v]) { buckets[v] = []; order.push(v); }
    buckets[v].push(it);
  });
  if (fieldDef.valueOrder) {
    // A fixed enumeration (Scrum workflow states, PIs, sprints, sizes) keeps
    // ALL its canonical values as columns even with zero cards right now —
    // an empty "Testing" column still needs to exist so a card CAN be
    // dropped into it. Only genuinely unexpected values (not in the
    // enumeration) get appended after, sorted.
    var vo = fieldDef.valueOrder;
    vo.forEach(function(v) { if (!buckets[v]) buckets[v] = []; });
    order = vo.slice().concat(order.filter(function(v) { return vo.indexOf(v) === -1; }).sort());
  } else {
    order.sort();
  }
  return {
    order: order,
    buckets: buckets,
    label: function(v) { return fieldDef.valueLabel ? fieldDef.valueLabel(v) : v; }
  };
};

/* ═══════════════════════════════════════════════════════
   CONFIG — per-level board configuration (organize-by,
   orientation, swimlane order/collapse, max cards).
   ═══════════════════════════════════════════════════════ */
EAP._boardCfgDefaults = {
  Epic:       { columnField: 'state',  swimlaneField: 'none', orientation: 'horizontal', maxCards: 100 },
  Capability: { columnField: 'state',  swimlaneField: 'none', orientation: 'horizontal', maxCards: 100 },
  Feature:    { columnField: 'pi',     swimlaneField: 'none', orientation: 'horizontal', maxCards: 100 },
  WorkItem:   { columnField: 'sprint', swimlaneField: 'team', orientation: 'horizontal', maxCards: 100 }
};

EAP.getBoardCfg = function(level) {
  EAP.state.boardCfg = EAP.state.boardCfg || {};
  if (!EAP.state.boardCfg[level]) {
    var d = EAP._boardCfgDefaults[level] || EAP._boardCfgDefaults.Epic;
    var isTeamScoped = (level === 'WorkItem' && EAP.state.context === 'team');
    // Team-scoped personas (James et al.) are doing Scrum tracking, not
    // sprint planning: they move stories/tasks across workflow STATE
    // (Draft -> In Progress -> ... -> Complete) within the sprint they're
    // already in — Sprint/Backlog-as-columns is the ART PM's planning view,
    // wrong mental model here. A "Team" swimlane is also redundant when
    // already scoped to one team; member-level narrowing happens via the
    // team-member pills in the toolbar (board-filters.js) instead.
    var columnField = isTeamScoped ? 'state' : d.columnField;
    var swimlaneField = isTeamScoped ? 'none' : d.swimlaneField;
    EAP.state.boardCfg[level] = {
      columnField: columnField,
      swimlaneField: swimlaneField,
      orientation: d.orientation,
      maxCards: d.maxCards,
      swimlaneOrder: null,        // null = default (grouping's natural order)
      swimlaneCollapsed: {},
      allCollapsed: false,
      showDetails: false
    };
  }
  return EAP.state.boardCfg[level];
};

/* ═══════════════════════════════════════════════════════
   CARD RENDERER — shared across flat + swimlane layouts
   ═══════════════════════════════════════════════════════ */
function renderCard(item, opts) {
  opts = opts || {};
  var compact = EAP.state.boardDensity === 'compact';
  var isBlocked = item.blocked || item.state === 'Blocked';
  var isAtRisk = item.atRisk && !isBlocked;
  var isDone = item.state === 'Done' || item.state === 'Complete';
  var t = item.type;
  var isWI = EAP.isWorkItemType(t);
  var multiSelect = !!opts.multiSelect;
  var selected = !!opts.selected;
  var cls = 'bcard' + (compact ? ' bcard-compact' : '') + (isBlocked ? ' bcard-blocked' : '') + (isAtRisk ? ' bcard-atrisk' : '') + (isDone ? ' bcard-done' : '') + (selected ? ' bcard-selected' : '');

  var h = '<div class="' + cls + '"' + (item.id ? ' id="fcard-' + item.id + '"' : '') +
    ' data-board-card="1" data-item-id="' + item.id + '" tabindex="0">';

  if (multiSelect) {
    h += '<label class="bcard-check" onclick="event.stopPropagation();">' +
      '<input type="checkbox" data-select-id="' + item.id + '"' + (selected ? ' checked' : '') + '>' +
      '<span class="bcard-check-box">' + EAP.icon('check', 11) + '</span>' +
      '</label>';
  }

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

  // Extra detail rows — "Show card details" runtime-config toggle
  if (opts.showDetails && !compact) {
    h += '<div class="bcard-extra">';
    if (item.goal) {
      var g = (EAP.goals || []).filter(function(x) { return x.id === item.goal; })[0];
      h += '<div class="bcard-extra-row"><span class="bcard-extra-lbl">Goal</span><span class="bcard-extra-val">' + (g ? g.name : '—') + '</span></div>';
    }
    if (item.wsjf) h += '<div class="bcard-extra-row"><span class="bcard-extra-lbl">WSJF</span><span class="bcard-extra-val">' + item.wsjf + '</span></div>';
    h += '</div>';
  }

  // Progress bar — stays in content area (hidden in compact via CSS)
  if (item.pct > 0 && !isDone) {
    h += '<div class="bcard-progress">' + EAP.pbar(item.pct, item.state) + '</div>';
  }

  // Feature PR aggregation row — shows child story VCS rollup on Feature cards
  if (t === 'Feature' && !compact) {
    var _fpr = getFeaturePRSummary(item.name);
    if (_fpr) {
      var _allDone = _fpr.merged === _fpr.total && _fpr.failing === 0;
      var _aggrTxt = _allDone
        ? _fpr.total + '/' + _fpr.total + ' code merged · CI passing'
        : _fpr.merged + '/' + _fpr.total + ' code merged' + (_fpr.failing > 0 ? ' · <span class="bcard-aggr-fail">' + _fpr.failing + ' build' + (_fpr.failing > 1 ? 's' : '') + ' failing</span>' : '');
      h += '<div class="bcard-aggr' + (_allDone ? ' bcard-aggr-done' : '') + '">' + _aggrTxt + '</div>';
    }
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
    h += '<button class="bcard-footer-kebab" data-move-id="' + item.id + '" title="Move card" aria-label="Move card" onclick="event.stopPropagation();">' + EAP.icon('more-horizontal', 14) + '</button>';
    h += '</div>';
    h += '</div>';
  }

  h += '</div>';
  return h;
}
EAP.renderBoardCard = renderCard;

/* ═══════════════════════════════════════════════════════
   GENERIC RENDER ENGINE
   ═══════════════════════════════════════════════════════ */

// One column-set (a row of columns) for a given item pool.
function renderColumnSet(items, colGroup, level, cfg, swimlaneValue) {
  var h = '<div class="kbn-colset" data-swimlane-value="' + (swimlaneValue === undefined ? '' : swimlaneValue) + '">';
  colGroup.order.forEach(function(colVal) {
    var colItems = (colGroup.buckets[colVal] || []).slice(0, cfg.maxCards);
    var totalInCol = (colGroup.buckets[colVal] || []).length;
    var isActive = false; // reserved for "current PI/sprint" style highlight
    if (level === 'Feature' && cfg.columnField === 'pi') {
      var piDef = (EAP.features.pis || []).filter(function(p) { return p.id === colVal; })[0];
      isActive = !!(piDef && piDef.active);
    }
    if (level === 'WorkItem' && cfg.columnField === 'sprint') {
      var spDef = (EAP.workItems.sprints || []).filter(function(sp) { return sp.id === colVal; })[0];
      isActive = !!(spDef && spDef.active);
    }
    h += '<div class="kbn-col" data-column-value="' + colVal + '">';
    h += '<div style="' + colHd(isActive) + '" data-col-header="' + colVal + '" draggable="true">' +
      '<span style="font-family:var(--font-sans);font-size:16px;font-weight:400;line-height:24px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + colGroup.label(colVal) + '</span>' +
      '<span class="' + (isActive ? 'kbn-badge kbn-badge--active' : 'kbn-col-count-badge') + '">' + (totalInCol > colItems.length ? colItems.length + '/' + totalInCol : totalInCol) + '</span>' +
      '</div>';
    h += '<div class="kbn-drop-zone" style="' + CB + '" data-drop-column="' + colVal + '">';
    if (!colItems.length) {
      h += '<div class="kbn-empty-col">No cards</div>';
    } else {
      colItems.forEach(function(it) {
        h += renderCard(it, {
          showTeam: level !== 'WorkItem',
          ownerField: 'owner',
          showDetails: cfg.showDetails,
          multiSelect: EAP.state.boardMultiSelect,
          selected: !!(EAP.state.boardSelection || {})[it.id]
        });
      });
    }
    h += '</div></div>';
  });
  h += '</div>';
  return h;
}

EAP.renderBoard = function() {
  var s = EAP.state, level = s.level;
  var cfg = EAP.getBoardCfg(level);
  var fields = EAP.boardFieldDefs(level);
  var colField = EAP.boardFieldDef(level, cfg.columnField) || fields[0];
  var swimField = cfg.swimlaneField !== 'none' ? EAP.boardFieldDef(level, cfg.swimlaneField) : null;

  var rawItems = EAP.getBoardItems(level);
  var items = EAP.applyBoardFilters ? EAP.applyBoardFilters(rawItems, level) : rawItems;

  var h = '<div class="kbn-wrap">';
  h += EAP.renderBoardToolbar ? EAP.renderBoardToolbar(level, cfg, fields, rawItems.length) : '';

  if (!rawItems.length && EAP.hasClearableFilters && EAP.hasClearableFilters()) {
    return h + '<div style="flex:1;display:flex;align-items:center;justify-content:center;">' + EAP.emptyState() + '</div></div>';
  }
  if (!items.length && rawItems.length) {
    return h + '<div class="kbn-noresults">' + EAP.icon('search', 28) + '<p>No cards match the current filters</p>' +
      '<button class="kbn-clear-btn" id="kbn-clear-refine">Clear filters</button></div></div>';
  }

  h += '<div class="kbn-board" id="kbn-board" data-level="' + level + '" data-column-field="' + cfg.columnField + '" data-swimlane-field="' + cfg.swimlaneField + '">';

  if (!swimField) {
    var colGroup = EAP.applyColumnOrder(EAP.groupByField(items, colField), cfg);
    h += '<div class="kbn-scroll">' + renderColumnSet(items, colGroup, level, cfg) + '</div>';
  } else {
    // Column set must be IDENTICAL across every lane (same values, same
    // order) so columns line up visually when scrolling — computed once
    // from the full item pool, not re-derived per lane.
    var globalColGroup = EAP.applyColumnOrder(EAP.groupByField(items, colField), cfg);
    var swimGroup = EAP.groupByField(items, swimField);
    var order = cfg.swimlaneOrder ? cfg.swimlaneOrder.filter(function(v) { return swimGroup.buckets[v]; }).concat(swimGroup.order.filter(function(v) { return cfg.swimlaneOrder.indexOf(v) === -1; })) : swimGroup.order;
    var vertical = cfg.orientation === 'vertical';
    h += '<div class="kbn-swimlanes' + (vertical ? ' kbn-swimlanes-vertical' : '')  + '">';
    order.forEach(function(swVal) {
      var swItems = swimGroup.buckets[swVal] || [];
      var laneBuckets = EAP.groupByField(swItems, colField).buckets;
      var colGroup = { order: globalColGroup.order, buckets: laneBuckets, label: globalColGroup.label };
      var collapsed = cfg.allCollapsed || !!cfg.swimlaneCollapsed[swVal];
      h += '<div class="kbn-lane' + (collapsed ? ' kbn-lane-collapsed' : '') + '" data-swimlane-value="' + swVal + '" draggable="true">';
      h += '<div class="kbn-lane-hd">' +
        '<button class="kbn-lane-toggle" data-lane-toggle="' + swVal + '" aria-label="Expand/collapse">' + EAP.icon(collapsed ? 'chevron-right' : 'chevron-down', 14) + '</button>' +
        EAP.avatar(swVal, 20) +
        '<span class="kbn-lane-name">' + swimGroup.label(swVal) + '</span>' +
        '<span class="kbn-badge">' + swItems.length + '</span>' +
        '<span class="kbn-lane-drag" title="Drag to reorder swimlane">' + EAP.icon('grip', 13) + '</span>' +
      '</div>';
      if (!collapsed) h += '<div class="kbn-lane-body">' + renderColumnSet(swItems, colGroup, level, cfg, swVal) + '</div>';
      h += '</div>';
    });
    h += '</div>';
  }

  h += '</div></div>';
  return h;
};
