/**
 * Options to the focusable elements iterator
 */
export interface IterateFocusableElements {
    /**
     * (Default: false) Iterate through focusable elements in reverse-order
     */
    reverse?: boolean;
    /**
     * (Default: false) Perform additional checks to determine tabbability
     * which may adversely affect app performance.
     */
    strict?: boolean;
    /**
     * (Default: false) Only iterate tabbable elements, which is the subset
     * of focusable elements that are part of the page's tab sequence.
     */
    onlyTabbable?: boolean;
}
/**
 * Returns an iterator over all of the focusable elements within `container`.
 * Note: If `container` is itself focusable it will be included in the results.
 * @param container The container over which to find focusable elements.
 * @param reverse If true, iterate backwards through focusable elements.
 */
export declare function iterateFocusableElements(container: HTMLElement, options?: IterateFocusableElements): Generator<HTMLElement, undefined, undefined>;
/**
 * Determines whether the given element is focusable. If `strict` is true, we may
 * perform additional checks that require a reflow (less performant).
 * @param elem
 * @param strict
 */
export declare function isFocusable(elem: HTMLElement, strict?: boolean): boolean;
/**
 * Determines whether the given element is tabbable. If `strict` is true, we may
 * perform additional checks that require a reflow (less performant). This check
 * ensures that the element is focusable and that its tabindex is not explicitly
 * set to "-1" (which makes it focusable, but removes it from the tab order).
 * @param elem
 * @param strict
 */
export declare function isTabbable(elem: HTMLElement, strict?: boolean): boolean;
