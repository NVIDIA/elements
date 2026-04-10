// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export function stopEvent(event: Event) {
  event?.preventDefault();
  event?.stopPropagation();
}

export function onChildListMutation(
  element: HTMLElement,
  fn: (mutation?: MutationRecord) => void,
  options: MutationObserverInit = {}
) {
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        fn(mutation);
      }

      if (options.attributes && mutation.type === 'attributes') {
        fn(mutation);
      }
    }
  });
  observer.observe(element, { childList: true, ...options });
  return observer;
}

export function throttle(func: (...args: unknown[]) => void, limit: number) {
  let wait = true;
  return (...args: unknown[]) => {
    if (wait) {
      func(...args);
      wait = false;
      /* istanbul ignore next */
      setTimeout(() => (wait = true), limit);
    }
  };
}

export function debounce(func: (...args: unknown[]) => void, timeout = 0) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: unknown[]) => {
    clearTimeout(timer);
    /* istanbul ignore next */
    timer = setTimeout(() => {
      func(...args);
    }, timeout);
  };
}
