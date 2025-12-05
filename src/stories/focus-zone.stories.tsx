import type {Meta, StoryObj} from '@storybook/react-vite'
import React, {useEffect, useRef, useState} from 'react'
import {focusZone, FocusKeys} from '../focus-zone'
import styles from './focus-zone.stories.module.css'
import clsx from 'clsx'

type BindKeysOption =
  | 'Arrow Horizontal'
  | 'Arrow Vertical'
  | 'J and K'
  | 'H and L'
  | 'Home and End'
  | 'Page Up and Down'
  | 'W and S'
  | 'A and D'
  | 'Tab'
  | 'Backspace'

type FocusZoneArgs = {
  bindKeys: BindKeysOption[]
  focusOutBehavior: 'stop' | 'wrap'
  focusInStrategy: 'first' | 'previous' | 'closest' | 'initial'
}

const meta: Meta<FocusZoneArgs> = {
  title: 'Behaviors/Focus Zone',
  argTypes: {
    bindKeys: {
      control: 'check',
      options: [
        'Arrow Horizontal',
        'Arrow Vertical',
        'J and K',
        'H and L',
        'Home and End',
        'Page Up and Down',
        'W and S',
        'A and D',
        'Tab',
        'Backspace',
      ],
    },
    focusOutBehavior: {
      control: 'radio',
      options: ['stop', 'wrap'],
    },
    focusInStrategy: {
      control: 'radio',
      options: ['first', 'previous', 'closest', 'initial'],
    },
  },
}

export default meta
type Story = StoryObj<FocusZoneArgs>

type FocusZoneFrameProps = {
  args?: FocusZoneArgs
  children: (zoneRef: React.RefObject<HTMLDivElement | null>, isActive: boolean) => React.ReactNode
}

const FocusZoneFrame: React.FC<FocusZoneFrameProps> = ({args, children}) => {
  const zoneRef = useRef<HTMLDivElement>(null)
  const [controller, setController] = useState<AbortController | undefined>(undefined)

  const isActive = !!controller

  const activateZone = () => {
    if (!zoneRef.current || controller || !args) {
      return
    }

    const keyLabelMap: Record<BindKeysOption, FocusKeys> = {
      'Arrow Horizontal': FocusKeys.ArrowHorizontal,
      'Arrow Vertical': FocusKeys.ArrowVertical,
      'J and K': FocusKeys.JK,
      'H and L': FocusKeys.HL,
      'Home and End': FocusKeys.HomeAndEnd,
      'Page Up and Down': FocusKeys.PageUpDown,
      'W and S': FocusKeys.WS,
      'A and D': FocusKeys.AD,
      Tab: FocusKeys.Tab,
      Backspace: FocusKeys.Backspace,
    }

    const combinedBindKeys = args.bindKeys.reduce((acc, keyLabel) => acc | (keyLabelMap[keyLabel] || 0), 0)

    setController(
      focusZone(zoneRef.current, {
        bindKeys: combinedBindKeys,
        focusOutBehavior: args.focusOutBehavior,
        focusInStrategy: args.focusInStrategy,
      }),
    )
  }

  const deactivateZone = () => {
    if (controller) {
      controller.abort()
      setController(undefined)
    }
  }

  useEffect(() => {
    return () => {
      deactivateZone()
    }
  }, [])

  useEffect(() => {
    if (args && isActive && zoneRef.current) {
      // Recreate the focus zone when args change
      deactivateZone()
      activateZone()
    }
  }, [args?.bindKeys, args?.focusOutBehavior, args?.focusInStrategy])

  return (
    <div className="sb-demo">
      <div className="sb-controls">
        <button onClick={activateZone} disabled={isActive}>
          Activate Focus Zone
        </button>
        <button onClick={deactivateZone} disabled={!isActive}>
          Deactivate Focus Zone
        </button>
        <span className="sb-status">
          Status: <strong>{isActive ? 'Active' : 'Inactive'}</strong>
        </span>
      </div>

      <div className={styles.container}>{children(zoneRef, isActive)}</div>
      <button>Trailing button</button>
    </div>
  )
}

