---
name: action-set-compositions
description: Validates action set compositions — button groups representing available actions for a content unit (card, form, panel, modal footers). Covers button roles, ordering, semantic color by entity context, spacing, and accessibility.
metadata:
  author: servicenow
  version: '1.0.0'
compatibility: Works with Claude Code, Cursor, VS Code Copilot, Windsurf, Gemini CLI, and other Agent Skills-compatible tools
license: MIT
---

# Action Set — Composition Skill

## Purpose

Validates action set compositions — button groups representing available actions for a content unit (card footer, form footer, panel footer, modal footer). Covers button roles, ordering, semantic color by entity context, spacing, content rules, and accessibility.

## When to Use

- Validating an existing component that contains a button group
- Building a new action set for a card, form, or panel
- Reviewing whether buttons are arranged correctly for the entity type (approval, edit, submit, delete)

## Action Set Composition

**Composition:** action-set
**Maturity:** 2b (executable — supports agent validation)
**Components used:** button
**Cross-cutting patterns:** status-colors

---

### Purpose

An action set is a horizontal group of buttons representing the available actions for a content unit — a card, a form, a panel, or a modal. It answers: "What can I do here?"

This composition governs button selection, ordering, spacing, and semantic color assignment. Individual button styling follows the button component sheet. This recipe governs how buttons assemble.

---

### Button Roles

Every button in an action set fills exactly one role. The role is determined by what the action **means**, not by preference or visual weight. The role determines the DaisyUI class, position, and pairing rules.

#### Six Roles

| Role            | Signal to User                             | DaisyUI Class               | Limit  | When to Use                                                                                                                                     |
| --------------- | ------------------------------------------ | --------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primary**     | "Move forward" — progression               | `btn btn-primary`           | 0 or 1 | The action advances the user through a workflow without resolving it. The outcome is a state change.                                            |
| **Completion**  | "Resolve this positively" — affirmation    | `btn btn-success`           | 0 or 1 | The action completes, resolves, approves, or accepts something. The outcome closes a loop.                                                      |
| **Rejection**   | "Resolve this negatively" — active refusal | `btn btn-error`             | 0 or 1 | The action is a deliberate negative decision with consequences. The other party is affected. The workflow progresses in the negative direction. |
| **Dismissive**  | "Exit without deciding" — escape           | `btn btn-soft`              | 0 or 1 | The user leaves without making a decision. No consequence to anyone. Nothing changes.                                                           |
| **Secondary**   | "Other options" — supporting               | `btn btn-outline`           | 0–2    | Useful but not the main purpose of this context.                                                                                                |
| **Destructive** | "Remove permanently" — irreversible loss   | `btn btn-outline btn-error` | 0 or 1 | The action permanently deletes, removes, or revokes something. Always separated from other buttons.                                             |

#### Critical Distinctions

**Primary vs. Completion — "Am I moving forward or finishing?"**

This is the most important distinction. It determines whether the forward action is teal (`btn-primary`) or green (`btn-success`). The test:

- _Does the action resolve something? Is someone waiting for this decision? Does a workflow close when this is clicked?_ → **Completion** → `btn btn-success`
- _Does the action save progress, advance a step, or create something new? Does the workflow continue after this?_ → **Primary** → `btn btn-primary`

| Action              | Role       | Why                                                                                     |
| ------------------- | ---------- | --------------------------------------------------------------------------------------- |
| Approve             | Completion | The approval request is resolved. The requester is notified.                            |
| Save                | Primary    | The record is updated, but no workflow resolves. The user continues working.            |
| Submit              | Primary    | The form is sent for processing. The workflow continues — someone else acts on it next. |
| Resolve (incident)  | Completion | The incident is closed. The affected user is notified.                                  |
| Accept (invitation) | Completion | The invitation is resolved. The inviter is notified.                                    |
| Create              | Primary    | A new record is created. The workflow is just starting, not ending.                     |
| Answer (call)       | Completion | The call request is resolved. The caller is connected.                                  |
| Apply (settings)    | Primary    | Settings are saved. No one else is affected. No loop closes.                            |

