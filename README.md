# Horizon 2.0 — Prototype Boilerplate

A boilerplate for UX designers to generate working HTML/CSS prototypes from Figma designs using Claude in VS Code.

## Prerequisites

- [VS Code](https://code.visualstudio.com/)
- [Claude Code VS Code extension](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code)
- Figma account with access to the designs you want to prototype

## Setup

1. Clone this repo
   ```bash
   git clone <repo-url>
   cd horizon-2.0-alpha
   ```
2. Open the folder in VS Code
3. Sign in to Claude Code and connect your Figma account when prompted

## How to use

1. Open the Claude chat panel in VS Code
2. Share a Figma URL and describe what you want:
   > "Here's my Figma design: [URL] — generate a component for the incident card"
3. Claude will pull the design from Figma and create a file in `components/`
4. Open the file directly in your browser to preview it
5. Ask Claude to wire components together into a full prototype page:
   > "Combine the nav, incident card, and sidebar into a prototype page"

## Tech Stack

| Layer | Technology |
|---|---|
| Markup / Logic | Vanilla HTML, CSS, JavaScript — no build tools, no frameworks |
| Design Tokens | CSS custom properties via `tokens.css` |
| Typography | ServiceNow Sans (Regular, Medium, Bold, Mono) — bundled locally in `assets/fonts/` |
| Icons | SVG icon library registered in `icons.js`, rendered via `<span data-icon="">` |
| Visualisations | Chart.js 4.4.9 — bundled locally at `assets/js/chart.min.js` |
| Gantt Charts | frappe-gantt v1.2.2 — bundled locally at `assets/js/frappe-gantt.umd.js` |
| Design Source | Figma (via Claude Code + Figma MCP) |
| AI Tooling | Claude Code (VS Code extension) with `.claude/CLAUDE.md` governance rules |

## Prototype Governance

Rules that Claude follows when generating any prototype. Enforced via `.claude/CLAUDE.md`.

1. **Summarise before acting** — state the plan and wait for explicit approval before generating any code
2. **Strict asset reuse** — only use existing tokens, icons, and styles from `assets/`; never hardcode a value that has a token equivalent
3. **No new components without a proposal** — name, purpose, and reason existing components are insufficient must be stated first
4. **Asset folder changes require approval** — any addition or edit to `assets/` must be summarised and approved upfront
5. **Icon management** — search existing icons before creating; always create both the `.svg` file and the `icons.js` registration together
6. **No assumptions** — ask a clarifying question rather than guessing when a requirement is ambiguous
7. **Challenge design system violations** — flag and suggest a compliant alternative if a request would introduce inconsistency
8. **Batch approvals** — consolidate related decisions into one plan; one approval per logical task

## Project Structure

```
horizon-2.0-alpha/
├── .claude/
│   └── CLAUDE.md               # Governance rules Claude follows when generating prototypes
│
├── assets/
│   ├── css/
│   │   ├── tokens.css           # All design tokens — colors, spacing, typography, radius, shadows
│   │   ├── base.css             # Global reset, font-face declarations, imports tokens.css
│   │   ├── components.css       # Shared component-level styles (buttons, forms, badges, etc.)
│   │   ├── dataviz.css          # Data visualisation tokens — chart colors, grid, tooltip, AI palette
│   │   └── frappe-gantt.css     # frappe-gantt base styles (locally bundled)
│   ├── fonts/                   # ServiceNow Sans font files (TTF, locally bundled)
│   ├── icons/                   # Individual SVG icon files (one per icon, uses currentColor)
│   └── js/
│       ├── icons.js             # Icon registry — maps icon names to inline SVG strings for file:// use
│       ├── interactions.js      # Horizon utilities: modals, toasts, tabs, accordion, loadData
│       ├── chart.min.js         # Chart.js 4.4.9 UMD bundle (locally bundled, no CDN)
│       └── frappe-gantt.umd.js  # frappe-gantt v1.2.2 UMD bundle (locally bundled, no CDN)
│
├── components/                  # Self-contained UI component HTML files — open directly in browser
│   ├── visualization.html       # All chart types: bar, grouped, stacked, horizontal, pareto
│   ├── kanban.html              # Kanban board with drag-and-drop
│   ├── roadmap.html             # Product roadmap timeline with collapsible tracks
│   ├── gantt.html               # Gantt chart with task dependencies and progress
│   ├── list.html                # Data list with sorting, filtering, grouping and pagination
│   └── ...                      # Buttons, inputs, badges, modals, navigation, and more
│
├── prototypes/                  # Full prototype pages assembled from components
│
├── data/
│   └── sample.json              # Example mock data file for use with Horizon.loadData()
│
├── figma/
│   └── links.md                 # Figma file URLs and node references used in this project
│
├── README.md                    # This file
└── SETUP.md                     # Detailed environment setup instructions
```

## Interactions available out of the box

| Utility | Usage |
|---------|-------|
| Modal | `Horizon.openModal('id')` / `Horizon.closeModal('id')` |
| Toast | `Horizon.toast('Message', 'success')` |
| Toggle | `Horizon.toggle('.selector')` |
| Tabs | Add `data-tabs` to container, `data-tab="name"` to triggers, `data-panel="name"` to panels |
| Accordion | Add `data-accordion` to container, `data-accordion-item` and `data-accordion-trigger` to items |
| Load data | `Horizon.loadData('../data/file.json', callback)` |

## Contributors

| Name | Role |
|---|---|
| **Debashish Sahu** | Created the boilerplate — project structure, design system, shared assets, and component library |
| **John Lonan** | Brainstormed ideas, tested the prototype workflow, and co-developed the governance rules |
| **Shyam Sandesh** | Initial inception of the idea and co-developed the governance rules |
