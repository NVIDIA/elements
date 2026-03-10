export const libraryRegistry =
  globalThis.CustomElementRegistry && 'initialize' in CustomElementRegistry.prototype
    ? new CustomElementRegistry()
    : customElements;

export function define(
  tag: string,
  element: CustomElementConstructor,
  registry: CustomElementRegistry = customElements
) {
  registry.get(tag) || registry.define(tag, element);
}
