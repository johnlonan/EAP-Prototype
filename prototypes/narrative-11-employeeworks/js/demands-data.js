const STATE_COLOR = {
  Draft: 'red',
  Submitted: 'blue',
  Screening: 'violet',
  Qualified: 'teal',
  Approved: 'green',
  Complete: 'amber',
};

const STATE_ORDER = ['Draft', 'Submitted', 'Screening', 'Qualified', 'Approved', 'Complete'];

const PRIORITY_COLOR = {
  High: 'red',
  Medium: 'amber',
  Low: 'neutral',
};

// Verbal explanation of each lifecycle state — generic, keyed by state only,
// so any demand gets the right copy automatically.
const STATE_EXPLANATION = {
  Draft:     { headline: 'This demand is being drafted.',                                     sub: 'Add remaining details before submitting for review.' },
  Submitted: { headline: 'Your demand has been submitted for review.',                          sub: 'A demand manager will screen it for completeness and fit.' },
  Screening: { headline: 'Your demand is being screened.',                                      sub: 'The demand manager is validating scope and business justification.' },
  Qualified: { headline: 'Your demand has been qualified.',                                     sub: "It's ready for portfolio review and approval." },
  Approved:  { headline: "Your demand has been approved. It's being converted and delivery will begin shortly.", sub: 'An owner will be assigned and will reach out with kickoff details.' },
  Complete:  { headline: 'This demand has been delivered.',                                      sub: 'The resulting work is complete and closed out.' },
};

// Labels for the "resulting entity" section — generic by entity type, so the
// same render logic works whether a demand converts to a Project, Epic, etc.
const ENTITY_TYPE_LABELS = {
  Project:    { ownerLabel: 'Project Manager', ctaLabel: 'View project' },
  Epic:       { ownerLabel: 'Epic Owner',      ctaLabel: 'View epic' },
  Initiative: { ownerLabel: 'Initiative Lead', ctaLabel: 'View initiative' },
};

const DELIVERY_STATUS_COLOR = {
  'Not yet converted': 'neutral',
  'In progress': 'green',
  'Complete': 'green',
};

