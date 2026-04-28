---
name: contextual-actions-compositions
description: Validates contextual actions compositions — quick actions, quick links, and filter pills that provide context-sensitive navigation and filtering within cards and panels.
metadata:
  author: servicenow
  version: '1.0.0'
compatibility: Works with Claude Code, Cursor, VS Code Copilot, Windsurf, Gemini CLI, and other Agent Skills-compatible tools
license: MIT
---

# Contextual Actions — Composition Skill

## Purpose

Validates contextual action compositions — groups of equal-weight peer buttons representing available operations within a section's context. Covers button uniformity, overflow handling, icon token compliance, ARIA toolbar structure, and context-specific rules.

**This is NOT for workflow decisions.** If the button group has a call to action (one button that advances, completes, or decides), use the action-set composition instead.

## When to Use

- Validating a quick-actions bar, filter controls, toolbar, or card-level action group
- Building a new set of contextual actions for a section
- Determining whether a button group is contextual actions or an action-set
- Checking that overflow menus follow the correct ARIA pattern

## Contextual Actions — Composition Recipe

**Composition:** contextual-actions
**Maturity:** 2b (executable — supports agent validation)
**Components used:** button, popover/menu (overflow)
**Related composition:** action-set-composition

---

### Purpose

Contextual actions are a group of peer buttons representing available operations within a section's context. They answer: **"What can I do here?"**

There is no call to action. No button is more important than the others. The user is browsing, filtering, sorting, navigating, or launching — not completing, deciding, or progressing through a workflow.

This composition governs button treatment, grouping, overflow, icon usage, and ARIA structure. It does NOT govern workflow decision buttons — those are action-sets (different recipe, different rules).

---

### How to Distinguish from an Action Set

This is the first thing the validator checks.

|                      | Action Set                                         | Contextual Actions                                                          |
| -------------------- | -------------------------------------------------- | --------------------------------------------------------------------------- |
| **User moment**      | Deciding, completing, progressing                  | Exploring, filtering, navigating, launching                                 |
| **Call to action**   | Yes — one button is the forward action             | No — all buttons are options                                                |
| **Visual hierarchy** | Weighted — buttons have different classes per role | Flat — all buttons use the same class                                       |
| **Position**         | Footers (card, form, modal, panel)                 | Inline (below search bars, above lists, in section headers, within content) |

**Classification test:**

1. Is there a call to action — one button the interface is asking the user to click to advance, complete, or decide? → **Action Set** → use action-set recipe
2. Are all buttons equal-weight options the user can choose from? → **Contextual Actions** → use this recipe
3. Do the buttons use mixed DaisyUI variants (`btn-primary`, `btn-success`, `btn-error`, `btn-soft`, `btn-outline`)? → **Action Set** — different variants signal different roles
4. Do all buttons use the same variant (`btn-ghost` or `btn-outline`)? → **Contextual Actions** — uniform treatment signals peer actions

If the validator identifies mixed variants but no clear forward action, flag it: "These buttons have different visual weights but no clear call to action. Either one should be promoted to a forward action (making this an action-set) or all should use the same treatment (making these contextual actions)."

---

### Button Treatment

#### Uniform Class

All contextual action buttons use the **same DaisyUI variant**. The variant choice depends on the visual context:

| Context                                                              | Button Class                                                                                                          | Why                                                                                                          |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Below a search bar, within a card, or any context (suggestion chips) | Custom pill: `rounded-full`, padding `4px 12px 4px 4px`, 32px circular icon container (`text-primary`, no bg), gap: 0 | Lightweight, non-competing with surrounding content. Pill shape with icon container signals "tap to invoke." |
| Above a list or table (filter/sort controls)                         | `btn btn-ghost btn-sm` or `btn btn-outline btn-sm`                                                                    | Compact, functional. Outline variant when the controls need more visibility against the background.          |
| Inside a card header (card-level actions)                            | `btn btn-ghost btn-sm btn-circle` or `btn btn-ghost btn-sm`                                                           | Minimal — shouldn't compete with card content. Circle variant for icon-only actions.                         |
| In a toolbar (persistent control bar)                                | `btn btn-ghost btn-sm`                                                                                                | Uniform within the toolbar. Active state via `btn-active` class, not a different variant.                    |

