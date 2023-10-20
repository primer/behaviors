import {FocusKeys, FocusZoneSettings, focusZone} from '../focus-zone.js'
import {fireEvent, render} from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'

async function nextTick() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

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

it('Should allow arrow keys to move focus', async () => {
  const user = userEvent.setup()
  const {container} = render(
    <div>
      <button tabIndex={0}>Bad Apple</button>
      <div id="focusZone">
        <button tabIndex={0}>Apple</button>
        <button tabIndex={0}>Banana</button>
        <button tabIndex={0}>Cantaloupe</button>
      </div>
    </div>,
  )

  const focusZoneContainer = container.querySelector<HTMLElement>('#focusZone')!
  const [firstButton, secondButton] = focusZoneContainer.querySelectorAll('button')
  const controller = focusZone(focusZoneContainer)

  firstButton.focus()
  expect(document.activeElement).toEqual(firstButton)

  await user.keyboard('{arrowdown}')
  expect(document.activeElement).toEqual(secondButton)

  controller.abort()
})

it('Should have one tab-stop inside the focus zone when enabled', async () => {
  const user = userEvent.setup()
  const {container} = render(
    <div>
      <button tabIndex={0}>Bad Apple</button>
      <div id="focusZone">
        <button tabIndex={0}>Apple</button>
        <button tabIndex={0}>Banana</button>
        <button tabIndex={0}>Cantaloupe</button>
      </div>
      <button tabIndex={0}>Next Apple</button>
    </div>,
  )

  const focusZoneContainer = container.querySelector<HTMLElement>('#focusZone')!
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [one, two, three, four, five] = container.querySelectorAll('button')
  const controller = focusZone(focusZoneContainer)

  one.focus()
  await user.tab()
  await user.tab()
  expect(document.activeElement).toEqual(five)

  controller.abort()
  one.focus()
  await user.tab()
  await user.tab()
  expect(document.activeElement).toEqual(three)

  controller.abort()
})

it('Should prevent moving focus outside the zone', async () => {
  const user = userEvent.setup()
  const {container} = render(
    <div>
      <button tabIndex={0}>Bad Apple</button>
      <div id="focusZone">
        <button tabIndex={0}>Apple</button>
        <button tabIndex={0}>Banana</button>
        <button tabIndex={0}>Cantaloupe</button>
      </div>
    </div>,
  )

  const focusZoneContainer = container.querySelector<HTMLElement>('#focusZone')!
  const [firstButton, secondButton, thirdButton] = focusZoneContainer.querySelectorAll('button')!
  const controller = focusZone(focusZoneContainer)

  firstButton.focus()
  expect(document.activeElement).toEqual(firstButton)

  await user.keyboard('{arrowup}')
  expect(document.activeElement).toEqual(firstButton)

  await user.keyboard('{arrowdown}')
  expect(document.activeElement).toEqual(secondButton)

  await user.keyboard('{arrowdown}')
  expect(document.activeElement).toEqual(thirdButton)

  await user.keyboard('{arrowdown}')
  expect(document.activeElement).toEqual(thirdButton)

  controller.abort()
})

it('Should do focus wrapping correctly', async () => {
  const user = userEvent.setup()
  const {container} = render(
    <div>
      <button tabIndex={0}>Bad Apple</button>
      <div id="focusZone">
        <button tabIndex={0}>Apple</button>
        <button tabIndex={0}>Banana</button>
        <button tabIndex={0}>Cantaloupe</button>
      </div>
    </div>,
  )

  const focusZoneContainer = container.querySelector<HTMLElement>('#focusZone')!
  const [firstButton, secondButton, thirdButton] = focusZoneContainer.querySelectorAll('button')!
  const controller = focusZone(focusZoneContainer, {focusOutBehavior: 'wrap'})

  firstButton.focus()
  expect(document.activeElement).toEqual(firstButton)

  await user.keyboard('{arrowup}')
  expect(document.activeElement).toEqual(thirdButton)

  await user.keyboard('{arrowup}')
  expect(document.activeElement).toEqual(secondButton)

  await user.keyboard('{arrowdown}')
  expect(document.activeElement).toEqual(thirdButton)

  await user.keyboard('{arrowdown}')
  expect(document.activeElement).toEqual(firstButton)

  controller.abort()
})