export const VerticalList: Story = {
  args: {
    bindKeys: ['Arrow Vertical'],
    focusOutBehavior: 'stop',
    focusInStrategy: 'initial',
  },
  render: args => (
    <FocusZoneFrame args={args}>
      {(zoneRef, isActive) => (
        <div ref={zoneRef} className={clsx(styles.content, isActive && styles.active)}>
          <h1>Vertical List</h1>
          <p className={clsx('sb-instructions', isActive && 'active')}>
            {isActive ? (
              <>
                Use arrow keys (or configured keys) to move focus. <kbd>Tab</kbd> moves out of the zone.
              </>
            ) : (
              'Activate the zone to enable keyboard navigation.'
            )}
          </p>
          <div className={styles.verticalList}>
            <button>Item 1</button>
            <button>Item 2</button>
            <button>Item 3</button>
            <button>Item 4</button>
            <button>Item 5</button>
          </div>
        </div>
      )}
    </FocusZoneFrame>
  ),
}

export const HorizontalList: Story = {
  args: {
    bindKeys: ['Arrow Horizontal'],
    focusOutBehavior: 'stop',
    focusInStrategy: 'previous',
  },
  render: args => (
    <FocusZoneFrame args={args}>
      {(zoneRef, isActive) => (
        <div ref={zoneRef} className={`${styles.content} ${isActive ? styles.active : ''}`}>
          <h1>Horizontal List</h1>
          <p className={clsx('sb-instructions', isActive && 'active')}>
            {isActive ? (
              <>
                Use arrow keys (or configured keys) to move focus. <kbd>Tab</kbd> moves out of the zone.
              </>
            ) : (
              'Activate the zone to enable keyboard navigation.'
            )}
          </p>
          <div className={styles.horizontalList}>
            <button>Button 1</button>
            <button>Button 2</button>
            <button>Button 3</button>
            <button>Button 4</button>
            <button>Button 5</button>
          </div>
        </div>
      )}
    </FocusZoneFrame>
  ),
}

export const ClosestStrategy: Story = {
  args: {
    bindKeys: ['Arrow Vertical'],
    focusOutBehavior: 'stop',
    focusInStrategy: 'closest',
  },
  render: args => (
    <FocusZoneFrame args={args}>
      {(zoneRef, isActive) => (
        <div ref={zoneRef} className={clsx(styles.content, isActive && styles.active)}>
          <h1>Closest Strategy</h1>
          <p className={clsx('sb-instructions', isActive && 'active')}>
            {isActive ? (
              'The "closest" strategy focuses the first item when tabbing forward, or the last item when shift-tabbing backward. Try it!'
            ) : (
              <>
                Activate the zone, then use <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> from outside elements to
                see closest strategy in action.
              </>
            )}
          </p>
          <div className={styles.verticalList}>
            <button>First Item</button>
            <button>Second Item</button>
            <button>Third Item</button>
            <button>Fourth Item</button>
            <button>Last Item</button>
          </div>
        </div>
      )}
    </FocusZoneFrame>
  ),
}

