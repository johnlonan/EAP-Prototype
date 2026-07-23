/**
 * narrative-0-ConfigureSPM — "Configure SPM" guided setup console
 * Screen: Run Environment Diagnostic (pre-run + post-run states)
 * Chrome (global header, alert banners, guided-setup tree nav) reproduced
 * as classic Platform UI — hand-built on Horizon tokens, not the Workspace shell.
 */

import React from '../node_modules/.pnpm/react@16.14.0/node_modules/react';
import ReactDOM from '../node_modules/.pnpm/react-dom@16.14.0_react@16.14.0/node_modules/react-dom';

import '@servicenow/now-button';
import '@servicenow/now-icon';

// ─── Embedded SVG icons (real ServiceNow wordmark + header glyphs) ─────────────
var ICONS = {
  servicenowLogo: '<svg viewBox="0 0 174 27" xmlns="http://www.w3.org/2000/svg"><path d="M42.8,8.4 C40.9,8.4 39.3,9.1 38,10.1 L38,8.5 L33.6,8.5 L33.6,25.6 L38.2,25.6 L38.2,14.7 C38.8,13.8 40.4,12.6 42.3,12.6 C43,12.6 43.6,12.7 44.1,12.9 L44.1,8.5 C43.7,8.4 43.3,8.4 42.8,8.4" fill="#FFFFFF"/><path d="M3,20.4 C4.2,21.5 5.9,22.1 7.7,22.1 C8.9,22.1 9.9,21.5 9.9,20.7 C9.9,18.1 1.7,19 1.7,13.5 C1.7,10.2 4.9,8.2 8.2,8.2 C10.4,8.2 12.8,9 14,9.9 L11.9,13.2 C11,12.6 9.9,12 8.6,12 C7.3,12 6.3,12.5 6.3,13.4 C6.3,15.6 14.5,14.7 14.5,20.7 C14.5,24 11.3,26 7.7,26 C5.3,26 2.9,25.2 0.9,23.7 L3,20.4 Z" fill="#FFFFFF"/><path d="M31.7,16.9 C31.7,12.1 28.4,8.2 23.7,8.2 C18.6,8.2 15.4,12.4 15.4,17.1 C15.4,22.5 19.2,26 24.3,26 C26.9,26 29.6,24.9 31.3,22.9 L28.7,20.3 C27.9,21.2 26.3,22.3 24.4,22.3 C22,22.3 20,20.6 19.8,18.2 L31.6,18.2 C31.6,17.8 31.7,17.4 31.7,16.9 M20,14.9 C20.2,13.3 21.8,11.9 23.6,11.9 C25.5,11.9 26.8,13.4 27,14.9 L20,14.9 Z" fill="#FFFFFF"/><polygon points="55 19 59.7 8.5 64.4 8.5 56.6 25.6 53.4 25.6 45.6 8.5 50.4 8.5" fill="#FFFFFF"/><path d="M68.3,0.5 C69.9,0.5 71.3,1.8 71.3,3.4 C71.3,5 70,6.3 68.3,6.3 C66.6,6.3 65.3,5 65.3,3.4 C65.3,1.8 66.6,0.5 68.3,0.5" fill="#FFFFFF"/><rect fill="#FFFFFF" x="66" y="8.5" width="4.6" height="17.1"/><path d="M89.4,22.1 C87.4,24.8 84.9,25.9 81.7,25.9 C76.4,25.9 72.6,21.9 72.6,17 C72.6,12 76.6,8.1 81.8,8.1 C84.7,8.1 87.4,9.5 89,11.5 L85.8,14.4 C84.9,13.2 83.5,12.4 81.9,12.4 C79.3,12.4 77.3,14.5 77.3,17.1 C77.3,19.8 79.2,21.8 82,21.8 C83.9,21.8 85.3,20.7 86.1,19.5 L89.4,22.1 Z" fill="#FFFFFF"/><path d="M106,22.9 C104.4,24.9 101.6,26 99,26 C93.9,26 90.1,22.5 90.1,17.1 C90.1,12.3 93.3,8.2 98.4,8.2 C103.1,8.2 106.4,12.2 106.4,16.9 C106.4,17.4 106.4,17.8 106.3,18.2 L94.5,18.2 C94.7,20.6 96.7,22.3 99.1,22.3 C101,22.3 102.6,21.2 103.4,20.3 L106,22.9 Z M101.7,14.9 C101.6,13.4 100.2,11.9 98.3,11.9 C96.4,11.9 94.9,13.3 94.7,14.9 L101.7,14.9 Z" fill="#FFFFFF"/><path d="M108.2,25.6 L108.2,8.5 L112.6,8.5 L112.6,9.9 C113.9,8.8 115.5,8.2 117.4,8.2 C119.8,8.2 121.9,9.3 123.3,11 C124.4,12.3 125.1,14.1 125.1,17 L125.1,25.7 L120.5,25.7 L120.5,16.6 C120.5,14.9 120.1,14 119.5,13.4 C118.9,12.8 118,12.4 116.9,12.4 C115,12.4 113.4,13.6 112.8,14.5 L112.8,25.6 L108.2,25.6 L108.2,25.6 Z" fill="#FFFFFF"/><path d="M136.8,8.2 C131.4,8.2 126.8,12.6 126.8,18.1 C126.8,21 128,23.6 129.9,25.5 C130.6,26.2 131.7,26.2 132.5,25.6 C133.6,24.7 135.1,24.2 136.8,24.2 C138.5,24.2 139.9,24.7 141.1,25.6 C141.9,26.2 143,26.1 143.7,25.4 C145.6,23.6 146.8,21 146.8,18.1 C146.7,12.7 142.3,8.2 136.8,8.2 M136.7,23.2 C133.8,23.2 131.7,21 131.7,18.2 C131.7,15.4 133.7,13.2 136.7,13.2 C139.7,13.2 141.7,15.5 141.7,18.2 C141.7,20.9 139.7,23.2 136.7,23.2" fill="#4FB64B"/><polygon points="155.7 25.6 152.3 25.6 145.5 8.5 150.1 8.5 153.8 18.3 157.5 8.5 161.3 8.5 164.9 18.3 168.6 8.5 173.2 8.5 166.4 25.6 163 25.6 159.4 15.9" fill="#FFFFFF"/></svg>',
  globe: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0M7.397 2.347C7.64 2.08 7.844 2 8 2s.36.08.603.347.485.682.698 1.236c.159.414.297.89.407 1.417H6.292c.11-.527.248-1.003.407-1.417.213-.554.455-.969.698-1.236"/></svg>',
  help: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M7.5 4C6.658 4 6 4.606 6 5.5a.5.5 0 0 1-1 0C5 4.027 6.132 3 7.5 3 8.913 3 10 4.216 10 5.643c0 .489-.126.913-.377 1.257a2.03 2.03 0 0 1-.97.703C8.22 7.76 8 8.043 8 8.286V8.5a.5.5 0 0 1-1 0v-.214c0-.862.708-1.405 1.313-1.624.23-.083.394-.203.502-.35S9 5.954 9 5.641C9 4.703 8.297 4 7.5 4m0 7a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/><path d="M0 7.5a7.5 7.5 0 1 0 15 0 7.5 7.5 0 0 0-15 0M7.5 14a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13"/></svg>',
  bell: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a6 6 0 0 0-6 6v2.856A1.636 1.636 0 0 0 2.636 13H6a2 2 0 1 0 4 0h3.364A1.636 1.636 0 0 0 14 9.856V7a6 6 0 0 0-6-6M3 7a5 5 0 0 1 10 0v3.235a.5.5 0 0 0 .44.497.637.637 0 0 1-.076 1.268H2.636a.636.636 0 0 1-.077-1.268.5.5 0 0 0 .441-.497zm6 6a1 1 0 1 1-2 0z"/></svg>',
  ellipsisVertical: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M9.5 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M8 14a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/></svg>',
  starOutline: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M7.049 2.359c.3-.921 1.603-.921 1.902 0l1.183 3.64h3.827c.969 0 1.372 1.24.588 1.81l-3.096 2.249 1.182 3.64c.3.921-.755 1.687-1.539 1.118L8 12.566l-3.096 2.25c-.784.57-1.839-.197-1.54-1.118l1.183-3.64-3.096-2.25C.667 7.238 1.071 6 2.039 6h3.827zm.95.309L6.594 6.999H2.039l3.684 2.677-1.407 4.33L8 11.33l3.684 2.677-1.407-4.331 3.684-2.677H9.407z"/></svg>',
  chevronDown: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M3.646 5.646a.5.5 0 0 1 .708 0L8 9.293l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708"/></svg>',
  chevronRight: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M5.646 3.646a.5.5 0 0 1 .708 0l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L9.293 8 5.646 4.354a.5.5 0 0 1 0-.708"/></svg>',
  checkCircle: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.3"/><path d="M5 8.2l1.9 1.9L11.2 6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  dotCircle: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.4" stroke="#9CA3AF" stroke-width="1.2" stroke-dasharray="2.2 2.2"/></svg>',
  triangleWarn: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M7.086 1.638a1 1 0 0 1 1.828 0l6.5 11.5A1 1 0 0 1 14.5 15h-13a1 1 0 0 1-.914-1.862zM8 5a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 8 5m0 6.5a.85.85 0 1 0 0 1.7.85.85 0 0 0 0-1.7"/></svg>',
  infoCircle: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14M7 7h1.5a.5.5 0 0 1 .5.5V11h.75a.5.5 0 0 1 0 1h-2.5a.5.5 0 0 1 0-1H8V8H7a.5.5 0 0 1 0-1M8 6a.9.9 0 1 1 0-1.8A.9.9 0 0 1 8 6"/></svg>',
  close: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4.146 4.146a.5.5 0 0 1 .708 0L8 7.293l3.146-3.147a.5.5 0 1 1 .708.708L8.707 8l3.147 3.146a.5.5 0 0 1-.708.708L8 8.707l-3.146 3.147a.5.5 0 0 1-.708-.708L7.293 8 4.146 4.854a.5.5 0 0 1 0-.708"/></svg>',
  search: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M11.29 9.877a5 5 0 1 0-1.414 1.414l3.377 3.377a1 1 0 0 0 1.414-1.414zM11 6.5A4.5 4.5 0 1 1 2 6.5a4.5 4.5 0 0 1 9 0"/></svg>'
};

