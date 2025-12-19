---
'@primer/behaviors': patch
---

Optimize DOM operations for better web vitals (INP, CLS, FID)

- Batch reflow-causing reads in `isFocusable()` to minimize layout thrashing
- Use `Set` for O(1) tag lookups instead of `Array.includes()`
- Optimize `getClippingRect()` and `getPositionedParent()` with early exits
- Batch MutationObserver DOM operations (read phase, then write phase)
- Add sr-only inline styles to focus-trap sentinels to prevent CLS
- Use `:scope` selector for faster direct-child sentinel lookup
- Add `IndexedSet` for O(1) membership checks in focus zone hot paths
