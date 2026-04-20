/* ═══════════════════════════════════════════════════════
   CHARTS.JS — Compact sparkline charts for insights panel
   Uses Chart.js (bundled). No axes, no grid, no legend.
   Pure data shape — the number tells the value, the shape
   tells the trend.
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

EAP.renderCharts = function() {
  var s = EAP.state;
  if (s.context !== 'art' || s.tab === 'hierarchy') return;
  if (s.level !== 'Feature' && s.level !== 'WorkItem') return;

  var panel = document.getElementById('insights-panel');
  if (!panel) return;

  var chartHtml = '<div class="ins-charts">';

  if (s.level === 'WorkItem') {
    // Burn rate sparkline + bold metric
    chartHtml += '<div class="ins-spark-row">' +
      '<div class="ins-spark-info"><div class="ins-spark-label">Sprint Burn Rate</div><div class="ins-spark-val">24 <span class="ins-spark-unit">pts remaining</span></div></div>' +
      '<div class="ins-spark-chart"><canvas id="burnSpark" height="40"></canvas></div></div>';

    // Velocity sparkline + bold metric
    chartHtml += '<div class="ins-spark-row">' +
      '<div class="ins-spark-info"><div class="ins-spark-label">Velocity Trend</div><div class="ins-spark-val">28 <span class="ins-spark-unit">pts / sprint</span></div></div>' +
      '<div class="ins-spark-chart"><canvas id="velSpark" height="40"></canvas></div></div>';
  }

  if (s.level === 'Feature') {
    // Feature progress compact bars
    chartHtml += '<div class="ins-chart-wrap"><div class="ins-chart-title">PI Feature Progress</div><canvas id="featureProgress" height="120"></canvas></div>';
  }

  chartHtml += '</div>';

  var scroll = panel.querySelector('.ins-scroll');
  if (scroll) {
    var sigSec = scroll.querySelector('.ins-sec');
    if (sigSec) sigSec.insertAdjacentHTML('beforebegin', chartHtml);
    else scroll.insertAdjacentHTML('beforeend', chartHtml);
  }

  setTimeout(function() {
    if (s.level === 'WorkItem') { EAP.drawBurnSpark(); EAP.drawVelSpark(); }
    if (s.level === 'Feature') EAP.drawFeatureProgress();
  }, 80);
};

// ── Sparkline base config ─────────────────────────────
function sparkBase() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false } },
    elements: { point: { radius: 0 } }
  };
}

// ── Sprint Burndown Sparkline ─────────────────────────
EAP.drawBurnSpark = function() {
  var el = document.getElementById('burnSpark');
  if (!el || typeof Chart === 'undefined') return;

  var actual = [32, 32, 30, 28, 27, 25, 24];
  var days = EAP._sprintDays;
  var ideal = [];
  for (var i = 0; i < days; i++) ideal.push(Math.round(32 * (1 - i / (days - 1))));

  new Chart(el, {
    type: 'line',
    data: {
      labels: ideal.map(function(_, i) { return i; }),
      datasets: [
        { data: ideal, borderColor: 'rgba(0,0,0,0.1)', borderWidth: 1, borderDash: [3,2], fill: false, tension: 0 },
        { data: actual, borderColor: '#0e4e69', borderWidth: 2, fill: true, backgroundColor: 'rgba(14,78,105,0.06)', tension: 0.3 }
      ]
    },
    options: sparkBase()
  });
};

// ── Velocity Sparkline ────────────────────────────────
EAP.drawVelSpark = function() {
  var el = document.getElementById('velSpark');
  if (!el || typeof Chart === 'undefined') return;

  new Chart(el, {
    type: 'bar',
    data: {
      labels: ['S1', 'S2', 'S3', 'S4'],
      datasets: [{
        data: [28, 8, 0, 0],
        backgroundColor: ['#0e4e69', 'rgba(14,78,105,0.5)', 'rgba(14,78,105,0.12)', 'rgba(14,78,105,0.12)'],
        borderRadius: 3,
        barThickness: 16,
        borderSkipped: false
      }]
    },
    options: Object.assign({}, sparkBase(), {
      scales: { x: { display: false }, y: { display: false, beginAtZero: true } }
    })
  });
};

// ── Feature Progress (horizontal bars) ────────────────
EAP.drawFeatureProgress = function() {
  var el = document.getElementById('featureProgress');
  if (!el || typeof Chart === 'undefined') return;

  var features = EAP.allFeatures.filter(function(f) { return f.pi === 'pi26'; });

  new Chart(el, {
    type: 'bar',
    data: {
      labels: features.map(function(f) { return f.name.length > 18 ? f.name.substring(0, 16) + '…' : f.name; }),
      datasets: [{
        data: features.map(function(f) { return f.pct || 0; }),
        backgroundColor: features.map(function(f) {
          if (f.state === 'Done') return '#00834f';
          if (f.state === 'Blocked' || f.blocked) return '#e2161c';
          if (f.pct >= 40) return '#0e4e69';
          return 'rgba(14,78,105,0.3)';
        }),
        borderRadius: 3,
        barThickness: 12,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: true, callbacks: { label: function(ctx) { return ctx.raw + '% complete'; } } } },
      scales: {
        x: { display: false, beginAtZero: true, max: 100 },
        y: { display: true, grid: { display: false }, ticks: { font: { size: 9, family: 'var(--font-sans)' }, color: '#656462', padding: 0 } }
      }
    }
  });
};