it('Should call custom getNextFocusable callback', async () => {
  const user = userEvent.setup()
  const {container} = render(
    <div>
      <button tabIndex={0}>Bad Apple</button>
      <div id="focusZone">
        <button tabIndex={0}>Apple</button>
        <button tabIndex={0}>Banana</button>
        <button tabIndex={0}>Cantaloupe</button>
      </div>
    </div>,
  )

  const focusZoneContainer = container.querySelector<HTMLElement>('#focusZone')!
  const [firstButton, secondButton] = focusZoneContainer.querySelectorAll('button')!
  const getNextFocusableCallback = jest.fn()
  const controller = focusZone(focusZoneContainer, {getNextFocusable: getNextFocusableCallback})

  firstButton.focus()
  expect(document.activeElement).toEqual(firstButton)

  await user.keyboard('{arrowdown}')
  expect(getNextFocusableCallback).toHaveBeenCalledWith('next', firstButton, expect.anything())

  await user.keyboard('{home}')
  expect(getNextFocusableCallback).toHaveBeenCalledWith('start', secondButton, expect.anything())

  controller.abort()
})

it('Should focus-in to the most recently-focused element', async () => {
  const user = userEvent.setup()
  const {container} = render(
    <div>
      <button tabIndex={0} id="outside">
        Bad Apple
      </button>
      <div id="focusZone">
        <button tabIndex={0}>Apple</button>
        <button tabIndex={0}>Banana</button>
        <button tabIndex={0}>Cantaloupe</button>
      </div>
    </div>,
  )

  const focusZoneContainer = container.querySelector<HTMLElement>('#focusZone')!
  const outsideButton = container.querySelector<HTMLElement>('#outside')!
  const [firstButton, secondButton] = focusZoneContainer.querySelectorAll('button')!
  const controller = focusZone(focusZoneContainer)

  firstButton.focus()
  expect(document.activeElement).toEqual(firstButton)

  await user.keyboard('{arrowdown}')
  expect(document.activeElement).toEqual(secondButton)

  outsideButton.focus()
  await user.tab()

  expect(document.activeElement).toEqual(secondButton)

  controller.abort()
})

it('Should focus-in to the first element when focusInStrategy is "first"', async () => {
  const user = userEvent.setup()
  const {container} = render(
    <div>
      <button tabIndex={0} id="outside">
        Bad Apple
      </button>
      <div id="focusZone">
        <button tabIndex={0}>Apple</button>
        <button tabIndex={0}>Banana</button>
        <button tabIndex={0}>Cantaloupe</button>
      </div>
    </div>,
  )

  const focusZoneContainer = container.querySelector<HTMLElement>('#focusZone')!
  const outsideButton = container.querySelector<HTMLElement>('#outside')!
  const [firstButton, secondButton] = focusZoneContainer.querySelectorAll('button')!
  const controller = focusZone(focusZoneContainer, {focusInStrategy: 'first'})

  firstButton.focus()
  expect(document.activeElement).toEqual(firstButton)

  await user.keyboard('{arrowdown}')
  expect(document.activeElement).toEqual(secondButton)

  outsideButton.focus()
  await user.tab()

  expect(document.activeElement).toEqual(firstButton)

  controller.abort()
})