**Rejection vs. Dismissive — "Am I deciding or leaving?"**

Both are "not the forward action." The test:

- _Does someone else experience a consequence? Does the workflow progress (negatively)?_ → **Rejection** → `btn btn-error`
- _Does nothing change? Can I come back and decide later? Is this just closing a window?_ → **Dismissive** → `btn btn-soft`

| Action               | Role       | Why                                                                               |
| -------------------- | ---------- | --------------------------------------------------------------------------------- |
| Reject (approval)    | Rejection  | The requester is notified. The request is denied. Workflow progresses negatively. |
| Decline (call)       | Rejection  | The caller goes to voicemail. They experience a consequence.                      |
| Deny (permission)    | Rejection  | The requesting system is blocked. Consequence is real.                            |
| Cancel (form)        | Dismissive | The form is abandoned. No one is affected. Nothing changes.                       |
| Close (modal)        | Dismissive | The modal closes. No decision was made.                                           |
| Back (wizard)        | Dismissive | The user returns to the previous step. No consequence.                            |
| Skip (optional step) | Dismissive | The step is bypassed. Can be revisited.                                           |

**Rejection vs. Destructive — "Am I refusing or destroying?"**

Both use error color but serve different purposes and have different visual treatments:

|                   | Rejection                              | Destructive                              |
| ----------------- | -------------------------------------- | ---------------------------------------- |
| **Signal**        | Negative decision                      | Permanent removal                        |
| **Class**         | `btn btn-error` (filled)               | `btn btn-outline btn-error` (outlined)   |
| **Visual weight** | High — equal to completion             | Low — de-emphasized to prevent accidents |
| **Position**      | Adjacent to completion (decision pair) | Far left, separated by spacer            |
| **Example**       | Reject, Decline, Deny                  | Delete, Remove, Revoke, Terminate        |

#### Two Action-Set Patterns

The roles above compose into two distinct patterns. Identifying which pattern applies is the first step in validation.

**Pattern 1: Workflow Progression**

The user is moving through a process. The forward action advances the workflow. There is no opposing decision — just an escape path.

Roles present: **Primary** + **Dismissive** (+ optional Secondary, Destructive)

```
With destructive:
┌──────────┐                    ┌───────────┐ ┌────────┐ ┌────────┐
│  Delete   │  ←── spacer ──→  │ Reassign  │ │ Cancel │ │  Save  │
│ outline   │                   │ outline   │ │ soft   │ │primary │
│ error     │                   │           │ │        │ │        │
└──────────┘                    └───────────┘ └────────┘ └────────┘
destructive                      secondary    dismissive  primary

Without destructive:
                                ┌─────────────┐ ┌────────┐ ┌────────┐
                                │ Save Draft  │ │ Cancel │ │ Submit │
                                │ outline     │ │ soft   │ │primary │
                                └─────────────┘ └────────┘ └────────┘
                                 secondary      dismissive  primary
```

**Pattern 2: Binary Decision**

The user is making a judgment between two opposing outcomes. Both are consequential. Neither is an escape — the user is resolving something.

Roles present: **Completion** + **Rejection** (+ optional Dismissive, Secondary, Destructive)

```
Binary only:
                                              ┌────────┐ ┌─────────┐
                                              │ Reject │ │ Approve │
                                              │ error  │ │ success │
                                              └────────┘ └─────────┘
                                              rejection   completion

Binary with escape:
┌──────────────┐                              ┌────────┐ ┌─────────┐
│ Review Later │  ←── spacer ──→              │ Reject │ │ Approve │
│ soft         │                              │ error  │ │ success │
└──────────────┘                              └────────┘ └─────────┘
dismissive                                    rejection   completion

Binary with destructive + escape:
┌──────────┐          ┌──────────────┐        ┌────────┐ ┌─────────┐
│  Delete  │ spacer   │ Review Later │        │ Reject │ │ Approve │
│ outline  │          │ soft         │        │ error  │ │ success │
│ error    │          └──────────────┘        └────────┘ └─────────┘
destructive            dismissive              rejection   completion
```

