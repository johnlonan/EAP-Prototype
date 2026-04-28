# Menu and Menubar

## Pattern Usage

A menu is a widget that offers a list of choices to the user, such as a set of actions or functions. A menubar is typically a horizontal bar containing menu items, some of which may open submenus. Menus are commonly opened by menu buttons or by right-clicking (context menu).

**Menu Item Types:**

| Role               | Description                                              |
| ------------------ | -------------------------------------------------------- |
| `menuitem`         | Command that executes an action.                         |
| `menuitemcheckbox` | Checkable option. Toggles between checked and unchecked. |
| `menuitemradio`    | One of a group of mutually exclusive options.            |

## Keyboard Interaction

**Menubar:**

| Key           | Function                                                                     |
| ------------- | ---------------------------------------------------------------------------- |
| `Right Arrow` | Moves focus to next item. Wraps from last to first.                          |
| `Left Arrow`  | Moves focus to previous item. Wraps from first to last.                      |
| `Down Arrow`  | Opens submenu and moves focus to first item.                                 |
| `Up Arrow`    | Opens submenu and moves focus to last item.                                  |
| `Enter`       | Activates item. If it has a submenu, opens it and moves focus to first item. |
| `Space`       | Activates item (same as Enter for most items).                               |
| `Home`        | Moves focus to first item.                                                   |
| `End`         | Moves focus to last item.                                                    |
| `Escape`      | Closes menu.                                                                 |
| Character     | Moves focus to item starting with that character.                            |

**Submenu/Dropdown Menu:**

| Key           | Function                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| `Down Arrow`  | Moves focus to next item.                                                                               |
| `Up Arrow`    | Moves focus to previous item.                                                                           |
| `Right Arrow` | If item has submenu, opens it. Otherwise, closes current menu and opens next menubar item's submenu.    |
| `Left Arrow`  | Closes current submenu and moves focus to parent. If in top-level menu, moves to previous menubar item. |
| `Enter`       | Activates item and closes menu.                                                                         |
| `Escape`      | Closes the menu and returns focus to menu button or menubar item.                                       |

## WAI-ARIA Roles, States, and Properties

| Requirement       | Implementation                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| Menu/menubar role | Container has role `menu` or `menubar`.                                                               |
| Item roles        | Items have role `menuitem`, `menuitemcheckbox`, or `menuitemradio`.                                   |
| Submenu indicator | Items with submenus have `aria-haspopup="menu"` and `aria-expanded`.                                  |
| Checked state     | `menuitemcheckbox` and `menuitemradio` have `aria-checked` (`true`/`false`).                          |
| Disabled state    | Disabled items have `aria-disabled="true"`.                                                           |
| Accessible name   | Menu has accessible name via `aria-labelledby` or `aria-label`.                                       |
| Orientation       | Menubar is implicitly horizontal. Menus are implicitly vertical. Use `aria-orientation` if different. |
