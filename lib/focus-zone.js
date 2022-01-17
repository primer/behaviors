"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activeDescendantActivatedIndirectly = exports.activeDescendantActivatedDirectly = exports.FocusKeys = void 0;
exports.focusZone = focusZone;
exports.isActiveDescendantAttribute = exports.hasActiveDescendantAttribute = void 0;

var _eventListenerSignal = require("./polyfills/event-listener-signal.js");

var _userAgent = require("./utils/user-agent.js");

var _iterateFocusableElements = require("./utils/iterate-focusable-elements.js");

var _uniqueId = require("./utils/unique-id.js");

(0, _eventListenerSignal.polyfill)();
let FocusKeys;
exports.FocusKeys = FocusKeys;

(function (FocusKeys) {
  FocusKeys[FocusKeys["ArrowHorizontal"] = 1] = "ArrowHorizontal";
  FocusKeys[FocusKeys["ArrowVertical"] = 2] = "ArrowVertical";
  FocusKeys[FocusKeys["JK"] = 4] = "JK";
  FocusKeys[FocusKeys["HL"] = 8] = "HL";
  FocusKeys[FocusKeys["HomeAndEnd"] = 16] = "HomeAndEnd";
  FocusKeys[FocusKeys["PageUpDown"] = 256] = "PageUpDown";
  FocusKeys[FocusKeys["WS"] = 32] = "WS";
  FocusKeys[FocusKeys["AD"] = 64] = "AD";
  FocusKeys[FocusKeys["Tab"] = 128] = "Tab";
  FocusKeys[FocusKeys["ArrowAll"] = FocusKeys.ArrowHorizontal | FocusKeys.ArrowVertical] = "ArrowAll";
  FocusKeys[FocusKeys["HJKL"] = FocusKeys.HL | FocusKeys.JK] = "HJKL";
  FocusKeys[FocusKeys["WASD"] = FocusKeys.WS | FocusKeys.AD] = "WASD";
  FocusKeys[FocusKeys["All"] = FocusKeys.ArrowAll | FocusKeys.HJKL | FocusKeys.HomeAndEnd | FocusKeys.PageUpDown | FocusKeys.WASD | FocusKeys.Tab] = "All";
})(FocusKeys || (exports.FocusKeys = FocusKeys = {}));

const KEY_TO_BIT = {
  ArrowLeft: FocusKeys.ArrowHorizontal,
  ArrowDown: FocusKeys.ArrowVertical,
  ArrowUp: FocusKeys.ArrowVertical,
  ArrowRight: FocusKeys.ArrowHorizontal,
  h: FocusKeys.HL,
  j: FocusKeys.JK,
  k: FocusKeys.JK,
  l: FocusKeys.HL,
  a: FocusKeys.AD,
  s: FocusKeys.WS,
  w: FocusKeys.WS,
  d: FocusKeys.AD,
  Tab: FocusKeys.Tab,
  Home: FocusKeys.HomeAndEnd,
  End: FocusKeys.HomeAndEnd,
  PageUp: FocusKeys.PageUpDown,
  PageDown: FocusKeys.PageUpDown
};
const KEY_TO_DIRECTION = {
  ArrowLeft: 'previous',
  ArrowDown: 'next',
  ArrowUp: 'previous',
  ArrowRight: 'next',
  h: 'previous',
  j: 'next',
  k: 'previous',
  l: 'next',
  a: 'previous',
  s: 'next',
  w: 'previous',
  d: 'next',
  Tab: 'next',
  Home: 'start',
  End: 'end',
  PageUp: 'start',
  PageDown: 'end'
};
/**
 * Options that control the behavior of the arrow focus behavior.
 */

