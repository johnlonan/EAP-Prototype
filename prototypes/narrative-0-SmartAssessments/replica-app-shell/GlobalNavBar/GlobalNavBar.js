/**
 * GlobalNavBar.js
 *
 * A React recreation of the ServiceNow sn-polaris-header component.
 * Uses a factory pattern to avoid React import path issues with Seismic/Tectonic.
 *
 * @example
 * // In your demo file:
 * import React from '../node_modules/.pnpm/react@16.14.0/node_modules/react';
 * import { createGlobalNavBar, injectGlobalNavBarStyles } from '../../replica-components/GlobalNavBar';
 *
 * const GlobalNavBar = createGlobalNavBar(React);
 * injectGlobalNavBarStyles();
 *
 * // Then use like any React component:
 * <GlobalNavBar title="My Workspace" userName="Demo User" />
 *
 * @module GlobalNavBar
 */

// ============================================
// CSS STYLES (Uses centralized tokens from replica-app-shell/tokens)
// ============================================
export const globalNavBarStyles = `
/* GlobalNavBar styles - uses --replica-appshell--* tokens and --now-font-family */

.global-nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: var(--replica-appshell--header-height);
  background-color: rgb(var(--replica-appshell--header-bg));
  font-family: var(--now-font-family, 'Lato', Arial, sans-serif);
  color: rgb(255, 255, 255);
}

.global-nav-bar__inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: 100%;
}

.global-nav-bar__start {
  display: flex;
  align-items: center;
  height: 100%;
  min-width: 0;
  overflow: hidden;
}

.global-nav-bar__center {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.global-nav-bar__end {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
}

.global-nav-bar__logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  width: 194px;
  height: 100%;
  cursor: pointer;
}
.global-nav-bar__logo svg {
  width: 150px;
  height: auto;
  margin-left: 16px;
  transition: opacity var(--replica-appshell--transition-fast);
}
.global-nav-bar__logo:hover svg { opacity: 0.7; }

.global-nav-bar__menu {
  display: flex;
  align-items: center;
  flex: 1;
  list-style: none;
  gap: 4px;
  min-width: 0;
}

.global-nav-bar__tab {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  height: var(--replica-appshell--icon-btn-size);
  padding: 0 12px;
  border-radius: var(--replica-appshell--radius-md);
  font-family: var(--now-font-family, 'Lato', Arial, sans-serif);
  font-size: var(--now-font-size--md1, 1rem);
  font-weight: 400;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--replica-appshell--transition-fast);
}
.global-nav-bar__tab:hover { background-color: rgb(var(--replica-appshell--header-bg-hover)); }
.global-nav-bar__tab.is-hidden { display: none; }

.global-nav-bar__overflow-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--replica-appshell--icon-btn-size);
  height: var(--replica-appshell--icon-btn-size);
  border: none;
  background: transparent;
  border-radius: var(--replica-appshell--radius-md);
  color: inherit;
  cursor: pointer;
  transition: background-color var(--replica-appshell--transition-fast);
}
.global-nav-bar__overflow-btn:hover { background-color: rgb(var(--replica-appshell--header-bg-hover)); }
.global-nav-bar__overflow-btn svg { width: 16px; height: 16px; fill: currentColor; }

.global-nav-bar__title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--replica-appshell--icon-btn-size);
  padding: 8px 16px;
  margin: 0 12px;
  background-color: rgb(var(--replica-appshell--header-bg));
  border: 1px solid rgb(var(--replica-appshell--border-color));
  border-radius: var(--replica-appshell--radius-pill);
  cursor: pointer;
}

.global-nav-bar__title {
  font-family: var(--now-font-family, 'Lato', Arial, sans-serif);
  font-size: var(--now-font-size--md1, 1rem);
  font-weight: 750;
  margin: 0 4px 0 8px;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.global-nav-bar__favorite-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 3px;
  border: none;
  background: transparent;
  border-radius: 50%;
  color: rgb(98, 216, 78);
  cursor: pointer;
}
.global-nav-bar__favorite-btn svg { width: 16px; height: 16px; fill: currentColor; }

.global-nav-bar__icons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.global-nav-bar__icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--replica-appshell--icon-btn-size);
  height: var(--replica-appshell--icon-btn-size);
  border: none;
  background: transparent;
  border-radius: var(--replica-appshell--radius-sm);
  color: inherit;
  cursor: pointer;
  transition: background-color var(--replica-appshell--transition-fast);
}
.global-nav-bar__icon-btn:hover { background-color: rgb(var(--replica-appshell--header-bg-hover)); }
.global-nav-bar__icon-btn svg { width: 16px; height: 16px; fill: currentColor; }

.global-nav-bar__end now-avatar {
  margin-left: 16px;
  margin-right: 16px;
}
`;

