export declare type Direction = 'previous' | 'next' | 'start' | 'end';
export declare type FocusMovementKeys = 'ArrowLeft' | 'ArrowDown' | 'ArrowUp' | 'ArrowRight' | 'h' | 'j' | 'k' | 'l' | 'a' | 's' | 'w' | 'd' | 'Tab' | 'Home' | 'End' | 'PageUp' | 'PageDown';
export declare enum FocusKeys {
    ArrowHorizontal = 1,
    ArrowVertical = 2,
    JK = 4,
    HL = 8,
    HomeAndEnd = 16,
    PageUpDown = 256,
    WS = 32,
    AD = 64,
    Tab = 128,
    ArrowAll = 3,
    HJKL = 12,
    WASD = 96,
    All = 511
}
/**
 * Options that control the behavior of the arrow focus behavior.
 */
export interface FocusZoneSettings {
    /**
     * Choose the behavior applied in cases where focus is currently at either the first or
     * last element of the container.
     *
     * "stop" - do nothing and keep focus where it was
     * "wrap" - wrap focus around to the first element from the last, or the last element from the first
     *
     * Default: "stop"
     */
    focusOutBehavior?: 'stop' | 'wrap';
    /**
     * If set, this will be called to get the next focusable element. If this function
     * returns null, we will try to determine the next direction ourselves. Use the
     * `bindKeys` option to customize which keys are listened to.
     *
     * The function can accept a Direction, indicating the direction focus should move,
     * the HTMLElement that was previously focused, and lastly the `KeyboardEvent` object
     * created by the original `"keydown"` event.
     */
    getNextFocusable?: (direction: Direction, from: Element | undefined, event: KeyboardEvent) => HTMLElement | undefined;
    /**
     * Called to decide if a focusable element is allowed to participate in the arrow
     * key focus behavior.
     *
     * By default, all focusable elements within the given container will participate
     * in the arrow key focus behavior. If you need to withhold some elements from
     * participation, implement this callback to return false for those elements.
     */
    focusableElementFilter?: (element: HTMLElement) => boolean;
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
    bindKeys?: FocusKeys;
    /**
     * If provided, this signal can be used to disable the behavior and remove any
     * event listeners.
     */
    abortSignal?: AbortSignal;
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
    activeDescendantControl?: HTMLElement;
    /**
     * Called each time the active descendant changes. Note that either of the parameters
     * may be undefined, e.g. when an element in the container first becomes active, or
     * when the controlling element becomes unfocused.
     */
    onActiveDescendantChanged?: (newActiveDescendant: HTMLElement | undefined, previousActiveDescendant: HTMLElement | undefined, directlyActivated: boolean) => void;
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
     * If a function is provided, this function should return the HTMLElement intended
     * to receive focus. This is useful if you want to focus the currently "selected"
     * item or element.
     *
     * Default: "previous"
     *
     * For more information, @see https://www.w3.org/TR/wai-aria-practices-1.1/#kbd_general_within
     */
    focusInStrategy?: 'first' | 'closest' | 'previous' | ((previousFocusedElement: Element) => HTMLElement | undefined);
}
export declare const isActiveDescendantAttribute = "data-is-active-descendant";
/**
 * A value of activated-directly for data-is-active-descendant indicates the descendant was activated
 * by a manual user interaction with intent to move active descendant.  This usually translates to the
 * user pressing one of the bound keys (up/down arrow, etc) to move through the focus zone.  This is
 * intended to be roughly equivalent to the :focus-visible pseudo-class
 **/
export declare const activeDescendantActivatedDirectly = "activated-directly";
/**
 * A value of activated-indirectly for data-is-active-descendant indicates the descendant was activated
 * implicitly, and not by a direct key press.  This includes focus zone being created from scratch, focusable
 * elements being added/removed, and mouseover events. This is intended to be roughly equivalent
 * to :focus:not(:focus-visible)
 **/
export declare const activeDescendantActivatedIndirectly = "activated-indirectly";
export declare const hasActiveDescendantAttribute = "data-has-active-descendant";
/**
 * Sets up the arrow key focus behavior for all focusable elements in the given `container`.
 * @param container
 * @param settings
 * @returns
 */
export declare function focusZone(container: HTMLElement, settings?: FocusZoneSettings): AbortController;