const MY_DEMANDS = [
  {
    id: 'DMND412001', title: 'Customer self-service portal redesign', portfolio: 'Consumer Digital product',
    state: 'Qualified', priority: 'Medium', score: 74, startDate: '2026-06-01', endDate: '2026-09-30',
    targetEntityType: 'Project',
    demandManager: { initials: 'SK', name: 'Sarah Kim' },
    businessJustification: 'Reduces inbound support tickets by letting employees resolve common requests without contacting the service desk.',
    riskOfPerforming: 'Requires a coordinated rollout across regions; risk of temporary support gaps during cutover.',
    riskOfNotPerforming: 'Support ticket volume continues to grow, increasing service desk backlog and cost.',
    assumptions: 'Assumes existing knowledge base content is accurate and can be reused in the new portal.',
    activity: [
      { author: 'John Lonan', date: 'Jun 1, 2026', text: 'Submitted this demand for review.' },
      { author: 'Sarah Kim', date: 'Jun 6, 2026', text: 'Moved to Screening: initial scope looks reasonable.' },
      { author: 'Sarah Kim', date: 'Jun 14, 2026', text: 'Qualified. Awaiting portfolio approval.' },
    ],
  },
  {
    id: 'DMND412014', title: 'Vendor onboarding automation', portfolio: 'Business Transformation',
    state: 'Draft', priority: 'Medium', score: null, startDate: '2026-07-01', endDate: '2026-10-01',
    targetEntityType: 'Project',
    demandManager: { initials: 'RM', name: 'Raj Malhotra' },
    businessJustification: 'Cuts vendor onboarding time from weeks to days by automating document collection and approvals.',
    riskOfPerforming: 'Integration with procurement systems may surface data quality issues in existing vendor records.',
    riskOfNotPerforming: 'Manual onboarding continues to delay new vendor engagements and strain procurement staff.',
    assumptions: "Assumes procurement can provide a clean vendor data export for migration.",
    activity: [
      { author: 'John Lonan', date: 'Jun 20, 2026', text: 'Created draft. Still adding supporting detail before submitting.' },
    ],
  },
  {
    id: 'DMND411988', title: 'Regional office network upgrade', portfolio: 'Enterprise Ventures',
    state: 'Approved', priority: 'High', score: 81, startDate: '2026-09-01', endDate: '2027-01-15',
    targetEntityType: 'Project',
    convertedEntity: {
      number: 'PRJ0010021', name: 'Regional office network hardware refresh', status: 'In progress',
      progressPct: 20, phase: 'Planning', owner: 'Tom Reilly', targetDelivery: 'Q1 2027', lastUpdate: 'Updated 3 days ago',
    },
    demandManager: { initials: 'TR', name: 'Tom Reilly' },
    businessJustification: 'Current network hardware is past end-of-life and increasingly prone to outages.',
    riskOfPerforming: 'Requires a maintenance window with potential brief downtime at the regional office.',
    riskOfNotPerforming: 'Risk of unplanned outages increases as hardware continues to age.',
    assumptions: "Assumes replacement hardware ships on the vendor's quoted timeline.",
    activity: [
      { author: 'John Lonan', date: 'May 2, 2026', text: 'Submitted this demand for review.' },
      { author: 'Tom Reilly', date: 'May 9, 2026', text: 'Qualified after scoping call with facilities.' },
      { author: 'Tom Reilly', date: 'May 22, 2026', text: 'Approved by portfolio board. Starts Sep 2026.' },
    ],
  },
  {
    id: 'DMND411920', title: 'Employee travel policy chatbot', portfolio: 'HR',
    state: 'Submitted', priority: 'Low', score: null, startDate: '2026-08-01', endDate: '2026-11-30',
    targetEntityType: 'Project',
    demandManager: { initials: 'SK', name: 'Sarah Kim' },
    businessJustification: 'Reduces HR inquiries about travel policy by giving employees instant, consistent answers.',
    riskOfPerforming: 'Chatbot responses need ongoing review to stay aligned with policy changes.',
    riskOfNotPerforming: 'HR continues fielding repetitive travel policy questions manually.',
    assumptions: "Assumes travel policy content is finalized and won't change significantly during build.",
    activity: [
      { author: 'John Lonan', date: 'Jun 25, 2026', text: 'Submitted this demand for review.' },
    ],
  },
  {
    id: 'DMND411875', title: 'Marketing analytics dashboard refresh', portfolio: 'Marketing',
    state: 'Screening', priority: 'Medium', score: null, startDate: '2026-08-15', endDate: '2026-12-01',
    targetEntityType: 'Project',
    demandManager: { initials: 'RM', name: 'Raj Malhotra' },
    businessJustification: 'Current dashboards use deprecated data sources and no longer reflect accurate campaign performance.',
    riskOfPerforming: 'Refresh may temporarily disrupt reporting continuity during data source migration.',
    riskOfNotPerforming: 'Marketing continues making decisions on stale or inaccurate data.',
    assumptions: 'Assumes the new analytics data source is already provisioned and accessible.',
    activity: [
      { author: 'John Lonan', date: 'Jun 10, 2026', text: 'Submitted this demand for review.' },
      { author: 'Raj Malhotra', date: 'Jun 18, 2026', text: 'Moved to Screening: validating data source availability.' },
    ],
  },
  {
    id: 'DMND410340', title: 'Legacy CRM data migration', portfolio: 'Application Modernization',
    state: 'Complete', priority: 'High', score: 68, startDate: '2025-11-01', endDate: '2026-03-01',
    targetEntityType: 'Project',
    convertedEntity: {
      number: 'PRJ0009984', name: 'Legacy CRM data migration', status: 'Complete',
      progressPct: 100, phase: 'Closed', owner: 'Tom Reilly', targetDelivery: 'Mar 2026', lastUpdate: 'Updated 4 months ago',
    },
    demandManager: { initials: 'TR', name: 'Tom Reilly' },
    businessJustification: 'Consolidates customer data onto the supported CRM platform ahead of legacy system retirement.',
    riskOfPerforming: 'Data migration carries risk of record mismatches requiring manual reconciliation.',
    riskOfNotPerforming: 'Legacy system reaches end of vendor support, leaving customer data unprotected.',
    assumptions: 'Assumed legacy system export tools remained functional through the migration window.',
    activity: [
      { author: 'John Lonan', date: 'Oct 15, 2025', text: 'Submitted this demand for review.' },
      { author: 'Tom Reilly', date: 'Oct 28, 2025', text: 'Approved by portfolio board.' },
      { author: 'Tom Reilly', date: 'Mar 1, 2026', text: 'Migration complete. Closing out.' },
    ],
  },
  {
    id: 'DMND411450', title: 'Supplier risk scoring model', portfolio: 'Enterprise Ventures',
    state: 'Draft', priority: 'Medium', score: null, startDate: '2026-09-15', endDate: '2027-02-28',
    targetEntityType: 'Project',
    demandManager: { initials: 'SK', name: 'Sarah Kim' },
    businessJustification: 'Gives procurement an early warning system for suppliers at risk of disruption.',
    riskOfPerforming: "Model accuracy depends on the quality and freshness of third-party risk data feeds.",
    riskOfNotPerforming: 'Supplier risk continues to be assessed manually and inconsistently across teams.',
    assumptions: 'Assumes budget is available for a third-party supplier risk data subscription.',
    activity: [
      { author: 'John Lonan', date: 'Jun 28, 2026', text: 'Created draft. Still adding supporting detail before submitting.' },
    ],
  },
  {
    id: 'DMND412030', title: 'Self-service IT ticket deflection bot', portfolio: 'Consumer Digital product',
    state: 'Screening', priority: 'Low', score: null, startDate: '2026-08-20', endDate: '2026-12-15',
    targetEntityType: 'Project',
    demandManager: { initials: 'RM', name: 'Raj Malhotra' },
    businessJustification: 'Deflects routine IT tickets away from the service desk queue, freeing agents for complex issues.',
    riskOfPerforming: 'Poorly tuned deflection could frustrate employees with unhelpful automated responses.',
    riskOfNotPerforming: 'Service desk queue continues to grow, extending resolution times across all ticket types.',
    assumptions: 'Assumes historical ticket data is available to train the deflection logic.',
    activity: [
      { author: 'John Lonan', date: 'Jul 5, 2026', text: 'Submitted this demand for review.' },
      { author: 'Raj Malhotra', date: 'Jul 12, 2026', text: 'Moved to Screening: validating support ticket volume data.' },
    ],
  },
  {
    id: 'DMND411510', title: 'Contractor badge access automation', portfolio: 'HR',
    state: 'Approved', priority: 'High', score: 77, startDate: '2026-10-01', endDate: '2027-01-31',
    targetEntityType: 'Project',
    convertedEntity: {
      number: 'PRJ0010045', name: 'Contractor badge access automation', status: 'In progress',
      progressPct: 35, phase: 'Executing', owner: 'Sara Lee', targetDelivery: 'Q3 2026', lastUpdate: 'Updated yesterday',
    },
    demandManager: { initials: 'TR', name: 'Tom Reilly' },
    businessJustification: 'Removes manual badge provisioning steps that currently delay contractor start dates.',
    riskOfPerforming: 'Requires close coordination with physical security to avoid access gaps.',
    riskOfNotPerforming: 'Contractors continue to experience delayed facility access on their start date.',
    assumptions: "Assumes facilities' badge system exposes an API for automated provisioning.",
    activity: [
      { author: 'John Lonan', date: 'Jun 12, 2026', text: 'Submitted this demand for review.' },
      { author: 'Tom Reilly', date: 'Jun 20, 2026', text: 'Qualified after review with facilities and security.' },
      { author: 'Tom Reilly', date: 'Jul 2, 2026', text: 'Approved by portfolio board. Starts Oct 2026.' },
    ],
  },
];

function getDemandById(id) {
  return MY_DEMANDS.find(d => d.id === id);
}

function stateBadgeHTML(state) {
  const color = STATE_COLOR[state] || 'neutral';
  return `<span class="aiux-badge dmw-state-badge dmw-state-badge--${color}">${state}</span>`;
}

function priorityBadgeHTML(priority) {
  const color = PRIORITY_COLOR[priority] || 'neutral';
  return `<span class="aiux-badge dmw-state-badge dmw-state-badge--${color}">${priority}</span>`;
}

function formatDate(iso) {
  if (!iso) return '–';
  const [y, m, d] = iso.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}
