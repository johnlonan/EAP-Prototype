/* ═══════════════════════════════════════════════════════
   INSIGHTS.JS — Insights panel + gauge drawing
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

EAP.renderInsights = function() {
  var el = document.getElementById('insights-panel');
  if (!el) return;
  var d = EAP.getInsights();
  var h = '<div class="ins-hd"><span class="ins-hd-lbl">Insights</span><button class="ins-x" onclick="EAP.toggleInsights()">' + EAP.icon('x', 14) + '</button></div><div class="ins-scroll">';

  if (d.gauge) {
    h += '<div class="ins-gauge"><div class="ins-gauge-lbl">' + d.gauge.label + '</div>' +
      '<div class="g-wrap"><canvas id="gaugeCanvas" width="200" height="110" style="display:block;"></canvas>' +
      '<div class="g-ctr"><div class="g-val" id="gVal">' + d.gauge.value + '%</div><div class="g-sub">Allocated</div></div></div>' +
      '<div class="g-labels"><span>0</span><span>100</span></div></div>';
  }

  if (d.teams) {
    h += '<div class="ins-teams"><div class="ins-teams-lbl">Team Capacity</div>';
    d.teams.forEach(function(t) {
      var cls = t.status === 'over' ? 'over' : t.status === 'watch' ? 'watch' : 'healthy';
      var vc = t.status === 'over' ? ' danger' : t.status === 'watch' ? ' warn' : '';
      h += '<div class="team-row"><span class="team-row-name">' + t.name + '</span><div class="team-row-bar"><div class="team-row-fill ' + cls + '" style="width:' + Math.min(t.pct, 100) + '%"></div></div><span class="team-row-val' + vc + '">' + t.pct + '%</span></div>';
    });
    h += '</div>';
  }

  if (d.signals) {
    h += '<div class="ins-sec"><div class="ins-sec-lbl">Signals</div>';
    d.signals.forEach(function(s) {
      h += '<div class="ins-row ' + s.level + '"><div class="ins-t">' + s.title + '</div><div class="ins-s">' + s.desc + '</div>';
      if (s.action) h += '<a class="ins-a" href="#">' + s.action + '</a>';
      h += '</div>';
    });
    h += '</div>';
  }

  h += '</div>';
  el.innerHTML = h;
  if (d.gauge) setTimeout(function() { EAP.drawGauge(d.gauge.value); }, 50);
};

// Gauge drawing (Canvas API)
EAP.drawGauge = function(tv) {
  var c = document.getElementById('gaugeCanvas');
  if (!c) return;
  var dpr = window.devicePixelRatio || 1, W = 200, H = 110;
  c.width = W * dpr; c.height = H * dpr;
  c.style.width = W + 'px'; c.style.height = H + 'px';
  var x = c.getContext('2d');
  x.scale(dpr, dpr);
  var cx = W / 2, cy = H - 8, oR = 86, iR = 68, sA = Math.PI, eA = 2 * Math.PI;

  function gc(v) { return v <= 70 ? '#2E9E6B' : v <= 85 ? '#D97706' : '#CC0000'; }

  function draw(v) {
    x.clearRect(0, 0, W, H);
    var va = sA + (v / 100) * Math.PI, fc = gc(v);

    // Outer zone ring
    [{ f: 0, t: 0.70, c: '#2E9E6B' }, { f: 0.70, t: 0.85, c: '#D97706' }, { f: 0.85, t: 1, c: '#CC0000' }].forEach(function(z) {
      x.lineWidth = 8; x.lineCap = 'round';
      x.beginPath(); x.arc(cx, cy, oR, sA + Math.PI * z.f + 0.02, sA + Math.PI * z.t - 0.02);
      x.strokeStyle = z.c; x.globalAlpha = 0.22; x.stroke();
    });
    x.globalAlpha = 1;

    // Inner track
    x.lineWidth = 16; x.lineCap = 'round';
    x.beginPath(); x.arc(cx, cy, iR, sA, eA);
    x.strokeStyle = 'rgba(0,0,0,0.05)'; x.stroke();

    // Inner fill
    if (v > 0) { x.beginPath(); x.arc(cx, cy, iR, sA, va); x.strokeStyle = fc; x.stroke(); }

    // Dot indicator
    var dx = cx + iR * Math.cos(va), dy = cy + iR * Math.sin(va);
    x.beginPath(); x.arc(dx, dy, 8, 0, 2 * Math.PI); x.fillStyle = '#fff'; x.fill();
    x.beginPath(); x.arc(dx, dy, 8, 0, 2 * Math.PI); x.strokeStyle = fc; x.lineWidth = 3; x.stroke();
    x.beginPath(); x.arc(dx, dy, 4, 0, 2 * Math.PI); x.fillStyle = fc; x.fill();

    // Label
    var l = document.getElementById('gVal');
    if (l) { l.textContent = Math.round(v) + '%'; l.style.color = fc; }
  }

  // Animate
  var av = 0, st = tv / 45;
  var anim = setInterval(function() {
    av = Math.min(av + st, tv); draw(av);
    if (av >= tv) clearInterval(anim);
  }, 16);
};