**Key rule:** Never mix variants within a contextual actions group. If one button is `btn-ghost` and another is `btn-outline`, either they should all match or one of them has a different role (and this is an action-set, not contextual actions).

#### Icon + Label Pattern

Most contextual actions have an icon alongside the label. For AI suggestion quick actions, the Figma spec defines:

```html
<button class="quick-action-item">
  <!-- rounded-full, padding: 8px 12px 8px 4px, gap: 0 -->
  <div class="quick-action-icon text-primary">
    <!-- 32px, rounded-full, no bg -->
    [icon svg, stroke="currentColor"]
  </div>
  [label text]
  <!-- font-sans, font-medium, text-xs, text-tertiary -->
</button>
```

**Icon rules:**

- For AI suggestions: icon sits inside a 32px circular container with `text-primary` and no background. SVG uses `stroke="currentColor"` to inherit. Each action has a **distinct icon** — not all the same. No gap between icon and label — the container's size provides spacing.
- Overflow "More" button: same primary teal color, 32px circle, horizontal dots icon, with hover/active states matching the action items
- For other contexts (toolbars, card headers): icon is bare SVG using `currentColor`, no container
- Icon is leading (before label), not trailing
- Icon is decorative (supplements the label) — add `aria-hidden="true"` to SVG icons
- Icon-only buttons (no visible label) MUST have `aria-label`

#### Button Size

Contextual actions are always compact relative to their surroundings. They should not visually compete with primary content.

| Density            | Button Size | Notes                                                                           |
| ------------------ | ----------- | ------------------------------------------------------------------------------- |
| `density-compact`  | `btn-xs`    | Smallest — for dense data environments                                          |
| `density-default`  | `btn-sm`    | Standard for contextual actions                                                 |
| `density-spacious` | `btn-sm`    | No size increase — spacious density adds container spacing, not larger controls |

Note: contextual actions use `btn-sm` (or `btn-xs`) even at default density. Full-size `btn` is reserved for action-set forward actions. This visual size difference reinforces the distinction — contextual actions are secondary to the content they serve.

---

### Layout Rules

#### Arrangement

- **Direction:** Horizontal. Wraps to next line if the container is too narrow (use `flex-wrap`).
- **Alignment:** Left-aligned or center-aligned within section, depending on context. NOT right-aligned (right-alignment signals action-set footer behavior).
- **Gap:** `gap-1.5` (6px) or `gap-2` (8px) between buttons. Tighter than action-set gap because these are smaller, denser controls.
- **No spacers:** All buttons are peers — no flex spacer separating any button from the group.

#### Overflow

When the number of actions exceeds the visible limit (`max_visible` from API or design decision), overflow actions collapse into a "More" menu.

**Overflow trigger:** A button matching the same visual treatment as the inline actions, with a vertical ellipsis (dots) icon and "More" label.

```html
<button
  class="btn btn-ghost btn-sm rounded-full gap-1.5 text-xs font-normal"
  aria-haspopup="true"
  aria-expanded="false"
>
  [dots icon] More
</button>
```

**Overflow menu:** A popover with `role="menu"` containing `role="menuitem"` buttons.

```html
<div
  popover="auto"
  role="menu"
  class="bg-base-100 border border-base-300 rounded-xl"
>
  <button role="menuitem" class="...">[icon] [label]</button>
  <!-- more items -->
</div>
```

**Overflow rules:**

