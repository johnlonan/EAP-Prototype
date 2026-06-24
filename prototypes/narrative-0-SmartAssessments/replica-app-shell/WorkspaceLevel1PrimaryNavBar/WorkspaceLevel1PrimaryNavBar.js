/**
 * WorkspaceLevel1PrimaryNavBar.js
 *
 * A React recreation of ServiceNow's sn-canvas-toolbar component.
 * Uses a factory pattern to avoid React import path issues with Seismic/Tectonic.
 *
 * ICONS/MODULES: This component uses the native `<now-icon>` web component from
 * @servicenow/now-icon. Icons are specified by name (e.g., 'home-outline', 'inbox-fill').
 * See the ServiceNow icon library for available icons.
 *
 * @example
 * import React from '../node_modules/.pnpm/react@16.14.0/node_modules/react';
 * import '@servicenow/now-icon';  // Register icon web component
 * import { createWorkspaceLevel1PrimaryNavBar, injectWorkspaceLevel1PrimaryNavBarStyles } from '../../replica-components/workspace-level-1-primary-navigation-bar';
 *
 * const WorkspaceLevel1PrimaryNavBar = createWorkspaceLevel1PrimaryNavBar(React);
 * injectWorkspaceLevel1PrimaryNavBarStyles();
 *
 * // Define your modules (icons/buttons)
 * const modules = [
 *   // TOP GROUP: Navigation modules (radio behavior - one selected at a time)
 *   { id: 'home', label: 'Home', icon: 'home-outline', group: 'top' },
 *   { id: 'list', label: 'List', icon: 'list-outline', group: 'top' },
 *   { id: 'inbox', label: 'Inbox', icon: 'inbox-outline', group: 'top', badge: { count: 3 } },
 *
 *   // BOTTOM GROUP: Utility modules (toggle behavior)
 *   { id: 'chat', label: 'Chat', icon: 'chat-outline', group: 'bottom', presence: { status: 'available' } },
 *   { id: 'phone', label: 'Phone', icon: 'phone-outline', group: 'bottom' },
 * ];
 *
 * <WorkspaceLevel1PrimaryNavBar
 *   modules={modules}
 *   activeModuleId="home"
 *   onModuleClick={(module) => console.log('Clicked:', module)}
 * />
 *
 * @module WorkspaceLevel1PrimaryNavBar
 */

