/* ═══════════════════════════════════════════════════════
   INSIGHTS.JS — Contextual AI insights panel
   Content adapts per view:
   - Backlog: flow distribution + prioritization signals
   - Planning: gauge + health grid + planning signals
   - Timeline: thin alerts only
   - Board: flow metrics + board signals
   - Task Board: deep metrics + individual workload
   - Hierarchy: structural signals only
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

// ── Shared D3 tooltip ─────────────────────────────────
var _d3Tip = null;
function getD3Tip() {
  if (!_d3Tip) {
    _d3Tip = d3.select('body').append('div')
      .attr('id', 'ins-d3-tip').attr('class', 'ins-d3-tooltip');
  }
  return _d3Tip;
}
function showTip(html, event) {
  getD3Tip().html(html)
    .style('left', (event.clientX + 14) + 'px')
    .style('top', (event.clientY - 36) + 'px')
    .classed('visible', true);
}
function moveTip(event) {
  getD3Tip()
    .style('left', (event.clientX + 14) + 'px')
    .style('top', (event.clientY - 36) + 'px');
}
function hideTip() { getD3Tip().classed('visible', false); }

EAP.renderInsights = function() {
  var el = document.getElementById('insights-panel');
  if (!el) return;
  var d = EAP.getInsights();
  var s = EAP.state;

  // ── Panel header ──
  var isHigh = EAP._insightFilter === 'high';
  var h = '<div class="ins-hdr">' +
    '<div class="ins-hdr-left">' + EAP.icon('sparkle', 16) + '<span>Insights</span></div>' +
    '<div class="ins-hdr-right">' +
    '<div class="ins-conf-tog' + (isHigh ? ' on' : '') + '" onclick="EAP.toggleConfidence()" role="switch" aria-checked="' + isHigh + '" title="Show high-confidence signals only">' +
    '<span class="ins-conf-track"><span class="ins-conf-thumb"></span></span>' +
    '<span class="ins-conf-lbl">High confidence</span>' +
    '</div>' +
    '<button class="ins-close" onclick="EAP.toggleInsights()">' + EAP.icon('x', 14) + '</button></div></div>';

  h += '<div class="ins-scroll">';

  // ── Hero metric (verdict bar, replaces gauge canvas) — Planning/Board only ──
  if (d.gauge || d.predict) {
    var heroVal = d.predict ? d.predict.value : d.gauge ? d.gauge.value : 0;
    var heroLabel = d.predict ? d.predict.label : d.gauge ? d.gauge.label : '';
    var heroColor = heroVal >= 80 ? 'var(--dv-success)' : heroVal >= 60 ? 'var(--dv-warning)' : 'var(--dv-error)';
    var heroColorBg = heroVal >= 80 ? 'rgba(0,131,79,0.08)' : heroVal >= 60 ? 'rgba(141,110,0,0.08)' : 'rgba(226,22,28,0.08)';
    var verdictLabel = heroVal >= 80 ? 'On track' : heroVal >= 65 ? 'Monitor' : heroVal >= 50 ? 'At risk' : 'Off track';
    var trendHtml = '';
    if (d.predict && d.predict.trend) {
      var tArrow = d.predict.trend === 'down' ? '↘' : '↗';
      var tLabelStr = d.predict.trend === 'down' ? 'Declining' : 'Improving';
      var tColor = d.predict.trend === 'down' ? 'var(--color-error)' : 'var(--color-success)';
      trendHtml = '<div class="ins-hero-v-trend" style="color:' + tColor + ';">' + tArrow + ' ' + tLabelStr + '</div>';
    }
    var iLo = d.predict && d.predict.interval ? Math.max(0, heroVal - d.predict.interval) : heroVal;
    var iHi = d.predict && d.predict.interval ? Math.min(100, heroVal + d.predict.interval) : heroVal;
    var bandW = iHi - iLo;
    h += '<div class="ins-hero ins-hero-verdict">' +
      '<div class="ins-hero-v-top">' +
        '<div class="ins-hero-v-left">' +
          '<div class="ins-hero-v-num" style="color:' + heroColor + ';">' + heroVal + '<span class="ins-hero-v-pct">%</span></div>' +
          '<div class="ins-hero-v-badge" style="color:' + heroColor + ';background:' + heroColorBg + ';">' + verdictLabel + '</div>' +
        '</div>' +
        '<div class="ins-hero-v-right">' +
          trendHtml +
          '<div class="ins-hero-v-label">' + heroLabel + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="ins-pbar-wrap">' +
        '<div class="ins-pbar-track">' +
          '<div class="ins-pbar-fill" style="width:' + heroVal + '%;background:' + heroColor + ';"></div>' +
          (bandW > 0 ? '<div class="ins-pbar-band" style="left:' + iLo + '%;width:' + bandW + '%;"></div>' : '') +
          '<div class="ins-pbar-thresh"></div>' +
        '</div>' +
        '<div class="ins-pbar-scale">' +
          '<span class="ins-pbar-s-lo">0</span>' +
          '<span class="ins-pbar-s-mid">80%</span>' +
          '<span class="ins-pbar-s-hi">100%</span>' +
        '</div>' +
      '</div>' +
      (bandW > 0 ? '<div class="ins-pbar-range">' + iLo + '% – ' + iHi + '% · ±' + d.predict.interval + '% range</div>' : '') +
    '</div>';
  }

  // ── Flow distribution — Backlog only ──
  if (d.flowDist) {
    var fd = d.flowDist;
    var fdSegments = [
      { pct: fd.features, label: 'Features', color: '#0e4e69' },
      { pct: fd.defects, label: 'Defects', color: '#e2161c' },
      { pct: fd.enablers, label: 'Enablers', color: '#2a6edc' },
      { pct: fd.maintenance, label: 'Maintenance', color: '#c2c1be' }
    ];
    h += '<div class="ins-flow-dist"><div class="ins-sec-lbl">Flow Distribution</div><svg id="flowDistSvg" class="ins-flow-svg"></svg><div class="ins-flow-legend">';
    fdSegments.forEach(function(seg) {
      h += '<span class="ins-flow-item"><span class="ins-flow-dot" style="background:' + seg.color + ';"></span>' + seg.label + ' ' + seg.pct + '%</span>';
    });
    h += '</div>';
    if (fd.defects > 20) {
      h += '<div class="ins-flow-note">Defects ' + fd.defects + '% · target ≤20%</div>';
    }
    h += '</div>';
  }

  // ── Velocity trend chart — team context + planning tab only (data is team-scale) ──
  if (s.tab === 'planning' && s.context === 'team' && EAP.velocityHistory && EAP.velocityStats) {
    var vs = EAP.velocityStats;
    var velPartial = EAP.velocityHistory.filter(function(sp) { return sp.partial; })[0];
    var velGap = velPartial ? (vs.avg - velPartial.pts) : 0;
    var velBadge = velGap > 0
      ? '<span class="ins-vel-badge ins-vel-badge-warn">Below avg</span>'
      : '<span class="ins-vel-badge ins-vel-badge-ok">On track</span>';
    h += '<div class="ins-velocity">' +
      '<div class="ins-sec-lbl ins-sec-lbl-split">Sprint Velocity' + velBadge + '</div>' +
      '<div class="ins-vel-chart"><svg id="velocitySvg" class="ins-vel-svg"></svg></div>' +
      '<div class="ins-vel-meta">Avg&nbsp;<strong>' + vs.avg + '</strong>&nbsp;pts&nbsp;·&nbsp;Range&nbsp;' + vs.low + '–' + vs.high + '</div>' +
      '</div>';
  }

  // ── Team health heatmap grid — Planning/Board/Task Board at ART ──
  if (d.health && s.context === 'art') {
    h += '<div class="ins-health"><div class="ins-sec-lbl">Team Health</div><svg id="healthHeatmapSvg" class="ins-heat-svg"></svg></div>';
  }

  // ── Inline sprint metrics — Task Board WorkItem only ──
  if (s.tab === 'taskboard' && s.level === 'WorkItem') {
    var sp = EAP.workItems.sprints.filter(function(sp) { return sp.active; })[0];
    if (sp) {
      var remaining = sp.totalPts - sp.donePts;
      // Avg cycle bar: severity as fraction of warning zone (target 2d → max 5d)
      var _AVG_CYCLE = 3.2, _TARGET_CYCLE = 2.0, _MAX_CYCLE = 5.0;
      var cyclePct = Math.min(100, Math.round((_AVG_CYCLE - _TARGET_CYCLE) / (_MAX_CYCLE - _TARGET_CYCLE) * 100));
      var cycleColor = cyclePct >= 60 ? 'var(--dv-error)' : 'var(--dv-warning)';
      // In review bar: actual vs WIP limit
      var inRevCount = sp.items.filter(function(wi) { return wi.state === 'In Review' || wi.state === 'Testing'; }).length;
      var wipRevLimit = (EAP.wipLimits && EAP.wipLimits['In Review']) || 4;
      var reviewPct = Math.min(100, Math.round(inRevCount / wipRevLimit * 100));
      var reviewColor = reviewPct >= 100 ? 'var(--dv-error)' : reviewPct >= 75 ? 'var(--dv-warning)' : 'var(--color-primary)';
      h += '<div class="ins-metrics-section"><div class="ins-sec-lbl">At a glance</div>';
      h += '<div class="ins-metrics">' +
        '<div class="ins-metric"><div class="ins-metric-val">' + remaining + '</div><div class="ins-metric-lbl">Pts left</div>' +
        '<div class="ins-metric-bar"><div class="ins-metric-fill" style="width:' + Math.round(sp.donePts / sp.totalPts * 100) + '%;background:var(--color-primary);"></div></div></div>' +
        '<div class="ins-metric"><div class="ins-metric-val">3.2<span class="ins-metric-pct">d</span></div><div class="ins-metric-lbl">Avg cycle</div>' +
        '<div class="ins-metric-bar"><div class="ins-metric-fill" style="width:' + cyclePct + '%;background:' + cycleColor + ';"></div></div></div>' +
        '<div class="ins-metric"><div class="ins-metric-val">' + inRevCount + '</div><div class="ins-metric-lbl">In review</div>' +
        '<div class="ins-metric-bar"><div class="ins-metric-fill" style="width:' + reviewPct + '%;background:' + reviewColor + ';"></div></div></div>' +
        '</div></div>';
    }
  }

  // ── Individual workload — Task Board when member is selected ──
  if (s.tab === 'taskboard' && s.context === 'team' && s.trackMember && s.trackMember !== 'All') {
    var mw = EAP.memberWorkload[s.trackMember];
    if (mw) {
      var p = EAP.people[s.trackMember];
      var pName = p ? p.name : s.trackMember;
      var pFinish = mw.predictFinish;
      var pColor = pFinish >= 80 ? 'var(--dv-success)' : pFinish >= 60 ? 'var(--dv-warning)' : 'var(--dv-error)';
      var wipOver = mw.inProgress > mw.wipLimit;

      h += '<div class="ins-member">' +
        '<div class="ins-sec-lbl">Member focus</div>' +
        '<div class="ins-member-hd">' + EAP.avatar(s.trackMember, 24) + '<div class="ins-member-info"><span class="ins-member-name">' + pName + '</span><span class="ins-member-role">Sprint workload</span></div></div>';

      h += '<div class="ins-member-stats">' +
        '<div class="ins-member-stat"><span class="ins-member-num">' + mw.assigned + '</span><span class="ins-member-lbl">Assigned</span></div>' +
        '<div class="ins-member-stat"><span class="ins-member-num' + (wipOver ? ' ins-wip-over' : '') + '">' + mw.inProgress + '</span><span class="ins-member-lbl">In progress' + (wipOver ? ' ' + EAP.icon('alert-triangle', 10) : '') + '</span></div>' +
        '<div class="ins-member-stat"><span class="ins-member-num">' + mw.done + '</span><span class="ins-member-lbl">Done</span></div>' +
        '<div class="ins-member-stat"><span class="ins-member-num' + (mw.blocked > 0 ? ' ins-wip-over' : '') + '">' + mw.blocked + '</span><span class="ins-member-lbl">Blocked</span></div>' +
        '</div>';

      var pInterval = mw.blocked > 0 ? 10 : (wipOver ? 9 : 7);
      h += '<div class="ins-member-predict">' +
        '<span class="ins-sec-lbl">' + EAP.icon('sparkle', 10) + ' Completion forecast</span>' +
        '<div class="ins-member-pbar"><div class="ins-member-pfill" style="width:' + pFinish + '%;background:' + pColor + ';"></div></div>' +
        '<span class="ins-member-ppct" style="color:' + pColor + ';">' + pFinish + '% ± ' + pInterval + '% likely to finish sprint commitments</span>' +
        '</div></div>';
    }
  }

  // ── Feature progress — Feature level Board/Planning ──
  if (s.level === 'Feature' && (s.tab === 'planning' || s.tab === 'board') && s.context === 'art') {
    var feats = EAP.allFeatures.filter(function(f) { return f.pi === 'pi26'; });
    h += '<div class="ins-feat-progress"><div class="ins-sec-lbl">Feature Progress</div>';
    feats.forEach(function(f) {
      var col = f.state === 'Done' ? 'var(--dv-success)' : (f.blocked || f.state === 'Blocked') ? 'var(--dv-error)' : f.pct >= 40 ? 'var(--dv-primary)' : 'rgba(14,78,105,0.3)';
      var name = f.name.length > 22 ? f.name.substring(0, 20) + '…' : f.name;
      // Ghost bar: deterministic planned position based on actual PI elapsed time
      var _piPct = EAP._piDays ? Math.round((EAP._sprintDays + (EAP._dayInSprint || 7)) / EAP._piDays * 100) : 30;
      var planned = Math.max(10, Math.min(80, _piPct + (f.pts % 12) - 5));
      h += '<div class="ins-feat-row"><span class="ins-feat-name">' + name + '</span><div class="ins-feat-bar"><div class="ins-feat-ghost" style="width:' + planned + '%;"></div><div class="ins-feat-fill" style="width:' + (f.pct || 0) + '%;background:' + col + ';"></div></div><span class="ins-feat-val">' + (f.pct || 0) + '%</span></div>';
    });
    h += '</div>';
  }

  // ── Signals ──
  if (d.signals) {
    // Persona-aware filter: signals with forPersonas only show for matching persona;
    // signals without forPersonas show for all personas.
    var activePersona = EAP.state.persona;
    var visibleSignals = d.signals.filter(function(s) {
      if (!s.forPersonas) return true;
      return s.forPersonas.indexOf(activePersona) >= 0;
    });
    if (EAP._insightFilter === 'high') {
      visibleSignals = visibleSignals.filter(function(sig) {
        return !sig.ai || sig.confidence === 'High';
      });
    }
    var urgent = visibleSignals.filter(function(s) { return s.level === 'urgent'; });
    var watch = visibleSignals.filter(function(s) { return s.level === 'watch'; });
    var ok = visibleSignals.filter(function(s) { return s.level === 'ok'; });

    if (urgent.length) {
      h += '<div class="ins-sig-group"><div class="ins-sec-lbl">Needs Attention <span class="ins-sig-count">' + urgent.length + '</span></div>';
      urgent.forEach(function(s, i) { h += renderSignal(s, 'u' + i); });
      h += '</div>';
    }
    if (watch.length) {
      h += '<div class="ins-sig-group"><div class="ins-sec-lbl">Watching</div>';
      watch.forEach(function(s, i) { h += renderSignal(s, 'w' + i); });
      h += '</div>';
    }
    if (ok.length) {
      h += '<div class="ins-sig-group ins-sig-ok">' +
        '<div class="ins-ok-summary">' + EAP.icon('check-square', 12) + '<span>' + ok.length + ' item' + (ok.length !== 1 ? 's' : '') + ' on track</span></div>' +
        '</div>';
    }
  }

  h += '</div>';
  el.innerHTML = h;
  // Gauge replaced by verdict bar — no canvas to draw
  if (d.flowDist) setTimeout(function() { EAP.drawFlowDist(d.flowDist); }, 60);
  if (d.health && s.context === 'art') setTimeout(function() { EAP.drawHealthHeatmap(); }, 70);
  if (s.tab === 'planning' && s.context === 'team' && EAP.velocityHistory) setTimeout(function() { EAP.drawVelocityD3(); }, 80);

  // Cursor affordance — click handling is wired via document capture
  // listener in interactions-pass.js (single source of truth for clicks).
  el.querySelectorAll('.ins-sig[data-insight-target]').forEach(function(card) {
    card.style.cursor = 'pointer';
  });

  if (typeof EAP.phase5Animate === 'function') EAP.phase5Animate();
  if (typeof EAP.phase6Animate === 'function') EAP.phase6Animate();
};

// ── Signal card ───────────────────────────────────────
function renderSignal(s, id) {
  var isAi = !!s.ai;
  var sigId = 'sig-' + id;
  var confAttr = (isAi && s.confidence) ? ' data-conf="' + s.confidence.toLowerCase() + '"' : '';
  var targetAttrs = s.target
    ? ' data-insight-target="' + s.target + '" data-insight-name="' + (s.targetName || s.target) + '"'
    : '';
  var h = '<div class="ins-sig ' + s.level + (isAi ? ' ins-sig-ai' : '') + '" id="' + sigId + '"' + targetAttrs + confAttr + '>';
  h += '<div class="ins-sig-actions">' +
    '<button class="ins-sig-act" title="Snooze" data-sig-snooze="' + sigId + '">' + EAP.icon('clock', 11) + '</button>' +
    '<button class="ins-sig-act" title="Dismiss" data-sig-dismiss="' + sigId + '">' + EAP.icon('x', 11) + '</button>' +
    '<button class="ins-sig-act ins-sig-act-override" title="Mark as reviewed" data-sig-override="' + sigId + '">' + EAP.icon('check-square', 11) + '</button>' +
    '</div>';
  h += '<div class="ins-sig-title">' + s.title + '</div>';
  h += '<div class="ins-sig-desc">' + s.desc + '</div>';
  if (s.action) h += '<a class="ins-sig-action" data-ins-action="' + s.action + '">' + s.action + EAP.icon('chevron-right', 11) + '</a>';
  if (isAi && s.meta) {
    h += '<div class="ins-sig-why">' + EAP.icon('sparkle', 9) + '<span>' + s.meta + '</span>' +
      '<div class="ins-sig-footer">' +
      '<button class="ins-sig-fb-btn ins-sig-fb-up" data-sig-fb="' + sigId + '" data-fb-type="accurate" title="Accurate">' + EAP.icon('thumbs-up', 11) + '</button>' +
      '<button class="ins-sig-fb-btn ins-sig-fb-down" data-sig-fb="' + sigId + '" data-fb-type="missed" title="Off target">' + EAP.icon('thumbs-down', 11) + '</button>' +
      '</div></div>';
  } else if (isAi) {
    h += '<div class="ins-sig-footer">' +
      '<button class="ins-sig-fb-btn ins-sig-fb-up" data-sig-fb="' + sigId + '" data-fb-type="accurate" title="Accurate">' + EAP.icon('thumbs-up', 11) + '</button>' +
      '<button class="ins-sig-fb-btn ins-sig-fb-down" data-sig-fb="' + sigId + '" data-fb-type="missed" title="Off target">' + EAP.icon('thumbs-down', 11) + '</button>' +
      '</div>';
  }
  if (!isAi && s.meta) {
    h += '<div class="ins-sig-meta">' + s.meta + '</div>';
  }
  h += '</div>';
  return h;
}

// ── Gauge ─────────────────────────────────────────────
EAP.drawGauge = function(tv) {
  var c = document.getElementById('gaugeCanvas');
  if (!c) return;
  var dpr = window.devicePixelRatio || 1, W = 200, H = 110;
  c.width = W * dpr; c.height = H * dpr;
  c.style.width = W + 'px'; c.style.height = H + 'px';
  var x = c.getContext('2d');
  x.scale(dpr, dpr);
  var cx = W / 2, cy = H - 8, iR = 72, sA = Math.PI;
  function gc(v) { return v <= 60 ? '#ef4444' : v <= 80 ? '#f59e0b' : '#22c55e'; }
  function draw(v) {
    x.clearRect(0, 0, W, H);
    var va = sA + (v / 100) * Math.PI, fc = gc(v);
    // Track
    x.lineWidth = 12; x.lineCap = 'round';
    x.beginPath(); x.arc(cx, cy, iR, sA, 2 * Math.PI);
    x.strokeStyle = 'rgba(0,0,0,0.04)'; x.stroke();
    // Confidence band (65-78% range)
    var lo = sA + 0.65 * Math.PI, hi = sA + 0.78 * Math.PI;
    x.beginPath(); x.arc(cx, cy, iR, lo, hi);
    x.strokeStyle = fc; x.lineWidth = 12; x.globalAlpha = 0.28; x.stroke();
    x.globalAlpha = 1;
    // Fill
    if (v > 0) { x.beginPath(); x.arc(cx, cy, iR, sA, va); x.strokeStyle = fc; x.lineWidth = 12; x.lineCap = 'round'; x.stroke(); }
    // 80% threshold marker
    var ta = sA + 0.8 * Math.PI;
    var tx = cx + (iR + 10) * Math.cos(ta), ty = cy + (iR + 10) * Math.sin(ta);
    x.beginPath(); x.arc(tx, ty, 2.5, 0, 2 * Math.PI); x.fillStyle = 'rgba(0,0,0,0.15)'; x.fill();
    // Dot
    var dx = cx + iR * Math.cos(va), dy = cy + iR * Math.sin(va);
    x.beginPath(); x.arc(dx, dy, 7, 0, 2 * Math.PI); x.fillStyle = '#fff'; x.fill();
    x.beginPath(); x.arc(dx, dy, 7, 0, 2 * Math.PI); x.strokeStyle = fc; x.lineWidth = 2.5; x.stroke();
    x.beginPath(); x.arc(dx, dy, 3, 0, 2 * Math.PI); x.fillStyle = fc; x.fill();
  }
  var av = 0, st = tv / 40;
  var anim = setInterval(function() { av = Math.min(av + st, tv); draw(av); if (av >= tv) clearInterval(anim); }, 16);
};

// ── Toast ─────────────────────────────────────────────
EAP.showToast = function(msg, type) {
  var icon = type === 'success' ? 'check-square' : 'info';
  EAP.toast({ icon: icon, message: msg, duration: 3000 });
};

// ── Wire actions ──────────────────────────────────────
EAP.wireInsightActions = function() {
  document.querySelectorAll('[data-ins-action]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var action = link.getAttribute('data-ins-action');
      if (action === 'Escalate now' || action === 'Escalate') { EAP.openDetail('f3'); EAP.showToast('Escalation initiated', 'success'); }
      else if (action === 'Plan into PI 26') { EAP.openDetail('f7'); EAP.showToast('Opened for planning', 'info'); }
      else if (action === 'Assign team') { EAP.openDetail('f6'); EAP.showToast('Assign a team', 'info'); }
      else { EAP.showToast(action + ' — initiated', 'info'); }
    });
  });
  document.querySelectorAll('[data-sig-snooze]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var row = document.getElementById(btn.getAttribute('data-sig-snooze'));
      if (row) { row.style.opacity = '0.25'; row.style.transition = 'opacity 300ms'; }
      EAP.showToast('Snoozed for 24h', 'info');
    });
  });
  document.querySelectorAll('[data-sig-dismiss]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var row = document.getElementById(btn.getAttribute('data-sig-dismiss'));
      if (row) { row.style.maxHeight = row.offsetHeight + 'px'; row.style.transition = 'max-height 300ms, opacity 300ms, margin 300ms, padding 300ms'; requestAnimationFrame(function() { row.style.maxHeight = '0'; row.style.opacity = '0'; row.style.margin = '0'; row.style.padding = '0'; row.style.overflow = 'hidden'; }); }
      EAP.showToast('Dismissed', 'info');
    });
  });
  document.querySelectorAll('[data-sig-override]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var row = document.getElementById(btn.getAttribute('data-sig-override'));
      if (row) row.classList.add('ins-sig-reviewed');
      EAP.showToast('Marked as reviewed', 'success');
    });
  });
  document.querySelectorAll('[data-sig-fb]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var footer = btn.closest('.ins-sig-footer');
      if (footer) footer.querySelectorAll('.ins-sig-fb-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      EAP.showToast('Thanks — this helps Otto improve', 'success');
    });
  });
};

// ── Flow distribution — D3 stacked horizontal bar ────
EAP.drawFlowDist = function(fd) {
  if (typeof d3 === 'undefined') return;
  var svgEl = document.getElementById('flowDistSvg');
  if (!svgEl) return;
  var W = Math.max(1, svgEl.getBoundingClientRect().width || svgEl.parentElement.clientWidth - 28);
  var H = 20;
  var svg = d3.select(svgEl).attr('width', W).attr('height', H);
  svg.selectAll('*').remove();

  var segments = [
    { pct: fd.features,    label: 'Features',    color: '#0e4e69' },
    { pct: fd.defects,     label: 'Defects',     color: '#e2161c' },
    { pct: fd.enablers,    label: 'Enablers',    color: '#2a6edc' },
    { pct: fd.maintenance, label: 'Maintenance', color: '#c2c1be' }
  ];
  var gap = 1.5;
  var xScale = d3.scaleLinear().domain([0, 100]).range([0, W]);
  var x = 0;
  var rects = segments.map(function(seg, i) {
    var w = Math.max(0, xScale(seg.pct) - gap);
    var r = { pct: seg.pct, label: seg.label, color: seg.color, x: x, w: w, i: i };
    x += w + gap;
    return r;
  });

  var defs = svg.append('defs');
  defs.append('clipPath').attr('id', 'flow-clip')
    .append('rect').attr('rx', 4).attr('ry', 4).attr('width', W).attr('height', H);

  var g = svg.append('g').attr('clip-path', 'url(#flow-clip)');
  g.selectAll('rect').data(rects).join('rect')
    .attr('x', function(d) { return d.x; })
    .attr('y', 0)
    .attr('width', function(d) { return d.w; })
    .attr('height', H)
    .style('fill', function(d) { return d.color; })
    .attr('opacity', 0)
    .on('mouseover', function(event, d) {
      g.selectAll('rect').attr('opacity', 0.25);
      d3.select(this).attr('opacity', 1);
      showTip('<strong>' + d.label + '</strong> &nbsp;' + d.pct + '%', event);
    })
    .on('mousemove', moveTip)
    .on('mouseout', function() { g.selectAll('rect').attr('opacity', 1); hideTip(); })
    .transition().duration(380).delay(function(d) { return d.i * 70; })
    .attr('opacity', 1);

  // Defect target marker: dashed line at features% + 20% (where defects should end)
  if (fd.defects > 20) {
    var threshX = Math.max(0, xScale(fd.features + 20) - gap);
    svg.append('line').attr('x1', threshX).attr('x2', threshX)
      .attr('y1', 0).attr('y2', H)
      .attr('stroke', '#e2161c').attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '2,2').style('opacity', 0.55);
  }
};

// ── Velocity trend — D3 annotated area chart ─────────
EAP.drawVelocityD3 = function() {
  if (typeof d3 === 'undefined') return;
  var vh = EAP.velocityHistory, vs = EAP.velocityStats;
  if (!vh || !vs) return;
  var container = document.querySelector('.ins-vel-chart');
  if (!container) return;

  var W = container.clientWidth;
  var H = 150;
  var m = { top: 18, right: 38, bottom: 24, left: 8 };
  var iW = W - m.left - m.right;
  var iH = H - m.top - m.bottom;

  var svg = d3.select('#velocitySvg').attr('width', W).attr('height', H);
  svg.selectAll('*').remove();
  var g = svg.append('g').attr('transform', 'translate(' + m.left + ',' + m.top + ')');

  var pri = '#0e4e69';
  var warn = '#8d6e00';
  var partial = vh[vh.length - 1];
  var completed = vh.filter(function(d) { return !d.partial; });
  var gap = vs.avg - partial.pts;
  var isOnTrack = gap <= 0;

  // Scales — scalePoint for line/area (exact x positions, no bandwidth)
  var xScale = d3.scalePoint()
    .domain(vh.map(function(d) { return d.id; }))
    .range([0, iW]).padding(0.4);

  var yMax = vs.high + 8;
  var yScale = d3.scaleLinear().domain([0, yMax]).range([iH, 0]);
  var partX = xScale(partial.id);
  var partY = yScale(partial.pts);
  var avgY  = yScale(vs.avg);

  // Gradient defs
  var defs = svg.append('defs');
  var grad = defs.append('linearGradient').attr('id', 'vel-grad')
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', 0).attr('x2', 0).attr('y1', avgY).attr('y2', iH);
  grad.append('stop').attr('offset', '0%').attr('stop-color', pri).attr('stop-opacity', 0.22);
  grad.append('stop').attr('offset', '100%').attr('stop-color', pri).attr('stop-opacity', 0.02);

  // ── Normal range band ──
  g.append('rect').attr('x', 0).attr('y', yScale(vs.high))
    .attr('width', iW)
    .attr('height', Math.max(0, yScale(vs.low) - yScale(vs.high)))
    .style('fill', 'rgba(14,78,105,0.055)');

  // ── Gap zone — amber rect between current pts and avg (takeaway shape) ──
  if (!isOnTrack) {
    var gapW = 26;
    g.append('rect')
      .attr('x', partX - gapW / 2).attr('y', avgY)
      .attr('width', gapW)
      .attr('height', Math.max(0, partY - avgY))
      .attr('rx', 2).style('fill', 'rgba(141,110,0,0.13)');
  }

  // ── Avg reference line ──
  g.append('line').attr('x1', 0).attr('x2', iW)
    .attr('y1', avgY).attr('y2', avgY)
    .attr('stroke', 'rgba(0,0,0,0.14)').attr('stroke-width', 1)
    .attr('stroke-dasharray', '4,3');

  // Labels at right margin
  svg.append('text').attr('x', m.left + iW + 5).attr('y', m.top + avgY + 4)
    .style('font-size', '8px').style('font-weight', '500')
    .style('fill', 'rgba(0,0,0,0.32)').style('font-family', 'var(--font-sans)')
    .text('avg ' + vs.avg);
  svg.append('text').attr('x', m.left + iW + 5).attr('y', m.top + yScale(vs.high) + 4)
    .style('font-size', '7px').style('fill', 'rgba(0,0,0,0.2)').style('font-family', 'var(--font-sans)')
    .text(vs.high);
  svg.append('text').attr('x', m.left + iW + 5).attr('y', m.top + yScale(vs.low) + 4)
    .style('font-size', '7px').style('fill', 'rgba(0,0,0,0.2)').style('font-family', 'var(--font-sans)')
    .text(vs.low);

  // ── Area fill (completed sprints only — no partial) ──
  var area = d3.area()
    .x(function(d) { return xScale(d.id); })
    .y0(iH).y1(function(d) { return yScale(d.pts); })
    .curve(d3.curveMonotoneX);
  g.append('path').datum(completed).style('fill', 'url(#vel-grad)').attr('d', area);

  // ── Line (full series including partial) ──
  var line = d3.line()
    .x(function(d) { return xScale(d.id); })
    .y(function(d) { return yScale(d.pts); })
    .curve(d3.curveMonotoneX);
  var lp = g.append('path').datum(vh)
    .attr('fill', 'none').attr('stroke', pri).attr('stroke-width', 2).attr('d', line);
  var tl = lp.node().getTotalLength();
  lp.attr('stroke-dasharray', tl + ' ' + tl).attr('stroke-dashoffset', tl)
    .transition().duration(720).ease(d3.easeQuadOut).attr('stroke-dashoffset', 0);

  // ── Forecast: dashed line from current S2 up to avg target ──
  if (!isOnTrack) {
    g.append('line')
      .attr('x1', partX).attr('x2', partX)
      .attr('y1', partY).attr('y2', avgY)
      .attr('stroke', warn).attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,2').attr('opacity', 0.72);
    // Target diamond marker at avg
    g.append('path')
      .attr('d', 'M' + partX + ',' + (avgY - 4.5) + 'L' + (partX + 4) + ',' + avgY +
                 'L' + partX + ',' + (avgY + 4.5) + 'L' + (partX - 4) + ',' + avgY + 'Z')
      .attr('fill', 'none').attr('stroke', warn).attr('stroke-width', 1.5).attr('opacity', 0.65);
    // "+N pts needed" — sits above the diamond, centred on the gap line
    g.append('text')
      .attr('x', partX).attr('y', avgY - 9)
      .attr('text-anchor', 'middle')
      .style('font-size', '8.5px').style('font-weight', '600')
      .style('fill', warn).style('font-family', 'var(--font-sans)')
      .text('+' + gap + ' pts');
  }

  // ── Data point dots + value labels ──
  vh.forEach(function(d) {
    var cx = xScale(d.id), cy = yScale(d.pts);
    g.append('circle').attr('cx', cx).attr('cy', cy)
      .attr('r', d.partial ? 4.5 : 3.5)
      .attr('fill', d.partial ? '#fff' : pri)
      .attr('stroke', d.partial ? warn : pri)
      .attr('stroke-width', d.partial ? 2 : 0);
    g.append('text').attr('x', cx).attr('y', cy - 9)
      .attr('text-anchor', 'middle')
      .style('font-size', d.partial ? '9.5px' : '8.5px')
      .style('font-weight', d.partial ? '600' : '500')
      .style('fill', d.partial ? warn : pri)
      .style('font-family', 'var(--font-sans)')
      .text(d.pts);
  });

  // ── PI separator + group labels ──
  var pi25LastX = xScale('prevsp5');
  var pi26FirstX = xScale('sp1');
  var sepX = (pi25LastX + pi26FirstX) / 2;
  g.append('line').attr('x1', sepX).attr('x2', sepX)
    .attr('y1', 0).attr('y2', iH)
    .attr('stroke', 'rgba(0,0,0,0.07)').attr('stroke-width', 1);
  g.append('text').attr('x', sepX / 2).attr('y', -5)
    .attr('text-anchor', 'middle')
    .style('font-size', '7.5px').style('fill', 'rgba(0,0,0,0.22)')
    .style('font-family', 'var(--font-sans)').text('PI 25');
  g.append('text').attr('x', (sepX + iW) / 2).attr('y', -5)
    .attr('text-anchor', 'middle')
    .style('font-size', '7.5px').style('fill', pri).style('opacity', 0.55)
    .style('font-weight', '500').style('font-family', 'var(--font-sans)').text('PI 26');

  // ── X axis ──
  g.append('g').attr('transform', 'translate(0,' + iH + ')')
    .call(d3.axisBottom(xScale).tickSize(0)
      .tickFormat(function(id) {
        var sp = vh.filter(function(v) { return v.id === id; })[0];
        if (!sp) return '';
        var short = sp.name.split(' ').pop();
        return sp.partial ? short + ' ▶' : short;
      }))
    .call(function(axis) {
      axis.select('.domain').remove();
      axis.selectAll('text')
        .style('font-size', '8px').style('font-family', 'var(--font-sans)')
        .style('fill', function(id) {
          var sp = vh.filter(function(v) { return v.id === id; })[0];
          return (sp && sp.partial) ? warn : 'rgba(0,0,0,0.32)';
        });
    });

  // ── Hover: crosshair + snap dot ──
  var hL = g.append('line').attr('y1', 0).attr('y2', iH)
    .attr('stroke', pri).attr('stroke-width', 1).attr('stroke-dasharray', '2,2')
    .attr('opacity', 0).attr('pointer-events', 'none');
  var hD = g.append('circle').attr('r', 5).attr('fill', '#fff')
    .attr('stroke', pri).attr('stroke-width', 2)
    .attr('opacity', 0).attr('pointer-events', 'none');

  g.append('rect').attr('width', iW).attr('height', iH).attr('fill', 'transparent')
    .on('mousemove', function(event) {
      var mx = d3.pointer(event)[0];
      var nr = vh.reduce(function(b, d) {
        var dist = Math.abs(xScale(d.id) - mx);
        return dist < b.dist ? { d: d, dist: dist } : b;
      }, { d: vh[0], dist: Infinity }).d;
      hL.attr('x1', xScale(nr.id)).attr('x2', xScale(nr.id)).attr('opacity', 0.3);
      hD.attr('cx', xScale(nr.id)).attr('cy', yScale(nr.pts)).attr('opacity', 1);
      showTip('<strong>' + nr.name + '</strong> &nbsp;' + nr.pts + ' pts' +
        (nr.partial ? ' <span style="opacity:0.5">(in progress)</span>' : ''), event);
    })
    .on('mouseout', function() { hL.attr('opacity', 0); hD.attr('opacity', 0); hideTip(); });
};

// ── Team health heatmap — D3 SVG grid ─────────────────
EAP.drawHealthHeatmap = function() {
  if (typeof d3 === 'undefined') return;
  var th = EAP.teamHealth;
  if (!th) return;
  var svgEl = document.getElementById('healthHeatmapSvg');
  if (!svgEl) return;

  var dims = [
    { key: 'cap',   vKey: 'capV',   label: 'Cap',     unit: '%', tip: 'Capacity' },
    { key: 'flow',  vKey: 'flowV',  label: 'Cycle',   unit: 'd', tip: 'Cycle time' },
    { key: 'qual',  vKey: 'qualV',  label: 'Defects', unit: '',  tip: 'Open defects' },
    { key: 'block', vKey: 'blockV', label: 'Blkd',    unit: '',  tip: 'Blocked items' }
  ];
  var sc = {
    healthy: { bg: 'rgba(0,131,79,0.09)',   text: '#00834f', hover: 'rgba(0,131,79,0.18)' },
    watch:   { bg: 'rgba(141,110,0,0.09)',  text: '#8d6e00', hover: 'rgba(141,110,0,0.18)' },
    over:    { bg: 'rgba(226,22,28,0.09)',  text: '#e2161c', hover: 'rgba(226,22,28,0.18)' }
  };
  var teams = Object.keys(th);
  var W = Math.max(1, svgEl.getBoundingClientRect().width || svgEl.parentElement.clientWidth - 28);
  var labelW = 58, cellH = 22, cellPad = 3, headerH = 18;
  var cellW = (W - labelW) / dims.length;
  var H = headerH + teams.length * (cellH + cellPad) + cellPad;

  var svg = d3.select(svgEl).attr('width', W).attr('height', H);
  svg.selectAll('*').remove();

  // Column headers
  dims.forEach(function(dim, ci) {
    svg.append('text')
      .attr('x', labelW + ci * cellW + cellW / 2)
      .attr('y', 12).attr('text-anchor', 'middle')
      .style('font-size', '9px').style('font-weight', '500')
      .style('font-family', 'var(--font-sans)')
      .style('fill', 'rgba(0,0,0,0.32)').style('text-transform', 'uppercase')
      .style('letter-spacing', '0.03em').text(dim.label);
  });

  // Rows
  teams.forEach(function(team, ri) {
    var t = th[team];
    var y = headerH + ri * (cellH + cellPad);

    // Row severity: worst dimension status across all 4 dimensions
    var _rowWorst = 'healthy';
    dims.forEach(function(dim) {
      var ds = t[dim.key];
      if (ds === 'over') _rowWorst = 'over';
      else if (ds === 'watch' && _rowWorst !== 'over') _rowWorst = 'watch';
    });
    svg.append('circle').attr('cx', 4).attr('cy', y + cellH / 2).attr('r', 3)
      .style('fill', sc[_rowWorst].text).style('opacity', 0.85);
    svg.append('text').attr('x', 11).attr('y', y + cellH / 2 + 4)
      .style('font-size', '10px').style('font-family', 'var(--font-sans)')
      .style('fill', 'rgba(0,0,0,0.38)').text(team);

    dims.forEach(function(dim, ci) {
      var status = t[dim.key], val = t[dim.vKey], colors = sc[status];
      var cx = labelW + ci * cellW;
      var grp = svg.append('g').attr('opacity', 0);

      var bgRect = grp.append('rect')
        .attr('x', cx + 2).attr('y', y)
        .attr('width', cellW - 4).attr('height', cellH)
        .attr('rx', 3).style('fill', colors.bg);

      grp.append('text')
        .attr('x', cx + cellW / 2).attr('y', y + cellH / 2 + 4)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px').style('font-weight', '600')
        .style('font-family', 'var(--font-mono, var(--font-sans))')
        .style('fill', colors.text)
        .text(val + dim.unit);

      grp.append('rect')
        .attr('x', cx + 2).attr('y', y)
        .attr('width', cellW - 4).attr('height', cellH)
        .attr('rx', 3).style('fill', 'transparent')
        .on('mouseover', function(event) {
          bgRect.style('fill', colors.hover);
          showTip('<strong>' + team + '</strong> · ' + dim.tip + '<br><span style="color:' + colors.text + '">' + val + dim.unit + ' — ' + status + '</span>', event);
        })
        .on('mousemove', moveTip)
        .on('mouseout', function() { bgRect.style('fill', colors.bg); hideTip(); });

      grp.transition().delay(ri * 45 + ci * 15).duration(280).attr('opacity', 1);
    });
  });
};

// ── Confidence toggle ─────────────────────────────────
EAP._insightFilter = 'all';
EAP.toggleConfidence = function() {
  EAP._insightFilter = EAP._insightFilter === 'high' ? 'all' : 'high';
  EAP.renderInsights();
  EAP.wireInsightActions();
  EAP.showToast(EAP._insightFilter === 'high' ? 'High-confidence signals only' : 'Showing all signals', 'info');
};