- Any action can overflow — there's no priority hierarchy (unlike action-sets where forward and destructive actions always stay visible)
- The overflow trigger uses the same size, variant, and shape as the inline buttons
- The overflow trigger has `aria-haspopup="true"` and tracks `aria-expanded`
- Menu items use `role="menuitem"` because these are actions (not value selection — that would be `role="option"`)
- The overflow menu uses `role="menu"` (actions), not `role="listbox"` (value selection)

#### Grouping

When contextual actions fall into logical subgroups (e.g., filter actions vs. sort actions vs. view actions), separate the groups visually:

- Use a subtle divider (`border-l border-base-300 h-4 self-center`) between groups, OR
- Use spacing (`gap-4` between groups, `gap-1.5` within groups)
- Do NOT use different button variants to distinguish groups — variant uniformity is the defining rule

For accessibility, wrap each logical subgroup in a container with `role="toolbar"` and `aria-label` describing the group's purpose. If there's only one group, the entire set gets `role="toolbar"`.

---

### ARIA Structure

#### Single Group (Most Common)

```html
<div role="toolbar" aria-label="Quick actions">
  <button class="btn btn-ghost btn-sm rounded-full" aria-hidden-icon>
    [icon] Help me manage assets
  </button>
  <button class="btn btn-ghost btn-sm rounded-full">
    [icon] Show high risk assets
  </button>
  <!-- overflow trigger if needed -->
</div>
```

#### Multiple Subgroups

```html
<div role="toolbar" aria-label="List controls">
  <div role="group" aria-label="Filters">
    <button class="btn btn-ghost btn-sm">Active</button>
    <button class="btn btn-ghost btn-sm">Pending</button>
    <button class="btn btn-ghost btn-sm">All</button>
  </div>
  <div class="border-l border-base-300 h-4 self-center"></div>
  <div role="group" aria-label="Sort">
    <button class="btn btn-ghost btn-sm">Newest</button>
    <button class="btn btn-ghost btn-sm">Priority</button>
  </div>
</div>
```

#### Keyboard Model

The toolbar ARIA pattern uses a **single tab stop** for the group:

- **Tab** moves focus INTO the toolbar (lands on first or last-focused button), then OUT
- **Arrow keys** (Left/Right for horizontal, Up/Down for vertical) move between buttons within the toolbar
- **Home/End** (optional) jump to first/last button
- This is different from an action-set, where each button is its own tab stop

---

### Token Compliance

These checks apply to all contextual action implementations.

#### Icon Colors

| Rule                      | Correct                                                                             | Common Violation                                                     |
| ------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| AI suggestion action icon | `text-primary` class on 32px container, SVG uses `stroke="currentColor"` to inherit | `style="color:#25CB40"` hardcoded (quick-actions-widget.js line 217) |
| Generic action icon       | `currentColor` (inherits button text color)                                         | Hardcoded hex on SVG fill or stroke                                  |

#### Text Colors

| Rule                    | Correct                                                                    | Common Violation                                               |
| ----------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Button text             | `text-tertiary` for AI suggestions, `text-base-content` for other contexts | `text-slate-700` (quick-actions-widget.js line 213)            |
| Overflow menu item text | `text-base-content`                                                        | — (quick-actions-widget.js correctly uses `text-base-content`) |

#### Surface Colors (Overflow Menu)

| Rule             | Correct           | Common Violation            |
| ---------------- | ----------------- | --------------------------- |
| Menu background  | `bg-base-100`     | — (correct in current code) |
| Menu border      | `border-base-300` | — (correct in current code) |
| Menu item hover  | `bg-base-200`     | — (correct in current code) |
| Menu item active | `bg-base-300`     | — (correct in current code) |

#### Radius

| Rule                    | Correct                                   | Common Violation                                                                                                      |
| ----------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Pill-shaped buttons     | `rounded-full`                            | — (correct)                                                                                                           |
| Overflow menu container | `rounded-xl` or `var(--hz-radius-nested)` | `rounded-3xl` (quick-actions-widget.js line 238 — 24px is `--hz-radius-parent`, not appropriate for a nested popover) |

