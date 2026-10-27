// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ElementDefinition } from './types.js';
import { GlobalStateService } from '../state/state.js';

/** true if the browser supports scoped custom element registries */
export const supportsScopedRegistry =
  globalThis.CustomElementRegistry && 'initialize' in CustomElementRegistry.prototype;

/** defines an element with the given custom element registry */
export function defineElement(element: ElementDefinition, customElementRegistry: CustomElementRegistry) {
  Object.entries(element.elementDefinitions ?? {})
    .filter(([_tag, e]) => !customElementRegistry.get(e.metadata.tag))
    .forEach(([_tag, e]) => {
      defineElement(e, customElementRegistry);
    });

  if (!customElementRegistry.get(element.metadata.tag)) {
    customElementRegistry.define(element.metadata.tag, element);

    if (customElementRegistry === customElements) {
      registerElementVersion(element.metadata.tag, element.metadata.version);
    }
  }
}

/** defines an element with the global custom element registry */
export function define(element: ElementDefinition) {
  const { version } = element.metadata;

  // if scoped registry supported, register only the root element to global registry
  if (supportsScopedRegistry && !customElements.get(element.metadata.tag)) {
    customElements.define(element.metadata.tag, element);
    registerElementVersion(element.metadata.tag, element.metadata.version);
  } else if (!supportsScopedRegistry) {
    // if scoped registry not supported, register the element and all its children to the global registry
    defineElement(element, customElements);
  }

  // warn on duplicate version
  if (
    GlobalStateService.state.elementRegistry[element.metadata.tag] !== version &&
    globalThis?.location?.hostname === 'localhost'
  ) {
    void import('../state/audit-logs.js').then(m =>
      console.warn(m.getDuplicatePackageVersionWarning(element.metadata.tag, version))
    );
  }
}

/** Records global registrations and emits their shared state. */
function registerElementVersion(tag: string, version: string) {
  GlobalStateService.dispatch('NVE_ELEMENT_DEFINE', { elementRegistry: { [tag]: version } });
}
