/**
 * WorkspaceAppShell.js
 *
 * A convenience wrapper that composes all workspace shell components:
 * - L0: GlobalNavBar (header)
 * - L1: WorkspaceLevel1PrimaryNavBar (left nav)
 * - L2: WorkspaceL2TabBar (tabs)
 *
 * This provides a one-component setup for rapid prototyping.
 *
 * Supports both CONTROLLED and UNCONTROLLED modes:
 * - Controlled: Pass tabs, activeTabId, and handle all callbacks yourself
 * - Uncontrolled: Don't pass tabs, let the shell manage state internally
 *
 * @module WorkspaceAppShell
 */

// Import component factories
import { createGlobalNavBar, injectGlobalNavBarStyles } from '../GlobalNavBar';
import { createWorkspaceLevel1PrimaryNavBar, injectWorkspaceLevel1PrimaryNavBarStyles } from '../WorkspaceLevel1PrimaryNavBar';
import { createWorkspaceL2TabBar, injectWorkspaceL2TabBarStyles } from '../WorkspaceL2TabBar';
import { injectWorkspaceTokenStyles, areTokensInjected } from '../tokens';

// ============================================
// CSS STYLES (Uses centralized tokens from replica-app-shell/tokens)
// ============================================
export const workspaceAppShellStyles = `
/* ============================================
   WorkspaceAppShell Layout
   Uses --replica-appshell--* layout tokens
   ============================================ */
.workspace-app-shell {
  min-height: 100vh;
  background: rgb(var(--replica-appshell--content-bg));
}

/* Header (L0) - fixed at top */
.workspace-app-shell__header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: var(--replica-appshell--header-height);
}

/* Left Nav (L1) - fixed below header */
.workspace-app-shell__nav {
  position: fixed;
  top: var(--replica-appshell--header-height);
  left: 0;
  bottom: 0;
  width: var(--replica-appshell--l1-nav-width);
  z-index: 999;
}

/* Tab Bar (L2) - fixed below header, right of nav */
.workspace-app-shell__tabbar {
  position: fixed;
  top: var(--replica-appshell--header-height);
  left: var(--replica-appshell--l1-nav-width);
  right: 0;
  z-index: 998;
  height: var(--replica-appshell--l2-tabbar-height);
}

/* Content area - fills remaining viewport */
.workspace-app-shell__content {
  position: fixed;
  top: calc(var(--replica-appshell--header-height) + var(--replica-appshell--l2-tabbar-height));
  left: var(--replica-appshell--l1-nav-width);
  right: 0;
  bottom: 0;
  overflow: auto;
  background: rgb(var(--replica-appshell--content-bg));
}

/* Page wrapper - ensures pages fill content area */
.workspace-app-shell__page {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

/* Variant without tabs */
.workspace-app-shell--no-tabs .workspace-app-shell__content {
  top: var(--replica-appshell--header-height);
}

.workspace-app-shell--no-tabs .workspace-app-shell__tabbar {
  display: none;
}
`;

// ============================================
// STYLE INJECTION HELPER
// ============================================
let stylesInjected = false;

/**
 * Injects all WorkspaceAppShell CSS into the document head.
 * This also injects styles for all sub-components.
 * Safe to call multiple times - only injects once.
 */
export function injectWorkspaceAppShellStyles() {
  if (stylesInjected) return;

  // Ensure tokens are injected first (sub-components also check, but this is explicit)
  if (!areTokensInjected()) {
    injectWorkspaceTokenStyles();
  }

  // Inject sub-component styles (they will skip token injection since it's already done)
  injectGlobalNavBarStyles();
  injectWorkspaceLevel1PrimaryNavBarStyles();
  injectWorkspaceL2TabBarStyles();

  // Inject shell-specific styles
  const styleEl = document.createElement('style');
  styleEl.id = 'workspace-app-shell-styles';
  styleEl.textContent = workspaceAppShellStyles;
  document.head.appendChild(styleEl);

  stylesInjected = true;
}

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Creates a WorkspaceAppShell component using the provided React instance.
 *
 * @param {Object} React - The React instance to use
 * @returns {React.Component} WorkspaceAppShell component class
 */
