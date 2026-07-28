/* ═══════════════════════════════════════════════════════
   BOARD-FILTERS.JS — Board toolbar, quick filters, sort,
   condition builder, board-scoped search, and the runtime
   configuration drawer (organize-by / orientation / order /
   max cards) for the generic board (js/tabs/board.js).
   Simplifications vs the platform spec (kept intentionally
   small, called out here rather than left silent):
     - Condition rows evaluate left-to-right with each row's
       own AND/OR joiner to the next row — no nested groups.
     - Search is plain substring match on name/number — no
       wildcard/+/-/quoted-phrase operators.
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

EAP.getBoardFilters = function(level) {
  EAP.state.boardFilters = EAP.state.boardFilters || {};
  if (!EAP.state.boardFilters[level]) {
    EAP.state.boardFilters[level] = {
      quick: { mine: false, unassigned: false, blocked: false, atrisk: false },
      sort: { field: null, dir: 'asc' },
      conditions: [],
      search: '',
      owners: []   // team-member pill selection — same pipeline as everything else, not a parallel filter system
    };
  }
  return EAP.state.boardFilters[level];
};

EAP.boardHasActiveFilters = function(level) {
  var f = EAP.getBoardFilters(level);
  var q = f.quick;
  return q.mine || q.unassigned || q.blocked || q.atrisk || !!f.sort.field || f.conditions.length > 0 || !!f.search || f.owners.length > 0;
};

var QUICK_DEFS = [
  { key: 'mine', label: 'Assigned to me', test: function(it) { return EAP.isMine(it); } },
  { key: 'unassigned', label: 'Unassigned', test: function(it) { return !it.owner; } },
  { key: 'blocked', label: 'Blocked', test: function(it) { return !!(it.blocked || it.state === 'Blocked'); } },
  { key: 'atrisk', label: 'At risk', test: function(it) { return !!it.atRisk; } }
];

function conditionMatch(item, cond, fieldDef) {
  var val = fieldDef.get(item);
  var target = cond.value;
  var isMatch = String(val) === String(target);
  return cond.operator === 'is_not' ? !isMatch : isMatch;
}

EAP.applyBoardFilters = function(items, level) {
  var f = EAP.getBoardFilters(level);
  var out = items;

  QUICK_DEFS.forEach(function(qd) {
    if (f.quick[qd.key]) out = out.filter(qd.test);
  });

  if (f.owners.length) {
    out = out.filter(function(it) { return f.owners.indexOf(it.owner) !== -1; });
  }

  if (f.conditions.length) {
    var fields = EAP.boardFieldDefs(level);
    out = out.filter(function(item) {
      var result = null;
      for (var i = 0; i < f.conditions.length; i++) {
        var cond = f.conditions[i];
        var fieldDef = fields.filter(function(fd) { return fd.key === cond.field; })[0];
        if (!fieldDef) continue;
        var m = conditionMatch(item, cond, fieldDef);
        if (result === null) result = m;
        else result = (f.conditions[i - 1].joiner === 'or') ? (result || m) : (result && m);
      }
      return result === null ? true : result;
    });
  }

  if (f.search) {
    var q = f.search.toLowerCase();
    out = out.filter(function(it) {
      return (it.name && it.name.toLowerCase().indexOf(q) !== -1) || (it.num && it.num.toLowerCase().indexOf(q) !== -1);
    });
  }

  if (f.sort.field) {
    var fields2 = EAP.boardFieldDefs(level);
    var sortDef = fields2.filter(function(fd) { return fd.key === f.sort.field; })[0];
    out = out.slice().sort(function(a, b) {
      var av = sortDef ? sortDef.get(a) : a[f.sort.field];
      var bv = sortDef ? sortDef.get(b) : b[f.sort.field];
      if (av < bv) return f.sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return f.sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return out;
};

// ── Simulated latency for filter/sort/config changes — matches
//    the spec's "dim to ~20% + Updating…" pill pattern. Purely
//    cosmetic: the underlying render is synchronous either way. ──
EAP.boardSimulateUpdate = function(applyFn) {
  var board = document.getElementById('kbn-board');
  if (board) {
    board.classList.add('kbn-updating');
    var pill = document.createElement('div');
    pill.className = 'kbn-updating-pill';
    pill.textContent = 'Updating Kanban board…';
    board.appendChild(pill);
  }
  setTimeout(function() { applyFn(); EAP.render(); }, 380);
};

/* ═══════════════════════════════════════════════════════
   TOOLBAR — one row: Dependencies + Compact toggle switches
   (left) and Search / Filter / Board configuration / overflow
   kebab (right, the platform spec's exact icon cluster). No
   title/count/"Last refreshed" — that duplicated the shared
   Level/PI row above and was removed. The shared filter-bar's
   own owner-filter icon and Dependencies dropdown are hidden
   for this tab (see render.js) since this row now owns both.
   Rendered above the board every render.
   ═══════════════════════════════════════════════════════ */
