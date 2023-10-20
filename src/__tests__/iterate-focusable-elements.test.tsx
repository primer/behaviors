import React from 'react'
import {iterateFocusableElements} from '../utils/iterate-focusable-elements.js'
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

          if (this.style?.position?.toLowerCase() === 'fixed') {
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
          Not focusable
        </a>
        <a href="#yah">Focusable</a>
      </div>
    </div>,
  )

  const focusable = Array.from(iterateFocusableElements(container as HTMLElement, {onlyTabbable: true}))
  expect(focusable.length).toEqual(5)
  expect(focusable[0].tagName.toLowerCase()).toEqual('textarea')
  expect(focusable[1].tagName.toLowerCase()).toEqual('input')
  expect(focusable[2].tagName.toLowerCase()).toEqual('button')
  expect(focusable[3].tagName.toLowerCase()).toEqual('div')
  expect(focusable[4].tagName.toLowerCase()).toEqual('a')
  expect(focusable[4].getAttribute('href')).toEqual('#yah')
})

it('Should iterate through focusable elements in reverse', () => {
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
    </div>,
  )

  const focusable = Array.from(iterateFocusableElements(container as HTMLElement, {reverse: true, onlyTabbable: true}))
  expect(focusable.length).toEqual(5)
  expect(focusable[0].tagName.toLowerCase()).toEqual('a')
  expect(focusable[0].getAttribute('href')).toEqual('#yah')
  expect(focusable[1].tagName.toLowerCase()).toEqual('div')
  expect(focusable[2].tagName.toLowerCase()).toEqual('button')
  expect(focusable[3].tagName.toLowerCase()).toEqual('input')
  expect(focusable[4].tagName.toLowerCase()).toEqual('textarea')
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
