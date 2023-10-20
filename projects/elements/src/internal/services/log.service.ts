import { GlobalStateService } from './global.service.js';

export class LogService {
  static log(args: any) {
    if (GlobalStateService.state.env !== 'production') {
      console.log(...args);
    }
  }

  static error(value, ...args: any) {
    if (GlobalStateService.state.env !== 'production') {
      console.error(value, ...args);
    }
  }
}
