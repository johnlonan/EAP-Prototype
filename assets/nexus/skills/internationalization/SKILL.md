---
name: internationalization
description: Scan for internationalization issues and implement solutions. Use when the user mentions hardcoded strings, missing translations, parameterized messages, or i18n in AIUX widgets.
metadata:
  author: servicenow
  version: '1.0.0'
compatibility: Works with Claude Code, Cursor, VS Code Copilot, Windsurf, Gemini CLI,and other Agent Skills-compatible tools
license: MIT
---

# Internationalization

## When to use this skill

- When the user asks about internationalization, translations, or i18n patterns
- When user-facing strings are hardcoded in templates instead of wrapped with `i18n.getMessage()`
- When parameterized or pluralized messages are built with string concatenation instead of placeholders
- When i18n logic in a Lit component accesses browser globals without an `isServer` guard

## Instructions

### 1. Wrap user-facing strings with `i18n.getMessage()`

- For components extending `AIUXWidgetElement`, import `i18n` from `@servicenow/aiux-services`:
  ```js
  import {i18n} from '@servicenow/aiux-services';
  ```
- Simple message:
  ```js
  html`<p class="text-sm">${i18n.getMessage('No items found')}</p>`;
  ```
- Parameterized message (use `{0}`, `{1}`, … placeholders):
  ```js
  html`
    <p class="text-sm text-gray-600">
      ${this.loading
        ? '...'
        : i18n.getMessage('{0} items', [this.items.length + ''])}
    </p>
  `;
  ```
- Ambiguous context — add a `comment` for translators:
  ```js
  i18n.getMessage({message: 'Open', comment: 'Button label to open a record'});
  ```

### 2. Identify what must be translated

- Scan templates and constants for hardcoded user-facing text:
- Labels, headings, and body text rendered in `html` templates
- Placeholder and title attributes
- ARIA labels and accessible names (e.g., `aria-label="Close"`)
- Error and empty-state messages (e.g., `'Failed to load data'`, `'No items found'`)
- Button text (e.g., `'Recent'`, `'Oldest'`, `'Submit'`)
- Strings in props or constants that are rendered to users

### 3. Guard for SSR

- In Lit components that may render on the server, ensure i18n logic does not access browser globals without an `isServer` guard:

  ```js
  import { isServer } from 'lit';

  connectedCallback() {
    super.connectedCallback();
    if (!isServer) {
      // Safe to access browser-only i18n APIs here
    }
  }
  ```

## Constraints and Don'ts

- Don't translate hidden technical values, IDs, CSS class names, or test-only strings.
- Don't translate data already localized by the backend or passed as pre-translated props.
- Don't invent meanings — if a string's context is unclear, use the object form with a brief `comment`.
- Don't concatenate translated fragments — use parameterized messages instead, since word order varies across languages.
- Don't use template literals to build translated strings (e.g., `` `Hello ${name}` ``). Use `i18n.getMessage('Hello {0}', [name])` so the full sentence is translatable.

## Output Checklist

- All user-facing strings in templates are wrapped with `i18n.getMessage()`.
- Parameterized messages use `{0}` placeholders, not string concatenation.
- Pluralized messages use function-based translations or parameterized forms.
- Strings with ambiguous context include a translator `comment`.
- ARIA labels and accessible names are translated.
- Error and empty-state messages are translated.
- SSR-rendered components guard i18n calls that depend on browser APIs with `isServer`.
