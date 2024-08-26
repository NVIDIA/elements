import { deepMerge } from '../utils/objects.js';
import { getEnv } from './global.utils.js';

export class GlobalState {
  constructor() {
    globalThis.NVE_ELEMENTS ??= {
      debug: (log = console.log) =>
        log(
          `%cElements\n%c${JSON.stringify(globalThis.NVE_ELEMENTS.state, null, 2)}`,
          'color: #69b027',
          'color: inherit'
        ),
      state: {
        env: getEnv(),
        versions: [],
        elementRegistry: {},
        i18nRegistry: {},
        audit: {}
      }
    };

    /** @deprecated MLV_ELEMENTS */
    globalThis.MLV_ELEMENTS = globalThis.NVE_ELEMENTS;

    globalThis.NVE_ELEMENTS.state.versions = Array.from(new Set([...globalThis.NVE_ELEMENTS.state.versions, '0.0.0']));
  }

  get state() {
    return globalThis.NVE_ELEMENTS.state;
  }

  dispatch(type: string, state: Partial<typeof globalThis.NVE_ELEMENTS.state>) {
    globalThis.NVE_ELEMENTS.state = deepMerge(globalThis.NVE_ELEMENTS.state, state);
    globalThis?.document?.dispatchEvent(new CustomEvent(type, { detail: globalThis.NVE_ELEMENTS.state }));
  }
}

export const GlobalStateService = new GlobalState();
