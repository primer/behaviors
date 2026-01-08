---
'@primer/behaviors': patch
---

Optimize `getAnchoredPosition` by reducing `getComputedStyle` calls

- Combine DOM traversals for positioned parent and clipping node lookups into a single pass
- Cache computed styles during traversal to avoid redundant `getComputedStyle` calls
- Reduce calls from `2n + 2` to `n` for DOM trees of depth `n` (57% reduction for typical cases)
- Improve performance for anchored positioning with deep DOM trees
