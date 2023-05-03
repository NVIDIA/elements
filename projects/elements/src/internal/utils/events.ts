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
