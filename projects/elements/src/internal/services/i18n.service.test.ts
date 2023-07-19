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
      loading: 'loading',
      previous: 'previous',
      next: 'next',
      start: 'start',
      end: 'end',
      currentPage: 'current page'
    });
  });

  it('should update i18n state', () => {
    const original = { ...I18nService.i18n };

    I18nService.update({
      close: 'fermer',
      expand: 'étendre',
      sort: 'classer',
      show: 'montrer',
      hide: 'cacher',
      loading: 'bourrage',
      previous: 'précédente',
      next: 'suivante',
      start: 'page de démarrage',
      end: 'page de fin',
      currentPage: 'page actuelle'
    });

    expect(I18nService.i18n).toStrictEqual({
      close: 'fermer',
      expand: 'étendre',
      sort: 'classer',
      show: 'montrer',
      hide: 'cacher',
      loading: 'bourrage',
      previous: 'précédente',
      next: 'suivante',
      start: 'page de démarrage',
      end: 'page de fin',
      currentPage: 'page actuelle'
    });

    I18nService.update(original);
  });
});