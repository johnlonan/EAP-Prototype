/* ═══════════════════════════════════════════════════════
   SPACE-LIST.JS — Table/list renderer for Space context
   Used by: Bug Register space (sp2)
   ═══════════════════════════════════════════════════════ */

var EAP = EAP || {};

EAP.renderSpaceList = function() {
  var s = EAP.state;
  var sp = s.spaceData;
  if (!sp || !sp.list) return '<div style="padding:40px;color:#9CA3AF;font-size:13px;">No list data.</div>';

  var list = sp.list;
  var rows = list.rows || [];

  // Apply any active list filter from state
  var filterSev    = s._spaceListFilter && s._spaceListFilter.severity;
  var filterStatus = s._spaceListFilter && s._spaceListFilter.status;
  var filtered = rows.filter(function(r) {
    if (filterSev    && r.severity !== filterSev)    return false;
    if (filterStatus && r.status   !== filterStatus) return false;
    return true;
  });

  var severityConfig = {
    Critical: { bg: 'rgba(220,38,38,0.08)',   color: '#DC2626', border: 'rgba(220,38,38,0.20)'  },
    High:     { bg: 'rgba(220,38,38,0.06)',   color: '#B91C1C', border: 'rgba(220,38,38,0.16)'  },
    Medium:   { bg: 'rgba(217,119,6,0.08)',   color: '#D97706', border: 'rgba(217,119,6,0.20)'  },
    Low:      { bg: 'rgba(0,0,0,0.04)',       color: '#797874', border: 'rgba(0,0,0,0.10)'      }
  };
  var statusConfig = {
    'Open':        { bg: 'rgba(0,0,0,0.05)',       color: '#585753' },
    'In Progress': { bg: 'rgba(99,102,241,0.10)',   color: '#4338CA' },
    'In Review':   { bg: 'rgba(217,119,6,0.08)',   color: '#D97706' },
    'Done':        { bg: 'rgba(22,163,74,0.08)',    color: '#16A34A' }
  };

  // Summary counts for the filter chips
  var openRows   = rows.filter(function(r){ return r.status !== 'Done'; });
  var critCount  = openRows.filter(function(r){ return r.severity === 'Critical'; }).length;
  var highCount  = openRows.filter(function(r){ return r.severity === 'High'; }).length;
  var openCount  = rows.filter(function(r){ return r.status === 'Open'; }).length;
  var inProgCount= rows.filter(function(r){ return r.status === 'In Progress' || r.status === 'In Review'; }).length;
  var doneCount  = rows.filter(function(r){ return r.status === 'Done'; }).length;

  function filterChip(label, key, value, count, isActive) {
    var base = 'display:inline-flex;align-items:center;gap:5px;' +
      'font-size:11px;padding:3px 10px;border-radius:9px;cursor:pointer;' +
      'transition:all 100ms ease;white-space:nowrap;';
    var style = isActive
      ? base + 'background:#383733;color:#fff;border:1px solid #383733;'
      : base + 'background:transparent;color:#585753;border:1px solid #CCCBC8;';
    return '<span class="space-list-chip" data-filter-key="' + key + '" data-filter-val="' + (isActive ? '' : value) + '" style="' + style + '">' +
      label +
      '<span style="font-size:10px;opacity:0.7;">' + count + '</span>' +
    '</span>';
  }

  var html =
    '<div style="display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden;">' +

    // Sub-header: grounding info + filter chips
    '<div style="' +
      'display:flex;align-items:center;gap:10px;flex-wrap:wrap;' +
      'padding:0 16px 10px;flex-shrink:0;' +
    '">' +
      '<span style="font-size:12px;font-weight:600;color:#111111;">' + sp.name + '</span>' +
      '<span style="font-size:11px;color:#CCCBC8;">|</span>' +
      '<span style="font-size:11px;color:#797874;">' + rows.length + ' bugs &middot; ' + openRows.length + ' open</span>' +
      (critCount ? '<span style="font-size:11px;font-weight:600;color:#DC2626;">' + critCount + ' critical</span>' : '') +
      (highCount ? '<span style="font-size:11px;color:#B91C1C;">' + highCount + ' high</span>' : '') +
      '<div style="flex:1;"></div>' +
      // Filter chips
      '<div style="display:flex;gap:6px;align-items:center;">' +
        '<span style="font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.05em;">Filter</span>' +
        filterChip('Open',        'status', 'Open',        openCount,   filterStatus === 'Open') +
        filterChip('In Progress', 'status', 'In Progress', inProgCount, filterStatus === 'In Progress') +
        filterChip('Done',        'status', 'Done',        doneCount,   filterStatus === 'Done') +
        filterChip('Critical',    'severity', 'Critical',  critCount,   filterSev === 'Critical') +
        filterChip('High',        'severity', 'High',      highCount,   filterSev === 'High') +
      '</div>' +
    '</div>' +

    // Table — fills remaining height
    '<div style="flex:1;min-height:0;overflow-y:auto;padding:0 16px 16px;">' +
    '<div style="' +
      'background:#FFFFFF;' +
      'border-radius:12px;' +
      'border:1px solid #E3E2DF;' +
      'overflow:hidden;' +
      'box-shadow:0 1px 3px rgba(0,0,0,0.05);' +
    '">' +

    // Table header
    '<div style="' +
      'display:grid;' +
      'grid-template-columns:1fr 84px 124px 96px 108px 72px;' +
      'padding:8px 16px;' +
      'background:#F8F7F4;' +
      'border-bottom:1px solid #E3E2DF;' +
      'position:sticky;top:0;z-index:1;' +
    '">' +
      ['Bug', 'Severity', 'Component', 'Owner', 'Status', 'Logged'].map(function(h) {
        return '<span style="font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:#797874;font-weight:500;">' + h + '</span>';
      }).join('') +
    '</div>';

  // Rows
  filtered.forEach(function(row, i) {
    var sev    = severityConfig[row.severity] || severityConfig.Low;
    var sta    = statusConfig[row.status]     || statusConfig['Open'];
    var person = EAP.people && EAP.people[row.owner];
    var initials = person ? person.initials : row.owner.substring(0, 2).toUpperCase();
    var avColor  = person ? person.color : '#6B7280';
    var isLast   = i === filtered.length - 1;

    html +=
      '<div style="' +
        'display:grid;' +
        'grid-template-columns:1fr 84px 124px 96px 108px 72px;' +
        'padding:11px 16px;align-items:center;' +
        (isLast ? '' : 'border-bottom:1px solid rgba(0,0,0,0.04);') +
        'transition:background 100ms ease;cursor:default;' +
      '" onmouseenter="this.style.background=\'#FAFAF9\'" onmouseleave="this.style.background=\'\'">' +

      '<span style="font-size:12px;color:#111111;line-height:1.4;padding-right:16px;">' + row.bug + '</span>' +

      '<span style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:9px;' +
        'background:' + sev.bg + ';color:' + sev.color + ';' +
        'border:1px solid ' + sev.border + ';' +
        'display:inline-flex;align-items:center;white-space:nowrap;width:fit-content;">' +
        row.severity + '</span>' +

      '<span style="font-size:11px;color:#585753;">' + row.component + '</span>' +

      '<div style="display:flex;align-items:center;gap:5px;">' +
        '<span style="width:20px;height:20px;border-radius:50%;background:' + avColor + ';color:#fff;' +
          'font-size:9px;font-weight:600;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">' +
          initials + '</span>' +
        '<span style="font-size:11px;color:#585753;">' + row.owner + '</span>' +
      '</div>' +

      '<span style="font-size:10px;font-weight:500;padding:2px 7px;border-radius:9px;' +
        'background:' + sta.bg + ';color:' + sta.color + ';' +
        'display:inline-flex;align-items:center;white-space:nowrap;width:fit-content;">' +
        row.status + '</span>' +

      '<span style="font-size:11px;color:#797874;">' + row.logged + '</span>' +

      '</div>';
  });

  if (filtered.length === 0) {
    html += '<div style="padding:40px;text-align:center;color:#9CA3AF;font-size:12px;">No bugs match the current filter.</div>';
  }

  html += '</div></div></div>';
  return html;
};

// Wire filter chip clicks — called post-render
EAP.wireSpaceListFilters = function() {
  document.querySelectorAll('.space-list-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      var key = chip.dataset.filterKey;
      var val = chip.dataset.filterVal;
      EAP.state._spaceListFilter = EAP.state._spaceListFilter || {};
      EAP.state._spaceListFilter[key] = val || null;
      EAP.renderContent();
      EAP.wireSpaceListFilters();
    });
  });
};
