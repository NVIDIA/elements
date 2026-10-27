export function attachInternals(element: HTMLElement & { _internals?: ElementInternals }) {
  if (element._internals === undefined) {
    element._internals = element.attachInternals();
  }
}
