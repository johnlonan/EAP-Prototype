# Menu Button

## Pattern Usage

A menu button is a button that opens a menu. It's often styled with a downward pointing arrow or triangle to indicate that activating it will display a menu.

## Keyboard Interaction

| Key                       | Function                                                |
| ------------------------- | ------------------------------------------------------- |
| `Enter`                   | Opens the menu and places focus on the first menu item. |
| `Space`                   | Opens the menu and places focus on the first menu item. |
| `Down Arrow` _(Optional)_ | Opens the menu and moves focus to the first menu item.  |
| `Up Arrow` _(Optional)_   | Opens the menu and moves focus to the last menu item.   |

After the menu opens, keyboard interaction follows the Menu pattern.

## WAI-ARIA Roles, States, and Properties

| Requirement        | Implementation                                                                 |
| ------------------ | ------------------------------------------------------------------------------ |
| Button role        | The button has role `button`.                                                  |
| Popup indicator    | `aria-haspopup="menu"` or `aria-haspopup="true"`.                              |
| Expanded state     | `aria-expanded="false"` when menu is closed; `aria-expanded="true"` when open. |
| Controls reference | `aria-controls` references the menu element.                                   |
| Accessible name    | Button has accessible name describing the menu it opens.                       |
