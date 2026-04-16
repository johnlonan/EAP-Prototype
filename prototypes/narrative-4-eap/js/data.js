/* ═══════════════════════════════════════════════════════
   DATA.JS — Enterprise Agile Planning Demo Data
   Representative subset · Meridian Bank Portfolio
   ═══════════════════════════════════════════════════════ */

var EAP = EAP || {};

// ── Agile Structure (drives context selector) ──────────
EAP.structure = {
  id: 'root', name: 'Meridian Bank Portfolio', type: 'portfolio',
  children: [
    { id: 'st1', name: 'Digital & Payments ST', type: 'solution-train',
      children: [
        { id: 'art1', name: 'Digital Banking ART', type: 'art',
          children: [
            { id: 't1', name: 'Auth Team', type: 'team' },
            { id: 't2', name: 'Payments Team', type: 'team' },
            { id: 't3', name: 'Fraud Team', type: 'team' },
            { id: 't4', name: 'Mobile Exp Team', type: 'team' },
            { id: 't5', name: 'Accounts Team', type: 'team' },
            { id: 't6', name: 'Onboarding Team', type: 'team' }
          ]
        },
        { id: 'art2', name: 'Lending & Mortgages ART', type: 'art',
          children: [
            { id: 't7', name: 'Mortgages Team', type: 'team' },
            { id: 't8', name: 'Lending Risk Team', type: 'team' }
          ]
        }
      ]
    }
  ]
};

// ── Context → Level mapping ────────────────────────────
EAP.contextLevels = {
  'portfolio':      [{ value: 'Epic',       label: 'Epic' }],
  'solution-train': [{ value: 'Capability', label: 'Capability' }],
  'art':            [{ value: 'Feature',    label: 'Feature' }, { value: 'WorkItem', label: 'Work Item' }],
  'team':           [{ value: 'WorkItem',   label: 'Work Item' }]
};

EAP.defaultLevel = {
  'portfolio': 'Epic',
  'solution-train': 'Capability',
  'art': 'Feature',
  'team': 'WorkItem'
};

// ── Portfolio Level: Epics ─────────────────────────────
EAP.epics = {
  backlog: [
    { id: 'ebl1', name: 'AI-Powered Customer Support',      type: 'Epic', state: 'Funnel',  size: 'M',  wsjf: 7.4,  product: '', art: '' },
    { id: 'ebl2', name: 'Core Infrastructure Modernisation', type: 'Epic', state: 'Funnel',  size: 'L',  wsjf: 6.8,  product: '', art: '' },
    { id: 'ebl3', name: 'Digital Savings Platform',          type: 'Epic', state: 'Backlog', size: 'S',  wsjf: 5.5,  product: '', art: '' }
  ],
  groups: [
    { id: 'st1', name: 'Digital & Payments ST', type: 'solution-train',
      items: [
        { id: 'e1', name: 'Next-Gen Mobile Banking Platform',  state: 'Implementation', pct: 38, size: 'XL', wsjf: 18.4, art: 'Digital Banking ART' },
        { id: 'e2', name: 'Customer Self-Service Expansion',   state: 'Analysis',       pct: 5,  size: 'L',  wsjf: 14.1, art: 'Digital Banking ART' },
        { id: 'e3', name: 'Open Banking API Programme',        state: 'Review',         pct: 0,  size: 'XL', wsjf: 13.2, art: 'Digital Banking ART' },
        { id: 'e4', name: 'Payment Infrastructure Upgrade',    state: 'Backlog',        pct: 0,  size: 'L',  wsjf: 9.8,  art: 'Lending & Mortgages ART' }
      ]
    },
    { id: 'st2', name: 'Lending & Mortgages ST', type: 'solution-train',
      items: [
        { id: 'e5', name: 'Mortgage Origination Platform',     state: 'Funnel',  pct: 0, size: 'XL', wsjf: 11.5, art: 'Lending & Mortgages ART' },
        { id: 'e6', name: 'Risk Assessment Automation',        state: 'Funnel',  pct: 0, size: 'M',  wsjf: 8.7,  art: 'Lending & Mortgages ART' }
      ]
    }
  ]
};