export function createWorkspaceAppShell(React) {
  // Create sub-components using the same React instance
  const GlobalNavBar = createGlobalNavBar(React);
  const WorkspaceLevel1PrimaryNavBar = createWorkspaceLevel1PrimaryNavBar(React);
  const WorkspaceL2TabBar = createWorkspaceL2TabBar(React);

  /**
   * WorkspaceAppShell - Main component class
   *
   * PAGE-BASED MODE (simplest - recommended):
   * Add a `page` property to modules and tabs. The shell handles all routing automatically.
   * Pages receive a `shell` prop with openTab, closeTab, and switchModule methods.
   *
   * CONTROLLED MODE (for complex apps):
   * Pass tabs, activeTabId, and handle onTabClick, onTabClose, onNewTabClick yourself.
   * The shell will just render what you give it.
   *
   * UNCONTROLLED MODE (for simple prototypes):
   * Don't pass tabs prop. The shell will auto-generate tabs from module selection.
   */
  class WorkspaceAppShell extends React.Component {
    constructor(props) {
      super(props);

      // Determine if we're in controlled mode
      const isControlled = props.tabs != null;

      if (!isControlled) {
        // Uncontrolled mode: manage internal state
        const modules = props.modules || [];
        const initialModuleId = props.activeModuleId || (modules[0]?.id) || null;
        const initialModule = modules.find(m => m.id === initialModuleId);
        const initialTabs = this.generateTabsFromModule(initialModuleId, modules);

        this.state = {
          activeModuleId: initialModuleId,
          tabs: initialTabs,
          activeTabId: initialTabs[0]?.id || null
        };
      } else {
        // Controlled mode: minimal internal state
        this.state = {
          activeModuleId: props.activeModuleId || (props.modules?.[0]?.id) || null
        };
      }

      // Create shell API for page components
      this.shellAPI = {
        openTab: this.openTab,
        closeTab: this.closeTab,
        switchModule: this.switchModule
      };
    }

    /**
     * Check if component is in controlled mode
     */
    isControlled() {
      return this.props.tabs != null;
    }

    /**
     * Generate a primary tab from the selected module (uncontrolled mode only)
     */
    generateTabsFromModule(moduleId, modules) {
      const module = modules.find(m => m.id === moduleId);
      if (!module) return [];

      return [{
        id: `${moduleId}-primary`,
        label: module.label,
        icon: module.icon,
        canClose: false,
        page: module.page,
        pageProps: module.pageProps
      }];
    }

    /**
     * Shell API: Open a new tab programmatically
     * @param {Object} tabConfig - Tab configuration
     * @param {string} tabConfig.id - Unique tab ID
     * @param {string} tabConfig.label - Tab label
     * @param {string} [tabConfig.icon] - Icon name
     * @param {React.Component} [tabConfig.page] - Page component to render
     * @param {Object} [tabConfig.pageProps] - Props to pass to the page component
     * @param {boolean} [tabConfig.canClose=true] - Whether tab can be closed
     */
    openTab = (tabConfig) => {
      const { id, label, icon, page, pageProps, canClose = true, ...rest } = tabConfig;

      // Check if tab already exists
      const existingTab = this.state.tabs.find(t => t.id === id);
      if (existingTab) {
        this.setState({ activeTabId: id });
        return;
      }

      const newTab = {
        id,
        label,
        icon,
        page,
        pageProps,
        canClose,
        ...rest
      };

      this.setState(state => ({
        tabs: [...(state.tabs || []), newTab],
        activeTabId: id
      }));

      // Call parent callback if provided
      if (this.props.onTabOpen) {
        this.props.onTabOpen(newTab);
      }
    };

    /**
     * Shell API: Close a tab programmatically
     * @param {string} tabId - ID of tab to close
     */
    closeTab = (tabId) => {
      const { tabs, activeTabId } = this.state;
      const tabToClose = tabs.find(t => t.id === tabId);

      if (!tabToClose || tabToClose.canClose === false) {
        return; // Can't close primary tabs
      }

      const newTabs = tabs.filter(t => t.id !== tabId);

      let newActiveTabId = activeTabId;
      if (activeTabId === tabId && newTabs.length > 0) {
        // Find the tab that was next to the closed one
        const closedIndex = tabs.findIndex(t => t.id === tabId);
        newActiveTabId = newTabs[Math.min(closedIndex, newTabs.length - 1)]?.id || null;
      }

      this.setState({
        tabs: newTabs,
        activeTabId: newActiveTabId
      });

      // Call parent callback if provided
      if (this.props.onTabClose) {
        this.props.onTabClose(tabToClose);
      }
    };

    /**
     * Shell API: Switch to a different module
     * @param {string} moduleId - ID of module to switch to
     */
    switchModule = (moduleId) => {
      const module = (this.props.modules || []).find(m => m.id === moduleId);
      if (module) {
        this.handleModuleChange(module);
      }
    };

    /**
     * Handle L1 module selection change
     */
    handleModuleChange = (module) => {
      // Always update internal activeModuleId
      this.setState({ activeModuleId: module.id });

      // In uncontrolled mode, also update tabs
      if (!this.isControlled()) {
        const newPrimaryTab = {
          id: `${module.id}-primary`,
          label: module.label,
          icon: module.icon,
          canClose: false,
          page: module.page,
          pageProps: module.pageProps
        };

        const otherTabs = (this.state.tabs || []).filter(t => t.canClose !== false);
        const newTabs = [newPrimaryTab, ...otherTabs];

        this.setState({
          tabs: newTabs,
          activeTabId: newPrimaryTab.id
        });
      }

      // Call parent callback
      if (this.props.onModuleChange) {
        this.props.onModuleChange(module);
      }
    };

    /**
     * Handle tab click
     */
    handleTabClick = (tab) => {
      // In uncontrolled mode, update internal state
      if (!this.isControlled()) {
        this.setState({ activeTabId: tab.id });
      }

      // Call parent callback
      if (this.props.onTabClick) {
        this.props.onTabClick(tab);
      }
    };

    /**
     * Handle tab close
     */
    handleTabClose = (tab) => {
      // Use closeTab for consistent behavior
      this.closeTab(tab.id);
    };

    /**
     * Handle new tab menu item click
     */
    handleNewTabClick = (item) => {
      // In uncontrolled mode, create the tab internally
      if (!this.isControlled()) {
        const newTab = {
          id: `tab-${Date.now()}`,
          label: item.label,
          icon: item.icon,
          canClose: true,
          page: item.page,
          pageProps: item.pageProps
        };

        this.setState(state => ({
          tabs: [...(state.tabs || []), newTab],
          activeTabId: newTab.id
        }));

        if (this.props.onNewTabClick) {
          this.props.onNewTabClick(item, newTab);
        }
      } else {
        // In controlled mode, just call the callback
        if (this.props.onNewTabClick) {
          this.props.onNewTabClick(item);
        }
      }
    };

    /**
     * Get the currently active tab
     */
    getActiveTab() {
      const tabs = this.isControlled() ? this.props.tabs : this.state.tabs;
      const activeTabId = this.isControlled() ? this.props.activeTabId : this.state.activeTabId;
      return (tabs || []).find(t => t.id === activeTabId);
    }

    /**
     * Get the currently active module
     */
    getActiveModule() {
      const activeModuleId = this.props.activeModuleId || this.state.activeModuleId;
      return (this.props.modules || []).find(m => m.id === activeModuleId);
    }

    /**
     * Render page content based on active tab/module
     */
    renderPageContent() {
      const activeTab = this.getActiveTab();
      const activeModule = this.getActiveModule();

      // Tab page takes priority (for dynamically opened tabs)
      if (activeTab && activeTab.page) {
        return React.createElement('div', { className: 'workspace-app-shell__page' },
          React.createElement(activeTab.page, {
            ...activeTab.pageProps,
            shell: this.shellAPI
          })
        );
      }

      // Module page (for primary tabs when no tab-specific page)
      if (activeModule && activeModule.page) {
        return React.createElement('div', { className: 'workspace-app-shell__page' },
          React.createElement(activeModule.page, {
            ...activeModule.pageProps,
            shell: this.shellAPI
          })
        );
      }

      return null;
    }

    render() {
      const {
        title = 'My Prototype',
        userName = 'Demo User',
        modules = [],
        newTabMenu,
        showTabs = true,
        children
      } = this.props;

      // Use props in controlled mode, state in uncontrolled mode
      const isControlled = this.isControlled();
      const tabs = isControlled ? this.props.tabs : this.state.tabs;
      const activeTabId = isControlled ? this.props.activeTabId : this.state.activeTabId;
      const activeModuleId = this.props.activeModuleId || this.state.activeModuleId;

      const shellClassName = 'workspace-app-shell' + (showTabs ? '' : ' workspace-app-shell--no-tabs');

      // Determine content: children take priority, then auto-rendered pages
      const content = children || this.renderPageContent();

      return React.createElement('div', { className: shellClassName },
        // L0: Header (GlobalNavBar)
        React.createElement('div', { className: 'workspace-app-shell__header' },
          React.createElement(GlobalNavBar, {
            title: title,
            userName: userName
          })
        ),

        // L1: Left Nav (WorkspaceLevel1PrimaryNavBar)
        React.createElement('div', { className: 'workspace-app-shell__nav' },
          React.createElement(WorkspaceLevel1PrimaryNavBar, {
            modules: modules,
            activeModuleId: activeModuleId,
            onModuleClick: this.handleModuleChange
          })
        ),

        // L2: Tab Bar (WorkspaceL2TabBar) - only if showTabs is true
        showTabs && React.createElement('div', { className: 'workspace-app-shell__tabbar' },
          React.createElement(WorkspaceL2TabBar, {
            tabs: tabs || [],
            activeTabId: activeTabId,
            onTabClick: this.handleTabClick,
            onTabClose: this.handleTabClose,
            newTabMenu: newTabMenu,
            onNewTabClick: this.handleNewTabClick
          })
        ),

        // Content area
        React.createElement('div', { className: 'workspace-app-shell__content' },
          content
        )
      );
    }
  }

  // Default props
  WorkspaceAppShell.defaultProps = {
    title: 'My Prototype',
    userName: 'Demo User',
    modules: [],
    activeModuleId: null,
    onModuleChange: null,
    tabs: null, // null = uncontrolled mode
    activeTabId: null,
    onTabClick: null,
    onTabClose: null,
    onTabOpen: null,
    newTabMenu: null,
    onNewTabClick: null,
    showTabs: true,
    children: null
  };

  return WorkspaceAppShell;
}
