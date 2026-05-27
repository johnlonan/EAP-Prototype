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

  var severityConfig = {
    Critical: { bg: 'rgba(220,38,38,0.08)',   color: '#DC2626', border: 'rgba(220,38,38,0.20)'  },
    High:     { bg: 'rgba(220,38,38,0.06)',   color: '#B91C1C', border: 'rgba(220,38,38,0.16)'  },
    Medium:   { bg: 'rgba(217,119,6,0.08)',   color: '#D97706', border: 'rgba(217,119,6,0.20)'  },
    Low:      { bg: 'rgba(0,0,0,0.04)',       color: '#797874', border: 'rgba(0,0,0,0.10)'      }
  };

  var statusConfig = {
    'Open':        { bg: 'rgba(0,0,0,0.05)',         color: '#585753' },
    'In Progress': { bg: 'rgba(99,102,241,0.10)',     color: '#4338CA' },
    'In Review':   { bg: 'rgba(217,119,6,0.08)',     color: '#D97706' },
    'Done':        { bg: 'rgba(22,163,74,0.08)',      color: '#16A34A' }
  };

  var html =
    '<div style="' +
      'display:flex;flex-direction:column;height:100%;' +
      'background:#F1F0ED;' +
    '">' +

    // Space header
    '<div style="' +
      'padding:16px 20px 0;' +
      'display:flex;align-items:center;gap:10px;' +
    '">' +
      '<span style="font-size:13px;font-weight:600;color:#111111;">' + sp.name + '</span>' +
      '<span style="font-size:11px;color:#797874;">&mdash;</span>' +
      '<span style="font-size:12px;color:#797874;">' + rows.length + ' items</span>' +
      // Quick severity summary
      (function() {
        var open = rows.filter(function(r){ return r.status !== 'Done'; });
        var crit = open.filter(function(r){ return r.severity === 'Critical'; }).length;
        var high = open.filter(function(r){ return r.severity === 'High'; }).length;
        var summary = [];
        if (crit) summary.push('<span style="color:#DC2626;font-weight:600;">' + crit + ' critical</span>');
        if (high) summary.push('<span style="color:#B91C1C;">' + high + ' high</span>');
        return summary.length ? ' &middot; ' + summary.join(', ') + ' open' : '';
      })() +
    '</div>' +

    // Table
    '<div style="flex:1;overflow:auto;padding:12px 20px 20px;">' +
    '<div style="' +
      'background:#FFFFFF;' +
      'border-radius:12px;' +
      'box-shadow:0 1px 3px rgba(0,0,0,0.05);' +
      'overflow:hidden;' +
    '">' +

    // Table header
    '<div style="' +
      'display:grid;' +
      'grid-template-columns:1fr 84px 120px 90px 100px 72px;' +
      'padding:8px 16px;' +
      'background:#F8F7F4;' +
      'border-bottom:1px solid #E1E0DD;' +
    '">' +
      ['Bug', 'Severity', 'Component', 'Owner', 'Status', 'Logged'].map(function(h) {
        return '<span style="font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:#797874;font-weight:500;">' + h + '</span>';
      }).join('') +
    '</div>';

  // Table rows
  rows.forEach(function(row, i) {
    var sev = severityConfig[row.severity] || severityConfig.Low;
    var sta = statusConfig[row.status]    || statusConfig['Open'];
    var person = EAP.people && EAP.people[row.owner];
    var initials = person ? person.initials : row.owner.substring(0,2).toUpperCase();
    var color    = person ? person.color : '#6B7280';
    var isLast   = i === rows.length - 1;

    html +=
      '<div style="' +
        'display:grid;' +
        'grid-template-columns:1fr 84px 120px 90px 100px 72px;' +
        'padding:10px 16px;' +
        'align-items:center;' +
        (isLast ? '' : 'border-bottom:1px solid rgba(0,0,0,0.04);') +
        'transition:background 100ms ease;' +
        'cursor:default;' +
      '" ' +
      'onmouseenter="this.style.background=\'#F8F7F4\'" ' +
      'onmouseleave="this.style.background=\'\'">' +

      // Bug title
      '<span style="font-size:12px;color:#111111;line-height:1.4;padding-right:12px;">' + row.bug + '</span>' +

      // Severity pill
      '<span style="' +
        'font-size:10px;font-weight:600;' +
        'padding:2px 7px;border-radius:9px;' +
        'background:' + sev.bg + ';color:' + sev.color + ';' +
        'border:1px solid ' + sev.border + ';' +
        'display:inline-flex;align-items:center;width:fit-content;white-space:nowrap;' +
      '">' + row.severity + '</span>' +

      // Component tag
      '<span style="font-size:11px;color:#585753;">' + row.component + '</span>' +

      // Owner avatar + name
      '<div style="display:flex;align-items:center;gap:5px;">' +
        '<span style="' +
          'width:20px;height:20px;border-radius:50%;' +
          'background:' + color + ';color:#fff;' +
          'font-size:9px;font-weight:600;' +
          'display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;' +
        '">' + initials + '</span>' +
        '<span style="font-size:11px;color:#585753;">' + row.owner + '</span>' +
      '</div>' +

      // Status pill
      '<span style="' +
        'font-size:10px;font-weight:500;' +
        'padding:2px 7px;border-radius:9px;' +
        'background:' + sta.bg + ';color:' + sta.color + ';' +
        'display:inline-flex;align-items:center;width:fit-content;white-space:nowrap;' +
      '">' + row.status + '</span>' +

      // Date logged
      '<span style="font-size:11px;color:#797874;">' + row.logged + '</span>' +

      '</div>';
  });

  html += '</div></div></div>'; // end table card + table wrapper + outer
  return html;
};
