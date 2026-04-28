---
name: card-compositions
description: Validates card compositions — bounded content surfaces that group related information. Covers card types (container, data display, status/priority), surface token compliance, radius governance, text color tokens, and structural anatomy.
metadata:
  author: servicenow
  version: '1.0.0'
compatibility: Works with Claude Code, Cursor, VS Code Copilot, Windsurf, Gemini CLI, and other Agent Skills-compatible tools
license: MIT
---

# Card — Composition Skill

## Purpose

Validates card compositions — bounded content surfaces that group related information. Covers three card types (container, data display, status/priority), surface token compliance, radius governance, text color tokens, sub-patterns (AI insight row, badge system, change indicators, chart colors), and structural anatomy (slots, footer, shared components).

## When to Use

- Auditing an existing card component for token debt (hardcoded colors, radius, borders)
- Validating that a card follows the correct type anatomy (A, B, or C)
- Building a new card and need the correct surface treatment and token references
- Reviewing badge color compliance against the status 4-variant token model

## Card — Composition Recipe

**Composition:** card
**Maturity:** 2b (executable — supports agent validation)
**Components used:** card container (`aict-card`), button, badge, icon
**Cross-cutting patterns:** status-colors, ai-insight-row, truncation-tooltip
**Source audit:** Doc 55 (Card Audit & Taxonomy) — 10 components reviewed in Karuna repo

---

### Purpose

A card is a bounded content surface that groups related information into a scannable unit. Cards appear in dashboards (bento grids), list views, and detail panels.

This composition governs the card shell structure, surface treatment, token compliance, slot anatomy, and sub-pattern usage. It does NOT govern what goes inside the card body — that's determined by the content type (chart, list, metric, priority queue). It governs how the container frames that content.

---

### Three Card Types

The audit reveals three distinct types. Each has different anatomy and different rules. The validator must identify the type before applying checks.

#### Type A — Container Card

**Definition:** Wraps child content via slots. Does not own its data rendering. Provides a consistent shell (header, body slot, optional footer) for arbitrary content.

**Implementation:** `aict-card` base component, consumed by wrapper cards (`aict-ai-value-card`, `aict-governance-card`, `aict-inventory-card`, `aict-strategy-card`, `aict-tasks-overview-card`).

**Identifying pattern:** Uses `<aict-card>` with `card-title`, `show-arrow`, and `<slot>` for body content.

**Anatomy:**

```
┌─────────────────────────────────────────┐
│  Header: title + subtitle + arrow btn   │
├─────────────────────────────────────────┤
│                                         │
│  Body: <slot> (child content)           │
│                                         │
├─────────────────────────────────────────┤
│  Footer: <slot name="footer">           │  ← MISSING in current codebase
│  (action-set or AI insight row)         │
└─────────────────────────────────────────┘
```

#### Type B — Data Display Card

**Definition:** Self-contained — owns its data rendering. Receives data as properties and renders a specific visualization (metric value, score, stat with chart). Not a general-purpose container.

**Implementation:** `aict-metric-card`, `aict-score-card`, `aict-stat-card`. These do NOT wrap `aict-card` — they build their own shell.

**Identifying pattern:** Has `value` property. Renders numbers, charts, or scores directly. No `<slot>`.

**Anatomy:**

```
┌─────────────────────────────────────────┐
│  Header: title + subtitle + arrow btn   │
├─────────────────────────────────────────┤
│  Value: large metric (text-3xl+)        │
│  Change indicator: ▲/▼ with color       │
│  Chart: sparkline, bar, donut           │
├─────────────────────────────────────────┤
│  Footer: aggregation label or link      │  ← optional, not action-set
└─────────────────────────────────────────┘
```

#### Type C — Status/Priority Card

**Definition:** Communicates urgency, priority, or AI-driven recommendations. Uses status-colored borders, badge clusters, and AI insight content. Visually distinct from Type A and B.

**Implementation:** `aict-priority-card`. Does NOT wrap `aict-card` — entirely self-contained with its own CSS.

**Identifying pattern:** Has `badges` array property, `variant` (primary/secondary), `dueStatus`, `aiInsight`.

**Anatomy:**

