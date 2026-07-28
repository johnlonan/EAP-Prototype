/* ═══════════════════════════════════════════════════════
   ANALYTICS.JS — Analytics tab renderer
   Scope-adaptive: Portfolio / ST / ART / Team
   Pattern C: AI insight on every card + summary insights panel

   Workload section uses EAP.renderWorkloadSection() from track.js
   — the full workload view is translated here from the former
   Task Board's Workload mode.
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

// ── Analytics metric card ──────────────────────────────
// Each card: big metric + label + trend + ✦ AI insight inline
function analyticsCard(opts) {
  var trendClass = opts.trendDir === 'up'    ? 'an-trend--up'
                 : opts.trendDir === 'down'  ? 'an-trend--down'
                 : opts.trendDir === 'warn'  ? 'an-trend--warn'
                 : 'an-trend--neutral';
  var trendIcon  = opts.trendDir === 'up'    ? '↑'
                 : opts.trendDir === 'down'  ? '↓'
                 : opts.trendDir === 'warn'  ? '↓'
                 : '→';

  return '<div class="an-card' + (opts.wide ? ' an-card--wide' : '') + '">' +
    '<div class="an-card-body">' +
      '<div class="an-metric">' +
        '<span class="an-metric-value">' + opts.value + '</span>' +
        (opts.unit ? '<span class="an-metric-unit">' + opts.unit + '</span>' : '') +
      '</div>' +
      '<div class="an-metric-label">' + opts.label + '</div>' +
      (opts.trend ? '<div class="an-trend ' + trendClass + '">' + trendIcon + ' ' + opts.trend + '</div>' : '') +
      (opts.chart ? '<div class="an-card-chart">' + opts.chart + '</div>' : '') +
    '</div>' +
    (opts.insight ? '<div class="an-insight">' + EAP.icon('sparkle', 11) + opts.insight + '</div>' : '') +
  '</div>';
}

// ── Inline sparkline (SVG bars) ────────────────────────
function sparkBars(values, colors, width, height) {
  var w = width || 80, h = height || 28;
  var max = Math.max.apply(null, values);
  var barW = Math.floor((w - (values.length - 1) * 2) / values.length);
  var svg = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">';
  values.forEach(function(v, i) {
    var barH = Math.max(3, Math.round((v / max) * (h - 2)));
    var x = i * (barW + 2);
    var y = h - barH;
    var c = colors ? (colors[i] || '#CCCBC8') : '#CCCBC8';
    svg += '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + barH + '" rx="2" fill="' + c + '"/>';
  });
  return svg + '</svg>';
}

// ── Workload section wrapper ───────────────────────────
// Pulls the full workload view from track.js (via EAP.renderWorkloadSection)
// and wraps it in a titled section card for the Analytics layout.
function workloadSection() {
  var content = EAP.renderWorkloadSection ? EAP.renderWorkloadSection() : '';
  if (!content) return '';
  return '<div class="an-workload-section">' +
    '<div class="an-section-hd">' +
      '<span class="an-section-title">Workload & Flow</span>' +
      '<span class="an-section-sub">Capacity, velocity, and sprint breakdown</span>' +
    '</div>' +
    '<div class="an-workload-body">' + content + '</div>' +
  '</div>';
}

// ── ART-level Analytics ────────────────────────────────
EAP.renderAnalyticsART = function() {
  var s = EAP.state;

  // Compute PI progress from feature data
  var piFeatures = EAP.allFeatures ? EAP.allFeatures.filter(function(f) {
    return f.pi === 'PI 26' || f.pi === 'pi26';
  }) : [];
  var done = piFeatures.filter(function(f) { return f.state === 'Done'; }).length;
  var total = piFeatures.length || 24;
  var donePct = total > 0 ? Math.round((done / total) * 100) : 38;

  // Velocity from history
  var vs = EAP.velocityStats || {};
  var avgVel = vs.avg ? Math.round(vs.avg) : 47;

  // PI + sprint context
  var activePi = (EAP.features && EAP.features.pis || []).filter(function(p) { return p.active; })[0];
  var curPiName = activePi ? activePi.name : 'PI 26';
  var activeSp = (EAP.workItems && EAP.workItems.sprints || []).filter(function(sp) { return sp.active; })[0];
  var curSpName = activeSp ? activeSp.name : 'Sprint 2';

  var h = '<div class="an-root">';

  // ── Sprint context strip ───────────────────────────
  h += '<div class="an-context-strip">' +
    '<span class="an-ctx-badge">' + curPiName + ' · ' + curSpName + '</span>' +
    '<span class="an-ctx-dot"></span>' +
    '<span class="an-ctx-item">8 days remaining in sprint</span>' +
    '<span class="an-ctx-dot"></span>' +
    '<span class="an-ctx-item">6 teams · Digital Banking ART</span>' +
  '</div>';

  // ── Summary insight banner (Pattern C — cross-metric) ──
  h += '<div class="an-banner">' +
    '<span class="an-banner-icon">' + EAP.icon('sparkle', 13) + '</span>' +
    '<div class="an-banner-text">' +
      '<strong>PI velocity is declining while WIP is rising and cycle time is up.</strong> ' +
      'These three signals together suggest a flow problem, not a capacity problem. ' +
      'Capping WIP across the 3 at-risk teams would recover an estimated 12 pts before PI close.' +
    '</div>' +
    '<span class="an-banner-conf">High confidence</span>' +
  '</div>';

  // ── Metric cards ───────────────────────────────────
  h += '<div class="an-cards">';

  h += analyticsCard({
    value: donePct,
    unit: '%',
    label: 'PI Completion',
    trend: '38% → ' + donePct + '% this PI',
    trendDir: donePct >= 40 ? 'up' : 'warn',
    chart: sparkBars([22, 28, 31, 38], ['#CCCBC8','#CCCBC8','#CCCBC8','#16A34A'], 72, 24),
    insight: 'On track for 68–74% completion by PI close. 3 features at risk of carry-over.'
  });

  h += analyticsCard({
    value: '76',
    unit: '%',
    label: 'PI Predictability',
    trend: '−6pts from PI 25',
    trendDir: 'warn',
    chart: sparkBars([88, 84, 82, 76], ['#CCCBC8','#CCCBC8','#D97706','#DC2626'], 72, 24),
    insight: 'Declining 3 consecutive PIs. Unplanned work ratio increased to 18%. Commit discipline review recommended.'
  });

  h += analyticsCard({
    value: avgVel,
    unit: 'pts',
    label: 'Avg Team Velocity',
    trend: '+3pts vs PI 25',
    trendDir: 'up',
    chart: sparkBars([42, 44, 46, 47], ['#CCCBC8','#CCCBC8','#CCCBC8','#16A34A'], 72, 24),
    insight: 'Auth and Payments teams above target. Fraud Team 20% below — 3 unassigned stories.'
  });

  h += analyticsCard({
    value: '63',
    unit: '%',
    label: 'Flow Efficiency',
    trend: '−9pts this sprint',
    trendDir: 'warn',
    chart: sparkBars([78, 74, 70, 63], ['#CCCBC8','#CCCBC8','#D97706','#DC2626'], 72, 24),
    insight: 'Items spending 45% of cycle time in inactive state. WIP across 3 teams exceeds limit.'
  });

  h += '</div>'; // .an-cards

  // ── Full workload section (translated from former Task Board workload view) ──
  h += workloadSection();

  h += '</div>'; // .an-root
  return h;
};

// ── Team-level Analytics ───────────────────────────────
EAP.renderAnalyticsTeam = function() {
  var s = EAP.state;
  var teamName = s.contextName || 'Auth Team';

  // Sprint context
  var activeSprint = (EAP.workItems && EAP.workItems.sprints || []).filter(function(sp) { return sp.active; })[0] ||
                     (EAP.workItems && EAP.workItems.sprints || [])[0] || {};
  var activePi = (EAP.features && EAP.features.pis || []).filter(function(p) { return p.active; })[0];
  var curPiName = activePi ? activePi.name : 'PI 26';

  // Team-scoped sprint items
  var sprintItems = (activeSprint.items || []).filter(function(i) {
    return !s.contextId || i.team === teamName || i.team === teamName.replace(' Team', '');
  });
  var done  = sprintItems.filter(function(i) { return i.state === 'Done'; }).length;
  var total = sprintItems.length;
  var inProg = sprintItems.filter(function(i) { return i.state === 'In Progress'; }).length;

  var velHistory = EAP.velocityHistory || [];
  var avgVel = velHistory.length > 0
    ? Math.round(velHistory.reduce(function(a, v) { return a + v.pts; }, 0) / velHistory.length)
    : 44;

  var h = '<div class="an-root">';

  // ── Sprint context strip ───────────────────────────
  h += '<div class="an-context-strip">' +
    '<span class="an-ctx-badge">' + teamName + ' · ' + (activeSprint.name || 'Sprint 2') + '</span>' +
    '<span class="an-ctx-dot"></span>' +
    '<span class="an-ctx-item">8 days remaining</span>' +
    '<span class="an-ctx-dot"></span>' +
    '<span class="an-ctx-item">' + curPiName + '</span>' +
  '</div>';

  // ── Summary insight banner ─────────────────────────
  h += '<div class="an-banner">' +
    '<span class="an-banner-icon">' + EAP.icon('sparkle', 13) + '</span>' +
    '<div class="an-banner-text">' +
      '<strong>Sprint burn rate is 12% below target as of Day 3.</strong> ' +
      inProg + ' stories in progress, ' + done + ' completed. ' +
      'At current pace, forecast completion is 62–74% of sprint commitment.' +
    '</div>' +
    '<span class="an-banner-conf">High confidence</span>' +
  '</div>';

  // ── Metric cards ───────────────────────────────────
  h += '<div class="an-cards">';

  h += analyticsCard({
    value: done + '/' + total,
    label: 'Stories Complete',
    trend: 'Sprint Day 3 of 10',
    trendDir: total > 0 && done / total >= 0.3 ? 'up' : 'warn',
    insight: 'Behind plan. Expected ' + Math.round(total * 0.35) + ' stories done by Day 3 based on team velocity.'
  });

  h += analyticsCard({
    value: avgVel,
    unit: 'pts',
    label: 'Avg Sprint Velocity',
    trend: '+3pts vs last PI avg',
    trendDir: 'up',
    chart: sparkBars(
      velHistory.length > 0 ? velHistory.map(function(v) { return v.pts; }) : [40, 44, 42, 46, 44],
      null, 72, 24
    ),
    insight: 'Velocity stable over 4 sprints. No significant variance. Capacity planning reliable.'
  });

  h += analyticsCard({
    value: '78',
    unit: '%',
    label: 'Sprint Predictability',
    trend: '+2pts vs last sprint',
    trendDir: 'up',
    insight: 'Improving. Commitment accuracy above team average. 2 carry-overs from Sprint 1 now resolved.'
  });

  h += analyticsCard({
    value: '4.2',
    unit: 'd',
    label: 'Avg Cycle Time',
    trend: '+0.8d this sprint',
    trendDir: 'warn',
    insight: 'Cycle time creeping up. Correlates with increase in in-progress WIP above 6 items.'
  });

  h += '</div>'; // .an-cards

  // ── Full workload section (translated from former Task Board workload view) ──
  h += workloadSection();

  h += '</div>'; // .an-root
  return h;
};

// ── Portfolio-level Analytics ──────────────────────────
EAP.renderAnalyticsPortfolio = function() {
  var h = '<div class="an-root">';

  h += '<div class="an-context-strip">' +
    '<span class="an-ctx-badge">Portfolio</span>' +
    '<span class="an-ctx-dot"></span>' +
    '<span class="an-ctx-item">PI 26 · 2 Solution Trains · 4 ARTs</span>' +
  '</div>';

  h += '<div class="an-banner">' +
    '<span class="an-banner-icon">' + EAP.icon('sparkle', 13) + '</span>' +
    '<div class="an-banner-text">' +
      '<strong>Digital & Payments ST is on track. Lending & Mortgages ST is at risk.</strong> ' +
      '2 Epics across Lending are below 40% completion with less than 3 sprints remaining in PI 26.' +
    '</div>' +
    '<span class="an-banner-conf">High confidence</span>' +
  '</div>';

  h += '<div class="an-cards">';

  h += analyticsCard({
    value: '14',
    unit: '/22',
    label: 'Epics In Flight',
    trend: '4 delivered this PI',
    trendDir: 'up',
    insight: '3 Epics at risk of carrying over to PI 27 based on current throughput.'
  });

  h += analyticsCard({
    value: '68',
    unit: '%',
    label: 'Portfolio Predictability',
    trend: '−4pts from PI 25',
    trendDir: 'warn',
    chart: sparkBars([76, 74, 72, 68], ['#CCCBC8','#CCCBC8','#D97706','#DC2626'], 72, 24),
    insight: 'Third consecutive PI of decline. Unplanned work now 22% of total investment.'
  });

  h += analyticsCard({
    value: '£2.4M',
    label: 'In-flight Investment',
    trend: '18% unplanned work',
    trendDir: 'warn',
    insight: 'Lending & Mortgages over-invested this PI by est. £380K vs. original allocation.'
  });

  h += analyticsCard({
    value: '11',
    unit: 'wks',
    label: 'Avg Epic Lead Time',
    trend: '+2wks vs PI 24',
    trendDir: 'warn',
    insight: 'Lead time growing. Largest contributor: dependency wait time between ARTs averaging 3.2 weeks.'
  });

  h += '</div>'; // .an-cards

  h += '</div>'; // .an-root
  return h;
};

// ── ST-level Analytics ─────────────────────────────────
EAP.renderAnalyticsST = function() {
  var h = '<div class="an-root">';

  h += '<div class="an-context-strip">' +
    '<span class="an-ctx-badge">Sol. Train</span>' +
    '<span class="an-ctx-dot"></span>' +
    '<span class="an-ctx-item">' + (EAP.state.contextName || 'Digital & Payments ST') + ' · PI 26</span>' +
  '</div>';

  h += '<div class="an-banner">' +
    '<span class="an-banner-icon">' + EAP.icon('sparkle', 13) + '</span>' +
    '<div class="an-banner-text">' +
      '<strong>3 cross-ART dependencies unresolved entering Sprint 3.</strong> ' +
      'Auth API dependency affecting both Digital Banking and Payments ARTs. ' +
      'Resolution needed before Sprint 4 planning.' +
    '</div>' +
    '<span class="an-banner-conf">Moderate confidence</span>' +
  '</div>';

  h += '<div class="an-cards">';

  h += analyticsCard({
    value: '82',
    unit: '%',
    label: 'Capability Completion',
    trend: 'On track for PI 26',
    trendDir: 'up',
    insight: '2 Capabilities at risk. Auth API integration 40% complete with 3 sprints remaining.'
  });

  h += analyticsCard({
    value: '3',
    label: 'Open Cross-ART Deps',
    trend: '+1 since last sprint',
    trendDir: 'warn',
    insight: 'Auth API dependency is oldest at 18 days unresolved. Escalation recommended.'
  });

  h += analyticsCard({
    value: '74',
    unit: '%',
    label: 'ST Predictability',
    trend: 'Stable vs PI 25',
    trendDir: 'neutral',
    insight: 'Predictability held at 74% for 2 consecutive PIs. Dependency management is the limiting factor.'
  });

  h += analyticsCard({
    value: '6.1',
    unit: 'wks',
    label: 'Avg Capability Lead Time',
    trend: '−0.4wks improvement',
    trendDir: 'up',
    insight: 'Lead time improving since WIP limits introduced in Sprint 1.'
  });

  h += '</div>'; // .an-cards

  h += '</div>'; // .an-root
  return h;
};

// ── Main router ────────────────────────────────────────
EAP.renderAnalytics = function() {
  var s = EAP.state;
  var content = '';
  if (s.context === 'portfolio')           content = EAP.renderAnalyticsPortfolio();
  else if (s.context === 'solution-train') content = EAP.renderAnalyticsST();
  else if (s.context === 'team')           content = EAP.renderAnalyticsTeam();
  else                                      content = EAP.renderAnalyticsART();

  return '<div class="an-layout">' + content + '</div>' +
         (s.insightsOpen ? '<div class="gpanel ins-panel" id="insights-panel"></div>' : '');
};

// ── Chart initializer — called after DOM settles ───────
// Translates the former Task Board workload chart initializers
// into the Analytics tab context.
EAP.initAnalyticsCharts = function() {
  var s = EAP.state;
  // Workload sparklines (per-member bars) — ART and Team levels
  if (EAP.initWorkloadSparklines) EAP.initWorkloadSparklines();
  // Sprint comparison chart
  if (EAP.initSprintComparisonChart) EAP.initSprintComparisonChart();
  // CFD chart — ART level only
  if (s.context !== 'team' && EAP.initCFDChart) EAP.initCFDChart();
};
