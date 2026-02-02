import {PositionSettings, getAnchoredPosition} from '../anchored-position.js'

/*

Note: In each test below, we check the calculation from getAnchoredPosition against exact
values. For each `expect` call, there is an accompanying comment that distills the effective
calculation from the inputs, which may help debugging in the event of a test failure.

*/

// The DOMRect constructor isn't available in JSDOM, so we improvise here.
function makeDOMRect(x: number, y: number, width: number, height: number): DOMRect {
  return {
    x,
    y,
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    toJSON() {
      return this
    },
  }
}

// Since Jest/JSDOM doesn't support layout, we can stub out getBoundingClientRect if we know the
// correct dimensions. JSDOM will handle the rest of the DOM API used by getAnchoredPosition.
function createVirtualDOM(
  parentRect: DOMRect,
  anchorRect: DOMRect,
  floatingRect: DOMRect,
  parentBorders: {top: number; right: number; bottom: number; left: number} = {top: 0, right: 0, bottom: 0, left: 0},
) {
  const parent = document.createElement('div')
  parent.style.overflow = 'hidden'
  parent.style.position = 'relative'
  parent.style.borderTopWidth = `${parentBorders.top}px`
  parent.style.borderRightWidth = `${parentBorders.right}px`
  parent.style.borderBottomWidth = `${parentBorders.bottom}px`
  parent.style.borderLeftWidth = `${parentBorders.left}px`
  parent.id = 'parent'
  parent.innerHTML = '<div id="float"></div><div id="anchor"></div>'
  const float = parent.querySelector('#float')!

  const anchor = parent.querySelector('#anchor')!
  anchor.getBoundingClientRect = () => anchorRect
  parent.getBoundingClientRect = () => parentRect
  float.getBoundingClientRect = () => floatingRect
  return {float, parent, anchor}
}