```
┌─────────────────────────────────────────┐
│  Badge cluster + due label              │
├─────────────────────────────────────────┤
│  Title                                  │
│  Meta: agent + assignee                 │
│  AI insight (sparkle + text)            │
├─────────────────────────────────────────┤
│  Footer: action-set                     │  ← MISSING — needed for approval context
└─────────────────────────────────────────┘
```

#### Type Classification Hints

When validating a component file, classify by these signals:

| Signal                                                            | Type                     |
| ----------------------------------------------------------------- | ------------------------ |
| Imports or renders `<aict-card>`                                  | Type A — Container       |
| Has `value` prop AND renders numbers/charts directly              | Type B — Data Display    |
| Has `badges` array, `variant`, `dueStatus`, or `aiInsight` props  | Type C — Status/Priority |
| Has `<slot>` for child content                                    | Type A — Container       |
| Builds its own card shell (no `aict-card` import) AND has `value` | Type B — Data Display    |

---

### Surface & Token Rules (All Types)

These checks apply universally regardless of card type.

#### Background

| Rule                                | Correct                                              | Common Violations Found                                                                                                                                  |
| ----------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Card background uses semantic class | `bg-base-100`                                        | `bg-white` (card.js line 75), `background: white` (priority-card.js `.priority-primary`), `background: #f8fafc` (priority-card.js `.priority-secondary`) |
| Secondary variant background        | `bg-base-200` or `var(--hz-color-surface-secondary)` | Hardcoded `#f8fafc`                                                                                                                                      |

#### Border

| Rule                                    | Correct                                 | Common Violations Found                                                                                                                                                                                                                                       |
| --------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Card border uses semantic token         | `var(--hz-color-border-default)`        | `var(--base-300, #e2e8f0)` with hardcoded fallback (card.js line 25), `border-[var(--base-300,#e2e8f0)]` (metric-card.js line 93), `1.5px solid #d1fae5` (priority-card.js `.priority-primary`), `1px solid #e2e8f0` (priority-card.js `.priority-secondary`) |
| Status-colored borders use status token | `var(--hz-color-status-success-border)` | Hardcoded `#d1fae5`                                                                                                                                                                                                                                           |

#### Radius

| Rule                                | Correct                                           | Common Violations Found                                                                                                                                               |
| ----------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Top-level card radius from token    | `var(--hz-radius-parent)` (24px)                  | `radius` string prop defaulting to `'24px'` applied as inline style (card.js line 37, 75); `rounded-[32px]` (metric-card.js line 93, tasks-overview-card.js line 106) |
| Nested card radius from token       | `var(--hz-radius-nested)` (16px)                  | Hardcoded `16px` (priority-card.js lines 25, 32)                                                                                                                      |
| Radius must not be a component prop | Remove `radius` property entirely                 | card.js exposes `radius` as a configurable prop — consumers pass arbitrary values (`"24px"`, `"32px"`)                                                                |
| Radius consistency across siblings  | All sibling cards in same context use same radius | tasks-overview-card passes `radius="32px"` while all other Type A cards pass `radius="24px"`                                                                          |

#### Text Colors

| Rule                    | Correct                                                    | Common Violations Found                                                                                                                         |
| ----------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary text            | `text-base-content`                                        | `text-slate-800` (card.js line 85), `text-[#172b31]` (priority-card.js), `text-slate-800` (metric-card.js, inventory-card.js, strategy-card.js) |
| Secondary/subtitle text | `text-base-content/60` or `var(--hz-color-text-secondary)` | `text-slate-500` (card.js line 91), `text-[#4a5e65]` (priority-card.js), `text-slate-400` (metric-card.js line 106)                             |
| Muted/hint text         | `var(--hz-color-text-muted)`                               | `text-slate-400` (metric-card.js line 131, 146), `text-zinc-500` (score-card.js line 41), `text-slate-600` (stat-card.js line 135)              |
| Link text               | `var(--hz-color-text-link)`                                | `text-sky-700` (ai-value-card.js line 64, inventory-card.js line 107, tasks-overview-card.js line 65)                                           |

#### AI Sparkle Color

