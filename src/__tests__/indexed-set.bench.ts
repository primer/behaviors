/**
 * Performance benchmarks for IndexedSet
 * Run with: npm test -- indexed-set.bench.ts
 * 
 * These benchmarks demonstrate the performance improvements:
 * 1. O(1) indexOf lookups (previously O(n))
 * 2. No stack overflow with large datasets
 * 3. Optimized delete operations
 */

import {IndexedSet} from '../utils/indexed-set'

describe('IndexedSet Performance Benchmarks', () => {
  describe('indexOf performance (O(1) vs O(n))', () => {
    it('handles O(1) indexOf lookups efficiently for large datasets', () => {
      const set = new IndexedSet<string>()
      const elements: string[] = []
      
      // Create 10,000 elements
      for (let i = 0; i < 10000; i++) {
        elements.push(`element-${i}`)
      }
      
      set.insertAt(0, elements)
      
      // Benchmark: Find element near the end (worst case for O(n))
      const startTime = performance.now()
      const index = set.indexOf('element-9999')
      const endTime = performance.now()
      
      expect(index).toBe(9999)
      
      // With O(1), this should be < 1ms even for 10k elements
      const duration = endTime - startTime
      console.log(`indexOf on 10k elements (element at end): ${duration.toFixed(3)}ms`)
      expect(duration).toBeLessThan(5) // Should be nearly instant
    })

    it('maintains O(1) performance for multiple lookups', () => {
      const set = new IndexedSet<string>()
      const elements: string[] = []
      
      for (let i = 0; i < 5000; i++) {
        elements.push(`element-${i}`)
      }
      
      set.insertAt(0, elements)
      
      // Perform 1000 random lookups
      const startTime = performance.now()
      for (let i = 0; i < 1000; i++) {
        const randomIdx = Math.floor(Math.random() * 5000)
        set.indexOf(`element-${randomIdx}`)
      }
      const endTime = performance.now()
      
      const duration = endTime - startTime
      console.log(`1000 random indexOf calls on 5k elements: ${duration.toFixed(3)}ms`)
      expect(duration).toBeLessThan(50) // Should be very fast
    })
  })

  describe('Large dataset insertion (stack overflow fix)', () => {
    it('handles insertion of 50,000 elements without stack overflow', () => {
      const set = new IndexedSet<string>()
      const elements: string[] = []
      
      // Create a large dataset that would cause stack overflow with spread operator
      for (let i = 0; i < 50000; i++) {
        elements.push(`element-${i}`)
      }
      
      const startTime = performance.now()
      // This should NOT throw "RangeError: Maximum call stack size exceeded"
      expect(() => set.insertAt(0, elements)).not.toThrow()
      const endTime = performance.now()
      
      expect(set.size).toBe(50000)
      expect(set.get(0)).toBe('element-0')
      expect(set.get(49999)).toBe('element-49999')
      
      const duration = endTime - startTime
      console.log(`Insertion of 50k elements: ${duration.toFixed(3)}ms`)
    })

    it('handles appending large datasets efficiently', () => {
      const set = new IndexedSet<number>()
      
      // Test the fast path for appending
      const elements: number[] = []
      for (let i = 0; i < 20000; i++) {
        elements.push(i)
      }
      
      const startTime = performance.now()
      set.insertAt(set.size, elements) // Append to end
      const endTime = performance.now()
      
      expect(set.size).toBe(20000)
      expect(set.get(19999)).toBe(19999)
      
      const duration = endTime - startTime
      console.log(`Appending 20k elements (fast path): ${duration.toFixed(3)}ms`)
      expect(duration).toBeLessThan(100) // Should be optimized
    })
  })

  describe('delete performance', () => {
    it('efficiently deletes elements from large sets', () => {
      const set = new IndexedSet<string>()
      const elements: string[] = []
      
      for (let i = 0; i < 10000; i++) {
        elements.push(`element-${i}`)
      }
      
      set.insertAt(0, elements)
      
      // Delete an element in the middle
      const startTime = performance.now()
      const deleted = set.delete('element-5000')
      const endTime = performance.now()
      
      expect(deleted).toBe(true)
      expect(set.size).toBe(9999)
      expect(set.indexOf('element-5000')).toBe(-1)
      
      const duration = endTime - startTime
      console.log(`Delete from middle of 10k elements: ${duration.toFixed(3)}ms`)
    })

    it('maintains correct indices after deletion', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, ['a', 'b', 'c', 'd', 'e'])
      
      set.delete('c')
      
      // Verify indices are updated correctly
      expect(set.indexOf('a')).toBe(0)
      expect(set.indexOf('b')).toBe(1)
      expect(set.indexOf('d')).toBe(2) // Shifted down
      expect(set.indexOf('e')).toBe(3) // Shifted down
      expect(set.get(2)).toBe('d')
      expect(set.get(3)).toBe('e')
    })
  })

  describe('Mixed operations performance', () => {
    it('handles realistic usage patterns efficiently', () => {
      const set = new IndexedSet<HTMLElement>()
      const elements: HTMLElement[] = []
      
      // Simulate focus zone with 1000 focusable elements
      for (let i = 0; i < 1000; i++) {
        const div = document.createElement('div')
        div.id = `element-${i}`
        elements.push(div)
      }
      
      const startTime = performance.now()
      
      // Initial insertion
      set.insertAt(0, elements)
      
      // Simulate frequent has() checks (mousemove handlers)
      for (let i = 0; i < 100; i++) {
        const randomIdx = Math.floor(Math.random() * 1000)
        set.has(elements[randomIdx])
      }
      
      // Simulate get() by index (arrow key navigation)
      for (let i = 0; i < 50; i++) {
        const randomIdx = Math.floor(Math.random() * 1000)
        set.get(randomIdx)
      }
      
      // Simulate indexOf lookups
      for (let i = 0; i < 50; i++) {
        const randomIdx = Math.floor(Math.random() * 1000)
        set.indexOf(elements[randomIdx])
      }
      
      // Simulate some deletions
      for (let i = 0; i < 10; i++) {
        const randomIdx = Math.floor(Math.random() * elements.length)
        set.delete(elements[randomIdx])
      }
      
      const endTime = performance.now()
      
      const duration = endTime - startTime
      console.log(`Mixed operations on 1k elements: ${duration.toFixed(3)}ms`)
      expect(duration).toBeLessThan(200) // Should handle realistic usage well
    })
  })

  describe('Memory efficiency', () => {
    it('handles deduplication without memory issues', () => {
      const set = new IndexedSet<string>()
      const elements: string[] = []
      
      // Create 5000 elements
      for (let i = 0; i < 5000; i++) {
        elements.push(`element-${i}`)
      }
      
      set.insertAt(0, elements)
      
      // Try to insert duplicates (should be filtered out)
      const duplicates = elements.slice(0, 2500)
      set.insertAt(0, duplicates)
      
      // Size should still be 5000 (no duplicates added)
      expect(set.size).toBe(5000)
      
      // All elements should still be findable
      expect(set.indexOf('element-0')).toBeGreaterThanOrEqual(0)
      expect(set.indexOf('element-4999')).toBeGreaterThanOrEqual(0)
    })
  })
})
