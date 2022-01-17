"use strict";

var _focusZone = require("../focus-zone.js");

var _react = require("@testing-library/react");

var _react2 = _interopRequireDefault(require("react"));

var _userEvent = _interopRequireDefault(require("@testing-library/user-event"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function nextTick() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

const moveDown = () => _userEvent.default.type(document.activeElement, '{arrowdown}');

const moveUp = () => _userEvent.default.type(document.activeElement, '{arrowup}'); // Since we use strict `isTabbable` checks within focus trap, we need to mock these
// properties that Jest does not populate.


beforeAll(() => {
  try {
    Object.defineProperties(HTMLElement.prototype, {
      offsetHeight: {
        get: () => 42
      },
      offsetWidth: {
        get: () => 42
      },
      getClientRects: {
        get: () => () => [42]
      }
    });
  } catch {// ignore
  }
});
it('Should allow arrow keys to move focus', () => {
  const {
    container
  } = (0, _react.render)( /*#__PURE__*/_react2.default.createElement("div", null, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Bad Apple"), /*#__PURE__*/_react2.default.createElement("div", {
    id: "focusZone"
  }, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Apple"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Banana"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Cantaloupe"))));
  const focusZoneContainer = container.querySelector('#focusZone');
  const [firstButton, secondButton] = focusZoneContainer.querySelectorAll('button');
  const controller = (0, _focusZone.focusZone)(focusZoneContainer);
  firstButton.focus();
  expect(document.activeElement).toEqual(firstButton);

  _userEvent.default.type(firstButton, '{arrowdown}');

  expect(document.activeElement).toEqual(secondButton);
  controller.abort();
});
it('Should have one tab-stop inside the focus zone when enabled', () => {
  const {
    container
  } = (0, _react.render)( /*#__PURE__*/_react2.default.createElement("div", null, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Bad Apple"), /*#__PURE__*/_react2.default.createElement("div", {
    id: "focusZone"
  }, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Apple"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Banana"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Cantaloupe")), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Next Apple")));
  const focusZoneContainer = container.querySelector('#focusZone'); // eslint-disable-next-line @typescript-eslint/no-unused-vars

  const [one, two, three, four, five] = container.querySelectorAll('button');
  const controller = (0, _focusZone.focusZone)(focusZoneContainer);
  one.focus();

  _userEvent.default.tab();

  _userEvent.default.tab();

  expect(document.activeElement).toEqual(five);
  controller.abort();
  one.focus();

  _userEvent.default.tab();

  _userEvent.default.tab();

  expect(document.activeElement).toEqual(three);
  controller.abort();
});
it('Should prevent moving focus outside the zone', () => {
  const {
    container
  } = (0, _react.render)( /*#__PURE__*/_react2.default.createElement("div", null, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Bad Apple"), /*#__PURE__*/_react2.default.createElement("div", {
    id: "focusZone"
  }, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Apple"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Banana"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Cantaloupe"))));
  const focusZoneContainer = container.querySelector('#focusZone');
  const [firstButton, secondButton, thirdButton] = focusZoneContainer.querySelectorAll('button');
  const controller = (0, _focusZone.focusZone)(focusZoneContainer);
  firstButton.focus();
  expect(document.activeElement).toEqual(firstButton);

  _userEvent.default.type(firstButton, '{arrowup}');

  expect(document.activeElement).toEqual(firstButton);

  _userEvent.default.type(firstButton, '{arrowdown}');

  expect(document.activeElement).toEqual(secondButton);

  _userEvent.default.type(secondButton, '{arrowdown}');

  expect(document.activeElement).toEqual(thirdButton);

  _userEvent.default.type(thirdButton, '{arrowdown}');

  expect(document.activeElement).toEqual(thirdButton);
  controller.abort();
});
it('Should do focus wrapping correctly', () => {
  const {
    container
  } = (0, _react.render)( /*#__PURE__*/_react2.default.createElement("div", null, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Bad Apple"), /*#__PURE__*/_react2.default.createElement("div", {
    id: "focusZone"
  }, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Apple"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Banana"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Cantaloupe"))));
  const focusZoneContainer = container.querySelector('#focusZone');
  const [firstButton, secondButton, thirdButton] = focusZoneContainer.querySelectorAll('button');
  const controller = (0, _focusZone.focusZone)(focusZoneContainer, {
    focusOutBehavior: 'wrap'
  });
  firstButton.focus();
  expect(document.activeElement).toEqual(firstButton);

  _userEvent.default.type(firstButton, '{arrowup}');

  expect(document.activeElement).toEqual(thirdButton);

  _userEvent.default.type(thirdButton, '{arrowup}');

  expect(document.activeElement).toEqual(secondButton);

  _userEvent.default.type(secondButton, '{arrowdown}');

  expect(document.activeElement).toEqual(thirdButton);

  _userEvent.default.type(thirdButton, '{arrowdown}');

  expect(document.activeElement).toEqual(firstButton);
  controller.abort();
});
it('Should call custom getNextFocusable callback', () => {
  const {
    container
  } = (0, _react.render)( /*#__PURE__*/_react2.default.createElement("div", null, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Bad Apple"), /*#__PURE__*/_react2.default.createElement("div", {
    id: "focusZone"
  }, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Apple"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Banana"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Cantaloupe"))));
  const focusZoneContainer = container.querySelector('#focusZone');
  const [firstButton, secondButton] = focusZoneContainer.querySelectorAll('button');
  const getNextFocusableCallback = jest.fn();
  const controller = (0, _focusZone.focusZone)(focusZoneContainer, {
    getNextFocusable: getNextFocusableCallback
  });
  firstButton.focus();
  expect(document.activeElement).toEqual(firstButton);

  _userEvent.default.type(firstButton, '{arrowdown}');

  expect(getNextFocusableCallback).toHaveBeenCalledWith('next', firstButton, expect.anything());

  _userEvent.default.type(secondButton, '{home}');

  expect(getNextFocusableCallback).toHaveBeenCalledWith('start', secondButton, expect.anything());
  controller.abort();
});
it('Should focus-in to the most recently-focused element', () => {
  const {
    container
  } = (0, _react.render)( /*#__PURE__*/_react2.default.createElement("div", null, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0,
    id: "outside"
  }, "Bad Apple"), /*#__PURE__*/_react2.default.createElement("div", {
    id: "focusZone"
  }, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Apple"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Banana"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Cantaloupe"))));
  const focusZoneContainer = container.querySelector('#focusZone');
  const outsideButton = container.querySelector('#outside');
  const [firstButton, secondButton] = focusZoneContainer.querySelectorAll('button');
  const controller = (0, _focusZone.focusZone)(focusZoneContainer);
  firstButton.focus();
  expect(document.activeElement).toEqual(firstButton);

  _userEvent.default.type(firstButton, '{arrowdown}');

  expect(document.activeElement).toEqual(secondButton);
  outsideButton.focus();

  _userEvent.default.tab();

  expect(document.activeElement).toEqual(secondButton);
  controller.abort();
});
it('Should focus-in to the first element when focusInStrategy is "first"', () => {
  const {
    container
  } = (0, _react.render)( /*#__PURE__*/_react2.default.createElement("div", null, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0,
    id: "outside"
  }, "Bad Apple"), /*#__PURE__*/_react2.default.createElement("div", {
    id: "focusZone"
  }, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Apple"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Banana"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Cantaloupe"))));
  const focusZoneContainer = container.querySelector('#focusZone');
  const outsideButton = container.querySelector('#outside');
  const [firstButton, secondButton] = focusZoneContainer.querySelectorAll('button');
  const controller = (0, _focusZone.focusZone)(focusZoneContainer, {
    focusInStrategy: 'first'
  });
  firstButton.focus();
  expect(document.activeElement).toEqual(firstButton);

  _userEvent.default.type(firstButton, '{arrowdown}');

  expect(document.activeElement).toEqual(secondButton);
  outsideButton.focus();

  _userEvent.default.tab();

  expect(document.activeElement).toEqual(firstButton);
  controller.abort();
});
it('Should focus-in to the closest element when focusInStrategy is "closest"', () => {
  const {
    container
  } = (0, _react.render)( /*#__PURE__*/_react2.default.createElement("div", null, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0,
    id: "outsideBefore"
  }, "Bad Apple"), /*#__PURE__*/_react2.default.createElement("div", {
    id: "focusZone"
  }, /*#__PURE__*/_react2.default.createElement("button", {
    id: "apple",
    tabIndex: 0
  }, "Apple"), /*#__PURE__*/_react2.default.createElement("button", {
    id: "banana",
    tabIndex: 0
  }, "Banana"), /*#__PURE__*/_react2.default.createElement("button", {
    id: "cantaloupe",
    tabIndex: 0
  }, "Cantaloupe")), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0,
    id: "outsideAfter"
  }, "Good Apple")));
  const focusZoneContainer = container.querySelector('#focusZone');
  const outsideBefore = container.querySelector('#outsideBefore');
  const outsideAfter = container.querySelector('#outsideAfter');
  const [firstButton, secondButton, thirdButton] = focusZoneContainer.querySelectorAll('button');
  const controller = (0, _focusZone.focusZone)(focusZoneContainer, {
    focusInStrategy: 'closest'
  });
  firstButton.focus();
  expect(document.activeElement).toEqual(firstButton);

  _userEvent.default.type(firstButton, '{arrowdown}');

  expect(document.activeElement).toEqual(secondButton);
  outsideBefore.focus();

  _userEvent.default.tab();

  expect(document.activeElement).toEqual(firstButton);
  outsideAfter.focus();

  _userEvent.default.tab({
    shift: true
  });

  expect(document.activeElement).toEqual(thirdButton);
  controller.abort();
});
it('Should call the custom focusInStrategy callback', () => {
  const {
    container
  } = (0, _react.render)( /*#__PURE__*/_react2.default.createElement("div", null, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0,
    id: "outside"
  }, "Bad Apple"), /*#__PURE__*/_react2.default.createElement("div", {
    id: "focusZone"
  }, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Apple"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Banana"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Cantaloupe"))));
  const focusZoneContainer = container.querySelector('#focusZone');
  const outsideButton = container.querySelector('#outside');
  const [, secondButton] = focusZoneContainer.querySelectorAll('button');
  const focusInCallback = jest.fn().mockReturnValue(secondButton);
  const controller = (0, _focusZone.focusZone)(focusZoneContainer, {
    focusInStrategy: focusInCallback
  });
  outsideButton.focus();

  _userEvent.default.tab();

  expect(focusInCallback).toHaveBeenCalledWith(outsideButton);
  expect(document.activeElement).toEqual(secondButton);
  controller.abort();
});
it('Should respect inputs by not moving focus if key would have some other effect', () => {
  const {
    container
  } = (0, _react.render)( /*#__PURE__*/_react2.default.createElement("div", null, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0,
    id: "outside"
  }, "Bad Apple"), /*#__PURE__*/_react2.default.createElement("div", {
    id: "focusZone"
  }, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Apple"), /*#__PURE__*/_react2.default.createElement("input", {
    type: "text",
    defaultValue: "Banana",
    tabIndex: 0
  }), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Cantaloupe"))));
  const focusZoneContainer = container.querySelector('#focusZone');
  const [firstButton, secondButton] = focusZoneContainer.querySelectorAll('button');
  const input = focusZoneContainer.querySelector('input');
  const controller = (0, _focusZone.focusZone)(focusZoneContainer, {
    bindKeys: _focusZone.FocusKeys.ArrowHorizontal | _focusZone.FocusKeys.HomeAndEnd
  });
  firstButton.focus();

  _userEvent.default.type(firstButton, '{arrowright}');

  expect(document.activeElement).toEqual(input);

  _userEvent.default.type(input, '{arrowleft}');

  expect(document.activeElement).toEqual(input);

  _userEvent.default.type(input, '{arrowright}');

  expect(document.activeElement).toEqual(input);

  _userEvent.default.type(input, '{arrowright}');

  expect(document.activeElement).toEqual(secondButton);
  controller.abort();
});
it('Should focus-in to the first element if the last-focused element is removed', async () => {
  const {
    container
  } = (0, _react.render)( /*#__PURE__*/_react2.default.createElement("div", null, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0,
    id: "outside"
  }, "Bad Apple"), /*#__PURE__*/_react2.default.createElement("div", {
    id: "focusZone"
  }, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Apple"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Banana"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Cantaloupe"))));
  const focusZoneContainer = container.querySelector('#focusZone');
  const [firstButton, secondButton, thirdButton] = focusZoneContainer.querySelectorAll('button');
  const outsideButton = container.querySelector('#outside');
  const controller = (0, _focusZone.focusZone)(focusZoneContainer);
  firstButton.focus();

  _userEvent.default.type(firstButton, '{arrowdown}');

  expect(document.activeElement).toEqual(secondButton);
  outsideButton.focus();
  focusZoneContainer.removeChild(secondButton); // The mutation observer fires asynchronously

  await nextTick();

  _userEvent.default.tab();

  expect(document.activeElement).toEqual(firstButton);

  _userEvent.default.type(firstButton, '{arrowdown}');

  expect(document.activeElement).toEqual(thirdButton);
  controller.abort();
});
it('Should call onActiveDescendantChanged properly', () => {
  const {
    container
  } = (0, _react.render)( /*#__PURE__*/_react2.default.createElement("div", null, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0,
    id: "outside"
  }, "Bad Apple"), /*#__PURE__*/_react2.default.createElement("input", {
    id: "control",
    defaultValue: "control input",
    tabIndex: 0
  }), /*#__PURE__*/_react2.default.createElement("div", {
    id: "focusZone"
  }, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Apple"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Banana"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Cantaloupe"))));
  const focusZoneContainer = container.querySelector('#focusZone');
  const [firstButton, secondButton] = focusZoneContainer.querySelectorAll('button');
  const control = container.querySelector('#control');
  const activeDescendantChangedCallback = jest.fn();
  const controller = (0, _focusZone.focusZone)(focusZoneContainer, {
    activeDescendantControl: control,
    onActiveDescendantChanged: activeDescendantChangedCallback
  });
  control.focus();
  expect(activeDescendantChangedCallback).toHaveBeenLastCalledWith(firstButton, undefined, false);

  _userEvent.default.type(control, '{arrowdown}');

  expect(activeDescendantChangedCallback).toHaveBeenLastCalledWith(secondButton, firstButton, true);

  _userEvent.default.type(control, '{arrowup}');

  expect(activeDescendantChangedCallback).toHaveBeenLastCalledWith(firstButton, secondButton, true);

  _react.fireEvent.mouseMove(secondButton);

  expect(activeDescendantChangedCallback).toHaveBeenLastCalledWith(secondButton, firstButton, false);

  _userEvent.default.type(control, '{arrowup}');

  expect(activeDescendantChangedCallback).toHaveBeenLastCalledWith(firstButton, secondButton, true);

  _userEvent.default.type(control, '{arrowUp}');

  expect(activeDescendantChangedCallback).toHaveBeenLastCalledWith(firstButton, firstButton, true);
  activeDescendantChangedCallback.mockReset();

  _react.fireEvent.mouseMove(firstButton);

  expect(activeDescendantChangedCallback).not.toBeCalled();
  controller.abort();
});
it('Should set aria-activedescendant correctly', () => {
  const {
    container
  } = (0, _react.render)( /*#__PURE__*/_react2.default.createElement("div", null, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0,
    id: "outside"
  }, "Bad Apple"), /*#__PURE__*/_react2.default.createElement("input", {
    id: "control",
    defaultValue: "control input",
    tabIndex: 0
  }), /*#__PURE__*/_react2.default.createElement("div", {
    id: "focusZone"
  }, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Apple"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Banana"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Cantaloupe"))));
  const focusZoneContainer = container.querySelector('#focusZone');
  const [firstButton, secondButton] = focusZoneContainer.querySelectorAll('button');
  const outsideButton = container.querySelector('#outside');
  const control = container.querySelector('#control');
  const controller = (0, _focusZone.focusZone)(focusZoneContainer, {
    activeDescendantControl: control
  });
  control.focus();
  expect(control.getAttribute('aria-activedescendant')).toEqual(firstButton.id);

  _userEvent.default.type(control, '{arrowdown}');

  expect(control.getAttribute('aria-activedescendant')).toEqual(secondButton.id);

  _userEvent.default.type(control, '{arrowup}');

  expect(control.getAttribute('aria-activedescendant')).toEqual(firstButton.id);
  expect(document.activeElement).toEqual(control);

  _userEvent.default.type(control, '{arrowup}');

  expect(control.getAttribute('aria-activedescendant')).toEqual(firstButton.id);
  outsideButton.focus();
  expect(control.hasAttribute('aria-activedescendant')).toBeFalsy();
  controller.abort();
});
it('Should handle elements being reordered', async () => {
  const {
    container
  } = (0, _react.render)( /*#__PURE__*/_react2.default.createElement("div", null, /*#__PURE__*/_react2.default.createElement("div", {
    id: "focusZone"
  }, /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Apple"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Banana"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Cantaloupe"), /*#__PURE__*/_react2.default.createElement("button", {
    tabIndex: 0
  }, "Durian"))));
  const focusZoneContainer = container.querySelector('#focusZone');
  const [firstButton, secondButton, thirdButton, fourthButton] = focusZoneContainer.querySelectorAll('button');
  const controller = (0, _focusZone.focusZone)(focusZoneContainer);
  firstButton.focus();
  expect(document.activeElement).toEqual(firstButton);
  moveDown();
  expect(document.activeElement).toEqual(secondButton);
  moveUp();
  expect(document.activeElement).toEqual(firstButton); // move secondButton and thirdButton to the end of the zone, in reverse order

  focusZoneContainer.appendChild(thirdButton);
  focusZoneContainer.appendChild(secondButton); // The mutation observer fires asynchronously

  await nextTick();
  expect(document.activeElement).toEqual(firstButton);
  moveDown();
  expect(document.activeElement).toEqual(fourthButton);
  moveDown();
  expect(document.activeElement).toEqual(thirdButton);
  moveDown();
  expect(document.activeElement).toEqual(secondButton);
  controller.abort();
});