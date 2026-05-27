/* ═══════════════════════════════════════════════════════
   SPACE-LIST.JS — Table/list renderer for Space context
   Used by: Bug Register space (sp2)
   Features: rank, drag-to-reorder, filter chips, pagination
   ═══════════════════════════════════════════════════════ */

var EAP = EAP || {};

var SPACE_LIST_PAGE_SIZE = 10;

var GRIP_ICON =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
  'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
  '<circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>' +
  '<circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>' +
  '</svg>';

EAP.renderSpaceList = function() {
  var s = EAP.state;
  var sp = s.spaceData;
  if (!sp || !sp.list) return '<div style="padding:40px;color:#9CA3AF;font-size:13px;">No list data.</div>';

  var list = sp.list;
  var allRows = list.rows || [];

  // Apply persisted row order (drag-to-reorder)
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

  // Pagination
  var page      = s._spaceListPage || 1;
  var totalPages = Math.max(1, Math.ceil(filtered.length / SPACE_LIST_PAGE_SIZE));
  if (page > totalPages) page = totalPages;
  var pageStart = (page - 1) * SPACE_LIST_PAGE_SIZE;
  var pageRows  = filtered.slice(pageStart, pageStart + SPACE_LIST_PAGE_SIZE);

  // Summary counts (across all rows, not just current page)
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
  var staCfg = {
    'Open':        { bg: 'rgba(0,0,0,0.05)',      color: '#585753' },
    'In Progress': { bg: 'rgba(99,102,241,0.10)',  color: '#4338CA' },
    'In Review':   { bg: 'rgba(217,119,6,0.08)',  color: '#D97706' },
    'Done':        { bg: 'rgba(22,163,74,0.08)',   color: '#16A34A' }
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

  // Grid columns: grip | rank | bug title | severity | component | owner | status | logged
  var GRID = '24px 36px 1fr 90px 124px 96px 112px 72px';

  var html =
    '<div style="display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden;">' +

    // Sub-header: title + summary + filter chips
    '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:0 16px 10px;flex-shrink:0;">' +
      '<span style="font-size:12px;font-weight:600;color:#111111;">' + sp.name + '</span>' +
      '<span style="font-size:11px;color:#CCCBC8;">|</span>' +
      '<span style="font-size:11px;color:#797874;">' + allRows.length + ' bugs &middot; ' + openRows.length + ' open</span>' +
      (critCount ? '<span style="font-size:11px;font-weight:600;color:#DC2626;">' + critCount + ' critical</span>' : '') +
      (highCount ? '<span style="font-size:11px;color:#B91C1C;">' + highCount + ' high</span>' : '') +
      '<div style="flex:1;"></div>' +
      '<div style="display:flex;gap:6px;align-items:center;">' +
        '<span style="font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.05em;">Filter</span>' +
        filterChip('Open',        'status',   'Open',        openCount,   filterStatus === 'Open') +
        filterChip('In Progress', 'status',   'In Progress', inProgCount, filterStatus === 'In Progress') +
        filterChip('Done',        'status',   'Done',        doneCount,   filterStatus === 'Done') +
        filterChip('Critical',    'severity', 'Critical',    critCount,   filterSev === 'Critical') +
        filterChip('High',        'severity', 'High',        highCount,   filterSev === 'High') +
      '</div>' +
    '</div>' +

    // Table — fills remaining height, scrolls if needed
    '<div style="flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;padding:0 16px 0;">' +
    '<div style="display:flex;flex-direction:column;flex:1;min-height:0;background:#FFFFFF;border-radius:12px;border:1px solid #E3E2DF;box-shadow:0 1px 3px rgba(0,0,0,0.05);overflow:hidden;">' +

    // Sticky table header
    '<div style="display:grid;grid-template-columns:' + GRID + ';padding:8px 16px;background:#F8F7F4;border-bottom:1px solid #E3E2DF;flex-shrink:0;">' +
      '<span></span>' + // grip col
      '<span style="font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:#797874;font-weight:500;">#</span>' +
      ['Bug', 'Severity', 'Component', 'Owner', 'Status', 'Logged'].map(function(h) {
        return '<span style="font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:#797874;font-weight:500;">' + h + '</span>';
      }).join('') +
    '</div>' +

    // Scrollable body
    '<div id="space-list-body" style="flex:1;overflow-y:auto;">';

  pageRows.forEach(function(row, i) {
    var globalRank = pageStart + i + 1;
    var sev    = sevCfg[row.severity] || sevCfg.Low;
    var sta    = staCfg[row.status]   || staCfg['Open'];
    var person = EAP.people && EAP.people[row.owner];
    var initials = person ? person.initials : row.owner.substring(0,2).toUpperCase();
    var avColor  = person ? person.color : '#6B7280';
    var isLast   = i === pageRows.length - 1;

    html +=
      '<div class="space-list-row" draggable="true" data-row-id="' + row.id + '" style="' +
        'display:grid;grid-template-columns:' + GRID + ';' +
        'padding:10px 16px;align-items:center;' +
        (isLast ? '' : 'border-bottom:1px solid rgba(0,0,0,0.04);') +
        'transition:background 100ms ease;cursor:default;' +
      '">' +

      // Grip handle
      '<span class="space-list-grip" style="color:#CCCBC8;cursor:grab;display:flex;align-items:center;justify-content:center;">' +
        GRIP_ICON +
      '</span>' +

      // Rank
      '<span style="font-size:11px;font-variant-numeric:tabular-nums;color:#9CA3AF;font-weight:500;">' + globalRank + '</span>' +

      // Bug title
      '<span style="font-size:12px;color:#111111;line-height:1.4;padding-right:12px;">' + row.bug + '</span>' +

      // Severity pill
      '<span style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:9px;background:' +
        sev.bg + ';color:' + sev.color + ';border:1px solid ' + sev.border + ';' +
        'display:inline-flex;align-items:center;white-space:nowrap;width:fit-content;">' +
        row.severity + '</span>' +

      // Component
      '<span style="font-size:11px;color:#585753;">' + row.component + '</span>' +

      // Owner
      '<div style="display:flex;align-items:center;gap:5px;">' +
        '<span style="width:20px;height:20px;border-radius:50%;background:' + avColor + ';color:#fff;' +
          'font-size:9px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">' +
          initials + '</span>' +
        '<span style="font-size:11px;color:#585753;">' + row.owner + '</span>' +
      '</div>' +

      // Status pill
      '<span style="font-size:10px;font-weight:500;padding:2px 7px;border-radius:9px;background:' +
        sta.bg + ';color:' + sta.color + ';' +
        'display:inline-flex;align-items:center;white-space:nowrap;width:fit-content;">' +
        row.status + '</span>' +

      // Logged
      '<span style="font-size:11px;color:#797874;">' + row.logged + '</span>' +

      '</div>';
  });

  if (filtered.length === 0) {
    html += '<div style="padding:40px;text-align:center;color:#9CA3AF;font-size:12px;">No bugs match the current filter.</div>';
  }

  html += '</div></div>'; // end body + card

  // Pagination bar
  if (totalPages > 1) {
    var showing = Math.min(pageStart + SPACE_LIST_PAGE_SIZE, filtered.length);
    html +=
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0 12px;flex-shrink:0;">' +
        '<span style="font-size:11px;color:#9CA3AF;">' +
          'Showing ' + (pageStart + 1) + '–' + showing + ' of ' + filtered.length +
        '</span>' +
        '<div style="display:flex;gap:4px;align-items:center;">';

    // Page number buttons
    for (var pg = 1; pg <= totalPages; pg++) {
      var isActive = pg === page;
      html +=
        '<button class="space-list-pg" data-page="' + pg + '" style="' +
          'width:28px;height:28px;border-radius:6px;border:none;cursor:pointer;' +
          'font-size:11px;font-family:var(--font-sans);font-weight:' + (isActive ? '600' : '400') + ';' +
          'background:' + (isActive ? '#383733' : 'transparent') + ';' +
          'color:' + (isActive ? '#fff' : '#585753') + ';' +
          'transition:all 100ms ease;' +
        '">' + pg + '</button>';
    }

    html += '</div></div>';
  }

  html += '</div></div>'; // end outer wrapper
  return html;
};

// ── Post-render wiring ────────────────────────────────
EAP.wireSpaceListFilters = function() {
  // Filter chips
  document.querySelectorAll('.space-list-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      var key = chip.dataset.filterKey;
      var val = chip.dataset.filterVal;
      EAP.state._spaceListFilter = EAP.state._spaceListFilter || {};
      EAP.state._spaceListFilter[key] = val || null;
      EAP.state._spaceListPage = 1; // reset to page 1 on filter change
      EAP.renderContent();
      EAP.wireSpaceListFilters();
    });
  });

  // Pagination buttons
  document.querySelectorAll('.space-list-pg').forEach(function(btn) {
    btn.addEventListener('click', function() {
      EAP.state._spaceListPage = parseInt(btn.dataset.page, 10);
      EAP.renderContent();
      EAP.wireSpaceListFilters();
    });
    btn.addEventListener('mouseenter', function() {
      if (!btn.classList.contains('active')) btn.style.background = 'rgba(0,0,0,0.05)';
    });
    btn.addEventListener('mouseleave', function() {
      if (parseInt(btn.dataset.page, 10) !== (EAP.state._spaceListPage || 1)) btn.style.background = 'transparent';
    });
  });

  // Row hover
  document.querySelectorAll('.space-list-row').forEach(function(row) {
    row.addEventListener('mouseenter', function() { row.style.background = '#FAFAF9'; });
    row.addEventListener('mouseleave', function() { row.style.background = ''; });
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
      document.querySelectorAll('.space-list-row').forEach(function(r) {
        r.style.borderTop = '';
      });
    });
    row.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      // Visual drop indicator
      document.querySelectorAll('.space-list-row').forEach(function(r) { r.style.borderTop = ''; });
      row.style.borderTop = '2px solid #4338CA';
    });
    row.addEventListener('dragleave', function() {
      row.style.borderTop = '';
    });
    row.addEventListener('drop', function(e) {
      e.preventDefault();
      row.style.borderTop = '';
      if (!EAP._dragSrcId || EAP._dragSrcId === row.dataset.rowId) return;

      var sp = EAP.state.spaceData;
      if (!sp || !sp.list) return;
      var allRows = sp.list.rows || [];

      // Get current order
      var order = EAP.state._spaceListOrder;
      if (!order || order.length !== allRows.length) {
        order = allRows.map(function(r) { return r.id; });
      }

      // Move dragged item before drop target
      var fromIdx = order.indexOf(EAP._dragSrcId);
      var toIdx   = order.indexOf(row.dataset.rowId);
      if (fromIdx === -1 || toIdx === -1) return;

      order.splice(fromIdx, 1);
      order.splice(toIdx, 0, EAP._dragSrcId);

      EAP.state._spaceListOrder = order;
      EAP.renderContent();
      EAP.wireSpaceListFilters();
    });
  });
};
