/* ═══════════════════════════════════════════════════════
   SPACE-LIST.JS — Table renderer for Space context
   Styling matches .dtbl / .gpanel exactly (same as Backlog)
   Used by: Bug Register space (sp2)
   ═══════════════════════════════════════════════════════ */

var EAP = EAP || {};

EAP.renderSpaceList = function() {
  var s = EAP.state;
  var sp = s.spaceData;
  if (!sp || !sp.list) return '<div style="padding:40px;color:#9CA3AF;font-size:13px;">No list data.</div>';

  var allRows = sp.list.rows || [];

  // Apply persisted drag-reorder
  var order = s._spaceListOrder;
  if (order && order.length === allRows.length) {
    var rowMap = {};
    allRows.forEach(function(r) { rowMap[r.id] = r; });
    allRows = order.map(function(id) { return rowMap[id]; }).filter(Boolean);
  }

  // Filters
  var filterSev    = s._spaceListFilter && s._spaceListFilter.severity || null;
  var filterStatus = s._spaceListFilter && s._spaceListFilter.status   || null;
  var filtered = allRows.filter(function(r) {
    if (filterSev    && r.severity !== filterSev)    return false;
    if (filterStatus && r.status   !== filterStatus) return false;
    return true;
  });

  // Use EAP shared pagination (same system as Backlog/List/Hierarchy)
  var pgId     = 'space-bugs';
  var pageRows = EAP.pgSlice(filtered, pgId);

  // Summary counts (always across all rows, independent of filter)
  var openRows    = allRows.filter(function(r){ return r.status !== 'Done'; });
  var critCount   = openRows.filter(function(r){ return r.severity === 'Critical'; }).length;
  var highCount   = openRows.filter(function(r){ return r.severity === 'High'; }).length;
  var openCount   = allRows.filter(function(r){ return r.status === 'Open'; }).length;
  var inProgCount = allRows.filter(function(r){ return r.status === 'In Progress' || r.status === 'In Review'; }).length;
  var doneCount   = allRows.filter(function(r){ return r.status === 'Done'; }).length;

  var sevCfg = {
    Critical: { bg: 'rgba(220,38,38,0.08)',  color: '#DC2626', border: 'rgba(220,38,38,0.20)' },
    High:     { bg: 'rgba(220,38,38,0.06)',  color: '#B91C1C', border: 'rgba(220,38,38,0.16)' },
    Medium:   { bg: 'rgba(217,119,6,0.08)',  color: '#D97706', border: 'rgba(217,119,6,0.20)' },
    Low:      { bg: 'rgba(0,0,0,0.04)',      color: '#797874', border: 'rgba(0,0,0,0.10)'     }
  };

  function filterChip(label, key, value, count, isActive) {
    var base = 'display:inline-flex;align-items:center;gap:5px;font-size:11px;padding:3px 10px;border-radius:9px;cursor:pointer;transition:all 100ms ease;white-space:nowrap;';
    var sty  = isActive
      ? base + 'background:#383733;color:#fff;border:1px solid #383733;'
      : base + 'background:transparent;color:#585753;border:1px solid #CCCBC8;';
    return '<span class="space-list-chip" data-filter-key="' + key + '" data-filter-val="' + (isActive ? '' : value) + '" style="' + sty + '">' +
      label + ' <span style="font-size:10px;opacity:0.65;">' + count + '</span>' +
    '</span>';
  }

  // ── Wrapper — same .gpanel structure as Backlog ───────
  var html =
    '<div class="gpanel" style="flex:1;min-width:0;">' +

    // Panel header (mirrors .gpanel-hd)
    '<div class="gpanel-hd">' +
      '<div class="gpanel-hd-left">' +
        '<span class="gpanel-title">' + sp.name + '</span>' +
        '<span class="gpanel-count">' + allRows.length + '</span>' +
        (critCount ? '<span style="font-size:11px;font-weight:600;color:#DC2626;margin-left:6px;">' + critCount + ' critical</span>' : '') +
        (highCount ? '<span style="font-size:11px;color:#B91C1C;margin-left:4px;">' + highCount + ' high</span>' : '') +
      '</div>' +
      // Filter chips
      '<div style="display:flex;gap:6px;align-items:center;">' +
        '<span style="font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.05em;">Filter</span>' +
        filterChip('Open',        'status',   'Open',        openCount,   filterStatus === 'Open') +
        filterChip('In Progress', 'status',   'In Progress', inProgCount, filterStatus === 'In Progress') +
        filterChip('Done',        'status',   'Done',        doneCount,   filterStatus === 'Done') +
        filterChip('Critical',    'severity', 'Critical',    critCount,   filterSev === 'Critical') +
        filterChip('High',        'severity', 'High',        highCount,   filterSev === 'High') +
      '</div>' +
    '</div>' +

    // Scrollable table body — same .gpanel-scroll as Backlog
    '<div class="gpanel-scroll">' +
    '<table class="dtbl" style="table-layout:fixed;width:auto;">' +
    '<thead><tr>' +
      EAP._TH0 +  // grip col (24px)
      '<th style="width:50px;">Rank</th>' +
      '<th style="width:280px;">Description</th>' +
      '<th style="width:110px;">Severity</th>' +
      '<th style="width:170px;">Component</th>' +
      '<th style="width:140px;">Owner</th>' +
      '<th style="width:120px;">Status</th>' +
      '<th style="width:80px;">Logged</th>' +
    '</tr></thead>' +
    '<tbody>';

  pageRows.forEach(function(row, i) {
    var pgState  = EAP.pgGet(pgId);
    var globalRank = (pgState.page * (pgState.perPage > 0 ? pgState.perPage : filtered.length)) + i + 1;
    var sev    = sevCfg[row.severity] || sevCfg.Low;
    var person = EAP.people && EAP.people[row.owner];

    html +=
      '<tr class="space-list-row" draggable="true" data-row-id="' + row.id + '">' +

      // Drag grip — uses same .dg class as Backlog
      EAP._GT +

      // Rank number
      '<td style="font-size:12px;font-variant-numeric:tabular-nums;color:#9CA3AF;font-weight:500;width:52px;">' +
        globalRank +
      '</td>' +

      // Description — truncates like all other .dtbl tds (white-space:nowrap from CSS)
      '<td style="color:var(--text-primary);font-weight:400;" title="' + row.bug.replace(/"/g, '&quot;') + '">' +
        row.bug +
      '</td>' +

      // Severity pill
      '<td>' +
        '<span style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:9px;' +
          'background:' + sev.bg + ';color:' + sev.color + ';' +
          'border:1px solid ' + sev.border + ';white-space:nowrap;display:inline-flex;">' +
          row.severity +
        '</span>' +
      '</td>' +

      // Component
      '<td style="color:var(--text-secondary);">' + row.component + '</td>' +

      // Owner — avatar + name (same pattern as Backlog)
      '<td>' +
        '<div style="display:flex;align-items:center;gap:6px;">' +
          EAP.avatar(row.owner, 20) +
          '<span style="font-size:12px;color:var(--text-secondary);">' + row.owner + '</span>' +
        '</div>' +
      '</td>' +

      // Status — use EAP.pill() for consistent styling
      '<td>' + EAP.pill(row.status) + '</td>' +

      // Date logged
      '<td style="color:var(--text-tertiary);">' + row.logged + '</td>' +

      '</tr>';
  });

  if (filtered.length === 0) {
    html += '<tr><td colspan="8" style="padding:40px;text-align:center;color:#9CA3AF;font-size:12px;">No bugs match the current filter.</td></tr>';
  }

  html += '</tbody></table></div>' +
    EAP.pgFooter(filtered.length, pgId) +
    '</div>'; // end .gpanel

  return html;
};

// ── Post-render wiring ─────────────────────────────────
EAP.wireSpaceListFilters = function() {
  // Filter chips
  document.querySelectorAll('.space-list-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      var key = chip.dataset.filterKey;
      var val = chip.dataset.filterVal;
      EAP.state._spaceListFilter = EAP.state._spaceListFilter || {};
      EAP.state._spaceListFilter[key] = val || null;
      // Reset pagination on filter change
      var pg = EAP.pgGet('space-bugs');
      if (pg) pg.page = 0;
      EAP.renderContent();
      EAP.wireSpaceListFilters();
      EAP.pgWire();
    });
  });

  // Drag-to-reorder
  EAP._dragSrcId = null;
  document.querySelectorAll('.space-list-row').forEach(function(row) {
    row.addEventListener('dragstart', function(e) {
      EAP._dragSrcId = row.dataset.rowId;
      row.style.opacity = '0.4';
      e.dataTransfer.effectAllowed = 'move';
    });
    row.addEventListener('dragend', function() {
      row.style.opacity = '';
      document.querySelectorAll('.space-list-row').forEach(function(r) { r.style.outline = ''; });
    });
    row.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      document.querySelectorAll('.space-list-row').forEach(function(r) { r.style.outline = ''; });
      row.style.outline = '2px solid #4338CA';
      row.style.outlineOffset = '-2px';
    });
    row.addEventListener('dragleave', function() { row.style.outline = ''; });
    row.addEventListener('drop', function(e) {
      e.preventDefault();
      row.style.outline = '';
      if (!EAP._dragSrcId || EAP._dragSrcId === row.dataset.rowId) return;
      var sp = EAP.state.spaceData;
      if (!sp || !sp.list) return;
      var base = sp.list.rows || [];
      var order = EAP.state._spaceListOrder;
      if (!order || order.length !== base.length) order = base.map(function(r) { return r.id; });
      var fromIdx = order.indexOf(EAP._dragSrcId);
      var toIdx   = order.indexOf(row.dataset.rowId);
      if (fromIdx === -1 || toIdx === -1) return;
      order.splice(fromIdx, 1);
      order.splice(toIdx, 0, EAP._dragSrcId);
      EAP.state._spaceListOrder = order;
      EAP.renderContent();
      EAP.wireSpaceListFilters();
      EAP.pgWire();
    });
  });
};
