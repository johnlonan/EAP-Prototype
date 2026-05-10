/* ═══════════════════════════════════════════════════════════════════
   INTERACTIONS-PASS.JS — Phase 1 + Phase 2 helpers

   Phase 1:
   - EAP.toast(opts)             — toast notification queue
   - EAP.handleInsightClick(...) — defined IMMEDIATELY at script load so
                                    inline onclick="..." works no matter when
                                    the script loads relative to the render.
                                    Delegates to EAP.openDetail (battle-tested).
   - Loadtime toast if persona auto-applies a filter on entry.

   Phase 2:
   - EAP.tooltip mounted on body, JS-positioned. Works regardless of
     parent overflow:hidden. Triggered by hovering any [data-tip] element.

   Reversal:
   - Phase 1 — remove this <script> + interactions.css <link> from index.html
   - Phase 2 — delete the tooltip block below + the PHASE 2 block in css
   ═══════════════════════════════════════════════════════════════════ */

var EAP = EAP || {};


// ─────────────────────────────────────────────────────────────────────
// PHASE 1 — Toast queue
// ─────────────────────────────────────────────────────────────────────
EAP.toast = function(opts) {
  opts = opts || {};
  var msg = opts.message || '';
  var duration = opts.duration || 4000;
  var actionLabel = opts.action && opts.action.label;
  var actionFn = opts.action && opts.action.run;

  var container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    (document.body || document.documentElement).appendChild(container);
  }

  // Single-toast policy — clear any existing toast before showing the new one
  // so two messages never stack on top of each other (which read as "duplicate").
  Array.prototype.slice.call(container.querySelectorAll('.toast')).forEach(function(t) {
    t.parentNode.removeChild(t);
  });

  var toast = document.createElement('div');
  toast.className = 'toast';
  var iconHtml = (opts.icon && EAP.icon) ? '<span class="toast-icon">' + EAP.icon(opts.icon, 14) + '</span>' : '';
  toast.innerHTML =
    iconHtml +
    '<span class="toast-msg">' + msg + '</span>' +
    (actionLabel ? '<button class="toast-action">' + actionLabel + '</button>' : '');
  container.appendChild(toast);

  var dismissed = false, dismissTimer;
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    clearTimeout(dismissTimer);
    toast.classList.add('dismissing');
    setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 220);
  }
  dismissTimer = setTimeout(dismiss, duration);

  if (actionLabel && actionFn) {
    var btn = toast.querySelector('.toast-action');
    if (btn) btn.addEventListener('click', function() { try { actionFn(); } catch (e) {} dismiss(); });
  }
  return { dismiss: dismiss };
};


// ─────────────────────────────────────────────────────────────────────
// PHASE 1 — Insight click handler
// Defined at top level (not inside an IIFE / DOMContentLoaded guard) so
// the inline onclick="..." in rendered HTML can call it immediately,
// regardless of script load timing.
// ─────────────────────────────────────────────────────────────────────
EAP.handleInsightClick = function(ev, target, name) {
  try {
    // Don't hijack inner action links / snooze / dismiss buttons
    if (ev && ev.target && ev.target.closest && ev.target.closest('button, a')) return;
    // Delegate to the existing detail-panel mechanism (proven working).
    if (EAP.openDetail) EAP.openDetail(target);
    if (EAP.toast) EAP.toast({ icon: 'sparkle', message: 'Opened ' + name, duration: 2400 });
  } catch (e) {
    console.error('[insight-click] error:', e);
  }
};


// ─────────────────────────────────────────────────────────────────────
// PHASE 1 — Scroll-and-pulse helper (kept for direct use; not the
// default insight-click path anymore — openDetail is more reliable).
// ─────────────────────────────────────────────────────────────────────
EAP.scrollAndPulse = function(targetId) {
  if (!targetId) return null;
  var el =
    document.querySelector('[data-item-id="' + targetId + '"]') ||
    document.querySelector('[data-feature-id="' + targetId + '"]') ||
    document.getElementById('fcard-' + targetId) ||
    document.getElementById('tl-bar-' + targetId);
  if (!el) return null;
  try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { el.scrollIntoView(); }
  el.classList.remove('eap-pulse');
  void el.offsetWidth;
  el.classList.add('eap-pulse');
  setTimeout(function() { el.classList.remove('eap-pulse'); }, 1500);
  return el;
};


// PHASE 2 tooltip removed — superseded by the positioned #eap-tip / #eap-tip-arrow
// system in interactions.js which handles viewport bounds and arrow direction.


