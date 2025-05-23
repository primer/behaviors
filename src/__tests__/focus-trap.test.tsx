import React from 'react'
import {focusTrap} from '../focus-trap.js'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Since we use strict `isTabbable` checks within focus trap, we need to mock these
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

it('Should initially focus the first element when activated', () => {
  const {container} = render(
    <div>
      <button tabIndex={0}>Bad Apple</button>
      <div id="trapContainer">
        <button tabIndex={0}>Apple</button>
        <button tabIndex={0}>Banana</button>
        <button tabIndex={0}>Cantaloupe</button>
      </div>
    </div>,
  )

  const trapContainer = container.querySelector<HTMLElement>('#trapContainer')!
  const firstButton = trapContainer.querySelector('button')!
  const controller = focusTrap(trapContainer)
  expect(document.activeElement).toEqual(firstButton)

  controller?.abort()
})

it('Should initially focus the initialFocus element when specified', () => {
  const {container} = render(
    <div id="trapContainer">
      <button tabIndex={0}>Apple</button>
      <button tabIndex={0}>Banana</button>
      <button tabIndex={0}>Cantaloupe</button>
    </div>,
  )

  const trapContainer = container.querySelector<HTMLElement>('#trapContainer')!
  const secondButton = trapContainer.querySelectorAll('button')[1]
  const controller = focusTrap(trapContainer, secondButton)
  expect(document.activeElement).toEqual(secondButton)

  controller?.abort()
})

it('Should prevent focus from exiting the trap, returns focus to first element', async () => {
  const user = userEvent.setup()
  const {container} = render(
    <div>
      <div id="trapContainer">
        <button tabIndex={0}>Apple</button>
        <button tabIndex={0}>Banana</button>
        <button tabIndex={0}>Cantaloupe</button>
      </div>
      <button id="durian" tabIndex={0}>
        Durian
      </button>
    </div>,
  )

  const trapContainer = container.querySelector<HTMLElement>('#trapContainer')!
  const durianButton = container.querySelector<HTMLElement>('#durian')!
  const firstButton = trapContainer.querySelector('button')!
  const lastButton = trapContainer.querySelectorAll('button')[2]

  const controller = focusTrap(trapContainer)

  lastButton.focus()
  await user.tab()
  expect(document.activeElement).toEqual(firstButton)

  controller?.abort()

  lastButton.focus()
  await user.tab()
  expect(document.activeElement).toEqual(durianButton)
})

it('Should raise an error if there are no focusable children', async () => {
  // TODO: Having a focus trap with no focusable children is not good for accessibility.
})

it('Should cycle focus from last element to first element and vice-versa', async () => {
  const user = userEvent.setup()
  const {container} = render(
    <div>
      <div id="trapContainer">
        <button tabIndex={0}>Apple</button>
        <button tabIndex={0}>Banana</button>
        <button tabIndex={0}>Cantaloupe</button>
      </div>
      <button id="durian" tabIndex={0}>
        Durian
      </button>
    </div>,
  )

  const trapContainer = container.querySelector<HTMLElement>('#trapContainer')!
  const firstButton = trapContainer.querySelector('button')!
  const lastButton = trapContainer.querySelectorAll('button')[2]

  const controller = focusTrap(trapContainer)

  lastButton.focus()
  await user.tab()
  expect(document.activeElement).toEqual(firstButton)

  await user.tab({shift: true})
  expect(document.activeElement).toEqual(lastButton)

  controller?.abort()
})

it('Should should release the trap when the signal is aborted', async () => {
  const user = userEvent.setup()
  const {container} = render(
    <div>
      <div id="trapContainer">
        <button tabIndex={0}>Apple</button>
        <button tabIndex={0}>Banana</button>
        <button tabIndex={0}>Cantaloupe</button>
      </div>
      <button id="durian" tabIndex={0}>
        Durian
      </button>
    </div>,
  )

  const trapContainer = container.querySelector<HTMLElement>('#trapContainer')!
  const durianButton = container.querySelector<HTMLElement>('#durian')!
  const firstButton = trapContainer.querySelector('button')!
  const lastButton = trapContainer.querySelectorAll('button')[2]

  const controller = focusTrap(trapContainer)

  lastButton.focus()
  await user.tab()
  expect(document.activeElement).toEqual(firstButton)

  controller?.abort()

  lastButton.focus()
  await user.tab()
  expect(document.activeElement).toEqual(durianButton)
})

it('Should should release the trap when the container is removed from the DOM', async () => {
  const {container} = render(
    <div>
      <div id="trapContainer">
        <button tabIndex={0}>Apple</button>
      </div>
      <button id="durian" tabIndex={0}>
        Durian
      </button>
    </div>,
  )

  const trapContainer = container.querySelector<HTMLElement>('#trapContainer')!
  const durianButton = container.querySelector<HTMLElement>('#durian')!
  const firstButton = trapContainer.querySelector('button')!

  focusTrap(trapContainer)

  durianButton.focus()
  expect(document.activeElement).toEqual(firstButton)

  // empty trap and remove it from the DOM
  trapContainer.removeChild(firstButton)
  trapContainer.parentElement?.removeChild(trapContainer)

  durianButton.focus()
  expect(document.activeElement).toEqual(durianButton)
})

