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

export function throttle(func, limit, ...args) {
  let wait = true;
  return () => {
    if (wait) {
      func.apply(this, ...args);
      wait = false;
      /* istanbul ignore next */
      setTimeout(() => (wait = true), limit);
    }
  };
}

export function debounce(func, timeout = 0) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    /* istanbul ignore next */
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}
