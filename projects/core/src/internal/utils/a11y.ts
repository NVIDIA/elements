// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { generateId } from './dom.js';

export function attachInternals(element: HTMLElement & { _internals?: ElementInternals }) {
  if (element._internals === undefined) {
    element._internals = element.attachInternals() as unknown as ElementInternals;
  }
}

export function associateLabel(label: HTMLLabelElement, input: HTMLInputElement) {
  if (label && input) {
    input.id = input.id ? input.id : generateId();
    label.htmlFor = input.id;
  }
}

export function associateAriaLabel(label: HTMLElement, element: HTMLElement) {
  if (label && element) {
    label.id = label.id ? label.id : generateId();
    element.setAttribute('aria-labelledby', label.id);
  }
}

export function associateAriaDescribedBy(messages: HTMLElement[], element: HTMLElement) {
  if (messages.length && element) {
    const ids = messages.map(m => (m.id = generateId())).join(' ');
    element.setAttribute('aria-describedby', ids);
  }
}

export function associateDataList(datalist: HTMLDataListElement, element: HTMLInputElement) {
  if (datalist) {
    datalist.id = datalist.id?.length ? datalist.id : generateId();
    element.setAttribute('list', datalist.id);
  }
}

export function associateControlGroup(elements: HTMLInputElement[]) {
  if (!elements.find(e => e?.name?.length)) {
    const name = generateId();
    elements.forEach(e => (e.name = name));
  }
}
