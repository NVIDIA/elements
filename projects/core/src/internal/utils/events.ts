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

export function throttle<Args extends unknown[]>(
  func: (...args: Args) => void,
  limit: number,
  { trailing = false }: { trailing?: boolean } = {}
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: Args | undefined;

  const throttled = (...args: Args): void => {
    if (timer !== undefined) {
      if (trailing) pending = args;
      return;
    }

    func(...args);
    timer = setTimeout(() => {
      timer = undefined;
      if (pending) {
        const nextArgs = pending;
        pending = undefined;
        throttled(...nextArgs);
      }
    }, limit);
  };

  return Object.assign(throttled, {
    flush() {
      if (!pending) return;
      const args = pending;
      pending = undefined;
      func(...args);
    },
    cancel() {
      clearTimeout(timer);
      timer = undefined;
      pending = undefined;
    }
  });
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