---

### Context Variants

Contextual actions adapt to their section. The buttons are the same — the context determines content and icon treatment.

#### AI-Powered Suggestions (Quick Actions Bar)

AI-generated or curated action suggestions. Can appear below a search input, within a card, or anywhere contextual actions are needed.

**Button spec:**

- Shape: `rounded-full` (pill) with asymmetric padding — `4px` left, `12px` right, `8px` top/bottom
- Label: `font-sans`, `font-medium` (500), `text-xs`, `leading-sm`
- Color: `text-tertiary`

**Icon spec:**

- 32×32px circular container (`rounded-full`) with `text-primary` color, no background
- Icon uses `stroke="currentColor"` to inherit the primary color
- No explicit gap between icon container and label — the container's built-in size provides spacing

**Behavior:**

- Actions may be `now_assist` (launches agent), `navigate` (goes to filtered view), or `popup` (opens modal)
- Each action has a **distinct icon** reflecting its content — not all the same icon
- Overflow via "More" button — horizontal dots, icon-only (`btn-circle`), with `aria-label`

#### Filter Controls

Position: above a list or table. Actions filter the visible data.

- Pill-shaped chips (`rounded-full`, border, padding `8px 16px`) — NOT DaisyUI `btn` classes
- Active filter: filled dark background (`base-content` bg, `base-100` text), toggled via `aria-pressed="true"`
- Inactive filter: outlined (border `base-300`, transparent background)
- All pills are the same shape and size — the fill/outline toggle is the only visual difference
- Consider whether this is actually a **tab pattern** (switches content panels) rather than contextual actions (filters a single list). Test: does clicking change which data set is shown (tabs) or filter the same data set (contextual actions)?
- Mutually exclusive: only one filter active at a time. Active state uses `aria-pressed="true"`, all others `aria-pressed="false"`

#### Toolbar Actions

Position: persistent bar above content. Actions operate on the content below.

- Icons are typically present without labels (space-constrained)
- Icon-only buttons MUST have `aria-label`
- Active tools use `btn-active` class
- Wrap in `role="toolbar"` with `aria-label`

#### Card-Level Actions

Position: inside a card header, alongside the title.

- Typically icon-only (`btn-circle btn-ghost btn-sm`)
- Gap between icon buttons: `gap-3` (12px)
- Arrow/expand button is navigation, not a contextual action — it follows the card recipe's header rules
- Additional actions (bookmark, share, pin, filter, refresh) are contextual actions
- Each icon-only button MUST have `aria-label`

---

### Card Container Rules

**Any contextual actions rendered inside a card MUST include a section header.** This applies to quick links (grid and list), shortcut launchers, and any tile-based contextual actions within a card.

#### Required Header Structure

```html
<div class="flex items-center justify-between mb-4">
  <h3 class="text-sm font-semibold text-base-content">[Section title]</h3>
  <button
    class="btn btn-ghost btn-sm btn-circle"
    aria-label="View all [section]"
  >
    [arrow icon]
  </button>
</div>
```

- **Title:** Short, descriptive label for the action group (e.g., "Quick links", "Quick actions", "Shortcuts")
- **Arrow button:** Links to a full view of all available items. Icon-only with `aria-label`. Optional only if the card shows all items with no overflow possible.
- **No header = violation.** Contextual actions floating inside a card without a title have no semantic context. The user doesn't know what the group represents or where to find more.

#### Card-Contained Variant Matching

When contextual actions appear inside a card, the validator must match them to a defined variant and enforce that variant's treatment. The variants for card-contained contextual actions are:

| Pattern                             | Variant            | Treatment                                                                               |
| ----------------------------------- | ------------------ | --------------------------------------------------------------------------------------- |
| Icon + label tiles in a grid        | Quick Links (grid) | 48px icon container, `background-primary` + `border-base-300`, `rounded-lg`, 3+ columns |
| Icon + label rows with dividers     | Quick Links (list) | 36px icon container, same surface/border treatment, vertical stack with dividers        |
| Icon-only buttons in the header row | Card-Level Actions | `btn-circle btn-ghost btn-sm`, `gap-3`, `aria-label` on each                            |

