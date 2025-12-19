/**
 * A data structure that maintains both an ordered array and a Set for O(1) membership checks.
 * Use this when you need both ordered iteration/index access AND fast membership tests.
 *
 * PERFORMANCE: Provides O(1) `has()` checks while maintaining insertion order.
 * Trade-off: Slightly more memory (Set overhead) and must call proper methods to stay in sync.
 */
export class IndexedSet<T> {
  private _items: T[] = []
  private _itemSet = new Set<T>()

  /**
   * Insert elements at a specific index. If index is omitted, appends to end.
   */
  insertAt(index: number, ...elements: T[]): void {
    const newElements = elements.filter(e => !this._itemSet.has(e))
    if (newElements.length === 0) return

    this._items.splice(index, 0, ...newElements)
    for (const element of newElements) {
      this._itemSet.add(element)
    }
  }

  /**
   * Remove an element by reference. Returns true if element was found and removed.
   */
  delete(element: T): boolean {
    if (!this._itemSet.has(element)) return false

    const index = this._items.indexOf(element)
    if (index >= 0) {
      this._items.splice(index, 1)
    }
    this._itemSet.delete(element)
    return true
  }

  /**
   * O(1) membership check.
   */
  has(element: T): boolean {
    return this._itemSet.has(element)
  }

  /**
   * Get the index of an element. Returns -1 if not found.
   * Note: This is O(n) but first does O(1) membership check to fast-fail.
   */
  indexOf(element: T): number {
    if (!this._itemSet.has(element)) return -1
    return this._items.indexOf(element)
  }

  /**
   * Get element at index.
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
  }

  /**
   * Find an element matching a predicate. Returns undefined if not found.
   */
  find(predicate: (element: T) => boolean): T | undefined {
    return this._items.find(predicate)
  }
}
