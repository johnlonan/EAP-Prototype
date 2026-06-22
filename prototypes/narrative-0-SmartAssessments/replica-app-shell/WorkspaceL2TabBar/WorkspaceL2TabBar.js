/**
 * WorkspaceL2TabBar.js
 *
 * A React recreation of ServiceNow's canvas-tabbar component (L2 tabs).
 * Uses a factory pattern to avoid React import path issues with Seismic/Tectonic.
 *
 * USAGE: This component renders the horizontal tab bar that appears below the
 * global nav (L0) and beside the L1 navigation bar. Tabs can be closeable,
 * show dirty state indicators, and have badges.
 *
 * @example
 * import React from '../node_modules/.pnpm/react@16.14.0/node_modules/react';
 * import '@servicenow/now-icon';
 * import { createWorkspaceL2TabBar, injectWorkspaceL2TabBarStyles } from '../../replica-components/WorkspaceL2TabBar';
 *
 * const WorkspaceL2TabBar = createWorkspaceL2TabBar(React);
 * injectWorkspaceL2TabBarStyles();
 *
 * const tabs = [
 *   { id: 'home', label: 'Home', canClose: false },  // Primary tab (linked to L1 module)
 *   { id: 'inc001', label: 'INC0010001', icon: 'document-outline', isDirty: true },
 *   { id: 'inc002', label: 'INC0010002', badge: { count: 3 } },
 * ];
 *
 * <WorkspaceL2TabBar
 *   tabs={tabs}
 *   activeTabId="home"
 *   onTabClick={(tab) => console.log('Tab clicked:', tab)}
 *   onTabClose={(tab) => console.log('Tab closed:', tab)}
 *   newTabMenu={[{ id: 'incident', label: 'New Incident', icon: 'document-outline' }]}
 *   onNewTabClick={(item) => console.log('New tab:', item)}
 * />
 *
 * @module WorkspaceL2TabBar
 */

