/* ═══════════════════════════════════════════════════════
   DATA-PERSONAS.JS — Additive data layer for 7-persona scoping

   Loaded after state.js. Extends EAP.personas / EAP.people
   with 5 new personas, and adds new top-level objects:
     epicMeta, artBudget, portfolioBudget, fundingRequests,
     boardReport, outcomeRollup, okrs, portfolioWip,
     capExOpEx, signalCatalog, applySignalOverlay.

   Pure extension — does NOT mutate any pre-existing entity.
   Removing this file restores Phase 0 behaviour exactly.
   ═══════════════════════════════════════════════════════ */
var EAP = EAP || {};
EAP.personas = EAP.personas || {};
EAP.people   = EAP.people   || {};

// ═══════════════════════════════════════════════════════
// 5 NEW PERSONAS (Ananya/James already defined in state.js)
// ═══════════════════════════════════════════════════════
EAP.personas.riya = {
  key: 'riya', me: 'Riya',
  name: 'Riya Menon',
  role: 'Release Train Engineer · Digital Banking ART',
  avatar: '../../assets/images/SN Avatar-2.png',
  jobs: [
    'Run PI Planning and keep teams aligned.',
    'Resolve cross-team dependencies before they block delivery.',
    'Track ART health across all sprints.'
  ],
  cta: 'Open ART board',
  defaults: {
    tab: 'planning',
    context: 'art', contextName: 'Digital Banking ART', contextId: 'art1',
    level: 'Feature'
  },
  mineOnTabs: []  // RTE looks at the whole ART, not just her items
};

EAP.personas.dev = {
  key: 'dev', me: 'Dev',
  name: 'Dev Sharma',
  role: 'Scrum Master · Payments Team',
  avatar: '../../assets/images/SN Avatar-6.png',
  jobs: [
    "Keep the team's sprint on track daily.",
    'Escalate blockers before they cost a sprint.',
    'Make sure team commitments map to PI features.'
  ],
  cta: 'View team sprint',
  defaults: {
    tab: 'taskboard',
    context: 'team', contextName: 'Payments Team', contextId: 'team-payments',
    level: 'WorkItem'
  },
  mineOnTabs: []  // Scrum Master looks at the whole team
};

EAP.personas.priya = {
  key: 'priya', me: 'Priya',  // owner-key matches existing assignments
  name: 'Priya Nair',         // display name per spec; data layer keeps "Priya Kumar"
  role: 'Portfolio Director · Enterprise Technology',
  avatar: '../../assets/images/SN Avatar-3.png',
  jobs: [
    'Approve and shape the epic investment portfolio.',
    'Align delivery to strategic outcomes and OKRs.',
    'Control budget commitment across ARTs.'
  ],
  cta: 'Open portfolio',
  defaults: {
    tab: 'planning',
    context: 'portfolio', contextName: 'Meridian Bank Portfolio', contextId: 'root',
    level: 'Epic'
  },
  mineOnTabs: ['backlog', 'planning']
};

EAP.personas.marcus_cdo = {
  key: 'marcus_cdo', me: 'Marcus_CDO',  // disambiguates from Fraud-Team Marcus
  name: 'Marcus Webb',
  role: 'Chief Digital Officer',
  avatar: '../../assets/images/SN Avatar-5.png',
  jobs: [
    'Track outcome health across all initiatives.',
    'Act on escalated delivery risks before they miss targets.',
    'Make investment and scope decisions at PI boundaries.'
  ],
  cta: 'View outcomes',
  defaults: {
    tab: 'hierarchy',
    context: 'portfolio', contextName: 'Meridian Bank Portfolio', contextId: 'root',
    level: 'Epic'
  },
  mineOnTabs: []  // CDO sees everything
};

EAP.personas.kenji = {
  key: 'kenji', me: 'Kenji',
  name: 'Kenji Mori',
  role: 'Finance & Capacity Lead',
  avatar: '../../assets/images/SN Avatar-8.png',
  jobs: [
    'Monitor budget burn against quarterly targets.',
    'Flag over-allocated ARTs before PI Planning locks capacity.',
    'Approve or defer new epic funding requests.'
  ],
  cta: 'View capacity',
  defaults: {
    tab: 'planning',
    context: 'solution-train', contextName: 'Digital & Payments ST', contextId: 'st1',
    level: 'Capability'
  },
  mineOnTabs: []
};

// ═══════════════════════════════════════════════════════
// 4 NEW PEOPLE (Priya already in EAP.people as "Priya Kumar")
// ═══════════════════════════════════════════════════════
EAP.people.Riya       = { name: 'Riya Menon',     initials: 'RM', avatar: '../../assets/images/SN Avatar-2.png', color: '#0d9488' };
EAP.people.Dev        = { name: 'Dev Sharma',     initials: 'DS', avatar: '../../assets/images/SN Avatar-6.png', color: '#2563EB' };
EAP.people.Marcus_CDO = { name: 'Marcus Webb',    initials: 'MW', avatar: '../../assets/images/SN Avatar-5.png', color: '#475569' };
EAP.people.Kenji      = { name: 'Kenji Mori',     initials: 'KM', avatar: '../../assets/images/SN Avatar-8.png', color: '#6d28d9' };

// ═══════════════════════════════════════════════════════
// SIDECAR ENRICHMENT — does NOT mutate epics.all
// Keyed by epic id; portfolio personas read this layer.
// ═══════════════════════════════════════════════════════
EAP.epicMeta = {
  e1:   { budget: 4_200_000, qSpend: 2_100_000, okrIds: ['okr1'],         fundingState: 'approved',   analysisAgeWeeks: 0  },
  e2:   { budget: 1_800_000, qSpend:   240_000, okrIds: ['okr2'],         fundingState: 'approved',   analysisAgeWeeks: 0  },
  e3:   { budget: 2_400_000, qSpend:         0, okrIds: ['okr1','okr3'],  fundingState: 'in-review',  analysisAgeWeeks: 4  }, // stalled
  e4:   { budget: 1_500_000, qSpend:         0, okrIds: [],               fundingState: 'pending',    analysisAgeWeeks: 5  }, // stalled, no OKR
  e5:   { budget: 3_600_000, qSpend:         0, okrIds: ['okr2'],         fundingState: 'pending',    analysisAgeWeeks: 4  }, // stalled
  e6:   { budget: 1_200_000, qSpend:         0, okrIds: [],               fundingState: 'in-review',  analysisAgeWeeks: 2  },
  ebl1: { budget:   600_000, qSpend:         0, okrIds: ['okr2'],         fundingState: 'requested',  analysisAgeWeeks: 1  },
  ebl2: { budget: 2_000_000, qSpend:         0, okrIds: [],               fundingState: 'requested',  analysisAgeWeeks: 1  },
  ebl3: { budget:   400_000, qSpend:         0, okrIds: [],               fundingState: 'draft',      analysisAgeWeeks: 0  },
  ebl4: { budget:   900_000, qSpend:         0, okrIds: [],               fundingState: 'draft',      analysisAgeWeeks: 0  }
};

// ═══════════════════════════════════════════════════════
// ART BUDGET — quarterly
// ═══════════════════════════════════════════════════════
EAP.artBudget = {
  'Digital Banking ART':     { qTarget: 6_000_000, qCommitted: 5_400_000, pctCommitted: 90, projectedNextPiUtil: 118, weeksLeftInQuarter: 6 },
  'Lending & Mortgages ART': { qTarget: 3_200_000, qCommitted: 2_300_000, pctCommitted: 72, projectedNextPiUtil:  92, weeksLeftInQuarter: 6 }
};

