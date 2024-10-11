function createDocLink(subpath = '') {
  return `https://NVIDIA.github.io/elements/api/${subpath}`;
}

export function auditSlots(host: HTMLElement) {
  const validElements = ['template', ...(host.constructor as any).metadata.children];
  const invalidElements = Array.from(host.shadowRoot.querySelectorAll('slot')).flatMap(slot =>
    slot.assignedElements().filter(e => !validElements.map(i => i).includes(e.localName))
  );
  return [invalidElements, validElements];
}

export function getExcessiveInstanceLimitWarning(count: number, localName: string) {
  return `Excessive rendering of ${count} ${localName} were detected in DOM. Recycle/reuse elements when possible to improve application performance.`;
}

export function getInvalidSlotsWarning(localName: string, allowed: Array<string>) {
  return `Invalid slotted elements detected in ${localName}. Allowed: ${allowed.join(', ')}`;
}

export function getIdMatchNotFoundWarning(id: string) {
  return `Provided id "${id}" was not found in DOM`;
}

export function getSSRMismatchWarning(localName: string) {
  return `${localName} rendered on the client with mismatched SSR content. https://lit.dev/docs/ssr/overview/`;
}

export function getCrossShadowRootAnchorWarning(localName: string) {
  return `(deprecated) ${localName} was provided an anchor outside of its render root. ${createDocLink('?path=/docs/foundations-popovers-documentation--docs#shadow-root-anchoring')}`;
}