// ============================================
// CSS STYLES (Uses centralized tokens from replica-app-shell/tokens)
// ============================================
export const workspaceLevel1PrimaryNavBarStyles = `
/* ============================================
   WorkspaceLevel1PrimaryNavBar styles
   Uses --replica-appshell--* tokens
   ============================================ */

/* Main Toolbar Container */
.workspace-primary-nav {
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-template-columns: 1fr;
  width: var(--replica-appshell--l1-nav-width);
  height: 100%;
  padding: 0 0 24px 0;
  background: linear-gradient(
    180deg,
    rgb(var(--replica-appshell--l1-gradient-start)) 35%,
    rgb(var(--replica-appshell--l1-gradient-mid)) 85%,
    rgb(var(--replica-appshell--l1-gradient-end)) 100%
  );
  box-sizing: border-box;
  overflow: hidden;
}

/* ============================================
   Module Groups
   ============================================ */
.workspace-primary-nav__group {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.workspace-primary-nav__group--top {
  align-self: start;
}

.workspace-primary-nav__group--bottom {
  align-self: end;
}

/* ============================================
   Module Container
   ============================================ */
.workspace-primary-nav__module-container {
  width: var(--replica-appshell--l1-container-size);
  height: var(--replica-appshell--l1-container-size);
  padding: 4px;
  box-sizing: border-box;
}

/* ============================================
   Module Button
   ============================================ */
.workspace-primary-nav__module {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: var(--replica-appshell--l1-module-size);
  height: var(--replica-appshell--l1-module-size);
  margin: 0;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 50%;
  background-color: transparent;
  color: rgb(var(--replica-appshell--l1-button-color));
  cursor: pointer;
  box-sizing: border-box;
}

.workspace-primary-nav__module:hover {
  background-color: rgba(1, 66, 82, 0.5);
}

.workspace-primary-nav__module:active {
  box-shadow: inset 0 0 0 1px rgb(255, 255, 255);
  background-color: rgb(var(--replica-appshell--l1-button-selected-bg));
}

.workspace-primary-nav__module.is-selected {
  box-shadow: inset 0 0 0 1px rgb(255, 255, 255);
  color: rgb(255, 255, 255);
  background-color: rgb(var(--replica-appshell--l1-button-selected-bg));
}

.workspace-primary-nav__module:focus {
  outline: none;
}

.workspace-primary-nav__module:focus-visible:not(.is-selected) {
  box-shadow: 0 0 0 2px rgba(var(--replica-appshell--focus-ring), 0.6);
}

/* ============================================
   Icon Styling (now-icon web component)
   ============================================ */
.workspace-primary-nav__module now-icon {
  flex-shrink: 0;
  --now-icon--color: currentColor;
}

/* ============================================
   Badge (notification count)
   ============================================ */
.workspace-primary-nav__badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background-color: rgb(var(--replica-appshell--badge-bg));
  color: rgb(var(--replica-appshell--badge-text));
  font-size: 10px;
  font-weight: 600;
  font-family: var(--now-font-family, 'Lato', Arial, sans-serif);
  line-height: 16px;
  text-align: center;
  box-sizing: border-box;
}

/* ============================================
   Presence Indicator
   ============================================ */
.workspace-primary-nav__presence {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid rgb(var(--replica-appshell--l1-gradient-start));
  box-sizing: border-box;
}

.workspace-primary-nav__presence--available {
  background-color: rgb(var(--replica-appshell--presence-available));
}

.workspace-primary-nav__presence--busy {
  background-color: rgb(var(--replica-appshell--presence-busy));
}

.workspace-primary-nav__presence--away {
  background-color: rgb(var(--replica-appshell--presence-away));
}

.workspace-primary-nav__presence--offline {
  background-color: rgb(var(--replica-appshell--presence-offline));
}

/* ============================================
   High Contrast Mode Support
   ============================================ */
@media (forced-colors: active) {
  .workspace-primary-nav {
    border: 1px solid;
    background-color: Canvas;
    color: CanvasText;
  }

  .workspace-primary-nav__module {
    color: ButtonText;
    background-color: ButtonFace;
    border: 1px solid ButtonBorder;
  }

  .workspace-primary-nav__module:hover,
  .workspace-primary-nav__module:focus {
    background-color: HighlightText;
    border: 1px solid;
    color: Highlight;
  }

  .workspace-primary-nav__module.is-selected {
    background-color: SelectedItem;
    border: 1px solid SelectedItemText;
    color: SelectedItemText;
  }

  .workspace-primary-nav__module.is-selected:hover,
  .workspace-primary-nav__module.is-selected:focus {
    border-color: Highlight;
  }
}

`;

// ============================================
// STYLE INJECTION HELPER
// ============================================
import { injectWorkspaceTokenStyles, areTokensInjected } from '../tokens';

let stylesInjected = false;

/**
 * Injects WorkspaceLevel1PrimaryNavBar CSS into the document head.
 * Automatically injects workspace tokens if not already present.
 * Safe to call multiple times - only injects once.
 */
export function injectWorkspaceLevel1PrimaryNavBarStyles() {
  // Ensure tokens are injected first
  if (!areTokensInjected()) {
    injectWorkspaceTokenStyles();
  }

  if (stylesInjected) return;
  const styleEl = document.createElement('style');
  styleEl.id = 'workspace-level-1-primary-nav-bar-styles';
  styleEl.textContent = workspaceLevel1PrimaryNavBarStyles;
  document.head.appendChild(styleEl);
  stylesInjected = true;
}

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Creates a WorkspaceLevel1PrimaryNavBar component using the provided React instance.
 * This factory pattern avoids import path issues with Seismic/Tectonic builds.
 *
 * @param {Object} React - The React instance to use
 * @returns {React.Component} WorkspaceLevel1PrimaryNavBar component class
 *
 * @example
 * import React from '../node_modules/.pnpm/react@16.14.0/node_modules/react';
 * import { createWorkspaceLevel1PrimaryNavBar } from '../../replica-components/workspace-level-1-primary-navigation-bar';
 * const WorkspaceLevel1PrimaryNavBar = createWorkspaceLevel1PrimaryNavBar(React);
 */
