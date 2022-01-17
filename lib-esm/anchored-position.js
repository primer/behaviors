// When prettier supports template literal types...
// export type AnchorSide = `${'inside' | 'outside'}-${'top' | 'bottom' | 'right' | 'left'}` | 'inside-center'

/**
 * Settings that customize how a floating element is positioned
 * with respect to an anchor element.
 */
// For each outside anchor position, list the order of alternate positions to try in
// the event that the original position overflows. See comment on `allowOutOfBounds`
// for a more detailed description.
const alternateOrders = {
  'outside-top': ['outside-bottom', 'outside-right', 'outside-left', 'outside-bottom'],
  'outside-bottom': ['outside-top', 'outside-right', 'outside-left', 'outside-bottom'],
  'outside-left': ['outside-right', 'outside-bottom', 'outside-top', 'outside-bottom'],
  'outside-right': ['outside-left', 'outside-bottom', 'outside-top', 'outside-bottom']
};

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
export function getAnchoredPosition(floatingElement, anchorElement, settings = {}) {
  const parentElement = getPositionedParent(floatingElement);
  const clippingRect = getClippingRect(parentElement);
  const parentElementStyle = getComputedStyle(parentElement);
  const parentElementRect = parentElement.getBoundingClientRect();
  const [borderTop, borderLeft] = [parentElementStyle.borderTopWidth, parentElementStyle.borderLeftWidth].map(v => parseInt(v, 10) || 0);
  const relativeRect = {
    top: parentElementRect.top + borderTop,
    left: parentElementRect.left + borderLeft
  };
  return pureCalculateAnchoredPosition(clippingRect, relativeRect, floatingElement.getBoundingClientRect(), anchorElement instanceof Element ? anchorElement.getBoundingClientRect() : anchorElement, getDefaultSettings(settings));
}
/**
 * Returns the nearest proper HTMLElement parent of `element` whose
 * position is not "static", or document.body, whichever is closer
 */

function getPositionedParent(element) {
  let parentNode = element.parentNode;

  while (parentNode !== null) {
    if (parentNode instanceof HTMLElement && getComputedStyle(parentNode).position !== 'static') {
      return parentNode;
    }

    parentNode = parentNode.parentNode;
  }

  return document.body;
}
/**
 * Returns the rectangle (relative to the window) that will clip the given element
 * if it is rendered outside of its bounds.
 * @param element
 * @returns
 */


function getClippingRect(element) {
  let parentNode = element;

  while (parentNode !== null) {
    if (parentNode === document.body) {
      break;
    }

    const parentNodeStyle = getComputedStyle(parentNode);

    if (parentNodeStyle.overflow !== 'visible') {
      break;
    }

    parentNode = parentNode.parentNode;
  }

  const clippingNode = parentNode === document.body || !(parentNode instanceof HTMLElement) ? document.body : parentNode;
  const elemRect = clippingNode.getBoundingClientRect();
  const elemStyle = getComputedStyle(clippingNode);
  const [borderTop, borderLeft, borderRight, borderBottom] = [elemStyle.borderTopWidth, elemStyle.borderLeftWidth, elemStyle.borderRightWidth, elemStyle.borderBottomWidth].map(v => parseInt(v, 10) || 0);
  return {
    top: elemRect.top + borderTop,
    left: elemRect.left + borderLeft,
    width: elemRect.width - borderRight - borderLeft,
    // If the clipping node is document.body, it can expand to the full height of the window
    height: Math.max(elemRect.height - borderTop - borderBottom, clippingNode === document.body ? window.innerHeight : -Infinity)
  };
} // Default settings to position a floating element


const positionDefaults = {
  side: 'outside-bottom',
  align: 'start',
  // note: the following default is not applied if side === "inside-center"
  anchorOffset: 4,
  // note: the following default is only applied if side starts with "inside"
  // and align is not center
  alignmentOffset: 4,
  allowOutOfBounds: false
};
/**
 * Compute a full PositionSettings object from the given partial PositionSettings object
 * by filling in with defaults where applicable.
 * @param settings Partial settings - any omissions will be defaulted
 */

