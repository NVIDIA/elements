// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nService, I18nService_ } from './i18n.service.js';

describe('I18nService', () => {
  beforeEach(() => {
    window.NVE_ELEMENTS.state.versions = ['0.0.0'];
    window.NVE_ELEMENTS.state.elementRegistry = {};
    (window.NVE_ELEMENTS.state as { i18nRegistry: Record<string, string> }).i18nRegistry = {};
    new I18nService_();
  });

  it('should start with an empty i18n registry', () => {
    expect(I18nService.i18n).toStrictEqual({});
  });

  it('should silently register missing defaults without overwriting translations', () => {
    I18nService.update({ previous: 'précédente' });
    const listener = vi.fn();
    globalThis.document.addEventListener('NVE_ELEMENTS_I18N_UPDATE', listener);

    I18nService.registerDefaults({ previous: 'previous', next: 'next' });

    expect(I18nService.i18n.previous).toBe('précédente');
    expect(I18nService.i18n.next).toBe('next');
    expect(listener).not.toHaveBeenCalled();
    globalThis.document.removeEventListener('NVE_ELEMENTS_I18N_UPDATE', listener);
  });

  it('should update i18n state', () => {
    const original = { ...I18nService.i18n };
    const translations = {
      close: 'fermer',
      copy: 'copie',
      copied: 'copié',
      expand: 'étendre',
      select: 'choisir',
      selected: 'choisir',
      sort: 'classer',
      show: 'montrer',
      hide: 'cacher',
      loading: 'bourrage',
      previous: 'précédente',
      next: 'suivante',
      start: 'page de démarrage',
      end: 'page de fin',
      currentPage: 'page actuelle',
      noResults: 'aucun résultat',
      status: 'statut',
      information: 'information',
      warning: 'avertissement',
      success: 'succès',
      danger: 'danger',
      trend: "s'orienter",
      down: 'vers le bas',
      up: 'en haut',
      neutral: 'neutre',
      of: 'de',
      theme: 'thème',
      scale: 'échelle',
      reducedMotion: 'mouvement réduit',
      colorScheme: 'schéma de couleur',
      resize: 'redimensionner',
      or: 'or',
      files: 'files',
      dragAndDrop: 'drag & drop',
      browseFiles: 'browse files',
      maxFileSize: 'max file size',
      create: 'créer'
    };

    I18nService.update(translations);

    expect(I18nService.i18n).toStrictEqual({ ...original, ...translations });

    I18nService.update(original);
  });

  it('should not emit event if already initialized', () => {
    const listener = vi.fn();
    globalThis.document.addEventListener('NVE_ELEMENTS_I18N_UPDATE', listener);
    new I18nService_();
    expect(listener).not.toHaveBeenCalled();
    globalThis.document.removeEventListener('NVE_ELEMENTS_I18N_UPDATE', listener);
  });
});