// ═══════════════════════════════════════════════════════
// PORTFOLIO BUDGET (rolls up the two ARTs + standalone backlog)
// ═══════════════════════════════════════════════════════
EAP.portfolioBudget = {
  qTarget: 12_000_000,
  qCommitted: 9_840_000,
  pctCommittedPriya: 78,   // Priya's "78% committed" signal value
  pctCommittedKenji: 82,   // Kenji's "82% committed" signal value
  weeksLeftInQuarter: 6
};

// ═══════════════════════════════════════════════════════
// FUNDING REQUESTS — pending epic-level decisions
// ═══════════════════════════════════════════════════════
EAP.fundingRequests = [
  { id: 'fr1', epicId: 'e3',   sponsor: 'Priya', state: 'awaiting-portfolio',  raisedDays: 12, ask: 2_400_000 },
  { id: 'fr2', epicId: 'ebl1', sponsor: 'Ananya', state: 'awaiting-portfolio', raisedDays: 6,  ask:   600_000 },
  { id: 'fr3', epicId: 'ebl2', sponsor: 'Raj',    state: 'awaiting-finance',   raisedDays: 9,  ask: 2_000_000 },
  { id: 'fr4', epicId: 'e5',   sponsor: 'Raj',    state: 'awaiting-finance',   raisedDays: 4,  ask: 3_600_000 }
];

// ═══════════════════════════════════════════════════════
// CAP-EX / OP-EX QUEUE — items needing classification
// ═══════════════════════════════════════════════════════
EAP.capExOpEx = {
  deadlineDays: 10,
  unclassified: [
    { id: 'cx1', epicId: 'e1', amount: 480_000, kind: 'unknown' },
    { id: 'cx2', epicId: 'e2', amount: 120_000, kind: 'unknown' },
    { id: 'cx3', epicId: 'e3', amount: 360_000, kind: 'unknown' },
    { id: 'cx4', epicId: 'e5', amount: 240_000, kind: 'unknown' }
  ]
};

// ═══════════════════════════════════════════════════════
// BOARD REPORT — single-row state
// ═══════════════════════════════════════════════════════
EAP.boardReport = {
  dueDateDays: 7,
  compiled:    false,
  ownerKey:    'Marcus_CDO'
};

// ═══════════════════════════════════════════════════════
// OUTCOME ROLLUP — derived facts per goal (precomputed for clarity)
// ═══════════════════════════════════════════════════════
EAP.outcomeRollup = [
  { goalId: 'g1', paceVsTarget: -8,   trend: 'down',  atRisk: false, contributingAtRisk: ['e1','e3'], deadlineWeeks: 36 },
  { goalId: 'g2', paceVsTarget: -22,  trend: 'down',  atRisk: true,  contributingAtRisk: ['e5','e6'], deadlineWeeks: 6  }
];

// ═══════════════════════════════════════════════════════
// OKRs — strategic outcomes Priya tracks
// ═══════════════════════════════════════════════════════
EAP.okrs = [
  { id: 'okr1', name: 'Lift retail mobile NPS to 62',           reviewWeeks: 2, mappedEpicIds: ['e1','e3'] },
  { id: 'okr2', name: 'Cut servicing cost-to-income by 6 pts',  reviewWeeks: 2, mappedEpicIds: ['e2','e5','ebl1'] },
  { id: 'okr3', name: 'PSD3 compliance ahead of Q3 2026 deadline', reviewWeeks: 2, mappedEpicIds: ['e3'] },
  { id: 'okr4', name: 'Reduce mortgage origination cycle time 30%', reviewWeeks: 2, mappedEpicIds: [] }, // unmapped
  { id: 'okr5', name: 'Active digital users +12% YoY',           reviewWeeks: 2, mappedEpicIds: [] }   // unmapped
];

// ═══════════════════════════════════════════════════════
// PORTFOLIO WIP LIMIT
// ═══════════════════════════════════════════════════════
EAP.portfolioWip = {
  limit: 4,
  current: 5,           // breached
  inFlightEpicIds: ['e1','e2','e3','e5','e6']
};

// ═══════════════════════════════════════════════════════
// CROSS-ART DEPENDENCY OVERLAY (Riya's signal-1)
// Existing EAP.featureDeps is intra-Digital-Banking. Overlay
// adds 4 cross-ART deps for Riya's RTE view; not merged into
// featureDeps so existing Timeline tab is unchanged.
// ═══════════════════════════════════════════════════════
EAP.crossArtDeps = [
  { from: 'f15', to: 'f20', type: 'risk',     reason: 'PSD3 Compliance (Digital Banking) gates Mortgage Application Wizard (Lending & Mortgages) — regulator hand-off' },
  { from: 'f12', to: 'f22', type: 'conflict', reason: 'Account Aggregation API late — Credit Score Real-time Engine waiting on shared API contract' },
  { from: 'f1',  to: 'f21', type: 'risk',     reason: 'Fingerprint Login Auth flow gates KYC Document Verification — identity continuity required' },
  { from: 'f2',  to: 'f22', type: 'risk',     reason: 'Real-time Fraud Alerts model output feeds Credit Score Engine — schema not finalised' }
];

