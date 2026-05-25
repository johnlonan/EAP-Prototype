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
      <div class="app-badge" aria-label="ServiceNow"><svg width="38" height="35" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.0627 5.80096e-06C8.85055 -0.00227871 6.68861 0.670245 4.85666 1.93056C3.0247 3.19087 1.60705 4.98096 0.787128 7.0692C-0.0327903 9.15744 -0.217234 11.4477 0.257662 13.6437C0.732557 15.8396 1.84494 17.8402 3.45086 19.3865C3.82864 19.7521 4.32245 19.9685 4.84334 19.9968C5.36422 20.0251 5.87792 19.8634 6.2919 19.5409C7.65174 18.5092 9.30324 17.9518 11.0002 17.9518C12.6971 17.9518 14.3486 18.5092 15.7084 19.5409C16.1259 19.866 16.6445 20.0275 17.1695 19.9958C17.6945 19.9641 18.1907 19.7414 18.5673 19.3684C20.1605 17.8273 21.2651 15.8382 21.7396 13.6555C22.2142 11.4728 22.0372 9.19587 21.2313 7.11599C20.4255 5.03612 19.0273 3.24794 17.2158 1.98027C15.4044 0.7126 13.2619 0.0231011 11.0627 5.80096e-06ZM11.0002 16.8349C9.90665 16.8385 8.83671 16.512 7.926 15.8968C7.0153 15.2815 6.30487 14.4053 5.88477 13.3792C5.46466 12.3531 5.35382 11.2232 5.56629 10.133C5.77876 9.04275 6.30496 8.04119 7.0782 7.25529C7.85143 6.4694 8.83687 5.93457 9.90955 5.71862C10.9822 5.50268 12.0939 5.61534 13.1035 6.04232C14.1131 6.4693 14.9752 7.19137 15.5805 8.11698C16.1858 9.04259 16.5071 10.13 16.5036 11.2415C16.5233 11.9815 16.3944 12.7178 16.1248 13.4054C15.8552 14.0931 15.4505 14.7177 14.9355 15.2412C14.4205 15.7646 13.8059 16.1759 13.1293 16.4499C12.4527 16.724 11.7282 16.855 11.0002 16.8349Z" fill="#52CB3D"/></svg></div>
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
    2: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z M12 9a3 3 0 100 6 3 3 0 000-6z"/></svg>',
    3: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>',
    4: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21" stroke="white" stroke-width="1.5"/><line x1="15" y1="3" x2="15" y2="21" stroke="white" stroke-width="1.5"/></svg>'
  };

  const pageMap = {
    'home': 0,
    'feature-list': 3,
    'risk-detail': 0,
    'board': 4,
    'setup': 2
  };

  const activeIndex = pageMap[activePage];
  if (activeIndex !== undefined && buttons[activeIndex]) {
    if (opts.theme === 'sand') {
      buttons[activeIndex].style.background = '#C2C1BF';
      buttons[activeIndex].style.borderRadius = '9999px';
      buttons[activeIndex].style.color = '#343331';
    } else {
      buttons[activeIndex].style.background = 'rgba(0,0,0,0.08)';
      buttons[activeIndex].style.color = '#1a1a1a';
    }

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
    const isSand = (opts.theme === 'sand');

    // ── Inject styles once ────────────────────────────────
    if (!document.getElementById('otto-bar-styles')) {
      const s = document.createElement('style');
      s.id = 'otto-bar-styles';
      if (isSand) {
        /* Sand: double-layer pill. Animation is a spinning gradient border on
           the outer cream shell — charcoal → AI green → sand fade → repeat.
           Uses the padding-box / border-box split so the cream fill stays clean.
           Nothing animates on the mark or label. */
        s.textContent = `
          @property --otto-angle {
            syntax: '<angle>';
            initial-value: 0deg;
            inherits: false;
          }
          @keyframes otto-sand-spin {
            to { --otto-angle: 360deg; }
          }

          #floating-bar {
            border: 2px solid transparent !important;
            background:
              linear-gradient(#F8F7F4, #F8F7F4) padding-box,
              conic-gradient(from var(--otto-angle),
                rgba(56,55,51,0.90)   0deg,
                rgba(56,55,51,0.70)  30deg,
                rgba(22,163,74,0.85) 70deg,
                rgba(22,163,74,0.38) 115deg,
                rgba(204,203,200,0.45) 165deg,
                rgba(225,224,221,0.08) 250deg,
                rgba(56,55,51,0.90)  360deg
              ) border-box !important;
            animation: otto-sand-spin 3.5s linear infinite;
            transition: width 400ms cubic-bezier(0.34,1.56,0.64,1),
                        transform 220ms cubic-bezier(0.22,1,0.36,1) !important;
          }

          /* Hover: spin pauses → static charcoal-to-green gradient */
          #floating-bar.is-hovered {
            animation-play-state: paused;
            background:
              linear-gradient(#F8F7F4, #F8F7F4) padding-box,
              linear-gradient(135deg,
                rgba(56,55,51,0.85) 0%,
                rgba(22,163,74,0.70) 50%,
                rgba(204,203,200,0.50) 100%
              ) border-box !important;
            box-shadow: 0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06) !important;
          }

          /* Expanded: spin stops, clean green ring signals AI active */
          #floating-bar.is-expanded {
            animation-play-state: paused !important;
            border: 2px solid rgba(22,163,74,0.32) !important;
            background: #F8F7F4 !important;
            box-shadow: 0px 10px 15px -3px rgba(0,0,0,0.10),
                        0px 4px 6px -4px rgba(0,0,0,0.10) !important;
            cursor: default !important;
          }

          .fb-icon-btn:hover { background: #F1F0ED !important; }

          @keyframes otto-label-out {
            0%   { opacity:1; transform:translateX(0)   scale(1); }
            100% { opacity:0; transform:translateX(8px) scale(0.88); }
          }
          @keyframes otto-label-in {
            0%   { opacity:0; transform:translateX(-8px) scale(0.88); }
            100% { opacity:1; transform:translateX(0)    scale(1); }
          }
          @keyframes otto-shimmer {
            0%   { background-position:-500px 0; opacity:0.5; }
            60%  { opacity:0.9; }
            100% { background-position:500px 0; opacity:0; }
          }
          #floating-bar .otto-shimmer-layer {
            position:absolute; inset:0; border-radius:999px; pointer-events:none;
            background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.75) 50%,transparent 70%);
            background-size:500px 100%;
            animation:otto-shimmer 500ms cubic-bezier(0.22,1,0.36,1) forwards;
          }
        `;
      } else {
        s.textContent = `
          @property --otto-angle {
            syntax: '<angle>';
            initial-value: 0deg;
            inherits: false;
          }
          @keyframes otto-spin { to { --otto-angle: 360deg; } }
          #floating-bar {
            position: relative;
            border: 1.5px solid transparent !important;
            background:
              linear-gradient(rgba(255,255,255,0.92), rgba(255,255,255,0.92)) padding-box,
              conic-gradient(from var(--otto-angle),
                rgba(0,199,177,0.85)  0deg, rgba(14,78,105,0.70) 100deg,
                rgba(0,0,0,0.06) 190deg, rgba(0,0,0,0.06) 275deg,
                rgba(0,199,177,0.85) 360deg
              ) border-box !important;
            animation: otto-spin 3.5s linear infinite;
            transition: width 400ms cubic-bezier(0.34,1.56,0.64,1),
                        box-shadow 200ms ease,
                        transform 220ms cubic-bezier(0.22,1,0.36,1) !important;
          }
          #floating-bar.is-hovered {
            animation-play-state: paused;
            background:
              linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95)) padding-box,
              linear-gradient(135deg, rgba(0,199,177,0.75) 0%, rgba(14,78,105,0.60) 100%) border-box !important;
            box-shadow: 0 5px 20px rgba(0,0,0,0.10), 0 0 0 3px rgba(0,199,177,0.15) !important;
          }
          #floating-bar.is-expanded {
            animation-play-state: paused !important;
            background: rgba(255,255,255,0.96) !important;
            border: 1px solid rgba(14,78,105,0.22) !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 0 0 3px rgba(14,78,105,0.08) !important;
            cursor: default !important;
          }
          @keyframes otto-label-out {
            0%   { opacity:1; transform:translateX(0)   scale(1); }
            100% { opacity:0; transform:translateX(8px) scale(0.88); }
          }
          @keyframes otto-label-in {
            0%   { opacity:0; transform:translateX(-8px) scale(0.88); }
            100% { opacity:1; transform:translateX(0)    scale(1); }
          }
          @keyframes otto-shimmer {
            0%   { background-position:-500px 0; opacity:0.8; }
            60%  { opacity:1; }
            100% { background-position:500px 0; opacity:0; }
          }
          #floating-bar .otto-shimmer-layer {
            position:absolute; inset:0; border-radius:999px; pointer-events:none;
            background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.65) 50%,transparent 70%);
            background-size:500px 100%;
            animation:otto-shimmer 580ms cubic-bezier(0.22,1,0.36,1) forwards;
          }
        `;
      }
      document.head.appendChild(s);
    }

    const bar = document.createElement('div');
    bar.id = 'floating-bar';

    const SPRING    = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
    const EASE      = 'cubic-bezier(0.22, 1, 0.36, 1)';
    const OTTO_PATH = 'M45.3968 11.6083C43.954 19.7583 40.0994 27.5449 33.8223 33.8221C27.544 40.1002 19.7575 43.9546 11.6084 45.3967C5.01277 46.5637 0.0151754 52.126 0.000405914 58.824C0.000405914 58.9106 -0.000507393 58.9982 0.000405914 59.0858C0.0151754 65.7838 5.01277 71.346 11.6084 72.513C19.7584 73.956 27.5449 77.8104 33.8223 84.0877C40.1003 90.3657 43.9548 98.1523 45.3968 106.301C46.5638 112.897 52.1271 117.894 58.8241 117.909C58.9107 117.909 58.9985 117.91 59.0861 117.909C65.784 117.894 71.3462 112.897 72.5133 106.301C73.9562 98.1514 77.8107 90.3648 84.088 84.0877C90.3661 77.8095 98.1517 73.956 106.302 72.513C112.897 71.346 117.894 65.7829 117.91 59.0858C117.91 58.9991 117.91 58.9106 117.91 58.824C117.895 52.126 112.897 46.5637 106.302 45.3967C98.1517 43.9537 90.3652 40.0992 84.088 33.8221C77.8107 27.5449 73.9562 19.7583 72.5133 11.6083C71.3462 5.01277 65.784 0.0151682 59.0861 0.000411711C58.9994 0.000411711 58.9116 -0.000514639 58.8241 0.000411711C52.1262 0.0151682 46.5638 5.01277 45.3968 11.6083ZM78.8897 39.0204C89.8996 50.0301 89.8996 67.8797 78.8897 78.8894C67.88 89.8992 50.0303 89.8992 39.0205 78.8894C28.0106 67.8797 28.0106 50.0301 39.0205 39.0204C50.0303 28.0106 67.88 28.0106 78.8897 39.0204Z';

    const ottoFill   = isSand ? '#585753' : '#0e4e69';
    const restShadow = isSand
      ? '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)'
      : '0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)';

    bar.style.cssText = `
      position:fixed; bottom:20px; left:50%; transform:translateX(-50%);
      display:inline-flex; align-items:center; padding:4px;
      border-radius:999px; box-shadow:${restShadow};
      width:auto; z-index:200; overflow:hidden; cursor:pointer;
    `;

    if (isSand) {
      /* ── Sand: double-layer structure ──
         Outer shell: cream #F8F7F4 — carries the glow animation (set by CSS)
         Collapsed inner: white pill with otto mark + label
         Expanded inner: white pill with icon actions, input, send button
         Sizing matches reference: collapsed ~48px tall, expanded ~72px tall */
      bar.innerHTML = `
        <div id="fb-collapsed" style="display:inline-flex;align-items:center;background:#FFFFFF;border-radius:9999px;padding:3px 14px 3px 3px;gap:8px;">
          <div style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;flex-shrink:0;">
            <svg id="otto-mark-svg" width="18" height="18" viewBox="0 0 118 118" fill="none" style="display:block;flex-shrink:0;">
              <path d="${OTTO_PATH}" fill="${ottoFill}"/>
            </svg>
          </div>
          <span id="ask-label" style="font-size:13px;font-weight:400;color:#585753;font-family:inherit;letter-spacing:0;white-space:nowrap;">Ask Otto</span>
          <span id="cmdK-badge" style="font-size:11px;color:#797874;background:rgba(56,55,51,0.07);border:1px solid rgba(56,55,51,0.20);border-radius:4px;padding:2px 5px;line-height:1;flex-shrink:0;user-select:none;font-family:inherit;letter-spacing:0.01em;">⌘K</span>
        </div>
        <div id="fb-expanded" style="display:none;align-items:center;background:#FFFFFF;border-radius:9999px;padding:5px;gap:4px;width:100%;">
          <div style="display:flex;align-items:center;flex:1;min-width:0;">
            <button class="fb-icon-btn" aria-label="Add" style="width:32px;height:32px;border-radius:9999px;border:none;background:transparent;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;color:#383733;transition:background 120ms ease;">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>
            </button>
            <button class="fb-icon-btn" id="mic-btn" aria-label="Voice" style="width:32px;height:32px;border-radius:9999px;border:none;background:transparent;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;color:#383733;transition:background 120ms ease;">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <rect x="5" y="1" width="6" height="9" rx="3" fill="currentColor"/>
                <path d="M2 8C2 11.314 4.686 14 8 14M14 8C14 11.314 11.314 14 8 14M8 14V16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
            <input id="floating-input" type="text" placeholder="" style="flex:1;min-width:0;border:none;outline:none;font-size:14px;font-weight:300;color:#111111;background:transparent;line-height:1.4;font-family:inherit;padding:0 6px;letter-spacing:-0.01em;"/>
          </div>
          <button id="send-btn" style="width:32px;height:32px;border-radius:9999px;background:#16A34A;border:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;transition:background 140ms ease,transform 160ms ${SPRING};">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="white" style="display:block;">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z"/>
            </svg>
          </button>
        </div>
      `;
    } else {
      /* ── AINPX: original single-layer structure ── */
      bar.innerHTML = `
        <div id="otto-anchor" style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;flex-shrink:0;">
          <svg id="otto-mark-svg" width="18" height="18" viewBox="0 0 118 118" fill="none" style="display:block;flex-shrink:0;transition:transform 300ms ${SPRING},opacity 300ms ease;">
            <path d="${OTTO_PATH}" fill="${ottoFill}"/>
          </svg>
        </div>
        <div id="floating-trigger" style="display:inline-flex;align-items:center;padding:0 14px 0 2px;white-space:nowrap;">
          <span id="ask-label" style="font-size:12px;font-weight:500;color:#1a1918;font-family:inherit;letter-spacing:0;transition:color 200ms ease;">Ask Otto</span>
        </div>
        <div id="floating-content" style="display:none;align-items:center;flex:1;overflow:hidden;">
          <input id="floating-input" type="text" placeholder="" style="flex:1;min-width:0;border:none;outline:none;font-size:13px;font-weight:400;color:#111827;background:transparent;line-height:20px;font-family:inherit;padding:6px 8px 6px 6px;"/>
          <button id="mic-btn" style="width:30px;height:30px;border-radius:9999px;background:#0e4e69;border:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;transition:background 140ms ease,transform 160ms ${SPRING};">
            <svg id="mic-icon" width="13" height="13" viewBox="0 0 16 16" fill="none">
              <rect x="5" y="1" width="6" height="9" rx="3" fill="white"/>
              <path d="M2 8C2 11.314 4.686 14 8 14M14 8C14 11.314 11.314 14 8 14M8 14V16" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <svg id="plane-icon" width="13" height="13" viewBox="0 0 16 16" fill="none" style="display:none;">
              <path d="M14 8L5 8M14 8L2 3L5 8M14 8L2 13L5 8" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      `;
    }
    document.body.appendChild(bar);

    const PLACEHOLDER   = 'Ask about PI Planning readiness…';
    const floatingInput = document.getElementById('floating-input');
    const askLabel      = document.getElementById('ask-label');
    let expanded = false;
    let delightTimer = null;

    // Sand-specific refs
    const fbCollapsed = isSand ? document.getElementById('fb-collapsed')  : null;
    const fbExpanded  = isSand ? document.getElementById('fb-expanded')   : null;
    const sendBtn     = isSand ? document.getElementById('send-btn')      : null;
    const micBtn      = document.getElementById('mic-btn');

    // AINPX-specific refs
    const trigger   = isSand ? null : document.getElementById('floating-trigger');
    const content   = isSand ? null : document.getElementById('floating-content');
    const micIcon   = isSand ? null : document.getElementById('mic-icon');
    const planeIcon = isSand ? null : document.getElementById('plane-icon');

    function spawnShimmer() {
      const l = document.createElement('div');
      l.className = 'otto-shimmer-layer';
      bar.appendChild(l);
      setTimeout(() => { if (l.parentNode) l.remove(); }, isSand ? 540 : 620);
    }

    function typewriter() {
      floatingInput.placeholder = '';
      let i = 0;
      const t = setInterval(() => {
        floatingInput.placeholder = PLACEHOLDER.slice(0, ++i);
        if (i >= PLACEHOLDER.length) clearInterval(t);
      }, 16);
    }

    // ── Expand ────────────────────────────────────────────
    function expand() {
      if (expanded) return;
      expanded = true;
      bar.classList.remove('is-hovered');
      bar.classList.add('is-expanded');

      if (isSand) {
        bar.style.width   = '400px';
        bar.style.padding = '5px';
        fbCollapsed.style.display = 'none';
        fbExpanded.style.display  = 'flex';
      } else {
        bar.style.width = '420px';
        trigger.style.display = 'none';
        content.style.display = 'inline-flex';
      }
      floatingInput.placeholder = PLACEHOLDER;
      floatingInput.focus();
      spawnShimmer();
      delightTimer = setTimeout(() => { typewriter(); }, 1400);
    }

    // ── Collapse ──────────────────────────────────────────
    function collapse() {
      if (!expanded) return;
      expanded = false;
      if (delightTimer) { clearTimeout(delightTimer); delightTimer = null; }

      bar.classList.remove('is-expanded');
      bar.style.width = 'auto';

      if (isSand) {
        bar.style.padding = '3px';
        fbExpanded.style.display  = 'none';
        floatingInput.value       = '';
        floatingInput.placeholder = '';
        fbCollapsed.style.display = 'inline-flex';
        askLabel.style.animation  = 'otto-label-in 280ms ' + SPRING + ' forwards';
      } else {
        content.style.display    = 'none';
        micBtn.style.transform   = '';
        micIcon.style.display    = 'block';
        planeIcon.style.display  = 'none';
        floatingInput.placeholder = '';
        trigger.style.display    = 'inline-flex';
        askLabel.style.animation = 'otto-label-in 280ms ' + SPRING + ' forwards';
      }
    }

    // ── Hover — Sand: border/shadow via CSS class; no mark/label changes ──
    bar.addEventListener('mouseenter', () => {
      if (expanded) return;
      bar.classList.add('is-hovered');
      bar.style.transform = 'translateX(-50%) translateY(-2px)';
      if (!isSand) {
        bar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.10), 0 0 0 3px rgba(0,199,177,0.15)';
        askLabel.style.color = '#0e4e69';
      }
    });

    bar.addEventListener('mouseleave', () => {
      if (expanded) return;
      bar.classList.remove('is-hovered');
      bar.style.transform = 'translateX(-50%) translateY(0)';
      if (!isSand) {
        bar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)';
        askLabel.style.color = '#1a1918';
      }
    });

    bar.addEventListener('click', (e) => {
      if (expanded) return;
      if (typeof EAP !== 'undefined' && typeof EAP.openCmdPalette === 'function') {
        EAP.openCmdPalette();
      } else {
        expand();
      }
    });

    floatingInput.addEventListener('blur', () => {
      if (floatingInput.value.trim() === '') collapse();
    });
    floatingInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') collapse();
    });

    if (isSand) {
      if (sendBtn) {
        sendBtn.addEventListener('mouseenter', () => { sendBtn.style.background = '#15803D'; sendBtn.style.transform = 'scale(1.06)'; });
        sendBtn.addEventListener('mouseleave', () => { sendBtn.style.background = '#16A34A'; sendBtn.style.transform = 'scale(1)'; });
        sendBtn.addEventListener('click', (e) => { e.stopPropagation(); });
      }
      if (micBtn) micBtn.addEventListener('click', (e) => { e.stopPropagation(); });
    } else {
      floatingInput.addEventListener('input', () => {
        const hasText = floatingInput.value.trim().length > 0;
        micIcon.style.display   = hasText ? 'none'  : 'block';
        planeIcon.style.display = hasText ? 'block' : 'none';
      });
      micBtn.addEventListener('mouseenter', () => { micBtn.style.background = '#0a3a4f'; micBtn.style.transform = 'scale(1.08)'; });
      micBtn.addEventListener('mouseleave', () => { micBtn.style.background = '#0e4e69'; micBtn.style.transform = 'scale(1)'; });
      micBtn.addEventListener('click', (e) => { e.stopPropagation(); });
    }
  }
}
