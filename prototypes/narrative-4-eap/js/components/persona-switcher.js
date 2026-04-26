/* ═══════════════════════════════════════════════════════
   PERSONA-SWITCHER.JS — Avatar in left nav opens a popover
   listing personas. Picking one navigates with ?p=<key>.
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

(function() {
  function close() {
    var pop = document.getElementById('persona-pop');
    if (pop) pop.remove();
    document.removeEventListener('keydown', onEsc);
    document.removeEventListener('click', onOutside, true);
  }
  function onEsc(e) { if (e.key === 'Escape') close(); }
  function onOutside(e) {
    var pop = document.getElementById('persona-pop');
    if (!pop) return;
    var wrap = document.querySelector('#left-nav .avatar-wrap');
    if (pop.contains(e.target) || (wrap && wrap.contains(e.target))) return;
    close();
  }

  EAP.initPersonaSwitcher = function() {
    var nav = document.getElementById('left-nav');
    if (!nav) return;
    var wrap = nav.querySelector('.avatar-wrap');
    if (!wrap) return;
    wrap.style.cursor = 'pointer';
    wrap.setAttribute('aria-haspopup', 'true');
    wrap.setAttribute('title', 'Switch persona');

    wrap.addEventListener('click', function(e) {
      e.stopPropagation();
      if (document.getElementById('persona-pop')) { close(); return; }

      var current = EAP.state && EAP.state.persona;
      var keys = Object.keys(EAP.personas || {});
      if (!keys.length) return;

      var rows = keys.map(function(k) {
        var p = EAP.personas[k];
        var active = k === current;
        return '<a href="index.html?p=' + k + '" class="persona-pop-row' + (active ? ' is-active' : '') + '" data-persona-key="' + k + '">' +
          '<img src="' + p.avatar + '" class="persona-pop-avatar" alt="">' +
          '<div class="persona-pop-info">' +
            '<span class="persona-pop-name">' + p.name + '</span>' +
            '<span class="persona-pop-role">' + p.role + '</span>' +
          '</div>' +
          (active ? '<span class="persona-pop-active" aria-label="Active">●</span>' : '') +
          '</a>';
      }).join('');

      var pop = document.createElement('div');
      pop.id = 'persona-pop';
      pop.className = 'persona-pop';
      pop.innerHTML = '<div class="persona-pop-hd">Switch persona</div>' + rows +
        '<a href="start.html" class="persona-pop-back">← Back to start</a>';
      document.body.appendChild(pop);

      // Position to the right of the nav avatar, anchored to its bottom
      var rect = wrap.getBoundingClientRect();
      pop.style.position = 'fixed';
      pop.style.left = (rect.right + 12) + 'px';
      pop.style.bottom = (window.innerHeight - rect.bottom) + 'px';

      // Persist persona before navigation
      pop.querySelectorAll('[data-persona-key]').forEach(function(a) {
        a.addEventListener('click', function() {
          var k = a.getAttribute('data-persona-key');
          try { localStorage.setItem('eap.persona', k); } catch (e) {}
        });
      });

      // Defer so this same click event doesn't immediately close us
      setTimeout(function() {
        document.addEventListener('keydown', onEsc);
        document.addEventListener('click', onOutside, true);
      }, 0);
    });
  };
})();
