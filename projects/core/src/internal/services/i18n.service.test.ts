// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it } from 'vitest';
import { I18nService, I18nService_ } from './i18n.service.js';

describe('I18nService', () => {
  beforeEach(() => {
    window.NVE_ELEMENTS.state.versions = ['0.0.0'];
    window.NVE_ELEMENTS.state.elementRegistry = {};
  });

  it('should provide an intial i18n state', () => {
    expect(I18nService.i18n).toStrictEqual({
      close: 'close',
      copy: 'copy',
      copied: 'copied',
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
      currentPage: 'current page',
      noResults: 'no results',
      status: 'status',
      information: 'information',
      warning: 'warning',
      success: 'success',
      danger: 'danger',
      trend: 'trend',
      down: 'down',
      up: 'up',
      neutral: 'neutral',
      of: 'of',
      theme: 'theme',
      scale: 'scale',
      reducedMotion: 'reduced motion',
      colorScheme: 'color scheme',
      resize: 'resize',
      or: 'or',
      files: 'files',
      dragAndDrop: 'drag & drop',
      browseFiles: 'browse files',
      maxFileSize: 'max file size'
    });
  });

  it('should update i18n state', () => {
    const original = { ...I18nService.i18n };

    I18nService.update({
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
      maxFileSize: 'max file size'
    });

    expect(I18nService.i18n).toStrictEqual({
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
      maxFileSize: 'max file size'
    });

    I18nService.update(original);
  });

  it('should not emit event if already initialized', () => {
    let event = 0;
    globalThis.document.addEventListener('NVE_ELEMENTS_I18N_UPDATE', () => event++);
    new I18nService_();
    expect(event).toBe(0);
  });
});
