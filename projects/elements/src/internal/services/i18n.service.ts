import { GlobalStateService } from './global.service.js';

export interface I18nStrings {
  close: string;
  expand: string;
  sort: string;
  show: string;
  hide: string;
  loading: string;
}

const i18nRegistry = {
  close: 'close',
  expand: 'expand',
  sort: 'sort',
  show: 'show',
  hide: 'hide',
  loading: 'loading'
};

class I18n {
  get i18n(): Partial<I18nStrings> {
    return { ...GlobalStateService.state.i18nRegistry };
  }

  constructor() {
    if (Object.keys(GlobalStateService.state.i18nRegistry).length === 0) {
      GlobalStateService.dispatch('MLV_ELEMENTS_I18N_UPDATE', { i18nRegistry });
    }
  }

  update(i18nRegistry: Partial<typeof window.MLV_ELEMENTS.state.i18nRegistry>) {
    GlobalStateService.dispatch('MLV_ELEMENTS_I18N_UPDATE', { i18nRegistry });
  }
}

export const I18nService = new I18n();
