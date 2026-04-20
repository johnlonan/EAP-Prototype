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
      if (s.action) h += '<a class="ins-a" data-ins-action="' + s.action + '">' + s.action + ' →</a>';
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

// ── Toast notification ────────────────────────────────
EAP.showToast = function(msg, type) {
  var existing = document.querySelector('.eap-toast');
  if (existing) existing.remove();
  var t = document.createElement('div');
  t.className = 'eap-toast eap-toast-' + (type || 'info');
  t.innerHTML = EAP.icon(type === 'success' ? 'check-square' : 'info', 14) + ' ' + msg;
  document.body.appendChild(t);
  requestAnimationFrame(function() { t.classList.add('show'); });
  setTimeout(function() { t.classList.remove('show'); setTimeout(function() { t.remove(); }, 300); }, 3000);
};

// ── Insight action handler ────────────────────────────
EAP.wireInsightActions = function() {
  document.querySelectorAll('[data-ins-action]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var action = link.getAttribute('data-ins-action');

      // Map actions to behaviours
      if (action === 'Escalate now') {
        EAP.openDetail('f3'); // Payment Confirmation Flow is blocked
        EAP.showToast('Escalation initiated for Payment Confirmation Flow', 'success');
      } else if (action === 'Plan into PI 26') {
        EAP.openDetail('f7'); // Enhanced Biometric Auth Flow
        EAP.showToast('Enhanced Biometric Auth Flow opened for planning', 'info');
      } else if (action === 'Create Feature') {
        EAP.showToast('Feature creation flow would open here', 'info');
      } else if (action === 'Assign team') {
        EAP.openDetail('f6'); // Streamlined Onboarding
        EAP.showToast('Assign a team to Streamlined Onboarding Flow', 'info');
      } else if (action === 'View all blockers') {
        EAP.showToast('Showing 14 blocked stories across 4 teams', 'info');
      } else if (action === 'Rebalance Sprint 4') {
        EAP.showToast('Sprint 4 capacity rebalancing view would open here', 'info');
      } else if (action === 'Schedule defect sprint') {
        EAP.showToast('Defect sprint scheduling initiated for Fraud Team', 'success');
      } else {
        // Generic — show toast with the action text
        EAP.showToast(action + ' — action initiated', 'info');
      }
    });
  });
};
