import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import type { LitElement } from 'lit';

type LitElementConstructor = new (...args) => LitElement;

/**
 * Utility for applying mixin recursively to all Elements, used for scoped element registry polyfills and shims
 */
export function scope(
  element: LitElementConstructor & { elementDefinitions?: Record<string, LitElementConstructor> },
  Mixin = ScopedRegistryHost
): typeof element {
  return class extends Mixin(element) {
    static elementDefinitions = Object.entries({ ...element.elementDefinitions }).reduce(
      (p, [tag, el]) => ({ ...p, [tag]: scope(el, Mixin) }),
      {}
    );
  } as typeof element;
}

/**
 * @deprecated
 * Utility for registering Elements with a scope suffix when Custom Element Scoped Registries are not available
 */
export function defineScopedElement(
  suffix: string,
  Element: LitElementConstructor & { metadata: { tag: string } },
  Mixin = ScopedRegistryHost
) {
  const { tag } = Element.metadata;
  /* istanbul ignore next -- @preserve */
  const tagName = `${tag}${suffix ? `-${suffix}` : ''}`;

  /* istanbul ignore next -- @preserve */
  if (!customElements.get(tagName)) {
    customElements.define(tagName, scope(Element, Mixin));
  }
}