| Rule                 | Correct                      | Common Violations Found                                                                                                                                                                                          |
| -------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI sparkle icon fill | `var(--hz-color-ai-sparkle)` | `fill="#25CB40"` hardcoded in SVG — found in ai-value-card.js, inventory-card.js, tasks-overview-card.js, priority-card.js, metric-card.js (6 instances across 5 files using `#25CB40`, `#25cb40`, or `#2cf44c`) |

#### Interactive Elements

| Rule                             | Correct                                               | Common Violations Found                                                                                             |
| -------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Arrow button border              | `border-base-300` or `var(--hz-color-border-default)` | `border-gray-200` (card.js line 99, metric-card.js line 112)                                                        |
| Arrow button text                | `var(--hz-color-text-muted)`                          | `text-slate-400` (card.js, metric-card.js)                                                                          |
| Chevron stroke in AI insight row | `var(--hz-color-text-muted)`                          | `stroke="#94a3b8"` hardcoded (ai-value-card.js line 81, inventory-card.js line 123, tasks-overview-card.js line 78) |

---

### Type A — Container Card Checks

#### Structural

- [ ] **Uses `aict-card` as wrapper:** The component imports and renders `<aict-card>`. It does not build a custom card shell.
- [ ] **Header props present:** `card-title` is set. `subtitle` is optional but recommended for context.
- [ ] **Body uses default slot:** Content is passed as children of `<aict-card>`, not hardcoded inside the card component.
- [ ] **Footer slot available:** `aict-card` provides a `<slot name="footer">` for action-sets or navigation elements. _(Currently MISSING — Decision 1 from Doc 55. Validator should flag this as a structural gap.)_
- [ ] **Radius not passed as prop:** The wrapper does NOT pass `radius="..."` to `aict-card`. Radius is derived from `var(--hz-radius-parent)` in CSS. _(Currently violated by every wrapper — all pass `radius="24px"` or `radius="32px"`.)_

#### Content

- [ ] **Title is concise:** Card title ≤ 4 words. Descriptive, not generic.
- [ ] **Subtitle provides context:** If present, subtitle clarifies scope or timeframe (e.g., "Total return on AI investment by your org").
- [ ] **Arrow button behavior is clear:** If `show-arrow` or `pop-out` is true, the action is navigation or expand — never a data mutation.

#### AI Insight Row (Sub-Pattern)

Present in: `aict-ai-value-card`, `aict-inventory-card`, `aict-tasks-overview-card`

- [ ] **Uses semantic tokens for colors:** Sparkle fill uses `var(--hz-color-ai-sparkle)`, text uses `var(--hz-color-text-link)`, chevron uses `var(--hz-color-text-muted)`. _(Currently all hardcoded — `#25CB40`, `text-sky-700`, `stroke="#94a3b8"`.)_
- [ ] **Has click handler or href:** If `cursor-pointer` is set, the element must be interactive. _(Currently: cursor-pointer is set but no `@click` handler in ai-value-card or inventory-card. tasks-overview-card also has no handler.)_
- [ ] **Markup is consistent across instances:** All three implementations should use identical structure. _(Currently: tasks-overview-card uses `gap-2 px-6 py-4 border-t border-slate-200 text-sm` while the other two use `gap-1.5 py-3 text-xs` — inconsistent gap, padding, font size, and border treatment.)_
- [ ] **AI insight row is in footer position:** When a named footer slot exists, this pattern should live there — not inline in the body slot.

#### Data Visualization (Sub-Pattern)

Present in: `aict-inventory-card`, `aict-strategy-card`, `aict-ai-value-card`

- [ ] **Datavis colors use token variables:** Visualization colors are set via `--datavis-qualitative-N` CSS variables. _(Currently done correctly — these are set as inline styles on the visualization component.)_
- [ ] **Hardcoded datavis colors come from data, not template:** When chart colors come from a data object (`seg.color`), the data source — not the template — is responsible for providing token-compliant values. _(Currently: inventory-card.js line 94 applies `seg.color` as an inline background — the data must provide compliant colors.)_
- [ ] **Chart fallback colors are token-compliant:** Fixed chart colors in templates should reference tokens. _(Currently: strategy-card.js hardcodes `#0AB8D9` and `#e4e4e7`; ai-value-card.js hardcodes `#4ade80`.)_

---

### Type B — Data Display Card Checks

#### Structural

