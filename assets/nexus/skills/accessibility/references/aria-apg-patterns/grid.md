# Grid

## Pattern Usage

A grid widget is a container that enables users to navigate the information or interactive elements it contains using directional navigation keys, such as arrow keys, Home, and End. It differs from a table in that a grid is interactive—cells may contain focusable elements or be focusable themselves.

**Grid vs. Table:** Use a table for presenting static data. Use a grid when cells contain interactive widgets or when two-dimensional keyboard navigation is beneficial.

## Keyboard Interaction

| Key           | Function                                                                         |
| ------------- | -------------------------------------------------------------------------------- |
| `Right Arrow` | Moves focus one cell to the right. Optionally wraps to first cell of next row.   |
| `Left Arrow`  | Moves focus one cell to the left. Optionally wraps to last cell of previous row. |
| `Down Arrow`  | Moves focus one cell down. Optionally wraps to top of next column.               |
| `Up Arrow`    | Moves focus one cell up. Optionally wraps to bottom of previous column.          |
| `Page Down`   | Moves focus down by author-determined number of rows.                            |
| `Page Up`     | Moves focus up by author-determined number of rows.                              |
| `Home`        | Moves focus to first cell in the row.                                            |
| `End`         | Moves focus to last cell in the row.                                             |
| `Ctrl + Home` | Moves focus to first cell in first row.                                          |
| `Ctrl + End`  | Moves focus to last cell in last row.                                            |

**Selection (if supported):**

| Key             | Function                                            |
| --------------- | --------------------------------------------------- |
| `Space`         | Selects/deselects the focused cell or row.          |
| `Shift + Arrow` | Extends selection in the arrow direction.           |
| `Ctrl + Space`  | Selects the column (if column selection supported). |
| `Shift + Space` | Selects the row (if row selection supported).       |
| `Ctrl + A`      | Selects all cells.                                  |

## WAI-ARIA Roles, States, and Properties

| Requirement      | Implementation                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| Grid role        | Container has role `grid`.                                                                         |
| Row role         | Each row has role `row`.                                                                           |
| Cell roles       | Cells have role `gridcell`, `rowheader`, or `columnheader`.                                        |
| Accessible name  | Grid has accessible name via `aria-labelledby` or `aria-label`.                                    |
| Selected state   | If selection is supported, selected cells/rows have `aria-selected="true"`.                        |
| Sort indicator   | For sortable columns, header has `aria-sort` set to `ascending`, `descending`, `other`, or `none`. |
| Row/column count | If virtualized, use `aria-rowcount`, `aria-colcount`, `aria-rowindex`, `aria-colindex`.            |
| Spanning cells   | Use `aria-rowspan` and `aria-colspan` for merged cells.                                            |
| Read-only state  | Editable grids may use `aria-readonly` on cells or the grid.                                       |