export function createWorkspaceLevel1PrimaryNavBar(React) {
  /**
   * Individual module button
   *
   * Each module represents a navigation item in the toolbar.
   * Uses the native <now-icon> web component for icons.
   */
  function ModuleButton({ id, label, icon, isSelected, badge, presence, onClick }) {
    const handleClick = (e) => {
      e.preventDefault();
      if (onClick) onClick(id);
    };

    const buttonClass = 'workspace-primary-nav__module' + (isSelected ? ' is-selected' : '');

    return React.createElement('div', { className: 'workspace-primary-nav__module-container' },
      React.createElement('button', {
        id: `module-${id.toLowerCase()}`,
        type: 'button',
        className: buttonClass,
        title: label,
        'aria-label': label,
        onClick: handleClick
      },
        // Icon from @servicenow/now-icon (size="lg" matches original sn-canvas-toolbar)
        React.createElement('now-icon', { icon: icon, size: 'lg' }),

        // Badge count (for notifications)
        badge && badge.count > 0 &&
          React.createElement('span', { className: 'workspace-primary-nav__badge' }, badge.count),

        // Presence indicator (for user status)
        presence && presence.status &&
          React.createElement('span', {
            className: `workspace-primary-nav__presence workspace-primary-nav__presence--${presence.status}`
          })
      )
    );
  }

  /**
   * WorkspaceLevel1PrimaryNavBar - Main component class
   *
   * Props:
   * - modules: Array of module configuration objects
   * - activeModuleId: ID of the initially selected module (for top group)
   * - onModuleClick: Callback when a module is clicked
   *
   * Module Configuration:
   * {
   *   id: string,           // Unique identifier (required)
   *   label: string,        // Tooltip/accessible name (required)
   *   icon: string,         // Icon name from @servicenow/now-icon (required)
   *                         // Examples: 'home-outline', 'inbox-fill', 'phone-outline'
   *   group: 'top'|'bottom' // Which group the module belongs to (required)
   *   badge: { count: n },  // Optional notification badge
   *   presence: { status: 'available'|'busy'|'away'|'offline' }  // Optional presence indicator
   * }
   */
  class WorkspaceLevel1PrimaryNavBar extends React.Component {
    constructor(props) {
      super(props);
      // Support both 'modules' and legacy 'buttons' prop name
      const modules = props.modules || props.buttons || [];
      this.state = {
        // Single activeId for unified selection across all modules
        activeId: props.activeModuleId || props.activeButtonId || (modules[0]?.id) || null
      };
    }

    handleModuleClick = (id) => {
      const modules = this.props.modules || this.props.buttons || [];
      const module = modules.find(m => m.id === id);

      // Unified radio behavior - only one module selected at a time
      // Clicking the same module keeps it selected (no toggle off)
      this.setState({ activeId: id });

      // Call user's callback
      const callback = this.props.onModuleClick || this.props.onButtonClick;
      if (callback) {
        callback(module);
      }
    };

    render() {
      // Support both 'modules' and legacy 'buttons' prop name
      const modules = this.props.modules || this.props.buttons || [];
      const { activeId } = this.state;

      const topModules = modules.filter(m => m.group === 'top');
      const bottomModules = modules.filter(m => m.group === 'bottom');

      return React.createElement('nav', {
        className: 'workspace-primary-nav',
        'aria-label': 'Main Workspace Navigation'
      },
        // Top module group - navigation
        React.createElement('div', {
          className: 'workspace-primary-nav__group workspace-primary-nav__group--top',
          role: 'tablist'
        },
          topModules.map(module =>
            React.createElement(ModuleButton, {
              key: module.id,
              ...module,
              isSelected: activeId === module.id,
              onClick: this.handleModuleClick
            })
          )
        ),

        // Bottom module group - utilities (same selection behavior)
        React.createElement('div', {
          className: 'workspace-primary-nav__group workspace-primary-nav__group--bottom'
        },
          bottomModules.map(module =>
            React.createElement(ModuleButton, {
              key: module.id,
              ...module,
              isSelected: activeId === module.id,
              onClick: this.handleModuleClick
            })
          )
        )
      );
    }
  }

  // Default props
  WorkspaceLevel1PrimaryNavBar.defaultProps = {
    modules: [],
    activeModuleId: null,
    onModuleClick: null,
    // Legacy prop names for backwards compatibility
    buttons: null,
    activeButtonId: null,
    onButtonClick: null
  };

  return WorkspaceLevel1PrimaryNavBar;
}

