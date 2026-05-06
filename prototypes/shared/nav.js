/* ──────────────────────────────────────────────────────
   Shared left-nav renderer
   Usage:  <script src="../shared/nav.js"></script>
           <script>renderNav('home');</script>
   ────────────────────────────────────────────────────── */

function renderNav(activePage, options) {
  const nav = document.getElementById('left-nav');
  if (!nav) return;
  const opts = options || {};
  const avatarSrc = opts.avatar || '../../assets/images/avatar-miley-simmons.png';
  const avatarName = opts.name || 'Miley Simmons';

  nav.innerHTML = `
    <!-- Section 1 — App badge -->
    <div class="nav-top">
      <div class="app-badge" aria-label="EAP">EAP</div>
    </div>

    <!-- Section 2 — Primary nav buttons -->
    <div class="nav-middle">
      <button class="nav-btn" aria-label="Home" title="Home">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </button>
      <button class="nav-btn" aria-label="Sparkle" title="Now Assist">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 5.5L11 9.5C11.5 11.5 13 13 15 13.5L19 14.5L15 15.5C13 16 11.5 17.5 11 19.5L10 23.5L9 19.5C8.5 17.5 7 16 5 15.5L1 14.5L5 13.5C7 13 8.5 11.5 9 9.5L10 5.5Z"/>
          <path d="M18 2L18.5 4C18.8 5.2 19.8 6.2 21 6.5L23 7L21 7.5C19.8 7.8 18.8 8.8 18.5 10L18 12L17.5 10C17.2 8.8 16.2 7.8 15 7.5L13 7L15 6.5C16.2 6.2 17.2 5.2 17.5 4L18 2Z"/>
        </svg>
      </button>
      <button class="nav-btn" aria-label="Settings" title="Settings">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
      </button>

      <div class="nav-divider" role="separator"></div>

      <button class="nav-btn" aria-label="List" title="List">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"/>
          <line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/>
          <line x1="3" y1="12" x2="3.01" y2="12"/>
          <line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
      </button>
      <button class="nav-btn" aria-label="Kanban" title="Kanban">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="9" y1="3" x2="9" y2="21"/>
          <line x1="15" y1="3" x2="15" y2="21"/>
        </svg>
      </button>
    </div>

    <!-- Section 3 — Bottom actions -->
    <div class="nav-bottom">
      <button class="nav-btn" aria-label="Notifications" title="Notifications">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
      </button>
      <div class="avatar-wrap" role="button" aria-label="Your profile" tabindex="0" title="${avatarName}">
        <img src="${avatarSrc}" alt="${avatarName}" style="width:32px; height:32px; border-radius:50%; object-fit:cover; display:block;">
        <div class="avatar-status" aria-label="Online"></div>
      </div>
    </div>
  `;

  // Set default state on all buttons
  const buttons = nav.querySelectorAll('.nav-middle .nav-btn');
  buttons.forEach(btn => {
    btn.style.background = 'transparent';
    btn.style.color = '#666';
  });

  // Filled SVG variants for active state
  // Home = 0, Sparkle = 1, Gear = 2, List = 3, Kanban = 4
  const filledIcons = {
    0: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.1L2 9.6V20a2 2 0 002 2h5.5v-8h5v8H20a2 2 0 002-2V9.6L12 2.1Z"/></svg>',
    1: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M10 5.5L11 9.5C11.5 11.5 13 13 15 13.5L19 14.5L15 15.5C13 16 11.5 17.5 11 19.5L10 23.5L9 19.5C8.5 17.5 7 16 5 15.5L1 14.5L5 13.5C7 13 8.5 11.5 9 9.5L10 5.5Z"/><path d="M18 2L18.5 4C18.8 5.2 19.8 6.2 21 6.5L23 7L21 7.5C19.8 7.8 18.8 8.8 18.5 10L18 12L17.5 10C17.2 8.8 16.2 7.8 15 7.5L13 7L15 6.5C16.2 6.2 17.2 5.2 17.5 4L18 2Z"/></svg>',
    2: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 12a3 3 0 100-6 3 3 0 000 6Z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
    3: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>',
    4: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21" stroke="white" stroke-width="1.5"/><line x1="15" y1="3" x2="15" y2="21" stroke="white" stroke-width="1.5"/></svg>'
  };

  const pageMap = {
    'home': 0,
    'feature-list': 3,
    'risk-detail': 0,
    'board': 4
  };

  const activeIndex = pageMap[activePage];
  if (activeIndex !== undefined && buttons[activeIndex]) {
    buttons[activeIndex].style.background = 'rgba(0,0,0,0.08)';
    buttons[activeIndex].style.color = '#1a1a1a';

    // Swap to filled icon variant
    if (filledIcons[activeIndex]) {
      buttons[activeIndex].innerHTML = filledIcons[activeIndex];
    }
  }

  // Nav links — overridable via options.links
  const defaultLinks = {
    0: 'home.html',
    3: 'feature-list.html'
  };
  const navLinks = opts.links || defaultLinks;

  buttons.forEach((btn, i) => {
    if (navLinks[i]) {
      btn.style.cursor = 'pointer';
      btn.onclick = () => window.location.href = navLinks[i];
    }
  });

  // ── Shared floating omnibar (skip on home — has its own omnibar) ──
  if (!document.getElementById('floating-bar') && activePage !== 'home') {
    const bar = document.createElement('div');
    bar.id = 'floating-bar';
    bar.style.cssText = 'position:fixed; bottom:24px; left:50%; transform:translateX(-50%); display:inline-flex; align-items:center; padding:6px 8px; background:var(--background-tertiary, #EDECE9); border-radius:45px; box-shadow:0 8px 10px -6px rgba(0,0,0,0.10), 0 20px 25px -5px rgba(0,0,0,0.10); outline:1px solid var(--background-tertiary, #EDECE9); outline-offset:-1px; width:480px; z-index:200; transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); overflow:hidden;';
    bar.innerHTML = `
      <div style="flex:1; background:white; border-radius:32px; box-shadow:0 0 8px rgba(0,0,0,0.05); display:inline-flex; align-items:center; padding:6px 6px 6px 24px; gap:24px; overflow:hidden;">
        <input id="floating-input" type="text" placeholder="Ask about PI Planning readiness..." style="flex:1; border:none; outline:none; font-size:16px; font-weight:300; color:#1a1a1a; background:transparent; cursor:text; line-height:24px; font-family:inherit;"/>
        <button id="mic-btn" style="width:40px; height:40px; border-radius:9999px; background:var(--accent, #68E353); border:none; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; transition: all 0.2s ease;">
          <svg id="mic-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="5" y="1" width="6" height="9" rx="3" fill="white"/>
            <path d="M2 8C2 11.314 4.686 14 8 14M14 8C14 11.314 11.314 14 8 14M8 14V16" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <svg id="plane-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" style="display:none;">
            <path d="M14 8L5 8M14 8L2 3L5 8M14 8L2 13L5 8" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;
    document.body.appendChild(bar);

    // Mic/plane toggle on input
    const floatingInput = document.getElementById('floating-input');
    const micIcon = document.getElementById('mic-icon');
    const planeIcon = document.getElementById('plane-icon');

    floatingInput.addEventListener('input', () => {
      if (floatingInput.value.trim().length > 0) {
        micIcon.style.display = 'none';
        planeIcon.style.display = 'block';
      } else {
        micIcon.style.display = 'block';
        planeIcon.style.display = 'none';
      }
    });
  }
}
