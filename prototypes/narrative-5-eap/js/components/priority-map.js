/* ═══════════════════════════════════════════════════════
   PRIORITY-MAP.JS — Full-screen priority matrix overlay
   D3 v7 force simulation · Value (WSJF) × Effort (Size)
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

// ── Quadrant config ────────────────────────────────────
EAP._pmQ = {
  quickwin: { fill:'#0ea5e9', bg:'rgba(14,165,233,0.06)',  tipBg:'rgba(14,165,233,0.10)', lc:'#0284c7', text:'QUICK WINS', label:'Quick Win',  tc:'#0284c7' },
  bigbet:   { fill:'#f97316', bg:'rgba(249,115,22,0.06)',  tipBg:'rgba(249,115,22,0.10)', lc:'#ea580c', text:'BIG BETS',   label:'Big Bet',    tc:'#ea580c' },
  maybe:    { fill:'#8b5cf6', bg:'rgba(139,92,246,0.05)',  tipBg:'rgba(139,92,246,0.08)', lc:'#7c3aed', text:'MAYBES',     label:'Maybe',      tc:'#7c3aed' },
  timesink: { fill:'#ef4444', bg:'rgba(239,68,68,0.06)',   tipBg:'rgba(239,68,68,0.10)',  lc:'#dc2626', text:'TIME SINKS', label:'Time Sink',  tc:'#dc2626' }
};

// ── Private helpers ────────────────────────────────────
EAP._pmClamp = function(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };
EAP._pmEsc   = function(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
};
EAP._pmQuad  = function(item) {
  var hv = (item.wsjf||0) >= 7;
  var le = (item.size==='XS'||item.size==='S'||item.size==='M');
  return hv ? (le ? 'quickwin' : 'bigbet') : (le ? 'maybe' : 'timesink');
};

// ── Per-item insight copy ──────────────────────────────
EAP._pmItemInsight = function(item, quad) {
  var w  = item.wsjf || 0;
  var le = (item.size==='XS'||item.size==='S'||item.size==='M');
  if (!item.pi && w >= 9 && le)
    return 'Unscheduled Quick Win — highest priority for next PI commitment.';
  if (item.blocked)
    return 'Blocked: ' + (item.blockReason||'external dependency') + '. High value — unblocking is an immediate priority.';
  if ((item.stalePIs||0) >= 3 && (quad==='timesink'||quad==='maybe'))
    return 'Stale for ' + item.stalePIs + ' PIs with no team allocation — strong retirement candidate.';
  if (item.atRisk && w >= 8)
    return 'At risk on a high-WSJF delivery — needs active mitigation this PI.';
  if (quad==='bigbet' && item.size==='XL')
    return 'XL-scope Big Bet. A decomposition workshop could extract a Quick Win slice.';
  if (quad==='timesink') return 'Low value, high effort — recommend deferring or formally descoping.';
  if (quad==='maybe')    return 'Low priority. Defer unless a specific stakeholder dependency requires it.';
  if (quad==='quickwin' && !item.pi) return 'Quick Win not yet committed to a PI — schedule before planning closes.';
  return 'Tracking normally. No anomalies detected.';
};

// ── AI findings — returns array, scales to 1-3 cards ──
EAP._pmAIFindings = function(items) {
  var out = [];

  // Finding 1: Highest unscheduled Quick Win
  var qw = items.filter(function(f) {
    return (f.wsjf||0) >= 9 && !f.pi && !f.blocked &&
           (f.size==='XS'||f.size==='S'||f.size==='M');
  }).sort(function(a,b){ return (b.wsjf||0)-(a.wsjf||0); })[0];
  if (qw) {
    var n = qw.name.length>24 ? qw.name.slice(0,22)+'…' : qw.name;
    out.push({ quad:'quickwin',
      title: n,
      body:  'WSJF ' + qw.wsjf + ' · Unscheduled Quick Win — commit to PI 27 before planning closes' });
  }

  // Finding 2: Stale Time Sinks
  var stale = items.filter(function(f) {
    return (f.stalePIs||0) >= 3 && (f.size==='L'||f.size==='XL') && (f.wsjf||0) < 7;
  });
  if (stale.length) {
    var ns = stale.slice(0,2).map(function(f){ return f.name.length>18?f.name.slice(0,16)+'…':f.name; });
    out.push({ quad:'timesink',
      title: stale.length + ' stale Time Sink' + (stale.length>1?'s':''),
      body:  ns.join(' · ') + ' — no progress in 3+ PIs, retire to reduce backlog noise' });
  }

  // Finding 3: Blocked high-value
  var bk = items.filter(function(f){ return f.blocked && (f.wsjf||0)>=10; })[0];
  if (bk) {
    var bn = bk.name.length>22 ? bk.name.slice(0,20)+'…' : bk.name;
    out.push({ quad:'bigbet',
      title: bn + ' is blocked',
      body:  'WSJF ' + bk.wsjf + ' · ' + (bk.blockReason||'Dependency conflict') + ' — unblock for high-value delivery' });
  }

  if (!out.length) out.push({ quad:'quickwin',
    title: 'Portfolio balanced',
    body:  'No critical prioritisation anomalies detected across ' + items.length + ' features' });

  return out;
};

// ── Render findings using .ins-sig card pattern ────────
EAP._pmFindingsHTML = function(items) {
  return EAP._pmAIFindings(items).map(function(f) {
    var cls = f.quad === 'timesink' ? ' urgent' : f.quad === 'bigbet' ? ' watch' : ' ok';
    return '<div class="ins-sig ins-sig-ai' + cls + '">' +
      '<div class="ins-sig-title">' + EAP._pmEsc(f.title) + '</div>' +
      '<div class="ins-sig-desc">' + EAP._pmEsc(f.body) + '</div>' +
      '</div>';
  }).join('');
};

// ── Render ranked feature list for right panel ─────────
EAP._pmRankedHTML = function(items) {
  var sorted = items.slice().sort(function(a,b){ return (b.wsjf||0)-(a.wsjf||0); });
  return sorted.slice(0, 14).map(function(it) {
    var qc  = EAP._pmQ[EAP._pmQuad(it)];
    var cls = it.blocked ? ' urgent' : (it.atRisk ? ' watch' : ' ok');
    var pi  = it.pi
      ? (EAP.piDates && EAP.piDates[it.pi] ? EAP.piDates[it.pi].name : it.pi)
      : 'Unscheduled';
    var nm  = it.name.length > 27 ? it.name.slice(0,25)+'…' : it.name;
    return '<div class="ins-sig' + cls + '" style="border-left-color:' + qc.fill + '">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">' +
        '<span class="ins-sig-title" style="padding-right:0;flex:1;min-width:0;">' + EAP._pmEsc(nm) + '</span>' +
        '<span class="wsjf ' + (EAP.wsjfTier ? EAP.wsjfTier(it.wsjf) : '') + '" style="flex-shrink:0;">' + (it.wsjf||'—') + '</span>' +
      '</div>' +
      '<div class="ins-sig-desc">' + EAP._pmEsc(qc.label) + (it.team ? ' · ' + EAP._pmEsc(it.team) : '') + ' · ' + EAP._pmEsc(pi) + '</div>' +
      '</div>';
  }).join('');
};

// ── Tooltip HTML ───────────────────────────────────────
EAP._pmTipHTML = function(item, quad) {
  var qc     = EAP._pmQ[quad];
  var stPill = '<span class="' + EAP.stateClass(item.state) + '" style="font-size:9px;padding:2px 7px;">' + EAP._pmEsc(item.state) + '</span>';
  var piStr  = item.pi
    ? (EAP.piDates&&EAP.piDates[item.pi] ? EAP.piDates[item.pi].name : item.pi)
    : '<span style="color:#b91c1c;font-weight:500;">Unscheduled</span>';
  return [
    '<div class="pm-tip-name">' + EAP._pmEsc(item.name) + '</div>',
    '<div class="pm-tip-meta">',
      (item.num ? EAP._pmEsc(item.num)+' · ' : ''),
      (item.team ? EAP._pmEsc(item.team)+' · ' : ''),
      piStr,
    '</div>',
    '<div class="pm-tip-row">',
      stPill,
      '<span class="pm-tip-tag">Size '+(item.size||'—')+'</span>',
      '<span class="pm-tip-tag pm-tip-wsjf">WSJF '+(item.wsjf||'—')+'</span>',
      '<span class="pm-tip-quad" style="background:'+qc.tipBg+';color:'+qc.tc+';">'+qc.label+'</span>',
    '</div>',
    '<div class="pm-tip-insight">' + EAP._pmEsc(EAP._pmItemInsight(item, quad)) + '</div>'
  ].join('');
};

EAP._pmPosTip = function(event) {
  var tip = document.getElementById('pm-tip');
  if (!tip||tip.style.display==='none') return;
  var tx = event.clientX+16, ty = event.clientY-12;
  if (tx+286 > window.innerWidth)  tx = event.clientX-294;
  if (ty+130 > window.innerHeight) ty = event.clientY-138;
  tip.style.left = tx+'px'; tip.style.top = ty+'px';
};

// ── Fetch items respecting current filter state ────────
EAP._pmItems = function() {
  var raw = EAP.getBacklogData();
  return (Array.isArray(raw) ? raw : []).filter(function(f) {
    return f && f.wsjf != null && f.size;
  });
};

// ── Sync header filter controls to current state ───────
EAP._pmSyncHeader = function() {
  var s = EAP.state;
  var ownerActive  = s.ownerFilter && s.ownerFilter.length > 0;
  var filterActive = ownerActive || s.mineOnly;

  // Update filter button active class
  var fbtn = document.getElementById('pm-filter-btn');
  if (fbtn) fbtn.className = 'fbar-filter-btn' + (filterActive ? ' active' : '');

  // Remove stale pill
  var oldPill = document.getElementById('pm-owner-pill');
  if (oldPill) oldPill.parentNode.removeChild(oldPill);

  if (filterActive) {
    var displayOwners = (s.ownerFilter || []).slice();
    if (s.mineOnly && displayOwners.indexOf(EAP.ME) === -1) displayOwners = displayOwners.concat([EAP.ME]);
    var prefix, label;
    if (displayOwners.length === 1) {
      var ok = displayOwners[0], op = EAP.people && EAP.people[ok];
      prefix = EAP.avatar(ok, 18);
      label  = 'Owner · ' + (op ? op.name.split(' ')[0] : ok);
    } else {
      prefix = EAP.icon('users', 11);
      label  = 'Owner: ' + displayOwners.length;
    }
    var pill = document.createElement('span');
    pill.id = 'pm-owner-pill';
    pill.className = 'fbar-owner-pill';
    pill.innerHTML = prefix + ' ' + label +
      ' <span class="cx" id="pm-owner-clear">' + EAP.icon('x', 10) + '</span>';
    var hdf = document.querySelector('.pm-hd-filters');
    if (hdf) hdf.insertBefore(pill, hdf.querySelector('.pm-hd-sep') || hdf.lastChild);
  }
};

// ── Re-draw with current filter state ─────────────────
EAP._pmRefresh = function() {
  var items = EAP._pmItems();
  // Update count in header
  var sub = document.querySelector('.pm-sub');
  if (sub) {
    var activePi = '';
    try { activePi = EAP._piDisplay.filter(function(p){return p.active;})[0].name; } catch(e){}
    sub.textContent = EAP.state.contextName + ' · ' + items.length + ' Features' + (activePi ? ' · '+activePi : '');
  }
  // Sync header filter controls (pill + button state)
  EAP._pmSyncHeader();
  // Refresh right panel
  var findingsEl = document.getElementById('pm-ai-findings');
  if (findingsEl) findingsEl.innerHTML = EAP._pmFindingsHTML(items);
  var rankedEl = document.getElementById('pm-ranked');
  if (rankedEl) rankedEl.innerHTML = EAP._pmRankedHTML(items);
  // Redraw
  EAP._pmDraw(items);
};

// ── Overlay HTML shell ─────────────────────────────────
EAP._pmShell = function(items) {
  var s = EAP.state;
  var activePi = '';
  try { activePi = EAP._piDisplay.filter(function(p){return p.active();})[0].name; } catch(e) {
    try { activePi = EAP._piDisplay.filter(function(p){return p.active;})[0].name; } catch(e2){}
  }
  var ownerActive  = s.ownerFilter && s.ownerFilter.length > 0;
  var filterActive = ownerActive || s.mineOnly;

  // Owner pill — same pattern as backlog fbar
  var ownerPill = '';
  if (filterActive) {
    var displayOwners = (s.ownerFilter || []).slice();
    if (s.mineOnly && displayOwners.indexOf(EAP.ME) === -1) displayOwners = displayOwners.concat([EAP.ME]);
    var pillPrefix, pillLabel;
    if (displayOwners.length === 1) {
      var ok = displayOwners[0];
      var op = EAP.people && EAP.people[ok];
      pillPrefix = EAP.avatar(ok, 18);
      pillLabel  = 'Owner · ' + (op ? op.name.split(' ')[0] : ok);
    } else {
      pillPrefix = EAP.icon('users', 11);
      pillLabel  = 'Owner: ' + displayOwners.length;
    }
    ownerPill = '<span class="fbar-owner-pill" id="pm-owner-pill">' +
      pillPrefix + ' ' + pillLabel +
      ' <span class="cx" id="pm-owner-clear">' + EAP.icon('x', 10) + '</span>' +
      '</span>';
  }

  return [
    '<div class="pm-panel">',
      '<div class="pm-hd">',
        '<div class="pm-hd-l">',
          '<span class="pm-title">Priority Map</span>',
          '<span class="pm-sub">' + EAP._pmEsc(s.contextName) + ' · ' + items.length + ' Features' + (activePi?' · '+activePi:'') + '</span>',
          // Note: same prioritisation findings should also surface in backlog insights panel (future work)
        '</div>',
        // Filter controls — same fbar-filter-btn pattern as backlog screen
        '<div class="pm-hd-filters">',
          '<button class="fbar-filter-btn'+(filterActive?' active':'')+'" id="pm-filter-btn" title="Filter by owner">',
            EAP.icon('filter',13),
          '</button>',
          ownerPill,
        '</div>',
        '<div class="pm-hd-sep"></div>',
        '<button class="pm-close" onclick="EAP.closePriorityMap()" aria-label="Close">',
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">',
            '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
          '</svg>',
        '</button>',
      '</div>',
      '<div class="pm-body">',
        '<div class="pm-cw">',
          '<div id="pm-canvas"></div>',
        '</div>',
        // Right panel — AI findings + WSJF-ranked list, using existing ins-sig card pattern
        '<div class="pm-rpanel">',
          '<div class="ins-sec-lbl">AI Analysis</div>',
          '<div class="ins-sig-group" id="pm-ai-findings">' + EAP._pmFindingsHTML(items) + '</div>',
          '<div class="ins-sec-lbl" style="margin-top:16px;">Features · WSJF Ranked</div>',
          '<div class="ins-sig-group" style="flex:1;overflow-y:auto;" id="pm-ranked">' + EAP._pmRankedHTML(items) + '</div>',
        '</div>',
      '</div>',
    '</div>'
  ].join('');
};

// ── D3 force layout ────────────────────────────────────
EAP._pmDraw = function(items) {
  var canvas = document.getElementById('pm-canvas');
  if (!canvas) return;
  var W = canvas.offsetWidth, H = canvas.offsetHeight;
  if (!W || !H) return;

  d3.select(canvas).selectAll('*').remove();

  var svg = d3.select(canvas).append('svg').attr('width',W).attr('height',H);
  var Q   = EAP._pmQ;

  // Symmetric padding — AI section is now a proper panel row, not an overlay
  var PT  = 54;
  var PB  = 44;
  var PL  = 54;
  var PR  = 40;
  var AG  = 10;  // gap between axis lines and box edges
  var UW  = W - PL - PR;
  var UH  = H - PT - PB;
  var MX  = PL + UW / 2;
  var MY  = PT + UH / 2;
  var R   = 24;
  var FONT = 'ServiceNow Sans,system-ui,sans-serif';

  // ── Quadrant box layout ──
  var GAP = 6;                         // gap between the four boxes
  var HDR = 40;                        // header strip height
  var QW  = (UW - AG - GAP) / 2;      // each box width (accounts for axis gap left, inter-box gap)
  var QH  = (UH - AG - GAP) / 2;      // each box height (accounts for axis gap bottom, inter-box gap)
  // Box area origin — offset from axis lines by AG
  var BX0 = PL + AG;                  // left edge of left-column boxes
  var BY0 = PT;                        // top edge of top-row boxes

  // SVG path helper: rect with top OR bottom corners rounded, flat on the other side
  function pmHdrPath(x, y, w, h, r, side) {
    if (side === 'top') {
      return 'M'+(x+r)+','+y+' H'+(x+w-r)+' Q'+(x+w)+','+y+' '+(x+w)+','+(y+r)+
             ' V'+(y+h)+' H'+x+' V'+(y+r)+' Q'+x+','+y+' '+(x+r)+','+y+' Z';
    }
    return 'M'+x+','+y+' H'+(x+w)+' V'+(y+h-r)+
           ' Q'+(x+w)+','+(y+h)+' '+(x+w-r)+','+(y+h)+
           ' H'+(x+r)+' Q'+x+','+(y+h)+' '+x+','+(y+h-r)+' Z';
  }

  // Quadrant data: box positions start AG pixels inside the axis lines
  var qBoxes = [
    { k:'quickwin', bx:BX0,        by:BY0,        hdr:'top'    },
    { k:'bigbet',   bx:BX0+QW+GAP, by:BY0,        hdr:'top'    },
    { k:'maybe',    bx:BX0,        by:BY0+QH+GAP, hdr:'bottom' },
    { k:'timesink', bx:BX0+QW+GAP, by:BY0+QH+GAP, hdr:'bottom' }
  ];
  // Box interior tints — coherent with header color, not stark white
  var qInterior = {
    quickwin:'rgba(14,78,105,0.04)',  bigbet:'rgba(180,83,9,0.04)',
    maybe:'rgba(75,85,99,0.025)',     timesink:'rgba(185,28,28,0.04)'
  };
  var qSubs = {
    quickwin:'High value · Low effort',  bigbet:'High value · High effort',
    maybe:'Low value · Low effort',      timesink:'Low value · High effort'
  };

  qBoxes.forEach(function(qb) {
    var qc = Q[qb.k];
    var BX = qb.bx, BY = qb.by, R7 = 7;

    // Box: tinted interior + coloured border
    svg.append('rect').attr('x',BX).attr('y',BY).attr('width',QW).attr('height',QH)
      .attr('fill', qInterior[qb.k])
      .attr('stroke',qc.fill).attr('stroke-width',1.5).attr('rx',R7);

    // Coloured header strip (rounded on the outer edge only)
    var hdrY = qb.hdr==='top' ? BY : BY+QH-HDR;
    svg.append('path').attr('d', pmHdrPath(BX, hdrY, QW, HDR, R7, qb.hdr))
      .attr('fill', qc.fill);

    // Title
    var titleY = qb.hdr==='top' ? hdrY+15 : hdrY+14;
    svg.append('text').attr('x',BX+QW/2).attr('y',titleY)
      .attr('text-anchor','middle').attr('dominant-baseline','auto')
      .attr('font-family',FONT).attr('font-size','12').attr('font-weight','700')
      .attr('fill','#fff').text(qc.text);

    // Subtitle — 10.5px so it's legible, not decorative
    svg.append('text').attr('x',BX+QW/2).attr('y',titleY+15)
      .attr('text-anchor','middle')
      .attr('font-family',FONT).attr('font-size','10.5').attr('font-weight','400')
      .attr('fill','rgba(255,255,255,0.85)').text(qSubs[qb.k]);
  });

  // ── Arrow marker def ──
  var defs = svg.append('defs');
  defs.append('marker')
    .attr('id','pm-arr').attr('viewBox','0 -4 8 8')
    .attr('refX',7).attr('refY',0)
    .attr('markerWidth',5).attr('markerHeight',5)
    .attr('orient','auto')
    .append('path').attr('d','M0,-3.5L8,0L0,3.5Z')
    .attr('fill','#374151').attr('opacity',0.55);

  // ── Axis lines — run outside box area (AG = gap between axis and nearest box edge) ──
  // Y axis origin: bottom-left corner of box area, but offset down by AG from box bottom
  var AX = PL;                    // axis X position (left of boxes by AG)
  var AY = PT + QH*2 + GAP + AG; // axis base Y (below boxes by AG)
  svg.append('line')
    .attr('x1',AX).attr('y1',AY)
    .attr('x2',AX).attr('y2',PT-16)
    .attr('stroke','#374151').attr('stroke-opacity',0.45).attr('stroke-width',1.5)
    .attr('marker-end','url(#pm-arr)');
  svg.append('line')
    .attr('x1',AX).attr('y1',AY)
    .attr('x2',PL+UW+16).attr('y2',AY)
    .attr('stroke','#374151').attr('stroke-opacity',0.45).attr('stroke-width',1.5)
    .attr('marker-end','url(#pm-arr)');

  // ── Axis labels + direction ticks ──
  var axStyle = { fam:FONT, size:'9', wt:'700', ls:'0.11em', fill:'#374151', op:'0.58' };
  function axTxt(sel) {
    return sel.attr('font-family',axStyle.fam).attr('font-size',axStyle.size)
      .attr('font-weight',axStyle.wt).attr('letter-spacing',axStyle.ls)
      .attr('fill',axStyle.fill).attr('opacity',axStyle.op);
  }
  // Y axis name (rotated)
  axTxt(svg.append('text')
    .attr('transform','translate('+(AX-20)+','+(PT+(QH*2+GAP)/2)+') rotate(-90)')
    .attr('text-anchor','middle')).text('BUSINESS VALUE');
  // Y axis direction ticks
  axTxt(svg.append('text').attr('x',AX-6).attr('y',PT+12).attr('text-anchor','end')).text('High');
  axTxt(svg.append('text').attr('x',AX-6).attr('y',AY-8).attr('text-anchor','end')).text('Low');
  // X axis name
  axTxt(svg.append('text')
    .attr('x',PL+AG+(QW*2+GAP)/2).attr('y',AY+22)
    .attr('text-anchor','middle')).text('EFFORT');
  // X axis direction ticks
  axTxt(svg.append('text').attr('x',BX0+6).attr('y',AY+22).attr('text-anchor','start')).text('Low');
  axTxt(svg.append('text').attr('x',BX0+QW*2+GAP-6).attr('y',AY+22).attr('text-anchor','end')).text('High');

  // ── Build force nodes — targets within each box's data area ──
  var wMid = 7, wLo = 2, wHi = 14;
  var PAD_C = R + 22;  // clearance: R + label height (14px) + 8px buffer keeps labels inside boxes
  var topY1 = BY0 + HDR + PAD_C,           topY2 = BY0 + QH - PAD_C;
  var botY1 = BY0 + QH + GAP + PAD_C,      botY2 = BY0 + QH + GAP + QH - HDR - PAD_C;
  var lftX1 = BX0 + PAD_C,                 lftX2 = BX0 + QW - PAD_C;
  var rgtX1 = BX0 + QW + GAP + PAD_C,      rgtX2 = BX0 + QW + GAP + QW - PAD_C;

  // Size → X position within left or right column
  function pmTx(size, jx) {
    var p;
    switch(size){
      case 'XS': p=0.15; return lftX1 + p*(lftX2-lftX1) + jx;
      case 'S':  p=0.40; return lftX1 + p*(lftX2-lftX1) + jx;
      case 'M':  p=0.68; return lftX1 + p*(lftX2-lftX1) + jx;
      case 'L':  p=0.28; return rgtX1 + p*(rgtX2-rgtX1) + jx;
      case 'XL': p=0.65; return rgtX1 + p*(rgtX2-rgtX1) + jx;
      default:   return (lftX1+lftX2)/2;
    }
  }
  // WSJF → Y position within top or bottom row
  function pmTy(w, jy) {
    if ((w||0) >= wMid) {
      var t = ((w||wMid)-wMid) / (wHi-wMid);
      return topY2 - t*(topY2-topY1) + jy; // high WSJF → toward top
    } else {
      var t = ((w||wLo)-wLo) / (wMid-wLo);
      return botY2 - t*(botY2-botY1) + jy; // near-mid WSJF → toward top of bottom row
    }
  }

  var nodes = items.map(function(item) {
    var seed = 0;
    var id = item.id||item.num||'';
    for (var c=0; c<id.length; c++) seed += id.charCodeAt(c);
    var jx = ((seed*37+13)%100-50)/100 * 18;
    var jy = ((seed*53+ 7)%100-50)/100 * 14;
    var tx = pmTx(item.size, jx);
    var ty = pmTy(item.wsjf, jy);
    return {item:item, quad:EAP._pmQuad(item), tx:tx, ty:ty, x:tx, y:ty};
  });

  // ── D3 force simulation (synchronous) ──
  var sim = d3.forceSimulation(nodes)
    .force('x',       d3.forceX(function(d){return d.tx;}).strength(0.40))
    .force('y',       d3.forceY(function(d){return d.ty;}).strength(0.40))
    .force('collide', d3.forceCollide(R+22).strength(0.85).iterations(4))
    .stop();
  for (var t=0; t<200; t++) sim.tick();

  nodes.forEach(function(n) {
    var q = n.quad;
    var inR = (q==='bigbet'||q==='timesink');
    var inT = (q==='quickwin'||q==='bigbet');
    n.x = EAP._pmClamp(n.x, inR?rgtX1:lftX1, inR?rgtX2:lftX2);
    n.y = EAP._pmClamp(n.y, inT?topY1:botY1, inT?topY2:botY2);
  });

  // ── Draw nodes ──
  var nodeG = svg.selectAll('.pm-node').data(nodes).join('g')
    .attr('class','pm-node')
    .attr('transform',function(d){return 'translate('+d.x+','+d.y+')';})
    .style('cursor','default');

  nodeG.append('circle')
    .attr('r',R)
    .attr('fill',         function(d){return Q[d.quad].fill;})
    .attr('fill-opacity', 0.85)
    .attr('stroke',       function(d){return Q[d.quad].fill;})
    .attr('stroke-width', 1.5).attr('stroke-opacity',0.96);

  // WSJF — large, white, centered
  nodeG.append('text')
    .attr('text-anchor','middle').attr('dominant-baseline','central')
    .attr('dy','-0.08em')
    .attr('font-family',FONT).attr('font-size','14').attr('font-weight','700')
    .attr('fill','#fff')
    .text(function(d){return d.item.wsjf!=null ? d.item.wsjf : '—';});

  // Name label — below circle, on background
  nodeG.append('text')
    .attr('text-anchor','middle').attr('y', R+14)
    .attr('font-family',FONT).attr('font-size','10').attr('font-weight','500')
    .attr('fill','#374151')
    .text(function(d){
      var n = d.item.name;
      return n.length>15 ? n.slice(0,14)+'…' : n;
    });

  // Risk dot — top-right (blocked=red, atRisk=amber)
  nodeG.filter(function(d){return d.item.blocked||d.item.atRisk;})
    .append('circle').attr('cx',R-1).attr('cy',-(R-1)).attr('r',5.5)
    .attr('fill',function(d){return d.item.blocked?'#dc2626':'#d97706';})
    .attr('stroke','#fff').attr('stroke-width',1.5);

  // Unscheduled ring — top-left, dashed, for high-WSJF items with no PI
  nodeG.filter(function(d){return !d.item.pi && (d.item.wsjf||0)>=9;})
    .append('circle').attr('cx',-(R-1)).attr('cy',-(R-1)).attr('r',5)
    .attr('fill','none').attr('stroke','rgba(255,255,255,0.90)')
    .attr('stroke-width',2).attr('stroke-dasharray','2.5,1.8');

  // ── Hover ──
  var tip = d3.select('body').select('#pm-tip');
  if (tip.empty()) tip = d3.select('body').append('div').attr('id','pm-tip');

  nodeG
    .on('mouseenter', function(event,d) {
      d3.select(this).select('circle')
        .style('filter','drop-shadow(0 3px 14px rgba(0,0,0,0.32))')
        .transition().duration(100).attr('r',R+4).attr('fill-opacity',1);
      svg.selectAll('.pm-node').filter(function(n){return n!==d;})
        .transition().duration(100).attr('opacity',0.38);
      tip.style('display','block').html(EAP._pmTipHTML(d.item,d.quad));
      EAP._pmPosTip(event);
    })
    .on('mousemove',  function(event){ EAP._pmPosTip(event); })
    .on('mouseleave', function(event,d) {
      d3.select(this).select('circle')
        .style('filter',null)
        .transition().duration(100).attr('r',R).attr('fill-opacity',0.85);
      // Restore to current filter state
      var af = (document.querySelector('[data-pmf].active')||{}).dataset;
      var f  = af ? af.pmf : 'all';
      svg.selectAll('.pm-node').each(function(nd) {
        var show = f==='all'||(f==='unscheduled'&&!nd.item.pi)||nd.quad===f;
        d3.select(this).transition().duration(100).attr('opacity', show?1:0.10);
      });
      tip.style('display','none');
    });

  // ── Quadrant filter buttons (inside AI card) ──
  var overlay = document.getElementById('pm-overlay');
  if (overlay) {
    overlay.querySelectorAll('[data-pmf]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var f = btn.dataset.pmf;
        overlay.querySelectorAll('[data-pmf]').forEach(function(b){
          b.classList.toggle('active', b.dataset.pmf===f);
        });
        svg.selectAll('.pm-node').each(function(nd) {
          var show = f==='all'||(f==='unscheduled'&&!nd.item.pi)||nd.quad===f;
          d3.select(this).transition().duration(180).attr('opacity', show?1:0.10);
        });
      });
    });
  }
};

// ── Open ───────────────────────────────────────────────
EAP.openPriorityMap = function() {
  if (document.getElementById('pm-overlay')) return;
  EAP._pmInjectStyles();

  var items = EAP._pmItems();
  if (!items.length) return;

  var el = document.createElement('div');
  el.id = 'pm-overlay';
  el.innerHTML = EAP._pmShell(items);
  document.body.appendChild(el);

  el.addEventListener('click', function(e){ if(e.target===el) EAP.closePriorityMap(); });
  EAP._pmKeyHandler = function(e){ if(e.key==='Escape') EAP.closePriorityMap(); };
  document.addEventListener('keydown', EAP._pmKeyHandler);

  // ── Wire header filter controls ──
  // Owner filter button — opens existing popover, repositioned to this button
  var filterBtn = el.querySelector('#pm-filter-btn');
  if (filterBtn) {
    filterBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      // Patch close to also refresh the map
      var orig = EAP.closeFilterPopover;
      EAP.closeFilterPopover = function() {
        orig && orig.apply(this, arguments);
        EAP._pmRefresh();
        EAP.closeFilterPopover = orig;
      };
      EAP.openFilterPopover();
      // Reposition popover to this button (openFilterPopover targets #filter-btn in main fbar)
      if (EAP._fpop) {
        var r = filterBtn.getBoundingClientRect();
        EAP._fpop.style.top  = (r.bottom + 6) + 'px';
        EAP._fpop.style.left = r.left + 'px';
      }
    });
  }
  // Owner pill clear
  el.addEventListener('click', function(e) {
    if (e.target.closest && e.target.closest('#pm-owner-clear')) {
      EAP.clearOwnerFilter && EAP.clearOwnerFilter(false);
      EAP._pmRefresh();
    }
  });

  requestAnimationFrame(function() {
    requestAnimationFrame(function() { el.classList.add('pm-on'); });
  });
  setTimeout(function() { EAP._pmDraw(items); }, 70);
};

// ── Close ──────────────────────────────────────────────
EAP.closePriorityMap = function() {
  var el = document.getElementById('pm-overlay');
  if (!el) return;
  if (EAP._pmKeyHandler) document.removeEventListener('keydown', EAP._pmKeyHandler);
  var tip = document.getElementById('pm-tip');
  if (tip) tip.style.display = 'none';
  el.classList.remove('pm-on');
  setTimeout(function() { if(el.parentNode) el.parentNode.removeChild(el); }, 240);
};

// ── Styles ─────────────────────────────────────────────
EAP._pmInjectStyles = function() {
  var ex = document.getElementById('pm-styles');
  if (ex) ex.parentNode.removeChild(ex);
  var s = document.createElement('style');
  s.id = 'pm-styles';
  s.textContent = [

    /* Scrim */
    '#pm-overlay{position:fixed;inset:0;z-index:9000;',
      'background:rgba(6,14,22,0.54);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);',
      'display:flex;align-items:center;justify-content:center;',
      'opacity:0;transition:opacity 220ms ease;}',
    '#pm-overlay.pm-on{opacity:1;}',

    /* Panel */
    '.pm-panel{width:92vw;height:90vh;background:rgba(255,255,255,0.96);',
      'backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-radius:16px;',
      'box-shadow:0 28px 72px rgba(0,0,0,0.20),0 2px 8px rgba(0,0,0,0.08),inset 0 1px 0 rgba(255,255,255,0.98);',
      'display:flex;flex-direction:column;overflow:hidden;',
      'transform:translateY(16px);transition:transform 220ms cubic-bezier(0.25,0.46,0.45,0.94);}',
    '#pm-overlay.pm-on .pm-panel{transform:translateY(0);}',

    /* Header */
    '.pm-hd{display:flex;align-items:center;gap:8px;',
      'padding:14px 20px 12px;border-bottom:1px solid rgba(0,0,0,0.07);flex-shrink:0;}',
    '.pm-hd-l{display:flex;align-items:baseline;gap:10px;flex:1;min-width:0;}',
    '.pm-title{font-size:14px;font-weight:600;color:#111827;flex-shrink:0;}',
    '.pm-sub{font-size:11px;color:#374151;font-weight:400;white-space:nowrap;}',
    '.pm-hd-filters{display:flex;align-items:center;gap:5px;flex-shrink:0;}',
    '.pm-hd-sep{width:1px;height:18px;background:rgba(0,0,0,0.09);margin:0 4px;flex-shrink:0;}',
    '.pm-close{width:28px;height:28px;border:none;background:none;cursor:pointer;',
      'color:#9CA3AF;border-radius:6px;display:flex;align-items:center;justify-content:center;',
      'transition:color 120ms ease,background 120ms ease;flex-shrink:0;}',
    '.pm-close:hover{color:#374151;background:rgba(0,0,0,0.05);}',

    /* Body + layout */
    '.pm-body{flex:1;display:flex;min-height:0;padding:0;}',
    '.pm-cw{flex:1;min-width:0;min-height:0;position:relative;}',
    '#pm-canvas{position:absolute;inset:0;}',
    '#pm-canvas svg{display:block;}',

    /* Right panel — uses existing ins-sig / ins-sec-lbl classes from app.css */
    '.pm-rpanel{width:292px;flex-shrink:0;border-left:1px solid rgba(0,0,0,0.07);',
      'overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:0;',
      'scrollbar-width:thin;scrollbar-color:rgba(0,0,0,0.10) transparent;}',
    '.pm-rpanel .ins-sig-group{margin-bottom:0;}',

    /* Tooltip */
    '#pm-tip{position:fixed;z-index:9100;display:none;',
      'background:#fff;border:1px solid rgba(0,0,0,0.09);border-radius:10px;',
      'box-shadow:0 12px 32px rgba(0,0,0,0.14),0 2px 6px rgba(0,0,0,0.07);',
      'padding:12px 14px;pointer-events:none;min-width:230px;max-width:286px;',
      'font-family:"ServiceNow Sans",system-ui,sans-serif;}',
    '.pm-tip-name{font-size:12px;font-weight:600;color:#111827;margin-bottom:3px;line-height:1.3;}',
    '.pm-tip-meta{font-size:10px;color:#9CA3AF;margin-bottom:8px;line-height:1.4;}',
    '.pm-tip-row{display:flex;align-items:center;gap:5px;flex-wrap:wrap;}',
    '.pm-tip-tag{font-size:10px;color:#374151;background:rgba(0,0,0,0.05);padding:2px 7px;border-radius:4px;}',
    '.pm-tip-wsjf{color:#0e4e69!important;background:rgba(14,78,105,0.09)!important;font-weight:600!important;}',
    '.pm-tip-quad{font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;}',
    '.pm-tip-insight{margin-top:8px;padding-top:8px;border-top:1px solid rgba(0,0,0,0.07);',
      'font-size:11px;color:#374151;line-height:1.5;}'

  ].join('');
  document.head.appendChild(s);
};