EAP.renderBoardToolbar = function(level, cfg, fields, totalCount) {
  var f = EAP.getBoardFilters(level);
  var active = EAP.boardHasActiveFilters(level);
  var sel = EAP.state.boardSelection || {};
  var selCount = Object.keys(sel).filter(function(k) { return sel[k]; }).length;
  var depsOn = !!EAP.state.showDeps;
  var compactOn = EAP.state.boardDensity === 'compact';

  var h = '<div class="kbn-toolbar">';

  h += '<div class="kbn-toggle-switch-group">';
  h += '<label class="kbn-toggle-switch"><button class="kbn-switch' + (depsOn ? ' on' : '') + '" id="kbn-deps-toggle" role="switch" aria-checked="' + depsOn + '"><span class="kbn-switch-handle"></span></button><span>Dependencies</span></label>';
  h += '<label class="kbn-toggle-switch"><button class="kbn-switch' + (compactOn ? ' on' : '') + '" id="kbn-compact-toggle" role="switch" aria-checked="' + compactOn + '"><span class="kbn-switch-handle"></span></button><span>Compact</span></label>';
  h += '</div>';

  h += '<div class="kbn-spacer"></div>';

  h += '<div class="kbn-search-wrap' + (EAP.state.boardSearchOpen ? ' open' : '') + '">' +
    '<button class="kbn-tool-icon" id="kbn-search-toggle" title="Search this board (Ctrl+F)" aria-label="Search">' + EAP.icon('search', 15) + '</button>' +
    '<input type="text" id="kbn-search-input" class="kbn-search-input" placeholder="Search by keyword" value="' + (f.search || '').replace(/"/g, '&quot;') + '">' +
    (f.search ? '<button class="kbn-search-clear" id="kbn-search-clear" aria-label="Clear search">' + EAP.icon('x', 12) + '</button>' : '') +
    '</div>';
  h += '<button class="kbn-tool-icon' + (active ? ' active' : '') + '" id="kbn-filter-toggle" title="Filter">' + EAP.icon('filter', 15) + '</button>';
  h += '<button class="kbn-tool-icon" id="kbn-config-toggle" title="Board configuration">' + EAP.icon('sliders', 15) + '</button>';

  h += '<div class="kbn-overflow-wrap">';
  h += '<button class="kbn-tool-icon' + (EAP.state.boardOverflowOpen ? ' active' : '') + '" id="kbn-overflow-toggle" title="More options" aria-label="More options">' + EAP.icon('more-horizontal', 15) + '</button>';
  if (EAP.state.boardOverflowOpen) {
    h += '<div class="kbn-overflow-menu" id="kbn-overflow-menu">';
    h += '<button class="kbn-overflow-item" id="kbn-multiselect-toggle">' + EAP.icon('check-square', 14) + ' ' + (EAP.state.boardMultiSelect ? 'Stop selecting cards' : 'Select multiple cards') + '</button>';
    if (cfg.swimlaneField !== 'none') {
      h += '<button class="kbn-overflow-item" id="kbn-collapse-all">' + EAP.icon(cfg.allCollapsed ? 'chevrons-down' : 'chevrons-up', 14) + ' ' + (cfg.allCollapsed ? 'Expand all swimlanes' : 'Collapse all swimlanes') + '</button>';
    }
    h += '</div>';
  }
  h += '</div>';

  h += '</div>';

  // Team-member pills — team-scoped personas (James et al.) only. Sits
  // directly over the board, feeds the SAME filter pipeline as everything
  // else (f.owners, applied in EAP.applyBoardFilters) — not a second
  // filtering mechanism alongside quick filters/conditions.
  if (EAP.state.context === 'team' && EAP.state.contextName) {
    var members = (EAP.teamMembers && EAP.teamMembers[EAP.state.contextName]) || [];
    if (members.length) {
      h += '<div class="kbn-member-row">';
      h += '<span class="kbn-member-pill' + (f.owners.length === 0 ? ' active' : '') + '" data-member="__all__">' + EAP.icon('users', 13) + ' All</span>';
      members.forEach(function(m) {
        var p = EAP.people[m];
        if (!p) return;
        h += '<span class="kbn-member-pill' + (f.owners.indexOf(m) !== -1 ? ' active' : '') + '" data-member="' + m + '">' + EAP.avatar(m, 18) + ' ' + p.name.split(' ')[0] + '</span>';
      });
      h += '</div>';
    }
  }

  // Chip row — quick filters, conditions, sort
  if (active) {
    h += '<div class="kbn-chip-row">';
    QUICK_DEFS.forEach(function(qd) {
      if (f.quick[qd.key]) h += '<span class="kbn-chip" data-clear-quick="' + qd.key + '">' + qd.label + ' ' + EAP.icon('x', 10) + '</span>';
    });
    f.conditions.forEach(function(cond, idx) {
      var fieldDef = fields.filter(function(fd) { return fd.key === cond.field; })[0];
      var label = fieldDef ? fieldDef.label : cond.field;
      var valLabel = fieldDef && fieldDef.valueLabel ? fieldDef.valueLabel(cond.value) : cond.value;
      h += '<span class="kbn-chip" data-clear-condition="' + idx + '">' + (idx > 0 ? (f.conditions[idx - 1].joiner + ' ') : '') + label + ' ' + (cond.operator === 'is_not' ? 'is not' : 'is') + ' ' + valLabel + ' ' + EAP.icon('x', 10) + '</span>';
    });
    if (f.sort.field) {
      var sortDef = fields.filter(function(fd) { return fd.key === f.sort.field; })[0];
      h += '<span class="kbn-chip" data-clear-sort="1">Sort by: ' + (f.sort.dir === 'asc' ? 'Ascending' : 'Descending') + ' ' + (sortDef ? sortDef.label : f.sort.field) + ' ' + EAP.icon('x', 10) + '</span>';
    }
    h += '<button class="kbn-chip-clearall" id="kbn-clear-all">Clear all</button>';
    h += '</div>';
  }

  // Multi-select action bar
  if (EAP.state.boardMultiSelect && selCount > 0) {
    h += '<div class="kbn-selection-bar">' +
      '<span>' + selCount + ' selected</span>' +
      '<button class="kbn-btn-ghost" id="kbn-sel-move">Move</button>' +
      '<button class="kbn-btn-ghost" id="kbn-sel-clear">Clear</button>' +
      '</div>';
  }

  return h;
};

/* ═══════════════════════════════════════════════════════
   FILTER PANEL — quick filters + sort + condition builder
   ═══════════════════════════════════════════════════════ */
function closeFilterPanel() {
  var c = document.getElementById('kbn-filter-container');
  if (c) c.parentNode.removeChild(c);
}

function renderFilterPanel(level, fields) {
  var f = EAP.getBoardFilters(level);

  var h = '<div class="kbn-drawer-overlay" id="kbn-filter-overlay"></div>';
  h += '<div class="kbn-drawer" id="kbn-filter-drawer" role="dialog" aria-label="Refine list">';
  h += '<div class="kbn-drawer-hd"><span>Refine list</span><button class="kbn-modal-close" id="kbn-filter-close" aria-label="Close">' + EAP.icon('x', 16) + '</button></div>';
  h += '<div class="kbn-drawer-body">';

  h += '<div class="kbn-drawer-section"><div class="kbn-drawer-section-lbl">Quick filters</div><div class="kbn-pill-row">';
  QUICK_DEFS.forEach(function(qd) {
    h += '<button class="kbn-filter-pill' + (f.quick[qd.key] ? ' active' : '') + '" data-quick="' + qd.key + '">' + qd.label + '</button>';
  });
  h += '</div></div>';

  h += '<div class="kbn-drawer-section"><div class="kbn-drawer-section-lbl">Sort by</div>';
  h += '<div class="kbn-sort-row"><select id="kbn-sort-field"><option value="">Select field</option>' +
    fields.map(function(fd) { return '<option value="' + fd.key + '"' + (f.sort.field === fd.key ? ' selected' : '') + '>' + fd.label + '</option>'; }).join('') +
    '</select><button class="kbn-sort-dir" id="kbn-sort-dir" title="Toggle direction">' + EAP.icon(f.sort.dir === 'asc' ? 'arrow-up' : 'arrow-down', 14) + '</button></div>';
  h += '</div>';

  h += '<div class="kbn-drawer-section"><div class="kbn-drawer-section-lbl">Conditions</div><div id="kbn-cond-rows">';
  h += renderConditionRows(f, fields);
  h += '</div><button class="kbn-add-condition" id="kbn-add-condition">' + EAP.icon('plus', 13) + ' Condition</button></div>';

  h += '</div>';
  h += '<div class="kbn-drawer-ft"><button class="kbn-btn-ghost" id="kbn-filter-clearall">Clear all</button><button class="kbn-btn-primary" id="kbn-filter-apply">Apply</button></div>';
  h += '</div>';
  return h;
}

function renderConditionRows(f, fields) {
  if (!f.conditions.length) return '<div class="kbn-move-empty">No conditions yet</div>';
  return f.conditions.map(function(cond, idx) {
    var fieldDef = fields.filter(function(fd) { return fd.key === cond.field; })[0];
    var values = fieldDef ? EAP.groupByField(EAP.getBoardItems(EAP.state.level), fieldDef).order : [];
    var row = '<div class="kbn-cond-row" data-cond-idx="' + idx + '">';
    if (idx > 0) {
      row += '<div class="kbn-cond-joiner"><button class="kbn-joiner-btn' + (cond.joiner !== 'or' ? ' active' : '') + '" data-joiner="and" data-cond-idx="' + (idx - 1) + '">And</button>' +
        '<button class="kbn-joiner-btn' + (cond.joiner === 'or' ? ' active' : '') + '" data-joiner="or" data-cond-idx="' + (idx - 1) + '">Or</button></div>';
    }
    row += '<select class="kbn-cond-field" data-cond-field="' + idx + '">' + fields.map(function(fd) { return '<option value="' + fd.key + '"' + (cond.field === fd.key ? ' selected' : '') + '>' + fd.label + '</option>'; }).join('') + '</select>';
    row += '<select class="kbn-cond-op" data-cond-op="' + idx + '"><option value="is"' + (cond.operator === 'is' ? ' selected' : '') + '>Is</option><option value="is_not"' + (cond.operator === 'is_not' ? ' selected' : '') + '>Is not</option></select>';
    row += '<select class="kbn-cond-val" data-cond-val="' + idx + '">' + values.map(function(v) { return '<option value="' + v + '"' + (cond.value === v ? ' selected' : '') + '>' + (fieldDef && fieldDef.valueLabel ? fieldDef.valueLabel(v) : v) + '</option>'; }).join('') + '</select>';
    row += '<button class="kbn-cond-remove" data-cond-remove="' + idx + '" aria-label="Remove condition">' + EAP.icon('x', 13) + '</button>';
    row += '</div>';
    return row;
  }).join('');
}

function wireFilterPanel(level, fields) {
  var f = EAP.getBoardFilters(level);

  function rerenderRows() {
    document.getElementById('kbn-cond-rows').innerHTML = renderConditionRows(f, fields);
    wireConditionRows();
  }

  function wireConditionRows() {
    document.querySelectorAll('[data-cond-field]').forEach(function(sel) {
      sel.addEventListener('change', function() {
        var idx = parseInt(sel.getAttribute('data-cond-field'), 10);
        f.conditions[idx].field = sel.value;
        var fieldDef = fields.filter(function(fd) { return fd.key === sel.value; })[0];
        var values = fieldDef ? EAP.groupByField(EAP.getBoardItems(level), fieldDef).order : [];
        f.conditions[idx].value = values[0] || '';
        rerenderRows();
      });
    });
    document.querySelectorAll('[data-cond-op]').forEach(function(sel) {
      sel.addEventListener('change', function() { f.conditions[parseInt(sel.getAttribute('data-cond-op'), 10)].operator = sel.value; });
    });
    document.querySelectorAll('[data-cond-val]').forEach(function(sel) {
      sel.addEventListener('change', function() { f.conditions[parseInt(sel.getAttribute('data-cond-val'), 10)].value = sel.value; });
    });
    document.querySelectorAll('[data-cond-remove]').forEach(function(btn) {
      btn.addEventListener('click', function() { f.conditions.splice(parseInt(btn.getAttribute('data-cond-remove'), 10), 1); rerenderRows(); });
    });
    document.querySelectorAll('[data-joiner]').forEach(function(btn) {
      btn.addEventListener('click', function() { f.conditions[parseInt(btn.getAttribute('data-cond-idx'), 10)].joiner = btn.getAttribute('data-joiner'); rerenderRows(); });
    });
  }

  document.getElementById('kbn-filter-overlay').addEventListener('click', closeFilterPanel);
  document.getElementById('kbn-filter-close').addEventListener('click', closeFilterPanel);

  document.querySelectorAll('[data-quick]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var k = btn.getAttribute('data-quick');
      f.quick[k] = !f.quick[k];
      btn.classList.toggle('active');
      closeFilterPanel();
      EAP.boardSimulateUpdate(function() {});
    });
  });

  document.getElementById('kbn-sort-field').addEventListener('change', function() { f.sort.field = this.value || null; });
  document.getElementById('kbn-sort-dir').addEventListener('click', function() {
    f.sort.dir = f.sort.dir === 'asc' ? 'desc' : 'asc';
    this.innerHTML = EAP.icon(f.sort.dir === 'asc' ? 'arrow-up' : 'arrow-down', 14);
  });

  document.getElementById('kbn-add-condition').addEventListener('click', function() {
    var fieldDef = fields[0];
    var values = EAP.groupByField(EAP.getBoardItems(level), fieldDef).order;
    f.conditions.push({ field: fieldDef.key, operator: 'is', value: values[0] || '', joiner: 'and' });
    rerenderRows();
  });

  document.getElementById('kbn-filter-clearall').addEventListener('click', function() {
    f.quick = { mine: false, unassigned: false, blocked: false, atrisk: false };
    f.sort = { field: null, dir: 'asc' };
    f.conditions = [];
    f.search = '';
    closeFilterPanel();
    EAP.boardSimulateUpdate(function() {});
  });

  document.getElementById('kbn-filter-apply').addEventListener('click', function() {
    closeFilterPanel();
    EAP.boardSimulateUpdate(function() {});
  });

  wireConditionRows();
}