it('Should focus-in to the closest element when focusInStrategy is "closest"', async () => {
  const user = userEvent.setup()
  const {container} = render(
    <div>
      <button tabIndex={0} id="outsideBefore">
        Bad Apple
      </button>
      <div id="focusZone">
        <button id="apple" tabIndex={0}>
          Apple
        </button>
        <button id="banana" tabIndex={0}>
          Banana
        </button>
        <button id="cantaloupe" tabIndex={0}>
          Cantaloupe
        </button>
      </div>
      <button tabIndex={0} id="outsideAfter">
        Good Apple
      </button>
    </div>,
  )

  const focusZoneContainer = container.querySelector<HTMLElement>('#focusZone')!
  const outsideBefore = container.querySelector<HTMLElement>('#outsideBefore')!
  const outsideAfter = container.querySelector<HTMLElement>('#outsideAfter')!
  const [firstButton, secondButton, thirdButton] = focusZoneContainer.querySelectorAll('button')
  const controller = focusZone(focusZoneContainer, {focusInStrategy: 'closest'})

  firstButton.focus()
  expect(document.activeElement).toEqual(firstButton)

  await user.keyboard('{arrowdown}')
  expect(document.activeElement).toEqual(secondButton)

  outsideBefore.focus()
  await user.tab()

  expect(document.activeElement).toEqual(firstButton)

  outsideAfter.focus()
  await user.tab({shift: true})

  expect(document.activeElement).toEqual(thirdButton)

  controller.abort()
})

it('Should call the custom focusInStrategy callback', async () => {
  const user = userEvent.setup()
  const {container} = render(
    <div>
      <button tabIndex={0} id="outside">
        Bad Apple
      </button>
      <div id="focusZone">
        <button tabIndex={0}>Apple</button>
        <button tabIndex={0}>Banana</button>
        <button tabIndex={0}>Cantaloupe</button>
      </div>
    </div>,
  )

  const focusZoneContainer = container.querySelector<HTMLElement>('#focusZone')!
  const outsideButton = container.querySelector<HTMLElement>('#outside')!
  const [firstButton, secondButton] = focusZoneContainer.querySelectorAll('button')
  const focusInCallback = jest.fn().mockReturnValue(secondButton)
  const controller = focusZone(focusZoneContainer, {focusInStrategy: focusInCallback})

  expect(firstButton.getAttribute('tabindex')).toEqual('-1')
  expect(secondButton.getAttribute('tabindex')).toEqual('0')

  outsideButton.focus()
  await user.tab()
  expect(focusInCallback).toHaveBeenCalledWith<[HTMLElement]>(outsideButton)
  expect(document.activeElement).toEqual(secondButton)

  controller.abort()
})

it('Should respect inputs by not moving focus if key would have some other effect', async () => {
  const user = userEvent.setup()
  const {container} = render(
    <div>
      <button tabIndex={0} id="outside">
        Bad Apple
      </button>
      <div id="focusZone">
        <button tabIndex={0}>Apple</button>
        <input type="text" defaultValue="Banana" tabIndex={0} />
        <button tabIndex={0}>Cantaloupe</button>
      </div>
    </div>,
  )

  const focusZoneContainer = container.querySelector<HTMLElement>('#focusZone')!
  const [firstButton, secondButton] = focusZoneContainer.querySelectorAll('button')!
  const input = focusZoneContainer.querySelector<HTMLElement>('input')!
  const controller = focusZone(focusZoneContainer, {bindKeys: FocusKeys.ArrowHorizontal | FocusKeys.HomeAndEnd})

  firstButton.focus()

  await user.keyboard('{arrowright}')
  expect(document.activeElement).toEqual(input)

  await user.keyboard('{arrowleft}')
  expect(document.activeElement).toEqual(input)

  await user.keyboard('{arrowright}')
  expect(document.activeElement).toEqual(input)

  await user.keyboard('{arrowright}')
  expect(document.activeElement).toEqual(secondButton)

  controller.abort()
})

