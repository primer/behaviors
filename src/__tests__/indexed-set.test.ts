import {IndexedSet} from '../utils/indexed-set'

describe('IndexedSet', () => {
  describe('insertAt', () => {
    it('inserts elements at the specified index', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, ['a', 'b', 'c'])

      expect(set.get(0)).toBe('a')
      expect(set.get(1)).toBe('b')
      expect(set.get(2)).toBe('c')
      expect(set.size).toBe(3)
    })

    it('inserts elements in the middle', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, ['a', 'c'])
      set.insertAt(1, ['b'])

      expect(set.get(0)).toBe('a')
      expect(set.get(1)).toBe('b')
      expect(set.get(2)).toBe('c')
    })

    it('deduplicates elements', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, ['a', 'b'])
      set.insertAt(2, ['b', 'c']) // 'b' should be ignored

      expect(set.size).toBe(3)
      expect(set.get(0)).toBe('a')
      expect(set.get(1)).toBe('b')
      expect(set.get(2)).toBe('c')
    })

    it('handles inserting all duplicates', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, ['a', 'b'])
      set.insertAt(0, ['a', 'b']) // all duplicates

      expect(set.size).toBe(2)
    })
  })

  describe('delete', () => {
    it('removes an element and returns true', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, ['a', 'b', 'c'])

      expect(set.delete('b')).toBe(true)
      expect(set.size).toBe(2)
      expect(set.has('b')).toBe(false)
      expect(set.get(0)).toBe('a')
      expect(set.get(1)).toBe('c')
    })

    it('returns false for non-existent element', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, ['a'])

      expect(set.delete('b')).toBe(false)
      expect(set.size).toBe(1)
    })
  })

  describe('has', () => {
    it('returns true for existing elements', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, ['a', 'b'])

      expect(set.has('a')).toBe(true)
      expect(set.has('b')).toBe(true)
    })

    it('returns false for non-existent elements', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, ['a'])

      expect(set.has('b')).toBe(false)
    })

    it('returns false after element is deleted', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, ['a'])
      set.delete('a')

      expect(set.has('a')).toBe(false)
    })
  })

  describe('indexOf', () => {
    it('returns the index of an existing element', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, ['a', 'b', 'c'])

      expect(set.indexOf('a')).toBe(0)
      expect(set.indexOf('b')).toBe(1)
      expect(set.indexOf('c')).toBe(2)
    })

    it('returns -1 for non-existent elements', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, ['a'])

      expect(set.indexOf('b')).toBe(-1)
    })
  })

  describe('get', () => {
    it('returns the element at the specified index', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, ['a', 'b', 'c'])

      expect(set.get(0)).toBe('a')
      expect(set.get(1)).toBe('b')
      expect(set.get(2)).toBe('c')
    })

    it('returns undefined for out-of-bounds index', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, ['a'])

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
      set.insertAt(0, ['a', 'b', 'c'])
      expect(set.size).toBe(3)
    })

    it('returns correct size after deletions', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, ['a', 'b', 'c'])
      set.delete('b')
      expect(set.size).toBe(2)
    })
  })

  describe('clear', () => {
    it('removes all elements', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, ['a', 'b', 'c'])
      set.clear()

      expect(set.size).toBe(0)
      expect(set.has('a')).toBe(false)
      expect(set.get(0)).toBeUndefined()
    })
  })

  describe('find', () => {
    it('returns the first matching element', () => {
      const set = new IndexedSet<{id: number; name: string}>()
      set.insertAt(0, [
        {id: 1, name: 'a'},
        {id: 2, name: 'b'},
        {id: 3, name: 'c'},
      ])

      const found = set.find(el => el.id === 2)
      expect(found).toEqual({id: 2, name: 'b'})
    })

    it('returns undefined when no match', () => {
      const set = new IndexedSet<{id: number}>()
      set.insertAt(0, [{id: 1}, {id: 2}])

      expect(set.find(el => el.id === 99)).toBeUndefined()
    })
  })

  describe('[Symbol.iterator]', () => {
    it('allows iteration with for...of', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, ['a', 'b', 'c'])

      const result: string[] = []
      for (const item of set) {
        result.push(item)
      }

      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('allows spread operator', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, ['a', 'b', 'c'])

      expect([...set]).toEqual(['a', 'b', 'c'])
    })

    it('allows Array.from', () => {
      const set = new IndexedSet<string>()
      set.insertAt(0, ['a', 'b', 'c'])

      expect(Array.from(set)).toEqual(['a', 'b', 'c'])
    })
  })

  describe('with HTMLElements', () => {
    it('works with DOM elements', () => {
      const set = new IndexedSet<HTMLElement>()
      const div1 = document.createElement('div')
      const div2 = document.createElement('div')
      const div3 = document.createElement('div')

      set.insertAt(0, [div1, div2, div3])

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

describe('large dataset performance', () => {
  it('handles inserting 45,000 elements', () => {
    const set = new IndexedSet<number>()
    const elements = Array.from({length: 45000}, (_, i) => i)

    set.insertAt(0, elements)

    expect(set.size).toBe(45000)
    expect(set.get(0)).toBe(0)
    expect(set.get(44999)).toBe(44999)
    expect(set.has(22500)).toBe(true)
    expect(set.indexOf(22500)).toBe(22500)
  })

  it('handles inserting 45,000 elements at middle index', () => {
    const set = new IndexedSet<number>()
    set.insertAt(0, [0, 1, 2])

    const elements = Array.from({length: 45000}, (_, i) => i + 100)
    set.insertAt(1, elements) // Insert in middle

    expect(set.size).toBe(45003)
    expect(set.get(0)).toBe(0)
    expect(set.get(1)).toBe(100) // First inserted element
    expect(set.get(45001)).toBe(1) // Shifted original element
    expect(set.get(45002)).toBe(2) // Shifted original element
  })

  it('handles inserting 45,000 elements at the beginning', () => {
    const set = new IndexedSet<number>()
    set.insertAt(0, [-1, -2, -3])

    const elements = Array.from({length: 45000}, (_, i) => i)
    set.insertAt(0, elements) // Prepend

    expect(set.size).toBe(45003)
    expect(set.get(0)).toBe(0)
    expect(set.get(44999)).toBe(44999)
    expect(set.get(45000)).toBe(-1) // Original elements shifted
    expect(set.indexOf(-1)).toBe(45000)
  })

  it('deduplicates within a large array', () => {
    const set = new IndexedSet<number>()
    // Create array with duplicates: [0, 1, 2, ..., 22499, 0, 1, 2, ..., 22499]
    const elements = Array.from({length: 45000}, (_, i) => i % 22500)

    set.insertAt(0, elements)

    expect(set.size).toBe(22500) // Should deduplicate
    expect(set.has(0)).toBe(true)
    expect(set.has(22499)).toBe(true)
  })

  it('filters out existing elements when inserting large array', () => {
    const set = new IndexedSet<number>()
    set.insertAt(
      0,
      Array.from({length: 1000}, (_, i) => i),
    )

    // Try to insert 45k elements, 1000 of which already exist
    const newElements = Array.from({length: 45000}, (_, i) => i)
    set.insertAt(1000, newElements)

    expect(set.size).toBe(45000) // 1000 original + 44000 new
  })
})
