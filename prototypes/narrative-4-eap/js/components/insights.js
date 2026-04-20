/* ═══════════════════════════════════════════════════════
   INSIGHTS.JS — AI insights panel
   Narrative briefing: hero metric → urgent signals →
   team health → context signals.
   AI signals: ✦ sparkle, teal accent, confidence, source.
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

EAP.renderInsights = function() {
  var el = document.getElementById('insights-panel');
  if (!el) return;
  var d = EAP.getInsights();

  // ── Panel header with AI identity ──
  var h = '<div class="ins-hdr">' +
    '<div class="ins-hdr-left">' + EAP.icon('sparkle', 14) + '<span>Insights</span></div>' +
    '<div class="ins-hdr-right"><span class="ins-fresh">' + EAP.icon('clock', 10) + ' Just now</span>' +
    '<button class="ins-close" onclick="EAP.toggleInsights()">' + EAP.icon('x', 14) + '</button></div></div>';

  h += '<div class="ins-scroll">';

  // ── Hero metric (merged gauge + prediction) ──
  if (d.gauge || d.predict) {
    var heroVal = d.predict ? d.predict.value : d.gauge ? d.gauge.value : 0;
    var heroLabel = d.predict ? d.predict.label : d.gauge ? d.gauge.label : '';
    var heroColor = heroVal >= 80 ? 'var(--color-success)' : heroVal >= 60 ? 'var(--color-warning)' : 'var(--color-error)';
    var trendHtml = '';
    if (d.predict && d.predict.trend) {
      var tIcon = d.predict.trend === 'down' ? 'trending-down' : 'trending-up';
      var tLabel = d.predict.trend === 'down' ? 'Declining' : 'Improving';
      var tColor = d.predict.trend === 'down' ? 'var(--color-error)' : 'var(--color-success)';
      trendHtml = '<div class="ins-hero-trend" style="color:' + tColor + ';">' + EAP.icon(tIcon, 14) + ' ' + tLabel + '</div>';
    }

    h += '<div class="ins-hero">' +
      '<canvas id="gaugeCanvas" width="200" height="110"></canvas>' +
      '<div class="ins-hero-overlay">' +
      '<div class="ins-hero-val" style="color:' + heroColor + ';">' + heroVal + '<span class="ins-hero-pct">%</span></div>' +
      trendHtml +
      '</div>' +
      '<div class="ins-hero-label">' + heroLabel + '</div>' +
      (d.predict ? '<div class="ins-hero-meta">' + EAP.icon('sparkle', 10) + ' Based on velocity of 6 teams over 3 sprints</div>' : '') +
      '</div>';
  }

  // ── Team health heat strip ──
  if (d.teams) {
    h += '<div class="ins-heat"><div class="ins-sec-lbl">Team Health</div><div class="ins-heat-strip">';
    d.teams.forEach(function(t) {
      var col = t.pct >= 90 ? 'var(--color-error)' : t.pct >= 80 ? 'var(--color-warning)' : 'var(--color-success)';
      h += '<div class="ins-heat-cell" style="background:' + col + ';" title="' + t.name + ': ' + t.pct + '%"><span class="ins-heat-name">' + t.name + '</span><span class="ins-heat-val">' + t.pct + '%</span></div>';
    });
    h += '</div></div>';
  }

  // ── Inline metrics (sprint-level only) ──
  if (EAP.state.level === 'WorkItem' && EAP.state.context === 'art') {
    var sp = EAP.workItems.sprints.filter(function(s) { return s.active; })[0];
    if (sp) {
      var remaining = sp.totalPts - sp.donePts;
      var velAvg = 28; // rolling average
      h += '<div class="ins-metrics">' +
        '<div class="ins-metric">' +
        '<div class="ins-metric-val">' + remaining + '</div>' +
        '<div class="ins-metric-lbl">Pts remaining</div>' +
        '<div class="ins-metric-bar"><div class="ins-metric-fill" style="width:' + Math.round(sp.donePts / sp.totalPts * 100) + '%;background:var(--color-primary);"></div></div>' +
        '</div>' +
        '<div class="ins-metric">' +
        '<div class="ins-metric-val">' + velAvg + '</div>' +
        '<div class="ins-metric-lbl">Avg velocity</div>' +
        '<div class="ins-metric-bar"><div class="ins-metric-fill" style="width:78%;background:var(--color-success);"></div></div>' +
        '</div>' +
        '<div class="ins-metric">' +
        '<div class="ins-metric-val">18<span class="ins-metric-pct">%</span></div>' +
        '<div class="ins-metric-lbl">Unplanned work</div>' +
        '<div class="ins-metric-bar"><div class="ins-metric-fill" style="width:18%;background:var(--color-warning);"></div></div>' +
        '</div>' +
        '</div>';
    }
  }

  // ── Feature progress (Feature level only) ──
  if (EAP.state.level === 'Feature' && EAP.state.context === 'art') {
    var feats = EAP.allFeatures.filter(function(f) { return f.pi === 'pi26'; });
    h += '<div class="ins-feat-progress"><div class="ins-sec-lbl">Feature Progress</div>';
    feats.forEach(function(f) {
      var col = f.state === 'Done' ? 'var(--color-success)' : (f.blocked || f.state === 'Blocked') ? 'var(--color-error)' : f.pct >= 40 ? 'var(--color-primary)' : 'rgba(14,78,105,0.3)';
      var name = f.name.length > 22 ? f.name.substring(0, 20) + '…' : f.name;
      h += '<div class="ins-feat-row"><span class="ins-feat-name">' + name + '</span><div class="ins-feat-bar"><div class="ins-feat-fill" style="width:' + (f.pct || 0) + '%;background:' + col + ';"></div></div><span class="ins-feat-val">' + (f.pct || 0) + '%</span></div>';
    });
    h += '</div>';
  }

  // ── Signals (urgent first, then watch, then ok) ──
  if (d.signals) {
    var urgent = d.signals.filter(function(s) { return s.level === 'urgent'; });
    var watch = d.signals.filter(function(s) { return s.level === 'watch'; });
    var ok = d.signals.filter(function(s) { return s.level === 'ok'; });

    if (urgent.length) {
      h += '<div class="ins-sig-group"><div class="ins-sec-lbl">' + EAP.icon('zap', 10) + ' Needs Attention <span class="ins-sig-count">' + urgent.length + '</span></div>';
      urgent.forEach(function(s, i) { h += renderSignal(s, 'u' + i); });
      h += '</div>';
    }
    if (watch.length) {
      h += '<div class="ins-sig-group"><div class="ins-sec-lbl">Watching</div>';
      watch.forEach(function(s, i) { h += renderSignal(s, 'w' + i); });
      h += '</div>';
    }
    if (ok.length) {
      h += '<div class="ins-sig-group ins-sig-ok"><div class="ins-sec-lbl">On Track</div>';
      ok.forEach(function(s, i) { h += renderSignal(s, 'k' + i); });
      h += '</div>';
    }
  }

  h += '</div>';
  el.innerHTML = h;

  // Draw gauge
  if (d.gauge || d.predict) setTimeout(function() { EAP.drawGauge(d.predict ? d.predict.value : d.gauge.value); }, 50);
};

// ── Signal card renderer ──────────────────────────────
function renderSignal(s, id) {
  var isAi = !!s.ai;
  var sigId = 'sig-' + id;
  var cls = 'ins-sig ' + s.level + (isAi ? ' ins-sig-ai' : '');

  var h = '<div class="' + cls + '" id="' + sigId + '">';

  // Hover actions
  h += '<div class="ins-sig-actions"><button class="ins-sig-act" title="Snooze" data-sig-snooze="' + sigId + '">' + EAP.icon('clock', 11) + '</button><button class="ins-sig-act" title="Dismiss" data-sig-dismiss="' + sigId + '">' + EAP.icon('x', 11) + '</button></div>';

  // Title
  h += '<div class="ins-sig-title">';
  if (isAi) h += '<span class="ins-sig-sparkle">' + EAP.icon('sparkle', 11) + '</span>';
  h += s.title + '</div>';

  // Description
  h += '<div class="ins-sig-desc">' + s.desc + '</div>';

  // Action button
  if (s.action) h += '<a class="ins-sig-action" data-ins-action="' + s.action + '">' + s.action + '</a>';

  // Meta line
  var meta = [];
  if (isAi && s.confidence) meta.push('<span class="ins-conf ins-conf-' + s.confidence.toLowerCase() + '">' + s.confidence + '</span>');
  if (s.meta) meta.push(s.meta);
  if (meta.length) h += '<div class="ins-sig-meta">' + meta.join(' · ') + '</div>';

  h += '</div>';
  return h;
}

// ── Gauge drawing ─────────────────────────────────────
EAP.drawGauge = function(tv) {
  var c = document.getElementById('gaugeCanvas');
  if (!c) return;
  var dpr = window.devicePixelRatio || 1, W = 200, H = 110;
  c.width = W * dpr; c.height = H * dpr;
  c.style.width = W + 'px'; c.style.height = H + 'px';
  var x = c.getContext('2d');
  x.scale(dpr, dpr);
  var cx = W / 2, cy = H - 8, iR = 72, sA = Math.PI;

  function gc(v) { return v <= 60 ? '#e2161c' : v <= 80 ? '#8d6e00' : '#00834f'; }

  function draw(v) {
    x.clearRect(0, 0, W, H);
    var va = sA + (v / 100) * Math.PI, fc = gc(v);

    // Track
    x.lineWidth = 12; x.lineCap = 'round';
    x.beginPath(); x.arc(cx, cy, iR, sA, 2 * Math.PI);
    x.strokeStyle = 'rgba(0,0,0,0.04)'; x.stroke();

    // Fill arc
    if (v > 0) {
      x.beginPath(); x.arc(cx, cy, iR, sA, va);
      x.strokeStyle = fc; x.lineWidth = 12; x.lineCap = 'round'; x.stroke();
    }

    // Threshold marker at 80%
    var ta = sA + 0.8 * Math.PI;
    var tx = cx + (iR + 10) * Math.cos(ta), ty = cy + (iR + 10) * Math.sin(ta);
    x.beginPath(); x.arc(tx, ty, 2, 0, 2 * Math.PI);
    x.fillStyle = 'rgba(0,0,0,0.15)'; x.fill();

    // Dot
    var dx = cx + iR * Math.cos(va), dy = cy + iR * Math.sin(va);
    x.beginPath(); x.arc(dx, dy, 7, 0, 2 * Math.PI); x.fillStyle = '#fff'; x.fill();
    x.beginPath(); x.arc(dx, dy, 7, 0, 2 * Math.PI); x.strokeStyle = fc; x.lineWidth = 2.5; x.stroke();
    x.beginPath(); x.arc(dx, dy, 3, 0, 2 * Math.PI); x.fillStyle = fc; x.fill();
  }

  var av = 0, st = tv / 40;
  var anim = setInterval(function() {
    av = Math.min(av + st, tv); draw(av);
    if (av >= tv) clearInterval(anim);
  }, 16);
};

// ── Toast ─────────────────────────────────────────────
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

// ── Wire insight actions ──────────────────────────────
EAP.wireInsightActions = function() {
  document.querySelectorAll('[data-ins-action]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var action = link.getAttribute('data-ins-action');
      if (action === 'Escalate now') { EAP.openDetail('f3'); EAP.showToast('Escalation initiated for Payment Confirmation Flow', 'success'); }
      else if (action === 'Plan into PI 26') { EAP.openDetail('f7'); EAP.showToast('Enhanced Biometric Auth Flow opened for planning', 'info'); }
      else if (action === 'Assign team') { EAP.openDetail('f6'); EAP.showToast('Assign a team to Streamlined Onboarding Flow', 'info'); }
      else if (action === 'Create Feature') { EAP.showToast('Feature creation flow would open here', 'info'); }
      else if (action === 'View all blockers') { EAP.showToast('Showing 14 blocked stories across 4 teams', 'info'); }
      else { EAP.showToast(action + ' — action initiated', 'info'); }
    });
  });
  document.querySelectorAll('[data-sig-snooze]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var row = document.getElementById(btn.getAttribute('data-sig-snooze'));
      if (row) { row.style.opacity = '0.25'; row.style.transition = 'opacity 300ms'; }
      EAP.showToast('Snoozed for 24 hours', 'info');
    });
  });
  document.querySelectorAll('[data-sig-dismiss]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var row = document.getElementById(btn.getAttribute('data-sig-dismiss'));
      if (row) {
        row.style.maxHeight = row.offsetHeight + 'px';
        row.style.transition = 'max-height 300ms, opacity 300ms, margin 300ms, padding 300ms';
        requestAnimationFrame(function() { row.style.maxHeight = '0'; row.style.opacity = '0'; row.style.margin = '0'; row.style.padding = '0'; row.style.overflow = 'hidden'; });
      }
      EAP.showToast('Signal dismissed', 'info');
    });
  });
};
