# PR / VCS State on Cards — Research Report
## Design intelligence for N6 (ServiceNow AINPX EAP Sand prototype)

---

## 1. What N6 Already Has

N6 shows a branch name and a status pill (Open / In Review / Merged) on story cards in the Sprint board, seeded across 7 Sprint 2 work items. The detail panel carries branch name and PR number as static fields. There is no interactivity, no Draft state, no CI signal, no reviewer signal, and no aggregation at the Feature level. This is the baseline.

---

## 2. Card Surface — What Belongs on the Face

| Tool | Card face pattern | Draft/Ready distinction | CI badge on face | Reviewer signal on face |
|------|------------------|------------------------|------------------|------------------------|
| **Linear** | Single branch-fork glyph, colour encodes state, optional count | Subtle — same glyph, muted colour for draft | No | No |
| **Jira + GitHub** | Counter-icon strip: branch count, PR count+dot, build icon, deploy dot | No — draft shows as Open | Yes (build icon) | No |
| **Azure DevOps** | Annotation icons at card bottom (Tasks, Tests, GitHub items) | Draft icon in form only, not card | Via GitHub annotation | No |
| **GitLab** | Nothing VCS-related by default | N/A (MR not on card) | No | No |
| **Shortcut** | Branch glyph + PR glyph, colour shift on merge | No separate draft colour | No | No |
| **GitHub Projects v2** | PR pill per linked PR (icon+colour+number) | Yes — grey hollow circle = draft | No | Reviewer avatar stack (opt-in) |
| **Rally** | Nothing by default | No | No | No |
| **Targetprocess** | Full DevOps unit: branch + pipeline icon + approval icon + mergeability alert | Unclear | Yes (pipeline icon) | Yes (approval icon goes green) |
| **Height** (discontinued) | Status pill only (driven by PR lifecycle) | Encoded in status pill | No | No |
| **Plane** | Status pill only (driven by PR automation) | Encoded in status pill | No | No |

**N6 recommendation.** Adopt the Linear/Shortcut compressed-glyph model with one modification: replace the current pill-only pattern with a two-element row at the bottom of the card.

Row structure (left-to-right, shown only when a branch/PR is linked):
1. **Branch/PR glyph** — 12px, neutral/600 `#797874` icon. Colour shifts to `#16A34A` on Merged, `#D97706` on CI-failing.
2. **Status pill** — `rounded-full`, 10px uppercase, 400 weight. Vocabulary: `Draft` (neutral bg), `Open` (neutral), `In Review` (amber tint), `Merged` (green tint).

Empty state: row is absent. No placeholder.

---

## 3. Detail Panel — What Belongs Inside

All 11 tools converge on the same pattern: a structured PR widget in the panel, one row per PR, with more fidelity than the card allows.

| Tool | PR row fields | CI shown | Reviewer shown | Deployment shown |
|------|--------------|----------|----------------|-----------------|
| **Linear** | Repo, #number, title, branch (head→base), state pill, author avatar, timestamp | Via failed checks toggle | Reviewer avatars + review requested | Release/environment (Releases feature) |
| **GitLab** | MR title, state pill, #number, source→target branch, pipeline icon | Yes | In MR widget (not issue panel) | Post-merge deploy widget |
| **Azure DevOps** | PR title, #number, state, target branch | Via Integrated-in-build rows | Click-through only | Deployment control: per-stage rows |
| **Shortcut** | Repo, #number, title, branch, state, review state text, CI status | Yes — pipeline status pill | Review state text (Review required / Changes requested / Approved) | Via labels/custom states |
| **GitHub Projects v2** | PR number, state icon+colour, title, head→base | No | Reviewer avatars (opt-in) | No |
| **Targetprocess** | PR title, #number, target branch, author, approval count, pipeline status, mergeability | Yes — per-job results | Approval count vs required | Via Build entity |

**N6 recommendation.** Expand the current branch + PR number fields into a structured PR section with this field order:

1. **PR number + title** — link out
2. **State pill** — Draft / Open / In Review / Merged
3. **Branch** — `feature/branch-name → main` in `font-mono`, 12px, neutral/600
4. **CI status** — single icon + label: `Passing` (green dot) / `Failing` (red dot) / `Running` (amber dot)
5. **Reviewers** — initials-avatar stack, greyed until approved, green when all required reviewers approved; label "2/2 approved" or "Review requested"
6. **Merge readiness** — explicit blockers list (GitLab-style): "CI failing · 1 reviewer pending · Draft" — shown only when blockers exist

This synthesises Linear's row structure with GitLab's merge-readiness enumeration. Neither tool ships it combined. N6 would.

---

## 4. State Coupling — Does PR State Drive Story State?

Linear, Shortcut, Height, and Plane all implement full PR-lifecycle-to-story-state automation. The canonical chain: branch created → In Progress; PR opened → In Review; PR merged → Done. Azure DevOps does it on merge only. Jira requires explicit Automation rules. GitLab uses closing keywords (text-driven). Rally uses commit-message syntax. GitHub Projects v2 ships with PR-merged → Done by default but lacks an In Review trigger.

Draft PRs consistently do NOT trigger the In Review transition in any tool — they fire a separate (usually earlier) mapping. This is universal.

**N6 recommendation.** The 7 seeded work items must be in states consistent with their PR status. A story with a Draft PR stays In Progress; a story with an In Review PR is in the In Review column; a story with a Merged PR is Done. The prototype must not contradict the automation logic that developers expect to be real.

---

## 5. Draft vs Ready — The Missing State

N6 currently has three PR states: Open / In Review / Merged. Every modern tool — Linear, GitHub Projects v2, Azure DevOps, GitLab, Shortcut, Plane — treats Draft as a distinct first-class state that explicitly precedes Open/Ready. Omitting Draft implies all open PRs are ready for review, which misrepresents real developer workflow.

In Linear, a Draft PR keeps the story In Progress and does not trigger the In Review automation. In GitHub, Draft uses a universally understood grey hollow-circle icon. GitLab hard-blocks merge on Draft — it is not a hint, it is a gate.

**N6 recommendation.** Add `Draft` as the first state in the PR status pill vocabulary. Updated four-state vocabulary: `Draft` · `Open` · `In Review` · `Merged`.

Sand colour mapping:
- `Draft` — neutral/200 bg `#E1E0DD`, neutral/700 text `#585753`
- `Open` — neutral/100 bg `#F1F0ED`, neutral/700 text `#585753`
- `In Review` — `rgba(217,119,6,0.10)` bg, `#D97706` text
- `Merged` — `rgba(22,163,74,0.10)` bg, `#16A34A` text

This change costs one data seed and one CSS addition. It closes the most glaring vocabulary gap versus competitors.

---

## 6. Review State — Reviewer Signal

Targetprocess is the only tool that surfaces review approval state on the card face (approval icon, grey→green when threshold met). Linear, Shortcut, and GitHub Projects v2 surface it in the panel. Azure DevOps, GitLab, and Jira surface it on the PR page only. Rally surfaces nothing.

The most actionable pattern is Shortcut's: a text label on the PR row in the panel — `Review required` / `Changes requested` / `Approved` — combined with a reviewer avatar count.

**N6 recommendation.** Add reviewer state to the detail panel PR section only (as described in Section 3). A "2/2 approved" indicator in the panel is sufficient. On the card face, if a single story needs to demonstrate review visibility, add an 8px approval dot (neutral/300 → green) to the right of the status pill on one selected story only.

---

## 7. DoD Checklist — The Opportunity

Across all 11 tools, no tool has a first-class, structured Definition of Done checklist field. Every approach is one of:
- Markdown checkboxes in description (GitHub, GitLab, Plane, Jira Action Items) — no template, no gate, invisible on card
- Third-party Marketplace app (Jira: Smart Checklist, Checklists for Jira) — progress only with admin config
- Sub-tasks used as DoD items (Linear, Shortcut, Azure DevOps) — pollutes task count, no template