**Key layout rule for binary decisions:** Rejection sits immediately left of completion — they are the decision pair. No spacer between them. Dismissive sits further left (with a spacer if destructive is also present) because it's the opt-out, not part of the decision.

#### Role Classification Hints

When evaluating an existing design or component, classify buttons by label text:

| Label Pattern                                                                 | Role            |
| ----------------------------------------------------------------------------- | --------------- |
| approve, accept, resolve, confirm (completion), answer, allow, mark complete  | **Completion**  |
| save, submit, apply, create, send, next, update, enable, add, continue        | **Primary**     |
| reject, decline, deny, refuse                                                 | **Rejection**   |
| cancel, dismiss, close, back, skip, discard, not now, review later            | **Dismissive**  |
| delete, remove, revoke, terminate, destroy, deactivate                        | **Destructive** |
| reassign, duplicate, export, edit, share, download, refresh, view, save draft | **Secondary**   |

**Disambiguation for ambiguous labels:**

- "Confirm" can be completion or primary. Test: is something being resolved (confirm approval → completion) or is the user agreeing to proceed (confirm settings → primary)?
- "Close" can be dismissive or completion. Test: is the user leaving without acting (close modal → dismissive) or resolving an item (close incident → completion)?
- "Decline" is always rejection (not dismissive) because the other party experiences a consequence.

---

### Layout Rules

#### Arrangement

- **Direction:** Horizontal. Switches to vertical stack below `--hz-breakpoint-sm` (640px).
- **Alignment:** Right-aligned within container (`flex justify-end`).
- **Button order (left to right):** `[destructive] ← spacer → [dismissive] [secondary] [rejection] [completion or primary]`
- **Destructive separation:** If a destructive button exists, a flex spacer (`flex-grow` element or `mr-auto` on the destructive button) separates it from the rest of the group.
- **Decision pair adjacency:** In binary decision patterns, rejection and completion sit adjacent — no spacer or secondary between them.
- **Gap:** `gap-2` (8px) between adjacent buttons in the right cluster.

#### Ordering rules by pattern

**Workflow progression (left to right):**
`destructive → spacer → secondary → dismissive → primary`

**Binary decision (left to right):**
`destructive → spacer → dismissive → secondary → rejection → completion`

#### Constraints

- **Maximum one forward action:** Either one primary OR one completion. Never both in the same action-set. If both apply, determine whether the action resolves something (completion) or advances something (primary).
- **Rejection requires completion:** Rejection only appears alongside completion in binary decision patterns. An action-set cannot have rejection + primary — rejection is meaningless without a positive counterpart to reject against.
- **Button count ≤ 4:** No more than 4 visible buttons. If more actions exist, overflow into a dropdown menu.
- **Each role appears at most once**, except secondary (max 2).

#### Density adjustments

| Density            | Gap            | Button size   | Notes                                                             |
| ------------------ | -------------- | ------------- | ----------------------------------------------------------------- |
| `density-compact`  | `gap-1` (4px)  | `btn-sm`      | Labels may need abbreviation                                      |
| `density-default`  | `gap-2` (8px)  | default `btn` | Standard                                                          |
| `density-spacious` | `gap-3` (12px) | default `btn` | No size change — spacious adds breathing room, not larger targets |

#### Container context

Where the action-set lives depends on its parent component. The button roles, ordering, and spacing rules are the same regardless of container — what changes is the wrapper element.

