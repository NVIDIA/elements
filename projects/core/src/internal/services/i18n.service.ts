// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { GlobalStateService } from './global.service.js';

export interface I18nStrings {
  close: string;
  copy: string;
  copied: string;
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
  noResults: string;
  status: string;
  information: string;
  warning: string;
  success: string;
  danger: string;
  trend: string;
  down: string;
  up: string;
  neutral: string;
  of: string;
  theme: string;
  scale: string;
  reducedMotion: string;
  colorScheme: string;
  resize: string;
  or: string;
  files: string;
  dragAndDrop: string;
  browseFiles: string;
  maxFileSize: string;
}

const i18nRegistry = {
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
};

export class I18nService_ {
  get i18n(): Partial<I18nStrings> {
    return { ...GlobalStateService.state.i18nRegistry };
  }

  constructor() {
    if (Object.keys(GlobalStateService.state.i18nRegistry).length === 0) {
      GlobalStateService.dispatch('NVE_ELEMENTS_I18N_UPDATE', { i18nRegistry });
    }
  }

  update(i18nRegistry: Partial<typeof globalThis.NVE_ELEMENTS.state.i18nRegistry>) {
    GlobalStateService.dispatch('NVE_ELEMENTS_I18N_UPDATE', { i18nRegistry } as Partial<
      typeof globalThis.NVE_ELEMENTS.state
    >);
  }
}

export const I18nService = new I18nService_();