function Icon(props) {
  var svg = ICONS[props.name];
  if (!svg) return null;
  return React.createElement('span', {
    className: 'csp-svg-icon' + (props.className ? ' ' + props.className : ''),
    dangerouslySetInnerHTML: { __html: svg }
  });
}

// now-button is a Seismic web component — it fires a custom `NOW_BUTTON#CLICKED`
// event rather than a synthetic onClick, so binding goes through a ref.
function NowButton(props) {
  return React.createElement('now-button', {
    label: props.label,
    variant: props.variant || 'primary',
    size: props.size || 'md',
    ref: function(el) {
      if (!el) return;
      if (el._onClick) el.removeEventListener('NOW_BUTTON#CLICKED', el._onClick);
      if (props.onClick) {
        el._onClick = props.onClick;
        el.addEventListener('NOW_BUTTON#CLICKED', el._onClick);
      }
    }
  });
}

// ─── Nav tree data ──────────────────────────────────────────────────────────
// status: 'configured' | 'todo'   |   type: 'group' (expandable, no content) | 'step' (leaf, has content)
var NAV_TREE = [
  { id: 'common-setup', label: 'Common setup', type: 'group', status: 'todo', children: [
    { id: 'define-org-structure', label: 'Define organisation structure', type: 'group', status: 'todo', children: [] },
    { id: 'reporting-setup', label: 'Reporting setup', type: 'group', status: 'todo', children: [] }
  ]},
  { id: 'demand-management', label: 'Demand Management', type: 'group', status: 'todo', children: [
    { id: 'dm-setup-user-roles', label: 'Setup user roles', type: 'group', status: 'todo', children: [] },
    { id: 'configure-demand-intake', label: 'Configure demand intake channels', type: 'group', status: 'todo', children: [] },
    { id: 'configure-demand-playbooks', label: 'Configure demand playbooks', type: 'step', status: 'todo' },
    { id: 'dm-advanced-settings', label: 'Advanced settings', type: 'step', status: 'todo' }
  ]},
  { id: 'project-management', label: 'Project Management', type: 'group', status: 'todo', children: [
    { id: 'pm-setup-user-roles', label: 'Setup user roles', type: 'group', status: 'todo', children: [] },
    { id: 'pm-setup-project-types', label: 'Setup project types', type: 'group', status: 'todo', children: [] },
    { id: 'configure-project-playbooks', label: 'Configure Project Playbooks', type: 'step', status: 'todo' },
    { id: 'setup-project-templates', label: 'Setup project templates', type: 'step', status: 'todo' },
    { id: 'setup-status-report-templates', label: 'Setup status report templates', type: 'step', status: 'todo' },
    { id: 'setup-project-schedules', label: 'Setup project schedules', type: 'step', status: 'todo' },
    { id: 'pm-advanced-settings', label: 'Advanced settings', type: 'step', status: 'todo' }
  ]},
  { id: 'resource-management', label: 'Resource Management', type: 'group', status: 'todo', children: [
    { id: 'resource-management-guided-setup', label: 'Resource Management guided setup', type: 'step', status: 'todo' }
  ]},
  { id: 'financials', label: 'Financials', type: 'group', status: 'configured', children: [
    { id: 'pre-configuration-diagnostics', label: 'Pre-Configuration Diagnostics', type: 'group', status: 'todo', children: [
      { id: 'run-environment-diagnostic', label: 'Run Environment Diagnostic', type: 'step', status: 'todo' }
    ]},
    { id: 'foundation-setup', label: 'Foundation setup', type: 'group', status: 'configured', children: [
      { id: 'setup-fiscal-calendar', label: 'Setup fiscal calendar', type: 'group', status: 'configured', children: [] },
      { id: 'configure-functional-currency', label: 'Configure functional currency', type: 'step', status: 'configured' },
      { id: 'review-cost-types', label: 'Review cost types', type: 'step', status: 'configured' },
      { id: 'configure-investment-entities', label: 'Configure investment entities', type: 'step', status: 'configured' },
      { id: 'configure-budget-reference-rates', label: 'Configure budget reference rates', type: 'step', status: 'todo' },
      { id: 'activate-rollup-property', label: 'Activate rollup property from sub-projects to projects', type: 'step', status: 'todo' }
    ]},
    { id: 'labor-cost-configuration', label: 'Labor cost configuration', type: 'group', status: 'todo', children: [] },
    { id: 'non-labor-cost-configuration', label: 'Non-Labor cost configuration', type: 'group', status: 'todo', children: [] },
    { id: 'multi-currency', label: 'Multi-currency', type: 'group', status: 'todo', children: [
      { id: 'select-demand-currency-preference', label: 'Select demand currency preference', type: 'step', status: 'todo' },
      { id: 'rollup-project-financials', label: 'Roll up project financials from sub-projects to parent projects', type: 'step', status: 'todo' },
      { id: 'currency-upgrade-job', label: 'Run Upgrade job for demand/project currency to investment currency', type: 'step', status: 'todo' }
    ]},
    { id: 'budget-allocation-setup', label: 'Budget allocation setup', type: 'step', status: 'todo' },
    { id: 'migrate-budgets', label: 'Migrate budgets', type: 'step', status: 'todo' },
    { id: 'migrate-financial-baselines', label: 'Migrate financial baselines', type: 'step', status: 'todo' },
    { id: 'run-data-generation-job', label: 'Run data generation job', type: 'step', status: 'todo' }
  ]}
];

