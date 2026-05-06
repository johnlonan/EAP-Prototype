/* ═══════════════════════════════════════════════════════
   TIMELINE.JS — Multi-band Gantt timeline
   Header order: Calendar → PI → Sprint (containment hierarchy)
   Sprint band shown only at Feature/WorkItem level.
   Milestones filtered by level relevance.
   All dates from dynamic engine (EAP._today).
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

// ── Date helpers ──────────────────────────────────────
function tlP(ds) { return new Date(ds + 'T00:00:00'); }
function tlD(a, b) { return Math.round((b - a) / 86400000); }
function tlPct(r, td, d) { return Math.max(0, Math.min(100, tlD(r.start, d) / td * 100)); }
var MN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Time range by level ───────────────────────────────
function tlRange(level) {
  var ad = EAP._addDays, ps = EAP._piStart, PD = EAP._piDays;
  if (level === 'Epic' || level === 'Capability') return { start: ad(ps, -2 * PD), end: ad(ps, 4 * PD) };
  if (level === 'Feature') return { start: ad(ps, -PD / 2), end: ad(ps, 3 * PD) };
  return { start: ad(ps, -7), end: ad(ps, PD + 7) };
}

function tlShowSp(level) { return level === 'Feature' || level === 'WorkItem'; }

// ── Get items + date lookups ──────────────────────────
function tlItems(level) {
  var items = [], dl;
  if (level === 'Epic') {
    dl = EAP.timelineEpics; EAP.epics.all.forEach(function(e) { if (dl[e.id]) items.push(e); });
  } else if (level === 'Capability') {
    dl = EAP.timelineCaps; EAP.capabilities.all.forEach(function(c) { if (dl[c.id]) items.push(c); });
  } else if (level === 'Feature') {
    dl = EAP.timelineFeatures; EAP.allFeatures.forEach(function(f) { if (dl[f.id]) items.push(f); });
  } else {
    dl = {}; EAP.workItems.sprints.forEach(function(sp) {
      var sd = EAP.sprintDates[sp.id]; if (!sd) return;
      (sp.items || []).forEach(function(wi) { dl[wi.id] = { start: sd.start, end: sd.end }; items.push(wi); });
    });
  }
  // Persona "owned/assigned to me" + team scope (when context is a team)
  items = EAP.applyScope(EAP.applyMineFilter(items), level);
  return { items: items, dates: dl };
}

// ── Group items ───────────────────────────────────────
// Default per-level grouping (preserves existing behaviour when groupBy='default').
function tlGroupDefault(items, level) {
  if (level === 'Epic') {
    var g1=[], g2=[], ot=[];
    items.forEach(function(e) { if (e.goal==='g1') g1.push(e); else if (e.goal==='g2') g2.push(e); else ot.push(e); });
    var gs = [];
    if (g1.length) gs.push({label:EAP.goalName('g1'),items:g1});
    if (g2.length) gs.push({label:EAP.goalName('g2'),items:g2});
    if (ot.length) gs.push({label:'Unassigned',items:ot});
    return gs;
  }
  if (level === 'Capability') {
    var ba={}; items.forEach(function(c){var k=c.art||'Unassigned';if(!ba[k])ba[k]=[];ba[k].push(c);});
    return Object.keys(ba).map(function(k){return{label:k,items:ba[k]};});
  }
  if (level === 'Feature') {
    var bp={}; items.forEach(function(f){var k=f.pi||'backlog';if(!bp[k])bp[k]=[];bp[k].push(f);});
    var po=['pi26','pi27','pi28','pi29','backlog'],pn={pi26:'PI 26',pi27:'PI 27',pi28:'PI 28',pi29:'PI 29',backlog:'Backlog'};
    return po.filter(function(k){return bp[k];}).map(function(k){return{label:pn[k]||k,items:bp[k]};});
  }
  var bt={}; items.forEach(function(wi){var k=wi.team||'Unassigned';if(!bt[k])bt[k]=[];bt[k].push(wi);});
  return Object.keys(bt).map(function(k){return{label:k,items:bt[k]};});
}

// Group by an arbitrary key resolver. Buckets in insertion order.
function tlBucketBy(items, keyFn, labelFn) {
  var buckets = {}, order = [];
  items.forEach(function(it) {
    var k = keyFn(it) || '__unassigned__';
    if (!buckets[k]) { buckets[k] = []; order.push(k); }
    buckets[k].push(it);
  });
  return order.map(function(k) {
    return { label: k === '__unassigned__' ? 'Unassigned' : (labelFn ? labelFn(k) : k), items: buckets[k] };
  });
}

// Public: pick the right grouping based on user selection + level.
function tlGroup(items, level, groupBy) {
  if (!groupBy || groupBy === 'default') return tlGroupDefault(items, level);

  if (groupBy === 'goal') {
    return tlBucketBy(items, function(i) { return i.goal || null; }, function(g) { return EAP.goalName(g) || g; });
  }
  if (groupBy === 'product') {
    return tlBucketBy(items, function(i) { return EAP.resolveProduct(i, level); });
  }
  if (groupBy === 'owner') {
    return tlBucketBy(items, function(i) { return i.owner || null; }, function(o) {
      return (EAP.people && EAP.people[o] && EAP.people[o].name) || o;
    });
  }
  if (groupBy === 'state') {
    return tlBucketBy(items, function(i) { return i.state || null; });
  }
  if (groupBy === 'size') {
    var groups = tlBucketBy(items, function(i) { return EAP.sizeBucketOf(i, level); });
    // Preferred size order: XL → L → M → S → XS, then 'Unassigned'
    var order = ['XL','L','M','S','XS','Unassigned'];
    return groups.sort(function(a, b) {
      var ai = order.indexOf(a.label), bi = order.indexOf(b.label);
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
    });
  }
  if (groupBy === 'risk') {
    var rgroups = tlBucketBy(items, function(i) { return EAP.riskBucketOf(i); });
    // Risk urgency descending
    var rOrder = ['Blocked','At Risk','Stale','Healthy'];
    return rgroups.sort(function(a, b) {
      return rOrder.indexOf(a.label) - rOrder.indexOf(b.label);
    });
  }
  if (groupBy === 'art') {
    return tlBucketBy(items, function(i) { return EAP.resolveART(i, level); });
  }
  if (groupBy === 'st') {
    return tlBucketBy(items, function(i) { return EAP.resolveST(i, level); });
  }
  return tlGroupDefault(items, level);
}

// ── Bar colour — vibrant solid-fill palette.
//    State-pill text colours read dull as solid bars on white. These are
//    500/600-level hues — same hue family as the pills (semantic mapping
//    preserved) but with the saturation tuned for a solid-fill medium.
function tlCol(st) {
  var m = {
    'Funnel':         '#0ea5e9',                  // sky-500
    'Planned':        '#6366f1',                  // indigo-500
    'Draft':          '#64748b',                  // slate-500
    'Backlog':        '#f59e0b',                  // amber-500
    'To Do':          '#475569',                  // slate-600 (darker than Draft)
    'Review':         '#f43f5e',                  // rose-500
    'Analysis':       '#8b5cf6',                  // violet-500
    'In Review':      '#d946ef',                  // fuchsia-500
    'Testing':        '#14b8a6',                  // teal-500
    'Implementation': '#f97316',                  // orange-500
    'In Progress':    '#3b82f6',                  // blue-500
    'At Risk':        '#ef4444',                  // red-500 (warning)
    'Blocked':        '#dc2626',                  // red-600
    'Done':           '#22c55e',                  // green-500 (fresh)
    'Complete':       '#22c55e',
    'On Track':       '#10b981'                   // emerald-500
  };
  return m[st] || '#94a3b8';                      // slate-400 fallback
}

// ═══════════════════════════════════════════════════════
// HEADER BANDS (Calendar → PI → Sprint)
// ═══════════════════════════════════════════════════════

function tlCalBand(range, td) {
  var h = '<div class="tl-band tl-band-cal">';
  var d = new Date(range.start); d.setDate(1);
  if (d < range.start) d.setMonth(d.getMonth() + 1);
  while (d < range.end) {
    var left = tlPct(range, td, d);
    var nx = new Date(d); nx.setMonth(nx.getMonth() + 1);
    var right = tlPct(range, td, nx > range.end ? range.end : nx);
    h += '<span class="tl-cal-month" style="left:'+left+'%;width:'+(right-left)+'%;">'+MN[d.getMonth()]+' '+d.getFullYear()+'</span>';
    d.setMonth(d.getMonth() + 1);
  }
  // Week ticks
  var w = new Date(range.start); w.setDate(w.getDate() - w.getDay() + 1);
  if (w < range.start) w.setDate(w.getDate() + 7);
  while (w < range.end) {
    h += '<span class="tl-cal-wk" style="left:'+tlPct(range,td,w)+'%;">'+w.getDate()+'</span>';
    w.setDate(w.getDate() + 7);
  }
  return h + '</div>';
}

function tlPiBand(range, td) {
  var h = '<div class="tl-band tl-band-pi">';
  Object.keys(EAP.piDates).forEach(function(pid) {
    var pi = EAP.piDates[pid]; if (!pi) return;
    var ps = tlP(pi.start), pe = tlP(pi.end);
    if (pe < range.start || ps > range.end) return;
    var left = tlPct(range,td, ps<range.start?range.start:ps);
    var right = tlPct(range,td, pe>range.end?range.end:pe);
    var cls = 'tl-pi-seg' + (pi.active ? ' current' : '');
    h += '<span class="'+cls+'" style="left:'+left+'%;width:'+(right-left)+'%;">'+pi.name+(pi.active?' (Current)':'')+'</span>';
  });
  return h + '</div>';
}

function tlSpBand(range, td) {
  var h = '<div class="tl-band tl-band-sp">';
  Object.keys(EAP.sprintDates).forEach(function(sid) {
    var sp = EAP.sprintDates[sid]; if (!sp) return;
    var ss = tlP(sp.start), se = tlP(sp.end);
    if (se < range.start || ss > range.end) return;
    var left = tlPct(range,td,ss<range.start?range.start:ss);
    var right = tlPct(range,td,se>range.end?range.end:se);
    var cls = 'tl-sp-seg' + (sp.active ? ' current' : '');
    h += '<span class="'+cls+'" style="left:'+left+'%;width:'+(right-left)+'%;">'+sp.name+'</span>';
  });
  return h + '</div>';
}

// ── Milestones — filtered by level, stacked to avoid overlap ──
function tlMs(range, td, level) {
  var isStrategic = (level === 'Epic' || level === 'Capability');
  var MN2 = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Filter milestones
  var visible = (EAP.milestones || []).filter(function(m) {
    if (isStrategic && m.level !== 'strategic') return false;
    var md = tlP(m.date);
    return md >= range.start && md <= range.end;
  });

  // Sort by date, then assign stagger rows when milestones are close
  visible.sort(function(a, b) { return tlP(a.date) - tlP(b.date); });
  var PROXIMITY = 8; // % threshold — accounts for icon + short label width
  var rows = []; // track last-used left% per stagger row
  visible.forEach(function(m) {
    m._left = tlPct(range, td, tlP(m.date));
    // Find a row where this milestone doesn't overlap
    var placed = false;
    for (var r = 0; r < rows.length; r++) {
      if (m._left - rows[r] > PROXIMITY) {
        m._row = r; rows[r] = m._left; placed = true; break;
      }
    }
    if (!placed) { m._row = rows.length; rows.push(m._left); }
  });

  var rowCount = rows.length || 1;
  var rowH = 20;
  var totalH = rowCount * rowH;

  var h = '<div class="tl-ms-row" style="height:' + totalH + 'px;">';
  visible.forEach(function(m) {
    var md = tlP(m.date);
    var dateStr = MN2[md.getMonth()] + ' ' + md.getDate() + ', ' + md.getFullYear();
    var top = m._row * rowH + (rowH / 2);
    var iconHtml = m.icon ? EAP.icon(m.icon, 11) : '<span class="tl-ms-dot"></span>';
    // Short label: "PI 26 Release" → "PI 26 Rel.", "System Demo 1" → "Demo 1"
    var shortLabel = m.label.replace('System Demo', 'Demo').replace('Release', 'Rel.').replace('Planning', 'Plan.');
    h += '<span class="tl-ms tl-ms-' + m.type + '" style="left:' + m._left + '%;top:' + top + 'px;" data-ms-tip="' + m.label + ' — ' + dateStr + '">' +
      '<span class="tl-ms-icon">' + iconHtml + '</span><span class="tl-ms-lbl">' + shortLabel + '</span></span>';
  });
  return { html: h + '</div>', height: totalH };
}

// ── Grid lines ────────────────────────────────────────
function tlGrid(range, td, showSp) {
  var h = '';
  Object.keys(EAP.piDates).forEach(function(pid) {
    var pi = EAP.piDates[pid]; if (!pi) return;
    var ps = tlP(pi.start);
    if (ps <= range.start || ps >= range.end) return;
    h += '<div class="tl-gl tl-gl-pi" style="left:'+tlPct(range,td,ps)+'%;"></div>';
  });
  if (showSp) {
    Object.keys(EAP.sprintDates).forEach(function(sid) {
      var sp = EAP.sprintDates[sid]; if (!sp) return;
      var ss = tlP(sp.start);
      if (ss <= range.start || ss >= range.end) return;
      h += '<div class="tl-gl tl-gl-sp" style="left:'+tlPct(range,td,ss)+'%;"></div>';
    });
  }
  return h;
}

// ── Today ─────────────────────────────────────────────
function tlToday(range, td) {
  var today = EAP._today;
  if (today < range.start || today > range.end) return '';
  return '<div class="tl-today" style="left:'+tlPct(range,td,today)+'%;"><span class="tl-today-dot"></span><span class="tl-today-lbl">Today</span></div>';
}

// ═══════════════════════════════════════════════════════
// MAIN RENDER
// ═══════════════════════════════════════════════════════
EAP.renderTimeline = function() {
  var s = EAP.state, level = s.level;
  var range = tlRange(level), td = tlD(range.start, range.end);
  var data = tlItems(level), groups = tlGroup(data.items, level, s.tlGroupBy), dates = data.dates;
  var showSp = tlShowSp(level);
  var rowH = 36, grpH = 30, leftW = 240;

  // Filter-aware empty state — preserve header bands so the user still sees
  // they're in Timeline view; replace only the body region.
  if (!data.items.length) {
    var hh = '<div class="tl-wrap">';
    hh += '<div class="tl-hdr"><div class="tl-hdr-left" style="width:'+leftW+'px;"></div><div class="tl-hdr-right">';
    hh += tlCalBand(range, td);
    hh += tlPiBand(range, td);
    if (showSp) hh += tlSpBand(range, td);
    hh += '</div></div>';
    hh += '<div class="tl-body" style="min-height:240px;display:flex;align-items:center;justify-content:center;">' + EAP.emptyState() + '</div>';
    hh += '</div>';
    return hh;
  }

  var leftHtml = '', rightHtml = '', y = 0;
  groups.forEach(function(g) {
    leftHtml += '<div class="tl-grp-hd" style="top:'+y+'px;height:'+grpH+'px;"><span class="tl-grp-txt">'+g.label+'</span><span class="tl-grp-ct">'+g.items.length+'</span></div>';
    rightHtml += '<div class="tl-grp-bg" style="top:'+y+'px;height:'+grpH+'px;"></div>';
    y += grpH;
    g.items.forEach(function(item) {
      var dd = dates[item.id]; if (!dd) { y += rowH; return; }
      var is = tlP(dd.start), ie = tlP(dd.end);
      var left = tlPct(range,td,is), width = Math.max(0.5, tlPct(range,td,ie) - left);
      var col = tlCol(item.state), pct = item.pct || 0;
      var tc = (EAP._typeColors[(item.type||level)] || 'var(--text-tertiary)');
      leftHtml += '<div class="tl-row-lbl" data-item-row="'+item.id+'" style="top:'+y+'px;height:'+rowH+'px;"><span style="color:'+tc+';display:inline-flex;flex-shrink:0;">'+EAP.icon((item.type||level).toLowerCase(),12)+'</span><span class="tl-row-nm" title="'+item.name+'">'+item.name+'</span>'+(item.owner?EAP.avatar(item.owner,18):'')+'</div>';
      rightHtml += '<div class="tl-row-bg" style="top:'+y+'px;height:'+rowH+'px;"></div>';
      // Bar is solid full-colour (white text readable). Progress shown as
      // a lighter strip on top of the filled portion.
      // Build a richer hover tooltip (data-tip — instant, styled — replaces native title)
      var tipParts = [item.name, item.state];
      if (pct) tipParts.push(pct + '% complete');
      if (item.owner) tipParts.push('Owner · ' + ((EAP.people && EAP.people[item.owner] && EAP.people[item.owner].name) || item.owner));
      if (item.team) tipParts.push('Team · ' + item.team);
      var tipText = tipParts.join('\n');
      rightHtml += '<div class="tl-bar" id="tl-bar-'+item.id+'" style="top:'+(y+9)+'px;left:'+left+'%;width:'+width+'%;height:'+(rowH-18)+'px;background:'+col+';" data-tip="'+tipText.replace(/"/g, '&quot;')+'">';
      if (pct > 0 && pct < 100) {
        rightHtml += '<div class="tl-bar-fill" style="width:'+pct+'%;background:rgba(255,255,255,0.28);"></div>';
      }
      rightHtml += '<span class="tl-bar-lbl">'+item.name+'</span></div>';
      y += rowH;
    });
  });

  var totalH = y;
  var h = '<div class="tl-wrap">';

  // Header: Calendar → PI → Sprint
  h += '<div class="tl-hdr"><div class="tl-hdr-left" style="width:'+leftW+'px;"></div><div class="tl-hdr-right">';
  h += tlCalBand(range, td);
  h += tlPiBand(range, td);
  if (showSp) h += tlSpBand(range, td);
  h += '</div></div>';

  // Milestones (stacked to avoid overlap)
  var ms = tlMs(range, td, level);
  // Inline SVG (bypasses EAP.icon for guaranteed render) — filled flag in primary colour.
  var flagSvg = '<svg width="14" height="14" viewBox="0 0 24 24" style="display:inline-block;vertical-align:middle;flex-shrink:0;color:var(--color-primary);"><path fill="currentColor" d="M5 3v18h2v-7h11.6L16 9.5 18.6 5H7V3z"/></svg>';
  h += '<div class="tl-ms-area" style="height:' + Math.max(28, ms.height + 8) + 'px;"><div class="tl-ms-left" style="width:'+leftW+'px;"><span class="tl-ms-title">' + flagSvg + ' Milestones</span></div><div class="tl-ms-right">' + ms.html + '</div></div>';

  // Body
  h += '<div class="tl-body"><div class="tl-body-left" style="width:'+leftW+'px;height:'+totalH+'px;">'+leftHtml+'</div>';
  h += '<div class="tl-body-rscroll"><div class="tl-body-right" style="height:'+totalH+'px;">'+tlGrid(range,td,showSp)+tlToday(range,td)+rightHtml+'</div></div></div>';

  // Scroll-to-today + legend
  h += '<div class="tl-fab-wrap">';
  h += '<button class="tl-fab" id="tl-legend-btn" title="Colour legend" aria-label="Colour legend">' + EAP.icon('info', 14) + '</button>';
  h += '<button class="tl-fab" id="tl-scroll-today" title="Scroll to today">' + EAP.icon('calendar', 12) + ' Today</button>';
  h += '</div>';

  // Legend popover (hidden by default)
  h += '<div class="tl-legend" id="tl-legend" hidden>' +
    '<div class="tl-legend-title">Bar colour = work item state</div>' +
    '<ul class="tl-legend-list">' +
    '<li><span class="tl-legend-sw" style="background:#3b82f6;"></span>In Progress</li>' +
    '<li><span class="tl-legend-sw" style="background:#22c55e;"></span>Done</li>' +
    '<li><span class="tl-legend-sw" style="background:#dc2626;"></span>Blocked</li>' +
    '<li><span class="tl-legend-sw" style="background:#d946ef;"></span>In Review</li>' +
    '<li><span class="tl-legend-sw" style="background:#8b5cf6;"></span>Analysis</li>' +
    '<li><span class="tl-legend-sw" style="background:#f59e0b;"></span>Backlog</li>' +
    '<li><span class="tl-legend-sw" style="background:#0ea5e9;"></span>Funnel</li>' +
    '<li><span class="tl-legend-sw" style="background:#6366f1;"></span>Planned</li>' +
    '</ul>' +
    '<div class="tl-legend-note">White strip on a bar = completion progress</div>' +
    '</div>';

  h += '</div>';
  return h;
};

// ── Dependency lines (SVG overlay on timeline body) ───
EAP.tlDrawDeps = function() {
  var s = EAP.state;
  if (!s.showDeps) return;
  var deps = (s.level === 'Feature') ? (EAP.featureDeps || []) :
             (s.level === 'WorkItem') ? (EAP.wiDeps || []) : [];
  if (!deps.length) return;
  // Apply type filter
  var filter = s.depFilter || 'all';
  if (filter !== 'all') deps = deps.filter(function(d) { return d.type === filter; });
  if (!deps.length) return;

  var container = document.querySelector('.tl-body-right');
  if (!container) return;

  // Remove old SVG
  var old = container.querySelector('.tl-dep-svg');
  if (old) old.remove();

  var cRect = container.getBoundingClientRect();
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'tl-dep-svg');
  // Allow pointer events on child elements but not the SVG background
  svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:4;overflow:visible;';

  // SVG fill/stroke can't read CSS custom properties — must be literal hex.
  // Values mirror --color-error / --color-warning / --color-success defined
  // in app.css :root override (deeper red, true amber, fresh green).
  var colors = { conflict:'var(--color-error)', risk:'var(--color-warning)', satisfied:'var(--color-success)' };
  var hex =    { conflict:'#b91c1c',             risk:'#d97706',              satisfied:'#16a34a' };

  // Arrowhead markers (one per type)
  var defs = document.createElementNS(SVG_NS, 'defs');
  ['conflict','risk','satisfied'].forEach(function(t) {
    var marker = document.createElementNS(SVG_NS, 'marker');
    marker.setAttribute('id', 'tl-arrow-' + t);
    marker.setAttribute('viewBox', '0 0 10 7');
    marker.setAttribute('refX', '10'); marker.setAttribute('refY', '3.5');
    marker.setAttribute('markerWidth', '7'); marker.setAttribute('markerHeight', '5');
    marker.setAttribute('orient', 'auto');
    var poly = document.createElementNS(SVG_NS, 'polygon');
    poly.setAttribute('points', '0 0, 10 3.5, 0 7');
    poly.setAttribute('fill', hex[t]);
    marker.appendChild(poly);
    defs.appendChild(marker);
  });
  svg.appendChild(defs);

  deps.forEach(function(dep, idx) {
    // Convention: from = prerequisite, to = dependent. Arrow draws from → to.
    var fromBar = document.getElementById('tl-bar-' + dep.from);
    var toBar   = document.getElementById('tl-bar-' + dep.to);
    if (!fromBar || !toBar) return;

    var fR = fromBar.getBoundingClientRect();
    var tR = toBar.getBoundingClientRect();

    // Source: right edge of prerequisite. Target: left edge of dependent.
    var x1 = fR.right - cRect.left;
    var y1 = fR.top + fR.height / 2 - cRect.top;
    var x2 = tR.left  - cRect.left;
    var y2 = tR.top   + tR.height / 2 - cRect.top;

    var col = hex[dep.type] || hex.satisfied;

    // Group all shapes for this dep so focus mode can dim non-matching deps
    var depG = document.createElementNS(SVG_NS, 'g');
    depG.setAttribute('class', 'tl-dep-g');
    depG.setAttribute('data-dep-idx', idx);

    // Bezier curve: horizontal out from source, horizontal into target
    var dx = Math.max(20, Math.abs(x2 - x1) * 0.35);
    var path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', 'M' + x1 + ',' + y1 + ' C' + (x1 + dx) + ',' + y1 + ' ' + (x2 - dx) + ',' + y2 + ' ' + x2 + ',' + y2);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', col);
    path.setAttribute('stroke-width', dep.type === 'conflict' ? '2' : '1.5');
    path.setAttribute('stroke-dasharray', dep.type === 'risk' ? '5,3' : 'none');
    path.setAttribute('marker-end', 'url(#tl-arrow-' + dep.type + ')');
    path.setAttribute('opacity', '0.85');
    depG.appendChild(path);

    // Source dot (at prerequisite edge)
    var dot = document.createElementNS(SVG_NS, 'circle');
    dot.setAttribute('cx', x1); dot.setAttribute('cy', y1); dot.setAttribute('r', '3');
    dot.setAttribute('fill', col);
    depG.appendChild(dot);

    // Midpoint icon — clickable
    var midX = (x1 + x2) / 2;
    var midY = (y1 + y2) / 2;
    var iconBg = document.createElementNS(SVG_NS, 'circle');
    iconBg.setAttribute('cx', midX); iconBg.setAttribute('cy', midY); iconBg.setAttribute('r', '9');
    iconBg.setAttribute('fill', '#fff');
    iconBg.setAttribute('stroke', col);
    iconBg.setAttribute('stroke-width', '1.5');
    iconBg.setAttribute('class', 'tl-dep-icon-bg');
    iconBg.setAttribute('data-dep-idx', idx);
    iconBg.setAttribute('data-dep-src', 'feature');
    iconBg.style.cursor = 'pointer';
    iconBg.style.pointerEvents = 'all';
    depG.appendChild(iconBg);

    // Icon glyph (simple geometry, scales with SVG)
    var glyph = document.createElementNS(SVG_NS, 'g');
    glyph.style.pointerEvents = 'none';
    glyph.setAttribute('transform', 'translate(' + (midX - 5) + ',' + (midY - 5) + ')');
    glyph.setAttribute('stroke', col);
    glyph.setAttribute('stroke-width', '1.5');
    glyph.setAttribute('stroke-linecap', 'round');
    glyph.setAttribute('stroke-linejoin', 'round');
    glyph.setAttribute('fill', 'none');
    if (dep.type === 'conflict') {
      // alert-triangle
      glyph.innerHTML = '<path d="M5 0.5 L9.5 9 L0.5 9 Z"/><line x1="5" y1="4" x2="5" y2="6.5"/><circle cx="5" cy="8" r="0.3" fill="' + col + '" stroke="none"/>';
    } else if (dep.type === 'risk') {
      // clock
      glyph.innerHTML = '<circle cx="5" cy="5" r="4"/><polyline points="5 2.5 5 5 6.8 6"/>';
    } else {
      // check
      glyph.innerHTML = '<polyline points="1.5 5.5 4 8 8.5 2.5"/>';
    }
    depG.appendChild(glyph);

    svg.appendChild(depG);
  });

  container.appendChild(svg);

  // Wire click-to-popover on midpoint icons + focus the chain
  svg.querySelectorAll('.tl-dep-icon-bg').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      var idx = parseInt(el.getAttribute('data-dep-idx'), 10);
      var dep = deps[idx];
      if (!dep) return;
      EAP.tlFocusChain([dep.from, dep.to], idx);
      EAP.showDepPopover(e.clientX, e.clientY, dep);
    });
  });
};

// ── Focus mode: dim all items except those in the chain ─────
EAP.tlFocusChain = function(ids, activeDepIdx) {
  var wrap = document.querySelector('.tl-wrap');
  if (!wrap) return;
  wrap.classList.add('tl-has-focus');
  var idSet = {}; ids.forEach(function(id) { idSet[id] = true; });
  document.querySelectorAll('.tl-bar').forEach(function(el) {
    var id = el.id.replace('tl-bar-', '');
    el.classList.toggle('tl-dimmed', !idSet[id]);
  });
  document.querySelectorAll('[data-item-row]').forEach(function(el) {
    var id = el.getAttribute('data-item-row');
    el.classList.toggle('tl-dimmed', !idSet[id]);
  });
  // Dim other dep groups (paths, dots, midpoint icons)
  document.querySelectorAll('.tl-dep-g').forEach(function(g) {
    var idx = parseInt(g.getAttribute('data-dep-idx'), 10);
    g.classList.toggle('tl-dimmed', idx !== activeDepIdx);
  });
};

EAP.tlClearFocus = function() {
  var wrap = document.querySelector('.tl-wrap');
  if (!wrap) return;
  wrap.classList.remove('tl-has-focus');
  document.querySelectorAll('.tl-dimmed').forEach(function(el) { el.classList.remove('tl-dimmed'); });
};

// ── Dependency popover (shared across Timeline & Board) ─────
EAP.showDepPopover = function(x, y, dep) {
  var existing = document.getElementById('dep-popover');
  if (existing) existing.remove();

  var TYPE = {
    conflict:  { label:'Conflict',  icon:'alert-triangle', verb:'blocks',       action:'Escalate',       actionId:'escalate' },
    risk:      { label:'Risk',      icon:'clock',           verb:'feeds into',   action:'Monitor',        actionId:'monitor' },
    satisfied: { label:'Satisfied', icon:'check-square',   verb:'feeds into',   action:'Mark resolved',  actionId:'resolve' }
  };
  var t = TYPE[dep.type] || TYPE.satisfied;

  // Look up full item record
  function findItem(id) {
    var all = [].concat(EAP.allFeatures || [], EAP.epics.all || [], EAP.capabilities.all || []);
    EAP.workItems.sprints.forEach(function(sp) { all = all.concat(sp.items || []); });
    var bl = (EAP.workItems.backlog) || {};
    ['Story','Defect','CaseTask'].forEach(function(k) { all = all.concat(bl[k] || []); });
    return all.filter(function(i) { return i.id === id; })[0];
  }
  function ownerLabel(item) {
    if (!item) return '';
    var ownerKey = item.owner;
    if (!ownerKey) return '';
    var p = EAP.people && EAP.people[ownerKey];
    return p ? p.name : ownerKey;
  }
  function whenLabel(item) {
    if (!item) return '';
    if (item.pi) return 'PI ' + item.pi.replace('pi','');
    return '';
  }
  // Reuse the canonical bar-colour map from tlCol so this stays aligned
  // with the state-pill palette across all views.
  function stateColor(state) { return tlCol(state); }

  var from = findItem(dep.from);
  var to = findItem(dep.to);

  function itemCard(label, item, isBlocker) {
    if (!item) return '';
    var meta = [];
    if (item.state) meta.push(item.state);
    if (ownerLabel(item)) meta.push(ownerLabel(item));
    if (whenLabel(item)) meta.push(whenLabel(item));
    return '<div class="dep-pop-item' + (isBlocker ? ' is-blocker' : '') + '" data-dep-item="' + item.id + '">' +
      '<div class="dep-pop-item-label">' + label + '</div>' +
      '<div class="dep-pop-item-name">' +
        '<span class="dep-pop-dot" style="background:' + stateColor(item.state) + ';"></span>' +
        item.name +
      '</div>' +
      '<div class="dep-pop-item-meta">' + meta.join(' · ') + '</div>' +
      '</div>';
  }

  var pop = document.createElement('div');
  pop.id = 'dep-popover';
  pop.className = 'dep-popover dep-popover-' + dep.type;
  pop.innerHTML =
    '<div class="dep-pop-bar"></div>' +
    '<div class="dep-pop-hd">' + EAP.icon(t.icon, 14) + '<span>' + t.label + '</span></div>' +
    '<div class="dep-pop-body">' +
      itemCard('Prerequisite', from, dep.type === 'conflict') +
      '<div class="dep-pop-verb">' + EAP.icon('chevron-down', 12) + ' ' + t.verb + '</div>' +
      itemCard('Dependent', to, false) +
    '</div>' +
    '<div class="dep-pop-reason"><span class="dep-pop-reason-label">Reason</span><p class="dep-pop-reason-text">' + dep.reason + '</p></div>' +
    '<div class="dep-pop-actions">' +
      '<button class="dep-pop-btn dep-pop-btn-secondary" data-dep-view="' + dep.from + '">View prerequisite</button>' +
      '<button class="dep-pop-btn dep-pop-btn-primary" data-dep-act="' + t.actionId + '" data-dep-from="' + dep.from + '">' + t.action + '</button>' +
    '</div>';

  document.body.appendChild(pop);
  var w = pop.offsetWidth, h = pop.offsetHeight;
  var vw = window.innerWidth, vh = window.innerHeight;
  var left = Math.min(Math.max(8, x - w / 2), vw - w - 8);
  var top = y - h - 14;
  if (top < 8) top = Math.min(y + 16, vh - h - 8);
  pop.style.left = left + 'px';
  pop.style.top = top + 'px';

  // Wire item cards to open detail panel
  pop.querySelectorAll('[data-dep-item]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      var id = el.getAttribute('data-dep-item');
      pop.remove();
      if (EAP.openDetail) EAP.openDetail(id);
    });
  });
  pop.querySelectorAll('[data-dep-view]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      var id = el.getAttribute('data-dep-view');
      pop.remove();
      if (EAP.openDetail) EAP.openDetail(id);
    });
  });
  pop.querySelectorAll('[data-dep-act]').forEach(function(el) {
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      var act = el.getAttribute('data-dep-act');
      var fromId = el.getAttribute('data-dep-from');
      pop.remove();
      var item = findItem(fromId);
      var msg = act === 'escalate' ? 'Escalation initiated for ' + (item ? item.name : 'item') :
                act === 'monitor' ? 'Added ' + (item ? item.name : 'item') + ' to watch list' :
                'Dependency marked as resolved';
      if (EAP.showToast) EAP.showToast(msg, act === 'resolve' ? 'success' : 'info');
    });
  });

  // Click outside to close
  setTimeout(function() {
    document.addEventListener('click', function close(e) {
      if (!pop.contains(e.target)) { pop.remove(); document.removeEventListener('click', close); }
    });
  }, 0);
};
