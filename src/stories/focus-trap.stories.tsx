import type {Meta, StoryObj} from '@storybook/react-vite'
import React, {useEffect, useRef, useState} from 'react'
import clsx from 'clsx'
import {focusTrap} from '../focus-trap'
import styles from './focus-trap.stories.module.css'

type FocusTrapArgs = {
  initialFocusIndex: number
  autoCloseSeconds?: number
}

const meta: Meta<FocusTrapArgs> = {
  render: args => <FocusTrapDemo args={args} />,
  title: 'Behaviors/Focus Trap',
  argTypes: {
    initialFocusIndex: {
      control: {type: 'number', min: 0, max: 4, step: 1},
    },
  },
}

export default meta
type Story = StoryObj<FocusTrapArgs>

const FocusTrapDemo: React.FC<{args: FocusTrapArgs}> = ({args}) => {
  const trapRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(args.autoCloseSeconds || 0)
  const controllerRef = useRef<AbortController | undefined>(undefined)
  const timerRef = useRef<number | undefined>(undefined)

  const activateTrap = () => {
    if (isActive || !trapRef.current) {
      return
    }

    let initialFocus: HTMLButtonElement | undefined

    if (args.initialFocusIndex >= 0 && args.initialFocusIndex < buttonRefs.current.length) {
      initialFocus = buttonRefs.current[args.initialFocusIndex] || undefined
    }

    const controller = args.autoCloseSeconds ? new AbortController() : undefined

    if (controller) {
      controllerRef.current = focusTrap(trapRef.current, initialFocus, controller.signal)
      setTimeLeft(args.autoCloseSeconds!)
    } else {
      controllerRef.current = focusTrap(trapRef.current, initialFocus)
    }

    setIsActive(true)
  }

  const deactivateTrap = () => {
    if (controllerRef.current) {
      controllerRef.current.abort()
      controllerRef.current = undefined
      setIsActive(false)
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = undefined
    }
  }

  useEffect(() => {
    if (isActive && args.autoCloseSeconds) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            deactivateTrap()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = undefined
      }
    }
  }, [isActive, args.autoCloseSeconds])

  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort()
      }
    }
  }, [])

  return (
    <div className="sb-demo">
      <div className="sb-controls">
        <button onClick={activateTrap} disabled={isActive}>
          Activate Focus Trap
        </button>
        <button onClick={deactivateTrap} disabled={!isActive}>
          Deactivate Focus Trap
        </button>
        <span className="sb-status">
          Status: <strong>{isActive ? 'Active' : 'Inactive'}</strong>
          {args.autoCloseSeconds && isActive && <> (closing in {timeLeft}s...)</>}
        </span>
      </div>
      <div
        ref={trapRef}
        className={clsx(styles.content, {
          [styles.active]: isActive,
        })}
      >
        <h1>Focus Trap Container</h1>
        <p className={clsx('sb-instructions', isActive && 'active')}>
          {isActive ? 'Focus is trapped!' : 'Activate the trap, then try to focus elements outside this area.'}
        </p>
        <div className={styles.buttons}>
          {Array.from({length: 5}).map((_, i) => (
            <button
              key={i}
              ref={el => {
                buttonRefs.current[i] = el
              }}
            >
              Button {i + 1}
            </button>
          ))}
        </div>
        <div className={styles.inputGroup}>
          <input type="text" placeholder="Text input" />
          <input type="checkbox" id="checkbox" />
          <label htmlFor="checkbox">Checkbox</label>
        </div>
        <button onClick={deactivateTrap} disabled={!isActive}>
          Deactivate Focus Trap
        </button>
      </div>
    </div>
  )
}

export const BasicTrap: Story = {
  args: {
    initialFocusIndex: 0,
  },
}

export const CustomInitialFocus: Story = {
  args: {
    initialFocusIndex: 2,
  },
}

export const ExternalAbortSignal: Story = {
  args: {
    initialFocusIndex: 0,
    autoCloseSeconds: 5,
  },
}
