// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { clickOutsideElementBounds } from './dom.js';
import { focusElementTimeout } from './focus.js';

export function onKeys(events: string[], event: KeyboardEvent, fn: () => void) {
  if (events.includes(event.code)) {
    fn();
  }
}

export function createLightDismiss(
  options: { element: HTMLElement; focusElement?: HTMLElement; signal?: AbortSignal },
  fn: () => void
) {
  const listenerOptions = options.signal ? { signal: options.signal } : undefined;

  globalThis.document.addEventListener(
    'pointerup',
    (e: PointerEvent) => {
      if (
        !options.element.hidden &&
        clickOutsideElementBounds(e, options.element) &&
        clickOutsideElementBounds(e, options.focusElement!)
      ) {
        fn();
      }
    },
    listenerOptions
  );

  options.element.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if (!options.element.hidden && e.code === 'Escape') {
        e.preventDefault();
        focusElementTimeout(options.focusElement!);
        fn();
      }
    },
    listenerOptions
  );
}