Atlassian's 2024 native Action Items deliberately chose not to compete with Marketplace checklist apps — their RFC explicitly frames it as "lightweight notes," not enforced DoD.

**N6 recommendation.** Add a `Definition of Done` collapsible section to the detail panel, below the PR section.

- Section header: "Definition of Done" with progress fraction "4/6", 12px semibold
- Item rows: checkbox + label + owner avatar + status dot (Not started / In progress / Done)
- Seeded items: "Tests written", "Code reviewed", "Design reviewed", "Docs updated", "Demo recorded", "No open bugs"
- Card-face treatment: a `DoD 4/6` micro-label at the bottom right, 10px, neutral/600 — visible only when items exist and not all complete; disappears when complete

No other tool in this study ships this as a first-class structured field. This is N6's clearest differentiator.

---

## 8. Test Linkage — Card or Panel?

Xray (for Jira) is the only tool that surfaces a test signal on the card face — a coloured Requirement Status pill (OK / NOK / NOTRUN / UNKNOWN / UNCOVERED) — but only if an admin explicitly configures Card Layout. Azure DevOps shows a Tests annotation (count + pass/fail dots) when linked test cases exist. GitLab has best-in-class test reporting in the MR widget but nothing on issue board cards. Rally has first-class Test Cases with verdicts but nothing on the card.

Research consensus: test signals belong in the panel on developer sprint boards; only a single pass/fail indicator belongs on the card.

**N6 recommendation.** Surface one test signal on the story card face: a `Tests 12/14` micro-label or a coloured dot (green = all passing, red = failures, grey = not run). Place it alongside the DoD indicator at the card bottom. In the panel, add a `Test Coverage` collapsible section with rows showing test name, last result (Pass/Fail), and environment. Seed 2–3 test results per story.

---

## 9. CI/CD Status — Build Signal

Jira surfaces a build icon (green/red) in the Development field counter strip. Azure DevOps surfaces it in the detail form and as a Deployment control. Targetprocess surfaces a pipeline icon in its DevOps unit on the card face. Linear, Shortcut, and GitLab surface CI only on the PR surface — not on the planning card. GitLab draws the line explicitly: pipeline icon on the developer-centric task board, omitted from the strategic backlog.

**N6 recommendation.** Surface a CI status dot on story cards in the Sprint Board only — not on Feature cards, not in the Backlog. A 6px dot immediately adjacent to the PR status pill: green = passing, red = failing, amber = running. Seed at least one story with a red CI dot to demonstrate the risk-signal use case — a visible "problem that needs attention" state on the board. In the panel, CI is covered by the PR section's CI status row (Section 3).

---

## 10. Release Tagging / Environment — Delivery Signal

Linear's Releases feature (April 2026) is the most mature: first-class Release Pipeline objects with environment (dev/staging/prod) linked to issues by commit SHA. Azure DevOps has a Deployment control on the work item form with per-stage status. Jira has a Deployments row in the Development panel. No tool puts an environment badge on the card face by default. The closest: Linear's inline release badge in list view ("iOS · nightly · internal") and Azure DevOps's deployment dot on the card when a deployment has occurred.

**N6 recommendation.** Add an `Environment` row to the detail panel properties sidebar: `dev` / `staging` / `prod` with a status dot per environment (deployed = green, pending = grey, failed = red). Seed a few stories with "In staging." On the card face, add an environment badge only for stories in a deployed state — a small pill `staging` or `prod` in neutral/200 bg, neutral/700 text, `rounded-full`. Rare in the category, high demo value for SAFe delivery traceability evaluators.

---

## 11. Feature-Level Aggregation — The Universal Gap

This is the single finding consistent across all 11 tools: **no tool rolls up PR/VCS state from child stories to parent Feature or Epic cards.** Every tool's Feature card shows only its own directly-linked branches and PRs. A Feature with five child stories — all with merged PRs — shows empty VCS state at the Feature level. Targetprocess comes closest: a custom Metric can aggregate child-story merged PRs, but it requires admin configuration and is not default.

