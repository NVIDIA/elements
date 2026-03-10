const SUPPORTS_CUSTOM_STATES = CSS.supports('selector(:state(test))');

/**
 * CustomStateSet Polyfill for :state() syntax downleveled to legacy :--state syntax (Chromium < v123)
 * https://html.spec.whatwg.org/multipage/custom-elements.html#exposing-custom-element-states
 *
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1588763
 */

class CustomStateSetPolyfill extends Set {
  // not using native private fields due to terser bug
  private _stateSet: CustomStateSet; // eslint-disable-line no-restricted-syntax
  private _element: HTMLElement; // eslint-disable-line no-restricted-syntax

  constructor(stateSet: CustomStateSet, element: HTMLElement) {
    super();
    this._stateSet = stateSet;
    this._element = element;
  }

  add(state: string) {
    super.add(state);
    try {
      this._stateSet?.add(state.replace('--', ''));
      // try latest syntax :state()
    } catch {
      // else fallback to legacy syntax [state--*]
      this._element.setAttribute(`state--${state.replace('--', '')}`, '');
    }
    return this;
  }

  delete(state: string) {
    super.delete(state);
    try {
      this._stateSet?.delete(state);
    } catch {
      this._element.removeAttribute(`state--${state.replace('--', '')}`);
    }
    return true;
  }

  clear() {
    for (const state of this) this.delete(state);
  }
}

customStateSetPolyfill();

function customStateSetPolyfill() {
  const attachInternals = HTMLElement.prototype.attachInternals;
  Object.defineProperty(HTMLElement.prototype, 'attachInternals', {
    value: function (..._args: unknown[]) {
      const internals = attachInternals.call(this) as unknown as ElementInternals;
      Object.defineProperty(internals, 'states', { value: new CustomStateSetPolyfill(internals.states, this) });
      return internals;
    }
  });

  const matches = Element.prototype.matches;
  Object.defineProperty(Element.prototype, 'matches', {
    value: function (text: string) {
      return matches.call(this, replaceToLegacyState(text));
    }
  });

  const replaceSync = CSSStyleSheet.prototype.replaceSync;
  Object.defineProperty(CSSStyleSheet.prototype, 'replaceSync', {
    value: function (text: string) {
      replaceSync.call(this, replaceToLegacyState(text));
    }
  });
}

function replaceToLegacyState(value: string) {
  // if the browser does not support :state(*) selectors replace any CSS state selectors with attribute fallbacks [state-*]
  if (!SUPPORTS_CUSTOM_STATES) {
    return value.replace(/:--([^\)]+)/g, '[state--$1]').replace(/:state\(([^\)]+)\)/g, '[state--$1]');
  } else {
    return value.replace(/:--([^\)]+)/g, ':state($1)');
  }
}