it('Should focus-in to the first element if the last-focused element is removed', async () => {
  const user = userEvent.setup()
  const {container} = render(
    <div>
      <button tabIndex={0} id="outside">
        Bad Apple
      </button>
      <div id="focusZone">
        <button tabIndex={0}>Apple</button>
        <button tabIndex={0}>Banana</button>
        <button tabIndex={0}>Cantaloupe</button>
      </div>
    </div>,
  )

  const focusZoneContainer = container.querySelector<HTMLElement>('#focusZone')!
  const [firstButton, secondButton, thirdButton] = focusZoneContainer.querySelectorAll('button')
  const outsideButton = container.querySelector<HTMLElement>('#outside')!
  const controller = focusZone(focusZoneContainer)

  firstButton.focus()
  await user.keyboard('{arrowdown}')
  expect(document.activeElement).toEqual(secondButton)

  outsideButton.focus()
  focusZoneContainer.removeChild(secondButton)

  // The mutation observer fires asynchronously
  await nextTick()

  await user.tab()
  expect(document.activeElement).toEqual(firstButton)

  await user.keyboard('{arrowdown}')
  expect(document.activeElement).toEqual(thirdButton)

  controller.abort()
})

it('Should call onActiveDescendantChanged properly', async () => {
  const user = userEvent.setup()
  const {container} = render(
    <div>
      <button tabIndex={0} id="outside">
        Bad Apple
      </button>
      <input id="control" defaultValue="control input" tabIndex={0} />
      <div id="focusZone">
        <button tabIndex={0}>Apple</button>
        <button tabIndex={0}>Banana</button>
        <button tabIndex={0}>Cantaloupe</button>
      </div>
    </div>,
  )

  const focusZoneContainer = container.querySelector<HTMLElement>('#focusZone')!
  const [firstButton, secondButton] = focusZoneContainer.querySelectorAll('button')!
  const control = container.querySelector<HTMLElement>('#control')!
  const activeDescendantChangedCallback = jest.fn()
  const controller = focusZone(focusZoneContainer, {
    activeDescendantControl: control,
    onActiveDescendantChanged: activeDescendantChangedCallback,
  })
  type ActiveDescendantChangedCallbackParameters = Parameters<
    Exclude<FocusZoneSettings['onActiveDescendantChanged'], undefined>
  >

  control.focus()
  expect(activeDescendantChangedCallback).toHaveBeenLastCalledWith<ActiveDescendantChangedCallbackParameters>(
    firstButton,
    undefined,
    false,
  )
  await user.keyboard('{arrowdown}')
  expect(activeDescendantChangedCallback).toHaveBeenLastCalledWith<ActiveDescendantChangedCallbackParameters>(
    secondButton,
    firstButton,
    true,
  )
  await user.keyboard('{arrowup}')
  expect(activeDescendantChangedCallback).toHaveBeenLastCalledWith<ActiveDescendantChangedCallbackParameters>(
    firstButton,
    secondButton,
    true,
  )
  fireEvent.mouseMove(secondButton)
  expect(activeDescendantChangedCallback).toHaveBeenLastCalledWith<ActiveDescendantChangedCallbackParameters>(
    secondButton,
    firstButton,
    false,
  )
  await user.keyboard('{arrowup}')
  expect(activeDescendantChangedCallback).toHaveBeenLastCalledWith<ActiveDescendantChangedCallbackParameters>(
    firstButton,
    secondButton,
    true,
  )
  await user.keyboard('{arrowUp}')
  expect(activeDescendantChangedCallback).toHaveBeenLastCalledWith<ActiveDescendantChangedCallbackParameters>(
    firstButton,
    firstButton,
    true,
  )
  activeDescendantChangedCallback.mockReset()
  fireEvent.mouseMove(firstButton)
  expect(activeDescendantChangedCallback).not.toBeCalled()

  controller.abort()
})