**N6 recommendation.** Build Feature card aggregation as a prototype-exclusive pattern. On Feature cards in the Sprint Board, add a compact row:

`3/5 stories merged · 1 CI failing`

Visual treatment: 11px, neutral/600, below the story count. The merged fraction uses `#16A34A` for the count and `#DC2626` for CI-failing count. When all stories are merged and CI is green: `5/5 merged · All CI passing` in green — a quiet, earned done signal. This pattern is demonstrably absent from every competitor.

---

## 12. Traceability Composite — The Biggest Opportunity

No tool in this study synthesises code + tests + DoD + deploy into a single card-face indicator. The component parts exist separately: Development panel (code/CI/deploy in Jira), Xray Requirement Status pill (tests), Smart Checklist Progress % (DoD). They are never unified. GitLab's merge-checks enumerator is the closest pattern — an explicit reasons list on the MR — but it is per-MR, excludes DoD and deployment, and lives on the PR page not the card.

**N6 recommendation.** Implement a Traceability ring on story cards — a four-segment arc in Sand design system tokens.

Specification:
- 16×16px SVG circle, 2px stroke weight, `stroke-linecap: round`
- Four segments at 90° each, 2px gap between segments
- **Segment 1 — Code**: lit (`#16A34A`) when PR is Merged
- **Segment 2 — Tests**: lit when test coverage passes
- **Segment 3 — DoD**: lit when all DoD items are complete
- **Segment 4 — Deploy**: lit when story has reached a deployment environment
- Unlit segments: `#CCCBC8` (border-subtle)
- When all four lit: subtle green fill inside the ring (`rgba(22,163,74,0.08)`)

Position: bottom-left corner of the story card. On hover: tooltip reads "Code merged · Tests passing · DoD incomplete · Not deployed" — one line per dimension, tick or cross prefix.

On Feature cards, the ring aggregates across children: a segment lights when 100% of child stories have that dimension complete. This directly solves Section 11's aggregation gap.

This is the only pattern in N6 that no competitor offers.

---

## 13. Priority Ranking — What to Build Next

Ranked by (1) demo impact for evaluators, (2) design differentiation vs competitors, (3) implementation effort:

**1. Add Draft to PR status vocabulary.**
Expand to Draft / Open / In Review / Merged. One additional pill value, four colour tokens. Closes the most glaring vocabulary gap versus every modern tool. **Effort: 30 minutes.**

**2. Structured PR section in detail panel.**
Replace the two static fields with a full PR row: number, title, state pill, branch direction, CI dot, reviewer count, merge readiness blockers. Matches Linear's benchmark; makes the panel credible to developer evaluators. **Effort: 2–3 hours.**

**3. Feature card aggregation row.**
"3/5 stories merged · 1 CI failing" on Feature cards in the Sprint Board. Absent from every competitor, immediately legible to any RTE or SAFe evaluator. Requires consistent data seeding. **Effort: 1–2 hours.**

**4. DoD checklist section in detail panel.**
Structured seeded DoD items with per-item status and a card-face "DoD 4/6" micro-label. First-class DoD exists nowhere in the category; strong signal to SAFe evaluators assessing acceptance criteria governance. **Effort: 3–4 hours.**

**5. Traceability ring on story cards.**
Four-segment SVG arc (code/tests/DoD/deploy). Genuinely novel — no competitor ships this. Combines Section 11 aggregation with Section 12 composite signal into a single earned glyph. **Effort: 4–6 hours including SVG, tooltip, and Feature-level aggregation logic.**

**6. CI status dot on Sprint Board story cards.**
6px dot adjacent to the PR pill: green/red/amber. Seed at least one story with red to demonstrate risk surfacing. Matches developer expectations set by Jira, Targetprocess, and Azure DevOps. **Effort: 1 hour.**
