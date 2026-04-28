---
name: figma-variable-mapping
description: Maps DaisyUI classes to CSS variables to Figma library variables. Use when generating or validating Figma designs to bind fills, strokes, and text colors to [ALPHA] Horizon 2.0 Foundations library tokens instead of hardcoded hex values.
metadata:
  author: servicenow
  version: '1.0.0'
compatibility: Works with Claude Code, Cursor, VS Code Copilot, Windsurf, Gemini CLI, and other Agent Skills-compatible tools
license: MIT
---

# Figma Variable Mapping — Design Token Reference

**Library:** `[ALPHA] Horizon 2.0 → Foundations`
**Purpose:** Maps DaisyUI classes → CSS variables → Figma library variables. Used by `generate_figma_design` to bind to library tokens instead of hardcoded hex values.

---

## How to Use This Reference

When creating or correcting Figma frames via the `generate_figma_design` MCP tool, always bind fills, strokes, and text colors to the Figma library variables listed here — never use hex values.

**In the prompt, specify:**

```
Use Figma variables from the [ALPHA] Horizon 2.0 → Foundations library
for all colors. Bind fills and strokes to the variable names listed
in the figma-variable-mapping reference — no hardcoded hex values.
```

---

## Button Role Mapping

| Role            | DaisyUI Class           | CSS Variable                | Figma Variable | Figma Usage                                          |
| --------------- | ----------------------- | --------------------------- | -------------- | ---------------------------------------------------- |
| **Primary**     | `btn-primary`           | `--color-primary`           | `primary`      | Fill: `primary`, Text: `primary-content`             |
| **Completion**  | `btn-success`           | `--color-success`           | `success`      | Fill: `success`, Text: `success-content`             |
| **Rejection**   | `btn-error`             | `--color-error`             | `error`        | Fill: `error`, Text: `error-content`                 |
| **Dismissive**  | `btn-soft`              | `--color-secondary`         | `secondary`    | Fill: `secondary`, Text: `secondary-content`         |
| **Secondary**   | `btn-outline`           | `--color-base-300` (border) | `base-300`     | Stroke: `base-300`, Text: `base-content`, Fill: none |
| **Destructive** | `btn-outline btn-error` | `--color-error` (border)    | `error`        | Stroke: `error`, Text: `error`, Fill: none           |

---

## Surface & Background Mapping

| Usage                            | DaisyUI Class        | CSS Variable                   | Figma Variable         |
| -------------------------------- | -------------------- | ------------------------------ | ---------------------- |
| Page background                  | `bg-base-200`        | `--color-base-200`             | `base-200`             |
| Card surface                     | `bg-base-100`        | `--color-base-100`             | `base-100`             |
| Card surface (same as container) | `background-primary` | `--color-background-primary`   | `background-primary`   |
| Subtle surface / hover           | `bg-base-200`        | `--color-base-200`             | `base-200`             |
| Pressed state                    | `bg-base-300`        | `--color-base-300`             | `base-300`             |
| Inverted surface                 | `bg-base-content`    | `--color-base-content`         | `base-content`         |
| Secondary background             | —                    | `--color-background-secondary` | `background-secondary` |
| Tertiary background              | —                    | `--color-background-tertiary`  | `background-tertiary`  |
| Inverted background              | —                    | `--color-background-inverted`  | `background-inverted`  |

---

## Text Color Mapping

| Usage                   | DaisyUI/Tailwind Class | CSS Variable              | Figma Variable    |
| ----------------------- | ---------------------- | ------------------------- | ----------------- |
| Default text            | `text-base-content`    | `--color-base-content`    | `base-content`    |
| Primary (brand) text    | `text-primary`         | `--color-primary`         | `primary`         |
| Text on primary surface | —                      | `--color-primary-content` | `primary-content` |
| Primary text (semantic) | —                      | `--color-text-primary`    | `text-primary`    |
| Secondary text          | —                      | `--color-text-secondary`  | `text-secondary`  |
| Tertiary text           | —                      | `--color-text-tertiary`   | `text-tertiary`   |
| Inverted text           | —                      | `--color-text-inverted`   | `text-inverted`   |
| Success text            | `text-success`         | `--color-success`         | `success`         |
| Error text              | `text-error`           | `--color-error`           | `error`           |
| Warning text            | `text-warning`         | `--color-warning`         | `warning`         |
| Info text               | `text-info`            | `--color-info`            | `info`            |

### ⚠️ Naming Collision Warning

`text-primary` has TWO meanings:

- **DaisyUI `text-primary`** = brand teal text color (`--color-primary` → Figma `primary`)
- **Semantic `text-primary`** = default/primary text color (`--color-text-primary` → Figma `text-primary`)

These are different variables pointing to different colors. In Figma, use:

- `primary` for brand teal text
- `text-primary` for default body text

---

## Border & Stroke Mapping

| Usage          | DaisyUI/Tailwind Class | CSS Variable       | Figma Variable |
| -------------- | ---------------------- | ------------------ | -------------- |
| Default border | `border-base-300`      | `--color-base-300` | `base-300`     |
| Subtle border  | `border-base-200`      | `--color-base-200` | `base-200`     |
| Error border   | `border-error`         | `--color-error`    | `error`        |
| Success border | `border-success`       | `--color-success`  | `success`      |

---

## Status Color Mapping

| Status  | DaisyUI Class                   | CSS Variable      | Figma Variable | Content Variable  |
| ------- | ------------------------------- | ----------------- | -------------- | ----------------- |
| Success | `badge-success` / `btn-success` | `--color-success` | `success`      | `success-content` |
| Error   | `badge-error` / `btn-error`     | `--color-error`   | `error`        | `error-content`   |
| Warning | `badge-warning`                 | `--color-warning` | `warning`      | `warning-content` |
| Info    | `badge-info`                    | `--color-info`    | `info`         | `info-content`    |
| Neutral | `badge-neutral`                 | `--color-neutral` | `neutral`      | `neutral-content` |

---

## Contextual Actions — Specific Mappings

| Element                          | Recipe Spec                              | Figma Variable       |
| -------------------------------- | ---------------------------------------- | -------------------- |
| Quick action icon color          | `text-primary` (brand teal)              | `primary`            |
| Quick action label               | `text-tertiary`                          | `text-tertiary`      |
| Quick link icon container bg     | `background-primary`                     | `background-primary` |
| Quick link icon container border | `border-base-300`                        | `base-300`           |
| Filter pill active bg            | `base-content`                           | `base-content`       |
| Filter pill active text          | `base-100`                               | `base-100`           |
| Filter pill inactive border      | `base-300`                               | `base-300`           |
| Card header action icon          | `currentColor` (inherits `base-content`) | `base-content`       |

---

## Figma Library Path

All variables live under:

```
[ALPHA] Horizon 2.0 → Foundations
```

When referencing in `generate_figma_design` prompts, use the Figma variable name (column 4) directly. The tool binds to the library variable, which resolves to the correct value for the current theme mode (light/dark).

---

## Validate and Fix — Figma Prompt Pattern

When generating corrected frames, include this instruction:

```
Use Figma variables from [ALPHA] Horizon 2.0 → Foundations for all colors:
- Button fills: primary, success, error, secondary (per role)
- Button text: primary-content, success-content, error-content, secondary-content
- Outline borders: base-300, error
- Text: text-primary (body), text-secondary, text-tertiary
- Surfaces: base-100 (card), base-200 (hover), base-300 (pressed/border)
- Card background: background-primary

Do not use hardcoded hex values. Bind every fill, stroke, and text color
to the library variable.
```
