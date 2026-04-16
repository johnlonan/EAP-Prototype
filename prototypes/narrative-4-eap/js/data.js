/* ═══════════════════════════════════════════════════════
   DATA.JS — Enterprise Agile Planning Demo Data
   Consolidated · Meridian Bank · Digital Banking ART
   PI 26, Sprint 2 Day 3

   SINGLE SOURCE OF TRUTH: Features array is referenced
   by Backlog, List, Board, and Hierarchy views.
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};

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
  {id:'g2', name:'Reduce operating costs by 18% by end of 2026', state:'Behind', pct:12}
];

EAP.epics = {
  all: [
    // Assigned to STs
    {id:'e1', name:'Next-Gen Mobile Banking Platform', type:'Epic', state:'Implementation', pct:42, size:'XL', wsjf:18.4, art:'Digital Banking ART', goal:'g1', product:'Digital Banking'},
    {id:'e2', name:'Customer Self-Service Expansion', type:'Epic', state:'Funnel', pct:0, size:'L', wsjf:14.1, art:'Digital Banking ART', goal:'g2', product:'Digital Banking'},
    {id:'e3', name:'Open Banking API Programme', type:'Epic', state:'Review', pct:0, size:'XL', wsjf:13.2, art:'Digital Banking ART', goal:'g1', product:'Digital Banking'},
    {id:'e4', name:'Payment Infrastructure Upgrade', type:'Epic', state:'Backlog', pct:0, size:'L', wsjf:9.8, art:'Lending & Mortgages ART', goal:'g1', product:'Payments'},
    {id:'e5', name:'Mortgage Origination Platform', type:'Epic', state:'Funnel', pct:0, size:'XL', wsjf:11.5, art:'Lending & Mortgages ART', goal:'g2', product:'Lending'},
    {id:'e6', name:'Risk Assessment Automation', type:'Epic', state:'Funnel', pct:0, size:'M', wsjf:8.7, art:'Lending & Mortgages ART', goal:'g2', product:'Risk'},
    // Backlog (no ST)
    {id:'ebl1', name:'AI-Powered Customer Support', type:'Epic', state:'Funnel', pct:0, size:'M', wsjf:7.4, art:'', goal:'g2', product:''},
    {id:'ebl2', name:'Core Infrastructure Modernisation', type:'Epic', state:'Funnel', pct:0, size:'L', wsjf:6.8, art:'', goal:'g2', product:''},
    {id:'ebl3', name:'Digital Savings Platform', type:'Epic', state:'Backlog', pct:0, size:'S', wsjf:5.5, art:'', goal:'', product:''},
    {id:'ebl4', name:'Employee Digital Workspace', type:'Epic', state:'Funnel', pct:0, size:'M', wsjf:4.2, art:'', goal:'', product:''}
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
    {id:'c1', name:'Seamless Authentication across channels', type:'Capability', state:'Implementation', pct:65, size:'L', wsjf:15.2, parent:'Next-Gen Mobile Banking', art:'Digital Banking ART'},
    {id:'c2', name:'Real-time Risk and Fraud detection', type:'Capability', state:'In Progress', pct:30, size:'XL', wsjf:13.9, parent:'Next-Gen Mobile Banking', art:'Digital Banking ART'},
    {id:'c3', name:'Seamless Payments with retry flows', type:'Capability', state:'Blocked', pct:20, size:'L', wsjf:12.1, parent:'Next-Gen Mobile Banking', art:'Digital Banking ART'},
    {id:'c4', name:'Customer Account Visibility', type:'Capability', state:'Done', pct:100, size:'M', wsjf:9.8, parent:'Customer Self-Service', art:'Digital Banking ART'},
    {id:'c5', name:'Self-Service Account Management', type:'Capability', state:'In Progress', pct:40, size:'M', wsjf:9.2, parent:'Customer Self-Service', art:'Digital Banking ART'},
    {id:'c6', name:'Automated Onboarding with KYC', type:'Capability', state:'Funnel', pct:0, size:'L', wsjf:8.7, parent:'Mortgage Origination', art:'Lending & Mortgages ART'},
    {id:'c7', name:'Credit Risk Scoring Engine', type:'Capability', state:'Funnel', pct:0, size:'XL', wsjf:7.4, parent:'Risk Assessment', art:'Lending & Mortgages ART'},
    // Backlog
    {id:'cbl1', name:'Adapt content to cultural norms', type:'Capability', state:'Funnel', size:'S', wsjf:8.2, parent:'Localisation', art:''},
    {id:'cbl2', name:'Auto-translate text into other languages', type:'Capability', state:'Funnel', size:'S', wsjf:7.9, parent:'Localisation', art:''},
    {id:'cbl3', name:'Market research for customer preferences', type:'Capability', state:'Funnel', size:'M', wsjf:7.1, parent:'Marketing', art:''},
    {id:'cbl4', name:'Comprehensive marketing plan aligned to goals', type:'Capability', state:'Funnel', size:'L', wsjf:6.5, parent:'Marketing', art:''},
    {id:'cbl5', name:'Real-time regulatory compliance monitoring', type:'Capability', state:'Funnel', size:'L', wsjf:6.0, parent:'Compliance', art:''}
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
  {id:'f1',  name:'Fingerprint Login Redesign',         type:'Feature', state:'In Progress',    pct:65,  size:'M', wsjf:11.2, parent:'Seamless Auth',    team:'Auth',       pi:'pi26', pts:18},
  {id:'f2',  name:'Real-time Fraud Alerts',              type:'Feature', state:'In Progress',    pct:25,  size:'L', wsjf:9.8,  parent:'Risk & Fraud',     team:'Fraud',      pi:'pi26', pts:29, atRisk:true, openDefects:3},
  {id:'f3',  name:'Payment Confirmation Flow',           type:'Feature', state:'Blocked',        pct:20,  size:'L', wsjf:12.1, parent:'Payments',         team:'Payments',   pi:'pi26', pts:24, blocked:true, blockReason:'Auth API dependency Day 2'},
  {id:'f4',  name:'Balance on Home Screen',              type:'Feature', state:'Done',           pct:100, size:'S', wsjf:8.1,  parent:'Account Vis.',     team:'Mobile',     pi:'pi26', pts:21},
  {id:'f5',  name:'Account Statement Export PDF',        type:'Feature', state:'In Progress',    pct:40,  size:'M', wsjf:7.4,  parent:'Self-Service',     team:'Accounts',   pi:'pi26', pts:13},
  {id:'f6',  name:'Streamlined Onboarding Flow',         type:'Feature', state:'Funnel',         pct:0,   size:'L', wsjf:8.3,  parent:'Onboarding',       team:'Onboard',    pi:'pi26', pts:22, noTeamSprint3:true},
  {id:'f7',  name:'Enhanced Biometric Auth Flow',        type:'Feature', state:'Backlog',        pct:0,   size:'M', wsjf:12.4, parent:'Seamless Auth',    team:'Auth',       pi:'pi26', pts:0},
  // ── PI 27 planned ──
  {id:'f8',  name:'Dark Mode Support',                   type:'Feature', state:'Funnel', pct:0, size:'M', wsjf:8.4, parent:'Account Vis.',     team:'Mobile',    pi:'pi27', pts:0},
  {id:'f9',  name:'Transaction Dispute Resolution',      type:'Feature', state:'Funnel', pct:0, size:'L', wsjf:7.9, parent:'Self-Service',     team:'Accounts',  pi:'pi27', pts:0},
  {id:'f10', name:'Notification Preference Centre',      type:'Feature', state:'Analysis', pct:10, size:'S', wsjf:7.2, parent:'Payments',       team:'Payments',  pi:'pi27', pts:0},
  {id:'f11', name:'Cross-Border Payment Support',        type:'Feature', state:'Funnel', pct:0, size:'XL', wsjf:6.8, parent:'Payments',         team:'Payments',  pi:'pi27', pts:0},
  {id:'f12', name:'Account Aggregation API',             type:'Feature', state:'Funnel', pct:0, size:'L', wsjf:6.1, parent:'Open Banking',      team:'Accounts',  pi:'pi27', pts:0},
  // ── PI 28 planned ──
  {id:'f13', name:'Statement Date Range Filter',         type:'Feature', state:'Funnel', pct:0, size:'S', wsjf:6.5, parent:'Self-Service',     team:'Accounts',  pi:'pi28', pts:0},
  {id:'f14', name:'Biometric Auth for Returning Users',  type:'Feature', state:'Funnel', pct:0, size:'S', wsjf:9.1, parent:'Seamless Auth',    team:'Auth',      pi:'pi28', pts:0},
  {id:'f15', name:'PSD3 Compliance Module',              type:'Feature', state:'Funnel', pct:0, size:'XL', wsjf:13.2, parent:'Open Banking',    team:'Accounts',  pi:'pi28', pts:0},
  {id:'f16', name:'Investment Portfolio View',            type:'Feature', state:'Funnel', pct:0, size:'M', wsjf:6.1, parent:'Account Vis.',      team:'Accounts',  pi:'pi28', pts:0},
  // ── Backlog (no PI) — 18 items for volume ──
  {id:'bl1',  name:'Instant Payment Notifications',       type:'Feature', state:'Funnel',   size:'S', wsjf:10.8, parent:'Payments',        team:'', pi:null, pts:8},
  {id:'bl2',  name:'Transaction Dispute Resolution',      type:'Feature', state:'Backlog',  size:'M', wsjf:8.7,  parent:'Self-Service',    team:'', pi:null, pts:5},
  {id:'bl3',  name:'Scheduled Payment Manager',           type:'Feature', state:'Funnel',   size:'S', wsjf:7.1,  parent:'Payments',        team:'', pi:null, pts:8},
  {id:'bl4',  name:'Account Statement Export — Additional Scope', type:'Feature', state:'Backlog', size:'S', wsjf:5.4, parent:'Self-Service', team:'', pi:null, pts:5},
  {id:'bl5',  name:'Loan Application Wizard',             type:'Feature', state:'Funnel',   size:'L', wsjf:4.2,  parent:'Onboarding',      team:'', pi:null, pts:13, stalePIs:3},
  {id:'bl6',  name:'Investment Portfolio View',            type:'Feature', state:'Funnel',   size:'M', wsjf:3.8,  parent:'Account Vis.',    team:'', pi:null, pts:8, stalePIs:3},
  {id:'bl7',  name:'Multi-Currency Wallet Support',        type:'Feature', state:'Funnel',   size:'L', wsjf:5.1,  parent:'Payments',        team:'', pi:null, pts:13},
  {id:'bl8',  name:'Automated KYC Refresh Flow',           type:'Feature', state:'Analysis', size:'M', wsjf:4.8,  parent:'Onboarding',      team:'', pi:null, pts:8},
  {id:'bl9',  name:'Push Notification Preferences',        type:'Feature', state:'Backlog',  size:'S', wsjf:4.2,  parent:'Payments',        team:'', pi:null, pts:5},
  {id:'bl10', name:'Card Freeze/Unfreeze Toggle',          type:'Feature', state:'Funnel',   size:'S', wsjf:3.9,  parent:'Account Vis.',    team:'', pi:null, pts:3},
  {id:'bl11', name:'Spending Insights Dashboard',          type:'Feature', state:'Funnel',   size:'M', wsjf:3.5,  parent:'Account Vis.',    team:'', pi:null, pts:8},
  {id:'bl12', name:'Contactless Payment Limit Override',   type:'Feature', state:'Funnel',   size:'S', wsjf:3.2,  parent:'Payments',        team:'', pi:null, pts:3},
  {id:'bl13', name:'Standing Order Management',            type:'Feature', state:'Backlog',  size:'M', wsjf:3.0,  parent:'Payments',        team:'', pi:null, pts:8},
  {id:'bl14', name:'Direct Debit Cancellation Flow',       type:'Feature', state:'Funnel',   size:'S', wsjf:2.8,  parent:'Payments',        team:'', pi:null, pts:5},
  {id:'bl15', name:'Savings Goal Tracker',                 type:'Feature', state:'Funnel',   size:'M', wsjf:2.5,  parent:'Account Vis.',    team:'', pi:null, pts:8},
  {id:'bl16', name:'Open Banking Consent Manager',         type:'Feature', state:'Analysis', size:'L', wsjf:5.8,  parent:'Open Banking',    team:'', pi:null, pts:13},
  {id:'bl17', name:'Customer Feedback Widget',             type:'Feature', state:'Funnel',   size:'S', wsjf:2.2,  parent:'Self-Service',    team:'', pi:null, pts:3},
  {id:'bl18', name:'In-App Chat Support',                  type:'Feature', state:'Funnel',   size:'L', wsjf:4.5,  parent:'Self-Service',    team:'', pi:null, pts:13}
];

// ── Feature accessors ──────────────────────────────────
EAP.features = {
  backlog: function(){ return EAP.allFeatures.filter(function(f){ return f.pi === null; }); },
  byPI: function(piId){ return EAP.allFeatures.filter(function(f){ return f.pi === piId; }); },
  pis: [
    {id:'pi26', name:'PI 26', dates:'Apr 15 – Jun 9',  active:true,  capPct:68, totalPts:91, donePts:24},
    {id:'pi27', name:'PI 27', dates:'Jun 10 – Aug 31', active:false, capPct:0,  totalPts:0,  donePts:0},
    {id:'pi28', name:'PI 28', dates:'Sep 1 – Nov 30',  active:false, capPct:0,  totalPts:0,  donePts:0},
    {id:'pi29', name:'PI 29', dates:'Dec 1 – Feb 28',  active:false, capPct:0,  totalPts:0,  donePts:0}
  ]
};

// ═══════════════════════════════════════════════════════
// WORK ITEMS — Stories, Defects, Case Tasks
// ═══════════════════════════════════════════════════════
EAP.workItems = {
  backlog: {
    Story: [
      {id:'blw1', num:'STRY61094301', name:'Report fraudulent transaction and recover funds',  state:'Draft', pts:3, owner:'Kiran',  team:'Payments Team', type:'Story', epic:''},
      {id:'blw2', num:'STRY61094302', name:'Change password regularly for account security',    state:'Draft', pts:2, owner:'Dev2',   team:'Auth Team',     type:'Story', epic:''},
      {id:'blw3', num:'STRY61094303', name:'Log out remotely to prevent unauthorised access',   state:'Draft', pts:2, owner:'Dev3',   team:'Mobile Exp Team',type:'Story', epic:''},
      {id:'blw4', num:'STRY61094304', name:'Set up PIN as additional protection layer',         state:'Draft', pts:3, owner:'Dev2',   team:'Auth Team',     type:'Story', epic:''},
      {id:'blw5', num:'STRY61094305', name:'View devices currently logged into account',        state:'Draft', pts:2, owner:'Dev4',   team:'Mobile Exp Team',type:'Story', epic:''},
      {id:'blw6', num:'STRY61094306', name:'Report security vulnerabilities discovered',        state:'Draft', pts:3, owner:'Dev3',   team:'Fraud Team',    type:'Story', epic:''},
      {id:'blw7', num:'STRY61094307', name:'Export transaction history as CSV',                  state:'Draft', pts:2, owner:'Dev4',   team:'Accounts Team', type:'Story', epic:''},
      {id:'blw8', num:'STRY61094308', name:'Enable face recognition for login',                 state:'Draft', pts:5, owner:'Kiran',  team:'Auth Team',     type:'Story', epic:''}
    ],
    Defect: [
      {id:'bld1', num:'DEF0192954', name:'Resource Report forecast utilisation not calculated with days off', state:'Backlog', pts:0, owner:'Dev2', team:'Payments Team',  type:'Defect', epic:''},
      {id:'bld2', num:'DEF0366785', name:'Mobile timesheets single-select should auto-close modal',          state:'Backlog', pts:0, owner:'Dev3', team:'Mobile Exp Team',type:'Defect', epic:''},
      {id:'bld3', num:'DEF0500640', name:'Push notification delayed on Android 14 devices',                  state:'Backlog', pts:0, owner:'Dev3', team:'Mobile Exp Team',type:'Defect', epic:''},
      {id:'bld4', num:'DEF0500641', name:'Statement PDF missing page numbers on multi-page exports',         state:'Backlog', pts:0, owner:'Dev4', team:'Accounts Team',  type:'Defect', epic:''},
      {id:'bld5', num:'DEF0500642', name:'Fraud alert duplicate firing on card-not-present transactions',    state:'Backlog', pts:2, owner:'Dev3', team:'Fraud Team',     type:'Defect', epic:''},
      {id:'bld6', num:'DEF0500643', name:'Auth token refresh fails silently after 24h session',              state:'Backlog', pts:3, owner:'Dev2', team:'Auth Team',      type:'Defect', epic:''},
      {id:'bld7', num:'DEF0500644', name:'Balance widget shows stale data after background app resume',      state:'Backlog', pts:2, owner:'Dev4', team:'Mobile Exp Team',type:'Defect', epic:''},
      {id:'bld8', num:'DEF0500645', name:'Fraud webhook retry logic creates duplicate entries',              state:'Backlog', pts:3, owner:'Dev3', team:'Fraud Team',     type:'Defect', epic:''},
      {id:'bld9', num:'DEF0500646', name:'Payment confirmation timeout not handled gracefully',              state:'Backlog', pts:2, owner:'Kiran',team:'Payments Team',  type:'Defect', epic:''},
      {id:'bld10',num:'DEF0500647', name:'Onboarding KYC upload crashes on large file',                     state:'Backlog', pts:0, owner:'Dev2', team:'Onboarding Team',type:'Defect', epic:''},
      {id:'bld11',num:'DEF0500648', name:'Fraud detection model false positive rate above threshold',       state:'Backlog', pts:5, owner:'Dev3', team:'Fraud Team',     type:'Defect', epic:''},
      {id:'bld12',num:'DEF0500649', name:'Account statement date filter off-by-one error',                  state:'Backlog', pts:1, owner:'Dev4', team:'Accounts Team',  type:'Defect', epic:''}
    ],
    CaseTask: [
      {id:'blc1', num:'CSTASK1070158', name:'Write acceptance criteria for biometric fallback flow', state:'Draft', pts:1, owner:'Ananya', team:'Auth Team',     type:'Case Task', epic:''},
      {id:'blc2', num:'CSTASK1215264', name:'Update test plan for fraud alert deduplication',        state:'Draft', pts:1, owner:'Dev2',   team:'Fraud Team',    type:'Case Task', epic:''},
      {id:'blc3', num:'CSTASK1222242', name:'Document API contract for payment confirmation',        state:'Draft', pts:2, owner:'Dev3',   team:'Payments Team', type:'Case Task', epic:''},
      {id:'blc4', num:'CSTASK1222243', name:'Review KYC compliance checklist sign-off',              state:'Draft', pts:1, owner:'Ananya', team:'Onboarding Team',type:'Case Task', epic:''},
      {id:'blc5', num:'CSTASK1222244', name:'Create runbook for biometric service deployment',       state:'Draft', pts:2, owner:'Dev4',   team:'Auth Team',     type:'Case Task', epic:''},
      {id:'blc6', num:'CSTASK1222245', name:'Coordinate UAT session for statement export',           state:'Draft', pts:1, owner:'Kiran',  team:'Accounts Team', type:'Case Task', epic:''}
    ]
  },
  sprints: [
    {id:'sp2', name:'Sprint 2', dates:'Apr 15–28', active:true, capPct:60, totalPts:32, donePts:8,
      items: [
        {id:'ls6',  name:'Handle fallback to PIN on failed biometric scan',     state:'In Progress', pct:50, pts:3, owner:'Kiran', team:'Auth Team'},
        {id:'ls7',  name:'Build payment confirmation screen layout',            state:'In Progress', pct:40, pts:5, owner:'Kiran', team:'Payments Team'},
        {id:'ls8',  name:'Integrate Auth API for payment confirmation flow',     state:'Blocked',     pct:10, pts:8, owner:'Kiran', team:'Payments Team', blocked:true, blockReason:'Auth API dependency Day 2'},
        {id:'ls9',  name:'Payment amount validation rules and error states',     state:'In Review',   pct:80, pts:3, owner:'Dev2',  team:'Payments Team'},
        {id:'ls10', name:'Fraud detection webhook integration and retry logic',  state:'In Progress', pct:30, pts:8, owner:'Dev3',  team:'Fraud Team'},
        {id:'ls11', name:'Balance refresh on app resume and foreground event',   state:'To Do',       pct:0,  pts:5, owner:'Dev4',  team:'Mobile Exp Team'},
        {id:'ls12', name:'Auth session expiry handler and token refresh',        state:'In Progress', pct:45, pts:3, owner:'Dev2',  team:'Auth Team'},
        {id:'ls13', name:'Account statement data fetch from backend API',        state:'To Do',       pct:0,  pts:3, owner:'Dev4',  team:'Accounts Team'},
        {id:'ls14', name:'KYC document upload step in onboarding flow',          state:'To Do',       pct:0,  pts:4, owner:'Dev3',  team:'Onboarding Team'}
      ]
    },
    {id:'sp3', name:'Sprint 3', dates:'Apr 29 – May 12', active:false, capPct:0, totalPts:29, donePts:0,
      items: [
        {id:'ls15', name:'Retry mechanism for failed payment submissions',       state:'Planned', pct:0, pts:3, owner:'Kiran', team:'Payments Team'},
        {id:'ls16', name:'Scheduled payment UI with recurring options',          state:'Planned', pct:0, pts:8, owner:'Dev2',  team:'Payments Team'},
        {id:'ls17', name:'Statement PDF export component and layout',            state:'Planned', pct:0, pts:5, owner:'Dev4',  team:'Accounts Team'},
        {id:'ls18', name:'Auth session expiry handler regression tests',         state:'Planned', pct:0, pts:3, owner:'Dev2',  team:'Auth Team'},
        {id:'ls19', name:'Fraud alert deduplication logic and tests',            state:'Planned', pct:0, pts:5, owner:'Dev3',  team:'Fraud Team'},
        {id:'ls20', name:'App navigation component refactor',                    state:'Planned', pct:0, pts:3, owner:'Dev4',  team:'Mobile Exp Team'},
        {id:'ls21', name:'Onboarding step progress tracker component',           state:'Planned', pct:0, pts:2, owner:'Dev3',  team:'Onboarding Team'}
      ]
    },
    {id:'sp4', name:'Sprint 4', dates:'May 13–26', active:false, capPct:0, totalPts:24, donePts:0,
      items: [
        {id:'ls22', name:'Recurring payment logic and edge case handling',       state:'Planned', pct:0, pts:8, owner:'Kiran', team:'Payments Team'},
        {id:'ls23', name:'Payment limit enforcement at API level',               state:'Planned', pct:0, pts:5, owner:'Dev2',  team:'Payments Team'},
        {id:'ls24', name:'Biometric returning user login flow',                  state:'Planned', pct:0, pts:3, owner:'Dev2',  team:'Auth Team'},
        {id:'ls25', name:'Fraud dispute UI integration with backend',            state:'Planned', pct:0, pts:5, owner:'Dev3',  team:'Fraud Team'},
        {id:'ls26', name:'Dark mode story card components',                      state:'Planned', pct:0, pts:3, owner:'Dev4',  team:'Mobile Exp Team'}
      ]
    },
    {id:'sp5', name:'IP Sprint', dates:'May 27 – Jun 9', active:false, capPct:0, totalPts:0, donePts:0, items:[]}
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
                  {id:'s3', type:'story', name:'Error state on failed scan', state:'To Do', pct:0, pts:2, owner:'Dev2', team:'Auth'},
                  {id:'d1', type:'defect', name:'DEF-001: Biometric fails on iOS 17.4', state:'Blocked', pct:0, pts:0, owner:'Dev3', team:'Auth'}
                ]},
              {id:'f7', type:'feature', name:'Enhanced Biometric Auth Flow', state:'Backlog', pct:0, pts:0, owner:'', team:'Auth', children:[]}
            ]},
          {id:'c2', type:'capability', name:'Real-time Risk and Fraud', state:'In Progress', pct:25, pts:29, owner:'Ananya', team:'Fraud',
            children: [
              {id:'f2', type:'feature', name:'Real-time Fraud Alerts', state:'In Progress', pct:25, pts:29, owner:'Ananya', team:'Fraud',
                children: [
                  {id:'s4', type:'story', name:'Fraud detection webhook', state:'In Progress', pct:30, pts:8, owner:'Dev3', team:'Fraud'},
                  {id:'s5', type:'story', name:'Alert delivery service', state:'In Progress', pct:10, pts:8, owner:'Dev4', team:'Fraud'},
                  {id:'d2', type:'defect', name:'DEF-002: Alert not firing card-not-present', state:'Blocked', pct:0, pts:0, owner:'Dev3', team:'Fraud'},
                  {id:'d3', type:'defect', name:'DEF-003: Duplicate alerts on retry', state:'Blocked', pct:0, pts:0, owner:'Dev3', team:'Fraud'}
                ]}
            ]},
          {id:'c3', type:'capability', name:'Seamless Payments', state:'Blocked', pct:20, pts:24, owner:'Ananya', team:'Payments',
            children: [
              {id:'f3', type:'feature', name:'Payment Confirmation Flow', state:'Blocked', pct:20, pts:24, owner:'Ananya', team:'Payments',
                children: [
                  {id:'s6', type:'story', name:'Auth API integration', state:'Blocked', pct:10, pts:8, owner:'Kiran', team:'Payments'},
                  {id:'s7', type:'story', name:'Confirmation screen UI', state:'In Progress', pct:40, pts:5, owner:'Kiran', team:'Payments'},
                  {id:'s8', type:'story', name:'Payment validation rules', state:'In Review', pct:80, pts:3, owner:'Dev2', team:'Payments'}
                ]}
            ]},
          {id:'c4', type:'capability', name:'Customer Account Visibility', state:'Done', pct:100, pts:21, owner:'Ananya', team:'Mobile',
            children: [
              {id:'f4', type:'feature', name:'Balance on Home Screen', state:'Done', pct:100, pts:21, owner:'Ananya', team:'Mobile',
                children: [
                  {id:'s9', type:'story', name:'Balance widget build', state:'Done', pct:100, pts:8, owner:'Dev4', team:'Mobile'},
                  {id:'s10', type:'story', name:'Refresh on app resume', state:'Done', pct:100, pts:5, owner:'Dev4', team:'Mobile'},
                  {id:'s11', type:'story', name:'Balance formatting and currency', state:'Done', pct:100, pts:8, owner:'Dev4', team:'Mobile'}
                ]}
            ]}
        ]},
      {id:'e3', type:'epic', name:'Open Banking API Programme', state:'Review', pct:0, pts:0, owner:'Raj', team:'Digital Banking ART',
        children: []}
    ]},
  {id:'g2', type:'goal', name:'Reduce operating costs by 18% by end of 2026', state:'Behind', pct:12, pts:72, owner:'', team:'',
    children: [
      {id:'e2', type:'epic', name:'Customer Self-Service Expansion', state:'Funnel', pct:0, pts:0, owner:'Priya', team:'Digital Banking ART',
        children: [
          {id:'c5', type:'capability', name:'Self-Service Account Management', state:'In Progress', pct:40, pts:13, owner:'Priya', team:'Accounts',
            children: [
              {id:'f5', type:'feature', name:'Account Statement Export PDF', state:'In Progress', pct:40, pts:13, owner:'Priya', team:'Accounts',
                children: [
                  {id:'s20', type:'story', name:'PDF generation service', state:'In Progress', pct:50, pts:8, owner:'Dev4', team:'Accounts'},
                  {id:'s21', type:'story', name:'Statement template design', state:'To Do', pct:0, pts:5, owner:'Dev2', team:'Accounts'}
                ]}
            ]},
          {id:'c6a', type:'capability', name:'Automated Onboarding', state:'Funnel', pct:0, pts:22, owner:'Raj', team:'Onboard',
            children: [
              {id:'f6', type:'feature', name:'Streamlined Onboarding Flow', state:'Funnel', pct:0, pts:22, owner:'Raj', team:'Onboard',
                children: [
                  {id:'s22', type:'story', name:'KYC automation service', state:'To Do', pct:0, pts:8, owner:'Dev3', team:'Onboard'},
                  {id:'s23', type:'story', name:'Document verification API', state:'To Do', pct:0, pts:5, owner:'Dev2', team:'Onboard'},
                  {id:'s24', type:'story', name:'Onboarding progress tracker', state:'To Do', pct:0, pts:5, owner:'Dev3', team:'Onboard'},
                  {id:'s25', type:'story', name:'E-signature component', state:'To Do', pct:0, pts:4, owner:'Dev2', team:'Onboard'}
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

// ═══════════════════════════════════════════════════════
// INSIGHTS — per view/level
// ═══════════════════════════════════════════════════════
EAP.insights = {
  'art-Feature-Backlog': {
    signals: [
      {level:'urgent', title:'47 customers flagged biometric issues this week', desc:'Up 3× from last month. Enhanced Biometric Auth Flow is ranked #1 by WSJF with no PI commitment.', action:'Plan into PI 26'},
      {level:'urgent', title:'New customer theme: payment confirmation too slow', desc:'31 mentions in 7 days. No Feature in backlog matches this pattern.', action:'Create Feature'},
      {level:'urgent', title:'2 Features backlogged for 3+ PIs', desc:'Loan Application Wizard and Investment Portfolio View have never been pulled. Backlog noise increasing.', action:'Prioritise or remove'},
      {level:'watch',  title:'3 competitor banks launched biometric login this quarter', desc:'Accelerating Enhanced Biometric Auth Flow over lower-ranked items makes strategic sense.', action:'Reprioritise'},
      {level:'watch',  title:'PSD3 regulatory update published', desc:'Transaction Dispute Resolution may need scope change to comply by Q3 2026.', action:'Review scope'},
      {level:'ok',     title:'Mobile Exp has unallocated capacity in Sprint 3', desc:'No Features currently assigned. Opportunity to pull from backlog.', action:''}
    ]
  },
  'art-WorkItem-Backlog': {
    signals: [
      {level:'urgent', title:'22 Stories across all teams have no acceptance criteria', desc:'Cannot be reliably estimated or tested before Sprint 3 planning.', action:'Prioritise AC definition'},
      {level:'urgent', title:'Fraud Team has 12 open defects in backlog', desc:'Up from 4 last PI. Defect rate accelerating.', action:'Schedule defect sprint'},
      {level:'watch',  title:'5 Stories in backlog for 3+ sprints with no assignment', desc:'Stale items reducing backlog signal quality.', action:'Review and assign or descope'},
      {level:'ok',     title:'Story estimation consistency within normal range', desc:'Auth and Payments teams estimation is stable this PI.', action:''}
    ]
  },
  'art-Feature-List': {
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
  'art-WorkItem-List': {
    signals: [
      {level:'urgent', title:'14 Stories blocked across 4 teams', desc:'Auth API, Payments gateway and 2 Fraud dependencies unresolved.', action:'View all blockers'},
      {level:'urgent', title:'Sprint 2 burn rate 18% below target on Day 3', desc:'At current pace ART will complete 71% of Sprint 2 commitments.', action:'Review with teams'},
      {level:'watch',  title:'Unplanned work is 18% of Sprint 2 scope', desc:'ART target is under 10%. Planning quality risk.', action:'Review sprint planning'},
      {level:'ok',     title:'Story defect rate within normal range for Sprint 2', desc:'Despite new Feature work, quality holding.', action:''}
    ]
  },
  'art-Feature-Board': {
    signals: [
      {level:'urgent', title:'Real-time Fraud Alerts at 0% after 2 of 4 sprints', desc:'At current pace will not complete this PI. 3 open defects blocking progress.', action:'Escalate to Fraud Team'},
      {level:'urgent', title:'3 Features below 30% with 6 weeks remaining', desc:'Payment Confirmation (20%), Fraud Alerts (25%), Onboarding (0%). Slip probability high.', action:'Descope or add capacity'},
      {level:'watch',  title:'Account Statement Export at 40% — on the edge', desc:'Accounts Team below velocity target this sprint. Watch closely.', action:'Check with Accounts Team'},
      {level:'ok',     title:'Balance on Home Screen complete at 100%', desc:'3 weeks remaining in PI 26. Opportunity to pull additional scope.', action:''}
    ]
  },
  'art-WorkItem-Board': {
    signals: [
      {level:'urgent', title:'Payment Confirmation blocked Day 2', desc:'Dependency on Auth API. This Story blocks 2 others in the same sprint. Cascade risk.', action:'Escalate now'},
      {level:'urgent', title:'Fraud Team Sprint 4 at 110% capacity', desc:'Cards visually overflowing. Items need moving before sprint start.', action:'Rebalance'},
      {level:'watch',  title:'Accounts Team 20% below Sprint 2 velocity', desc:'3 Stories not yet started on Day 3.', action:'Flag in standup'},
      {level:'watch',  title:'14 Stories In Progress, only 3 Done', desc:'Stories not flowing to completion — likely review bottleneck.', action:'Check review process'},
      {level:'ok',     title:'Auth Team velocity consistent with last 3 sprints', desc:'On track.', action:''}
    ]
  },
  'art-Feature-Hierarchy': {
    signals: [
      {level:'urgent', title:'Customer Self-Service Expansion has no Features defined', desc:'Primary Epic for Goal 2 (cost reduction). Goal 2 already behind at 12%.', action:'Start scoping'},
      {level:'watch',  title:'Next-Gen Mobile Banking has 3 backlog Features with no team', desc:'Epic on track but delivery risk growing.', action:'Assign teams'},
      {level:'watch',  title:'Cost reduction goal behind at 12%', desc:'vs 42% for digital bank goal. Imbalance growing.', action:'Review goal allocation'},
      {level:'ok',     title:'Digital bank goal on track at 42%', desc:'PI 26 commitments align with targets.', action:''}
    ]
  }
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
