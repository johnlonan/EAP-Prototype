# Best Practices Summary

## First Rule of ARIA

> **No ARIA is better than bad ARIA.**

Use native HTML elements whenever possible. They have built-in accessibility, keyboard support, and are well-tested across browsers and assistive technologies.

## Fundamental Principles

| Principle                                            | Guidance                                                                                    |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Use native HTML first                                | `<button>`, `<input>`, `<select>`, `<a href>`, etc. already have accessibility built in.    |
| All interactive elements must be keyboard accessible | Every action possible with a mouse must be possible with a keyboard.                        |
| Maintain visible focus                               | Users must always be able to see where keyboard focus is located.                           |
| Ensure logical focus order                           | Focus order should match visual reading order.                                              |
| Provide accessible names                             | All interactive elements need meaningful labels.                                            |
| Indicate states and properties                       | Communicate changes in state (expanded, selected, checked, etc.) to assistive technologies. |

## Focus Management Best Practices

| Situation                     | Practice                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Focus visibility              | Always provide clear, visible focus indicators. Never remove focus outlines without providing an alternative. |
| Focus trapping                | Modal dialogs should trap focus. Non-modal components should not.                                             |
| Focus on open                 | When opening a dialog/menu, move focus inside appropriately.                                                  |
| Focus on close                | When closing a dialog/menu, return focus to the triggering element.                                           |
| Dynamic content               | When content updates dynamically, manage focus to prevent disorientation.                                     |
| Don't move focus unexpectedly | Focus should only move in response to user action or explicit application logic.                              |

## Accessible Names and Descriptions

| Method             | When to Use                                                                        |
| ------------------ | ---------------------------------------------------------------------------------- |
| Element content    | When the text content of an element is the label (buttons, links).                 |
| `<label>` element  | For form inputs. Connect with `for`/`id` or nesting.                               |
| `aria-labelledby`  | When a visible element should serve as the label. Can reference multiple elements. |
| `aria-label`       | When no visible label exists. Overrides other naming methods.                      |
| `aria-describedby` | For supplementary descriptions. Does not replace the accessible name.              |

## Live Regions for Dynamic Content

| Attribute       | Value                                  | Use Case                                                          |
| --------------- | -------------------------------------- | ----------------------------------------------------------------- |
| `aria-live`     | `polite`                               | Non-urgent updates. Announced at next pause.                      |
| `aria-live`     | `assertive`                            | Critical updates. Interrupts current announcement. Use sparingly. |
| `aria-atomic`   | `true`                                 | Announce entire region on change (not just changed content).      |
| `aria-relevant` | `additions`, `removals`, `text`, `all` | Specify what changes should trigger announcements.                |

## State Management

| State           | Purpose                                                               |
| --------------- | --------------------------------------------------------------------- |
| `aria-expanded` | Indicates if a collapsible section is open or closed.                 |
| `aria-selected` | Indicates selection state in lists, grids, tabs.                      |
| `aria-checked`  | Indicates checked state for checkboxes, switches, radio buttons.      |
| `aria-pressed`  | Indicates pressed state for toggle buttons.                           |
| `aria-current`  | Indicates current item in a set (page, step, date, etc.).             |
| `aria-disabled` | Indicates an element is not interactive. Keeps element visible to AT. |
| `aria-hidden`   | Hides content from assistive technologies. Does not hide visually.    |
| `aria-invalid`  | Indicates a form field has an error.                                  |
| `aria-busy`     | Indicates content is being updated.                                   |

## Testing Recommendations

| Test Type             | Method                                                                    |
| --------------------- | ------------------------------------------------------------------------- |
| Keyboard testing      | Navigate using only keyboard. Verify all interactions work without mouse. |
| Screen reader testing | Test with at least NVDA or JAWS (Windows) and VoiceOver (macOS/iOS).      |
| Automated testing     | Use axe, WAVE, or Lighthouse to catch common issues.                      |
| Manual review         | Check focus order, reading order, and meaningful labels.                  |
| User testing          | Include users with disabilities in usability testing.                     |
