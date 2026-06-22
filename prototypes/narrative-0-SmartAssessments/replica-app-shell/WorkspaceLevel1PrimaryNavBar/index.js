/**
 * workspace-level-1-primary-navigation-bar
 *
 * A React recreation of ServiceNow's sn-canvas-toolbar component.
 * Uses a factory pattern to work with any React version without import path issues.
 *
 * @example
 * // In your demo file:
 * import React from '../node_modules/.pnpm/react@16.14.0/node_modules/react';
 * import '@servicenow/now-icon';  // Required for icons
 * import { createWorkspaceLevel1PrimaryNavBar, injectWorkspaceLevel1PrimaryNavBarStyles } from '../../replica-components/workspace-level-1-primary-navigation-bar';
 *
 * // Create the component by passing React
 * const WorkspaceLevel1PrimaryNavBar = createWorkspaceLevel1PrimaryNavBar(React);
 *
 * // Inject styles once (safe to call multiple times)
 * injectWorkspaceLevel1PrimaryNavBarStyles();
 *
 * // Then use like any React component:
 * function App() {
 *   return (
 *     <WorkspaceLevel1PrimaryNavBar
 *       modules={[
 *         { id: 'home', label: 'Home', icon: 'home-outline', group: 'top' },
 *         { id: 'list', label: 'List', icon: 'list-outline', group: 'top' },
 *         { id: 'phone', label: 'Phone', icon: 'phone-outline', group: 'bottom' }
 *       ]}
 *       activeModuleId="home"
 *       onModuleClick={(module) => console.log('Clicked:', module)}
 *     />
 *   );
 * }
 */

export {
  createWorkspaceLevel1PrimaryNavBar,
  injectWorkspaceLevel1PrimaryNavBarStyles,
  workspaceLevel1PrimaryNavBarStyles,
  // Module configuration helpers
  commonModules,
  withBadge,
  withPresence
} from './WorkspaceLevel1PrimaryNavBar';
