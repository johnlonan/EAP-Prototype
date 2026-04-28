# Dialog (Modal)

## Pattern Usage

A dialog is a window overlaid on either the primary window or another dialog window. Windows under a modal dialog are inert—users cannot interact with content outside the active dialog window. Inert content outside an active dialog is typically visually obscured or dimmed.

## Keyboard Interaction

| Key           | Function                                                                                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Tab`         | Moves focus to next tabbable element inside the dialog. If focus is on the last tabbable element, moves focus to the first tabbable element (focus is trapped). |
| `Shift + Tab` | Moves focus to previous tabbable element inside the dialog. If focus is on the first tabbable element, moves focus to the last tabbable element.                |
| `Escape`      | Closes the dialog.                                                                                                                                              |

**Focus Management:**

| When          | Focus Behavior                                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dialog opens  | Focus moves to an element inside the dialog. Typically the first focusable element, or a static element at the start if content needs to be read first. |
| Dialog closes | Focus returns to the element that invoked the dialog, unless the completed action logically leads elsewhere.                                            |

## WAI-ARIA Roles, States, and Properties

| Requirement                         | Implementation                                                                                                                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dialog role                         | The element containing the dialog has role `dialog`.                                                                                                                                 |
| Modal attribute                     | `aria-modal="true"` indicates content outside is inert.                                                                                                                              |
| Accessible name                     | Required. Use `aria-labelledby` referencing visible title, or `aria-label`.                                                                                                          |
| Accessible description _(Optional)_ | `aria-describedby` may reference elements describing the dialog's purpose. Best for simple content. For complex content (lists, tables, paragraphs), focus a static element instead. |

**Implementation Notes:**

- `aria-modal="true"` replaces the need to set `aria-hidden="true"` on background content in modern implementations.
- Mark a dialog as modal only when both:
  1. Application code prevents all users from interacting with content outside it
  2. Visual styling obscures content outside it

## Focus Trapping

For modals, dialogs, and drawers, enable `trap: true` to cycle Tab/Shift+Tab within the shadow root and automatically apply `aria-hidden="true"` to sibling body children — isolating the trapped region for screen readers.

**Also apply `inert` to background content.** `aria-hidden` hides elements from the accessibility tree but does not prevent them from receiving focus or pointer events. The `inert` attribute does all three: it removes elements from the tab order, suppresses pointer interaction, and hides them from assistive technologies. Apply `inert` to the page's main content region when the dialog opens, and remove it on close:

```js
// When opening
document.querySelector('main').setAttribute('inert', '');

// When closing
document.querySelector('main').removeAttribute('inert');
```

**Important:** Focus trapping must always include an escape mechanism (Escape key to close) to satisfy WCAG 2.1.2 (No Keyboard Trap).

**Choosing between `role="dialog"` and `role="alertdialog"`:**

| Role                 | When to use                                                                                                                 | Screen reader behavior                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `role="dialog"`      | Informational or interactive dialogs where the user may or may not need to act (settings, forms, detail views)              | Announces the dialog name on open                                             |
| `role="alertdialog"` | Destructive or urgent dialogs that **require** an immediate decision (delete confirmation, discard changes, session expiry) | Immediately reads the dialog message, interrupting the user — signals urgency |

Use `role="alertdialog"` when the dialog itself is the alert — i.e., the content communicates something critical that demands an immediate response. Use `role="dialog"` for everything else.

```js
class MyModal extends AIUXElement {
  _focus = new FocusController(this, {trap: true});

  render() {
    return html`
      <div role="dialog" aria-modal="true" aria-label="Confirm action">
        <p>Are you sure?</p>
        <button @click="${this._onCancel}">Cancel</button>
        <button @click="${this._onConfirm}">Confirm</button>
      </div>
    `;
  }

  _onCancel() {
    this.dispatchEvent(new Event('close'));
  }
  _onConfirm() {
    /* ... */
  }
}
```