EAP.openBoardFilterPanel = function() {
  var level = EAP.state.level;
  var fields = EAP.boardFieldDefs(level);
  var container = document.createElement('div');
  container.id = 'kbn-filter-container';
  container.innerHTML = renderFilterPanel(level, fields);
  document.body.appendChild(container);
  requestAnimationFrame(function() { document.getElementById('kbn-filter-drawer').classList.add('open'); });
  wireFilterPanel(level, fields);
};

/* ═══════════════════════════════════════════════════════
   CONFIG DRAWER — organize-by / orientation / order / max cards
   ═══════════════════════════════════════════════════════ */
function closeConfigDrawer() {
  var c = document.getElementById('kbn-config-container');
  if (c) c.parentNode.removeChild(c);
}

function orderListHTML(order, labelFn, idPrefix) {
  if (!order.length) return '<div class="kbn-move-empty">Nothing to order</div>';
  return order.map(function(v, idx) {
    return '<div class="kbn-order-row">' +
      '<span>' + labelFn(v) + '</span>' +
      '<span class="kbn-order-controls">' +
        '<button data-' + idPrefix + '-up="' + idx + '" aria-label="Move up" ' + (idx === 0 ? 'disabled' : '') + '>' + EAP.icon('chevron-up', 13) + '</button>' +
        '<button data-' + idPrefix + '-down="' + idx + '" aria-label="Move down" ' + (idx === order.length - 1 ? 'disabled' : '') + '>' + EAP.icon('chevron-down', 13) + '</button>' +
      '</span></div>';
  }).join('');
}

