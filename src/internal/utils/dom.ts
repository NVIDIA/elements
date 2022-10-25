/**
 * Preserves visual DOM ordering when using slots within Shadow DOM
 * See additional information/resources on Shadow DOM linear traversal
 * https://nolanlawson.com/2021/02/13/managing-focus-in-the-shadow-dom/
 * https://www.abeautifulsite.net/posts/querying-through-shadow-roots/
 */
export function getFlatDOMTree(node: Node, depth = 10): HTMLElement[] {
  return (Array.from(getChildren(node)).reduce((prev: any[], next: any) => {
      const nextChild = Array.from(getChildren(next)).map((i: any) => [i, getFlatDOMTree(i, depth)]);
      return [...prev, [next, [...nextChild]]];
    }, []) as any[])
    .flat(depth);
}

export function getChildren(node: any) {
  if (node.documentElement) {
    return node.documentElement.children; // root document children
  } else if (node.shadowRoot) {
    return node.shadowRoot.children; // shadow root direct children
  } else if (node.assignedElements) {
    const slotted = node.assignedElements(); // slotted elements
    return slotted.length ? slotted : node.children; // slot fallback
  } else {
    return node.children; // light DOM direct children
  }
}

export function generateId() {
  return `_${Math.random().toString(36).substring(2, 9)}`;
}

export function getAttributeChanges(element: HTMLElement, attr: string, fn: (attrValue: string) => void) {
  fn(element.getAttribute(attr));
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.attributeName === attr) {
        fn((mutation.target as HTMLElement).getAttribute(attr));
      }
    });
  });
  observer.observe(element, { attributes: true, subtree: true });
  return observer;
}

export function getAttributeListChanges(element: HTMLElement, attrs: string[], fn: (mutation: MutationRecord) => void) {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (attrs.includes(mutation.attributeName)) {
        fn(mutation);
      }
    });
  });
  observer.observe(element, { attributes: true, subtree: true });
  return observer;
}

/**
 * Appends styles to the render root of a given element. This is useful for
 * styles that need to be applied outside the scope of the element's shadow
 * root such as UA styles --webkit-* that won't work in a ::slotted selector
 */
export function appendRootNodeStyle(host: HTMLElement, styles: string) {
  const stylesheet = new CSSStyleSheet();
  (stylesheet as any).replaceSync(styles ?? ''); /// vitest in coverage mode ignores inlined assets like css and returns undefined
  const root = host.parentNode.toString() === '[object ShadowRoot]' ? host.parentNode : document as any;
  root.adoptedStyleSheets = [...root.adoptedStyleSheets, stylesheet];
}

/* used for cases of needing to know a property update outside of lit, example a native input value prop change */
export function getElementUpdate(element: HTMLElement, key: string, callback: (value: any) => void) {
  if (element.hasAttribute(key)) {
    callback(element.getAttribute(key));
  } else if ((element as any)[key] !== undefined) {
    callback((element as any)[key]);
  }

  const updatedProp = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), key) as any;
  if (updatedProp) {
    Object.defineProperty(element, key, {
      get: updatedProp.get,
      set: val => {
        callback(val);
        updatedProp.set.call(element, val);
      },
    });
  }

  return getAttributeChanges(element, key, val => callback(val));
}