it('Should handle dynamic content', async () => {
  const user = userEvent.setup()
  const {container} = render(
    <div>
      <div id="trapContainer">
        <button tabIndex={0}>Apple</button>
        <button tabIndex={0}>Banana</button>
        <button tabIndex={0}>Cantaloupe</button>
      </div>
      <button id="durian" tabIndex={0}>
        Durian
      </button>
    </div>,
  )

  const trapContainer = container.querySelector<HTMLElement>('#trapContainer')!
  const [firstButton, secondButton, thirdButton] = trapContainer.querySelectorAll('button')

  const controller = focusTrap(trapContainer)

  secondButton.focus()
  trapContainer.removeChild(thirdButton)
  await user.tab()
  expect(document.activeElement).toEqual(firstButton)

  await user.tab({shift: true})
  expect(document.activeElement).toEqual(secondButton)

  controller?.abort()
})

it('should keep the sentinel elements at the start/end of the inner container', async () => {
  const user = userEvent.setup()
  const {container} = render(
    <div>
      <div id="trapContainer">
        <button tabIndex={0}>Apple</button>
        <button tabIndex={0}>Banana</button>
        <button tabIndex={0}>Cantaloupe</button>
      </div>
      <button id="durian" tabIndex={0}>
        Durian
      </button>
    </div>,
  )

  const trapContainer = container.querySelector<HTMLElement>('#trapContainer')!
  const [firstButton, secondButton] = trapContainer.querySelectorAll('button')
  const controller = focusTrap(trapContainer)

  secondButton.focus()
  await user.tab()
  await user.tab()
  expect(document.activeElement).toEqual(firstButton)

  trapContainer.insertAdjacentHTML('afterbegin', '<button id="first" tabindex="0">New first button</button>')
  const newFirstButton = trapContainer.querySelector('#first')

  const sentinelStart = trapContainer.querySelector('.sentinel')

  await user.tab({shift: true})
  expect(trapContainer.firstElementChild).toEqual(sentinelStart)
  expect(document.activeElement).toEqual(newFirstButton)

  trapContainer.insertAdjacentHTML('beforeend', '<button id="last" tabindex="0">New last button</button>')
  const newLastButton = trapContainer.querySelector('#last')

  const sentinelEnd = trapContainer.querySelector('.sentinel')

  await user.tab({shift: true})
  expect(trapContainer.lastElementChild).toEqual(sentinelEnd)
  expect(document.activeElement).toEqual(newLastButton)

  controller?.abort()
})

it('should remove the mutation observer when the focus trap is released', async () => {
  const user = userEvent.setup()
  const {container} = render(
    <div>
      <div id="trapContainer">
        <button tabIndex={0}>Apple</button>
        <button tabIndex={0}>Banana</button>
        <button tabIndex={0}>Cantaloupe</button>
      </div>
      <button id="durian" tabIndex={0}>
        Durian
      </button>
    </div>,
  )

  const trapContainer = container.querySelector<HTMLElement>('#trapContainer')!
  const [firstButton, secondButton] = trapContainer.querySelectorAll('button')
  const controller = focusTrap(trapContainer)

  secondButton.focus()
  await user.tab()
  await user.tab()
  expect(document.activeElement).toEqual(firstButton)

  trapContainer.insertAdjacentHTML('afterbegin', '<button id="first" tabindex="0">New first button</button>')
  const newFirstButton = trapContainer.querySelector('#first')

  const sentinelStart = trapContainer.querySelector('.sentinel')

  await user.tab({shift: true})
  expect(trapContainer.firstElementChild).toEqual(sentinelStart)
  expect(document.activeElement).toEqual(newFirstButton)

  controller?.abort()

  trapContainer.insertAdjacentHTML('beforeend', '<button id="last" tabindex="0">New last button</button>')
  const newLastButton = trapContainer.querySelector('#last')

  await user.tab({shift: true})
  expect(document.activeElement).not.toEqual(newLastButton)
  expect(trapContainer.lastElementChild).toEqual(newLastButton)
})

it('Should only have one set of sentinels', async () => {
  const {container} = render(
    <div>
      <div id="trapContainer">
        <button tabIndex={0}>Apple</button>
      </div>
      <button id="durian" tabIndex={0}>
        Durian
      </button>
    </div>,
  )

  const trapContainer = container.querySelector<HTMLElement>('#trapContainer')!
  const durianButton = container.querySelector<HTMLElement>('#durian')!
  const firstButton = trapContainer.querySelector('button')!

  focusTrap(trapContainer)

  durianButton.focus()
  expect(document.activeElement).toEqual(firstButton)

  trapContainer.insertAdjacentHTML(
    'afterbegin',
    '<div id="newTrapContainer"><button id="newFirst" tabindex="0">New first button</button></div>',
  )

  const newTrapContainer = trapContainer.querySelector<HTMLElement>('#newTrapContainer')!
  const newFirstButton = newTrapContainer.querySelector<HTMLElement>('#newFirst')!

  const controller = focusTrap(newTrapContainer)
  expect(document.activeElement).toEqual(newFirstButton)
  expect(document.querySelectorAll('.sentinel').length).toEqual(4)

  controller?.abort()

  trapContainer.removeChild(newTrapContainer)
  expect(document.querySelectorAll('.sentinel').length).toEqual(2)
})
