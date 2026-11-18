/* Teams + Moveworks: Josh starts a request and the whole demand, from intake to validation, stays in the Teams conversation. */
(function () {
  var M = window.PROTO_DATA.menu, T = M.teams, D = window.PROTO_DATA.start, E = Otto.esc, wait = Otto.wait;
  var $ = function (id) { return document.getElementById(id); }, feed = $('feed');
  var rail = ['bell-outline', 'chat-outline', 'user-group-outline', 'calendar-outline', 'phone-outline', 'cloud-outline', 'document-blank-outline'];
  var chev = '<svg viewBox="0 0 24 24" width="__N__" height="__N__" aria-hidden="true"><path d="M6 6l6 6-6 6M12 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  $('rail').innerHTML = rail.map(function (n) { return '<span class="tm-r"><aiux-icon name="' + n + '" size="md"></aiux-icon></span>'; }).join('')
    + '<span class="tm-r is-on" aria-current="page">' + chev.replace(/__N__/g, '20') + '</span>'
    + '<span class="tm-r"><aiux-icon name="plus" size="md"></aiux-icon></span><span class="tm-r"><aiux-icon name="ellipsis-h" size="md"></aiux-icon></span>'
    + '<a class="tm-flows" href="' + M.menuPage + '" aria-label="' + E(M.back) + '" title="' + E(M.back) + '"><aiux-icon name="arrow-left-outline" size="sm"></aiux-icon><span>' + E(M.back) + '</span></a>';
  $('top').innerHTML = '<div class="tm-tl"><span class="tm-ic"><aiux-icon name="panel-display-left" size="sm"></aiux-icon></span></div>'
    + '<div class="tm-tc"><span class="tm-ic"><aiux-icon name="arrow-left-outline" size="sm"></aiux-icon></span><span class="tm-ic is-dim"><aiux-icon name="arrow-right-outline" size="sm"></aiux-icon></span>'
    + '<div class="tm-search"><aiux-icon name="magnifying-glass" size="sm"></aiux-icon><span>' + E(T.search) + '</span></div></div>'
    + '<div class="tm-tr"><span class="tm-ic"><aiux-icon name="ellipsis-h" size="sm"></aiux-icon></span><span class="tm-avatar">' + E(T.me) + '<i></i></span></div>';
  $('head').innerHTML = '<span class="tm-bot" aria-hidden="true">' + chev.replace(/__N__/g, '20').replace('currentColor', '#fff') + '</span><strong class="tm-name">' + E(T.app) + '</strong>'
    + '<nav class="tm-tabs">' + T.tabs.map(function (t, i) { return '<span class="tm-tab' + (i === 0 ? ' is-on' : '') + '">' + E(t) + '</span>'; }).join('') + '</nav>'
    + '<span class="tm-ic tm-more"><aiux-icon name="ellipsis-h" size="sm"></aiux-icon></span>';
  var bot = '<span class="tm-bot tm-bot-s" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 6l6 6-6 6M12 6l6 6-6 6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
  function scroll() { feed.scrollTo({ top: feed.scrollHeight, behavior: Otto.reduce ? 'auto' : 'smooth' }); }
  function add(html, cls) { var el = document.createElement('div'); el.className = 'tm-row ' + (cls || ''); el.innerHTML = html; feed.appendChild(el); scroll(); return el; }
  function botMsg(body, stamp) { return add(bot + '<div class="tm-col"><div class="tm-meta">' + E(T.app) + ' &nbsp;' + E(stamp) + '</div><div class="tm-card">' + body + '</div></div>'); }

  feed.innerHTML = '<div class="tm-empty" id="tm-empty"><img src="' + T.empty.img + '" alt="' + E(T.empty.title + '. ' + T.empty.sub) + '"></div>';

  var out = $('tm-text'), send = $('tm-send');
  function ph() { out.innerHTML = '<span class="ph">' + E(T.placeholder) + '</span>'; } ph();
  var busy = false;
  Otto.typer({ box: $('tm-box'), out: out, send: send, text: T.typed, onSend: async function (text) {
    busy = true; var em = $('tm-empty'); if (em) em.remove(); out.innerHTML = ''; ph(); $('tm-box').classList.remove('is-active');
    feed.insertAdjacentHTML('beforeend', '<div class="tm-day">' + E(T.today) + '</div>');
    add('<div class="tm-col tm-me"><div class="tm-meta">' + E(T.stamp) + '</div><div class="tm-bubble">' + E(text) + '</div></div>', 'tm-right');
    await wait(500);
    var th = botMsg('<span class="tm-think"><span class="dots"><i></i><i></i><i></i></span><span class="ow-shimmer">' + E(T.thinking) + '</span></span>', T.reply.stamp);
    await wait(1700);
    var r = T.reply;
    th.querySelector('.tm-card').innerHTML = '<p>' + E(r.intro) + '</p><ol class="tm-list">' + r.items.map(function (it) { return '<li><strong>' + E(it.title) + '</strong></li>'; }).join('') + '</ol>'
      + r.items.map(function (it, i) { return '<div class="tm-opt"><strong>' + E(it.title) + '</strong><span>' + E(it.desc) + '</span><button class="tm-btn" type="button" data-i="' + i + '">' + E(r.cta) + '</button></div>'; }).join('')
      + '<div class="tm-foot"><aiux-icon name="thumbs-up-outline" size="sm"></aiux-icon><aiux-icon name="thumbs-down-outline" size="sm"></aiux-icon><a href="#" class="tm-help">' + E(r.help) + '</a></div><p class="tm-ai">' + E(r.ai) + '</p>';
    scroll(); busy = false;
  } });

  var SP = D.specialist, DR = D.draft, R = SP.review, F = T.flow, si = 0;
  function stamp() { return F.stamps[Math.min(si++, F.stamps.length - 1)]; }
  function view(el) {
    var col = el.querySelector('.tm-col') || el;
    if (col.offsetHeight > feed.clientHeight - 60) feed.scrollTo({ top: el.offsetTop - 16, behavior: Otto.reduce ? 'auto' : 'smooth' }); else scroll();
  }
  function thinkHtml(t) { return '<span class="tm-think"><span class="dots"><i></i><i></i><i></i></span><span class="ow-shimmer">' + E(t) + '</span></span>'; }
  // A working line that cycles through short status phrases, then the message it sits in is rewritten.
  async function working(lines, gap) {
    var el = botMsg(thinkHtml(lines[0]), stamp()), tx = el.querySelector('.ow-shimmer');
    for (var i = 1; i < lines.length; i++) { await wait(gap); tx.textContent = lines[i]; tx.style.animation = 'none'; void tx.offsetWidth; tx.style.animation = ''; }
    await wait(gap); return el;
  }
  var pill = function (tone, t) { return '<span class="tm-pill is-' + tone + '">' + E(t) + '</span>'; };
  function demandCard(stage) {
    var rq = DR.meta[0], ins = DR.insight[stage];
    var tone = stage === 'submitted' ? 'ok' : stage === 'assigned' ? 'info' : 'neutral';
    var chip = stage === 'draft' ? '' : '<span class="tm-dm-grp">' + E(DR.meta[2].label) + ' <b>' + E(DR.meta[2].value) + '</b></span>';
    return '<div class="tm-dm"><div class="tm-dm-top">' + pill(tone, DR.status[stage]) + '<a class="tm-lnk" href="#">' + E(DR.number) + '</a>' + chip + '</div>'
      + '<h4>' + E(DR.fields[0].value) + '</h4><p class="tm-dm-sub"><b>' + E(rq.value) + '</b> ' + E(rq.sub) + ' · ' + E(DR.meta[1].value) + '</p>'
      + '<dl class="tm-kv">' + DR.fields.slice(1).map(function (f) { return '<div><dt>' + E(f.label) + '</dt><dd>' + E(f.value) + '</dd></div>'; }).join('') + '</dl>'
      + '<div class="tm-note is-' + stage + '"><b>' + E(ins.title) + '</b><span>' + E(ins.sub) + '</span></div></div>';
  }
  function reviewCard(done) {
    var total = R.present.length + R.missing.length, cnt = function (k, n, m) { return E(R.counts[k].replace('{n}', n).replace('{m}', m)); };
    var head = function (k, t, n, m) { return '<div class="tm-sec-h"><h5>' + E(t) + '</h5><span class="is-' + k + '">' + cnt(k, n, m) + '</span></div>'; };
    var pres = R.present.map(function (q) { return { l: q.label, t: q.by, tag: '' }; });
    if (done) pres = pres.concat(R.missing.map(function (q) { return { l: q.label, t: q.value, tag: R.sections.added }; }));
    var li = function (cls, icon, q) { return '<li class="' + cls + '"><aiux-icon name="' + icon + '" size="sm"></aiux-icon><span class="l">' + E(q.l) + '</span><span class="d">' + E(q.t) + (q.tag ? '<em>' + E(q.tag) + '</em>' : '') + '</span></li>'; };
    return '<div class="tm-dm tm-rv"><div class="tm-rv-h"><h4>' + E(R.title) + '</h4>' + pill(done ? 'ok' : 'warn', done ? R.status.done : R.status.needs) + '</div>'
      + '<p class="tm-dm-sub"><a class="tm-lnk" href="#">' + E(DR.number) + '</a> · ' + E(R.sub) + '</p>'
      + '<section class="tm-sec">' + head('present', R.sections.present, pres.length, total) + '<ul>' + pres.map(function (q) { return li('is-ok', R.icons.present, q); }).join('') + '</ul></section>'
      + (done ? '' : '<section class="tm-sec tm-sec-warn">' + head('missing', R.sections.missing, R.missing.length, total) + '<ul>' + R.missing.map(function (q) { return li('is-warn', R.icons.missing, { l: q.label, t: q.why }); }).join('') + '</ul></section>')
      + '<section class="tm-sec">' + head('filled', R.sections.filled, R.filled.length, R.filled.length) + '<dl class="tm-fill">' + R.filled.map(function (f) { return '<div><dt>' + E(f.label) + '</dt><dd><b>' + E(f.value) + '</b><span>' + E(f.why) + '</span></dd></div>'; }).join('') + '</dl></section></div>';
  }
  function userBubble(text) { add('<div class="tm-col tm-me"><div class="tm-meta">' + E(stamp()) + '</div><div class="tm-bubble">' + E(text) + '</div></div>', 'tm-right'); }
  function arm(text, onSend) {
    Otto.typer({ box: $('tm-box'), out: out, send: send, text: text, onSend: async function (t) {
      busy = true; out.innerHTML = ''; ph(); $('tm-box').classList.remove('is-active'); userBubble(t); await wait(500); await onSend(); busy = false; } });
  }
  var demandEl = null, stage = 'draft';
  function setStage(st) { stage = st; if (demandEl) demandEl.querySelector('.tm-card').innerHTML = demandCard(st); }
  function say(el, html) { el.querySelector('.tm-card').innerHTML = html; view(el); }
  function foot() { return '<div class="tm-foot"><aiux-icon name="thumbs-up-outline" size="sm"></aiux-icon><aiux-icon name="thumbs-down-outline" size="sm"></aiux-icon></div>'; }

  async function afterPick() {
    var w = await working(D.chat.loading1, 700); say(w, '<p>' + D.chat.reply1 + '</p>');
    arm(D.typed.second, async function () {
      var w2 = await working(D.chat.loading2, 800);
      say(w2, '<p>' + D.chat.reply2 + '</p>'); demandEl = w2; setStage('draft');
      await wait(100);
      var ph2 = await working(SP.phases, 1800); ph2.remove();
      setStage('assigned');
      var w3 = await working(SP.steps1, 700);
      say(w3, '<p>' + SP.ask + '</p>' + reviewCard(false));
      await wait(900); view(botMsg('<p>' + SP.question + '</p>', stamp()));
      arm(D.typed.third, async function () {
        var w4 = await working(SP.steps2, 700);
        say(w4, '<p>' + SP.done + '</p>' + reviewCard(true)); setStage('submitted');
      });
    });
  }
  feed.addEventListener('click', async function (e) {
    var b = e.target.closest('.tm-btn[data-i]'); if (!b || busy) return;
    if (+b.dataset.i !== T.reply.picked) { toast(T.toast); return; }
    busy = true; b.classList.add('is-picked'); b.disabled = true;
    await wait(500); await afterPick(); busy = false;
  });
  function toast(t) { var n = $('tm-toast'); n.textContent = t; n.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { n.classList.remove('on'); }, 2200); }
  $('tm-box').addEventListener('click', function () { /* typer handles it */ });
})();
