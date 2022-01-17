import React from 'react';
import { iterateFocusableElements } from '../utils/iterate-focusable-elements.js';
import { render } from '@testing-library/react';
it('Should iterate through focusable elements only', () => {
  const {
    container
  } = render( /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("textarea", null)), /*#__PURE__*/React.createElement("input", null), /*#__PURE__*/React.createElement("button", null, "Hello"), /*#__PURE__*/React.createElement("p", null, "Not focusable"), /*#__PURE__*/React.createElement("div", {
    tabIndex: 0
  }, /*#__PURE__*/React.createElement("a", {
    tabIndex: -1,
    href: "#boo"
  }, "Not focusable"), /*#__PURE__*/React.createElement("a", {
    href: "#yah"
  }, "Focusable"))));
  const focusable = Array.from(iterateFocusableElements(container, {
    onlyTabbable: true
  }));
  expect(focusable.length).toEqual(5);
  expect(focusable[0].tagName.toLowerCase()).toEqual('textarea');
  expect(focusable[1].tagName.toLowerCase()).toEqual('input');
  expect(focusable[2].tagName.toLowerCase()).toEqual('button');
  expect(focusable[3].tagName.toLowerCase()).toEqual('div');
  expect(focusable[4].tagName.toLowerCase()).toEqual('a');
  expect(focusable[4].getAttribute('href')).toEqual('#yah');
});
it('Should iterate through focusable elements in reverse', () => {
  const {
    container
  } = render( /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("textarea", null)), /*#__PURE__*/React.createElement("input", null), /*#__PURE__*/React.createElement("button", null, "Hello"), /*#__PURE__*/React.createElement("p", null, "Not focusable"), /*#__PURE__*/React.createElement("div", {
    tabIndex: 0
  }, /*#__PURE__*/React.createElement("a", {
    tabIndex: -1,
    href: "#boo"
  }, "Not focusable"), /*#__PURE__*/React.createElement("a", {
    href: "#yah"
  }, "Focusable"))));
  const focusable = Array.from(iterateFocusableElements(container, {
    reverse: true,
    onlyTabbable: true
  }));
  expect(focusable.length).toEqual(5);
  expect(focusable[0].tagName.toLowerCase()).toEqual('a');
  expect(focusable[0].getAttribute('href')).toEqual('#yah');
  expect(focusable[1].tagName.toLowerCase()).toEqual('div');
  expect(focusable[2].tagName.toLowerCase()).toEqual('button');
  expect(focusable[3].tagName.toLowerCase()).toEqual('input');
  expect(focusable[4].tagName.toLowerCase()).toEqual('textarea');
});