// ============================================
// STYLE INJECTION HELPER
// ============================================
import { injectWorkspaceTokenStyles, areTokensInjected } from '../tokens';

let stylesInjected = false;

/**
 * Injects GlobalNavBar CSS into the document head.
 * Automatically injects workspace tokens if not already present.
 * Safe to call multiple times - only injects once.
 */
export function injectGlobalNavBarStyles() {
  // Ensure tokens are injected first
  if (!areTokensInjected()) {
    injectWorkspaceTokenStyles();
  }

  if (stylesInjected) return;
  const styleEl = document.createElement('style');
  styleEl.id = 'global-nav-bar-styles';
  styleEl.textContent = globalNavBarStyles;
  document.head.appendChild(styleEl);
  stylesInjected = true;
}

// ============================================
// SVG ICONS (embedded strings)
// ============================================
const icons = {
  servicenowLogo: '<svg viewBox="0 0 174 27" xmlns="http://www.w3.org/2000/svg"><path d="M42.8,8.4 C40.9,8.4 39.3,9.1 38,10.1 L38,8.5 L33.6,8.5 L33.6,25.6 L38.2,25.6 L38.2,14.7 C38.8,13.8 40.4,12.6 42.3,12.6 C43,12.6 43.6,12.7 44.1,12.9 L44.1,8.5 C43.7,8.4 43.3,8.4 42.8,8.4" fill="#FFFFFF"/><path d="M3,20.4 C4.2,21.5 5.9,22.1 7.7,22.1 C8.9,22.1 9.9,21.5 9.9,20.7 C9.9,18.1 1.7,19 1.7,13.5 C1.7,10.2 4.9,8.2 8.2,8.2 C10.4,8.2 12.8,9 14,9.9 L11.9,13.2 C11,12.6 9.9,12 8.6,12 C7.3,12 6.3,12.5 6.3,13.4 C6.3,15.6 14.5,14.7 14.5,20.7 C14.5,24 11.3,26 7.7,26 C5.3,26 2.9,25.2 0.9,23.7 L3,20.4 Z" fill="#FFFFFF"/><path d="M31.7,16.9 C31.7,12.1 28.4,8.2 23.7,8.2 C18.6,8.2 15.4,12.4 15.4,17.1 C15.4,22.5 19.2,26 24.3,26 C26.9,26 29.6,24.9 31.3,22.9 L28.7,20.3 C27.9,21.2 26.3,22.3 24.4,22.3 C22,22.3 20,20.6 19.8,18.2 L31.6,18.2 C31.6,17.8 31.7,17.4 31.7,16.9 M20,14.9 C20.2,13.3 21.8,11.9 23.6,11.9 C25.5,11.9 26.8,13.4 27,14.9 L20,14.9 Z" fill="#FFFFFF"/><polygon points="55 19 59.7 8.5 64.4 8.5 56.6 25.6 53.4 25.6 45.6 8.5 50.4 8.5" fill="#FFFFFF"/><path d="M68.3,0.5 C69.9,0.5 71.3,1.8 71.3,3.4 C71.3,5 70,6.3 68.3,6.3 C66.6,6.3 65.3,5 65.3,3.4 C65.3,1.8 66.6,0.5 68.3,0.5" fill="#FFFFFF"/><rect fill="#FFFFFF" x="66" y="8.5" width="4.6" height="17.1"/><path d="M89.4,22.1 C87.4,24.8 84.9,25.9 81.7,25.9 C76.4,25.9 72.6,21.9 72.6,17 C72.6,12 76.6,8.1 81.8,8.1 C84.7,8.1 87.4,9.5 89,11.5 L85.8,14.4 C84.9,13.2 83.5,12.4 81.9,12.4 C79.3,12.4 77.3,14.5 77.3,17.1 C77.3,19.8 79.2,21.8 82,21.8 C83.9,21.8 85.3,20.7 86.1,19.5 L89.4,22.1 Z" fill="#FFFFFF"/><path d="M106,22.9 C104.4,24.9 101.6,26 99,26 C93.9,26 90.1,22.5 90.1,17.1 C90.1,12.3 93.3,8.2 98.4,8.2 C103.1,8.2 106.4,12.2 106.4,16.9 C106.4,17.4 106.4,17.8 106.3,18.2 L94.5,18.2 C94.7,20.6 96.7,22.3 99.1,22.3 C101,22.3 102.6,21.2 103.4,20.3 L106,22.9 Z M101.7,14.9 C101.6,13.4 100.2,11.9 98.3,11.9 C96.4,11.9 94.9,13.3 94.7,14.9 L101.7,14.9 Z" fill="#FFFFFF"/><path d="M108.2,25.6 L108.2,8.5 L112.6,8.5 L112.6,9.9 C113.9,8.8 115.5,8.2 117.4,8.2 C119.8,8.2 121.9,9.3 123.3,11 C124.4,12.3 125.1,14.1 125.1,17 L125.1,25.7 L120.5,25.7 L120.5,16.6 C120.5,14.9 120.1,14 119.5,13.4 C118.9,12.8 118,12.4 116.9,12.4 C115,12.4 113.4,13.6 112.8,14.5 L112.8,25.6 L108.2,25.6 L108.2,25.6 Z" fill="#FFFFFF"/><path d="M136.8,8.2 C131.4,8.2 126.8,12.6 126.8,18.1 C126.8,21 128,23.6 129.9,25.5 C130.6,26.2 131.7,26.2 132.5,25.6 C133.6,24.7 135.1,24.2 136.8,24.2 C138.5,24.2 139.9,24.7 141.1,25.6 C141.9,26.2 143,26.1 143.7,25.4 C145.6,23.6 146.8,21 146.8,18.1 C146.7,12.7 142.3,8.2 136.8,8.2 M136.7,23.2 C133.8,23.2 131.7,21 131.7,18.2 C131.7,15.4 133.7,13.2 136.7,13.2 C139.7,13.2 141.7,15.5 141.7,18.2 C141.7,20.9 139.7,23.2 136.7,23.2" fill="#4FB64B"/><polygon points="155.7 25.6 152.3 25.6 145.5 8.5 150.1 8.5 153.8 18.3 157.5 8.5 161.3 8.5 164.9 18.3 168.6 8.5 173.2 8.5 166.4 25.6 163 25.6 159.4 15.9" fill="#FFFFFF"/></svg>',
  aiSparkle: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M11.23 2.89a1.63 1.63 0 0 1-1.338 1.338l-.145.024c-.278.047-.278.446 0 .493l.145.024a1.63 1.63 0 0 1 1.338 1.338l.024.143c.046.278.446.278.493 0l.024-.143a1.63 1.63 0 0 1 1.338-1.338l.175-.03c.277-.046.278-.444.002-.492l-.179-.032a1.63 1.63 0 0 1-1.323-1.323l-.032-.18c-.049-.277-.446-.276-.493.001l-.03.177Z"/><path d="M6.797 5.17A3.46 3.46 0 0 1 4.17 7.799l-1.404.312c-.417.092-.417.688 0 .78l1.404.313a3.46 3.46 0 0 1 2.627 2.627l.313 1.404c.092.418.688.418.78 0l.313-1.404a3.46 3.46 0 0 1 2.627-2.627l1.404-.312c.417-.093.417-.689 0-.781l-1.404-.312A3.46 3.46 0 0 1 8.203 5.17L7.89 3.766c-.092-.417-.688-.417-.78 0l-.313 1.405Z"/></svg>',
  globe: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0M7.397 2.347C7.64 2.08 7.844 2 8 2s.36.08.603.347.485.682.698 1.236c.159.414.297.89.407 1.417H6.292c.11-.527.248-1.003.407-1.417.213-.554.455-.969.698-1.236"/></svg>',
  help: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M7.5 4C6.658 4 6 4.606 6 5.5a.5.5 0 0 1-1 0C5 4.027 6.132 3 7.5 3 8.913 3 10 4.216 10 5.643c0 .489-.126.913-.377 1.257a2.03 2.03 0 0 1-.97.703C8.22 7.76 8 8.043 8 8.286V8.5a.5.5 0 0 1-1 0v-.214c0-.862.708-1.405 1.313-1.624.23-.083.394-.203.502-.35S9 5.954 9 5.641C9 4.703 8.297 4 7.5 4m0 7a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/><path d="M0 7.5a7.5 7.5 0 1 0 15 0 7.5 7.5 0 0 0-15 0M7.5 14a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13"/></svg>',
  bell: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a6 6 0 0 0-6 6v2.856A1.636 1.636 0 0 0 2.636 13H6a2 2 0 1 0 4 0h3.364A1.636 1.636 0 0 0 14 9.856V7a6 6 0 0 0-6-6M3 7a5 5 0 0 1 10 0v3.235a.5.5 0 0 0 .44.497.637.637 0 0 1-.076 1.268H2.636a.636.636 0 0 1-.077-1.268.5.5 0 0 0 .441-.497zm6 6a1 1 0 1 1-2 0z"/></svg>',
  ellipsisVertical: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M9.5 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M8 14a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/></svg>',
  starOutline: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M7.049 2.359c.3-.921 1.603-.921 1.902 0l1.183 3.64h3.827c.969 0 1.372 1.24.588 1.81l-3.096 2.249 1.182 3.64c.3.921-.755 1.687-1.539 1.118L8 12.566l-3.096 2.25c-.784.57-1.839-.197-1.54-1.118l1.183-3.64-3.096-2.25C.667 7.238 1.071 6 2.039 6h3.827zm.95.309L6.594 6.999H2.039l3.684 2.677-1.407 4.33L8 11.33l3.684 2.677-1.407-4.331 3.684-2.677H9.407z"/></svg>',
  ongoing: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" fill-rule="evenodd"><path d="M5.5 2C3.08 2 1 3.73 1 6c0 .961.38 1.835 1 2.516V10.5a.5.5 0 0 0 .82.384l1.293-1.077a5 5 0 0 0 2.016.154C6.618 11.74 8.435 13 10.5 13c.483 0 .95-.068 1.387-.193l1.293 1.077A.5.5 0 0 0 14 13.5v-1.984c.62-.68 1-1.555 1-2.516 0-2.27-2.08-4-4.5-4q-.32 0-.629.04C9.382 3.26 7.565 2 5.5 2M2 6c0-1.596 1.502-3 3.5-3S9 4.404 9 6 7.498 9 5.5 9c-.472 0-.921-.08-1.33-.225a.5.5 0 0 0-.486.088L3 9.433V8.314a.5.5 0 0 0-.148-.355C2.314 7.426 2 6.74 2 6m8 .03c-.014 1.73-1.236 3.141-2.892 3.705C7.486 11.004 8.818 12 10.5 12c.473 0 .921-.08 1.33-.225a.5.5 0 0 1 .486.088l.684.57v-1.118a.5.5 0 0 1 .148-.355C13.686 10.426 14 9.74 14 9c0-1.596-1.502-3-3.5-3q-.255 0-.5.03"/></svg>',
};