| Container              | Where Action-Set Lives                 | Wrapper                | DaisyUI Class      | Notes                                                                                                                                      |
| ---------------------- | -------------------------------------- | ---------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Modal**              | Bottom of `modal-box`                  | Dedicated footer div   | `modal-action`     | DaisyUI provides this class — always use it. Contains the flex layout and right-alignment. Do not hand-wire a custom footer inside modals. |
| **Dialog**             | Bottom of dialog content area          | Same as modal          | `modal-action`     | Dialogs built on DaisyUI's modal structure use the same class.                                                                             |
| **Card (Type A)**      | Named footer slot                      | `<slot name="footer">` | None — custom slot | The `aict-card` component should provide this slot (currently missing — Doc 55, Decision 1). Action-set is slotted in by the wrapper card. |
| **Card (Type C)**      | Bottom of card body                    | Flex container         | None               | Priority cards don't use `aict-card`, so the action-set is a direct child div at the bottom of the card.                                   |
| **Form**               | Bottom of form, below all field groups | Flex container         | None               | Separated from fields by spacing or a border-top. Not inside any field group.                                                              |
| **Panel / Side Panel** | Bottom of panel content                | Flex container         | None               | Fixed to panel bottom if panel scrolls.                                                                                                    |
| **Page header**        | Right side of header                   | Flex container, inline | None               | Action-set is horizontal within the header row, not in a footer position. Primary-positive is rightmost.                                   |

**Key rule:** If DaisyUI provides a semantic class for the container's action area, use it. `modal-action` exists — use it for modals and dialogs. For everything else, the action-set is a flex container (`flex justify-end gap-2`) following the standard layout rules.

**Modal-specific anatomy (workflow progression):**

```html
<dialog class="modal">
  <div class="modal-box">
    <!-- header content -->
    <!-- body content -->
    <div class="modal-action">
      <button class="btn btn-soft">Cancel</button>
      <button class="btn btn-primary">Submit</button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
```

**Modal-specific anatomy (binary decision):**

```html
<dialog class="modal">
  <div class="modal-box">
    <!-- header content -->
    <!-- body content -->
    <div class="modal-action">
      <button class="btn btn-error">Reject</button>
      <button class="btn btn-success">Approve</button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
```

**Common violation:** `card.js` in the current codebase uses DaisyUI's `modal` and `modal-box` for its pop-out feature but places the close button in the header and has no `modal-action` footer. If the pop-out modal needs confirm/cancel actions, they should be in a `modal-action` div — not wired into the header alongside the close button.

---

### Context Mappings

The entity characteristic (from the domain skill, Step 1 of the orchestrator) determines which pattern applies and which roles are present.

#### Binary Decision Contexts (Completion + Rejection)

| Entity Characteristic        | Completion                  | Rejection                 | Dismissive (if deferral allowed) | Notes                                                                                               |
| ---------------------------- | --------------------------- | ------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------- |
| `completable` (approval)     | Approve → `btn btn-success` | Reject → `btn btn-error`  | Review Later → `btn btn-soft`    | Classic binary. Both outcomes are consequential.                                                    |
| `completable` (call)         | Answer → `btn btn-success`  | Decline → `btn btn-error` | —                                | No deferral — call is live.                                                                         |
| `completable` (permission)   | Allow → `btn btn-success`   | Deny → `btn btn-error`    | —                                | Security context — no deferral.                                                                     |
| `completable` (invitation)   | Accept → `btn btn-success`  | Decline → `btn btn-error` | Maybe Later → `btn btn-soft`     | Social context — deferral may be appropriate.                                                       |
| `completable` (verification) | Confirm → `btn btn-success` | Deny → `btn btn-error`    | —                                | Identity/security verification.                                                                     |
| `resolvable` (incident)      | Resolve → `btn btn-success` | —                         | Cancel → `btn btn-soft`          | Resolve closes the incident. No rejection — incidents aren't refused, they're resolved or deferred. |

#### Workflow Progression Contexts (Primary + Dismissive)