function flattenNav(nodes, depth, out) {
  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i];
    out.push({ id: n.id, label: n.label, type: n.type, status: n.status, depth: depth });
    if (n.children && n.children.length) flattenNav(n.children, depth + 1, out);
  }
  return out;
}
var FLAT_NAV = flattenNav(NAV_TREE, 0, []);
function findNavNode(id) {
  for (var i = 0; i < FLAT_NAV.length; i++) if (FLAT_NAV[i].id === id) return FLAT_NAV[i];
  return null;
}
// ancestor group ids for a given leaf id (so we can auto-expand on jump)
function ancestorsOf(id, nodes, trail) {
  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i];
    if (n.id === id) return trail;
    if (n.children && n.children.length) {
      var found = ancestorsOf(id, n.children, trail.concat([n.id]));
      if (found) return found;
    }
  }
  return null;
}

// ─── Diagnostic check data (copy per PM, Jul 2026) ─────────────────────────
var CHECKS = [
  {
    id: 'fiscal-periods',
    title: 'Fiscal periods check',
    subtitle: null,
    navTargetId: 'setup-fiscal-calendar',
    state: 'pass',
    passText: "Fiscal periods are already generated. Verify those in the 'Review fiscal periods' step.",
    failLead: 'Fiscal periods have not been generated. ',
    failLinkLabel: "Complete 'Generate fiscal calendar'",
    failTail: ' to create them.'
  },
  {
    id: 'resource-cost-plan',
    title: 'Resource based cost plan check',
    subtitle: 'Labor cost plans tied to classic resource plans',
    navTargetId: 'labor-cost-configuration',
    state: 'fail',
    passText: 'No cost plans are attached to classic resource plans.',
    failLead: '1 or more cost plans found with an attached resource plan. ',
    failLinkLabel: "Complete 'Labor cost configuration'",
    failTail: ' to uptake attribute-based planning.',
  },
  {
    id: 'labor-cost-types',
    title: 'Labor cost types check',
    subtitle: 'Modified OOB cost types',
    navTargetId: 'review-cost-types',
    state: 'fail',
    passText: 'No custom labor cost types requiring mapping were found. Out-of-the-box labor cost types are in use.',
    failLead: "1 or more custom labor cost types were detected that aren't mapped. ",
    failLinkLabel: "Complete 'Map labor cost types'",
    failTail: ' to map them.',
  },
  {
    id: 'budget-allocation',
    title: 'Budget allocation check',
    subtitle: null,
    navTargetId: 'budget-allocation-setup',
    state: 'fail',
    passText: 'Budget allocation V2 is enabled. Your instance is using the new flexible budget allocation capability.',
    failLead: 'Budget allocation V2 is not enabled. ',
    failLinkLabel: "Complete 'Budget allocation setup'",
    failTail: ' to use the new budgeting capability.'
  },
  {
    id: 'budget-migration',
    title: 'Budget migration check',
    subtitle: null,
    navTargetId: 'migrate-budgets',
    state: 'fail',
    passText: 'All Project/Demand budgets have been migrated to the new budgeting experience.',
    failLead: '1 or more Project/Demand budgets are not migrated. ',
    failLinkLabel: "Complete 'Migrate budgets'",
    failTail: ' to migrate old budget.'
  },
  {
    id: 'baseline-migration',
    title: 'Baseline migration check',
    subtitle: null,
    navTargetId: 'migrate-financial-baselines',
    state: 'fail',
    passText: 'All Project/Demand financial baselines have been migrated.',
    failLead: '1 or more Project/Demand baselines are not migrated. ',
    failLinkLabel: "Complete 'Migrate financial baselines'",
    failTail: ' for migration.'
  },
  {
    id: 'multicurrency',
    title: 'Multicurrency check',
    subtitle: 'Currency field upgrade',
    navTargetId: 'currency-upgrade-job',
    state: 'fail',
    passText: 'All demand/project currency fields are upgraded to investment currency.',
    failLead: '1 or more demand/project currency fields are not upgraded to investment currency. ',
    failLinkLabel: "Complete 'Upgrade job for demand/project currency to investment currency'",
    failTail: ' to correct this.',
  },
  {
    id: 'planning-item',
    title: 'Planning item check',
    subtitle: 'Investment object association',
    navTargetId: 'run-data-generation-job',
    state: 'fail',
    passText: 'All planning items are associated with an investment object.',
    failLead: '1 or more planning items are not associated to an investment. ',
    failLinkLabel: "Complete 'Run data generation job'",
    failTail: ' to correct the data.',
  }
];

