/**
 * GlobalNavBar Component
 *
 * A React recreation of the ServiceNow global navigation bar.
 * Uses a factory pattern to work with any React version without import path issues.
 *
 * @example
 * // In your demo file:
 * import React from '../node_modules/.pnpm/react@16.14.0/node_modules/react';
 * import { createGlobalNavBar, injectGlobalNavBarStyles } from '../../replica-components/GlobalNavBar';
 *
 * // Create the component by passing React
 * const GlobalNavBar = createGlobalNavBar(React);
 *
 * // Inject styles once (safe to call multiple times)
 * injectGlobalNavBarStyles();
 *
 * // Then use like any React component:
 * function App() {
 *   return (
 *     <GlobalNavBar
 *       title="My Workspace"
 *       userName="Demo User"
 *     />
 *   );
 * }
 */

export { createGlobalNavBar, injectGlobalNavBarStyles, globalNavBarStyles } from './GlobalNavBar';