// ============================================
// CSS STYLES (Uses centralized tokens from replica-app-shell/tokens)
// ============================================
export const workspaceL2TabBarStyles = `
/* ============================================
   WorkspaceL2TabBar styles
   Uses --replica-appshell--* tokens and --now-font-family
   ============================================ */

/* Main Tab Bar Container */
.workspace-l2-tabbar {
  position: relative;
  display: flex;
  align-items: flex-end;
  width: 100%;
  height: calc(var(--replica-appshell--tab-height) + 4px);
  padding-top: 4px;
  background: rgb(var(--replica-appshell--tabbar-bg));
  box-sizing: border-box;
  overflow: visible;
}

.workspace-l2-tabbar__tabs-container {
  display: flex;
  align-items: flex-end;
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  overflow: hidden;
}

.workspace-l2-tabbar__tabs {
  display: flex;
  align-items: flex-end;
  gap: var(--tab-gap);
  height: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow: hidden;
}

/* ============================================
   Individual Tab
   ============================================ */
.workspace-l2-tabbar__tab {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 120px;
  max-width: 240px;
  height: var(--replica-appshell--tab-height);
  padding: 0 28px 0 8px;
  background: rgb(var(--replica-appshell--tabbar-bg));
  border: none;
  border-top-left-radius: var(--replica-appshell--radius-md);
  border-top-right-radius: var(--replica-appshell--radius-md);
  color: rgb(var(--replica-appshell--tabbar-text));
  font-family: var(--now-font-family, 'Lato', Arial, sans-serif);
  font-size: var(--now-font-size--md1, 1rem);
  font-weight: 525;
  cursor: pointer;
  user-select: none;
  box-sizing: border-box;
  transition: background-color var(--replica-appshell--transition-fast);
}

.workspace-l2-tabbar__tab:hover {
  background: rgba(255, 255, 255, 0.3);
}

.workspace-l2-tabbar__tab.is-selected {
  background: rgb(var(--replica-appshell--tab-selected-bg));
  font-weight: 525;
}

.workspace-l2-tabbar__tab:focus {
  outline: none;
}

.workspace-l2-tabbar__tab:focus-visible {
  box-shadow: inset 0 0 0 2px rgba(var(--replica-appshell--focus-ring), 0.6);
}

/* Tab without close button (primary tab) */
.workspace-l2-tabbar__tab.no-close {
  padding: 0 12px 0 8px;
}

/* Vertical divider between tabs */
.workspace-l2-tabbar__tab-wrapper {
  position: relative;
  display: flex;
  align-items: flex-end;
}

.workspace-l2-tabbar__tab-wrapper::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 20px;
  background: rgb(var(--replica-appshell--tabbar-divider));
}

/* Hide divider after the selected/active tab */
.workspace-l2-tabbar__tab-wrapper:has(.is-selected)::after {
  display: none;
}

/* Hide divider after the tab immediately before the selected tab */
.workspace-l2-tabbar__tab-wrapper:has(+ .workspace-l2-tabbar__tab-wrapper .is-selected)::after {
  display: none;
}

/* Hide divider after a hovered tab */
.workspace-l2-tabbar__tab-wrapper:has(.workspace-l2-tabbar__tab:hover)::after {
  display: none;
}

/* Hide divider after the tab immediately before a hovered tab */
.workspace-l2-tabbar__tab-wrapper:has(+ .workspace-l2-tabbar__tab-wrapper .workspace-l2-tabbar__tab:hover)::after {
  display: none;
}

/* ============================================
   Tab Content
   ============================================ */
.workspace-l2-tabbar__tab-content {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
  overflow: hidden;
}


/* Tab icon */
.workspace-l2-tabbar__tab-icon {
  flex-shrink: 0;
  color: rgb(35, 46, 51);
}

/* Tab label */
.workspace-l2-tabbar__tab-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ============================================
   Badge
   ============================================ */
.workspace-l2-tabbar__badge {
  flex-shrink: 0;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  margin-left: 4px;
  border-radius: 8px;
  background: rgb(var(--replica-appshell--badge-bg));
  color: rgb(var(--replica-appshell--badge-text));
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
  text-align: center;
}

/* ============================================
   Close Button
   ============================================ */
.workspace-l2-tabbar__close-btn {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: transparent;
  color: rgb(35, 46, 51);
  cursor: pointer;
  opacity: 1;
  transition: color var(--replica-appshell--transition-fast);
}

.workspace-l2-tabbar__close-btn:hover {
  color: rgb(var(--replica-appshell--tabbar-text));
}

.workspace-l2-tabbar__close-btn:focus {
  outline: none;
  opacity: 1;
}

.workspace-l2-tabbar__close-btn:focus-visible {
  box-shadow: 0 0 0 2px rgba(var(--replica-appshell--focus-ring), 0.6);
  border-radius: 2px;
}

/* ============================================
   Actions Container (Overflow + Add)
   ============================================ */
.workspace-l2-tabbar__actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  height: 100%;
  padding: 0 8px;
  gap: 4px;
}

/* Overflow button */
.workspace-l2-tabbar__overflow-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--replica-appshell--icon-btn-size);
  height: var(--replica-appshell--icon-btn-size);
  padding: 0;
  border: none;
  border-radius: 0;
  background: rgb(var(--replica-appshell--tabbar-bg));
  color: rgb(var(--replica-appshell--tabbar-text));
  cursor: pointer;
  transition: background-color var(--replica-appshell--transition-fast);
}

.workspace-l2-tabbar__overflow-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.workspace-l2-tabbar__overflow-btn:focus {
  outline: none;
}

.workspace-l2-tabbar__overflow-btn:focus-visible {
  box-shadow: 0 0 0 2px rgba(var(--replica-appshell--focus-ring), 0.6);
}

/* Add button */
.workspace-l2-tabbar__add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--replica-appshell--icon-btn-size);
  height: var(--replica-appshell--icon-btn-size);
  padding: 0;
  border: none;
  border-radius: 0;
  background: rgb(var(--replica-appshell--tabbar-bg));
  color: rgb(var(--replica-appshell--tabbar-text));
  cursor: pointer;
  transition: background-color var(--replica-appshell--transition-fast);
}

.workspace-l2-tabbar__add-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.workspace-l2-tabbar__add-btn:focus {
  outline: none;
}

.workspace-l2-tabbar__add-btn:focus-visible {
  box-shadow: 0 0 0 2px rgba(var(--replica-appshell--focus-ring), 0.6);
}

/* ============================================
   Overflow Menu (Dropdown)
   ============================================ */
.workspace-l2-tabbar__overflow-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  min-width: 200px;
  max-height: 300px;
  padding: 8px 0;
  background: rgb(255, 255, 255);
  border: 1px solid rgb(217, 217, 217);
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  list-style: none;
  margin: 0;
}

.workspace-l2-tabbar__overflow-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: rgb(var(--replica-appshell--tabbar-text));
  font-family: var(--now-font-family, 'Lato', Arial, sans-serif);
  font-size: var(--now-font-size--md, 0.875rem);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--replica-appshell--transition-fast);
}

.workspace-l2-tabbar__overflow-menu-item:hover {
  background: rgb(243, 243, 243);
}

.workspace-l2-tabbar__overflow-menu-item:focus {
  outline: none;
  background: rgb(243, 243, 243);
}

/* ============================================
   New Tab Menu (Dropdown)
   ============================================ */
.workspace-l2-tabbar__new-tab-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 10000;
  min-width: 200px;
  max-height: 300px;
  padding: 8px 0;
  background: rgb(255, 255, 255);
  border: 1px solid rgb(217, 217, 217);
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  list-style: none;
  margin: 0;
}

.workspace-l2-tabbar__new-tab-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: rgb(var(--replica-appshell--tabbar-text));
  font-family: var(--now-font-family, 'Lato', Arial, sans-serif);
  font-size: var(--now-font-size--md, 0.875rem);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--replica-appshell--transition-fast);
}

.workspace-l2-tabbar__new-tab-menu-item:hover {
  background: rgb(243, 243, 243);
}

.workspace-l2-tabbar__new-tab-menu-item:focus {
  outline: none;
  background: rgb(243, 243, 243);
}

/* ============================================
   High Contrast Mode Support
   ============================================ */
@media (forced-colors: active) {
  .workspace-l2-tabbar {
    border: 1px solid;
    background: Canvas;
  }

  .workspace-l2-tabbar__tab {
    border: 1px solid ButtonBorder;
    color: ButtonText;
    background: ButtonFace;
  }

  .workspace-l2-tabbar__tab:hover,
  .workspace-l2-tabbar__tab:focus {
    border-color: Highlight;
    color: Highlight;
    background: HighlightText;
  }

  .workspace-l2-tabbar__tab.is-selected {
    border-color: SelectedItem;
    color: SelectedItemText;
    background: SelectedItem;
  }

  .workspace-l2-tabbar__close-btn,
  .workspace-l2-tabbar__overflow-btn,
  .workspace-l2-tabbar__add-btn {
    color: ButtonText;
    background: ButtonFace;
    border: 1px solid ButtonBorder;
  }

  .workspace-l2-tabbar__close-btn:hover,
  .workspace-l2-tabbar__close-btn:focus,
  .workspace-l2-tabbar__overflow-btn:hover,
  .workspace-l2-tabbar__overflow-btn:focus,
  .workspace-l2-tabbar__add-btn:hover,
  .workspace-l2-tabbar__add-btn:focus {
    border-color: Highlight;
    color: Highlight;
    background: HighlightText;
  }
}
`;

