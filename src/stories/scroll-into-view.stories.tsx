import type {Meta, StoryObj} from '@storybook/react-vite'
import React, {useRef} from 'react'
import clsx from 'clsx/lite'
import {scrollIntoView, ScrollIntoViewOptions} from '../scroll-into-view'
import styles from './scroll-into-view.stories.module.css'

const meta: Meta<ScrollIntoViewOptions> = {
  render: (args: ScrollIntoViewOptions) => <ScrollDemo options={args} />,
  title: 'Behaviors/Scroll Into View',

  argTypes: {
    direction: {
      control: 'radio',
      options: ['vertical', 'horizontal'],
      description: 'The direction to scroll the viewing area',
    },
    startMargin: {
      control: {type: 'number', min: 0, max: 100, step: 4},
      description: 'A margin to leave between the start of the viewing area and the start of the child element',
    },
    endMargin: {
      control: {type: 'number', min: 0, max: 100, step: 4},
      description: 'A margin to leave between the end of the viewing area and the end of the child element',
    },
    behavior: {
      control: 'radio',
      options: ['smooth', 'instant', 'auto'],
      description: 'Behavior for the browser to use when scrolling',
    },
  },
}

export default meta
type Story = StoryObj<ScrollIntoViewOptions>

const ScrollDemo: React.FC<{options?: ScrollIntoViewOptions}> = ({options}) => {
  const viewingAreaRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Array<HTMLDivElement | null>>([])
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const isHorizontal = options?.direction === 'horizontal'

  const handleScrollToItem = (index: number) => {
    if (viewingAreaRef.current && itemRefs.current[index]) {
      setActiveIndex(index)
      scrollIntoView(itemRefs.current[index], viewingAreaRef.current, options)
    }
  }

  const scrollButtons = [0, 4, 9, 15, 19]

  return (
    <div className={styles.demo}>
      <div className={styles.controls}>
        {scrollButtons.map(index => (
          <button key={index} onClick={() => handleScrollToItem(index)}>
            Scroll to Item {index + 1}
          </button>
        ))}
      </div>
      <div
        ref={viewingAreaRef}
        className={clsx(styles.viewingArea, isHorizontal ? styles.horizontal : styles.vertical)}
      >
        <div className={clsx(styles.items)}>
          {Array.from({length: 20}, (_, i) => (
            <div
              key={i}
              ref={el => {
                itemRefs.current[i] = el
              }}
              className={clsx(styles.item, i === activeIndex && styles.active)}
              aria-current={i === activeIndex ? 'true' : undefined}
            >
              Item {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const Vertical: Story = {
  args: {
    direction: 'vertical',
    startMargin: 0,
    endMargin: 0,
    behavior: 'smooth',
  },
}

export const Horizontal: Story = {
  args: {
    direction: 'horizontal',
    startMargin: 0,
    endMargin: 0,
    behavior: 'smooth',
  },
}

export const WithMargins: Story = {
  args: {
    direction: 'vertical',
    startMargin: 20,
    endMargin: 20,
    behavior: 'smooth',
  },
}

export const InstantScroll: Story = {
  args: {
    direction: 'vertical',
    startMargin: 0,
    endMargin: 0,
    behavior: 'instant',
  },
}
