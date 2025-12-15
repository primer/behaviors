import {polyfill as eventListenerSignalPolyfill} from './polyfills/event-listener-signal.js'
import {isMacOS} from './utils/user-agent.js'
import {IterateFocusableElements, iterateFocusableElements} from './utils/iterate-focusable-elements.js'
import {uniqueId} from './utils/unique-id.js'
import {isEditableElement} from './utils/is-editable-element.js'
import {IndexedSet} from './utils/indexed-set.js'

eventListenerSignalPolyfill()

export type Direction = 'previous' | 'next' | 'start' | 'end'

export type FocusMovementKeys =
  | 'ArrowLeft'
  | 'ArrowDown'
  | 'ArrowUp'
  | 'ArrowRight'
  | 'h'
  | 'j'
  | 'k'
  | 'l'
  | 'a'
  | 's'
  | 'w'
  | 'd'
  | 'Tab'
  | 'Home'
  | 'End'
  | 'PageUp'
  | 'PageDown'
  | 'Backspace'

export enum FocusKeys {
  // Left and right arrow keys (previous and next, respectively)
  ArrowHorizontal = 0b0000000001,

  // Up and down arrow keys (previous and next, respectively)
  ArrowVertical = 0b0000000010,

  // The "J" and "K" keys (next and previous, respectively)
  JK = 0b0000000100,

  // The "H" and "L" keys (previous and next, respectively)
  HL = 0b0000001000,

  // The Home and End keys (previous and next, respectively, to end)
  HomeAndEnd = 0b0000010000,

  // The PgUp and PgDn keys (previous and next, respectively, to end)
  PageUpDown = 0b0100000000,

  // The "W" and "S" keys (previous and next, respectively)
  WS = 0b0000100000,

  // The "A" and "D" keys (previous and next, respectively)
  AD = 0b0001000000,

  // The Tab key (next)
  Tab = 0b0010000000,

  // The Backspace key on Windows (not to be confused with the Delete key on macOS)
  Backspace = 0b1000000000,

  ArrowAll = FocusKeys.ArrowHorizontal | FocusKeys.ArrowVertical,
  HJKL = FocusKeys.HL | FocusKeys.JK,
  WASD = FocusKeys.WS | FocusKeys.AD,
  All = FocusKeys.ArrowAll |
    FocusKeys.HJKL |
    FocusKeys.HomeAndEnd |
    FocusKeys.PageUpDown |
    FocusKeys.WASD |
    FocusKeys.Tab,
}

const KEY_TO_BIT = {
  ArrowLeft: FocusKeys.ArrowHorizontal,
  ArrowDown: FocusKeys.ArrowVertical,
  ArrowUp: FocusKeys.ArrowVertical,
  ArrowRight: FocusKeys.ArrowHorizontal,
  h: FocusKeys.HL,
  j: FocusKeys.JK,
  k: FocusKeys.JK,
  l: FocusKeys.HL,
  a: FocusKeys.AD,
  s: FocusKeys.WS,
  w: FocusKeys.WS,
  d: FocusKeys.AD,
  Tab: FocusKeys.Tab,
  Home: FocusKeys.HomeAndEnd,
  End: FocusKeys.HomeAndEnd,
  PageUp: FocusKeys.PageUpDown,
  PageDown: FocusKeys.PageUpDown,
  Backspace: FocusKeys.Backspace,
} as {[k in FocusMovementKeys]: FocusKeys}

const KEY_TO_DIRECTION = {
  ArrowLeft: 'previous',
  ArrowDown: 'next',
  ArrowUp: 'previous',
  ArrowRight: 'next',
  h: 'previous',
  j: 'next',
  k: 'previous',
  l: 'next',
  a: 'previous',
  s: 'next',
  w: 'previous',
  d: 'next',
  Tab: 'next',
  Home: 'start',
  End: 'end',
  PageUp: 'start',
  PageDown: 'end',
  Backspace: 'previous',
} as {[k in FocusMovementKeys]: Direction}

/**
 * Options that control the behavior of the arrow focus behavior.
 */
