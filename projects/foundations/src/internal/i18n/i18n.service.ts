// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { GlobalStateService } from '../state/index.js';
import type { ElementsGlobal } from '../state/index.js';

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
  move: string;
  or: string;
  files: string;
  dragAndDrop: string;
  browseFiles: string;
  maxFileSize: string;
  create: string;
  currentTime: string;
  enableLoop: string;
  disableLoop: string;
  enterFullscreen: string;
  enterPip: string;
  exitFullscreen: string;
  exitPip: string;
  muteMedia: string;
  pauseMedia: string;
  playMedia: string;
  playbackRate: string;
  playbackRateOption: string;
  seekBackward: string;
  seekForward: string;
  seekToEnd: string;
  seekToStart: string;
  unmuteMedia: string;
  volume: string;
  joystickPosition: string;
  joystickNoPosition: string;
  joystickInstructions: string;
  joystickHoldInstructions: string;
  joystickReturnedToCenter: string;
}

export type I18nDefaults = Readonly<Partial<I18nStrings>>;

export class I18nService_ {
  get i18n(): Partial<I18nStrings> {
    return { ...GlobalStateService.state.i18nRegistry };
  }

  registerDefaults(registry: I18nDefaults) {
    const current = GlobalStateService.state.i18nRegistry;
    const missing = Object.entries(registry).reduce<Record<string, string>>((result, [key, value]) => {
      if (value !== undefined && current[key] === undefined) {
        result[key] = value;
      }
      return result;
    }, {});

    if (Object.keys(missing).length > 0) {
      GlobalStateService.merge({ i18nRegistry: missing });
    }
  }

  update(registry: Partial<ElementsGlobal['state']['i18nRegistry']>) {
    GlobalStateService.dispatch('NVE_ELEMENTS_I18N_UPDATE', { i18nRegistry: registry } as Partial<
      typeof globalThis.NVE_ELEMENTS.state
    >);
  }
}

export const I18nService = new I18nService_();
