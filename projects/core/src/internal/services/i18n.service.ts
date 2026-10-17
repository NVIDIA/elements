// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { GlobalStateService } from './global.service.js';

export interface I18nStrings {
  workspaceArrange: string;
  workspacePanels: string;
  workspaceDragGroup: string;
  workspaceArrangePanels: string;
  workspaceOperation: string;
  workspaceSplit: string;
  workspaceOrder: string;
  workspaceInsert: string;
  workspaceScope: string;
  workspaceArrangement: string;
  workspaceEntire: string;
  workspaceBefore: string;
  workspaceAfter: string;
  workspaceGroup: string;
  workspacePanel: string;
  workspaceDestination: string;
  workspacePlacement: string;
  workspaceJoin: string;
  workspaceLeft: string;
  workspaceRight: string;
  workspaceAbove: string;
  workspaceBelow: string;
  workspaceMove: string;
  workspaceEarlier: string;
  workspaceLater: string;
  workspaceCancel: string;
  workspaceResize: string;

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
}

const i18nRegistry = {
  workspaceArrange: 'Arrange',
  workspacePanels: 'Workspace panels',
  workspaceDragGroup: 'Drag panel group',
  workspaceArrangePanels: 'Arrange workspace panels',
  workspaceOperation: 'Operation',
  workspaceSplit: 'Split pane',
  workspaceOrder: 'Order peers',
  workspaceInsert: 'Insert into arrangement',
  workspaceScope: 'Scope',
  workspaceArrangement: 'Target arrangement',
  workspaceEntire: 'Whole workspace',
  workspaceBefore: 'Before peer',
  workspaceAfter: 'After peer',
  workspaceGroup: 'Move whole group',
  workspacePanel: 'Move only this tab',
  workspaceDestination: 'Destination',
  workspacePlacement: 'Placement',
  workspaceJoin: 'Join tabs',
  workspaceLeft: 'Split left',
  workspaceRight: 'Split right',
  workspaceAbove: 'Split above',
  workspaceBelow: 'Split below',
  workspaceMove: 'Move',
  workspaceEarlier: 'Move tab earlier',
  workspaceLater: 'Move tab later',
  workspaceCancel: 'Cancel',
  workspaceResize: 'Resize workspace regions',

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
  maxFileSize: 'max file size',
  create: 'create',
  currentTime: 'current time',
  enableLoop: 'enable looping',
  disableLoop: 'disable looping',
  enterFullscreen: 'enter full screen',
  enterPip: 'enter picture in picture',
  exitFullscreen: 'exit full screen',
  exitPip: 'exit picture in picture',
  muteMedia: 'mute media',
  pauseMedia: 'pause media',
  playMedia: 'play media',
  playbackRate: 'playback rate',
  playbackRateOption: '{rate}x',
  seekBackward: 'seek backward {value} seconds',
  seekForward: 'seek forward {value} seconds',
  seekToEnd: 'seek to end',
  seekToStart: 'seek to start',
  unmuteMedia: 'unmute media',
  volume: 'volume'
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

  update(registry: Partial<typeof globalThis.NVE_ELEMENTS.state.i18nRegistry>) {
    GlobalStateService.dispatch('NVE_ELEMENTS_I18N_UPDATE', { i18nRegistry: registry } as Partial<
      typeof globalThis.NVE_ELEMENTS.state
    >);
  }
}

export const I18nService = new I18nService_();
