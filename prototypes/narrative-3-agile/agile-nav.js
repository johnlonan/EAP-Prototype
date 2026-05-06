/* ──────────────────────────────────────────────────────
   Agile Planning Nav Override
   Call after renderNav() to replace the generic L1 nav
   with agile-planning-specific destinations.

   Usage:
   <script src="agile-nav.js"></script>
   <script>setupAgileNav('planning');</script>
   ────────────────────────────────────────────────────── */

function setupAgileNav(activePage) {
  var navMiddle = document.querySelector('#left-nav .nav-middle');
  if (!navMiddle) return;

  // 6 nav items: Planning Home, Features, PI Board, divider, Team Backlog, Sprint Board
  var items = [
    {key:'planning', label:'Planning', href:'planning.html', icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      filledIcon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.1L2 9.6V20a2 2 0 002 2h5.5v-8h5v8H20a2 2 0 002-2V9.6L12 2.1Z"/></svg>'},
    {key:'features', label:'Features', href:'feature-backlog.html', icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
      filledIcon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>'},
    {key:'pi-board', label:'PI Board', href:'pi-board.html', icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
      filledIcon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>'},
    {key:'divider'},
    {key:'team-backlog', label:'Team Backlog', href:'team-backlog.html', icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
      filledIcon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/></svg>'},
    {key:'sprint-board', label:'Sprint Board', href:'sprint-board.html', icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>',
      filledIcon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21" stroke="white" stroke-width="1.5"/><line x1="15" y1="3" x2="15" y2="21" stroke="white" stroke-width="1.5"/></svg>'},
  ];

  var html = '';
  items.forEach(function(item) {
    if (item.key === 'divider') {
      html += '<div class="nav-divider" role="separator"></div>';
      return;
    }
    var isActive = item.key === activePage;
    html += '<button class="nav-btn' + (isActive ? '' : '') + '" aria-label="' + item.label + '" title="' + item.label + '" onclick="window.location.href=\'' + item.href + '\'" style="' + (isActive ? 'background:rgba(0,0,0,0.08); color:#1a1a1a;' : 'background:transparent; color:#666;') + ' cursor:pointer;">';
    html += isActive ? item.filledIcon : item.icon;
    html += '</button>';
  });

  navMiddle.innerHTML = html;
}
