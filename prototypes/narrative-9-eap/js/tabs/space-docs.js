/* ═══════════════════════════════════════════════════════
   SPACE-DOCS.JS — Rich document renderer for Space context
   Used by: Meeting Notes (sp3), Payment Runbooks (sp4)
   ═══════════════════════════════════════════════════════ */

var EAP = EAP || {};

// ── Section renderers ──────────────────────────────────

function _sdCallout(sec) {
  var variants = {
    info:    { bg: 'rgba(99,102,241,0.07)',  border: 'rgba(99,102,241,0.22)',  icon: 'ℹ', iconBg: 'rgba(99,102,241,0.15)', iconColor: '#4338CA' },
    warning: { bg: 'rgba(217,119,6,0.08)',   border: 'rgba(217,119,6,0.25)',   icon: '⚠', iconBg: 'rgba(217,119,6,0.15)',  iconColor: '#B45309' },
    success: { bg: 'rgba(22,163,74,0.07)',   border: 'rgba(22,163,74,0.22)',   icon: '✓', iconBg: 'rgba(22,163,74,0.15)',  iconColor: '#15803D' },
    error:   { bg: 'rgba(220,38,38,0.07)',   border: 'rgba(220,38,38,0.22)',   icon: '!', iconBg: 'rgba(220,38,38,0.15)',  iconColor: '#B91C1C' }
  };
  var v = variants[sec.variant] || variants.info;
  return (
    '<div style="' +
      'background:' + v.bg + ';' +
      'border-radius:8px;' +
      'border:1px solid ' + v.border + ';' +
      'padding:14px 16px;' +
      'margin:0 0 20px;' +
      'display:flex;gap:12px;align-items:flex-start;' +
    '">' +
      '<span style="' +
        'width:22px;height:22px;border-radius:50%;' +
        'background:' + v.iconBg + ';color:' + v.iconColor + ';' +
        'font-size:11px;font-weight:700;flex-shrink:0;margin-top:1px;' +
        'display:inline-flex;align-items:center;justify-content:center;' +
      '">' + v.icon + '</span>' +
      '<div style="min-width:0;">' +
        (sec.title
          ? '<div style="font-size:12px;font-weight:600;color:' + v.iconColor + ';margin-bottom:4px;">' + sec.title + '</div>'
          : '') +
        '<div style="font-size:13px;color:#374151;line-height:1.6;">' + sec.text + '</div>' +
      '</div>' +
    '</div>'
  );
}

function _sdH2(text) {
  return '<h2 style="font-size:16px;font-weight:600;color:#111111;margin:28px 0 10px;line-height:1.3;">' + text + '</h2>';
}

function _sdH3(text) {
  return '<h3 style="font-size:13px;font-weight:600;color:#111111;margin:20px 0 8px;line-height:1.3;">' + text + '</h3>';
}

function _sdP(text) {
  return '<p style="font-size:13px;color:#374151;line-height:1.7;margin:0 0 16px;">' + text + '</p>';
}

function _sdUl(items) {
  return (
    '<ul style="margin:0 0 20px;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;">' +
      items.map(function(item) {
        return (
          '<li style="display:flex;gap:10px;align-items:baseline;">' +
            '<span style="color:#CCCBC8;font-size:10px;flex-shrink:0;margin-top:3px;">•</span>' +
            '<span style="font-size:13px;color:#374151;line-height:1.6;">' + item + '</span>' +
          '</li>'
        );
      }).join('') +
    '</ul>'
  );
}

function _sdOl(items) {
  return (
    '<ol style="margin:0 0 20px;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;">' +
      items.map(function(item, i) {
        return (
          '<li style="display:flex;gap:10px;align-items:baseline;">' +
            '<span style="' +
              'font-size:11px;font-weight:600;color:#9CA3AF;' +
              'flex-shrink:0;width:18px;text-align:right;margin-top:1px;' +
            '">' + (i + 1) + '.</span>' +
            '<span style="font-size:13px;color:#374151;line-height:1.6;">' + item + '</span>' +
          '</li>'
        );
      }).join('') +
    '</ol>'
  );
}

