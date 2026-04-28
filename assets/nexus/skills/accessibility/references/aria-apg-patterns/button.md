# Button

## Pattern Usage

A button is a widget that enables users to trigger an action or event, such as submitting a form, opening a dialog, canceling an action, or performing a delete operation. A common convention for informing users that a button launches a dialog is to append "..." (ellipsis) to the button label, e.g., "Save as...".

**Button Types:**

| Type           | Description                                                                                                                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Command button | Executes a discrete action, such as submitting a form or opening a dialog.                                                                                                                                            |
| Toggle button  | A two-state button that can be either off (not pressed) or on (pressed). To indicate state, specify a value for `aria-pressed`. **Important:** The label on a toggle button should not change when its state changes. |
| Menu button    | A button that opens a menu (see Menu Button pattern). Has `aria-haspopup` set to `menu` or `true`.                                                                                                                    |

## Keyboard Interaction

| Key     | Function              |
| ------- | --------------------- |
| `Enter` | Activates the button. |
| `Space` | Activates the button. |

**Focus Behavior After Activation:**

| Scenario                         | Focus Behavior                                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Opens a dialog                   | Focus moves inside the dialog (see Dialog pattern).                                                                      |
| Closes a dialog                  | Focus typically returns to the button that opened the dialog unless the function performed leads to a different context. |
| Does not dismiss current context | Focus typically remains on the button (e.g., Apply, Recalculate).                                                        |
| Indicates context change         | Focus moves to the starting point for that action (e.g., next step in wizard).                                           |

## WAI-ARIA Roles, States, and Properties

| Requirement                    | Implementation                                                                                              |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Button role                    | The button has role `button`. Use native `<button>` element when possible.                                  |
| Accessible name                | The button has an accessible label provided by its content, `aria-labelledby`, or `aria-label`.             |
| Description _(Optional)_       | If a description is present, `aria-describedby` is set to the ID of the element containing the description. |
| Disabled state                 | When unavailable, the button has `aria-disabled` set to `true`.                                             |
| Pressed state (toggle buttons) | Toggle buttons have `aria-pressed` set to `true` when on, `false` when off.                                 |
| Menu indicator (menu buttons)  | Menu buttons have `aria-haspopup` set to `menu` or `true`.                                                  |
| Expanded state (menu buttons)  | Menu buttons have `aria-expanded` set to `true` when menu is open, `false` when closed.                     |
