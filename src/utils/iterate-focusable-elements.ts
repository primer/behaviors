/**
 * Options to the focusable elements iterator
 */
export interface IterateFocusableElements {
  /**
   * (Default: false) Iterate through focusable elements in reverse-order
   */
  reverse?: boolean

  /**
   * (Default: false) Perform additional checks to determine tabbability
   * which may adversely affect app performance.
   */
  strict?: boolean

  /**
   * (Default: false) Only iterate tabbable elements, which is the subset
   * of focusable elements that are part of the page's tab sequence.
   */
  onlyTabbable?: boolean
}

/**
 * Returns an iterator over all of the focusable elements within `container`.
 * Note: If `container` is itself focusable it will be included in the results.
 * @param container The container over which to find focusable elements.
 * @param reverse If true, iterate backwards through focusable elements.
 */
export function* iterateFocusableElements(
  container: HTMLElement,
  options: IterateFocusableElements = {},
): Generator<HTMLElement, undefined, undefined> {
  const strict = options.strict ?? false
  const acceptFn = (options.onlyTabbable ?? false) ? isTabbable : isFocusable
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: node =>
      node instanceof HTMLElement && acceptFn(node, strict) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP,
  })
  let nextNode: Node | null = null

  // Allow the container to participate
  if (!options.reverse && acceptFn(container, strict)) {
    yield container
  }

  // If iterating in reverse, continue traversing down into the last child until we reach
  // a leaf DOM node
  if (options.reverse) {
    let lastChild = walker.lastChild()
    while (lastChild) {
      nextNode = lastChild
      lastChild = walker.lastChild()
    }
  } else {
    nextNode = walker.firstChild()
  }
  while (nextNode instanceof HTMLElement) {
    yield nextNode
    nextNode = options.reverse ? walker.previousNode() : walker.nextNode()
  }

  // Allow the container to participate (in reverse)
  if (options.reverse && acceptFn(container, strict)) {
    yield container
  }

  return undefined
}

/**
 * Returns the first focusable child of `container`. If `lastChild` is true,
 * returns the last focusable child of `container`.
 * @param container
 * @param lastChild
 */
export function getFocusableChild(container: HTMLElement, lastChild = false) {
  return iterateFocusableElements(container, {reverse: lastChild, strict: true, onlyTabbable: true}).next().value
}

// Set of tags that can have the disabled attribute
const DISABLEABLE_TAGS = new Set(['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'OPTGROUP', 'OPTION', 'FIELDSET'])

/**
 * Determines whether the given element is focusable. If `strict` is true, we may
 * perform additional checks that require a reflow (less performant).
 * @param elem
 * @param strict
 */
export function isFocusable(elem: HTMLElement, strict = false): boolean {
  // Fast path: Check simple properties first (no reflow)
  // Certain conditions cause an element to never be focusable, even if they have tabindex="0"
  if (elem.hidden) return false
  if (elem.classList.contains('sentinel')) return false
  if (elem instanceof HTMLInputElement && elem.type === 'hidden') return false
  if (DISABLEABLE_TAGS.has(elem.tagName) && (elem as HTMLElement & {disabled: boolean}).disabled) return false

  // Each of the conditions checked below require a reflow, thus are gated by the `strict`
  // argument. If any are true, the element is not focusable, even if tabindex is set.
  if (strict) {
    // Batch all reflow-causing reads together to minimize layout thrashing
    // Read all layout properties in one batch before any conditional logic
    const offsetWidth = elem.offsetWidth
    const offsetHeight = elem.offsetHeight
    const offsetParent = elem.offsetParent

    // Fast fail on zero dimensions before calling expensive getComputedStyle
    if (offsetWidth === 0 || offsetHeight === 0) return false

    // getComputedStyle is expensive - only call if we passed the cheaper checks
    const style = getComputedStyle(elem)
    if (style.display === 'none') return false
    if (style.visibility === 'hidden' || style.visibility === 'collapse') return false

    // offsetParent is null for fixed/sticky positioned elements, so only use this check
    // for elements that are not fixed or sticky positioned
    const position = style.position
    if (!offsetParent && position !== 'fixed' && position !== 'sticky') return false

    // getClientRects is expensive - check last
    if (elem.getClientRects().length === 0) return false
  }

  // Any element with `tabindex` explicitly set can be focusable, even if it's set to "-1"
  if (elem.getAttribute('tabindex') != null) {
    return true
  }

  if (elem.getAttribute('contenteditable') === 'true' || elem.getAttribute('contenteditable') === 'plaintext-only') {
    return true
  }

  // One last way `elem.tabIndex` can be wrong.
  if (elem instanceof HTMLAnchorElement && elem.getAttribute('href') == null) {
    return false
  }

  return elem.tabIndex !== -1
}

/**
 * Determines whether the given element is tabbable. If `strict` is true, we may
 * perform additional checks that require a reflow (less performant). This check
 * ensures that the element is focusable and that its tabindex is not explicitly
 * set to "-1" (which makes it focusable, but removes it from the tab order).
 * @param elem
 * @param strict
 */
export function isTabbable(elem: HTMLElement, strict = false): boolean {
  return isFocusable(elem, strict) && elem.getAttribute('tabindex') !== '-1'
}
