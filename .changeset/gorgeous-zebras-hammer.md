---
"@primer/behaviors": patch
---

Use a binary search to find the insertion index for new elements managed by the focus zone.
For a use case with 1000 elements managed by the focus zone, added one at a time (by react),
this takes us from 500,000 calls to `compareDocumentPosition` over 1000ms to 8,000 calls
over 16ms. 