// Checks that flip to passing after a re-run, simulating the admin having
// fixed some items and re-checked. 2 of 7 originally-failing checks stay
// failing so a re-run still reads as real progress, not a clean sweep.
var RERUN_PASS_IDS = ['resource-cost-plan', 'labor-cost-types', 'budget-allocation', 'budget-migration', 'baseline-migration'];

// ─── Design tokens ──────────────────────────────────────────────────────────
// Every value below is traced to a real Horizon token (building-custom-components-or-CSS.md)
// instead of an arbitrary hex. Text/border ramps derive from --now-color--neutral-21 (black)
// combined with the documented --now-opacity-- scale, rather than invented Tailwind-style greys.
var TOKENS = {
  headerBg: 'rgb(3,45,66)',            // Coral chrome brand-5 (matches replica-appshell--header-bg)
  brandGreenAccent: '#4FB64B',         // real accent green from the servicenow logo asset
  brandTeal: 'rgb(30,133,109)',        // --now-color--primary-1
  brandBlue: 'rgb(1,119,142)',         // --now-color--secondary-1 — links / actionable text
  statusSuccess: 'rgb(75,166,107)',    // --now-color_presence--available
  statusWarning: 'rgb(255,178,0)',     // --now-color_presence--away
  statusWarningText: 'rgb(140,98,0)',  // darkened statusWarning, for icon/text contrast on white
  textPrimary: 'rgba(0,0,0,0.9)',      // headings — neutral-21 (black) at high opacity
  textSecondary: 'rgba(0,0,0,0.8)',    // body copy — $now-opacity--most
  textTertiary: 'rgba(0,0,0,0.5)',     // meta/labels — $now-opacity--mid
  borderSubtle: 'rgba(0,0,0,0.1)',     // $now-opacity--least
  surfaceTint: 'rgba(0,0,0,0.03)',     // neutral surface tint (summary row, hovers)
  shadowSm: '0 2px 4px 0 rgba(56,56,56,0.25)' // $now-global-drop-shadow--sm
};

