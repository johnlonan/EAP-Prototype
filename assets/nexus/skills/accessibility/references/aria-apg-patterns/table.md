# Table

## Pattern Usage

Like an HTML table element, a WAI-ARIA table is a static tabular structure containing one or more rows that each contain one or more cells. It is not an interactive widget. For interactive tabular data, use the Grid pattern instead.

**Authors are strongly encouraged to use native HTML `<table>` elements.**

## Keyboard Interaction

Not applicable—table is not an interactive widget. Focusable elements within cells follow standard focus behavior.

## WAI-ARIA Roles, States, and Properties

| Requirement              | Implementation                                                                                                             |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Table role               | Container has role `table`.                                                                                                |
| Row role                 | Each row has role `row`.                                                                                                   |
| Cell roles               | Cells have role `cell`, `columnheader`, or `rowheader`.                                                                    |
| Accessible name          | Table has accessible name via `aria-labelledby` or `aria-label`.                                                           |
| Description _(Optional)_ | `aria-describedby` may reference a caption or description.                                                                 |
| Sort indicator           | For sortable columns, header has `aria-sort` (`ascending`, `descending`, `other`, `none`).                                 |
| Row/column count         | If rows/columns are hidden or dynamically loaded, use `aria-rowcount`/`aria-colcount` and `aria-rowindex`/`aria-colindex`. |
| Spanning cells           | Use `aria-rowspan` and `aria-colspan` for merged cells.                                                                    |