// ── Solution Train Level: Capabilities ─────────────────
EAP.capabilities = {
  backlog: [
    { id: 'cbl1', name: 'Adapt content to cultural norms',              type: 'Capability', state: 'Funnel', size: 'S', wsjf: 8.2, parent: 'Localisation', art: '' },
    { id: 'cbl2', name: 'Auto-translate text into other languages',     type: 'Capability', state: 'Funnel', size: 'S', wsjf: 7.9, parent: 'Localisation', art: '' },
    { id: 'cbl3', name: 'Market research for customer preferences',     type: 'Capability', state: 'Funnel', size: 'M', wsjf: 7.1, parent: 'Marketing',     art: '' },
    { id: 'cbl4', name: 'Comprehensive marketing plan aligned to goals',type: 'Capability', state: 'Funnel', size: 'L', wsjf: 6.5, parent: 'Marketing',     art: '' }
  ],
  groups: [
    { id: 'art1', name: 'Digital Banking ART', type: 'art',
      items: [
        { id: 'c1', name: 'Seamless Authentication across channels',      state: 'Implementation', pct: 65, size: 'L',  wsjf: 15.2, parent: 'Next-Gen Mobile Banking' },
        { id: 'c2', name: 'Real-time Risk and Fraud detection',           state: 'Implementation', pct: 30, size: 'XL', wsjf: 13.9, parent: 'Next-Gen Mobile Banking' },
        { id: 'c3', name: 'Seamless Payments with retry flows',           state: 'Analysis',       pct: 20, size: 'L',  wsjf: 12.1, parent: 'Next-Gen Mobile Banking' },
        { id: 'c4', name: 'Self-Service Account Management',              state: 'In Progress',    pct: 40, size: 'M',  wsjf: 9.8,  parent: 'Customer Self-Service' }
      ]
    },
    { id: 'art2', name: 'Lending & Mortgages ART', type: 'art',
      items: [
        { id: 'c5', name: 'Automated Onboarding with KYC',                state: 'Funnel', pct: 0, size: 'L',  wsjf: 8.7, parent: 'Mortgage Origination' },
        { id: 'c6', name: 'Credit Risk Scoring Engine',                   state: 'Funnel', pct: 0, size: 'XL', wsjf: 7.4, parent: 'Risk Assessment' }
      ]
    }
  ]
};