**If the implementation doesn't match any defined variant, flag it as a violation — not a "deviation worth noting."** The validator should identify which variant is closest and provide specific remediation to match it.

Example: A card containing four large icon-tile shortcuts ("Add AI asset", "Create rule", etc.) should match the **Quick Links (grid)** variant — including the section header, the icon container spec (48px, `background-primary` + `border-base-300`, `rounded-lg`), and the grid layout. If the tiles use a different size, different radius, or missing borders, those are token/structure violations against the quick links spec, not acceptable deviations.

---

#### Quick Links (Grid and List)

Position: inside a card. Navigation shortcuts displayed as icon + label tiles (grid) or icon + label rows (list).

- These are navigational — use `<a href>` tags, not `<button>`. For action launchers (create, add), use `<button>`.
- **Card header required** — per Card Container Rules above
- **Grid layout:** 3+ column grid of tiles. Each tile has an icon container (48×48px, `background-primary` with `border-base-300`, `rounded-lg`) and a short label (11px, 2-line truncation with `text-overflow: ellipsis`)
- **List layout:** Same tile concept as grid but stacked vertically — icon left, label right, dividers between rows. Each row has a smaller icon container (36×36px, same `background-primary` + border treatment) and a single-line label. This is NOT a semantic `<ul>/<li>` list.
- **Dividers:** List layout uses DaisyUI `divider` between each item for visual separation
- **Spec warning:** Figma spec may reference `primary-content` for the icon container background — this is a spec error. `primary-content` is a text color token (white) that doesn't change in dark mode. Use `background-primary` (same surface as the card container).
- Grid vs. list choice: grid for short labels and wider cards; list for longer labels or narrow cards
- Both layouts use `role="toolbar"` — neither is a semantic list. Do not use `<ul>/<li>` or `role="list"`
- Disabled items use `opacity-40` and `aria-disabled="true"` — they remain visible but non-interactive

---

### Validation Checks

#### Classification

- [ ] **Not an action-set:** No button uses `btn-primary`, `btn-success`, `btn-error`, or `btn-soft`. No button is a clear forward action. If any button has a different variant, flag for reclassification.
- [ ] **Uniform variant:** All buttons use the same DaisyUI variant (typically `btn-ghost` or `btn-outline`). Mixed variants within the group are a violation.

#### Structure

- [ ] **Buttons are peers:** No button is visually heavier than the others. No spacer separates any button. No button is positioned differently to signal importance.
- [ ] **Overflow trigger matches peers:** If there's a "More" button, it uses the same size, variant, and shape as the inline buttons. It should not use a different variant (e.g., `btn-outline` when others are `btn-ghost`).
- [ ] **Max visible respected:** If the API or design specifies a `max_visible` count, only that many actions are shown inline. The rest are in the overflow menu.
- [ ] **Card container has section header:** If contextual actions are inside a card, a section header (title + optional arrow button) must be present above the actions. Contextual actions floating inside a card without a title are a violation.
- [ ] **Matches a defined variant:** If the actions are inside a card, the treatment must match one of the defined card-contained variants (quick links grid, quick links list, or card-level actions). Custom tile layouts, non-standard sizing, or ad-hoc icon treatments that don't match a variant are violations — identify the closest variant and remediate to match.

#### Token Compliance

