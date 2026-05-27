/* ═══════════════════════════════════════════════════════
   COMMAND-PALETTE.JS — Global Cmd+K command palette

   Home  (home.html)
     · Click the omnibar OR press Cmd+K → dropdown opens
       below the input, anchored to the omnibar.
     · Filters live as you type, grouped Navigate / Otto.
     · "✦ Ask Otto: [query]" fallback for anything that
       doesn't match a command.
     · No background dim — inline, non-blocking.

   App   (index.html)
     · Cmd+K or Ask Otto button → centered floating overlay.
     · Same commands, same grouping, same UX — just modal.
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Styles ────────────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [

    // ── Shared: item anatomy (used in both overlay and dropdown) ────────────
    '.cmd-cat{font-size:10px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;',
      'color:#999995;padding:8px 16px 3px;',
      'font-family:var(--font-sans,sans-serif);user-select:none;}',

    '.cmd-item{display:flex;align-items:center;gap:10px;',
      'padding:7px 12px;cursor:pointer;transition:background 60ms;user-select:none;}',

    '.cmd-item:hover,.cmd-item.is-sel{background:#F1F0ED;}',

    '.cmd-item-ico{width:28px;height:28px;border-radius:7px;flex-shrink:0;',
      'background:#F1F0ED;display:flex;align-items:center;justify-content:center;',
      'color:#585753;}',

    '.cmd-item.is-otto .cmd-item-ico{background:rgba(22,163,74,0.10);color:#16A34A;}',
    '.cmd-item.is-filter .cmd-item-ico{background:rgba(56,55,51,0.08);color:#585753;}',

    '.cmd-item-lbl{flex:1;font-size:13px;color:#111111;',
      'font-family:var(--font-sans,sans-serif);}',

    '.cmd-item-tag{font-size:11px;color:#CCCBC8;flex-shrink:0;',
      'font-family:var(--font-sans,sans-serif);}',

    '.cmd-empty{padding:28px 16px;text-align:center;font-size:13px;color:#BBBBB7;',
      'font-family:var(--font-sans,sans-serif);}',

    // ── App: centered floating overlay ──────────────────────────────────────
    '.cmd-overlay{position:fixed;inset:0;z-index:9999;',
      'background:rgba(24,23,20,0.22);',
      'backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);',
      'display:flex;align-items:flex-start;justify-content:center;padding-top:72px;',
      'animation:cmdFadeIn 110ms ease both;}',

    '@keyframes cmdFadeIn{from{opacity:0}to{opacity:1}}',

    '.cmd-palette{width:480px;max-width:calc(100vw - 48px);',
      'background:#FFFFFF;border-radius:16px;overflow:hidden;',
      'box-shadow:0 8px 40px rgba(0,0,0,0.14),0 2px 8px rgba(0,0,0,0.08),',
        '0 0 0 1px rgba(0,0,0,0.06);',
      'animation:cmdSlideIn 170ms cubic-bezier(0.22,1,0.36,1) both;}',

    '@keyframes cmdSlideIn{from{opacity:0;transform:scale(0.96) translateY(-8px)}',
      'to{opacity:1;transform:none}}',

    '.cmd-input-row{display:flex;align-items:center;gap:10px;',
      'padding:13px 16px;border-bottom:1px solid #E1E0DD;}',

    '.cmd-input-ico{color:#999995;display:flex;align-items:center;flex-shrink:0;}',

    '.cmd-input{flex:1;border:none;outline:none;background:transparent;',
      'font-size:15px;color:#111111;',
      'font-family:var(--font-sans,"ServiceNow Sans",system-ui,sans-serif);',
      'line-height:1.4;caret-color:#16A34A;}',

    '.cmd-input::placeholder{color:#BBBBB7;}',

    '.cmd-esc{font-size:11px;color:#797874;background:#F1F0ED;',
      'border:1px solid #E1E0DD;border-radius:4px;padding:2px 7px;line-height:1.6;',
      'flex-shrink:0;font-family:var(--font-sans,sans-serif);font-weight:500;',
      'letter-spacing:0.03em;user-select:none;}',

    '.cmd-results{max-height:340px;overflow-y:auto;padding:4px 0 8px;}',
    '.cmd-results::-webkit-scrollbar{width:4px;}',
    '.cmd-results::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.1);border-radius:4px;}',

    // ── Home: suppress hover-pills (dropdown replaces that role) ────────────
    // Pills should never show on plain hover — only when the input is focused
    // (which is when the command dropdown is active).
    '.ih-centre:hover .quick-chips:not(.cmd-mode){',
      'opacity:0 !important;pointer-events:none !important;}',

    // ── Home: dropdown anchored below the omnibar ────────────────────────────
    // Overrides the flex-wrap chip layout when in command mode
    '.quick-chips.cmd-mode{',
      'display:block !important;',         // was flex wrap
      'background:#FFFFFF;',
      'border-radius:14px;',
      'box-shadow:0 8px 32px rgba(0,0,0,0.12),0 2px 8px rgba(0,0,0,0.06),',
        '0 0 0 1px rgba(0,0,0,0.06);',
      'overflow:hidden;',
      'padding:4px 0 8px;',
      'max-height:380px;overflow-y:auto;',
      'z-index:100;}',                     // above sticky header (z-index:20)

    '.quick-chips.cmd-mode::-webkit-scrollbar{width:4px;}',
    '.quick-chips.cmd-mode::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.1);border-radius:4px;}',

    // ── Self-contained toast (home.html — index delegates to EAP.toast) ─────
    '#cmd-toast-rack{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);',
      'z-index:10000;display:flex;flex-direction:column;align-items:center;gap:8px;',
      'pointer-events:none;}',

    '.cmd-toast{display:flex;align-items:center;gap:8px;',
      'background:#1B1A16;color:#FFFFFF;padding:9px 16px;border-radius:999px;',
      'font-size:13px;font-family:var(--font-sans,sans-serif);',
      'box-shadow:0 4px 16px rgba(0,0,0,0.28);',
      'animation:cmdToastIn 200ms cubic-bezier(0.22,1,0.36,1) both;',
      'white-space:nowrap;pointer-events:auto;}',

    '.cmd-toast.out{animation:cmdToastOut 180ms ease forwards;}',

    '@keyframes cmdToastIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
    '@keyframes cmdToastOut{to{opacity:0;transform:translateY(4px)}}'

  ].join('');
  document.head.appendChild(style);

  // ─── Icons ─────────────────────────────────────────────────────────────────
  var ICON_SEARCH =
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none">' +
      '<circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.4"/>' +
      '<path d="M10.5 10.5L13 13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
    '</svg>';

  var ICON_NAV =
    '<svg width="14" height="14" viewBox="0 0 14 14" fill="none">' +
      '<rect x="1.5" y="2.5" width="11" height="9" rx="2" stroke="currentColor" stroke-width="1.3"/>' +
      '<path d="M1.5 5.5h11" stroke="currentColor" stroke-width="1.3"/>' +
    '</svg>';

  // Actual Otto logomark (Sparkmoji) — same path used in nav.js floating bar
  var ICON_OTTO =
    '<svg width="14" height="14" viewBox="0 0 118 118" fill="currentColor">' +
      '<path d="M45.3968 11.6083C43.954 19.7583 40.0994 27.5449 33.8223 33.8221C27.544 40.1002 19.7575 43.9546 11.6084 45.3967C5.01277 46.5637 0.0151754 52.126 0.000405914 58.824C0.000405914 58.9106 -0.000507393 58.9982 0.000405914 59.0858C0.0151754 65.7838 5.01277 71.346 11.6084 72.513C19.7584 73.956 27.5449 77.8104 33.8223 84.0877C40.1003 90.3657 43.9548 98.1523 45.3968 106.301C46.5638 112.897 52.1271 117.894 58.8241 117.909C58.9107 117.909 58.9985 117.91 59.0861 117.909C65.784 117.894 71.3462 112.897 72.5133 106.301C73.9562 98.1514 77.8107 90.3648 84.088 84.0877C90.3661 77.8095 98.1517 73.956 106.302 72.513C112.897 71.346 117.894 65.7829 117.91 59.0858C117.91 58.9991 117.91 58.9106 117.91 58.824C117.895 52.126 112.897 46.5637 106.302 45.3967C98.1517 43.9537 90.3652 40.0992 84.088 33.8221C77.8107 27.5449 73.9562 19.7583 72.5133 11.6083C71.3462 5.01277 65.784 0.0151682 59.0861 0.000411711C58.9994 0.000411711 58.9116 -0.000514639 58.8241 0.000411711C52.1262 0.0151682 46.5638 5.01277 45.3968 11.6083ZM78.8897 39.0204C89.8996 50.0301 89.8996 67.8797 78.8897 78.8894C67.88 89.8992 50.0303 89.8992 39.0205 78.8894C28.0106 67.8797 28.0106 50.0301 39.0205 39.0204C50.0303 28.0106 67.88 28.0106 78.8897 39.0204Z"/>' +
    '</svg>';

  var ICON_FILTER =
    '<svg width="14" height="14" viewBox="0 0 14 14" fill="none">' +
      '<path d="M2 3.5h10M4 7h6M6 10.5h2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
    '</svg>';

  // ─── Toast ─────────────────────────────────────────────────────────────────
  function showToast(msg, duration) {
    if (typeof EAP !== 'undefined' && typeof EAP.toast === 'function') {
      EAP.toast({ icon: 'sparkle', message: msg, duration: duration || 3500 });
      return;
    }
    var rack = document.getElementById('cmd-toast-rack');
    if (!rack) {
      rack = document.createElement('div');
      rack.id = 'cmd-toast-rack';
      document.body.appendChild(rack);
    }
    Array.prototype.slice.call(rack.children).forEach(function (t) { t.parentNode.removeChild(t); });
    var t = document.createElement('div');
    t.className = 'cmd-toast';
    t.innerHTML = ICON_OTTO + '<span>' + msg + '</span>';
    rack.appendChild(t);
    var gone = false;
    function dismiss() {
      if (gone) return; gone = true;
      t.classList.add('out');
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 200);
    }
    setTimeout(dismiss, duration || 3500);
  }

  // ─── Page detection ────────────────────────────────────────────────────────
  function isApp() { return window.location.href.indexOf('home.html') === -1; }

  function currentPersonaKey() {
    try {
      var p = new URLSearchParams(window.location.search).get('p');
      return p || localStorage.getItem('eap.persona') || 'ananya';
    } catch (e) { return 'ananya'; }
  }

  // ─── Otto actions ──────────────────────────────────────────────────────────
  function actionWsjf() {
    if (isApp()) {
      EAP.setTab('backlog');
      setTimeout(function () {
        showToast('✦ WSJF rankings recomputed — 3 features reordered');
        document.querySelectorAll('.dtbl tbody tr').forEach(function (row, i) {
          setTimeout(function () {
            row.style.transition = 'background 0.35s';
            row.style.background = 'rgba(22,163,74,0.07)';
            setTimeout(function () { row.style.background = ''; }, 500);
          }, i * 55);
        });
      }, 300);
    } else {
      showToast('✦ WSJF recompute — opening Backlog');
      setTimeout(function () {
        window.location.href = 'index.html?p=' + currentPersonaKey() + '&tab=backlog';
      }, 800);
    }
  }

  function actionDeps() {
    if (!isApp()) return;
    EAP.setTab('hierarchy');
    setTimeout(function () {
      if (!EAP.state.insightsOpen) EAP.toggleInsights();
      showToast('✦ Otto: 4 cross-ART dependencies reviewed — 1 unblocked');
    }, 300);
  }

  function actionSprint() {
    if (!isApp()) return;
    EAP.setTab('taskboard');
    setTimeout(function () {
      if (!EAP.state.insightsOpen) EAP.toggleInsights();
      showToast('✦ Sprint summary ready — 18/24 pts · Day 7 of 10 · on pace');
    }, 300);
  }

  function actionPI() {
    if (!isApp()) return;
    EAP.setTab('planning');
    setTimeout(function () {
      if (!EAP.state.insightsOpen) EAP.toggleInsights();
      showToast('✦ PI Planner: 3 capacity adjustments recommended — DB ART at 118%');
    }, 300);
  }

  function actionSignals() {
    if (isApp()) {
      EAP.setTab('backlog');
      setTimeout(function () {
        showToast('✦ 22 customer signals bundled — Adaptive Biometric Re-enrolment · WSJF 12.4');
        setTimeout(function () {
          var row = document.querySelector('.dtbl tbody tr');
          if (row) {
            row.style.transition = 'background 0.4s';
            row.style.background = 'rgba(22,163,74,0.09)';
            setTimeout(function () { row.style.background = ''; }, 1400);
          }
        }, 200);
      }, 300);
    } else {
      var card = document.querySelector('.stat-card');
      if (card) {
        card.style.transition = 'box-shadow 0.3s,transform 0.3s';
        card.style.boxShadow = '0 0 0 2px rgba(22,163,74,0.4),0 4px 16px rgba(22,163,74,0.12)';
        card.style.transform = 'translateY(-1px)';
        setTimeout(function () { card.style.boxShadow = ''; card.style.transform = ''; }, 1200);
      }
      showToast('✦ 22 customer signals bundled — Adaptive Biometric Re-enrolment · WSJF 12.4');
    }
  }

  function actionStandup() {
    var brief = document.querySelector('.hero-card');
    if (brief) {
      brief.style.transition = 'box-shadow 0.3s';
      brief.style.boxShadow = '0 0 0 2px rgba(22,163,74,0.3),0 4px 16px rgba(22,163,74,0.10)';
      setTimeout(function () { brief.style.boxShadow = ''; }, 1200);
    }
    showToast('✦ Stand-up brief ready — 18/24 pts · auth token defect blocked · 3 PRs summarised');
  }

  function actionBlocked() {
    if (!isApp()) return;
    EAP.state.showDeps = true; EAP.state.depFilter = 'blocked'; EAP.render();
    showToast('Showing blocked items only', 2500);
  }

  function actionMine() {
    if (!isApp()) return;
    EAP.state.mineOnly = true; EAP.render();
    showToast('Filtered to your items', 2500);
  }

  function actionAll() {
    if (!isApp()) return;
    EAP.state.mineOnly = false; EAP.state.showDeps = false;
    EAP.state.depFilter = 'all'; EAP.render();
    showToast('Showing all items', 2500);
  }

  function actionInsights() {
    if (isApp()) EAP.toggleInsights();
  }

  // ─── Command registry ──────────────────────────────────────────────────────
  function buildCommands() {
    var p = currentPersonaKey();

    if (isApp()) {
      return [
        // Otto first — AI-native positioning
        { label: 'Recompute WSJF rankings',  cat: 'Otto',     kw: 'wsjf rank recompute priorit',ico: ICON_OTTO,   cls: 'is-otto',   fn: actionWsjf },
        { label: 'Triage dependencies',      cat: 'Otto',     kw: 'depend triage block dep',    ico: ICON_OTTO,   cls: 'is-otto',   fn: actionDeps },
        { label: 'Summarise sprint',         cat: 'Otto',     kw: 'sprint summary status',      ico: ICON_OTTO,   cls: 'is-otto',   fn: actionSprint },
        { label: 'PI Planner',               cat: 'Otto',     kw: 'pi plan planner increment',  ico: ICON_OTTO,   cls: 'is-otto',   fn: actionPI },
        { label: 'Bundle customer signals',  cat: 'Otto',     kw: 'bundle signal customer',     ico: ICON_OTTO,   cls: 'is-otto',   fn: actionSignals },
        // Navigate
        { label: 'Go to Backlog',            cat: 'Navigate', kw: 'backlog go',                 ico: ICON_NAV,    cls: '',          fn: function () { EAP.setTab('backlog'); } },
        { label: 'Go to Board',              cat: 'Navigate', kw: 'board kanban go',             ico: ICON_NAV,    cls: '',          fn: function () { EAP.setTab('board'); } },
        { label: 'Go to Task Board',         cat: 'Navigate', kw: 'task track taskboard go',     ico: ICON_NAV,    cls: '',          fn: function () { EAP.setTab('taskboard'); } },
        { label: 'Go to Timeline',           cat: 'Navigate', kw: 'timeline gantt go',           ico: ICON_NAV,    cls: '',          fn: function () { EAP.setTab('timeline'); } },
        { label: 'Go to Planning',           cat: 'Navigate', kw: 'planning list go',            ico: ICON_NAV,    cls: '',          fn: function () { EAP.setTab('planning'); } },
        { label: 'Go to Hierarchy',          cat: 'Navigate', kw: 'hierarchy epic go',           ico: ICON_NAV,    cls: '',          fn: function () { EAP.setTab('hierarchy'); } },
        { label: 'Go to Home',               cat: 'Navigate', kw: 'home go',                     ico: ICON_NAV,    cls: '',          fn: function () { window.location.href = 'home.html?p=' + (EAP.state.persona || 'ananya'); } },
        // Filter
        { label: 'Show blocked items',       cat: 'Filter',   kw: 'blocked block show',          ico: ICON_FILTER, cls: 'is-filter', fn: actionBlocked },
        { label: 'Filter to my items',       cat: 'Filter',   kw: 'mine my filter',              ico: ICON_FILTER, cls: 'is-filter', fn: actionMine },
        { label: 'Show all items',           cat: 'Filter',   kw: 'all clear show reset',        ico: ICON_FILTER, cls: 'is-filter', fn: actionAll },
        { label: 'Toggle Insights panel',    cat: 'Filter',   kw: 'insights toggle panel',       ico: ICON_FILTER, cls: 'is-filter', fn: actionInsights }
      ];
    }

    return [
      // Otto first
      { label: 'Bundle customer signals',  cat: 'Otto',     kw: 'bundle signal customer', ico: ICON_OTTO, cls: 'is-otto', fn: actionSignals },
      { label: 'Recompute WSJF rankings',  cat: 'Otto',     kw: 'wsjf rank recompute',    ico: ICON_OTTO, cls: 'is-otto', fn: actionWsjf },
      { label: 'Generate stand-up brief',  cat: 'Otto',     kw: 'standup stand-up brief', ico: ICON_OTTO, cls: 'is-otto', fn: actionStandup },
      // Navigate
      { label: 'Open Backlog',             cat: 'Navigate', kw: 'backlog open go',        ico: ICON_NAV,  cls: '', fn: function () { window.location.href = 'index.html?p=' + p + '&tab=backlog'; } },
      { label: 'Open Board',               cat: 'Navigate', kw: 'board kanban open go',   ico: ICON_NAV,  cls: '', fn: function () { window.location.href = 'index.html?p=' + p + '&tab=board'; } },
      { label: 'Open Task Board',          cat: 'Navigate', kw: 'task track open go',     ico: ICON_NAV,  cls: '', fn: function () { window.location.href = 'index.html?p=' + p + '&tab=taskboard'; } },
      { label: 'Open Timeline',            cat: 'Navigate', kw: 'timeline gantt open go', ico: ICON_NAV,  cls: '', fn: function () { window.location.href = 'index.html?p=' + p + '&tab=timeline'; } },
      { label: 'Open Planning',            cat: 'Navigate', kw: 'planning open go',       ico: ICON_NAV,  cls: '', fn: function () { window.location.href = 'index.html?p=' + p + '&tab=planning'; } },
      { label: 'Open Hierarchy',           cat: 'Navigate', kw: 'hierarchy epic open go', ico: ICON_NAV,  cls: '', fn: function () { window.location.href = 'index.html?p=' + p + '&tab=hierarchy'; } }
    ];
  }

  // ─── Shared: filter ────────────────────────────────────────────────────────
  var _cmds     = [];
  var _filtered = [];
  var _sel      = 0;

  function applyFilter(q) {
    if (!q.trim()) return _cmds.slice();
    var lq = q.toLowerCase();
    return _cmds.filter(function (c) {
      return c.label.toLowerCase().indexOf(lq) !== -1 ||
             c.kw.toLowerCase().indexOf(lq)    !== -1;
    });
  }

  // Build grouped HTML for a results list (shared by overlay and dropdown)
  function buildResultsHtml(items, showTag) {
    if (!items.length) return '';
    var seen = [], groups = {};
    items.forEach(function (c, i) {
      if (!groups[c.cat]) { seen.push(c.cat); groups[c.cat] = []; }
      groups[c.cat].push({ c: c, i: i });
    });
    var html = '';
    seen.forEach(function (cat) {
      html += '<div class="cmd-cat">' + cat + '</div>';
      groups[cat].forEach(function (entry) {
        var sel = entry.i === 0 ? ' is-sel' : '';
        html += '<div class="cmd-item ' + entry.c.cls + sel + '" data-i="' + entry.i + '">' +
          '<span class="cmd-item-ico">' + entry.c.ico + '</span>' +
          '<span class="cmd-item-lbl">' + entry.c.label + '</span>' +
          (showTag ? '<span class="cmd-item-tag">' + cat + '</span>' : '') +
          '</div>';
      });
    });
    return html;
  }

  function wireItemClicks(container, onPick) {
    container.querySelectorAll('.cmd-item').forEach(function (item) {
      item.addEventListener('mousedown', function (e) {
        e.preventDefault();
        onPick(parseInt(item.dataset.i, 10));
      });
      item.addEventListener('mouseover', function () {
        _sel = parseInt(item.dataset.i, 10);
        updateSel(container);
      });
    });
  }

  function updateSel(container) {
    container.querySelectorAll('.cmd-item').forEach(function (item) {
      item.classList.toggle('is-sel', parseInt(item.dataset.i, 10) === _sel);
    });
    var sel = container.querySelector('.cmd-item.is-sel');
    if (sel) sel.scrollIntoView({ block: 'nearest' });
  }

  function execFiltered(idx) {
    var cmd = _filtered[idx];
    if (cmd) { close(); setTimeout(function () { cmd.fn(); }, 50); }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HOME — dropdown anchored below the omnibar
  // ══════════════════════════════════════════════════════════════════════════

  var _homeActive  = false;
  var _homeOnInput = null;
  var _homeOnKey   = null;
  var _homeOnBlur  = null;
  var _homeOrigChips = null;

  function openHome() {
    if (_homeActive) return;
    var input   = document.getElementById('omni-input');
    var chipsEl = document.getElementById('quick-chips');
    if (!input || !chipsEl) return;

    _homeActive    = true;
    _homeOrigChips = chipsEl.innerHTML;
    _cmds          = buildCommands();

    chipsEl.classList.add('cmd-mode');

    // Focus (safe: _homeActive guard prevents re-entry from focus event)
    if (document.activeElement !== input) input.focus();

    renderHomeDropdown(input.value);

    _homeOnInput = function () { renderHomeDropdown(input.value); };

    _homeOnKey = function (e) {
      if (e.key === 'Escape')    { e.preventDefault(); closeHome(); input.blur(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); _sel = Math.min(_sel + 1, _filtered.length - 1); updateSel(chipsEl); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); _sel = Math.max(_sel - 1, 0);                    updateSel(chipsEl); }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (_filtered.length) {
          execFiltered(_sel);
        } else {
          // No command match — fire Ask Otto with the raw query
          var q = input.value.trim();
          if (q) {
            closeHome();
            showToast('✦ Otto: answering "' + q + '"');
          }
        }
      }
    };

    // Delay so mousedown on a result fires before blur handler runs
    _homeOnBlur = function () {
      setTimeout(function () { if (_homeActive) closeHome(); }, 200);
    };

    input.addEventListener('input',   _homeOnInput);
    input.addEventListener('keydown', _homeOnKey);
    input.addEventListener('blur',    _homeOnBlur);
  }

  function closeHome() {
    if (!_homeActive) return;
    _homeActive = false;
    var input   = document.getElementById('omni-input');
    var chipsEl = document.getElementById('quick-chips');
    if (input) {
      input.removeEventListener('input',   _homeOnInput);
      input.removeEventListener('keydown', _homeOnKey);
      input.removeEventListener('blur',    _homeOnBlur);
    }
    if (chipsEl) {
      chipsEl.classList.remove('cmd-mode');
      if (_homeOrigChips !== null) { chipsEl.innerHTML = _homeOrigChips; _homeOrigChips = null; }
    }
  }

  function renderHomeDropdown(q) {
    var chipsEl = document.getElementById('quick-chips');
    if (!chipsEl) return;

    _filtered = applyFilter(q);
    _sel = 0;

    var html = buildResultsHtml(_filtered, false);

    // Ask Otto fallback — shown whenever there's a typed query
    if (q.trim()) {
      var escapedQ = q.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      html += '<div class="cmd-item is-otto cmd-ask-fallback" data-i="' +
        _filtered.length + '">' +
        '<span class="cmd-item-ico">' + ICON_OTTO + '</span>' +
        '<span class="cmd-item-lbl">Ask Otto: &ldquo;' + escapedQ + '&rdquo;</span>' +
      '</div>';
    } else if (!html) {
      html = '<div class="cmd-empty">Start typing to search commands</div>';
    }

    chipsEl.innerHTML = html;

    var allItems = _filtered.slice(); // copy before adding fallback action
    wireItemClicks(chipsEl, function (idx) {
      if (idx === allItems.length) {
        // Ask Otto fallback action
        var rawQ = (document.getElementById('omni-input') || {}).value || '';
        closeHome();
        if (rawQ.trim()) showToast('✦ Otto: answering "' + rawQ.trim() + '"');
      } else {
        execFiltered(idx);
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // APP — centered floating overlay
  // ══════════════════════════════════════════════════════════════════════════

  var _overlay = null;
  var _input   = null;

  function renderResults(q) {
    _filtered = applyFilter(q);
    _sel = 0;
    var el = _overlay && _overlay.querySelector('.cmd-results');
    if (!el) return;
    el.innerHTML = _filtered.length
      ? buildResultsHtml(_filtered, true)
      : '<div class="cmd-empty">No commands found</div>';
    wireItemClicks(el, execFiltered);
  }

  function onKey(e) {
    if (e.key === 'Escape')    { close(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); _sel = Math.min(_sel + 1, _filtered.length - 1); updateSel(_overlay.querySelector('.cmd-results')); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); _sel = Math.max(_sel - 1, 0);                    updateSel(_overlay.querySelector('.cmd-results')); }
    if (e.key === 'Enter')     { e.preventDefault(); execFiltered(_sel); }
  }

  function openApp() {
    if (_overlay) return;
    _overlay = document.createElement('div');
    _overlay.className = 'cmd-overlay';
    _overlay.innerHTML =
      '<div class="cmd-palette">' +
        '<div class="cmd-input-row">' +
          '<span class="cmd-input-ico">' + ICON_SEARCH + '</span>' +
          '<input id="cmd-input" class="cmd-input" type="text"' +
            ' placeholder="Type a command or search…" autocomplete="off" spellcheck="false">' +
          '<span class="cmd-esc">esc</span>' +
        '</div>' +
        '<div class="cmd-results"></div>' +
      '</div>';
    document.body.appendChild(_overlay);
    _input = _overlay.querySelector('#cmd-input');
    _input.focus();
    renderResults('');
    _input.addEventListener('input',   function () { renderResults(_input.value); });
    _input.addEventListener('keydown', onKey);
    _overlay.addEventListener('mousedown', function (e) { if (e.target === _overlay) close(); });
  }

  // ─── Unified open / close ──────────────────────────────────────────────────
  function open() {
    if (isApp()) {
      _cmds = buildCommands();
      if (_overlay) { close(); return; }
      openApp();
    } else {
      if (_homeActive) { closeHome(); return; }
      openHome();
    }
  }

  function close() {
    if (_overlay && _overlay.parentNode) _overlay.parentNode.removeChild(_overlay);
    _overlay = null; _input = null;
    closeHome();
  }

  // ─── Expose for Ask Otto button ────────────────────────────────────────────
  if (typeof EAP !== 'undefined') EAP.openCmdPalette = open;

  // ─── Wire omnibar focus on home (click → dropdown opens) ──────────────────
  var _omniInput = document.getElementById('omni-input');
  if (_omniInput) {
    _omniInput.addEventListener('focus', function () {
      if (!isApp()) openHome();
    });
  }

  // ─── Global Cmd+K ─────────────────────────────────────────────────────────
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      open();
    }
  });

})();