// ── ART Level: Features ────────────────────────────────
EAP.features = {
  backlog: [
    { id: 'blf1',  name: 'Enhanced Biometric Auth Flow',     type: 'Feature', state: 'Funnel',   size: 'M', wsjf: 12.4, parent: 'Seamless Auth',   team: '' },
    { id: 'blf2',  name: 'Instant Payment Notifications',    type: 'Feature', state: 'Funnel',   size: 'S', wsjf: 10.8, parent: 'Payments',        team: '' },
    { id: 'blf3',  name: 'Loan Application Wizard',          type: 'Feature', state: 'Funnel',   size: 'L', wsjf: 9.2,  parent: 'Onboarding',      team: '' },
    { id: 'blf4',  name: 'Transaction Dispute Resolution',   type: 'Feature', state: 'Backlog',  size: 'M', wsjf: 8.7,  parent: 'Self-Service',    team: '' },
    { id: 'blf5',  name: 'Scheduled Payment Manager',        type: 'Feature', state: 'Funnel',   size: 'S', wsjf: 7.1,  parent: 'Payments',        team: '' },
    { id: 'blf6',  name: 'Investment Portfolio View',        type: 'Feature', state: 'Funnel',   size: 'M', wsjf: 6.8,  parent: 'Account Vis.',    team: '' },
    { id: 'blf7',  name: 'Account Statement Export PDF',     type: 'Feature', state: 'Backlog',  size: 'S', wsjf: 5.4,  parent: 'Self-Service',    team: '' },
    { id: 'blf8',  name: 'Multi-Currency Wallet Support',    type: 'Feature', state: 'Funnel',   size: 'L', wsjf: 5.1,  parent: 'Payments',        team: '' },
    { id: 'blf9',  name: 'Automated KYC Refresh Flow',       type: 'Feature', state: 'Analysis', size: 'M', wsjf: 4.8,  parent: 'Onboarding',      team: '' },
    { id: 'blf10', name: 'Push Notification Preferences',    type: 'Feature', state: 'Backlog',  size: 'S', wsjf: 4.2,  parent: 'Payments',        team: '' },
    { id: 'blf11', name: 'Card Freeze/Unfreeze Toggle',      type: 'Feature', state: 'Funnel',   size: 'S', wsjf: 3.9,  parent: 'Account Vis.',    team: '' },
    { id: 'blf12', name: 'Spending Insights Dashboard',      type: 'Feature', state: 'Funnel',   size: 'M', wsjf: 3.5,  parent: 'Account Vis.',    team: '' }
  ],
  pis: [
    { id: 'pi26', name: 'PI 26', dates: 'Apr 15 – Jun 9',   active: true,  capPct: 68, totalPts: 91, donePts: 24,
      items: [
        { id: 'lf1', name: 'Fingerprint Login Redesign',       state: 'Implementation', pct: 65, size: 'M', wsjf: 11.2, parent: 'Seamless Auth',   team: 'Auth' },
        { id: 'lf2', name: 'Real-time Fraud Alerts',           state: 'Implementation', pct: 30, size: 'L', wsjf: 9.8,  parent: 'Risk & Fraud',    team: 'Fraud' },
        { id: 'lf3', name: 'Payment Confirmation Flow',        state: 'Blocked',        pct: 20, size: 'L', wsjf: 12.1, parent: 'Payments',        team: 'Payments' },
        { id: 'lf4', name: 'Streamlined Onboarding Flow',      state: 'In Progress',    pct: 15, size: 'L', wsjf: 8.3,  parent: 'Onboarding',      team: 'Onboard' },
        { id: 'lf5', name: 'Balance on Home Screen Widget',    state: 'Done',           pct: 100,size: 'S', wsjf: 8.1,  parent: 'Account Vis.',    team: 'Mobile' },
        { id: 'lf6', name: 'Session Token Refresh Handler',    state: 'In Progress',    pct: 45, size: 'S', wsjf: 7.4,  parent: 'Seamless Auth',   team: 'Auth' },
        { id: 'lf7', name: 'Fraud Alert Deduplication',        state: 'Analysis',       pct: 5,  size: 'M', wsjf: 6.2,  parent: 'Risk & Fraud',    team: 'Fraud' },
        { id: 'lf8', name: 'Recipient Favourites List',        state: 'In Progress',    pct: 55, size: 'S', wsjf: 5.9,  parent: 'Payments',        team: 'Payments' }
      ]
    },
    { id: 'pi27', name: 'PI 27', dates: 'Jun 10 – Aug 31',  active: false, capPct: 0, totalPts: 0, donePts: 0,
      items: [
        { id: 'lf9',  name: 'Dark Mode Support',               state: 'Funnel',   pct: 0,  size: 'M',  wsjf: 8.4, parent: 'Account Vis.',  team: 'Mobile' },
        { id: 'lf10', name: 'Transaction Dispute Resolution',  state: 'Funnel',   pct: 0,  size: 'L',  wsjf: 7.9, parent: 'Self-Service',  team: 'Accounts' },
        { id: 'lf11', name: 'Notification Preference Centre',  state: 'Analysis', pct: 10, size: 'S',  wsjf: 7.2, parent: 'Payments',      team: 'Payments' },
        { id: 'lf12', name: 'Cross-Border Payment Support',    state: 'Funnel',   pct: 0,  size: 'XL', wsjf: 6.8, parent: 'Payments',      team: 'Payments' },
        { id: 'lf13', name: 'Account Aggregation API',         state: 'Funnel',   pct: 0,  size: 'L',  wsjf: 6.1, parent: 'Open Banking',  team: 'Accounts' }
      ]
    },
    { id: 'pi28', name: 'PI 28', dates: 'Sep 1 – Nov 30',   active: false, capPct: 0, totalPts: 0, donePts: 0,
      items: [
        { id: 'lf14', name: 'Statement Date Range Filter',     state: 'Funnel', pct: 0, size: 'S',  wsjf: 6.5,  parent: 'Self-Service',  team: 'Accounts' },
        { id: 'lf15', name: 'Biometric Auth for Returning Users',state:'Funnel', pct: 0, size: 'S',  wsjf: 9.1,  parent: 'Seamless Auth', team: 'Auth' },
        { id: 'lf16', name: 'PSD3 Compliance Module',          state: 'Funnel', pct: 0, size: 'XL', wsjf: 13.2, parent: 'Open Banking',  team: 'Accounts' },
        { id: 'lf17', name: 'Investment Portfolio View',        state: 'Funnel', pct: 0, size: 'M',  wsjf: 6.1,  parent: 'Account Vis.',  team: 'Accounts' }
      ]
    },
    { id: 'pi29', name: 'PI 29', dates: 'Dec 1 – Feb 28',   active: false, capPct: 0, totalPts: 0, donePts: 0, items: [] }
  ]
};

