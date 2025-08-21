const nonEditableInputTypes = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'hidden',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
])

/**
 * Returns true if `element` is editable - that is, if it can be focused and typed in like an input or textarea.
 */
export function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false

  const name = target.nodeName.toLowerCase()
  const type = target.getAttribute('type')?.toLowerCase() ?? 'text'

  const isReadonly =
    target.ariaReadOnly === 'true' ||
    target.getAttribute('aria-readonly') === 'true' ||
    target.getAttribute('readonly') !== null

  return (
    (name === 'select' ||
      name === 'textarea' ||
      (name === 'input' && !nonEditableInputTypes.has(type)) ||
      target.isContentEditable) &&
    !isReadonly
  )
}