| Entity Characteristic     | Primary                    | Dismissive              | Typical Secondary              | Notes                                                    |
| ------------------------- | -------------------------- | ----------------------- | ------------------------------ | -------------------------------------------------------- |
| `editable` (record)       | Save → `btn btn-primary`   | Cancel → `btn btn-soft` | —                              | Saving is progression, not resolution.                   |
| `submittable` (form)      | Submit → `btn btn-primary` | Cancel → `btn btn-soft` | Save Draft → `btn btn-outline` | Submit advances the workflow. Draft is secondary.        |
| `configurable` (settings) | Apply → `btn btn-primary`  | Cancel → `btn btn-soft` | Reset → `btn btn-outline`      | Reset is secondary (reverts to defaults), not rejection. |
| `creatable` (new record)  | Create → `btn btn-primary` | Cancel → `btn btn-soft` | —                              | Minimal — two buttons.                                   |

#### Destructive Add-On (Any Context)

`deletable` is not its own context — it's an add-on to any of the above. Delete is always the destructive role, separated by a spacer. It never replaces primary or completion.

| Combined Context        | Example                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------- |
| editable + deletable    | Save (primary) + Cancel (dismissive) + Delete (destructive, far left with spacer)      |
| completable + deletable | Approve (completion) + Reject (rejection) + Delete (destructive, far left with spacer) |

---

### Validation Checks

These checks can be run against an existing design (Figma selection) or agent-generated output.

#### Structural checks

- [ ] **Single forward action:** Exactly one primary OR one completion — never both, never zero.
- [ ] **Pattern correctly identified:** Binary decision contexts use completion + rejection. Workflow progression contexts use primary + dismissive. Mixing patterns (e.g., rejection without completion, or primary with rejection) is a violation.
- [ ] **Rejection paired with completion:** Rejection only appears in binary decision patterns alongside completion. An action-set with rejection but no completion is invalid.
- [ ] **Dismissive present for reversible actions:** If the user can defer or exit without consequence, a dismissive button must exist. Exception: binary decisions where deferral is not appropriate (live calls, security permissions).
- [ ] **Button count ≤ 4:** No more than 4 visible buttons. If more actions exist, overflow into a dropdown menu (see Resolution Guidance below).
- [ ] **No role duplication:** Each role appears at most once, except secondary (max 2).

#### Container context checks

- [ ] **Correct wrapper for container type:** Modal/dialog action-sets use DaisyUI's `modal-action` class. Card action-sets use the footer slot. Form/panel action-sets use a flex container.
- [ ] **Modal uses `modal-action`:** If the action-set is inside a `modal-box`, it must be wrapped in a `<div class="modal-action">`. Hand-wired footer divs or buttons placed in the header are violations.
- [ ] **No action-set in modal header:** Close/dismiss is a header concern (X button). Confirm/cancel/submit are footer concerns (`modal-action`). Mixing them is a violation.
- [ ] **Card footer slot exists:** If the action-set is in a card, the card must provide a named footer slot or dedicated footer area. Buttons floating loose inside the body slot are a violation.

#### Layout checks

- [ ] **Ordering correct:** Workflow progression (L→R): destructive → spacer → secondary → dismissive → primary. Binary decision (L→R): destructive → spacer → dismissive → secondary → rejection → completion.
- [ ] **Destructive separation:** If destructive button exists, it is NOT adjacent to the forward action (primary or completion). A visual spacer separates them.
- [ ] **Decision pair adjacent:** In binary decision patterns, rejection and completion are adjacent with no buttons between them. They are the decision pair.
- [ ] **Right-alignment:** The forward action (primary or completion) is the rightmost element. The group is right-aligned within its container.
- [ ] **Gap consistency:** All buttons in the right cluster have equal gap. No extra spacing between specific pairs (except the destructive spacer).

#### Semantic checks