function getDefaultSettings(settings = {}) {
  var _settings$side, _settings$align, _settings$anchorOffse, _settings$alignmentOf, _settings$allowOutOfB;

  const side = (_settings$side = settings.side) !== null && _settings$side !== void 0 ? _settings$side : positionDefaults.side;
  const align = (_settings$align = settings.align) !== null && _settings$align !== void 0 ? _settings$align : positionDefaults.align;
  return {
    side,
    align,
    // offsets always default to 0 if their respective side/alignment is centered
    anchorOffset: (_settings$anchorOffse = settings.anchorOffset) !== null && _settings$anchorOffse !== void 0 ? _settings$anchorOffse : side === 'inside-center' ? 0 : positionDefaults.anchorOffset,
    alignmentOffset: (_settings$alignmentOf = settings.alignmentOffset) !== null && _settings$alignmentOf !== void 0 ? _settings$alignmentOf : align !== 'center' && side.startsWith('inside') ? positionDefaults.alignmentOffset : 0,
    allowOutOfBounds: (_settings$allowOutOfB = settings.allowOutOfBounds) !== null && _settings$allowOutOfB !== void 0 ? _settings$allowOutOfB : positionDefaults.allowOutOfBounds
  };
}
/**
 * Note: This is a pure function with no dependency on DOM APIs.
 * @see getAnchoredPosition
 * @see getDefaultSettings
 * @param viewportRect BoxPosition for the rectangle that will clip the floating element if it is
 *   rendered outside of the boundsof the rectangle.
 * @param relativePosition Position for the closest positioned proper parent of the floating element
 * @param floatingRect WidthAndHeight for the floating element
 * @param anchorRect BoxPosition for the anchor element
 * @param PositionSettings to customize the calculated position for the floating element.
 */


function pureCalculateAnchoredPosition(viewportRect, relativePosition, floatingRect, anchorRect, {
  side,
  align,
  allowOutOfBounds,
  anchorOffset,
  alignmentOffset
}) {
  // Compute the relative viewport rect, to bring it into the same coordinate space as `pos`
  const relativeViewportRect = {
    top: viewportRect.top - relativePosition.top,
    left: viewportRect.left - relativePosition.left,
    width: viewportRect.width,
    height: viewportRect.height
  };
  let pos = calculatePosition(floatingRect, anchorRect, side, align, anchorOffset, alignmentOffset);
  let anchorSide = side;
  pos.top -= relativePosition.top;
  pos.left -= relativePosition.left; // Handle screen overflow

  if (!allowOutOfBounds) {
    const alternateOrder = alternateOrders[side];
    let positionAttempt = 0;

    if (alternateOrder) {
      let prevSide = side; // Try all the alternate sides until one does not overflow

      while (positionAttempt < alternateOrder.length && shouldRecalculatePosition(prevSide, pos, relativeViewportRect, floatingRect)) {
        const nextSide = alternateOrder[positionAttempt++];
        prevSide = nextSide; // If we have cut off in the same dimension as the "side" option, try flipping to the opposite side.

        pos = calculatePosition(floatingRect, anchorRect, nextSide, align, anchorOffset, alignmentOffset);
        pos.top -= relativePosition.top;
        pos.left -= relativePosition.left;
        anchorSide = nextSide;
      }
    } // At this point we've flipped the position if applicable. Now just nudge until it's on-screen.


    if (pos.top < relativeViewportRect.top) {
      pos.top = relativeViewportRect.top;
    }

    if (pos.left < relativeViewportRect.left) {
      pos.left = relativeViewportRect.left;
    }

    if (pos.left + floatingRect.width > viewportRect.width + relativeViewportRect.left) {
      pos.left = viewportRect.width + relativeViewportRect.left - floatingRect.width;
    } // If we have exhausted all possible positions and none of them worked, we
    // say that overflowing the bottom of the screen is acceptable since it is
    // likely to be able to scroll.


    if (alternateOrder && positionAttempt < alternateOrder.length) {
      if (pos.top + floatingRect.height > viewportRect.height + relativeViewportRect.top) {
        pos.top = viewportRect.height + relativeViewportRect.top - floatingRect.height;
      }
    }
  }

  return { ...pos,
    anchorSide
  };
}
/**
 * Given a floating element and an anchor element, return coordinates for the
 * top-left of the floating element in order to absolutely position it such
 * that it appears near the anchor element.
 *
 * @param elementDimensions Dimensions of the floating element
 * @param anchorPosition Position of the anchor element
 * @param side Side of the anchor to position the floating element
 * @param align How to align the floating element with the anchor element
 * @param anchorOffset Absolute pixel offset for anchor positioning
 * @param alignmentOffset Absolute pixel offset for alignment
 * @returns {top: number, left: number} coordinates for the floating element
 */


