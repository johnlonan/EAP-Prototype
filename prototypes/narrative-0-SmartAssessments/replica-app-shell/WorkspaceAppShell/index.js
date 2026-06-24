/**
 * WorkspaceAppShell
 *
 * A convenience wrapper that composes all workspace shell components
 * (GlobalNavBar + WorkspaceLevel1PrimaryNavBar + WorkspaceL2TabBar)
 * into a single, easy-to-use component.
 *
 * @example
 * import { createWorkspaceAppShell, injectWorkspaceAppShellStyles } from '../../replica-components/WorkspaceAppShell';
 *
 * const WorkspaceAppShell = createWorkspaceAppShell(React);
 * injectWorkspaceAppShellStyles();
 */

export {
  createWorkspaceAppShell,
  injectWorkspaceAppShellStyles,
  workspaceAppShellStyles
} from './WorkspaceAppShell';