- [ ] **Builds a complete card shell:** Even though Type B doesn't use `aict-card`, the card shell must follow the same token rules for background, border, and radius.
- [ ] **Uses `var(--hz-radius-parent)` for outer radius:** Not `rounded-[32px]` or any hardcoded value. _(metric-card.js uses `rounded-[32px]`.)_
- [ ] **Uses `var(--hz-color-border-default)` for border:** Not `border-[var(--base-300,#e2e8f0)]` with hardcoded fallback. _(metric-card.js line 93.)_
- [ ] **Uses `bg-base-100` for background:** Not `bg-white`. _(metric-card.js line 93.)_

#### Value Display

- [ ] **Large value uses `text-base-content`:** Not `text-slate-800`. The value is the primary content of the card — it must use the primary text token.
- [ ] **Font family references token:** If ServiceNow Sans is used for values, reference `var(--hz-font-family-heading)` or the font-servicenow Tailwind class. _(metric-card.js line 124 correctly uses `var(--now-font-family)` — but this is the legacy namespace, not `--hz-font-family-heading`.)_
- [ ] **Color prop is not exposed:** score-card.js accepts a `color` prop and applies it as inline style. Score values should derive color from status tokens based on the score's meaning (good/warning/critical), not from an arbitrary prop. _(score-card.js line 30: `this.color = '#1e293b'`.)_

#### Change Indicator

Present in: `aict-metric-card`

- [ ] **Positive change uses success token:** Background `var(--hz-color-status-success-subtle)`, text `var(--hz-color-status-success-text)`. _(Currently: `#dcfce7` background, `#16a34a` text — hardcoded.)_
- [ ] **Negative change uses error token:** Background `var(--hz-color-status-error-subtle)`, text `var(--hz-color-status-error-text)`. _(Currently: `#fee2e2` background, `#dc2626` text — hardcoded.)_

#### AI Badge

Present in: `aict-metric-card`

- [ ] **Badge gradient uses AI surface tokens:** `var(--hz-color-surface-ai-gradient-start)` and `var(--hz-color-surface-ai-gradient-end)`. _(Currently: hardcoded multi-stop gradient in CSS class `.ai-badge-gradient`.)_
- [ ] **Badge border uses AI sparkle token:** `var(--hz-color-ai-sparkle)`. _(Currently: `border-[#2cf44c]`.)_
- [ ] **Badge text uses semantic token:** `text-base-content` or `var(--hz-color-text-primary)`. _(Currently: `text-[#172b31]`.)_

#### Chart Colors

Present in: `aict-stat-card`

- [ ] **Default chart color uses token:** Bar, line, and donut chart colors should reference `var(--hz-color-status-success)` or a chart token — not hardcoded `#22c55e`. _(stat-card.js uses `#22c55e` as default in three render functions.)_
- [ ] **Donut track color uses token:** The background track of donut charts should use `var(--hz-color-border-default)` or equivalent. _(stat-card.js line 75: `stroke="#e2e8f0"`.)_

---

### Type C — Status/Priority Card Checks

#### Structural

- [ ] **Variant system uses semantic tokens:** The `primary` and `secondary` variants should reference surface and border tokens — not hardcoded CSS classes with hex values. _(Currently: `.priority-primary` and `.priority-secondary` are entirely hardcoded CSS.)_
- [ ] **Primary variant surface:** `var(--hz-color-surface-primary)` with `var(--hz-color-status-success-border)` border. _(Currently: `background: white`, `border: 1.5px solid #d1fae5`.)_
- [ ] **Secondary variant surface:** `var(--hz-color-surface-secondary)` with `var(--hz-color-border-default)` border. _(Currently: `background: #f8fafc`, `border: 1px solid #e2e8f0`.)_
- [ ] **Radius uses nested token:** `var(--hz-radius-nested)` (16px). _(Currently: hardcoded `16px` — correct value, wrong source.)_

#### Badge System

