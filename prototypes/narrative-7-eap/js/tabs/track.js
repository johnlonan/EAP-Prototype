/* ═══════════════════════════════════════════════════════
   TRACK.JS — Track tab renderer (9-column workflow board)
   Works at ART or Team context, WorkItem level only.
   When entered from other contexts, auto-selects the
   persona's ART or Team.
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

// Column body style (shared constant)
var TCB = EAP._colBodyStyle;

// ── Traceability ring — four-segment SVG arc ─────────────
// Segments clockwise from 12 o'clock: PR merged · Tests · DoD · Deploy
// Each 80° arc with 10° gap. r=5.5, centre (8,8).
// Colours: green = complete/passing, amber = partial/gate-pending, dim = not started.
// size param scales the rendered SVG; viewBox stays 0 0 16 16.
function traceRing(item, size) {
  size = size || 16;
  var GRN = '#16A34A', AMB = '#D97706', DIM = '#CCCBC8';

  // PR segment: green = merged, amber = open/in-review, dim = no PR
  var codeColor = item.pr
    ? (item.pr.status === 'merged' ? GRN : AMB)
    : DIM;

  // Tests segment: green = all passing, amber = some failing, dim = no test data
  var testsColor = item.tests
    ? (item.tests.failed === 0 ? GRN : AMB)
    : DIM;

  // DoD segment: green = all done, amber = partially done, dim = no DoD
  var dodColor = item.dod
    ? (item.dod.every(function(d) { return d.done; }) ? GRN
       : item.dod.some(function(d) { return d.done; }) ? AMB : DIM)
    : DIM;

  // Deploy segment: green = production deployed, amber = gate-pending or staging, dim = none
  var deployColor = item.env
    ? (item.env.status === 'deployed' && item.env.target === 'production' ? GRN
       : item.env.status === 'gate-pending' ? AMB
       : item.env.status === 'deployed' ? AMB  // staging = amber (progress, not complete)
       : DIM)
    : DIM;

  if (!item.pr && !item.dod && !item.tests && !item.env) return '';

  var arcs = [
    { d:'M 8,2.5 A 5.5,5.5 0 0 1 13.42,7.04',  color:codeColor },
    { d:'M 13.5,8 A 5.5,5.5 0 0 1 8.96,13.42', color:testsColor },
    { d:'M 8,13.5 A 5.5,5.5 0 0 1 2.58,8.96',  color:dodColor },
    { d:'M 2.5,8 A 5.5,5.5 0 0 1 7.04,2.58',   color:deployColor }
  ];

  // Encode test counts, DoD progress, and deploy state for the popover
  var testStr = item.tests ? (item.tests.passed + '/' + item.tests.total) : 'none';
  var envStr  = item.env   ? (item.env.target + ':' + item.env.status) : 'none';
  var dodStr  = item.dod
    ? (item.dod.every(function(d) { return d.done; }) ? 'complete'
       : (item.dod.filter(function(d) { return d.done; }).length + '/' + item.dod.length))
    : 'none';

  // Completion glow — all 4 segments green earns the drop-shadow
  var isComplete = codeColor === GRN && testsColor === GRN && dodColor === GRN && deployColor === GRN;

  var svg = '<svg class="bcard-trace-ring' + (isComplete ? ' bcard-trace-ring--complete' : '') + '" width="' + size + '" height="' + size + '" viewBox="0 0 16 16"' +
    ' data-code="' + codeColor + '" data-tests="' + testsColor + '" data-dod="' + dodColor + '" data-deploy="' + deployColor + '"' +
    ' data-test-str="' + testStr + '" data-env-str="' + envStr + '" data-dod-str="' + dodStr + '"' +
    ' data-pr-status="' + (item.pr ? item.pr.status : '') + '">';
  arcs.forEach(function(a) {
    svg += '<path d="' + a.d + '" fill="none" stroke="' + a.color + '" stroke-width="2" stroke-linecap="round"/>';
  });
  return svg + '</svg>';
}

// ── Trace ring rich popover — event-delegated, works on cards + detail panel ──
EAP.initTracePopovers = function() {
  if (document.getElementById('trace-pop')) return; // already initialised
  var pop = document.createElement('div');
  pop.id = 'trace-pop';
  document.body.appendChild(pop);

  var ARCS = [
    { d:'M 8,2.5 A 5.5,5.5 0 0 1 13.42,7.04' },
    { d:'M 13.5,8 A 5.5,5.5 0 0 1 8.96,13.42' },
    { d:'M 8,13.5 A 5.5,5.5 0 0 1 2.58,8.96' },
    { d:'M 2.5,8 A 5.5,5.5 0 0 1 7.04,2.58' }
  ];
  var GRN = '#16A34A', AMB = '#D97706', DIM = '#CCCBC8';

  document.addEventListener('mouseover', function(e) {
    var ring = e.target.closest ? e.target.closest('.bcard-trace-ring') : null;
    if (!ring) return;

    var colors = [
      ring.getAttribute('data-code'),
      ring.getAttribute('data-tests'),
      ring.getAttribute('data-dod'),
      ring.getAttribute('data-deploy')
    ];
    var prStatus  = ring.getAttribute('data-pr-status') || '';
    var testStr   = ring.getAttribute('data-test-str')  || 'none';
    var envStr    = ring.getAttribute('data-env-str')   || 'none';
    var dodStr    = ring.getAttribute('data-dod-str')   || 'none';

    // Build popover labels with live data
    var prLbl  = prStatus === 'merged'    ? 'PR merged'
               : prStatus === 'open'      ? 'PR open · awaiting review'
               : prStatus === 'draft'     ? 'Draft PR · not yet ready for review'
               : prStatus === 'in-review' ? 'PR in review'
               : 'No pull request';
    var tstLbl = testStr === 'none' ? 'No test results'
               : (function() {
                   var p = testStr.split('/');
                   var pass = parseInt(p[0], 10), total = parseInt(p[1], 10);
                   var fail = total - pass;
                   return fail > 0 ? pass + ' passed · ' + fail + ' failed · Jenkins' : pass + '/' + total + ' passed · Jenkins';
                 })();
    var dodLbl = dodStr === 'none'     ? 'No DoD defined'
               : dodStr === 'complete' ? 'DoD complete'
               : 'DoD ' + dodStr + ' items checked';
    var envLbl = envStr === 'none' ? 'Not deployed'
               : (function() {
                   var p = envStr.split(':');
                   var target = p[0], status = p[1];
                   if (status === 'gate-pending') return 'At production gate · approval required';
                   if (target === 'production' && status === 'deployed') return 'Deployed to production';
                   if (target === 'staging' && status === 'deployed') return 'Deployed to staging';
                   return target + ' · ' + status;
                 })();

    var SEGS = [
      { lbl: prLbl,  color: colors[0] },
      { lbl: tstLbl, color: colors[1] },
      { lbl: dodLbl, color: colors[2] },
      { lbl: envLbl, color: colors[3] }
    ];

    // Popover mini-ring: arcs draw themselves in clockwise, staggered 55ms apart.
    // stroke-dasharray:8 approximates each 80° arc's length at r=5.5.
    var svgStr = '<svg width="52" height="52" viewBox="0 0 16 16" style="display:block;flex-shrink:0;">';
    ARCS.forEach(function(a, i) {
      svgStr += '<path d="' + a.d + '" fill="none" stroke="' + colors[i] + '" stroke-width="2" stroke-linecap="round"' +
        ' style="stroke-dasharray:8;stroke-dashoffset:8;animation:arc-draw 0.3s cubic-bezier(0.16,1,0.3,1) ' + (i * 55) + 'ms forwards;"/>';
    });
    svgStr += '</svg>';

    var segsHtml = SEGS.map(function(seg) {
      var isGrn = seg.color === GRN, isAmb = seg.color === AMB;
      var icon = isGrn ? '✓' : isAmb ? '◐' : '○';
      return '<div class="trace-pop-seg">' +
        '<span class="trace-pop-seg-icon" style="color:' + seg.color + ';">' + icon + '</span>' +
        '<span class="trace-pop-seg-lbl" style="color:' + (isGrn || isAmb ? 'var(--text-primary)' : 'var(--text-tertiary)') + ';">' + seg.lbl + '</span>' +
      '</div>';
    }).join('');

    pop.innerHTML =
      '<div class="trace-pop-hd">Delivery readiness</div>' +
      '<div class="trace-pop-body">' + svgStr + '<div class="trace-pop-segs">' + segsHtml + '</div></div>';
    var r = ring.getBoundingClientRect();
    var left = r.right + 10;
    if (left + 240 > window.innerWidth) left = r.left - 244;
    pop.style.left = Math.max(8, left) + 'px';
    pop.style.top = Math.min(r.top - 8, window.innerHeight - 200) + 'px';
    pop.classList.add('trace-pop-visible');
  });

  document.addEventListener('mouseout', function(e) {
    var ring = e.target.closest ? e.target.closest('.bcard-trace-ring') : null;
    if (ring) pop.classList.remove('trace-pop-visible');
  });
};

// ── Track card renderer (own copy — independent of Board) ──
function trackCard(item, opts) {
  opts = opts || {};
  var isBlocked = item.blocked || item.state === 'Blocked';
  var isAtRisk = item.atRisk && !isBlocked;
  var isDone = item.state === 'Done' || item.state === 'Complete';
  var cls = 'bcard' + (isBlocked ? ' bcard-blocked' : '') + (isAtRisk ? ' bcard-atrisk' : '') + (isDone ? ' bcard-done' : '');

  var h = '<div class="' + cls + '"' + (item.id ? ' id="tcard-' + item.id + '"' : '') + '>';

  // Blocked/at-risk banners
  if (isBlocked) {
    h += '<div class="bcard-banner bcard-banner-red">' + EAP.icon('info', 12) + (item.blockReason || 'Blocked') + '</div>';
  } else if (isAtRisk) {
    h += '<div class="bcard-banner bcard-banner-amber">' + (item.openDefects ? item.openDefects + ' open defects' : 'At risk') + '</div>';
  }

  // Type pill + carry-over tag (WorkItem cards)
  var t = item.type;
  var isWI = EAP.isWorkItemType(t);
  if (isWI) {
    var carryTag = item.carriedOver ? '<span class="bcard-carry-tag">Carried over</span>' : '';
    h += '<div class="bcard-tags">' + EAP.typeCell(t) + carryTag + '</div>';
  }

  // Title
  h += '<div class="bcard-title">' + item.name + '</div>';

  // Parent feature caption (WorkItem only)
  if (isWI && item.parent) {
    h += '<div class="bcard-parent" title="Parent feature">' + EAP.icon('chevron-up', 10) + ' ' + item.parent + '</div>';
  }

  // Meta row — state + pts together, then team
  h += '<div class="bcard-meta">';
  h += EAP.subtlePill(item.state);
  if (item.pts) h += '<span class="bcard-pts">' + item.pts + 'pt</span>';
  if (opts.showTeam && item.team) h += '<span class="bcard-owner">' + item.team + '</span>';
  h += '</div>';

  // PR state — CI dot + branch + status pill (only when PR data present and item is not blocked)
  if (item.pr && !isBlocked) {
    var _prCls = {'draft':'bcard-pr-draft','open':'bcard-pr-open','in-review':'bcard-pr-in-review','merged':'bcard-pr-merged'};
    var _prLbl = {'draft':'Draft','open':'Open','in-review':'In Review','merged':'Merged'};
    var _ciTips = { passing:'CI passing', failing:'CI failing — build broken', running:'CI running — pipeline in progress' };
    var _ciDot = item.ci ? '<span class="bcard-pr-ci bcard-ci-' + item.ci.status + '" data-tip="' + (_ciTips[item.ci.status] || 'Build status') + '"></span>' : '';
    h += '<div class="bcard-pr">' +
      _ciDot +
      '<span class="bcard-pr-branch">' + item.pr.branch + '</span>' +
      '<span class="bcard-pr-pill ' + (_prCls[item.pr.status] || 'bcard-pr-open') + '">' + (_prLbl[item.pr.status] || 'Open') + '</span>' +
    '</div>';
  }

  // Progress bar — stays in content area
  if (item.pct > 0 && !isDone) {
    h += '<div class="bcard-progress">' + EAP.pbar(item.pct, item.state) + '</div>';
  }

  // Quality row — traceability ring left, DoD micro-label right
  var _ring = traceRing(item);
  var _dodLabel = '';
  if (item.dod) {
    var _dodDone = item.dod.filter(function(d) { return d.done; }).length;
    if (_dodDone < item.dod.length) _dodLabel = '<span class="bcard-dod-label">DoD ' + _dodDone + '/' + item.dod.length + '</span>';
  }
  if (_ring || _dodLabel) {
    h += '<div class="bcard-quality">' + _ring + _dodLabel + '</div>';
  }

  // Footer — avatar left; dep icon + separator (only if has dependency) + chevron right
  var ownerKey = item.owner || (opts.ownerField ? item[opts.ownerField] : null);
  var hasDep = EAP.hasDependency(item.id);
  if (ownerKey) {
    h += '<div class="bcard-footer">';
    h += EAP.avatar(ownerKey, 20);
    h += '<div class="bcard-footer-right">';
    if (hasDep) {
      h += '<span class="bcard-footer-dep" title="Has dependencies">' + EAP.icon('git-merge', 12) + '</span>';
      h += '<span class="bcard-footer-sep"></span>';
    }
    h += '<span class="bcard-footer-chev">' + EAP.icon('chevron-down', 12) + '</span>';
    h += '</div>';
    h += '</div>';
  }

  h += '</div>';
  return h;
}

// ── Quality badge helper ──────────────────────────────
function qualityBadge(q) {
  var map = {
    'Excellent': { color: '#16A34A', bg: 'rgba(22,163,74,0.08)' },
    'Good':      { color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
    'Average':   { color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
    'Poor':      { color: '#DC2626', bg: 'rgba(220,38,38,0.08)' }
  };
  var s = map[q] || map['Average'];
  return '<span style="font-size:11px;font-weight:500;color:' + s.color + ';background:' + s.bg + ';padding:2px 7px;border-radius:10px;">' + q + '</span>';
}

// ── Workload enrichment: WIP, type mix from live data; defects + blocked from teamHealth for ART ──
// ART context uses EAP.teamHealth as the single source of truth — same data the Insights panel reads.
// Team (member) context derives everything from live sprint items.
var _HEALTH_KEY = {
  'Auth Team':'Auth', 'Payments Team':'Payments', 'Fraud Team':'Fraud',
  'Mobile Exp Team':'Mobile', 'Accounts Team':'Accounts', 'Onboarding Team':'Onboard'
};
function buildWorkloadEnrichment(rows, isTeamCtx) {
  var lookup = {};
  rows.forEach(function(r) {
    lookup[r.member] = { wip: 0, blocked: 0, story: 0, defect: 0, task: 0, blockedItems: [] };
  });
  var allItems = [];
  EAP.workItems.sprints.forEach(function(sp) { allItems = allItems.concat(sp.items || []); });
  allItems = allItems.concat(EAP.getBacklogFlat ? EAP.getBacklogFlat() : []);
  allItems.forEach(function(item) {
    var key = isTeamCtx ? item.owner : item.team;
    if (!key || !lookup[key]) return;
    var e = lookup[key];
    var st = item.state || '';
    if (st === 'In Progress' || st === 'In Review') e.wip++;
    if (item.blocked || st === 'Blocked') {
      e.blocked++;
      e.blockedItems.push(item.name || item.num || '');
    }
    var t = (item.type || '').toLowerCase();
    if (t === 'story') e.story++;
    else if (t === 'defect') e.defect++;
    else e.task++;
  });
  // ART context: override defect + blocked counts from teamHealth so both panels agree
  if (!isTeamCtx && EAP.teamHealth) {
    rows.forEach(function(r) {
      var hKey = _HEALTH_KEY[r.member];
      var th = hKey && EAP.teamHealth[hKey];
      if (!th || !lookup[r.member]) return;
      lookup[r.member].defect  = th.qualV  || 0;
      lookup[r.member].blocked = th.blockV || 0;
      // Rebuild blockedItems from live sprint stories for hover tooltip
      lookup[r.member].blockedItems = [];
      allItems.forEach(function(item) {
        if (item.team !== r.member) return;
        if ((item.blocked || item.state === 'Blocked') && item.type === 'Story') {
          lookup[r.member].blockedItems.push(item.name || item.num || '');
        }
      });
    });
  }
  return lookup;
}

// ── Flow health: sprint capacity breakdown per team — active sprint only ──
// Each team bar = total sprint capacity. Segments: Flowing | Not Started | At Risk | Free.
// Capacity derived from teamCapacity.sp2 utilization %: committed / (capPct/100).
function buildFlowHealth(rows, isTeamCtx) {
  var result = {};
  rows.forEach(function(r) {
    result[r.member] = { flowing: 0, atRisk: 0, notStarted: 0, total: 0, capacity: 0, free: 0 };
  });
  var activeItems = [];
  EAP.workItems.sprints.forEach(function(sp) {
    if (sp.active) activeItems = activeItems.concat(sp.items || []);
  });
  activeItems.forEach(function(item) {
    var key = isTeamCtx ? item.owner : item.team;
    if (!key || !result[key]) return;
    var pts = item.pts || 0;
    var e = result[key];
    e.total += pts;
    if (item.blocked || item.state === 'Blocked') {
      e.atRisk += pts;
    } else {
      var st = item.state || '';
      if (st === 'In Progress' || st === 'In Review' || st === 'Done' || st === 'Complete') {
        e.flowing += pts;
      } else {
        e.notStarted += pts;
      }
    }
  });
  // Derive sprint capacity in pts from utilization %; free = capacity − committed
  rows.forEach(function(r) {
    var e = result[r.member];
    var capPct = ((EAP.teamCapacity || {})[r.member] || {}).sp2 || 100;
    e.capacity = capPct > 0 ? Math.round(e.total / (capPct / 100)) : e.total;
    e.free = Math.max(0, e.capacity - e.total);
  });
  return result;
}

function flowHealthPanel(rows, isTeamCtx, flowData, sprintLabel) {
  var h = '<div class="tteam-chart">' +
    '<div class="tteam-chart-title">' + sprintLabel + ' · Sprint flow</div>' +
    '<div class="tteam-chart-subtitle">Sprint capacity · committed vs free</div>' +
    '<div class="tteam-bars">';

  rows.forEach(function(r) {
    var d = flowData[r.member] || { flowing: 0, atRisk: 0, notStarted: 0, total: 0, capacity: 1, free: 0 };
    var cap = d.capacity || 1;
    var label = isTeamCtx ? r.member : r.member.replace(' Team', '');

    // All segments as % of total sprint capacity — bar is always 100% wide
    var flowPct = Math.round((d.flowing    / cap) * 100);
    var notPct  = Math.round((d.notStarted / cap) * 100);
    var riskPct = Math.round((d.atRisk     / cap) * 100);
    var freePct = Math.max(0, 100 - flowPct - notPct - riskPct);

    var tips = [];
    if (d.flowing    > 0) tips.push(d.flowing    + 'pt flowing');
    if (d.notStarted > 0) tips.push(d.notStarted + 'pt not started');
    if (d.atRisk     > 0) tips.push(d.atRisk     + 'pt at risk');
    if (d.free       > 0) tips.push(d.free       + 'pt free');
    tips.push(cap + 'pt capacity');

    h += '<div class="tteam-bar-row">' +
      '<span class="tteam-bar-label">' + label + '</span>' +
      '<div class="tteam-bar-track-wrap">' +
        '<div class="tteam-fh-track">' +
          '<div class="tteam-fh-bar" style="width:100%" title="' + tips.join(' · ') + '">' +
            (flowPct > 0 ? '<div class="tteam-sdist-seg" style="width:' + flowPct + '%;background:rgba(22,163,74,0.75)"></div>' : '') +
            (notPct  > 0 ? '<div class="tteam-sdist-seg" style="width:' + notPct  + '%;background:rgba(99,102,241,0.45)"></div>' : '') +
            (riskPct > 0 ? '<div class="tteam-sdist-seg" style="width:' + riskPct + '%;background:rgba(220,38,38,0.80)"></div>' : '') +
            (freePct > 0 ? '<div class="tteam-sdist-seg" style="width:' + freePct + '%;background:rgba(0,0,0,0.08)"></div>' : '') +
          '</div>' +
        '</div>' +
      '</div>' +
      '<span class="tteam-bar-val">' + d.total + '<span style="color:#BBBBB7">/' + cap + '</span><span style="font-size:10px;color:#BBBBB7;margin-left:1px">pt</span></span>' +
    '</div>';
  });

  h += '</div><div class="tteam-chart-legend">' +
    '<span class="tteam-lgd-item"><span class="tteam-lgd-swatch" style="background:rgba(22,163,74,0.75)"></span>Flowing</span>' +
    '<span class="tteam-lgd-item"><span class="tteam-lgd-swatch" style="background:rgba(99,102,241,0.45)"></span>Not started</span>' +
    '<span class="tteam-lgd-item"><span class="tteam-lgd-swatch" style="background:rgba(220,38,38,0.80)"></span>At risk</span>' +
    '<span class="tteam-lgd-item"><span class="tteam-lgd-swatch" style="background:rgba(0,0,0,0.12)"></span>Free</span>' +
  '</div></div>';
  return h;
}

// ── State distribution: count items in each workflow state per team/member ──
// Uses all sprint items (PI horizon) so member-level bars have enough items to be meaningful.
function buildStateDistribution(rows, isTeamCtx) {
  var result = {};
  rows.forEach(function(r) {
    result[r.member] = { todo: 0, inprog: 0, review: 0, done: 0, blocked: 0, total: 0 };
  });
  var allItems = [];
  EAP.workItems.sprints.forEach(function(sp) { allItems = allItems.concat(sp.items || []); });
  allItems.forEach(function(item) {
    var key = isTeamCtx ? item.owner : item.team;
    if (!key || !result[key]) return;
    var e = result[key];
    e.total++;
    if (item.blocked || item.state === 'Blocked') {
      e.blocked++;
    } else {
      var st = item.state || '';
      if (st === 'Done' || st === 'Complete' || st === 'Accepted') e.done++;
      else if (st === 'In Review') e.review++;
      else if (st === 'In Progress') e.inprog++;
      else e.todo++; // Draft, Planned, To Do
    }
  });
  return result;
}

// ── Priority map: count H/M/L per team or member from active sprint ──
function buildPriorityMap(rows, isTeamCtx) {
  var result = {};
  rows.forEach(function(r) { result[r.member] = { H: 0, M: 0, L: 0 }; });
  var activeItems = [];
  EAP.workItems.sprints.forEach(function(sp) {
    if (sp.active) activeItems = activeItems.concat(sp.items || []);
  });
  var pmap = EAP.itemPriority || {};
  activeItems.forEach(function(item) {
    var key = isTeamCtx ? item.owner : item.team;
    var pri = pmap[item.id];
    if (!key || !result[key] || !pri) return;
    result[key][pri]++;
  });
  return result;
}

// ── Sprint pts: done / committed from the active sprint per team or member ──
function getSprintPts(isTeamCtx, teamFilter) {
  var result = {};
  var sp2 = null;
  for (var i = 0; i < EAP.workItems.sprints.length; i++) {
    if (EAP.workItems.sprints[i].active) { sp2 = EAP.workItems.sprints[i]; break; }
  }
  if (!sp2) return result;
  (sp2.items || []).forEach(function(item) {
    var key = isTeamCtx ? item.owner : item.team;
    if (!key) return;
    if (teamFilter && item.team !== teamFilter) return;
    if (!result[key]) result[key] = { committed: 0, done: 0 };
    var pts = item.pts || 0;
    result[key].committed += pts;
    result[key].done += Math.round((item.pct || 0) * pts / 100);
  });
  return result;
}

// ── Capacity % per row ────────────────────────────────
// Team context: role-based hour cap (Dev=120h, QA=80h, UX=100h) vs utilHrs.
// ART context: pull Sprint 2 % directly from teamCapacity data.
function rowCapPct(r, isTeamCtx) {
  if (!isTeamCtx) {
    return ((EAP.teamCapacity || {})[r.member] || {}).sp2 || 0;
  }
  var role = (r.role || '').toLowerCase();
  var cap = role.indexOf('qa') !== -1 ? 80 : role.indexOf('ux') !== -1 ? 100 : 120;
  return Math.round((r.utilHrs / cap) * 100);
}

function capBarCell(pct) {
  var color = pct > 100 ? '#DC2626' : pct > 85 ? '#D97706' : '#16A34A';
  var barW = Math.min(pct, 100);
  var tip = pct > 100 ? 'Capacity utilization over 100% — workload exceeds allocation' : pct > 85 ? 'Approaching full utilization' : 'Utilization within healthy range';
  return '<div class="tteam-cap-wrap" title="' + tip + '">' +
    '<div class="tteam-cap-bar"><div class="tteam-cap-fill" style="width:' + barW + '%;background:' + color + '"></div></div>' +
    '<span class="tteam-cap-pct" style="color:' + color + '">' + pct + '%</span>' +
  '</div>';
}

function typeMixCell(e) {
  var parts = [];
  if (e.story > 0)  parts.push('<span class="tteam-type-st">' + e.story + '&thinsp;' + (e.story === 1 ? 'story' : 'stories') + '</span>');
  if (e.defect > 0) parts.push('<span class="tteam-type-bg">' + e.defect + '&thinsp;' + (e.defect === 1 ? 'defect' : 'defects') + '</span>');
  if (e.task > 0)   parts.push('<span class="tteam-type-tk">' + e.task + '&thinsp;' + (e.task === 1 ? 'task' : 'tasks') + '</span>');
  if (!parts.length) return '<span style="color:#BBBBB7;font-size:11px">—</span>';
  return '<div class="tteam-type-mix">' + parts.join('<span class="tteam-type-dot">·</span>') + '</div>';
}

function signalsCell(e) {
  if (e.wip === 0 && e.blocked === 0) return '<span style="color:#BBBBB7;font-size:11px">—</span>';
  var h = '<div class="tteam-signals">';
  if (e.wip > 0) h += '<span class="tteam-wip-count">' + e.wip + ' active</span>';
  if (e.blocked > 0) {
    var tipText = (e.blockedItems || []).length
      ? e.blockedItems.slice(0, 3).join(' · ') + (e.blockedItems.length > 3 ? ' …' : '')
      : e.blocked + ' item' + (e.blocked > 1 ? 's' : '') + ' blocked';
    var names = (e.blockedItems || []).join('||');
    h += '<span class="tteam-blocked-badge" data-blocked-names="' + names + '">' + e.blocked + ' blocked</span>';
  }
  return h + '</div>';
}

function sprintPtsCell(p) {
  if (!p || p.committed === 0) return '<span style="color:#BBBBB7;font-size:11px">—</span>';
  var pct = Math.round(p.done / p.committed * 100);
  var color = pct >= 70 ? '#383733' : pct >= 40 ? '#D97706' : '#DC2626';
  return '<div class="tteam-spts-wrap" title="' + pct + '% of sprint commitment done">' +
    '<div class="tteam-spts-bar"><div class="tteam-spts-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
    '<span class="tteam-spts-lbl">' + p.done + '<span class="tteam-spts-denom"> / ' + p.committed + ' pts</span></span>' +
  '</div>';
}

// ── State distribution stacked bar chart panel ───────
var SD_STATES = [
  { key:'todo',    label:'To Do',       color:'rgba(99,102,241,0.45)' },
  { key:'inprog',  label:'In Progress', color:'rgba(37,99,235,0.70)' },
  { key:'review',  label:'In Review',   color:'rgba(217,119,6,0.70)' },
  { key:'done',    label:'Done',        color:'rgba(22,163,74,0.70)' },
  { key:'blocked', label:'Blocked',     color:'rgba(220,38,38,0.85)' }
];
function stateDistributionPanel(rows, isTeamCtx, stateDist) {
  var h = '<div class="tteam-chart">' +
    '<div class="tteam-chart-title">Workload by state</div>' +
    '<div class="tteam-chart-subtitle">All sprint items this PI</div>' +
    '<div class="tteam-bars">';
  rows.forEach(function(r) {
    var d = stateDist[r.member] || { todo:0, inprog:0, review:0, done:0, blocked:0, total:0 };
    var total = d.total || 1;
    var label = isTeamCtx ? r.member : r.member.replace(' Team', '');
    var tipParts = [];
    SD_STATES.forEach(function(s) { if (d[s.key] > 0) tipParts.push(d[s.key] + ' ' + s.label); });
    h += '<div class="tteam-bar-row">' +
      '<span class="tteam-bar-label">' + label + '</span>' +
      '<div class="tteam-sdist-bar" title="' + tipParts.join(' · ') + '">';
    SD_STATES.forEach(function(s) {
      var pct = Math.round((d[s.key] / total) * 100);
      if (pct === 0) return;
      h += '<div class="tteam-sdist-seg" style="width:' + pct + '%;background:' + s.color + '" title="' + d[s.key] + ' ' + s.label + '"></div>';
    });
    h += '</div><span class="tteam-bar-val">' + (d.total || 0) + '</span></div>';
  });
  h += '</div><div class="tteam-chart-legend">';
  SD_STATES.forEach(function(s) {
    h += '<span class="tteam-lgd-item"><span class="tteam-lgd-swatch" style="background:' + s.color + '"></span>' + s.label + '</span>';
  });
  return h + '</div></div>';
}

// ── Priority cell: H / M / L counts ──────────────────
function priorityCell(p) {
  if (!p || (p.H + p.M + p.L === 0)) return '<span style="color:#BBBBB7;font-size:11px">—</span>';
  var tips = [];
  if (p.H > 0) tips.push(p.H + ' High');
  if (p.M > 0) tips.push(p.M + ' Medium');
  if (p.L > 0) tips.push(p.L + ' Low');
  var h = '<div class="tteam-pri-wrap" title="' + tips.join(' · ') + '">';
  if (p.H > 0) h += '<span class="tteam-pri-h">' + p.H + '&thinsp;H</span>';
  if (p.M > 0) h += '<span class="tteam-pri-m">' + p.M + '&thinsp;M</span>';
  if (p.L > 0) h += '<span class="tteam-pri-l">' + p.L + '&thinsp;L</span>';
  return h + '</div>';
}

// ── Scope delta tile ─────────────────────────────────
function scopeDeltaTile(isTeamCtx, teamName) {
  var sd = EAP.sprintScopeData;
  if (!sd) return '<div class="tteam-sum-tile"><span class="tteam-sum-val">—</span><span class="tteam-sum-lbl">Scope added</span></div>';
  var netPts;
  if (isTeamCtx) {
    var td = (sd.teams || {})[teamName] || {};
    netPts = (td.addedPts || 0) - (td.removedPts || 0);
  } else {
    netPts = sd.addedPts - sd.removedPts;
  }
  var valStr = netPts > 0 ? '+' + netPts + ' pts' : netPts < 0 ? netPts + ' pts' : '—';
  return '<div class="tteam-sum-tile">' +
    '<span class="tteam-sum-val">' + valStr + '</span>' +
    '<span class="tteam-sum-lbl">Scope added · ' + sd.sprint + '</span>' +
  '</div>';
}

// ── Sprint comparison chart panel (D3 init deferred) ──
function renderSprintComparisonPanel() {
  return '<div class="tteam-sc-panel">' +
    '<div class="tteam-sc-header">' +
      '<div>' +
        '<div class="tteam-chart-title">Sprint performance</div>' +
        '<div class="tteam-chart-subtitle">ART committed vs completed · 4 completed · 1 active</div>' +
      '</div>' +
    '</div>' +
    '<div id="tteam-sprint-comp-svg" class="tteam-sc-svg-host"></div>' +
    '<div class="tteam-chart-legend tteam-sc-legend">' +
      '<span class="tteam-lgd-item"><span class="tteam-lgd-swatch" style="background:#2563EB"></span>Committed</span>' +
      '<span class="tteam-lgd-item"><span class="tteam-lgd-swatch" style="background:#F59E0B"></span>Added scope</span>' +
      '<span class="tteam-lgd-item"><span class="tteam-lgd-swatch" style="background:#16A34A"></span>Completed</span>' +
      '<span class="tteam-lgd-item"><span class="tteam-lgd-swatch" style="background:#E1E0DD;border:1px solid #CCCBC8;box-sizing:border-box;"></span>Not completed</span>' +
      '<span class="tteam-lgd-item"><span class="tteam-sc-lgd-proj"></span>Projected</span>' +
    '</div>' +
  '</div>';
}

// ── Velocity trend panel — D3 sparklines rendered post-mount ──
// Placeholder spans with data-values; EAP.initWorkloadSparklines() draws via D3.
var VEL_SPRINT_LABELS = ['PI25 S3', 'PI25 S4', 'PI26 S1', 'PI26 S2'];
function renderVelocityPanel(rows, isTeamCtx) {
  var lookup = isTeamCtx ? (EAP.memberVelocity || {}) : (EAP.teamVelocityHistory || {});
  function trendIcon(color, dir) {
    if (dir === 'up')   return '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 8V3M2 5.5L5 3l3 2.5" stroke="' + color + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    if (dir === 'down') return '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 2v5M2 4.5L5 7l3-2.5" stroke="' + color + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M6 3l2 2-2 2" stroke="' + color + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  var h = '<div class="tteam-vel-panel">' +
    '<div class="tteam-chart-title">Velocity trend</div>' +
    '<div class="tteam-vel-subtitle">' + VEL_SPRINT_LABELS.join('&ensp;&middot;&ensp;') + '</div>';
  rows.forEach(function(r) {
    var vals = lookup[r.member];
    if (!vals) return;
    var lastSp = vals[vals.length - 1];
    var delta = lastSp - vals[0];
    var dir = delta > 1 ? 'up' : delta < -1 ? 'down' : 'flat';
    var trendColor = dir === 'up' ? '#16A34A' : dir === 'down' ? '#DC2626' : '#585753';
    var label = isTeamCtx ? r.member : r.member.replace(' Team', '');
    h += '<div class="tteam-vel-row">' +
      '<span class="tteam-vel-label">' + label + '</span>' +
      '<span class="tteam-vel-spark vel-spark-target" data-values="' + JSON.stringify(vals) + '"></span>' +
      '<span class="tteam-vel-last">' + lastSp + '<span class="tteam-vel-unit"> sp</span></span>' +
      '<span class="tteam-vel-trend">' + trendIcon(trendColor, dir) + '</span>' +
    '</div>';
  });
  h += '<div class="tteam-vel-footnote">Last 4 complete sprints — PI26 S2 active</div>';
  return h + '</div>';
}

function workloadTiles(avgCap, blocked, slack, isTeamCtx, teamName) {
  var entity = isTeamCtx ? 'Members' : 'Teams';
  return '<div class="tteam-summary">' +
    '<div class="tteam-sum-tile">' +
      '<span class="tteam-sum-val">' + avgCap + '%</span>' +
      '<span class="tteam-sum-lbl">Avg capacity used</span>' +
    '</div>' +
    '<div class="tteam-sum-tile">' +
      '<span class="tteam-sum-val">' + blocked + '</span>' +
      '<span class="tteam-sum-lbl">Blocked items</span>' +
    '</div>' +
    '<div class="tteam-sum-tile">' +
      '<span class="tteam-sum-val">' + slack + '</span>' +
      '<span class="tteam-sum-lbl">' + entity + ' with slack</span>' +
    '</div>' +
    scopeDeltaTile(isTeamCtx, teamName) +
  '</div>';
}

// ── Team view renderer ────────────────────────────────
function renderTeamView(teamName, isTeamCtx) {
  var rows = [];
  var maxSp = 0;

  if (isTeamCtx) {
    rows = (EAP.teamProductivity || {})[teamName] || [];
    maxSp = rows.reduce(function(m, r) { return Math.max(m, r.spCompleted); }, 0) || 1;
  } else {
    // ART context — aggregate one row per team
    var teams = ['Auth Team', 'Payments Team', 'Fraud Team', 'Mobile Exp Team', 'Accounts Team', 'Onboarding Team'];
    teams.forEach(function(t) {
      var members = (EAP.teamProductivity || {})[t] || [];
      if (!members.length) return;
      var total = members.reduce(function(a, r) { return a + r.totalTasks; }, 0);
      var done  = members.reduce(function(a, r) { return a + r.completed; }, 0);
      var pend  = members.reduce(function(a, r) { return a + r.pending; }, 0);
      var util  = members.reduce(function(a, r) { return a + r.utilHrs; }, 0);
      var sp    = members.reduce(function(a, r) { return a + r.spCompleted; }, 0);
      var pct   = total > 0 ? Math.round((done / total) * 100) : 0;
      var q = pct >= 80 ? 'Excellent' : pct >= 70 ? 'Good' : pct >= 55 ? 'Average' : 'Poor';
      rows.push({ member: t, role: members.length + ' members', totalTasks: total, completed: done,
                  utilHrs: util, completionPct: pct, pending: pend, quality: q, spCompleted: sp });
    });
    maxSp = rows.reduce(function(m, r) { return Math.max(m, r.spCompleted); }, 0) || 1;
  }

  if (!rows.length) {
    return '<div style="padding:40px;text-align:center;color:#6B7280;font-size:13px;">No productivity data for this team.</div>';
  }

  // Enrich with live work item signals
  var enr = buildWorkloadEnrichment(rows, isTeamCtx);
  var stateDist = buildStateDistribution(rows, isTeamCtx);
  var priMap = buildPriorityMap(rows, isTeamCtx);
  rows.forEach(function(r) { r._capPct = rowCapPct(r, isTeamCtx); });

  var avgCap = Math.round(rows.reduce(function(a, r) { return a + r._capPct; }, 0) / rows.length);
  var totalBlocked = rows.reduce(function(a, r) { return a + ((enr[r.member] || {}).blocked || 0); }, 0);
  var slackCount = rows.filter(function(r) { return r._capPct < 85; }).length;

  // Active sprint name for chart and table title
  var activeSp = EAP.workItems.sprints.filter(function(s) { return s.active; })[0];
  var sprintLabel = activeSp ? activeSp.name : 'Sprint 2';

  // Sprint pts per row (done / committed) from live sprint data
  var sp2pts = getSprintPts(isTeamCtx, isTeamCtx ? teamName : null);
  var maxCommitted = rows.reduce(function(m, r) { return Math.max(m, (sp2pts[r.member] || {}).committed || 0); }, 0) || 1;

  // ART: flow health chart (committed pts, colored by flowing / at-risk / not-started).
  // Team: workload by state across full PI — enough items per member for meaningful bars.
  var chartHtml;
  if (!isTeamCtx) {
    var flowData = buildFlowHealth(rows, false);
    chartHtml = flowHealthPanel(rows, false, flowData, sprintLabel);
  } else {
    chartHtml = stateDistributionPanel(rows, isTeamCtx, stateDist);
  }

  // Summary tiles (4th = scope delta)
  var tilesHtml = workloadTiles(avgCap, totalBlocked, slackCount, isTeamCtx, teamName);

  // Table — title outside the table, no header bg, sprint pts replaces quality
  var tableHtml = '<div class="tteam-table-wrap">' +
    '<div class="tteam-table-hdr"><span class="tteam-table-title">Workload breakdown &middot; ' + sprintLabel + '</span></div>' +
    '<table class="tteam-table">' +
    '<thead><tr>' +
      '<th>' + (isTeamCtx ? 'Member' : 'Team') + '</th>' +
      '<th>Utilized</th>' +
      '<th>Sprint pts</th>' +
      '<th title="H = High · M = Medium · L = Low — active sprint">Priority</th>' +
      '<th style="color:#383733">Stories</th>' +
      '<th style="color:#D97706">Defects</th>' +
      '<th style="color:#797874">Tasks</th>' +
      '<th>Active / Blocked</th>' +
    '</tr></thead>' +
    '<tbody>';
  rows.forEach(function(r) {
    var e = enr[r.member] || { wip: 0, blocked: 0, story: 0, defect: 0, task: 0, blockedItems: [] };
    var p = sp2pts[r.member] || { committed: 0, done: 0 };
    var pri = priMap[r.member] || { H: 0, M: 0, L: 0 };
    var nameLabel = isTeamCtx ? r.member : r.member.replace(' Team', '');
    tableHtml +=
      '<tr>' +
        '<td class="tteam-td-name">' +
          (isTeamCtx ? EAP.avatar(r.member, 24) : '') +
          '<div class="tteam-td-namestack">' +
            '<span class="tteam-td-nameprimary">' + nameLabel + '</span>' +
            '<span class="tteam-td-namesub">' + r.role + '</span>' +
          '</div>' +
        '</td>' +
        '<td>' + capBarCell(r._capPct) + '</td>' +
        '<td>' + sprintPtsCell(p) + '</td>' +
        '<td>' + priorityCell(pri) + '</td>' +
        '<td class="tteam-td-num" style="color:#383733">' + (e.story > 0 ? e.story : '<span style="color:#BBBBB7">—</span>') + '</td>' +
        '<td class="tteam-td-num" style="color:#D97706">' + (e.defect > 0 ? e.defect : '<span style="color:#BBBBB7">—</span>') + '</td>' +
        '<td class="tteam-td-num" style="color:#797874">' + (e.task > 0 ? e.task : '<span style="color:#BBBBB7">—</span>') + '</td>' +
        '<td>' + signalsCell(e) + '</td>' +
      '</tr>';
  });
  tableHtml += '</tbody></table></div>';

  var topRow = '<div class="tteam-top-row">' + chartHtml + renderVelocityPanel(rows, isTeamCtx) + '</div>';
  var cfdPanel = !isTeamCtx ? renderCFDPanel() : '';
  var compPanel = renderSprintComparisonPanel();
  return '<div class="tteam-view">' + tilesHtml + topRow + cfdPanel + compPanel + tableHtml + '</div>';
}

// ── Main render ───────────────────────────────────────
EAP.renderTrack = function() {
  var s = EAP.state;
  var isTeamCtx = (s.context === 'team');
  var trackView = s.trackView || 'board';

  // ── Gather + filter items first (stats depend on filtered set) ──
  var all = [];
  EAP.workItems.sprints.forEach(function(sp) { all = all.concat(sp.items || []); });
  all = all.concat(EAP.getBacklogFlat());

  // Pre-filter by team when scope selector is at team context
  if (isTeamCtx) {
    var scopeTeam = s.contextName; // e.g. "Auth Team" from scope selector
    all = all.filter(function(i) { return i.team === scopeTeam; });
  }

  // Then apply chip filters (member within team, or team within ART)
  var selMembers = s.trackMembers || [];
  if (isTeamCtx && selMembers.length > 0) {
    all = all.filter(function(i) { return selMembers.indexOf(i.owner) !== -1; });
  }
  var selTeams = s.trackTeams || [];
  if (!isTeamCtx && selTeams.length > 0) {
    all = all.filter(function(i) { return selTeams.indexOf(i.team) !== -1; });
  }

  // ── Compute stats from filtered set ──
  var activePi = EAP.features.pis.filter(function(p) { return p.active; })[0] || EAP.features.pis[0];
  var activeSprint = EAP.workItems.sprints.filter(function(sp) { return sp.active; })[0] || EAP.workItems.sprints[0];
  var spDays = EAP._sprintDays, spDay = EAP._dayInSprint;
  var totalItems = all.length;
  var totalPts = all.reduce(function(a, i) { return a + (i.pts || 0); }, 0);
  var doneItems = all.filter(function(i) { return i.state === 'Done' || i.state === 'Complete'; });
  var donePts = doneItems.reduce(function(a, i) { return a + (i.pts || 0); }, 0);
  var pct = totalPts > 0 ? Math.round((donePts / totalPts) * 100) : 0;
  var blockedCount = all.filter(function(i) { return i.blocked || i.state === 'Blocked'; }).length;
  var carriedCount = all.filter(function(i) { return i.carriedOver; }).length;
  var defectPts = all.filter(function(i) { return i.type === 'Defect'; }).reduce(function(a, i) { return a + (i.pts || 0); }, 0);
  var bugPct = totalPts > 0 ? Math.round((defectPts / totalPts) * 100) : 0;

  // Health signals grouped: blocked · carried · defects%
  var healthParts = [];
  if (blockedCount > 0) healthParts.push('<span class="track-ctx-blocked">' + blockedCount + ' blocked</span>');
  if (carriedCount > 0) healthParts.push('<span class="track-ctx-carried">' + carriedCount + ' carried over</span>');
  if (bugPct > 0) healthParts.push('<span class="track-ctx-defects"' + (bugPct > 25 ? ' style="color:var(--color-warning);"' : '') + '>' + bugPct + '% defects</span>');
  var healthHtml = healthParts.length > 0
    ? '<span class="track-ctx-vsep"></span><div class="track-ctx-group track-ctx-health">' +
        healthParts.join('<span class="track-ctx-sep"></span>') +
      '</div>'
    : '';

  // ── Context header — micro-dashboard ──
  var contextHtml = '<div class="track-context">' +
    '<div class="track-ctx-group">' +
      '<span class="track-ctx-label">Active Sprint</span>' +
      '<span class="track-ctx-sprint">' + activeSprint.name + '</span>' +
      '<span class="track-ctx-sep">·</span>' +
      '<span class="track-ctx-pi">' + activePi.name + '</span>' +
    '</div>' +
    '<span class="track-ctx-vsep"></span>' +
    '<div class="track-ctx-group">' +
      '<span class="track-ctx-dates">' + activeSprint.dates + '</span>' +
      '<span class="track-ctx-sep">·</span>' +
      '<span class="track-ctx-day">Day ' + spDay + ' of ' + spDays + '</span>' +
    '</div>' +
    '<span class="track-ctx-vsep"></span>' +
    '<div class="track-ctx-group">' +
      '<span class="track-ctx-metric">' + totalItems + ' items</span>' +
      '<span class="track-ctx-sep">·</span>' +
      '<span class="track-ctx-progress"><span class="track-ctx-pbar"><span class="track-ctx-pfill" style="width:' + pct + '%"></span></span>' + donePts + ' of ' + totalPts + ' pts (' + pct + '%)</span>' +
    '</div>' +
    healthHtml +
    '</div>';

  // ── Team view branch ──────────────────────────────────
  if (trackView === 'team') {
    return '<div style="flex:1;display:flex;flex-direction:column;min-width:0;min-height:0;">' +
      contextHtml +
      '<div style="flex:1;min-height:0;overflow:auto;padding:4px 2px 16px;">' +
        renderTeamView(s.contextName, isTeamCtx) +
      '</div>' +
    '</div>';
  }

  // ── Filter chips — team or member (inside board content, new row) ──
  var chipRowHtml = '<div class="track-chip-row">';
  if (isTeamCtx) {
    var members = (EAP.teamMembers && EAP.teamMembers[s.contextName]) || [];
    var selMbrs = s.trackMembers || [];
    chipRowHtml += '<span class="track-chip' + (selMbrs.length === 0 ? ' active' : '') + '" data-track-member="All">' + EAP.icon('users', 14) + ' All</span>';
    members.forEach(function(m) {
      var p = EAP.people[m];
      if (!p) return;
      chipRowHtml += '<span class="track-chip' + (selMbrs.indexOf(m) !== -1 ? ' active' : '') + '" data-track-member="' + m + '">' + EAP.avatar(m, 20) + ' ' + p.name + '</span>';
    });
  } else {
    var teams = ['Auth Team', 'Payments Team', 'Fraud Team', 'Mobile Exp Team', 'Accounts Team', 'Onboarding Team'];
    var selTms = s.trackTeams || [];
    chipRowHtml += '<span class="track-chip' + (selTms.length === 0 ? ' active' : '') + '" data-track-team="All">' + EAP.icon('users', 14) + ' All Teams</span>';
    teams.forEach(function(t) {
      var tc = EAP.teamColors[t] || '#6B7280';
      chipRowHtml += '<span class="track-chip' + (selTms.indexOf(t) !== -1 ? ' active' : '') + '" data-track-team="' + t + '"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + tc + ';flex-shrink:0;"></span> ' + t + '</span>';
    });
  }
  chipRowHtml += '</div>';

  // Filter-aware empty state — when chips/persona empty the board, surface
  // a clear-filter affordance instead of rendering empty workflow columns.
  if (!all.length && EAP.hasClearableFilters()) {
    return '<div style="flex:1;display:flex;flex-direction:column;min-width:0;min-height:0;">' +
      contextHtml + chipRowHtml +
      '<div style="flex:1;display:flex;align-items:center;justify-content:center;">' + EAP.emptyState() + '</div>' +
      '</div>';
  }

  // Bucket into workflow columns
  var bk = {};
  EAP.trackColumns.forEach(function(c) { bk[c] = []; });
  all.forEach(function(i) {
    var c = i.state;
    if (c === 'Planned' || c === 'To Do') c = 'Draft';
    if (bk[c]) bk[c].push(i); else bk.Draft.push(i);
  });

  // Render columns
  var colW = 310;
  var trackW = EAP.trackColumns.length * colW + (EAP.trackColumns.length - 1) * 8;
  var h = '<div style="flex:1;display:flex;flex-direction:column;min-width:0;min-height:0;">' +
    contextHtml + chipRowHtml +
    '<div style="flex:1;min-height:0;overflow:auto;">' +
    '<div style="display:inline-flex;gap:8px;padding:4px 2px 16px;width:' + trackW + 'px;">';

  EAP.trackColumns.forEach(function(col) {
    var items = bk[col] || [];
    h += '<div style="width:' + colW + 'px;flex-shrink:0;display:flex;flex-direction:column;">';
    var wLimit = EAP.wipLimits ? (EAP.wipLimits[col] || 0) : 0;
    var wOver = wLimit > 0 && items.length > wLimit;
    var wTip = wLimit > 0
      ? (wOver
          ? 'WIP limit: ' + wLimit + ' · ' + items.length + ' in column · Over by ' + (items.length - wLimit)
          : 'WIP limit: ' + wLimit + ' · ' + (wLimit - items.length) + ' slots available')
      : '';
    h += '<div class="track-col-hd"' + (!wOver && wTip ? ' data-tip="' + wTip + '"' : '') + '>';
    h += '<span style="font-family:var(--font-sans);font-style:normal;font-weight:400;font-size:11px;line-height:20px;color:#000000;flex:none;order:0;flex-grow:0;">' + col + '</span>';
    if (wOver) {
      h += '<span class="track-wip-badge"' + (wTip ? ' data-tip="' + wTip + '"' : '') + '>Over limit</span>';
    } else {
      h += '<span class="kbn-badge">' + items.length + '</span>';
    }
    h += '</div>';
    h += '<div style="' + TCB + '">';
    items.forEach(function(wi) { h += trackCard(wi, {showTeam: true, ownerField: 'owner'}); });
    h += '</div></div>';
  });

  h += '</div></div></div>';
  return h;
};


// ── D3 sparkline init — called post-render (setTimeout in render.js) ──
EAP.initWorkloadSparklines = function() {
  var targets = document.querySelectorAll('.vel-spark-target');
  if (!targets.length || typeof d3 === 'undefined') return;

  var tip = document.getElementById('vel-spark-tip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'vel-spark-tip';
    tip.className = 'vel-spark-tip';
    document.body.appendChild(tip);
  }

  targets.forEach(function(el) {
    var raw = el.getAttribute('data-values');
    if (!raw) return;
    var values;
    try { values = JSON.parse(raw); } catch(err) { return; }
    if (!values || values.length < 2) return;

    var W = Math.max(80, Math.round(el.getBoundingClientRect().width) || 120);
    var H = 28, px = 3, py = 4;
    var yMin = d3.min(values), yMax = d3.max(values);
    var yPad = (yMax - yMin) * 0.2 || 1;
    var xSc = d3.scaleLinear().domain([0, values.length - 1]).range([px, W - px]);
    var ySc = d3.scaleLinear().domain([yMin - yPad, yMax + yPad]).range([H - py, py]);
    var delta = values[values.length - 1] - values[0];
    var stroke = delta > 1 ? '#16A34A' : delta < -1 ? '#DC2626' : '#585753';

    var line = d3.line()
      .x(function(d, i) { return xSc(i); })
      .y(function(d) { return ySc(d); })
      .curve(d3.curveMonotoneX);

    var area = d3.area()
      .x(function(d, i) { return xSc(i); })
      .y0(H - py).y1(function(d) { return ySc(d); })
      .curve(d3.curveMonotoneX);

    var svg = d3.select(el).append('svg')
      .attr('width', W).attr('height', H)
      .style('overflow', 'visible').style('display', 'block');

    svg.append('path').datum(values)
      .attr('fill', stroke).attr('opacity', 0.08).attr('d', area);

    svg.append('path').datum(values)
      .attr('fill', 'none').attr('stroke', stroke)
      .attr('stroke-width', 1.5).attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round')
      .attr('d', line);

    // Last-point dot
    svg.append('circle')
      .attr('cx', xSc(values.length - 1)).attr('cy', ySc(values[values.length - 1]))
      .attr('r', 2.5).attr('fill', stroke);

    // Hover overlay — shows sprint label + value
    svg.append('rect')
      .attr('width', W).attr('height', H).attr('fill', 'transparent').style('cursor', 'crosshair')
      .on('mousemove', function(event) {
        var mx = d3.pointer(event)[0];
        var idx = Math.round((mx - px) / (W - px * 2) * (values.length - 1));
        idx = Math.max(0, Math.min(values.length - 1, idx));
        var lbl = VEL_SPRINT_LABELS[idx] || ('Sprint ' + (idx + 1));
        tip.innerHTML = '<span class="vel-tip-label">' + lbl + '</span><span class="vel-tip-val">' + values[idx] + ' sp</span>';
        tip.style.opacity = '1';
        tip.style.left = (event.pageX + 12) + 'px';
        tip.style.top = (event.pageY - 36) + 'px';
      })
      .on('mouseleave', function() { tip.style.opacity = '0'; });
  });

  // Wire blocked badge hover popup
  var blkPop = document.getElementById('tteam-blk-popup');
  if (!blkPop) {
    blkPop = document.createElement('div');
    blkPop.id = 'tteam-blk-popup';
    blkPop.className = 'tteam-blocked-popup';
    document.body.appendChild(blkPop);
  }
  document.querySelectorAll('.tteam-blocked-badge').forEach(function(badge) {
    badge.style.cursor = 'help';
    badge.addEventListener('mouseenter', function(evt) {
      var raw = badge.getAttribute('data-blocked-names') || '';
      var items = raw ? raw.split('||').filter(Boolean) : [];
      if (!items.length) return;
      var inner = '<div class="tteam-blk-pop-title">' + items.length + ' blocked item' + (items.length > 1 ? 's' : '') + '</div>';
      items.forEach(function(name) {
        inner += '<div class="tteam-blk-pop-item"><span class="tteam-blk-pop-dot"></span>' + name + '</div>';
      });
      blkPop.innerHTML = inner;
      blkPop.style.opacity = '1';
      var r = badge.getBoundingClientRect();
      blkPop.style.left = Math.min(r.left, window.innerWidth - 340) + 'px';
      blkPop.style.top = (r.bottom + 6) + 'px';
    });
    badge.addEventListener('mouseleave', function() { blkPop.style.opacity = '0'; });
  });
};

// ── Sprint comparison D3 chart — grouped bars per sprint ──────────────────────
// Two bars per sprint: left=committed (charcoal base + amber added scope on top),
// right=completed (green) + not-done (light grey). Active sprint: dashed outline.
EAP.initSprintComparisonChart = function() {
  var container = document.getElementById('tteam-sprint-comp-svg');
  if (!container || typeof d3 === 'undefined' || !EAP.sprintHistory) return;
  d3.select(container).selectAll('*').remove();

  var data = EAP.sprintHistory;
  var W = Math.max(container.getBoundingClientRect().width || 0, 300);
  var H = 158;
  var margin = { top: 8, right: 42, bottom: 36, left: 8 };
  var iW = W - margin.left - margin.right;
  var iH = H - margin.top - margin.bottom;

  var sprintNames = data.map(function(d) { return d.name; });
  var maxY = d3.max(data, function(d) { return d.initial + d.added; });
  maxY = Math.ceil(maxY * 1.12 / 20) * 20;

  var x0 = d3.scaleBand().domain(sprintNames).range([0, iW]).paddingInner(0.28).paddingOuter(0.08);
  var x1 = d3.scaleBand().domain(['commit', 'complete']).range([0, x0.bandwidth()]).padding(0.06);
  var y = d3.scaleLinear().domain([0, maxY]).range([iH, 0]);

  var svg = d3.select(container).append('svg')
    .attr('width', W).attr('height', H).style('display', 'block');
  var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Gridlines + Y labels
  var yTicks = y.ticks(4);
  yTicks.forEach(function(tick) {
    g.append('line')
      .attr('x1', 0).attr('x2', iW).attr('y1', y(tick)).attr('y2', y(tick))
      .attr('stroke', 'rgba(0,0,0,0.05)').attr('stroke-width', 1);
    g.append('text')
      .attr('x', iW + 5).attr('y', y(tick) + 3.5)
      .attr('font-size', '9').attr('fill', '#BBBBB7').attr('font-family', 'var(--font-sans)')
      .text(tick);
  });

  var sprintG = g.selectAll('.sc-sp')
    .data(data).join('g').attr('class', 'sc-sp')
    .attr('transform', function(d) { return 'translate(' + x0(d.name) + ',0)'; });

  // ── Commitment bar (left): blue base, amber added-scope cap ──
  // Full colors on all sprints including active — committed is committed.
  sprintG.append('rect')
    .attr('x', x1('commit')).attr('width', x1.bandwidth())
    .attr('y', function(d) { return y(d.initial); })
    .attr('height', function(d) { return iH - y(d.initial); })
    .attr('fill', '#2563EB')
    .attr('rx', 2);

  sprintG.filter(function(d) { return d.added > 0; }).append('rect')
    .attr('x', x1('commit')).attr('width', x1.bandwidth())
    .attr('y', function(d) { return y(d.initial + d.added); })
    .attr('height', function(d) { return y(d.initial) - y(d.initial + d.added); })
    .attr('fill', '#F59E0B')
    .attr('rx', 2);

  // ── Completion bar (right): completed (green) + not-done (light grey on top) ──
  sprintG.filter(function(d) { return !d.active; }).each(function(d) {
    var total = d.initial + d.added;
    d3.select(this).append('rect')
      .attr('x', x1('complete')).attr('width', x1.bandwidth())
      .attr('y', y(total)).attr('height', iH - y(total))
      .attr('fill', '#E1E0DD').attr('rx', 2);
    d3.select(this).append('rect')
      .attr('x', x1('complete')).attr('width', x1.bandwidth())
      .attr('y', y(d.completed)).attr('height', iH - y(d.completed))
      .attr('fill', '#16A34A').attr('rx', 2);
  });

  // Active sprint: dashed outline + partial green fill
  sprintG.filter(function(d) { return d.active; }).each(function(d) {
    var total = d.initial + d.added;
    d3.select(this).append('rect')
      .attr('x', x1('complete')).attr('width', x1.bandwidth())
      .attr('y', y(total)).attr('height', iH - y(total))
      .attr('fill', 'none').attr('stroke', '#CCCBC8')
      .attr('stroke-width', 1).attr('stroke-dasharray', '3,2').attr('rx', 2);
    if (d.completed > 0) {
      d3.select(this).append('rect')
        .attr('x', x1('complete')).attr('width', x1.bandwidth())
        .attr('y', y(d.completed)).attr('height', iH - y(d.completed))
        .attr('fill', 'rgba(22,163,74,0.50)').attr('rx', 2);
    }
  });

  // Prediction mark on active sprint completion bar — extends beyond bar edges to
  // distinguish it clearly from the dashed bar border; inline label makes it self-explanatory.
  sprintG.filter(function(d) { return d.active && d.dayOf && d.totalDays; }).each(function(d) {
    var projected = Math.round(d.completed / d.dayOf * d.totalDays);
    var xLeft = x1('complete') - 4;
    var xRight = x1('complete') + x1.bandwidth() + 4;
    var yProj = y(projected);
    d3.select(this).append('line')
      .attr('x1', xLeft).attr('x2', xRight)
      .attr('y1', yProj).attr('y2', yProj)
      .attr('stroke', '#585753').attr('stroke-width', 1.5).attr('stroke-dasharray', '3,2');
    d3.select(this).append('text')
      .attr('x', x1('complete') + x1.bandwidth() / 2)
      .attr('y', yProj - 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', '8').attr('fill', '#797874')
      .attr('font-family', 'var(--font-sans)')
      .text('~' + projected);
  });

  // Sprint name labels
  g.selectAll('.sc-lbl').data(data).join('text').attr('class', 'sc-lbl')
    .attr('x', function(d) { return x0(d.name) + x0.bandwidth() / 2; })
    .attr('y', iH + 16).attr('text-anchor', 'middle')
    .attr('font-size', '10')
    .attr('fill', function(d) { return d.active ? '#383733' : '#797874'; })
    .attr('font-weight', function(d) { return d.active ? '500' : '400'; })
    .attr('font-family', 'var(--font-sans)')
    .text(function(d) { return d.name; });

  // "Active" pill below active sprint label — SVG rect + text for visual weight
  var pillW = 36, pillH = 14;
  var pillG = g.selectAll('.sc-pill-g').data(data.filter(function(d) { return d.active; }))
    .join('g').attr('class', 'sc-pill-g');
  pillG.append('rect')
    .attr('x', function(d) { return x0(d.name) + x0.bandwidth() / 2 - pillW / 2; })
    .attr('y', iH + 20)
    .attr('width', pillW).attr('height', pillH).attr('rx', 7)
    .attr('fill', 'rgba(22,163,74,0.10)');
  pillG.append('text')
    .attr('x', function(d) { return x0(d.name) + x0.bandwidth() / 2; })
    .attr('y', iH + 30)
    .attr('text-anchor', 'middle')
    .attr('font-size', '9').attr('fill', '#15803D').attr('font-weight', '500')
    .attr('font-family', 'var(--font-sans)')
    .text('Active');

  // Hover tooltip (reuse vel-spark-tip style)
  var tip = document.getElementById('tteam-sc-tip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'tteam-sc-tip';
    tip.className = 'vel-spark-tip';
    document.body.appendChild(tip);
  }

  sprintG.append('rect')
    .attr('x', 0).attr('y', 0)
    .attr('width', x0.bandwidth()).attr('height', iH)
    .attr('fill', 'transparent').style('cursor', 'default')
    .on('mousemove', function(event, d) {
      var total = d.initial + d.added;
      var pct = total > 0 ? Math.round(d.completed / total * 100) : 0;
      var statusStr = d.active ? '~' + pct + '% in progress' : pct + '% completed';
      var html = '<span class="vel-tip-label">' + d.name + (d.active ? ' · Active' : '') + '</span>';
      html += '<span class="vel-tip-val">' + d.initial + ' pts committed</span>';
      if (d.added > 0) html += '<span class="vel-tip-val" style="color:#F59E0B">+' + d.added + ' added scope</span>';
      html += '<span class="vel-tip-val" style="color:' + (d.active ? 'rgba(22,163,74,0.85)' : '#16A34A') + '">' +
        d.completed + ' pts done · ' + statusStr + '</span>';
      if (d.active && d.dayOf && d.totalDays) {
        var proj = Math.round(d.completed / d.dayOf * d.totalDays);
        html += '<span class="vel-tip-val" style="color:#BBBBB7">~' + proj + ' pts projected at current rate</span>';
      }
      if (!d.active && d.notDone > 0) html += '<span class="vel-tip-val" style="color:#BBBBB7">' + d.notDone + ' pts carried</span>';
      tip.innerHTML = html;
      tip.style.opacity = '1';
      tip.style.left = (event.pageX + 12) + 'px';
      tip.style.top = (event.pageY - 80) + 'px';
    })
    .on('mouseleave', function() { tip.style.opacity = '0'; });
};

// ── CFD panel HTML scaffold ───────────────────────────
function renderCFDPanel() {
  var m = EAP.cfdMetrics || { throughput: '—', cycleTime: '—', flowEfficiency: '—' };
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var peakDateStr = (EAP.cfdData && EAP.cfdData[18])
    ? (function() { var dt = EAP.cfdData[18].date; return months[dt.getMonth()] + ' ' + dt.getDate(); }())
    : 'PI25 S4';

  return '<div class="tcfd-panel">' +
    '<div class="tcfd-hd">' +
      '<div>' +
        '<div class="tcfd-title">Cumulative Flow</div>' +
        '<div class="tcfd-subtitle">PI to date · 4 sprints · work item throughput by state</div>' +
      '</div>' +
      '<div class="tcfd-metrics">' +
        '<div class="tcfd-metric"><span class="tcfd-metric-val">' + m.cycleTime + 'd</span><span class="tcfd-metric-lbl">Avg cycle time</span></div>' +
        '<div class="tcfd-metric"><span class="tcfd-metric-val">' + m.throughput + '</span><span class="tcfd-metric-lbl">Items / day</span></div>' +
        '<div class="tcfd-metric"><span class="tcfd-metric-val">' + m.flowEfficiency + '%</span><span class="tcfd-metric-lbl">Flow efficiency</span></div>' +
      '</div>' +
    '</div>' +
    '<div class="tcfd-ai-note">' +
      '<span class="tcfd-ai-spark">✦</span>' +
      '<span class="tcfd-ai-text">In Progress peaked at 9 items on ' + peakDateStr + ', exceeding the WIP limit of 6 for 6 days. Cycle time extended by ~2.1d during this period. <span class="tcfd-ai-action">Review blockers ›</span></span>' +
    '</div>' +
    '<div class="tcfd-svg-host" id="tcfd-svg-host"></div>' +
    '<div class="tcfd-legend">' +
      '<span class="tcfd-lgd-item"><span class="tcfd-lgd-swatch" style="background:rgba(22,163,74,0.65)"></span>Done</span>' +
      '<span class="tcfd-lgd-item"><span class="tcfd-lgd-swatch" style="background:rgba(217,119,6,0.65)"></span>In Review</span>' +
      '<span class="tcfd-lgd-item"><span class="tcfd-lgd-swatch" style="background:rgba(37,99,235,0.60)"></span>In Progress</span>' +
      '<span class="tcfd-lgd-item"><span class="tcfd-lgd-swatch" style="background:rgba(156,163,175,0.75)"></span>To Do</span>' +
      '<span class="tcfd-lgd-item"><span class="tcfd-lgd-swatch" style="background:rgba(220,38,38,0.70)"></span>Blocked</span>' +
      '<span class="tcfd-lgd-item"><span style="display:inline-block;width:10px;height:8px;border-radius:2px;flex-shrink:0;background:repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(220,38,38,0.32) 2px,rgba(220,38,38,0.32) 3.5px)"></span>WIP breach</span>' +
    '</div>' +
  '</div>';
}

// ── CFD D3 chart — stacked area, sprint guides, WIP breach hatch, bisect hover ──
EAP.initCFDChart = function() {
  var container = document.getElementById('tcfd-svg-host');
  if (!container || typeof d3 === 'undefined' || !EAP.cfdData || !EAP.cfdData.length) return;
  d3.select(container).selectAll('*').remove();

  var data = EAP.cfdData;
  var n = data.length;
  var W = Math.max(container.getBoundingClientRect().width || 0, 380);
  var H = 160;
  var margin = { top: 6, right: 44, bottom: 28, left: 6 };
  var iW = W - margin.left - margin.right;
  var iH = H - margin.top - margin.bottom;

  var xSc = d3.scaleLinear().domain([0, n - 1]).range([0, iW]);
  var yMax = d3.max(data, function(d) { return d.total; });
  var ySc = d3.scaleLinear().domain([0, Math.ceil(yMax * 1.08 / 20) * 20]).range([iH, 0]);

  var svg = d3.select(container).append('svg')
    .attr('width', W).attr('height', H).style('display', 'block');

  // Diagonal hatch pattern for WIP breach overlay
  var defs = svg.append('defs');
  var pat = defs.append('pattern')
    .attr('id', 'cfd-hatch').attr('patternUnits', 'userSpaceOnUse')
    .attr('width', 5).attr('height', 5)
    .attr('patternTransform', 'rotate(45)');
  pat.append('line')
    .attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 5)
    .attr('stroke', 'rgba(220,38,38,0.38)').attr('stroke-width', 1.6);

  var g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Bands stacked bottom→top: blocked, todo, inprog, review, done
  var BANDS = [
    { key: 'blocked', color: 'rgba(220,38,38,0.70)'  },
    { key: 'todo',    color: 'rgba(156,163,175,0.75)' },
    { key: 'inprog',  color: 'rgba(37,99,235,0.60)'  },
    { key: 'review',  color: 'rgba(217,119,6,0.65)'  },
    { key: 'done',    color: 'rgba(22,163,74,0.65)'  }
  ];

  // Pre-compute stacked y0/y1 per band per day
  var stacked = BANDS.map(function(band, bi) {
    return data.map(function(d, i) {
      var y0 = 0;
      for (var j = 0; j < bi; j++) y0 += d[BANDS[j].key];
      return { i: i, y0: y0, y1: y0 + d[band.key], d: d };
    });
  });

  var area = d3.area()
    .x(function(d) { return xSc(d.i); })
    .y0(function(d) { return ySc(d.y0); })
    .y1(function(d) { return ySc(d.y1); })
    .curve(d3.curveMonotoneX);

  // Draw bands
  BANDS.forEach(function(band, bi) {
    g.append('path').datum(stacked[bi]).attr('fill', band.color).attr('d', area);
  });

  // WIP breach hatch over inprog band where inprog > WIP limit
  var WIP_LIMIT = (EAP.wipLimits && EAP.wipLimits['In Progress']) || 6;
  var inprogStacked = stacked[2]; // index 2 = inprog in BANDS
  var segStart = null;
  function flushSeg(to) {
    if (segStart === null) return;
    var segData = inprogStacked.slice(segStart, to + 1);
    if (segData.length >= 2) {
      g.append('path').datum(segData).attr('fill', 'url(#cfd-hatch)').attr('d', area);
    }
    segStart = null;
  }
  data.forEach(function(d, i) {
    if (d.inprog > WIP_LIMIT && segStart === null) segStart = i;
    else if (d.inprog <= WIP_LIMIT && segStart !== null) flushSeg(i - 1);
  });
  flushSeg(data.length - 1);

  // Gridlines + Y labels
  ySc.ticks(4).forEach(function(tick) {
    g.append('line')
      .attr('x1', 0).attr('x2', iW).attr('y1', ySc(tick)).attr('y2', ySc(tick))
      .attr('stroke', 'rgba(0,0,0,0.04)').attr('stroke-width', 1);
    g.append('text')
      .attr('x', iW + 4).attr('y', ySc(tick) + 3.5)
      .attr('font-family', 'var(--font-sans)').attr('font-size', '9').attr('fill', '#BBBBB7')
      .text(tick);
  });

  // Sprint boundary guides — dashed verticals + sprint labels
  EAP.cfdSprints.forEach(function(sp) {
    if (sp.idx === 0 || sp.idx >= n) return;
    var x = xSc(sp.idx);
    g.append('line')
      .attr('x1', x).attr('x2', x).attr('y1', 0).attr('y2', iH)
      .attr('stroke', 'rgba(0,0,0,0.13)').attr('stroke-width', 1).attr('stroke-dasharray', '3,2');
    g.append('text')
      .attr('x', x + 4).attr('y', 10)
      .attr('font-family', 'var(--font-sans)').attr('font-size', '8')
      .attr('fill', sp.active ? '#383733' : '#BBBBB7')
      .attr('font-weight', sp.active ? '500' : '400')
      .text(sp.label);
  });

  // First sprint label (day 0)
  g.append('text')
    .attr('x', 4).attr('y', 10)
    .attr('font-family', 'var(--font-sans)').attr('font-size', '8').attr('fill', '#BBBBB7')
    .text(EAP.cfdSprints[0].label);

  // WIP peak callout — small red tick above the breach zone
  var peakIdx = EAP.cfdWipPeakIdx;
  if (peakIdx < n) {
    var pk = inprogStacked[peakIdx];
    var pkX = xSc(peakIdx);
    var pkTopY = ySc(pk.y1);
    g.append('line')
      .attr('x1', pkX).attr('x2', pkX)
      .attr('y1', pkTopY - 2).attr('y2', pkTopY - 12)
      .attr('stroke', '#DC2626').attr('stroke-width', 1).attr('stroke-dasharray', '2,2');
    g.append('circle')
      .attr('cx', pkX).attr('cy', pkTopY - 13)
      .attr('r', 2.5).attr('fill', '#DC2626');
  }

  // Today marker
  var todayX = xSc(n - 1);
  g.append('line')
    .attr('x1', todayX).attr('x2', todayX).attr('y1', 0).attr('y2', iH)
    .attr('stroke', 'rgba(56,55,51,0.50)').attr('stroke-width', 1);
  g.append('text')
    .attr('x', todayX - 3).attr('y', iH + 17)
    .attr('text-anchor', 'end')
    .attr('font-family', 'var(--font-sans)').attr('font-size', '9')
    .attr('fill', '#383733').attr('font-weight', '500')
    .text('Today');

  // Bisect hover: crosshair + tooltip
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var tip = document.getElementById('tcfd-tip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'tcfd-tip';
    tip.className = 'vel-spark-tip';
    document.body.appendChild(tip);
  }

  var xhair = g.append('line').attr('class', 'cfd-xhair')
    .attr('y1', 0).attr('y2', iH)
    .attr('stroke', 'rgba(0,0,0,0.18)').attr('stroke-width', 1)
    .style('display', 'none').attr('pointer-events', 'none');

  g.append('rect')
    .attr('width', iW).attr('height', iH)
    .attr('fill', 'transparent').style('cursor', 'crosshair')
    .on('mousemove', function(event) {
      var mx = d3.pointer(event)[0];
      var idx = Math.round(mx / iW * (n - 1));
      idx = Math.max(0, Math.min(n - 1, idx));
      var d = data[idx];
      var x = xSc(idx);

      xhair.attr('x1', x).attr('x2', x).style('display', null);

      var dt = d.date;
      var lbl = months[dt.getMonth()] + ' ' + dt.getDate();
      var wipWarn = d.inprog > WIP_LIMIT ? ' · <span style="color:#DC2626">WIP over limit</span>' : '';
      tip.innerHTML =
        '<span class="vel-tip-label">' + lbl + wipWarn + '</span>' +
        '<span class="vel-tip-val" style="color:rgba(22,163,74,0.9)">' + d.done + ' Done</span>' +
        '<span class="vel-tip-val" style="color:rgba(217,119,6,0.9)">' + d.review + ' In Review</span>' +
        '<span class="vel-tip-val" style="color:rgba(37,99,235,0.85)">' + d.inprog + ' In Progress' + (d.inprog > WIP_LIMIT ? ' ⚠' : '') + '</span>' +
        '<span class="vel-tip-val" style="color:#797874">' + d.todo + ' To Do</span>' +
        (d.blocked ? '<span class="vel-tip-val" style="color:#DC2626">' + d.blocked + ' Blocked</span>' : '') +
        '<span class="vel-tip-val" style="color:#BBBBB7">' + d.total + ' total in system</span>';
      tip.style.opacity = '1';
      tip.style.left = (event.pageX + 12) + 'px';
      tip.style.top = (event.pageY - 110) + 'px';
    })
    .on('mouseleave', function() {
      xhair.style('display', 'none');
      tip.style.opacity = '0';
    });
};

// ── Public workload section accessor — used by Analytics tab ──
EAP.renderWorkloadSection = function() {
  var s = EAP.state;
  var isTeamCtx = (s.context === 'team');
  return renderTeamView(s.contextName, isTeamCtx);
};
