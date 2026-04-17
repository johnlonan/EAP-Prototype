/* ═══════════════════════════════════════════════════════
   HELPERS.JS — Shared HTML builders used across tabs
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

// Drag grip
EAP._G = '<span class="dg">' + (EAP.icon ? EAP.icon.grip(12) : '') + '</span>';
EAP._GT = '<td style="width:24px;padding:8px 4px">' + EAP._G + '</td>';
EAP._ADD = EAP.icon ? EAP.icon('plus', 12) : '';
EAP._TH0 = '<th style="width:24px;padding:8px 4px"></th>';

// Type icon colours
EAP._typeColors = { goal:'#374151', epic:'#6d28d9', capability:'#0369a1', feature:'#2563EB', story:'#8B5CF6', defect:'#DC2626',
  Goal:'#374151', Epic:'#6d28d9', Capability:'#0369a1', Feature:'#2563EB', Story:'#8B5CF6', Defect:'#DC2626', 'Case Task':'#EC4899', 'Work Item':'#8B5CF6' };

// Type cell — icon + label
EAP.typeCell = function(type) {
  if (!type) return '';
  var key = type.toLowerCase();
  // Handle "case task" icon key mapping
  var iconKey = key === 'case task' ? 'clipboard-check' : key;
  var color = EAP._typeColors[type] || '#6B7280';
  var iconHtml = EAP.icon ? EAP.icon(iconKey, 14) : '';
  return '<span class="type-cell" style="color:' + color + ';">' + iconHtml + ' ' + type + '</span>';
};

// Avatar — renders image or initials fallback
EAP.avatar = function(ownerKey, size) {
  var sz = size || 24;
  var p = EAP.people ? EAP.people[ownerKey] : null;
  if (!p) return '';
  if (p.avatar) {
    return '<img src="' + p.avatar + '" alt="' + p.initials + '" title="' + p.name + '" style="width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1.5px solid rgba(255,255,255,0.8);">';
  }
  return '<span title="' + p.name + '" style="display:inline-flex;align-items:center;justify-content:center;width:' + sz + 'px;height:' + sz + 'px;border-radius:50%;background:' + p.color + ';color:#fff;font-size:' + Math.round(sz * 0.4) + 'px;font-weight:600;flex-shrink:0;border:1.5px solid rgba(255,255,255,0.8);">' + p.initials + '</span>';
};

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
    Funnel: 'rgba(0,0,0,0.04);color:#6B7280', Backlog: 'rgba(0,0,0,0.04);color:#6B7280',
    Implementation: 'rgba(154,52,18,0.08);color:#9a3412', Blocked: 'rgba(140,29,29,0.08);color:#DC2626',
    'In Progress': 'rgba(30,64,175,0.08);color:#2563EB', Done: 'rgba(22,101,52,0.08);color:#16A34A',
    Analysis: 'rgba(109,40,217,0.08);color:#6d28d9', Draft: 'rgba(0,0,0,0.04);color:#6B7280',
    Planned: 'rgba(0,0,0,0.04);color:#6B7280', 'To Do': 'rgba(0,0,0,0.04);color:#6B7280',
    'In Review': 'rgba(109,40,217,0.08);color:#6d28d9', 'At Risk': 'rgba(217,119,6,0.08);color:#D97706'
  };
  return '<span style="display:inline-flex;font-size:9px;font-weight:400;padding:2px 6px;border-radius:9999px;white-space:nowrap;background:' + (m[st] || m.Funnel) + '">' + st + '</span>';
};

// ── Backlog column definitions ─────────────────────────
EAP.bkCols = function() {
  var s = EAP.state;
  if (s.level === 'Epic') return {
    h: EAP._TH0 + '<th>Name</th><th>Type</th><th>State</th><th>Size</th><th>WSJF</th><th>ART</th>',
    r: function(i) { return EAP._GT + '<td><span class="item-nm">' + i.name + '</span></td><td>' + EAP.typeCell(i.type || 'Epic') + '</td><td>' + EAP.pill(i.state) + '</td><td><span class="sz">' + i.size + '</span></td><td><span class="wsjf">' + i.wsjf + '</span></td><td><span class="par">' + (i.art || '—') + '</span></td>'; }
  };
  if (s.level === 'Capability') return {
    h: EAP._TH0 + '<th>Name</th><th>Type</th><th>State</th><th>Size</th><th>WSJF</th><th>Parent</th><th>ART</th>',
    r: function(i) { return EAP._GT + '<td><span class="item-nm">' + i.name + '</span></td><td>' + EAP.typeCell(i.type || 'Capability') + '</td><td>' + EAP.pill(i.state) + '</td><td><span class="sz">' + i.size + '</span></td><td><span class="wsjf">' + i.wsjf + '</span></td><td><span class="par">' + (i.parent || '—') + '</span></td><td><span class="par">' + (i.art || '—') + '</span></td>'; }
  };
  if (s.level === 'WorkItem') return {
    h: EAP._TH0 + '<th>Name</th><th>Type</th><th>State</th><th>Pts</th><th>Owner</th><th>Team</th>',
    r: function(i) { return EAP._GT + '<td><span class="item-nm">' + i.name + '</span></td><td>' + EAP.typeCell(i.type || 'Story') + '</td><td>' + EAP.pill(i.state) + '</td><td><span class="sz">' + (i.pts || '') + '</span></td><td><span class="par">' + (i.owner || '—') + '</span></td><td><span class="tm">' + (i.team || '—') + '</span></td>'; }
  };
  // Feature
  return {
    h: EAP._TH0 + '<th>Name</th><th>Type</th><th>State</th><th>Size</th><th>WSJF</th><th>Parent</th><th>Team</th>',
    r: function(i) { return EAP._GT + '<td><span class="item-nm">' + i.name + '</span></td><td>' + EAP.typeCell(i.type || 'Feature') + '</td><td>' + EAP.pill(i.state) + '</td><td><span class="sz">' + i.size + '</span></td><td><span class="wsjf">' + i.wsjf + '</span></td><td><span class="par">' + (i.parent || '—') + '</span></td><td><span class="tm">' + (i.team || '—') + '</span></td>'; }
  };
};

// ── List view column definitions ───────────────────────
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
  // Feature
  return {
    h: EAP._TH0 + '<th>Name</th><th>State</th><th>Progress</th><th>Size</th><th>WSJF</th><th>Parent</th><th>Team</th>',
    r: function(i) { return EAP._GT + '<td><span class="item-nm">' + i.name + '</span></td><td>' + EAP.pill(i.state) + '</td><td>' + EAP.pbar(i.pct, i.state) + '</td><td><span class="sz">' + i.size + '</span></td><td><span class="wsjf">' + i.wsjf + '</span></td><td><span class="par">' + (i.parent || '') + '</span></td><td><span class="tm">' + (i.team || '') + '</span></td>'; }
  };
};
