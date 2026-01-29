import type {Meta, StoryObj} from '@storybook/react-vite'
import React, {useEffect, useRef, useState} from 'react'
import {getAnchoredPosition, type AnchorSide, type AnchorAlignment, type PositionSettings} from '../anchored-position'
import styles from './anchored-position.stories.module.css'

type AnchoredPositionArgs = Partial<PositionSettings> & {
  floatingWidth: number
  floatingHeight: number
  anchorWidth: number
  anchorHeight: number
}

const meta: Meta<AnchoredPositionArgs> = {
  render: (args: AnchoredPositionArgs) => <AnchoredPositionDemo args={args} />,
  title: 'Behaviors/Anchored Position',
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
    },
    align: {
      control: 'radio',
      options: ['start', 'center', 'end'] as AnchorAlignment[],
    },
    anchorOffset: {
      control: {type: 'number', step: 4},
    },
    alignmentOffset: {
      control: {type: 'number', step: 4},
    },
    allowOutOfBounds: {
      control: 'boolean',
    },
    floatingWidth: {
      control: {type: 'number', step: 10},
    },
    floatingHeight: {
      control: {type: 'number', step: 10},
    },
    anchorWidth: {
      control: {type: 'number', step: 10},
    },
    anchorHeight: {
      control: {type: 'number', step: 10},
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
          <h1>Calculated Position</h1>
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
      <div ref={containerRef} className={styles.viewport}>
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

// New interactive story with long content and dialog
const LongScrollableDemo: React.FC = () => {
  const anchorRef = useRef<HTMLButtonElement>(null)
  const floatingRef = useRef<HTMLDivElement>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [position, setPosition] = useState<{
    top: number
    left: number
    anchorSide: AnchorSide
    anchorAlign: AnchorAlignment
  } | null>(null)

  const toggleDialog = () => {
    setIsDialogOpen(!isDialogOpen)
    if (isOverlayOpen) {
      setIsOverlayOpen(false)
    }
  }

  const toggleOverlay = () => {
    setIsOverlayOpen(!isOverlayOpen)
  }

  useEffect(() => {
    if (isOverlayOpen && anchorRef.current && floatingRef.current) {
      const positionSettings: PositionSettings = {
        side: 'outside-bottom',
        align: 'start',
        anchorOffset: 8,
        alignmentOffset: 0,
        allowOutOfBounds: true,
      }
      
      const result = getAnchoredPosition(floatingRef.current, anchorRef.current, positionSettings)
      setPosition(result)
    }
  }, [isOverlayOpen])

  return (
    <div className={styles.longDemo}>
      {/* Trigger button to open dialog */}
      <div className={styles.triggerSection}>
        <h1>Long Scrollable Page with Floating Dialog</h1>
        <p>This page demonstrates anchored positioning within a floating dialog overlay.</p>
        <button 
          onClick={toggleDialog}
          className={styles.triggerButton}
        >
          Open Settings Dialog
        </button>
      </div>
      
      {/* Long content to create scroll */}
      <div className={styles.longContent}>
        {/* Create lots of content sections */}
        {Array.from({length: 35}, (_, i) => (
          <div key={i} className={styles.contentSection}>
            <h2>Section {i + 1}</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute 
              irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla 
              pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui 
              officia deserunt mollit anim id est laborum.
            </p>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium 
              doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore 
              veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
          </div>
        ))}
      </div>
      
      {/* Floating Dialog Modal */}
      {isDialogOpen && (
        <>
          <div className={styles.dialogBackdrop} onClick={toggleDialog} />
          <div className={styles.dialogContainer}>
            <div className={styles.dialog}>
              <div className={styles.dialogHeader}>
                <h3>Settings Dialog</h3>
                <button 
                  onClick={toggleDialog}
                  className={styles.dialogCloseButton}
                >
                  ×
                </button>
              </div>
              <div className={styles.dialogContent}>
                <p>This floating dialog contains a button that will trigger an anchored overlay.</p>
                <p>The overlay position is calculated using getAnchoredPosition and will be positioned relative to the button below.</p>
                
                <button
                  ref={anchorRef}
                  onClick={toggleOverlay}
                  className={styles.anchorButton}
                >
                  {isOverlayOpen ? 'Close Overlay' : 'Open Overlay'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Render overlay outside dialog to avoid clipping */}
      {isDialogOpen && isOverlayOpen && (
        <div
          ref={floatingRef}
          className={styles.overlay}
          style={{
            top: position ? `${position.top}px` : '0',
            left: position ? `${position.left}px` : '0',
            visibility: position ? 'visible' : 'hidden',
          }}
        >
          <div className={styles.overlayHeader}>
            <h4>Anchored Overlay</h4>
            <button
              onClick={toggleOverlay}
              className={styles.closeButton}
            >
              ×
            </button>
          </div>
          <div className={styles.overlayContent}>
            <p>This overlay is positioned using getAnchoredPosition!</p>
            <p>Position: {position ? `top: ${Math.round(position.top)}px, left: ${Math.round(position.left)}px` : 'calculating...'}</p>
            <p>Side: {position?.anchorSide}</p>
            <p>Alignment: {position?.anchorAlign}</p>
            <ul>
              <li>Settings Option 1</li>
              <li>Settings Option 2</li>
              <li>Settings Option 3</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export const LongScrollableContent: Story = {
  render: () => <LongScrollableDemo />,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'A story demonstrating getAnchoredPosition within a long scrollable page. Features a dialog with a button that opens an anchored overlay.',
      },
    },
  },
}
