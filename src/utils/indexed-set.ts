/**
 * A data structure that maintains both an ordered array and a Set for O(1) membership checks.
 * Use this when you need both ordered iteration/index access AND fast membership tests.
 *
 * PERFORMANCE: Provides O(1) `has()` checks while maintaining insertion order.
 * Trade-off: Slightly more memory (Set overhead) and must call proper methods to stay in sync.
 */
export class IndexedSet<T> {
  #items: T[] = []
  #itemSet = new Set<T>()

  /**
   * Insert elements at a specific index. If index is omitted, appends to end.
   */
  insertAt(index: number, ...elements: T[]): void {
    const newElements = elements.filter(e => !this.#itemSet.has(e))
    if (newElements.length === 0) return

    this.#items.splice(index, 0, ...newElements)
    for (const element of newElements) {
      this.#itemSet.add(element)
    }
  }

  /**
   * Remove an element by reference. Returns true if element was found and removed.
   */
  delete(element: T): boolean {
    if (!this.#itemSet.has(element)) return false

    const index = this.#items.indexOf(element)
    if (index >= 0) {
      this.#items.splice(index, 1)
    }
    this.#itemSet.delete(element)
    return true
  }

  /**
   * O(1) membership check.
   */
  has(element: T): boolean {
    return this.#itemSet.has(element)
  }

  /**
   * Get the index of an element. Returns -1 if not found.
   * Note: This is O(n) but first does O(1) membership check to fast-fail.
   */
  indexOf(element: T): number {
    if (!this.#itemSet.has(element)) return -1
    return this.#items.indexOf(element)
  }

  /**
   * Get element at index.
   */
  get(index: number): T | undefined {
    return this.#items[index]
  }

  /**
   * Get the number of elements.
   */
  get size(): number {
    return this.#items.length
  }

  /**
   * Iterate over elements in order.
   */
  [Symbol.iterator](): Iterator<T> {
    return this.#items[Symbol.iterator]()
  }

  /**
   * Clear all elements.
   */
  clear(): void {
    this.#items = []
    this.#itemSet.clear()
  }

  /**
   * Find an element matching a predicate. Returns undefined if not found.
   */
  find(predicate: (element: T) => boolean): T | undefined {
    return this.#items.find(predicate)
  }
}
