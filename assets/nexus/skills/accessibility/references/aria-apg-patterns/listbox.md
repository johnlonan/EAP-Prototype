# Listbox

## Pattern Usage

A listbox widget presents a list of options and allows a user to select one or more of them. A listbox that allows only a single option to be selected is a single-select listbox; one that allows multiple options is a multi-select listbox.

## Keyboard Interaction

**Single-Select Listbox:**

| Key          | Function                                                |
| ------------ | ------------------------------------------------------- |
| `Down Arrow` | Moves focus to and selects the next option.             |
| `Up Arrow`   | Moves focus to and selects the previous option.         |
| `Home`       | Moves focus to and selects the first option.            |
| `End`        | Moves focus to and selects the last option.             |
| Type-ahead   | Moves focus to option starting with typed character(s). |

**Multi-Select Listbox:**

| Key                   | Function                                                   |
| --------------------- | ---------------------------------------------------------- |
| `Down Arrow`          | Moves focus to next option (doesn't change selection).     |
| `Up Arrow`            | Moves focus to previous option (doesn't change selection). |
| `Space`               | Changes the selection state of the focused option.         |
| `Shift + Down Arrow`  | Moves focus and extends selection to next option.          |
| `Shift + Up Arrow`    | Moves focus and extends selection to previous option.      |
| `Ctrl + Shift + Home` | Selects from focused option to first option.               |
| `Ctrl + Shift + End`  | Selects from focused option to last option.                |
| `Ctrl + A`            | Selects all options. Optionally toggles all.               |

## WAI-ARIA Roles, States, and Properties

| Requirement                    | Implementation                                                                                                                           |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Listbox role                   | Container has role `listbox`.                                                                                                            |
| Option role                    | Each option has role `option`.                                                                                                           |
| Multi-select                   | If multi-select, listbox has `aria-multiselectable="true"`.                                                                              |
| Selected state                 | Selected options have `aria-selected="true"`. Unselected have `aria-selected="false"`.                                                   |
| Accessible name                | Listbox has accessible name via `aria-labelledby` or `aria-label`.                                                                       |
| Active descendant _(Optional)_ | If using `aria-activedescendant` for focus management, DOM focus stays on listbox and `aria-activedescendant` references focused option. |
| Grouped options                | Groups have role `group` with accessible name via `aria-label` or `aria-labelledby`.                                                     |
| Orientation                    | If horizontal, set `aria-orientation="horizontal"`. Default is `vertical`.                                                               |
