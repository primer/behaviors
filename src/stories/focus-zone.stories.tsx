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
  focusInStrategy: 'first' | 'previous'
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
      options: ['first', 'previous'],
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
  }, [controller])

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
    </div>
  )
}

export const VerticalList: Story = {
  args: {
    bindKeys: ['Arrow Vertical'],
    focusOutBehavior: 'stop',
    focusInStrategy: 'previous',
  },
  render: args => (
    <FocusZoneFrame args={args}>
      {(zoneRef, isActive) => (
        <div ref={zoneRef} className={clsx(styles.content, isActive && styles.active)}>
          <h1>Vertical List</h1>
          <p className={clsx('sb-instructions', isActive && 'active')}>
            {isActive
              ? 'Use arrow keys (or configured keys) to move focus. Tab moves out of the zone.'
              : 'Activate the zone to enable keyboard navigation.'}
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
            {isActive
              ? 'Use arrow keys (or configured keys) to move focus. Tab moves out of the zone.'
              : 'Activate the zone to enable keyboard navigation.'}
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
