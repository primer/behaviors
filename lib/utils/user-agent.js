"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isMacOS = isMacOS;
let isMac = undefined;

function isMacOS() {
  if (isMac === undefined) {
    isMac = /^mac/i.test(window.navigator.platform);
  }

  return isMac;
}