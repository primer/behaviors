import type {Meta, StoryObj} from '@storybook/react-vite'
import React, {useEffect, useRef, useState} from 'react'
import {getAnchoredPosition, type AnchorSide, type AnchorAlignment, type PositionSettings} from '../anchored-position'
import styles from './anchored-position.stories.module.css'

interface AnchoredPositionArgs extends Partial<PositionSettings> {
  floatingWidth: number
  floatingHeight: number
  anchorWidth: number
  anchorHeight: number
}

const meta: Meta<AnchoredPositionArgs> = {
  render: (args: AnchoredPositionArgs) => <AnchoredPositionDemo args={args} />,
  title: 'Behaviors/Anchored Position',
  parameters: {
    docs: {
      description: {
        component: `The \`getAnchoredPosition\` behavior calculates the position of a "floating" element that is anchored to another DOM element. This is useful for implementing overlay UI, such as dialogs, popovers, tooltips, toasts, and dropdown-style menus.\n\nThe algorithm attempts to find the most suitable position for the floating element based on the passed-in settings, ensuring it doesn't overflow the container's bounding box.`,
      },
    },
  },
  argTypes: {
    side: {
      control: 'select',
      options: [
        'outside-top',
        'outside-bottom',
        'outside-left',
        'outside-right',
        'inside-top',
        'inside-bottom',
        'inside-left',
        'inside-right',
        'inside-center',
      ] as AnchorSide[],
      description: 'The side of the anchor element to position the floating element',
      table: {
        type: {summary: 'AnchorSide'},
        defaultValue: {summary: 'outside-bottom'},
      },
    },
    align: {
      control: 'radio',
      options: ['start', 'center', 'end'] as AnchorAlignment[],
      description: 'How to align the floating element with the anchor element',
      table: {
        type: {summary: 'AnchorAlignment'},
        defaultValue: {summary: 'start'},
      },
    },
    anchorOffset: {
      control: {type: 'number', min: -20, max: 40, step: 2},
      description: 'The number of pixels between the anchor edge and the floating element',
      table: {
        type: {summary: 'number'},
        defaultValue: {summary: '4'},
      },
    },
    alignmentOffset: {
      control: {type: 'number', min: -20, max: 40, step: 2},
      description: 'Additional offset to move the floating element from the aligning edge',
      table: {
        type: {summary: 'number'},
        defaultValue: {summary: '0 or 4'},
      },
    },
    allowOutOfBounds: {
      control: 'boolean',
      description: 'Allow the floating element to overflow the container bounds',
      table: {
        type: {summary: 'boolean'},
        defaultValue: {summary: 'false'},
      },
    },
    floatingWidth: {
      control: {type: 'number', min: 50, max: 300, step: 10},
      description: 'Width of the floating element (for demo purposes)',
      table: {
        category: 'Demo Settings',
      },
    },
    floatingHeight: {
      control: {type: 'number', min: 50, max: 300, step: 10},
      description: 'Height of the floating element (for demo purposes)',
      table: {
        category: 'Demo Settings',
      },
    },
    anchorWidth: {
      control: {type: 'number', min: 50, max: 200, step: 10},
      description: 'Width of the anchor element (for demo purposes)',
      table: {
        category: 'Demo Settings',
      },
    },
    anchorHeight: {
      control: {type: 'number', min: 50, max: 200, step: 10},
      description: 'Height of the anchor element (for demo purposes)',
      table: {
        category: 'Demo Settings',
      },
    },
  },
}

export default meta
type Story = StoryObj<AnchoredPositionArgs>

