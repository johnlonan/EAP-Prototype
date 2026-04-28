# Alert

## Pattern Usage

An alert is an element that displays a brief, important message in a way that attracts the user's attention without interrupting the user's task. Dynamically rendered alerts are automatically announced by most screen readers, and in some operating systems, they may trigger an alert sound. It is important to note that, at this time, screen readers do not inform users of alerts that are present on the page before page load completes.

Because alerts are intended to provide important and potentially time-sensitive information without interfering with the user's ability to continue working, it is crucial they do not affect keyboard focus. The Alert Dialog Pattern is designed for situations where interrupting work flow is necessary.

## Keyboard Interaction

An alert (in its basic form) is not an interactive element, so it has no keyboard interaction. However, when an alert contains interactive elements such as links or buttons, those elements follow their respective keyboard patterns.

## WAI-ARIA Roles, States, and Properties

| Requirement          | Implementation                                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alert role           | The widget has a role of `alert`.                                                                                                                                                                             |
| Accessible name      | The alert contains a message that conveys the nature of the alert. If the alert has a visible heading, use `aria-labelledby` to reference it. Otherwise, provide a concise accessible name with `aria-label`. |
| Live region behavior | The `alert` role has an implicit `aria-live` value of `assertive` and an implicit `aria-atomic` value of `true`.                                                                                              |

**Important Considerations:**

- Because an alert is for information that requires immediate attention, assistive technologies may automatically read the alert as soon as it appears, potentially interrupting whatever the user was doing.
- Do not include interactive elements that require user action within an alert if you need to maintain workflow continuity. Use an Alert Dialog instead.
- Alerts should not disappear automatically—users need adequate time to read them.
