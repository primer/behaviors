"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uniqueId = uniqueId;
// Note: uniqueId may be unsafe in SSR contexts if it is used create DOM IDs or otherwise cause a hydration warning. Use useSSRSafeId instead.
let idSeed = 10000;

function uniqueId() {
  return `__primer_id_${idSeed++}`;
}