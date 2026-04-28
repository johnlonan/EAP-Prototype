# Switch

## Pattern Usage

A switch is an input widget that allows users to choose one of two values: on or off. Switches are similar to checkboxes but represent a distinct UI pattern with an on/off metaphor rather than checked/unchecked.

## Keyboard Interaction

| Key     | Function                               |
| ------- | -------------------------------------- |
| `Space` | Toggles the switch between on and off. |
| `Enter` | Toggles the switch between on and off. |

## WAI-ARIA Roles, States, and Properties

| Requirement              | Implementation                                                              |
| ------------------------ | --------------------------------------------------------------------------- |
| Switch role              | Element has role `switch`.                                                  |
| Checked state            | When on, `aria-checked="true"`. When off, `aria-checked="false"`.           |
| Accessible name          | Switch has accessible name via content, `aria-labelledby`, or `aria-label`. |
| Description _(Optional)_ | `aria-describedby` may reference additional descriptive text.               |
