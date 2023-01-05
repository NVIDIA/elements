import { deepMerge } from '../utils/objects.js';

export class GlobalState {
  constructor() {
    window.MLV_ELEMENTS ??= {
      debug: () => console.log(`%c@elements/elements\n%c${JSON.stringify(window.MLV_ELEMENTS.state, null, 2)}`, 'color: #69b027', 'color: inherit'),
      state: {
        versions: [],
        elementRegistry: { },
        i18nRegistry: { },
        iconRegistry: { }
      }
    };

    window.MLV_ELEMENTS.state.versions = Array.from(new Set([...window.MLV_ELEMENTS.state.versions, 'PACKAGE_VERSION']));
  }

  get state() {
    return window.MLV_ELEMENTS.state;
  }

  dispatch(type: string, state: Partial<typeof window.MLV_ELEMENTS.state>) {
    window.MLV_ELEMENTS.state = deepMerge(window.MLV_ELEMENTS.state, state);
    document.dispatchEvent(new CustomEvent(type, { detail: window.MLV_ELEMENTS.state }));
  }
}

export const GlobalStateService = new GlobalState();
