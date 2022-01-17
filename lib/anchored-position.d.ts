export declare type AnchorAlignment = 'start' | 'center' | 'end';
export declare type AnchorSide = 'inside-top' | 'inside-bottom' | 'inside-left' | 'inside-right' | 'inside-center' | 'outside-top' | 'outside-bottom' | 'outside-left' | 'outside-right';
/**
 * Settings that customize how a floating element is positioned
 * with respect to an anchor element.
 */
export interface PositionSettings {
    /**
     * Sets the side of the anchor element that the floating element should be
     * pinned to. This side is given by a string starting with either "inside" or
     * "outside", followed by a hyphen, followed by either "top", "right", "bottom",
     * or "left". Additionally, "inside-center" is an allowed value.
     *
     * The first part of this string, "inside" or "outside", determines whether the
     * floating element should be attempted to be placed "inside" the anchor element
     * or "outside" of it. Using "inside" is useful for making it appear that the
     * anchor _contains_ the floating element, and it can be used for implementing a
     * dialog that is centered on the screen. The "outside" value is more common and
     * can be used for tooltips, popovers, menus, etc.
     *
     * The second part of this string determines the _edge_ on the anchor element that
     * the floating element will be anchored to. If side is "inside-center", then
     * the floating element will be centered in the X-direction (while align is used
     * to position it in the Y-direction).
     * Note: "outside-center" is _not_ a valid value for this property.
     */
    side: AnchorSide;
    /**
     * Determines how the floating element should align with the anchor element. If
     * set to "start", the floating element's first edge (top or left) will align
     * with the anchor element's first edge. If set to "center", the floating
     * element will be centered along the axis of the anchor edge. If set to "end",
     * the floating element's last edge will align with the anchor element's last edge.
     */
    align: AnchorAlignment;
    /**
     * The number of pixels between the anchor edge and the floating element.
     *
     * Positive values move the floating element farther from the anchor element
     * (for outside positioning) or further inside the anchor element (for inside
     * positioning). Negative values have the opposite effect.
     */
    anchorOffset: number;
    /**
     * An additional offset, in pixels, to move the floating element from
     * the aligning edge.
     *
     * Positive values move the floating element in the direction of center-
     * alignment. Negative values move the floating element away from center-
     * alignment. When align is "center", positive offsets move the floating
     * element right (top or bottom anchor side) or down (left or right
     * anchor side).
     */
    alignmentOffset: number;
    /**
     * If false, when the above settings result in rendering the floating element
     * wholly or partially outside of the bounds of the containing element, attempt
     * to adjust the settings to prevent this. Only applies to "outside" positioning.
     *
     * First, attempt to flip to the opposite edge of the anchor if the floating
     * element is getting clipped in that direction. If flipping results in a
     * similar clipping, try moving to the adjacent sides.
     *
     * Once we find a side that does not clip the overlay in its own dimension,
     * check the rest of the sides to see if we need to adjust the alignment offset
     * to fit in other dimensions.
     *
     * If we try all four sides and get clipped each time, settle for overflowing
     * and use the "bottom" side, since the ability to scroll is most likely in
     * this direction.
     */
    allowOutOfBounds: boolean;
}
export interface AnchorPosition {
    top: number;
    left: number;
    anchorSide: AnchorSide;
}
/**
 * Given a floating element and an anchor element, return coordinates for the top-left
 * of the floating element in order to absolutely position it such that it appears
 * near the anchor element.
 *
 * @param floatingElement Element intended to be positioned near or within an anchor
 * @param anchorElement The element to serve as the position anchor
 * @param settings Settings to determine the rules for positioning the floating element
 * @returns {top: number, left: number} coordinates for the floating element
 */
export declare function getAnchoredPosition(floatingElement: Element, anchorElement: Element | DOMRect, settings?: Partial<PositionSettings>): AnchorPosition;