- [ ] **Task badge uses info tokens:** Background `var(--hz-color-status-info-subtle)`, text `var(--hz-color-status-info-text)`. _(Currently: `#e0f2fe`, `#0369a1`.)_
- [ ] **Expired badge uses error tokens:** Background `var(--hz-color-status-error-subtle)`, text `var(--hz-color-status-error-text)`. _(Currently: `#fee2e2`, `#dc2626`.)_
- [ ] **AI badge uses AI tokens:** Background `var(--hz-color-status-success-subtle)` or AI-specific token, text `var(--hz-color-status-success-text)`, border `var(--hz-color-status-success-border)`. _(Currently: `#f0fdf4`, `#15803d`, `#bbf7d0`.)_
- [ ] **Risk badge uses warning tokens:** Background `var(--hz-color-status-warning-subtle)`, text `var(--hz-color-status-warning-text)`. _(Currently: `#fef3c7`, `#92400e`.)_
- [ ] **Badge radius uses pill token:** `var(--hz-radius-pill)` or `rounded-full`. _(Currently: `9999px` hardcoded — correct value, should use token.)_

#### Text Colors

- [ ] **Title text:** `var(--hz-color-text-primary)` or `text-base-content`. _(Currently: `text-[#172b31]`.)_
- [ ] **Meta text (agent, assignee):** `var(--hz-color-text-secondary)`. _(Currently: `text-[#4a5e65]`.)_
- [ ] **Due status expired:** `var(--hz-color-status-error)`. _(Currently: inline style `color: #dc2626`.)_
- [ ] **Meta separator dot:** `var(--hz-color-text-muted)`. _(Currently: `bg-[#94a3b8]`.)_
- [ ] **AI insight text:** `var(--hz-color-text-secondary)`. _(Currently: `text-[#475569]`.)_

#### Action-Set Footer (Pending — Decision 1)

- [ ] **Completable entity cards have action-set:** If the card represents a completable entity (approval, task assignment), it should have an action-set footer. _(Currently: no card has an action-set. Priority card is the strongest candidate.)_
- [ ] **Action-set follows action-set composition recipe:** See `action-set.md` for button roles, ordering, and semantic color mapping.

---

### Resolution Guidance

#### Radius prop should be removed entirely

The `radius` prop on `aict-card` is the root cause of radius inconsistency. Every wrapper passes a different value (`"24px"`, `"32px"`). The fix is not to standardize the prop value — it's to remove the prop and apply `var(--hz-radius-parent)` in the card's CSS:

```css
.card {
  border-radius: var(--hz-radius-parent);
}
```

This single change:

- Removes 6 instances of `radius="24px"` from wrapper components
- Fixes the `radius="32px"` inconsistency in tasks-overview-card
- Makes radius token-governed and theme-switchable
- Eliminates the inline style on the card element

#### AI sparkle should be a shared SVG component or token-driven

The sparkle SVG with `fill="#25CB40"` is copy-pasted into 5 component files. The fix:

- Define `--hz-color-ai-sparkle` as a CSS custom property
- Either extract a shared `<aict-sparkle-icon>` Lit element, or use `aiux-icon` with the sparkle icon name and `style="color: var(--hz-color-ai-sparkle)"`
- Remove all inline SVG sparkle definitions

#### AI insight row should be a shared component

The AI insight row (sparkle + text + chevron) appears in three cards with inconsistent markup. The fix:

- Extract to a shared `<aict-ai-insight-row>` Lit element accepting `text` as a prop
- OR formalize as a named footer slot usage pattern in `aict-card`
- Standardize: `gap-1.5`, `py-3`, `text-xs`, no border-top (the card footer handles separation)
- Add a `@click` handler or `href` — `cursor-pointer` without interactivity is misleading

#### Type B cards should use a shared card shell

`aict-metric-card`, `aict-score-card`, and `aict-stat-card` each build their own card container. This means token fixes must be applied per-component instead of once. Options:

- **Option A:** Refactor to use `aict-card` as the container (preferred — inherits all token fixes)
- **Option B:** Extract a shared base CSS class that all card types consume
- **Option C:** Accept per-component maintenance and ensure each stays compliant

#### Priority card CSS should use tokens, not hardcoded classes

The `.priority-primary` and `.priority-secondary` CSS classes should be refactored to consume semantic tokens:

```css
.priority-primary {
  border: 1.5px solid var(--hz-color-status-success-border);
  border-radius: var(--hz-radius-nested);
  padding: 16px;
  background: var(--hz-color-surface-primary);
}

.priority-secondary {
  border: 1px solid var(--hz-color-border-default);
  border-radius: var(--hz-radius-nested);
  padding: 16px;
  background: var(--hz-color-surface-secondary);
}
```