// ─────────────────────────────────────────────────────────────────────
// Insight click — capture-phase delegated listener registered IMMEDIATELY
// at script load. Capture phase means it runs BEFORE bubble-phase
// listeners on inner elements, so it cannot be blocked by any handler
// further down the tree.
// ─────────────────────────────────────────────────────────────────────
document.addEventListener('click', function(ev) {
  var card = ev.target.closest && ev.target.closest('[data-insight-target]');
  if (!card) return;
  if (ev.target.closest('button, a')) return;     // let inner action links / snooze do their own thing
  var target = card.getAttribute('data-insight-target');
  var name = card.getAttribute('data-insight-name') || target;
  if (typeof EAP.openDetail === 'function') EAP.openDetail(target);
  if (typeof EAP.toast === 'function') {
    EAP.toast({ icon: 'sparkle', message: 'Opened ' + name, duration: 2400 });
  }
}, true);   // ← capture phase — fires first, regardless of inner listeners


// ─────────────────────────────────────────────────────────────────────
// PHASE 5 — Counter animation
// ─────────────────────────────────────────────────────────────────────
EAP._countUp = function(target, duration, renderFn) {
  var start = null;
  function tick(ts) {
    if (start === null) start = ts;
    var t = Math.min((ts - start) / duration, 1);
    var eased = 1 - Math.pow(1 - t, 3);
    renderFn(Math.round(target * eased));
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
};

EAP.phase5Animate = function() {
  var panel = document.getElementById('insights-panel');
  if (!panel) return;

  var heroEl = panel.querySelector('.ins-hero-val');
  if (heroEl) {
    var target = parseInt(heroEl.textContent, 10);
    if (!isNaN(target) && target > 0) {
      var suffix = heroEl.innerHTML.replace(/^\d+/, '');
      EAP._countUp(target, 900, function(v) { heroEl.innerHTML = v + suffix; });
    }
  }

  panel.querySelectorAll('.ins-metric-val').forEach(function(el) {
    var raw = parseInt(el.textContent, 10);
    if (isNaN(raw) || raw <= 0) return;
    var suffix2 = el.innerHTML.replace(/^\d+/, '');
    EAP._countUp(raw, 600, function(v) { el.innerHTML = v + suffix2; });
  });

  var ppct = panel.querySelector('.ins-member-ppct');
  if (ppct) {
    var m = ppct.textContent.match(/^(\d+)(.*)/);
    if (m) {
      var pTarget = parseInt(m[1], 10);
      var rest = m[2];
      EAP._countUp(pTarget, 1000, function(v) { ppct.textContent = v + rest; });
    }
  }

  panel.querySelectorAll('.ins-member-num').forEach(function(el) {
    var raw2 = parseInt(el.textContent, 10);
    if (isNaN(raw2) || raw2 === 0) return;
    EAP._countUp(raw2, 500, function(v) { el.textContent = v; });
  });
};


// ─────────────────────────────────────────────────────────────────────
// PHASE 6 — AI Signature: spring settle + word-stream
// ─────────────────────────────────────────────────────────────────────
EAP._wordStream = function(el, text, delay) {
  var words = text.split(' ');
  el.innerHTML = '';
  words.forEach(function(word, i) {
    var span = document.createElement('span');
    span.className = 'ai-word';
    span.textContent = word + (i < words.length - 1 ? ' ' : '');
    el.appendChild(span);
  });
  var spans = el.querySelectorAll('.ai-word');
  words.forEach(function(_, i) {
    setTimeout(function() {
      if (spans[i]) spans[i].classList.add('vis');
    }, delay + i * 30);
  });
};

EAP.phase6Animate = function() {
  var panel = document.getElementById('insights-panel');
  if (!panel) return;
  var aiCards = panel.querySelectorAll('.ins-sig-ai');
  if (!aiCards.length) return;
  Array.prototype.forEach.call(aiCards, function(card, cardIdx) {
    var cardDelay = cardIdx * 80;
    card.classList.add('ai-entering');
    setTimeout(function() {
      card.classList.remove('ai-entering');
      card.classList.add('ai-arrived');
    }, cardDelay);
    var lines = card.querySelectorAll('.ins-sig-title, .ins-sig-desc, .ins-sig-action, .ins-sig-why');
    Array.prototype.forEach.call(lines, function(line, lineIdx) {
      line.style.opacity = '0';
      line.style.transform = 'translateY(4px)';
      line.style.transition = 'none';
      (function(el, delay) {
        setTimeout(function() {
          el.style.transition = 'opacity 220ms ease, transform 220ms ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, delay);
      })(line, cardDelay + 100 + lineIdx * 70);
    });
  });
};
