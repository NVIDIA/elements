// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { RenderOptions } from 'lit';
import { GlobalStateService } from '../services/global.service.js';
import type { ElementDefinition, LegacyDecoratorTarget } from '../types/index.js';
import { defineElement, supportsScopedRegistry } from '../utils/dom.js';

interface ScopedRegistryHost extends HTMLElement {
  createRenderRoot?: () => HTMLElement | DocumentFragment;
  renderOptions?: RenderOptions;
}

const litCreationScopeElements = new WeakSet<ElementDefinition>();

/** Lit passes a legacy `deep` boolean, but scoped registries require `ImportNodeOptions`. https://html.spec.whatwg.org/multipage/custom-elements.html#scoped-custom-element-registries */
function createScopedCreationScope(ownerDocument: Document, customElementRegistry: CustomElementRegistry) {
  return {
    importNode: (node: Node, deep = false) =>
      ownerDocument.importNode(node, {
        customElementRegistry,
        selfOnly: !deep
      })
  } satisfies NonNullable<RenderOptions['creationScope']>;
}

function attachLitCreationScope(element: ElementDefinition, customElementRegistry: CustomElementRegistry) {
  if (litCreationScopeElements.has(element)) return;

  const host = element.prototype as ScopedRegistryHost;
  const createRenderRoot = host.createRenderRoot;
  if (!createRenderRoot) return;

  litCreationScopeElements.add(element);
  Object.defineProperty(host, 'createRenderRoot', {
    configurable: true,
    value(this: ScopedRegistryHost) {
      const renderRoot = createRenderRoot.call(this);
      if (renderRoot instanceof ShadowRoot) {
        this.renderOptions ??= {};
        this.renderOptions.creationScope = createScopedCreationScope(renderRoot.ownerDocument, customElementRegistry);
      }
      return renderRoot;
    }
  });
}

/** decorator which registers element dependencies with the scoped custom element registry when available */
export function scopedRegistry(): ClassDecorator {
  return (target: LegacyDecoratorTarget) => {
    const element = target as unknown as ElementDefinition;
    GlobalStateService.state.scopedRegistry ??= {};
    const customElementRegistry = GlobalStateService.state.scopedRegistry[element.metadata.version] ?? customElements;
    if (supportsScopedRegistry) {
      Object.defineProperty(element, 'shadowRootOptions', {
        configurable: true,
        value: { ...(element.shadowRootOptions ?? { mode: 'open' }), customElementRegistry }
      });
      attachLitCreationScope(element, customElementRegistry);
    }
    defineElement(element, customElementRegistry);
  };
}
