/**
 * A data structure that maintains both an ordered array and a Set for O(1) membership checks,
 * plus a Map for O(1) index lookups by element.
 *
 * PERFORMANCE:
 * - O(1) `has()` checks
 * - O(1) `indexOf()` lookups
 * - O(1) `get()` by index
 * - O(n) insertions/deletions (unavoidable for ordered array, but optimized)
 *
 * Optimized for focusZone use cases:
 * - Frequent `has()` checks (mousemove handlers)
 * - Frequent `get(index)` access (arrow key navigation)
 * - Batch insertions via MutationObserver
 * - Relatively infrequent deletions
 */
export class IndexedSet<T> {
  private _items: T[] = []
  private _itemSet = new Set<T>()
  private _indexMap = new Map<T, number>()

  /**
   * Insert elements at a specific index.
   * Accepts an array to avoid call stack overflow with large datasets.
   * O(n) due to array operations, but optimized for batch insertions.
   */
  insertAt(index: number, elements: T[]): void {
    // Filter without creating intermediate array for small inputs
    let newElements: T[]
    if (elements.length <= 100) {
      newElements = elements.filter(e => !this._itemSet.has(e))
    } else {
      // For large arrays, build incrementally to avoid memory spikes
      newElements = []
      for (let i = 0; i < elements.length; i++) {
        if (!this._itemSet.has(elements[i])) {
          newElements.push(elements[i])
        }
      }
    }
    if (newElements.length === 0) return

    // Clamp index to valid range
    const insertIndex = Math.max(0, Math.min(index, this._items.length))

    // Fast path: appending to end (common case for initial load)
    if (insertIndex === this._items.length) {
      for (let i = 0; i < newElements.length; i++) {
        const element = newElements[i]
        this._indexMap.set(element, this._items.length)
        this._items.push(element)
        this._itemSet.add(element)
      }
      return
    }

    // Fast path: prepending to start
    if (insertIndex === 0) {
      // Update all existing indices first
      for (let i = 0; i < this._items.length; i++) {
        this._indexMap.set(this._items[i], i + newElements.length)
      }
      // Use unshift for small arrays, splice for larger (V8 optimizes splice better for large arrays)
      if (newElements.length <= 10 && this._items.length <= 100) {
        for (let i = newElements.length - 1; i >= 0; i--) {
          this._items.unshift(newElements[i])
        }
      } else {
        this._items.splice(0, 0, ...(newElements.length <= 10000 ? newElements : this._chunkedInsert(0, newElements)))
      }
      // Add new elements to Set and Map
      for (let i = 0; i < newElements.length; i++) {
        this._itemSet.add(newElements[i])
        this._indexMap.set(newElements[i], i)
      }
      return
    }

    // General case: middle insertion
    // Update indices for elements that will shift
    for (let i = this._items.length - 1; i >= insertIndex; i--) {
      this._indexMap.set(this._items[i], i + newElements.length)
    }

    // Insert new elements - use chunked approach for very large arrays
    if (newElements.length <= 10000) {
      this._items.splice(insertIndex, 0, ...newElements)
    } else {
      this._chunkedInsert(insertIndex, newElements)
    }

    // Add new elements to Set and Map
    for (let i = 0; i < newElements.length; i++) {
      const element = newElements[i]
      this._itemSet.add(element)
      this._indexMap.set(element, insertIndex + i)
    }
  }

  /**
   * Insert elements in chunks to avoid call stack overflow.
   */
  private _chunkedInsert(index: number, elements: T[]): T[] {
    const CHUNK_SIZE = 10000
    for (let i = 0; i < elements.length; i += CHUNK_SIZE) {
      const chunk = elements.slice(i, i + CHUNK_SIZE)
      this._items.splice(index + i, 0, ...chunk)
    }
    return [] // Return empty to signal we handled it
  }

  /**
   * Remove an element by reference. Returns true if element was found and removed.
   * O(n) due to array splice and index updates.
   */
  delete(element: T): boolean {
    if (!this._itemSet.has(element)) return false

    const index = this._indexMap.get(element)!
    this._items.splice(index, 1)
    this._itemSet.delete(element)
    this._indexMap.delete(element)

    // Update indices for elements that shifted
    for (let i = index; i < this._items.length; i++) {
      this._indexMap.set(this._items[i], i)
    }

    return true
  }

  /**
   * O(1) membership check.
   */
  has(element: T): boolean {
    return this._itemSet.has(element)
  }

  /**
   * O(1) index lookup (improved from O(n)).
   */
  indexOf(element: T): number {
    return this._indexMap.get(element) ?? -1
  }

  /**
   * O(1) element access by index.
   */
  get(index: number): T | undefined {
    return this._items[index]
  }

  /**
   * Get the number of elements.
   */
  get size(): number {
    return this._items.length
  }

  /**
   * Iterate over elements in order.
   */
  [Symbol.iterator](): Iterator<T> {
    return this._items[Symbol.iterator]()
  }

  /**
   * Clear all elements.
   */
  clear(): void {
    this._items = []
    this._itemSet.clear()
    this._indexMap.clear()
  }

  /**
   * Find an element matching a predicate. Returns undefined if not found.
   */
  find(predicate: (element: T) => boolean): T | undefined {
    return this._items.find(predicate)
  }
}