- [ ] **No hardcoded icon colors:** Icon colors use DaisyUI classes (`text-primary` for AI suggestions) or `currentColor`, not hardcoded hex. _(quick-actions-widget.js line 217: `style="color:#25CB40"` is a violation.)_
- [ ] **No hardcoded text colors:** Button text uses `text-tertiary` (AI suggestions) or `text-base-content` (other contexts), not Tailwind Slate classes. _(quick-actions-widget.js line 213: `text-slate-700` is a violation.)_
- [ ] **Overflow menu radius correct:** Nested popover uses `var(--hz-radius-nested)` (16px) or equivalent, not `var(--hz-radius-parent)` (24px). _(quick-actions-widget.js line 238: `rounded-3xl` = 24px, should be `rounded-xl` = 16px for a nested element.)_

#### Accessibility

- [ ] **Group has `role="toolbar"`:** The button container has `role="toolbar"` with `aria-label` describing the group. _(quick-actions-widget.js: missing — buttons are loose in a flex container.)_
- [ ] **Decorative SVG icons have `aria-hidden="true"`:** Inline SVG icons that supplement a text label must be hidden from screen readers. _(quick-actions-widget.js: missing on all inline icons.)_
- [ ] **Icon-only buttons have `aria-label`:** Buttons without visible text must have `aria-label`. _(N/A for quick-actions — all have labels. Check if this applies in the specific instance.)_
- [ ] **Overflow trigger has `aria-haspopup` and `aria-expanded`:** _(quick-actions-widget.js: correctly implemented.)_
- [ ] **Overflow menu has `role="menu"` with `role="menuitem"` children:** _(quick-actions-widget.js: correctly implemented.)_
- [ ] **Active filter state uses `aria-pressed`:** If pills represent mutually exclusive filter options, the active pill has `aria-pressed="true"` and all others have `aria-pressed="false"`. CSS uses the `[aria-pressed="true"]` selector to drive the filled visual state — no separate active class needed.

#### Content

- [ ] **Labels are concise:** ≤ 5 words for action labels. Quick action prompts (natural language) may be longer but should still be scannable.
- [ ] **Labels describe the action:** Each label clearly communicates what happens when clicked. Vague labels ("More info", "Click here") are violations.
- [ ] **Icons supplement, don't replace:** Every button with an icon also has a text label (unless it's icon-only with `aria-label`). Icons alone are insufficient for comprehension.

---

### Resolution Guidance

#### Mixed variants in the group

If one button is `btn-outline` while others are `btn-ghost`, either make them all the same (contextual actions) or identify which one is the forward action and apply the action-set recipe instead. The validator should ask: "Is [button name] more important than the others? If yes, this is an action-set. If no, make it match."

#### Missing `role="toolbar"`

Wrap the button container:

```html
<!-- Before (wrong) -->
<div class="flex gap-1.5">
  <button class="btn btn-ghost btn-sm rounded-full">Action 1</button>
  <button class="btn btn-ghost btn-sm rounded-full">Action 2</button>
</div>

<!-- After (correct) -->
<div role="toolbar" aria-label="Quick actions" class="flex gap-1.5">
  <button class="btn btn-ghost btn-sm rounded-full">Action 1</button>
  <button class="btn btn-ghost btn-sm rounded-full">Action 2</button>
</div>
```

Adding `role="toolbar"` tells screen readers this is a grouped set of controls. The `aria-label` describes what the toolbar contains. Arrow key navigation within the toolbar follows the ARIA toolbar pattern — implement a roving tabindex so only one button is in the tab order at a time.

#### Hardcoded icon colors

For AI suggestion quick actions, replace the inline color span with a 32px circular icon container using DaisyUI classes:

```html
<!-- Before (wrong) -->
<span style="color:#25CB40">[bare SVG icon]</span>

<!-- After (correct) -->
<div class="quick-action-icon text-primary">
  <!-- 32px, rounded-full, no bg -->
  <svg stroke="currentColor" ...>[icon]</svg>
</div>
```

For other contextual action contexts (toolbars, card headers), use `currentColor` on the SVG and let it inherit from the button text color.

#### Missing card section header

Card-contained contextual actions need a header for semantic context:

