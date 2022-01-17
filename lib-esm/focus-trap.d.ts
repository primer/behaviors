/**
 * Traps focus within the given container.
 * @param container The container in which to trap focus
 * @returns AbortController - call `.abort()` to disable the focus trap
 */
export declare function focusTrap(container: HTMLElement, initialFocus?: HTMLElement): AbortController;
/**
 * Traps focus within the given container.
 * @param container The container in which to trap focus
 * @param abortSignal An AbortSignal to control the focus trap.
 */
export declare function focusTrap(container: HTMLElement, initialFocus: HTMLElement | undefined, abortSignal: AbortSignal): void;
