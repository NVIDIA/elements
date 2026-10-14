// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { ViewportAccessory, ViewportTarget } from '../viewport.types.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = LitElement> = new (...args: any[]) => T;

type ViewportCandidate = HTMLElement & { readonly hasUpdated?: boolean };

/** Associates an accessory with its viewport and subscribes to committed state. */
export function ViewportAccessoryMixin<TBase extends Constructor>(Base: TBase): Constructor<ViewportAccessory> & TBase {
  class ViewportAccessoryBase extends Base {
    #explicitTarget: WeakRef<HTMLElement> | null = null;
    #parentTarget: HTMLElement | null = null;
    #target: ViewportCandidate | null = null;
    #readyTarget: ViewportTarget | null = null;
    #connected = false;
    #discoveryRoot: Node | null = null;
    #targetInput: HTMLElement | string | null | undefined;

    override connectedCallback(): void {
      super.connectedCallback();
      this.#parentTarget = this.parentElement?.localName === 'nve-viewport' ? this.parentElement : null;
      this.#connected = true;
      this.#syncTarget();
    }

    protected override willUpdate(changed: PropertyValues<this>): void {
      this.#syncTarget();
      super.willUpdate(changed);
    }

    override disconnectedCallback(): void {
      this.#connected = false;
      this.#parentTarget = null;
      this.#targetInput = undefined;
      this.#disconnectTarget();
      this.#target = null;
      this.#setDiscoveryRoot(null);
      this.#syncReadyTarget();
      super.disconnectedCallback();
    }

    @property({ type: String, attribute: 'commandfor' })
    get commandfor(): string | null {
      return this.getAttribute('commandfor');
    }

    set commandfor(value: string | null) {
      if (value === this.commandfor) {
        this.#explicitTarget = null;
        this.requestUpdate();
        return;
      }
      if (value === null) this.removeAttribute('commandfor');
      else this.setAttribute('commandfor', value);
    }

    @property({ attribute: false })
    get commandForElement(): HTMLElement | null {
      const input = this.#getTargetInput();
      if (this.#explicitTarget && input && typeof input !== 'string' && !this.#isInScope(input)) return null;
      return typeof input === 'string' ? getViewportAssociationById(this, input) : input;
    }

    set commandForElement(value: HTMLElement | null) {
      this.#explicitTarget = null;
      if (value) {
        this.setAttribute('commandfor', '');
        this.#explicitTarget = new WeakRef(value);
      } else {
        this.removeAttribute('commandfor');
      }
      this.requestUpdate();
    }

    // eslint-disable-next-line max-params
    override attributeChangedCallback(
      name: string,
      previous: string | null,
      value: string | null,
      namespace: string | null = null
    ): void {
      if (namespace !== null) return;
      if (name === 'commandfor') {
        this.#explicitTarget = null;
        this.requestUpdate();
      }
      super.attributeChangedCallback(name, previous, value);
    }

    protected resolveViewport(): ViewportTarget | null {
      this.#syncTarget();
      return this.#readyTarget;
    }

    protected viewportConnected(_target: ViewportTarget): void {}

    protected viewportChanged(_target: ViewportTarget): void {}

    protected viewportDisconnected(): void {}

    #getTargetInput(): HTMLElement | string | null {
      if (this.#explicitTarget) return this.#explicitTarget.deref() ?? null;
      return this.commandfor ?? this.#parentTarget;
    }

    #isInScope(target: HTMLElement): boolean {
      let ancestor: Node | null = this.parentNode;
      while (ancestor) {
        const root = ancestor.getRootNode();
        if (root.contains(target)) return true;
        ancestor = isShadowRoot(root) ? root.host : null;
      }
      return false;
    }

    #syncTarget(): void {
      if (!this.#connected) return;
      const targetInput = this.#getTargetInput();
      if (targetInput === this.#targetInput && this.#hasValidTarget(targetInput)) {
        this.#syncReadyTarget();
        return;
      }
      const element = typeof targetInput === 'string' ? getViewportAssociationById(this, targetInput) : targetInput;
      const target = element?.localName === 'nve-viewport' ? element : null;
      if (target) this.#targetInput = targetInput;
      this.#syncDiscoveryRoot(targetInput, target);
      if (target !== this.#target) this.#bindTarget(target);
      this.#syncReadyTarget();
    }

    #bindTarget(target: ViewportCandidate | null): void {
      this.#disconnectTarget();
      this.#target = target;
      target?.addEventListener('viewportready', this.#handleReady);
      target?.addEventListener('viewportchange', this.#handleChange);
      target?.addEventListener('capabilitieschange', this.#handleChange);
    }

    #syncReadyTarget(): void {
      const target = isReadyViewport(this.#target) && this.#isInScope(this.#target) ? this.#target : null;
      if (target === this.#readyTarget) return;
      const previous = this.#readyTarget;
      this.#readyTarget = target;
      if (previous) this.viewportDisconnected();
      if (target) this.viewportConnected(target);
    }

    #syncDiscoveryRoot(input: HTMLElement | string | null, target: ViewportCandidate | null): void {
      this.#setDiscoveryRoot(typeof input === 'string' && input !== '' && !target ? this.getRootNode() : null);
    }

    #setDiscoveryRoot(root: Node | null): void {
      if (root === this.#discoveryRoot) return;
      this.#discoveryRoot?.removeEventListener('viewportready', this.#handleDiscovery);
      this.#discoveryRoot = root;
      root?.addEventListener('viewportready', this.#handleDiscovery);
    }

    #hasValidTarget(input: HTMLElement | string | null): boolean {
      return (
        !!this.#target &&
        (typeof input !== 'string' ||
          (this.#target.isConnected && this.#target.id === input && this.#target.getRootNode() === this.getRootNode()))
      );
    }

    #disconnectTarget(): void {
      this.#target?.removeEventListener('viewportready', this.#handleReady);
      this.#target?.removeEventListener('viewportchange', this.#handleChange);
      this.#target?.removeEventListener('capabilitieschange', this.#handleChange);
    }

    #handleDiscovery = (): void => this.#syncTarget();

    #handleReady = (event: Event): void => {
      const previous = this.#readyTarget;
      this.#syncTarget();
      if (event.target !== this.#target || !this.#readyTarget || previous !== this.#readyTarget) return;
      this.viewportConnected(this.#readyTarget);
    };

    #handleChange = (event: Event): void => {
      const previous = this.#readyTarget;
      this.#syncTarget();
      if (event.target !== this.#target || !this.#readyTarget || previous !== this.#readyTarget) return;
      this.viewportChanged(this.#readyTarget);
    };
  }

  return ViewportAccessoryBase as unknown as Constructor<ViewportAccessory> & TBase;
}

function isReadyViewport(target: ViewportCandidate | null): target is ViewportTarget {
  return target?.hasUpdated === true && target.isConnected;
}

function getViewportAssociationById(host: HTMLElement, id: string): HTMLElement | null {
  if (!id) return null;
  const element = getElementByIdInTree(host.getRootNode(), id);
  return isHTMLElement(element) ? element : null;
}

function getElementByIdInTree(root: Node, id: string): Element | null {
  if (isDocumentOrFragment(root)) return root.getElementById(id);
  if (isElement(root)) return getElementByIdInSubtree(root, id);
  return null;
}

function getElementByIdInSubtree(root: Element, id: string): Element | null {
  if (root.id === id) return root;
  return root.querySelector(`#${CSS.escape(id)}`);
}

function isDocumentOrFragment(node: Node): node is Document | DocumentFragment {
  return node.nodeType === Node.DOCUMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
}

function isElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE;
}

function isShadowRoot(node: Node): node is ShadowRoot {
  return node.nodeType === Node.DOCUMENT_FRAGMENT_NODE && 'host' in node;
}

function isHTMLElement(element: Element | null): element is HTMLElement {
  return element?.namespaceURI === 'http://www.w3.org/1999/xhtml';
}
