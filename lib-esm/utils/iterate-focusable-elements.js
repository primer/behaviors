/**
 * Options to the focusable elements iterator
 */

/**
 * Returns an iterator over all of the focusable elements within `container`.
 * Note: If `container` is itself focusable it will be included in the results.
 * @param container The container over which to find focusable elements.
 * @param reverse If true, iterate backwards through focusable elements.
 */
export function* iterateFocusableElements(container, options = {}) {
  var _options$strict, _options$onlyTabbable;

  const strict = (_options$strict = options.strict) !== null && _options$strict !== void 0 ? _options$strict : false;
  const acceptFn = ((_options$onlyTabbable = options.onlyTabbable) !== null && _options$onlyTabbable !== void 0 ? _options$onlyTabbable : false) ? isTabbable : isFocusable;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: node => node instanceof HTMLElement && acceptFn(node, strict) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
  });
  let nextNode = null; // Allow the container to participate

  if (!options.reverse && acceptFn(container, strict)) {
    yield container;
  } // If iterating in reverse, continue traversing down into the last child until we reach
  // a leaf DOM node


  if (options.reverse) {
    let lastChild = walker.lastChild();

    while (lastChild) {
      nextNode = lastChild;
      lastChild = walker.lastChild();
    }
  } else {
    nextNode = walker.firstChild();
  }

  while (nextNode instanceof HTMLElement) {
    yield nextNode;
    nextNode = options.reverse ? walker.previousNode() : walker.nextNode();
  } // Allow the container to participate (in reverse)


  if (options.reverse && acceptFn(container, strict)) {
    yield container;
  }

  return undefined;
}
/**
 * Determines whether the given element is focusable. If `strict` is true, we may
 * perform additional checks that require a reflow (less performant).
 * @param elem
 * @param strict
 */

export function isFocusable(elem, strict = false) {
  // Certain conditions cause an element to never be focusable, even if they have tabindex="0"
  const disabledAttrInert = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'OPTGROUP', 'OPTION', 'FIELDSET'].includes(elem.tagName) && elem.disabled;
  const hiddenInert = elem.hidden;
  const hiddenInputInert = elem instanceof HTMLInputElement && elem.type === 'hidden';

  if (disabledAttrInert || hiddenInert || hiddenInputInert) {
    return false;
  } // Each of the conditions checked below require a reflow, thus are gated by the `strict`
  // argument. If any are true, the element is not focusable, even if tabindex is set.


  if (strict) {
    const sizeInert = elem.offsetWidth === 0 || elem.offsetHeight === 0;
    const visibilityInert = ['hidden', 'collapse'].includes(getComputedStyle(elem).visibility);
    const clientRectsInert = elem.getClientRects().length === 0;

    if (sizeInert || visibilityInert || clientRectsInert) {
      return false;
    }
  } // Any element with `tabindex` explicitly set can be focusable, even if it's set to "-1"


  if (elem.getAttribute('tabindex') != null) {
    return true;
  } // One last way `elem.tabIndex` can be wrong.


  if (elem instanceof HTMLAnchorElement && elem.getAttribute('href') == null) {
    return false;
  }

  return elem.tabIndex !== -1;
}
/**
 * Determines whether the given element is tabbable. If `strict` is true, we may
 * perform additional checks that require a reflow (less performant). This check
 * ensures that the element is focusable and that its tabindex is not explicitly
 * set to "-1" (which makes it focusable, but removes it from the tab order).
 * @param elem
 * @param strict
 */

export function isTabbable(elem, strict = false) {
  return isFocusable(elem, strict) && elem.getAttribute('tabindex') !== '-1';
}