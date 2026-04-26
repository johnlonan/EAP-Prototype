/* ═══════════════════════════════════════════════════════
   DATA.JS — Enterprise Agile Planning Demo Data
   Consolidated · Meridian Bank · Digital Banking ART

   SINGLE SOURCE OF TRUTH: Features array is referenced
   by Backlog, List, Board, and Hierarchy views.

   DYNAMIC DATES: All PI/Sprint dates are computed from
   today's real date so the demo never goes stale.
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

// ── Dynamic date engine ───────────────────────────────
// Anchors the entire prototype to today's actual date.
// Today sits in Sprint 2 (2nd of 5 sprints) of the current PI.
(function() {
  var today = new Date();
  today.setHours(0,0,0,0);

  // Helper: add days to a date
  function addDays(d, n) { var r = new Date(d); r.setDate(r.getDate() + n); return r; }
  function fmt(d) { var m = d.getMonth()+1, dy = d.getDate(); return d.getFullYear() + '-' + (m<10?'0':'') + m + '-' + (dy<10?'0':'') + dy; }
  function fmtShort(d) { var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return months[d.getMonth()] + ' ' + d.getDate(); }

  // Sprint is 2 weeks (14 days). PI is 5 sprints = 70 days (10 weeks).
  var SPRINT_DAYS = 14, SPRINTS_PER_PI = 5, PI_DAYS = SPRINT_DAYS * SPRINTS_PER_PI;

  // Current PI started 1 full sprint + partial sprint ago.
  // Today is in Sprint 2. Sprint 1 is complete. We're partway through Sprint 2.
  var dayInSprint2 = (today.getDay() + 2) % 7 + 3; // 3-9 range, gives a realistic "day X"
  var piStart = addDays(today, -(SPRINT_DAYS + dayInSprint2 - 1)); // PI start = Sprint1 start

  // Compute sprint boundaries within current PI
  var sprints = [];
  for (var i = 0; i < SPRINTS_PER_PI; i++) {
    var ss = addDays(piStart, i * SPRINT_DAYS);
    var se = addDays(ss, SPRINT_DAYS - 1);
    var names = ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'IP Sprint'];
    sprints.push({ start: fmt(ss), end: fmt(se), name: names[i], active: i === 1 });
  }

  // Compute PI boundaries: 2 before current, current, 2 after
  var pis = [];
  for (var p = -2; p <= 2; p++) {
    var ps = addDays(piStart, p * PI_DAYS);
    var pe = addDays(ps, PI_DAYS - 1);
    var piNum = 26 + p; // Current is PI 26
    pis.push({ id: 'pi' + piNum, start: fmt(ps), end: fmt(pe), name: 'PI ' + piNum, active: p === 0 });
  }

  // Expose computed values
  EAP._today = today;
  EAP._todayStr = fmt(today);
  EAP._piStart = piStart;
  EAP._dayInSprint = dayInSprint2;
  EAP._sprintDays = SPRINT_DAYS;
  EAP._piDays = PI_DAYS;
  EAP._addDays = addDays;
  EAP._fmt = fmt;
  EAP._fmtShort = fmtShort;

  // Build piDates and sprintDates dynamically
  EAP.piDates = {};
  pis.forEach(function(pi) { EAP.piDates[pi.id] = { start: pi.start, end: pi.end, name: pi.name, active: pi.active }; });

  EAP.sprintDates = {};
  sprints.forEach(function(sp, idx) {
    var sid = 'sp' + (idx + 1);
    EAP.sprintDates[sid] = { start: sp.start, end: sp.end, name: sp.name, active: sp.active };
  });

  // Formatted date strings for display
  EAP._piDisplay = pis.map(function(pi) {
    return { id: pi.id, name: pi.name, dates: fmtShort(new Date(pi.start + 'T00:00:00')) + ' – ' + fmtShort(new Date(pi.end + 'T00:00:00')), active: pi.active };
  });
  EAP._sprintDisplay = sprints.map(function(sp, idx) {
    return { id: 'sp' + (idx+1), name: sp.name, dates: fmtShort(new Date(sp.start + 'T00:00:00')) + ' – ' + fmtShort(new Date(sp.end + 'T00:00:00')), active: sp.active };
  });
})();

// ── Agile Structure ────────────────────────────────────
EAP.structure = {
  id:'root', name:'Meridian Bank Portfolio', type:'portfolio',
  children: [{
    id:'st1', name:'Digital & Payments ST', type:'solution-train',
    children: [{
      id:'art1', name:'Digital Banking ART', type:'art',
      children: [
        {id:'t1',name:'Auth Team',type:'team'},
        {id:'t2',name:'Payments Team',type:'team'},
        {id:'t3',name:'Fraud Team',type:'team'},
        {id:'t4',name:'Mobile Exp Team',type:'team'},
        {id:'t5',name:'Accounts Team',type:'team'},
        {id:'t6',name:'Onboarding Team',type:'team'}
      ]
    },{
      id:'art2', name:'Lending & Mortgages ART', type:'art',
      children: [
        {id:'t7',name:'Mortgages Team',type:'team'},
        {id:'t8',name:'Lending Risk Team',type:'team'}
      ]
    }]
  }]
};

// ── Context → Level mapping ────────────────────────────
EAP.contextLevels = {
  'portfolio':      [{value:'Epic',label:'Epic'}],
  'solution-train': [{value:'Capability',label:'Capability'}],
  'art':            [{value:'Feature',label:'Feature'},{value:'WorkItem',label:'Work Item'}],
  'team':           [{value:'WorkItem',label:'Work Item'}]
};
EAP.defaultLevel = {'portfolio':'Epic','solution-train':'Capability','art':'Feature','team':'WorkItem'};

// ═══════════════════════════════════════════════════════
// GOALS & EPICS
// ═══════════════════════════════════════════════════════
EAP.goals = [
  {id:'g1', name:'Become top digital bank in UK by 2027', state:'On Track', pct:42},
  {id:'g2', name:'Reduce operating costs by 18% by end of 2026', state:'At Risk', pct:12}
];

EAP.epics = {
  all: [
    // Assigned to STs
    {id:'e1', num:'EPIC0010001', name:'Next-Gen Mobile Banking Platform', type:'Epic', state:'Implementation', pct:42, size:'XL', wsjf:18.4, art:'Digital Banking ART', st:'Digital & Payments ST', goal:'g1', owner:'Ananya', parent:'Become top digital bank in UK by 2027', product:'Digital Banking'},
    {id:'e2', num:'EPIC0010002', name:'Customer Self-Service Expansion', type:'Epic', state:'Funnel', pct:0, size:'L', wsjf:14.1, art:'Digital Banking ART', st:'Digital & Payments ST', goal:'g2', owner:'Priya', parent:'Reduce operating costs by 18% by end of 2026', product:'Digital Banking'},
    {id:'e3', num:'EPIC0010003', name:'Open Banking API Programme', type:'Epic', state:'Review', pct:0, size:'XL', wsjf:13.2, art:'Digital Banking ART', st:'Digital & Payments ST', goal:'g1', owner:'Raj', parent:'Become top digital bank in UK by 2027', product:'Digital Banking'},
    {id:'e4', num:'EPIC0010004', name:'Payment Infrastructure Upgrade', type:'Epic', state:'Backlog', pct:0, size:'L', wsjf:9.8, art:'Lending & Mortgages ART', st:'Digital & Payments ST', goal:'g1', owner:'Kiran', parent:'Become top digital bank in UK by 2027', product:'Payments'},
    {id:'e5', num:'EPIC0010005', name:'Mortgage Origination Platform', type:'Epic', state:'Funnel', pct:0, size:'XL', wsjf:11.5, art:'Lending & Mortgages ART', st:'Digital & Payments ST', goal:'g2', owner:'Raj', parent:'Reduce operating costs by 18% by end of 2026', product:'Lending'},
    {id:'e6', num:'EPIC0010006', name:'Risk Assessment Automation', type:'Epic', state:'Funnel', pct:0, size:'M', wsjf:8.7, art:'Lending & Mortgages ART', st:'Digital & Payments ST', goal:'g2', owner:'Priya', parent:'Reduce operating costs by 18% by end of 2026', product:'Risk'},
    // Backlog (no ST)
    {id:'ebl1', num:'EPIC0010007', name:'AI-Powered Customer Support', type:'Epic', state:'Funnel', pct:0, size:'M', wsjf:7.4, art:'', st:'', goal:'g2', owner:'Ananya', parent:'Reduce operating costs by 18% by end of 2026', product:''},
    {id:'ebl2', num:'EPIC0010008', name:'Core Infrastructure Modernisation', type:'Epic', state:'Funnel', pct:0, size:'L', wsjf:6.8, art:'', st:'', goal:'g2', owner:'Raj', parent:'Reduce operating costs by 18% by end of 2026', product:''},
    {id:'ebl3', num:'EPIC0010009', name:'Digital Savings Platform', type:'Epic', state:'Backlog', pct:0, size:'S', wsjf:5.5, art:'', st:'', goal:'', owner:'Priya', parent:'', product:''},
    {id:'ebl4', num:'EPIC0010010', name:'Employee Digital Workspace', type:'Epic', state:'Funnel', pct:0, size:'M', wsjf:4.2, art:'', st:'', goal:'', owner:'Kiran', parent:'', product:''}
  ],
  // Helper: which epics are in backlog (no ST assignment)
  backlog: function(){ return this.all.filter(function(e){ return !e.art; }); },
  // Helper: group by ST
  groups: [
    {id:'st1', name:'Digital & Payments ST', type:'solution-train',
      epicIds: ['e1','e2','e3','e4']},
    {id:'st2', name:'Lending & Mortgages ST', type:'solution-train',
      epicIds: ['e5','e6']}
  ]
};

// ═══════════════════════════════════════════════════════
// CAPABILITIES
// ═══════════════════════════════════════════════════════
EAP.capabilities = {
  all: [
    {id:'c1', num:'CAP0010001', name:'Seamless Authentication across channels', type:'Capability', state:'Implementation', pct:65, size:'L', wsjf:15.2, parent:'Next-Gen Mobile Banking', art:'Digital Banking ART', owner:'Ananya', goal:'g1'},
    {id:'c2', num:'CAP0010002', name:'Real-time Risk and Fraud detection', type:'Capability', state:'In Progress', pct:30, size:'XL', wsjf:13.9, parent:'Next-Gen Mobile Banking', art:'Digital Banking ART', owner:'Ananya', goal:'g1'},
    {id:'c3', num:'CAP0010003', name:'Seamless Payments with retry flows', type:'Capability', state:'Blocked', pct:20, size:'L', wsjf:12.1, parent:'Next-Gen Mobile Banking', art:'Digital Banking ART', owner:'Ananya', goal:'g1'},
    {id:'c4', num:'CAP0010004', name:'Customer Account Visibility', type:'Capability', state:'Done', pct:100, size:'M', wsjf:9.8, parent:'Customer Self-Service', art:'Digital Banking ART', owner:'Priya', goal:'g2'},
    {id:'c5', num:'CAP0010005', name:'Self-Service Account Management', type:'Capability', state:'In Progress', pct:40, size:'M', wsjf:9.2, parent:'Customer Self-Service', art:'Digital Banking ART', owner:'Priya', goal:'g2'},
    {id:'c6', num:'CAP0010006', name:'Automated Onboarding with KYC', type:'Capability', state:'Funnel', pct:0, size:'L', wsjf:8.7, parent:'Mortgage Origination', art:'Lending & Mortgages ART', owner:'Raj', goal:'g2'},
    {id:'c7', num:'CAP0010007', name:'Credit Risk Scoring Engine', type:'Capability', state:'Funnel', pct:0, size:'XL', wsjf:7.4, parent:'Risk Assessment', art:'Lending & Mortgages ART', owner:'Priya', goal:'g2'},
    // Backlog
    {id:'cbl1', num:'CAP0010008', name:'Adapt content to cultural norms', type:'Capability', state:'Funnel', size:'S', wsjf:8.2, parent:'Localisation', art:'', owner:'Ananya', goal:''},
    {id:'cbl2', num:'CAP0010009', name:'Auto-translate text into other languages', type:'Capability', state:'Funnel', size:'S', wsjf:7.9, parent:'Localisation', art:'', owner:'Raj', goal:''},
    {id:'cbl3', num:'CAP0010010', name:'Market research for customer preferences', type:'Capability', state:'Funnel', size:'M', wsjf:7.1, parent:'Marketing', art:'', owner:'Priya', goal:''},
    {id:'cbl4', num:'CAP0010011', name:'Comprehensive marketing plan aligned to goals', type:'Capability', state:'Funnel', size:'L', wsjf:6.5, parent:'Marketing', art:'', owner:'Kiran', goal:''},
    {id:'cbl5', num:'CAP0010012', name:'Real-time regulatory compliance monitoring', type:'Capability', state:'Funnel', size:'L', wsjf:6.0, parent:'Compliance', art:'', owner:'Raj', goal:''}
  ],
  backlog: function(){ return this.all.filter(function(c){ return !c.art; }); },
  groups: [
    {id:'art1', name:'Digital Banking ART', type:'art', capIds:['c1','c2','c3','c4','c5']},
    {id:'art2', name:'Lending & Mortgages ART', type:'art', capIds:['c6','c7']}
  ]
};

// ═══════════════════════════════════════════════════════
// FEATURES — SINGLE SOURCE OF TRUTH
// pi: null = backlog, 'pi26' = committed to PI 26, etc.
// ═══════════════════════════════════════════════════════
EAP.allFeatures = [
  // ── PI 26 committed (7 from spec + 1 complete) ──
  {id:'f1',  num:'FTR0010001', name:'Fingerprint Login Redesign',         type:'Feature', state:'In Progress',    pct:65,  size:'M', wsjf:11.2, parent:'Seamless Auth',    team:'Auth',       pi:'pi26', pts:18, owner:'Ananya', goal:'g1'},
  {id:'f2',  num:'FTR0010002', name:'Real-time Fraud Alerts',              type:'Feature', state:'In Progress',    pct:25,  size:'L', wsjf:9.8,  parent:'Risk & Fraud',     team:'Fraud',      pi:'pi26', pts:29, atRisk:true, openDefects:3, owner:'Ananya', goal:'g1'},
  {id:'f3',  num:'FTR0010003', name:'Payment Confirmation Flow',           type:'Feature', state:'Blocked',        pct:20,  size:'L', wsjf:12.1, parent:'Payments',         team:'Payments',   pi:'pi26', pts:24, blocked:true, blockReason:'Auth API dependency Day 2', owner:'Ananya', goal:'g1'},
  {id:'f4',  num:'FTR0010004', name:'Balance on Home Screen',              type:'Feature', state:'Done',           pct:100, size:'S', wsjf:8.1,  parent:'Account Vis.',     team:'Mobile',     pi:'pi26', pts:21, owner:'Ananya', goal:'g1'},
  {id:'f5',  num:'FTR0010005', name:'Account Statement Export PDF',        type:'Feature', state:'In Progress',    pct:40,  size:'M', wsjf:7.4,  parent:'Self-Service',     team:'Accounts',   pi:'pi26', pts:13, owner:'Priya', goal:'g2'},
  {id:'f6',  num:'FTR0010006', name:'Streamlined Onboarding Flow',         type:'Feature', state:'Funnel',         pct:0,   size:'L', wsjf:8.3,  parent:'Onboarding',       team:'Onboard',    pi:'pi26', pts:22, noTeamSprint3:true, owner:'Raj', goal:'g2'},
  {id:'f7',  num:'FTR0010007', name:'Enhanced Biometric Auth Flow',        type:'Feature', state:'Backlog',        pct:0,   size:'M', wsjf:12.4, parent:'Seamless Auth',    team:'Auth',       pi:'pi26', pts:0, owner:'Ananya', goal:'g1'},
  // ── PI 27 planned ──
  {id:'f8',  num:'FTR0010008', name:'Dark Mode Support',                   type:'Feature', state:'Funnel', pct:0, size:'M', wsjf:8.4, parent:'Account Vis.',     team:'Mobile',    pi:'pi27', pts:0, owner:'Priya', goal:'g1'},
  {id:'f9',  num:'FTR0010009', name:'Transaction Dispute Resolution',      type:'Feature', state:'Funnel', pct:0, size:'L', wsjf:7.9, parent:'Self-Service',     team:'Accounts',  pi:'pi27', pts:0, owner:'Priya', goal:'g2'},
  {id:'f10', num:'FTR0010010', name:'Notification Preference Centre',      type:'Feature', state:'Analysis', pct:10, size:'S', wsjf:7.2, parent:'Payments',       team:'Payments',  pi:'pi27', pts:0, owner:'Kiran', goal:'g1'},
  {id:'f11', num:'FTR0010011', name:'Cross-Border Payment Support',        type:'Feature', state:'Funnel', pct:0, size:'XL', wsjf:6.8, parent:'Payments',         team:'Payments',  pi:'pi27', pts:0, owner:'Kiran', goal:'g1'},
  {id:'f12', num:'FTR0010012', name:'Account Aggregation API',             type:'Feature', state:'Funnel', pct:0, size:'L', wsjf:6.1, parent:'Open Banking',      team:'Accounts',  pi:'pi27', pts:0, owner:'Raj', goal:'g1'},
  {id:'f17', num:'FTR0010035', name:'Adaptive MFA Enrollment',             type:'Feature', state:'Funnel',   pct:0,  size:'M', wsjf:9.4, parent:'Seamless Auth',    team:'Auth',      pi:'pi27', pts:0, owner:'Ananya', goal:'g1'},
  {id:'f18', num:'FTR0010036', name:'Device Trust Scoring',                type:'Feature', state:'Funnel',   pct:0,  size:'L', wsjf:8.3, parent:'Risk & Fraud',     team:'Fraud',     pi:'pi27', pts:0, owner:'Ananya', goal:'g1'},
  {id:'f19', num:'FTR0010037', name:'Mobile Tokenisation Phase 1',         type:'Feature', state:'Analysis', pct:5,  size:'L', wsjf:7.8, parent:'Payments',         team:'Payments',  pi:'pi27', pts:0, owner:'Ananya', goal:'g1'},
  // ── PI 28 planned ──
  {id:'f13', num:'FTR0010013', name:'Statement Date Range Filter',         type:'Feature', state:'Funnel', pct:0, size:'S', wsjf:6.5, parent:'Self-Service',     team:'Accounts',  pi:'pi28', pts:0, owner:'Priya', goal:'g2'},
  {id:'f14', num:'FTR0010014', name:'Biometric Auth for Returning Users',  type:'Feature', state:'Funnel', pct:0, size:'S', wsjf:9.1, parent:'Seamless Auth',    team:'Auth',      pi:'pi28', pts:0, owner:'Ananya', goal:'g1'},
  {id:'f15', num:'FTR0010015', name:'PSD3 Compliance Module',              type:'Feature', state:'Funnel', pct:0, size:'XL', wsjf:13.2, parent:'Open Banking',    team:'Accounts',  pi:'pi28', pts:0, owner:'Raj', goal:'g1'},
  {id:'f16', num:'FTR0010016', name:'Investment Portfolio View',            type:'Feature', state:'Funnel', pct:0, size:'M', wsjf:6.1, parent:'Account Vis.',      team:'Accounts',  pi:'pi28', pts:0, owner:'Priya', goal:'g1'},
  // ── Backlog (no PI) — 18 items for volume ──
  {id:'bl1',  num:'FTR0010017', name:'Instant Payment Notifications',       type:'Feature', state:'Funnel',   size:'S', wsjf:10.8, parent:'Payments',        team:'', pi:null, pts:8, owner:'Kiran', goal:'g1'},
  {id:'bl2',  num:'FTR0010018', name:'Transaction Dispute Resolution',      type:'Feature', state:'Backlog',  size:'M', wsjf:8.7,  parent:'Self-Service',    team:'', pi:null, pts:5, owner:'Priya', goal:'g2'},
  {id:'bl3',  num:'FTR0010019', name:'Scheduled Payment Manager',           type:'Feature', state:'Funnel',   size:'S', wsjf:7.1,  parent:'Payments',        team:'', pi:null, pts:8, owner:'Ananya', goal:'g1'},
  {id:'bl4',  num:'FTR0010020', name:'Account Statement Export — Additional Scope', type:'Feature', state:'Backlog', size:'S', wsjf:5.4, parent:'Self-Service', team:'', pi:null, pts:5, owner:'Priya', goal:'g2'},
  {id:'bl5',  num:'FTR0010021', name:'Loan Application Wizard',             type:'Feature', state:'Funnel',   size:'L', wsjf:4.2,  parent:'Onboarding',      team:'', pi:null, pts:13, stalePIs:3, owner:'Raj', goal:'g2'},
  {id:'bl6',  num:'FTR0010022', name:'Investment Portfolio View',            type:'Feature', state:'Funnel',   size:'M', wsjf:3.8,  parent:'Account Vis.',    team:'', pi:null, pts:8, stalePIs:3, owner:'Priya', goal:'g1'},
  {id:'bl7',  num:'FTR0010023', name:'Multi-Currency Wallet Support',        type:'Feature', state:'Funnel',   size:'L', wsjf:5.1,  parent:'Payments',        team:'', pi:null, pts:13, owner:'Kiran', goal:'g1'},
  {id:'bl8',  num:'FTR0010024', name:'Automated KYC Refresh Flow',           type:'Feature', state:'Analysis', size:'M', wsjf:4.8,  parent:'Onboarding',      team:'', pi:null, pts:8, owner:'Raj', goal:'g2'},
  {id:'bl9',  num:'FTR0010025', name:'Push Notification Preferences',        type:'Feature', state:'Backlog',  size:'S', wsjf:4.2,  parent:'Payments',        team:'', pi:null, pts:5, owner:'Kiran', goal:''},
  {id:'bl10', num:'FTR0010026', name:'Card Freeze/Unfreeze Toggle',          type:'Feature', state:'Funnel',   size:'S', wsjf:3.9,  parent:'Account Vis.',    team:'', pi:null, pts:3, owner:'Ananya', goal:'g1'},
  {id:'bl11', num:'FTR0010027', name:'Spending Insights Dashboard',          type:'Feature', state:'Funnel',   size:'M', wsjf:3.5,  parent:'Account Vis.',    team:'', pi:null, pts:8, owner:'Priya', goal:'g1'},
  {id:'bl12', num:'FTR0010028', name:'Contactless Payment Limit Override',   type:'Feature', state:'Funnel',   size:'S', wsjf:3.2,  parent:'Payments',        team:'', pi:null, pts:3, owner:'Ananya', goal:'g1'},
  {id:'bl13', num:'FTR0010029', name:'Standing Order Management',            type:'Feature', state:'Backlog',  size:'M', wsjf:3.0,  parent:'Payments',        team:'', pi:null, pts:8, owner:'Kiran', goal:''},
  {id:'bl14', num:'FTR0010030', name:'Direct Debit Cancellation Flow',       type:'Feature', state:'Funnel',   size:'S', wsjf:2.8,  parent:'Payments',        team:'', pi:null, pts:5, owner:'Kiran', goal:''},
  {id:'bl15', num:'FTR0010031', name:'Savings Goal Tracker',                 type:'Feature', state:'Funnel',   size:'M', wsjf:2.5,  parent:'Account Vis.',    team:'', pi:null, pts:8, owner:'Priya', goal:'g1'},
  {id:'bl16', num:'FTR0010032', name:'Open Banking Consent Manager',         type:'Feature', state:'Analysis', size:'L', wsjf:5.8,  parent:'Open Banking',    team:'', pi:null, pts:13, owner:'Raj', goal:'g1'},
  {id:'bl17', num:'FTR0010033', name:'Customer Feedback Widget',             type:'Feature', state:'Funnel',   size:'S', wsjf:2.2,  parent:'Self-Service',    team:'', pi:null, pts:3, owner:'Priya', goal:'g2'},
  {id:'bl18', num:'FTR0010034', name:'In-App Chat Support',                  type:'Feature', state:'Funnel',   size:'L', wsjf:4.5,  parent:'Self-Service',    team:'', pi:null, pts:13, owner:'Priya', goal:'g2'},
  // Ananya-owned backlog (PM-groomed, awaiting capacity)
  {id:'bl19', num:'FTR0010038', name:'Real-time Risk Scoring API',           type:'Feature', state:'Funnel',   size:'L', wsjf:7.6,  parent:'Risk & Fraud',    team:'', pi:null, pts:13, owner:'Ananya', goal:'g1'},
  {id:'bl20', num:'FTR0010039', name:'Customer-Initiated Account Lock',      type:'Feature', state:'Funnel',   size:'S', wsjf:6.4,  parent:'Account Vis.',    team:'', pi:null, pts:5,  owner:'Ananya', goal:'g1'},
  {id:'bl21', num:'FTR0010040', name:'Adaptive Session Lifetime',            type:'Feature', state:'Backlog',  size:'M', wsjf:5.9,  parent:'Seamless Auth',   team:'', pi:null, pts:8,  owner:'Ananya', goal:'g1'},
  {id:'bl22', num:'FTR0010041', name:'Cross-Device Login Continuity',        type:'Feature', state:'Funnel',   size:'L', wsjf:5.2,  parent:'Seamless Auth',   team:'', pi:null, pts:13, owner:'Ananya', goal:'g1'},
  {id:'bl23', num:'FTR0010042', name:'Mobile Wallet Phase 2',                type:'Feature', state:'Funnel',   size:'M', wsjf:4.7,  parent:'Payments',        team:'', pi:null, pts:8,  owner:'Ananya', goal:''},
  {id:'bl24', num:'FTR0010043', name:'Continuous Authentication Pilot',      type:'Feature', state:'Funnel',   size:'M', wsjf:4.0,  parent:'Seamless Auth',   team:'', pi:null, pts:8,  owner:'Ananya', goal:'g1'}
];

// ── Feature accessors ──────────────────────────────────
EAP.features = {
  backlog: function(){ return EAP.allFeatures.filter(function(f){ return f.pi === null; }); },
  byPI: function(piId){ return EAP.allFeatures.filter(function(f){ return f.pi === piId; }); },
  pis: EAP._piDisplay.filter(function(p) { return parseInt(p.id.replace('pi','')) >= 26; }).map(function(p, i) {
    return {id:p.id, name:p.name, dates:p.dates, active:p.active, capPct: i===0?68:0, totalPts: i===0?91:0, donePts: i===0?24:0};
  })
};

// ═══════════════════════════════════════════════════════
// WORK ITEMS — Stories, Defects, Case Tasks
// ═══════════════════════════════════════════════════════
EAP.workItems = {
  // Backlog ranking: lower rank = higher priority. Realistic PM-ranked
  // interleave across Story / Defect / CaseTask, not bucket-by-type.
  backlog: {
    Story: [
      {id:'blw1', num:'STRY61094301', name:'Report fraudulent transaction and recover funds',  state:'Draft', pts:3, owner:'Vikram', team:'Payments Team',  type:'Story', parent:'Real-time Fraud Alerts',         goal:'g1', rank:6},
      {id:'blw2', num:'STRY61094302', name:'Change password regularly for account security',    state:'Draft', pts:2, owner:'James',  team:'Auth Team',      type:'Story', parent:'Fingerprint Login Redesign',     goal:'g1', rank:11},
      {id:'blw3', num:'STRY61094303', name:'Log out remotely to prevent unauthorised access',   state:'Draft', pts:2, owner:'Tomás',  team:'Mobile Exp Team',type:'Story', parent:'Enhanced Biometric Auth Flow',   goal:'g1', rank:13},
      {id:'blw4', num:'STRY61094304', name:'Set up PIN as additional protection layer',         state:'Draft', pts:3, owner:'Kiran',  team:'Auth Team',      type:'Story', parent:'Fingerprint Login Redesign',     goal:'g1', rank:8},
      {id:'blw5', num:'STRY61094305', name:'View devices currently logged into account',        state:'Draft', pts:2, owner:'Yuki',   team:'Mobile Exp Team',type:'Story', parent:'Enhanced Biometric Auth Flow',   goal:'g1', rank:15},
      {id:'blw6', num:'STRY61094306', name:'Report security vulnerabilities discovered',        state:'Draft', pts:3, owner:'Marcus', team:'Fraud Team',     type:'Story', parent:'Real-time Fraud Alerts',         goal:'g1', rank:2},
      {id:'blw7', num:'STRY61094307', name:'Export transaction history as CSV',                  state:'Draft', pts:2, owner:'Lena',   team:'Accounts Team',  type:'Story', parent:'Account Statement Export PDF',   goal:'g2', rank:17},
      {id:'blw8', num:'STRY61094308', name:'Enable face recognition for login',                 state:'Draft', pts:5, owner:'James',  team:'Auth Team',      type:'Story', parent:'Biometric Auth for Returning Users', goal:'g1', rank:19},
      {id:'blw9', num:'STRY61094309', name:'Refactor token refresh module for clarity',          state:'Draft', pts:3, owner:'James',  team:'Auth Team',      type:'Story', parent:'Fingerprint Login Redesign',     goal:'g1', rank:23},
      {id:'blw10',num:'STRY61094310', name:'Add audit logs for all auth events',                 state:'Draft', pts:5, owner:'James',  team:'Auth Team',      type:'Story', parent:'Real-time Fraud Alerts',         goal:'g1', rank:24}
    ],
    Defect: [
      {id:'bld1', num:'DEF0192954', name:'Resource Report forecast utilisation not calculated with days off', state:'Backlog', pts:0, owner:'Mei',    team:'Payments Team',  type:'Defect', parent:'',                              goal:'',   rank:14},
      {id:'bld2', num:'DEF0366785', name:'Mobile timesheets single-select should auto-close modal',          state:'Backlog', pts:0, owner:'Yuki',   team:'Mobile Exp Team',type:'Defect', parent:'',                              goal:'',   rank:18},
      {id:'bld3', num:'DEF0500640', name:'Push notification delayed on Android 14 devices',                  state:'Backlog', pts:0, owner:'Tomás',  team:'Mobile Exp Team',type:'Defect', parent:'Real-time Fraud Alerts',        goal:'',   rank:21},
      {id:'bld4', num:'DEF0500641', name:'Statement PDF missing page numbers on multi-page exports',         state:'Backlog', pts:0, owner:'Omar',   team:'Accounts Team',  type:'Defect', parent:'Account Statement Export PDF',  goal:'g2', rank:9},
      {id:'bld7', num:'DEF0500644', name:'Balance widget shows stale data after background app resume',      state:'Backlog', pts:2, owner:'Yuki',   team:'Mobile Exp Team',type:'Defect', parent:'Balance on Home Screen',        goal:'g1', rank:7},
      {id:'bld8', num:'DEF0500645', name:'Fraud webhook retry logic creates duplicate entries',              state:'Backlog', pts:3, owner:'Marcus', team:'Fraud Team',     type:'Defect', parent:'Real-time Fraud Alerts',        goal:'g1', rank:5},
      {id:'bld10',num:'DEF0500647', name:'Onboarding KYC upload crashes on large file',                     state:'Backlog', pts:0, owner:'Devi',   team:'Onboarding Team',type:'Defect', parent:'Streamlined Onboarding Flow',   goal:'g2', rank:3},
      {id:'bld11',num:'DEF0500648', name:'Fraud detection model false positive rate above threshold',       state:'Backlog', pts:5, owner:'Ananya', team:'Fraud Team',     type:'Defect', parent:'Real-time Fraud Alerts',        goal:'g1', rank:1},
      {id:'bld12',num:'DEF0500649', name:'Account statement date filter off-by-one error',                  state:'Backlog', pts:1, owner:'Lena',   team:'Accounts Team',  type:'Defect', parent:'Account Statement Export PDF',  goal:'g2', rank:12},
      {id:'bld13',num:'DEF0500650', name:'Biometric library throws on iOS 17.5 lock-screen entry',          state:'Backlog', pts:2, owner:'James',  team:'Auth Team',      type:'Defect', parent:'Fingerprint Login Redesign',    goal:'g1', rank:25}
    ],
    CaseTask: [
      {id:'blc1', num:'CSTASK1070158', name:'Write acceptance criteria for biometric fallback flow', state:'Draft', pts:1, owner:'Ananya', team:'Auth Team',     type:'Case Task', parent:'Fingerprint Login Redesign',    goal:'g1', rank:4},
      {id:'blc2', num:'CSTASK1215264', name:'Update test plan for fraud alert deduplication',        state:'Draft', pts:1, owner:'Aisha',  team:'Fraud Team',    type:'Case Task', parent:'Real-time Fraud Alerts',        goal:'g1', rank:10},
      {id:'blc4', num:'CSTASK1222243', name:'Review KYC compliance checklist sign-off',              state:'Draft', pts:1, owner:'Ananya', team:'Onboarding Team',type:'Case Task', parent:'Streamlined Onboarding Flow',  goal:'g2', rank:16},
      {id:'blc5', num:'CSTASK1222244', name:'Create runbook for biometric service deployment',       state:'Draft', pts:2, owner:'Kiran',  team:'Auth Team',     type:'Case Task', parent:'Fingerprint Login Redesign',    goal:'g1', rank:20},
      {id:'blc6', num:'CSTASK1222245', name:'Coordinate UAT session for statement export',           state:'Draft', pts:1, owner:'Omar',   team:'Accounts Team', type:'Case Task', parent:'Account Statement Export PDF',  goal:'g2', rank:22}
    ]
  },
  sprints: [
    {id:'sp2', name:'Sprint 2', dates:EAP._sprintDisplay[1].dates, active:true, capPct:64, totalPts:46, donePts:8,
      items: [
        {id:'ls6',  num:'STRY61094201', name:'Handle fallback to PIN on failed biometric scan',     type:'Story',     state:'In Progress', pct:50, pts:3, owner:'James',  team:'Auth Team',     parent:'Fingerprint Login Redesign', goal:'g1'},
        {id:'ls7',  num:'STRY61094202', name:'Build payment confirmation screen layout',            type:'Story',     state:'In Progress', pct:40, pts:5, owner:'Vikram', team:'Payments Team', parent:'Payment Confirmation Flow', goal:'g1'},
        {id:'ls8',  num:'STRY61094203', name:'Integrate Auth API for payment confirmation flow',    type:'Story',     state:'In Progress', pct:10, pts:8, owner:'Mei',    team:'Payments Team', blocked:true, blockReason:'Auth API dependency Day 2', parent:'Payment Confirmation Flow', goal:'g1'},
        {id:'ls9',  num:'STRY61094204', name:'Payment amount validation rules and error states',    type:'Story',     state:'In Review',   pct:80, pts:3, owner:'Vikram', team:'Payments Team', parent:'Payment Confirmation Flow', goal:'g1'},
        {id:'ls10', num:'STRY61094205', name:'Fraud detection webhook integration and retry logic', type:'Story',     state:'In Progress', pct:30, pts:8, owner:'Marcus', team:'Fraud Team',    parent:'Real-time Fraud Alerts', goal:'g1'},
        {id:'ls11', num:'STRY61094206', name:'Balance refresh on app resume and foreground event',  type:'Story',     state:'To Do',       pct:0,  pts:5, owner:'Tomás',  team:'Mobile Exp Team', parent:'Balance on Home Screen', goal:'g1'},
        {id:'ls12', num:'STRY61094207', name:'Auth session expiry handler and token refresh',       type:'Story',     state:'In Progress', pct:45, pts:3, owner:'Sana',   team:'Auth Team',     parent:'Fingerprint Login Redesign', goal:'g1'},
        {id:'ls13', num:'STRY61094208', name:'Account statement data fetch from backend API',       type:'Story',     state:'To Do',       pct:0,  pts:3, owner:'Lena',   team:'Accounts Team', parent:'Account Statement Export PDF', goal:'g2'},
        {id:'ls14', num:'STRY61094209', name:'KYC document upload step in onboarding flow',         type:'Story',     state:'To Do',       pct:0,  pts:4, owner:'Nina',   team:'Onboarding Team', parent:'Streamlined Onboarding Flow', goal:'g2'},
        // Defects + Case Task in flight this sprint (realistic mix, not 100% Stories)
        {id:'bld5', num:'DEF0500642',   name:'Fraud alert duplicate firing on card-not-present transactions', type:'Defect',    state:'In Progress', pct:30, pts:2, owner:'Aisha',  team:'Fraud Team',     parent:'Real-time Fraud Alerts',     goal:'g1'},
        {id:'bld6', num:'DEF0500643',   name:'Auth token refresh fails silently after 24h session',           type:'Defect',    state:'In Progress', pct:60, pts:3, owner:'Sana',   team:'Auth Team',      parent:'Fingerprint Login Redesign', goal:'g1'},
        {id:'bld9', num:'DEF0500646',   name:'Payment confirmation timeout not handled gracefully',           type:'Defect',    state:'To Do',       pct:0,  pts:2, owner:'Vikram', team:'Payments Team',  parent:'Payment Confirmation Flow',  goal:'g1'},
        {id:'blc3', num:'CSTASK1222242',name:'Document API contract for payment confirmation',                type:'Case Task', state:'In Progress', pct:50, pts:2, owner:'Mei',    team:'Payments Team',  parent:'Payment Confirmation Flow',  goal:'g1'},
        {id:'ls27', num:'STRY61094222', name:'Build biometric onboarding for new users',                       type:'Story',     state:'In Progress', pct:25, pts:5, owner:'James',  team:'Auth Team',      parent:'Enhanced Biometric Auth Flow', goal:'g1'}
      ]
    },
    {id:'sp3', name:'Sprint 3', dates:EAP._sprintDisplay[2].dates, active:false, capPct:0, totalPts:34, donePts:0,
      items: [
        {id:'ls15', num:'STRY61094210', name:'Retry mechanism for failed payment submissions',       type:'Story', state:'Planned', pct:0, pts:3, owner:'Vikram', team:'Payments Team', parent:'Payment Confirmation Flow', goal:'g1'},
        {id:'ls16', num:'STRY61094211', name:'Scheduled payment UI with recurring options',          type:'Story', state:'Planned', pct:0, pts:8, owner:'Mei',    team:'Payments Team', parent:'Payment Confirmation Flow', goal:'g1'},
        {id:'ls17', num:'STRY61094212', name:'Statement PDF export component and layout',            type:'Story', state:'Planned', pct:0, pts:5, owner:'Omar',   team:'Accounts Team', parent:'Statement Export PDF', goal:'g2'},
        {id:'ls18', num:'STRY61094213', name:'Auth session expiry handler regression tests',         type:'Story', state:'Planned', pct:0, pts:3, owner:'James',  team:'Auth Team', parent:'Fingerprint Login Redesign', goal:'g1'},
        {id:'ls19', num:'STRY61094214', name:'Fraud alert deduplication logic and tests',            type:'Story', state:'Planned', pct:0, pts:5, owner:'Aisha',  team:'Fraud Team', parent:'Real-time Fraud Alerts', goal:'g1'},
        {id:'ls20', num:'STRY61094215', name:'App navigation component refactor',                    type:'Story', state:'Planned', pct:0, pts:3, owner:'Yuki',   team:'Mobile Exp Team', parent:'Dark Mode Support', goal:'g1'},
        {id:'ls21', num:'STRY61094216', name:'Onboarding step progress tracker component',           type:'Story', state:'Planned', pct:0, pts:2, owner:'Devi',   team:'Onboarding Team', parent:'Streamlined Onboarding Flow', goal:'g2'},
        {id:'ls28', num:'STRY61094223', name:'Migrate auth tests to new test framework',             type:'Story', state:'Planned', pct:0, pts:5, owner:'James',  team:'Auth Team',       parent:'Fingerprint Login Redesign',  goal:'g1'}
      ]
    },
    {id:'sp4', name:'Sprint 4', dates:EAP._sprintDisplay[3].dates, active:false, capPct:0, totalPts:32, donePts:0,
      items: [
        {id:'ls22', num:'STRY61094217', name:'Recurring payment logic and edge case handling',       type:'Story', state:'Planned', pct:0, pts:8, owner:'Vikram', team:'Payments Team', parent:'Payment Confirmation Flow', goal:'g1'},
        {id:'ls23', num:'STRY61094218', name:'Payment limit enforcement at API level',               type:'Story', state:'Planned', pct:0, pts:5, owner:'Mei',    team:'Payments Team', parent:'Payment Confirmation Flow', goal:'g1'},
        {id:'ls24', num:'STRY61094219', name:'Biometric returning user login flow',                  type:'Story', state:'Planned', pct:0, pts:3, owner:'Sana',   team:'Auth Team', parent:'Fingerprint Login Redesign', goal:'g1'},
        {id:'ls25', num:'STRY61094220', name:'Fraud dispute UI integration with backend',            type:'Story', state:'Planned', pct:0, pts:5, owner:'Marcus', team:'Fraud Team', parent:'Real-time Fraud Alerts', goal:'g1'},
        {id:'ls26', num:'STRY61094221', name:'Dark mode story card components',                      type:'Story', state:'Planned', pct:0, pts:3, owner:'Tomás',  team:'Mobile Exp Team', parent:'Dark Mode Support', goal:'g1'},
        {id:'ls29', num:'STRY61094224', name:'Implement step-up auth for high-value transactions',   type:'Story', state:'Planned', pct:0, pts:8, owner:'James',  team:'Auth Team',       parent:'Enhanced Biometric Auth Flow', goal:'g1'}
      ]
    },
    {id:'sp5', name:'IP Sprint', dates:EAP._sprintDisplay[4].dates, active:false, capPct:0, totalPts:0, donePts:0, items:[]}
  ]
};

// ═══════════════════════════════════════════════════════
// HIERARCHY — references goals, epics, capabilities, features
// ═══════════════════════════════════════════════════════
EAP.hierarchy = [
  {id:'g1', type:'goal', name:'Become top digital bank in UK by 2027', state:'On Track', pct:42, pts:28, owner:'', team:'',
    children: [
      {id:'e1', type:'epic', name:'Next-Gen Mobile Banking Platform', state:'Implementation', pct:42, pts:18, owner:'Ananya', team:'Digital Banking ART',
        children: [
          {id:'c1', type:'capability', name:'Seamless Authentication', state:'In Progress', pct:65, pts:10, owner:'Ananya', team:'Auth',
            children: [
              {id:'f1', type:'feature', name:'Fingerprint Login Redesign', state:'In Progress', pct:65, pts:18, owner:'Ananya', team:'Auth',
                children: [
                  {id:'s1', type:'story', name:'Build biometric prompt UI', state:'Done', pct:100, pts:5, owner:'Kiran', team:'Auth'},
                  {id:'s2', type:'story', name:'Handle fallback to PIN', state:'In Progress', pct:50, pts:3, owner:'Kiran', team:'Auth'},
                  {id:'s3', type:'story', name:'Error state on failed scan', state:'To Do', pct:0, pts:2, owner:'Sana', team:'Auth'},
                  {id:'d1', type:'defect', name:'DEF-001: Biometric fails on iOS 17.4', state:'Blocked', pct:0, pts:0, owner:'Sana', team:'Auth'}
                ]},
              {id:'f7', type:'feature', name:'Enhanced Biometric Auth Flow', state:'Backlog', pct:0, pts:0, owner:'', team:'Auth', children:[]}
            ]},
          {id:'c2', type:'capability', name:'Real-time Risk and Fraud', state:'In Progress', pct:25, pts:29, owner:'Ananya', team:'Fraud',
            children: [
              {id:'f2', type:'feature', name:'Real-time Fraud Alerts', state:'In Progress', pct:25, pts:29, owner:'Ananya', team:'Fraud',
                children: [
                  {id:'s4', type:'story', name:'Fraud detection webhook', state:'In Progress', pct:30, pts:8, owner:'Marcus', team:'Fraud'},
                  {id:'s5', type:'story', name:'Alert delivery service', state:'In Progress', pct:10, pts:8, owner:'Aisha', team:'Fraud'},
                  {id:'d2', type:'defect', name:'DEF-002: Alert not firing card-not-present', state:'Blocked', pct:0, pts:0, owner:'Marcus', team:'Fraud'},
                  {id:'d3', type:'defect', name:'DEF-003: Duplicate alerts on retry', state:'Blocked', pct:0, pts:0, owner:'Aisha', team:'Fraud'}
                ]}
            ]},
          {id:'c3', type:'capability', name:'Seamless Payments', state:'Blocked', pct:20, pts:24, owner:'Ananya', team:'Payments',
            children: [
              {id:'f3', type:'feature', name:'Payment Confirmation Flow', state:'Blocked', pct:20, pts:24, owner:'Ananya', team:'Payments',
                children: [
                  {id:'s6', type:'story', name:'Auth API integration', state:'Blocked', pct:10, pts:8, owner:'Vikram', team:'Payments'},
                  {id:'s7', type:'story', name:'Confirmation screen UI', state:'In Progress', pct:40, pts:5, owner:'Mei', team:'Payments'},
                  {id:'s8', type:'story', name:'Payment validation rules', state:'In Review', pct:80, pts:3, owner:'Vikram', team:'Payments'}
                ]}
            ]},
          {id:'c4', type:'capability', name:'Customer Account Visibility', state:'Done', pct:100, pts:21, owner:'Ananya', team:'Mobile',
            children: [
              {id:'f4', type:'feature', name:'Balance on Home Screen', state:'Done', pct:100, pts:21, owner:'Ananya', team:'Mobile',
                children: [
                  {id:'s9', type:'story', name:'Balance widget build', state:'Done', pct:100, pts:8, owner:'Tomás', team:'Mobile'},
                  {id:'s10', type:'story', name:'Refresh on app resume', state:'Done', pct:100, pts:5, owner:'Yuki', team:'Mobile'},
                  {id:'s11', type:'story', name:'Balance formatting and currency', state:'Done', pct:100, pts:8, owner:'Tomás', team:'Mobile'}
                ]}
            ]}
        ]},
      {id:'e3', type:'epic', name:'Open Banking API Programme', state:'Review', pct:0, pts:0, owner:'Raj', team:'Digital Banking ART',
        children: []}
    ]},
  {id:'g2', type:'goal', name:'Reduce operating costs by 18% by end of 2026', state:'At Risk', pct:12, pts:72, owner:'', team:'',
    children: [
      {id:'e2', type:'epic', name:'Customer Self-Service Expansion', state:'Funnel', pct:0, pts:0, owner:'Priya', team:'Digital Banking ART',
        children: [
          {id:'c5', type:'capability', name:'Self-Service Account Management', state:'In Progress', pct:40, pts:13, owner:'Priya', team:'Accounts',
            children: [
              {id:'f5', type:'feature', name:'Account Statement Export PDF', state:'In Progress', pct:40, pts:13, owner:'Priya', team:'Accounts',
                children: [
                  {id:'s20', type:'story', name:'PDF generation service', state:'In Progress', pct:50, pts:8, owner:'Lena', team:'Accounts'},
                  {id:'s21', type:'story', name:'Statement template design', state:'To Do', pct:0, pts:5, owner:'Omar', team:'Accounts'}
                ]}
            ]},
          {id:'c6a', type:'capability', name:'Automated Onboarding', state:'Funnel', pct:0, pts:22, owner:'Raj', team:'Onboard',
            children: [
              {id:'f6', type:'feature', name:'Streamlined Onboarding Flow', state:'Funnel', pct:0, pts:22, owner:'Raj', team:'Onboard',
                children: [
                  {id:'s22', type:'story', name:'KYC automation service', state:'To Do', pct:0, pts:8, owner:'Nina', team:'Onboard'},
                  {id:'s23', type:'story', name:'Document verification API', state:'To Do', pct:0, pts:5, owner:'Devi', team:'Onboard'},
                  {id:'s24', type:'story', name:'Onboarding progress tracker', state:'To Do', pct:0, pts:5, owner:'Nina', team:'Onboard'},
                  {id:'s25', type:'story', name:'E-signature component', state:'To Do', pct:0, pts:4, owner:'Devi', team:'Onboard'}
                ]}
            ]}
        ]},
      {id:'e2b', type:'epic', name:'Process Automation Platform', state:'In Progress', pct:25, pts:26, owner:'Priya', team:'Digital Banking ART',
        children: []}
    ]}
];

// ═══════════════════════════════════════════════════════
// BOARD CONFIG
// ═══════════════════════════════════════════════════════
EAP.workflowColumns = ['Funnel','Review','Analysis','Backlog','Implementation','Done'];
EAP.trackColumns = ['Draft','Ready','In Progress','In Review','Testing','Ready for Acceptance','Accepted','Complete','Cancelled'];

// Dependencies — cross-PI
// Convention: `from` = prerequisite (must finish first), `to` = dependent (waits for from).
// Arrow is drawn: prerequisite → dependent (forward in time).
// Types: conflict = prerequisite blocked/late; risk = tight timeline; satisfied = prerequisite done/on-track.
EAP.featureDeps = [
  {from:'f1',  to:'f9',  type:'risk',      reason:'Fingerprint Login (PI 26) must complete before Transaction Dispute (PI 27) — Auth needed for dispute identity verification'},
  {from:'f3',  to:'f11', type:'conflict',  reason:'Payment Confirmation (PI 26) is Blocked — Cross-Border Payment Support (PI 27) cannot proceed'},
  {from:'f4',  to:'f8',  type:'satisfied', reason:'Balance on Home Screen (PI 26) is Done — Dark Mode (PI 27) has its dependency met'},
  {from:'f1',  to:'f14', type:'risk',      reason:'Fingerprint Login (PI 26) must complete for Biometric Auth Returning Users (PI 28) — tight sequence'},
  {from:'f3',  to:'f15', type:'conflict',  reason:'Payment Confirmation blocker cascades to PSD3 Compliance (PI 28) — regulatory deadline at risk'},
  {from:'f12', to:'f15', type:'risk',      reason:'Account Aggregation API (PI 27) prerequisite for PSD3 Compliance (PI 28) — open banking APIs required'},
  {from:'f2',  to:'f9',  type:'satisfied', reason:'Real-time Fraud Alerts (PI 26) on track — Transaction Dispute (PI 27) dependency will be met'}
];

// Work Item dependencies (cross-sprint)
// Same convention: from = prerequisite, to = dependent.
EAP.wiDeps = [
  {from:'ls9',  to:'ls15', type:'risk',      reason:'Payment validation (Sprint 2, In Review) must complete before Retry mechanism (Sprint 3) can start'},
  {from:'ls15', to:'ls22', type:'satisfied', reason:'Retry mechanism (Sprint 3) correctly sequenced before Recurring payment (Sprint 4)'},
  {from:'ls12', to:'ls18', type:'satisfied', reason:'Auth session handler (Sprint 2) will complete before regression tests (Sprint 3)'}
];

// ═══════════════════════════════════════════════════════
// INSIGHTS — per view/level
// ═══════════════════════════════════════════════════════
// ── Individual workload profiles (for Task Board member filter) ──
EAP.memberWorkload = {
  'Kiran':  { assigned:2, inProgress:1, done:1, blocked:0, avgCycle:2.1, wipLimit:2, sprintPts:5,  commitPts:7,  predictFinish:80 },
  'Sana':   { assigned:2, inProgress:1, done:0, blocked:0, avgCycle:1.8, wipLimit:2, sprintPts:6,  commitPts:8,  predictFinish:75 },
  'James':  { assigned:5, inProgress:2, done:1, blocked:0, avgCycle:1.9, wipLimit:3, sprintPts:8,  commitPts:11, predictFinish:84 },
  'Vikram': { assigned:4, inProgress:2, done:1, blocked:1, avgCycle:2.8, wipLimit:2, sprintPts:16, commitPts:21, predictFinish:64 },
  'Mei':    { assigned:2, inProgress:1, done:0, blocked:1, avgCycle:3.1, wipLimit:2, sprintPts:11, commitPts:11, predictFinish:55 },
  'Marcus': { assigned:2, inProgress:1, done:0, blocked:0, avgCycle:2.4, wipLimit:2, sprintPts:8,  commitPts:13, predictFinish:71 },
  'Aisha':  { assigned:1, inProgress:1, done:0, blocked:0, avgCycle:1.9, wipLimit:2, sprintPts:5,  commitPts:5,  predictFinish:90 },
  'Tomás':  { assigned:2, inProgress:0, done:0, blocked:0, avgCycle:1.5, wipLimit:2, sprintPts:5,  commitPts:8,  predictFinish:60 },
  'Yuki':   { assigned:1, inProgress:0, done:0, blocked:0, avgCycle:1.6, wipLimit:2, sprintPts:3,  commitPts:3,  predictFinish:88 },
  'Lena':   { assigned:2, inProgress:1, done:0, blocked:0, avgCycle:2.2, wipLimit:2, sprintPts:3,  commitPts:6,  predictFinish:68 },
  'Omar':   { assigned:1, inProgress:0, done:0, blocked:0, avgCycle:2.0, wipLimit:2, sprintPts:0,  commitPts:5,  predictFinish:50 },
  'Nina':   { assigned:1, inProgress:0, done:0, blocked:0, avgCycle:1.7, wipLimit:2, sprintPts:0,  commitPts:4,  predictFinish:45 },
  'Devi':   { assigned:1, inProgress:0, done:0, blocked:0, avgCycle:1.4, wipLimit:2, sprintPts:0,  commitPts:2,  predictFinish:70 }
};

// ── Team health dimensions (for heatmap grid) ──
// cap=capacity%, flow=cycle time health, qual=defect trend, block=blocked count
EAP.teamHealth = {
  'Auth':       { cap:'healthy', flow:'healthy', qual:'watch',   block:'healthy', capV:80,  flowV:2.1, qualV:3,  blockV:0 },
  'Payments':   { cap:'over',    flow:'watch',   qual:'healthy', block:'over',    capV:92,  flowV:3.1, qualV:1,  blockV:2 },
  'Fraud':      { cap:'healthy', flow:'over',    qual:'over',    block:'healthy', capV:78,  flowV:4.2, qualV:8,  blockV:0 },
  'Mobile':     { cap:'healthy', flow:'healthy', qual:'healthy', block:'healthy', capV:70,  flowV:1.5, qualV:0,  blockV:0 },
  'Accounts':   { cap:'healthy', flow:'watch',   qual:'watch',   block:'healthy', capV:65,  flowV:2.8, qualV:2,  blockV:0 },
  'Onboard':    { cap:'healthy', flow:'healthy', qual:'healthy', block:'healthy', capV:60,  flowV:1.7, qualV:0,  blockV:0 }
};

// Signal types: ai=true means AI-inferred (sparkle + teal + confidence + source).
// ai=false or absent means rule-based (system fact, no sparkle, no confidence).
EAP.insights = {
  'art-Feature-backlog': {
    signals: [
      {level:'urgent', ai:true, confidence:'High', title:'47 customers flagged biometric issues this week', desc:'Up 3× from last month. Enhanced Biometric Auth Flow is ranked #1 by WSJF with no PI commitment.', action:'Plan into PI 26', meta:'Based on 47 support tickets, 12 NPS comments'},
      {level:'urgent', ai:true, confidence:'High', title:'New customer theme: payment confirmation too slow', desc:'31 mentions in 7 days. No Feature in backlog matches this pattern.', action:'Create Feature', meta:'Analysing 31 support tickets across 3 channels'},
      {level:'urgent', title:'2 Features backlogged for 3+ PIs', desc:'Loan Application Wizard and Investment Portfolio View have never been pulled. Backlog noise increasing.', action:'Prioritise or remove', meta:'Comparing backlog age across 18 items'},
      {level:'watch', ai:true, confidence:'Moderate', title:'3 competitor banks launched biometric login this quarter', desc:'Accelerating Enhanced Biometric Auth Flow over lower-ranked items makes strategic sense.', action:'Reprioritise', meta:'Monitoring 12 competitor product releases'},
      {level:'watch', ai:true, confidence:'Moderate', title:'PSD3 regulatory update published', desc:'Transaction Dispute Resolution may need scope change to comply by Q3 2026.', action:'Review scope', meta:'Regulatory feed — published 3 days ago'},
      {level:'ok', title:'Mobile Exp has unallocated capacity in Sprint 3', desc:'No Features currently assigned. Opportunity to pull from backlog.', action:'', meta:'Capacity data from 6 teams'}
    ]
  },
  // ── BACKLOG — "What should we do next?" (no gauge, no teams) ──
  'art-WorkItem-backlog': {
    flowDist: { features:45, defects:30, enablers:15, maintenance:10 },
    signals: [
      {level:'urgent', title:'22 Stories have no acceptance criteria', desc:'Cannot be estimated or tested before Sprint 3 planning.', action:'Prioritise AC definition', meta:'Scanning 26 backlog stories'},
      {level:'urgent', title:'Fraud Team has 12 open defects in backlog', desc:'Up from 4 last PI. Defect rate accelerating.', action:'Schedule defect sprint', meta:'Defect trend over last 3 PIs'},
      {level:'watch', title:'5 Stories stale for 3+ sprints', desc:'No assignment, reducing backlog signal quality.', action:'Review and assign or descope'},
      {level:'ok', title:'Estimation consistency within normal range', desc:'Auth and Payments teams stable this PI.', action:''}
    ]
  },
  // ── PLANNING — "Can we deliver what we committed?" (gauge + teams + depth) ──
  'art-Feature-planning': {
    gauge: {value:68, label:'PI Capacity'},
    predict: {value:72, label:'Completion probability', trend:'down'},
    health: true,
    signals: [
      {level:'urgent', title:'Payment Confirmation Flow blocked Day 2', desc:'Auth Team dependency unresolved. 8 days left in Sprint 2.', action:'Escalate now', meta:'2 downstream items at risk'},
      {level:'urgent', title:'Fraud Team Sprint 4 at 110% capacity', desc:'3 items need moving or descoping before PI closes.', action:'Rebalance Sprint 4', meta:'Capacity across 4 sprints'},
      {level:'urgent', ai:true, confidence:'High', title:'Streamlined Onboarding will miss PI 26', desc:'No team assigned Sprint 3. 0% chance of completion this PI.', action:'Assign team', meta:'Velocity analysis of 6 teams over 3 sprints'},
      {level:'watch', ai:true, confidence:'Moderate', title:'Auth Team is critical path', desc:'At 80% capacity — slip cascades to Payments and Fraud.', action:'Monitor closely', meta:'Dependency chain across 4 Features'},
      {level:'watch', title:'Unplanned work at 18%', desc:'ART target is under 10%. Planning quality risk.', action:'Review sprint planning', meta:'Committed vs actual scope'},
      {level:'ok', title:'Mobile Exp on track Sprints 1–3', desc:'No capacity or dependency issues detected.', action:''}
    ]
  },
  'art-WorkItem-planning': {
    predict: {value:71, label:'Sprint completion', trend:'down'},
    health: true,
    signals: [
      {level:'urgent', title:'14 Stories blocked across 4 teams', desc:'Auth API, Payments gateway and 2 Fraud dependencies unresolved.', action:'View all blockers', meta:'32 items across 6 teams'},
      {level:'urgent', ai:true, confidence:'High', title:'Sprint 2 will complete 71% of commitments', desc:'Auth and Payments teams below burn target on Day 3.', action:'Review with teams', meta:'Predicting from 3-sprint velocity'},
      {level:'watch', title:'Unplanned work at 18% of Sprint 2', desc:'ART target is under 10%.', action:'Review sprint planning'},
      {level:'ok', title:'Defect rate within normal range', desc:'Quality holding despite new Feature work.', action:''}
    ]
  },
  // ── TIMELINE — "When will things land?" (thin, alerts only) ──
  'art-Feature-timeline': {
    signals: [
      {level:'urgent', ai:true, confidence:'High', title:'Code freeze in 12 days — 3 features below 40%', desc:'Payment Confirmation (20%), Fraud Alerts (25%), Onboarding (0%).', action:'Review scope', meta:'Schedule compression analysis'},
      {level:'urgent', ai:true, confidence:'High', title:'Payment Confirmation 68% likely to miss Sprint 4', desc:'Blocked since Day 2. Dependency on Auth API unresolved.', action:'Escalate', meta:'Predicting from blocked duration + team velocity'},
      {level:'watch', title:'2 PI-27 items depend on unfinished PI-26 work', desc:'Transaction Dispute and Cross-Border Payment have cross-PI dependencies.', action:'Review dependencies'},
      {level:'ok', title:'Balance on Home Screen complete', desc:'Dependency for Dark Mode (PI 27) is satisfied.', action:''}
    ]
  },
  'art-WorkItem-timeline': {
    signals: [
      {level:'urgent', title:'Auth API integration aging 8 days', desc:'Team P85 cycle time is 5 days. Exceeding norm by 60%.', action:'Escalate'},
      {level:'watch', title:'Sprint 3 starts in 5 days', desc:'4 Sprint 2 items not yet started.', action:'Flag standup'},
      {level:'ok', title:'Sprint 1 items all complete', desc:'No carryover into Sprint 2.', action:''}
    ]
  },
  // ── BOARD — "How is work flowing?" (flow metrics) ──
  'art-Feature-board': {
    signals: [
      {level:'urgent', ai:true, confidence:'High', title:'Fraud Alerts will not complete this PI', desc:'At 25% after 2 of 5 sprints. 3 open defects blocking. Probability: 18%.', action:'Escalate to Fraud Team', meta:'Team velocity + defect trend'},
      {level:'urgent', ai:true, confidence:'High', title:'3 Features below 30% with 6 weeks left', desc:'Payment Confirmation (20%), Fraud Alerts (25%), Onboarding (0%). Slip probability: 84%.', action:'Descope or add capacity', meta:'Progress vs remaining PI capacity'},
      {level:'watch', title:'Account Statement Export at 40%', desc:'Accounts Team below velocity target this sprint.', action:'Check with Accounts Team'},
      {level:'ok', title:'Balance on Home Screen complete', desc:'Opportunity to pull additional scope.', action:''}
    ]
  },
  'art-WorkItem-board': {
    signals: [
      {level:'urgent', title:'Payment Confirmation blocked Day 2', desc:'Auth API dependency. Blocks 2 others in same sprint. Cascade risk.', action:'Escalate now', meta:'Blocked since sprint start'},
      {level:'urgent', ai:true, confidence:'Moderate', title:'Flow bottleneck detected', desc:'14 In Progress, only 3 Done. Avg cycle time up 40% this sprint.', action:'Check review process', meta:'Flow metrics vs last 3 sprints'},
      {level:'watch', title:'Fraud Team Sprint 4 at 110% capacity', desc:'Items need moving before sprint start.', action:'Rebalance'},
      {level:'watch', title:'Accounts Team 20% below velocity', desc:'3 Stories not yet started on Day 3.', action:'Flag in standup'},
      {level:'ok', title:'Auth Team velocity consistent', desc:'On track with last 3 sprints.', action:''}
    ]
  },
  // ── TASK BOARD — "How is the team executing?" (deep metrics) ──
  'art-WorkItem-taskboard': {
    health: true,
    signals: [
      {level:'urgent', title:'Auth API integration aging 8 days', desc:'Team P85 cycle time is 5 days. 60% above norm. Blocking 2 downstream items.', action:'Escalate', meta:'Work item age vs team baseline'},
      {level:'urgent', ai:true, confidence:'High', title:'Vikram has 3 concurrent items (WIP limit: 2)', desc:'Context-switching risk. One item blocked, one in review.', action:'Redistribute work', meta:'WIP analysis across 12 team members'},
      {level:'urgent', title:'Review queue depth: 4 items', desc:'Items in In Review + Testing exceeding 2× completion rate. Bottleneck forming.', action:'Prioritise reviews', meta:'Queue depth vs throughput'},
      {level:'watch', ai:true, confidence:'Moderate', title:'Avg cycle time up 40% this sprint', desc:'3.2 days in In Review vs 0.8 day target. Review process slowing delivery.', action:'Check review process', meta:'Cycle time per column analysis'},
      {level:'watch', title:'5 items not started on Day 3', desc:'Sprint 2 has 9 items, 5 still in Draft/Ready.', action:'Flag standup'},
      {level:'ok', title:'Auth Team delivering within velocity range', desc:'2 items done, 2 in progress, on track.', action:''}
    ]
  },
  'team-WorkItem-taskboard': {
    signals: [
      {level:'urgent', title:'1 Story blocked since sprint start', desc:'Auth API dependency unresolved. Past team avg resolution: 1.4 days.', action:'Escalate', meta:'Blocked duration vs team norm'},
      {level:'urgent', ai:true, confidence:'High', title:'Sprint completion at risk: 55%', desc:'At current pace, 3 of 5 committed items will not finish.', action:'Flag standup', meta:'Predicting from team burn rate'},
      {level:'watch', title:'WIP imbalance: 2 members at 0 items', desc:'Tomás and Yuki have capacity. 2 items aging in queue.', action:'Redistribute'},
      {level:'ok', title:'Defect rate within team norm', desc:'No new defects this sprint.', action:''}
    ]
  },
  // ── HIERARCHY — "Is strategy connecting to execution?" (structural, not execution) ──
  'art-Feature-hierarchy': {
    signals: [
      {level:'urgent', ai:true, confidence:'High', title:'Goal 2 at risk — strategic imbalance', desc:'Cost reduction at 12% vs 42% for Goal 1. No Features in execution for Customer Self-Service.', action:'Rebalance portfolio', meta:'Goal progress across 6 Epics'},
      {level:'urgent', title:'Customer Self-Service has 0 Features defined', desc:'Primary Epic for Goal 2. Cannot recover this PI without scoping.', action:'Start scoping'},
      {level:'watch', title:'Open Banking has no Capability breakdown', desc:'PSD3 deadline Q3 2026. Delivery timeline unknown.', action:'Break down into Capabilities'},
      {level:'watch', ai:true, confidence:'Moderate', title:'Pipeline thinning: Next-Gen Mobile Banking', desc:'Epic at 42% but 3 Features unassigned. Nothing to pull in PI 27.', action:'Assign teams', meta:'Demand forecast for PI 27'},
      {level:'watch', title:'2 Epics are empty containers', desc:'Customer Self-Service and Open Banking have no children.', action:'Schedule scoping'},
      {level:'ok', title:'Goal 1 structurally healthy', desc:'4 of 7 Features in execution. Hierarchy complete.', action:''}
    ]
  },
  // ── BACKLOG Feature — prioritization focused ──
  'art-Feature-backlog': {
    flowDist: { features:55, defects:20, enablers:15, maintenance:10 },
    signals: [
      {level:'urgent', ai:true, confidence:'High', title:'47 customers flagged biometric issues', desc:'Up 3× from last month. Enhanced Biometric Auth ranked #1 by WSJF.', action:'Plan into PI 26', meta:'47 support tickets, 12 NPS comments'},
      {level:'urgent', ai:true, confidence:'High', title:'New theme: payment confirmation too slow', desc:'31 mentions in 7 days. No Feature in backlog matches.', action:'Create Feature', meta:'31 tickets across 3 channels'},
      {level:'urgent', title:'2 Features backlogged for 3+ PIs', desc:'Loan Application Wizard and Investment Portfolio View never pulled.', action:'Prioritise or remove'},
      {level:'watch', ai:true, confidence:'Moderate', title:'3 competitors launched biometric login', desc:'Accelerating Enhanced Biometric Auth makes strategic sense.', action:'Reprioritise', meta:'12 competitor releases monitored'},
      {level:'ok', title:'Mobile Exp has unallocated Sprint 3 capacity', desc:'Opportunity to pull from backlog.', action:''}
    ]
  },
  // Team-level backlogs
  'team-WorkItem-backlog': {
    signals: [
      {level:'urgent', title:'3 Stories have no acceptance criteria', desc:'Cannot be estimated or tested before Sprint 3.', action:'Define AC'},
      {level:'watch', title:'2 Defects older than 14 days', desc:'Ageing defects reduce backlog quality.', action:'Prioritise or close'},
      {level:'ok', title:'Estimation consistent with team average', desc:'No anomalies.', action:''}
    ]
  },
  'team-WorkItem-planning': {
    signals: [
      {level:'urgent', title:'Auth API integration blocked Day 2', desc:'Past team avg resolution: 1.4 days. Escalation window closing.', action:'Escalate'},
      {level:'watch', ai:true, confidence:'Moderate', title:'3 Stories may not complete Sprint 2', desc:'4 Stories not started or blocked.', action:'Flag standup', meta:'Team burn rate prediction'},
      {level:'ok', title:'Defect count within normal range', desc:'Consistent with last 3 sprints.', action:''}
    ]
  },
  'team-WorkItem-board': {
    signals: [
      {level:'urgent', title:'1 Story blocked in Sprint 2', desc:'Auth API dependency. Blocks 2 downstream items.', action:'Escalate'},
      {level:'watch', title:'3 In Progress, 1 Done', desc:'Flow bottleneck — items not completing.', action:'Review WIP limits'},
      {level:'ok', title:'Sprint velocity on track', desc:'Burn rate consistent with commitment.', action:''}
    ]
  }
};

// ── Goal name lookup ───────────────────────────────────
EAP.goalName = function(gid) {
  if (!gid) return '';
  for (var i = 0; i < EAP.goals.length; i++) {
    if (EAP.goals[i].id === gid) return EAP.goals[i].name;
  }
  return '';
};

// ── Timeline date ranges (dynamic) ────────────────────
// piDates and sprintDates are already computed by the date engine above.
// Epic/Capability/Feature ranges use PI boundaries as anchors.
(function() {
  var f = EAP._fmt, ad = EAP._addDays, ps = EAP._piStart, PD = EAP._piDays, SD = EAP._sprintDays;

  // PI offsets: pi24=-2, pi25=-1, pi26=0 (current), pi27=+1, pi28=+2
  function piS(offset) { return ad(ps, offset * PD); }
  function piE(offset) { return ad(ps, (offset + 1) * PD - 1); }
  function spS(idx) { return ad(ps, idx * SD); } // sprint index 0-4 within current PI
  function spE(idx) { return ad(ps, (idx + 1) * SD - 1); }

  // Epic timeline ranges (span PIs relative to current)
  EAP.timelineEpics = {
    e1:   { start: f(ad(piS(-1), 14)), end: f(piE(1)) },   // Next-Gen Mobile — PI 25–27
    e2:   { start: f(piS(1)),          end: f(piE(2)) },     // Customer Self-Service — PI 27–28
    e3:   { start: f(piS(0)),          end: f(piE(0)) },     // Open Banking API — PI 26
    e4:   { start: f(piS(1)),          end: f(piE(1)) },     // Payment Infrastructure — PI 27
    e5:   { start: f(piS(2)),          end: f(piE(3)) },     // Mortgage Origination — PI 28–29
    e6:   { start: f(piS(2)),          end: f(piE(2)) }      // Risk Assessment — PI 28
  };

  // Capability timeline ranges
  EAP.timelineCaps = {
    c1: { start: f(ad(piS(-1), 14)), end: f(piE(0)) },     // Seamless Auth — PI 25–26
    c2: { start: f(piS(0)),          end: f(piE(1)) },       // Risk & Fraud — PI 26–27
    c3: { start: f(piS(0)),          end: f(piE(0)) },       // Seamless Payments — PI 26
    c4: { start: f(ad(piS(-1), 14)), end: f(spE(1)) },      // Account Visibility — done
    c5: { start: f(piS(0)),          end: f(piE(1)) },       // Self-Service Mgmt — PI 26–27
    c6: { start: f(piS(2)),          end: f(piE(2)) },       // Automated Onboarding — PI 28
    c7: { start: f(piS(2)),          end: f(piE(3)) }        // Credit Risk Engine — PI 28–29
  };

  // Feature timeline ranges
  EAP.timelineFeatures = {
    f1:  { start: f(spS(1)),  end: f(spE(3)) },   // Fingerprint Login — Sprint 2–4
    f2:  { start: f(spS(1)),  end: f(piE(0)) },    // Fraud Alerts — full PI 26
    f3:  { start: f(spS(1)),  end: f(spE(3)) },    // Payment Confirm — Sprint 2–4
    f4:  { start: f(spS(1)),  end: f(spE(1)) },    // Balance Home — done Sprint 2
    f5:  { start: f(spS(1)),  end: f(spE(2)) },    // Statement Export — Sprint 2–3
    f6:  { start: f(spS(2)),  end: f(piE(0)) },    // Onboarding — Sprint 3–IP
    f7:  { start: f(spS(1)),  end: f(piE(0)) },    // Enhanced Biometric — PI 26 backlog
    f8:  { start: f(piS(1)),  end: f(ad(piS(1), 41)) },  // Dark Mode — PI 27
    f9:  { start: f(piS(1)),  end: f(piE(1)) },    // Transaction Dispute — PI 27
    f10: { start: f(piS(1)),  end: f(ad(piS(1), 41)) },  // Notification Pref — PI 27
    f11: { start: f(piS(1)),  end: f(piE(1)) },    // Cross-Border — PI 27
    f12: { start: f(piS(1)),  end: f(piE(1)) },    // Account Aggregation — PI 27
    f13: { start: f(piS(2)),  end: f(ad(piS(2), 41)) },  // Statement Filter — PI 28
    f14: { start: f(piS(2)),  end: f(ad(piS(2), 41)) },  // Biometric Return — PI 28
    f15: { start: f(piS(2)),  end: f(piE(2)) },    // PSD3 Compliance — PI 28
    f16: { start: f(piS(2)),  end: f(ad(piS(2), 41)) }   // Investment Portfolio — PI 28
  };

  // Milestones (dynamic dates, icon + semantic colour)
  // Colour logic: release=success (green), demo=primary (teal), planning=info (blue), freeze=warning (amber)
  EAP.milestones = [
    { date: f(spE(1)),  label: 'System Demo 1',   type: 'demo',     icon: 'monitor',  level: 'tactical' },
    { date: f(spE(2)),  label: 'System Demo 2',   type: 'demo',     icon: 'monitor',  level: 'tactical' },
    { date: f(spE(3)),  label: 'System Demo 3',   type: 'demo',     icon: 'monitor',  level: 'tactical' },
    { date: f(ad(spS(4), -5)), label: 'Code Freeze', type: 'freeze', icon: 'lock',    level: 'tactical' },
    { date: f(piE(0)),  label: 'PI 26 Release',   type: 'release',  icon: 'rocket',   level: 'strategic' },
    { date: f(piS(1)),  label: 'PI 27 Planning',  type: 'planning', icon: 'compass',  level: 'strategic' },
    { date: f(piE(1)),  label: 'PI 27 Release',   type: 'release',  icon: 'rocket',   level: 'strategic' },
    { date: f(piS(2)),  label: 'PI 28 Planning',  type: 'planning', icon: 'compass',  level: 'strategic' },
    { date: f(piE(2)),  label: 'PI 28 Release',   type: 'release',  icon: 'rocket',   level: 'strategic' }
  ];
})();

// ── People (avatars + initials) ────────────────────────
// PMs/Product: Ananya, Raj, Priya (own Epics/Capabilities/Features, not assigned to teams)
// Developers: unique per team (no sharing between teams)
EAP.people = {
  // Product / PM layer
  'Ananya': {name:'Ananya Krishnan', initials:'AK', avatar:'../../assets/images/avatar-3.png', color:'#0d9488'},
  'Raj':    {name:'Raj Mehta',       initials:'RM', avatar:'../../assets/images/avatar-2.png', color:'#6d28d9'},
  'Priya':  {name:'Priya Kumar',     initials:'PK', avatar:null, color:'#6366F1'},
  // Auth Team
  'Kiran':  {name:'Kiran Patel',     initials:'KP', avatar:'../../assets/images/avatar-1.png', color:'#2563EB'},
  'Sana':   {name:'Sana Ali',        initials:'SA', avatar:null, color:'#1d4ed8'},
  'James':  {name:'James Carter',    initials:'JC', avatar:'../../assets/images/avatar-james.png', color:'#0d9488'},
  // Payments Team
  'Vikram': {name:'Vikram Singh',    initials:'VS', avatar:null, color:'#0d9488'},
  'Mei':    {name:'Mei Chen',        initials:'MC', avatar:null, color:'#0f766e'},
  // Fraud Team
  'Marcus': {name:'Marcus Chen',     initials:'MC', avatar:'../../assets/images/avatar-4.png', color:'#D97706'},
  'Aisha':  {name:'Aisha Okonkwo',   initials:'AO', avatar:null, color:'#b45309'},
  // Mobile Exp Team
  'Tomás':  {name:'Tomás Rivera',    initials:'TR', avatar:null, color:'#8B5CF6'},
  'Yuki':   {name:'Yuki Tanaka',     initials:'YT', avatar:null, color:'#7c3aed'},
  // Accounts Team
  'Lena':   {name:'Lena Novak',      initials:'LN', avatar:null, color:'#6366F1'},
  'Omar':   {name:'Omar Hassan',     initials:'OH', avatar:null, color:'#4f46e5'},
  // Onboarding Team
  'Nina':   {name:'Nina Johansson',  initials:'NJ', avatar:null, color:'#EC4899'},
  'Devi':   {name:'Devi Sharma',     initials:'DS', avatar:null, color:'#db2777'}
};

// ── Team colours (unique per team for dots, headers, chips) ──
EAP.teamColors = {
  'Auth Team':       '#2a6edc',
  'Payments Team':   '#00834f',
  'Fraud Team':      '#8d6e00',
  'Mobile Exp Team': '#7c3aed',
  'Accounts Team':   '#4f46e5',
  'Onboarding Team': '#db2777',
  'Auth': '#2a6edc', 'Payments': '#00834f', 'Fraud': '#8d6e00',
  'Mobile': '#7c3aed', 'Accounts': '#4f46e5', 'Onboard': '#db2777'
};

// ── Team rosters (unique members per team) ─────────────
EAP.teamMembers = {
  'Auth Team':       ['Kiran', 'Sana'],
  'Payments Team':   ['Vikram', 'Mei'],
  'Fraud Team':      ['Marcus', 'Aisha'],
  'Mobile Exp Team': ['Tomás', 'Yuki'],
  'Accounts Team':   ['Lena', 'Omar'],
  'Onboarding Team': ['Nina', 'Devi']
};

// ── Team capacity ──────────────────────────────────────
EAP.teamCapacity = {
  'Auth Team':       {sp2:80,sp3:75,sp4:70,ip:40},
  'Payments Team':   {sp2:92,sp3:85,sp4:80,ip:40},
  'Fraud Team':      {sp2:78,sp3:80,sp4:110,ip:40},
  'Mobile Exp Team': {sp2:70,sp3:0,sp4:65,ip:40},
  'Accounts Team':   {sp2:65,sp3:62,sp4:60,ip:40},
  'Onboarding Team': {sp2:60,sp3:58,sp4:55,ip:40}
};