// ═══════════════════════════════════════════════════════
// HOME CONTENT — 3-zone Intelligent Home per persona
// Zones: focus (act now) · state (where things stand) · next (prepare)
// Visual-first: every tile carries a kind hint so the IH renders viz
// (gauge / sparkline / minibar / heatmap / progressring / stackbar /
//  numpair / donut / dotstrip) instead of text walls.
// Severity: critical · high · medium · low
// ═══════════════════════════════════════════════════════
EAP.homeContent = {

  // ── Ananya / Product Manager — Digital Banking ART ────
  ananya: {
    greeting: 'Ananya',
    location: 'Digital Banking ART',
    omniPlaceholders: [
      'Ask: \'Show PI 27 backlog readiness\'',
      'Ask: \'Which features are below 30%?\'',
      'Ask: \'Summarise sprint review demo line-up\''
    ],
    promptPills: [
      { icon: 'check',     label: 'Demo line-up' },
      { icon: 'ai-sparkle',label: 'Rank backlog' },
      { icon: 'document',  label: 'Sprint review brief' }
    ],
    focus: {
      title: 'Decisions waiting on you',
      subtitle: 'Ranked by impact and time pressure · drawn from product, Outlook, Teams and customer signals',
      items: [
        { severity:'critical', source:'product',  title:'Sprint 2 demo line-up — decide tomorrow',         desc:'2 features below 30%: Payment Confirmation 20%, Onboarding Flow 0%',                                tab:'board',     stat:{ kind:'pct', value:20, of:100 } },
        { severity:'critical', source:'ai-bundle',title:'AI bundled · 22 signals → draft Feature ready',   desc:'3 emails + 5 Teams threads + 14 customer tickets cluster on adaptive biometric re-enrolment',        tab:'backlog',   highlight:'fb1', otto:'Otto bundled 22 customer signals into 1 draft Feature · Adaptive Biometric Re-enrolment · WSJF 12.4 — ready for your decision', stat:{ kind:'pill', value:'Bundle', tone:'ai' } },
        { severity:'high',     source:'outlook',  title:'James Hartwell asks: "can we delay wallet?"',     desc:'Business Owner email · Mobile Wallet Phase 2 · AI drafted reply pending your review',               tab:'backlog',   otto:'Otto drafted a reply to James Hartwell on Mobile Wallet Phase 2 delay — tap to review before sending', stat:{ kind:'days', value:1, label:'day' } },
        { severity:'high',     source:'product',  title:'Payment Confirmation Flow blocked Day 2',         desc:'Auth API dependency unresolved — cascades to Cross-Border (PI 27)',                                  tab:'planning',  stat:{ kind:'days', value:6, label:'days' } },
        { severity:'medium',   source:'teams',    title:'#digital-banking-leadership · 5 messages on Q3',  desc:'Cost-cuts thread mentions Open Banking and Mortgage scope · summary ready',                          tab:'hierarchy', otto:'Otto summarised 5 messages from #digital-banking-leadership on Q3 cost-cuts — Open Banking and Mortgage scope flagged', stat:{ kind:'count', value:5 } },
        { severity:'medium',   source:'product',  title:'PI 27 backlog ranking incomplete',                desc:'12 of 25 backlog Features unranked — 5 weeks to PI Planning',                                       tab:'backlog',   stat:{ kind:'count', value:12, of:25 } },
        { severity:'low',      source:'customer', title:'Customer feedback · biometric login theme',        desc:'47 tickets in 7 days · WSJF would lift Enhanced Biometric Auth to top of stack',                     tab:'backlog',   otto:'47 customer tickets clustered on biometric login · Otto suggests Enhanced Biometric Auth would rise to top of backlog on WSJF', stat:{ kind:'count', value:47 } }
      ]
    },
    state: {
      title: 'Digital Banking ART',
      subtitle: 'Sprint 2 · day 7 of 10',
      gauge: { value: 74, label: 'PI 26 confidence', trend: 'flat', kind: 'semicircle' },
      tiles: [
        { kind:'sparkline', label:'ART velocity (last 4 PIs)',  data:[88,91,90,94], unit:'pts', trendDelta:'+4', trendDir:'up',     tab:'planning' },
        { kind:'minibar',   label:'PI 26 features by state',    data:[
            { cat:'In Progress', value:3, color:'#0669FF' },
            { cat:'Blocked',     value:1, color:'#E42338' },
            { cat:'Done',        value:1, color:'#007A01' },
            { cat:'At risk',     value:2, color:'#FD9700' }
          ], tab:'board' },
        { kind:'heatmap',   label:'Team health (capacity · flow · quality · blockers)',
          rows:['Auth','Payments','Fraud','Mobile','Accounts','Onboard'],
          cols:['Cap','Flow','Qual','Block'],
          data:[
            ['ok','ok','watch','ok'],
            ['over','watch','ok','over'],
            ['ok','over','over','ok'],
            ['ok','ok','ok','ok'],
            ['ok','watch','watch','ok'],
            ['ok','ok','ok','ok']
          ], tab:'planning' }
      ]
    },
    next: {
      title: 'Getting ready for PI 27 Planning',
      anchor: 'PI 27 Planning',
      daysUntil: 35,
      readiness: { ready: 8, total: 25, label: 'Backlog readiness' },
      timeline: [
        { date:'May 7',  label:'Demo line-up confirmed',   state:'pending' },
        { date:'May 14', label:'Backlog ranking lock',     state:'pending' },
        { date:'May 21', label:'Capacity confirmed',       state:'upcoming' },
        { date:'Jun 3',  label:'PI 27 Planning · Day 1',   state:'upcoming' }
      ],
      tab: 'backlog'
    }
  },

  // ── James / Senior Developer — Auth Team ──────────────
  james: {
    greeting: 'James',
    location: 'Auth Team',
    omniPlaceholders: [
      'Ask: \'What\'s on me today?\'',
      'Ask: \'Show my review queue\'',
      'Ask: \'Where am I blocking the team?\''
    ],
    promptPills: [
      { icon: 'check',     label: "Catch me up" },
      { icon: 'ai-sparkle',label: "Show blockers I cause" },
      { icon: 'document',  label: 'Sprint commit estimate' }
    ],
    focus: {
      title: 'Decisions waiting on you',
      subtitle: 'Drawn from product, Teams mentions, Outlook and your code activity',
      items: [
        { severity:'critical', source:'teams',   title:'Vikram @-mentioned you about auth token defect',  desc:"\"Auth API still blocking us · what's ETA on session expiry fix?\" · 14m ago",  tab:'taskboard', stat:{ kind:'pill', value:'@you', tone:'crit' } },
        { severity:'critical', source:'product', title:'Push Auth Session Expiry to review',            desc:"You're blocking Payments' auth token fix — open 2 days",                         tab:'taskboard', stat:{ kind:'days', value:2, label:'days' } },
        { severity:'high',     source:'product', title:'Close out review queue before Friday',          desc:'Validation Rules at 80% — needs sign-off',                                       tab:'taskboard', stat:{ kind:'pct', value:80, of:100 } },
        { severity:'high',     source:'ai',      title:'AI drafted 3 stories from Auth retro notes',    desc:'Migrate auth tests · Adaptive session · Step-up auth · ready for your review',   tab:'taskboard', otto:'Otto drafted 3 stories from your retro notes · Migrate auth tests · Adaptive session · Step-up auth — review and add acceptance criteria', stat:{ kind:'pill', value:'AI', tone:'ai' } },
        { severity:'medium',   source:'product', title:'New story added Day 5 — re-balance',           desc:'Biometric Onboarding pulled in mid-cycle',                                        tab:'taskboard', stat:{ kind:'count', value:5, label:'pts added' } },
        { severity:'medium',   source:'outlook', title:'PI 27 capacity poll · response missing',        desc:'Riya emailed Friday · Auth Team estimate not yet returned',                     tab:'planning',  stat:{ kind:'days', value:3, label:'days' } }
      ]
    },
    state: {
      title: 'Auth Team',
      subtitle: 'Sprint 2 · day 7 of 10',
      gauge: { value: 84, label: 'My predicted finish', trend: 'flat', kind: 'semicircle' },
      tiles: [
        { kind:'progressring', label:'My sprint pts',    pct: 75, valueLabel:'18 / 24 pts', tab:'taskboard' },
        { kind:'dotstrip',     label:'Sprint clock',     total:10, current:7, dotColors:['done','done','done','done','active','active','active','pending','pending','pending'], tab:'taskboard' },
        { kind:'sparkline',    label:'Personal velocity (last 4 sprints)', data:[16,18,20,22], unit:'pts', trendDelta:'+2', trendDir:'up', tab:'taskboard' },
        { kind:'numpair',      label:'Auth Team flow', left:{ value:'4', label:'In flight' }, right:{ value:'0', label:'Defects' }, tab:'taskboard' }
      ]
    },
    next: {
      title: 'Sprint 2 closes Friday',
      anchor: 'Sprint 2 close',
      daysUntil: 3,
      readiness: { ready: 2, total: 4, label: 'My items closed' },
      timeline: [
        { date:'Fri',      label:'Sprint 2 close · system demo', state:'pending' },
        { date:'Mon',      label:'Sprint 3 commitments shaped',  state:'upcoming' },
        { date:'Tue',      label:'Sprint 3 planning',            state:'upcoming' },
        { date:'+21 days', label:'PI 27 Planning · Day 1',       state:'upcoming' }
      ],
      tab: 'taskboard'
    }
  },

  // ── Riya / RTE — Digital Banking ART ──────────────────
  riya: {
    greeting: 'Riya',
    location: 'Digital Banking ART',
    omniPlaceholders: [
      'Ask: \'Show PI 27 capacity confirmations\'',
      'Ask: \'Summarise dependency map\'',
      'Ask: \'Which teams are flagged?\''
    ],
    promptPills: [
      { icon: 'check',     label: 'Capacity confirmations' },
      { icon: 'ai-sparkle',label: 'Dependency map' },
      { icon: 'document',  label: 'Pre-PI sync brief' }
    ],
    focus: {
      title: 'Decisions waiting on you',
      subtitle: 'Drawn from product, calendar, Teams chases and SoS notes',
      items: [
        { severity:'critical', source:'product',  title:'4 cross-ART deps unresolved · PI 27',           desc:'Span Auth, Mortgages, Risk, Open Banking',                                              tab:'timeline',  stat:{ kind:'count', value:4 } },
        { severity:'critical', source:'calendar', title:'Capacity poll closes Friday · 4 teams missing', desc:'Auth, Payments, Fraud, Onboarding · AI drafted chase email per SM',                     tab:'planning',  stat:{ kind:'count', value:4, of:6 } },
        { severity:'high',     source:'product',  title:'Onboarding Team below 80% velocity',           desc:'Running at 60% — recovery window narrowing',                                            tab:'planning',  stat:{ kind:'pct', value:60, of:80 } },
        { severity:'high',     source:'ai',       title:'Scrum-of-Scrums brief drafted from 5 standups', desc:'2 risks emerged · 3 status updates · ready to send',                                    tab:'planning',  otto:'Otto compiled your SoS brief from 5 stand-up logs · 2 risks flagged · 3 status updates — ready to circulate to 6 teams', stat:{ kind:'pill', value:'AI', tone:'ai' } },
        { severity:'medium',   source:'teams',    title:'Auth SM in #rte-room · "we hit 80% Sprint 2"',  desc:'Capacity context for Friday poll — flag with Auth lead',                                tab:'planning',  stat:{ kind:'pill', value:'Note', tone:'neutral' } },
        { severity:'medium',   source:'product',  title:'4 I&A actions still open',                     desc:'2 approaching 30-day threshold from last I&A',                                          tab:'hierarchy', stat:{ kind:'count', value:4 } }
      ]
    },
    state: {
      title: 'Digital Banking ART',
      subtitle: '6 teams · Sprint 2',
      gauge: { value: 74, label: 'ART PI confidence', trend: 'down', kind: 'semicircle' },
      tiles: [
        { kind:'minibar',   label:'Team capacity (Sprint 2)',
          data:[
            { cat:'Auth',     value:80, color:'#0669FF' },
            { cat:'Payments', value:92, color:'#E42338' },
            { cat:'Fraud',    value:78, color:'#0669FF' },
            { cat:'Mobile',   value:70, color:'#0669FF' },
            { cat:'Accounts', value:65, color:'#0669FF' },
            { cat:'Onboard',  value:60, color:'#FD9700' }
          ], yMax:120, threshold:100, tab:'planning' },
        { kind:'sparkline', label:'ART velocity (last 4 PIs)', data:[182,194,188,197], unit:'pts', trendDelta:'+9', trendDir:'up', tab:'planning' },
        { kind:'numpair',   label:'Cross-ART deps',  left:{ value:'4', label:'Open' }, right:{ value:'2', label:'Resolved' }, tab:'timeline' }
      ]
    },
    next: {
      title: 'Getting ready for PI 27 Planning',
      anchor: 'PI 27 Planning',
      daysUntil: 14,
      readiness: { ready: 2, total: 6, label: 'Teams confirmed' },
      timeline: [
        { date:'+4 days',  label:'IP Sprint starts',           state:'pending' },
        { date:'+7 days',  label:'Capacity inputs due',        state:'pending' },
        { date:'+11 days', label:'Pre-PI sync',                state:'upcoming' },
        { date:'+14 days', label:'PI 27 Planning · Day 1',     state:'upcoming' }
      ],
      tab: 'planning'
    }
  },

  // ── Dev / Scrum Master — Payments Team ────────────────
  dev: {
    greeting: 'Dev',
    location: 'Payments Team',
    omniPlaceholders: [
      'Ask: \'Where\'s the team blocked?\'',
      'Ask: \'What might slip Sprint 2?\'',
      'Ask: \'Sprint 3 refinement state\''
    ],
    promptPills: [
      { icon: 'check',     label: "What might slip" },
      { icon: 'ai-sparkle',label: 'Impediment summary' },
      { icon: 'document',  label: 'Sprint 3 capacity' }
    ],
    focus: {
      title: 'Decisions waiting on you',
      subtitle: 'Drawn from sprint state, Teams threads, calendar and impediment log',
      items: [
        { severity:'critical', source:'product', title:'Auth token defect · ownerless 4 days',               desc:'Blocked since Day 2 — escalation window closing',                              tab:'taskboard', stat:{ kind:'days', value:4, label:'days' } },
        { severity:'critical', source:'teams',   title:'Vikram in #payments-team · "Auth token still blocked"', desc:'AI drafted reply with current status + ETA — review and send',              tab:'taskboard', stat:{ kind:'pill', value:'@team', tone:'crit' } },
        { severity:'high',     source:'product', title:'3 stories at risk for Sprint 2 close',               desc:'Biometric login, Auth token and Payment build below burn pace',                tab:'taskboard', stat:{ kind:'count', value:3 } },
        { severity:'high',     source:'calendar',title:'Sprint retro Mon · agenda not drafted',          desc:'AI draft ready · pulls top 3 themes from last 5 standups',                       tab:'taskboard', otto:'Otto drafted your retro agenda from the top 3 themes across 5 standups — Auth API blocker · story scoping · late refinement — review before circulating', stat:{ kind:'pill', value:'AI', tone:'ai' } },
        { severity:'medium',   source:'product', title:'Sprint 3 refinement gap · 4 stories',           desc:'In groom, no estimate yet',                                                     tab:'backlog',   stat:{ kind:'count', value:4 } },
        { severity:'medium',   source:'outlook', title:'Riya emailed: PI 27 capacity input due Fri',     desc:'Headcount + velocity proposal pre-filled from last 3 sprints',                  tab:'planning',  stat:{ kind:'days', value:3, label:'days' } }
      ]
    },
    state: {
      title: 'Payments Team',
      subtitle: 'Sprint 2 · day 7 of 10',
      gauge: { value: 64, label: 'Sprint completion forecast', trend: 'down', kind: 'semicircle' },
      tiles: [
        { kind:'dotstrip',  label:'Sprint clock', total:10, current:7, dotColors:['done','done','done','done','active','active','active','pending','pending','pending'], tab:'taskboard' },
        { kind:'minibar',   label:'In-flight by state',
          data:[
            { cat:'To Do',       value:1, color:'#727a90' },
            { cat:'In Progress', value:3, color:'#0669FF' },
            { cat:'In Review',   value:1, color:'#7857FF' },
            { cat:'Blocked',     value:1, color:'#E42338' }
          ], tab:'taskboard' },
        { kind:'sparkline', label:'Team velocity (last 4 sprints)', data:[34,41,46,42], unit:'pts', trendDelta:'-4', trendDir:'down', tab:'planning' },
        { kind:'numpair',   label:'Pts done · committed', left:{ value:'8', label:'Done' }, right:{ value:'46', label:'Committed' }, tab:'taskboard' }
      ]
    },
    next: {
      title: 'Sprint 2 closes Friday',
      anchor: 'Sprint 2 close',
      daysUntil: 3,
      readiness: { ready: 2, total: 8, label: 'Items at definition-of-done' },
      timeline: [
        { date:'Fri',      label:'Sprint 2 close · system demo', state:'pending' },
        { date:'Mon',      label:'Sprint 2 retro',               state:'pending' },
        { date:'Tue',      label:'Sprint 3 planning',            state:'upcoming' },
        { date:'+21 days', label:'PI 27 Planning · Day 1',       state:'upcoming' }
      ],
      tab: 'taskboard'
    }
  },

  // ── Priya / Portfolio Director — Meridian Bank Portfolio ──
  priya: {
    greeting: 'Priya',
    location: 'Meridian Bank Portfolio',
    omniPlaceholders: [
      'Ask: \'Show stalled epics\'',
      'Ask: \'OKR coverage gaps\'',
      'Ask: \'Q3 commitment burn\''
    ],
    promptPills: [
      { icon: 'check',     label: 'Stalled epics' },
      { icon: 'ai-sparkle',label: 'OKR coverage' },
      { icon: 'document',  label: 'Funding queue' }
    ],
    focus: {
      title: 'Decisions waiting on you',
      subtitle: 'Drawn from product, exec inbox and OKR mapping',
      items: [
        { severity:'critical', source:'product', title:'3 epic approvals before PI 27 lock',           desc:'Open Banking, AI Customer Support, Core Infra',                                          tab:'backlog',   stat:{ kind:'count', value:3 } },
        { severity:'critical', source:'outlook', title:'Marcus emailed re: Goal 2 cost reduction',     desc:'CDO concerned about pace · AI summary + draft response ready',                            tab:'hierarchy', stat:{ kind:'days', value:1, label:'day' } },
        { severity:'high',     source:'product', title:'Portfolio WIP limit breached · 5 / 4',         desc:'1 epic must close or pause before next pull',                                            tab:'planning',  stat:{ kind:'count', value:5, of:4 } },
        { severity:'high',     source:'ai',      title:'OKR map drafted — 2 unmapped, 14 days to review', desc:'Mortgage cycle-time → e5 candidate · Active users → ebl1 candidate',                  tab:'hierarchy', otto:'Otto mapped 5 epics to strategic OKRs · 2 remain unmapped — Mortgage Origination and AI Customer Support are candidates — your review needed', stat:{ kind:'pill', value:'AI', tone:'ai' } },
        { severity:'medium',   source:'customer',title:'Mortgage origination cycle-time complaints up 18%', desc:'Customer signal aligns to Goal 2 · would lift e5 priority',                       tab:'backlog',   stat:{ kind:'count', value:18, label:'%' } },
        { severity:'medium',   source:'product', title:'3 epics stalled in Analysis 4+ weeks',         desc:'Open Banking, Payment Infra, Mortgage Origination',                                       tab:'backlog',   stat:{ kind:'days', value:28, label:'days' } }
      ]
    },
    state: {
      title: 'Portfolio',
      subtitle: 'Q3 · 6 weeks left',
      gauge: { value: 78, label: 'Q3 budget committed', trend: 'up', kind: 'semicircle' },
      tiles: [
        { kind:'stackbar', label:'Outcome health (per goal)',
          segments:[
            { name:'Goal 1 — Top digital bank', value:42, color:'#007A01', target:50 },
            { name:'Goal 2 — Reduce cost 18%',   value:12, color:'#E42338', target:35 }
          ], tab:'hierarchy' },
        { kind:'donut',    label:'OKR coverage', pct:60, valueLabel:'3 / 5 mapped', color:'#FD9700', tab:'hierarchy' },
        { kind:'numpair',  label:'In flight · stalled', left:{ value:'5', label:'In flight' }, right:{ value:'3', label:'Stalled' }, tab:'backlog' }
      ]
    },
    next: {
      title: 'Getting ready for PI 27 + OKR review',
      anchor: 'PI 27 Planning',
      daysUntil: 28,
      readiness: { ready: 2, total: 5, label: 'OKRs with epic coverage' },
      timeline: [
        { date:'+7 days',  label:'Funding queue decisions',  state:'pending' },
        { date:'+14 days', label:'OKR review · Q3',           state:'pending' },
        { date:'+21 days', label:'Portfolio sync · pre-PI',   state:'upcoming' },
        { date:'+28 days', label:'PI 27 Planning · Day 1',    state:'upcoming' }
      ],
      tab: 'hierarchy'
    }
  },

  // ── Marcus / CDO — Meridian Bank Portfolio ────────────
  marcus_cdo: {
    greeting: 'Marcus',
    location: 'Enterprise outcomes',
    omniPlaceholders: [
      'Ask: \'Show outcome health\'',
      'Ask: \'Compile board summary\'',
      'Ask: \'Escalations needing me\''
    ],
    promptPills: [
      { icon: 'check',     label: 'Compile board report' },
      { icon: 'ai-sparkle',label: 'Outcome health' },
      { icon: 'document',  label: 'Escalations' }
    ],
    focus: {
      title: 'Decisions waiting on you',
      subtitle: 'Drawn from outcomes, exec inbox and Teams escalations',
      items: [
        { severity:'critical', source:'ai',      title:'Board report draft compiled · 7 days to circulate', desc:'AI synthesised from outcomes + Q3 burn + escalations · 5 sections ready', tab:'hierarchy', otto:'Otto compiled your 5-section board report · outcomes + Q3 burn + escalations + decisions + risk — Goal 2 anomaly flagged: pace 22pts behind plan', stat:{ kind:'pill', value:'AI', tone:'ai' } },
        { severity:'critical', source:'product', title:'Goal 2 at risk — 12% vs 35% target',                desc:'Cost reduction pace materially behind plan',                              tab:'hierarchy', stat:{ kind:'pct', value:12, of:35 } },
        { severity:'high',     source:'outlook', title:'CFO asked about ROI on Mobile Banking epic',         desc:'Email 2h ago · AI drafted reply with current ROI projection',             tab:'hierarchy', stat:{ kind:'days', value:1, label:'day' } },
        { severity:'high',     source:'product', title:'2 epics blocked · cascading',                       desc:'Mobile Banking, Open Banking — PI 26 ends in 5w',                          tab:'hierarchy', stat:{ kind:'count', value:2 } },
        { severity:'high',     source:'teams',   title:'#cdo-leadership · 8 messages re: Q3 reforecast',    desc:'Priya + Kenji aligning on cost cut envelope · summary ready',              tab:'hierarchy', stat:{ kind:'count', value:8 } },
        { severity:'medium',   source:'product', title:'1 investment request · sponsor decision',           desc:'AI Customer Support · £600k · 6 days open',                                tab:'backlog',   stat:{ kind:'days', value:6, label:'days' } }
      ]
    },
    state: {
      title: 'Enterprise outcomes',
      subtitle: 'Q3 · 6 weeks left',
      gauge: { value: 27, label: 'Composite goal pace', trend: 'down', kind: 'semicircle' },
      tiles: [
        { kind:'stackbar', label:'Goal pace vs target',
          segments:[
            { name:'Goal 1 — Top digital bank', value:42, color:'#007A01', target:50 },
            { name:'Goal 2 — Reduce cost 18%',   value:12, color:'#E42338', target:35 }
          ], tab:'hierarchy' },
        { kind:'minibar',  label:'Escalations by source',
          data:[
            { cat:'Delivery',  value:3, color:'#E42338' },
            { cat:'Funding',   value:1, color:'#FD9700' },
            { cat:'Capacity',  value:1, color:'#FD9700' },
            { cat:'Quality',   value:0, color:'#727a90' }
          ], tab:'backlog' },
        { kind:'numpair',  label:'In flight · at risk', left:{ value:'5', label:'In flight' }, right:{ value:'2', label:'At risk' }, tab:'hierarchy' }
      ]
    },
    next: {
      title: 'Getting ready for the next board',
      anchor: 'Board Report',
      daysUntil: 7,
      readiness: { ready: 1, total: 5, label: 'Sections compiled' },
      timeline: [
        { date:'+3 days',  label:'Outcome rollup finalised',  state:'pending' },
        { date:'+5 days',  label:'Investment decisions in',    state:'pending' },
        { date:'+7 days',  label:'Board report · circulate',   state:'upcoming' },
        { date:'+35 days', label:'PI 26 close',                state:'upcoming' }
      ],
      tab: 'hierarchy'
    }
  },

  // ── Kenji / Finance & Capacity Lead — Digital & Payments ST ──
  kenji: {
    greeting: 'Kenji',
    location: 'Digital & Payments ST',
    omniPlaceholders: [
      'Ask: \'Show ART utilisation outlook\'',
      'Ask: \'Funding queue summary\'',
      'Ask: \'Q3 burn vs forecast\''
    ],
    promptPills: [
      { icon: 'check',     label: 'Submit Finance input' },
      { icon: 'ai-sparkle',label: 'Utilisation outlook' },
      { icon: 'document',  label: 'CapEx classification' }
    ],
    focus: {
      title: 'Decisions waiting on you',
      subtitle: 'Drawn from finance ledgers, exec inbox and ART utilisation',
      items: [
        { severity:'critical', source:'product', title:'PI 27 Finance input overdue',                       desc:'Headcount + budget envelope not yet returned',                                  tab:'planning',  stat:{ kind:'days', value:7, label:'days' } },
        { severity:'critical', source:'ai',      title:'Variance memo drafted for CFO',                     desc:'Marcus\'s ROI question on Mobile Banking · numbers pulled from Q2 close',       tab:'planning',  otto:'Otto drafted a variance memo for the CFO — Mobile Banking ROI pulled from Q2 close · responds to Marcus\'s question', stat:{ kind:'pill', value:'AI', tone:'ai' } },
        { severity:'high',     source:'product', title:'Digital Banking ART projected at 118% next PI',     desc:'Current headcount cannot absorb PI 27 commitment',                              tab:'planning',  stat:{ kind:'pct', value:118, of:100 } },
        { severity:'high',     source:'outlook', title:'Marcus + Priya · Q3 reforecast email thread',       desc:'8 messages on cost envelope · summary ready · awaiting your number',            tab:'hierarchy', stat:{ kind:'count', value:8 } },
        { severity:'high',     source:'product', title:'CapEx/OpEx · 4 items unclassified',                desc:'Quarter close at risk',                                                          tab:'backlog',   stat:{ kind:'days', value:10, label:'days' } },
        { severity:'medium',   source:'product', title:'2 funding approvals awaiting Finance',              desc:'Mortgage Origination, Core Infra — sponsor reviews complete',                   tab:'backlog',   stat:{ kind:'count', value:2 } }
      ]
    },
    state: {
      title: 'Digital & Payments ST',
      subtitle: 'Q3 · 6 weeks left',
      gauge: { value: 82, label: 'Q3 budget committed', trend: 'up', kind: 'semicircle' },
      tiles: [
        { kind:'minibar', label:'ART next-PI utilisation projection',
          data:[
            { cat:'Digital Banking',     value:118, color:'#E42338' },
            { cat:'Lending & Mortgages', value:92,  color:'#007A01' }
          ], yMax:140, threshold:100, tab:'planning' },
        { kind:'sparkline', label:'Spend vs forecast (last 4 weeks)', data:[68,74,79,82], unit:'%', trendDelta:'+3', trendDir:'up', tab:'planning' },
        { kind:'numpair',   label:'Funding queue', left:{ value:'2', label:'Awaiting Finance' }, right:{ value:'4', label:'Unclassified' }, tab:'backlog' }
      ]
    },
    next: {
      title: 'Getting ready for PI 27 lock',
      anchor: 'PI 27 lock',
      daysUntil: 7,
      readiness: { ready: 0, total: 3, label: 'Finance inputs submitted' },
      timeline: [
        { date:'+3 days',  label:'Capacity envelope due',     state:'pending' },
        { date:'+5 days',  label:'Funding approvals close',    state:'pending' },
        { date:'+7 days',  label:'PI 27 lock · capacity locks', state:'upcoming' },
        { date:'+10 days', label:'CapEx/OpEx classification',  state:'upcoming' }
      ],
      tab: 'planning'
    }
  }
};