// ============================================
// COMMON MODULE CONFIGURATIONS
// ============================================
/**
 * Pre-configured module definitions for common workspace patterns.
 * Copy and modify these for your prototype.
 *
 * Icon names use the @servicenow/now-icon naming convention:
 * - Outlined icons: 'name-outline' (e.g., 'home-outline')
 * - Filled icons: 'name-fill' (e.g., 'home-fill')
 *
 * Browse all icons: https://developer.servicenow.com/dev.do#!/reference/component/now-icon
 */
export const commonModules = {
  // Navigation modules (top group, radio behavior)
  home: { id: 'home', label: 'Home', icon: 'home-outline', group: 'top' },
  list: { id: 'list', label: 'List', icon: 'list-fill', group: 'top' },
  inbox: { id: 'inbox', label: 'Inbox', icon: 'inbox-outline', group: 'top' },
  calendar: { id: 'calendar', label: 'Calendar', icon: 'calendar-outline', group: 'top' },
  dashboard: { id: 'dashboard', label: 'Dashboard', icon: 'chart-area-outline', group: 'top' },
  search: { id: 'search', label: 'Search', icon: 'magnifying-glass-outline', group: 'top' },
  reports: { id: 'reports', label: 'Reports', icon: 'chart-bar-outline', group: 'top' },
  knowledge: { id: 'knowledge', label: 'Knowledge', icon: 'book-open-outline', group: 'top' },
  catalog: { id: 'catalog', label: 'Catalog', icon: 'shopping-cart-outline', group: 'top' },
  tasks: { id: 'tasks', label: 'Tasks', icon: 'clipboard-check-outline', group: 'top' },
  explore: { id: 'explore', label: 'Explore', icon: 'compass-outline', group: 'top' },
  activity: { id: 'activity', label: 'Activity', icon: 'activity-outline', group: 'top' },
  agents: { id: 'agents', label: 'Agents', icon: 'user-group-outline', group: 'top' },
  cases: { id: 'cases', label: 'Cases', icon: 'briefcase-outline', group: 'top' },
  incidents: { id: 'incidents', label: 'Incidents', icon: 'exclamation-triangle-outline', group: 'top' },

  // Utility modules (bottom group, toggle behavior)
  chat: { id: 'chat', label: 'Chat', icon: 'chat-outline', group: 'bottom' },
  phone: { id: 'phone', label: 'Phone', icon: 'phone-outline', group: 'bottom' },
  settings: { id: 'settings', label: 'Settings', icon: 'gear-outline', group: 'bottom' },
  help: { id: 'help', label: 'Help', icon: 'circle-question-outline', group: 'bottom' },
  notifications: { id: 'notifications', label: 'Notifications', icon: 'bell-outline', group: 'bottom' },
};

/**
 * Helper to create a module with a badge
 * @param {Object} module - Base module configuration
 * @param {number} count - Badge count
 */
export function withBadge(module, count) {
  return { ...module, badge: { count } };
}

/**
 * Helper to create a module with presence indicator
 * @param {Object} module - Base module configuration
 * @param {string} status - 'available' | 'busy' | 'away' | 'offline'
 */
export function withPresence(module, status) {
  return { ...module, presence: { status } };
}