function renderConfigDrawer(level) {
  var cfg = EAP.getBoardCfg(level);
  var fields = EAP.boardFieldDefs(level);
  var colField = EAP.boardFieldDef(level, cfg.columnField);
  var swimField = cfg.swimlaneField !== 'none' ? EAP.boardFieldDef(level, cfg.swimlaneField) : null;
  var colOrder = cfg.columnOrder || EAP.groupByField(EAP.getBoardItems(level), colField).order;
  var swimOrder = swimField ? (cfg.swimlaneOrder || EAP.groupByField(EAP.getBoardItems(level), swimField).order) : [];

  var h = '<div class="kbn-drawer-overlay" id="kbn-config-overlay"></div>';
  h += '<div class="kbn-drawer" id="kbn-config-drawer" role="dialog" aria-label="Kanban board configurations">';
  h += '<div class="kbn-drawer-hd"><span>Kanban board configurations</span><button class="kbn-modal-close" id="kbn-config-close" aria-label="Close">' + EAP.icon('x', 16) + '</button></div>';
  h += '<div class="kbn-drawer-body">';

  h += '<div class="kbn-drawer-section"><div class="kbn-drawer-section-lbl">Columns</div>' +
    '<label class="kbn-field-lbl">Organize by</label><select id="kbn-cfg-colfield">' +
    fields.map(function(fd) { return '<option value="' + fd.key + '"' + (fd.key === cfg.columnField ? ' selected' : '') + '>' + fd.label + '</option>'; }).join('') + '</select>' +
    '<label class="kbn-field-lbl">Display order</label><div id="kbn-cfg-colorder">' + orderListHTML(colOrder, function(v) { return colField.valueLabel ? colField.valueLabel(v) : v; }, 'col') + '</div>' +
    '</div>';

  h += '<div class="kbn-drawer-section"><div class="kbn-drawer-section-lbl">Swimlanes</div>' +
    '<label class="kbn-field-lbl">Orientation</label><div class="kbn-segmented"><button class="kbn-seg-btn' + (cfg.orientation === 'horizontal' ? ' active' : '') + '" data-orientation="horizontal">Horizontal</button><button class="kbn-seg-btn' + (cfg.orientation === 'vertical' ? ' active' : '') + '" data-orientation="vertical">Vertical</button></div>' +
    '<label class="kbn-field-lbl">Organize by</label><select id="kbn-cfg-swimfield"><option value="none"' + (cfg.swimlaneField === 'none' ? ' selected' : '') + '>None</option>' +
    fields.filter(function(fd) { return fd.key !== cfg.columnField; }).map(function(fd) { return '<option value="' + fd.key + '"' + (fd.key === cfg.swimlaneField ? ' selected' : '') + '>' + fd.label + '</option>'; }).join('') + '</select>' +
    (swimField ? '<label class="kbn-field-lbl">Display order</label><div id="kbn-cfg-swimorder">' + orderListHTML(swimOrder, function(v) { return swimField.valueLabel ? swimField.valueLabel(v) : v; }, 'swim') + '</div>' : '') +
    '</div>';

  h += '<div class="kbn-drawer-section"><div class="kbn-drawer-section-lbl">Card display</div>' +
    '<label class="kbn-toggle-row"><span>Show card details</span><input type="checkbox" id="kbn-cfg-showdetails"' + (cfg.showDetails ? ' checked' : '') + '></label>' +
    '</div>';

  h += '<div class="kbn-drawer-section"><div class="kbn-drawer-section-lbl">Performance</div>' +
    '<label class="kbn-field-lbl">Max card limit</label><div class="kbn-pill-row">' +
    [50, 100, 150, 200, 250].map(function(n) { return '<button class="kbn-filter-pill' + (cfg.maxCards === n ? ' active' : '') + '" data-max-cards="' + n + '">' + n + '</button>'; }).join('') +
    '</div></div>';

  h += '</div>';
  h += '<div class="kbn-drawer-ft"><button class="kbn-btn-ghost" id="kbn-config-reset">Reset to default</button><button class="kbn-btn-primary" id="kbn-config-apply">Apply</button></div>';
  h += '</div>';
  return h;
}