// ═══════════════════════════════════════════════════════
// ACTIVITY FEED — what Otto has been doing
// Each entry: { time, source, title, meta?, link? }
// Rendered as a vertical timeline in the IH centre column.
// ═══════════════════════════════════════════════════════
EAP.activityFeed = {
  ananya: [
    { time:'2m ago',  source:'ai',       title:'Bundled 22 signals into draft Feature',        meta:'Adaptive Biometric Re-enrolment · WSJF 12.4 · ladders to Goal 1', tab:'backlog',   highlight:'fb1', otto:'Otto bundled 22 customer signals into 1 draft Feature · Adaptive Biometric Re-enrolment · WSJF 12.4 — tap to review the proposal' },
    { time:'8m ago',  source:'outlook',  title:'Drafted reply to James Hartwell',               meta:'On Mobile Wallet Phase 2 delay · pending your review',           tab:'backlog',   otto:'Otto drafted a reply to James Hartwell on Mobile Wallet Phase 2 delay — review before sending' },
    { time:'14m ago', source:'teams',    title:'Linked 5 messages to Payment Confirmation Flow',meta:'#digital-banking-leadership thread · cost-cuts context',          tab:'board',     otto:'Otto linked 5 messages from #digital-banking-leadership to Payment Confirmation Flow — cost-cuts context captured' },
    { time:'27m ago', source:'customer', title:'Deduped 14 customer tickets into 2 themes',     meta:'Biometric login (47) · Statement export bug (8)',                 tab:'backlog',   otto:'14 customer tickets deduped into 2 themes · Biometric Login (47 tickets) and Statement Export bug (8 tickets) — both tagged for triage' },
    { time:'1h ago',  source:'product',  title:'Updated 3 features with capacity-aware notes',  meta:'Auth Sprint 4 over-committed · suggested re-balance',             tab:'board',     otto:'Otto added capacity-aware notes to 3 features · Auth Sprint 4 is over-committed and flagged for re-balance' }
  ],
  james: [
    { time:'3m ago',  source:'ai',       title:'Closed PR #4291 on Validation Rules',         meta:'Validation rules merged · story advanced to In Review',          tab:'taskboard', otto:'Otto auto-merged PR #4291 · Validation Rules is now In Review — check story status' },
    { time:'12m ago', source:'ai',       title:'Drafted regression tests for Biometric Re-auth', meta:'8 cases generated from Validation Rules acceptance criteria',   tab:'taskboard', otto:'8 regression test cases generated from Validation Rules acceptance criteria — review before running' },
    { time:'42m ago', source:'product',  title:'Linked branch to Auth Session Expiry story',   meta:'Auto-status: In Progress',                                       tab:'taskboard', otto:'Otto auto-linked your branch to Auth Session Expiry and updated status to In Progress' },
    { time:'1h ago',  source:'teams',    title:'Vikram @-mentioned you',                        meta:'#payments-team · "Auth API still blocking us"',                  tab:'taskboard', otto:'Vikram flagged Auth API dependency · Payments team still blocked on auth token defect — Auth Session Expiry is the blocker' },
    { time:'2h ago',  source:'outlook',  title:'Riya emailed Friday capacity poll',             meta:'AI pre-filled estimate from last 3 sprints',                     tab:'planning',  otto:'Riya\'s capacity poll pre-filled by Otto from your last 3 sprints — review and submit' }
  ],
  riya: [
    { time:'6m ago',  source:'ai',       title:'Resolved: Biometric Login → Payment Confirmation dep', meta:'Status changed from at-risk to resolved',                   tab:'timeline',  otto:'Otto updated the dependency map · Biometric Login → Payment Confirmation resolved — 3 cross-ART deps still open, tap to review' },
    { time:'18m ago', source:'ai',       title:'Drafted Scrum-of-Scrums brief',                   meta:'From last 5 standups · 2 risks emerged · 3 status updates',    tab:'planning',  otto:'Otto compiled your SoS brief from 5 standups · 2 risks flagged · 3 status updates — ready to circulate' },
    { time:'34m ago', source:'teams',    title:'Auth SM in #rte-room',                             meta:'"We hit 80% Sprint 2 — capacity solid for PI 27"',              tab:'planning',  otto:'Auth SM confirmed 80% Sprint 2 completion — capacity looks solid for PI 27 commitment' },
    { time:'1h ago',  source:'calendar', title:'Pre-PI sync invite sent · 3 SMs not yet RSVP\'d', meta:'AI drafted nudge for each missing attendee',                   tab:'planning',  otto:'Otto drafted personalised nudges for 3 SMs who haven\'t RSVP\'d the Pre-PI sync' },
    { time:'2h ago',  source:'product',  title:'Flagged Onboarding Team velocity drop',            meta:'60% vs 80% threshold — recovery window 4 days',                tab:'planning',  otto:'Onboarding Team at 60% velocity vs 80% threshold · Otto flagged recovery window narrowing to 4 days' }
  ],
  dev: [
    { time:'3m ago',  source:'ai',       title:'Updated impediment log',                      meta:'Auth token defect ownerless 4 days · escalation drafted',       tab:'taskboard', otto:'Otto drafted an escalation for auth token defect — ownerless for 4 days · Auth API dependency still unresolved' },
    { time:'12m ago', source:'ai',       title:'Drafted retro agenda from 5 standups',        meta:'Top 3 themes: Auth API, story scoping, late refinement',         tab:'taskboard', otto:'Retro agenda drafted from 5 standups · top themes: Auth API blocker · story scoping · late refinement' },
    { time:'28m ago', source:'teams',    title:'Vikram in #payments-team',                    meta:'"Auth token defect still blocked, what\'s next?" · reply drafted', tab:'taskboard', otto:'Otto drafted a reply to Vikram about auth token defect status — review before sending' },
    { time:'1h ago',  source:'product',  title:'Flagged Biometric Fallback Flow not started', meta:'Day 4 · Sprint 3 carry-over risk',                               tab:'taskboard', otto:'Biometric Fallback Flow not started by Day 4 — Otto flagged as Sprint 3 carry-over risk' },
    { time:'2h ago',  source:'calendar', title:'Sprint retro Mon 11am · attendees confirmed', meta:'7 of 8 RSVP\'d',                                                tab:'taskboard', otto:'Sprint retro confirmed for Monday 11am · 7 of 8 team members RSVP\'d' }
  ],
  priya: [
    { time:'6m ago',  source:'ai',       title:'Generated initiative-to-OKR map',           meta:'5 epics · 3 OKRs mapped · 2 unmapped flagged',                tab:'hierarchy', otto:'Otto mapped 5 epics to strategic OKRs · 2 remain unmapped — Mortgage Origination and AI Customer Support are candidates' },
    { time:'14m ago', source:'ai',       title:'Drafted Q3 portfolio summary for Marcus',   meta:'Variance vs target · escalations · funding queue',             tab:'hierarchy', otto:'Portfolio Q3 summary drafted for Marcus · variance vs target · escalations · funding queue — review before sending' },
    { time:'1h ago',  source:'outlook',  title:'Marcus emailed re: Goal 2 cost reduction',  meta:'CDO concerned about 12% vs 35% pace · response drafted',      tab:'hierarchy', otto:'Marcus flagged Goal 2 at risk · 12% vs 35% target · Otto drafted a response — review before sending' },
    { time:'2h ago',  source:'teams',    title:'Linked 6 Teams threads to Open Banking epic', meta:'#open-banking-channel · regulatory sub-thread',              tab:'backlog',   otto:'Otto linked 6 Teams threads to the Open Banking stalled epic · regulatory context captured for triage' },
    { time:'3h ago',  source:'customer', title:'Synthesised mortgage cycle-time complaints', meta:'18% increase week-over-week · WSJF would lift e5',            tab:'backlog',   otto:'18% week-on-week increase in mortgage cycle-time complaints · e5 (Mortgage Origination) would rise in priority' }
  ],
  marcus_cdo: [
    { time:'8m ago',  source:'ai',       title:'Compiled board report draft',                    meta:'5 sections ready · pulls outcomes + Q3 burn + escalations',  tab:'hierarchy', otto:'5-section board report ready · outcomes + Q3 burn + escalations + decisions + risk — board in 7 days' },
    { time:'14m ago', source:'ai',       title:'Anomaly detected: Goal 2 pace 22 pts behind',    meta:'Mortgage Origination contributing initiative — flagged',       tab:'hierarchy', otto:'Goal 2 anomaly detected · 22 points behind pace · Mortgage Origination is the contributing initiative' },
    { time:'1h ago',  source:'outlook',  title:'CFO asked about ROI on Mobile Banking',           meta:'AI drafted reply with current ROI projection',                tab:'hierarchy', otto:'Otto drafted a reply to the CFO on Mobile Banking ROI — current projection attached, review before sending' },
    { time:'2h ago',  source:'teams',    title:'#cdo-leadership · 8 messages on Q3 reforecast',  meta:'Priya + Kenji aligning on cost cut envelope',                 tab:'hierarchy', otto:'Otto summarised 8 messages from #cdo-leadership on Q3 reforecast — Priya + Kenji aligning on cost-cut envelope' },
    { time:'4h ago',  source:'product',  title:'New investment ask · AI Customer Support',        meta:'£600k · 6 days open · sponsor: Ananya',                      tab:'backlog',   otto:'New £600k investment request for AI Customer Support · 6 days open · sponsor Ananya — awaiting your decision' }
  ],
  kenji: [
    { time:'5m ago',  source:'ai',       title:'Generated variance memo for CFO',               meta:'Marcus\'s ROI question · Q2 close numbers · Mobile Banking ROI', tab:'planning', otto:'Variance memo drafted for CFO · Mobile Banking ROI pulled from Q2 close — responds to Marcus\'s question' },
    { time:'22m ago', source:'ai',       title:'Exported Q3 burn dashboard to Sheets',          meta:'Live link · refreshes hourly · shared to #finance-leadership',    tab:'planning', otto:'Q3 burn dashboard exported to Sheets and shared to #finance-leadership · live link refreshes hourly' },
    { time:'1h ago',  source:'ai',       title:'Anomaly: Mortgages ART under-utilised at 60%',  meta:'Re-balance opportunity for PI 27 envelope',                       tab:'planning', otto:'Mortgages ART at 60% utilisation — Otto flagged re-balance opportunity · capacity can absorb more PI 27 scope' },
    { time:'2h ago',  source:'outlook',  title:'Marcus + Priya · Q3 reforecast email thread',   meta:'8 messages on cost envelope · awaiting your number',              tab:'planning', otto:'8-message thread on Q3 reforecast from Marcus + Priya — awaiting your budget number to complete the picture' },
    { time:'3h ago',  source:'product',  title:'Flagged 4 unclassified CapEx items',            meta:'Quarter close in 10 days',                                        tab:'backlog',  otto:'4 CapEx items still unclassified · quarter close in 10 days — classification needed to avoid audit risk' }
  ]
};

