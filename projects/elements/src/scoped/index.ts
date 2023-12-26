import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { define } from '@elements/elements/internal';

/**
 * Utility for applying mixin recursively to all Elements, used for scoped element registry polyfills and shims
 */
export function scope(element: any, Mixin = ScopedRegistryHost) {
  return class extends Mixin(element as any) {
    static elementDefinitions = Object.entries({ ...element.elementDefinitions }).reduce((p, [tag, el]) => ({ ...p, [tag]: scope(el, Mixin) }), { })
  };
}

/**
 * Utility for registering Elements with a scope suffix when Custom Element Scoped Registries are not available
 */
export function defineScopedElement(suffix: string, Element: any, Mixin = ScopedRegistryHost) {
  define(scope(Element, Mixin) as any, { suffix });
}
