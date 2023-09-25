import {FocusKeys, FocusZoneSettings, focusZone} from '../focus-zone.js'
import {fireEvent, render} from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'

async function nextTick() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

const moveDown = () => userEvent.type(document.activeElement!, '{arrowdown}')
const moveUp = () => userEvent.type(document.activeElement!, '{arrowup}')

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
    })
  } catch {
    // ignore
  }
})

it('Should allow arrow keys to move focus', () => {
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

  userEvent.type(firstButton, '{arrowdown}')
  expect(document.activeElement).toEqual(secondButton)

  controller.abort()
})

it('Should have one tab-stop inside the focus zone when enabled', () => {
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
  userEvent.tab()
  userEvent.tab()
  expect(document.activeElement).toEqual(five)

  controller.abort()
  one.focus()
  userEvent.tab()
  userEvent.tab()
  expect(document.activeElement).toEqual(three)

  controller.abort()
})

it('Should prevent moving focus outside the zone', () => {
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

  userEvent.type(firstButton, '{arrowup}')
  expect(document.activeElement).toEqual(firstButton)

  userEvent.type(firstButton, '{arrowdown}')
  expect(document.activeElement).toEqual(secondButton)

  userEvent.type(secondButton, '{arrowdown}')
  expect(document.activeElement).toEqual(thirdButton)

  userEvent.type(thirdButton, '{arrowdown}')
  expect(document.activeElement).toEqual(thirdButton)

  controller.abort()
})

it('Should do focus wrapping correctly', () => {
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

  userEvent.type(firstButton, '{arrowup}')
  expect(document.activeElement).toEqual(thirdButton)

  userEvent.type(thirdButton, '{arrowup}')
  expect(document.activeElement).toEqual(secondButton)

  userEvent.type(secondButton, '{arrowdown}')
  expect(document.activeElement).toEqual(thirdButton)

  userEvent.type(thirdButton, '{arrowdown}')
  expect(document.activeElement).toEqual(firstButton)

  controller.abort()
})

it('Should call custom getNextFocusable callback', () => {
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

  userEvent.type(firstButton, '{arrowdown}')
  expect(getNextFocusableCallback).toHaveBeenCalledWith('next', firstButton, expect.anything())

  userEvent.type(secondButton, '{home}')
  expect(getNextFocusableCallback).toHaveBeenCalledWith('start', secondButton, expect.anything())

  controller.abort()
})

it('Should focus-in to the most recently-focused element', () => {
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

  userEvent.type(firstButton, '{arrowdown}')
  expect(document.activeElement).toEqual(secondButton)

  outsideButton.focus()
  userEvent.tab()

  expect(document.activeElement).toEqual(secondButton)

  controller.abort()
})

it('Should focus-in to the first element when focusInStrategy is "first"', () => {
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

  userEvent.type(firstButton, '{arrowdown}')
  expect(document.activeElement).toEqual(secondButton)

  outsideButton.focus()
  userEvent.tab()

  expect(document.activeElement).toEqual(firstButton)

  controller.abort()
})

it('Should focus-in to the closest element when focusInStrategy is "closest"', () => {
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

  userEvent.type(firstButton, '{arrowdown}')
  expect(document.activeElement).toEqual(secondButton)

  outsideBefore.focus()
  userEvent.tab()

  expect(document.activeElement).toEqual(firstButton)

  outsideAfter.focus()
  userEvent.tab({shift: true})

  expect(document.activeElement).toEqual(thirdButton)

  controller.abort()
})

it('Should call the custom focusInStrategy callback', () => {
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
  userEvent.tab()
  expect(focusInCallback).toHaveBeenCalledWith<[HTMLElement]>(outsideButton)
  expect(document.activeElement).toEqual(secondButton)

  controller.abort()
})

it('Should respect inputs by not moving focus if key would have some other effect', () => {
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
  userEvent.type(firstButton, '{arrowright}')
  expect(document.activeElement).toEqual(input)
  userEvent.type(input, '{arrowleft}')
  expect(document.activeElement).toEqual(input)
  userEvent.type(input, '{arrowright}')
  expect(document.activeElement).toEqual(input)
  userEvent.type(input, '{arrowright}')
  expect(document.activeElement).toEqual(secondButton)

  controller.abort()
})

it('Should focus-in to the first element if the last-focused element is removed', async () => {
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
  userEvent.type(firstButton, '{arrowdown}')
  expect(document.activeElement).toEqual(secondButton)

  outsideButton.focus()
  focusZoneContainer.removeChild(secondButton)

  // The mutation observer fires asynchronously
  await nextTick()

  userEvent.tab()
  expect(document.activeElement).toEqual(firstButton)

  userEvent.type(firstButton, '{arrowdown}')
  expect(document.activeElement).toEqual(thirdButton)

  controller.abort()
})

it('Should call onActiveDescendantChanged properly', () => {
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
  userEvent.type(control, '{arrowdown}')
  expect(activeDescendantChangedCallback).toHaveBeenLastCalledWith<ActiveDescendantChangedCallbackParameters>(
    secondButton,
    firstButton,
    true,
  )
  userEvent.type(control, '{arrowup}')
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
  userEvent.type(control, '{arrowup}')
  expect(activeDescendantChangedCallback).toHaveBeenLastCalledWith<ActiveDescendantChangedCallbackParameters>(
    firstButton,
    secondButton,
    true,
  )
  userEvent.type(control, '{arrowUp}')
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

it('Should set aria-activedescendant correctly', () => {
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
  userEvent.type(control, '{arrowdown}')
  expect(control.getAttribute('aria-activedescendant')).toEqual(secondButton.id)
  userEvent.type(control, '{arrowup}')
  expect(control.getAttribute('aria-activedescendant')).toEqual(firstButton.id)
  expect(document.activeElement).toEqual(control)
  userEvent.type(control, '{arrowup}')
  expect(control.getAttribute('aria-activedescendant')).toEqual(firstButton.id)
  outsideButton.focus()
  expect(control.hasAttribute('aria-activedescendant')).toBeFalsy()

  controller.abort()
})

it('Should handle elements being reordered', async () => {
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

  moveDown()
  expect(document.activeElement).toEqual(secondButton)

  moveUp()
  expect(document.activeElement).toEqual(firstButton)

  // move secondButton and thirdButton to the end of the zone, in reverse order
  focusZoneContainer.appendChild(thirdButton)
  focusZoneContainer.appendChild(secondButton)

  // The mutation observer fires asynchronously
  await nextTick()

  expect(document.activeElement).toEqual(firstButton)

  moveDown()
  expect(document.activeElement).toEqual(fourthButton)

  moveDown()
  expect(document.activeElement).toEqual(thirdButton)

  moveDown()
  expect(document.activeElement).toEqual(secondButton)

  controller.abort()
})