// ═══════════════════════════════════════════════════════
// BUNDLE PROPOSAL — Ananya's "Bundle → Feature" tweak
// AI clusters multi-source signals into ONE proposed Feature.
// Rendered as a special Focus row that expands inline.
// ═══════════════════════════════════════════════════════
EAP.bundleProposals = {
  ananya: {
    id: 'bundle-1',
    title: 'Adaptive Biometric Re-enrolment',
    summary: 'AI bundled 22 signals across 3 sources into a draft Feature proposal',
    sources: [
      { kind:'outlook',  count:3,  label:'Exec emails',         note:'CISO, VP Mobile, VP Risk · all referencing biometric re-enrolment' },
      { kind:'teams',    count:5,  label:'Teams threads',       note:'#digital-banking-leadership · #fraud-discussions' },
      { kind:'customer', count:14, label:'Customer tickets',    note:'47 mentions in 7 days · 12 NPS comments' }
    ],
    proposed: {
      wsjf: 12.4,
      size: 'M',
      epicParent: 'Next-Gen Mobile Banking Platform',
      ladders: 'Goal 1 — Top digital bank',
      capacityFit: { team:'Auth Team', sprint:'Sprint 4', headroom: 'fits' },
      acceptCloseLoop: 'Reply automatically to 3 senders + 14 ticket reporters'
    },
    // Top-N representative signals per source (real-feeling demo data).
    // Total per cluster matches `sources.count` above; only top 3 shown.
    signals: {
      outlook: {
        total: 3,
        items: [
          { sender:'Lisa Chen',      role:'CISO',         subject:'Biometric re-enrolment friction',  snippet:'Customers locked out after device upgrades. Re-enrolment needs to be self-service before iOS 18 cuts more pathways.', time:'2d ago' },
          { sender:'David Park',     role:'VP Mobile',    subject:'Re: biometric reset issues',       snippet:'Top NPS detractor this quarter. Branch-visit workaround is killing us with under-30s.',                            time:'4d ago' },
          { sender:'Maya Thompson',  role:'VP Risk',      subject:'FYI — biometric edge cases',       snippet:'14 cases in the last 30 days where step-up auth failed and re-enrolment was the only path forward.',                time:'5d ago' }
        ]
      },
      teams: {
        total: 5,
        items: [
          { sender:'#digital-banking-leadership', role:'Channel · 12 mentions', snippet:'Three teams independently flagged biometric re-enrolment as the #1 blocker for Q3 NPS targets.', time:'1d ago' },
          { sender:'@sara.jones',                 role:'Sr. PM · Mobile',       snippet:'Customer escalated again — third device, third re-enrolment, gave up and switched banks.',          time:'1d ago' },
          { sender:'@vikram.s',                   role:'Eng · Auth Team',       snippet:'We have the auth-token plumbing already. The hard part is the UX, not the crypto.',                time:'2d ago' }
        ]
      },
      customer: {
        total: 14,
        items: [
          { sender:'TKT-48391', role:'P2 · Mobile',  snippet:'"After upgrading to iPhone 15, can\'t set up Face ID for the app. Tried 4 times, called support twice."', time:'12h ago' },
          { sender:'TKT-48402', role:'P2 · Android', snippet:'"Switched phones for work. App says biometric set up, but every login asks for password. Frustrated."',  time:'18h ago' },
          { sender:'TKT-48377', role:'P3 · NPS 2',   snippet:'"Why does your bank make me re-enrol fingerprint every single time I update my phone? Wells doesn\'t."',  time:'1d ago' }
        ]
      }
    }
  }
};

