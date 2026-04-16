/* ═══════════════════════════════════════════════════════
   HELPERS.JS — Shared HTML builders used across tabs
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

// Drag grip SVG
EAP._G = '<span class="dg"><svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor"><circle cx="2" cy="2" r="1.2"/><circle cx="6" cy="2" r="1.2"/><circle cx="2" cy="6" r="1.2"/><circle cx="6" cy="6" r="1.2"/><circle cx="2" cy="10" r="1.2"/><circle cx="6" cy="10" r="1.2"/></svg></span>';
EAP._GT = '<td style="width:20px;padding:8px 4px">' + EAP._G + '</td>';
EAP._ADD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
EAP._TH0 = '<th style="width:20px;padding:8px 4px"></th>';

// State pill
EAP.pill = function(st) { return '<span class="st-pill ' + EAP.stateClass(st) + '">' + st + '</span>'; };

// Progress bar
EAP.pbar = function(p, st) {
  if (p === undefined || p === null) return '';
  return '<div class="pb"><div class="pb-t"><div class="pb-f ' + EAP.progressBarClass(st) + '" style="width:' + Math.min(p, 100) + '%"></div></div><span class="pb-l">' + p + '%</span></div>';
};

// Subtle pill (for board cards)
EAP.subtlePill = function(st) {
  var m = {
    Funnel: 'rgba(0,0,0,0.04);color:var(--text-tertiary)',
    Backlog: 'rgba(0,0,0,0.04);color:var(--text-tertiary)',
    Implementation: 'rgba(154,52,18,0.08);color:#9a3412',
    Blocked: 'rgba(140,29,29,0.08);color:#8c1d1d',
    'In Progress': 'rgba(30,64,175,0.08);color:#1e40af',
    Done: 'rgba(22,101,52,0.08);color:#166534',
    Analysis: 'rgba(109,40,217,0.08);color:#6d28d9',
    Draft: 'rgba(0,0,0,0.04);color:var(--text-tertiary)',
    Planned: 'rgba(0,0,0,0.04);color:var(--text-tertiary)',
    'To Do': 'rgba(0,0,0,0.04);color:var(--text-tertiary)',
    'In Review': 'rgba(109,40,217,0.08);color:#6d28d9'
  };
  return '<span style="display:inline-flex;font-size:9px;font-weight:400;padding:2px 6px;border-radius:9999px;white-space:nowrap;background:' + (m[st] || m.Funnel) + '">' + st + '</span>';
};

// Backlog column definitions (shared between Backlog tab and List split panel)
EAP.bkCols = function() {
  var s = EAP.state;
  if (s.level === 'Epic') return {
    h: EAP._TH0 + '<th>Name</th><th>Type</th><th>State</th><th>Size</th><th>WSJF</th><th>ART</th>',
    r: function(i) { return EAP._GT + '<td><span class="item-nm">' + i.name + '</span></td><td><span class="tm">' + (i.type || 'Epic') + '</span></td><td>' + EAP.pill(i.state) + '</td><td><span class="sz">' + i.size + '</span></td><td><span class="wsjf">' + i.wsjf + '</span></td><td><span class="par">' + (i.art || '—') + '</span></td>'; }
  };
  if (s.level === 'Capability') return {
    h: EAP._TH0 + '<th>Name</th><th>Type</th><th>State</th><th>Size</th><th>WSJF</th><th>Parent</th><th>ART</th>',
    r: function(i) { return EAP._GT + '<td><span class="item-nm">' + i.name + '</span></td><td><span class="tm">' + (i.type || 'Capability') + '</span></td><td>' + EAP.pill(i.state) + '</td><td><span class="sz">' + i.size + '</span></td><td><span class="wsjf">' + i.wsjf + '</span></td><td><span class="par">' + (i.parent || '—') + '</span></td><td><span class="par">' + (i.art || '—') + '</span></td>'; }
  };
  return {
    h: EAP._TH0 + '<th>Name</th><th>Type</th><th>State</th><th>Size</th><th>WSJF</th><th>Parent</th><th>Team</th>',
    r: function(i) { return EAP._GT + '<td><span class="item-nm">' + i.name + '</span></td><td><span class="tm">' + (i.type || 'Feature') + '</span></td><td>' + EAP.pill(i.state) + '</td><td><span class="sz">' + i.size + '</span></td><td><span class="wsjf">' + i.wsjf + '</span></td><td><span class="par">' + (i.parent || '—') + '</span></td><td><span class="tm">' + (i.team || '—') + '</span></td>'; }
  };
};

// List view column definitions (for items inside PI/Sprint accordions)
EAP.lsCols = function() {
  var s = EAP.state;
  if (s.level === 'Epic') return {
    h: EAP._TH0 + '<th>Name</th><th>State</th><th>% Complete</th><th>Size</th><th>WSJF</th><th>ART</th>',
    r: function(i) { return EAP._GT + '<td><span class="item-nm">' + i.name + '</span></td><td>' + EAP.pill(i.state) + '</td><td>' + EAP.pbar(i.pct, i.state) + '</td><td><span class="sz">' + i.size + '</span></td><td><span class="wsjf">' + i.wsjf + '</span></td><td><span class="tm">' + (i.art || '') + '</span></td>'; }
  };
  if (s.level === 'Capability') return {
    h: EAP._TH0 + '<th>Name</th><th>State</th><th>% Complete</th><th>Size</th><th>WSJF</th><th>Parent</th>',
    r: function(i) { return EAP._GT + '<td><span class="item-nm">' + i.name + '</span></td><td>' + EAP.pill(i.state) + '</td><td>' + EAP.pbar(i.pct, i.state) + '</td><td><span class="sz">' + i.size + '</span></td><td><span class="wsjf">' + i.wsjf + '</span></td><td><span class="par">' + (i.parent || '') + '</span></td>'; }
  };
  if (s.level === 'WorkItem') return {
    h: EAP._TH0 + '<th>Name</th><th>State</th><th>% Complete</th><th>Pts</th><th>Owner</th><th>Team</th>',
    r: function(i) { return EAP._GT + '<td><span class="item-nm">' + i.name + '</span></td><td>' + EAP.pill(i.state) + '</td><td>' + EAP.pbar(i.pct, i.state) + '</td><td><span class="sz">' + (i.pts || '') + '</span></td><td><span class="par">' + (i.owner || '') + '</span></td><td><span class="tm">' + (i.team || '') + '</span></td>'; }
  };
  return {
    h: EAP._TH0 + '<th>Name</th><th>State</th><th>Progress</th><th>Size</th><th>WSJF</th><th>Parent</th><th>Team</th>',
    r: function(i) { return EAP._GT + '<td><span class="item-nm">' + i.name + '</span></td><td>' + EAP.pill(i.state) + '</td><td>' + EAP.pbar(i.pct, i.state) + '</td><td><span class="sz">' + i.size + '</span></td><td><span class="wsjf">' + i.wsjf + '</span></td><td><span class="par">' + (i.parent || '') + '</span></td><td><span class="tm">' + (i.team || '') + '</span></td>'; }
  };
};