export type FocusZoneSettings = IterateFocusableElements & {
  /**
   * Choose the behavior applied in cases where focus is currently at either the first or
   * last element of the container.
   *
   * "stop" - do nothing and keep focus where it was
   * "wrap" - wrap focus around to the first element from the last, or the last element from the first
   *
   * Default: "stop"
   */
  focusOutBehavior?: 'stop' | 'wrap'

  /**
   * If set, this will be called to get the next focusable element. If this function
   * returns null, we will try to determine the next direction ourselves. Use the
   * `bindKeys` option to customize which keys are listened to.
   *
   * The function can accept a Direction, indicating the direction focus should move,
   * the HTMLElement that was previously focused, and lastly the `KeyboardEvent` object
   * created by the original `"keydown"` event.
   */
  getNextFocusable?: (direction: Direction, from: Element | undefined, event: KeyboardEvent) => HTMLElement | undefined

  /**
   * Called to decide if a focusable element is allowed to participate in the arrow
   * key focus behavior.
   *
   * By default, all focusable elements within the given container will participate
   * in the arrow key focus behavior. If you need to withhold some elements from
   * participation, implement this callback to return false for those elements.
   */
  focusableElementFilter?: (element: HTMLElement) => boolean

  /**
   * Bit flags that identify keys that will be bound to. Each available key either
   * moves focus to the "next" element or the "previous" element, so it is best
   * to only bind the keys that make sense to move focus in your UI. Use the `FocusKeys`
   * object to discover supported keys.
   *
   * Use the bitwise "OR" operator (`|`) to combine key types. For example,
   * `FocusKeys.WASD | FocusKeys.HJKL` represents all of W, A, S, D, H, J, K, and L.
   *
   * A note on FocusKeys.PageUpDown: This behavior does not support paging, so by default
   * using these keys will result in the same behavior as Home and End. To override this
   * behavior, implement `getNextFocusable`.
   *
   * The default for this setting is `FocusKeys.ArrowVertical | FocusKeys.HomeAndEnd`, unless
   * `getNextFocusable` is provided, in which case `FocusKeys.ArrowAll | FocusKeys.HomeAndEnd`
   * is used as the default.
   */
  bindKeys?: FocusKeys

  /**
   * If provided, this signal can be used to disable the behavior and remove any
   * event listeners.
   */
  abortSignal?: AbortSignal

  /**
   * If `activeDescendantControl` is supplied, do not move focus or alter `tabindex` on
   * any element. Instead, manage `aria-activedescendant` according to the ARIA best
   * practices guidelines.
   * @see https://www.w3.org/TR/wai-aria-practices-1.1/#kbd_focus_activedescendant
   *
   * The given `activeDescendantControl` will be given an `aria-controls` attribute that
   * references the ID of the `container`. Additionally, it will be given an
   * `aria-activedescendant` attribute that references the ID of the currently-active
   * descendant.
   *
   * This element will retain DOM focus as arrow keys are pressed.
   */
  activeDescendantControl?: HTMLElement

  /**
   * Called each time the active descendant changes. Note that either of the parameters
   * may be undefined, e.g. when an element in the container first becomes active, or
   * when the controlling element becomes unfocused.
   */
  onActiveDescendantChanged?: (
    newActiveDescendant: HTMLElement | undefined,
    previousActiveDescendant: HTMLElement | undefined,
    directlyActivated: boolean,
  ) => void

  /**
   * This option allows customization of the behavior that determines which of the
   * focusable elements should be focused when focus enters the container via the Tab key.
   *
   * When set to "first", whenever focus enters the container via Tab, we will focus the
   * first focusable element. When set to "previous", the most recently focused element
   * will be focused (fallback to first if there was no previous).
   *
   * The "closest" strategy works like "first", except either the first or the last element
   * of the container will be focused, depending on the direction from which focus comes.
   *
   * If set to "initial", focus will be kept on the initializing element when the focus zone is
   * activated. This is useful when using an active descendant focus model, where aria-activedescendant
   * should not be set until the user starts navigating within the focus zone. This will only work when
   * "activeDescendantControl" is also set.
   *
   * If a function is provided, this function should return the HTMLElement intended
   * to receive focus. This is useful if you want to focus the currently "selected"
   * item or element.
   *
   * Default: "previous"
   *
   * For more information, @see https://www.w3.org/TR/wai-aria-practices-1.1/#kbd_general_within
   */
  focusInStrategy?:
    | 'first'
    | 'closest'
    | 'previous'
    | 'initial'
    | ((previousFocusedElement: Element) => HTMLElement | undefined)

  /**
   * A boolean value indicating whether or not the browser should scroll the
   * document to bring the newly-focused element into view. A value of `false`
   * for `preventScroll` (the default) means that the browser will scroll the
   * element into view after focusing it. If `preventScroll` is set to `true`,
   * no scrolling will occur.
   */
  preventScroll?: boolean
  /**
   * Controls whether a focusable element is selected when hovered with the mouse.
   * When `false` (default), moving the mouse over a focusable element will make it the current active descendant.
   * When `true`, moving the mouse will have no effect on the current active descendant value.
   */
  ignoreHoverEvents?: boolean
}