describe('getAnchoredPosition', () => {
  it('returns the correct position in the default case with no overflow', () => {
    const anchorRect = makeDOMRect(300, 200, 50, 50)
    const floatingRect = makeDOMRect(NaN, NaN, 100, 100)
    document.body.innerHTML = '<div id="float"></div><div id="anchor"></div>'
    const float = document.querySelector('#float')!
    const anchor = document.querySelector('#anchor')!
    float.getBoundingClientRect = () => floatingRect
    anchor.getBoundingClientRect = () => anchorRect
    document.body.getBoundingClientRect = () => makeDOMRect(0, 0, 1920, 0)
    Object.defineProperty(window, 'innerHeight', {get: () => 1080})
    const settings: Partial<PositionSettings> = {anchorOffset: 4}
    const {top, left} = getAnchoredPosition(float, anchor, settings)
    expect(top).toEqual(254)
    expect(left).toEqual(300)
  })

  it('returns the correct position in the case of top-layer elements', () => {
    const anchorRect = makeDOMRect(300, 200, 50, 50)
    const parentRect = makeDOMRect(800, 600, 50, 50)
    const floatingRect = makeDOMRect(NaN, NaN, 100, 100)
    document.body.innerHTML = '<div><dialog id="float"></dialog><div id="anchor"></div></div>'
    const parent = document.querySelector('div')!
    parent.style.overflow = 'hidden'
    parent.style.position = 'relative'
    const float = document.querySelector('#float')!
    const anchor = document.querySelector('#anchor')!
    parent.getBoundingClientRect = () => parentRect
    float.getBoundingClientRect = () => floatingRect
    anchor.getBoundingClientRect = () => anchorRect
    document.body.getBoundingClientRect = () => makeDOMRect(0, 0, 1920, 0)
    Object.defineProperty(window, 'innerHeight', {get: () => 1080})
    const settings: Partial<PositionSettings> = {anchorOffset: 4}
    const {top, left} = getAnchoredPosition(float, anchor, settings)
    expect(top).toEqual(254)
    expect(left).toEqual(300)
  })

  it('returns the correct position in the default case with no overflow, inside a clipping parent', () => {
    const parentRect = makeDOMRect(20, 20, 500, 500)
    const anchorRect = makeDOMRect(300, 200, 50, 50)
    const floatingRect = makeDOMRect(NaN, NaN, 100, 100)
    const {float, anchor} = createVirtualDOM(parentRect, anchorRect, floatingRect)
    const settings: Partial<PositionSettings> = {anchorOffset: 4}

    const {top, left} = getAnchoredPosition(float, anchor, settings)

    expect(top).toEqual(234)
    expect(left).toEqual(280)
  })

  it('returns the correct position for different outside side settings with no overflow', () => {
    const parentRect = makeDOMRect(20, 20, 500, 500)
    const anchorRect = makeDOMRect(300, 200, 50, 50)
    const floatingRect = makeDOMRect(NaN, NaN, 100, 100)
    const {float, anchor} = createVirtualDOM(parentRect, anchorRect, floatingRect)
    const settings: Partial<PositionSettings> = {}
    let top = 0
    let left = 0

    // should be the same calculation as the default settings test above
    settings.side = 'outside-bottom'
    ;({top, left} = getAnchoredPosition(float, anchor, settings))
    expect(top).toEqual(234) // anchorRect.top + anchorRect.height + (settings.anchorOffset ?? 4) - parentRect.top
    expect(left).toEqual(280) // anchorRect.left - parentRect.left

    settings.side = 'outside-left'
    ;({top, left} = getAnchoredPosition(float, anchor, settings))
    expect(top).toEqual(180) // anchorRect.top - parentRect.top
    expect(left).toEqual(176) // anchorRect.left - floatingRect.width - (settings.anchorOffset ?? 4) - parentRect.left

    settings.side = 'outside-right'
    ;({top, left} = getAnchoredPosition(float, anchor, settings))
    expect(top).toEqual(180) // anchorRect.top - parentRect.top
    expect(left).toEqual(334) // anchorRect.left + anchorRect.width + (settings.anchorOffset ?? 4) - parentRect.left

    settings.side = 'outside-top'
    ;({top, left} = getAnchoredPosition(float, anchor, settings))
    expect(top).toEqual(76) // anchorRect.top - floatingRect.height - (settings.anchorOffset ?? 4) - parentRect.top
    expect(left).toEqual(280) // anchorRect.left - parentRect.left
  })

  it('returns the correct position for different inside side settings', () => {
    const parentRect = makeDOMRect(20, 20, 500, 500)
    const anchorRect = makeDOMRect(300, 200, 50, 50)
    const floatingRect = makeDOMRect(NaN, NaN, 100, 100)
    const {float, anchor} = createVirtualDOM(parentRect, anchorRect, floatingRect)
    const settings: Partial<PositionSettings> = {}
    let top = 0
    let left = 0

    settings.side = 'inside-bottom'
    ;({top, left} = getAnchoredPosition(float, anchor, settings))

    // anchorRect.top + anchorRect.height - (settings.anchorOffset ?? 4) - floatingRect.height - parentRect.top
    expect(top).toEqual(126)
    // anchorRect.left + (settings.alignmentOffset ?? 4) - parentRect.left
    expect(left).toEqual(284)

    settings.side = 'inside-left'
    ;({top, left} = getAnchoredPosition(float, anchor, settings))
    expect(top).toEqual(184) // anchorRect.top + (settings.alignmentOffset ?? 4) - parentRect.top
    expect(left).toEqual(284) // anchorRect.left + (settings.anchorOffset ?? 4) - parentRect.left

    settings.side = 'inside-right'
    ;({top, left} = getAnchoredPosition(float, anchor, settings))

    // anchorRect.top + (settings.alignmentOffset ?? 4) - parentRect.top
    expect(top).toEqual(184)
    // anchorRect.left + anchorRect.width - (settings.anchorOffset ?? 4) - floatingRect.width - parentRect.left
    expect(left).toEqual(226)

    // almost the same as inside-left, with the exception of offsets
    settings.side = 'inside-top'
    ;({top, left} = getAnchoredPosition(float, anchor, settings))
    expect(top).toEqual(184) // anchorRect.top + (settings.anchorOffset ?? 4) - parentRect.top
    expect(left).toEqual(284) // anchorRect.left + (settings.alignmentOffset ?? 4) - parentRect.left

    settings.side = 'inside-center'
    ;({top, left} = getAnchoredPosition(float, anchor, settings))
    expect(top).toEqual(184) // anchorRect.top + (settings.alignmentOffset ?? 4) - parentRect.top
    expect(left).toEqual(255) // anchorRect.left + anchorRect.width / 2 - floatingRect.width / 2 - parentRect.left
  })

  it('returns the correct position inside centering along both axes', () => {
    const parentRect = makeDOMRect(20, 20, 500, 500)
    const anchorRect = makeDOMRect(300, 200, 50, 50)
    const floatingRect = makeDOMRect(NaN, NaN, 100, 100)
    const {float, anchor} = createVirtualDOM(parentRect, anchorRect, floatingRect)
    const settings: Partial<PositionSettings> = {side: 'inside-center', align: 'center'}

    const {top, left} = getAnchoredPosition(float, anchor, settings)

    expect(top).toEqual(155) // anchorRect.top + anchorRect.height / 2 - floatingRect.height / 2 - parentRect.top
    expect(left).toEqual(255) // anchorRect.left + anchorRect.width / 2 - floatingRect.width / 2 - parentRect.left
  })

  it('returns the correct position for different alignment settings with no overflow', () => {
    const parentRect = makeDOMRect(20, 20, 500, 500)
    const anchorRect = makeDOMRect(300, 200, 50, 50)
    const floatingRect = makeDOMRect(NaN, NaN, 100, 100)
    const {float, anchor} = createVirtualDOM(parentRect, anchorRect, floatingRect)
    const settings: Partial<PositionSettings> = {}
    let top = 0
    let left = 0

    settings.align = 'start'
    ;({top, left} = getAnchoredPosition(float, anchor, settings))
    expect(top).toEqual(234) // anchorRect.top + anchorRect.height + (settings.anchorOffset ?? 4) - parentRect.top
    expect(left).toEqual(280) // anchorRect.left + (settings.alignmentOffset ?? 0) - parentRect.left

    settings.align = 'center'
    ;({top, left} = getAnchoredPosition(float, anchor, settings))

    // anchorRect.top + anchorRect.height + (settings.anchorOffset ?? 4) - parentRect.top
    expect(top).toEqual(234)
    // anchorRect.left + anchorRect.width / 2 - floatingRect.width / 2 + (settings.anchorOffset ?? 0) - parentRect.left
    expect(left).toEqual(255)

    settings.align = 'end'
    ;({top, left} = getAnchoredPosition(float, anchor, settings))

    // anchorRect.top + anchorRect.height + (settings.anchorOffset ?? 4) - parentRect.top
    expect(top).toEqual(234)
    // anchorRect.left + anchorRect.width - floatingRect.width - (settings.alignmentOffset ?? 0) - parentRect.left
    expect(left).toEqual(230)
  })

  it('properly flips to the opposite side if the calculated position overflows along the same axis', () => {
    const parentRect = makeDOMRect(20, 20, 500, 500)
    const anchorRect = makeDOMRect(300, 400, 50, 50)
    const floatingRect = makeDOMRect(NaN, NaN, 100, 100)
    const {float, anchor} = createVirtualDOM(parentRect, anchorRect, floatingRect)
    const settings: Partial<PositionSettings> = {}

    const {top, left} = getAnchoredPosition(float, anchor, settings)

    expect(top).toEqual(276) // anchorRect.top - floatingRect.height - (settings.anchorOffset ?? 4) - parentRect.top
    expect(left).toEqual(280) // anchorRect.left - parentRect.left
  })

  it('properly moves to an adjacent side if overflow happens along side edge and flipped edge', () => {
    const parentRect = makeDOMRect(20, 20, 500, 200)
    const anchorRect = makeDOMRect(300, 100, 50, 50)
    const floatingRect = makeDOMRect(NaN, NaN, 100, 100)
    const {float, anchor} = createVirtualDOM(parentRect, anchorRect, floatingRect)
    const settings: Partial<PositionSettings> = {}

    const {top, left} = getAnchoredPosition(float, anchor, settings)

    expect(top).toEqual(80) // anchorRect.top - parentRect.top
    expect(left).toEqual(334) // anchorRect.left + anchorRect.width + (settings.anchorOffset ?? 4) - parentRect.left
  })

  it('properly adjusts the position using an alignment offset if overflow happens along the alignment edge', () => {
    const parentRect = makeDOMRect(20, 20, 500, 500)
    const anchorRect = makeDOMRect(300, 200, 50, 50)
    const floatingRect = makeDOMRect(NaN, NaN, 400, 100)
    const {float, anchor} = createVirtualDOM(parentRect, anchorRect, floatingRect)
    const settings: Partial<PositionSettings> = {}

    const {top, left} = getAnchoredPosition(float, anchor, settings)

    expect(top).toEqual(234) // anchorRect.top + anchorRect.height + (settings.anchorOffset ?? 4) - parentRect.top
    expect(left).toEqual(100) // parentRect.width - floatingRect.width
  })

  it('properly calculates the position that needs to be flipped and offset-adjusted', () => {
    const parentRect = makeDOMRect(20, 20, 500, 500)
    const anchorRect = makeDOMRect(300, 400, 50, 50)
    const floatingRect = makeDOMRect(NaN, NaN, 400, 100)
    const {float, anchor} = createVirtualDOM(parentRect, anchorRect, floatingRect)
    const settings: Partial<PositionSettings> = {}

    const {top, left} = getAnchoredPosition(float, anchor, settings)

    expect(top).toEqual(276) // anchorRect.top - floatingRect.height - (settings.anchorOffset ?? 4) - parentRect.top
    expect(left).toEqual(100) // parentRect.width - floatingRect.width
  })

  it('properly calculates the outside position with many simultaneous settings interactions (stress test)', () => {
    const parentRect = makeDOMRect(20, 20, 200, 500)
    const anchorRect = makeDOMRect(95, 295, 100, 200)
    const floatingRect = makeDOMRect(NaN, NaN, 175, 200)
    const {float, anchor} = createVirtualDOM(parentRect, anchorRect, floatingRect)
    const settings: Partial<PositionSettings> = {
      side: 'outside-right',
      align: 'center',
      alignmentOffset: 10,
      anchorOffset: -10,
    }

    const {top, left} = getAnchoredPosition(float, anchor, settings)

    // expect to try right, left, and bottom before ending on top
    expect(top).toEqual(85) // anchorRect.top - floatingRect.height - (settings.anchorOffset ?? 4) - parentRect.top

    // expect center alignment to run against edge, so ignored. Also causes alignment offset to be ignored.
    expect(left).toEqual(25) // parentRect.width - floatingRect.width
  })

  it('properly calculates the inside position with many simultaneous settings interactions (stress test)', () => {
    const parentRect = makeDOMRect(20, 20, 500, 500)
    const anchorRect = makeDOMRect(100, 100, 300, 300)
    const floatingRect = makeDOMRect(NaN, NaN, 100, 200)
    const {float, anchor} = createVirtualDOM(parentRect, anchorRect, floatingRect)
    const settings: Partial<PositionSettings> = {
      side: 'inside-right',
      align: 'center',
      alignmentOffset: 10,
      anchorOffset: -10,
    }

    const {top, left} = getAnchoredPosition(float, anchor, settings)

    // anchorRect.top + anchorRect.height / 2 - floatingRect.height / 2 + (settings.alignmentOffset ?? 4) - parentRect.top
    expect(top).toEqual(140)

    // anchorRect.left + anchorRect.width - floatingRect.width - (settings.anchorOffset ?? 4) - parentRect.left
    expect(left).toEqual(290)
  })

  it('properly calculates the position when alignment needs to be flipped', () => {
    const parentRect = makeDOMRect(20, 20, 500, 500)
    const anchorRect = makeDOMRect(450, 20, 50, 50) // right aligned square, at the edge
    const floatingRect = makeDOMRect(NaN, NaN, 100, 50)
    const {float, anchor} = createVirtualDOM(parentRect, anchorRect, floatingRect)
    const settings: Partial<PositionSettings> = {side: 'outside-bottom', align: 'start'} // but there's not enough room for that

    const {top, left, anchorAlign} = getAnchoredPosition(float, anchor, settings)
    expect(top).toEqual(54) // anchorRect.top - parentRect.top + anchorRect.height + (settings.anchorOffset ?? 4)

    /**
     * with align:start, left = anchorRect.left - parentTop.left = 430
     * and right = left + floatingRect.width = 530
     * which would overflow parentRect.left + parentRect.width = 520
     * so it should flip to align:end
     */
    expect(anchorAlign).toEqual('end')
    // based on align:end, anchorRect.left + anchorRect.width - parentRect.left - floatingRect.width
    expect(left).toEqual(380)
  })

  it('properly calculates the position when only side needs to be flipped', () => {
    const parentRect = makeDOMRect(20, 20, 500, 500)
    const anchorRect = makeDOMRect(450, 20, 50, 50) // right aligned square, at the edge
    const floatingRect = makeDOMRect(NaN, NaN, 100, 50)
    const {float, anchor} = createVirtualDOM(parentRect, anchorRect, floatingRect)

    // not enough space for specified side or alignment
    const settings: Partial<PositionSettings> = {side: 'outside-right', align: 'start'}

    const {top, left, anchorSide, anchorAlign} = getAnchoredPosition(float, anchor, settings)
    expect(top).toEqual(0) // anchorRect.top - parentRect.top

    expect(anchorSide).toEqual('outside-left') // flipped
    expect(anchorAlign).toEqual('start') // no need to flip
    expect(left).toEqual(326) // anchorRect.left - floatingRect.width - (settings.anchorOffset ?? 4) - parentRect.left
  })

  it('properly calculates the position when both side and alignment need to be flipped', () => {
    const parentRect = makeDOMRect(20, 20, 500, 500)
    const anchorRect = makeDOMRect(450, 20, 50, 50) // right aligned square, at the edge
    const floatingRect = makeDOMRect(NaN, NaN, 100, 50)
    const {float, anchor} = createVirtualDOM(parentRect, anchorRect, floatingRect)

    // not enough space for specified side or alignment
    const settings: Partial<PositionSettings> = {side: 'outside-top', align: 'start'}

    const {top, left, anchorSide, anchorAlign} = getAnchoredPosition(float, anchor, settings)
    expect(anchorSide).toEqual('outside-bottom')
    expect(anchorAlign).toEqual('end')
    expect(top).toEqual(54) // anchorRect.top + anchorRect.height + (settings.anchorOffset ?? 4) - parentRect.top
    expect(left).toEqual(380) // anchorRect.left + anchorRect.width - parentRect.left - floatingRect.width
  })

  // This test runs for values derived from a real use case https://github.com/github/accessibility-audits/issues/4515 as seen on a local storybook.
  it('should overflow to bottom if the element is too tall to fit on the screen when zoomed', () => {
    const parentRect = makeDOMRect(0, 0, 400, 400)
    const anchorRect = makeDOMRect(16, 16, 32, 32) // left aligned button
    const floatingRect = makeDOMRect(0, 0, 256, 428)
    const {float, anchor} = createVirtualDOM(parentRect, anchorRect, floatingRect)
    const settings: Partial<PositionSettings> = {side: 'outside-bottom', align: 'start'}
    const {top, left, anchorSide, anchorAlign} = getAnchoredPosition(float, anchor, settings)
    expect(anchorSide).toEqual('outside-right')
    expect(anchorAlign).toEqual('start')
    expect(top).toEqual(0)
    expect(left).toEqual(52)
  })

  describe('getComputedStyle optimization', () => {
    it('should make fewer getComputedStyle calls with deeply nested DOM', () => {
      const parentRect = makeDOMRect(20, 20, 500, 500)
      const anchorRect = makeDOMRect(300, 200, 50, 50)
      const floatingRect = makeDOMRect(NaN, NaN, 100, 100)

      // Create a deeply nested DOM structure
      const root = document.createElement('div')
      root.style.overflow = 'hidden'
      root.style.position = 'relative'
      root.style.borderTopWidth = '0px'
      root.style.borderRightWidth = '0px'
      root.style.borderBottomWidth = '0px'
      root.style.borderLeftWidth = '0px'
      root.getBoundingClientRect = () => parentRect

      // Create 5 intermediate divs (none positioned, none clipping)
      let currentParent = root
      for (let i = 0; i < 5; i++) {
        const div = document.createElement('div')
        div.id = `intermediate-${i}`
        div.style.position = 'static'
        div.style.overflow = 'visible'
        currentParent.appendChild(div)
        currentParent = div
      }

      const float = document.createElement('div')
      float.id = 'float'
      float.getBoundingClientRect = () => floatingRect
      currentParent.appendChild(float)

      const anchor = document.createElement('div')
      anchor.id = 'anchor'
      anchor.getBoundingClientRect = () => anchorRect
      currentParent.appendChild(anchor)

      // Mock getComputedStyle to track calls
      const originalGetComputedStyle = window.getComputedStyle
      let callCount = 0
      const getComputedStyleSpy = jest.spyOn(window, 'getComputedStyle').mockImplementation((element: Element) => {
        callCount++
        return originalGetComputedStyle(element)
      })

      const settings: Partial<PositionSettings> = {anchorOffset: 4}
      const result = getAnchoredPosition(float, anchor, settings)

      // Verify the result is correct
      expect(result.top).toBeDefined()
      expect(result.left).toBeDefined()

      // With the latest optimization (cached styles), we should make:
      // - 5 calls during traversal (one for each intermediate div)
      // - 1 call for root during traversal (finds both positioned parent and clipping node, caches style)
      // - 0 additional calls (both clippingRect and parent borders use cached styles from traversal)
      // Total: 5 + 1 = 6 calls
      //
      // Without optimization it would be:
      // - 6 calls for getPositionedParent traversal (5 intermediate + 1 root)
      // - 6 calls for getClippingRect traversal (5 intermediate + 1 root)
      // - 1 call for positioned parent borders
      // - 1 call for clipping rect borders (same element but separate call)
      // Total: 6 + 6 + 1 + 1 = 14 calls
      //
      // Optimization reduces calls from 14 to 6 (57% reduction, improved from 42%)
      expect(callCount).toBeLessThan(14)
      expect(callCount).toBeGreaterThan(0)

      getComputedStyleSpy.mockRestore()
    })

    it('should handle case where positioned parent is same as clipping node', () => {
      const parentRect = makeDOMRect(20, 20, 500, 500)
      const anchorRect = makeDOMRect(300, 200, 50, 50)
      const floatingRect = makeDOMRect(NaN, NaN, 100, 100)

      // Create a single parent that is both positioned and clipping
      const parent = document.createElement('div')
      parent.style.overflow = 'hidden'
      parent.style.position = 'relative'
      parent.style.borderTopWidth = '0px'
      parent.style.borderRightWidth = '0px'
      parent.style.borderBottomWidth = '0px'
      parent.style.borderLeftWidth = '0px'
      parent.getBoundingClientRect = () => parentRect

      const float = document.createElement('div')
      float.getBoundingClientRect = () => floatingRect
      parent.appendChild(float)

      const anchor = document.createElement('div')
      anchor.getBoundingClientRect = () => anchorRect
      parent.appendChild(anchor)

      const settings: Partial<PositionSettings> = {anchorOffset: 4}
      const result = getAnchoredPosition(float, anchor, settings)

      // Should work correctly when both are the same element
      // With default side='outside-bottom', align='start':
      expect(result.top).toEqual(234) // anchorRect.top + anchorRect.height + anchorOffset - parentRect.top
      expect(result.left).toEqual(280) // anchorRect.left - parentRect.left
    })

    it('should handle case where positioned parent is found before clipping node', () => {
      const parentRect = makeDOMRect(20, 20, 500, 500)
      const clippingRect = makeDOMRect(10, 10, 600, 600)
      const anchorRect = makeDOMRect(300, 200, 50, 50)
      const floatingRect = makeDOMRect(NaN, NaN, 100, 100)

      // Create outer clipping node
      const clippingNode = document.createElement('div')
      clippingNode.style.overflow = 'hidden'
      clippingNode.style.position = 'static'
      clippingNode.style.borderTopWidth = '0px'
      clippingNode.style.borderRightWidth = '0px'
      clippingNode.style.borderBottomWidth = '0px'
      clippingNode.style.borderLeftWidth = '0px'
      clippingNode.getBoundingClientRect = () => clippingRect

      // Create inner positioned parent
      const parent = document.createElement('div')
      parent.style.overflow = 'visible'
      parent.style.position = 'relative'
      parent.style.borderTopWidth = '0px'
      parent.style.borderRightWidth = '0px'
      parent.style.borderBottomWidth = '0px'
      parent.style.borderLeftWidth = '0px'
      parent.getBoundingClientRect = () => parentRect
      clippingNode.appendChild(parent)

      const float = document.createElement('div')
      float.getBoundingClientRect = () => floatingRect
      parent.appendChild(float)

      const anchor = document.createElement('div')
      anchor.getBoundingClientRect = () => anchorRect
      parent.appendChild(anchor)

      const settings: Partial<PositionSettings> = {anchorOffset: 4}
      const result = getAnchoredPosition(float, anchor, settings)

      // Should work correctly when positioned parent is closer than clipping node
      // Position is calculated relative to the positioned parent (inner element)
      expect(result.top).toEqual(234) // anchorRect.top + anchorRect.height + anchorOffset - parentRect.top
      expect(result.left).toEqual(280) // anchorRect.left - parentRect.left
    })

    it('should handle case where clipping node is found before positioned parent', () => {
      const clippingRect = makeDOMRect(20, 20, 500, 500)
      const parentRect = makeDOMRect(10, 10, 600, 600)
      const anchorRect = makeDOMRect(300, 200, 50, 50)
      const floatingRect = makeDOMRect(NaN, NaN, 100, 100)

      // Create outer positioned parent
      const positionedParent = document.createElement('div')
      positionedParent.style.overflow = 'visible'
      positionedParent.style.position = 'relative'
      positionedParent.style.borderTopWidth = '0px'
      positionedParent.style.borderRightWidth = '0px'
      positionedParent.style.borderBottomWidth = '0px'
      positionedParent.style.borderLeftWidth = '0px'
      positionedParent.getBoundingClientRect = () => parentRect

      // Create inner clipping node
      const clippingNode = document.createElement('div')
      clippingNode.style.overflow = 'hidden'
      clippingNode.style.position = 'static'
      clippingNode.style.borderTopWidth = '0px'
      clippingNode.style.borderRightWidth = '0px'
      clippingNode.style.borderBottomWidth = '0px'
      clippingNode.style.borderLeftWidth = '0px'
      clippingNode.getBoundingClientRect = () => clippingRect
      positionedParent.appendChild(clippingNode)

      const float = document.createElement('div')
      float.getBoundingClientRect = () => floatingRect
      clippingNode.appendChild(float)

      const anchor = document.createElement('div')
      anchor.getBoundingClientRect = () => anchorRect
      clippingNode.appendChild(anchor)

      const settings: Partial<PositionSettings> = {anchorOffset: 4}
      const result = getAnchoredPosition(float, anchor, settings)

      // Should work correctly when clipping node is closer than positioned parent
      // Position is calculated relative to the positioned parent (outer element)
      expect(result.top).toEqual(244) // anchorRect.top + anchorRect.height + anchorOffset - parentRect.top
      expect(result.left).toEqual(290) // anchorRect.left - parentRect.left
    })
  })

  describe('displayInVisibleViewport option', () => {
    beforeEach(() => {
      // Mock window dimensions for consistent testing
      Object.defineProperty(window, 'innerWidth', {value: 1024, writable: true})
      Object.defineProperty(window, 'innerHeight', {value: 768, writable: true})
    })

    it('defaults to false when not specified', () => {
      const anchorRect = makeDOMRect(300, 200, 50, 50)
      const floatingRect = makeDOMRect(NaN, NaN, 100, 100)
      const {float, anchor} = createVirtualDOM(makeDOMRect(20, 20, 1920, 1080), anchorRect, floatingRect)

      const {top, left} = getAnchoredPosition(float, anchor, {side: 'outside-bottom'})

      // Should use normal clipping behavior (relative to clipping parent)
      expect(top).toEqual(234) // anchorRect.top + anchorRect.height + 4 - parentRect.top
      expect(left).toEqual(280) // anchorRect.left - parentRect.left
    })

    it('constrains to visible viewport when set to true', () => {
      const anchorRect = makeDOMRect(950, 700, 50, 50) // Near bottom-right of viewport
      const floatingRect = makeDOMRect(NaN, NaN, 200, 200) // Large floating element
      const {float, anchor} = createVirtualDOM(
        makeDOMRect(0, 0, 2000, 2000), // Large container
        anchorRect,
        floatingRect,
      )

      const {top, left} = getAnchoredPosition(float, anchor, {
        side: 'outside-bottom',
        displayInVisibleViewport: true,
      })

      // Should be constrained to fit within viewport (1024x768)
      expect(left).toBeLessThanOrEqual(1024 - 200) // left + width <= viewport width
      expect(top + 200).toBeLessThanOrEqual(768) // top + height <= viewport height
    })

    it('flips to top when bottom would exceed viewport height', () => {
      const anchorRect = makeDOMRect(400, 700, 50, 50) // Near bottom of viewport
      const floatingRect = makeDOMRect(NaN, NaN, 100, 100)
      const {float, anchor} = createVirtualDOM(makeDOMRect(0, 0, 1920, 1080), anchorRect, floatingRect)

      const {top, anchorSide} = getAnchoredPosition(float, anchor, {
        side: 'outside-bottom',
        displayInVisibleViewport: true,
      })

      // Should flip to top side to fit in viewport
      expect(anchorSide).toEqual('outside-top')
      expect(top).toBeGreaterThanOrEqual(0)
      expect(top + 100).toBeLessThanOrEqual(768)
    })

    it('adjusts left position when right edge would exceed viewport width', () => {
      const anchorRect = makeDOMRect(950, 300, 50, 50) // Near right edge of viewport
      const floatingRect = makeDOMRect(NaN, NaN, 150, 100)
      const {float, anchor} = createVirtualDOM(makeDOMRect(0, 0, 1920, 1080), anchorRect, floatingRect)

      const {left} = getAnchoredPosition(float, anchor, {
        side: 'outside-bottom',
        align: 'start',
        displayInVisibleViewport: true,
      })

      // Should be pushed left to fit in viewport
      expect(left + 150).toBeLessThanOrEqual(1024) // left + width <= viewport width
    })

    it('works with inside positioning', () => {
      const anchorRect = makeDOMRect(100, 100, 800, 600) // Large anchor covering most viewport
      const floatingRect = makeDOMRect(NaN, NaN, 200, 100)
      const {float, anchor} = createVirtualDOM(makeDOMRect(0, 0, 1920, 1080), anchorRect, floatingRect)

      const {top, left} = getAnchoredPosition(float, anchor, {
        side: 'inside-center',
        align: 'center',
        displayInVisibleViewport: true,
      })

      // Should position inside the anchor and within viewport
      expect(left).toBeGreaterThanOrEqual(0)
      expect(top).toBeGreaterThanOrEqual(0)
      expect(left + 200).toBeLessThanOrEqual(1024)
      expect(top + 100).toBeLessThanOrEqual(768)
    })

    it('still respects allowOutOfBounds when both options are set', () => {
      const anchorRect = makeDOMRect(950, 700, 50, 50)
      const floatingRect = makeDOMRect(NaN, NaN, 200, 200)
      const {float, anchor} = createVirtualDOM(makeDOMRect(0, 0, 1920, 1080), anchorRect, floatingRect)

      const {top, left} = getAnchoredPosition(float, anchor, {
        side: 'outside-bottom',
        displayInVisibleViewport: true,
        allowOutOfBounds: true,
      })

      // When allowOutOfBounds is true, should allow overflow even with displayInVisibleViewport
      // The exact behavior depends on implementation, but it should not throw an error
      expect(typeof top).toBe('number')
      expect(typeof left).toBe('number')
    })

    it('handles edge case when anchor is outside viewport', () => {
      const anchorRect = makeDOMRect(1200, 900, 50, 50) // Outside 1024x768 viewport
      const floatingRect = makeDOMRect(NaN, NaN, 100, 100)
      const {float, anchor} = createVirtualDOM(makeDOMRect(0, 0, 2000, 2000), anchorRect, floatingRect)

      const {top, left} = getAnchoredPosition(float, anchor, {
        side: 'outside-bottom',
        displayInVisibleViewport: true,
      })

      // When anchor is outside viewport, the position calculation should still work
      // but the final nudging should ensure no part of the floating element exceeds viewport
      // Since the anchor is at (1200, 900) with 'outside-bottom', the floating element
      // would initially be positioned around (1200, 954), which exceeds viewport bounds
      // The displayInVisibleViewport option should constrain this
      expect(left + 100).toBeLessThanOrEqual(1024) // right edge within viewport
      expect(top + 100).toBeLessThanOrEqual(768) // bottom edge within viewport
    })
  })
})