- [ ] **Forward action class matches intent:** Completion uses `btn-success`. Primary uses `btn-primary`. These are NOT interchangeable. Test: does the action resolve/complete something (success) or advance/save something (primary)?
- [ ] **Rejection uses error class:** Rejection uses `btn btn-error` (filled). Not `btn-outline`. Rejection is a consequential decision — it needs visual weight equal to completion.
- [ ] **Destructive is outlined, not filled:** Destructive uses `btn btn-outline btn-error`. Not `btn btn-error` (filled). The outline de-emphasizes it to prevent accidental clicks. Filled error is reserved for rejection.
- [ ] **Dismissive uses soft:** Dismissive uses `btn btn-soft` (subtle fill, no border). Visually present but clearly subordinate to filled decision buttons. Distinct from secondary (`btn-outline` with border).
- [ ] **No ghost buttons in action sets:** Action-set footers never use `btn-ghost`. Every button has a visible container (filled, soft, or outlined). Ghost creates a visual gap in the group.
- [ ] **`btn-success` not used for progression:** If the action is Save, Submit, Create, Apply, or any non-resolution action, it must use `btn-primary` — not `btn-success`. Green signals completion, not progression.
- [ ] **`btn-error` not used for dismissal:** If the action is Cancel, Close, or Dismiss, it must use `btn-soft` — not `btn-error`. Red signals rejection (consequential), not dismissal (no consequence).

#### Content checks

- [ ] **Labels are verb-first:** Each button label starts with a verb (Approve, Save, Cancel, Delete). Not noun-first (Approval, Cancellation).
- [ ] **Labels ≤ 3 words:** Button labels are concise. "Save and Continue" is acceptable. "Save Changes and Return to List" is not.
- [ ] **No truncation:** Button labels must never truncate. If a label is too long for the button, shorten the label — do not allow ellipsis.

#### Accessibility checks

- [ ] **Touch targets ≥ 44×44px:** At current density, each button meets minimum touch target size. Flag if compact density produces buttons smaller than 44px height.
- [ ] **Focus order matches visual order:** Tab order follows left-to-right visual order. Workflow progression: destructive → secondary → dismissive → primary. Binary decision: destructive → dismissive → secondary → rejection → completion.
- [ ] **Color not sole differentiator:** Button roles are distinguishable without color (through label text and position). A colorblind user can identify which button is the forward action.

---

### Resolution Guidance

When a validation check fails, the agent should suggest a specific fix — not just report the violation.

#### More than 4 visible actions

Move the lowest-priority secondary actions into a dropdown overflow menu. The overflow trigger is a `btn btn-outline` with a vertical ellipsis icon (`more-vertical`), positioned after the last visible secondary button. The dropdown follows the dropdown component sheet rules. Actions inside the dropdown maintain their role semantics — a destructive action in the dropdown still uses error color text. Forward actions (primary/completion), rejection, and destructive always remain visible — never overflow them.

#### Both primary and completion present

Determine whether the action resolves something or advances something. Only one can be the forward action. Common mistake: a form with "Submit" (`btn-primary`) and "Mark Complete" (`btn-success`) — if submitting IS completing, use completion only. If submitting advances to a review step and completing is a separate action, the action-set may need to be split across two contexts (submit in the form footer, complete in the record header).

#### `btn-success` used on a non-completion action

If the button is Save, Submit, Create, Apply, or any action that doesn't resolve/close a loop, change to `btn btn-primary`. The test: after clicking this button, is someone notified that something was resolved? If no, it's primary, not completion.

#### `btn-error` (filled) used on destructive action

Destructive actions use `btn btn-outline btn-error` (outlined), not `btn btn-error` (filled). Filled error is reserved for rejection — active negative decisions in binary patterns. Destructive is de-emphasized because it's not the purpose of the action-set; it's an available option that should be hard to click accidentally.

#### Rejection without completion

If there's a Reject/Decline/Deny button but no corresponding Approve/Accept/Allow, the pattern is wrong. Rejection only exists as one half of a binary decision. If the intent is "cancel with prejudice" (e.g., deny a request), the positive counterpart must be present. If there's truly no positive resolution, reconsider whether this is a rejection (binary decision) or a destructive action (permanent removal).

