export function auditSlots(
  host: HTMLElement & { constructor: { metadata?: { children?: string[]; disallowedChildren?: string[] } } }
): [Element[], string[]] {
  const validElements = ['template', ...host.constructor.metadata.children].filter(c => typeof c === 'string');
  const invalidElements = Array.from(host.shadowRoot.querySelectorAll('slot')).flatMap(slot =>
    slot.assignedElements().filter(e => !validElements.map(i => i).includes(e.localName))
  );
  return [invalidElements, validElements];
}

export function auditParentElement(
  host: HTMLElement & { constructor: { metadata?: { parents?: string[] } } }
): [boolean, string[]] {
  const validParentTags = host.constructor.metadata?.parents ?? [];
  return validParentTags.length
    ? [!!validParentTags.find(p => host.parentElement?.localName === p), validParentTags]
    : [true, []];
}
