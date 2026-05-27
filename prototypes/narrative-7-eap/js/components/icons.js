/* ═══════════════════════════════════════════════════════
   ICONS.JS — Lucide icon subset (stroke-width: 1.5, 24x24 viewBox)
   Usage: EAP.icon('name', size) → returns SVG string
   All icons: outlined style, currentColor, consistent weight
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

EAP._icons = {
  'grip':      '<circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/>',
  'plus':      '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  'x':         '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  'search':    '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  'filter':    '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  'columns':   '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/>',
  'info':      '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12.01" y2="16"/><line x1="12" y1="8" x2="12" y2="12"/>',
  'chevron-down': '<polyline points="6 9 12 15 18 9"/>',
  'minus':     '<line x1="5" y1="12" x2="19" y2="12"/>',
  'expand':    '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>',
  'collapse':  '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>',
  // Level/type icons
  'goal':       '<circle cx="12" cy="12" r="10"/><path d="M16 8l-4 4-4-4"/><path d="M16 12l-4 4-4-4"/>',
  'epic':       '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M3 9h6"/>',
  'capability': '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
  'feature':    '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>',
  'story':      '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
  'defect':     '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  // Toggle checkbox
  'check-square': '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  'square':       '<rect x="3" y="3" width="18" height="18" rx="2"/>',
  // Board toggles
  'link':         '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  'git-merge':    '<circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/>',
  'layout-list':  '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  'rows':         '<rect x="3" y="3" width="18" height="4" rx="1"/><rect x="3" y="11" width="18" height="4" rx="1"/><rect x="3" y="19" width="18" height="2" rx="1"/>',
  'users':        '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  'user':         '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  'gauge':        '<path d="M12 20V10"/><path d="m4.93 17.07 2.83-2.83"/><path d="m19.07 17.07-2.83-2.83"/><circle cx="12" cy="20" r="2"/>',
  'kanban':       '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  'bar-chart':    '<path d="M3 3v18"/><path d="M3 8h13"/><path d="M3 13h18"/><path d="M3 18h9"/>',
  'calendar':     '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  'clipboard-check': '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m9 14 2 2 4-4"/>',
  'alert-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  'incident':     '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  'layers':       '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  'problem':      '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  // Milestone icons (outline)
  'rocket':       '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  'monitor':      '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  'compass':      '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  'lock':         '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  // AI + UI icons
  // Otto (ServiceNow Sparkmoji) — official brand path (Otto Dark Teal.svg).
  // Native 118x118 viewBox; wrapped in scale(0.20339) so it fits the icon
  // renderer's 24x24 viewBox without altering the path coordinates.
  'sparkle':      '<g transform="scale(0.20339)"><path fill="currentColor" stroke="none" d="M45.3968 11.6083C43.954 19.7583 40.0994 27.5449 33.8223 33.8221C27.544 40.1002 19.7575 43.9546 11.6084 45.3967C5.01277 46.5637 0.0151754 52.126 0.000405914 58.824C0.000405914 58.9106 -0.000507393 58.9982 0.000405914 59.0858C0.0151754 65.7838 5.01277 71.346 11.6084 72.513C19.7584 73.956 27.5449 77.8104 33.8223 84.0877C40.1003 90.3657 43.9548 98.1523 45.3968 106.301C46.5638 112.897 52.1271 117.894 58.8241 117.909C58.9107 117.909 58.9985 117.91 59.0861 117.909C65.784 117.894 71.3462 112.897 72.5133 106.301C73.9562 98.1514 77.8107 90.3648 84.088 84.0877C90.3661 77.8095 98.1517 73.956 106.302 72.513C112.897 71.346 117.894 65.7829 117.91 59.0858C117.91 58.9991 117.91 58.9106 117.91 58.824C117.895 52.126 112.897 46.5637 106.302 45.3967C98.1517 43.9537 90.3652 40.0992 84.088 33.8221C77.8107 27.5449 73.9562 19.7583 72.5133 11.6083C71.3462 5.01277 65.784 0.0151682 59.0861 0.000411711C58.9994 0.000411711 58.9116 -0.000514639 58.8241 0.000411711C52.1262 0.0151682 46.5638 5.01277 45.3968 11.6083ZM78.8897 39.0204C89.8996 50.0301 89.8996 67.8797 78.8897 78.8894C67.88 89.8992 50.0303 89.8992 39.0205 78.8894C28.0106 67.8797 28.0106 50.0301 39.0205 39.0204C50.0303 28.0106 67.88 28.0106 78.8897 39.0204Z"/></g>',
  'otto':         '<g transform="scale(0.20339)"><path fill="currentColor" stroke="none" d="M45.3968 11.6083C43.954 19.7583 40.0994 27.5449 33.8223 33.8221C27.544 40.1002 19.7575 43.9546 11.6084 45.3967C5.01277 46.5637 0.0151754 52.126 0.000405914 58.824C0.000405914 58.9106 -0.000507393 58.9982 0.000405914 59.0858C0.0151754 65.7838 5.01277 71.346 11.6084 72.513C19.7584 73.956 27.5449 77.8104 33.8223 84.0877C40.1003 90.3657 43.9548 98.1523 45.3968 106.301C46.5638 112.897 52.1271 117.894 58.8241 117.909C58.9107 117.909 58.9985 117.91 59.0861 117.909C65.784 117.894 71.3462 112.897 72.5133 106.301C73.9562 98.1514 77.8107 90.3648 84.088 84.0877C90.3661 77.8095 98.1517 73.956 106.302 72.513C112.897 71.346 117.894 65.7829 117.91 59.0858C117.91 58.9991 117.91 58.9106 117.91 58.824C117.895 52.126 112.897 46.5637 106.302 45.3967C98.1517 43.9537 90.3652 40.0992 84.088 33.8221C77.8107 27.5449 73.9562 19.7583 72.5133 11.6083C71.3462 5.01277 65.784 0.0151682 59.0861 0.000411711C58.9994 0.000411711 58.9116 -0.000514639 58.8241 0.000411711C52.1262 0.0151682 46.5638 5.01277 45.3968 11.6083ZM78.8897 39.0204C89.8996 50.0301 89.8996 67.8797 78.8897 78.8894C67.88 89.8992 50.0303 89.8992 39.0205 78.8894C28.0106 67.8797 28.0106 50.0301 39.0205 39.0204C50.0303 28.0106 67.88 28.0106 78.8897 39.0204Z"/></g>',
  'chevron-right':'<polyline points="9 18 15 12 9 6"/>',
  'chevron-up':   '<polyline points="18 15 12 9 6 15"/>',
  'clock':        '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'trending-up':  '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  'trending-down':'<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>',
  'alert-triangle':'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  'zap':          '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  'thumbs-up':    '<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>',
  'thumbs-down':  '<path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>',
  'diamond':      '<polygon points="12 2 22 12 12 22 2 12"/>',
  'check':        '<polyline points="20 6 9 17 4 12"/>',
  'ban':          '<circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>',
  'size':         '<polygon points="12 2 22 12 12 22 2 12"/>'
};

// Render an icon SVG string
// name: icon key, size: pixel size (default 16), extra: additional attributes
EAP.icon = function(name, size, extra) {
  var s = size || 16;
  var paths = EAP._icons[name];
  if (!paths) return '';
  return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"' + (extra ? ' ' + extra : '') + '>' + paths + '</svg>';
};

// Filled milestone icons — solid shapes, better at small sizes
EAP._filledIcons = {
  'rocket':  '<path d="M13.13 2.02a1 1 0 0 0-1.26.5L8.5 10.5 5 14l1 1 3-1.5 2.5-1L19.48 9.13a1 1 0 0 0 .5-1.26l-1.5-3a1 1 0 0 0-.35-.35l-3-1.5a1 1 0 0 0-2 0z M3 21l3.5-3.5M6 18l-3 3"/>',
  'monitor': '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  'compass': '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88"/>',
  'lock':    '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  // Simple geometric filled shapes (fallback for clarity at 10-12px)
  'diamond':   '<path d="M12 2L22 12L12 22L2 12Z"/>',
  'flag':      '<path d="M4 2v20"/><path d="M4 2h12l-3 5 3 5H4"/>',
  'triangle':  '<path d="M12 3L22 21H2Z"/>'
};
EAP.iconFilled = function(name, size) {
  var s = size || 14;
  var paths = EAP._filledIcons[name] || EAP._icons[name];
  if (!paths) return '';
  return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
};

// Drag grip — special: uses fill not stroke, smaller viewBox
EAP.icon.grip = function(size) {
  var s = size || 12;
  return '<svg width="8" height="' + s + '" viewBox="0 0 8 12" fill="currentColor" stroke="none">' +
    '<circle cx="2" cy="2" r="1.2"/><circle cx="6" cy="2" r="1.2"/>' +
    '<circle cx="2" cy="6" r="1.2"/><circle cx="6" cy="6" r="1.2"/>' +
    '<circle cx="2" cy="10" r="1.2"/><circle cx="6" cy="10" r="1.2"/></svg>';
};