// ═══════════════════════════════════════════════════════
// DRAFT FEATURE INJECTION
// Otto's bundle proposal materialises as a Funnel-state Feature in
// Ananya's backlog so she has something to rank/accept against. This
// keeps the IH "1 draft Feature" claim honest end-to-end.
// Idempotent — safe to call repeatedly.
// ═══════════════════════════════════════════════════════
EAP.injectAnanyaDraftFeature = function() {
  if (!EAP.allFeatures || !EAP.bundleProposals || !EAP.bundleProposals.ananya) return;
  if (EAP.allFeatures.some(function(f) { return f.id === 'fb1'; })) return;
  var bp = EAP.bundleProposals.ananya;
  EAP.allFeatures.unshift({
    id: 'fb1',
    num: 'FTR0010050',
    name: bp.title,
    type: 'Feature',
    state: 'Funnel',
    pct: 0,
    size: bp.proposed.size,
    wsjf: bp.proposed.wsjf,
    parent: bp.proposed.epicParent,
    team: '',
    pi: null,
    pts: 0,
    owner: 'Ananya',
    goal: 'g1',
    aiSourced: true,
    bundleProposalId: bp.id,
    signals: bp.signals,
    signalsSummary: bp.summary
  });
};

// ═══════════════════════════════════════════════════════
// COMING-UP EVENT ATTENDEES — for avatar piles in the Next zone
// Keyed by event label so the IH can render the right faces.
// Owner-keys reference EAP.people entries.
// ═══════════════════════════════════════════════════════
EAP.eventAttendees = {
  'Sprint 2 close · system demo': ['Ananya','James','Vikram','Mei','Marcus','Aisha','Tomás','Lena'],
  'Sprint 2 retro':                ['James','Vikram','Mei','Marcus','Aisha','Sana'],
  'Sprint 3 planning':             ['James','Sana','Vikram','Mei','Marcus','Aisha'],
  'Sprint review · demo':          ['Ananya','Priya','James','Vikram','Marcus'],
  'Pre-PI sync':                   ['Ananya','Riya','Priya','Raj','Kenji'],
  'PI 27 Planning · Day 1':        ['Ananya','Riya','Priya','Raj','Kenji','Marcus_CDO'],
  'OKR review · Q3':               ['Priya','Marcus_CDO','Kenji','Ananya'],
  'Board report · circulate':      ['Marcus_CDO','Priya','Kenji'],
  'Capacity envelope due':         ['Kenji','Riya'],
  'CapEx/OpEx classification':     ['Kenji']
};

