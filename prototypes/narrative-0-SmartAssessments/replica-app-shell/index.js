/**
 * Replica App Shell Components
 *
 * React recreations of ServiceNow UI components that cannot be used
 * outside of UI Builder. These are designed to work alongside native
 * Seismic components for rapid prototyping.
 *
 * All components use a factory pattern - create them by passing React:
 *
 * @example
 * import React from '../node_modules/.pnpm/react@16.14.0/node_modules/react';
 * import '@servicenow/now-icon';
 * import '@servicenow/now-avatar';
 * import {
 *   createWorkspaceAppShell,
 *   injectWorkspaceAppShellStyles
 * } from '../../replica-components';
 *
 * const WorkspaceAppShell = createWorkspaceAppShell(React);
 * injectWorkspaceAppShellStyles();
 *
 * // Or use individual components:
 * import {
 *   createGlobalNavBar,
 *   createWorkspaceLevel1PrimaryNavBar,
 *   createWorkspaceL2TabBar
 * } from '../../replica-components';
 */

// Design tokens for the recreated app shell
export {
  workspaceTokenStyles,
  injectWorkspaceTokenStyles,
  areTokensInjected
} from '../tokens';

// GlobalNavBar - Workspace header (L0)
export {
  createGlobalNavBar,
  injectGlobalNavBarStyles,
  globalNavBarStyles
} from './GlobalNavBar';

// WorkspaceLevel1PrimaryNavBar - Left navigation toolbar (L1)
export {
  createWorkspaceLevel1PrimaryNavBar,
  injectWorkspaceLevel1PrimaryNavBarStyles,
  workspaceLevel1PrimaryNavBarStyles,
  commonModules,
  withBadge,
  withPresence
} from './WorkspaceLevel1PrimaryNavBar';

// WorkspaceL2TabBar - Horizontal tab bar (L2)
export {
  createWorkspaceL2TabBar,
  injectWorkspaceL2TabBarStyles,
  workspaceL2TabBarStyles
} from './WorkspaceL2TabBar';

// WorkspaceAppShell - Convenience wrapper (L0 + L1 + L2)
export {
  createWorkspaceAppShell,
  injectWorkspaceAppShellStyles,
  workspaceAppShellStyles
} from './WorkspaceAppShell';
