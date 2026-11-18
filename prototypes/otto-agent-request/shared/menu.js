/* Menu page and starter pages: everything shown comes from PROTO_DATA.menu. */
(function () {
  var M = window.PROTO_DATA.menu;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var $ = function (id) { return document.getElementById(id); };

  function chrome(inner) {
    return '<header class="mn-top"><a class="mn-brand" href="' + M.menuPage + '" aria-label="' + esc(M.brand) + '"><span class="mn-logo" id="mn-logo" role="img" aria-label="' + esc(M.brand) + '"></span></a><span class="aiux-badge aiux-badge-soft aiux-badge-neutral aiux-badge-sm">' + esc(M.tag) + '</span></header>' + inner;
  }
  function logo() {
    fetch(new URL('shared/img/servicenow.svg', document.baseURI).href).then(function (r) { return r.text(); }).then(function (t) { var l = $('mn-logo'); if (l) l.innerHTML = t; }).catch(function () {});
  }

  function menu() {
    try { sessionStorage.removeItem('proto.ad.state'); sessionStorage.removeItem('proto.ad.took'); sessionStorage.removeItem('proto.ad.pin'); } catch (e) {}
    var cards = M.cards.map(function (c, i) {
      return '<a class="mn-card mn-' + esc(c.art) + '" style="--d:' + (160 + i * 90) + 'ms" href="' + esc(c.href) + '">'
        + '<div class="mn-body"><div class="mn-meta"><span class="mn-head"><span class="mn-num">' + esc(c.n) + '</span></span><span class="mn-chan is-' + esc(c.hue) + '">' + esc(c.channel) + '</span></div>'
        + '<h2 class="mn-ct">' + esc(c.title) + '</h2><p class="mn-cb">' + esc(c.blurb) + '</p>'
        + '<div class="mn-foot"><span class="mn-who">' + esc(c.who) + '</span><span class="mn-go">' + esc(M.cta) + '<aiux-icon name="arrow-right" size="sm"></aiux-icon></span></div></div></a>';
    }).join('');
    $('app').innerHTML = chrome('<section class="mn-hero"><p class="mn-eyebrow">' + esc(M.eyebrow) + '</p><h1 class="mn-title">' + esc(M.title) + '</h1><p class="mn-sub">' + esc(M.sub) + '</p></section><main class="mn-grid">' + cards + '</main><p class="mn-hint">' + esc(M.hint) + '</p>');
    logo();
  }

  function starter() {
    var key = new URLSearchParams(location.search).get('f'), st = M.stories[key];
    if (!st) { location.replace(M.menuPage); return; }
    var n = 0;
    var parts = st.parts.map(function (p) {
      return '<section class="mn-part"><h2 class="mn-ph">' + esc(p.h) + '</h2><ol class="mn-steps">' + p.steps.map(function (t) { n++; return '<li><span class="mn-sn">' + n + '</span><span>' + esc(t) + '</span></li>'; }).join('') + '</ol></section>';
    }).join('');
    document.title = st.title;
    $('app').innerHTML = chrome('<a class="mn-back" href="' + M.menuPage + '"><aiux-icon name="arrow-left" size="sm"></aiux-icon>' + esc(M.back) + '</a>'
      + '<section class="mn-hero mn-hero-s"><p class="mn-eyebrow">' + esc(st.channel) + '</p><h1 class="mn-title">' + esc(st.title) + '</h1><p class="mn-sub">' + esc(st.intro) + '</p></section>'
      + '<div class="mn-split"><div class="mn-story"><p class="mn-src">' + esc(st.source) + '</p>' + parts + '</div>'
      + '<aside class="mn-soon"><h2 class="mn-ct">' + esc(M.soon.h) + '</h2><p class="mn-cb">' + esc(M.soon.p) + '</p></aside></div>');
    logo();
  }
  window.MenuPage = { menu: menu, starter: starter };
})();