export const GridNavigation: Story = {
  args: {
    bindKeys: ['Arrow Horizontal', 'Arrow Vertical'],
    focusOutBehavior: 'stop',
    focusInStrategy: 'previous',
  },
  render: () => {
    const [isActive, setIsActive] = useState(false)
    const gridRef = useRef<HTMLDivElement>(null)
    const [controller, setController] = useState<AbortController | undefined>(undefined)

    const activateZone = () => {
      if (!gridRef.current || controller) return

      const getNextFocusable = (
        direction: 'previous' | 'next' | 'start' | 'end',
        from: Element | undefined,
        event: KeyboardEvent,
      ): HTMLElement | undefined => {
        if (!from || !gridRef.current) return undefined

        const buttons = Array.from(gridRef.current.querySelectorAll('button'))
        const currentIndex = buttons.indexOf(from as HTMLButtonElement)
        if (currentIndex === -1) return undefined

        const cols = 4
        const rows = Math.ceil(buttons.length / cols)
        const currentRow = Math.floor(currentIndex / cols)
        const currentCol = currentIndex % cols

        let newIndex: number | undefined = currentIndex

        const key = event.key

        if (key === 'ArrowLeft' && currentCol > 0) {
          newIndex = currentIndex - 1
        } else if (key === 'ArrowRight' && currentCol < cols - 1 && currentIndex + 1 < buttons.length) {
          newIndex = currentIndex + 1
        } else if (key === 'ArrowUp' && currentRow > 0) {
          newIndex = currentIndex - cols
        } else if (key === 'ArrowDown' && currentRow < rows - 1 && currentIndex + cols < buttons.length) {
          newIndex = currentIndex + cols
        }

        return buttons[newIndex]
      }

      setController(
        focusZone(gridRef.current, {
          bindKeys: FocusKeys.ArrowAll,
          focusOutBehavior: 'stop',
          focusInStrategy: 'previous',
          getNextFocusable,
        }),
      )
      setIsActive(true)
    }

    const deactivateZone = () => {
      if (controller) {
        controller.abort()
        setController(undefined)
        setIsActive(false)
      }
    }

    useEffect(() => {
      return () => {
        if (controller) controller.abort()
      }
    }, [controller])

    return (
      <div className="sb-demo">
        <div className="sb-controls">
          <button onClick={activateZone} disabled={isActive}>
            Activate Focus Zone
          </button>
          <button onClick={deactivateZone} disabled={!isActive}>
            Deactivate Focus Zone
          </button>
          <span className="sb-status">
            Status: <strong>{isActive ? 'Active' : 'Inactive'}</strong>
          </span>
        </div>
        <div className={styles.container}>
          <div ref={gridRef} className={clsx(styles.content, isActive && styles.active)}>
            <h1>2D Grid Navigation</h1>
            <p className={clsx('sb-instructions', isActive && 'active')}>
              {isActive ? (
                <>
                  Use arrow keys to navigate the grid in 2D. Custom <code>getNextFocusable</code> callback enables this
                  behavior.
                </>
              ) : (
                'Activate to enable 2D grid navigation with arrow keys.'
              )}
            </p>
            <div className={styles.grid}>
              {Array.from({length: 12}, (_, i) => (
                <button key={i}>Cell {i + 1}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  },
}

export const FilteredElements: Story = {
  args: {
    bindKeys: ['Arrow Vertical'],
    focusOutBehavior: 'stop',
    focusInStrategy: 'previous',
  },
  render: () => {
    const [isActive, setIsActive] = useState(false)
    const [skipEvenItems, setSkipEvenItems] = useState(true)
    const listRef = useRef<HTMLDivElement>(null)
    const [controller, setController] = useState<AbortController | undefined>(undefined)

    const activateZone = () => {
      if (!listRef.current || controller) return

      const focusableElementFilter = skipEvenItems
        ? (element: HTMLElement) => {
            const index = Number(element.getAttribute('data-index'))
            if (Number.isNaN(index)) return true
            return (index + 1) % 2 !== 0
          }
        : undefined

      setController(
        focusZone(listRef.current, {
          bindKeys: FocusKeys.ArrowVertical | FocusKeys.HomeAndEnd,
          focusOutBehavior: 'stop',
          focusInStrategy: 'previous',
          focusableElementFilter,
        }),
      )
      setIsActive(true)
    }

    const deactivateZone = () => {
      if (controller) {
        controller.abort()
        setController(undefined)
        setIsActive(false)
      }
    }

    useEffect(() => {
      return () => {
        if (controller) controller.abort()
      }
    }, [controller])

    useEffect(() => {
      if (isActive) {
        deactivateZone()
        activateZone()
      }
    }, [skipEvenItems])

    return (
      <div className="sb-demo">
        <div className="sb-controls">
          <button onClick={activateZone} disabled={isActive}>
            Activate Focus Zone
          </button>
          <button onClick={deactivateZone} disabled={!isActive}>
            Deactivate Focus Zone
          </button>
          <label>
            <input
              type="checkbox"
              checked={skipEvenItems}
              onChange={e => setSkipEvenItems(e.target.checked)}
              disabled={isActive}
            />
            Skip even-numbered items
          </label>
          <span className="sb-status">
            Status: <strong>{isActive ? 'Active' : 'Inactive'}</strong>
          </span>
        </div>
        <div className={styles.container}>
          <div ref={listRef} className={clsx(styles.content, isActive && styles.active)}>
            <h1>Filtered Elements</h1>
            <p className={clsx('sb-instructions', isActive && 'active')}>
              {isActive ? (
                skipEvenItems ? (
                  'Arrow keys skip even-numbered items using focusableElementFilter callback.'
                ) : (
                  'Arrow keys include every item (no filter).'
                )
              ) : (
                <>
                  Toggle the filter and activate to see how <code>focusableElementFilter</code> works.
                </>
              )}
            </p>
            <div className={styles.verticalList}>
              {Array.from({length: 6}, (_, i) => {
                const isEvenItem = (i + 1) % 2 === 0
                const isFilteredOut = skipEvenItems && isEvenItem
                return (
                  <button
                    key={i}
                    data-index={i}
                    tabIndex={isFilteredOut ? -1 : undefined}
                    aria-disabled={isFilteredOut ? true : undefined}
                  >
                    Item {i + 1}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  },
}

export const ActiveDescendant: Story = {
  args: {
    bindKeys: ['Arrow Vertical'],
    focusOutBehavior: 'stop',
    focusInStrategy: 'previous',
  },
  render: () => {
    const [isActive, setIsActive] = useState(false)
    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    const controlRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const [controller, setController] = useState<AbortController | undefined>(undefined)

    const activateZone = () => {
      if (!listRef.current || !controlRef.current || controller) return

      const onActiveDescendantChanged = (
        newActiveDescendant: HTMLElement | undefined,
        previousActiveDescendant: HTMLElement | undefined,
      ) => {
        if (previousActiveDescendant) {
          previousActiveDescendant.classList.remove(styles.activeDescendant)
        }

        if (newActiveDescendant) {
          newActiveDescendant.classList.add(styles.activeDescendant)
          const index = Array.from(listRef.current!.children).indexOf(newActiveDescendant)
          setActiveIndex(index)
        } else {
          setActiveIndex(null)
        }
      }

      setController(
        focusZone(listRef.current, {
          bindKeys: FocusKeys.ArrowVertical | FocusKeys.HomeAndEnd,
          focusOutBehavior: 'stop',
          focusInStrategy: 'previous',
          activeDescendantControl: controlRef.current,
          onActiveDescendantChanged,
        }),
      )
      setIsActive(true)

      controlRef.current.focus()
    }

    const deactivateZone = () => {
      if (controller) {
        controller.abort()
        setController(undefined)
        setIsActive(false)
        setActiveIndex(null)
      }
    }

    useEffect(() => {
      return () => {
        if (controller) controller.abort()
      }
    }, [controller])

    return (
      <div className="sb-demo">
        <div className="sb-controls">
          <button onClick={activateZone} disabled={isActive}>
            Activate Focus Zone
          </button>
          <button onClick={deactivateZone} disabled={!isActive}>
            Deactivate Focus Zone
          </button>
          <span className="sb-status">
            Status: <strong>{isActive ? 'Active' : 'Inactive'}</strong>
            {activeIndex !== null && ` | Active: Item ${activeIndex + 1}`}
          </span>
        </div>
        <div className={styles.container}>
          <div className={clsx(styles.content, isActive && styles.active)}>
            <h1>Active Descendant Mode</h1>
            <p className={clsx('sb-instructions', isActive && 'active')}>
              {isActive ? (
                <>
                  DOM focus stays on the control. Arrow keys change <code>aria-activedescendant</code>. Notice the
                  highlighted item changes without focus ring movement.
                </>
              ) : (
                'Activate to see Active Descendant mode - an alternative focus management pattern for accessibility.'
              )}
            </p>
            <div ref={controlRef} tabIndex={0} className={styles.activeDescendantControl} aria-label="Listbox control">
              <div ref={listRef} role="listbox" className={styles.activeDescendantList}>
                {Array.from({length: 5}, (_, i) => (
                  <div key={i} role="option" id={`option-${i}`} tabIndex={-1} className={styles.activeDescendantItem}>
                    Option {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
}

export const ActiveDescendantWithInput: Story = {
  args: {
    bindKeys: ['Arrow Vertical'],
    focusOutBehavior: 'stop',
    focusInStrategy: 'initial',
  },
  render: () => {
    const [isActive, setIsActive] = useState(false)
    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    const controlRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const [controller, setController] = useState<AbortController | undefined>(undefined)

    const activateZone = () => {
      if (!listRef.current || !controlRef.current || controller) return

      const onActiveDescendantChanged = (
        newActiveDescendant: HTMLElement | undefined,
        previousActiveDescendant: HTMLElement | undefined,
      ) => {
        if (previousActiveDescendant) {
          previousActiveDescendant.classList.remove(styles.activeDescendant)
        }

        if (newActiveDescendant) {
          newActiveDescendant.classList.add(styles.activeDescendant)
          const index = Array.from(listRef.current!.children).indexOf(newActiveDescendant)
          setActiveIndex(index)
        } else {
          setActiveIndex(null)
        }
      }

      setController(
        focusZone(listRef.current, {
          bindKeys: FocusKeys.ArrowVertical | FocusKeys.HomeAndEnd,
          focusOutBehavior: 'wrap',
          focusInStrategy: 'initial',
          activeDescendantControl: controlRef.current,
          onActiveDescendantChanged,
        }),
      )
      setIsActive(true)

      controlRef.current.focus()
    }

    const deactivateZone = () => {
      if (controller) {
        controller.abort()
        setController(undefined)
        setIsActive(false)
        setActiveIndex(null)
      }
    }

    useEffect(() => {
      return () => {
        if (controller) controller.abort()
      }
    }, [controller])

    useEffect(() => {
      activateZone()
    }, [])

    return (
      <div className="sb-demo">
        <div className="sb-controls">
          <button onClick={activateZone} disabled={isActive}>
            Activate Focus Zone
          </button>
          <button onClick={deactivateZone} disabled={!isActive}>
            Deactivate Focus Zone
          </button>
          <span className="sb-status">
            Status: <strong>{isActive ? 'Active' : 'Inactive'}</strong>
            {activeIndex !== null && ` | Active: Item ${activeIndex + 1}`}
          </span>
        </div>
        <div className={styles.container}>
          <div className={clsx(styles.content, isActive && styles.active)}>
            <h1>Active Descendant Mode</h1>
            <p className={clsx('sb-instructions', isActive && 'active')}>
              {isActive ? (
                <>
                  DOM focus stays on the control. Arrow keys change <code>aria-activedescendant</code>. Notice the
                  highlighted item changes without focus ring movement.
                </>
              ) : (
                'Activate to see Active Descendant mode - an alternative focus management pattern for accessibility.'
              )}
            </p>
            <div>
              <input
                type="text"
                role="combobox"
                aria-label="Navigate Items"
                className={styles.activeDescendantInput}
                ref={controlRef}
              />
              <div className={styles.activeDescendantControl} aria-label="Listbox control">
                <div ref={listRef} role="listbox" className={styles.activeDescendantList}>
                  {Array.from({length: 5}, (_, i) => (
                    <div key={i} role="option" id={`option-${i}`} tabIndex={-1} className={styles.activeDescendantItem}>
                      Option {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
}