// ============================================
// FACTORY FUNCTION
// ============================================

/**
 * Creates a GlobalNavBar component using the provided React instance.
 * This factory pattern avoids import path issues with Seismic/Tectonic builds.
 *
 * @param {Object} React - The React instance to use
 * @returns {React.Component} GlobalNavBar component class
 *
 * @example
 * import React from '../node_modules/.pnpm/react@16.14.0/node_modules/react';
 * import { createGlobalNavBar } from '../../replica-components/GlobalNavBar';
 * const GlobalNavBar = createGlobalNavBar(React);
 */
export function createGlobalNavBar(React) {
  // Icon helper component (closure over React)
  function Icon({ name }) {
    const svg = icons[name];
    if (!svg) return null;
    return React.createElement('span', { dangerouslySetInnerHTML: { __html: svg } });
  }

  // GlobalNavBar class component with responsive menu collapse
  class GlobalNavBar extends React.Component {
    constructor(props) {
      super(props);
      this.state = { visibleCount: 4 };
      this.menuRef = React.createRef();
      this.itemRefs = [];
      this.checkOverflow = this.checkOverflow.bind(this);
    }

    componentDidMount() {
      this.checkOverflow();
      window.addEventListener('resize', this.checkOverflow);
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.checkOverflow);
    }

    checkOverflow() {
      const menu = this.menuRef.current;
      if (!menu) return;

      const menuItems = ['All', 'Favorites', 'History', 'Workspaces'];
      const menuRect = menu.getBoundingClientRect();
      const menuWidth = menuRect.width;
      const overflowBtnWidth = 36; // 32px + 4px gap

      // Approximate widths: padding 0 12px + text width + 4px gap
      const itemWidths = [46, 91, 80, 113];

      let totalWidth = 0;
      let visible = 0;

      for (let i = 0; i < menuItems.length; i++) {
        const itemWidth = itemWidths[i] + 4; // Add gap
        const neededWidth = totalWidth + itemWidth + (i < menuItems.length - 1 ? overflowBtnWidth : 0);
        if (neededWidth <= menuWidth) {
          totalWidth += itemWidth;
          visible++;
        } else {
          break;
        }
      }

      // If all items fit, show all and hide overflow
      if (visible === menuItems.length) {
        visible = menuItems.length;
      }

      if (visible !== this.state.visibleCount) {
        this.setState({ visibleCount: visible });
      }
    }

    render() {
      const { title, userName } = this.props;
      const { visibleCount } = this.state;
      const menuItems = ['All', 'Favorites', 'History', 'Workspaces'];
      const hasHidden = visibleCount < menuItems.length;

      return React.createElement('header', { className: 'global-nav-bar' },
        React.createElement('nav', { className: 'global-nav-bar__inner' },
          // Start
          React.createElement('div', { className: 'global-nav-bar__start' },
            React.createElement('div', { className: 'global-nav-bar__logo' },
              React.createElement(Icon, { name: 'servicenowLogo' })),
            React.createElement('div', { className: 'global-nav-bar__menu', ref: this.menuRef },
              menuItems.map((label, i) =>
                React.createElement('div', {
                  key: label,
                  className: 'global-nav-bar__tab' + (i >= visibleCount ? ' is-hidden' : '')
                }, label)
              ),
              React.createElement('button', {
                className: 'global-nav-bar__overflow-btn'
              },
                React.createElement(Icon, { name: 'ellipsisVertical' }))
            )
          ),
          // Center
          React.createElement('div', { className: 'global-nav-bar__center' },
            React.createElement('div', { className: 'global-nav-bar__title-container' },
              React.createElement('span', { className: 'global-nav-bar__title' }, title),
              React.createElement('button', { className: 'global-nav-bar__favorite-btn', 'aria-label': 'Add to favorites' },
                React.createElement(Icon, { name: 'starOutline' }))
            )
          ),
          // End
          React.createElement('div', { className: 'global-nav-bar__end' },
            React.createElement('div', { className: 'global-nav-bar__icons' },
              React.createElement('button', { className: 'global-nav-bar__icon-btn' },
                React.createElement(Icon, { name: 'aiSparkle' })),
              React.createElement('button', { className: 'global-nav-bar__icon-btn' },
                React.createElement(Icon, { name: 'ongoing' })),
              React.createElement('button', { className: 'global-nav-bar__icon-btn' },
                React.createElement(Icon, { name: 'help' })),
              React.createElement('button', { className: 'global-nav-bar__icon-btn' },
                React.createElement(Icon, { name: 'bell' }))
            ),
            React.createElement('now-avatar', {
              size: 'sm',
              'user-name': userName,
              presence: 'available'
            })
          )
        )
      );
    }
  }

  return GlobalNavBar;
}
