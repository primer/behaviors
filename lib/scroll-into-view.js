"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scrollIntoView = scrollIntoView;

function scrollIntoView(child, viewingArea, {
  direction = 'vertical',
  startMargin = 0,
  endMargin = 0,
  behavior = 'smooth'
} = {}) {
  const startSide = direction === 'vertical' ? 'top' : 'left';
  const endSide = direction === 'vertical' ? 'bottom' : 'right';
  const scrollSide = direction === 'vertical' ? 'scrollTop' : 'scrollLeft';
  const {
    [startSide]: childStart,
    [endSide]: childEnd
  } = child.getBoundingClientRect();
  const {
    [startSide]: viewingAreaStart,
    [endSide]: viewingAreaEnd
  } = viewingArea.getBoundingClientRect();
  const isChildStartAboveViewingArea = childStart < viewingAreaStart + startMargin;
  const isChildBottomBelowViewingArea = childEnd > viewingAreaEnd - endMargin;

  if (isChildStartAboveViewingArea) {
    const scrollHeightToChildStart = childStart - viewingAreaStart + viewingArea[scrollSide];
    viewingArea.scrollTo({
      behavior,
      [startSide]: scrollHeightToChildStart - startMargin
    });
  } else if (isChildBottomBelowViewingArea) {
    const scrollHeightToChildBottom = childEnd - viewingAreaEnd + viewingArea[scrollSide];
    viewingArea.scrollTo({
      behavior,
      [startSide]: scrollHeightToChildBottom + endMargin
    });
  } // either completely in view or outside viewing area on both ends, don't scroll

}