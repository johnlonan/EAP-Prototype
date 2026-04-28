# Combobox

## Pattern Usage

A combobox is an input widget that has an associated popup. The popup enables users to choose a value for the input from a collection. The popup can be a `listbox`, `grid`, `tree`, or `dialog`.

**Autocomplete Behaviors:**

| Behavior            | `aria-autocomplete` Value | Description                                               |
| ------------------- | ------------------------- | --------------------------------------------------------- |
| No autocomplete     | `none`                    | Popup values are the same regardless of characters typed. |
| List autocomplete   | `list`                    | Popup values are filtered to match typed characters.      |
| Inline autocomplete | `inline`                  | Suggested completion text appears inline in the textbox.  |
| Both                | `both`                    | Combines list filtering with inline completion.           |

## Keyboard Interaction

**Textbox (combobox element):**

| Key                             | Function                                                                             |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| `Down Arrow`                    | If popup is closed, opens popup. If popup is open, moves focus to next option.       |
| `Up Arrow`                      | If popup is closed, opens popup. If popup is open, moves focus to previous option.   |
| `Escape`                        | Closes popup if open. Optionally clears textbox.                                     |
| `Enter`                         | If popup is open and an option is focused, accepts that value. Closes popup.         |
| `Tab`                           | Accepts current value (if any), closes popup, moves focus to next focusable element. |
| `Alt + Down Arrow` _(Optional)_ | Opens popup without moving focus into it.                                            |
| `Alt + Up Arrow` _(Optional)_   | If popup is open, closes it and returns focus to combobox.                           |
| Printable Characters            | Types into textbox; may filter popup options based on autocomplete behavior.         |

**Listbox Popup:**

| Key          | Function                                                |
| ------------ | ------------------------------------------------------- |
| `Down Arrow` | Moves focus to next option.                             |
| `Up Arrow`   | Moves focus to previous option.                         |
| `Home`       | Moves focus to first option.                            |
| `End`        | Moves focus to last option.                             |
| Type-ahead   | Moves focus to option starting with typed character(s). |

## WAI-ARIA Roles, States, and Properties

| Requirement           | Implementation                                                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Combobox role         | The input element has role `combobox`.                                                                                             |
| Popup reference       | `aria-controls` references the popup element (required when popup is visible).                                                     |
| Popup type            | If popup is not a listbox, `aria-haspopup` is set to `grid`, `tree`, or `dialog`. Default is `listbox`.                            |
| Expanded state        | `aria-expanded="false"` when popup is hidden; `aria-expanded="true"` when visible.                                                 |
| Active descendant     | When focus is visually on a popup option but DOM focus remains on combobox, `aria-activedescendant` references the focused option. |
| Autocomplete behavior | `aria-autocomplete` is set to `none`, `list`, `inline`, or `both`.                                                                 |
| Selected option       | In the popup, visually indicated selected option has `aria-selected="true"`.                                                       |
| Accessible name       | Combobox has accessible name via `<label>`, `aria-labelledby`, or `aria-label`.                                                    |
