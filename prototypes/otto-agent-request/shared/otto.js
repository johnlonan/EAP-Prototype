/* Shared behaviour: typing animation for the Otto bar and the chat composer. */
window.Otto = (function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); }

  // Click the box once: the text types itself in; then the send button turns active and waits for a click.
  function typer(opts) {
    var box = opts.box, out = opts.out, send = opts.send, text = opts.text;
    var state = 'idle', timer = null, shown = 0;
    function paint(final) {
      out.innerHTML = esc(text.slice(0, shown)) + (final ? '' : '<span class="ow-caret"></span>');
    }
    function done() {
      clearTimeout(timer); shown = text.length; state = 'ready'; paint(false);
      send.classList.add('is-ready'); send.setAttribute('aria-disabled', 'false');
      if (opts.onReady) opts.onReady();
    }
    function step() {
      if (shown >= text.length) return done();
      // Long answers type in chunks so any text lands in about a second
      shown = Math.min(text.length, shown + Math.max(1, Math.ceil(text.length / 70))); paint(false);
      var ch = text.charAt(shown - 1);
      var d = 8 + Math.random() * 8 + (text.length < 90 && /[.,]/.test(ch) ? 40 : 0);
      timer = setTimeout(step, reduce ? 0 : d);
    }
    function start() {
      if (state !== 'idle') return;
      state = 'typing'; box.classList.add('is-active'); paint(false);
      timer = setTimeout(step, reduce ? 0 : 200);
    }
    box.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('.ow-send')) return; start(); });
    box.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start(); } });
    send.addEventListener('click', function (e) {
      e.stopPropagation();
      if (state === 'idle') { start(); return; }
      if (state === 'typing') { done(); return; }
      if (state === 'ready') { state = 'sent'; send.classList.remove('is-ready'); if (opts.onSend) opts.onSend(text); }
    });
    return { start: start, state: function () { return state; }, reset: function () { clearTimeout(timer); state = 'idle'; shown = 0; box.classList.remove('is-active'); send.classList.remove('is-ready'); if (opts.onReset) opts.onReset(); } };
  }

  // Stream HTML text word by word into an element (keeps tags whole).
  function stream(el, html) {
    var tokens = html.match(/<[^>]+>|[^<\s]+\s*|\s+/g) || [];
    var i = 0, acc = '';
    return new Promise(function (resolve) {
      (function next() {
        if (i >= tokens.length) { el.innerHTML = acc; return resolve(); }
        var t = tokens[i++]; acc += t;
        el.innerHTML = acc + (/^<\//.test(t) || /^</.test(t) ? '' : '') + '<span class="ow-stream-caret"></span>';
        if (/^<[^/]/.test(t) && !/\/>$/.test(t)) return next();
        setTimeout(next, reduce ? 0 : 22 + Math.random() * 26);
      })();
    });
  }
  // Small popup menu under a button: opens on click, closes on a second click, an outside click or Escape.
  function menu(btn, items, onPick) {
    var pop = null;
    function close() { if (pop) { pop.remove(); pop = null; btn.setAttribute('aria-expanded', 'false'); } }
    btn.setAttribute('aria-haspopup', 'menu'); btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (pop) return close();
      pop = document.createElement('ul'); pop.className = 'aiux-menu ow-pop'; pop.setAttribute('role', 'menu');
      pop.innerHTML = items.map(function (t, i) { return '<li role="menuitem"><a href="#" data-i="' + i + '">' + esc(t) + '</a></li>'; }).join('');
      var r = btn.getBoundingClientRect(), host = btn.closest('#proto-main') || document.body;
      host.appendChild(pop);
      var hr = host.getBoundingClientRect();
      pop.style.top = (r.bottom - hr.top + host.scrollTop + 4) + 'px';
      pop.style.left = Math.max(8, Math.min(r.left - hr.left, hr.width - 220)) + 'px';
      btn.setAttribute('aria-expanded', 'true');
      pop.addEventListener('click', function (ev) { var a = ev.target.closest('a'); if (!a) return; ev.preventDefault(); if (onPick) onPick(+a.dataset.i); close(); });
    });
    document.addEventListener('click', function (e) { if (pop && !pop.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }
  // Product navigation: give it the logo an instance would supply, and draw every icon as a line icon (the active Home stays filled).
  function brand() {
    customElements.whenDefined('aiux-nav-sidebar').then(function () {
      var nav = document.getElementById('proto-nav'); if (!nav) return;
      var logo = new URL('shared/img/servicenow.svg', document.baseURI).href;
      nav.companyLogo = logo; nav.companyLogoSm = logo; nav.productName = 'ServiceNow';      var svgText = null;
      fetch(logo).then(function (r) { return r.text(); }).then(function (t) { svgText = t; lines(nav.shadowRoot); }).catch(function () {});
      function inlineLogo(root) {
        var img = root.querySelector('img.logo-full-img'); if (!img || !svgText) return;
        if (img.nextElementSibling && img.nextElementSibling.classList.contains('ow-logo')) return;
        var span = document.createElement('span'); span.className = 'ow-logo'; span.setAttribute('role', 'img'); span.setAttribute('aria-label', 'ServiceNow'); span.innerHTML = svgText;
        img.style.display = 'none'; img.after(span);
      }
      function each(root, fn) { root.querySelectorAll('*').forEach(function (e) { fn(e); if (e.shadowRoot) each(e.shadowRoot, fn); }); }
      function lines(root) {
        if (!root) return; inlineLogo(root);
        each(root, function (e) {
          if (e.localName === 'use') {
            var h = e.getAttribute('href');
            if (h && h.indexOf('#fill-') > -1) e.setAttribute('href', h.replace('#fill-', '#outline-'));
          } else if (e.classList && e.classList.contains('nav-tabs-section')) {
            var w = e.closest('.section-wrapper') || e; if (w.style.display !== 'none') w.style.display = 'none';
          } else if (e.classList && e.classList.contains('user-section')) {
            var M = window.PROTO_DATA && window.PROTO_DATA.menu, row = e.parentElement && e.parentElement.parentElement;
            if (M && row && !(row.previousElementSibling && row.previousElementSibling.classList.contains('ow-nav-flows'))) {
              var fl = document.createElement('a'); fl.className = 'ow-nav-flows'; fl.href = M.menuPage;
              fl.innerHTML = '<aiux-icon name="arrow-left-outline" size="sm"></aiux-icon><span>' + esc(M.back) + '</span>'; row.before(fl);
            }
          } else if (e.classList && e.classList.contains('workspace-header')) {
            var tile = e.querySelector('aiux-app-tile'), lab = e.querySelector('.workspace-header-label');
            if (tile && lab && !(tile.nextElementSibling && tile.nextElementSibling.classList.contains('ow-tile'))) {
              var ini = lab.textContent.trim().split(/\s+/).map(function (x) { return x.charAt(0); }).join('').toUpperCase();
              var sp = document.createElement('span'); sp.className = 'ow-tile'; sp.textContent = ini; sp.setAttribute('aria-hidden', 'true');
              sp.style.cssText = 'flex:none;width:24px;height:24px;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;letter-spacing:.2px;color:#fff;background:' + (/Cost/.test(lab.textContent) ? '#e0529c' : 'var(--color-info)');
              tile.style.display = 'none'; tile.after(sp);
            }
            if (lab && !e.querySelector('.ow-chev')) {
              var ch = document.createElement('span'); ch.className = 'ow-chev'; ch.style.cssText = 'flex:none;display:inline-flex;color:var(--color-text-tertiary);margin-inline-start:auto';
              ch.innerHTML = '<aiux-icon name="chevron-down-outline" size="sm"></aiux-icon>'; lab.after(ch);
            }
          }
        });
      }
      var tries = 0, t = setInterval(function () {
        var r = nav.shadowRoot; if (!r) { if (++tries > 40) clearInterval(t); return; }
        clearInterval(t); lines(r);
        var st = document.createElement('style'); st.textContent = '.sidebar-search-toggle, .logo-toggle-stack { padding: 8px !important; } '+ '.sidebar-search-toggle { margin-inline-end: -10px; position: relative; z-index: 1; } .sidebar-logo { gap: 0 !important; } .sidebar-nav:not(.sidebar-collapsed) { width: 240px !important; } .ow-logo { display: inline-flex; align-items: center; padding: 0 6px; } .ow-logo svg { height: 18px; width: auto; display: block; } .sidebar-logo-images { padding-inline: 8px 0 !important; } .ow-logo { padding: 0 !important; } .ow-nav-flows { display: flex; align-items: center; gap: 8px; margin: 0 0 6px -4px; padding: 10px 10px; border-radius: 8px; font-size: 14px; text-decoration: none; color: var(--color-text-secondary); transition: background-color .2s, color .2s; } .ow-nav-flows:hover { background: color-mix(in oklch, var(--color-text-primary) 8%, transparent); color: var(--color-text-primary); } .user-avatar { background: var(--color-primary) !important; color: var(--color-primary-content, #fff) !important; } .user-avatar * { color: var(--color-primary-content, #fff) !important; } .user-avatar span.items-center { background: var(--color-primary) !important; }'; r.appendChild(st);
        new MutationObserver(function () { lines(r); }).observe(r, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
        setInterval(function () { lines(r); }, 500);
      }, 100);
    });
  }
  brand();
  return { menu: menu, esc: esc, wait: wait, typer: typer, stream: stream, reduce: reduce };
})();
