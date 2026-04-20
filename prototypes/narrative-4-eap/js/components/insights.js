/* ═══════════════════════════════════════════════════════
   INSIGHTS.JS — AI insights panel, gauge, signals
   AI signals: ✦ sparkle, teal accent, confidence, source
   Rule-based signals: no sparkle, no confidence
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

EAP.renderInsights = function() {
  var el = document.getElementById('insights-panel');
  if (!el) return;
  var d = EAP.getInsights();

  // Panel header with freshness
  var h = '<div class="ins-hd"><div class="ins-hd-left"><span class="ins-hd-lbl">Insights</span><span class="ins-fresh">' + EAP.icon('clock', 10) + ' Updated just now</span></div><button class="ins-x" onclick="EAP.toggleInsights()">' + EAP.icon('x', 14) + '</button></div><div class="ins-scroll">';

  // Gauge
  if (d.gauge) {
    h += '<div class="ins-gauge"><div class="ins-gauge-lbl">' + d.gauge.label + '</div>' +
      '<div class="g-wrap"><canvas id="gaugeCanvas" width="200" height="110" style="display:block;"></canvas>' +
      '<div class="g-ctr"><div class="g-val" id="gVal">' + d.gauge.value + '%</div><div class="g-sub">Allocated</div></div></div>' +
      '<div class="g-labels"><span>0</span><span>100</span></div></div>';
  }

  // Predictive score (AI)
  if (d.predict) {
    var pv = d.predict.value;
    var pc = pv >= 80 ? 'var(--color-success)' : pv >= 60 ? 'var(--color-warning)' : 'var(--color-error)';
    var tIcon = d.predict.trend === 'down' ? 'trending-down' : 'trending-up';
    var tCol = d.predict.trend === 'down' ? 'var(--color-error)' : 'var(--color-success)';
    h += '<div class="ins-predict">' +
      '<div class="ins-predict-hd">' + EAP.icon('sparkle', 12) + ' <span>' + d.predict.label + '</span></div>' +
      '<div class="ins-predict-val" style="color:' + pc + ';">' + pv + '%</div>' +
      '<div class="ins-predict-trend" style="color:' + tCol + ';">' + EAP.icon(tIcon, 14) + ' ' + (d.predict.trend === 'down' ? 'Declining' : 'Improving') + '</div>' +
      '<div class="ins-predict-meta">Based on velocity of 6 teams over 3 sprints</div>' +
      '</div>';
  }

  // Team capacity bars
  if (d.teams) {
    h += '<div class="ins-teams"><div class="ins-teams-lbl">Team Capacity</div>';
    d.teams.forEach(function(t) {
      var cls = t.status === 'over' ? 'over' : t.status === 'watch' ? 'watch' : 'healthy';
      var vc = t.status === 'over' ? ' danger' : t.status === 'watch' ? ' warn' : '';
      var warnIcon = t.pct >= 90 ? ' ' + EAP.icon('alert-triangle', 10) : '';
      h += '<div class="team-row"><span class="team-row-name">' + t.name + '</span><div class="team-row-bar"><div class="team-row-fill ' + cls + '" style="width:' + Math.min(t.pct, 100) + '%"></div></div><span class="team-row-val' + vc + '">' + t.pct + '%' + warnIcon + '</span></div>';
    });
    h += '</div>';
  }

  // Signals
  if (d.signals) {
    h += '<div class="ins-sec"><div class="ins-sec-lbl">Signals</div>';
    d.signals.forEach(function(s, idx) {
      var isAi = !!s.ai;
      var sigId = 'sig-' + idx;
      h += '<div class="ins-row ' + s.level + (isAi ? ' ins-ai' : '') + '" id="' + sigId + '">';

      // Snooze/dismiss on hover
      h += '<div class="ins-actions"><button class="ins-act-btn" title="Snooze" data-sig-snooze="' + sigId + '">' + EAP.icon('clock', 12) + '</button><button class="ins-act-btn" title="Dismiss" data-sig-dismiss="' + sigId + '">' + EAP.icon('x', 12) + '</button></div>';

      // Title with optional sparkle
      if (isAi) {
        h += '<div class="ins-t"><span class="ins-sparkle">' + EAP.icon('sparkle', 12) + '</span> ' + s.title + '</div>';
      } else {
        h += '<div class="ins-t">' + s.title + '</div>';
      }

      h += '<div class="ins-s">' + s.desc + '</div>';
      if (s.action) h += '<a class="ins-a" data-ins-action="' + s.action + '">' + s.action + ' ' + EAP.icon('chevron-right', 10) + '</a>';

      // Meta line: confidence + source + freshness
      var metaParts = [];
      if (isAi && s.confidence) metaParts.push('<span class="ins-confidence ins-conf-' + s.confidence.toLowerCase() + '">' + s.confidence + ' confidence</span>');
      if (s.meta) metaParts.push('<span class="ins-source">' + s.meta + '</span>');
      if (metaParts.length) h += '<div class="ins-meta">' + metaParts.join('<span class="ins-meta-sep">·</span>') + '</div>';

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

  function gc(v) { return v <= 70 ? '#00834f' : v <= 85 ? '#8d6e00' : '#e2161c'; }

  function draw(v) {
    x.clearRect(0, 0, W, H);
    var va = sA + (v / 100) * Math.PI, fc = gc(v);

    // Outer zone ring
    [{ f: 0, t: 0.70, c: '#00834f' }, { f: 0.70, t: 0.85, c: '#8d6e00' }, { f: 0.85, t: 1, c: '#e2161c' }].forEach(function(z) {
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
  // Action links
  document.querySelectorAll('[data-ins-action]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var action = link.getAttribute('data-ins-action');
      if (action === 'Escalate now') { EAP.openDetail('f3'); EAP.showToast('Escalation initiated for Payment Confirmation Flow', 'success'); }
      else if (action === 'Plan into PI 26') { EAP.openDetail('f7'); EAP.showToast('Enhanced Biometric Auth Flow opened for planning', 'info'); }
      else if (action === 'Assign team') { EAP.openDetail('f6'); EAP.showToast('Assign a team to Streamlined Onboarding Flow', 'info'); }
      else if (action === 'Create Feature') { EAP.showToast('Feature creation flow would open here', 'info'); }
      else if (action === 'View all blockers') { EAP.showToast('Showing 14 blocked stories across 4 teams', 'info'); }
      else if (action === 'Rebalance Sprint 4') { EAP.showToast('Sprint 4 capacity rebalancing view would open here', 'info'); }
      else if (action === 'Schedule defect sprint') { EAP.showToast('Defect sprint scheduling initiated for Fraud Team', 'success'); }
      else { EAP.showToast(action + ' — action initiated', 'info'); }
    });
  });

  // Snooze buttons
  document.querySelectorAll('[data-sig-snooze]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var row = document.getElementById(btn.getAttribute('data-sig-snooze'));
      if (row) { row.style.opacity = '0.3'; row.style.transition = 'opacity 300ms'; }
      EAP.showToast('Signal snoozed for 24 hours', 'info');
    });
  });

  // Dismiss buttons
  document.querySelectorAll('[data-sig-dismiss]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var row = document.getElementById(btn.getAttribute('data-sig-dismiss'));
      if (row) { row.style.maxHeight = row.offsetHeight + 'px'; row.style.transition = 'max-height 300ms, opacity 300ms, margin 300ms, padding 300ms'; requestAnimationFrame(function() { row.style.maxHeight = '0'; row.style.opacity = '0'; row.style.margin = '0'; row.style.padding = '0'; row.style.overflow = 'hidden'; }); }
      EAP.showToast('Signal dismissed', 'info');
    });
  });
};
