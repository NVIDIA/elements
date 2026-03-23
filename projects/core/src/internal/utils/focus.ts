export function isFocusable(element: Element) {
  return (
    element.matches(
      [
        'a[href]',
        'area[href]',
        'input',
        'button',
        'select',
        'textarea',
        'iframe',
        'object',
        'embed',
        '*[tabindex]',
        '*[contenteditable=true]',
        '[role=button]'
      ].join(',')
    ) &&
    element.matches(':not([disabled], [inert])') &&
    !element.closest(`[inert]`) &&
    !element.closest('[popover]')?.matches(':not(:popover-open)')
  );
}

/** returns interactive elements that does not require advanced keyboard interactions like arrow/navigation */
export function isSimpleFocusable(element: Element) {
  return element.matches(
    [
      'a[href]',
      'button:not([disabled])',
      'input[type=checkbox]',
      'input[type=radio]',
      'object',
      'embed',
      '*[tabindex]',
      '[role=button]:not([disabled])'
    ].join(',')
  );
}

export function getActiveElement(root: Document | ShadowRoot = globalThis.document): Element | null {
  if (root.activeElement && root.activeElement.shadowRoot) {
    return getActiveElement(root.activeElement.shadowRoot) ?? root.activeElement;
  } else {
    return root.activeElement;
  }
}

export function focusElement(element: HTMLElement) {
  if (element && !isFocusable(element)) {
    element.setAttribute('tabindex', '-1');
    element.focus();
    element.addEventListener('blur', () => element.removeAttribute('tabindex'), { once: true });
  } else {
    element?.focus();
  }
}

export function focusElementTimeout(element: HTMLElement) {
  setTimeout(() => focusElement(element));
}

export function setActiveKeyListItem(items: NodeListOf<HTMLElement> | HTMLElement[], item: HTMLElement) {
  items.forEach(i => (i.tabIndex = -1));
  item.tabIndex = 0;
}

export function initializeKeyListItems(items: NodeListOf<HTMLElement> | HTMLElement[]) {
  items.forEach(i => (i.tabIndex = -1));
  items[0] && (items[0].tabIndex = 0);
}

/** determines if user interaction is a valid interaction for activating a listbox type */
export function onListboxActivate(
  element: HTMLElement & { disabled?: boolean },
  fn: (event: KeyboardEvent | PointerEvent) => void
) {
  const validKey = (e: KeyboardEvent) => e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown';

  element.addEventListener('pointerdown', (e: PointerEvent) => {
    e.preventDefault();
  });

  element.addEventListener('pointerup', (e: PointerEvent) => {
    e.preventDefault();

    if (!element.disabled) {
      fn(e);
    }
  });

  element.addEventListener('keyup', (e: KeyboardEvent) => {
    if (validKey(e) && !element.disabled) {
      fn(e);
    }
  });

  element.addEventListener('keydown', (e: KeyboardEvent) => {
    if (validKey(e) && !element.disabled) {
      e.preventDefault();
    }
  });
}
