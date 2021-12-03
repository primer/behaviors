# Focus Trap

The `focusTrap` behavior is used prevent focus from leaving a particular element. This is useful for implementing modal dialogs: only the content within the dialog should be interactive, even though the UI underneath may still be visible.

## Behavior

- Activation: As soon as the focus trap is activated, it will ensure that an element within the container has focus. If it doesn't, it will focus the first focusable element within the container, or, if provided, the element indicated by the `initialFocus` parameter (see API below).
- External focus changes: If an external cause (e.g. mouse click, scripts, or accessibility software) results in an element outside the container to be focused, focus will immediately be redirected to the last-focused element that is inside the container.
- Circular tab focus: Using the `TAB` key on the last focusable element within the container will result in the first focusable element within the container receiving focus. Similarly, `Shift+TAB` can be used to focus the last element from the first.
- Global: Only one focus trap can be _active_ at a time. When a focus trap is enabled, if there is already an active focus trap, it becomes suspended and pushed onto a stack. Once the newly-active focus trap is disabled, the most recently-suspended trap will reactivate. Suspended focus traps can be disabled, causing them to be removed from the stack of suspended traps.

## Usage

```ts
function showDialog() {
  const dialog = document.getElementById('myDialog')
  if (dialog instanceof HTMLElement) {
    dialog.style.display = ''
    return focusTrap(dialog)
  }
}
function hideDialog(controller: AbortController) {
  document.getElementById('myDialog')?.style.display = 'none'
  controller.abort()
}
const dialogController = showDialog()

// later
if (dialogController) {
  hideDialog(controller)
}
```

## API

The `focusTrap` function takes the following arguments.

| Name         | Type           |   Default   | Description                                                                                                                                                  |
| :----------- | :------------- | :---------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| container    | `HTMLElement`  |             | When active, only elements within this container (along with the container itself) can be focused.                                                           |
| initialFocus | `HTMLElement`  |             | Specifies the element which will receive focus when the focus trap is activated. Defaults to the first tabbable element inside the container.                |
| signal       | `AbortSignal?` | `undefined` | Optional abort signal to control the focus trap. If one is not provided, an `AbortController` will be returned, which can be used to disable the focus trap. |

### Return value

If the `signal` argument is omitted, `focusTrap()` will return an `AbortController`. This object has an `abort()` method, which can be called to disable the focus trap.

## Best practices

- Focus management is an important consideration for accessible applications. Sometimes poor focus management can make certain tasks impossible to complete for users not using a mouse. To learn more, read the [ARIA guidelines for keyboard focus](https://www.w3.org/TR/wai-aria-practices/#kbd_focus_discernable_predictable).
- Only activate a focus trap if all UI outside of the trap container should be inert (non-interactive).
- Avoid situations where multiple focus traps may be active (e.g. dialogs that open more dialogs). This behavior handles those situations, but the pattern may indicate poor UX.

## A note on performance

When focus trap is activated, it must perform [reflow](https://developers.google.com/speed/docs/insights/browser-reflow) to discover focusable elements. Use caution not to rapidly enable and disable focus traps.
