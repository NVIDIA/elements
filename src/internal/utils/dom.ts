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
