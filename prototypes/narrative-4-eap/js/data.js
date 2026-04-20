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
  // ── PI 28 planned ──
  {id:'f13', num:'FTR0010013', name:'Statement Date Range Filter',         type:'Feature', state:'Funnel', pct:0, size:'S', wsjf:6.5, parent:'Self-Service',     team:'Accounts',  pi:'pi28', pts:0, owner:'Priya', goal:'g2'},
  {id:'f14', num:'FTR0010014', name:'Biometric Auth for Returning Users',  type:'Feature', state:'Funnel', pct:0, size:'S', wsjf:9.1, parent:'Seamless Auth',    team:'Auth',      pi:'pi28', pts:0, owner:'Ananya', goal:'g1'},
  {id:'f15', num:'FTR0010015', name:'PSD3 Compliance Module',              type:'Feature', state:'Funnel', pct:0, size:'XL', wsjf:13.2, parent:'Open Banking',    team:'Accounts',  pi:'pi28', pts:0, owner:'Raj', goal:'g1'},
  {id:'f16', num:'FTR0010016', name:'Investment Portfolio View',            type:'Feature', state:'Funnel', pct:0, size:'M', wsjf:6.1, parent:'Account Vis.',      team:'Accounts',  pi:'pi28', pts:0, owner:'Priya', goal:'g1'},
  // ── Backlog (no PI) — 18 items for volume ──
  {id:'bl1',  num:'FTR0010017', name:'Instant Payment Notifications',       type:'Feature', state:'Funnel',   size:'S', wsjf:10.8, parent:'Payments',        team:'', pi:null, pts:8, owner:'', goal:'g1'},
  {id:'bl2',  num:'FTR0010018', name:'Transaction Dispute Resolution',      type:'Feature', state:'Backlog',  size:'M', wsjf:8.7,  parent:'Self-Service',    team:'', pi:null, pts:5, owner:'', goal:'g2'},
  {id:'bl3',  num:'FTR0010019', name:'Scheduled Payment Manager',           type:'Feature', state:'Funnel',   size:'S', wsjf:7.1,  parent:'Payments',        team:'', pi:null, pts:8, owner:'', goal:'g1'},
  {id:'bl4',  num:'FTR0010020', name:'Account Statement Export — Additional Scope', type:'Feature', state:'Backlog', size:'S', wsjf:5.4, parent:'Self-Service', team:'', pi:null, pts:5, owner:'', goal:'g2'},
  {id:'bl5',  num:'FTR0010021', name:'Loan Application Wizard',             type:'Feature', state:'Funnel',   size:'L', wsjf:4.2,  parent:'Onboarding',      team:'', pi:null, pts:13, stalePIs:3, owner:'', goal:'g2'},
  {id:'bl6',  num:'FTR0010022', name:'Investment Portfolio View',            type:'Feature', state:'Funnel',   size:'M', wsjf:3.8,  parent:'Account Vis.',    team:'', pi:null, pts:8, stalePIs:3, owner:'', goal:'g1'},
  {id:'bl7',  num:'FTR0010023', name:'Multi-Currency Wallet Support',        type:'Feature', state:'Funnel',   size:'L', wsjf:5.1,  parent:'Payments',        team:'', pi:null, pts:13, owner:'', goal:'g1'},
  {id:'bl8',  num:'FTR0010024', name:'Automated KYC Refresh Flow',           type:'Feature', state:'Analysis', size:'M', wsjf:4.8,  parent:'Onboarding',      team:'', pi:null, pts:8, owner:'', goal:'g2'},
  {id:'bl9',  num:'FTR0010025', name:'Push Notification Preferences',        type:'Feature', state:'Backlog',  size:'S', wsjf:4.2,  parent:'Payments',        team:'', pi:null, pts:5, owner:'', goal:''},
  {id:'bl10', num:'FTR0010026', name:'Card Freeze/Unfreeze Toggle',          type:'Feature', state:'Funnel',   size:'S', wsjf:3.9,  parent:'Account Vis.',    team:'', pi:null, pts:3, owner:'', goal:'g1'},
  {id:'bl11', num:'FTR0010027', name:'Spending Insights Dashboard',          type:'Feature', state:'Funnel',   size:'M', wsjf:3.5,  parent:'Account Vis.',    team:'', pi:null, pts:8, owner:'', goal:'g1'},
  {id:'bl12', num:'FTR0010028', name:'Contactless Payment Limit Override',   type:'Feature', state:'Funnel',   size:'S', wsjf:3.2,  parent:'Payments',        team:'', pi:null, pts:3, owner:'', goal:'g1'},
  {id:'bl13', num:'FTR0010029', name:'Standing Order Management',            type:'Feature', state:'Backlog',  size:'M', wsjf:3.0,  parent:'Payments',        team:'', pi:null, pts:8, owner:'', goal:''},
  {id:'bl14', num:'FTR0010030', name:'Direct Debit Cancellation Flow',       type:'Feature', state:'Funnel',   size:'S', wsjf:2.8,  parent:'Payments',        team:'', pi:null, pts:5, owner:'', goal:''},
  {id:'bl15', num:'FTR0010031', name:'Savings Goal Tracker',                 type:'Feature', state:'Funnel',   size:'M', wsjf:2.5,  parent:'Account Vis.',    team:'', pi:null, pts:8, owner:'', goal:'g1'},
  {id:'bl16', num:'FTR0010032', name:'Open Banking Consent Manager',         type:'Feature', state:'Analysis', size:'L', wsjf:5.8,  parent:'Open Banking',    team:'', pi:null, pts:13, owner:'', goal:'g1'},
  {id:'bl17', num:'FTR0010033', name:'Customer Feedback Widget',             type:'Feature', state:'Funnel',   size:'S', wsjf:2.2,  parent:'Self-Service',    team:'', pi:null, pts:3, owner:'', goal:'g2'},
  {id:'bl18', num:'FTR0010034', name:'In-App Chat Support',                  type:'Feature', state:'Funnel',   size:'L', wsjf:4.5,  parent:'Self-Service',    team:'', pi:null, pts:13, owner:'', goal:'g2'}
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
  backlog: {
    Story: [
      {id:'blw1', num:'STRY61094301', name:'Report fraudulent transaction and recover funds',  state:'Draft', pts:3, owner:'Vikram', team:'Payments Team', type:'Story', parent:'', goal:'g1'},
      {id:'blw2', num:'STRY61094302', name:'Change password regularly for account security',    state:'Draft', pts:2, owner:'Sana',   team:'Auth Team',     type:'Story', parent:'', goal:'g1'},
      {id:'blw3', num:'STRY61094303', name:'Log out remotely to prevent unauthorised access',   state:'Draft', pts:2, owner:'Tomás',  team:'Mobile Exp Team',type:'Story', parent:'', goal:'g1'},
      {id:'blw4', num:'STRY61094304', name:'Set up PIN as additional protection layer',         state:'Draft', pts:3, owner:'Kiran',  team:'Auth Team',     type:'Story', parent:'', goal:'g1'},
      {id:'blw5', num:'STRY61094305', name:'View devices currently logged into account',        state:'Draft', pts:2, owner:'Yuki',   team:'Mobile Exp Team',type:'Story', parent:'', goal:'g1'},
      {id:'blw6', num:'STRY61094306', name:'Report security vulnerabilities discovered',        state:'Draft', pts:3, owner:'Marcus', team:'Fraud Team',    type:'Story', parent:'', goal:'g1'},
      {id:'blw7', num:'STRY61094307', name:'Export transaction history as CSV',                  state:'Draft', pts:2, owner:'Lena',   team:'Accounts Team', type:'Story', parent:'', goal:'g2'},
      {id:'blw8', num:'STRY61094308', name:'Enable face recognition for login',                 state:'Draft', pts:5, owner:'Kiran',  team:'Auth Team',     type:'Story', parent:'', goal:'g1'}
    ],
    Defect: [
      {id:'bld1', num:'DEF0192954', name:'Resource Report forecast utilisation not calculated with days off', state:'Backlog', pts:0, owner:'Mei',    team:'Payments Team',  type:'Defect', parent:'', goal:''},
      {id:'bld2', num:'DEF0366785', name:'Mobile timesheets single-select should auto-close modal',          state:'Backlog', pts:0, owner:'Yuki',   team:'Mobile Exp Team',type:'Defect', parent:'', goal:''},
      {id:'bld3', num:'DEF0500640', name:'Push notification delayed on Android 14 devices',                  state:'Backlog', pts:0, owner:'Tomás',  team:'Mobile Exp Team',type:'Defect', parent:'', goal:''},
      {id:'bld4', num:'DEF0500641', name:'Statement PDF missing page numbers on multi-page exports',         state:'Backlog', pts:0, owner:'Omar',   team:'Accounts Team',  type:'Defect', parent:'Statement Export', goal:'g2'},
      {id:'bld5', num:'DEF0500642', name:'Fraud alert duplicate firing on card-not-present transactions',    state:'Backlog', pts:2, owner:'Aisha',  team:'Fraud Team',     type:'Defect', parent:'Fraud Alerts', goal:'g1'},
      {id:'bld6', num:'DEF0500643', name:'Auth token refresh fails silently after 24h session',              state:'Backlog', pts:3, owner:'Sana',   team:'Auth Team',      type:'Defect', parent:'Seamless Auth', goal:'g1'},
      {id:'bld7', num:'DEF0500644', name:'Balance widget shows stale data after background app resume',      state:'Backlog', pts:2, owner:'Yuki',   team:'Mobile Exp Team',type:'Defect', parent:'Account Vis.', goal:'g1'},
      {id:'bld8', num:'DEF0500645', name:'Fraud webhook retry logic creates duplicate entries',              state:'Backlog', pts:3, owner:'Marcus', team:'Fraud Team',     type:'Defect', parent:'Fraud Alerts', goal:'g1'},
      {id:'bld9', num:'DEF0500646', name:'Payment confirmation timeout not handled gracefully',              state:'Backlog', pts:2, owner:'Vikram', team:'Payments Team',  type:'Defect', parent:'Payments', goal:'g1'},
      {id:'bld10',num:'DEF0500647', name:'Onboarding KYC upload crashes on large file',                     state:'Backlog', pts:0, owner:'Devi',   team:'Onboarding Team',type:'Defect', parent:'Onboarding', goal:'g2'},
      {id:'bld11',num:'DEF0500648', name:'Fraud detection model false positive rate above threshold',       state:'Backlog', pts:5, owner:'Aisha',  team:'Fraud Team',     type:'Defect', parent:'Fraud Alerts', goal:'g1'},
      {id:'bld12',num:'DEF0500649', name:'Account statement date filter off-by-one error',                  state:'Backlog', pts:1, owner:'Lena',   team:'Accounts Team',  type:'Defect', parent:'Statement Export', goal:'g2'}
    ],
    CaseTask: [
      {id:'blc1', num:'CSTASK1070158', name:'Write acceptance criteria for biometric fallback flow', state:'Draft', pts:1, owner:'Ananya', team:'Auth Team',     type:'Case Task', parent:'Seamless Auth', goal:'g1'},
      {id:'blc2', num:'CSTASK1215264', name:'Update test plan for fraud alert deduplication',        state:'Draft', pts:1, owner:'Aisha',  team:'Fraud Team',    type:'Case Task', parent:'Fraud Alerts', goal:'g1'},
      {id:'blc3', num:'CSTASK1222242', name:'Document API contract for payment confirmation',        state:'Draft', pts:2, owner:'Mei',    team:'Payments Team', type:'Case Task', parent:'Payments', goal:'g1'},
      {id:'blc4', num:'CSTASK1222243', name:'Review KYC compliance checklist sign-off',              state:'Draft', pts:1, owner:'Ananya', team:'Onboarding Team',type:'Case Task', parent:'Onboarding', goal:'g2'},
      {id:'blc5', num:'CSTASK1222244', name:'Create runbook for biometric service deployment',       state:'Draft', pts:2, owner:'Kiran',  team:'Auth Team',     type:'Case Task', parent:'Seamless Auth', goal:'g1'},
      {id:'blc6', num:'CSTASK1222245', name:'Coordinate UAT session for statement export',           state:'Draft', pts:1, owner:'Omar',   team:'Accounts Team', type:'Case Task', parent:'Statement Export', goal:'g2'}
    ]
  },
  sprints: [
    {id:'sp2', name:'Sprint 2', dates:EAP._sprintDisplay[1].dates, active:true, capPct:60, totalPts:32, donePts:8,
      items: [
        {id:'ls6',  num:'STRY61094201', name:'Handle fallback to PIN on failed biometric scan',     type:'Story', state:'In Progress', pct:50, pts:3, owner:'Kiran',  team:'Auth Team', parent:'Fingerprint Login Redesign', goal:'g1'},
        {id:'ls7',  num:'STRY61094202', name:'Build payment confirmation screen layout',            type:'Story', state:'In Progress', pct:40, pts:5, owner:'Vikram', team:'Payments Team', parent:'Payment Confirmation Flow', goal:'g1'},
        {id:'ls8',  num:'STRY61094203', name:'Integrate Auth API for payment confirmation flow',    type:'Story', state:'Blocked',     pct:10, pts:8, owner:'Mei',    team:'Payments Team', blocked:true, blockReason:'Auth API dependency Day 2', parent:'Payment Confirmation Flow', goal:'g1'},
        {id:'ls9',  num:'STRY61094204', name:'Payment amount validation rules and error states',    type:'Story', state:'In Review',   pct:80, pts:3, owner:'Vikram', team:'Payments Team', parent:'Payment Confirmation Flow', goal:'g1'},
        {id:'ls10', num:'STRY61094205', name:'Fraud detection webhook integration and retry logic', type:'Story', state:'In Progress', pct:30, pts:8, owner:'Marcus', team:'Fraud Team', parent:'Real-time Fraud Alerts', goal:'g1'},
        {id:'ls11', num:'STRY61094206', name:'Balance refresh on app resume and foreground event',  type:'Story', state:'To Do',       pct:0,  pts:5, owner:'Tomás',  team:'Mobile Exp Team', parent:'Balance on Home Screen', goal:'g1'},
        {id:'ls12', num:'STRY61094207', name:'Auth session expiry handler and token refresh',       type:'Story', state:'In Progress', pct:45, pts:3, owner:'Sana',   team:'Auth Team', parent:'Fingerprint Login Redesign', goal:'g1'},
        {id:'ls13', num:'STRY61094208', name:'Account statement data fetch from backend API',       type:'Story', state:'To Do',       pct:0,  pts:3, owner:'Lena',   team:'Accounts Team', parent:'Statement Export PDF', goal:'g2'},
        {id:'ls14', num:'STRY61094209', name:'KYC document upload step in onboarding flow',         type:'Story', state:'To Do',       pct:0,  pts:4, owner:'Nina',   team:'Onboarding Team', parent:'Streamlined Onboarding', goal:'g2'}
      ]
    },
    {id:'sp3', name:'Sprint 3', dates:EAP._sprintDisplay[2].dates, active:false, capPct:0, totalPts:29, donePts:0,
      items: [
        {id:'ls15', num:'STRY61094210', name:'Retry mechanism for failed payment submissions',       type:'Story', state:'Planned', pct:0, pts:3, owner:'Vikram', team:'Payments Team', parent:'Payment Confirmation Flow', goal:'g1'},
        {id:'ls16', num:'STRY61094211', name:'Scheduled payment UI with recurring options',          type:'Story', state:'Planned', pct:0, pts:8, owner:'Mei',    team:'Payments Team', parent:'Payment Confirmation Flow', goal:'g1'},
        {id:'ls17', num:'STRY61094212', name:'Statement PDF export component and layout',            type:'Story', state:'Planned', pct:0, pts:5, owner:'Omar',   team:'Accounts Team', parent:'Statement Export PDF', goal:'g2'},
        {id:'ls18', num:'STRY61094213', name:'Auth session expiry handler regression tests',         type:'Story', state:'Planned', pct:0, pts:3, owner:'Sana',   team:'Auth Team', parent:'Fingerprint Login Redesign', goal:'g1'},
        {id:'ls19', num:'STRY61094214', name:'Fraud alert deduplication logic and tests',            type:'Story', state:'Planned', pct:0, pts:5, owner:'Aisha',  team:'Fraud Team', parent:'Real-time Fraud Alerts', goal:'g1'},
        {id:'ls20', num:'STRY61094215', name:'App navigation component refactor',                    type:'Story', state:'Planned', pct:0, pts:3, owner:'Yuki',   team:'Mobile Exp Team', parent:'Dark Mode Support', goal:'g1'},
        {id:'ls21', num:'STRY61094216', name:'Onboarding step progress tracker component',           type:'Story', state:'Planned', pct:0, pts:2, owner:'Devi',   team:'Onboarding Team', parent:'Streamlined Onboarding', goal:'g2'}
      ]
    },
    {id:'sp4', name:'Sprint 4', dates:EAP._sprintDisplay[3].dates, active:false, capPct:0, totalPts:24, donePts:0,
      items: [
        {id:'ls22', num:'STRY61094217', name:'Recurring payment logic and edge case handling',       type:'Story', state:'Planned', pct:0, pts:8, owner:'Vikram', team:'Payments Team', parent:'Payment Confirmation Flow', goal:'g1'},
        {id:'ls23', num:'STRY61094218', name:'Payment limit enforcement at API level',               type:'Story', state:'Planned', pct:0, pts:5, owner:'Mei',    team:'Payments Team', parent:'Payment Confirmation Flow', goal:'g1'},
        {id:'ls24', num:'STRY61094219', name:'Biometric returning user login flow',                  type:'Story', state:'Planned', pct:0, pts:3, owner:'Sana',   team:'Auth Team', parent:'Fingerprint Login Redesign', goal:'g1'},
        {id:'ls25', num:'STRY61094220', name:'Fraud dispute UI integration with backend',            type:'Story', state:'Planned', pct:0, pts:5, owner:'Marcus', team:'Fraud Team', parent:'Real-time Fraud Alerts', goal:'g1'},
        {id:'ls26', num:'STRY61094221', name:'Dark mode story card components',                      type:'Story', state:'Planned', pct:0, pts:3, owner:'Tomás',  team:'Mobile Exp Team', parent:'Dark Mode Support', goal:'g1'}
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
EAP.featureDeps = [
  {from:'f9',  to:'f1',  type:'risk',     reason:'Transaction Dispute Resolution (PI 27) depends on Fingerprint Login (PI 26) — Auth must complete before dispute identity verification'},
  {from:'f11', to:'f3',  type:'conflict',  reason:'Cross-Border Payment Support (PI 27) depends on Payment Confirmation Flow (PI 26) — but Payment Confirmation is Blocked'},
  {from:'f8',  to:'f4',  type:'ok',        reason:'Dark Mode Support (PI 27) depends on Balance Widget (PI 26) — Balance is Done, dependency satisfied'},
  {from:'f14', to:'f1',  type:'risk',      reason:'Biometric Auth for Returning Users (PI 28) depends on Fingerprint Login (PI 26) — tight timeline'}
];

// Work Item dependencies (cross-sprint)
EAP.wiDeps = [
  {from:'ls8', to:'ls6', type:'conflict', reason:'Auth API integration (Sprint 2) blocked by PIN fallback (Sprint 2) — same sprint, not sequenced'},
  {from:'ls15', to:'ls9', type:'risk', reason:'Retry mechanism (Sprint 3) depends on payment validation (Sprint 2) — adjacent sprints, sp2 item in review'},
  {from:'ls22', to:'ls15', type:'ok', reason:'Recurring payment (Sprint 4) depends on retry mechanism (Sprint 3) — correctly sequenced'}
];

// ═══════════════════════════════════════════════════════
// INSIGHTS — per view/level
// ═══════════════════════════════════════════════════════
EAP.insights = {
  'art-Feature-backlog': {
    signals: [
      {level:'urgent', title:'47 customers flagged biometric issues this week', desc:'Up 3× from last month. Enhanced Biometric Auth Flow is ranked #1 by WSJF with no PI commitment.', action:'Plan into PI 26'},
      {level:'urgent', title:'New customer theme: payment confirmation too slow', desc:'31 mentions in 7 days. No Feature in backlog matches this pattern.', action:'Create Feature'},
      {level:'urgent', title:'2 Features backlogged for 3+ PIs', desc:'Loan Application Wizard and Investment Portfolio View have never been pulled. Backlog noise increasing.', action:'Prioritise or remove'},
      {level:'watch',  title:'3 competitor banks launched biometric login this quarter', desc:'Accelerating Enhanced Biometric Auth Flow over lower-ranked items makes strategic sense.', action:'Reprioritise'},
      {level:'watch',  title:'PSD3 regulatory update published', desc:'Transaction Dispute Resolution may need scope change to comply by Q3 2026.', action:'Review scope'},
      {level:'ok',     title:'Mobile Exp has unallocated capacity in Sprint 3', desc:'No Features currently assigned. Opportunity to pull from backlog.', action:''}
    ]
  },
  'art-WorkItem-backlog': {
    signals: [
      {level:'urgent', title:'22 Stories across all teams have no acceptance criteria', desc:'Cannot be reliably estimated or tested before Sprint 3 planning.', action:'Prioritise AC definition'},
      {level:'urgent', title:'Fraud Team has 12 open defects in backlog', desc:'Up from 4 last PI. Defect rate accelerating.', action:'Schedule defect sprint'},
      {level:'watch',  title:'5 Stories in backlog for 3+ sprints with no assignment', desc:'Stale items reducing backlog signal quality.', action:'Review and assign or descope'},
      {level:'ok',     title:'Story estimation consistency within normal range', desc:'Auth and Payments teams estimation is stable this PI.', action:''}
    ]
  },
  'art-Feature-planning': {
    gauge: {value:68, label:'PI 26 Capacity'},
    teams: [
      {name:'Auth',     pct:80,  status:'healthy'},
      {name:'Payments', pct:92,  status:'watch'},
      {name:'Fraud',    pct:78,  status:'healthy'},
      {name:'Mobile',   pct:70,  status:'healthy'},
      {name:'Accounts', pct:65,  status:'healthy'},
      {name:'Onboard',  pct:60,  status:'healthy'}
    ],
    signals: [
      {level:'urgent', title:'Payment Confirmation Flow blocked Day 2', desc:'Auth Team dependency unresolved. 8 days left in Sprint 2. Escalation path not assigned.', action:'Escalate now'},
      {level:'urgent', title:'Fraud Team Sprint 4 at 110% capacity', desc:'3 items need moving or descoping before PI closes.', action:'Rebalance Sprint 4'},
      {level:'urgent', title:'Streamlined Onboarding has no team assigned Sprint 3', desc:'Will not make PI 26 without assignment this sprint.', action:'Assign team'},
      {level:'watch',  title:'Auth Team is critical path for 2 downstream items', desc:'Auth at 80% capacity — any slip cascades to Payments and Fraud.', action:'Monitor closely'},
      {level:'watch',  title:'Mobile Exp has no items in Sprint 3', desc:'Capacity available, nothing planned. Planning gap.', action:'Pull from backlog'},
      {level:'ok',     title:'Auth and Mobile Exp on track Sprints 1–3', desc:'No capacity or dependency issues detected.', action:''}
    ]
  },
  'art-WorkItem-planning': {
    signals: [
      {level:'urgent', title:'14 Stories blocked across 4 teams', desc:'Auth API, Payments gateway and 2 Fraud dependencies unresolved.', action:'View all blockers'},
      {level:'urgent', title:'Sprint 2 burn rate 18% below target on Day 3', desc:'At current pace ART will complete 71% of Sprint 2 commitments.', action:'Review with teams'},
      {level:'watch',  title:'Unplanned work is 18% of Sprint 2 scope', desc:'ART target is under 10%. Planning quality risk.', action:'Review sprint planning'},
      {level:'ok',     title:'Story defect rate within normal range for Sprint 2', desc:'Despite new Feature work, quality holding.', action:''}
    ]
  },
  'art-Feature-board': {
    signals: [
      {level:'urgent', title:'Real-time Fraud Alerts at 0% after 2 of 4 sprints', desc:'At current pace will not complete this PI. 3 open defects blocking progress.', action:'Escalate to Fraud Team'},
      {level:'urgent', title:'3 Features below 30% with 6 weeks remaining', desc:'Payment Confirmation (20%), Fraud Alerts (25%), Onboarding (0%). Slip probability high.', action:'Descope or add capacity'},
      {level:'watch',  title:'Account Statement Export at 40% — on the edge', desc:'Accounts Team below velocity target this sprint. Watch closely.', action:'Check with Accounts Team'},
      {level:'ok',     title:'Balance on Home Screen complete at 100%', desc:'3 weeks remaining in PI 26. Opportunity to pull additional scope.', action:''}
    ]
  },
  'art-WorkItem-board': {
    signals: [
      {level:'urgent', title:'Payment Confirmation blocked Day 2', desc:'Dependency on Auth API. This Story blocks 2 others in the same sprint. Cascade risk.', action:'Escalate now'},
      {level:'urgent', title:'Fraud Team Sprint 4 at 110% capacity', desc:'Cards visually overflowing. Items need moving before sprint start.', action:'Rebalance'},
      {level:'watch',  title:'Accounts Team 20% below Sprint 2 velocity', desc:'3 Stories not yet started on Day 3.', action:'Flag in standup'},
      {level:'watch',  title:'14 Stories In Progress, only 3 Done', desc:'Stories not flowing to completion — likely review bottleneck.', action:'Check review process'},
      {level:'ok',     title:'Auth Team velocity consistent with last 3 sprints', desc:'On track.', action:''}
    ]
  },
  'art-Feature-hierarchy': {
    // No gauge or team data — strategy signals only
    signals: [
      {level:'urgent', title:'Goal 2 at risk — only 12% progress vs 42% for Goal 1', desc:'Cost reduction goal falling behind. No Features in execution for Customer Self-Service Expansion Epic. Strategic imbalance growing.', action:'Rebalance portfolio'},
      {level:'urgent', title:'Customer Self-Service Expansion has 0 Features defined', desc:'This is the primary Epic for Goal 2. Without scoping, the goal cannot recover this PI.', action:'Start scoping'},
      {level:'watch',  title:'Open Banking API Programme in Review with no breakdown', desc:'PSD3 deadline Q3 2026. Without Capability/Feature breakdown, delivery timeline is unknown.', action:'Break down into Capabilities'},
      {level:'watch',  title:'Next-Gen Mobile Banking has 3 unassigned backlog Features', desc:'Epic at 42% but pipeline thinning. Teams will have nothing to pull in PI 27.', action:'Assign teams'},
      {level:'watch',  title:'2 Epics with no Features or Capabilities defined', desc:'Customer Self-Service and Open Banking are empty containers. Need breakdown before PI 27 planning.', action:'Schedule scoping'},
      {level:'ok',     title:'Goal 1 on track at 42%', desc:'Digital bank goal progressing. PI 26 commitments aligned. 4 of 7 Features in execution.', action:''}
    ]
  },
  // Team-level insights — no gauge or team capacity (that's ART-level)
  'team-WorkItem-backlog': {
    signals: [
      {level:'urgent', title:'3 Stories have no acceptance criteria', desc:'Cannot be estimated or tested before Sprint 3.', action:'Define AC'},
      {level:'watch',  title:'2 Defects older than 14 days in backlog', desc:'Ageing defects reduce backlog quality.', action:'Prioritise or close'},
      {level:'ok',     title:'Story estimation consistent with team average', desc:'No anomalies detected.', action:''}
    ]
  },
  'team-WorkItem-planning': {
    signals: [
      {level:'urgent', title:'Auth API integration blocked Day 2', desc:'Past team average resolution: 1.4 days. Escalation window closing.', action:'Escalate'},
      {level:'watch',  title:'At current pace 3 Stories may not complete Sprint 2', desc:'7 days left, 4 Stories not started or blocked.', action:'Flag standup'},
      {level:'ok',     title:'Defect count within normal range', desc:'Consistent with last 3 sprints.', action:''}
    ]
  },
  'team-WorkItem-board': {
    signals: [
      {level:'urgent', title:'1 Story blocked in Sprint 2', desc:'Auth API dependency unresolved. Blocks 2 downstream items.', action:'Escalate'},
      {level:'watch',  title:'In Progress column has 3 items, Done has 1', desc:'Flow bottleneck — items not completing.', action:'Review WIP limits'},
      {level:'ok',     title:'Sprint velocity on track', desc:'Burn rate consistent with commitment.', action:''}
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
