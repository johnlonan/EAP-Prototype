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
    // ── Inject animation keyframes once ──────────────────
    if (!document.getElementById('otto-bar-styles')) {
      const s = document.createElement('style');
      s.id = 'otto-bar-styles';
      s.textContent = `
        /* ── Rotating gradient border ────────────────── */
        @property --otto-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes otto-spin {
          to { --otto-angle: 360deg; }
        }

        /* Default state: spinning conic gradient border */
        #floating-bar {
          position: relative;
          border: 1.5px solid transparent !important;
          background:
            linear-gradient(rgba(255,255,255,0.92), rgba(255,255,255,0.92)) padding-box,
            conic-gradient(from var(--otto-angle),
              rgba(0,199,177,0.85)  0deg,
              rgba(14,78,105,0.70) 100deg,
              rgba(0,0,0,0.06)     190deg,
              rgba(0,0,0,0.06)     275deg,
              rgba(0,199,177,0.85) 360deg
            ) border-box !important;
          animation: otto-spin 3.5s linear infinite;
          transition: width 400ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 200ms ease, transform 220ms cubic-bezier(0.22,1,0.36,1) !important;
        }

        /* Hover: spin pauses → snaps to clean static teal border */
        #floating-bar.is-hovered {
          animation-play-state: paused;
          background:
            linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95)) padding-box,
            linear-gradient(135deg, rgba(0,199,177,0.75) 0%, rgba(14,78,105,0.60) 100%) border-box !important;
          box-shadow: 0 5px 20px rgba(0,0,0,0.10), 0 0 0 3px rgba(0,199,177,0.15) !important;
        }

        /* Expanded: solid white, teal focus ring, spin off */
        #floating-bar.is-expanded {
          animation-play-state: paused !important;
          background: rgba(255,255,255,0.96) !important;
          border: 1px solid rgba(14,78,105,0.22) !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 0 0 3px rgba(14,78,105,0.08) !important;
          cursor: default !important;
        }

        /* ── Label transitions ────────────────────────── */
        @keyframes otto-label-out {
          0%   { opacity:1; transform:translateX(0)   scale(1); }
          100% { opacity:0; transform:translateX(8px) scale(0.88); }
        }
        @keyframes otto-label-in {
          0%   { opacity:0; transform:translateX(-8px) scale(0.88); }
          100% { opacity:1; transform:translateX(0)    scale(1); }
        }

        /* ── Post-load delight (runs after expansion + delay) ── */
        /* Mic attention bounce — on already-visible element, no opacity change */
        @keyframes otto-mic-attention {
          0%   { transform: scale(1); }
          35%  { transform: scale(1.18); }
          65%  { transform: scale(0.90); }
          82%  { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @keyframes otto-shimmer {
          0%   { background-position:-500px 0; opacity:0.8; }
          60%  { opacity:1; }
          100% { background-position:500px 0; opacity:0; }
        }

        /* Shimmer overlay on expand */
        #floating-bar .otto-shimmer-layer {
          position:absolute; inset:0; border-radius:999px; pointer-events:none;
          background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.65) 50%,transparent 70%);
          background-size:500px 100%;
          animation:otto-shimmer 580ms cubic-bezier(0.22,1,0.36,1) forwards;
        }
      `;
      document.head.appendChild(s);
    }

    const bar = document.createElement('div');
    bar.id = 'floating-bar';

    const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
    const EASE   = 'cubic-bezier(0.22, 1, 0.36, 1)';
    const OTTO_PATH = 'M45.3968 11.6083C43.954 19.7583 40.0994 27.5449 33.8223 33.8221C27.544 40.1002 19.7575 43.9546 11.6084 45.3967C5.01277 46.5637 0.0151754 52.126 0.000405914 58.824C0.000405914 58.9106 -0.000507393 58.9982 0.000405914 59.0858C0.0151754 65.7838 5.01277 71.346 11.6084 72.513C19.7584 73.956 27.5449 77.8104 33.8223 84.0877C40.1003 90.3657 43.9548 98.1523 45.3968 106.301C46.5638 112.897 52.1271 117.894 58.8241 117.909C58.9107 117.909 58.9985 117.91 59.0861 117.909C65.784 117.894 71.3462 112.897 72.5133 106.301C73.9562 98.1514 77.8107 90.3648 84.088 84.0877C90.3661 77.8095 98.1517 73.956 106.302 72.513C112.897 71.346 117.894 65.7829 117.91 59.0858C117.91 58.9991 117.91 58.9106 117.91 58.824C117.895 52.126 112.897 46.5637 106.302 45.3967C98.1517 43.9537 90.3652 40.0992 84.088 33.8221C77.8107 27.5449 73.9562 19.7583 72.5133 11.6083C71.3462 5.01277 65.784 0.0151682 59.0861 0.000411711C58.9994 0.000411711 58.9116 -0.000514639 58.8241 0.000411711C52.1262 0.0151682 46.5638 5.01277 45.3968 11.6083ZM78.8897 39.0204C89.8996 50.0301 89.8996 67.8797 78.8897 78.8894C67.88 89.8992 50.0303 89.8992 39.0205 78.8894C28.0106 67.8797 28.0106 50.0301 39.0205 39.0204C50.0303 28.0106 67.88 28.0106 78.8897 39.0204Z';

    bar.style.cssText = `
      position:fixed; bottom:20px; left:50%; transform:translateX(-50%);
      display:inline-flex; align-items:center; padding:4px;
      backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
      border-radius:999px;
      box-shadow:0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
      width:auto; z-index:200; overflow:hidden; cursor:pointer;
      width:auto;
    `;

    bar.innerHTML = `
      <div id="otto-anchor" style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;flex-shrink:0;">
        <svg id="otto-mark-svg" width="15" height="15" viewBox="0 0 118 118" fill="none" style="display:block;flex-shrink:0;transition:transform 300ms ${SPRING},opacity 300ms ease;">
          <path d="${OTTO_PATH}" fill="#0e4e69"/>
        </svg>
      </div>
      <div id="floating-trigger" style="display:inline-flex;align-items:center;padding:0 14px 0 2px;white-space:nowrap;">
        <span id="ask-label" style="font-size:12px;font-weight:500;color:#1a1918;font-family:inherit;letter-spacing:0;transition:color 200ms ease;">Ask Otto</span>
      </div>
      <div id="floating-content" style="display:none;align-items:center;flex:1;overflow:hidden;">
        <input id="floating-input" type="text" placeholder=""
          style="flex:1;min-width:0;border:none;outline:none;font-size:13px;font-weight:400;color:#111827;background:transparent;line-height:20px;font-family:inherit;padding:6px 8px 6px 6px;"/>
        <button id="mic-btn"
          style="width:30px;height:30px;border-radius:9999px;background:#0e4e69;border:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;transition:background 140ms ease,transform 160ms ${SPRING};">
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
    document.body.appendChild(bar);

    const trigger      = document.getElementById('floating-trigger');
    const askLabel     = document.getElementById('ask-label');
    const content      = document.getElementById('floating-content');
    const floatingInput = document.getElementById('floating-input');
    const micBtn       = document.getElementById('mic-btn');
    const micIcon      = document.getElementById('mic-icon');
    const planeIcon    = document.getElementById('plane-icon');
    let expanded = false;
    let delightTimer = null;

    const PLACEHOLDER = 'Ask about PI Planning readiness…';

    function spawnShimmer() {
      const l = document.createElement('div');
      l.className = 'otto-shimmer-layer';
      bar.appendChild(l);
      setTimeout(() => { if (l.parentNode) l.remove(); }, 620);
    }

    function typewriter() {
      floatingInput.placeholder = '';
      let i = 0;
      const t = setInterval(() => {
        floatingInput.placeholder = PLACEHOLDER.slice(0, ++i);
        if (i >= PLACEHOLDER.length) clearInterval(t);
      }, 16);
    }

    // ── Expand ───────────────────────────────────────────
    function expand() {
      if (expanded) return;
      expanded = true;
      bar.classList.remove('is-hovered');

      bar.classList.add('is-expanded');
      bar.style.width = '420px';
      trigger.style.display = 'none';
      content.style.display = 'inline-flex';
      floatingInput.placeholder = PLACEHOLDER; // full text present immediately
      floatingInput.focus();
      spawnShimmer();

      // Delight: typewriter replays the placeholder after expansion + 1s
      delightTimer = setTimeout(() => {
        typewriter();
      }, 1400);
    }

    // ── Collapse ─────────────────────────────────────────
    function collapse() {
      if (!expanded) return;
      expanded = false;
      if (delightTimer) { clearTimeout(delightTimer); delightTimer = null; }

      // Immediate — no fade, no setTimeout
      content.style.display = 'none';
      floatingInput.style.animation = '';
      micBtn.style.animation = '';
      micBtn.style.transform = '';
      micIcon.style.display = 'block';
      planeIcon.style.display = 'none';
      floatingInput.placeholder = '';

      bar.classList.remove('is-expanded');
      bar.style.width = 'auto';

      trigger.style.display = 'inline-flex';
      askLabel.style.animation = 'otto-label-in 280ms ' + SPRING + ' forwards';
    }

    // ── Hover: spin pauses, static teal border snaps in ──
    bar.addEventListener('mouseenter', () => {
      if (expanded) return;
      bar.classList.add('is-hovered');
      bar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.10), 0 0 0 3px rgba(0,199,177,0.15)';
      bar.style.transform = 'translateX(-50%) translateY(-2px)';
      askLabel.style.color = '#0e4e69';
    });

    bar.addEventListener('mouseleave', () => {
      if (expanded) return;
      bar.classList.remove('is-hovered');
      bar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)';
      bar.style.transform = 'translateX(-50%) translateY(0)';
      askLabel.style.color = '#1a1918';
    });

    bar.addEventListener('click', (e) => { if (!expanded) expand(); });

    floatingInput.addEventListener('blur', () => {
      if (floatingInput.value.trim() === '') collapse();
    });

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
