import {getFocusableChild, isTabbable} from './utils/iterate-focusable-elements.js'
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

function observeFocusTrap(container: HTMLElement, sentinels: HTMLElement[]) {
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        const sentinelChildren = Array.from(mutation.addedNodes).filter(
          e => e instanceof HTMLElement && e.classList.contains('sentinel') && e.tagName === 'SPAN',
        )

        // If any of the added nodes are sentinels, don't do anything
        if (sentinelChildren.length) {
          return
        }
        // If the first and last children of container aren't sentinels, move them to the start and end
        const firstChild = container.firstElementChild
        const lastChild = container.lastElementChild

        const [sentinelStart, sentinelEnd] = sentinels

        // Adds back sentinel to correct position in the DOM
        if (!firstChild?.classList.contains('sentinel')) {
          container.insertAdjacentElement('afterbegin', sentinelStart)
        }
        if (!lastChild?.classList.contains('sentinel')) {
          container.insertAdjacentElement('beforeend', sentinelEnd)
        }
      }
    }
  })

  observer.observe(container, {childList: true})

  return observer
}

/**
 * Traps focus within the given container
 * @param container The container in which to trap focus
 * @param initialFocus The element to focus when the trap is enabled
 * @param abortSignal An AbortSignal to control the focus trap
 */
export function focusTrap(
  container: HTMLElement,
  initialFocus?: HTMLElement,
  abortSignal?: AbortSignal,
): AbortController | undefined {
  // Set up an abort controller if a signal was not passed in
  const controller = new AbortController()
  const signal = abortSignal ?? controller.signal

  container.setAttribute('data-focus-trap', 'active')
  
  // Create sentinels outside DOM first to batch operations
  const sentinelStart = document.createElement('span')
  sentinelStart.className = 'sentinel'
  sentinelStart.tabIndex = 0
  sentinelStart.setAttribute('aria-hidden', 'true')
  // Use inline style to prevent layout shift - sentinels should be invisible
  sentinelStart.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0'
  sentinelStart.onfocus = () => {
    const lastFocusableChild = getFocusableChild(container, true)
    lastFocusableChild?.focus()
  }

  const sentinelEnd = document.createElement('span')
  sentinelEnd.className = 'sentinel'
  sentinelEnd.tabIndex = 0
  sentinelEnd.setAttribute('aria-hidden', 'true')
  // Use inline style to prevent layout shift - sentinels should be invisible
  sentinelEnd.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0'
  sentinelEnd.onfocus = () => {
    // If the end sentinel was focused, move focus to the start
    const firstFocusableChild = getFocusableChild(container)
    firstFocusableChild?.focus()
  }

  // If the container already has sentinels as direct children, don't add more.
  // The mutation observer will take care of moving existing sentinels to the correct position.
  // Use :scope > to only check direct children, avoiding deep DOM traversal
  const hasExistingSentinels = container.querySelector(':scope > span.sentinel') !== null

  if (!hasExistingSentinels) {
    container.prepend(sentinelStart)
    container.append(sentinelEnd)
  }

  const observer = observeFocusTrap(container, [sentinelStart, sentinelEnd])

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
          const firstFocusableChild = getFocusableChild(container)
          firstFocusableChild?.focus()
          return
        }
      }
    }
  }

  const wrappingController = followSignal(signal)

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
    const sentinels = container.getElementsByClassName('sentinel')
    while (sentinels.length > 0) sentinels[0].remove()
    const suspendedTrapIndex = suspendedTrapStack.findIndex(t => t.container === container)
    if (suspendedTrapIndex >= 0) {
      suspendedTrapStack.splice(suspendedTrapIndex, 1)
    }
    observer.disconnect()
    tryReactivate()
  })

  // Prevent focus leaving the trap container
  document.addEventListener(
    'focus',
    event => {
      ensureTrapZoneHasFocus(event.target)
    },
    // use capture to ensure we get all events.  focus events do not bubble
    {signal: wrappingController.signal, capture: true},
  )

  // focus the first element
  ensureTrapZoneHasFocus(document.activeElement)

  activeTrap = {
    container,
    controller: wrappingController,
    initialFocus,
    originalSignal: signal,
  }

  // If we are activating a focus trap for a container that was previously
  // suspended, just remove it from the suspended list
  const suspendedTrapIndex = suspendedTrapStack.findIndex(t => t.container === container)
  if (suspendedTrapIndex >= 0) {
    suspendedTrapStack.splice(suspendedTrapIndex, 1)
  }
  if (!abortSignal) {
    return controller
  }
}