function calculatePosition(elementDimensions, anchorPosition, side, align, anchorOffset, alignmentOffset) {
  const anchorRight = anchorPosition.left + anchorPosition.width;
  const anchorBottom = anchorPosition.top + anchorPosition.height;
  let top = -1;
  let left = -1;

  if (side === 'outside-top') {
    top = anchorPosition.top - anchorOffset - elementDimensions.height;
  } else if (side === 'outside-bottom') {
    top = anchorBottom + anchorOffset;
  } else if (side === 'outside-left') {
    left = anchorPosition.left - anchorOffset - elementDimensions.width;
  } else if (side === 'outside-right') {
    left = anchorRight + anchorOffset;
  }

  if (side === 'outside-top' || side === 'outside-bottom') {
    if (align === 'start') {
      left = anchorPosition.left + alignmentOffset;
    } else if (align === 'center') {
      left = anchorPosition.left - (elementDimensions.width - anchorPosition.width) / 2 + alignmentOffset;
    } else {
      // end
      left = anchorRight - elementDimensions.width - alignmentOffset;
    }
  }

  if (side === 'outside-left' || side === 'outside-right') {
    if (align === 'start') {
      top = anchorPosition.top + alignmentOffset;
    } else if (align === 'center') {
      top = anchorPosition.top - (elementDimensions.height - anchorPosition.height) / 2 + alignmentOffset;
    } else {
      // end
      top = anchorBottom - elementDimensions.height - alignmentOffset;
    }
  }

  if (side === 'inside-top') {
    top = anchorPosition.top + anchorOffset;
  } else if (side === 'inside-bottom') {
    top = anchorBottom - anchorOffset - elementDimensions.height;
  } else if (side === 'inside-left') {
    left = anchorPosition.left + anchorOffset;
  } else if (side === 'inside-right') {
    left = anchorRight - anchorOffset - elementDimensions.width;
  } else if (side === 'inside-center') {
    left = (anchorRight + anchorPosition.left) / 2 - elementDimensions.width / 2 + anchorOffset;
  }

  if (side === 'inside-top' || side === 'inside-bottom') {
    if (align === 'start') {
      left = anchorPosition.left + alignmentOffset;
    } else if (align === 'center') {
      left = anchorPosition.left - (elementDimensions.width - anchorPosition.width) / 2 + alignmentOffset;
    } else {
      // end
      left = anchorRight - elementDimensions.width - alignmentOffset;
    }
  } else if (side === 'inside-left' || side === 'inside-right' || side === 'inside-center') {
    if (align === 'start') {
      top = anchorPosition.top + alignmentOffset;
    } else if (align === 'center') {
      top = anchorPosition.top - (elementDimensions.height - anchorPosition.height) / 2 + alignmentOffset;
    } else {
      // end
      top = anchorBottom - elementDimensions.height - alignmentOffset;
    }
  }

  return {
    top,
    left
  };
}
/**
 * Determines if there is an overflow
 * @param side
 * @param currentPos
 * @param containerDimensions
 * @param elementDimensions
 */


function shouldRecalculatePosition(side, currentPos, containerDimensions, elementDimensions) {
  if (side === 'outside-top' || side === 'outside-bottom') {
    return currentPos.top < containerDimensions.top || currentPos.top + elementDimensions.height > containerDimensions.height + containerDimensions.top;
  } else {
    return currentPos.left < containerDimensions.left || currentPos.left + elementDimensions.width > containerDimensions.width + containerDimensions.left;
  }
}