Same visual result, but now dark mode, contrast modes, and white-label theming work automatically.

---

### Quick Check Protocol

**For Claude Code chat panel validation:**

When asked to check a card component:

1. Read the component source file
2. Classify by type (A, B, or C) using the classification hints
3. Run Surface & Token Rules (all types) first — these catch the most issues
4. Run type-specific checks
5. Respond in 3–7 sentences: type classification, top 3 token debt items, most impactful structural issue
6. Name exact lines and current values → correct token replacements

**Example quick check response:**

> This is a Type A container card (wraps `aict-card`). Three token issues: the sparkle SVG uses hardcoded `#25CB40` on line 66 — should be `var(--hz-color-ai-sparkle)`. Link text uses `text-sky-700` on line 64 — should be `var(--hz-color-text-link)`. Chevron uses `stroke="#94a3b8"` on line 81 — should be `var(--hz-color-text-muted)`. The AI insight row also has `cursor-pointer` but no click handler — either add interaction or remove the cursor style.

---

### Full Review Protocol

**For Claude project chat validation:**

When asked for a full card review, produce the structured checklist below. Run ALL applicable checks for the identified type.

**Output template:**

```
## Card Review — [Component Name]

**File:** [path]
**Type:** [A/B/C] — [Container/Data Display/Status]
**Identifying signals:** [what confirmed the type]

### Surface & Token Compliance
- [✅/❌] Background: [finding — current value → correct token]
- [✅/❌] Border: [finding]
- [✅/❌] Radius: [finding]
- [✅/❌] Primary text color: [finding]
- [✅/❌] Secondary text color: [finding]
- [✅/❌] Muted text color: [finding]
- [✅/❌] Link text color: [finding]
- [✅/❌] AI sparkle color: [finding]
- [✅/❌] Interactive element colors: [finding]

### Type-Specific Checks
[Checks from the applicable type section]

### Sub-Pattern Compliance
[AI insight row, change indicator, badge system, chart colors — as applicable]

### Structural Issues
[Footer slot, radius prop, shared component opportunities]

### Summary
- **Token debt items:** [count]
- **Structural issues:** [count]
- **Highest impact fix:** [the one change that fixes the most issues]

### Recommendations (prioritized)
1. [Highest impact — e.g., "Remove radius prop from aict-card, apply token in CSS"]
2. [Next — e.g., "Replace bg-white with bg-base-100 in card.js"]
3. [...]
```

---

### Proofing Checklist (for recipe authors)

Before shipping this composition recipe, verify:

- [ ] Every violation references a real file and line number from the current codebase
- [ ] Every "correct" value maps to a Doc 12 token or a DaisyUI semantic class
- [ ] Type classification hints correctly categorize all 10 audited components
- [ ] Resolution guidance covers the root cause, not just the symptom (radius prop, not radius value)
- [ ] Quick check protocol produces useful output in ≤ 7 sentences
- [ ] Full review template covers all checks with no gaps
- [ ] Cross-references to action-set recipe are accurate for the footer action-set section
- [ ] Token names use the `--hz-` namespace, not the legacy `--now-` or bare names

## HTML Reference

The HTML reference at `references/card-reference.html` is a **visual reference for validation only**. It shows what correct card compositions look like — use it to compare against designs and components, not as a code source.

**Do NOT** copy HTML or CSS from the reference into production components. The reference uses static hex values from `horizon-reference-theme.css` for standalone rendering. Production components use DaisyUI classes that resolve through the dynamic theme pipeline (`themeGenerator.js` → Leonardo → CSS variables). The class names are identical but the underlying token architecture is different.

**Use the reference to:** validate visual output, compare card types, verify token compliance, check slot structure.
**Use the recipe to:** generate or fix production code — it specifies DaisyUI classes, not CSS values.

## Context to Provide

- **Card type** — if known (Type A container, Type B data display, Type C status/priority). If not provided, the validator classifies from the source.
- **Entity characteristic** — completable, editable, etc. (relevant for Type C action-set footer validation)
- **Product context** — AICT, CBS, etc. (relevant for federation tokens and chart colors)
