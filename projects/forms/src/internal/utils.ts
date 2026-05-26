// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export function isObjectLiteral(item: unknown) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return false;
  }
  const proto = Object.getPrototypeOf(item);
  return proto === null || proto === Object.prototype;
}

export function attachInternals(element: HTMLElement & { _internals?: ElementInternals }) {
  if (element._internals === undefined) {
    element._internals = element.attachInternals() as unknown as ElementInternals;
  }

  return element._internals;
}

export function toggleState(internals: ElementInternals, state: string, force: boolean) {
  if (force) {
    internals.states.add(state);
  } else {
    internals.states.delete(state);
  }
}

export type PopoverAnchorElement = HTMLElement & { anchor?: HTMLElement | string; _activeTrigger?: HTMLElement };

export function getFlattenedDOMTree(node: Node, depth = 10): HTMLElement[] {
  return (
    Array.from(getChildren(node)).reduce(
      (p: unknown[], n: Node) => [
        ...p,
        [n, [...Array.from(getChildren(n)).map(i => [i, getFlattenedDOMTree(i, depth)])]]
      ],
      []
    ) as unknown as HTMLElement[]
  ).flat(depth);
}

export function getHostAnchor(host: PopoverAnchorElement) {
  const anchor = host.anchor ?? host._activeTrigger;

  if (typeof anchor === 'string' && anchor.length) {
    if (!host.parentNode) {
      return globalThis.document.body;
    }

    return (
      getFlattenedDOMTree(host.parentNode as Node).find(element => element.id === anchor) ?? globalThis.document.body
    );
  }

  if (anchor instanceof HTMLElement && anchor !== globalThis.document.body) {
    return anchor;
  }

  return globalThis.document.body;
}

export function getStringValue(value: unknown) {
  if (typeof value === 'string' && value.length) {
    return value;
  }

  return value === '' ? '' : null;
}

export function hasAttributeValue(element: HTMLElement, attribute: string, value: string | null) {
  return value === null ? !element.hasAttribute(attribute) : element.getAttribute(attribute) === value;
}

export function isFormElement(value: unknown): value is HTMLFormElement {
  return typeof HTMLFormElement !== 'undefined' && value instanceof HTMLFormElement;
}

export function onKeys(events: string[], event: KeyboardEvent, callback: () => void) {
  if (events.includes(event.code)) {
    callback();
  }
}

export function removeEmptyTextNode(node: Node) {
  if ((node as Text)?.wholeText?.trim() === '') {
    node.parentNode?.removeChild(node);
  }
}

export function setAttributeValue(element: HTMLElement, attribute: string, value: string | null) {
  if (value === null) {
    element.removeAttribute(attribute);
  } else {
    element.setAttribute(attribute, value);
  }
}

export function stopEvent(event: Event) {
  event.preventDefault();
  event.stopPropagation();
}

function getChildren(node: Node): Element[] {
  if (isDocumentNode(node)) {
    return Array.from(node.documentElement.children);
  }

  if (isElementWithShadowRoot(node)) {
    return Array.from(node.shadowRoot.children);
  }

  if (isSlotElement(node)) {
    const slotted = node.assignedElements();
    return slotted.length ? slotted : Array.from(node.children);
  }

  return Array.from((node as HTMLElement).children ?? []);
}

function isDocumentNode(node: Node): node is Document {
  return typeof Document !== 'undefined' && node instanceof Document && Boolean(node.documentElement);
}

function isElementWithShadowRoot(node: Node): node is HTMLElement & { shadowRoot: ShadowRoot } {
  return typeof HTMLElement !== 'undefined' && node instanceof HTMLElement && Boolean(node.shadowRoot);
}

function isSlotElement(node: Node): node is HTMLSlotElement {
  return typeof HTMLSlotElement !== 'undefined' && node instanceof HTMLSlotElement && Boolean(node.assignedElements);
}
