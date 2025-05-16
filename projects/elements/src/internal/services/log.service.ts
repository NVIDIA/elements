import { GlobalStateService } from './global.service.js';

const prefix = '@nve: ';

export class LogService {
  static log(value, ...args) {
    if (GlobalStateService.state.env !== 'production') {
      console.log(`${prefix}${value}`, ...args);
    }
  }

  static warn(value, ...args) {
    if (GlobalStateService.state.env !== 'production') {
      console.warn(`${prefix}${value}`, ...args);
      this.#dispatch(value, ...args);
    }
  }

  static error(value, ...args) {
    if (GlobalStateService.state.env !== 'production') {
      console.error(`${prefix}${value}`, ...args);
      this.#dispatch(value, ...args);
    }
  }

  static #dispatch(value, ...args) {
    globalThis.document.dispatchEvent(new CustomEvent('NVE_ELEMENTS_LOG', { detail: { type: 'warn', value, args } }));
  }
}