function getDirection(keyboardEvent) {
  const direction = KEY_TO_DIRECTION[keyboardEvent.key];

  if (keyboardEvent.key === 'Tab' && keyboardEvent.shiftKey) {
    return 'previous';
  }

  const isMac = (0, _userAgent.isMacOS)();

  if (isMac && keyboardEvent.metaKey || !isMac && keyboardEvent.ctrlKey) {
    if (keyboardEvent.key === 'ArrowLeft' || keyboardEvent.key === 'ArrowUp') {
      return 'start';
    } else if (keyboardEvent.key === 'ArrowRight' || keyboardEvent.key === 'ArrowDown') {
      return 'end';
    }
  }

  return direction;
}
/**
 * There are some situations where we do not want various keys to affect focus. This function
 * checks for those situations.
 * 1. Home and End should not move focus when a text input or textarea is active
 * 2. Keys that would normally type characters into an input or navigate a select element should be ignored
 * 3. The down arrow sometimes should not move focus when a select is active since that sometimes invokes the dropdown
 * 4. Page Up and Page Down within a textarea should not have any effect
 * 5. When in a text input or textarea, left should only move focus if the cursor is at the beginning of the input
 * 6. When in a text input or textarea, right should only move focus if the cursor is at the end of the input
 * 7. When in a textarea, up and down should only move focus if cursor is at the beginning or end, respectively.
 * @param keyboardEvent
 * @param activeElement
 */


function shouldIgnoreFocusHandling(keyboardEvent, activeElement) {
  const key = keyboardEvent.key; // Get the number of characters in `key`, accounting for double-wide UTF-16 chars. If keyLength
  // is 1, we can assume it's a "printable" character. Otherwise it's likely a control character.
  // One exception is the Tab key, which is technically printable, but browsers generally assign
  // its function to move focus rather than type a <TAB> character.

  const keyLength = [...key].length;
  const isTextInput = activeElement instanceof HTMLInputElement && activeElement.type === 'text' || activeElement instanceof HTMLTextAreaElement; // If we would normally type a character into an input, ignore
  // Also, Home and End keys should never affect focus when in a text input

  if (isTextInput && (keyLength === 1 || key === 'Home' || key === 'End')) {
    return true;
  } // Some situations we want to ignore with <select> elements


  if (activeElement instanceof HTMLSelectElement) {
    // Regular typeable characters change the selection, so ignore those
    if (keyLength === 1) {
      return true;
    } // On macOS, bare ArrowDown opens the select, so ignore that


    if (key === 'ArrowDown' && (0, _userAgent.isMacOS)() && !keyboardEvent.metaKey) {
      return true;
    } // On other platforms, Alt+ArrowDown opens the select, so ignore that


    if (key === 'ArrowDown' && !(0, _userAgent.isMacOS)() && keyboardEvent.altKey) {
      return true;
    }
  } // Ignore page up and page down for textareas


  if (activeElement instanceof HTMLTextAreaElement && (key === 'PageUp' || key === 'PageDown')) {
    return true;
  }

  if (isTextInput) {
    const textInput = activeElement;
    const cursorAtStart = textInput.selectionStart === 0 && textInput.selectionEnd === 0;
    const cursorAtEnd = textInput.selectionStart === textInput.value.length && textInput.selectionEnd === textInput.value.length; // When in a text area or text input, only move focus left/right if at beginning/end of the field

    if (key === 'ArrowLeft' && !cursorAtStart) {
      return true;
    }

    if (key === 'ArrowRight' && !cursorAtEnd) {
      return true;
    } // When in a text area, only move focus up/down if at beginning/end of the field


    if (textInput instanceof HTMLTextAreaElement) {
      if (key === 'ArrowUp' && !cursorAtStart) {
        return true;
      }

      if (key === 'ArrowDown' && !cursorAtEnd) {
        return true;
      }
    }
  }

  return false;
}

const isActiveDescendantAttribute = 'data-is-active-descendant';
/**
 * A value of activated-directly for data-is-active-descendant indicates the descendant was activated
 * by a manual user interaction with intent to move active descendant.  This usually translates to the
 * user pressing one of the bound keys (up/down arrow, etc) to move through the focus zone.  This is
 * intended to be roughly equivalent to the :focus-visible pseudo-class
 **/