// ─── Styles ─────────────────────────────────────────────────────────────────
function injectStyles() {
  var el = document.createElement('style');
  el.textContent = `
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; height: 100%; }
    body, button, input {
      font-family: var(--now-font-family, 'Source Sans Pro', Lato, -apple-system, BlinkMacSystemFont, sans-serif);
    }
    #webpack-dev-server-client-overlay { display: none !important; }
    .csp-svg-icon svg { display: block; }

    .csp-root { min-height: 100vh; display: flex; flex-direction: column; background: #fff; }

    /* ── L0 header ─────────────────────────────────────────────────── */
    .csp-header { background: ${TOKENS.headerBg}; display: flex; align-items: center; height: 44px; padding: 0 24px; gap: 20px; flex-shrink: 0; }
    .csp-logo { display: flex; align-items: center; width: 132px; flex-shrink: 0; color: #fff; }
    .csp-logo svg { width: 132px; height: 20px; }
    .csp-menu { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
    .csp-menu-item { color: rgba(255,255,255,0.92); font-size: 14px; padding: 6px 10px; border-radius: 4px; cursor: pointer; white-space: nowrap; }
    .csp-menu-item:hover { background: rgba(255,255,255,0.12); }
    .csp-header-center { flex: 1; display: flex; justify-content: center; min-width: 0; }
    .csp-console-pill { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.28); border-radius: 20px; padding: 5px 16px; color: #fff; font-size: 13px; font-weight: 600; max-width: 320px; }
    .csp-header-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .csp-search { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.10); border-radius: 4px; padding: 5px 10px; width: 190px; color: rgba(255,255,255,0.6); }
    .csp-search input { background: transparent; border: none; outline: none; color: #fff; font-size: 13px; width: 100%; }
    .csp-search input::placeholder { color: rgba(255,255,255,0.55); }
    .csp-header-icon { color: rgba(255,255,255,0.85); display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 4px; cursor: pointer; }
    .csp-header-icon:hover { background: rgba(255,255,255,0.12); }
    .csp-avatar { width: 26px; height: 26px; border-radius: 50%; background: ${TOKENS.brandGreenAccent}; color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-left: 4px; }

    /* ── Alert banners ─────────────────────────────────────────────── */
    .csp-banner { display: flex; align-items: flex-start; gap: 12px; padding: 12px 24px; font-size: 13px; line-height: 1.5; flex-shrink: 0; color: ${TOKENS.textSecondary}; }
    .csp-banner-yellow { background: rgba(255,178,0,0.12); border-bottom: 1px solid ${TOKENS.borderSubtle}; }
    .csp-banner-yellow .csp-svg-icon { color: ${TOKENS.statusWarningText}; }
    .csp-banner-blue { background: rgba(1,119,142,0.08); border-bottom: 1px solid ${TOKENS.borderSubtle}; }
    .csp-banner-blue .csp-svg-icon { color: ${TOKENS.brandBlue}; }
    .csp-banner-body { flex: 1; }
    .csp-banner-title { font-weight: 700; margin-right: 4px; color: ${TOKENS.textPrimary}; }
    .csp-banner-link { color: inherit; font-weight: 600; text-decoration: underline; cursor: pointer; margin-left: 6px; white-space: nowrap; }
    .csp-banner-close { cursor: pointer; opacity: 0.6; flex-shrink: 0; }
    .csp-banner-close:hover { opacity: 1; }

    /* ── Title bar ──────────────────────────────────────────────────── */
    .csp-titlebar { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid ${TOKENS.borderSubtle}; flex-shrink: 0; }
    .csp-titlebar h1 { font-size: 20px; font-weight: 700; color: ${TOKENS.textPrimary}; margin: 0; }
    .csp-titlebar-right { display: flex; align-items: center; gap: 16px; }

    /* ── Body: two columns ─────────────────────────────────────────── */
    .csp-body { flex: 1; display: flex; overflow: hidden; min-height: 0; }

    /* Nav column */
    .csp-nav { width: 300px; flex-shrink: 0; background: ${TOKENS.surfaceTint}; border-right: 1px solid ${TOKENS.borderSubtle}; overflow-y: auto; padding: 10px 0; }
    .csp-nav-row { display: flex; align-items: center; gap: 8px; min-height: 34px; padding-right: 10px; cursor: pointer; }
    .csp-nav-row:hover:not(.is-selected) { background: ${TOKENS.surfaceTint}; }
    .csp-nav-row.is-selected { background: rgba(30,133,109,0.12); }
    .csp-nav-row.is-selected .csp-nav-label { color: ${TOKENS.textPrimary}; font-weight: 700; }
    .csp-nav-row.is-selected .csp-nav-status { color: ${TOKENS.brandTeal}; }
    .csp-nav-chevron { width: 16px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: ${TOKENS.textTertiary}; }
    .csp-nav-status { width: 16px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: ${TOKENS.textPrimary}; }
    .csp-nav-label { font-size: 13px; color: ${TOKENS.textSecondary}; line-height: 1.3; }
    .csp-nav-group-label { font-size: 13px; color: ${TOKENS.textSecondary}; font-weight: 600; }

    /* Content column */
    .csp-content { flex: 1; overflow-y: auto; min-width: 0; }
    .csp-content-inner { padding: 32px 40px; }
    .csp-content-inner > p.csp-desc { max-width: 820px; }
    .csp-content-hdr { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
    .csp-content-hdr h2 { font-size: 21px; font-weight: 700; color: ${TOKENS.textPrimary}; margin: 0 0 12px; }
    .csp-overflow-wrap { position: relative; flex-shrink: 0; }
    .csp-overflow-btn { color: ${TOKENS.textTertiary}; cursor: pointer; padding: 4px; border-radius: 4px; }
    .csp-overflow-btn:hover { background: ${TOKENS.surfaceTint}; }
    .csp-overflow-menu { position: absolute; right: 0; top: 28px; background: #fff; border: 1px solid ${TOKENS.borderSubtle}; border-radius: 6px; box-shadow: ${TOKENS.shadowSm}; min-width: 150px; z-index: 5; padding: 4px 0; }
    .csp-overflow-menu-item { padding: 8px 14px; font-size: 13px; color: ${TOKENS.textSecondary}; cursor: pointer; }
    .csp-overflow-menu-item:hover { background: ${TOKENS.surfaceTint}; }
    .csp-overflow-menu-item-dev { border-top: 1px solid ${TOKENS.borderSubtle}; margin-top: 4px; padding-top: 12px; }
    .csp-desc { font-size: 14px; color: ${TOKENS.textSecondary}; line-height: 1.6; margin: 0 0 16px; }
    .csp-reassurance { font-size: 12.5px; color: ${TOKENS.textTertiary}; margin: 0 0 24px; }

    /* Pre-run preview list */
    .csp-preview-list { list-style: none; margin: 0 0 28px; padding: 0; }
    .csp-preview-list li { display: flex; gap: 10px; padding: 6px 0; font-size: 14px; color: ${TOKENS.textSecondary}; }
    .csp-preview-num { color: ${TOKENS.textTertiary}; font-variant-numeric: tabular-nums; }

    /* Post-run summary */
    .csp-summary-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: ${TOKENS.surfaceTint}; border: 1px solid ${TOKENS.borderSubtle}; border-radius: 6px; margin-bottom: 4px; }
    .csp-summary-left { display: flex; flex-direction: column; gap: 2px; }
    .csp-summary-text { font-size: 18px; font-weight: 700; color: ${TOKENS.textPrimary}; }
    .csp-summary-meta { font-size: 12px; color: ${TOKENS.textTertiary}; }

    /* Condition list */
    .csp-check-list { margin: 24px 0 8px; }
    .csp-check-card { display: flex; gap: 16px; background: #fff; border: 1px solid ${TOKENS.borderSubtle}; border-radius: 10px; padding: 18px 20px; margin-bottom: 12px; box-shadow: ${TOKENS.shadowSm}; }
    .csp-check-card:last-child { margin-bottom: 0; }
    .csp-check-card.opt-a.is-pass { background: rgba(75,166,107,0.06); }
    .csp-check-card.opt-a.is-fail { background: rgba(255,178,0,0.08); }
    .csp-check-card.opt-b.is-pass { border-color: rgba(75,166,107,0.35); }
    .csp-check-card.opt-b.is-fail { border-color: rgba(255,178,0,0.5); }
    .csp-variant-toggle { display: inline-flex; align-items: center; gap: 2px; background: ${TOKENS.surfaceTint}; border: 1px solid ${TOKENS.borderSubtle}; border-radius: 8px; padding: 2px; }
    .csp-variant-btn { border: none; background: transparent; font-size: 12.5px; font-weight: 600; color: ${TOKENS.textTertiary}; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-family: inherit; }
    .csp-variant-btn.is-active { background: #fff; color: ${TOKENS.textPrimary}; box-shadow: ${TOKENS.shadowSm}; }
    .csp-check-status-badge { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .csp-check-status-badge.is-pass { background: rgba(75,166,107,0.18); color: ${TOKENS.statusSuccess}; }
    .csp-check-status-badge.is-fail { background: rgba(255,178,0,0.22); color: ${TOKENS.statusWarningText}; }
    .csp-check-body { flex: 1; min-width: 0; }
    .csp-check-title-row { display: flex; align-items: baseline; gap: 8px; }
    .csp-check-num { font-size: 12.5px; font-weight: 700; color: ${TOKENS.textTertiary}; font-variant-numeric: tabular-nums; }
    .csp-check-title { font-size: 16px; font-weight: 700; color: ${TOKENS.textPrimary}; }
    .csp-check-subtitle-row { display: flex; align-items: baseline; gap: 8px; margin-top: 2px; }
    .csp-check-subtitle { font-size: 13px; color: ${TOKENS.textTertiary}; }
    .csp-check-text { font-size: 13.5px; color: ${TOKENS.textSecondary}; line-height: 1.55; margin-top: 8px; }
    .csp-check-link { color: ${TOKENS.brandBlue}; cursor: pointer; }
    .csp-check-link:hover { text-decoration: underline; }
    .csp-learn-more { display: inline-flex; align-items: center; gap: 4px; font-size: 12.5px; color: ${TOKENS.brandBlue}; cursor: pointer; flex-shrink: 0; white-space: nowrap; align-self: center; }
    .csp-learn-more:hover { text-decoration: underline; }
    .csp-learn-more now-icon { color: ${TOKENS.brandBlue}; }

    /* Bottom action bar */
    .csp-content-footer { border-top: 1px solid ${TOKENS.borderSubtle}; padding: 24px 40px; }

    /* Generic step stub */
    .csp-stub-body { font-size: 14px; color: ${TOKENS.textSecondary}; line-height: 1.6; }

    /* Loading skeleton */
    @keyframes csp-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .csp-skel { background: linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 37%, rgba(0,0,0,0.06) 63%); background-size: 400% 100%; animation: csp-shimmer 1.4s ease-in-out infinite; border-radius: 4px; }
    .csp-skel-summary { height: 54px; margin-bottom: 4px; border-radius: 6px; }
    .csp-skel-card { align-items: center; }
    .csp-skel-icon { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; }
    .csp-skel-line { height: 12px; }
  `;
  document.head.appendChild(el);
}

