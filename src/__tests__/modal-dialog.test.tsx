import '../components/modal-dialog.js'

it('creates from document.createElement', function () {
  const el = document.createElement('modal-dialog')
  expect(el.nodeName).toEqual('MODAL-DIALOG')
  expect(el).toBeInstanceOf(window.ModalDialogElement)
})

it('creates from constructor', function () {
  const el = new window.ModalDialogElement()
  expect(el.nodeName).toEqual('MODAL-DIALOG')
})

it('opens dialog when you call show()', function () {
  const el = new window.ModalDialogElement()
  el.show()
  expect(el.open).toEqual(true)
})

it('removes class from overlay when you call show()', function () {
  const el = document.createElement('modal-dialog')
  const overlay = document.createElement('div')
  overlay.classList.add('Overlay-hidden')
  overlay.classList.add('Overlay-backdrop')
  overlay.appendChild(el)
  document.body.append(overlay)

  el.show()
  expect(overlay.classList).not.toContain('Overlay-hidden')
})

it('closes dialog when you call close()', function () {
  const el = new window.ModalDialogElement()
  el.show()
  expect(el.open).toEqual(true)

  el.close()
  expect(el.open).toEqual(false)
})

it('adds class from overlay when you call close()', function () {
  const el = document.createElement('modal-dialog')
  const overlay = document.createElement('div')
  overlay.classList.add('Overlay-hidden')
  overlay.classList.add('Overlay-backdrop')
  overlay.appendChild(el)
  document.body.append(overlay)

  el.show()
  expect(overlay.classList).not.toContain('Overlay-hidden')
  el.close()
  expect(overlay.classList).toContain('Overlay-hidden')
})

it('closes dialog when you press escape', function () {
  const el = document.createElement('modal-dialog')
  document.body.append(el)
  el.show()
  expect(el.open).toEqual(true)

  el.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}))
  expect(el.open).toEqual(false)
})

it('adds role of dialog when no role defined', function () {
  const el = document.createElement('modal-dialog')
  document.body.append(el)
  expect(el.getAttribute('role')).toEqual('dialog')
})

it('closes dialog when you click outside dialog', function () {
  const outside = document.createElement('div')
  const el = outside.appendChild(document.createElement('modal-dialog'))
  document.body.append(outside)

  el.show()
  expect(el.open).toEqual(true)

  outside.click()
  expect(el.open).toEqual(false)
})

it('wires up the open button', function () {
  const el = document.createElement('modal-dialog')
  document.body.append(el)

  const openButton = document.createElement('button')
  openButton.setAttribute('data-show-dialog-id', el.id)
  document.body.append(openButton)

  openButton.click()
  expect(el.open).toEqual(true)
})

it('wires up the close button', function () {
  const el = document.createElement('modal-dialog')
  document.body.append(el)

  el.show()
  expect(el.open).toEqual(true)

  const closeButton = document.createElement('button')
  closeButton.setAttribute('data-close-dialog-id', el.id)
  el.appendChild(closeButton)

  closeButton.click()
  expect(el.open).toEqual(false)
})