#### No forward action identified

If all buttons are equally weighted, this may not be an action set — it may be a navigation group or a toolbar. Action sets require either one primary (workflow progression) or one completion (binary decision). If there genuinely is no forward action (e.g., a set of filter toggles), use a different composition pattern.

#### Destructive adjacent to forward action

Insert a flex spacer between destructive and the right cluster. If the container doesn't support flex layout, add explicit margin (`ml-auto` on the right cluster or `mr-auto` on the destructive button).

#### Missing dismissive for reversible action

Add a Cancel or Dismiss button as `btn btn-soft` to the left of the forward action group. Every action-set where the user can defer without consequence needs an explicit escape path — relying on browser back or the X close button is insufficient.

#### Compact density touch target violation

Two options: (a) keep `btn-sm` but ensure the clickable area extends to 44px via padding — `min-h-[44px]` even if the visible button is smaller; (b) override to default `btn` size in this specific context. Option (a) is preferred because it preserves the compact visual density while meeting accessibility requirements.

#### Modal/dialog missing `modal-action`

If the action-set is inside a `modal-box` but not wrapped in `modal-action` DaisyUI class, add the class wrapper:

```html
<!-- Before (wrong) -->
<div class="modal-box">
  <h3>Title</h3>
  <p>Content</p>
  <div class="flex justify-end gap-2 mt-4">
    <button class="btn btn-soft">Cancel</button>
    <button class="btn btn-primary">Confirm</button>
  </div>
</div>

<!-- After (correct) -->
<div class="modal-box">
  <h3>Title</h3>
  <p>Content</p>
  <div class="modal-action">
    <button class="btn btn-soft">Cancel</button>
    <button class="btn btn-primary">Confirm</button>
  </div>
</div>
```

DaisyUI's `modal-action` provides the flex layout, right-alignment, and proper spacing. Do not duplicate these with manual flex classes — the DaisyUI class handles it.

#### Close button in wrong location

If a modal has a close/dismiss X button in the header AND confirm/cancel buttons — that's correct (X is a quick-dismiss escape, distinct from the action-set). If the only way to dismiss the modal is a header X button with no footer action-set — that's a violation for modals that require a deliberate user decision (confirmations, form submissions, destructive actions). Add a `modal-action` footer with at least a Cancel button.

---

### Quick Check Protocol

**For Claude Code + Figma MCP validation (conversational response):**

When a designer asks for a quick check of an action set:

1. Read the component source or Figma selection
2. Identify all button elements
3. Classify each by role using the Role Classification Hints table
4. Identify the container type (modal, card, form, panel) and check the wrapper is correct
5. Run Structural checks, Container Context checks, and Layout checks only
6. Respond in 3–7 sentences: what's correct, what's wrong, specific fix for the most important violation
7. Do NOT run the full checklist — save that for Full Review

**Example quick check response (binary decision):**

> This is a binary decision pattern — approval context. Approve is correctly using `btn-success` (completion role) and Reject is correctly using `btn-error` (rejection role). The decision pair is adjacent and right-aligned. One issue: there's no dismissive escape — if the reviewer should be able to defer, add a "Review Later" button as `btn-soft` to the left of the decision pair, separated by a spacer.

**Example quick check response (workflow progression):**