function wireConfigDrawer(level) {
  var cfg = EAP.getBoardCfg(level);
  var pendingColField = cfg.columnField, pendingSwimField = cfg.swimlaneField, pendingOrientation = cfg.orientation;
  var pendingColOrder = (cfg.columnOrder || EAP.groupByField(EAP.getBoardItems(level), EAP.boardFieldDef(level, cfg.columnField)).order).slice();
  var pendingSwimOrder = cfg.swimlaneField !== 'none' ? (cfg.swimlaneOrder || EAP.groupByField(EAP.getBoardItems(level), EAP.boardFieldDef(level, cfg.swimlaneField)).order).slice() : [];
  var pendingShowDetails = cfg.showDetails, pendingMaxCards = cfg.maxCards;

  document.getElementById('kbn-config-overlay').addEventListener('click', closeConfigDrawer);
  document.getElementById('kbn-config-close').addEventListener('click', closeConfigDrawer);

  document.getElementById('kbn-cfg-colfield').addEventListener('change', function() {
    cfg.columnField = this.value; cfg.columnOrder = null;
    closeConfigDrawer(); EAP.openBoardConfigDrawer();
  });
  document.getElementById('kbn-cfg-swimfield').addEventListener('change', function() { pendingSwimField = this.value; pendingSwimOrder = null; closeConfigDrawer(); EAP.openBoardConfigDrawer(); });

  document.querySelectorAll('[data-orientation]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      pendingOrientation = btn.getAttribute('data-orientation');
      document.querySelectorAll('[data-orientation]').forEach(function(b) { b.classList.toggle('active', b === btn); });
    });
  });

  function wireOrderButtons(prefix, arrGetter, arrSetter, repaint) {
    document.querySelectorAll('[data-' + prefix + '-up]').forEach(function(b) {
      b.addEventListener('click', function() {
        var idx = parseInt(b.getAttribute('data-' + prefix + '-up'), 10);
        var arr = arrGetter();
        if (idx > 0) { var t = arr[idx]; arr[idx] = arr[idx - 1]; arr[idx - 1] = t; }
        arrSetter(arr);
        repaint();
        wireOrderButtons(prefix, arrGetter, arrSetter, repaint);
      });
    });
    document.querySelectorAll('[data-' + prefix + '-down]').forEach(function(b) {
      b.addEventListener('click', function() {
        var idx = parseInt(b.getAttribute('data-' + prefix + '-down'), 10);
        var arr = arrGetter();
        if (idx < arr.length - 1) { var t = arr[idx]; arr[idx] = arr[idx + 1]; arr[idx + 1] = t; }
        arrSetter(arr);
        repaint();
        wireOrderButtons(prefix, arrGetter, arrSetter, repaint);
      });
    });
  }

  var colField0 = EAP.boardFieldDef(level, pendingColField);
  wireOrderButtons('col', function() { return pendingColOrder; }, function(arr) { pendingColOrder = arr; }, function() {
    document.getElementById('kbn-cfg-colorder').innerHTML = orderListHTML(pendingColOrder, function(v) { return colField0.valueLabel ? colField0.valueLabel(v) : v; }, 'col');
  });

  if (pendingSwimField !== 'none') {
    var swimField0 = EAP.boardFieldDef(level, pendingSwimField);
    wireOrderButtons('swim', function() { return pendingSwimOrder; }, function(arr) { pendingSwimOrder = arr; }, function() {
      document.getElementById('kbn-cfg-swimorder').innerHTML = orderListHTML(pendingSwimOrder, function(v) { return swimField0.valueLabel ? swimField0.valueLabel(v) : v; }, 'swim');
    });
  }

  document.getElementById('kbn-cfg-showdetails').addEventListener('change', function() { pendingShowDetails = this.checked; });
  document.querySelectorAll('[data-max-cards]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      pendingMaxCards = parseInt(btn.getAttribute('data-max-cards'), 10);
      document.querySelectorAll('[data-max-cards]').forEach(function(b) { b.classList.toggle('active', b === btn); });
    });
  });

  document.getElementById('kbn-config-reset').addEventListener('click', function() {
    delete EAP.state.boardCfg[level];
    closeConfigDrawer();
    EAP.boardSimulateUpdate(function() {});
  });

  document.getElementById('kbn-config-apply').addEventListener('click', function() {
    closeConfigDrawer();
    EAP.boardSimulateUpdate(function() {
      cfg.columnField = pendingColField;
      cfg.swimlaneField = pendingSwimField;
      cfg.orientation = pendingOrientation;
      cfg.columnOrder = pendingColOrder;
      cfg.swimlaneOrder = pendingSwimOrder && pendingSwimOrder.length ? pendingSwimOrder : null;
      cfg.showDetails = pendingShowDetails;
      cfg.maxCards = pendingMaxCards;
      cfg.swimlaneCollapsed = {};
      cfg.allCollapsed = false;
    });
  });
}

