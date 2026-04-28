---
name: localization
description: Scan for localization issues and implement solutions. Use when the user mentions locale-aware formatting, RTL layout support, date/number formatting, or internationalization concerns in AIUX widgets.
metadata:
  author: servicenow
  version: '1.0.0'
compatibility: Works with Claude Code, Cursor, VS Code Copilot, Windsurf, Gemini CLI,and other Agent Skills-compatible tools
license: MIT
---

# Localization

## When to use this skill

- When the user asks about localization, internationalization, or locale-aware formatting
- When dates, numbers, or relative times are rendered without `Intl` APIs
- When a component uses physical CSS properties or Tailwind directional utilities that break RTL layouts
- When `document` or `window` is accessed for locale detection without an SSR guard

## Goals

- Use locale-aware `Intl` APIs to localize all user-visible data generated on the client side.
- Support Right-To-Left (RTL) languages with CSS logical properties and Tailwind logical utilities.

## Instructions

### 1. Detect the user's locale

Always pass the user's locale to `Intl` APIs — never rely on the browser default.

- Detect the locale from the component's `lang` attribute, falling back to `document.documentElement.lang`, then `navigator.language`:
  ```js
  getLocale() {
    return (this.getAttribute('lang') || document.documentElement.lang || 'en').toLowerCase();
  }
  ```
- For locale parsing use `Intl.Locale`:
  ```js
  const locale = new Intl.Locale(lang.replace(/_/g, '-'));
  ```

### 2. Localize dates

Format all client-generated dates for the user's locale:

```js
const formatted = new Intl.DateTimeFormat(this.getLocale(), options).format(
  date
);
```

### 3. Localize numbers

Format all client-generated numbers for the user's locale:

```js
const formatted = new Intl.NumberFormat(this.getLocale(), options).format(
  number
);
```

### 4. Localize relative time

Format relative timestamps for the user's locale:

```js
const formatted = new Intl.RelativeTimeFormat(this.getLocale(), options).format(
  value,
  unit
);
```

### 5. Guard for SSR

Wrap `Intl` calls that depend on `document` or `window` with an `isServer` check to avoid SSR crashes:

```js
import { isServer } from 'lit';

getLocale() {
  if (isServer) return 'en';
  return (this.getAttribute('lang') || document.documentElement.lang || 'en').toLowerCase();
}
```

### 6. Support RTL styles

Ensure layouts and text direction adapt for RTL languages.

#### CSS logical properties (in `static styles`)

Replace physical properties with logical equivalents:

| Physical                         | Logical                                       |
| -------------------------------- | --------------------------------------------- |
| `margin-left` / `margin-right`   | `margin-inline-start` / `margin-inline-end`   |
| `padding-left` / `padding-right` | `padding-inline-start` / `padding-inline-end` |
| `border-left` / `border-right`   | `border-inline-start` / `border-inline-end`   |
| `left` / `right`                 | `inset-inline-start` / `inset-inline-end`     |
| `text-align: left` / `right`     | `text-align: start` / `end`                   |
| `float: left` / `right`          | `float: inline-start` / `inline-end`          |

#### Tailwind logical utilities (in templates)

Replace directional utilities with logical equivalents:

| Physical                      | Logical                       |
| ----------------------------- | ----------------------------- |
| `ml-*` / `mr-*`               | `ms-*` / `me-*`               |
| `pl-*` / `pr-*`               | `ps-*` / `pe-*`               |
| `left-*` / `right-*`          | `start-*` / `end-*`           |
| `text-left` / `text-right`    | `text-start` / `text-end`     |
| `border-l-*` / `border-r-*`   | `border-s-*` / `border-e-*`   |
| `rounded-l-*` / `rounded-r-*` | `rounded-s-*` / `rounded-e-*` |

Symmetric utilities (`px-*`, `mx-*`, `border-t-*`, `border-b-*`) are already direction-neutral and do not need replacement.

#### Full-bleed overlay shorthand

When `left: 0` and `right: 0` appear **together** on the same rule (common on pseudo-element overlays like skeleton shimmers and gradient fades), use the shorthand logical property instead of two individual long-hands:

```css
/* Instead of two separate logical properties: */
inset-inline-start: 0;
inset-inline-end: 0;

/* Use the shorthand: */
inset-inline: 0;
```

Similarly, `top: 0; left: 0; right: 0; bottom: 0;` becomes `inset: 0`.

## Constraints and Don'ts

- Do not localize data from backend or props that are already localized.
- Do not call `Intl` constructors without passing the user's locale.
- Do not access `document` or `window` for locale detection during SSR without an `isServer` guard.
- Do not replace symmetric/block-axis properties (`px-*`, `py-*`, `border-t`, `border-b`) — only inline-axis properties need logical equivalents.

## Output Checklist

- User's locale is detected and passed to all `Intl` APIs.
- Client-generated dates are formatted with `Intl.DateTimeFormat(locale, options)`.
- Client-generated numbers are formatted with `Intl.NumberFormat(locale, options)`.
- Client-generated relative times are formatted with `Intl.RelativeTimeFormat(locale, options)`.
- Locale detection is guarded with `isServer` for SSR safety.
- CSS physical properties in `static styles` are replaced with logical properties.
- Tailwind directional utilities in templates are replaced with logical utilities.
