import { beforeEach, describe, expect, it } from 'vitest';
import { I18nService } from './i18n.service.js';

describe('GlobalStateService', () => {
  beforeEach(() => {
    window.MLV_ELEMENTS.state.versions = ['PACKAGE_VERSION'];
    window.MLV_ELEMENTS.state.elementRegistry = { };
  });

  it('should provide an intial i18n state', () => {
    expect(I18nService.i18n).toStrictEqual({
      close: 'close',
      expand: 'expand',
      sort: 'sort',
      show: 'show',
      hide: 'hide',
      loading: 'loading'
    });
  });

  it('should update i18n state', () => {
    I18nService.update({
      close: 'fermer',
      expand: 'étendre',
      sort: 'classer',
      show: 'montrer',
      hide: 'cacher',
      loading: 'bourrage'
    });

    expect(I18nService.i18n).toStrictEqual({
      close: 'fermer',
      expand: 'étendre',
      sort: 'classer',
      show: 'montrer',
      hide: 'cacher',
      loading: 'bourrage'
    });
  });
});