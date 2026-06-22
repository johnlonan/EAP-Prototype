/**
 * Replica App Shell Design Tokens
 *
 * These tokens define the visual styling for the recreated workspace app shell
 * components (GlobalNavBar, WorkspaceLevel1PrimaryNavBar, WorkspaceL2TabBar,
 * WorkspaceAppShell).
 *
 * Naming convention:
 * - Standard Seismic tokens (--now-*) are used where available (fonts, font sizes)
 * - Replica-specific tokens (--replica-appshell--*) are used for recreated chrome
 *   to make it clear these are NOT official ServiceNow design system tokens
 *
 * @module tokens
 */

// ============================================
// CSS TOKENS
// ============================================
export const workspaceTokenStyles = `
:root {
  /* ============================================
     REPLICA APP SHELL TOKENS
     These are for the recreated workspace chrome,
     NOT official ServiceNow design system tokens.
     ============================================ */

  /* --- Chrome Background Colors --- */
  /* RGB triplet format allows rgba() usage: rgb(var(--replica-appshell--header-bg)) */
  --replica-appshell--header-bg: 3, 45, 66;
  --replica-appshell--header-bg-hover: 46, 81, 98;
  --replica-appshell--header-bg-active: 2, 27, 40;

  /* --- L1 Navigation Gradient Colors --- */
  --replica-appshell--l1-gradient-start: 3, 45, 66;
  --replica-appshell--l1-gradient-mid: 0, 128, 163;
  --replica-appshell--l1-gradient-end: 36, 138, 19;
  --replica-appshell--l1-button-color: 191, 197, 198;
  --replica-appshell--l1-button-selected-bg: 2, 23, 33;

  /* --- L2 Tab Bar Colors --- */
  --replica-appshell--tabbar-bg: 184, 219, 229;
  --replica-appshell--tabbar-text: 16, 23, 26;
  --replica-appshell--tabbar-divider: 136, 163, 173;
  --replica-appshell--tab-selected-bg: 255, 255, 255;

  /* --- Status/Presence Colors --- */
  --replica-appshell--presence-available: 75, 166, 107;
  --replica-appshell--presence-busy: 234, 60, 16;
  --replica-appshell--presence-away: 255, 178, 0;
  --replica-appshell--presence-offline: 135, 147, 148;

  /* --- Badge/Alert Colors --- */
  --replica-appshell--badge-bg: 234, 60, 16;
  --replica-appshell--badge-text: 255, 255, 255;

  /* --- Focus/Interactive Colors --- */
  --replica-appshell--focus-ring: 109, 177, 190;
  --replica-appshell--border-color: 136, 158, 169;

  /* --- Layout Dimensions --- */
  --replica-appshell--header-height: 52px;
  --replica-appshell--l1-nav-width: 48px;
  --replica-appshell--l2-tabbar-height: 40px;
  --replica-appshell--l1-module-size: 40px;
  --replica-appshell--l1-container-size: 48px;
  --replica-appshell--tab-height: 36px;
  --replica-appshell--icon-btn-size: 32px;

  /* --- Motion/Animation --- */
  --replica-appshell--transition-fast: 150ms ease-out;

  /* --- Border Radius --- */
  --replica-appshell--radius-sm: 4px;
  --replica-appshell--radius-md: 8px;
  --replica-appshell--radius-pill: 50px;

  /* --- Content Area --- */
  --replica-appshell--content-bg: 245, 245, 245;
}
`;

// ============================================
// STYLE INJECTION HELPER
// ============================================
let stylesInjected = false;

/**
 * Injects the workspace token CSS into the document head.
 * Safe to call multiple times - only injects once.
 */
export function injectWorkspaceTokenStyles() {
  if (stylesInjected) return;
  if (typeof document === 'undefined') return;

  const styleEl = document.createElement('style');
  styleEl.id = 'replica-appshell-tokens';
  styleEl.textContent = workspaceTokenStyles;
  document.head.appendChild(styleEl);
  stylesInjected = true;
}

/**
 * Check if tokens have been injected
 * @returns {boolean}
 */
export function areTokensInjected() {
  if (typeof document === 'undefined') return false;
  return !!document.getElementById('replica-appshell-tokens');
}
