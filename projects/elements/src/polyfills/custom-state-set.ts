/**
 * CustomStateSet Polyfill for :state() syntax downleveled to legacy :--state syntax (Chromium < v123)
 * https://html.spec.whatwg.org/multipage/custom-elements.html#exposing-custom-element-states
 */

setupCustomStateSetPolyfill();

class CustomStateSetPolyfill extends Set {
  #stateSet = null;

  constructor(stateSet) {
    super();
    this.#stateSet = stateSet;
  }

  add(state) {
    super.add(state);
    try {
      // try latest syntax :state()
      this.#stateSet?.add(state);
    } catch {
      // else fallback to legacy syntax :--state
      this.#stateSet?.add(`--${state}`);
    }
    return this;
  }

  delete(state) {
    super.delete(state);
    this.#stateSet?.delete(state);
    this.#stateSet?.delete(`--${state}`);
    return true;
  }

  clear() {
    for (const state of this) this.delete(state);
  }
}

export function setupCustomStateSetPolyfill() {
  try {
    if (globalThis.happyDOM) {
      throw new Error(':state() unsupported in happy-dom');
    }
    globalThis.document.body.matches(':state(supported)');
  } catch {
    if (globalThis.HTMLElement) {
      customStateSetPolyfill();
    }
  }
}

function customStateSetPolyfill() {
  const attachInternals = HTMLElement.prototype.attachInternals;
  Object.defineProperty(HTMLElement.prototype, 'attachInternals', {
    value: function (...args) {
      const internals = attachInternals.call(this, args);
      Object.defineProperty(internals, 'states', { value: new CustomStateSetPolyfill(internals.states) });

      return internals;
    }
  });

  const matches = Element.prototype.matches;
  Object.defineProperty(Element.prototype, 'matches', {
    value: function (text) {
      return matches.call(this, replaceToLegacyState(text));
    }
  });

  const replaceSync = CSSStyleSheet.prototype.replaceSync;
  Object.defineProperty(CSSStyleSheet.prototype, 'replaceSync', {
    value: function (text) {
      replaceSync.call(this, replaceToLegacyState(text));
    }
  });
}

function replaceToLegacyState(value: string) {
  return value.replace(/:state\(([^\)]+)\)/g, ':--$1'); // eslint-disable-line
}
