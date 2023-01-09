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

export const getElementUpdates = (element: HTMLElement, propertyKey: string, callback: (value: any) => void): MutationObserver => {
  if (element.hasAttribute(propertyKey)) {
    callback(element.getAttribute(propertyKey));
  } else if ((element as any)[propertyKey] !== undefined) {
    callback((element as any)[propertyKey]);
  }

  if ((element as any)._valueTracker && (propertyKey === 'checked' || propertyKey === 'value')) {
    (element as any)._valueTracker = null;
  }

  const updatedProp = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), propertyKey) as any;

  if (updatedProp) {
    Object.defineProperty(element, propertyKey, {
      get: updatedProp.get,
      set: val => {
        callback(val);
        updatedProp.set.call(element, val);
      },
    });
  }

  return listenForAttributeChange(element, propertyKey, val => callback(val));
};

export function listenForAttributeChange(element: HTMLElement, attrName: string, fn: (attrValue: string | null) => void) {
  const observer = new MutationObserver(mutations => {
    if (mutations.find(m => m.attributeName === attrName)) {
      fn(element.getAttribute(attrName));
    }
  });

  observer.observe(element, { attributes: true });
  return observer;
}
