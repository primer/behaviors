import { focusTrap } from '../focus-trap.js'

class ModalDialogElement extends HTMLElement {
  private abortController: AbortController | undefined

  constructor() {
    super()

    this.querySelector('.close-button')?.addEventListener('click', () => this.close())
    document.body.querySelector(`.js-dialog-show-${this.id}`)?.addEventListener('click', () => this.show())
  }

  connectedCallback(): void {
    if (!this.hasAttribute('role')) this.setAttribute('role', 'dialog')

    // Find the associated button?

    const subscriptions = [
      fromEvent(this, 'compositionstart', e => trackComposition(this, e)),
      fromEvent(this, 'compositionend', e => trackComposition(this, e)),
      fromEvent(this, 'keydown', e => keydown(this, e))
    ]

    states.set(this, {subscriptions, loaded: false, isComposing: false})
  }

  disconnectedCallback(): void {
    const state = states.get(this)
    if (!state) return
    states.delete(this)
    for (const sub of state.subscriptions) {
      sub.unsubscribe()
    }
  }

  show() {
    const isClosed = this.classList.contains('hidden')
    if (!isClosed) return
    this.classList.remove('hidden')
    this.setAttribute('open', '')
    if (this.parentElement?.classList.contains('modal-dialog-backdrop')) {
      this.parentElement.classList.add('active')
    }
    document.body.style.overflow = 'hidden'
    this.abortController = focusTrap(this)
  }

  close() {
    const isClosed = this.classList.contains('hidden')
    if (isClosed) return
    this.classList.add('hidden')
    this.removeAttribute('open')
    if (this.parentElement?.classList.contains('modal-dialog-backdrop')) {
      this.parentElement.classList.remove('active')
    }
    document.body.style.overflow = 'initial'
    this.abortController?.abort()
  }
}

const states = new WeakMap()

type Subscription = {unsubscribe(): void}

function fromEvent(
  target: EventTarget,
  eventName: string,
  onNext: EventListenerOrEventListenerObject,
  options: boolean | AddEventListenerOptions = false
): Subscription {
  target.addEventListener(eventName, onNext, options)
  return {
    unsubscribe: () => {
      target.removeEventListener(eventName, onNext, options)
    }
  }
}

function keydown(dialog: ModalDialogElement, event: Event) {
  if (!(event instanceof KeyboardEvent)) return
  const state = states.get(dialog)
  if (!state || state.isComposing) return

  switch (event.key) {
    case 'Escape':
      if (dialog.hasAttribute('open')) {
        dialog.close()
        event.preventDefault()
        event.stopPropagation()
      }
      break
  }
}

function trackComposition(dialog: Element, event: Event) {
  const state = states.get(dialog)
  if (!state) return
  state.isComposing = event.type === 'compositionstart'
}

// TODO: Find out how we can reactive this code
declare global {
  interface Window {
    ModalDialogElement: typeof ModalDialogElement
  }
  interface HTMLElementTagNameMap {
    'modal-dialog': ModalDialogElement
  }
}

export default ModalDialogElement

if (!window.customElements.get('modal-dialog')) {
  window.ModalDialogElement = ModalDialogElement
  window.customElements.define('modal-dialog', ModalDialogElement)
}
