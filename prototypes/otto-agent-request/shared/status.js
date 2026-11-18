/* Flow 4: Josh is in a chat with a colleague, Moveworks alerts him, he opens it, and the project update arrives
   at the end of the same conversation in which he raised the demand. */
(function () {
  var M = window.PROTO_DATA.menu, T = M.teams, S = M.status, D = window.PROTO_DATA.start, E = Otto.esc, wait = Otto.wait;
  var $ = function (id) { return document.getElementById(id); }, feed = $('feed');
  var rail = ['bell-outline', 'chat-outline', 'user-group-outline', 'calendar-outline', 'phone-outline', 'cloud-outline', 'document-blank-outline'];
  var chev = '<svg viewBox="0 0 24 24" width="__N__" height="__N__" aria-hidden="true"><path d="M6 6l6 6-6 6M12 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var botIcon = chev.replace(/__N__/g, '16').replace('currentColor', '#fff');
  var bot = '<span class="tm-bot tm-bot-s" aria-hidden="true">' + botIcon + '</span>';
  function drawRail(on, dot) {
    $('rail').innerHTML = rail.map(function (n, i) { return '<span class="tm-r' + ((i === 1 && on === 'chat') || (i === 2 && on === 'teams') ? ' is-on' : '') + (i === 0 && dot ? ' has-dot' : '') + '"><aiux-icon name="' + n + '" size="md"></aiux-icon></span>'; }).join('')
      + '<span class="tm-r' + (on === 'bot' ? ' is-on' : '') + '">' + chev.replace(/__N__/g, '20') + '</span>'
      + '<span class="tm-r"><aiux-icon name="plus" size="md"></aiux-icon></span><span class="tm-r"><aiux-icon name="ellipsis-h" size="md"></aiux-icon></span>'
      + '<a class="tm-flows" href="' + M.menuPage + '" aria-label="' + E(M.back) + '" title="' + E(M.back) + '"><aiux-icon name="arrow-left-outline" size="sm"></aiux-icon><span>' + E(M.back) + '</span></a>';
  }
  function drawHead() {
    $('head').innerHTML = '<span class="tm-bot" aria-hidden="true">' + chev.replace(/__N__/g, '20').replace('currentColor', '#fff') + '</span><strong class="tm-name">' + E(T.app) + '</strong>'
      + '<nav class="tm-tabs">' + T.tabs.map(function (t, i) { return '<span class="tm-tab' + (i === 0 ? ' is-on' : '') + '">' + E(t) + '</span>'; }).join('') + '</nav>'
      + '<span class="tm-ic tm-more"><aiux-icon name="ellipsis-h" size="sm"></aiux-icon></span>';
  }
  $('top').innerHTML = '<div class="tm-tl"><span class="tm-ic"><aiux-icon name="panel-display-left" size="sm"></aiux-icon></span></div>'
    + '<div class="tm-tc"><span class="tm-ic"><aiux-icon name="arrow-left-outline" size="sm"></aiux-icon></span><span class="tm-ic is-dim"><aiux-icon name="arrow-right-outline" size="sm"></aiux-icon></span>'
    + '<div class="tm-search"><aiux-icon name="magnifying-glass" size="sm"></aiux-icon><span>' + E(T.search) + '</span></div></div>'
    + '<div class="tm-tr"><span class="tm-ic"><aiux-icon name="ellipsis-h" size="sm"></aiux-icon></span><span class="tm-avatar">' + E(T.me) + '<i></i></span></div>';

  function scroll() { feed.scrollTo({ top: feed.scrollHeight, behavior: Otto.reduce ? 'auto' : 'smooth' }); }
  function add(html, cls) { var el = document.createElement('div'); el.className = 'tm-row ' + (cls || ''); el.innerHTML = html; feed.appendChild(el); scroll(); return el; }
  function day(t) { feed.insertAdjacentHTML('beforeend', '<div class="tm-day">' + E(t) + '</div>'); }
  function botMsg(body, stamp) { return add(bot + '<div class="tm-col"><div class="tm-meta">' + E(T.app) + ' &nbsp;' + E(stamp) + '</div><div class="tm-card">' + body + '</div></div>'); }
  function meMsg(text, stamp) { return add('<div class="tm-col tm-me"><div class="tm-meta">' + E(stamp) + '</div><div class="tm-bubble">' + E(text) + '</div></div>', 'tm-right'); }
  function toast(t) { var n = $('tm-toast'); n.textContent = t; n.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { n.classList.remove('on'); }, 2200); }
  $('tm-text').innerHTML = '<span class="ph">' + E(T.placeholder) + '</span>';

  // ---- the earlier Moveworks conversation (same demand as flow 2) ----
  var DR = D.draft, SP = D.specialist, P = S.project, pill = function (tone, t) { return '<span class="tm-pill is-' + tone + '">' + E(t) + '</span>'; };
  function demandCard() {
    var rq = DR.meta[0], ins = DR.insight.submitted;
    return '<div class="tm-dm"><div class="tm-dm-top">' + pill('ok', DR.status.submitted) + '<a class="tm-lnk" href="#" data-soon="1">' + E(DR.number) + '</a><span class="tm-dm-grp">' + E(DR.meta[2].label) + ' <b>' + E(DR.meta[2].value) + '</b></span></div>'
      + '<h4>' + E(DR.fields[0].value) + '</h4><p class="tm-dm-sub"><b>' + E(rq.value) + '</b> ' + E(rq.sub) + ' · ' + E(DR.meta[1].value) + '</p>'
      + '<dl class="tm-kv">' + DR.fields.slice(1).map(function (f) { return '<div><dt>' + E(f.label) + '</dt><dd>' + E(f.value) + '</dd></div>'; }).join('') + '</dl>'
      + '<div class="tm-note is-submitted"><b>' + E(ins.title) + '</b><span>' + E(ins.sub) + '</span></div></div>';
  }
  function history() {
    var picked = T.reply.items[T.reply.picked];
    day(S.past.day);
    meMsg(T.typed, S.past.stamp);
    botMsg('<p>' + E(T.reply.intro) + '</p><p><strong>' + E(picked.title) + '</strong><br>' + E(picked.desc) + '</p>', S.past.stamp);
    botMsg('<p>' + SP.done + '</p>' + demandCard(), S.past.doneStamp);
  }

  // ---- the update ----
  function message() {
    return '<p class="tm-hello">' + S.intro + '</p>'
      + '<div class="tm-dm"><div class="tm-dm-top"><span class="tm-pill is-ok">' + E(P.pill) + '</span><a class="tm-lnk" href="#" data-soon="1">' + E(P.number) + '</a></div>'
      + '<h4>' + E(P.title) + '</h4><p class="tm-dm-sub">' + E(P.sub) + '</p>'
      + '<dl class="tm-kv">' + P.fields.map(function (f) { return '<div><dt>' + E(f.label) + '</dt><dd>' + E(f.value) + '</dd></div>'; }).join('') + '</dl></div>'
      + '<p class="tm-next-h">' + E(S.next.title) + '</p>'
      + '<ol class="tm-next">' + S.next.items.map(function (t, i) { return '<li><span>' + (i + 1) + '.</span><span>' + E(t) + '</span></li>'; }).join('') + '</ol>'
      + '<div class="tm-acts">' + S.actions.map(function (a, i) { return '<button class="tm-btn' + (i === 0 ? ' is-primary' : '') + '" type="button" data-soon="1">' + E(a) + '</button>'; }).join('') + '</div>'
      + '<div class="tm-foot"><aiux-icon name="thumbs-up-outline" size="sm"></aiux-icon><aiux-icon name="thumbs-down-outline" size="sm"></aiux-icon></div><p class="tm-ai">' + E(S.ai) + '</p>';
  }

  // ---- scene 1: Josh in a Teams channel (Shared tab) ----
  var C = S.scene, ic = function (n, s) { return '<aiux-icon name="' + n + '" size="' + (s || 'sm') + '"></aiux-icon>'; };
  function drawScene() {
    var sd = C.side;
    var teams = sd.teams.map(function (tm, i) {
      return '<div class="tm-st"><span class="tm-st-i">' + E(tm.initials) + '</span><span>' + E(tm.name) + '</span></div>'
        + (tm.channels.length ? tm.channels.map(function (c, k) { return '<div class="tm-sc' + (i === 0 && k === tm.active ? ' is-on' : '') + '">' + E(c) + '</div>'; }).join('') + '<div class="tm-sl">' + E(sd.all) + '</div>' : '');
    }).join('');
    var side = '<aside class="tm-side"><div class="tm-side-h"><strong>' + E(sd.title) + '</strong><span>' + ic('ellipsis-h') + ic('plus') + '</span></div>'
      + '<div class="tm-sg">' + E(sd.pinned) + '</div><div class="tm-st"><span class="tm-st-i">' + E(sd.pinnedItem.name.slice(0, 1)) + '</span><span><b>' + E(sd.pinnedItem.name) + '</b><small>' + E(sd.pinnedItem.sub) + '</small></span></div>'
      + '<div class="tm-sg">' + E(sd.yours) + '</div>' + teams + '</aside>';
    var tabs = C.tabs.map(function (tb, i) { return '<span class="tm-tab' + (i === C.activeTab ? ' is-on' : '') + '">' + E(tb) + '</span>'; }).join('');
    var filters = C.filters.map(function (f, i) { return '<span class="tm-pillf' + (i === C.activeFilter ? ' is-on' : '') + '">' + E(f) + '</span>'; }).join('');
    var rows = C.files.map(function (f) { return '<div class="tm-fr"><span class="tm-fi">' + ic('document-blank-outline', 'md') + '</span><span class="tm-fn"><b>' + E(f.name) + '</b><small>' + E(f.where) + '</small></span><span>' + E(f.when) + '</span><span>' + E(f.by) + '</span></div>'; }).join('');
    $('scene').innerHTML = side + '<section class="tm-content"><header class="tm-head"><span class="tm-pp tm-pp-sq" aria-hidden="true">' + E(C.teamInitials) + '</span><strong class="tm-name">' + E(C.channel) + '</strong><nav class="tm-tabs">' + tabs + '</nav></header>'
      + '<div class="tm-filters">' + filters + '<span class="tm-find">' + E(C.filterPlaceholder) + '</span></div>'
      + '<div class="tm-ft"><div class="tm-fh"><span></span><span>' + E(C.cols[0]) + '</span><span>' + E(C.cols[1]) + '</span><span>' + E(C.cols[2]) + '</span></div>' + rows + '</div></section>';
  }
  drawRail('teams', false); drawScene();

  var opened = false, n = $('tm-notif');
  async function open() {
    if (opened) return; opened = true; n.classList.remove('on'); n.classList.remove('is-live');
    $('scene').hidden = true; $('main').hidden = false;
    drawRail('bot', false); drawHead(); feed.innerHTML = '';
    history(); feed.scrollTop = feed.scrollHeight;
    await wait(1400); day(S.day); scroll();
    var th = botMsg('<span class="tm-think"><span class="dots"><i></i><i></i><i></i></span></span>', S.stamp);
    await wait(1400);
    th.querySelector('.tm-card').innerHTML = message();
    var col = th.querySelector('.tm-col');
    if (col.offsetHeight > feed.clientHeight - 60) feed.scrollTo({ top: th.offsetTop - 16, behavior: Otto.reduce ? 'auto' : 'smooth' }); else scroll();
  }
  (async function () {
    await wait(2600);
    n.innerHTML = '<div class="tm-notif-h"><span>' + E(S.banner.source) + '</span><i>' + ic('ellipsis-h') + ic('close') + '</i></div><div class="tm-notif-b"><span class="tm-bot" aria-hidden="true">' + botIcon + '</span><div class="tm-notif-t"><b>' + E(S.banner.app) + '</b><span>' + E(S.banner.text) + '</span></div></div>';
    n.classList.add('on'); n.classList.add('is-live'); drawRail('teams', true);
    n.setAttribute('role', 'button'); n.setAttribute('tabindex', '0');
    n.addEventListener('click', open); n.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') open(); });
    $('rail').addEventListener('click', function (e) { if (e.target.closest('.has-dot')) open(); });
  })();
  feed.addEventListener('click', function (e) { if (e.target.closest('[data-soon]')) { e.preventDefault(); toast(S.toast); } });
})();
