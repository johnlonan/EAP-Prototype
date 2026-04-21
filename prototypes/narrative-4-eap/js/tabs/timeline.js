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
  return { items: items, dates: dl };
}

// ── Group items ───────────────────────────────────────
function tlGroup(items, level) {
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

// ── Bar colour — using design tokens ─────────────────
function tlCol(st) {
  var m = { Done:'var(--dv-success)', Complete:'var(--dv-success)',
    'In Progress':'var(--dv-info)', Implementation:'var(--dv-info)',
    Blocked:'var(--dv-error)',
    'In Review':'#8b5cf6', Analysis:'#8b5cf6', Review:'#8b5cf6',
    Funnel:'var(--text-disabled)', Backlog:'var(--dv-warning)',
    Draft:'var(--text-disabled)', Planned:'var(--text-disabled)' };
  return m[st] || 'var(--text-disabled)';
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
  var data = tlItems(level), groups = tlGroup(data.items, level), dates = data.dates;
  var showSp = tlShowSp(level);
  var rowH = 36, grpH = 30, leftW = 240;

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
      leftHtml += '<div class="tl-row-lbl" style="top:'+y+'px;height:'+rowH+'px;"><span style="color:'+tc+';display:inline-flex;flex-shrink:0;">'+EAP.icon((item.type||level).toLowerCase(),12)+'</span><span class="tl-row-nm" title="'+item.name+'">'+item.name+'</span>'+(item.owner?EAP.avatar(item.owner,18):'')+'</div>';
      rightHtml += '<div class="tl-row-bg" style="top:'+y+'px;height:'+rowH+'px;"></div>';
      rightHtml += '<div class="tl-bar" id="tl-bar-'+item.id+'" style="top:'+(y+9)+'px;left:'+left+'%;width:'+width+'%;height:'+(rowH-18)+'px;border:1px solid '+col+';" title="'+item.name+' — '+item.state+(pct?' ('+pct+'%)':'')+'">';
      if (pct > 0 && pct < 100) {
        rightHtml += '<div class="tl-bar-track" style="background:'+col+';opacity:0.18;"></div>';
        rightHtml += '<div class="tl-bar-fill" style="width:'+pct+'%;background:'+col+';"></div>';
      } else if (pct >= 100) {
        rightHtml += '<div class="tl-bar-fill" style="width:100%;background:'+col+';"></div>';
      } else {
        rightHtml += '<div class="tl-bar-fill" style="width:100%;background:'+col+';opacity:0.18;"></div>';
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
  h += '<div class="tl-ms-area" style="height:' + Math.max(28, ms.height + 8) + 'px;"><div class="tl-ms-left" style="width:'+leftW+'px;"><span class="tl-ms-title">Milestones</span></div><div class="tl-ms-right">' + ms.html + '</div></div>';

  // Body
  h += '<div class="tl-body"><div class="tl-body-left" style="width:'+leftW+'px;height:'+totalH+'px;">'+leftHtml+'</div>';
  h += '<div class="tl-body-rscroll"><div class="tl-body-right" style="height:'+totalH+'px;">'+tlGrid(range,td,showSp)+tlToday(range,td)+rightHtml+'</div></div></div>';

  // Scroll-to-today button
  h += '<button class="tl-scroll-today" id="tl-scroll-today" title="Scroll to today">' + EAP.icon('calendar', 12) + ' Today</button>';

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
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'tl-dep-svg');
  svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:4;';

  // Arrowhead markers
  var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  ['ok','risk','conflict'].forEach(function(t) {
    var cols = { ok: 'var(--color-success)', risk: 'var(--color-warning)', conflict: 'var(--color-error)' };
    var marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'tl-arrow-' + t);
    marker.setAttribute('viewBox', '0 0 10 7');
    marker.setAttribute('refX', '10'); marker.setAttribute('refY', '3.5');
    marker.setAttribute('markerWidth', '8'); marker.setAttribute('markerHeight', '6');
    marker.setAttribute('orient', 'auto-start-reverse');
    var poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', '0 0, 10 3.5, 0 7');
    poly.setAttribute('fill', cols[t]);
    marker.appendChild(poly);
    defs.appendChild(marker);
  });
  svg.appendChild(defs);

  deps.forEach(function(dep) {
    var fromBar = document.getElementById('tl-bar-' + dep.from);
    var toBar = document.getElementById('tl-bar-' + dep.to);
    if (!fromBar || !toBar) return;

    var fR = fromBar.getBoundingClientRect();
    var tR = toBar.getBoundingClientRect();

    // Source: right edge center. Target: left edge center.
    var x1 = fR.right - cRect.left;
    var y1 = fR.top + fR.height / 2 - cRect.top;
    var x2 = tR.left - cRect.left;
    var y2 = tR.top + tR.height / 2 - cRect.top;

    var cols = { ok: 'var(--color-success)', risk: 'var(--color-warning)', conflict: 'var(--color-error)' };
    var col = cols[dep.type] || cols.ok;

    // Draw curved path
    var midX = (x1 + x2) / 2;
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M' + x1 + ',' + y1 + ' C' + midX + ',' + y1 + ' ' + midX + ',' + y2 + ' ' + x2 + ',' + y2);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', col);
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('stroke-dasharray', dep.type === 'risk' ? '4,3' : 'none');
    path.setAttribute('marker-end', 'url(#tl-arrow-' + dep.type + ')');
    path.setAttribute('opacity', '0.7');
    svg.appendChild(path);

    // Source dot
    var dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', x1); dot.setAttribute('cy', y1); dot.setAttribute('r', '3');
    dot.setAttribute('fill', col); dot.setAttribute('opacity', '0.7');
    svg.appendChild(dot);
  });

  container.appendChild(svg);
};
