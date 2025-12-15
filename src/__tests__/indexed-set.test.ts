import {IndexedSet} from '../utils/indexed-set'

describe('IndexedSet', () => {
  describe('insertAt', () => {
    it('inserts elements at the specified index', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, 'a', 'b', 'c')

      expect(set.get(0)).toBe('a')
      expect(set.get(1)).toBe('b')
      expect(set.get(2)).toBe('c')
      expect(set.size).toBe(3)
    })

    it('inserts elements in the middle', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, 'a', 'c')
      set.insertAt(1, 'b')

      expect(set.get(0)).toBe('a')
      expect(set.get(1)).toBe('b')
      expect(set.get(2)).toBe('c')
    })

    it('deduplicates elements', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, 'a', 'b')
      set.insertAt(2, 'b', 'c') // 'b' should be ignored

      expect(set.size).toBe(3)
      expect(set.get(0)).toBe('a')
      expect(set.get(1)).toBe('b')
      expect(set.get(2)).toBe('c')
    })

    it('handles inserting all duplicates', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, 'a', 'b')
      set.insertAt(0, 'a', 'b') // all duplicates

      expect(set.size).toBe(2)
    })
  })

  describe('delete', () => {
    it('removes an element and returns true', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, 'a', 'b', 'c')

      expect(set.delete('b')).toBe(true)
      expect(set.size).toBe(2)
      expect(set.has('b')).toBe(false)
      expect(set.get(0)).toBe('a')
      expect(set.get(1)).toBe('c')
    })

    it('returns false for non-existent element', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, 'a')

      expect(set.delete('b')).toBe(false)
      expect(set.size).toBe(1)
    })
  })

  describe('has', () => {
    it('returns true for existing elements', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, 'a', 'b')

      expect(set.has('a')).toBe(true)
      expect(set.has('b')).toBe(true)
    })

    it('returns false for non-existent elements', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, 'a')

      expect(set.has('b')).toBe(false)
    })

    it('returns false after element is deleted', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, 'a')
      set.delete('a')

      expect(set.has('a')).toBe(false)
    })
  })

  describe('indexOf', () => {
    it('returns the index of an existing element', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, 'a', 'b', 'c')

      expect(set.indexOf('a')).toBe(0)
      expect(set.indexOf('b')).toBe(1)
      expect(set.indexOf('c')).toBe(2)
    })

    it('returns -1 for non-existent elements', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, 'a')

      expect(set.indexOf('b')).toBe(-1)
    })
  })

  describe('get', () => {
    it('returns the element at the specified index', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, 'a', 'b', 'c')

      expect(set.get(0)).toBe('a')
      expect(set.get(1)).toBe('b')
      expect(set.get(2)).toBe('c')
    })

    it('returns undefined for out-of-bounds index', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, 'a')

      expect(set.get(1)).toBeUndefined()
      expect(set.get(-1)).toBeUndefined()
    })
  })

  describe('size', () => {
    it('returns 0 for empty set', () => {
      const set = new IndexedSet<string>()
      expect(set.size).toBe(0)
    })

    it('returns correct size after insertions', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, 'a', 'b', 'c')
      expect(set.size).toBe(3)
    })

    it('returns correct size after deletions', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, 'a', 'b', 'c')
      set.delete('b')
      expect(set.size).toBe(2)
    })
  })

  describe('clear', () => {
    it('removes all elements', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, 'a', 'b', 'c')
      set.clear()

      expect(set.size).toBe(0)
      expect(set.has('a')).toBe(false)
      expect(set.get(0)).toBeUndefined()
    })
  })

  describe('find', () => {
    it('returns the first matching element', () => {
      const set = new IndexedSet<{id: number; name: string}>()
      set.insertAt(0, {id: 1, name: 'a'}, {id: 2, name: 'b'}, {id: 3, name: 'c'})

      const found = set.find(el => el.id === 2)
      expect(found).toEqual({id: 2, name: 'b'})
    })

    it('returns undefined when no match', () => {
      const set = new IndexedSet<{id: number}>()
      set.insertAt(0, {id: 1}, {id: 2})

      expect(set.find(el => el.id === 99)).toBeUndefined()
    })
  })

  describe('[Symbol.iterator]', () => {
    it('allows iteration with for...of', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, 'a', 'b', 'c')

      const result: string[] = []
      for (const item of set) {
        result.push(item)
      }

      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('allows spread operator', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, 'a', 'b', 'c')

      expect([...set]).toEqual(['a', 'b', 'c'])
    })

    it('allows Array.from', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, 'a', 'b', 'c')

      expect(Array.from(set)).toEqual(['a', 'b', 'c'])
    })
  })

  describe('with HTMLElements', () => {
    it('works with DOM elements', () => {
      const set = new IndexedSet<HTMLElement>()
      const div1 = document.createElement('div')
      const div2 = document.createElement('div')
      const div3 = document.createElement('div')

      set.insertAt(0, div1, div2, div3)

      expect(set.has(div1)).toBe(true)
      expect(set.has(div2)).toBe(true)
      expect(set.indexOf(div2)).toBe(1)
      expect(set.get(0)).toBe(div1)

      set.delete(div2)
      expect(set.has(div2)).toBe(false)
      expect(set.size).toBe(2)
    })
  })
})