// ── ART/Team Level: Work Items (Stories + Defects + CaseTasks) ─
EAP.workItems = {
  backlog: {
    Story: [
      { id: 'blw1', num: 'STRY61094301', name: 'Report fraudulent transaction and recover funds',        state: 'Draft',  pts: 3, owner: 'Kiran',  team: 'Payments Team',  type: 'Story',     epic: '' },
      { id: 'blw2', num: 'STRY61094302', name: 'Change password regularly for account security',          state: 'Draft',  pts: 2, owner: 'Dev2',   team: 'Auth Team',      type: 'Story',     epic: '' },
      { id: 'blw3', num: 'STRY61094303', name: 'Log out remotely to prevent unauthorised access',         state: 'Draft',  pts: 2, owner: 'Dev3',   team: 'Mobile Exp Team',type: 'Story',     epic: '' },
      { id: 'blw4', num: 'STRY61094304', name: 'Set up PIN as additional protection layer',               state: 'Draft',  pts: 3, owner: 'Dev2',   team: 'Auth Team',      type: 'Story',     epic: '' },
      { id: 'blw5', num: 'STRY61094305', name: 'View devices currently logged into account',              state: 'Draft',  pts: 2, owner: 'Dev4',   team: 'Mobile Exp Team',type: 'Story',     epic: '' },
      { id: 'blw6', num: 'STRY61094306', name: 'Report security vulnerabilities discovered',              state: 'Draft',  pts: 3, owner: 'Dev3',   team: 'Fraud Team',     type: 'Story',     epic: '' }
    ],
    Defect: [
      { id: 'bld1', num: 'DEF0192954', name: 'Resource Report forecast utilisation not calculated with days off',    state: 'Backlog', pts: 0, owner: 'Dev2', team: 'Payments Team',  type: 'Defect',    epic: '' },
      { id: 'bld2', num: 'DEF0366785', name: 'Mobile timesheets single-select should auto-close modal',             state: 'Backlog', pts: 0, owner: 'Dev3', team: 'Mobile Exp Team',type: 'Defect',    epic: '' },
      { id: 'bld3', num: 'DEF0500640', name: 'Push notification delayed on Android 14 devices',                     state: 'Backlog', pts: 0, owner: 'Dev3', team: 'Mobile Exp Team',type: 'Defect',    epic: '' },
      { id: 'bld4', num: 'DEF0500641', name: 'Statement PDF missing page numbers on multi-page exports',            state: 'Backlog', pts: 0, owner: 'Dev4', team: 'Accounts Team',  type: 'Defect',    epic: '' }
    ],
    CaseTask: [
      { id: 'blc1', num: 'CSTASK1070158', name: 'Write acceptance criteria for biometric fallback flow',               state: 'Draft', pts: 1, owner: 'Ananya', team: 'Auth Team',      type: 'Case Task', epic: '' },
      { id: 'blc2', num: 'CSTASK1215264', name: 'Update test plan for fraud alert deduplication',                      state: 'Draft', pts: 1, owner: 'Dev2',   team: 'Fraud Team',     type: 'Case Task', epic: '' },
      { id: 'blc3', num: 'CSTASK1222242', name: 'Document API contract for payment confirmation endpoint',             state: 'Draft', pts: 2, owner: 'Dev3',   team: 'Payments Team',  type: 'Case Task', epic: '' }
    ]
  },
  sprints: [
    { id: 'sp2', name: 'Sprint 2', dates: 'Apr 15–28', active: true, capPct: 60, totalPts: 32, donePts: 8,
      items: [
        { id: 'ls6',  name: 'Handle fallback to PIN on failed biometric scan',          state: 'In Progress', pct: 50, pts: 3, owner: 'Kiran', team: 'Auth Team' },
        { id: 'ls7',  name: 'Build payment confirmation screen layout',                 state: 'In Progress', pct: 40, pts: 5, owner: 'Kiran', team: 'Payments Team' },
        { id: 'ls8',  name: 'Integrate Auth API for payment confirmation flow',          state: 'Blocked',     pct: 10, pts: 8, owner: 'Kiran', team: 'Payments Team' },
        { id: 'ls9',  name: 'Payment amount validation rules and error states',          state: 'In Review',   pct: 80, pts: 3, owner: 'Dev2',  team: 'Payments Team' },
        { id: 'ls10', name: 'Fraud detection webhook integration and retry logic',       state: 'In Progress', pct: 30, pts: 8, owner: 'Dev3',  team: 'Fraud Team' },
        { id: 'ls11', name: 'Balance refresh on app resume and foreground event',        state: 'To Do',       pct: 0,  pts: 5, owner: 'Dev4',  team: 'Mobile Exp Team' }
      ]
    },
    { id: 'sp3', name: 'Sprint 3', dates: 'Apr 29 – May 12', active: false, capPct: 0, totalPts: 29, donePts: 0,
      items: [
        { id: 'ls15', name: 'Retry mechanism for failed payment submissions',            state: 'Planned', pct: 0, pts: 3, owner: 'Kiran', team: 'Payments Team' },
        { id: 'ls16', name: 'Scheduled payment UI with recurring options',               state: 'Planned', pct: 0, pts: 8, owner: 'Dev2',  team: 'Payments Team' },
        { id: 'ls17', name: 'Statement PDF export component and layout',                 state: 'Planned', pct: 0, pts: 5, owner: 'Dev4',  team: 'Accounts Team' },
        { id: 'ls18', name: 'Auth session expiry handler regression tests',              state: 'Planned', pct: 0, pts: 3, owner: 'Dev2',  team: 'Auth Team' },
        { id: 'ls19', name: 'Fraud alert deduplication logic and tests',                 state: 'Planned', pct: 0, pts: 5, owner: 'Dev3',  team: 'Fraud Team' }
      ]
    },
    { id: 'sp4', name: 'Sprint 4', dates: 'May 13–26', active: false, capPct: 0, totalPts: 24, donePts: 0,
      items: [
        { id: 'ls22', name: 'Recurring payment logic and edge case handling',            state: 'Planned', pct: 0, pts: 8, owner: 'Kiran', team: 'Payments Team' },
        { id: 'ls23', name: 'Payment limit enforcement at API level',                    state: 'Planned', pct: 0, pts: 5, owner: 'Dev2',  team: 'Payments Team' },
        { id: 'ls24', name: 'Biometric returning user login flow',                       state: 'Planned', pct: 0, pts: 3, owner: 'Dev2',  team: 'Auth Team' },
        { id: 'ls25', name: 'Fraud dispute UI integration with backend',                 state: 'Planned', pct: 0, pts: 5, owner: 'Dev3',  team: 'Fraud Team' }
      ]
    },
    { id: 'sp5', name: 'Sprint 5', dates: 'May 27 – Jun 9', active: false, capPct: 0, totalPts: 18, donePts: 0, items: [] }
  ]
};