// ─── Header ─────────────────────────────────────────────────────────────────
function Header() {
  return React.createElement('div', { className: 'csp-header' },
    React.createElement('div', { className: 'csp-logo' }, React.createElement(Icon, { name: 'servicenowLogo' })),
    React.createElement('div', { className: 'csp-menu' },
      ['All', 'Favorites', 'History', 'Workspaces', 'Admin'].map(function(label) {
        return React.createElement('div', { className: 'csp-menu-item', key: label }, label);
      })
    ),
    React.createElement('div', { className: 'csp-header-center' },
      React.createElement('div', { className: 'csp-console-pill' },
        React.createElement('span', null, 'Configuration Console'),
        React.createElement(Icon, { name: 'starOutline' })
      )
    ),
    React.createElement('div', { className: 'csp-header-right' },
      React.createElement('div', { className: 'csp-search' },
        React.createElement(Icon, { name: 'search' }),
        React.createElement('input', { placeholder: 'Search', readOnly: true })
      ),
      React.createElement('div', { className: 'csp-header-icon' }, React.createElement(Icon, { name: 'globe' })),
      React.createElement('div', { className: 'csp-header-icon' }, React.createElement(Icon, { name: 'help' })),
      React.createElement('div', { className: 'csp-header-icon' }, React.createElement(Icon, { name: 'bell' })),
      React.createElement('div', { className: 'csp-avatar' }, 'SL')
    )
  );
}

// ─── Alert banners ──────────────────────────────────────────────────────────
function Banners(props) {
  return React.createElement(React.Fragment, null,
    props.showSecurity ? React.createElement('div', { className: 'csp-banner csp-banner-yellow' },
      React.createElement(Icon, { name: 'triangleWarn' }),
      React.createElement('div', { className: 'csp-banner-body' },
        React.createElement('span', { className: 'csp-banner-title' }, 'Action Required: Review Basic Authentication Account Security'),
        React.createElement('span', null, ' ServiceNow released a security update that will change basic auth settings for certain accounts unless action is taken. Review accounts using basic authentication and apply the recommended action.'),
        React.createElement('span', { className: 'csp-banner-link' }, 'Know More')
      ),
      React.createElement('div', { className: 'csp-banner-close', onClick: props.onCloseSecurity }, React.createElement(Icon, { name: 'close' }))
    ) : null,
    props.showAssist ? React.createElement('div', { className: 'csp-banner csp-banner-blue' },
      React.createElement(Icon, { name: 'infoCircle' }),
      React.createElement('div', { className: 'csp-banner-body' },
        React.createElement('span', { className: 'csp-banner-title' }, 'Now Assist Panel Disabled.'),
        React.createElement('span', null, ' To start configuring with Now Assist, make sure AI Search and Now Assist panel is enabled by going to Now Assist Admin.'),
        React.createElement('span', { className: 'csp-banner-link' }, 'Edit this setting')
      )
    ) : null
  );
}

