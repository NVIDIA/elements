export function stopEvent(event: any) {
  event?.preventDefault();
  event?.stopPropagation();
}

export function onChildListMutation(element: HTMLElement, fn: (mutation?: MutationRecord) => void) {
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        fn(mutation);
      }
    }
  });
  observer.observe(element, { childList: true });
  return observer;
}

/* istanbul ignore next */
export function throttle(func, limit, ...args) {
  let wait = true;
  return () => {
    if (wait) {
      func.apply(this, ...args);
      wait = false;
      setTimeout(() => wait = true, limit);
    }
  }
}

/* istanbul ignore next */
export function debounce(func, timeout = 0){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}