const AnchoredPositionDemo: React.FC<{args: AnchoredPositionArgs}> = ({args}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const floatingRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{
    top: number
    left: number
    anchorSide: AnchorSide
    anchorAlign: AnchorAlignment
  } | null>(null)

  const {floatingWidth, floatingHeight, anchorWidth, anchorHeight, ...positionSettings} = args

  useEffect(() => {
    const updatePosition = () => {
      if (anchorRef.current && floatingRef.current) {
        const result = getAnchoredPosition(floatingRef.current, anchorRef.current, positionSettings)
        setPosition(result)
      }
    }

    updatePosition()

    const resizeObserver = new ResizeObserver(updatePosition)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [
    positionSettings.side,
    positionSettings.align,
    positionSettings.anchorOffset,
    positionSettings.alignmentOffset,
    positionSettings.allowOutOfBounds,
    floatingWidth,
    floatingHeight,
    anchorWidth,
    anchorHeight,
  ])

  return (
    <div className={styles.demo}>
      <div className={styles.info}>
        <div className={styles.infoSection}>
          <h4>Calculated Position</h4>
          {position && (
            <dl className={styles.details}>
              <dt>Top:</dt>
              <dd>{Math.round(position.top)}px</dd>
              <dt>Left:</dt>
              <dd>{Math.round(position.left)}px</dd>
              <dt>Actual Side:</dt>
              <dd>{position.anchorSide}</dd>
              <dt>Actual Align:</dt>
              <dd>{position.anchorAlign}</dd>
            </dl>
          )}
        </div>
      </div>
      <div ref={containerRef} className={styles.container}>
        <div
          ref={anchorRef}
          className={styles.anchor}
          style={{
            width: `${anchorWidth}px`,
            height: `${anchorHeight}px`,
          }}
        >
          Anchor
        </div>
        <div
          ref={floatingRef}
          className={styles.floating}
          style={{
            width: `${floatingWidth}px`,
            height: `${floatingHeight}px`,
            top: position ? `${position.top}px` : '0',
            left: position ? `${position.left}px` : '0',
            visibility: position ? 'visible' : 'hidden',
          }}
        >
          Floating
        </div>
      </div>
    </div>
  )
}

export const OutsideBottom: Story = {
  args: {
    side: 'outside-bottom',
    align: 'start',
    anchorOffset: 4,
    alignmentOffset: 0,
    allowOutOfBounds: false,
    floatingWidth: 150,
    floatingHeight: 100,
    anchorWidth: 100,
    anchorHeight: 80,
  },
}

export const OutsideTop: Story = {
  args: {
    side: 'outside-top',
    align: 'start',
    anchorOffset: 4,
    alignmentOffset: 0,
    allowOutOfBounds: false,
    floatingWidth: 150,
    floatingHeight: 100,
    anchorWidth: 100,
    anchorHeight: 80,
  },
}

export const OutsideRight: Story = {
  args: {
    side: 'outside-right',
    align: 'start',
    anchorOffset: 4,
    alignmentOffset: 0,
    allowOutOfBounds: false,
    floatingWidth: 150,
    floatingHeight: 100,
    anchorWidth: 100,
    anchorHeight: 80,
  },
}

export const OutsideLeft: Story = {
  args: {
    side: 'outside-left',
    align: 'start',
    anchorOffset: 4,
    alignmentOffset: 0,
    allowOutOfBounds: false,
    floatingWidth: 150,
    floatingHeight: 100,
    anchorWidth: 100,
    anchorHeight: 80,
  },
}

export const CenterAlignment: Story = {
  args: {
    side: 'outside-bottom',
    align: 'center',
    anchorOffset: 4,
    alignmentOffset: 0,
    allowOutOfBounds: false,
    floatingWidth: 150,
    floatingHeight: 100,
    anchorWidth: 100,
    anchorHeight: 80,
  },
}

export const EndAlignment: Story = {
  args: {
    side: 'outside-bottom',
    align: 'end',
    anchorOffset: 4,
    alignmentOffset: 0,
    allowOutOfBounds: false,
    floatingWidth: 150,
    floatingHeight: 100,
    anchorWidth: 100,
    anchorHeight: 80,
  },
}

export const InsideCenter: Story = {
  args: {
    side: 'inside-center',
    align: 'center',
    anchorOffset: 0,
    alignmentOffset: 0,
    allowOutOfBounds: false,
    floatingWidth: 200,
    floatingHeight: 150,
    anchorWidth: 120,
    anchorHeight: 100,
  },
}

export const WithOffsets: Story = {
  args: {
    side: 'outside-right',
    align: 'center',
    anchorOffset: 20,
    alignmentOffset: 10,
    allowOutOfBounds: false,
    floatingWidth: 150,
    floatingHeight: 100,
    anchorWidth: 100,
    anchorHeight: 80,
  },
}