function _sdDivider() {
  return '<hr style="border:none;border-top:1px solid #E8E7E4;margin:24px 0;">';
}

function _sdActions(items) {
  var statusStyles = {
    open:        { bg: 'rgba(0,0,0,0.06)', color: '#585753', label: 'Open' },
    'in-progress': { bg: 'rgba(217,119,6,0.10)', color: '#B45309', label: 'In progress' },
    done:        { bg: 'rgba(22,163,74,0.10)', color: '#15803D', label: 'Done' }
  };

  return (
    '<div style="' +
      'border:1px solid #E8E7E4;' +
      'border-radius:10px;' +
      'overflow:hidden;' +
      'margin:0 0 20px;' +
    '">' +
      items.map(function(item, i) {
        var st = statusStyles[item.status] || statusStyles.open;
        var isDone = item.status === 'done';
        var person = EAP.people && EAP.people[item.owner];
        var initials = person ? person.initials : (item.owner || '?').substring(0, 2).toUpperCase();
        var avColor  = person ? person.color : '#6B7280';
        return (
          '<div style="' +
            'display:flex;align-items:center;gap:12px;' +
            'padding:10px 14px;' +
            (i < items.length - 1 ? 'border-bottom:1px solid #F1F0ED;' : '') +
            'background:' + (isDone ? '#F8F7F4' : '#FFFFFF') + ';' +
          '">' +
            // Checkbox
            '<span style="' +
              'width:16px;height:16px;border-radius:4px;flex-shrink:0;' +
              'border:' + (isDone ? 'none' : '1.5px solid #CCCBC8') + ';' +
              'background:' + (isDone ? '#16A34A' : 'transparent') + ';' +
              'display:inline-flex;align-items:center;justify-content:center;' +
            '">' +
              (isDone ? '<svg width="9" height="9" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '') +
            '</span>' +
            // Text
            '<span style="' +
              'flex:1;font-size:13px;line-height:1.4;' +
              'color:' + (isDone ? '#9CA3AF' : '#111111') + ';' +
              (isDone ? 'text-decoration:line-through;text-decoration-color:#CCCBC8;' : '') +
            '">' + item.text + '</span>' +
            // Owner avatar
            '<span style="' +
              'width:20px;height:20px;border-radius:50%;' +
              'background:' + avColor + ';color:#fff;' +
              'font-size:8px;font-weight:600;flex-shrink:0;' +
              'display:inline-flex;align-items:center;justify-content:center;' +
              'title="' + (person ? person.name : item.owner) + '"' +
            '">' + initials + '</span>' +
            // Due
            (item.due
              ? '<span style="font-size:11px;color:#9CA3AF;white-space:nowrap;flex-shrink:0;">' + item.due + '</span>'
              : '') +
            // Status chip
            '<span style="' +
              'font-size:10px;font-weight:500;' +
              'padding:2px 8px;border-radius:99px;flex-shrink:0;' +
              'background:' + st.bg + ';color:' + st.color + ';' +
              'white-space:nowrap;' +
            '">' + st.label + '</span>' +
          '</div>'
        );
      }).join('') +
    '</div>'
  );
}

function _sdComparison(rows) {
  return (
    '<div style="border:1px solid #E8E7E4;border-radius:10px;overflow:hidden;margin:0 0 20px;">' +
      // Header
      '<div style="' +
        'display:grid;grid-template-columns:1.4fr 2fr 2fr 90px;' +
        'padding:8px 14px;' +
        'background:#F8F7F4;' +
        'border-bottom:1px solid #E8E7E4;' +
        'gap:12px;' +
      '">' +
        ['Option', 'Pros', 'Cons', 'Verdict'].map(function(h) {
          return '<span style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#797874;">' + h + '</span>';
        }).join('') +
      '</div>' +
      rows.map(function(row, i) {
        var isChosen = row.verdict === 'chosen';
        var bg = isChosen ? 'rgba(22,163,74,0.04)' : (i % 2 === 0 ? '#FFFFFF' : '#F8F7F4');
        return (
          '<div style="' +
            'display:grid;grid-template-columns:1.4fr 2fr 2fr 90px;' +
            'padding:11px 14px;gap:12px;' +
            (i < rows.length - 1 ? 'border-bottom:1px solid #F1F0ED;' : '') +
            'background:' + bg + ';' +
            'align-items:start;' +
          '">' +
            '<span style="font-size:12px;font-weight:' + (isChosen ? '600' : '400') + ';color:#111111;line-height:1.4;">' + row.option + '</span>' +
            '<span style="font-size:12px;color:#374151;line-height:1.5;">' + row.pros + '</span>' +
            '<span style="font-size:12px;color:#374151;line-height:1.5;">' + row.cons + '</span>' +
            '<span style="' +
              'font-size:10px;font-weight:600;padding:3px 8px;border-radius:99px;' +
              'background:' + (isChosen ? 'rgba(22,163,74,0.12)' : 'rgba(0,0,0,0.06)') + ';' +
              'color:' + (isChosen ? '#15803D' : '#797874') + ';' +
              'white-space:nowrap;text-transform:capitalize;' +
            '">' + (isChosen ? '✓ Chosen' : '✗ ' + row.verdict.charAt(0).toUpperCase() + row.verdict.slice(1)) + '</span>' +
          '</div>'
        );
      }).join('') +
    '</div>'
  );
}

function _sdStories(items) {
  var statusStyle = {
    ready:       { bg: 'rgba(22,163,74,0.10)',  color: '#15803D', label: 'Ready' },
    'carry-over':{ bg: 'rgba(217,119,6,0.10)',  color: '#B45309', label: 'Carry-over' },
    blocked:     { bg: 'rgba(220,38,38,0.10)',  color: '#B91C1C', label: 'Blocked' }
  };
  return (
    '<div style="border:1px solid #E8E7E4;border-radius:10px;overflow:hidden;margin:0 0 20px;">' +
      '<div style="' +
        'display:grid;grid-template-columns:70px 1fr 44px 80px 80px;' +
        'padding:8px 14px;background:#F8F7F4;border-bottom:1px solid #E8E7E4;gap:10px;' +
      '">' +
        ['ID', 'Story', 'Pts', 'Owner', 'Status'].map(function(h) {
          return '<span style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#797874;">' + h + '</span>';
        }).join('') +
      '</div>' +
      items.map(function(item, i) {
        var st = statusStyle[item.status] || statusStyle.ready;
        var person = EAP.people && EAP.people[item.owner];
        var initials = person ? person.initials : (item.owner || '?').substring(0, 2).toUpperCase();
        var avColor  = person ? person.color : '#6B7280';
        return (
          '<div style="' +
            'display:grid;grid-template-columns:70px 1fr 44px 80px 80px;' +
            'padding:9px 14px;gap:10px;align-items:center;' +
            (i < items.length - 1 ? 'border-bottom:1px solid #F1F0ED;' : '') +
            (i % 2 !== 0 ? 'background:#F8F7F4;' : 'background:#FFFFFF;') +
          '">' +
            '<span style="font-size:11px;font-weight:500;color:#9CA3AF;font-variant-numeric:tabular-nums;">' + item.id + '</span>' +
            '<span style="font-size:13px;color:#111111;line-height:1.4;">' + item.title + '</span>' +
            '<span style="font-size:13px;font-weight:600;color:#374151;font-variant-numeric:tabular-nums;">' + item.pts + '</span>' +
            '<div style="display:flex;align-items:center;gap:5px;">' +
              '<span style="width:18px;height:18px;border-radius:50%;background:' + avColor + ';color:#fff;' +
                'font-size:7px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;">' +
                initials + '</span>' +
              '<span style="font-size:11px;color:#585753;">' + (person ? person.name.split(' ')[0] : item.owner) + '</span>' +
            '</div>' +
            '<span style="font-size:10px;font-weight:500;padding:2px 7px;border-radius:99px;' +
              'background:' + st.bg + ';color:' + st.color + ';white-space:nowrap;">' + st.label + '</span>' +
          '</div>'
        );
      }).join('') +
    '</div>'
  );
}

function _sdStats(items) {
  return (
    '<div style="display:grid;grid-template-columns:repeat(' + items.length + ',1fr);gap:10px;margin:0 0 20px;">' +
      items.map(function(item) {
        return (
          '<div style="' +
            'background:#F8F7F4;border-radius:8px;padding:14px 16px;' +
            'border:1px solid #E8E7E4;' +
          '">' +
            '<div style="font-size:22px;font-weight:700;color:#111111;font-variant-numeric:tabular-nums;margin-bottom:3px;">' + item.value + '</div>' +
            '<div style="font-size:11px;color:#797874;font-weight:500;">' + item.label + '</div>' +
          '</div>'
        );
      }).join('') +
    '</div>'
  );
}

function _sdRetro(columns) {
  var variantStyles = {
    success: { bg: 'rgba(22,163,74,0.07)', border: '#16A34A', color: '#15803D' },
    warning: { bg: 'rgba(217,119,6,0.07)', border: '#D97706', color: '#B45309' },
    indigo:  { bg: 'rgba(99,102,241,0.07)', border: '#6366F1', color: '#4338CA' }
  };
  return (
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 24px;">' +
      columns.map(function(col) {
        var vs = variantStyles[col.variant] || variantStyles.indigo;
        return (
          '<div style="' +
            'background:' + vs.bg + ';' +
            'border-radius:10px;' +
            'border:1px solid rgba(0,0,0,0.06);' +
            'overflow:hidden;' +
          '">' +
            '<div style="' +
              'padding:10px 14px;' +
              'border-bottom:1px solid rgba(0,0,0,0.06);' +
              'font-size:12px;font-weight:600;color:' + vs.color + ';' +
            '">' + col.label + '</div>' +
            '<div style="padding:10px;display:flex;flex-direction:column;gap:6px;">' +
              col.items.map(function(item) {
                return (
                  '<div style="' +
                    'background:#FFFFFF;' +
                    'border-radius:6px;' +
                    'padding:9px 11px;' +
                    'font-size:12px;color:#374151;line-height:1.5;' +
                    'box-shadow:0 1px 2px rgba(0,0,0,0.04);' +
                  '">' + item + '</div>'
                );
              }).join('') +
            '</div>' +
          '</div>'
        );
      }).join('') +
    '</div>'
  );
}

function _sdSection(sec) {
  switch (sec.type) {
    case 'callout':    return _sdCallout(sec);
    case 'h2':         return _sdH2(sec.text);
    case 'h3':         return _sdH3(sec.text);
    case 'p':          return _sdP(sec.text);
    case 'ul':         return _sdUl(sec.items);
    case 'ol':         return _sdOl(sec.items);
    case 'actions':    return _sdActions(sec.items);
    case 'divider':    return _sdDivider();
    case 'comparison': return _sdComparison(sec.rows);
    case 'stories':    return _sdStories(sec.items);
    case 'stats':      return _sdStats(sec.items);
    case 'retro':      return _sdRetro(sec.columns);
    default:           return '';
  }
}

// ── Doc type icons ─────────────────────────────────────

function _sdDocIcon(type) {
  var icons = {
    meeting:      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    architecture: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
    planning:     '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    retro:        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>',
    runbook:      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'
  };
  return icons[type] || icons.meeting;
}

// ── Toolbar ────────────────────────────────────────────

function _sdToolbar() {
  function tbtn(label, tooltip, active) {
    return (
      '<button class="sd-tb-btn" title="' + (tooltip || label) + '" style="' +
        'height:28px;min-width:28px;padding:0 7px;' +
        'border:none;border-radius:5px;cursor:pointer;' +
        'background:' + (active ? '#343331' : 'transparent') + ';' +
        'color:' + (active ? '#fff' : '#585753') + ';' +
        'font-size:12px;font-weight:500;font-family:inherit;' +
        'display:inline-flex;align-items:center;justify-content:center;gap:4px;' +
        'transition:background 80ms ease,color 80ms ease;flex-shrink:0;' +
      '">' + label + '</button>'
    );
  }
  function sep() {
    return '<span style="width:1px;height:18px;background:#E3E2DF;flex-shrink:0;margin:0 3px;"></span>';
  }

  return (
    '<div style="' +
      'display:flex;align-items:center;gap:2px;flex-wrap:nowrap;' +
      'padding:6px 16px;' +
      'border-bottom:1px solid #E3E2DF;' +
      'background:#F8F7F4;' +
      'flex-shrink:0;overflow-x:auto;' +
    '">' +
      // Block type selector
      '<button class="sd-tb-btn" style="' +
        'height:28px;padding:0 10px;border:1px solid #CCCBC8;border-radius:5px;' +
        'background:#FFFFFF;color:#374151;font-size:12px;font-weight:500;font-family:inherit;' +
        'display:inline-flex;align-items:center;gap:5px;cursor:pointer;flex-shrink:0;' +
      '">Normal' +
        '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:.5;"><polyline points="6 9 12 15 18 9"/></svg>' +
      '</button>' +
      sep() +
      // Text formatting
      tbtn('<strong>B</strong>', 'Bold') +
      tbtn('<em>I</em>', 'Italic') +
      tbtn('<span style="text-decoration:underline">U</span>', 'Underline') +
      tbtn('<span style="text-decoration:line-through">S</span>', 'Strikethrough') +
      tbtn('<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>', 'Inline code') +
      sep() +
      // Headings
      tbtn('H1', 'Heading 1') +
      tbtn('H2', 'Heading 2') +
      tbtn('H3', 'Heading 3') +
      sep() +
      // Lists
      tbtn('<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>', 'Bullet list') +
      tbtn('<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4" stroke-linecap="round"/><path d="M4 10h2" stroke-linecap="round"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1.5" stroke-linecap="round"/></svg>', 'Numbered list') +
      tbtn('<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="6" height="6" rx="1"/><line x1="12" y1="8" x2="21" y2="8"/><line x1="12" y1="16" x2="21" y2="16"/><rect x="3" y="13" width="6" height="6" rx="1"/></svg>', 'Task list') +
      sep() +
      // Blocks
      tbtn('<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/></svg>', 'Blockquote') +
      tbtn('<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>', 'Code block') +
      sep() +
      // Insert
      tbtn('<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>', 'Table') +
      tbtn('<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>', 'Divider') +
      tbtn('<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>', 'Link') +
      sep() +
      // AI
      '<button class="sd-tb-btn" style="' +
        'height:28px;padding:0 10px;border-radius:5px;' +
        'background:rgba(22,163,74,0.10);color:#15803D;' +
        'border:1px solid rgba(22,163,74,0.20);' +
        'font-size:11px;font-weight:600;font-family:inherit;' +
        'display:inline-flex;align-items:center;gap:5px;cursor:pointer;flex-shrink:0;' +
      '">✦ AI Summarize</button>' +
    '</div>'
  );
}

// ── Main renderer ──────────────────────────────────────

EAP.renderSpaceDocs = function() {
  var s = EAP.state;
  var sp = s.spaceData;
  if (!sp || !sp.docs) return '<div style="padding:40px;color:#9CA3AF;font-size:13px;">No documents.</div>';

  var docs = sp.docs;

  // Auto-select first doc if nothing is open
  if (!s._openDocId && docs.length) s._openDocId = docs[0].id;

  var openDoc = s._openDocId ? docs.filter(function(d) { return d.id === s._openDocId; })[0] : null;

  var html =
    '<div style="display:flex;flex:1;min-height:0;overflow:hidden;gap:0;">';

  // ── Left sidebar ──────────────────────────────────────
  html +=
    '<div style="' +
      'width:240px;flex-shrink:0;' +
      'display:flex;flex-direction:column;' +
      'background:#FFFFFF;' +
      'border-radius:12px;' +
      'border:1px solid #E3E2DF;' +
      'overflow:hidden;' +
      'margin-right:10px;' +
      'box-shadow:0 1px 3px rgba(0,0,0,0.05);' +
    '">' +

    // Sidebar header
    '<div style="padding:13px 14px 11px;border-bottom:1px solid #F1F0ED;flex-shrink:0;">' +
      '<div style="font-size:13px;font-weight:600;color:#111111;">' + sp.name + '</div>' +
      '<div style="font-size:11px;color:#797874;margin-top:2px;">' + docs.length + ' document' + (docs.length !== 1 ? 's' : '') + '</div>' +
    '</div>' +

    // Doc list
    '<div style="flex:1;overflow-y:auto;">';

  docs.forEach(function(doc) {
    var isOpen = s._openDocId === doc.id;
    var person = EAP.people && EAP.people[doc.author];
    var initials = person ? person.initials : (doc.author || '?').substring(0, 2).toUpperCase();
    var avColor  = person ? person.color : '#6B7280';

    html +=
      '<div class="space-doc-item" data-doc-id="' + doc.id + '" style="' +
        'padding:10px 14px;' +
        'border-bottom:1px solid rgba(0,0,0,0.04);' +
        'cursor:pointer;transition:background 80ms ease;' +
        (isOpen ? 'background:rgba(99,102,241,0.07);' : '') +
      '">' +
        // Icon + title row
        '<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;">' +
          '<span style="color:' + (isOpen ? '#4338CA' : '#BBBBB7') + ';margin-top:1px;flex-shrink:0;transition:color 80ms ease;">' +
            _sdDocIcon(doc.type) +
          '</span>' +
          '<span style="' +
            'font-size:12px;font-weight:' + (isOpen ? '500' : '400') + ';' +
            'color:' + (isOpen ? '#2D2A6E' : '#374151') + ';' +
            'line-height:1.4;' +
          '">' + doc.title + '</span>' +
        '</div>' +
        // Meta row
        '<div style="display:flex;align-items:center;gap:6px;padding-left:21px;">' +
          '<span style="width:14px;height:14px;border-radius:50%;background:' + avColor + ';color:#fff;' +
            'font-size:6px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;">' +
            initials + '</span>' +
          '<span style="font-size:10px;color:#9CA3AF;">' + doc.date + '</span>' +
        '</div>' +
      '</div>';
  });

  html += '</div></div>'; // end left sidebar

  // ── Right panel ───────────────────────────────────────
  html +=
    '<div style="' +
      'flex:1;min-width:0;min-height:0;' +
      'display:flex;flex-direction:column;' +
      'background:#FFFFFF;' +
      'border-radius:12px;' +
      'border:1px solid #E3E2DF;' +
      'overflow:hidden;' +
      'box-shadow:0 1px 3px rgba(0,0,0,0.05);' +
    '">';

  if (!openDoc) {
    html +=
      '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;' +
        'flex:1;gap:10px;color:#9CA3AF;">' +
        '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:#CCCBC8;">' +
          '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
          '<polyline points="14 2 14 8 20 8"/>' +
          '<line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' +
        '</svg>' +
        '<span style="font-size:12px;">Select a document to view</span>' +
      '</div>';
  } else {
    // Toolbar (sticky, outside scroll area)
    html += _sdToolbar();

    // Scrollable content
    html += '<div style="flex:1;overflow-y:auto;">';

    // Document content — max-width centred column
    html +=
      '<div style="max-width:720px;margin:0 auto;padding:36px 48px 48px;">';

    // ── Title ─────────────────────────────────────────
    html +=
      '<h1 style="' +
        'font-size:26px;font-weight:700;color:#111111;' +
        'margin:0 0 20px;line-height:1.25;' +
        'letter-spacing:-0.3px;' +
      '">' + openDoc.title + '</h1>';

    // ── Properties panel ──────────────────────────────
    var person = EAP.people && EAP.people[openDoc.author];
    var aName  = person ? person.name : openDoc.author;
    var aColor = person ? person.color : '#6B7280';
    var aInit  = person ? person.initials : (openDoc.author || '?').substring(0, 2).toUpperCase();

    var attendeeNames = (openDoc.attendees || []).map(function(k) {
      var p = EAP.people && EAP.people[k];
      return p ? p.name : k;
    });
    if (openDoc.external) attendeeNames.push(openDoc.external);

    // Doc type label
    var typeLabels = { meeting: 'Meeting notes', architecture: 'Architecture review', planning: 'Sprint planning', retro: 'Retrospective', runbook: 'Runbook' };
    var typeLabel = typeLabels[openDoc.type] || 'Document';

    html +=
      '<div style="' +
        'display:grid;grid-template-columns:1fr 1fr;gap:0;' +
        'margin-bottom:32px;padding-bottom:24px;' +
        'border-bottom:1px solid #F1F0ED;' +
      '">' +
        _sdProp('Author',
          '<div style="display:flex;align-items:center;gap:7px;">' +
            '<span style="width:20px;height:20px;border-radius:50%;background:' + aColor + ';color:#fff;' +
              'font-size:8px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;">' + aInit + '</span>' +
            '<span style="font-size:13px;color:#111111;font-weight:500;">' + aName + '</span>' +
          '</div>') +
        _sdProp('Type',
          '<span style="font-size:12px;color:#374151;">' + typeLabel + '</span>') +
        _sdProp('Date',
          '<span style="font-size:13px;color:#111111;">' + openDoc.date + '</span>') +
        (attendeeNames.length
          ? _sdProp('Attendees',
              '<div style="display:flex;align-items:center;gap:-4px;">' +
                (openDoc.attendees || []).map(function(k) {
                  var p = EAP.people && EAP.people[k];
                  var init = p ? p.initials : k.substring(0, 2).toUpperCase();
                  var col  = p ? p.color : '#6B7280';
                  return '<span title="' + (p ? p.name : k) + '" style="' +
                    'width:22px;height:22px;border-radius:50%;' +
                    'background:' + col + ';color:#fff;' +
                    'font-size:8px;font-weight:700;' +
                    'display:inline-flex;align-items:center;justify-content:center;' +
                    'border:2px solid #fff;margin-left:-4px;' +
                  '">' + init + '</span>';
                }).join('') +
                (openDoc.external
                  ? '<span style="font-size:11px;color:#797874;margin-left:8px;">+ ' + openDoc.external + '</span>'
                  : '') +
              '</div>')
          : '') +
      '</div>';

    // ── Body sections ─────────────────────────────────
    if (openDoc.sections && openDoc.sections.length) {
      html += openDoc.sections.map(_sdSection).join('');
    }

    html += '</div>'; // end content col
    html += '</div>'; // end scroll area
  }

  html += '</div>'; // end right panel
  html += '</div>'; // end outer row

  return html;
};

function _sdProp(label, valueHtml) {
  return (
    '<div style="padding:8px 0;display:flex;align-items:flex-start;gap:12px;">' +
      '<span style="width:80px;font-size:11px;font-weight:500;color:#9CA3AF;flex-shrink:0;padding-top:2px;">' + label + '</span>' +
      '<div style="flex:1;min-width:0;">' + valueHtml + '</div>' +
    '</div>'
  );
}

// ── Toolbar button hover ───────────────────────────────
EAP.wireSpaceDocToolbar = function() {
  document.querySelectorAll('.sd-tb-btn').forEach(function(btn) {
    btn.addEventListener('mouseenter', function() {
      if (!btn.dataset.active) btn.style.background = '#F1F0ED';
    });
    btn.addEventListener('mouseleave', function() {
      if (!btn.dataset.active) btn.style.background = 'transparent';
    });
    btn.addEventListener('click', function() {
      // Visual toggle for demo
      var wasActive = btn.dataset.active === '1';
      btn.dataset.active = wasActive ? '' : '1';
      btn.style.background = wasActive ? 'transparent' : '#343331';
      btn.style.color = wasActive ? '#585753' : '#fff';
    });
  });
};

// ── Wire doc list item clicks ──────────────────────────
EAP.wireSpaceDocClicks = function() {
  document.querySelectorAll('.space-doc-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var docId = item.dataset.docId;
      EAP.state._openDocId = (EAP.state._openDocId === docId) ? null : docId;
      EAP.renderContent();
      if (EAP.wireSpaceDocClicks) EAP.wireSpaceDocClicks();
      if (EAP.wireSpaceDocToolbar) EAP.wireSpaceDocToolbar();
    });
    item.addEventListener('mouseenter', function() {
      if (EAP.state._openDocId !== item.dataset.docId) item.style.background = '#F8F7F4';
    });
    item.addEventListener('mouseleave', function() {
      if (EAP.state._openDocId !== item.dataset.docId) item.style.background = '';
    });
  });
  if (EAP.wireSpaceDocToolbar) EAP.wireSpaceDocToolbar();
};