it('Should set aria-activedescendant correctly', async () => {
  const user = userEvent.setup()
  const {container} = render(
    <div>
      <button tabIndex={0} id="outside">
        Bad Apple
      </button>
      <input id="control" defaultValue="control input" tabIndex={0} />
      <div id="focusZone">
        <button tabIndex={0}>Apple</button>
        <button tabIndex={0}>Banana</button>
        <button tabIndex={0}>Cantaloupe</button>
      </div>
    </div>,
  )

  const focusZoneContainer = container.querySelector<HTMLElement>('#focusZone')!
  const [firstButton, secondButton] = focusZoneContainer.querySelectorAll('button')
  const outsideButton = container.querySelector<HTMLElement>('#outside')!
  const control = container.querySelector<HTMLElement>('#control')!
  const controller = focusZone(focusZoneContainer, {activeDescendantControl: control})

  control.focus()
  expect(control.getAttribute('aria-activedescendant')).toEqual(firstButton.id)
  await user.keyboard('{arrowdown}')
  expect(control.getAttribute('aria-activedescendant')).toEqual(secondButton.id)
  await user.keyboard('{arrowup}')
  expect(control.getAttribute('aria-activedescendant')).toEqual(firstButton.id)
  expect(document.activeElement).toEqual(control)
  await user.keyboard('{arrowup}')
  expect(control.getAttribute('aria-activedescendant')).toEqual(firstButton.id)
  outsideButton.focus()
  expect(control.hasAttribute('aria-activedescendant')).toBeFalsy()

  controller.abort()
})

it('Should handle elements being reordered', async () => {
  const user = userEvent.setup()
  const {container} = render(
    <div>
      <div id="focusZone">
        <button tabIndex={0}>Apple</button>
        <button tabIndex={0}>Banana</button>
        <button tabIndex={0}>Cantaloupe</button>
        <button tabIndex={0}>Durian</button>
      </div>
    </div>,
  )

  const focusZoneContainer = container.querySelector<HTMLElement>('#focusZone')!
  const [firstButton, secondButton, thirdButton, fourthButton] = focusZoneContainer.querySelectorAll('button')

  const controller = focusZone(focusZoneContainer)

  firstButton.focus()
  expect(document.activeElement).toEqual(firstButton)

  const moveDown = () => user.type(document.activeElement!, '{arrowdown}')
  const moveUp = () => user.type(document.activeElement!, '{arrowup}')

  await moveDown()
  expect(document.activeElement).toEqual(secondButton)

  await moveUp()
  expect(document.activeElement).toEqual(firstButton)

  // move secondButton and thirdButton to the end of the zone, in reverse order
  focusZoneContainer.appendChild(thirdButton)
  focusZoneContainer.appendChild(secondButton)

  // The mutation observer fires asynchronously
  await nextTick()

  expect(document.activeElement).toEqual(firstButton)

  await moveDown()
  expect(document.activeElement).toEqual(fourthButton)

  await moveDown()
  expect(document.activeElement).toEqual(thirdButton)

  await moveDown()
  expect(document.activeElement).toEqual(secondButton)

  controller.abort()
})

it('Should ignore hidden elements if strict', async () => {
  const user = userEvent.setup()
  const {container} = render(
    <div id="focusZone">
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
  const focusZoneContainer = container.querySelector<HTMLElement>('#focusZone')!
  const allButtons = focusZoneContainer.querySelectorAll('button')
  const firstButton = allButtons[0]
  const lastButton = allButtons[allButtons.length - 1]
  const controller = focusZone(focusZoneContainer, {strict: true})

  firstButton.focus()
  expect(document.activeElement).toEqual(firstButton)

  await user.keyboard('{arrowdown}')
  expect(document.activeElement).toEqual(lastButton)

  controller.abort()
})

it('Shoud move to tabbable elements if onlyTabbable', async () => {
  const user = userEvent.setup()
  const {container} = render(
    <div id="focusZone">
      <button>Apple</button>
      <button tabIndex={-1}>Cherry</button>
      <button tabIndex={0}>Cantaloupe</button>
    </div>,
  )

  const focusZoneContainer = container.querySelector<HTMLElement>('#focusZone')!
  const allButtons = focusZoneContainer.querySelectorAll('button')
  const firstButton = allButtons[0]
  const lastButton = allButtons[allButtons.length - 1]
  const controller = focusZone(focusZoneContainer, {onlyTabbable: true})

  firstButton.focus()
  expect(document.activeElement).toEqual(firstButton)

  await user.keyboard('{arrowdown}')
  expect(document.activeElement).toEqual(lastButton)

  controller.abort()
})