```html
<!-- Before (wrong — actions floating in card with no context) -->
<div class="card p-5">
  <div class="grid grid-cols-4 gap-4">[action tiles with no title above]</div>
</div>

<!-- After (correct — header provides context) -->
<div class="card p-5">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-sm font-semibold text-base-content">Quick actions</h3>
    <button
      class="btn btn-ghost btn-sm btn-circle"
      aria-label="View all actions"
    >
      [arrow icon]
    </button>
  </div>
  <div role="toolbar" aria-label="Quick actions" class="grid grid-cols-3 gap-1">
    [action tiles]
  </div>
</div>
```

#### Non-standard variant treatment in card

If contextual actions inside a card use a custom tile layout that doesn't match a defined variant (quick links grid, quick links list, card-level actions), remediate to the closest variant:

- Large icon tiles in a grid → match **Quick Links (grid)** — 48px icon container with `background-primary` + `border-base-300` + `rounded-lg`, section header, `role="toolbar"`
- Rows with icons and labels → match **Quick Links (list)** — 36px icon container, dividers, section header
- Icon-only buttons in the header → match **Card-Level Actions** — `btn-circle btn-ghost btn-sm`, `gap-3`, `aria-label`

Do not treat non-standard treatments as acceptable deviations. The variant library defines the approved patterns — implementations should match one of them.

#### Overflow menu radius too large

The overflow popover is a nested element. Per the radius hierarchy (Doc 12), nested elements use `var(--hz-radius-nested)` (16px), not `var(--hz-radius-parent)` (24px). Change `rounded-3xl` to `rounded-xl`.

#### Filter buttons without active state

Filter pills need both a visual indicator and an ARIA indicator. Use `aria-pressed` to drive both — the CSS selector `[aria-pressed="true"]` fills the pill dark, and screen readers announce the pressed state. Without `aria-pressed`, sighted users may see which filter is active but screen reader users cannot determine the current state.

```html
<!-- Before (wrong — visual only, no ARIA) -->
<button class="filter-pill" style="background: dark; color: white;">All</button>
<button class="filter-pill">Active</button>

<!-- After (correct — aria-pressed drives visual + accessible state) -->
<button class="filter-pill" aria-pressed="true">All</button>
<button class="filter-pill" aria-pressed="false">Active</button>
```

---

### Quick Check Protocol

When asked to validate contextual actions:

1. Confirm classification — are these contextual actions (equal-weight peers) or an action-set (weighted with a forward action)?
2. Check variant uniformity — all buttons same treatment?
3. If inside a card — is there a section header? Does the treatment match a defined variant (quick links grid/list, card-level actions)?
4. Check token compliance — hardcoded colors on icons or text?
5. Check ARIA — `role="toolbar"` present? Decorative icons hidden?
6. Respond in 3–7 sentences
7. End with one fix prompt for the highest-priority finding

**Example quick check response:**

> These are contextual actions — four equal-weight shortcut launcher tiles with no forward action. Classification is correct. Two issues: the tile container is missing `role="toolbar"` with `aria-label`, and the card has no section header above the tiles. The tile treatment should match the Quick Links (grid) variant — 48px icon containers with `background-primary` + `border-base-300`.
>
> **Fix first:**
>
> ```
> Add a section header above the tile grid — title left ("Quick actions"), arrow button right. Then add role="toolbar" and aria-label="Quick actions" to the tile container. Reference the Card Container Rules section of the contextual-actions recipe.
> ```

---

### Full Review Protocol

When asked for a thorough review:

1. Confirm classification with reasoning
2. Run all validation checks
3. Produce structured checklist

**Output template:**