exports.isActiveDescendantAttribute = isActiveDescendantAttribute;
const activeDescendantActivatedDirectly = 'activated-directly';
/**
 * A value of activated-indirectly for data-is-active-descendant indicates the descendant was activated
 * implicitly, and not by a direct key press.  This includes focus zone being created from scratch, focusable
 * elements being added/removed, and mouseover events. This is intended to be roughly equivalent
 * to :focus:not(:focus-visible)
 **/

exports.activeDescendantActivatedDirectly = activeDescendantActivatedDirectly;
const activeDescendantActivatedIndirectly = 'activated-indirectly';
exports.activeDescendantActivatedIndirectly = activeDescendantActivatedIndirectly;
const hasActiveDescendantAttribute = 'data-has-active-descendant';
/**
 * Sets up the arrow key focus behavior for all focusable elements in the given `container`.
 * @param container
 * @param settings
 * @returns
 */

exports.hasActiveDescendantAttribute = hasActiveDescendantAttribute;

function focusZone(container, settings) {
  var _settings$bindKeys, _settings$focusOutBeh, _settings$focusInStra, _settings$abortSignal;

  const focusableElements = [];
  const savedTabIndex = new WeakMap();
  const bindKeys = (_settings$bindKeys = settings === null || settings === void 0 ? void 0 : settings.bindKeys) !== null && _settings$bindKeys !== void 0 ? _settings$bindKeys : (settings !== null && settings !== void 0 && settings.getNextFocusable ? FocusKeys.ArrowAll : FocusKeys.ArrowVertical) | FocusKeys.HomeAndEnd;
  const focusOutBehavior = (_settings$focusOutBeh = settings === null || settings === void 0 ? void 0 : settings.focusOutBehavior) !== null && _settings$focusOutBeh !== void 0 ? _settings$focusOutBeh : 'stop';
  const focusInStrategy = (_settings$focusInStra = settings === null || settings === void 0 ? void 0 : settings.focusInStrategy) !== null && _settings$focusInStra !== void 0 ? _settings$focusInStra : 'previous';
  const activeDescendantControl = settings === null || settings === void 0 ? void 0 : settings.activeDescendantControl;
  const activeDescendantCallback = settings === null || settings === void 0 ? void 0 : settings.onActiveDescendantChanged;
  let currentFocusedElement;

  function getFirstFocusableElement() {
    return focusableElements[0];
  }

  function isActiveDescendantInputFocused() {
    return document.activeElement === activeDescendantControl;
  }

  function updateFocusedElement(to, directlyActivated = false) {
    const from = currentFocusedElement;
    currentFocusedElement = to;

    if (activeDescendantControl) {
      if (to && isActiveDescendantInputFocused()) {
        setActiveDescendant(from, to, directlyActivated);
      } else {
        clearActiveDescendant();
      }

      return;
    }

    if (from && from !== to && savedTabIndex.has(from)) {
      from.setAttribute('tabindex', '-1');
    }

    to === null || to === void 0 ? void 0 : to.setAttribute('tabindex', '0');
  }

  function setActiveDescendant(from, to, directlyActivated = false) {
    if (!to.id) {
      to.setAttribute('id', (0, _uniqueId.uniqueId)());
    }

    if (from && from !== to) {
      from.removeAttribute(isActiveDescendantAttribute);
    }

    if (!activeDescendantControl || !directlyActivated && activeDescendantControl.getAttribute('aria-activedescendant') === to.id) {
      // prevent active descendant callback from being called repeatedly if the same element is activated (e.g. via mousemove)
      return;
    }

    activeDescendantControl.setAttribute('aria-activedescendant', to.id);
    container.setAttribute(hasActiveDescendantAttribute, to.id);
    to.setAttribute(isActiveDescendantAttribute, directlyActivated ? activeDescendantActivatedDirectly : activeDescendantActivatedIndirectly);
    activeDescendantCallback === null || activeDescendantCallback === void 0 ? void 0 : activeDescendantCallback(to, from, directlyActivated);
  }

  function clearActiveDescendant(previouslyActiveElement = currentFocusedElement) {
    if (focusInStrategy === 'first') {
      currentFocusedElement = undefined;
    }

    activeDescendantControl === null || activeDescendantControl === void 0 ? void 0 : activeDescendantControl.removeAttribute('aria-activedescendant');
    container.removeAttribute(hasActiveDescendantAttribute);
    previouslyActiveElement === null || previouslyActiveElement === void 0 ? void 0 : previouslyActiveElement.removeAttribute(isActiveDescendantAttribute);
    activeDescendantCallback === null || activeDescendantCallback === void 0 ? void 0 : activeDescendantCallback(undefined, previouslyActiveElement, false);
  }

  function beginFocusManagement(...elements) {
    const filteredElements = elements.filter(e => {
      var _settings$focusableEl, _settings$focusableEl2;

      return (_settings$focusableEl = settings === null || settings === void 0 ? void 0 : (_settings$focusableEl2 = settings.focusableElementFilter) === null || _settings$focusableEl2 === void 0 ? void 0 : _settings$focusableEl2.call(settings, e)) !== null && _settings$focusableEl !== void 0 ? _settings$focusableEl : true;
    });

    if (filteredElements.length === 0) {
      return;
    } // Insert all elements atomically. Assume that all passed elements are well-ordered.


    const insertIndex = focusableElements.findIndex(e => (e.compareDocumentPosition(filteredElements[0]) & Node.DOCUMENT_POSITION_PRECEDING) > 0);
    focusableElements.splice(insertIndex === -1 ? focusableElements.length : insertIndex, 0, ...filteredElements);

    for (const element of filteredElements) {
      // Set tabindex="-1" on all tabbable elements, but save the original
      // value in case we need to disable the behavior
      if (!savedTabIndex.has(element)) {
        savedTabIndex.set(element, element.getAttribute('tabindex'));
      }

      element.setAttribute('tabindex', '-1');
    }

    if (!currentFocusedElement) {
      updateFocusedElement(getFirstFocusableElement());
    }
  }

  function endFocusManagement(...elements) {
    for (const element of elements) {
      const focusableElementIndex = focusableElements.indexOf(element);

      if (focusableElementIndex >= 0) {
        focusableElements.splice(focusableElementIndex, 1);
      }

      const savedIndex = savedTabIndex.get(element);

      if (savedIndex !== undefined) {
        if (savedIndex === null) {
          element.removeAttribute('tabindex');
        } else {
          element.setAttribute('tabindex', savedIndex);
        }

        savedTabIndex.delete(element);
      } // If removing the last-focused element, move focus to the first element in the list.


      if (element === currentFocusedElement) {
        const nextElementToFocus = getFirstFocusableElement();
        updateFocusedElement(nextElementToFocus);
      }
    }
  } // Take all tabbable elements within container under management


  beginFocusManagement(...(0, _iterateFocusableElements.iterateFocusableElements)(container)); // Open the first tabbable element for tabbing

  updateFocusedElement(getFirstFocusableElement()); // If the DOM structure of the container changes, make sure we keep our state up-to-date
  // with respect to the focusable elements cache and its order

  const observer = new MutationObserver(mutations => {
    // Perform all removals first, in case element order has simply changed
    for (const mutation of mutations) {
      for (const removedNode of mutation.removedNodes) {
        if (removedNode instanceof HTMLElement) {
          endFocusManagement(...(0, _iterateFocusableElements.iterateFocusableElements)(removedNode));
        }
      }
    }

    for (const mutation of mutations) {
      for (const addedNode of mutation.addedNodes) {
        if (addedNode instanceof HTMLElement) {
          beginFocusManagement(...(0, _iterateFocusableElements.iterateFocusableElements)(addedNode));
        }
      }
    }
  });
  observer.observe(container, {
    subtree: true,
    childList: true
  });
  const controller = new AbortController();
  const signal = (_settings$abortSignal = settings === null || settings === void 0 ? void 0 : settings.abortSignal) !== null && _settings$abortSignal !== void 0 ? _settings$abortSignal : controller.signal;
  signal.addEventListener('abort', () => {
    // Clean up any modifications
    endFocusManagement(...focusableElements);
  });
  let elementIndexFocusedByClick = undefined;
  container.addEventListener('mousedown', event => {
    // Since focusin is only called when focus changes, we need to make sure the clicked
    // element isn't already focused.
    if (event.target instanceof HTMLElement && event.target !== document.activeElement) {
      elementIndexFocusedByClick = focusableElements.indexOf(event.target);
    }
  }, {
    signal
  });

  if (activeDescendantControl) {
    container.addEventListener('focusin', event => {
      if (event.target instanceof HTMLElement && focusableElements.includes(event.target)) {
        // Move focus to the activeDescendantControl if one of the descendants is focused
        activeDescendantControl.focus();
        updateFocusedElement(event.target);
      }
    });
    container.addEventListener('mousemove', ({
      target
    }) => {
      if (!(target instanceof Node)) {
        return;
      }

      const focusableElement = focusableElements.find(element => element.contains(target));

      if (focusableElement) {
        updateFocusedElement(focusableElement);
      }
    }, {
      signal,
      capture: true
    }); // Listeners specifically on the controlling element

    activeDescendantControl.addEventListener('focusin', () => {
      // Focus moved into the active descendant input.  Activate current or first descendant.
      if (!currentFocusedElement) {
        updateFocusedElement(getFirstFocusableElement());
      } else {
        setActiveDescendant(undefined, currentFocusedElement);
      }
    });
    activeDescendantControl.addEventListener('focusout', () => {
      clearActiveDescendant();
    });
  } else {
    // This is called whenever focus enters an element in the container
    container.addEventListener('focusin', event => {
      if (event.target instanceof HTMLElement) {
        // If a click initiated the focus movement, we always want to set our internal state
        // to reflect the clicked element as the currently focused one.
        if (elementIndexFocusedByClick !== undefined) {
          if (elementIndexFocusedByClick >= 0) {
            if (focusableElements[elementIndexFocusedByClick] !== currentFocusedElement) {
              updateFocusedElement(focusableElements[elementIndexFocusedByClick]);
            }
          }

          elementIndexFocusedByClick = undefined;
        } else {
          // Set tab indexes and internal state based on the focus handling strategy
          if (focusInStrategy === 'previous') {
            updateFocusedElement(event.target);
          } else if (focusInStrategy === 'closest' || focusInStrategy === 'first') {
            if (event.relatedTarget instanceof Element && !container.contains(event.relatedTarget)) {
              // Regardless of the previously focused element, if we're coming from outside the
              // container, put focus onto the first encountered element (from above, it's The
              // first element of the container; from below, it's the last). If the
              // focusInStrategy is set to "first", lastKeyboardFocusDirection will always
              // be undefined.
              const targetElementIndex = lastKeyboardFocusDirection === 'previous' ? focusableElements.length - 1 : 0;
              const targetElement = focusableElements[targetElementIndex];
              targetElement === null || targetElement === void 0 ? void 0 : targetElement.focus();
              return;
            } else {
              updateFocusedElement(event.target);
            }
          } else if (typeof focusInStrategy === 'function') {
            if (event.relatedTarget instanceof Element && !container.contains(event.relatedTarget)) {
              const elementToFocus = focusInStrategy(event.relatedTarget);
              const requestedFocusElementIndex = elementToFocus ? focusableElements.indexOf(elementToFocus) : -1;

              if (requestedFocusElementIndex >= 0 && elementToFocus instanceof HTMLElement) {
                // Since we are calling focus() this handler will run again synchronously. Therefore,
                // we don't want to let this invocation finish since it will clobber the value of
                // currentFocusedElement.
                elementToFocus.focus();
                return;
              } else {
                // eslint-disable-next-line no-console
                console.warn('Element requested is not a known focusable element.');
              }
            } else {
              updateFocusedElement(event.target);
            }
          }
        }
      }

      lastKeyboardFocusDirection = undefined;
    }, {
      signal
    });
  }

  const keyboardEventRecipient = activeDescendantControl !== null && activeDescendantControl !== void 0 ? activeDescendantControl : container; // If the strategy is "closest", we need to capture the direction that the user
  // is trying to move focus before our focusin handler is executed.

  let lastKeyboardFocusDirection = undefined;

  if (focusInStrategy === 'closest') {
    document.addEventListener('keydown', event => {
      if (event.key === 'Tab') {
        lastKeyboardFocusDirection = getDirection(event);
      }
    }, {
      signal,
      capture: true
    });
  }

  function getCurrentFocusedIndex() {
    if (!currentFocusedElement) {
      return 0;
    }

    const focusedIndex = focusableElements.indexOf(currentFocusedElement);
    const fallbackIndex = currentFocusedElement === container ? -1 : 0;
    return focusedIndex !== -1 ? focusedIndex : fallbackIndex;
  } // "keydown" is the event that triggers DOM focus change, so that is what we use here


  keyboardEventRecipient.addEventListener('keydown', event => {
    if (event.key in KEY_TO_DIRECTION) {
      const keyBit = KEY_TO_BIT[event.key]; // Check if the pressed key (keyBit) is one that is being used for focus (bindKeys)

      if (!event.defaultPrevented && (keyBit & bindKeys) > 0 && !shouldIgnoreFocusHandling(event, document.activeElement)) {
        // Moving forward or backward?
        const direction = getDirection(event);
        let nextElementToFocus = undefined; // If there is a custom function that retrieves the next focusable element, try calling that first.

        if (settings !== null && settings !== void 0 && settings.getNextFocusable) {
          var _document$activeEleme;

          nextElementToFocus = settings.getNextFocusable(direction, (_document$activeEleme = document.activeElement) !== null && _document$activeEleme !== void 0 ? _document$activeEleme : undefined, event);
        }

        if (!nextElementToFocus) {
          const lastFocusedIndex = getCurrentFocusedIndex();
          let nextFocusedIndex = lastFocusedIndex;

          if (direction === 'previous') {
            nextFocusedIndex -= 1;
          } else if (direction === 'start') {
            nextFocusedIndex = 0;
          } else if (direction === 'next') {
            nextFocusedIndex += 1;
          } else {
            // end
            nextFocusedIndex = focusableElements.length - 1;
          }

          if (nextFocusedIndex < 0) {
            // Tab should never cause focus to wrap. Use focusTrap for that behavior.
            if (focusOutBehavior === 'wrap' && event.key !== 'Tab') {
              nextFocusedIndex = focusableElements.length - 1;
            } else {
              nextFocusedIndex = 0;
            }
          }

          if (nextFocusedIndex >= focusableElements.length) {
            if (focusOutBehavior === 'wrap' && event.key !== 'Tab') {
              nextFocusedIndex = 0;
            } else {
              nextFocusedIndex = focusableElements.length - 1;
            }
          }

          if (lastFocusedIndex !== nextFocusedIndex) {
            nextElementToFocus = focusableElements[nextFocusedIndex];
          }
        }

        if (activeDescendantControl) {
          updateFocusedElement(nextElementToFocus || currentFocusedElement, true);
        } else if (nextElementToFocus) {
          lastKeyboardFocusDirection = direction; // updateFocusedElement will be called implicitly when focus moves, as long as the event isn't prevented somehow

          nextElementToFocus.focus();
        } // Tab should always allow escaping from this container, so only
        // preventDefault if tab key press already resulted in a focus movement


        if (event.key !== 'Tab' || nextElementToFocus) {
          event.preventDefault();
        }
      }
    }
  }, {
    signal
  });
  return controller;
}