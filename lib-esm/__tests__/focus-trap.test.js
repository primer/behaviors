import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { focusTrap } from '../focus-trap.js'; // Since we use strict `isTabbable` checks within focus trap, we need to mock these
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
it('Should initially focus the container when activated', () => {
  const {
    container
  } = render( /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    tabIndex: 0
  }, "Bad Apple"), /*#__PURE__*/React.createElement("div", {
    id: "trapContainer"
  }, /*#__PURE__*/React.createElement("button", {
    tabIndex: 0
  }, "Apple"), /*#__PURE__*/React.createElement("button", {
    tabIndex: 0
  }, "Banana"), /*#__PURE__*/React.createElement("button", {
    tabIndex: 0
  }, "Cantaloupe"))));
  const trapContainer = container.querySelector('#trapContainer');
  const controller = focusTrap(trapContainer);
  expect(document.activeElement).toEqual(trapContainer);
  controller.abort();
});
it('Should initially focus the initialFocus element when specified', () => {
  const {
    container
  } = render( /*#__PURE__*/React.createElement("div", {
    id: "trapContainer"
  }, /*#__PURE__*/React.createElement("button", {
    tabIndex: 0
  }, "Apple"), /*#__PURE__*/React.createElement("button", {
    tabIndex: 0
  }, "Banana"), /*#__PURE__*/React.createElement("button", {
    tabIndex: 0
  }, "Cantaloupe")));
  const trapContainer = container.querySelector('#trapContainer');
  const secondButton = trapContainer.querySelectorAll('button')[1];
  const controller = focusTrap(trapContainer, secondButton);
  expect(document.activeElement).toEqual(secondButton);
  controller.abort();
});
it('Should prevent focus from exiting the trap, returns focus to previously-focused element', async () => {
  const {
    container
  } = render( /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    id: "trapContainer"
  }, /*#__PURE__*/React.createElement("button", {
    tabIndex: 0
  }, "Apple"), /*#__PURE__*/React.createElement("button", {
    tabIndex: 0
  }, "Banana"), /*#__PURE__*/React.createElement("button", {
    tabIndex: 0
  }, "Cantaloupe")), /*#__PURE__*/React.createElement("button", {
    id: "durian",
    tabIndex: 0
  }, "Durian")));
  const trapContainer = container.querySelector('#trapContainer');
  const secondButton = trapContainer.querySelectorAll('button')[1];
  const durianButton = container.querySelector('#durian');
  const controller = focusTrap(trapContainer);
  focus(durianButton);
  expect(document.activeElement).toEqual(trapContainer);
  focus(secondButton);
  expect(document.activeElement).toEqual(secondButton);
  focus(durianButton);
  expect(document.activeElement).toEqual(secondButton);
  controller.abort();
});
it('Should prevent focus from exiting the trap if there are no focusable children', async () => {
  const {
    container
  } = render( /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    id: "trapContainer"
  }), /*#__PURE__*/React.createElement("button", {
    id: "durian",
    tabIndex: 0
  }, "Durian")));
  const trapContainer = container.querySelector('#trapContainer');
  const durianButton = container.querySelector('#durian');
  const controller = focusTrap(trapContainer);
  focus(durianButton);
  expect(document.activeElement === durianButton).toEqual(false);
  controller.abort();
});
it('Should cycle focus from last element to first element and vice-versa', async () => {
  const {
    container
  } = render( /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    id: "trapContainer"
  }, /*#__PURE__*/React.createElement("button", {
    tabIndex: 0
  }, "Apple"), /*#__PURE__*/React.createElement("button", {
    tabIndex: 0
  }, "Banana"), /*#__PURE__*/React.createElement("button", {
    tabIndex: 0
  }, "Cantaloupe")), /*#__PURE__*/React.createElement("button", {
    id: "durian",
    tabIndex: 0
  }, "Durian")));
  const trapContainer = container.querySelector('#trapContainer');
  const firstButton = trapContainer.querySelector('button');
  const lastButton = trapContainer.querySelectorAll('button')[2];
  const controller = focusTrap(trapContainer);
  lastButton.focus();
  fireEvent(lastButton, new KeyboardEvent('keydown', {
    bubbles: true,
    key: 'Tab'
  }));
  expect(document.activeElement).toEqual(firstButton);
  fireEvent(firstButton, new KeyboardEvent('keydown', {
    bubbles: true,
    key: 'Tab',
    shiftKey: true
  }));
  expect(document.activeElement).toEqual(lastButton);
  controller.abort();
});
it('Should should release the trap when the signal is aborted', async () => {
  const {
    container
  } = render( /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    id: "trapContainer"
  }, /*#__PURE__*/React.createElement("button", {
    tabIndex: 0
  }, "Apple"), /*#__PURE__*/React.createElement("button", {
    tabIndex: 0
  }, "Banana"), /*#__PURE__*/React.createElement("button", {
    tabIndex: 0
  }, "Cantaloupe")), /*#__PURE__*/React.createElement("button", {
    id: "durian",
    tabIndex: 0
  }, "Durian")));
  const trapContainer = container.querySelector('#trapContainer');
  const durianButton = container.querySelector('#durian');
  const controller = focusTrap(trapContainer);
  focus(durianButton);
  expect(document.activeElement).toEqual(trapContainer);
  controller.abort();
  focus(durianButton);
  expect(document.activeElement).toEqual(durianButton);
});
it('Should should release the trap when the container is removed from the DOM', async () => {
  var _trapContainer$parent;

  const {
    container
  } = render( /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    id: "trapContainer"
  }, /*#__PURE__*/React.createElement("button", {
    tabIndex: 0
  }, "Apple")), /*#__PURE__*/React.createElement("button", {
    id: "durian",
    tabIndex: 0
  }, "Durian")));
  const trapContainer = container.querySelector('#trapContainer');
  const durianButton = container.querySelector('#durian');
  const firstButton = trapContainer.querySelector('button');
  focusTrap(trapContainer);
  focus(durianButton);
  expect(document.activeElement).toEqual(trapContainer); // empty trap and remove it from the DOM

  trapContainer.removeChild(firstButton);
  (_trapContainer$parent = trapContainer.parentElement) === null || _trapContainer$parent === void 0 ? void 0 : _trapContainer$parent.removeChild(trapContainer);
  focus(durianButton);
  expect(document.activeElement).toEqual(durianButton);
});
it('Should handle dynamic content', async () => {
  const {
    container
  } = render( /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    id: "trapContainer"
  }, /*#__PURE__*/React.createElement("button", {
    tabIndex: 0
  }, "Apple"), /*#__PURE__*/React.createElement("button", {
    tabIndex: 0
  }, "Banana"), /*#__PURE__*/React.createElement("button", {
    tabIndex: 0
  }, "Cantaloupe")), /*#__PURE__*/React.createElement("button", {
    id: "durian",
    tabIndex: 0
  }, "Durian")));
  const trapContainer = container.querySelector('#trapContainer');
  const [firstButton, secondButton, thirdButton] = trapContainer.querySelectorAll('button');
  const controller = focusTrap(trapContainer);
  secondButton.focus();
  trapContainer.removeChild(thirdButton);
  fireEvent(secondButton, new KeyboardEvent('keydown', {
    bubbles: true,
    key: 'Tab'
  }));
  expect(document.activeElement).toEqual(firstButton);
  fireEvent(firstButton, new KeyboardEvent('keydown', {
    bubbles: true,
    key: 'Tab',
    shiftKey: true
  }));
  expect(document.activeElement).toEqual(secondButton);
  controller.abort();
});
/**
 * Helper to handle firing the focusin event, which jest/JSDOM does not do for us.
 * @param element
 */

function focus(element) {
  element.focus();
  fireEvent(element, new FocusEvent('focusin', {
    bubbles: true
  }));
}