// ─── Nav tree ───────────────────────────────────────────────────────────────
function NavTree(props) {
  var rows = [];
  function renderNodes(nodes, depth) {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var isGroup = n.type === 'group';
      var isExpanded = props.expanded[n.id];
      var isSelected = n.id === props.selectedId;
      rows.push(
        React.createElement('div', {
          key: n.id,
          className: 'csp-nav-row' + (isSelected ? ' is-selected' : ''),
          style: { paddingLeft: (depth * 16 + 12) + 'px' },
          onClick: function(node, group) {
            return function() {
              if (group) props.onToggleGroup(node.id);
              if (node.type === 'step') props.onSelectStep(node.id);
            };
          }(n, isGroup)
        },
          isGroup
            ? React.createElement('span', { className: 'csp-nav-chevron' }, React.createElement(Icon, { name: isExpanded ? 'chevronDown' : 'chevronRight' }))
            : React.createElement('span', { className: 'csp-nav-status' }, React.createElement(Icon, { name: n.status === 'configured' ? 'checkCircle' : 'dotCircle' })),
          React.createElement('span', { className: isGroup ? 'csp-nav-group-label' : 'csp-nav-label' }, n.label)
        )
      );
      if (isGroup && isExpanded && n.children && n.children.length) {
        renderNodes(n.children, depth + 1);
      }
    }
  }
  renderNodes(NAV_TREE, 0);
  return React.createElement('div', { className: 'csp-nav' }, rows);
}

// ─── Run Environment Diagnostic — pre-run state ────────────────────────────
function PreRunState(props) {
  return React.createElement(React.Fragment, null,
    React.createElement('p', { className: 'csp-desc' },
      'This diagnostic is for existing customers upgrading to the latest Financials capability. It checks your instance’s current configuration and flags steps needed to move to the new budgeting, resource, and financial baseline experience.'
    ),
    React.createElement('p', { className: 'csp-reassurance' },
      'This check is informational only — it won’t block you from continuing your setup.'
    ),
    React.createElement('ul', { className: 'csp-preview-list' },
      CHECKS.map(function(c, i) {
        return React.createElement('li', { key: c.id },
          React.createElement('span', { className: 'csp-preview-num' }, (i + 1) + '.'),
          React.createElement('span', null, c.title)
        );
      })
    ),
    React.createElement(NowButton, { label: 'Run diagnostics', variant: 'primary', onClick: props.onRun })
  );
}

// ─── Run Environment Diagnostic — loading state ────────────────────────────
function LoadingState() {
  return React.createElement(React.Fragment, null,
    React.createElement('div', { className: 'csp-skel csp-skel-summary' }),
    React.createElement('div', { className: 'csp-check-list' },
      CHECKS.map(function(c) {
        return React.createElement('div', { className: 'csp-check-card csp-skel-card', key: c.id },
          React.createElement('div', { className: 'csp-skel csp-skel-icon' }),
          React.createElement('div', { className: 'csp-check-body' },
            React.createElement('div', { className: 'csp-skel csp-skel-line', style: { width: '40%' } }),
            React.createElement('div', { className: 'csp-skel csp-skel-line', style: { width: '90%', marginTop: '10px' } }),
            React.createElement('div', { className: 'csp-skel csp-skel-line', style: { width: '65%', marginTop: '6px' } })
          )
        );
      })
    )
  );
}

// ─── Run Environment Diagnostic — post-run state ───────────────────────────
function PostRunState(props) {
  var hasRerun = props.runCount > 1;
  var checks = hasRerun
    ? CHECKS.map(function(c) {
        return RERUN_PASS_IDS.indexOf(c.id) !== -1 ? Object.assign({}, c, { state: 'pass' }) : c;
      })
    : CHECKS;
  var failCount = checks.filter(function(c) { return c.state === 'fail'; }).length;
  var summaryText = failCount > 0
    ? (failCount + ' of ' + checks.length + ' conditions may need your attention')
    : 'All ' + checks.length + ' conditions reviewed';
  return React.createElement(React.Fragment, null,
    React.createElement('p', { className: 'csp-reassurance' },
      'This check is informational only — it won’t block you from continuing your setup.'
    ),
    React.createElement('div', { className: 'csp-summary-row' },
      React.createElement('div', { className: 'csp-summary-left' },
        React.createElement('span', { className: 'csp-summary-text' }, summaryText),
        React.createElement('span', { className: 'csp-summary-meta' }, 'Checked just now')
      ),
      React.createElement(NowButton, { label: 'Re-run diagnostics', variant: 'secondary', size: 'sm', onClick: props.onRun })
    ),
    React.createElement('div', { className: 'csp-check-list' },
      checks.map(function(c, i) {
        var isPass = c.state === 'pass';
        var text = isPass
          ? React.createElement('span', null, c.passText)
          : React.createElement('span', null,
              c.failLead,
              React.createElement('span', {
                className: 'csp-check-link',
                onClick: function() { props.onFixClick(c.navTargetId); }
              }, c.failLinkLabel),
              c.failTail
            );
        return React.createElement('div', { className: 'csp-check-card opt-' + props.cardVariant + ' ' + (isPass ? 'is-pass' : 'is-fail'), key: c.id },
          React.createElement('div', { className: 'csp-check-status-badge ' + (isPass ? 'is-pass' : 'is-fail') },
            React.createElement('now-icon', { icon: isPass ? 'circle-check-fill' : 'triangle-exclamation-fill', size: 'md' })
          ),
          React.createElement('div', { className: 'csp-check-body' },
            React.createElement('div', { className: 'csp-check-title-row' },
              React.createElement('span', { className: 'csp-check-num' }, (i + 1) + '.'),
              React.createElement('span', { className: 'csp-check-title' }, c.title)
            ),
            c.subtitle ? React.createElement('div', { className: 'csp-check-subtitle-row' },
              React.createElement('span', { className: 'csp-check-subtitle' }, c.subtitle)
            ) : null,
            React.createElement('div', { className: 'csp-check-text' }, text)
          ),
          React.createElement('div', {
            className: 'csp-learn-more',
            onClick: function() {}
          },
            React.createElement('span', null, 'Learn more'),
            React.createElement('now-icon', { icon: 'open-link-right-outline', size: 'sm' })
          )
        );
      })
    )
  );
}

// ─── Generic stub for every other nav step (proves the fix-link jump works) ─
function StepStub(props) {
  return React.createElement('p', { className: 'csp-stub-body' },
    'This is the “' + props.label + '” configuration screen.'
  );
}

