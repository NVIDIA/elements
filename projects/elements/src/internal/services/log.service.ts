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
    }
  }

  static error(value, ...args) {
    if (GlobalStateService.state.env !== 'production') {
      console.error(`${prefix}${value}`, ...args);
    }
  }
}
