import {isTabbable, iterateFocusableElements} from './utils/iterate-focusable-elements.js'
import {polyfill as eventListenerSignalPolyfill} from './polyfills/event-listener-signal.js'

eventListenerSignalPolyfill()

interface FocusTrapMetadata {
  container: HTMLElement
  controller: AbortController
  initialFocus?: HTMLElement
  originalSignal: AbortSignal
}

const suspendedTrapStack: FocusTrapMetadata[] = []
let activeTrap: FocusTrapMetadata | undefined = undefined

function tryReactivate() {
  const trapToReactivate = suspendedTrapStack.pop()
  if (trapToReactivate) {
    focusTrap(trapToReactivate.container, trapToReactivate.initialFocus, trapToReactivate.originalSignal)
  }
}

// @todo If AbortController.prototype.follow is ever implemented, that
// could replace this function. @see https://github.com/whatwg/dom/issues/920
function followSignal(signal: AbortSignal): AbortController {
  const controller = new AbortController()
  signal.addEventListener('abort', () => {
    controller.abort()
  })
  return controller
}

/**
 * Returns the first focusable child of `container`. If `lastChild` is true,
 * returns the last focusable child of `container`.
 * @param container
 * @param lastChild
 */
function getFocusableChild(container: HTMLElement, lastChild = false) {
  return iterateFocusableElements(container, {reverse: lastChild, strict: true, onlyTabbable: true}).next().value
}

/**
 * Traps focus within the given container.
 * @param container The container in which to trap focus
 * @returns AbortController - call `.abort()` to disable the focus trap
 */
export function focusTrap(container: HTMLElement, initialFocus?: HTMLElement): AbortController

/**
 * Traps focus within the given container.
 * @param container The container in which to trap focus
 * @param abortSignal An AbortSignal to control the focus trap.
 */
export function focusTrap(container: HTMLElement, initialFocus: HTMLElement | undefined, abortSignal: AbortSignal): void
export function focusTrap(
  container: HTMLElement,
  initialFocus?: HTMLElement,
  abortSignal?: AbortSignal
): AbortController | void {
  // Set up an abort controller if a signal was not passed in
  const controller = new AbortController()
  const signal = abortSignal ?? controller.signal

  container.setAttribute('data-focus-trap', 'active')
  let lastFocusedChild: HTMLElement | undefined = undefined

  // Ensure focus remains in the trap zone by checking that a given recently-focused
  // element is inside the trap zone. If it isn't, redirect focus to a suitable
  // element within the trap zone. If need to redirect focus and a suitable element
  // is not found, focus the container.
  function ensureTrapZoneHasFocus(focusedElement: EventTarget | null) {
    if (focusedElement instanceof HTMLElement && document.contains(container)) {
      if (container.contains(focusedElement)) {
        // If a child of the trap zone was focused, remember it
        lastFocusedChild = focusedElement
        return
      } else {
        if (lastFocusedChild && isTabbable(lastFocusedChild) && container.contains(lastFocusedChild)) {
          lastFocusedChild.focus()
          return
        } else if (initialFocus && container.contains(initialFocus)) {
          initialFocus.focus()
          return
        } else {
          // Ensure the container is focusable:
          // - Either the container already has a `tabIndex`
          // - Or provide a temporary `tabIndex`
          const containerNeedsTemporaryTabIndex = container.getAttribute('tabindex') === null
          if (containerNeedsTemporaryTabIndex) {
            container.setAttribute('tabindex', '-1')
          }
          // Focus the container.
          container.focus()
          // If a temporary `tabIndex` was provided, remove it.
          if (containerNeedsTemporaryTabIndex) {
            // Once focus has moved from the container to a child within the FocusTrap,
            // the container can be made un-refocusable by removing `tabIndex`.
            container.addEventListener('blur', () => container.removeAttribute('tabindex'), {once: true})
            // NB: If `tabIndex` was removed *before* `blur`, then certain browsers (e.g. Chrome)
            // would consider `body` the `activeElement`, and as a result, keyboard navigation
            // between children would break, since `body` is outside the `FocusTrap`.
          }
          return
        }
      }
    }
  }

  const wrappingController = followSignal(signal)

  container.addEventListener(
    'keydown',
    event => {
      if (event.key !== 'Tab' || event.defaultPrevented) {
        return
      }

      const {target} = event
      const firstFocusableChild = getFocusableChild(container)
      const lastFocusableChild = getFocusableChild(container, true)
      if (target === firstFocusableChild && event.shiftKey) {
        event.preventDefault()
        lastFocusableChild?.focus()
      } else if (target === lastFocusableChild && !event.shiftKey) {
        event.preventDefault()
        firstFocusableChild?.focus()
      }
    },
    {signal: wrappingController.signal}
  )

  if (activeTrap) {
    const suspendedTrap = activeTrap
    activeTrap.container.setAttribute('data-focus-trap', 'suspended')
    activeTrap.controller.abort()
    suspendedTrapStack.push(suspendedTrap)
  }

  // When this trap is canceled, either by the user or by us for suspension
  wrappingController.signal.addEventListener('abort', () => {
    activeTrap = undefined
  })

  // Only when user-canceled
  signal.addEventListener('abort', () => {
    container.removeAttribute('data-focus-trap')
    const suspendedTrapIndex = suspendedTrapStack.findIndex(t => t.container === container)
    if (suspendedTrapIndex >= 0) {
      suspendedTrapStack.splice(suspendedTrapIndex, 1)
    }
    tryReactivate()
  })

  // Prevent focus leaving the trap container
  document.addEventListener(
    'focus',
    event => {
      ensureTrapZoneHasFocus(event.target)
    },
    // use capture to ensure we get all events.  focus events do not bubble
    {signal: wrappingController.signal, capture: true}
  )

  // focus the first element
  ensureTrapZoneHasFocus(document.activeElement)

  activeTrap = {
    container,
    controller: wrappingController,
    initialFocus,
    originalSignal: signal
  }

  // If we are activating a focus trap for a container that was previously
  // suspended, just remove it from the suspended list.
  const suspendedTrapIndex = suspendedTrapStack.findIndex(t => t.container === container)
  if (suspendedTrapIndex >= 0) {
    suspendedTrapStack.splice(suspendedTrapIndex, 1)
  }
  if (!abortSignal) {
    return controller
  }
}
