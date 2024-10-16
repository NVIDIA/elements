import { clickOutsideElementBounds } from './dom.js';
import { focusElementTimeout } from './focus.js';

export function onKeys(events: string[], event: KeyboardEvent, fn: () => any) {
  if (events.find(e => e === event.code)) {
    fn();
  }
}
export function createLightDismiss(options: { element: HTMLElement; focusElement?: HTMLElement }, fn: () => void) {
  globalThis.document.addEventListener('pointerup', (e: PointerEvent) => {
    if (
      !options.element.hidden &&
      clickOutsideElementBounds(e, options.element) &&
      clickOutsideElementBounds(e, options.focusElement)
    ) {
      fn();
    }
  });

  options.element.addEventListener('keydown', (e: KeyboardEvent) => {
    if (!options.element.hidden && e.code === 'Escape') {
      e.preventDefault();
      focusElementTimeout(options.focusElement);
      fn();
    }
  });
}
