export interface ScrollIntoViewOptions {
    direction?: 'horizontal' | 'vertical';
    startMargin?: number;
    endMargin?: number;
    behavior?: ScrollBehavior;
}
export declare function scrollIntoView(child: HTMLElement, viewingArea: HTMLElement, { direction, startMargin, endMargin, behavior }?: ScrollIntoViewOptions): void;
