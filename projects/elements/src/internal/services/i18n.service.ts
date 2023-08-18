import { GlobalStateService } from './global.service.js';

export interface I18nStrings {
  close: string;
  expand: string;
  select: string;
  selected: string;
  sort: string;
  show: string;
  hide: string;
  loading: string;
  previous: string;
  next: string;
  start: string;
  end: string;
  currentPage: string;
}

const i18nRegistry = {
  close: 'close',
  expand: 'expand',
  select: 'select',
  selected: 'selected',
  sort: 'sort',
  show: 'show',
  hide: 'hide',
  loading: 'loading',
  previous: 'previous',
  next: 'next',
  start: 'start',
  end: 'end',
  currentPage: 'current page'
};

export class I18nService_ {
  get i18n(): Partial<I18nStrings> {
    return { ...GlobalStateService.state.i18nRegistry };
  }

  constructor() {
    if (Object.keys(GlobalStateService.state.i18nRegistry).length === 0) {
      GlobalStateService.dispatch('MLV_ELEMENTS_I18N_UPDATE', { i18nRegistry });
    }
  }

  update(i18nRegistry: Partial<typeof window.MLV_ELEMENTS.state.i18nRegistry>) { // eslint-disable-line no-restricted-globals
    GlobalStateService.dispatch('MLV_ELEMENTS_I18N_UPDATE', { i18nRegistry });
  }
}

export const I18nService = new I18nService_();