> This is a workflow progression pattern — form submission. Submit uses `btn-primary` (correct — it advances the workflow, doesn't resolve it). Cancel uses `btn-soft` (correct dismissive — subtle fill, subordinate to the forward action). Save Draft uses `btn-outline` (correct secondary — bordered, lower visual weight than dismissive).

---

### Full Review Protocol

**For Claude project chat validation (structured checklist output):**

When a designer submits a screen or frame for thorough review:

1. Identify all action sets in the submitted design
2. For each action set, run ALL validation checks (structural, layout, semantic, content, accessibility)
3. Produce the checklist below with specific findings per item
4. Add Recommendations section with prioritized fixes

**Output template:**

```
## Action Set Review — [Location in Design]

**Buttons found:** [list each with classified role]
**Pattern:** [Workflow Progression / Binary Decision]
**Entity characteristic:** [inferred or stated]
**Density mode:** [compact/default/spacious]
**Container type:** [modal/dialog/card/form/panel/page-header]

### Structural
- [✅/❌] Single forward action (one primary or one completion, not both): [finding]
- [✅/❌] Correct pattern identified: [finding]
- [✅/❌] Rejection paired with completion (if rejection present): [finding]
- [✅/❌] Dismissive present for reversible actions: [finding]
- [✅/❌] Button count ≤ 4: [finding]
- [✅/❌] No role duplication: [finding]

### Container Context
- [✅/❌] Correct wrapper for container type: [finding]
- [✅/❌] Modal uses `modal-action`: [finding — if applicable]
- [✅/❌] No action-set in modal header: [finding — if applicable]
- [✅/❌] Card footer slot exists: [finding — if applicable]

### Layout
- [✅/❌] Ordering correct for pattern: [finding]
- [✅/❌] Destructive separation: [finding]
- [✅/❌] Decision pair adjacent (binary only): [finding — if applicable]
- [✅/❌] Right-alignment: [finding]
- [✅/❌] Gap consistency: [finding]

### Semantic
- [✅/❌] Forward action class matches intent (primary vs. completion): [finding]
- [✅/❌] Rejection uses filled error (not outlined): [finding — if applicable]
- [✅/❌] Destructive uses outlined error (not filled): [finding — if applicable]
- [✅/❌] Dismissive uses soft: [finding]
- [✅/❌] btn-success not used for progression: [finding]
- [✅/❌] btn-error not used for dismissal: [finding]

### Content
- [✅/❌] Labels verb-first: [finding]
- [✅/❌] Labels ≤ 3 words: [finding]
- [✅/❌] No truncation: [finding]

### Accessibility
- [✅/❌] Touch targets ≥ 44×44px: [finding]
- [✅/❌] Focus order matches visual: [finding]
- [✅/❌] Color not sole differentiator: [finding]

### Recommendations
1. [Highest priority fix]
2. [Next fix]
3. [...]
```

---

### Proofing Checklist (for recipe authors)

Before shipping this composition recipe, verify:

- [ ] Every rule references a DaisyUI class or Nexus utility class — no abstract descriptions
- [ ] Context mappings cover all entity characteristics the target product uses
- [ ] Resolution guidance covers every constraint violation, not just the obvious ones
- [ ] Quick check protocol produces useful output in ≤ 5 sentences
- [ ] Full review template covers all validation checks with no gaps
- [ ] No component-level rules restated (those belong in button.md)
- [ ] Cross-cutting patterns referenced, not inlined (status-colors, truncation-tooltip)

## HTML Reference

The HTML reference at `references/action-set-reference.html` is a **visual reference for validation only**. It shows what correct action-set compositions look like — use it to compare against designs and components, not as a code source.

**Do NOT** copy HTML or CSS from the reference into production components. The reference uses static hex values from `horizon-reference-theme.css` for standalone rendering. Production components use DaisyUI classes that resolve through the dynamic theme pipeline (`themeGenerator.js` → Leonardo → CSS variables). The class names are identical (`btn-primary`, `btn-soft`, etc.) but the underlying token architecture is different.

**Use the reference to:** validate visual output, compare button treatments, verify role assignments, check spacing and hierarchy.
**Use the skill to:** generate or fix production code — it specifies DaisyUI classes, not CSS values.

## Context to Provide

- **Entity characteristic** — completable, editable, submittable, configurable, creatable (determines button roles and color mapping)
- **Density mode** — compact, default, spacious (affects gap and button size)
- **Product context** — AICT, CBS, etc. (if relevant to federation tokens)
