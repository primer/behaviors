import React from 'react'
import {isFocusable, isTabbable, iterateFocusableElements} from '../utils/iterate-focusable-elements.js'
import {render} from '@testing-library/react'

// Since we use strict checks for size and parent, we need to mock these
// properties that Jest does not populate.
beforeAll(() => {
  try {
    Object.defineProperties(HTMLElement.prototype, {
      offsetHeight: {
        get: () => 42,
      },
      offsetWidth: {
        get: () => 42,
      },
      getClientRects: {
        get: () => () => [42],
      },
      offsetParent: {
        get() {
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          for (let element = this; element; element = element.parentNode) {
            if (element.style?.display?.toLowerCase() === 'none') {
              return null
            }
          }

          const position = this.style?.position?.toLowerCase()
          if (position === 'fixed' || position === 'sticky') {
            return null
          }

          if (this.tagName.toLowerCase() in ['html', 'body']) {
            return null
          }

          return this.parentNode
        },
      },
    })
  } catch {
    // ignore
  }
})

it('Should iterate through focusable elements only', () => {
  const {container} = render(
    <div>
      <div>
        <textarea></textarea>
      </div>
      <input />
      <button>Hello</button>
      <p>Not focusable</p>
      <div tabIndex={0}>
        <a tabIndex={-1} href="#boo">
          Focusable
        </a>
        <a href="#yah">Focusable</a>
      </div>
      <blockquote contentEditable></blockquote>
    </div>,
  )

  const focusable = Array.from(iterateFocusableElements(container as HTMLElement))
  expect(focusable.length).toEqual(7)
  expect(focusable[0].tagName.toLowerCase()).toEqual('textarea')
  expect(focusable[1].tagName.toLowerCase()).toEqual('input')
  expect(focusable[2].tagName.toLowerCase()).toEqual('button')
  expect(focusable[3].tagName.toLowerCase()).toEqual('div')
  expect(focusable[4].tagName.toLowerCase()).toEqual('a')
  expect(focusable[4].getAttribute('href')).toEqual('#boo')
  expect(focusable[5].tagName.toLowerCase()).toEqual('a')
  expect(focusable[5].getAttribute('href')).toEqual('#yah')
  expect(focusable[6].tagName.toLowerCase()).toEqual('blockquote')
})

it('Should iterate through tabbable elements only', () => {
  const {container} = render(
    <div>
      <div>
        <textarea></textarea>
      </div>
      <input />
      <button>Hello</button>
      <p>Not tabbable</p>
      <div tabIndex={0}>
        <a tabIndex={-1} href="#boo">
          Not tabbable
        </a>
        <a href="#yah">Tabbable</a>
      </div>
      <blockquote contentEditable></blockquote>
    </div>,
  )

  const focusable = Array.from(iterateFocusableElements(container as HTMLElement, {onlyTabbable: true}))
  expect(focusable.length).toEqual(6)
  expect(focusable[0].tagName.toLowerCase()).toEqual('textarea')
  expect(focusable[1].tagName.toLowerCase()).toEqual('input')
  expect(focusable[2].tagName.toLowerCase()).toEqual('button')
  expect(focusable[3].tagName.toLowerCase()).toEqual('div')
  expect(focusable[4].tagName.toLowerCase()).toEqual('a')
  expect(focusable[4].getAttribute('href')).toEqual('#yah')
  expect(focusable[5].tagName.toLowerCase()).toEqual('blockquote')
})

it('Should iterate through tab elements in reverse', () => {
  const {container} = render(
    <div>
      <div>
        <textarea></textarea>
      </div>
      <input />
      <button>Hello</button>
      <p>Not focusable</p>
      <div tabIndex={0}>
        <a tabIndex={-1} href="#boo">
          Not focusable
        </a>
        <a href="#yah">Focusable</a>
      </div>
      <blockquote contentEditable></blockquote>
    </div>,
  )

  const focusable = Array.from(iterateFocusableElements(container as HTMLElement, {reverse: true, onlyTabbable: true}))
  expect(focusable.length).toEqual(6)
  expect(focusable[0].tagName.toLowerCase()).toEqual('blockquote')
  expect(focusable[1].tagName.toLowerCase()).toEqual('a')
  expect(focusable[1].getAttribute('href')).toEqual('#yah')
  expect(focusable[2].tagName.toLowerCase()).toEqual('div')
  expect(focusable[3].tagName.toLowerCase()).toEqual('button')
  expect(focusable[4].tagName.toLowerCase()).toEqual('input')
  expect(focusable[5].tagName.toLowerCase()).toEqual('textarea')
})

