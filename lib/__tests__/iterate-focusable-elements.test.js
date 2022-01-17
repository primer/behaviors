"use strict";

var _react = _interopRequireDefault(require("react"));

var _iterateFocusableElements = require("../utils/iterate-focusable-elements.js");

var _react2 = require("@testing-library/react");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

it('Should iterate through focusable elements only', () => {
  const {
    container
  } = (0, _react2.render)( /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("textarea", null)), /*#__PURE__*/_react.default.createElement("input", null), /*#__PURE__*/_react.default.createElement("button", null, "Hello"), /*#__PURE__*/_react.default.createElement("p", null, "Not focusable"), /*#__PURE__*/_react.default.createElement("div", {
    tabIndex: 0
  }, /*#__PURE__*/_react.default.createElement("a", {
    tabIndex: -1,
    href: "#boo"
  }, "Not focusable"), /*#__PURE__*/_react.default.createElement("a", {
    href: "#yah"
  }, "Focusable"))));
  const focusable = Array.from((0, _iterateFocusableElements.iterateFocusableElements)(container, {
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
  } = (0, _react2.render)( /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("textarea", null)), /*#__PURE__*/_react.default.createElement("input", null), /*#__PURE__*/_react.default.createElement("button", null, "Hello"), /*#__PURE__*/_react.default.createElement("p", null, "Not focusable"), /*#__PURE__*/_react.default.createElement("div", {
    tabIndex: 0
  }, /*#__PURE__*/_react.default.createElement("a", {
    tabIndex: -1,
    href: "#boo"
  }, "Not focusable"), /*#__PURE__*/_react.default.createElement("a", {
    href: "#yah"
  }, "Focusable"))));
  const focusable = Array.from((0, _iterateFocusableElements.iterateFocusableElements)(container, {
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