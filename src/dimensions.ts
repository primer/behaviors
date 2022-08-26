type Dimensions = {
  top: number
  left: number
  bottom: number
  right: number
  height?: number
  width?: number
}

type Offset = {
  top: number
  left: number
}

// Returns the current coordinates of the element relative to the document.
export function offset(element: HTMLElement): Offset {
  const rect = element.getBoundingClientRect()
  return {
    top: rect.top + window.pageYOffset,
    left: rect.left + window.pageXOffset
  }
}

// Get the closest ancestor element that has a scroll overflow.
//
// Will walk up the DOM from the element until it reaches an element with
// overflow scroll. Basically, an element that can have scroll bars.
export function overflowParent(targetElement: HTMLElement): HTMLElement | null | undefined {
  let element = targetElement
  const document = element.ownerDocument
  if (!document) {
    return
  }

  if (!element.offsetParent) {
    return
  }

  /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
  // @ts-ignore
  const HTMLElement = document.defaultView.HTMLElement

  if (element === document.body) {
    return
  }

  while (element !== document.body) {
    if (element.parentElement instanceof HTMLElement) {
      element = element.parentElement!
    } else {
      return
    }

    const {position, overflowY, overflowX} = getComputedStyle(element)
    if (
      position === 'fixed' ||
      overflowY === 'auto' ||
      overflowX === 'auto' ||
      overflowY === 'scroll' ||
      overflowX === 'scroll'
    ) {
      break
    }
  }

  return element instanceof Document ? null : element
}

// Returns overflow/scroll offset relative to the container.
//
// Get element overflow offset.
//
// This value is useful for figuring out if the element is outside the
// scrollbars of the container. If `top` is negative, the top of the
// element is above the scroll view. If `bottom` is negative, the
// bottom of the element is below the scroll view.
//
// +--------------------+.
// | (outside viewport) |
// +--------------------+ -|
// |          |         |  |
// |    top > |         |  |
// |          |         |  | h
// |          |         |  | e
// |  v left  V right v |  | i
// |-----> Element <----|  | g
// |          ^         |  | h
// |          |         |  | t
// | bottom > |         |  |
// |          |         |  |
// +--------------------+ -|
// | (outside viewport) |
// +--------------------+.
//
// //=> {top: 100, left: 100, bottom: 800, right: 800, height: 1000, width 1000}.
export function overflowOffset(
  element: HTMLElement,
  targetContainer: Document | HTMLElement | null
): Dimensions | undefined {
  let container = targetContainer
  const document = element.ownerDocument
  if (!document) {
    return
  }

  const documentElement = document.documentElement
  if (!documentElement) {
    return
  }

  if (element === documentElement) {
    return
  }

  const elementOffset = positionedOffset(element, container)
  if (!elementOffset) {
    return
  }

  container = elementOffset._container

  const scroll =
    container === document.documentElement && document.defaultView
      ? {
          top: document.defaultView.pageYOffset,
          left: document.defaultView.pageXOffset
        }
      : {
          top: container.scrollTop,
          left: container.scrollLeft
        }

  const top = elementOffset.top - scroll.top
  const left = elementOffset.left - scroll.left
  const height = container.clientHeight
  const width = container.clientWidth
  const bottom = height - (top + element.offsetHeight)
  const right = width - (left + element.offsetWidth)
  return {top, left, bottom, right, height, width}
}

// Returns position offset relative to the container.
//
// Measures the number of pixels from the top of the container to the
// top of the element and the number of pixels from the bottom of the
// containers full scroll height to the bottom of the element. If
// container is `body`, this is the same as $(element).offset().
//
//     +---------------------+ -|
//     |  outside | viewport |  |
//     +----------|----------+  |
//     |          |          |  |
//     |    top > |          |  |
//     |          |          |  | h
//     |          |          |  | e
//     |  v left  V right v  |  | i
//     |-----> Element <-----|  | g
//     |          ^          |  | h
//     |          |          |  | t
//     | bottom > |          |  |
//     |          |          |  |
//     +----------|----------+  |
//     |  outside | viewport |  |
//     +---------------------+ -|
//
//   {top: 100, left: 100, bottom: 800, right: 800}.
//
// Get element positioned offset.
//
// This value is useful for assigning to `scrollTop` to scroll to the item.
export function positionedOffset(
  targetElement: HTMLElement,
  container: HTMLElement | Document | Window | null
): (Dimensions & {_container: HTMLElement}) | undefined {
  let element = targetElement
  const document = element.ownerDocument
  if (!document) {
    return
  }

  const documentElement = document.documentElement
  if (!documentElement) {
    return
  }

  /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
  // @ts-ignore
  const HTMLElement = document.defaultView.HTMLElement

  let top = 0
  let left = 0
  const height = element.offsetHeight
  const width = element.offsetWidth

  while (!(element === document.body || element === container)) {
    top += element.offsetTop || 0
    left += element.offsetLeft || 0

    if (element.offsetParent instanceof HTMLElement) {
      element = element.offsetParent!
    } else {
      return
    }
  }

  let scrollHeight
  let scrollWidth
  let measuredContainer: HTMLElement

  if (
    !container ||
    container === document ||
    container === document.defaultView ||
    container === document.documentElement ||
    container === document.body
  ) {
    measuredContainer = documentElement
    scrollHeight = getDocumentHeight(document.body, documentElement)
    scrollWidth = getDocumentWidth(document.body, documentElement)
  } else if (container instanceof HTMLElement) {
    measuredContainer = container
    scrollHeight = container.scrollHeight
    scrollWidth = container.scrollWidth
  } else {
    return
  }

  const bottom = scrollHeight - (top + height)
  const right = scrollWidth - (left + width)
  return {top, left, bottom, right, _container: measuredContainer}
}

function getDocumentHeight(documentBody: HTMLElement, documentElement: HTMLElement): number {
  return Math.max(
    documentBody.scrollHeight,
    documentElement.scrollHeight,
    documentBody.offsetHeight,
    documentElement.offsetHeight,
    documentElement.clientHeight
  )
}

function getDocumentWidth(documentBody: HTMLElement, documentElement: HTMLElement): number {
  return Math.max(
    documentBody.scrollWidth,
    documentElement.scrollWidth,
    documentBody.offsetWidth,
    documentElement.offsetWidth,
    documentElement.clientWidth
  )
}
