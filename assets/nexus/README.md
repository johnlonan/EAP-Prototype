# Nexus Agent Pack

Agent Skills that teach AI coding assistants how to build accessible, internationalized, responsive, and motion-compliant applications.

Contains skills for accessibility compliance, internationalization (i18n), localization (l10n), responsive design, and motion/animation — all following the Agent Skills Specification for seamless integration with Claude Code, Cursor, VS Code Copilot, Windsurf, Gemini CLI, and other compatible tools.

## Skills

| Skill                             | Description                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| `accessibility`                   | Scan for accessibility issues and implement solutions following WCAG 2.2 A and AA standards |
| `internationalization`            | Implement i18n support for multi-language applications                                      |
| `localization`                    | Adapt content and formatting for specific locales and regions                               |
| `responsive-design`               | Build responsive layouts that adapt to different screen sizes and devices                   |
| `motion`                          | Apply and audit the motion design system for CSS transitions and animations                 |
| `figma-variable-mapping`          | Map DaisyUI classes to CSS variables to Figma library variables for design token compliance |
| `action-set-compositions`         | Validate action set button groups — roles, ordering, semantic color, spacing                |
| `card-compositions`               | Validate card compositions — surface tokens, radius, text colors, structural anatomy        |
| `contextual-actions-compositions` | Validate contextual actions — quick actions, quick links, and filter pills                  |

## Agent Skills Specification

Skills in this package follows the [Agent Skills Specification](https://agentskills.io/specification) — an open standard for packaging instructions, references, and templates that AI coding assistants can discover and use. Skills are defined with a `SKILL.md` file containing frontmatter metadata and markdown instructions.

### Build

From the `skills/` workspace root:

```bash
pnpm run build
```

Or from within this package:

```bash
pnpm run build
```

The build script compiles `skills/` into `dist/` for publishing.

## Composition Skills

Composition skills define how components assemble together in specific contexts. They are the rules for **arrangement**, not appearance — individual component styling is covered by DaisyUI and Tailwind.

### What's Here

Each subdirectory is a composition skill:

| Skill                             | What It Validates                                                                                           | Maturity        |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------- |
| `action-set-compositions`         | Workflow decision buttons — roles, ordering, spacing, semantic color by entity context. "What should I do?" | 2b (executable) |
| `contextual-actions-compositions` | Equal-weight peer action buttons — uniformity, overflow, icon tokens, ARIA toolbar. "What can I do?"        | 2b (executable) |
| `card-compositions`               | Card containers — surface tokens, radius, text colors, sub-patterns (AI insight row, badges, charts)        | 2b (executable) |

### How to Use

#### Quick Check (Claude Code chat panel in VS Code)

Reference the skill files and ask for validation:

```
@nexus:action-set-compositions
/path/to/your/component.js
Check this component against the action-set composition.
```

Quick checks return 3–7 sentences: what's right, what's wrong, specific fixes.

#### Full Review (Claude project chat on claude.ai)

Paste the component source or a Figma link and request the structured checklist:

```
Validate this component against the card composition skill.
Run Full Review.
```

Full reviews return a pass/fail checklist across all validation categories with prioritized recommendations.

#### During Code Generation

When building a new component, reference the skill so Claude Code follows the rules from the start:

```
@nexus:card-compositions
Build a Type A container card for the AICT operations dashboard.
Use the card composition rules.
```

### Skill Structure

Each skill follows the same format:

```
{skill-name}/
├── SKILL.md
└── references/
    └── {skill-name}-reference.html  ← Visual reference (validation only)
```

- **SKILL.md** tells Claude when to load the skill and what context to request (entity type, density, product)
- **references/{skill}.md** contains the validation checks, role/type classification hints, resolution guidance, and output templates for both quick check and full review protocols
- **references/{skill}-reference.html** is a visual reference showing correct and incorrect examples

#### ⚠️ HTML References Are Visual Only — Not Code Sources

The HTML reference files show what correct compositions look like. They are for **visual comparison and validation**, not for copying into production components.

- Production components use DaisyUI and Tailwind classes that resolve through `themeGenerator.js` → Leonardo → CSS variables
- The class names are identical (`btn-primary`, `btn-soft`, etc.) but the underlying token architecture is different
- **Use the skill** (the `.md` file) to generate or fix production code — it specifies DaisyUI and Tailwind classes
- **Use the reference** (the `.html` file) to verify visual output matches the design intent

### Maturity Levels

- **1 (draft)** — rules defined, not yet tested against production components
- **2a (prose)** — tested, ships as guidance for developers and designers
- **2b (executable)** — structured enough to drive Claude Code validation reliably (includes validation checks, classification hints, resolution guidance)
- **3 (Lit component)** — future phase, not in scope

Skills start at 2a and graduate to 2b as usage proves they need the full validation structure.

### Contributing

The DS team curates composition skills. Any team can propose additions or refinements.

**To propose a new skill:**

1. Identify a recurring assembly pattern in your work (3+ components compose the same way)
2. Raise it with the DS team — describe the pattern and which components it covers
3. DS team and contributing team author the skill together

**To refine an existing skill:**

1. Find a rule that's wrong, missing, or incomplete during validation
2. Raise it with the DS team with the specific finding
3. DS team evaluates and updates the skill

Skills should never restate component-level rules — those belong in component sheets. If you find yourself writing "the button should use `btn btn-primary`," that's a component rule, not a composition rule. Compositions describe how components arrange, not how they look.
