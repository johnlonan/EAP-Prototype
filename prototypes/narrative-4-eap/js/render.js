/* ═══════════════════════════════════════════════════════
   RENDER.JS — Main render orchestration v3
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

EAP.render = function() { EAP.renderChrome(); EAP.renderFilterBar(); EAP.renderContent(); EAP.renderInsights(); };

// ── Chrome ─────────────────────────────────────────────
EAP.renderChrome = function() {
  var s = EAP.state, tl = {portfolio:'Portfolio','solution-train':'Sol. Train',art:'ART',team:'Team'};
  var el = document.getElementById('chrome-bar'); if (!el) return;
  el.innerHTML = '<div class="chrome-dd-wrap"><span class="chrome-dd-label">Scope</span><div class="art-sel" id="ctx-sel-btn"><span class="art-sel-badge">' + tl[s.context] + '</span><span class="art-sel-name">' + s.contextName + '</span><span class="chev"></span></div></div>' +
    '<div class="chrome-center"><div class="tab-group">' + ['Backlog','List','Board','Hierarchy'].map(function(t){ return '<button class="tab-item' + (s.tab===t?' active':'') + '" data-tab="' + t + '">' + t + '</button>'; }).join('') + '</div></div>' +
    '<div style="flex:1;"></div>' +
    '<input type="text" class="chrome-search" placeholder="Search features, stories, teams…">';
  el.querySelectorAll('[data-tab]').forEach(function(b){ b.addEventListener('click', function(){ EAP.setTab(b.dataset.tab); }); });
};

// ── Filter Bar ─────────────────────────────────────────
EAP.renderFilterBar = function() {
  var s = EAP.state, levels = EAP.contextLevels[s.context] || [];
  var el = document.getElementById('filter-bar'); if (!el) return;
  var h = '';

  if (s.tab === 'Hierarchy') {
    // Hierarchy: PI filter + Show checkboxes on the left, no Level selector
    s.hierHide = s.hierHide || {};
    h += '<span class="fbar-label">PI</span><select class="fbar-select" id="hier-pi-sel"><option value="All">All PIs</option><option value="PI 26">PI 26 — Current</option><option value="PI 27">PI 27</option></select>' +
      '<div class="fbar-sep"></div>' +
      '<span class="fbar-label">Show</span>' +
      ['Capability','Feature','Story'].map(function(lv) {
        var checked = !s.hierHide[lv];
        return '<label style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--text-secondary);cursor:pointer;white-space:nowrap;">' +
          '<input type="checkbox" ' + (checked ? 'checked' : '') + ' data-hier-check="' + lv + '" style="accent-color:var(--color-primary);margin:0;width:13px;height:13px;">' + lv + '</label>';
      }).join('') +
      '<div class="fbar-spacer"></div>';
  } else {
    // Normal: Level selector + optional PI selector
    h += '<span class="fbar-label">Level</span><select class="fbar-select" id="level-select">' +
      levels.map(function(l){ return '<option value="'+l.value+'"'+(s.level===l.value?' selected':'')+'>'+l.label+'</option>'; }).join('') + '</select>';

    // PI selector — right after Level, before Filter (Board + WorkItem)
    if (s.tab === 'Board' && s.level === 'WorkItem') {
      h += '<div class="fbar-sep"></div><span class="fbar-label">PI</span><select class="fbar-select" id="pi-select"><option>PI 26 — Current</option><option>PI 25</option><option>PI 24</option></select>';
    }

    h += '<div class="fbar-sep"></div>' +
      '<button class="fbar-filter"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>Filter</button>' +
      '<span class="fbar-chip'+(s.mineOnly?' on':'')+'" id="mine-toggle">Mine only'+(s.mineOnly?' <span class="cx">×</span>':'')+'</span><div class="fbar-spacer"></div>';
  }

  // Right-side toggles (all tabs)
  if (s.tab === 'List') h += '<span class="fbar-vtog'+(s.splitView?' on':'')+'" id="split-toggle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>Split</span>';
  if (s.tab === 'Board' && s.level === 'WorkItem') h += '<span class="fbar-vtog'+(s.boardView==='track'?' on':'')+'" id="track-toggle">Track</span>';
  if (s.tab === 'Board' && (s.level === 'Feature' || s.level === 'WorkItem')) h += '<span class="fbar-vtog'+(s.showDeps?' on':'')+'" id="deps-toggle">Dependencies</span>';
  h += '<span class="fbar-vtog'+(s.insightsOpen?' on':'')+'" id="insights-toggle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></span>';

  el.innerHTML = h;

  // Wire events
  var ls = document.getElementById('level-select');
  if (ls) ls.addEventListener('change', function(){ EAP.setLevel(this.value); });
  var mt = document.getElementById('mine-toggle');
  if (mt) mt.addEventListener('click', function(){ EAP.toggleMineOnly(); });
  var sb = document.getElementById('split-toggle');
  if (sb) sb.addEventListener('click', function(){ EAP.toggleSplit(); });
  document.getElementById('insights-toggle').addEventListener('click', function(){ EAP.toggleInsights(); });
  var tb = document.getElementById('track-toggle');
  if (tb) tb.addEventListener('click', function(){ EAP.state.boardView = EAP.state.boardView==='track' ? 'grid' : 'track'; EAP.render(); });
  var db = document.getElementById('deps-toggle');
  if (db) db.addEventListener('click', function(){ EAP.state.showDeps = !EAP.state.showDeps; EAP.render(); });

  // Hierarchy checkboxes
  document.querySelectorAll('[data-hier-check]').forEach(function(cb) {
    cb.addEventListener('change', function() {
      var lv = cb.dataset.hierCheck;
      EAP.state.hierHide = EAP.state.hierHide || {};
      EAP.state.hierHide[lv] = !cb.checked;
      EAP.render();
    });
  });
};

// ── Content ────────────────────────────────────────────
EAP.renderContent = function() {
  var s = EAP.state, el = document.getElementById('content-area'); if (!el) return;
  var h = '';
  if (s.tab==='Backlog') h = EAP.renderBacklog();
  if (s.tab==='List') h = EAP.renderList();
  if (s.tab==='Board') h = EAP.renderBoard();
  if (s.tab==='Hierarchy') h = EAP.renderHierarchy();
  if (s.insightsOpen) h += '<div class="gpanel ins-panel" id="insights-panel"></div>';
  el.innerHTML = h;
  EAP.wireAccordions(el); EAP.wireHierToggles(el);
  // Wire hierarchy buttons
  var eb=document.getElementById('hier-expand'); if(eb) eb.addEventListener('click',function(){EAP.setAllHier(EAP.hierarchy,true);EAP.render();});
  var cb=document.getElementById('hier-collapse'); if(cb) cb.addEventListener('click',function(){EAP.setAllHier(EAP.hierarchy,false);EAP.render();});
  // Wire hierarchy level hides
  document.querySelectorAll('[data-hier-hide]').forEach(function(b){b.addEventListener('click',function(){var lv=b.dataset.hierHide;EAP.state.hierHide=EAP.state.hierHide||{};EAP.state.hierHide[lv]=!EAP.state.hierHide[lv];EAP.render();});});
};

EAP.wireAccordions = function(el) { el.querySelectorAll('[data-pi-toggle]').forEach(function(hd){ hd.addEventListener('click', function(e){ if(e.target.closest('.add-btn')||e.target.closest('.pi-complete')) return; EAP.toggleAccordion(hd.dataset.piToggle); }); }); };
EAP.wireHierToggles = function(el) { el.querySelectorAll('[data-hier-toggle]').forEach(function(t){ t.addEventListener('click', function(e){ e.stopPropagation(); EAP.toggleHierarchy(t.dataset.hierToggle); }); }); };

// ── Helpers ────────────────────────────────────────────
var G = '<span class="dg"><svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor"><circle cx="2" cy="2" r="1.2"/><circle cx="6" cy="2" r="1.2"/><circle cx="2" cy="6" r="1.2"/><circle cx="6" cy="6" r="1.2"/><circle cx="2" cy="10" r="1.2"/><circle cx="6" cy="10" r="1.2"/></svg></span>';
var GT = '<td style="width:20px;padding:8px 4px">' + G + '</td>';
var ADD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
EAP.pill = function(st) { return '<span class="st-pill '+EAP.stateClass(st)+'">'+st+'</span>'; };
EAP.pbar = function(p,st) { if(p===undefined||p===null) return ''; return '<div class="pb"><div class="pb-t"><div class="pb-f '+EAP.progressBarClass(st)+'" style="width:'+Math.min(p,100)+'%"></div></div><span class="pb-l">'+p+'%</span></div>'; };
EAP.subtlePill = function(st) {
  var m={Funnel:'rgba(0,0,0,0.04);color:var(--text-tertiary)',Backlog:'rgba(0,0,0,0.04);color:var(--text-tertiary)',Implementation:'rgba(154,52,18,0.08);color:#9a3412',Blocked:'rgba(140,29,29,0.08);color:#8c1d1d','In Progress':'rgba(30,64,175,0.08);color:#1e40af',Done:'rgba(22,101,52,0.08);color:#166534',Analysis:'rgba(109,40,217,0.08);color:#6d28d9',Draft:'rgba(0,0,0,0.04);color:var(--text-tertiary)',Planned:'rgba(0,0,0,0.04);color:var(--text-tertiary)','To Do':'rgba(0,0,0,0.04);color:var(--text-tertiary)','In Review':'rgba(109,40,217,0.08);color:#6d28d9'};
  return '<span style="display:inline-flex;font-size:9px;font-weight:400;padding:2px 6px;border-radius:9999px;white-space:nowrap;background:'+(m[st]||m.Funnel)+'">'+st+'</span>';
};

// ═══ BACKLOG ═══════════════════════════════════════════
EAP.renderBacklog = function() {
  if (EAP.state.level === 'WorkItem') return EAP.renderBacklogGrouped();
  var d = EAP.getBacklogData(), l = {Epic:'Epics',Capability:'Capabilities',Feature:'Features'}[EAP.state.level]||'Items', c = EAP.bkCols();
  return '<div class="gpanel" style="flex:1;min-width:0;"><div class="gpanel-hd"><div class="gpanel-hd-left"><span class="gpanel-title">'+l+'</span><span class="gpanel-count">'+d.length+'</span></div><button class="add-btn">'+ADD+'New</button></div><div class="gpanel-scroll"><table class="dtbl"><thead><tr>'+c.h+'</tr></thead><tbody>'+d.map(function(i){return '<tr>'+c.r(i)+'</tr>';}).join('')+'</tbody></table></div></div>';
};

EAP.renderBacklogGrouped = function() {
  var bl = EAP.workItems.backlog;
  var grps = [{key:'Story',label:'Story',items:bl.Story||[]},{key:'Defect',label:'Defect',items:bl.Defect||[]},{key:'CaseTask',label:'Case Task',items:bl.CaseTask||[]}];
  var total = grps.reduce(function(a,g){return a+g.items.length;},0);
  var h = '<div class="gpanel" style="flex:1;min-width:0;"><div class="gpanel-hd"><div class="gpanel-hd-left"><span class="gpanel-title">Work Items</span><span class="gpanel-count">'+total+'</span></div><button class="add-btn">'+ADD+'New</button></div><div class="gpanel-scroll">';
  grps.forEach(function(g){
    var gId='wigrp-'+g.key, isOpen=EAP.state.openAccordions[gId]!==false;
    if(EAP.state.openAccordions[gId]===undefined) EAP.state.openAccordions[gId]=true;
    h += '<div style="border-bottom:1px solid rgba(0,0,0,0.04);">' +
      '<div data-pi-toggle="'+gId+'" style="padding:8px 14px;display:flex;align-items:center;gap:8px;cursor:pointer;background:var(--color-primary);user-select:none;">' +
      '<div class="pi-tog'+(isOpen?' open':'')+'" id="pi-tog-'+gId+'" style="width:16px;height:16px;font-size:9px;background:rgba(255,255,255,0.18);border-color:rgba(255,255,255,0.3);color:#fff;">'+(isOpen?'−':'+')+'</div>' +
      '<span style="font-size:11px;font-weight:500;color:#fff;">'+g.label+'</span>' +
      '<span style="font-size:10px;color:rgba(255,255,255,0.6);font-family:var(--font-mono);">'+g.items.length+'</span></div>';
    h += '<div class="pi-body'+(isOpen?' open':'')+'" id="pi-body-'+gId+'"><table class="dtbl wi-grp-tbl"><thead><tr>' +
      '<th></th><th>Number</th><th>Name</th><th>Epic</th><th>Pts</th><th>Type</th></tr></thead><tbody>' +
      g.items.map(function(i){ return '<tr>'+GT+'<td><span style="font-family:var(--font-mono);font-size:11px;color:var(--text-tertiary);">'+(i.num||'')+'</span></td><td><span class="item-nm">'+i.name+'</span></td><td><span class="par">'+(i.epic||'—')+'</span></td><td><span class="sz">'+(i.pts||'')+'</span></td><td><span class="tm">'+(i.type||'')+'</span></td></tr>'; }).join('') +
      '</tbody></table></div></div>';
  });
  return h+'</div></div>';
};

EAP.bkCols = function() {
  var s=EAP.state;
  var TH0 = '<th style="width:20px;padding:8px 4px"></th>';
  if(s.level==='Epic') return {
    h: TH0+'<th>Name</th><th>Type</th><th>State</th><th>Size</th><th>WSJF</th><th>ART</th>',
    r: function(i){return GT+'<td><span class="item-nm">'+i.name+'</span></td><td><span class="tm">'+(i.type||'Epic')+'</span></td><td>'+EAP.pill(i.state)+'</td><td><span class="sz">'+i.size+'</span></td><td><span class="wsjf">'+i.wsjf+'</span></td><td><span class="par">'+(i.art||'—')+'</span></td>';}
  };
  if(s.level==='Capability') return {
    h: TH0+'<th>Name</th><th>Type</th><th>State</th><th>Size</th><th>WSJF</th><th>Parent</th><th>ART</th>',
    r: function(i){return GT+'<td><span class="item-nm">'+i.name+'</span></td><td><span class="tm">'+(i.type||'Capability')+'</span></td><td>'+EAP.pill(i.state)+'</td><td><span class="sz">'+i.size+'</span></td><td><span class="wsjf">'+i.wsjf+'</span></td><td><span class="par">'+(i.parent||'—')+'</span></td><td><span class="par">'+(i.art||'—')+'</span></td>';}
  };
  // Feature
  return {
    h: TH0+'<th>Name</th><th>Type</th><th>State</th><th>Size</th><th>WSJF</th><th>Parent</th><th>Team</th>',
    r: function(i){return GT+'<td><span class="item-nm">'+i.name+'</span></td><td><span class="tm">'+(i.type||'Feature')+'</span></td><td>'+EAP.pill(i.state)+'</td><td><span class="sz">'+i.size+'</span></td><td><span class="wsjf">'+i.wsjf+'</span></td><td><span class="par">'+(i.parent||'—')+'</span></td><td><span class="tm">'+(i.team||'—')+'</span></td>';}
  };
};

// ═══ LIST ══════════════════════════════════════════════
EAP.renderList = function() {
  var s=EAP.state, groups=EAP.getListGroups(), isT=(s.level==='Feature'||s.level==='WorkItem');
  var ll={Epic:'Epics',Capability:'Capabilities',Feature:'Features',WorkItem:'Work Items'}[s.level]||'Items';
  var cols=EAP.lsCols();
  groups.forEach(function(g){if(EAP.state.openAccordions[g.id]===undefined) EAP.state.openAccordions[g.id]=true;});

  var blHtml='';
  if(s.splitView) {
    var blD=(s.level==='WorkItem')?EAP.getBacklogFlat():EAP.getBacklogData();
    var bc=EAP.bkCols();
    blHtml='<div class="gpanel split-left"><div class="gpanel-hd"><div class="gpanel-hd-left"><span class="gpanel-title">Backlog</span><span class="gpanel-count">'+blD.length+'</span></div><button class="add-btn">'+ADD+'New</button></div><div class="gpanel-scroll"><table class="dtbl"><thead><tr>'+bc.h+'</tr></thead><tbody>'+blD.map(function(i){return '<tr>'+bc.r(i)+'</tr>';}).join('')+'</tbody></table></div></div><div class="split-div"><div class="split-grip"><span></span><span></span><span></span><span></span><span></span></div></div>';
  }

  var acc='<div class="'+(s.splitView?'split-right':'')+'" style="'+(s.splitView?'':'flex:1;min-width:0;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:2px;')+'">';
  groups.forEach(function(g){
    var isA=!!g.active, isO=!!EAP.state.openAccordions[g.id];
    acc+='<div class="pi-acc"><div class="pi-hd'+(isA?' active':'')+'" data-pi-toggle="'+g.id+'">';
    acc+='<div class="pi-tog'+(isO?' open':'')+'" id="pi-tog-'+g.id+'">'+(isO?'−':'+')+'</div>';
    acc+='<span class="pi-nm">'+g.name+'</span>';
    if(g.dates) acc+='<span class="pi-dates">'+g.dates+'</span>';
    if(isA) acc+='<span class="pi-badge">Current '+(s.level==='WorkItem'?'Sprint':'PI')+'</span>';
    acc+='<div class="pi-meta">';
    if(isT){acc+='<span class="pi-mi"><span class="pi-ml">Capacity</span><span class="pi-mv">'+g.capPct+'%</span></span><span class="pi-ms">|</span><span class="pi-mi"><span class="pi-ml">Pts</span><span class="pi-mv">'+g.totalPts+'</span></span>';if(isA)acc+='<span class="pi-ms">|</span><span class="pi-mi"><span class="pi-ml">Done</span><span class="pi-mv">'+g.donePts+'</span></span>';}
    else{acc+='<span class="pi-mi"><span class="pi-ml">'+ll+'</span><span class="pi-mv">'+g.items.length+'</span></span><span class="pi-ms">|</span><span class="pi-mi"><span class="pi-ml">Pts</span><span class="pi-mv">0</span></span>';}
    acc+='<button class="add-btn" onclick="event.stopPropagation()">'+ADD+'New</button>';
    if(isA)acc+='<button class="pi-complete">Complete '+(s.level==='WorkItem'?'Sprint':'PI')+' ▸</button>';
    acc+='</div></div>';
    acc+='<div class="pi-body'+(isO?' open':'')+'" id="pi-body-'+g.id+'"><div class="pi-pad">';
    if(g.items&&g.items.length){acc+='<table class="dtbl"><thead><tr>'+cols.h+'</tr></thead><tbody>'+g.items.map(function(i){return '<tr>'+cols.r(i)+'</tr>';}).join('')+'</tbody></table>';}
    else{acc+='<div style="padding:20px;text-align:center;font-size:12px;color:var(--text-disabled);font-style:italic;">No items assigned</div>';}
    acc+='</div></div></div>';
  });

  // Non-split: show backlog section below accordions
  if(!s.splitView){
    var blD2=(s.level==='WorkItem')?EAP.getBacklogFlat():EAP.getBacklogData();
    var bc2=EAP.bkCols();
    acc+='<div class="pi-acc" style="margin-top:4px;"><div class="gpanel-hd" style="border-radius:16px 16px 0 0;"><div class="gpanel-hd-left"><span class="gpanel-title">Backlog</span><span class="gpanel-count">'+blD2.length+'</span></div><button class="add-btn">'+ADD+'New</button></div><div style="padding:10px 14px 14px;"><table class="dtbl"><thead><tr>'+bc2.h+'</tr></thead><tbody>'+blD2.map(function(i){return '<tr>'+bc2.r(i)+'</tr>';}).join('')+'</tbody></table></div></div>';
  }
  acc+='</div>';
  return blHtml+acc;
};

EAP.lsCols = function() {
  var s=EAP.state;
  if(s.level==='Epic') return {h:'<th style="width:20px;padding:8px 4px"></th><th>Name</th><th>State</th><th>% Complete</th><th>Size</th><th>WSJF</th><th>ART</th>',r:function(i){return GT+'<td><span class="item-nm">'+i.name+'</span></td><td>'+EAP.pill(i.state)+'</td><td>'+EAP.pbar(i.pct,i.state)+'</td><td><span class="sz">'+i.size+'</span></td><td><span class="wsjf">'+i.wsjf+'</span></td><td><span class="tm">'+(i.art||'')+'</span></td>';}};
  if(s.level==='Capability') return {h:'<th style="width:20px;padding:8px 4px"></th><th>Name</th><th>State</th><th>% Complete</th><th>Size</th><th>WSJF</th><th>Parent</th>',r:function(i){return GT+'<td><span class="item-nm">'+i.name+'</span></td><td>'+EAP.pill(i.state)+'</td><td>'+EAP.pbar(i.pct,i.state)+'</td><td><span class="sz">'+i.size+'</span></td><td><span class="wsjf">'+i.wsjf+'</span></td><td><span class="par">'+(i.parent||'')+'</span></td>';}};
  if(s.level==='WorkItem') return {h:'<th style="width:20px;padding:8px 4px"></th><th>Name</th><th>State</th><th>% Complete</th><th>Pts</th><th>Owner</th><th>Team</th>',r:function(i){return GT+'<td><span class="item-nm">'+i.name+'</span></td><td>'+EAP.pill(i.state)+'</td><td>'+EAP.pbar(i.pct,i.state)+'</td><td><span class="sz">'+(i.pts||'')+'</span></td><td><span class="par">'+(i.owner||'')+'</span></td><td><span class="tm">'+(i.team||'')+'</span></td>';}};
  return {h:'<th style="width:20px;padding:8px 4px"></th><th>Name</th><th>State</th><th>Progress</th><th>Size</th><th>WSJF</th><th>Parent</th><th>Team</th>',r:function(i){return GT+'<td><span class="item-nm">'+i.name+'</span></td><td>'+EAP.pill(i.state)+'</td><td>'+EAP.pbar(i.pct,i.state)+'</td><td><span class="sz">'+i.size+'</span></td><td><span class="wsjf">'+i.wsjf+'</span></td><td><span class="par">'+(i.parent||'')+'</span></td><td><span class="tm">'+(i.team||'')+'</span></td>';}};
};

// ═══ BOARD ═════════════════════════════════════════════
EAP.renderBoard = function() {
  var s=EAP.state;
  if(s.level==='Epic'||s.level==='Capability') return EAP.renderWorkflowBoard();
  if(s.level==='Feature') return EAP.renderFeatureBoard();
  if(s.level==='WorkItem') return s.boardView==='track'?EAP.renderTrackBoard():EAP.renderWIGrid();
  return '';
};

var CS = 'background:rgba(255,255,255,0.6);border:1px solid rgba(0,0,0,0.1);border-radius:10px;padding:10px;margin-bottom:6px;cursor:grab;transition:box-shadow 0.15s ease;';
var CB = 'background:rgba(255,255,255,0.3);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.4);border-top:none;border-radius:0 0 12px 12px;padding:8px;min-height:100px;flex:1;';
function colHd(isActive) { return 'padding:8px 12px;border-radius:12px 12px 0 0;display:flex;align-items:center;justify-content:space-between;' + (isActive ? 'background:var(--color-primary);color:#fff;' : 'background:rgba(14,78,105,0.12);color:var(--text-primary);'); }

EAP.renderWorkflowBoard = function() {
  var s=EAP.state, data=s.level==='Epic'?EAP.epics:EAP.capabilities;
  var all=(data.backlog||[]).slice(); (data.groups||[]).forEach(function(g){all=all.concat(g.items||[]);});
  var bk={}; EAP.workflowColumns.forEach(function(c){bk[c]=[];}); all.forEach(function(i){var st=i.state==='In Progress'?'Implementation':i.state;if(bk[st])bk[st].push(i);else bk.Backlog.push(i);});
  var h='<div style="flex:1;overflow-x:auto;"><div style="display:flex;gap:10px;padding:4px 2px 16px;width:100%;">';
  EAP.workflowColumns.forEach(function(c){var items=bk[c]||[];h+='<div style="flex:1;min-width:160px;display:flex;flex-direction:column;"><div style="'+colHd(false)+'"><span style="font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.04em;">'+c+'</span><span style="font-size:10px;font-family:var(--font-mono);opacity:0.5;">'+items.length+'</span></div><div style="'+CB+'">';items.forEach(function(i){h+='<div style="'+CS+'"><div class="item-nm" style="font-size:12px;margin-bottom:6px;">'+i.name+'</div>'+EAP.subtlePill(i.state);if(i.wsjf)h+=' <span class="wsjf" style="margin-left:4px;">'+i.wsjf+'</span>';h+='</div>';});h+='</div></div>';});
  return h+'</div></div>';
};

EAP.renderFeatureBoard = function() {
  var pis=EAP.features.pis, bl=EAP.features.backlog;
  var cols=[{id:'backlog',name:'Backlog',active:false,items:bl}].concat(pis);
  var h='<div style="flex:1;overflow-x:auto;"><div style="display:flex;gap:10px;padding:4px 2px 16px;width:100%;">';
  cols.forEach(function(pi){
    var items=pi.items||[],isA=!!pi.active;
    h+='<div style="flex:1;min-width:180px;display:flex;flex-direction:column;"><div style="'+colHd(isA)+'"><span style="font-size:12px;font-weight:500;flex:1;">'+pi.name+'</span>';
    if(isA)h+='<span style="font-size:9px;font-weight:500;padding:2px 7px;border-radius:3px;background:rgba(255,255,255,0.2);">Current PI</span>';
    h+='<span style="font-size:10px;font-family:var(--font-mono);opacity:0.5;margin-left:6px;">'+items.length+'</span></div><div style="'+CB+'">';
    items.forEach(function(f){
      var bc=f.state==='Blocked'?'#dc2626':f.state==='Done'||f.state==='Complete'?'#16a34a':'rgba(0,0,0,0.08)';
      h+='<div style="'+CS+'border-left:3px solid '+bc+';" id="fcard-'+f.id+'"><div class="item-nm" style="font-size:12px;margin-bottom:5px;">'+f.name+'</div><div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">'+EAP.subtlePill(f.state);if(f.team)h+='<span class="tm">'+f.team+'</span>';h+='</div>';if(f.pct>0)h+='<div style="margin-top:6px;">'+EAP.pbar(f.pct,f.state)+'</div>';h+='</div>';
    });
    h+='</div></div>';
  });
  return h+'</div></div>';
};

EAP.renderWIGrid = function() {
  var sprints=EAP.workItems.sprints, blFlat=EAP.getBacklogFlat();
  var cols=[{id:'backlog',name:'Backlog',active:false,items:blFlat}].concat(sprints);
  var teams=['Auth Team','Payments Team','Fraud Team','Mobile Exp Team','Accounts Team','Onboarding Team'];
  var h='<div style="flex:1;overflow:auto;">';
  teams.forEach(function(team){
    h+='<div style="margin-bottom:14px;"><div style="padding:6px 12px;background:rgba(14,78,105,0.15);color:var(--text-primary);border-radius:8px;font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px;">'+team+'</div><div style="display:flex;gap:8px;width:100%;">';
    cols.forEach(function(sp){
      var items=(sp.items||[]).filter(function(i){return i.team===team;}), isA=!!sp.active;
      h+='<div style="flex:1;min-width:140px;"><div style="'+colHd(isA)+'border-radius:8px 8px 0 0;padding:6px 10px;"><span style="font-size:10px;font-weight:500;">'+sp.name+'</span><span style="font-size:10px;font-family:var(--font-mono);opacity:0.5;">'+items.length+'</span></div><div style="'+CB+'border-radius:0 0 8px 8px;padding:6px;min-height:50px;">';
      items.forEach(function(wi){h+='<div style="'+CS+'padding:8px;font-size:11px;"><div style="font-weight:500;color:var(--text-secondary);line-height:1.3;margin-bottom:4px;">'+wi.name+'</div>'+EAP.subtlePill(wi.state);if(wi.pts)h+=' <span class="sz">'+wi.pts+'pt</span>';h+='</div>';});
      h+='</div></div>';
    });
    h+='</div></div>';
  });
  return h+'</div>';
};

EAP.renderTrackBoard = function() {
  var all=[]; EAP.workItems.sprints.forEach(function(sp){all=all.concat(sp.items||[]);}); all=all.concat(EAP.getBacklogFlat());
  var bk={}; EAP.trackColumns.forEach(function(c){bk[c]=[];}); all.forEach(function(i){var c=i.state;if(c==='Planned'||c==='To Do')c='Draft';if(bk[c])bk[c].push(i);else bk.Draft.push(i);});
  var h='<div style="flex:1;overflow-x:auto;"><div style="display:flex;gap:8px;padding:4px 2px 16px;width:100%;">';
  EAP.trackColumns.forEach(function(col){var items=bk[col]||[];h+='<div style="flex:1;min-width:140px;display:flex;flex-direction:column;"><div style="'+colHd(false)+'border-radius:10px 10px 0 0;padding:8px 10px;"><span style="font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:0.03em;">'+col+'</span><span style="font-size:10px;font-family:var(--font-mono);opacity:0.5;">'+items.length+'</span></div><div style="'+CB+'border-radius:0 0 10px 10px;min-height:80px;">';items.forEach(function(wi){h+='<div style="'+CS+'padding:8px;font-size:11px;"><div style="font-weight:500;color:var(--text-secondary);line-height:1.3;margin-bottom:4px;">'+wi.name+'</div>';if(wi.pts)h+='<span class="sz">'+wi.pts+'pt</span> ';if(wi.owner)h+='<span class="par">'+wi.owner+'</span>';h+='</div>';});h+='</div></div>';});
  return h+'</div></div>';
};

// ═══ HIERARCHY ═════════════════════════════════════════
EAP.renderHierarchy = function() {
  var s=EAP.state;
  s.hierHide = s.hierHide || {};
  function initO(n){if(['goal','epic','capability'].indexOf(n.type)!==-1&&s.openHierarchy[n.id]===undefined)s.openHierarchy[n.id]=true;if(n.children)n.children.forEach(initO);}
  EAP.hierarchy.forEach(initO);

  var h='<div class="gpanel" style="flex:1;min-width:0;"><div class="gpanel-hd"><div class="gpanel-hd-left"><span class="gpanel-title">Hierarchy</span>' +
    '<span style="font-size:11px;color:var(--text-tertiary);margin-left:8px;">Goal → Epic → Capability → Feature → Story → Defect</span></div>' +
    '<div style="display:flex;gap:6px;align-items:center;">' +
    '<button class="add-btn" id="hier-expand" style="height:22px;font-size:10px;">Expand all</button>' +
    '<button class="add-btn" id="hier-collapse" style="height:22px;font-size:10px;">Collapse all</button>' +
    '</div></div>' +
    '<div class="gpanel-scroll" style="padding:4px 0;">';
  EAP.hierarchy.forEach(function(n){h+=EAP.hNode(n,0);});
  return h+'</div></div>';
};

EAP.hNode = function(n, depth) {
  var s=EAP.state, hide=s.hierHide||{};
  // Skip hidden levels — pass children through
  var typeLabel=n.type.charAt(0).toUpperCase()+n.type.slice(1);
  if(hide[typeLabel]){var o='';if(n.children)n.children.forEach(function(c){o+=EAP.hNode(c,depth);});return o;}

  var hasK=n.children&&n.children.length>0, isO=!!s.openHierarchy[n.id];
  var indent=depth*20, isG=n.type==='goal', isE=n.type==='epic';
  var tc={goal:'#0e4e69',epic:'#1e6b8a',capability:'#4a90a4',feature:'#7ab0c4',story:'#a8ccd8',defect:'#e07a5f'};
  var bg={goal:'rgba(14,78,105,0.04)',epic:'rgba(14,78,105,0.02)'};
  var rp=isG?'11px':isE?'9px':'7px';

  var h='<div><div style="padding:'+rp+' 16px '+rp+' '+(16+indent)+'px;display:flex;align-items:center;border-bottom:1px solid rgba(0,0,0,0.03);background:'+(bg[n.type]||'transparent')+';transition:background 100ms ease;" onmouseenter="this.style.background=\'rgba(14,78,105,0.04)\'" onmouseleave="this.style.background=\''+(bg[n.type]||'transparent')+'\'">';
  if(hasK){h+='<div class="pi-tog'+(isO?' open':'')+'" id="hier-tog-'+n.id+'" data-hier-toggle="'+n.id+'" style="margin-right:8px;cursor:pointer;">'+(isO?'−':'+')+'</div>';}
  else{h+='<div style="width:18px;margin-right:8px;"></div>';}
  h+='<span style="font-size:9px;font-weight:500;padding:1px 6px;border-radius:3px;background:'+(tc[n.type]||'#94a3b8')+';color:#fff;margin-right:8px;text-transform:capitalize;flex-shrink:0;">'+n.type+'</span>';
  h+='<span style="flex:1;font-size:'+(isG?'13px':'12px')+';font-weight:'+(isG?'600':isE?'500':'400')+';color:var(--text-secondary);line-height:1.35;">'+n.name+'</span>';
  if(n.prog){var pc=n.prog.indexOf('Blocked')!==-1||n.prog.indexOf('Open')!==-1?'#8c1d1d':n.prog.indexOf('At Risk')!==-1||n.prog.indexOf('Behind')!==-1?'#9a3412':n.prog.indexOf('Done')!==-1||n.prog.indexOf('Complete')!==-1?'#166534':'var(--text-tertiary)';h+='<span style="font-size:10px;font-weight:400;color:'+pc+';padding:2px 8px;background:rgba(0,0,0,0.03);border-radius:9999px;margin-left:12px;white-space:nowrap;">'+n.prog+'</span>';}
  h+='</div>';
  if(hasK){h+='<div id="hier-kids-'+n.id+'" style="'+(isO?'':'display:none;')+'">';n.children.forEach(function(c){h+=EAP.hNode(c,depth+1);});h+='</div>';}
  return h+'</div>';
};

EAP.setAllHier=function(nodes,v){nodes.forEach(function(n){EAP.state.openHierarchy[n.id]=v;if(n.children)EAP.setAllHier(n.children,v);});};

// ═══ INSIGHTS ══════════════════════════════════════════
EAP.renderInsights = function() {
  var el=document.getElementById('insights-panel'); if(!el) return;
  var d=EAP.getInsights();
  var h='<div class="ins-hd"><span class="ins-hd-lbl">Insights</span><button class="ins-x" onclick="EAP.toggleInsights()">×</button></div><div class="ins-scroll">';
  if(d.gauge){h+='<div class="ins-gauge"><div class="ins-gauge-lbl">'+d.gauge.label+'</div><div class="g-wrap"><canvas id="gaugeCanvas" width="200" height="110" style="display:block;"></canvas><div class="g-ctr"><div class="g-val" id="gVal">'+d.gauge.value+'%</div><div class="g-sub">Allocated</div></div></div><div class="g-labels"><span>0</span><span>100</span></div></div>';}
  if(d.teams){h+='<div class="ins-teams"><div class="ins-teams-lbl">Team Capacity</div>';d.teams.forEach(function(t){var cls=t.status==='over'?'over':t.status==='watch'?'watch':'healthy',vc=t.status==='over'?' danger':t.status==='watch'?' warn':'';h+='<div class="team-row"><span class="team-row-name">'+t.name+'</span><div class="team-row-bar"><div class="team-row-fill '+cls+'" style="width:'+Math.min(t.pct,100)+'%"></div></div><span class="team-row-val'+vc+'">'+t.pct+'%</span></div>';});h+='</div>';}
  if(d.signals){h+='<div class="ins-sec"><div class="ins-sec-lbl">Signals</div>';d.signals.forEach(function(s){h+='<div class="ins-row '+s.level+'"><div class="ins-t">'+s.title+'</div><div class="ins-s">'+s.desc+'</div>';if(s.action)h+='<a class="ins-a" href="#">'+s.action+'</a>';h+='</div>';});h+='</div>';}
  h+='</div>'; el.innerHTML=h;
  if(d.gauge) setTimeout(function(){EAP.drawGauge(d.gauge.value);},50);
};

// ── Gauge ──────────────────────────────────────────────
EAP.drawGauge = function(tv) {
  var c=document.getElementById('gaugeCanvas');if(!c)return;var dpr=window.devicePixelRatio||1,W=200,H=110;c.width=W*dpr;c.height=H*dpr;c.style.width=W+'px';c.style.height=H+'px';var x=c.getContext('2d');x.scale(dpr,dpr);var cx=W/2,cy=H-8,oR=86,iR=68,sA=Math.PI,eA=2*Math.PI;
  function gc(v){return v<=70?'#2E9E6B':v<=85?'#D97706':'#CC0000';}
  function draw(v){x.clearRect(0,0,W,H);var va=sA+(v/100)*Math.PI,fc=gc(v);[{f:0,t:0.70,c:'#2E9E6B'},{f:0.70,t:0.85,c:'#D97706'},{f:0.85,t:1,c:'#CC0000'}].forEach(function(z){x.lineWidth=8;x.lineCap='round';x.beginPath();x.arc(cx,cy,oR,sA+Math.PI*z.f+0.02,sA+Math.PI*z.t-0.02);x.strokeStyle=z.c;x.globalAlpha=0.22;x.stroke();});x.globalAlpha=1;x.lineWidth=16;x.lineCap='round';x.beginPath();x.arc(cx,cy,iR,sA,eA);x.strokeStyle='rgba(0,0,0,0.05)';x.stroke();if(v>0){x.beginPath();x.arc(cx,cy,iR,sA,va);x.strokeStyle=fc;x.stroke();}var dx=cx+iR*Math.cos(va),dy=cy+iR*Math.sin(va);x.beginPath();x.arc(dx,dy,8,0,2*Math.PI);x.fillStyle='#fff';x.fill();x.beginPath();x.arc(dx,dy,8,0,2*Math.PI);x.strokeStyle=fc;x.lineWidth=3;x.stroke();x.beginPath();x.arc(dx,dy,4,0,2*Math.PI);x.fillStyle=fc;x.fill();var l=document.getElementById('gVal');if(l){l.textContent=Math.round(v)+'%';l.style.color=fc;}}
  var av=0,st=tv/45;var a=setInterval(function(){av=Math.min(av+st,tv);draw(av);if(av>=tv)clearInterval(a);},16);
};

EAP.toggleHierarchy = function(id){EAP.state.openHierarchy[id]=!EAP.state.openHierarchy[id];var k=document.getElementById('hier-kids-'+id),t=document.getElementById('hier-tog-'+id);if(k){var o=EAP.state.openHierarchy[id];k.style.display=o?'':'none';if(t){t.textContent=o?'−':'+';t.classList.toggle('open',o);}}};
