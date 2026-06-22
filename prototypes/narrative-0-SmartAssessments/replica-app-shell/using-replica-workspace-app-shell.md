# App Shell Components

React recreations of ServiceNow workspace shell components. The real shell components depend on UI Builder and a ServiceNow instance, so we recreated them with visual fidelity to the originals.

> **Use `WorkspaceAppShell`** as the default. It composes the L0 header, L1 left nav, and L2 tab bar with coordinated state. Reach for the individual components only when you need a custom layout.

For routing patterns and a complete working app, see `example-workspace/example/demo.js`.

---

## Factory pattern (all components)

Every component is exported as a `create*(React)` factory plus an `inject*Styles()` function. The factory pattern lets the component work with any React version (16/17/18) and avoids brittle relative paths into `node_modules`. Pattern is identical for all four components — see [WorkspaceAppShell setup](#workspaceappshell-setup) below for the canonical example.

---

## WorkspaceAppShell (recommended)

**Location:** `replica-components/WorkspaceAppShell/`

Composes GlobalNavBar (L0), WorkspaceLevel1PrimaryNavBar (L1), and WorkspaceL2TabBar (L2) into one shell. You configure modules and pages; the shell handles layout and navigation coordination.

### Setup

```javascript
import React from '../node_modules/.pnpm/react@16.14.0/node_modules/react';
import '@servicenow/now-icon';
import '@servicenow/now-avatar';
import {
  createWorkspaceAppShell,
  injectWorkspaceAppShellStyles
} from '../../replica-components/WorkspaceAppShell';

const WorkspaceAppShell = createWorkspaceAppShell(React);
injectWorkspaceAppShellStyles();

const modules = [
  { id: 'home', label: 'Home', icon: 'home-outline', group: 'top', page: HomePage },
  { id: 'list', label: 'List', icon: 'list-fill',    group: 'top', page: ListPage },
];

React.createElement(WorkspaceAppShell, { title: 'My Workspace', modules });
```

Each `page` component receives a `shell` prop with `openTab(config)`, `closeTab(tabId)`, and `switchModule(moduleId)`. See `example-workspace/example/demo.js` for full page-routing patterns including tab management and cross-module navigation.

### Shell API

| Method | Description |
|---|---|
| `shell.openTab(config)` | Opens a new tab (or switches to existing) |
| `shell.closeTab(tabId)` | Closes a tab by ID |
| `shell.switchModule(moduleId)` | Switches to a different L1 module |

**openTab config:**
```javascript
shell.openTab({
  id: 'unique-tab-id',         // required
  label: 'Tab Label',          // required
  icon: 'document-outline',    // optional
  page: PageComponent,         // optional component to render
  pageProps: { foo: 'bar' },   // optional props passed to page
  canClose: true               // default true
});
```

### Module configuration

```javascript
{
  id: 'home',                   // required
  label: 'Home',                // required (tooltip + tab label)
  icon: 'home-outline',         // required
  group: 'top',                 // required: 'top' or 'bottom'
  page: HomePage,               // optional
  pageProps: { custom: 'data' } // optional
}
```

### Exports

| Export | Type | Description |
|---|---|---|
| `createWorkspaceAppShell(React)` | Function | Factory that returns component class |
| `injectWorkspaceAppShellStyles()` | Function | Injects CSS for ALL sub-components |
| `workspaceAppShellStyles` | String | Raw CSS string for shell layout |

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `'My Prototype'` | Header title |
| `userName` | `string` | `'Demo User'` | User name for avatar |
| `modules` | `Array` | `[]` | L1 modules (can include `page`) |
| `activeModuleId` | `string` | First module ID | Initially selected module |
| `onModuleChange` | `function` | `null` | Module-change callback |
| `tabs` | `Array` | Auto-generated | L2 tabs (auto from module if omitted) |
| `activeTabId` | `string` | First tab ID | Selected tab |
| `onTabClick` | `function` | `null` | Tab-click callback |
| `onTabClose` | `function` | `null` | Tab-close callback |
| `onTabOpen` | `function` | `null` | Fires when shell.openTab() runs |
| `newTabMenu` | `Array` | `null` | Menu items for "+" button |
| `onNewTabClick` | `function` | `null` | New-tab-menu callback |
| `showTabs` | `boolean` | `true` | Show the L2 tab bar |
| `children` | `ReactNode` | `null` | Manual content (overrides page routing) |

### Layout

```
┌──────────────────────────────────────────────────┐
│  L0: GlobalNavBar (52px fixed header)            │
├────┬─────────────────────────────────────────────┤
│ L1 │  L2: Tab Bar (40px fixed)                   │
│Nav ├─────────────────────────────────────────────┤
│48px│  Content Area (fills viewport, scrollable)  │
└────┴─────────────────────────────────────────────┘
```

Content rendering priority: `children` prop > active tab's `page` > active module's `page` > nothing.

**Controlled vs uncontrolled:** omit the `tabs` prop for uncontrolled mode (shell manages internal tab state). Pass `tabs` + `activeTabId` + the tab callbacks for full control. See demo.js for both patterns.

---

## GlobalNavBar (L0 Header)

**Location:** `replica-components/GlobalNavBar/`

Use directly only when you don't want the full WorkspaceAppShell.

```javascript
import { createGlobalNavBar, injectGlobalNavBarStyles } from '../../replica-components/GlobalNavBar';
const GlobalNavBar = createGlobalNavBar(React);
injectGlobalNavBarStyles();
React.createElement(GlobalNavBar, { title: 'My Workspace', userName: 'Demo User' });
```

**Exports:** `createGlobalNavBar`, `injectGlobalNavBarStyles`, `globalNavBarStyles` (raw CSS).

**Props:** `title` (default `'My Prototype'`), `userName` (default `'Demo User'`).

**Features:** ServiceNow logo with green accent, configurable menu items, always-visible overflow menu, responsive collapse, center title pill with favorite star, right-side icons (AI, Discussions, Help, Notifications), `now-avatar` for user.

### Visual specs (Coral theme)

- **Height:** 52px
- **Background:** `rgb(3, 45, 66)` (Coral chrome brand-5)
- **Hover:** `rgb(46, 81, 98)` · **Active:** `rgb(2, 27, 40)` · **Text:** white
- **Logo:** 194px wide, green accent `#4FB64B`

| Element | Measurement |
|---|---|
| Menu items | 32px height, 4px gap, padding 0 12px, 16px font, weight 400 |
| Icon buttons | 32×32px, 8px gap |
| Avatar | 16px margin-left from icons |
| Title pill | padding 8px 16px, margin 0 12px, border-radius 50px |

**Layout** uses CSS Grid `1fr auto 1fr` to keep the title pill centered.

---

## WorkspaceLevel1PrimaryNavBar (L1 Left Nav)

**Location:** `replica-components/WorkspaceLevel1PrimaryNavBar/`

```javascript
import '@servicenow/now-icon';
import {
  createWorkspaceLevel1PrimaryNavBar,
  injectWorkspaceLevel1PrimaryNavBarStyles
} from '../../replica-components/WorkspaceLevel1PrimaryNavBar';

const L1 = createWorkspaceLevel1PrimaryNavBar(React);
injectWorkspaceLevel1PrimaryNavBarStyles();

const modules = [
  { id: 'home',     label: 'Home',     icon: 'home-outline', group: 'top' },
  { id: 'inbox',    label: 'Inbox',    icon: 'inbox-outline', group: 'top', badge: { count: 3 } },
  { id: 'settings', label: 'Settings', icon: 'gear-outline', group: 'bottom' },
  { id: 'chat',     label: 'Chat',     icon: 'chat-outline', group: 'bottom', presence: { status: 'available' } },
];

React.createElement(L1, { modules, activeModuleId: 'home', onModuleClick: (m) => {} });
```

**Exports:** `createWorkspaceLevel1PrimaryNavBar`, `injectWorkspaceLevel1PrimaryNavBarStyles`, `workspaceLevel1PrimaryNavBarStyles`, `commonModules` (preset), `withBadge(module, count)`, `withPresence(module, status)`.

**Props:** `modules` (Array), `activeModuleId` (string), `onModuleClick` (function).

### Module configuration

```javascript
{
  id: 'inbox',                       // required
  label: 'Inbox',                    // required (tooltip)
  icon: 'inbox-outline',             // required (now-icon name)
  group: 'top',                      // required: 'top' or 'bottom'
  badge: { count: 3 },               // optional
  presence: { status: 'available' }  // optional
}
```

| Group | Behavior | Position |
|---|---|---|
| `top` | Radio (one selected at a time, unified with bottom) | Stacks top-down |
| `bottom` | Radio (unified with top) | Stacks bottom-up |

### Visual specs (Coral theme)

| Property | Value |
|---|---|
| Toolbar width | 48px |
| Module container | 48×48px |
| Module button | 40×40px, circular |
| Icon size | 24px (`now-icon size="lg"`) |

**Background gradient:**
```css
background: linear-gradient(180deg,
  rgb(3, 45, 66) 35%,    /* dark teal top */
  rgb(0, 128, 163) 85%,  /* bright teal middle */
  rgb(36, 138, 19) 100%  /* green bottom */
);
```

**Selection states:** default = transparent, hover = `rgb(1, 66, 82)`, selected = `rgb(1, 66, 82)` + 1px white box-shadow.

**Presence colors:** `available` (green), `busy` (red), `away` (yellow), `offline` (gray).

**Common toolbar icons:** `home-outline`/`home-fill`, `list-fill`/`list-outline`, `inbox-outline`/`inbox-fill`, `calendar-outline`, `chart-area-outline`, `magnifying-glass-outline`, `gear-outline` (NOT `cog-outline`), `bell-outline`, `chat-outline`, `phone-outline`, `circle-question-outline`.

---

## WorkspaceL2TabBar (L2 Horizontal Tabs)

**Location:** `replica-components/WorkspaceL2TabBar/`

```javascript
import '@servicenow/now-icon';
import {
  createWorkspaceL2TabBar,
  injectWorkspaceL2TabBarStyles
} from '../../replica-components/WorkspaceL2TabBar';

const L2 = createWorkspaceL2TabBar(React);
injectWorkspaceL2TabBarStyles();

const tabs = [
  { id: 'home',   label: 'Home', canClose: false },
  { id: 'inc001', label: 'INC0010001', icon: 'document-outline', isDirty: true },
  { id: 'inc002', label: 'INC0010002', badge: { count: 3 } },
];

React.createElement(L2, {
  tabs, activeTabId: 'home',
  onTabClick: (t) => {}, onTabClose: (t) => {},
  newTabMenu: [{ id: 'new', label: 'New Item', icon: 'document-outline' }],
  onNewTabClick: (item) => {}
});
```

**Exports:** `createWorkspaceL2TabBar`, `injectWorkspaceL2TabBarStyles`, `workspaceL2TabBarStyles`.

**Props:** `tabs`, `activeTabId`, `onTabClick`, `onTabClose`, `newTabMenu`, `onNewTabClick`.

### Tab configuration

```javascript
{
  id: 'inc001',              // required
  label: 'INC0010001',       // required
  icon: 'document-outline',  // optional (omit for text-only)
  canClose: true,            // default true
  badge: { count: 3 }        // optional
}
```

### Visual specs (Coral theme)

| Property | Value |
|---|---|
| Tab bar height | 40px (36px + 4px padding) |
| Tab bar background | `rgb(184, 219, 229)` |
| Tab height | 36px |
| Tab border-radius | 8px (top corners only) |
| Tab font | `Lato, Arial, sans-serif`, 16px, weight 525 |
| Tab text | `rgb(16, 23, 26)` |
| Tab padding | `0 28px 0 8px` |
| Tab min/max width | 120px / 240px |
| Tab background (selected) | white |
| Close button | always visible, 16×16px, right: 8px, `close-outline` icon |
| More button | 32×32px, `ellipsis-h-fill` icon |
| Divider | `rgb(136, 163, 173)` |

**Vertical dividers** appear after every tab except: after the selected tab, after the tab immediately before the selected tab. Same rules apply to hover. CSS pattern uses `:has()`:
```css
.tab-wrapper:has(.is-selected)::after { display: none; }
.tab-wrapper:has(+ .tab-wrapper .is-selected)::after { display: none; }
```

**Features:** first tab linked to L1 module (not closeable by default), close button always visible, optional icons + badges, three-dot overflow at end, keyboard navigation.

---

## Design tokens

All app shell components use centralized tokens in `replica-app-shell/tokens/index.js`, automatically injected by any `inject*Styles()` call. Quick reference:

| Token | Default | Description |
|---|---|---|
| `--replica-appshell--header-height` | `52px` | L0 height |
| `--replica-appshell--l1-nav-width` | `48px` | L1 width |
| `--replica-appshell--l2-tabbar-height` | `40px` | L2 height |
| `--replica-appshell--header-bg` | `3, 45, 66` | Header bg (RGB) |
| `--replica-appshell--tabbar-bg` | `184, 219, 229` | Tab bar bg (RGB) |

Override before injecting styles:
```javascript
document.head.insertAdjacentHTML('beforeend',
  `<style>:root { --replica-appshell--header-height: 64px; }</style>`);
injectWorkspaceAppShellStyles();
```

Full token reference: [building-custom-components-or-CSS.md → Replica App Shell Tokens](../guides/building-custom-components-or-CSS.md#replica-app-shell-tokens).

---

## Running the demo

```bash
cd example-workspace
pnpm install
pnpm run dev
# Open http://localhost:8081
```