```
## Contextual Actions Review — [Location / Component]

**File:** [path]
**Classification:** Contextual Actions (equal-weight peers, no forward action)
**Context variant:** [AI suggestions / filter controls / toolbar / card-level actions / quick links grid / quick links list]
**Button count:** [N inline + M overflow]
**Uniform variant:** [yes/no — which variant]
**Inside card:** [yes/no]

### Classification
- [✅/❌] Not an action-set: [finding]
- [✅/❌] Uniform variant: [finding]

### Structure
- [✅/❌] Buttons are peers: [finding]
- [✅/❌] Overflow trigger matches peers: [finding]
- [✅/❌] Max visible respected: [finding]
- [✅/❌/N/A] Card section header present: [finding — N/A if not inside a card]
- [✅/❌/N/A] Matches defined variant: [finding — which variant, or which is closest if non-standard]

### Token Compliance
- [✅/❌] No hardcoded icon colors: [finding]
- [✅/❌] No hardcoded text colors: [finding]
- [✅/❌] Overflow menu radius correct: [finding]

### Accessibility
- [✅/❌] Group has role="toolbar": [finding]
- [✅/❌] Decorative SVG icons have aria-hidden: [finding]
- [✅/❌] Icon-only buttons have aria-label: [finding]
- [✅/❌] Overflow trigger has aria-haspopup + aria-expanded: [finding]
- [✅/❌] Overflow menu has role="menu" + role="menuitem": [finding]
- [✅/❌] Active state uses aria-pressed (if filter context): [finding]

### Content
- [✅/❌] Labels concise: [finding]
- [✅/❌] Labels describe the action: [finding]
- [✅/❌] Icons supplement, don't replace: [finding]

### Recommendations (prioritized)

Each recommendation includes a ready-to-run fix prompt. For code validation, fix prompts reference the component file and recipe. For Figma validation, fix prompts describe the design change.

**For code validation:**

1. **[Critical]** [Description of finding]
   **Fix prompt:**
```

./skills/nexus/skills/contextual-actions-compositions/skill.md
@[path/to/component.js]
[Specific instruction referencing the recipe section that governs this fix]

```

2. **[High]** [Description]
**Fix prompt:**
```

[Next fix instruction]

```

**For Figma validation:**

1. **[Critical]** [Description of finding]
**Fix prompt:**
> [Plain-language instruction describing what to change in the design,
> referencing the specific recipe rule]

2. **[High]** [Description]
**Fix prompt:**
> [Next design change instruction]
```

---

### Proofing Checklist (for recipe authors)

- [ ] Classification test clearly distinguishes from action-set — no ambiguity
- [ ] Every token violation references a real file and line number from the current codebase
- [ ] Context variants cover the common placements (AI suggestions, filters, toolbar, card-level, quick links grid/list)
- [ ] Card container rules enforced — section header required, variant matching enforced (not suggested)
- [ ] ARIA guidance references the toolbar pattern from the APG, not a custom invention
- [ ] Overflow rules cover both the trigger button and the menu structure
- [ ] Quick check protocol produces useful output in ≤ 7 sentences + one fix prompt
- [ ] Full review recommendations each include a ready-to-run fix prompt (code or Figma)
- [ ] Full review template covers all validation checks with no gaps

## HTML Reference

The HTML reference at `references/contextual-actions-reference.html` is a **visual reference for validation only**. It shows what correct contextual-action compositions look like — use it to compare against designs and components, not as a code source.

**Do NOT** copy HTML or CSS from the reference into production components. The reference uses static hex values from `horizon-reference-theme.css` for standalone rendering. Production components use DaisyUI classes that resolve through the dynamic theme pipeline (`themeGenerator.js` → Leonardo → CSS variables). The class names are identical but the underlying token architecture is different.

**Use the reference to:** validate visual output, compare variant treatments, verify icon specs, check ARIA structure.
**Use the recipe to:** generate or fix production code — it specifies DaisyUI classes, not CSS values.

## Context to Provide

- **Context variant** — AI suggestions, filter controls, toolbar, or card-level actions (determines icon and layout expectations)
- **Density mode** — compact, default, spacious (affects button size)
- **Whether overflow exists** — are there more actions than visible buttons? (determines whether overflow checks apply)
