import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import type { LitElement } from 'lit';

type LitElementConstructor = new (...args: any[]) => LitElement; // eslint-disable-line @typescript-eslint/no-explicit-any

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