// ── Hierarchy (Goal → Epic → Capability → Feature → Story) ──
EAP.hierarchy = [
  { id: 'g1', type: 'goal', name: 'Become top digital bank in UK by 2027', prog: 'On Track 42%',
    children: [
      { id: 'e1', type: 'epic', name: 'Next-Gen Mobile Banking Platform', prog: 'In Progress 38%',
        children: [
          { id: 'c1', type: 'capability', name: 'Seamless Authentication', prog: '65%',
            children: [
              { id: 'f1', type: 'feature', name: 'Fingerprint Login Redesign', prog: 'In Progress 65%',
                children: [
                  { id: 's1', type: 'story', name: 'Build biometric prompt UI (5pts)', prog: 'Done' },
                  { id: 's2', type: 'story', name: 'Handle fallback to PIN (3pts)', prog: 'In Progress' },
                  { id: 's3', type: 'story', name: 'Error state on failed scan (2pts)', prog: 'To Do' },
                  { id: 'd1', type: 'defect', name: 'DEF-001: Biometric fails on iOS 17.4', prog: 'Open High' }
                ]
              },
              { id: 'f2', type: 'feature', name: 'Enhanced Biometric Auth Flow', prog: 'Backlog', children: [] }
            ]
          },
          { id: 'c2', type: 'capability', name: 'Real-time Risk and Fraud', prog: '30%',
            children: [
              { id: 'f3', type: 'feature', name: 'Real-time Fraud Alerts', prog: 'At Risk 30%',
                children: [
                  { id: 's4', type: 'story', name: 'Fraud detection webhook (8pts)', prog: 'In Progress' },
                  { id: 's5', type: 'story', name: 'Alert delivery service (8pts)', prog: 'At Risk' },
                  { id: 'd2', type: 'defect', name: 'DEF-002: Alert not firing card-not-present', prog: 'Open High' }
                ]
              }
            ]
          },
          { id: 'c3', type: 'capability', name: 'Seamless Payments', prog: '20%',
            children: [
              { id: 'f4', type: 'feature', name: 'Payment Confirmation Flow', prog: 'Blocked 20%',
                children: [
                  { id: 's6', type: 'story', name: 'Auth API integration (8pts)', prog: 'Blocked' },
                  { id: 's7', type: 'story', name: 'Confirmation screen UI (5pts)', prog: 'In Progress' }
                ]
              },
              { id: 'f5', type: 'feature', name: 'Scheduled Payment Manager', prog: 'Backlog', children: [] }
            ]
          },
          { id: 'c4', type: 'capability', name: 'Customer Account Visibility', prog: '100%',
            children: [
              { id: 'f6', type: 'feature', name: 'Balance on Home Screen', prog: 'Complete 100%',
                children: [
                  { id: 's8', type: 'story', name: 'Balance widget build (8pts)', prog: 'Done' },
                  { id: 's9', type: 'story', name: 'Refresh on app resume (5pts)', prog: 'Done' }
                ]
              }
            ]
          }
        ]
      },
      { id: 'e2', type: 'epic', name: 'Customer Self-Service Expansion', prog: 'Not Started 0%',
        children: [
          { id: 'f7', type: 'feature', name: 'Transaction Dispute Resolution', prog: 'Backlog', children: [] },
          { id: 'f8', type: 'feature', name: 'Account Statement Export PDF', prog: 'Backlog', children: [] }
        ]
      }
    ]
  },
  { id: 'g2', type: 'goal', name: 'Reduce operating costs by 18% by end of 2026', prog: 'Behind 12%',
    children: [
      { id: 'e3', type: 'epic', name: 'Process Automation Platform', prog: 'In Progress 25%',
        children: [
          { id: 'c5', type: 'capability', name: 'Self-Service Account Management', prog: '40%',
            children: [
              { id: 'f9', type: 'feature', name: 'Account Statement Export PDF', prog: 'In Progress 40%',
                children: [
                  { id: 's20', type: 'story', name: 'PDF generation service (8pts)', prog: 'In Progress' },
                  { id: 's21', type: 'story', name: 'Statement template design (5pts)', prog: 'To Do' }
                ]
              }
            ]
          },
          { id: 'c6', type: 'capability', name: 'Automated Onboarding', prog: '15%',
            children: [
              { id: 'f11', type: 'feature', name: 'Streamlined Onboarding Flow', prog: 'Not Started',
                children: [
                  { id: 's22', type: 'story', name: 'KYC automation service (8pts)', prog: 'To Do' },
                  { id: 's23', type: 'story', name: 'Document verification API (5pts)', prog: 'To Do' }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

// ── Board: Workflow columns (Epic/Capability kanban) ────
EAP.workflowColumns = ['Funnel', 'Review', 'Analysis', 'Backlog', 'Implementation', 'Done'];

// ── Board: Track view columns (9-state workflow) ───────
EAP.trackColumns = ['Draft', 'Ready', 'In Progress', 'In Review', 'Testing', 'Ready for Acceptance', 'Accepted', 'Complete', 'Cancelled'];

// ── Board: Feature dependencies ────────────────────────
// Dependencies across PIs (cross-column in feature board)
EAP.featureDeps = [
  { from: 'lf10', to: 'lf1', type: 'risk',     reason: 'Transaction Dispute Resolution (PI 27) depends on Fingerprint Login Redesign (PI 26) — Auth must complete before dispute flow can verify identity' },
  { from: 'lf12', to: 'lf3', type: 'conflict',  reason: 'Cross-Border Payment Support (PI 27) depends on Payment Confirmation Flow (PI 26) — but Payment Confirmation is currently Blocked' },
  { from: 'lf9',  to: 'lf5', type: 'ok',        reason: 'Dark Mode Support (PI 27) depends on Balance Widget (PI 26) — Balance Widget is Done, dependency satisfied' },
  { from: 'lf15', to: 'lf6', type: 'risk',      reason: 'Biometric Auth for Returning Users (PI 28) depends on Session Token Refresh (PI 26) — token refresh at 45%, tight timeline' }
];

// ── Insights: context-aware signals ────────────────────
EAP.insights = {
  'art-Feature-List': {
    gauge: { value: 68, label: 'PI 26 Capacity' },
    teams: [
      { name: 'Auth',     pct: 80,  status: 'healthy' },
      { name: 'Payments', pct: 92,  status: 'watch' },
      { name: 'Fraud',    pct: 110, status: 'over' },
      { name: 'Mobile',   pct: 70,  status: 'healthy' },
      { name: 'Accounts', pct: 65,  status: 'healthy' },
      { name: 'Onboard',  pct: 60,  status: 'healthy' }
    ],
    signals: [
      { level: 'urgent', title: 'Payment depends on Auth (blocked)',   desc: 'Auth at 80% cap. Slip cascades to 2 teams.', action: 'View dependency' },
      { level: 'urgent', title: 'Fraud Team Sprint 4 at 110%',        desc: '3 items need descoping before PI close.',     action: 'Rebalance' },
      { level: 'urgent', title: 'Onboarding has no team assigned',    desc: "Won't make PI 26 without assignment.",        action: 'Assign team' },
      { level: 'watch',  title: 'Mobile Exp has no Sprint 3 items',   desc: 'Capacity available, nothing planned.',        action: 'Review' },
      { level: 'ok',     title: 'Auth + Mobile on track Sprints 1–3', desc: 'No issues detected.',                         action: '' }
    ]
  },
  'art-Feature-Backlog': {
    signals: [
      { level: 'urgent', title: '47 customers flagged biometric issues',     desc: 'Up 3× this week. Enhanced Auth Flow ranked #1.', action: 'Plan into PI 26' },
      { level: 'urgent', title: 'Payment confirmation too slow (31 mentions)',desc: 'No backlog item exists for this yet.',           action: 'Create Feature' },
      { level: 'watch',  title: '3 competitors launched biometric login',    desc: 'Consider accelerating biometric Feature.',       action: 'Reprioritise' },
      { level: 'watch',  title: 'PSD3 regulatory update published',          desc: 'Dispute Resolution may need scope change.',      action: 'Review scope' }
    ]
  },
  'art-Feature-Board': {
    signals: [
      { level: 'urgent', title: 'Payment Confirmation blocked Day 2',       desc: 'Sprint ends in 5 days. Escalation not assigned.', action: 'Escalate' },
      { level: 'watch',  title: 'Fraud Team velocity 20% below target',     desc: 'Real-time Alerts likely to slip.',                action: 'Review' },
      { level: 'ok',     title: 'Auth Team on track',                        desc: 'Fingerprint Login at 65% with 8 days left.',     action: '' }
    ]
  },
  'art-Feature-Hierarchy': {
    signals: [
      { level: 'watch',  title: 'Cost reduction goal behind at 12%',        desc: 'vs 42% for digital bank goal.',                   action: 'View plan' },
      { level: 'watch',  title: 'Customer Support Deflection has no Features',desc:'Draft status, no breakdown.',                    action: 'Start scoping' },
      { level: 'ok',     title: 'Digital bank goal on track at 42%',         desc: 'PI 26 commitments align with targets.',           action: '' }
    ]
  }
};

// ── Team capacity data (for insights) ──────────────────
EAP.teamCapacity = {
  'Auth Team':       { sp1: 72, sp2: 80, sp3: 75, sp4: 70 },
  'Payments Team':   { sp1: 88, sp2: 92, sp3: 85, sp4: 80 },
  'Fraud Team':      { sp1: 74, sp2: 78, sp3: 80, sp4: 110 },
  'Mobile Exp Team': { sp1: 65, sp2: 70, sp3: 68, sp4: 65 },
  'Accounts Team':   { sp1: 60, sp2: 65, sp3: 62, sp4: 60 },
  'Onboarding Team': { sp1: 55, sp2: 60, sp3: 58, sp4: 55 }
};
