# @primer/behaviors

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