it('Should ignore hidden elements if strict', async () => {
  const {container} = render(
    <div>
      <button>Apple</button>
      <button style={{visibility: 'hidden'}}>Banana</button>
      <button style={{display: 'none'}}>Watermelon</button>
      <div style={{visibility: 'hidden'}}>
        <div>
          <button>Cherry</button>
        </div>
      </div>
      <div style={{display: 'none'}}>
        <div>
          <button>Peach</button>
        </div>
      </div>
      <button tabIndex={-1}>Cantaloupe</button>
    </div>,
  )
  const focusable = Array.from(iterateFocusableElements(container as HTMLElement, {strict: true}))
  expect(focusable.length).toEqual(2)
  expect(focusable[0].tagName.toLowerCase()).toEqual('button')
  expect(focusable[0].textContent).toEqual('Apple')
  expect(focusable[1].tagName.toLowerCase()).toEqual('button')
  expect(focusable[1].textContent).toEqual('Cantaloupe')
})

describe('isFocusable', () => {
  it('checks if element is focusable', async () => {
    const {container} = render(<button>Apple</button>)
    const focusable = isFocusable(container.firstChild as HTMLElement)
    expect(focusable).toBeTruthy()
  })

  it('disabled attr is not focusable', async () => {
    const {container} = render(<button disabled>Apple</button>)
    const focusable = isFocusable(container.firstChild as HTMLElement)
    expect(focusable).toBeFalsy()
  })

  it('hidden attr is not focusable', async () => {
    const {container} = render(<button hidden>Apple</button>)
    const focusable = isFocusable(container.firstChild as HTMLElement)
    expect(focusable).toBeFalsy()
  })

  it('tabIndex -1 is still focusable', async () => {
    const {container} = render(<button tabIndex={-1}>Apple</button>)
    const focusable = isFocusable(container.firstChild as HTMLElement)
    expect(focusable).toBeTruthy()
  })

  it('contenteditable is focusable', async () => {
    const {container} = render(<blockquote contentEditable></blockquote>)
    const focusable = isFocusable(container.firstChild as HTMLElement)
    expect(focusable).toBeTruthy()
  })

  it('anchor with no href is not focusable', async () => {
    const {container} = render(<a>Apple</a>)
    const focusable = isFocusable(container.firstChild as HTMLElement)
    expect(focusable).toBeFalsy()
  })

  it('reflow attrributes is focusable', async () => {
    const {container} = render(
      <button style={{display: 'none', visibility: 'hidden', width: 0, height: 0}}>Apple</button>,
    )
    const focusable = isFocusable(container.firstChild as HTMLElement)
    expect(focusable).toBeTruthy()
  })

  it('reflow attributes are not be focusable when strict', async () => {
    const {container} = render(
      <button style={{display: 'none', visibility: 'hidden', width: 0, height: 0}}>Apple</button>,
    )
    const focusable = isFocusable(container.firstChild as HTMLElement, true)
    expect(focusable).toBeFalsy()
  })

  it('position: fixed elements are focusable in strict mode', async () => {
    const {container} = render(<button style={{position: 'fixed', top: 0, left: 0}}>Fixed Button</button>)
    const focusable = isFocusable(container.firstChild as HTMLElement, true)
    expect(focusable).toBeTruthy()
  })

  it('position: sticky elements are focusable in strict mode', async () => {
    const {container} = render(<button style={{position: 'sticky', top: 0}}>Sticky Button</button>)
    const focusable = isFocusable(container.firstChild as HTMLElement, true)
    expect(focusable).toBeTruthy()
  })
})

describe('isTabbable', () => {
  it('tabIndex 0 is tabbable', async () => {
    const {container} = render(<button tabIndex={0}>Apple</button>)
    const tabbable = isTabbable(container.firstChild as HTMLElement)
    expect(tabbable).toBeTruthy()
  })

  it('tabIndex -1 is not tabbable', async () => {
    const {container} = render(<button tabIndex={-1}>Apple</button>)
    const tabbable = isTabbable(container.firstChild as HTMLElement)
    expect(tabbable).toBeFalsy()
  })

  it('Should not be tabbable when strict', async () => {
    const {container} = render(<button style={{display: 'none'}}>Apple</button>)
    const tabbable = isTabbable(container.firstChild as HTMLElement, true)
    expect(tabbable).toBeFalsy()
  })
})
