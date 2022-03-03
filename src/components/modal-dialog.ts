import {focusIfNeeded} from '../utils/iterate-focusable-elements.js'
import {focusTrap} from '../focus-trap.js'

class ModalDialogElement extends HTMLElement {
  //TODO: Do we remove the abortController from focusTrap?
  #focusAbortController = new AbortController()
  #abortController = new AbortController()
  #isComposing = false
  #openButton: HTMLButtonElement | undefined

  get open() {
    return this.hasAttribute('open')
  }
  set open(value: boolean) {
    if (value) {
      if (this.open) return
      this.setAttribute('open', '')
      this.#overlayBackdrop?.classList.remove('Overlay-hidden')
      document.body.style.overflow = 'hidden'
      if (this.#focusAbortController.signal.aborted) {
        this.#focusAbortController = new AbortController()
      }
      focusTrap(this, this.#focusAbortController.signal)
    } else {
      if (!this.open) return
      this.removeAttribute('open')
      this.#overlayBackdrop?.classList.add('Overlay-hidden')
      document.body.style.overflow = 'initial'
      this.#focusAbortController.abort()
      focusIfNeeded(this.#openButton)
      this.#openButton = undefined
    }
  }

  get #overlayBackdrop(): HTMLElement | null {
    if (this.parentElement?.classList.contains('Overlay-backdrop')) {
      return this.parentElement
    }

    return null
  }

  connectedCallback(): void {
    if (!this.hasAttribute('role')) this.setAttribute('role', 'dialog')

    const signal = this.#abortController.signal

    this.ownerDocument.addEventListener(
      'click',
      event => {
        const target = event.target as HTMLElement
        const clickOutsideDialog = target.closest(this.tagName) !== this
        const button = target?.closest('button')
        // go over this logic:
        if (!button) {
          if (clickOutsideDialog) {
            // This click is outside the dialog
            this.close()
          }
          return
        }

        let dialogId = button.getAttribute('data-close-dialog-id')
        if (dialogId === this.id) {
          this.close()
        }

        dialogId = button.getAttribute('data-show-dialog-id')
        if (dialogId === this.id) {
          //TODO: see if I can remove this
          event.stopPropagation()
          this.#openButton = button
          this.show()
        }
      },
      {signal}
    )

    this.addEventListener('compositionstart', () => (this.#isComposing = true))
    this.addEventListener('compositionend', () => (this.#isComposing = false))
    this.addEventListener('keydown', e => this.#keydown(e))
  }

  disconnectedCallback(): void {
    this.#abortController.abort()
  }

  show() {
    this.open = true
  }

  close() {
    this.open = false
  }

  #keydown(event: Event) {
    if (!(event instanceof KeyboardEvent)) return
    if (this.#isComposing) return

    switch (event.key) {
      case 'Escape':
        if (this.open) {
          this.close()
          event.preventDefault()
          event.stopPropagation()
        }
        break
    }
  }
}

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
