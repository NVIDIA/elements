import { deepMerge } from '../utils/objects.js';

export class GlobalState {
  constructor() {
    globalThis.MLV_ELEMENTS ??= {
      debug: (log = console.log) => log(`%c@elements/elements\n%c${JSON.stringify(globalThis.MLV_ELEMENTS.state, null, 2)}`, 'color: #69b027', 'color: inherit'),
      state: {
        env: (import.meta as any).env.MODE,
        versions: [],
        elementRegistry: { },
        i18nRegistry: { },
        iconRegistry: { }
      }
    };

    globalThis.MLV_ELEMENTS.state.versions = Array.from(new Set([...globalThis.MLV_ELEMENTS.state.versions, 'PACKAGE_VERSION']));
  }

  get state() {
    return globalThis.MLV_ELEMENTS.state;
  }

  dispatch(type: string, state: Partial<typeof globalThis.MLV_ELEMENTS.state>) {
    globalThis.MLV_ELEMENTS.state = deepMerge(globalThis.MLV_ELEMENTS.state, state);
    globalThis?.document?.dispatchEvent(new CustomEvent(type, { detail: globalThis.MLV_ELEMENTS.state }));
  }
}

export const GlobalStateService = new GlobalState();
