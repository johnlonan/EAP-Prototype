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

EAP.renderInsights = function() {
  var el = document.getElementById('insights-panel');
  if (!el) return;
  var d = EAP.getInsights();
  var s = EAP.state;

  // ── Panel header ──
  var h = '<div class="ins-hdr">' +
    '<div class="ins-hdr-left">' + EAP.icon('sparkle', 16) + '<span>Insights</span></div>' +
    '<div class="ins-hdr-right"><span class="ins-fresh">' + EAP.icon('clock', 10) + ' Just now</span>' +
    '<button class="ins-filter-btn" id="ins-filter-toggle" title="High confidence only" onclick="EAP.toggleInsightFilter()">' + EAP.icon('filter', 13) + '</button>' +
    '<button class="ins-close" onclick="EAP.toggleInsights()">' + EAP.icon('x', 14) + '</button></div></div>';

  h += '<div class="ins-scroll">';

  // ── Hero metric (gauge + prediction) — Planning/Board only ──
  if (d.gauge || d.predict) {
    var heroVal = d.predict ? d.predict.value : d.gauge ? d.gauge.value : 0;
    var heroLabel = d.predict ? d.predict.label : d.gauge ? d.gauge.label : '';
    var heroColor = heroVal >= 80 ? 'var(--dv-success)' : heroVal >= 60 ? 'var(--dv-warning)' : 'var(--dv-error)';
    var trendHtml = '';
    if (d.predict && d.predict.trend) {
      var tIcon = d.predict.trend === 'down' ? 'trending-down' : 'trending-up';
      var tLabel = d.predict.trend === 'down' ? 'Declining' : 'Improving';
      var tColor = d.predict.trend === 'down' ? 'var(--color-error)' : 'var(--color-success)';
      trendHtml = '<div class="ins-hero-trend" style="color:' + tColor + ';">' + EAP.icon(tIcon, 14) + ' ' + tLabel + '</div>';
    }
    var intervalHtml = (d.predict && d.predict.interval) ? '<div class="ins-hero-interval">± ' + d.predict.interval + '%</div>' : '';
    h += '<div class="ins-hero">' +
      '<canvas id="gaugeCanvas" width="200" height="110"></canvas>' +
      '<div class="ins-hero-overlay">' +
      '<div class="ins-hero-val" style="color:' + heroColor + ';">' + heroVal + '<span class="ins-hero-pct">%</span></div>' +
      trendHtml + '</div>' +
      '<div class="ins-hero-label">' + heroLabel + '</div>' +
      intervalHtml +
      (d.predict ? '<div class="ins-hero-meta"><span class="ins-hero-meta-icon">' + EAP.icon('sparkle', 10) + '</span> Otto · based on 6 teams, 3 sprints</div>' : '') +
      '</div>';
  }

  // ── Flow distribution — Backlog only ──
  if (d.flowDist) {
    var fd = d.flowDist;
    h += '<div class="ins-flow-dist"><div class="ins-sec-lbl">Flow Distribution</div><div class="ins-flow-bar">';
    var segments = [
      { pct: fd.features, label: 'Features', color: 'var(--color-primary)' },
      { pct: fd.defects, label: 'Defects', color: 'var(--color-error)' },
      { pct: fd.enablers, label: 'Enablers', color: 'var(--color-info)' },
      { pct: fd.maintenance, label: 'Maintenance', color: 'var(--text-disabled)' }
    ];
    segments.forEach(function(seg) {
      h += '<div class="ins-flow-seg" style="width:' + seg.pct + '%;background:' + seg.color + ';" title="' + seg.label + ': ' + seg.pct + '%"></div>';
    });
    h += '</div><div class="ins-flow-legend">';
    segments.forEach(function(seg) {
      h += '<span class="ins-flow-item"><span class="ins-flow-dot" style="background:' + seg.color + ';"></span>' + seg.label + ' ' + seg.pct + '%</span>';
    });
    h += '</div></div>';
  }

  // ── Team health heatmap grid — Planning/Board/Task Board at ART ──
  if (d.health && s.context === 'art') {
    var th = EAP.teamHealth;
    var dims = [
      { key: 'cap', vKey: 'capV', label: 'Cap', unit: '%', tip: 'Capacity utilisation' },
      { key: 'flow', vKey: 'flowV', label: 'Cycle', unit: 'd', tip: 'Avg cycle time (days)' },
      { key: 'qual', vKey: 'qualV', label: 'Defects', unit: '', tip: 'Open defect count' },
      { key: 'block', vKey: 'blockV', label: 'Blkd', unit: '', tip: 'Blocked items' }
    ];
    var hColors = { healthy: 'var(--dv-success)', watch: 'var(--dv-warning)', over: 'var(--dv-error)' };
    h += '<div class="ins-health"><div class="ins-sec-lbl">Team Health</div>';
    h += '<table class="ins-health-grid"><thead><tr><th></th>';
    dims.forEach(function(dim) { h += '<th title="' + dim.tip + '">' + dim.label + '</th>'; });
    h += '</tr></thead><tbody>';
    Object.keys(th).forEach(function(team) {
      var t = th[team];
      h += '<tr><td class="ins-health-team">' + team + '</td>';
      dims.forEach(function(dim) {
        var status = t[dim.key], val = t[dim.vKey];
        var col = hColors[status];
        h += '<td><span class="ins-health-val" style="color:' + col + ';">' + val + (dim.unit ? '<span class="ins-health-unit">' + dim.unit + '</span>' : '') + '</span></td>';
      });
      h += '</tr>';
    });
    h += '</tbody></table></div>';
  }

  // ── Inline sprint metrics — Task Board WorkItem only ──
  if (s.tab === 'taskboard' && s.level === 'WorkItem') {
    var sp = EAP.workItems.sprints.filter(function(sp) { return sp.active; })[0];
    if (sp) {
      var remaining = sp.totalPts - sp.donePts;
      h += '<div class="ins-metrics-section"><div class="ins-sec-lbl">At a glance</div>';
      h += '<div class="ins-metrics">' +
        '<div class="ins-metric"><div class="ins-metric-val">' + remaining + '</div><div class="ins-metric-lbl">Pts left</div>' +
        '<div class="ins-metric-bar"><div class="ins-metric-fill" style="width:' + Math.round(sp.donePts / sp.totalPts * 100) + '%;background:var(--color-primary);"></div></div></div>' +
        '<div class="ins-metric"><div class="ins-metric-val">3.2<span class="ins-metric-pct">d</span></div><div class="ins-metric-lbl">Avg cycle</div>' +
        '<div class="ins-metric-bar"><div class="ins-metric-fill" style="width:65%;background:var(--dv-warning);"></div></div></div>' +
        '<div class="ins-metric"><div class="ins-metric-val">4</div><div class="ins-metric-lbl">In review</div>' +
        '<div class="ins-metric-bar"><div class="ins-metric-fill" style="width:80%;background:var(--dv-error);"></div></div></div>' +
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
      // Ghost bar: where it should be based on time elapsed (40% through PI)
      var planned = Math.min(100, Math.round(40 + Math.random() * 20));
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
  if (d.gauge || d.predict) setTimeout(function() { EAP.drawGauge(d.predict ? d.predict.value : d.gauge.value); }, 50);

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
  var existing = document.querySelector('.eap-toast');
  if (existing) existing.remove();
  var t = document.createElement('div');
  t.className = 'eap-toast eap-toast-' + (type || 'info');
  t.innerHTML = EAP.icon(type === 'success' ? 'check-square' : 'info', 14) + ' ' + msg;
  document.body.appendChild(t);
  requestAnimationFrame(function() { t.classList.add('show'); });
  setTimeout(function() { t.classList.remove('show'); setTimeout(function() { t.remove(); }, 300); }, 3000);
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

// ── Confidence filter toggle ──────────────────────────
EAP._insightFilter = 'all';
EAP.toggleInsightFilter = function() {
  EAP._insightFilter = EAP._insightFilter === 'high' ? 'all' : 'high';
  var btn = document.getElementById('ins-filter-toggle');
  if (btn) btn.classList.toggle('active', EAP._insightFilter === 'high');
  EAP.renderInsights();
  EAP.wireInsightActions();
  EAP.showToast(EAP._insightFilter === 'high' ? 'Showing high confidence only' : 'Showing all signals', 'info');
};
