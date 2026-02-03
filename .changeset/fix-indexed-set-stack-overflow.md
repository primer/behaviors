---
"@primer/behaviors": patch
---

Fix IndexedSet stack overflow and optimize performance

**Fixes:**
- Fix `RangeError: Maximum call stack size exceeded` when inserting large numbers of elements (50k+) in focus zones
- Changed `insertAt` API from rest parameters to array parameter to avoid call stack issues

**Performance improvements:**
- Optimize `indexOf()` from O(n) to O(1) using a Map for index lookups
- Optimize `delete()` from O(2n) to O(n) by using the index map
- Add fast paths for common insertion patterns (append to end, prepend to start)

**Note:** This is a minor API change - `insertAt(index, ...elements)` is now `insertAt(index, elements)`. Callers should pass an array instead of spreading arguments.