// ─── Content area shell (title, overflow menu, body, footer) ──────────────
function ContentArea(props) {
  var overflowS = React.useState(false); var overflowOpen = overflowS[0]; var setOverflowOpen = overflowS[1];
  var node = findNavNode(props.selectedId);
  var isDiagnostic = props.selectedId === 'run-environment-diagnostic';
  var configured = props.configuredMap[props.selectedId];

  return React.createElement('div', { className: 'csp-content' },
    React.createElement('div', { className: 'csp-content-inner' },
      React.createElement('div', { className: 'csp-content-hdr' },
        React.createElement('h2', null, node ? node.label : ''),
        React.createElement('div', { className: 'csp-overflow-wrap' },
          React.createElement('div', { className: 'csp-overflow-btn', onClick: function() { setOverflowOpen(!overflowOpen); } },
            React.createElement(Icon, { name: 'ellipsisVertical' })
          ),
          overflowOpen ? React.createElement('div', { className: 'csp-overflow-menu' },
            React.createElement('div', { className: 'csp-overflow-menu-item', onClick: function() { setOverflowOpen(false); } }, 'Skip this step'),
            React.createElement('div', { className: 'csp-overflow-menu-item', onClick: function() { setOverflowOpen(false); } }, 'View history'),
            React.createElement('div', {
              className: 'csp-overflow-menu-item csp-overflow-menu-item-dev',
              onClick: function() { setOverflowOpen(false); window.open('https://johnlonan.github.io/EAP-Prototype/prototypes/narrative-0-ConfigureSPM/dev-spec.html', '_blank'); }
            }, 'View dev spec')
          ) : null
        )
      ),
      isDiagnostic
        ? (props.diagnosticRunning
            ? React.createElement(LoadingState, null)
            : props.diagnosticRan
              ? React.createElement(PostRunState, { onRun: props.onRunDiagnostics, onFixClick: props.onFixClick, cardVariant: props.cardVariant, runCount: props.runCount })
              : React.createElement(PreRunState, { onRun: props.onRunDiagnostics }))
        : React.createElement(StepStub, { label: node ? node.label : '' })
    ),
    React.createElement('div', { className: 'csp-content-footer' },
      React.createElement(NowButton, {
        label: configured ? '✓ Configured' : 'Mark as configured',
        variant: configured ? 'tertiary' : 'secondary',
        onClick: function() { props.onToggleConfigured(props.selectedId); }
      })
    )
  );
}

// ─── App ────────────────────────────────────────────────────────────────────
function App() {
  var selS = React.useState('run-environment-diagnostic'); var selectedId = selS[0]; var setSelectedId = selS[1];
  var expS = React.useState({ financials: true, 'pre-configuration-diagnostics': true, 'foundation-setup': false, 'multi-currency': false });
  var expanded = expS[0]; var setExpanded = expS[1];
  var runCountS = React.useState(0); var runCount = runCountS[0]; var setRunCount = runCountS[1];
  var diagnosticRan = runCount > 0;
  var runningS = React.useState(false); var diagnosticRunning = runningS[0]; var setDiagnosticRunning = runningS[1];
  var confS = React.useState({}); var configuredMap = confS[0]; var setConfiguredMap = confS[1];
  var secBannerS = React.useState(true); var showSecurity = secBannerS[0]; var setShowSecurity = secBannerS[1];
  var variantS = React.useState('a'); var cardVariant = variantS[0]; var setCardVariant = variantS[1];

  function selectStepAndReveal(id) {
    var trail = ancestorsOf(id, NAV_TREE, []);
    if (trail) {
      var next = Object.assign({}, expanded);
      trail.forEach(function(gid) { next[gid] = true; });
      setExpanded(next);
    }
    setSelectedId(id);
  }

  function handleToggleGroup(id) {
    var next = Object.assign({}, expanded);
    next[id] = !next[id];
    setExpanded(next);
  }

  function handleToggleConfigured(id) {
    var next = Object.assign({}, configuredMap);
    next[id] = !next[id];
    setConfiguredMap(next);
  }

  return React.createElement('div', { className: 'csp-root' },
    React.createElement(Header, null),
    React.createElement(Banners, { showSecurity: showSecurity, showAssist: true, onCloseSecurity: function() { setShowSecurity(false); } }),
    React.createElement('div', { className: 'csp-titlebar' },
      React.createElement('h1', null, 'Configure SPM'),
      React.createElement('div', { className: 'csp-titlebar-right' },
        React.createElement('div', { className: 'csp-variant-toggle' },
          React.createElement('button', {
            className: 'csp-variant-btn' + (cardVariant === 'a' ? ' is-active' : ''),
            onClick: function() { setCardVariant('a'); }
          }, 'Option A · Tinted'),
          React.createElement('button', {
            className: 'csp-variant-btn' + (cardVariant === 'b' ? ' is-active' : ''),
            onClick: function() { setCardVariant('b'); }
          }, 'Option B · Outlined')
        ),
        React.createElement(NowButton, { label: 'Package and download', variant: 'secondary' })
      )
    ),
    React.createElement('div', { className: 'csp-body' },
      React.createElement(NavTree, {
        expanded: expanded,
        selectedId: selectedId,
        onToggleGroup: handleToggleGroup,
        onSelectStep: setSelectedId
      }),
      React.createElement(ContentArea, {
        selectedId: selectedId,
        diagnosticRan: diagnosticRan,
        diagnosticRunning: diagnosticRunning,
        runCount: runCount,
        cardVariant: cardVariant,
        configuredMap: configuredMap,
        onRunDiagnostics: function() {
          setDiagnosticRunning(true);
          setTimeout(function() {
            setDiagnosticRunning(false);
            setRunCount(function(n) { return n + 1; });
          }, 1100);
        },
        onFixClick: selectStepAndReveal,
        onToggleConfigured: handleToggleConfigured
      })
    )
  );
}

// ─── Mount ──────────────────────────────────────────────────────────────────
injectStyles();
var rootEl = document.createElement('div');
rootEl.id = 'csp-app-root';
document.body.appendChild(rootEl);
ReactDOM.render(React.createElement(App), rootEl);
