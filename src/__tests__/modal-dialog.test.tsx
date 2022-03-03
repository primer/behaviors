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