EAP.openBoardConfigDrawer = function() {
  var level = EAP.state.level;
  var container = document.createElement('div');
  container.id = 'kbn-config-container';
  container.innerHTML = renderConfigDrawer(level);
  document.body.appendChild(container);
  requestAnimationFrame(function() { document.getElementById('kbn-config-drawer').classList.add('open'); });
  wireConfigDrawer(level);
};

/* ═══════════════════════════════════════════════════════
   TOOLBAR WIRING — search, filter/config open, chip clears,
   multi-select toggle, selection bar actions.
   ═══════════════════════════════════════════════════════ */
EAP.initBoardToolbar = function() {
  var level = EAP.state.level;
  var f = EAP.getBoardFilters(level);

  document.querySelectorAll('[data-member]').forEach(function(pill) {
    pill.addEventListener('click', function() {
      var m = pill.getAttribute('data-member');
      if (m === '__all__') {
        f.owners = [];
      } else {
        var idx = f.owners.indexOf(m);
        if (idx !== -1) f.owners.splice(idx, 1); else f.owners.push(m);
      }
      EAP.boardSimulateUpdate(function() {});
    });
  });

  var searchToggle = document.getElementById('kbn-search-toggle');
  var searchInput = document.getElementById('kbn-search-input');
  if (searchToggle) searchToggle.addEventListener('click', function() {
    EAP.state.boardSearchOpen = !EAP.state.boardSearchOpen;
    EAP.render();
    setTimeout(function() { var el = document.getElementById('kbn-search-input'); if (el && EAP.state.boardSearchOpen) el.focus(); }, 0);
  });
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      f.search = this.value;
      EAP.boardSimulateUpdate(function() {});
    });
  }
  var searchClear = document.getElementById('kbn-search-clear');
  if (searchClear) searchClear.addEventListener('click', function() { f.search = ''; EAP.render(); });

  var filterToggle = document.getElementById('kbn-filter-toggle');
  if (filterToggle) filterToggle.addEventListener('click', function(e) { e.stopPropagation(); EAP.openBoardFilterPanel(); });

  var configToggle = document.getElementById('kbn-config-toggle');
  if (configToggle) configToggle.addEventListener('click', function(e) { e.stopPropagation(); EAP.openBoardConfigDrawer(); });

  var msToggle = document.getElementById('kbn-multiselect-toggle');
  if (msToggle) msToggle.addEventListener('click', function() { EAP.state.boardOverflowOpen = false; EAP.toggleMultiSelect(); });
  var collapseAllBtn = document.getElementById('kbn-collapse-all');
  if (collapseAllBtn) collapseAllBtn.addEventListener('click', function() { EAP.state.boardOverflowOpen = false; if (EAP.toggleAllSwimlanes) EAP.toggleAllSwimlanes(); });

  var depsToggle = document.getElementById('kbn-deps-toggle');
  if (depsToggle) depsToggle.addEventListener('click', function() {
    EAP.state.showDeps = !EAP.state.showDeps;
    EAP.state.depFilter = 'all';
    EAP.render();
  });
  var compactToggle = document.getElementById('kbn-compact-toggle');
  if (compactToggle) compactToggle.addEventListener('click', function() {
    EAP.state.boardDensity = EAP.state.boardDensity === 'compact' ? 'default' : 'compact';
    EAP.render();
  });

  var overflowToggle = document.getElementById('kbn-overflow-toggle');
  if (overflowToggle) overflowToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    EAP.state.boardOverflowOpen = !EAP.state.boardOverflowOpen;
    EAP.render();
  });
  var overflowMenu = document.getElementById('kbn-overflow-menu');
  if (overflowMenu) {
    overflowMenu.addEventListener('click', function(e) { e.stopPropagation(); });
    setTimeout(function() {
      document.addEventListener('click', function closeOverflow() {
        if (EAP.state.boardOverflowOpen) { EAP.state.boardOverflowOpen = false; EAP.render(); }
        document.removeEventListener('click', closeOverflow);
      }, { once: true });
    }, 0);
  }

  document.querySelectorAll('[data-clear-quick]').forEach(function(chip) {
    chip.addEventListener('click', function() { f.quick[chip.getAttribute('data-clear-quick')] = false; EAP.boardSimulateUpdate(function() {}); });
  });
  document.querySelectorAll('[data-clear-condition]').forEach(function(chip) {
    chip.addEventListener('click', function() { f.conditions.splice(parseInt(chip.getAttribute('data-clear-condition'), 10), 1); EAP.boardSimulateUpdate(function() {}); });
  });
  var clearSort = document.querySelector('[data-clear-sort]');
  if (clearSort) clearSort.addEventListener('click', function() { f.sort = { field: null, dir: 'asc' }; EAP.boardSimulateUpdate(function() {}); });
  var clearAll = document.getElementById('kbn-clear-all');
  if (clearAll) clearAll.addEventListener('click', function() {
    f.quick = { mine: false, unassigned: false, blocked: false, atrisk: false };
    f.sort = { field: null, dir: 'asc' };
    f.conditions = [];
    f.search = '';
    EAP.boardSimulateUpdate(function() {});
  });
  var clearRefine = document.getElementById('kbn-clear-refine');
  if (clearRefine) clearRefine.addEventListener('click', function() {
    f.quick = { mine: false, unassigned: false, blocked: false, atrisk: false };
    f.sort = { field: null, dir: 'asc' };
    f.conditions = [];
    f.search = '';
    EAP.render();
  });

  var selClear = document.getElementById('kbn-sel-clear');
  if (selClear) selClear.addEventListener('click', function() { EAP.clearBoardSelection(); });
  var selMove = document.getElementById('kbn-sel-move');
  if (selMove) selMove.addEventListener('click', function() { if (EAP.openMoveModalForSelection) EAP.openMoveModalForSelection(); });
};

// Ctrl/Cmd+F focuses board-scoped search when the generic board is active.
document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f' && EAP.state && EAP.state.tab === 'board' && EAP.state.kanbanView !== 'sprint') {
    e.preventDefault();
    EAP.state.boardSearchOpen = true;
    EAP.render();
    setTimeout(function() { var el = document.getElementById('kbn-search-input'); if (el) el.focus(); }, 0);
  }
});