// PERFORMANCE: Cache the result to avoid repeated userAgent regex parsing on every keydown.
// This is called frequently in keyboard event handlers.
let cachedIsMac: boolean | undefined
function getIsMac(): boolean {
  if (cachedIsMac === undefined) {
    cachedIsMac = isMacOS()
  }
  return cachedIsMac
}

function getDirection(keyboardEvent: KeyboardEvent) {
  const direction = KEY_TO_DIRECTION[keyboardEvent.key as keyof typeof KEY_TO_DIRECTION]
  if (keyboardEvent.key === 'Tab' && keyboardEvent.shiftKey) {
    return 'previous'
  }
  const isMac = getIsMac()
  if ((isMac && keyboardEvent.metaKey) || (!isMac && keyboardEvent.ctrlKey)) {
    if (keyboardEvent.key === 'ArrowLeft' || keyboardEvent.key === 'ArrowUp') {
      return 'start'
    } else if (keyboardEvent.key === 'ArrowRight' || keyboardEvent.key === 'ArrowDown') {
      return 'end'
    }
  }
  return direction
}

/**
 * There are some situations where we do not want various keys to affect focus. This function
 * checks for those situations.
 * 1. Home and End should not move focus when a text input or textarea is active
 * 2. Keys that would normally type characters into an input or navigate a select element should be ignored
 * 3. The down arrow sometimes should not move focus when a select is active since that sometimes invokes the dropdown
 * 4. Page Up and Page Down within a textarea should not have any effect
 * 5. When in a text input or textarea, left should only move focus if the cursor is at the beginning of the input
 * 6. When in a text input or textarea, right should only move focus if the cursor is at the end of the input
 * 7. When in a textarea, up and down should only move focus if cursor is at the beginning or end, respectively.
 * @param keyboardEvent
 * @param activeElement
 */
function shouldIgnoreFocusHandling(keyboardEvent: KeyboardEvent, activeElement: Element | null) {
  const key = keyboardEvent.key

  // PERFORMANCE: Check if key is a single printable character without allocating an array.
  // Using key.length instead of [...key].length avoids creating an intermediate array on every keydown.
  // Keys like 'ArrowUp' have length > 1. Surrogate pairs (emoji) have length 2 in UTF-16.
  const isSingleChar =
    key.length === 1 || (key.length === 2 && key.charCodeAt(0) >= 0xd800 && key.charCodeAt(0) <= 0xdbff)

  const isEditable = isEditableElement(activeElement)
  const isSelect = activeElement instanceof HTMLSelectElement

  // If we would normally type a character into an input, ignore
  // Also, Home and End keys should never affect focus when in a text input
  if (isEditable && (isSingleChar || key === 'Home' || key === 'End')) {
    return true
  }

  // Some situations we specifically want to ignore with <select> elements
  if (isSelect) {
    const isMac = getIsMac()
    // On macOS, bare ArrowDown opens the select, so ignore that
    if (key === 'ArrowDown' && isMac && !keyboardEvent.metaKey) {
      return true
    }
    // On other platforms, Alt+ArrowDown opens the select, so ignore that
    if (key === 'ArrowDown' && !isMac && keyboardEvent.altKey) {
      return true
    }
    return false
  }

  if (isEditable && !isSelect) {
    // An editable element might not be an input element if it is a `contenteditable` element, but it's significantly
    // harder and less reliable to get the caret position for those elements, so for them we just always ignore arrows
    const isInputElement = activeElement instanceof HTMLTextAreaElement || activeElement instanceof HTMLInputElement
    const cursorAtStart = isInputElement && activeElement.selectionStart === 0 && activeElement.selectionEnd === 0
    const cursorAtEnd =
      isInputElement &&
      activeElement.selectionStart === activeElement.value.length &&
      activeElement.selectionEnd === activeElement.value.length

    // When in a text area or text input, only move focus left/right if at beginning/end of the field
    if (key === 'ArrowLeft' && !cursorAtStart) {
      return true
    }
    if (key === 'ArrowRight' && !cursorAtEnd) {
      return true
    }

    const isContentEditable = activeElement instanceof HTMLElement && activeElement.isContentEditable

    // When in multiline inputs
    if (activeElement instanceof HTMLTextAreaElement || isContentEditable) {
      // Always ignore page up/down
      if (key === 'PageUp' || key === 'PageDown') {
        return true
      }
      // Only move focus up/down if at beginning/end of the field
      if (key === 'ArrowUp' && !cursorAtStart) {
        return true
      }
      if (key === 'ArrowDown' && !cursorAtEnd) {
        return true
      }
    }
  }

  return false
}

