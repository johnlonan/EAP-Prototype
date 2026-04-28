---
name: responsive-design
description: Scan for responsive design issues and implement solutions. Use when the user mentions responsive design layout problems, mobile display issues, zoom behavior, or WCAG reflow compliance in AIUX widgets.
metadata:
  author: servicenow
  version: '1.0.0'
compatibility: Works with Claude Code, Cursor, VS Code Copilot, Windsurf, Gemini CLI, and other Agent Skills-compatible tools
license: MIT
---

# Responsive Design

## When to use this skill

- When the user asks about responsive design, best practices or relative units
- When a component does not adapt correctly to small viewports or zoom levels
- When the user reports horizontal scrolling or layout breakage at mobile widths
- When a component fails WCAG 2.2 Success Criterion 1.4.10 Reflow (320px / 400% zoom)

## Goals

- Ensure components adapt correctly to different viewport sizes and zoom levels.
- Respect WCAG 2.2 Success Criterion 1.4.10 Reflow requirements: content must not require two-dimensional scrolling at 320px width (mobile portrait) and up to 400% zoom.
- Guarantee readability and usability of all text and UI elements when zoomed or resized.

## Instructions

1. Scan component layout and styles
   - Collect breakpoints, fixed widths, absolute units, and overflow rules that may cause layout issues.
   - Detect absolute positioning that may break under zoom or small viewports.
2. Apply responsive behavior principles
   - Replace all fixed widths/heights with relative units (`%`, `em`, `rem`, `ch`, `minmax`, `fr`).
   - Use CSS functions (`clamp()`, `min()`, `max()`) for font sizes and spacing.
   - Ensure line height is at least 1.5× the font size for readability at zoom.
   - Ensure all images, videos, and SVGs scale fluidly (`max-width: 100%; height: auto`).
   - Ensure layouts adapt down to 320px width; use breakpoints only where fluid scaling does not suffice.
   - Use `flex-wrap` or grid auto-placement to prevent content overflow.
   - Do not disable zoom (never set `user-scalable=no` in meta viewport).
3. Summarize changes
   - When applying fixes directly, print: `"Fixed: …"`, `"Updated: … → …"`, `"Removed: …"`.
   - When used as part of a code review, defer to the reviewer's output format instead.
   - If no changes are detected, print `"No changes"`.

## AIUX Widget Exceptions

When working in an AIUX widget context (components extending `AIUXWidgetElement`), the following patterns are intentional and must NOT be changed:

- **Fixed-size icon and avatar containers** — dimensions like `width: 32px; height: 32px;` or `width: 36px; height: 36px;` on icon wrappers, skeleton shapes, and avatar containers are intentional. Converting these to `%` or `em` would break the visual design. Converting to `rem` is acceptable only if the design requires it.
- **`position: absolute` on overlay pseudo-elements** — the shimmer effect on skeleton loaders (`.skeleton-card::after`) and the gradient fade overlay used by `<fade-scroll>` use `position: absolute` by design. Do not flag these as potential layout issues.

## Constraints and Don’ts

- Do not introduce horizontal scrolling at ≤ 320px width unless strictly unavoidable (e.g., large data tables).
- Do not use absolute units (`px`) where relative units are possible.
- Do not hide content at smaller widths unless an alternative access method is provided.
- Do not disable browser zoom.

## Output Checklist

1. Changes are summarized (even if `"No changes"`).
2. Relative units are used for widths, font sizes, and spacing.
3. Images/media scale fluidly without causing overflow.
4. Line heights meet minimum readability standards at zoom.
5. Content reflows without horizontal scrolling at 320px and 400% zoom.
