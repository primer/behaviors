# @primer/behaviors

## 1.10.1

### Patch Changes

- [#685](https://github.com/primer/behaviors/pull/685) [`de1a034`](https://github.com/primer/behaviors/commit/de1a0348e78d230f67e672576b8d2efe2ac07c98) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Fix IndexedSet stack overflow and optimize performance

  **Fixes:**
  - Fix `RangeError: Maximum call stack size exceeded` when inserting large numbers of elements (50k+) in focus zones
  - Changed `insertAt` API from rest parameters to array parameter to avoid call stack issues

  **Performance improvements:**
  - Optimize `indexOf()` from O(n) to O(1) using a Map for index lookups
  - Optimize `delete()` from O(2n) to O(n) by using the index map
  - Add fast paths for common insertion patterns (append to end, prepend to start)

  **Note:** This is a minor API change - `insertAt(index, ...elements)` is now `insertAt(index, elements)`. Callers should pass an array instead of spreading arguments.

## 1.10.0

### Minor Changes

- [#668](https://github.com/primer/behaviors/pull/668) [`15b49ab`](https://github.com/primer/behaviors/commit/15b49abc0caee6a1390c951e52f28472fc3b57ff) Thanks [@TylerJDev](https://github.com/TylerJDev)! - Focus-zone: Reinitialize focus zone when new items are added and focusPrependedElements is `true`

## 1.9.2

### Patch Changes

- [#661](https://github.com/primer/behaviors/pull/661) [`419bcf0`](https://github.com/primer/behaviors/commit/419bcf091f7a4767286a69c7e3ed76547b28e187) Thanks [@copilot-swe-agent](https://github.com/apps/copilot-swe-agent)! - Optimize `getAnchoredPosition` by reducing `getComputedStyle` calls
  - Combine DOM traversals for positioned parent and clipping node lookups into a single pass
  - Cache computed styles during traversal to avoid redundant `getComputedStyle` calls
  - Reduce calls from `2n + 2` to `n` for DOM trees of depth `n` (57% reduction for typical cases)
  - Improve performance for anchored positioning with deep DOM trees

## 1.9.1

### Patch Changes

- [#665](https://github.com/primer/behaviors/pull/665) [`7fa6e9a`](https://github.com/primer/behaviors/commit/7fa6e9abe4039d0d105426510e2da4250a3eeae0) Thanks [@kelsey-myers](https://github.com/kelsey-myers)! - [Focus Zone] Fix edge-case where prepended element is not focused when elements are reordered

- [#657](https://github.com/primer/behaviors/pull/657) [`457a1fb`](https://github.com/primer/behaviors/commit/457a1fb342b6eeba9f66cf721b3ebd871fb1abc0) Thanks [@mattcosta7](https://github.com/mattcosta7)! - Optimize DOM operations for better web vitals (INP, CLS, FID)
  - Batch reflow-causing reads in `isFocusable()` to minimize layout thrashing
  - Use `Set` for O(1) tag lookups instead of `Array.includes()`
  - Optimize `getClippingRect()` and `getPositionedParent()` with early exits
  - Batch MutationObserver DOM operations (read phase, then write phase)
  - Add sr-only inline styles to focus-trap sentinels to prevent CLS
  - Use `:scope` selector for faster direct-child sentinel lookup
  - Add `IndexedSet` for O(1) membership checks in focus zone hot paths

## 1.9.0

### Minor Changes

- [#648](https://github.com/primer/behaviors/pull/648) [`0cd03c3`](https://github.com/primer/behaviors/commit/0cd03c35af58dfe2b02f3a068a1bbbd29c6461fa) Thanks [@TylerJDev](https://github.com/TylerJDev)! - FocusZone: Introduce a new focusInStrategy option, "initial," to allow disabling the default behavior of focusing on the first item when the focus zone becomes active.

- [#641](https://github.com/primer/behaviors/pull/641) [`cd90185`](https://github.com/primer/behaviors/commit/cd90185640272559b59ccd77613ed63f79bda1c9) Thanks [@TylerJDev](https://github.com/TylerJDev)! - FocusZone: Add setting `ignoreHoverEvents` which provides a configurable setting to disable selection on mouse hover

## 1.8.4

### Patch Changes

- [#623](https://github.com/primer/behaviors/pull/623) [`f539ae5`](https://github.com/primer/behaviors/commit/f539ae53d10c0cdf6c68b7a89cf623c1fbb20195) Thanks [@iansan5653](https://github.com/iansan5653)! - Fix cursor position checks to exclude `select` elements

## 1.8.3

### Patch Changes

- [#597](https://github.com/primer/behaviors/pull/597) [`43f432a`](https://github.com/primer/behaviors/commit/43f432ad873b25fc5adef318383c0f7d743c78e1) Thanks [@iansan5653](https://github.com/iansan5653)! - Expose `isEditableElement` util

## 1.8.2

### Patch Changes

- [#594](https://github.com/primer/behaviors/pull/594) [`5cd0b90`](https://github.com/primer/behaviors/commit/5cd0b909270231f125847affe0fd788d7bf678d8) Thanks [@iansan5653](https://github.com/iansan5653)! - Respect `contenteditable` elements when checking for editability in `focus-zone` behavior

## 1.8.1

### Patch Changes

- [#473](https://github.com/primer/behaviors/pull/473) [`d88c043`](https://github.com/primer/behaviors/commit/d88c043aa38e1f83a3bb168f8eda2338858c6587) Thanks [@TylerJDev](https://github.com/TylerJDev)! - Prevent duplicate sentinels from being added if some already exist in the container of the focus trap.

## 1.8.0

### Minor Changes

- [#462](https://github.com/primer/behaviors/pull/462) [`62dc90a`](https://github.com/primer/behaviors/commit/62dc90a6464e5d17e955271e9f3b3709982b1643) Thanks [@camertron](https://github.com/camertron)! - Ensure focusZone() clears all potential active descendants

## 1.7.2

### Patch Changes

- [#429](https://github.com/primer/behaviors/pull/429) [`4b729b0`](https://github.com/primer/behaviors/commit/4b729b084c161e2f81356fe706bf1b8243cf021e) Thanks [@TylerJDev](https://github.com/TylerJDev)! - Adds mutation observer to `focus-trap` to ensure sentinel elements are always in the correct position

## 1.7.1

### Patch Changes

- [#421](https://github.com/primer/behaviors/pull/421) [`fd1419a`](https://github.com/primer/behaviors/commit/fd1419aa9fe1b3821903fbb145d76ce5e35e1c9a) Thanks [@joshblack](https://github.com/joshblack)! - Remove optionalDependencies from npm package

## 1.7.0

### Minor Changes

- [#400](https://github.com/primer/behaviors/pull/400) [`67215a5`](https://github.com/primer/behaviors/commit/67215a51ce82a967ced2264ba19a28e0d0d43592) Thanks [@joshblack](https://github.com/joshblack)! - Update the output of the package to correctly map "import" conditions to ESM

## 1.6.0

### Minor Changes

- [#263](https://github.com/primer/behaviors/pull/263) [`5d7e0b1`](https://github.com/primer/behaviors/commit/5d7e0b1d5411d20ed9710bcec22ce3716132b47f) Thanks [@TylerJDev](https://github.com/TylerJDev)! - Adjusts mutation observer to now track `hidden` and `disabled` attributes being applied or removed.

### Patch Changes

- [#399](https://github.com/primer/behaviors/pull/399) [`3a3cd61`](https://github.com/primer/behaviors/commit/3a3cd6132ad9ebbfa78177f1a2971d4e0c03d5ca) Thanks [@JelloBagel](https://github.com/JelloBagel)! - Fix bug found when removing nodes in a focus zone with strict mode enabled

## 1.5.1

### Patch Changes

- [#245](https://github.com/primer/behaviors/pull/245) [`caf30c4`](https://github.com/primer/behaviors/commit/caf30c4c8d3f66deb1b5c6b0ea139412973a6b49) Thanks [@pksjce](https://github.com/pksjce)! - When zoomed in, an overlay floating element should anchor itself properly instead of getting the top part cut off in the process

## 1.5.0

### Minor Changes

- [#241](https://github.com/primer/behaviors/pull/241) [`cb98837`](https://github.com/primer/behaviors/commit/cb98837982b3b7a2c46a56639116dc80c6071a09) Thanks [@JelloBagel](https://github.com/JelloBagel)! - Add support for contenteditable to iterateFocusableElements

## 1.4.0

### Minor Changes

- [#235](https://github.com/primer/behaviors/pull/235) [`7a7faa9`](https://github.com/primer/behaviors/commit/7a7faa9c604ea23f10edd68ed66c35e790a5dc1a) Thanks [@JelloBagel](https://github.com/JelloBagel)! - Add IterateFocusableElements options to focusZone

## 1.3.6

### Patch Changes

- [#208](https://github.com/primer/behaviors/pull/208) [`2042afc`](https://github.com/primer/behaviors/commit/2042afcc44ecfa1eee1e3782e4415074b7b18cd2) Thanks [@EnixCoda](https://github.com/EnixCoda)! - Update `anchored-position.ts` to support handling elements outside of `document.body` in `getClippingRect`

## 1.3.5

### Patch Changes

- [#197](https://github.com/primer/behaviors/pull/197) [`ac8ea59`](https://github.com/primer/behaviors/commit/ac8ea59670099b836ed69e3dcf5b1b62cbbd2db3) Thanks [@jonrohan](https://github.com/jonrohan)! - Check if popover supported in isTopLayer

## 1.3.4

### Patch Changes

- [#195](https://github.com/primer/behaviors/pull/195) [`bddd6c5`](https://github.com/primer/behaviors/commit/bddd6c5be9af240d43a53cc062a0f07a65e695af) Thanks [@keithamus](https://github.com/keithamus)! - Special case anchored-position calls on top-layer elements

## 1.3.3

### Patch Changes

- [#180](https://github.com/primer/behaviors/pull/180) [`eca845b`](https://github.com/primer/behaviors/commit/eca845b9dbcd49383766ee55dfdcfa4fafbda4a6) Thanks [@colebemis](https://github.com/colebemis)! - FocusZone: If custom `focusInStrategy` is defined, use it to initialize tabIndexes

## 1.3.2

### Patch Changes

- [#176](https://github.com/primer/behaviors/pull/176) [`5e74867`](https://github.com/primer/behaviors/commit/5e7486702074bbb89e6a7a96a4b0db71d763c74c) Thanks [@jbrown1618](https://github.com/jbrown1618)! - Use a binary search to find the insertion index for new elements managed by the focus zone.
  For a use case with 1000 elements managed by the focus zone, added one at a time (by react),
  this takes us from 500,000 calls to `compareDocumentPosition` over 1000ms to 8,000 calls
  over 16ms.

## 1.3.1

### Patch Changes

- [#155](https://github.com/primer/behaviors/pull/155) [`b14b5ac`](https://github.com/primer/behaviors/commit/b14b5ac5dc2ef9957e4b585e27acf7d5566edd5a) Thanks [@colebemis](https://github.com/colebemis)! - focusZone: Add Backspace key to list of FocusKeys

## 1.3.0

### Minor Changes

- [#152](https://github.com/primer/behaviors/pull/152) [`afaf380`](https://github.com/primer/behaviors/commit/afaf380893cb858e6c85515bb490866d76d3d8b7) Thanks [@colebemis](https://github.com/colebemis)! - focusZone: Add `preventScroll` option

## 1.2.0

### Minor Changes

- [#134](https://github.com/primer/behaviors/pull/134) [`cc5bf8e`](https://github.com/primer/behaviors/commit/cc5bf8e8404594bc6b3ff1493f253b171bfb03c0) Thanks [@jonrohan](https://github.com/jonrohan)! - Add Dimensions behavior

## 1.1.3

### Patch Changes

- [#93](https://github.com/primer/behaviors/pull/93) [`e5aaf68`](https://github.com/primer/behaviors/commit/e5aaf688b084bf6e425c6bdb0963aa50aacf8fa4) Thanks [@siddharthkp](https://github.com/siddharthkp)! - Anchored position: Add check for boundary collision on left side

## 1.1.2

### Patch Changes

- [#78](https://github.com/primer/behaviors/pull/78) [`62e5459`](https://github.com/primer/behaviors/commit/62e545913dae8ca42f88fd6184f190cdf3df9c4c) Thanks [@siddharthkp](https://github.com/siddharthkp)! - Anchored Position: Add alternative alignments to flip to if there isn't enough space

## 1.1.1

### Patch Changes

- [#73](https://github.com/primer/behaviors/pull/73) [`a96d60f`](https://github.com/primer/behaviors/commit/a96d60fdb2a2ffdde71a22ea29fa2c788bf4c6aa) Thanks [@dgreif](https://github.com/dgreif)! - Add `import` conditional export type to the package for better NodeJS ESM compatibility

## 1.1.0

### Minor Changes

- [#52](https://github.com/primer/behaviors/pull/52) [`1aa3027`](https://github.com/primer/behaviors/commit/1aa302782e3c833f9d9c27f602a046e81f05c3e5) Thanks [@owenniblock](https://github.com/owenniblock)! - Update focusTrap to use new methodology after accessibility discussions

## 1.0.3

### Patch Changes

- [#42](https://github.com/primer/behaviors/pull/42) [`41945a3`](https://github.com/primer/behaviors/commit/41945a37ef07da82ce5a29feb03d7a7d96ec76ea) Thanks [@dgreif](https://github.com/dgreif)! - Build both esm and cjs output for the package

## 1.0.2

### Patch Changes

- [#17](https://github.com/primer/behaviors/pull/17) [`9194ba4`](https://github.com/primer/behaviors/commit/9194ba403502b4acba0be03bed1a765c1ba81340) Thanks [@dgreif](https://github.com/dgreif)! - Correct margin orientation for `scrollIntoView`

* [#18](https://github.com/primer/behaviors/pull/18) [`3b4dd41`](https://github.com/primer/behaviors/commit/3b4dd414175417f83bd144939fe74b2a01bc7136) Thanks [@dgreif](https://github.com/dgreif)! - Export utils as submodule

## 1.0.1

### Patch Changes

- [#10](https://github.com/primer/behaviors/pull/10) [`88b6f34`](https://github.com/primer/behaviors/commit/88b6f34bf4874f3c81473020a01a58b197dd6e16) Thanks [@dgreif](https://github.com/dgreif)! - Set up changesets