export const isActiveDescendantAttribute = 'data-is-active-descendant'
/**
 * A value of activated-directly for data-is-active-descendant indicates the descendant was activated
 * by a manual user interaction with intent to move active descendant.  This usually translates to the
 * user pressing one of the bound keys (up/down arrow, etc) to move through the focus zone.  This is
 * intended to be roughly equivalent to the :focus-visible pseudo-class
 **/
export const activeDescendantActivatedDirectly = 'activated-directly'
/**
 * A value of activated-indirectly for data-is-active-descendant indicates the descendant was activated
 * implicitly, and not by a direct key press.  This includes focus zone being created from scratch, focusable
 * elements being added/removed, and mouseover events. This is intended to be roughly equivalent
 * to :focus:not(:focus-visible)
 **/
export const activeDescendantActivatedIndirectly = 'activated-indirectly'
export const hasActiveDescendantAttribute = 'data-has-active-descendant'

/**
 * Sets up the arrow key focus behavior for all focusable elements in the given `container`.
 * @param container
 * @param settings
 * @returns
 */
export function focusZone(container: HTMLElement, settings?: FocusZoneSettings): AbortController {
  // PERFORMANCE: IndexedSet provides O(1) membership checks via Set while maintaining array ordering.
  // This is critical for mousemove handlers which fire frequently and need fast has() checks.
  const focusableElements = new IndexedSet<HTMLElement>()
  const savedTabIndex = new WeakMap<HTMLElement, string | null>()
  const bindKeys =
    settings?.bindKeys ??
    (settings?.getNextFocusable ? FocusKeys.ArrowAll : FocusKeys.ArrowVertical) | FocusKeys.HomeAndEnd
  const focusOutBehavior = settings?.focusOutBehavior ?? 'stop'
  const focusInStrategy = settings?.focusInStrategy ?? 'previous'
  const activeDescendantControl = settings?.activeDescendantControl
  const activeDescendantCallback = settings?.onActiveDescendantChanged
  const ignoreHoverEvents = settings?.ignoreHoverEvents ?? false
  let currentFocusedElement: HTMLElement | undefined
  const preventScroll = settings?.preventScroll ?? false
  const preventInitialFocus = focusInStrategy === 'initial' && settings?.activeDescendantControl

  function getFirstFocusableElement() {
    return focusableElements.get(0)
  }

  function isActiveDescendantInputFocused() {
    return document.activeElement === activeDescendantControl
  }

  function updateFocusedElement(to?: HTMLElement, directlyActivated = false) {
    const from = currentFocusedElement
    currentFocusedElement = to

    if (activeDescendantControl) {
      if (to && isActiveDescendantInputFocused()) {
        setActiveDescendant(from, to, directlyActivated)
      } else {
        clearActiveDescendant()
      }

      return
    }

    if (from && from !== to && savedTabIndex.has(from)) {
      from.setAttribute('tabindex', '-1')
    }

    to?.setAttribute('tabindex', '0')
  }

  function setActiveDescendant(from: HTMLElement | undefined, to: HTMLElement, directlyActivated = false) {
    if (!to.id) {
      to.setAttribute('id', uniqueId())
    }

    if (from && from !== to) {
      from.removeAttribute(isActiveDescendantAttribute)
    }

    if (
      !activeDescendantControl ||
      (!directlyActivated && activeDescendantControl.getAttribute('aria-activedescendant') === to.id)
    ) {
      // prevent active descendant callback from being called repeatedly if the same element is activated (e.g. via mousemove)
      return
    }

    activeDescendantControl.setAttribute('aria-activedescendant', to.id)
    container.setAttribute(hasActiveDescendantAttribute, to.id)
    to.setAttribute(
      isActiveDescendantAttribute,
      directlyActivated ? activeDescendantActivatedDirectly : activeDescendantActivatedIndirectly,
    )
    activeDescendantCallback?.(to, from, directlyActivated)
  }

  function clearActiveDescendant(previouslyActiveElement = currentFocusedElement) {
    if (focusInStrategy === 'first') {
      currentFocusedElement = undefined
    }

    activeDescendantControl?.removeAttribute('aria-activedescendant')
    container.removeAttribute(hasActiveDescendantAttribute)
    previouslyActiveElement?.removeAttribute(isActiveDescendantAttribute)

    // Clear any other elements that may have the attribute (edge case: multiple elements marked)
    const items = container.querySelectorAll(`[${isActiveDescendantAttribute}]`)
    // Use for loop instead of for...of to avoid iterator overhead
    for (let i = 0; i < items.length; i++) {
      items[i].removeAttribute(isActiveDescendantAttribute)
    }

    activeDescendantCallback?.(undefined, previouslyActiveElement, false)
  }

  function beginFocusManagement(...elements: HTMLElement[]) {
    // PERFORMANCE: Skip filter allocation when no filter function is provided (common case)
    const filteredElements = settings?.focusableElementFilter
      ? elements.filter(e => settings.focusableElementFilter!(e))
      : elements
    if (filteredElements.length === 0) {
      return
    }
    // Insert all elements atomically.
    focusableElements.insertAt(findInsertionIndex(filteredElements), ...filteredElements)
    for (const element of filteredElements) {
      // Set tabindex="-1" on all tabbable elements, but save the original
      // value in case we need to disable the behavior
      if (!savedTabIndex.has(element)) {
        savedTabIndex.set(element, element.getAttribute('tabindex'))
      }
      element.setAttribute('tabindex', '-1')
    }

    if (!currentFocusedElement && !preventInitialFocus) {
      updateFocusedElement(getFirstFocusableElement())
    }
  }

  function findInsertionIndex(elementsToInsert: HTMLElement[]) {
    // Assume that all passed elements are well-ordered.
    const firstElementToInsert = elementsToInsert[0]

    if (focusableElements.size === 0) return 0

    // Because the focusable elements are in document order,
    // we can do a binary search to find the insertion index.
    let iMin = 0
    let iMax = focusableElements.size - 1
    while (iMin <= iMax) {
      const i = Math.floor((iMin + iMax) / 2)
      const element = focusableElements.get(i)!

      if (followsInDocument(firstElementToInsert, element)) {
        iMax = i - 1
      } else {
        iMin = i + 1
      }
    }

    return iMin
  }

  /**
   * @returns true if the second argument follows the first argument in the document
   */
  function followsInDocument(first: HTMLElement, second: HTMLElement) {
    return (second.compareDocumentPosition(first) & Node.DOCUMENT_POSITION_PRECEDING) > 0
  }

  function endFocusManagement(...elements: HTMLElement[]) {
    for (const element of elements) {
      focusableElements.delete(element)
      const savedIndex = savedTabIndex.get(element)
      if (savedIndex !== undefined) {
        if (savedIndex === null) {
          element.removeAttribute('tabindex')
        } else {
          element.setAttribute('tabindex', savedIndex)
        }
        savedTabIndex.delete(element)
      }

      // If removing the last-focused element, move focus to the first element in the list.
      if (element === currentFocusedElement) {
        const nextElementToFocus = getFirstFocusableElement()
        updateFocusedElement(nextElementToFocus)
      }
    }
  }

  const iterateFocusableElementsOptions: IterateFocusableElements = {
    reverse: settings?.reverse,
    strict: settings?.strict,
    onlyTabbable: settings?.onlyTabbable,
  }
  // Take all tabbable elements within container under management
  beginFocusManagement(...iterateFocusableElements(container, iterateFocusableElementsOptions))

  // Open the first tabbable element for tabbing
  const initialElement =
    typeof focusInStrategy === 'function' ? focusInStrategy(document.body) : getFirstFocusableElement()
  if (!preventInitialFocus) updateFocusedElement(initialElement)

  // PERFORMANCE: MutationObserver callback is batched by the browser, but we further optimize by:
  // 1. Using Sets to deduplicate elements that appear in multiple mutations
  // 2. Separating read phase (collecting elements) from write phase (DOM modifications)
  // 3. Processing all removals before additions to handle element reordering efficiently
  // This prevents layout thrashing when many mutations occur in a single frame.
  const observer = new MutationObserver(mutations => {
    // Use Sets to automatically deduplicate elements that appear in multiple mutations
    const elementsToRemove = new Set<HTMLElement>()
    const elementsToAdd = new Set<HTMLElement>()
    const attributeRemovals = new Set<HTMLElement>()
    const attributeAdditions = new Set<HTMLElement>()

    // First pass: collect all elements (read phase)
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const removedNode of mutation.removedNodes) {
          if (removedNode instanceof HTMLElement) {
            elementsToRemove.add(removedNode)
          }
        }
        for (const addedNode of mutation.addedNodes) {
          if (addedNode instanceof HTMLElement) {
            elementsToAdd.add(addedNode)
          }
        }
      } else if (mutation.type === 'attributes' && mutation.target instanceof HTMLElement) {
        const attributeName = mutation.attributeName
        // hasAttribute is O(1) and doesn't cause reflow - safe to call in loop
        const hasAttribute = attributeName ? mutation.target.hasAttribute(attributeName) : false

        if (hasAttribute) {
          // Attribute is now present (hidden/disabled) - element should be removed from focusables
          attributeRemovals.add(mutation.target)
        } else {
          // Attribute was removed (unhidden/enabled) - element should be added to focusables
          attributeAdditions.add(mutation.target)
        }
      }
    }

    // Second pass: perform all removals (write phase)
    // PERFORMANCE: Avoid intermediate arrays by pushing directly to result array
    if (elementsToRemove.size > 0) {
      const toRemove: HTMLElement[] = []
      for (const node of elementsToRemove) {
        for (const el of iterateFocusableElements(node)) {
          toRemove.push(el)
        }
      }
      if (toRemove.length > 0) {
        endFocusManagement(...toRemove)
      }
    }
    // PERFORMANCE: For small Sets (typically 1-2 attribute mutations), spread is fine
    if (attributeRemovals.size > 0) {
      endFocusManagement(...attributeRemovals)
    }

    // Second pass (continued): perform all additions
    if (elementsToAdd.size > 0) {
      const toAdd: HTMLElement[] = []
      for (const node of elementsToAdd) {
        for (const el of iterateFocusableElements(node, iterateFocusableElementsOptions)) {
          toAdd.push(el)
        }
      }
      if (toAdd.length > 0) {
        beginFocusManagement(...toAdd)
      }
    }
    // PERFORMANCE: For small Sets (typically 1-2 attribute mutations), spread is fine
    if (attributeAdditions.size > 0) {
      beginFocusManagement(...attributeAdditions)
    }
  })

  observer.observe(container, {
    subtree: true,
    childList: true,
    attributeFilter: ['hidden', 'disabled'],
    attributeOldValue: true,
  })

  const controller = new AbortController()
  const signal = settings?.abortSignal ?? controller.signal

  signal.addEventListener('abort', () => {
    // Clean up: disconnect observer to prevent memory leak
    observer.disconnect()
    // Clean up any modifications
    endFocusManagement(...focusableElements)
    focusableElements.clear()
  })

  let elementIndexFocusedByClick: number | undefined = undefined
  container.addEventListener(
    'mousedown',
    event => {
      // Since focusin is only called when focus changes, we need to make sure the clicked
      // element isn't already focused.
      if (event.target instanceof HTMLElement && event.target !== document.activeElement) {
        elementIndexFocusedByClick = focusableElements.indexOf(event.target)
      }
    },
    {signal},
  )

  if (activeDescendantControl) {
    container.addEventListener(
      'focusin',
      event => {
        // PERFORMANCE: Use .has() for O(1) membership check instead of indexOf
        if (event.target instanceof HTMLElement && focusableElements.has(event.target)) {
          // Move focus to the activeDescendantControl if one of the descendants is focused
          activeDescendantControl.focus({preventScroll})
          updateFocusedElement(event.target)
        }
      },
      {signal},
    )
    if (!ignoreHoverEvents) {
      container.addEventListener(
        // PERFORMANCE: This handler fires on every mouse movement, so optimizations here directly impact INP.
        // We check indexOf first (fast equality check) before falling back to .find() with .contains() (DOM traversal).
        'mousemove',
        ({target}) => {
          if (!(target instanceof Node)) {
            return
          }

          // PERFORMANCE: Use .has() for O(1) membership check - critical for mousemove which fires frequently
          if (target instanceof HTMLElement && focusableElements.has(target)) {
            updateFocusedElement(target)
            return
          }

          // Fall back to checking if target is contained by a focusable element.
          // This requires DOM traversal via .contains() which is more expensive.
          const focusableElement = focusableElements.find(element => element.contains(target))

          if (focusableElement) {
            updateFocusedElement(focusableElement)
          }
        },
        {signal, capture: true},
      )
    }

    // Listeners specifically on the controlling element
    activeDescendantControl.addEventListener(
      'focusin',
      () => {
        // Focus moved into the active descendant input.  Activate current or first descendant.
        if (!currentFocusedElement) {
          if (!preventInitialFocus) updateFocusedElement(getFirstFocusableElement())
        } else {
          setActiveDescendant(undefined, currentFocusedElement)
        }
      },
      {signal},
    )
    activeDescendantControl.addEventListener(
      'focusout',
      () => {
        clearActiveDescendant()
      },
      {signal},
    )
  } else {
    // This is called whenever focus enters an element in the container
    container.addEventListener(
      'focusin',
      event => {
        if (event.target instanceof HTMLElement) {
          // If a click initiated the focus movement, we always want to set our internal state
          // to reflect the clicked element as the currently focused one.
          if (elementIndexFocusedByClick !== undefined) {
            if (elementIndexFocusedByClick >= 0) {
              const clickedElement = focusableElements.get(elementIndexFocusedByClick)
              if (clickedElement && clickedElement !== currentFocusedElement) {
                updateFocusedElement(clickedElement)
              }
            }
            elementIndexFocusedByClick = undefined
          } else {
            // Set tab indexes and internal state based on the focus handling strategy
            if (focusInStrategy === 'previous') {
              updateFocusedElement(event.target)
            } else if (focusInStrategy === 'closest' || focusInStrategy === 'first') {
              if (event.relatedTarget instanceof Element && !container.contains(event.relatedTarget)) {
                // Regardless of the previously focused element, if we're coming from outside the
                // container, put focus onto the first encountered element (from above, it's The
                // first element of the container; from below, it's the last). If the
                // focusInStrategy is set to "first", lastKeyboardFocusDirection will always
                // be undefined.
                const targetElementIndex = lastKeyboardFocusDirection === 'previous' ? focusableElements.size - 1 : 0
                const targetElement = focusableElements.get(targetElementIndex)
                targetElement?.focus({preventScroll})
                return
              } else {
                updateFocusedElement(event.target)
              }
            } else if (typeof focusInStrategy === 'function') {
              if (event.relatedTarget instanceof Element && !container.contains(event.relatedTarget)) {
                const elementToFocus = focusInStrategy(event.relatedTarget)
                // PERFORMANCE: Use .has() for O(1) membership check
                if (elementToFocus && focusableElements.has(elementToFocus)) {
                  // Since we are calling focus() this handler will run again synchronously. Therefore,
                  // we don't want to let this invocation finish since it will clobber the value of
                  // currentFocusedElement.
                  elementToFocus.focus({preventScroll})
                  return
                } else {
                  // eslint-disable-next-line no-console
                  console.warn('Element requested is not a known focusable element.')
                }
              } else {
                updateFocusedElement(event.target)
              }
            }
          }
        }
        lastKeyboardFocusDirection = undefined
      },
      {signal},
    )
  }

  const keyboardEventRecipient = activeDescendantControl ?? container

  // If the strategy is "closest", we need to capture the direction that the user
  // is trying to move focus before our focusin handler is executed.
  let lastKeyboardFocusDirection: Direction | undefined = undefined
  if (focusInStrategy === 'closest') {
    document.addEventListener(
      'keydown',
      event => {
        if (event.key === 'Tab') {
          lastKeyboardFocusDirection = getDirection(event)
        }
      },
      {signal, capture: true},
    )
  }

  function getCurrentFocusedIndex() {
    if (!currentFocusedElement) {
      return preventInitialFocus ? -1 : 0
    }

    const focusedIndex = focusableElements.indexOf(currentFocusedElement)
    const fallbackIndex = currentFocusedElement === container ? -1 : 0

    return focusedIndex !== -1 ? focusedIndex : fallbackIndex
  }

  // "keydown" is the event that triggers DOM focus change, so that is what we use here
  keyboardEventRecipient.addEventListener(
    'keydown',
    event => {
      if (event.key in KEY_TO_DIRECTION) {
        const keyBit = KEY_TO_BIT[event.key as keyof typeof KEY_TO_BIT]
        // Check if the pressed key (keyBit) is one that is being used for focus (bindKeys)
        if (
          !event.defaultPrevented &&
          (keyBit & bindKeys) > 0 &&
          !shouldIgnoreFocusHandling(event, document.activeElement)
        ) {
          // Moving forward or backward?
          const direction = getDirection(event)

          let nextElementToFocus: HTMLElement | undefined = undefined

          // If there is a custom function that retrieves the next focusable element, try calling that first.
          if (settings?.getNextFocusable) {
            nextElementToFocus = settings.getNextFocusable(direction, document.activeElement ?? undefined, event)
          }
          if (!nextElementToFocus) {
            const lastFocusedIndex = getCurrentFocusedIndex()
            let nextFocusedIndex = lastFocusedIndex
            if (direction === 'previous') {
              nextFocusedIndex -= 1
            } else if (direction === 'start') {
              nextFocusedIndex = 0
            } else if (direction === 'next') {
              nextFocusedIndex += 1
            } else {
              // end
              nextFocusedIndex = focusableElements.size - 1
            }

            if (nextFocusedIndex < 0) {
              // Tab should never cause focus to wrap. Use focusTrap for that behavior.
              if (focusOutBehavior === 'wrap' && event.key !== 'Tab') {
                nextFocusedIndex = focusableElements.size - 1
              } else {
                nextFocusedIndex = 0
              }
            }
            if (nextFocusedIndex >= focusableElements.size) {
              if (focusOutBehavior === 'wrap' && event.key !== 'Tab') {
                nextFocusedIndex = 0
              } else {
                nextFocusedIndex = focusableElements.size - 1
              }
            }
            if (lastFocusedIndex !== nextFocusedIndex) {
              nextElementToFocus = focusableElements.get(nextFocusedIndex)
            }
          }

          if (activeDescendantControl) {
            updateFocusedElement(nextElementToFocus || currentFocusedElement, true)
          } else if (nextElementToFocus) {
            lastKeyboardFocusDirection = direction

            // updateFocusedElement will be called implicitly when focus moves, as long as the event isn't prevented somehow
            nextElementToFocus.focus({preventScroll})
          }
          // Tab should always allow escaping from this container, so only
          // preventDefault if tab key press already resulted in a focus movement
          if (event.key !== 'Tab' || nextElementToFocus) {
            event.preventDefault()
          }
        }
      }
    },
    {signal},
  )
  return controller
}
