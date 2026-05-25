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
    {id:'e1', num:'EPIC0010001', name:'Next-Gen Mobile Banking Platform', type:'Epic', state:'Implementation', pct:42, size:'XL', wsjf:18.4, art:'Digital Banking ART', st:'Digital & Payments ST', goal:'g1', owner:'Ananya', parent:'Become top digital bank in UK by 2027', product:'Digital Banking', atRisk:true},
    {id:'e2', num:'EPIC0010002', name:'Customer Self-Service Expansion', type:'Epic', state:'Funnel', pct:0, size:'L', wsjf:14.1, art:'Digital Banking ART', st:'Digital & Payments ST', goal:'g2', owner:'Priya', parent:'Reduce operating costs by 18% by end of 2026', product:'Digital Banking'},
    {id:'e3', num:'EPIC0010003', name:'Open Banking API Programme', type:'Epic', state:'Review', pct:0, size:'XL', wsjf:13.2, art:'Digital Banking ART', st:'Digital & Payments ST', goal:'g1', owner:'Raj', parent:'Become top digital bank in UK by 2027', product:'Digital Banking', atRisk:true},
    {id:'e4', num:'EPIC0010004', name:'Payment Infrastructure Upgrade', type:'Epic', state:'Backlog', pct:0, size:'L', wsjf:9.8, art:'Lending & Mortgages ART', st:'Lending & Mortgages ST', goal:'g1', owner:'Kiran', parent:'Become top digital bank in UK by 2027', product:'Payments'},
    {id:'e5', num:'EPIC0010005', name:'Mortgage Origination Platform', type:'Epic', state:'Funnel', pct:0, size:'XL', wsjf:11.5, art:'Lending & Mortgages ART', st:'Lending & Mortgages ST', goal:'g2', owner:'Raj', parent:'Reduce operating costs by 18% by end of 2026', product:'Lending'},
    {id:'e6', num:'EPIC0010006', name:'Risk Assessment Automation', type:'Epic', state:'Funnel', pct:0, size:'M', wsjf:8.7, art:'Lending & Mortgages ART', st:'Lending & Mortgages ST', goal:'g2', owner:'Priya', parent:'Reduce operating costs by 18% by end of 2026', product:'Risk'},
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
    {id:'c3', num:'CAP0010003', name:'Seamless Payments with retry flows', type:'Capability', state:'Blocked', pct:20, size:'L', wsjf:12.1, parent:'Next-Gen Mobile Banking', art:'Digital Banking ART', owner:'Ananya', goal:'g1', blocked:true},
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
  {id:'f1',  num:'FTR0010001', name:'Fingerprint Login Redesign',         type:'Feature', state:'In Progress',    pct:65,  size:'M', wsjf:11.2, parent:'Seamless Auth',    team:'Auth',       pi:'pi26', pts:18, owner:'Ananya', goal:'g1',
   signalsSummary: 'AI clustered 48 signals across 3 sources — biometric login friction is the #1 NPS detractor in App Store reviews this quarter',
   signals: {
    outlook:  { total: 5, items: [
      { sender: 'David Park',  role: 'VP Mobile', subject: 'Mobile NPS — biometric login feedback',  snippet: 'Login biometric failure rate is our #1 detractor. App Store reviews are calling it out specifically — we need a redesign before the Q3 roadshow.',           time: '4w ago' },
      { sender: 'Lisa Chen',   role: 'CISO',       subject: 'Re: biometric login — security posture', snippet: 'Support the redesign. Current implementation has edge cases in the auth flow that create retry loops. Fix the UX and the security gap in the same build.', time: '4w ago' },
      { sender: 'Ravi Menon',  role: 'CEO',         subject: 'Q3 banking app reviews — action needed', snippet: 'Competitor NPS up 8pts this quarter. Our biometric login is cited in 12% of 1-star reviews. This needs to be a PI 26 priority.',                           time: '5w ago' }
    ] },
    teams:    { total: 9, items: [
      { sender: '#mobile-nps-taskforce', role: 'Channel · 14 mentions', snippet: 'Fingerprint login drop-off raised in app feedback consistently. UX research complete — Auth Team confirmed root cause in the OS permission flow.',                   time: '3w ago' },
      { sender: '@kiran.p',             role: 'Eng · Auth Team',       snippet: 'iOS permission prompts on re-launch are the main culprit. Fix is in the session token re-issue logic — 3 days of effort, well-understood.',                           time: '4w ago' },
      { sender: '@james.c',             role: 'Dev · Auth Team',       snippet: 'Android variant is cleaner — we can align both platforms in the same sprint if we tackle the OS permission layer first.',                                             time: '4w ago' }
    ] },
    customer: { total: 34, items: [
      { sender: 'TKT-47201', role: 'P2 · iOS',     snippet: '"Fingerprint no longer works after app update. I have to enter my password every single time — very inconvenient."',                                                                     time: '3w ago' },
      { sender: 'TKT-47388', role: 'P2 · Android', snippet: '"Biometric login stopped working after I updated the app. Support told me to reinstall — same issue. Please fix."',                                                                      time: '4w ago' },
      { sender: 'TKT-47512', role: 'P3 · NPS 3',   snippet: '"Why does your app ask for biometric permission on every launch? Every other banking app I use just works."',                                                                             time: '4w ago' }
    ] }
   }
  },
  {id:'f2',  num:'FTR0010002', name:'Real-time Fraud Alerts',              type:'Feature', state:'In Progress',    pct:25,  size:'L', wsjf:9.8,  parent:'Risk & Fraud',     team:'Fraud',      pi:'pi26', pts:29, atRisk:true, openDefects:3, owner:'Ananya', goal:'g1',
   signalsSummary: 'AI clustered 68 signals across 3 sources — fraud alert latency is driving chargeback rate up and surfacing in PSD2 audit risk',
   signals: {
    outlook:  { total: 6, items: [
      { sender: 'Maya Thompson', role: 'VP Risk',    subject: 'Fraud notification latency — regulatory risk',  snippet: 'Current alert latency averages 4.2 minutes. PSD2 expects near-real-time. Regulators flagged this in the last two audits — we need to demonstrate progress before Q3 review.', time: '6w ago' },
      { sender: 'Lisa Chen',     role: 'CISO',        subject: 'Fraud alert SLA — escalation',                 snippet: 'Seeing escalation to chargebacks because customers are not alerted in time to stop the transaction. Real-time alerting is the primary mitigation for PI 26.',               time: '6w ago' },
      { sender: 'Emma Walsh',    role: 'VP Payments',  subject: 'Chargeback rate up 0.4pts Q1',                 snippet: 'Chargeback rate at 1.2% vs 0.8% industry benchmark. Fraud alert speed is the identified gap — real-time alerts would intercept ~40% of disputed transactions.',            time: '7w ago' }
    ] },
    teams:    { total: 11, items: [
      { sender: '#fraud-discussions', role: 'Channel · 19 mentions', snippet: 'Alert latency is consistently the top complaint in monthly fraud review calls. Risk team has documented 3 cases where delayed alerts led to full chargebacks.',                 time: '5w ago' },
      { sender: '@marcus.c',          role: 'Eng · Fraud Team',      snippet: 'The ML model is ready — the bottleneck is the notification pipeline. Fix the event bus latency and we get alerts under 30 seconds.',                                             time: '5w ago' },
      { sender: '@aisha.o',           role: 'Sr Eng · Fraud Team',   snippet: 'The 3 open defects are all in the transaction event enrichment layer. Same root cause — one fix, three closures.',                                                               time: '1w ago' }
    ] },
    customer: { total: 51, items: [
      { sender: 'TKT-46802', role: 'P1 · Fraud',  snippet: '"I only found out about the fraudulent transaction when I checked my statement three days later. I was never alerted. My bank should have told me immediately."',                                     time: '5w ago' },
      { sender: 'TKT-46944', role: 'P1 · Fraud',  snippet: '"Received a fraud alert 4 hours after the transaction. By then it was too late to stop. Real-time alerts would have saved this."',                                                                   time: '4w ago' },
      { sender: 'TKT-47102', role: 'P2 · Mobile', snippet: '"App shows fraud warning but only after I open it. Push notifications are delayed or not coming at all — I had no idea a transaction was disputed."',                                               time: '4w ago' }
    ] }
   }
  },
  {id:'f3',  num:'FTR0010003', name:'Payment Confirmation Flow',           type:'Feature', state:'Blocked',        pct:20,  size:'L', wsjf:12.1, parent:'Payments',         team:'Payments',   pi:'pi26', pts:24, blocked:true, blockReason:'Auth API dependency Day 2', owner:'Ananya', goal:'g1',
   signalsSummary: 'AI clustered 38 signals across 3 sources — confirmation latency is the #2 UX complaint and a merchant retention risk',
   signals: {
    outlook:  { total: 4, items: [
      { sender: 'Emma Walsh',   role: 'VP Payments', subject: 'Payment UX — merchant escalation',          snippet: 'Three of our top-10 merchants raised payment confirmation latency as a retention risk. Average confirmation is 8 seconds — competitor benchmark is under 2 seconds.', time: '7w ago' },
      { sender: 'David Park',   role: 'VP Mobile',   subject: 'Re: payment confirmation complaints',       snippet: 'App Store reviews in the last 30 days cite slow payment confirmation in 18% of feedback. #2 UX complaint after biometric login.',                                    time: '7w ago' },
      { sender: 'Ravi Menon',   role: 'CEO',          subject: 'Q3 product priorities — payments must improve', snippet: 'Payments reliability is non-negotiable for the Q3 investor briefing. Payment confirmation flow is specifically called out.',                                    time: '8w ago' }
    ] },
    teams:    { total: 8, items: [
      { sender: '#payments-team', role: 'Channel · 11 mentions', snippet: 'Merchant SLA dashboard shows confirmation step is the bottleneck — 8s average vs 2s target. Auth API round-trip on every transaction is the root cause.', time: '6w ago' },
      { sender: '@vikram.s',      role: 'Sr Eng · Payments',     snippet: 'The confirmation delay is purely Auth API round-trip. Once we have the async token contract we can drop confirmation to under 1.5 seconds.',             time: '6w ago' },
      { sender: '@mei.c',         role: 'Eng · Payments',        snippet: 'Redesigned the confirmation state machine — eliminates 3 redundant network calls. Waiting on the Auth API contract to finalise before we can close.',     time: '5w ago' }
    ] },
    customer: { total: 26, items: [
      { sender: 'TKT-47601', role: 'P2 · Mobile',   snippet: '"Payments take forever to confirm. 8–10 seconds staring at a spinner. I have switched to a competitor app for most payments."',                                       time: '6w ago' },
      { sender: 'TKT-47788', role: 'P2 · Merchant', snippet: '"The payment confirmation step is causing customers to abandon at checkout. We have 12% drop-off at exactly that point in the flow."',                                time: '5w ago' },
      { sender: 'TKT-47901', role: 'P3 · Mobile',   snippet: '"Is the payment processing? Did it go through? I can never tell. 8 seconds of uncertainty every single time."',                                                       time: '5w ago' }
    ] }
   }
  },
  {id:'f4',  num:'FTR0010004', name:'Balance on Home Screen',              type:'Feature', state:'Done',           pct:100, size:'S', wsjf:8.1,  parent:'Account Vis.',     team:'Mobile',     pi:'pi26', pts:21, owner:'Ananya', goal:'g1'},
  {id:'f5',  num:'FTR0010005', name:'Account Statement Export PDF',        type:'Feature', state:'In Progress',    pct:40,  size:'M', wsjf:7.4,  parent:'Self-Service',     team:'Accounts',   pi:'pi26', pts:13, owner:'Priya', goal:'g2'},
  {id:'f6',  num:'FTR0010006', name:'Streamlined Onboarding Flow',         type:'Feature', state:'Funnel',         pct:0,   size:'L', wsjf:8.3,  parent:'Onboarding',       team:'Onboard',    pi:'pi26', pts:22, noTeamSprint3:true, owner:'Raj', goal:'g2'},
  {id:'f7',  num:'FTR0010007', name:'Enhanced Biometric Auth Flow',        type:'Feature', state:'Backlog',        pct:0,   size:'M', wsjf:12.4, parent:'Seamless Auth',    team:'',           pi:null,   pts:0, owner:'Ananya', goal:'g1',
   signalsSummary: 'AI clustered 65 signals across 3 sources — biometric auth gap is the #1 WSJF item, with security debt and competitor pressure compounding urgency',
   signals: {
    outlook:  { total: 6, items: [
      { sender: 'David Park',  role: 'VP Mobile', subject: 'Biometric auth — competitor pressure',       snippet: 'Three competitors shipped enhanced biometric flows in Q1. Our current implementation is 2 generations behind. NPS data shows biometric login is the #1 requested improvement.', time: '3w ago' },
      { sender: 'Lisa Chen',   role: 'CISO',       subject: 'Biometric auth upgrade — security brief',   snippet: 'Enhanced biometric auth (liveness detection + fallback hardening) closes two pen test findings from Q4. Security sign-off for PI 27 is conditional on this scope.',            time: '3w ago' },
      { sender: 'Ravi Menon',  role: 'CEO',         subject: 'Re: digital banking differentiation Q3',   snippet: 'Enhanced biometric auth is specifically cited in the Q3 roadshow script. Competitors are demonstrating it at FinTech Week. We need this in PI 27.',                             time: '4w ago' }
    ] },
    teams:    { total: 12, items: [
      { sender: '#digital-banking-leadership', role: 'Channel · 18 mentions', snippet: 'Biometric auth improvements are top of the Q3 priority list in 3 separate threads. Auth Team confirmed the technical approach is low-risk — existing infrastructure supports liveness detection.', time: '1w ago' },
      { sender: '@james.c',                   role: 'Dev · Auth Team',        snippet: 'Already researched the liveness detection SDK — 2 weeks of integration. Hardened fallback flow is another sprint. Well-defined, low-risk. Auth Team has Sprint 1 capacity in PI 27.',               time: '1w ago' },
      { sender: '@kiran.p',                   role: 'Eng · Auth Team',        snippet: 'If we commit this feature now we can start design review in the IP sprint. No blockers. Cleaner to deliver in PI 27 than bolt on to current sprint.',                                                time: '4d ago' }
    ] },
    customer: { total: 47, items: [
      { sender: 'TKT-48012', role: 'P2 · iOS',     snippet: '"Your competitor\'s app uses face recognition that works in low light. Your biometric login fails when it\'s slightly dark. Please improve."',                                                                                   time: '2w ago' },
      { sender: 'TKT-48109', role: 'P2 · Android', snippet: '"Fingerprint login is unreliable — works 50% of the time. I end up using password every time. Makes the biometric option pointless."',                                                                                          time: '2w ago' },
      { sender: 'TKT-48234', role: 'P3 · NPS 4',   snippet: '"The biometric login on your app is the worst I\'ve used on any banking app. Others have completely smooth flows."',                                                                                                             time: '1w ago' }
    ] }
   }
  },
  // ── PI 27 planned ──
  {id:'f8',  num:'FTR0010008', name:'Dark Mode Support',                   type:'Feature', state:'Funnel', pct:0, size:'M', wsjf:8.4, parent:'Account Vis.',     team:'Mobile',    pi:'pi27', pts:0, owner:'Priya', goal:'g1'},
  {id:'f9',  num:'FTR0010009', name:'Transaction Dispute Resolution',      type:'Feature', state:'Funnel', pct:0, size:'L', wsjf:7.9, parent:'Self-Service',     team:'Accounts',  pi:'pi27', pts:0, owner:'Priya', goal:'g2'},
  {id:'f10', num:'FTR0010010', name:'Notification Preference Centre',      type:'Feature', state:'Analysis', pct:10, size:'S', wsjf:7.2, parent:'Payments',       team:'Payments',  pi:'pi27', pts:0, owner:'Kiran', goal:'g1'},
  {id:'f11', num:'FTR0010011', name:'Cross-Border Payment Support',        type:'Feature', state:'Funnel', pct:0, size:'XL', wsjf:6.8, parent:'Payments',         team:'Payments',  pi:'pi27', pts:0, owner:'Kiran', goal:'g1'},
  {id:'f12', num:'FTR0010012', name:'Account Aggregation API',             type:'Feature', state:'Funnel', pct:0, size:'L', wsjf:6.1, parent:'Open Banking',      team:'Accounts',  pi:'pi27', pts:0, owner:'Raj', goal:'g1'},
  {id:'f17', num:'FTR0010035', name:'Adaptive MFA Enrollment',             type:'Feature', state:'Funnel',   pct:0,  size:'M', wsjf:9.4, parent:'Seamless Auth',    team:'Auth',      pi:'pi27', pts:0, owner:'Ananya', goal:'g1'},
  {id:'f18', num:'FTR0010036', name:'Device Trust Scoring',                type:'Feature', state:'Funnel',   pct:0,  size:'L', wsjf:8.3, parent:'Risk & Fraud',     team:'Fraud',     pi:'pi27', pts:0, owner:'Ananya', goal:'g1'},
  {id:'f19', num:'FTR0010037', name:'Mobile Tokenisation Phase 1',         type:'Feature', state:'Analysis', pct:5,  size:'L', wsjf:7.8, parent:'Payments',         team:'Payments',  pi:'pi27', pts:0, owner:'Ananya', goal:'g1'},
  {id:'f20', num:'FTR0010044', name:'Mortgage Application Wizard',          type:'Feature', state:'Analysis', pct:5,  size:'L', wsjf:9.4, parent:'Automated Onboarding', team:'Mortgages',    pi:'pi27', pts:0, art:'Lending & Mortgages ART', owner:'Raj', goal:'g2'},
  // ── PI 28 planned ──
  {id:'f13', num:'FTR0010013', name:'Statement Date Range Filter',         type:'Feature', state:'Funnel', pct:0, size:'S', wsjf:6.5, parent:'Self-Service',     team:'Accounts',  pi:'pi28', pts:0, owner:'Priya', goal:'g2'},
  {id:'f14', num:'FTR0010014', name:'Biometric Auth for Returning Users',  type:'Feature', state:'Funnel', pct:0, size:'S', wsjf:9.1, parent:'Seamless Auth',    team:'Auth',      pi:'pi28', pts:0, owner:'Ananya', goal:'g1'},
  {id:'f15', num:'FTR0010015', name:'PSD3 Compliance Module',              type:'Feature', state:'Funnel', pct:0, size:'XL', wsjf:13.2, parent:'Open Banking',    team:'Accounts',  pi:'pi28', pts:0, owner:'Raj', goal:'g1'},
  {id:'f16', num:'FTR0010016', name:'Investment Portfolio View',            type:'Feature', state:'Funnel', pct:0, size:'M', wsjf:6.1, parent:'Account Vis.',      team:'Accounts',  pi:'pi28', pts:0, owner:'Priya', goal:'g1'},
  // PI 28 — Lending & Mortgages ART
  {id:'f21', num:'FTR0010045', name:'KYC Document Verification',            type:'Feature', state:'Funnel', pct:0, size:'M', wsjf:8.2, parent:'Automated Onboarding', team:'Mortgages',    pi:'pi28', pts:0, art:'Lending & Mortgages ART', owner:'Raj', goal:'g2'},
  {id:'f22', num:'FTR0010046', name:'Credit Score Real-time Engine',        type:'Feature', state:'Funnel', pct:0, size:'XL', wsjf:11.4, parent:'Credit Risk Scoring', team:'Lending Risk', pi:'pi28', pts:0, art:'Lending & Mortgages ART', owner:'Priya', goal:'g2'},
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
  {id:'bl24', num:'FTR0010043', name:'Continuous Authentication Pilot',      type:'Feature', state:'Funnel',   size:'M', wsjf:4.0,  parent:'Seamless Auth',   team:'', pi:null, pts:8,  owner:'Ananya', goal:'g1'},
  // Backlog — Lending & Mortgages ART (un-committed Feature, art set explicitly so scope filter can resolve)
  {id:'bl25', num:'FTR0010047', name:'Default Risk Predictor',               type:'Feature', state:'Funnel',   size:'L', wsjf:6.5,  parent:'Credit Risk Scoring', team:'', pi:null, pts:13, art:'Lending & Mortgages ART', owner:'Priya', goal:'g2'}
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
      {id:'blw1', num:'STRY61094301', name:'Report fraudulent transaction and recover funds',  state:'Draft', pts:3, owner:'Vikram', team:'Payments Team',  type:'Story', parent:'Real-time Fraud Alerts',         goal:'g1', rank:6,  noAC:true, staleSprints:3},
      {id:'blw2', num:'STRY61094302', name:'Change password regularly for account security',    state:'Draft', pts:2, owner:'James',  team:'Auth Team',      type:'Story', parent:'Fingerprint Login Redesign',     goal:'g1', rank:11, noAC:true},
      {id:'blw3', num:'STRY61094303', name:'Log out remotely to prevent unauthorised access',   state:'Draft', pts:2, owner:'Tomás',  team:'Mobile Exp Team',type:'Story', parent:'Enhanced Biometric Auth Flow',   goal:'g1', rank:13, noAC:true, staleSprints:3},
      {id:'blw4', num:'STRY61094304', name:'Set up PIN as additional protection layer',         state:'Draft', pts:3, owner:'Kiran',  team:'Auth Team',      type:'Story', parent:'Fingerprint Login Redesign',     goal:'g1', rank:8,  noAC:true},
      {id:'blw5', num:'STRY61094305', name:'View devices currently logged into account',        state:'Draft', pts:2, owner:'Yuki',   team:'Mobile Exp Team',type:'Story', parent:'Enhanced Biometric Auth Flow',   goal:'g1', rank:15, noAC:true, staleSprints:3},
      {id:'blw6', num:'STRY61094306', name:'Report security vulnerabilities discovered',        state:'Draft', pts:3, owner:'Marcus', team:'Fraud Team',     type:'Story', parent:'Real-time Fraud Alerts',         goal:'g1', rank:2,  noAC:true},
      {id:'blw7', num:'STRY61094307', name:'Export transaction history as CSV',                  state:'Draft', pts:2, owner:'Lena',   team:'Accounts Team',  type:'Story', parent:'Account Statement Export PDF',   goal:'g2', rank:17, noAC:true, staleSprints:3},
      {id:'blw8', num:'STRY61094308', name:'Enable face recognition for login',                 state:'Draft', pts:5, owner:'James',  team:'Auth Team',      type:'Story', parent:'Biometric Auth for Returning Users', goal:'g1', rank:19, noAC:true},
      {id:'blw9', num:'STRY61094309', name:'Refactor token refresh module for clarity',          state:'Draft', pts:3, owner:'James',  team:'Auth Team',      type:'Story', parent:'Fingerprint Login Redesign',     goal:'g1', rank:23, noAC:true, staleSprints:3},
      {id:'blw10',num:'STRY61094310', name:'Add audit logs for all auth events',                 state:'Draft', pts:5, owner:'James',  team:'Auth Team',      type:'Story', parent:'Real-time Fraud Alerts',         goal:'g1', rank:24, noAC:true}
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
      {id:'bld13',num:'DEF0500650', name:'Biometric library throws on iOS 17.5 lock-screen entry',          state:'Backlog', pts:2, owner:'James',  team:'Auth Team',      type:'Defect', parent:'Fingerprint Login Redesign',    goal:'g1', rank:25},
      {id:'bld14',num:'DEF0500651', name:'Fraud alert not triggered for contactless card transactions',      state:'Backlog', pts:3, owner:'Marcus', team:'Fraud Team',     type:'Defect', parent:'Real-time Fraud Alerts',        goal:'g1', rank:26},
      {id:'bld15',num:'DEF0500652', name:'Fraud score threshold miscalibrated for international transactions',state:'Backlog',pts:3, owner:'Aisha',  team:'Fraud Team',     type:'Defect', parent:'Real-time Fraud Alerts',        goal:'g1', rank:27},
      {id:'bld16',num:'DEF0500653', name:'Real-time alert queue backs up under high transaction volume',     state:'Backlog', pts:5, owner:'Marcus', team:'Fraud Team',     type:'Defect', parent:'Real-time Fraud Alerts',        goal:'g1', rank:28},
      {id:'bld17',num:'DEF0500654', name:'Fraud detection bypassed when user has a pending dispute',         state:'Backlog', pts:2, owner:'Aisha',  team:'Fraud Team',     type:'Defect', parent:'Real-time Fraud Alerts',        goal:'g1', rank:29},
      {id:'bld18',num:'DEF0500655', name:'Alert deduplication window incorrectly set — duplicate sends',     state:'Backlog', pts:2, owner:'Marcus', team:'Fraud Team',     type:'Defect', parent:'Real-time Fraud Alerts',        goal:'g1', rank:30}
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
    {id:'sp2', name:'Sprint 2', dates:EAP._sprintDisplay[1].dates, active:true, capPct:81, totalPts:84, donePts:15, goal:'Deliver PIN fallback handler and biometric onboarding scaffold',
      items: [
        {id:'ls6',  num:'STRY61094201', name:'Handle fallback to PIN on failed biometric scan',     type:'Story',     state:'In Progress', pct:50, pts:3, owner:'James',  team:'Auth Team',     parent:'Fingerprint Login Redesign', goal:'g1', pr:{branch:'feature/pin-fallback-handler', number:1247, status:'open'}, ci:{status:'passing'}, tests:{passed:12, failed:0, total:12}, reviewers:{count:1, approved:0, state:'review-required'}, env:{target:'staging', status:'deployed'}, dod:[{label:'Tests written',done:false},{label:'Code reviewed',done:false},{label:'Design reviewed',done:true},{label:'Docs updated',done:false},{label:'Demo recorded',done:false},{label:'No open bugs',done:false}]},
        {id:'ls7',  num:'STRY61094202', name:'Build payment confirmation screen layout',            type:'Story',     state:'In Progress', pct:40, pts:5, owner:'Vikram', team:'Payments Team', blocked:true, blockReason:'Auth API contract not finalised — screen layout cannot be signed off', parent:'Payment Confirmation Flow', goal:'g1'},
        {id:'ls8',  num:'STRY61094203', name:'Integrate Auth API for payment confirmation flow',    type:'Story',     state:'In Progress', pct:10, pts:8, owner:'Mei',    team:'Payments Team', blocked:true, blockReason:'Auth API dependency Day 2', parent:'Payment Confirmation Flow', goal:'g1'},
        {id:'ls9',  num:'STRY61094204', name:'Payment amount validation rules and error states',    type:'Story',     state:'In Review',   pct:80, pts:3, owner:'Vikram', team:'Payments Team', parent:'Payment Confirmation Flow', goal:'g1', pr:{branch:'feature/payment-validation-rules', number:4291, status:'merged'}, ci:{status:'passing'}, tests:{passed:47, failed:0, total:47}, reviewers:{count:2, approved:2, state:'approved'}, env:{target:'production', status:'gate-pending'}, dod:[{label:'Tests written',done:true},{label:'Code reviewed',done:true},{label:'Design reviewed',done:true},{label:'Docs updated',done:true},{label:'Demo recorded',done:false},{label:'No open bugs',done:true}]},
        {id:'ls10', num:'STRY61094205', name:'Fraud detection webhook integration and retry logic', type:'Story',     state:'In Progress', pct:30, pts:8, owner:'Marcus', team:'Fraud Team',    blocked:true, blockReason:'Event bus latency fix pending — webhook integration cannot validate end-to-end', parent:'Real-time Fraud Alerts', goal:'g1'},
        {id:'ls11', num:'STRY61094206', name:'Balance refresh on app resume and foreground event',  type:'Story',     state:'To Do',       pct:0,  pts:5, owner:'Tomás',  team:'Mobile Exp Team', blocked:true, blockReason:'Carried over from Sprint 1 — DEF0500644 (stale data) must resolve first', parent:'Balance on Home Screen', goal:'g1', carriedOver:true},
        {id:'ls12', num:'STRY61094207', name:'Auth session expiry handler and token refresh',       type:'Story',     state:'In Progress', pct:45, pts:3, owner:'Sana',   team:'Auth Team',     parent:'Fingerprint Login Redesign', goal:'g1', pr:{branch:'feature/auth-session-expiry', number:1251, status:'draft'}, ci:{status:'passing'}, tests:{passed:8, failed:0, total:8}, reviewers:{count:1, approved:0, state:'review-required'}},
        {id:'ls13', num:'STRY61094208', name:'Account statement data fetch from backend API',       type:'Story',     state:'To Do',       pct:0,  pts:3, owner:'Lena',   team:'Accounts Team', parent:'Account Statement Export PDF', goal:'g2'},
        {id:'ls14', num:'STRY61094209', name:'KYC document upload step in onboarding flow',         type:'Story',     state:'To Do',       pct:0,  pts:4, owner:'Nina',   team:'Onboarding Team', blocked:true, blockReason:'KYC compliance sign-off (blc4) not completed — upload step cannot proceed', parent:'Streamlined Onboarding Flow', goal:'g2', carriedOver:true},
        // Defects + Case Task in flight this sprint (realistic mix, not 100% Stories)
        {id:'bld5', num:'DEF0500642',   name:'Fraud alert duplicate firing on card-not-present transactions', type:'Defect',    state:'In Progress', pct:30, pts:2, owner:'Aisha',  team:'Fraud Team',     parent:'Real-time Fraud Alerts',     goal:'g1'},
        {id:'bld6', num:'DEF0500643',   name:'Auth token refresh fails silently after 24h session',           type:'Defect',    state:'In Progress', pct:60, pts:3, owner:'Sana',   team:'Auth Team',      parent:'Fingerprint Login Redesign', goal:'g1', pr:{branch:'fix/auth-token-silent-fail', number:1244, status:'open'}, ci:{status:'running'}},
        {id:'bld9', num:'DEF0500646',   name:'Payment confirmation timeout not handled gracefully',           type:'Defect',    state:'To Do',       pct:0,  pts:2, owner:'Vikram', team:'Payments Team',  parent:'Payment Confirmation Flow',  goal:'g1'},
        {id:'blc3', num:'CSTASK1222242',name:'Document API contract for payment confirmation',                type:'Case Task', state:'In Progress', pct:50, pts:2, owner:'Mei',    team:'Payments Team',  blocked:true, blockReason:'Auth API contract not yet finalised by Auth Team', parent:'Payment Confirmation Flow',  goal:'g1'},
        {id:'ls27', num:'STRY61094222', name:'Build biometric onboarding for new users',                       type:'Story',     state:'In Progress', pct:25, pts:5, owner:'James',  team:'Auth Team',      parent:'Enhanced Biometric Auth Flow', goal:'g1', pr:{branch:'feature/biometric-onboarding', number:1253, status:'open'}, ci:{status:'failing'}, tests:{passed:14, failed:3, total:17}, reviewers:{count:1, approved:0, state:'review-required'}, dod:[{label:'Tests written',done:false},{label:'Code reviewed',done:false},{label:'Design reviewed',done:true},{label:'Docs updated',done:false},{label:'Demo recorded',done:false},{label:'No open bugs',done:false}]},
        // Auth Team — Kiran had no Sprint 2 items despite commitPts:7 in memberMetrics
        {id:'ls36', num:'STRY61094231', name:'Biometric prompt accessibility and error state refinements', type:'Story', state:'In Progress', pct:35, pts:4, owner:'Kiran', team:'Auth Team', parent:'Fingerprint Login Redesign',    goal:'g1'},
        {id:'ls37', num:'STRY61094232', name:'PIN authentication integration with keychain storage',       type:'Story', state:'In Progress', pct:20, pts:3, owner:'Kiran', team:'Auth Team', parent:'Fingerprint Login Redesign',    goal:'g1'},
        // Mobile Exp Team — Yuki had no Sprint 2 work; Tomás had one blocked carryover
        {id:'ls30', num:'STRY61094225', name:'Dark mode color token implementation and theme switcher',        type:'Story', state:'In Progress', pct:20, pts:4, owner:'Yuki',  team:'Mobile Exp Team',  parent:'Dark Mode Support',              goal:'g1'},
        {id:'ls31', num:'STRY61094226', name:'Home screen skeleton loading state',                             type:'Story', state:'In Progress', pct:15, pts:3, owner:'Tomás', team:'Mobile Exp Team',  parent:'Balance on Home Screen',          goal:'g1'},
        // Accounts Team — Omar had no Sprint 2 work; Lena had one not-started item
        {id:'ls32', num:'STRY61094227', name:'Account statement period filter and date range picker',          type:'Story', state:'In Progress', pct:25, pts:5, owner:'Omar',  team:'Accounts Team',    parent:'Account Statement Export PDF',   goal:'g2'},
        {id:'ls33', num:'STRY61094228', name:'Statement export PDF layout and template scaffolding',           type:'Story', state:'In Progress', pct:30, pts:4, owner:'Lena',  team:'Accounts Team',    parent:'Account Statement Export PDF',   goal:'g2', pr:{branch:'feature/statement-export-layout', number:1248, status:'open'}, ci:{status:'passing'}, tests:{passed:9, failed:0, total:9}, env:{target:'staging', status:'deployed'}, dod:[{label:'Tests written',done:false},{label:'Code reviewed',done:false},{label:'Design reviewed',done:true},{label:'Docs updated',done:false},{label:'Demo recorded',done:false},{label:'No open bugs',done:false}]},
        // Onboarding Team — Devi had no Sprint 2 work; Nina had one blocked carryover
        {id:'ls34', num:'STRY61094229', name:'Collect and persist user preferences in onboarding step 3',     type:'Story', state:'In Progress', pct:10, pts:2, owner:'Nina',  team:'Onboarding Team',  parent:'Streamlined Onboarding Flow',    goal:'g2'},
        {id:'ls35', num:'STRY61094230', name:'Onboarding progress indicator and step tracker',                 type:'Story', state:'In Progress', pct:20, pts:3, owner:'Devi',  team:'Onboarding Team',  parent:'Streamlined Onboarding Flow',    goal:'g2'}
      ]
    },
    {id:'sp3', name:'Sprint 3', dates:EAP._sprintDisplay[2].dates, active:false, capPct:0, totalPts:60, donePts:0, goal:'Complete auth regression suite and payment retry mechanism',
      items: [
        {id:'ls15', num:'STRY61094210', name:'Retry mechanism for failed payment submissions',       type:'Story', state:'Planned', pct:0, pts:3, owner:'Vikram', team:'Payments Team', parent:'Payment Confirmation Flow', goal:'g1'},
        {id:'ls16', num:'STRY61094211', name:'Scheduled payment UI with recurring options',          type:'Story', state:'Planned', pct:0, pts:8, owner:'Mei',    team:'Payments Team', parent:'Payment Confirmation Flow', goal:'g1'},
        {id:'ls17', num:'STRY61094212', name:'Statement PDF export component and layout',            type:'Story', state:'Planned', pct:0, pts:5, owner:'Omar',   team:'Accounts Team', parent:'Statement Export PDF', goal:'g2'},
        {id:'ls18', num:'STRY61094213', name:'Auth session expiry handler regression tests',         type:'Story', state:'Planned', pct:0, pts:3, owner:'James',  team:'Auth Team', parent:'Fingerprint Login Redesign', goal:'g1'},
        {id:'ls38', num:'STRY61094233', name:'Biometric integration regression test suite',           type:'Story', state:'Planned', pct:0, pts:5, owner:'Kiran',  team:'Auth Team', parent:'Fingerprint Login Redesign', goal:'g1'},
        {id:'ls19', num:'STRY61094214', name:'Fraud alert deduplication logic and tests',            type:'Story', state:'Planned', pct:0, pts:5, owner:'Aisha',  team:'Fraud Team', parent:'Real-time Fraud Alerts', goal:'g1'},
        {id:'ls20', num:'STRY61094215', name:'App navigation component refactor',                    type:'Story', state:'Planned', pct:0, pts:3, owner:'Yuki',   team:'Mobile Exp Team', parent:'Dark Mode Support', goal:'g1'},
        {id:'ls21', num:'STRY61094216', name:'Onboarding step progress tracker component',           type:'Story', state:'Planned', pct:0, pts:2, owner:'Devi',   team:'Onboarding Team', parent:'Streamlined Onboarding Flow', goal:'g2'},
        {id:'ls28', num:'STRY61094223', name:'Migrate auth tests to new test framework',             type:'Story', state:'Planned', pct:0, pts:5, owner:'James',  team:'Auth Team',       parent:'Fingerprint Login Redesign',  goal:'g1'},
        // Sprint 3 gap-fill: Marcus/Tomás skipped S3; Lena/Nina had no future pipeline
        {id:'ls39', num:'STRY61094234', name:'Fraud alert threshold configuration and rules editor',  type:'Story', state:'Planned', pct:0, pts:5, owner:'Marcus', team:'Fraud Team',       parent:'Real-time Fraud Alerts',       goal:'g1'},
        {id:'ls40', num:'STRY61094235', name:'Dark mode card and list view component updates',         type:'Story', state:'Planned', pct:0, pts:4, owner:'Tomás',  team:'Mobile Exp Team',  parent:'Dark Mode Support',             goal:'g1'},
        {id:'ls41', num:'STRY61094236', name:'Account statement pagination and column sort',           type:'Story', state:'Planned', pct:0, pts:5, owner:'Lena',   team:'Accounts Team',    parent:'Account Statement Export PDF',  goal:'g2'},
        {id:'ls42', num:'STRY61094237', name:'Identity verification with third-party API integration', type:'Story', state:'Planned', pct:0, pts:4, owner:'Nina',   team:'Onboarding Team',  parent:'Streamlined Onboarding Flow',   goal:'g2'},
        {id:'ls45', num:'STRY61094240', name:'Auth biometric regression and acceptance test pass',     type:'Story', state:'Planned', pct:0, pts:3, owner:'Sana',   team:'Auth Team',        parent:'Fingerprint Login Redesign',    goal:'g1'}
      ]
    },
    {id:'sp4', name:'Sprint 4', dates:EAP._sprintDisplay[3].dates, active:false, capPct:0, totalPts:39, donePts:0, goal:'Close PI 26 — step-up auth and recurring payments in production',
      items: [
        {id:'ls22', num:'STRY61094217', name:'Recurring payment logic and edge case handling',       type:'Story', state:'Planned', pct:0, pts:8, owner:'Vikram', team:'Payments Team', parent:'Payment Confirmation Flow', goal:'g1'},
        {id:'ls23', num:'STRY61094218', name:'Payment limit enforcement at API level',               type:'Story', state:'Planned', pct:0, pts:5, owner:'Mei',    team:'Payments Team', parent:'Payment Confirmation Flow', goal:'g1'},
        {id:'ls24', num:'STRY61094219', name:'Biometric returning user login flow',                  type:'Story', state:'Planned', pct:0, pts:3, owner:'Sana',   team:'Auth Team', parent:'Fingerprint Login Redesign', goal:'g1'},
        {id:'ls25', num:'STRY61094220', name:'Fraud dispute UI integration with backend',            type:'Story', state:'Planned', pct:0, pts:5, owner:'Marcus', team:'Fraud Team', parent:'Real-time Fraud Alerts', goal:'g1'},
        {id:'ls26', num:'STRY61094221', name:'Dark mode story card components',                      type:'Story', state:'Planned', pct:0, pts:3, owner:'Tomás',  team:'Mobile Exp Team', parent:'Dark Mode Support', goal:'g1'},
        {id:'ls29', num:'STRY61094224', name:'Implement step-up auth for high-value transactions',   type:'Story', state:'Planned', pct:0, pts:8, owner:'James',  team:'Auth Team',       parent:'Enhanced Biometric Auth Flow', goal:'g1'},
        // Sprint 4 pipeline for Lena and Nina who had no forward work beyond Sprint 2
        {id:'ls43', num:'STRY61094238', name:'Scheduled statement export and email delivery',         type:'Story', state:'Planned', pct:0, pts:4, owner:'Lena',   team:'Accounts Team',   parent:'Account Statement Export PDF',  goal:'g2'},
        {id:'ls44', num:'STRY61094239', name:'Onboarding completion flow and account activation',     type:'Story', state:'Planned', pct:0, pts:3, owner:'Nina',   team:'Onboarding Team', parent:'Streamlined Onboarding Flow',   goal:'g2'}
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
                  {id:'s1', type:'story', name:'Build biometric prompt UI', state:'Done', pct:100, pts:5, owner:'Kiran', team:'Auth', pr:{branch:'feature/biometric-prompt-ui', number:1198, status:'merged'}, ci:{status:'passing'}, tests:{passed:31, failed:0, total:31}, env:{target:'production', status:'deployed'}},
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
  'James':  { assigned:10, inProgress:2, done:0, blocked:0, avgCycle:1.9, wipLimit:2, sprintPts:8,  commitPts:8, predictFinish:84 },
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
// blockV = blocked items in active sprint (ls7+ls8+blc3=Payments, ls10=Fraud, ls11=Mobile, ls14=Onboard)
// qualV = open defects (authoritative — referenced in insight signal text)
EAP.teamHealth = {
  'Auth':       { cap:'healthy', flow:'healthy', qual:'watch',   block:'healthy', capV:80,  flowV:2.1, qualV:3,  blockV:0 },
  'Payments':   { cap:'over',    flow:'watch',   qual:'healthy', block:'over',    capV:92,  flowV:3.1, qualV:1,  blockV:3 },
  'Fraud':      { cap:'healthy', flow:'over',    qual:'over',    block:'watch',   capV:78,  flowV:4.2, qualV:8,  blockV:1 },
  'Mobile':     { cap:'healthy', flow:'healthy', qual:'healthy', block:'watch',   capV:70,  flowV:1.5, qualV:0,  blockV:1 },
  'Accounts':   { cap:'healthy', flow:'watch',   qual:'watch',   block:'healthy', capV:65,  flowV:2.8, qualV:2,  blockV:0 },
  'Onboard':    { cap:'healthy', flow:'healthy', qual:'healthy', block:'watch',   capV:60,  flowV:1.7, qualV:0,  blockV:1 }
};

// ── Team key normalisation — maps both hierarchy IDs (t1…t6) and persona
// contextIds (team-auth, team-payments) to a canonical short key.
EAP.getTeamKey = function(contextId) {
  var map = {
    't1': 'auth',     'team-auth':     'auth',
    't2': 'payments', 'team-payments': 'payments',
    't3': 'fraud',
    't4': 'mobile',
    't5': 'accounts',
    't6': 'onboard'
  };
  return contextId ? (map[contextId] || null) : null;
};

// Signal types: ai=true means AI-inferred (sparkle + teal + confidence + source).
// ai=false or absent means rule-based (system fact, no sparkle, no confidence).
EAP.insights = {
  // ── BACKLOG — "What should we do next?" (no gauge, no teams) ──
  'art-WorkItem-backlog': {
    flowDist: { features:45, defects:30, enablers:15, maintenance:10 },
    signals: [
      {level:'urgent', title:'10 Stories have no acceptance criteria', desc:'Cannot be estimated or tested before Sprint 3 planning.', action:'Prioritise AC definition', meta:'Scanning 30 backlog stories'},
      {level:'urgent', title:'Fraud Team has 8 open defects', desc:'Up from 3 last PI. Defect rate accelerating — all in Real-time Fraud Alerts.', action:'Schedule defect sprint', meta:'Defect trend over last 3 PIs'},
      {level:'watch', title:'5 Stories stale for 3+ sprints', desc:'No sprint assignment or movement. Reducing backlog signal quality.', action:'Review and assign or descope'},
      {level:'ok', title:'Estimation consistency within normal range', desc:'Auth and Payments teams stable this PI.', action:''}
    ]
  },
  // ── PLANNING — "Can we deliver what we committed?" (gauge + teams + depth) ──
  'art-Feature-planning': {
    gauge: {value:68, label:'PI Capacity'},
    predict: {value:72, label:'Completion probability', trend:'down', interval:8},
    health: true,
    signals: [
      {level:'urgent', title:'Payment Confirmation Flow blocked since <strong>Sprint Day 2</strong>', desc:'Auth Team dependency unresolved. <strong>8 days</strong> left in Sprint 2.', why:'The Auth API contract was not finalised before sprint start — creating a hard dependency that only Auth Team can resolve.', recommended:'Escalate to Auth Team lead today. If unresolved by Sprint Day 4, move the 2 downstream items to Sprint 3 to protect sprint integrity.', action:'Escalate now', meta:'2 downstream items at risk', agingDays:3, causeGroup:'auth-api', target:'f3', targetName:'Payment Confirmation Flow'},
      {level:'urgent', title:'Fraud Team Sprint 4 at <strong>110% capacity</strong>', desc:'3 items need moving or descoping before PI closes.', why:'Unplanned work increased from <strong>12% to 18%</strong> across Sprints 3–4, adding scope without adjusting capacity.', recommended:'Move the 3 lowest-priority items to Sprint 5 or the backlog before sprint start to return to 95% capacity.', action:'Rebalance Sprint 4', meta:'Capacity across 4 sprints', miniChart:{type:'bars', values:[85,92,97,110], labels:['Sp 1','Sp 2','Sp 3','Sp 4'], colors:['#00834F','#00834F','#f59e0b','#DC2626'], refLine:100, unit:'%', tooltips:['Sprint 1: 85% — within limit','Sprint 2: 92% — approaching limit','Sprint 3: 97% — at limit','Sprint 4: 110% — over capacity · 3 items to move']}},
      {level:'urgent', ai:true, confidence:'High', title:'Streamlined Onboarding will miss PI 26', desc:'No team assigned Sprint 3. 0% chance of completion this PI.', action:'Assign team', meta:'Velocity analysis of 6 teams over 3 sprints', target:'f6', targetName:'Streamlined Onboarding Flow'},
      {level:'watch', ai:true, confidence:'Moderate', title:'Auth Team is critical path', desc:'At 80% capacity — slip cascades to Payments and Fraud.', action:'Monitor closely', meta:'Dependency chain across 4 Features', causeGroup:'auth-api'},
      {level:'watch', title:'Unplanned work at 18%', desc:'ART target is under 10%. Planning quality risk.', action:'Review sprint planning', meta:'Committed vs actual scope'},
      {level:'ok', title:'Mobile Exp on track Sprints 1–3', desc:'No capacity or dependency issues detected.', action:''}
    ]
  },
  'art-WorkItem-planning': {
    predict: {value:71, label:'Sprint completion', trend:'down', interval:9},
    health: true,
    signals: [
      {level:'urgent', title:'5 Stories blocked across 4 teams', desc:'Auth API (Payments), Fraud event bus, Mobile carryover, and Onboarding sign-off unresolved.', action:'View all blockers', meta:'15 items across 6 teams', agingDays:3, causeGroup:'auth-api'},
      {level:'urgent', ai:true, confidence:'High', title:'Sprint 2 forecast: 62–80% completion range', desc:'Median 71%. Auth and Payments teams below burn target as of Sprint Day 3.', action:'Review with teams', meta:'Monte Carlo · 3-sprint velocity history', causeGroup:'auth-api', miniChart:{type:'forecast', median:71, lo:62, hi:80}},
      {level:'watch', title:'Unplanned work at 18% of Sprint 2', desc:'ART target is under 10%.', action:'Review sprint planning'},
      {level:'ok', title:'Defect rate within normal range', desc:'Quality holding despite new Feature work.', action:''}
    ]
  },
  // ── TIMELINE — "When will things land?" (thin, alerts only) ──
  'art-Feature-timeline': {
    signals: [
      {level:'urgent', ai:true, confidence:'High', title:'Code freeze in 12 days — 3 features below 40% complete', desc:'Payment Confirmation (20%), Fraud Alerts (25%), Onboarding (0%).', action:'Review scope', meta:'Schedule compression analysis'},
      {level:'urgent', ai:true, confidence:'High', title:'Payment Confirmation 60–76% probability of missing Sprint 4', desc:'Blocked since Sprint Day 2. Dependency on Auth API unresolved.', action:'Escalate', meta:'Predicting from blocked duration + team velocity'},
      {level:'watch', title:'2 PI-27 items depend on unfinished PI-26 work', desc:'Transaction Dispute and Cross-Border Payment have cross-PI dependencies.', action:'Review dependencies'},
      {level:'ok', title:'Balance on Home Screen complete', desc:'Dependency for Dark Mode (PI 27) is satisfied.', action:''}
    ]
  },
  'art-WorkItem-timeline': {
    signals: [
      {level:'urgent', title:'Auth API integration aging 8 days', desc:'85th-percentile cycle time is 5 days. Exceeding norm by 60%.', action:'Escalate', agingDays:8, causeGroup:'auth-api'},
      {level:'watch', title:'Sprint 3 starts in 5 days', desc:'4 Sprint 2 items not yet started.', action:'Flag standup'},
      {level:'ok', title:'Sprint 1 items all complete', desc:'No carryover into Sprint 2.', action:''}
    ]
  },
  // ── BOARD — "How is work flowing?" (flow metrics) ──
  'art-WorkItem-board': {
    panelChart: {
      type: 'burndown',
      label: 'Sprint 2 Burndown',
      totalPts: 84,
      // Flat burn for first 3 days (WIP piling up), slight movement day 4-5 — matches WIP bottleneck story
      actual:   [84, 84, 83, 82, 80, null, null, null, null, null],
      forecast: [null, null, null, null, null, 68, 56, 45, 34, 20],
      days: ['Mon','Tue','Wed','Thu','Fri','Mon','Tue','Wed','Thu','Fri']
    },
    signals: [
      {level:'urgent', title:'Payment Confirmation blocked since Sprint Day 2', desc:'Auth API dependency. Blocks 2 others in same sprint. Cascade risk.', action:'Escalate now', meta:'Blocked since sprint start', agingDays:3, causeGroup:'auth-api'},
      {level:'urgent', ai:true, confidence:'Moderate', title:'Flow bottleneck detected', desc:'<strong>17 In Progress</strong>, only <strong>0 Done</strong>. Avg cycle time up <strong>40%</strong> this sprint.', why:'Tasks spend <strong>45%</strong> of their time in an inactive state — items are pulled before previous work closes, stacking pressure in In Progress.', recommended:'Cap In Progress at 6 items. Hold new pulls until 2 items complete. Review pickup times in the next standup.', action:'Check review process', meta:'Flow metrics vs last 3 sprints', miniChart:{type:'bars', values:[0,17,1,0], labels:['Done','In Prog','Review','Test'], colors:['#00834F','#7C3AED','#f59e0b','#2563EB']}},
      {level:'watch', title:'Fraud Team Sprint 4 at 110% capacity', desc:'Items need moving before sprint start.', action:'Rebalance'},
      {level:'watch', title:'Accounts Team 20% below velocity', desc:'3 Stories not yet started as of Sprint Day 3.', action:'Flag in standup'},
      {level:'ok', title:'Auth Team velocity consistent', desc:'On track with last 3 sprints.', action:''}
    ]
  },
  'art-Feature-board': {
    panelChart: {
      type: 'cfd',
      label: 'Cumulative Flow · 14 days',
      series: [
        { label: 'Done',        color: '#00834F', data: [1,2,3,4,5,5,6,7,8,8,9,10,10,11] },
        { label: 'Testing',     color: '#2563EB', data: [1,1,1,2,2,2,2,2,2,3,2,2,2,2]    },
        { label: 'In Review',   color: '#f59e0b', data: [2,2,2,1,2,3,2,2,2,2,3,2,2,2]    },
        { label: 'In Progress', color: '#7C3AED', data: [4,4,3,4,3,3,4,4,4,3,3,4,4,3]    },
        { label: 'Ready',       color: '#c2c1be', data: [5,5,5,4,4,4,3,3,2,2,2,1,1,1]    }
      ]
    },
    signals: [
      {level:'urgent', ai:true, confidence:'High', title:'Fraud Alerts will not complete this PI', desc:'At 25% complete after 2 of 5 sprints. 3 open defects blocking. Completion probability: 12–24%.', action:'Escalate to Fraud Team', meta:'Team velocity + defect trend'},
      {level:'urgent', ai:true, confidence:'High', title:'3 Features below 30% complete with 6 weeks left in PI', desc:'Payment Confirmation (20%), Fraud Alerts (25%), Onboarding (0%). 79–89% probability of missing PI deadline.', action:'Descope or add capacity', meta:'Progress vs remaining PI capacity'},
      {level:'watch', title:'Account Statement Export 40% complete', desc:'Accounts Team below velocity target this sprint.', action:'Check with Accounts Team'},
      {level:'ok', title:'Balance on Home Screen complete', desc:'Opportunity to pull additional scope.', action:''}
    ]
  },
  // ── TASK BOARD — "How is the team executing?" (deep metrics) ──
  'art-WorkItem-taskboard': {
    health: true,
    panelChart: {
      type: 'burndown',
      label: 'Sprint Burndown',
      totalPts: 24,
      // Day 5 = Mon week 2. Slow burn from review bottleneck — 3pts behind ideal.
      actual:   [24, 23, 21, 18, 16, 14, null, null, null, null],
      forecast: [null, null, null, null, null, 14, 10, 6, 2, 0],
      days: ['Mon','Tue','Wed','Thu','Fri','Mon','Tue','Wed','Thu','Fri']
    },
    signals: [
      {level:'urgent', title:'Auth API integration aging 8 days', desc:'85th-percentile cycle time is 5 days. 60% above norm. Blocking 2 downstream items.', action:'Escalate', meta:'Work item age vs team baseline', agingDays:8, causeGroup:'auth-api'},
      {level:'urgent', ai:true, confidence:'High', title:'Vikram has 3 concurrent items (WIP limit: 2)', desc:'Context-switching risk. One item blocked, one in review.', action:'Redistribute work', meta:'WIP analysis across 12 team members'},
      {level:'urgent', title:'WIP limit exceeded: <strong>8 items</strong> in progress', desc:'In Progress has <strong>8 items</strong> against a WIP limit of <strong>6</strong>. 2 over limit — throughput stalling. 0 items in testing or done this sprint.', why:'Items are pulled before previous work closes. Teams optimise for starting, not finishing — increasing queue depth without increasing throughput.', recommended:'Finish before starting. Hold all new pulls until 2 items move to Done. Review WIP limits in next planning session.', action:'Reduce WIP', meta:'Queue depth vs throughput', agingDays:5,
        miniChart:{type:'hbars', items:[
          {label:'In Prog', value:8,  color:'#7C3AED', tip:'In Progress: 8 items — WIP limit exceeded by 2'},
          {label:'Review',  value:1,  color:'#f59e0b', tip:'In Review: 1 item — below WIP limit of 4'},
          {label:'Testing', value:0,  color:'#2563EB', tip:'Testing: 0 items — nothing flowing through'},
          {label:'Done',    value:0,  color:'#00834F', tip:'Done: 0 items — no throughput yet this sprint'}
        ], wipLimit:6}
      },
      {level:'watch', ai:true, confidence:'Moderate', title:'Avg cycle time up <strong>40%</strong> this sprint', desc:'<strong>3.2 days</strong> in In Review vs <strong>2.0 day</strong> target. Review process slowing delivery.', why:'<strong>3 pull requests</strong> have been open for 3+ days with no reviewer activity. One reviewer holds 4 open reviews simultaneously.', recommended:'Redistribute review ownership. Cap each reviewer at 2 open PRs. Raise in next standup to unblock the queue.', action:'Check review process', meta:'Cycle time per column analysis',
        miniChart:{type:'sparkline', values:[2.1,1.9,2.0,2.5,3.2], labels:['Sprint −3','Sprint −2','Sprint −1','Last sprint','This sprint'], color:'#f59e0b', unit:'d', refLine:2.0}
      },
      {level:'watch', title:'5 items not started as of Sprint Day 5', desc:'Sprint 2 has 9 items, 5 still in Draft/Ready.', action:'Flag standup'},
      {level:'ok', title:'Auth Team delivering within velocity range', desc:'2 items done, 2 in progress, on track.', action:''}
    ]
  },
  'team-WorkItem-taskboard': {
    panelChart: {
      type: 'burndown',
      label: 'Sprint Burndown',
      totalPts: 14,
      // Day 3 = Thu week 1. No items completed yet — flat line tells the story.
      actual:   [14, 14, 14, 14, null, null, null, null, null, null],
      forecast: [null, null, null, 14, 10, 7, 4, 2, 0, null],
      days: ['Mon','Tue','Wed','Thu','Fri','Mon','Tue','Wed','Thu','Fri']
    },
    signals: [
      // Cross-persona — only James sees these (Ananya's actions affecting his work)
      {level:'ok', ai:true, confidence:'High', title:'Ananya signed off acceptance criteria for fallback flow', desc:'AC for Fingerprint Login PIN fallback (blc1) approved — ls6 has the AC it needs to close Sprint 2.', action:'Open story', meta:'Sign-off received 2h ago', forPersonas:['james']},
      {level:'urgent', title:'Ananya escalated DEF0500650 to your team', desc:'Biometric library throws on iOS 17.5 lock-screen entry — needs disposition before Sprint 3 commit.', action:'Review with Ananya', meta:'Defect escalated today', forPersonas:['james']},
      {level:'urgent', title:'Auth API delivery is upstream blocker for Payments', desc:'Payments Team\'s Auth API integration has been blocked since Sprint Day 2. Session expiry handler (STRY61094207, 45% done) is the prerequisite.', action:'Prioritise session expiry close', meta:'Cross-team dependency', agingDays:3, causeGroup:'auth-api'},
      {level:'urgent', ai:true, confidence:'High', title:'Sprint 2: 4 items in flight, 0 done as of Sprint Day 3', desc:'Auth Team committed 14 pts across 4 items. All in-progress, none completed — burn rate slow.', action:'Flag standup', meta:'Predicting from team velocity'},
      {level:'watch', ai:true, confidence:'Moderate', title:'James at WIP limit', desc:'2 of 3 in-progress (PIN fallback, biometric onboarding). One more pull risks context-switching.', action:'Hold new pulls', meta:'WIP analysis vs personal limit'},
      {level:'ok', title:'No new defects raised in Sprint 2', desc:'Quality holding for Auth Team this sprint.', action:''}
    ]
  },
  // ── HIERARCHY — "Is strategy connecting to execution?" (structural, not execution) ──
  'art-Feature-hierarchy': {
    signals: [
      {level:'urgent', ai:true, confidence:'High', title:'Goal 2 at risk — strategic imbalance', desc:'"Reduce operating costs" goal at 12% vs 42% for the digital bank growth goal. No Features in execution for Customer Self-Service.', action:'Rebalance portfolio', meta:'Goal progress across 6 Epics'},
      {level:'urgent', title:'Customer Self-Service has 0 Features defined', desc:'Primary Epic for Goal 2. Cannot recover this PI without scoping.', action:'Start scoping'},
      {level:'watch', title:'Open Banking has no Capability breakdown', desc:'PSD3 deadline Q3 2026. Delivery timeline unknown.', action:'Break down into Capabilities'},
      {level:'watch', ai:true, confidence:'Moderate', title:'Pipeline thinning: Next-Gen Mobile Banking', desc:'Epic at 42% but 3 Features unassigned. Nothing to pull in PI 27.', action:'Assign teams', meta:'Demand forecast for PI 27'},
      {level:'watch', title:'2 Epics are empty containers', desc:'Customer Self-Service and Open Banking have no children.', action:'Schedule scoping'},
      {level:'ok', title:'Digital banking goal structurally healthy', desc:'4 of 7 Features in execution. Hierarchy complete.', action:''}
    ]
  },
  // ── BACKLOG Feature — prioritization focused ──
  'art-Feature-backlog': {
    flowDist: { features:55, defects:20, enablers:15, maintenance:10 },
    signals: [
      // Cross-persona — only Ananya sees these (James activity rolling up)
      {level:'urgent', ai:true, confidence:'High', title:'James raised DEF0500650 — affects Fingerprint Login Redesign', desc:'Biometric library throws on iOS 17.5 lock-screen entry. Needs PM disposition before Sprint 3 commit.', action:'Review impact', meta:'Defect raised today by Auth Team', forPersonas:['ananya']},
      {level:'watch',  ai:true, confidence:'High', title:'James advanced PIN fallback to 50% — Fingerprint Login on track', desc:'PIN fallback handler now In Progress. Fingerprint Login Redesign burn rate matches plan for Sprint 2 close.', action:'Open feature', meta:'Auth Team velocity', forPersonas:['ananya']},
      {level:'urgent', ai:true, confidence:'High', title:'47 customers flagged biometric issues', desc:'Up 3× from last month. Enhanced Biometric Auth ranks #1 by WSJF (12.4) in your backlog.', action:'Plan into PI 27', meta:'47 support tickets, 12 NPS comments', target:'f7', targetName:'Enhanced Biometric Auth Flow'},
      {level:'urgent', ai:true, confidence:'High', title:'New theme: payment confirmation too slow', desc:'31 mentions in 7 days. No Feature in backlog matches.', action:'Create Feature', meta:'31 tickets across 3 channels'},
      {level:'urgent', title:'2 Features backlogged for 3+ PIs', desc:'Loan Application Wizard and Investment Portfolio View never pulled.', action:'Prioritise or remove'},
      {level:'watch', ai:true, confidence:'Moderate', title:'3 competitors launched biometric login', desc:'Accelerating Enhanced Biometric Auth makes strategic sense.', action:'Reprioritise', meta:'12 competitor releases monitored', target:'f7', targetName:'Enhanced Biometric Auth Flow'},
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
      {level:'urgent', title:'Auth API integration blocked since Sprint Day 2', desc:'Past team avg resolution: 1.4 days. Escalation window closing.', action:'Escalate'},
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
    e1:   { start: f(piS(-1)),         end: f(piE(1)) },   // Next-Gen Mobile — PI 25–27
    e2:   { start: f(piS(1)),          end: f(piE(2)) },     // Customer Self-Service — PI 27–28
    e3:   { start: f(piS(0)),          end: f(piE(0)) },     // Open Banking API — PI 26
    e4:   { start: f(piS(1)),          end: f(piE(1)) },     // Payment Infrastructure — PI 27
    e5:   { start: f(piS(2)),          end: f(piE(3)) },     // Mortgage Origination — PI 28–29
    e6:   { start: f(piS(2)),          end: f(piE(2)) }      // Risk Assessment — PI 28
  };

  // Capability timeline ranges
  EAP.timelineCaps = {
    c1: { start: f(piS(-1)),         end: f(piE(0)) },     // Seamless Auth — PI 25–26
    c2: { start: f(piS(0)),          end: f(piE(1)) },       // Risk & Fraud — PI 26–27
    c3: { start: f(piS(0)),          end: f(piE(0)) },       // Seamless Payments — PI 26
    c4: { start: f(piS(-2)),         end: f(piE(-1)) },     // Account Visibility — done PI 24–25
    c5: { start: f(piS(0)),          end: f(piE(1)) },       // Self-Service Mgmt — PI 26–27
    c6: { start: f(piS(2)),          end: f(piE(2)) },       // Automated Onboarding — PI 28
    c7: { start: f(piS(2)),          end: f(piE(3)) }        // Credit Risk Engine — PI 28–29
  };

  // Feature timeline ranges — Features always span their full PI (or PIs)
  EAP.timelineFeatures = {
    f1:  { start: f(piS(0)),  end: f(piE(0)) },    // Fingerprint Login — PI 26
    f2:  { start: f(piS(0)),  end: f(piE(0)) },    // Fraud Alerts — PI 26
    f3:  { start: f(piS(0)),  end: f(piE(0)) },    // Payment Confirm — PI 26
    f4:  { start: f(piS(0)),  end: f(piE(0)) },    // Balance Home — PI 26 (Done)
    f5:  { start: f(piS(0)),  end: f(piE(0)) },    // Statement Export — PI 26
    f6:  { start: f(piS(0)),  end: f(piE(0)) },    // Onboarding — PI 26
    f7:  { start: f(piS(0)),  end: f(piE(0)) },    // Enhanced Biometric — PI 26
    f8:  { start: f(piS(1)),  end: f(piE(1)) },    // Dark Mode — PI 27
    f9:  { start: f(piS(1)),  end: f(piE(1)) },    // Transaction Dispute — PI 27
    f10: { start: f(piS(1)),  end: f(piE(1)) },    // Notification Pref — PI 27
    f11: { start: f(piS(1)),  end: f(piE(1)) },    // Cross-Border — PI 27
    f12: { start: f(piS(1)),  end: f(piE(1)) },    // Account Aggregation — PI 27
    f13: { start: f(piS(2)),  end: f(piE(2)) },    // Statement Filter — PI 28
    f14: { start: f(piS(2)),  end: f(piE(2)) },    // Biometric Return — PI 28
    f15: { start: f(piS(2)),  end: f(piE(2)) },    // PSD3 Compliance — PI 28
    f16: { start: f(piS(2)),  end: f(piE(2)) },    // Investment Portfolio — PI 28
    f20: { start: f(piS(1)),  end: f(piE(1)) },    // Mortgage Application Wizard — PI 27
    f21: { start: f(piS(2)),  end: f(piE(2)) },    // KYC Document Verification — PI 28
    f22: { start: f(piS(2)),  end: f(piE(2)) }     // Credit Score Real-time Engine — PI 28
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
  'Ananya': {name:'Ananya Krishnan', initials:'AK', avatar:'../../assets/images/avatar-miley-simmons.png', color:'#0d9488'},
  'Raj':    {name:'Raj Mehta',       initials:'RM', avatar:'../../assets/images/avatar-2.png', color:'#6d28d9'},
  'Priya':  {name:'Priya Kumar',     initials:'PK', avatar:'../../assets/images/SN Avatar-3.png', color:'#6366F1'},
  // Auth Team
  'Kiran':  {name:'Kiran Patel',     initials:'KP', avatar:'../../assets/images/avatar-1.png', color:'#2563EB'},
  'Sana':   {name:'Sana Ali',        initials:'SA', avatar:'../../assets/images/SN Avatar-9.png', color:'#1d4ed8'},
  'James':  {name:'James Carter',    initials:'JC', avatar:'../../assets/images/avatar-james.png', color:'#0d9488'},
  // Payments Team
  'Vikram': {name:'Vikram Singh',    initials:'VS', avatar:'../../assets/images/SN Avatar-4.png', color:'#0d9488'},
  'Mei':    {name:'Mei Chen',        initials:'MC', avatar:'../../assets/images/SN Avatar-7.png', color:'#0f766e'},
  // Fraud Team
  'Marcus': {name:'Marcus Chen',     initials:'MC', avatar:'../../assets/images/avatar-4.png', color:'#D97706'},
  'Aisha':  {name:'Aisha Okonkwo',   initials:'AO', avatar:'../../assets/images/SN Avatar-10.png', color:'#b45309'},
  // Mobile Exp Team
  'Tomás':  {name:'Tomás Rivera',    initials:'TR', avatar:'../../assets/images/avatar-3.png', color:'#8B5CF6'},
  'Yuki':   {name:'Yuki Tanaka',     initials:'YT', avatar:'../../assets/images/SN Avatar-7.png', color:'#7c3aed'},
  // Accounts Team
  'Lena':   {name:'Lena Novak',      initials:'LN', avatar:'../../assets/images/avatar-3.png', color:'#6366F1'},
  'Omar':   {name:'Omar Hassan',     initials:'OH', avatar:'../../assets/images/SN Avatar-4.png', color:'#4f46e5'},
  // Onboarding Team
  'Nina':   {name:'Nina Johansson',  initials:'NJ', avatar:'../../assets/images/SN Avatar-9.png', color:'#EC4899'},
  'Devi':   {name:'Devi Sharma',     initials:'DS', avatar:'../../assets/images/SN Avatar-10.png', color:'#db2777'}
};

// ── Team colours (unique per team for dots, headers, chips) ──
EAP.teamColors = {
  'Auth Team':       '#2563EB',
  'Payments Team':   '#00834f',
  'Fraud Team':      '#8d6e00',
  'Mobile Exp Team': '#7c3aed',
  'Accounts Team':   '#4f46e5',
  'Onboarding Team': '#db2777',
  'Auth': '#2563EB', 'Payments': '#00834f', 'Fraud': '#8d6e00',
  'Mobile': '#7c3aed', 'Accounts': '#4f46e5', 'Onboard': '#db2777'
};

EAP.teamBgColors = {
  'Auth Team':       'rgba(42,110,220,0.10)',
  'Payments Team':   'rgba(0,131,79,0.10)',
  'Fraud Team':      'rgba(141,110,0,0.10)',
  'Mobile Exp Team': 'rgba(124,58,237,0.10)',
  'Accounts Team':   'rgba(79,70,229,0.10)',
  'Onboarding Team': 'rgba(219,39,119,0.10)',
  'Auth': 'rgba(42,110,220,0.10)', 'Payments': 'rgba(0,131,79,0.10)', 'Fraud': 'rgba(141,110,0,0.10)',
  'Mobile': 'rgba(124,58,237,0.10)', 'Accounts': 'rgba(79,70,229,0.10)', 'Onboard': 'rgba(219,39,119,0.10)'
};

// ── Team productivity — per-member sprint health ───────
// completionPct = completed/totalTasks; spCompleted = story pts done this sprint.
// utilHrs are calibrated so member-level Utilized% averages match teamCapacity.sp2
// ensuring the ART view and Team member view tell the same story.
// Formula: utilHrs / roleCap(hrs) = Utilized%
//   Dev/Sr Dev cap = 120hrs  |  QA cap = 80hrs  |  UX cap = 100hrs
EAP.teamProductivity = {
  'Payments Team': [                                            // team avg → 92%
    { member:'Vikram', role:'Senior Developer', totalTasks:24, completed:18, utilHrs:112, completionPct:75, pending:6, quality:'Good',      spCompleted:42 },
    { member:'Mei',    role:'Developer',         totalTasks:19, completed:11, utilHrs:109, completionPct:58, pending:8, quality:'Average',   spCompleted:28 }
  ],
  'Auth Team': [                                                // team avg → 80%
    { member:'James', role:'Senior Developer',  totalTasks:21, completed:16, utilHrs:100, completionPct:76, pending:5, quality:'Good',      spCompleted:38 },
    { member:'Kiran', role:'Developer',          totalTasks:14, completed:11, utilHrs: 95, completionPct:79, pending:3, quality:'Good',      spCompleted:29 },
    { member:'Sana',  role:'QA Engineer',        totalTasks: 8, completed: 7, utilHrs: 62, completionPct:88, pending:1, quality:'Excellent', spCompleted:14 }
  ],
  'Fraud Team': [                                               // team avg → 78%
    { member:'Marcus', role:'Developer',         totalTasks:18, completed:13, utilHrs: 95, completionPct:72, pending:5, quality:'Good',      spCompleted:34 },
    { member:'Aisha',  role:'QA Engineer',       totalTasks:12, completed: 9, utilHrs: 62, completionPct:75, pending:3, quality:'Good',      spCompleted:22 }
  ],
  'Mobile Exp Team': [                                          // team avg → 82%
    { member:'Tomás', role:'Developer',          totalTasks:16, completed: 8, utilHrs: 98, completionPct:50, pending:8, quality:'Average',   spCompleted:24 },
    { member:'Yuki',  role:'UX Developer',       totalTasks:11, completed: 7, utilHrs: 82, completionPct:64, pending:4, quality:'Good',      spCompleted:18 }
  ],
  'Accounts Team': [                                            // team avg → 80%
    { member:'Lena',  role:'Senior Developer',   totalTasks:20, completed:14, utilHrs: 96, completionPct:70, pending:6, quality:'Good',      spCompleted:32 },
    { member:'Omar',  role:'Developer',          totalTasks:15, completed: 9, utilHrs: 96, completionPct:60, pending:6, quality:'Average',   spCompleted:26 }
  ],
  'Onboarding Team': [                                          // team avg → 75%
    { member:'Nina',  role:'Developer',          totalTasks:17, completed:12, utilHrs: 90, completionPct:71, pending:5, quality:'Good',      spCompleted:28 },
    { member:'Devi',  role:'QA Engineer',        totalTasks: 9, completed: 6, utilHrs: 60, completionPct:67, pending:3, quality:'Good',      spCompleted:16 }
  ]
};

// ── Team rosters (unique members per team) ─────────────
EAP.teamMembers = {
  'Auth Team':       ['James', 'Kiran', 'Sana'],
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
  'Mobile Exp Team': {sp2:82,sp3:75,sp4:70,ip:40},
  'Accounts Team':   {sp2:80,sp3:75,sp4:70,ip:40},
  'Onboarding Team': {sp2:75,sp3:68,sp4:60,ip:40}
};

// ── Per-member velocity: last 4 complete sprints (PI25-S3 → PI26-S1) ─────
// Member values sum exactly to their team's history — data is coherent.
// Trend signals: Auth/Onboarding growing, Mobile Exp declining, Payments volatile.
EAP.memberVelocity = {
  'James':  [11, 13, 13, 14],
  'Kiran':  [ 7,  8,  8,  9],
  'Sana':   [ 4,  5,  3,  4],
  'Vikram': [11,  9,  8, 10],
  'Mei':    [ 9,  7,  6,  8],
  'Marcus': [ 9,  7,  8,  7],
  'Aisha':  [ 7,  5,  6,  6],
  'Tomás':  [ 9,  9,  7,  6],
  'Yuki':   [ 7,  7,  6,  5],
  'Lena':   [ 9,  7,  9, 10],
  'Omar':   [ 8,  7,  7,  8],
  'Nina':   [ 6,  7,  8,  9],
  'Devi':   [ 5,  6,  6,  7]
};

EAP.teamVelocityHistory = {
  'Auth Team':       [22, 26, 24, 27],
  'Payments Team':   [20, 16, 14, 18],
  'Fraud Team':      [16, 12, 14, 13],
  'Mobile Exp Team': [16, 16, 13, 11],
  'Accounts Team':   [17, 14, 16, 18],
  'Onboarding Team': [11, 13, 14, 16]
};

// ── Velocity history ───────────────────────────────────
// 3 sprints from PI 25 + Sprint 1 completed + Sprint 2 active (partial).
EAP.velocityHistory = [
  { id:'prevsp3', name:'PI25 S3', pts:19 },
  { id:'prevsp4', name:'PI25 S4', pts:22 },
  { id:'prevsp5', name:'PI25 IP', pts:16 },
  { id:'sp1',     name:'PI26 S1', pts:21 },
  { id:'sp2',     name:'PI26 S2', pts:8, active:true, partial:true }
];
EAP.velocityStats = (function() {
  var done = EAP.velocityHistory.filter(function(s) { return !s.partial; });
  var vals = done.map(function(s) { return s.pts; });
  var avg = Math.round(vals.reduce(function(a, b) { return a + b; }, 0) / vals.length);
  return { avg: avg, high: Math.max.apply(null, vals), low: Math.min.apply(null, vals) };
})();

// ── Per-team velocity histories — Insights Planning tab ───────────────────────
// One entry per team, same structure as EAP.velocityHistory.
// Values tell distinct team stories consistent with EAP.teamHealth.
// Auth team matches EAP.velocityHistory exactly (canonical team context).
// Team burndown totals sum to EAP.sprintHistory active sprint total (84 pts):
//   Auth 14 + Payments 18 + Fraud 14 + Mobile 21 + Accounts 11 + Onboard 6 = 84.
EAP.teamVelocity = (function() {
  function calcStats(history) {
    var done = history.filter(function(s) { return !s.partial; });
    var vals = done.map(function(s) { return s.pts; });
    var avg = Math.round(vals.reduce(function(a, b) { return a + b; }, 0) / vals.length);
    return { avg: avg, high: Math.max.apply(null, vals), low: Math.min.apply(null, vals) };
  }
  var raw = {
    // Auth: steady team, slow this sprint due to blocked Auth API dependency.
    auth:     [{ id:'prevsp3', name:'PI25 S3', pts:19 }, { id:'prevsp4', name:'PI25 S4', pts:22 },
               { id:'prevsp5', name:'PI25 IP', pts:16 }, { id:'sp1',     name:'PI26 S1', pts:21 },
               { id:'sp2',     name:'PI26 S2', pts:8,  active:true, partial:true }],
    // Payments: strong team, current sprint hit by 3 blocked items (cap: over).
    payments: [{ id:'prevsp3', name:'PI25 S3', pts:22 }, { id:'prevsp4', name:'PI25 S4', pts:24 },
               { id:'prevsp5', name:'PI25 IP', pts:17 }, { id:'sp1',     name:'PI26 S1', pts:22 },
               { id:'sp2',     name:'PI26 S2', pts:11, active:true, partial:true }],
    // Fraud: declining trend — cycle time over 4.2d and 8 open defects dragging output.
    fraud:    [{ id:'prevsp3', name:'PI25 S3', pts:18 }, { id:'prevsp4', name:'PI25 S4', pts:16 },
               { id:'prevsp5', name:'PI25 IP', pts:12 }, { id:'sp1',     name:'PI26 S1', pts:17 },
               { id:'sp2',     name:'PI26 S2', pts:9,  active:true, partial:true }],
    // Mobile: healthiest team, consistent linear delivery.
    mobile:   [{ id:'prevsp3', name:'PI25 S3', pts:20 }, { id:'prevsp4', name:'PI25 S4', pts:22 },
               { id:'prevsp5', name:'PI25 IP', pts:14 }, { id:'sp1',     name:'PI26 S1', pts:21 },
               { id:'sp2',     name:'PI26 S2', pts:14, active:true, partial:true }],
    // Accounts: smaller team, modest velocity, slightly behind this sprint.
    accounts: [{ id:'prevsp3', name:'PI25 S3', pts:14 }, { id:'prevsp4', name:'PI25 S4', pts:16 },
               { id:'prevsp5', name:'PI25 IP', pts:11 }, { id:'sp1',     name:'PI26 S1', pts:15 },
               { id:'sp2',     name:'PI26 S2', pts:7,  active:true, partial:true }],
    // Onboard: smallest team, improving trend, on pace this sprint.
    onboard:  [{ id:'prevsp3', name:'PI25 S3', pts:12 }, { id:'prevsp4', name:'PI25 S4', pts:13 },
               { id:'prevsp5', name:'PI25 IP', pts:9  }, { id:'sp1',     name:'PI26 S1', pts:14 },
               { id:'sp2',     name:'PI26 S2', pts:10, active:true, partial:true }]
  };
  var result = {};
  Object.keys(raw).forEach(function(key) {
    result[key] = { history: raw[key], stats: calcStats(raw[key]) };
  });
  return result;
})();

// ── Per-team sprint burndown — Insights Taskboard panel chart ────────────────
// 10-day sprint. 4 actual days (Mon–Thu), forecast from Thursday forward.
// Shapes reflect each team's health story from EAP.teamHealth.
EAP.teamBurndown = {
  // Flat for 4 days — blocked Auth API dependency. Forecast assumes resolution Thu.
  auth:     { type:'burndown', label:'Sprint 2 Burndown · Auth',
              totalPts:14,
              actual:   [14, 14, 14, 14, null, null, null, null, null, null],
              forecast: [null, null, null, 14, 10,  7,  4,  2,  0, null],
              days: ['Mon','Tue','Wed','Thu','Fri','Mon','Tue','Wed','Thu','Fri'] },
  // Flat Mon–Wed (3 blocked items), slight movement Thu. Steep forecast recovery.
  payments: { type:'burndown', label:'Sprint 2 Burndown · Payments',
              totalPts:18,
              actual:   [18, 18, 18, 17, null, null, null, null, null, null],
              forecast: [null, null, null, 17, 13,  9,  5,  1,  0, null],
              days: ['Mon','Tue','Wed','Thu','Fri','Mon','Tue','Wed','Thu','Fri'] },
  // Slow but consistent burn — 1 pt/day. Cycle time and defects limiting throughput.
  fraud:    { type:'burndown', label:'Sprint 2 Burndown · Fraud',
              totalPts:14,
              actual:   [14, 13, 12, 11, null, null, null, null, null, null],
              forecast: [null, null, null, 11,  8,  5,  3,  1,  0, null],
              days: ['Mon','Tue','Wed','Thu','Fri','Mon','Tue','Wed','Thu','Fri'] },
  // Smooth linear burn ~3 pts/day — healthiest execution in the ART.
  mobile:   { type:'burndown', label:'Sprint 2 Burndown · Mobile',
              totalPts:21,
              actual:   [21, 18, 15, 12, null, null, null, null, null, null],
              forecast: [null, null, null, 12,  8,  5,  2,  0, null, null],
              days: ['Mon','Tue','Wed','Thu','Fri','Mon','Tue','Wed','Thu','Fri'] },
  // Slow start Mon–Tue, picking up. Should complete but monitoring.
  accounts: { type:'burndown', label:'Sprint 2 Burndown · Accounts',
              totalPts:11,
              actual:   [11, 11, 10,  9, null, null, null, null, null, null],
              forecast: [null, null, null,  9,  6,  4,  2,  0, null, null],
              days: ['Mon','Tue','Wed','Thu','Fri','Mon','Tue','Wed','Thu','Fri'] },
  // Small team, small commitment. Steady execution, on track.
  onboard:  { type:'burndown', label:'Sprint 2 Burndown · Onboard',
              totalPts:6,
              actual:   [ 6,  5,  5,  4, null, null, null, null, null, null],
              forecast: [null, null, null,  4,  3,  2,  1,  0, null, null],
              days: ['Mon','Tue','Wed','Thu','Fri','Mon','Tue','Wed','Thu','Fri'] }
};

// ── Monte Carlo delivery forecast ─────────────────────
EAP.mcForecast = (function() {
  var today = new Date(); today.setHours(0,0,0,0);
  function addDays(d, n) { var r = new Date(d); r.setDate(r.getDate() + n); return r; }
  function fmtShort(d) {
    var M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return M[d.getMonth()] + ' ' + d.getDate();
  }
  var vs = EAP.velocityStats;
  var SPRINT = 14;
  var dayInSprint2 = (today.getDay() + 2) % 7 + 3;
  var piStart = addDays(today, -(SPRINT + dayInSprint2 - 1));
  // Sprint 2 completion: ~10pts remaining in the active sprint
  var sprint2End = addDays(piStart, SPRINT * 2 - 1);
  var spLeft = Math.round((sprint2End - today) / 86400000);
  var spPts = 10;
  var sP50 = Math.round(spPts / vs.avg * SPRINT);
  var sP70 = Math.round(spPts / (vs.avg * 0.80) * SPRINT);
  var sP85 = Math.round(spPts / (vs.avg * 0.64) * SPRINT);
  // Team backlog horizon: ~35pts across Sprint 3 committed items (~11 items)
  var tPts = 35;
  var tP50 = Math.round(tPts / vs.avg * SPRINT);
  var tP70 = Math.round(tPts / (vs.avg * 0.80) * SPRINT);
  var tP85 = Math.round(tPts / (vs.avg * 0.64) * SPRINT);
  // ART: PI end anchor. At current trajectory (avg 40% complete at 30% PI elapsed)
  var piEndDate = addDays(piStart, 70 - 1);
  var piLeft = Math.round((piEndDate - today) / 86400000);
  var aP50 = piLeft - 2;
  var aP70 = piLeft + 8;
  var aP85 = piLeft + 21;
  return {
    sprint: {
      p50: fmtShort(addDays(today, sP50)), p50days: sP50,
      p70: fmtShort(addDays(today, sP70)), p70days: sP70,
      p85: fmtShort(addDays(today, sP85)), p85days: sP85,
      end: fmtShort(sprint2End), endDays: spLeft
    },
    team: {
      p50: fmtShort(addDays(today, tP50)), p50days: tP50,
      p70: fmtShort(addDays(today, tP70)), p70days: tP70,
      p85: fmtShort(addDays(today, tP85)), p85days: tP85,
      items: 11, basis: '4-sprint history'
    },
    art: {
      p50: fmtShort(addDays(today, aP50)), p50days: aP50,
      p70: fmtShort(addDays(today, aP70)), p70days: aP70,
      p85: fmtShort(addDays(today, aP85)), p85days: aP85,
      piEnd: fmtShort(piEndDate), piEndDays: piLeft,
      features: 6, basis: '4-sprint ART history'
    }
  };
})();

// ── WIP limits per task board column ──────────────────
EAP.wipLimits = { 'In Progress': 6, 'In Review': 4, 'Testing': 3, 'Ready for Acceptance': 3 };

// ── Item priority lookup (Sprint 2 active items) ───────
// H=High, M=Medium, L=Low. Stored separately to keep item definitions clean.
// Blocked/carry-over items → H. Defects → H/M. Unstarted To Do → L.
EAP.itemPriority = {
  'ls6':  'M',  // Auth fallback PIN, In Progress
  'ls7':  'H',  // Payments screen, blocked
  'ls8':  'H',  // Auth API integration, blocked
  'ls9':  'M',  // Payment validation, In Review
  'ls10': 'H',  // Fraud webhook, blocked
  'ls11': 'H',  // Balance refresh, carried over + blocked
  'ls12': 'M',  // Auth session expiry, In Progress
  'ls13': 'L',  // Account statement fetch, To Do
  'ls14': 'H',  // KYC upload, carried over + blocked
  'bld5': 'H',  // Fraud alert defect
  'bld6': 'H',  // Auth token defect
  'bld9': 'M',  // Payment timeout defect
  'blc3': 'H',  // API contract doc, blocked
  'ls27': 'M'   // Biometric onboarding, In Progress (added mid-sprint)
};

// ── Sprint scope delta — Sprint 2 ──────────────────────
// initial* = state at sprint planning. Added mid-sprint: ls27 (Auth +5pts),
// blc3 (Payments +2pts). Removed: none. Net: +7pts, +2 items → 56 total.
EAP.sprintScopeData = {
  sprint: 'Sprint 2',
  initialPts: 49, initialItems: 12,
  addedPts: 7,   addedItems: 2,
  removedPts: 0, removedItems: 0,
  teams: {
    'Auth Team':       { added:1, removed:0, addedPts:5,  removedPts:0 },
    'Payments Team':   { added:1, removed:0, addedPts:2,  removedPts:0 },
    'Fraud Team':      { added:0, removed:0, addedPts:0,  removedPts:0 },
    'Mobile Exp Team': { added:0, removed:0, addedPts:0,  removedPts:0 },
    'Accounts Team':   { added:0, removed:0, addedPts:0,  removedPts:0 },
    'Onboarding Team': { added:0, removed:0, addedPts:0,  removedPts:0 }
  }
};

// ── ART sprint history — last 5 sprints ────────────────
// Completed values derived from teamVelocityHistory sums for coherence:
//   PI25 S3 = 102 (22+20+16+16+17+11), PI25 S4 = 97, PI26 S1 = 95
//   PI26 S2 active: donePts=13 (day 5 of 14), total committed=77
EAP.sprintHistory = [
  { name:'PI25 S3', initial:108, added:4,  removed:2, completed:102, notDone:8  },
  { name:'PI25 S4', initial:103, added:6,  removed:2, completed:97,  notDone:10 },
  { name:'PI25 IP', initial:46,  added:2,  removed:0, completed:44,  notDone:4  },
  { name:'PI26 S1', initial:96,  added:8,  removed:2, completed:95,  notDone:7  },
  { name:'PI26 S2', initial:49,  added:7,  removed:0, completed:8,   notDone:0, active:true, dayOf:5, totalDays:14 }
];

// ── CFD (Cumulative Flow Diagram) — 4-sprint rolling history ──────────────
// Covers PI25 S3 + S4 (complete) + PI26 S1 (complete) + PI26 S2 (active, partial).
// Each row: [total, done, review, inprog, todo, blocked]
// Constraints: row sum = total; done is strictly non-decreasing.
// WIP spike days 16–21: inprog peaks at 9, limit is 6 → AI annotation trigger.
(function() {
  var ROWS = [
    // Sprint 1 — PI25 S3 — days 0–13 — clean delivery
    [ 50,  0,  0,  4, 46,  0],
    [ 50,  0,  2,  6, 42,  0],
    [ 50,  2,  3,  6, 39,  0],
    [ 50,  5,  4,  6, 35,  0],
    [ 50,  8,  4,  6, 32,  0],
    [ 50, 12,  3,  5, 29,  1],
    [ 50, 15,  4,  5, 26,  0],
    [ 50, 19,  4,  5, 22,  0],
    [ 50, 23,  3,  5, 19,  0],
    [ 50, 27,  3,  4, 15,  1],
    [ 50, 31,  3,  4, 11,  1],
    [ 50, 35,  3,  3,  9,  0],
    [ 50, 39,  3,  3,  5,  0],
    [ 50, 42,  2,  3,  2,  1],  // end S1: 42/50 done

    // Sprint 2 — PI25 S4 — days 14–27 — WIP spike days 16–21
    [103, 42,  2,  4, 55,  0],  // +53 new items
    [103, 43,  3,  6, 51,  0],
    [103, 45,  4,  7, 47,  0],  // inprog=7, breach begins
    [103, 46,  4,  8, 44,  1],  // inprog=8
    [106, 47,  3,  9, 46,  1],  // scope+3, inprog=9 ← PEAK (AI annotation)
    [106, 48,  3,  9, 45,  1],  // inprog=9 sustained
    [106, 49,  4,  8, 44,  1],
    [106, 51,  5,  7, 42,  1],  // inprog=7, recovering
    [106, 54,  5,  5, 41,  1],  // inprog back below limit
    [106, 58,  4,  5, 38,  1],
    [106, 63,  3,  4, 35,  1],
    [106, 68,  3,  4, 30,  1],
    [106, 73,  3,  3, 26,  1],
    [106, 78,  2,  3, 22,  1],  // end S2: 78/106 done

    // Sprint 3 — PI26 S1 — days 28–41 — clean sprint
    [158, 78,  2,  3, 74,  1],  // +52 new items
    [158, 80,  3,  5, 69,  1],
    [158, 83,  4,  6, 64,  1],
    [158, 87,  4,  6, 60,  1],
    [158, 91,  4,  6, 56,  1],
    [158, 95,  4,  5, 53,  1],
    [158, 99,  4,  5, 49,  1],
    [158,104,  3,  5, 45,  1],
    [158,109,  3,  5, 40,  1],
    [158,114,  3,  4, 36,  1],
    [158,119,  3,  4, 31,  1],
    [158,124,  3,  3, 27,  1],
    [158,129,  2,  3, 23,  1],
    [158,133,  2,  2, 20,  1],  // end S3: 133/158 done

    // Sprint 4 — PI26 S2 (active) — days 42–48
    [214,133,  2,  3, 75,  1],  // +56 new items
    [214,135,  2,  4, 72,  1],
    [214,137,  3,  5, 68,  1],
    [214,139,  3,  5, 65,  2],
    [214,141,  3,  5, 64,  1],
    [214,143,  3,  5, 62,  1],
    [214,145,  3,  5, 60,  1]   // day 48: beyond typical dayInSprint range
  ];

  var addDays = EAP._addDays, fmt = EAP._fmt;
  // Day 0 = start of PI25 S3 = 2 full sprints + (dayInSprint-1) days before today
  var day0 = addDays(EAP._today, -(14 * 2 + EAP._dayInSprint - 1));
  // Current day index into ROWS: sprint 4 starts at row 42, we're on dayInSprint
  var todayIdx = Math.min(42 + EAP._dayInSprint - 1, ROWS.length - 1);

  EAP.cfdData = ROWS.slice(0, todayIdx + 1).map(function(r, i) {
    return { date: addDays(day0, i), dateStr: fmt(addDays(day0, i)),
             total: r[0], done: r[1], review: r[2], inprog: r[3], todo: r[4], blocked: r[5] };
  });

  // Sprint boundary indices within the CFD window
  EAP.cfdSprints = [
    { idx:  0, label: 'PI25 S3', active: false },
    { idx: 14, label: 'PI25 S4', active: false },
    { idx: 28, label: 'PI26 S1', active: false },
    { idx: 42, label: 'PI26 S2', active: true  }
  ];

  // Day 18 = PI25 S4 day 5 — inprog peak of 9 (WIP limit 6 exceeded for 6 days)
  EAP.cfdWipPeakIdx = 18;

  var n = EAP.cfdData.length;
  var lastDone = EAP.cfdData[n - 1].done;
  EAP.cfdMetrics = {
    throughput: (lastDone / n).toFixed(1),  // items/day over visible window
    cycleTime: 3.8,     // avg days in-flight (WIP / throughput, weighted)
    flowEfficiency: 21  // % of cycle time spent actively worked vs waiting
  };
})();
