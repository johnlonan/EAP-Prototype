/* ═══════════════════════════════════════════════════════
   CHARTS.JS — Sprint burndown + PI velocity charts
   Uses Chart.js (bundled). Renders into the insights panel.
   Only shown at ART context, Feature or WorkItem level.
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

EAP.renderCharts = function() {
  var s = EAP.state;
  // Only show at ART context on Feature or WorkItem level, non-hierarchy tabs
  if (s.context !== 'art' || s.tab === 'hierarchy') return;
  if (s.level !== 'Feature' && s.level !== 'WorkItem') return;

  var panel = document.getElementById('insights-panel');
  if (!panel) return;

  // Insert chart section before the signals section
  var chartHtml = '<div class="ins-charts">';

  if (s.level === 'WorkItem') {
    chartHtml += '<div class="ins-chart-wrap"><div class="ins-chart-title">Sprint Burndown</div><canvas id="burndownChart" height="140"></canvas></div>';
  }

  chartHtml += '<div class="ins-chart-wrap"><div class="ins-chart-title">' +
    (s.level === 'WorkItem' ? 'Sprint Velocity' : 'PI Feature Progress') +
    '</div><canvas id="velocityChart" height="140"></canvas></div>';

  chartHtml += '</div>';

  // Insert after teams section or after gauge
  var scroll = panel.querySelector('.ins-scroll');
  if (scroll) {
    var sigSec = scroll.querySelector('.ins-sec');
    if (sigSec) {
      sigSec.insertAdjacentHTML('beforebegin', chartHtml);
    } else {
      scroll.insertAdjacentHTML('beforeend', chartHtml);
    }
  }

  // Draw charts after DOM insert
  setTimeout(function() {
    if (s.level === 'WorkItem') EAP.drawBurndown();
    EAP.drawVelocity(s.level);
  }, 80);
};

// ── Sprint Burndown (WorkItem level) ──────────────────
EAP.drawBurndown = function() {
  var el = document.getElementById('burndownChart');
  if (!el || typeof Chart === 'undefined') return;

  var totalPts = 32; // Sprint 2 total
  var days = EAP._sprintDays;
  var dayLabels = [];
  for (var i = 1; i <= days; i++) dayLabels.push('D' + i);

  // Ideal burndown (straight line)
  var ideal = dayLabels.map(function(_, idx) { return Math.round(totalPts * (1 - idx / (days - 1))); });

  // Actual burndown (simulated — slower than ideal, realistic)
  var actual = [32, 32, 30, 28, 27, 25, 24, 24, 22, 20, 18, 16, 14, 12];
  // Trim to current day
  var currentDay = Math.min(EAP._dayInSprint, days);
  actual = actual.slice(0, currentDay);

  new Chart(el, {
    type: 'line',
    data: {
      labels: dayLabels,
      datasets: [
        { label: 'Ideal', data: ideal, borderColor: 'rgba(0,0,0,0.12)', borderWidth: 1.5, borderDash: [4, 3], pointRadius: 0, fill: false, tension: 0 },
        { label: 'Actual', data: actual, borderColor: '#0e4e69', borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, fill: false, tension: 0.2 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 9, family: 'var(--font-sans)' }, color: '#c2c1be', maxRotation: 0 } },
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 9 }, color: '#c2c1be', stepSize: 8 } }
      }
    }
  });
};

// ── Velocity / Feature Progress ───────────────────────
EAP.drawVelocity = function(level) {
  var el = document.getElementById('velocityChart');
  if (!el || typeof Chart === 'undefined') return;

  if (level === 'WorkItem') {
    // Sprint velocity — points completed per sprint
    new Chart(el, {
      type: 'bar',
      data: {
        labels: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4'],
        datasets: [{
          label: 'Completed',
          data: [28, 8, 0, 0],
          backgroundColor: ['#0e4e69', 'rgba(14,78,105,0.5)', 'rgba(14,78,105,0.15)', 'rgba(14,78,105,0.15)'],
          borderRadius: 4,
          barThickness: 24,
          borderSkipped: false
        }, {
          label: 'Committed',
          data: [30, 32, 29, 24],
          backgroundColor: 'rgba(0,0,0,0.06)',
          borderRadius: 4,
          barThickness: 24,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#c2c1be' } },
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 9 }, color: '#c2c1be', stepSize: 10 } }
        }
      }
    });
  } else {
    // Feature level — progress per feature (horizontal bar)
    var features = EAP.allFeatures.filter(function(f) { return f.pi === 'pi26'; });
    new Chart(el, {
      type: 'bar',
      data: {
        labels: features.map(function(f) { return f.name.length > 20 ? f.name.substring(0, 18) + '…' : f.name; }),
        datasets: [{
          label: '% Complete',
          data: features.map(function(f) { return f.pct || 0; }),
          backgroundColor: features.map(function(f) {
            if (f.state === 'Done') return '#00834f';
            if (f.state === 'Blocked') return '#e2161c';
            if (f.pct >= 40) return '#0e4e69';
            return 'rgba(14,78,105,0.4)';
          }),
          borderRadius: 4,
          barThickness: 14,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 9 }, color: '#c2c1be', callback: function(v) { return v + '%'; } } },
          y: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#656462' } }
        }
      }
    });
  }
};