// ============================================
// STYLE INJECTION HELPER
// ============================================
import { injectWorkspaceTokenStyles, areTokensInjected } from '../tokens';

let stylesInjected = false;

/**
 * Injects WorkspaceL2TabBar CSS into the document head.
 * Automatically injects workspace tokens if not already present.
 * Safe to call multiple times - only injects once.
 */
export function injectWorkspaceL2TabBarStyles() {
  // Ensure tokens are injected first
  if (!areTokensInjected()) {
    injectWorkspaceTokenStyles();
  }

  if (stylesInjected) return;
  const styleEl = document.createElement('style');
  styleEl.id = 'workspace-l2-tabbar-styles';
  styleEl.textContent = workspaceL2TabBarStyles;
  document.head.appendChild(styleEl);
  stylesInjected = true;
}

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Creates a WorkspaceL2TabBar component using the provided React instance.
 * This factory pattern avoids import path issues with Seismic/Tectonic builds.
 *
 * @param {Object} React - The React instance to use
 * @returns {React.Component} WorkspaceL2TabBar component class
 */
export function createWorkspaceL2TabBar(React) {
  /**
   * Individual Tab component
   */
  function Tab({ tab, isSelected, onTabClick, onTabClose }) {
    const { id, label, icon, canClose = true, isDirty, badge } = tab;

    const handleClick = (e) => {
      e.preventDefault();
      if (onTabClick) onTabClick(tab);
    };

    const handleClose = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onTabClose) onTabClose(tab);
    };

    const handleKeyUp = (e) => {
      if (e.keyCode === 13 || e.keyCode === 32) {
        handleClick(e);
      }
    };

    const handleCloseKeyUp = (e) => {
      if (e.keyCode === 13 || e.keyCode === 32) {
        handleClose(e);
      }
    };

    let className = 'workspace-l2-tabbar__tab';
    if (isSelected) className += ' is-selected';
    if (!canClose) className += ' no-close';

    return React.createElement('li', { className: 'workspace-l2-tabbar__tab-wrapper' },
      React.createElement('button', {
        type: 'button',
        className: className,
        role: 'tab',
        'aria-selected': isSelected ? 'true' : 'false',
        'aria-label': label,
        tabIndex: isSelected ? '0' : '-1',
        onClick: handleClick,
        onKeyUp: handleKeyUp
      },
        // Tab content
        React.createElement('div', { className: 'workspace-l2-tabbar__tab-content' },
          // Icon (if provided)
          icon && React.createElement('now-icon', {
            icon: icon,
            size: 'sm',
            className: 'workspace-l2-tabbar__tab-icon'
          }),

          // Label
          React.createElement('span', { className: 'workspace-l2-tabbar__tab-label' }, label),

          // Badge (if provided)
          badge && badge.count > 0 && React.createElement('span', {
            className: 'workspace-l2-tabbar__badge'
          }, badge.count > 99 ? '99+' : badge.count)
        ),

        // Close button
        canClose && React.createElement('button', {
          type: 'button',
          className: 'workspace-l2-tabbar__close-btn',
          'aria-label': `Close ${label}`,
          onClick: handleClose,
          onKeyUp: handleCloseKeyUp
        },
          React.createElement('now-icon', { icon: 'close-outline', size: 'sm' })
        )
      )
    );
  }

  /**
   * WorkspaceL2TabBar - Main component class
   *
   * Props:
   * - tabs: Array of tab configuration objects
   * - activeTabId: ID of the currently selected tab
   * - onTabClick: Callback when a tab is clicked
   * - onTabClose: Callback when a tab's close button is clicked
   * - newTabMenu: Array of menu items for the "+" button dropdown
   * - onNewTabClick: Callback when a new tab menu item is clicked
   * - showOverflow: Whether to show overflow menu (default: auto based on width)
   * - showAddButton: Whether to show the "+" add button (default: true if newTabMenu provided)
   *
   * Tab Configuration:
   * {
   *   id: string,           // Unique identifier (required)
   *   label: string,        // Tab label text (required)
   *   icon?: string,        // Optional icon name from @servicenow/now-icon
   *   canClose?: boolean,   // Whether tab can be closed (default: true)
   *   isDirty?: boolean,    // Shows unsaved indicator
   *   badge?: { count: n }  // Optional notification badge
   * }
   *
   * New Tab Menu Item:
   * {
   *   id: string,           // Unique identifier
   *   label: string,        // Menu item label
   *   icon?: string         // Optional icon
   * }
   */
  class WorkspaceL2TabBar extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        activeTabId: props.activeTabId || (props.tabs && props.tabs[0]?.id) || null,
        showOverflowMenu: false,
        showNewTabMenu: false,
        visibleTabCount: props.tabs ? props.tabs.length : 0,
        overflowTabs: []
      };
      this.tabBarRef = null;
      this.tabsContainerRef = null;
      this.actionsRef = null;
    }

    componentDidMount() {
      this.calculateVisibleTabs();
      window.addEventListener('resize', this.handleResize);
      document.addEventListener('click', this.handleDocumentClick);
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.handleResize);
      document.removeEventListener('click', this.handleDocumentClick);
    }

    componentDidUpdate(prevProps) {
      if (prevProps.tabs !== this.props.tabs) {
        this.calculateVisibleTabs();
      }
      if (prevProps.activeTabId !== this.props.activeTabId) {
        this.setState({ activeTabId: this.props.activeTabId });
      }
    }

    handleResize = () => {
      this.calculateVisibleTabs();
    };

    handleDocumentClick = (e) => {
      // Close menus when clicking outside
      if (this.state.showOverflowMenu || this.state.showNewTabMenu) {
        const isInsideOverflow = e.target.closest('.workspace-l2-tabbar__overflow-btn');
        const isInsideOverflowMenu = e.target.closest('.workspace-l2-tabbar__overflow-menu');
        const isInsideAdd = e.target.closest('.workspace-l2-tabbar__add-btn');
        const isInsideNewTabMenu = e.target.closest('.workspace-l2-tabbar__new-tab-menu');

        if (!isInsideOverflow && !isInsideOverflowMenu) {
          this.setState({ showOverflowMenu: false });
        }
        if (!isInsideAdd && !isInsideNewTabMenu) {
          this.setState({ showNewTabMenu: false });
        }
      }
    };

    calculateVisibleTabs = () => {
      const tabs = this.props.tabs || [];
      if (!this.tabsContainerRef || tabs.length === 0) {
        this.setState({ visibleTabCount: tabs.length, overflowTabs: [] });
        return;
      }

      const containerWidth = this.tabsContainerRef.offsetWidth;
      const minTabWidth = 120; // --tab-min-width
      const tabGap = 1; // --tab-gap
      const actionsWidth = 80; // Space for overflow + add buttons

      const availableWidth = containerWidth - actionsWidth;
      const maxVisibleTabs = Math.max(1, Math.floor(availableWidth / (minTabWidth + tabGap)));

      const visibleCount = Math.min(tabs.length, maxVisibleTabs);
      const overflowTabs = tabs.slice(visibleCount);

      this.setState({
        visibleTabCount: visibleCount,
        overflowTabs: overflowTabs
      });
    };

    handleTabClick = (tab) => {
      this.setState({ activeTabId: tab.id });
      if (this.props.onTabClick) {
        this.props.onTabClick(tab);
      }
    };

    handleTabClose = (tab) => {
      if (this.props.onTabClose) {
        this.props.onTabClose(tab);
      }
    };

    toggleOverflowMenu = (e) => {
      e.stopPropagation();
      this.setState(state => ({
        showOverflowMenu: !state.showOverflowMenu,
        showNewTabMenu: false
      }));
    };

    toggleNewTabMenu = (e) => {
      e.stopPropagation();
      this.setState(state => ({
        showNewTabMenu: !state.showNewTabMenu,
        showOverflowMenu: false
      }));
    };

    handleOverflowTabClick = (tab) => {
      this.handleTabClick(tab);
      this.setState({ showOverflowMenu: false });
    };

    handleNewTabItemClick = (item) => {
      if (this.props.onNewTabClick) {
        this.props.onNewTabClick(item);
      }
      this.setState({ showNewTabMenu: false });
    };

    render() {
      const tabs = this.props.tabs || [];
      const { visibleTabCount, overflowTabs, showOverflowMenu, showNewTabMenu } = this.state;
      // Use props.activeTabId directly when provided (controlled mode) to avoid flicker
      const activeTabId = this.props.activeTabId != null ? this.props.activeTabId : this.state.activeTabId;
      const { newTabMenu } = this.props;

      const visibleTabs = tabs.slice(0, visibleTabCount);
      const hasOverflow = overflowTabs.length > 0;
      const showAddButton = newTabMenu && newTabMenu.length > 0;

      return React.createElement('div', {
        className: 'workspace-l2-tabbar',
        ref: (el) => { this.tabBarRef = el; },
        role: 'tablist',
        'aria-label': 'Workspace tabs'
      },
        // Tabs container
        React.createElement('div', {
          className: 'workspace-l2-tabbar__tabs-container',
          ref: (el) => { this.tabsContainerRef = el; }
        },
          React.createElement('ul', { className: 'workspace-l2-tabbar__tabs' },
            visibleTabs.map(tab =>
              React.createElement(Tab, {
                key: tab.id,
                tab: tab,
                isSelected: activeTabId === tab.id,
                onTabClick: this.handleTabClick,
                onTabClose: this.handleTabClose
              })
            )
          )
        ),

        // Actions container (overflow + add buttons)
        React.createElement('div', {
          className: 'workspace-l2-tabbar__actions',
          ref: (el) => { this.actionsRef = el; }
        },
          // Overflow button (only show when tabs overflow)
          hasOverflow && React.createElement('div', { style: { position: 'relative' } },
            React.createElement('button', {
              type: 'button',
              className: 'workspace-l2-tabbar__overflow-btn',
              'aria-label': 'More tabs',
              'aria-expanded': showOverflowMenu ? 'true' : 'false',
              onClick: this.toggleOverflowMenu
            },
              React.createElement('now-icon', { icon: 'ellipsis-h-fill', size: 'md' })
            ),

            // Overflow menu dropdown
            showOverflowMenu && React.createElement('ul', {
              className: 'workspace-l2-tabbar__overflow-menu'
            },
              overflowTabs.map(tab =>
                React.createElement('li', { key: tab.id },
                  React.createElement('button', {
                    type: 'button',
                    className: 'workspace-l2-tabbar__overflow-menu-item',
                    onClick: () => this.handleOverflowTabClick(tab)
                  },
                    tab.icon && React.createElement('now-icon', { icon: tab.icon, size: 'md' }),
                    React.createElement('span', null, tab.label)
                  )
                )
              )
            )
          ),

          // More options button (always visible, no action for now)
          React.createElement('button', {
            type: 'button',
            className: 'workspace-l2-tabbar__add-btn',
            'aria-label': 'More options'
          },
            React.createElement('now-icon', { icon: 'ellipsis-h-fill', size: 'md' })
          )
        )
      );
    }
  }

  // Default props
  WorkspaceL2TabBar.defaultProps = {
    tabs: [],
    activeTabId: null,
    onTabClick: null,
    onTabClose: null,
    newTabMenu: null,
    onNewTabClick: null
  };

  return WorkspaceL2TabBar;
}
