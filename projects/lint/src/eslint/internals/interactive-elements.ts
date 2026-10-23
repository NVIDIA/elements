// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { BUTTON_TYPE_ELEMENTS } from './button-elements.js';

export const INTERACTIVE_ELEMENTS: ReadonlySet<string> = new Set([
  ...BUTTON_TYPE_ELEMENTS,
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  'nve-checkbox',
  'nve-color',
  'nve-combobox',
  'nve-date',
  'nve-datetime',
  'nve-drag-handle',
  'nve-file',
  'nve-input',
  'nve-month',
  'nve-password',
  'nve-preferences-input',
  'nve-progressive-filter-chip',
  'nve-radio',
  'nve-range',
  'nve-search',
  'nve-select',
  'nve-switch',
  'nve-textarea',
  'nve-time',
  'nve-week',
  'nve-media-playback-rate-select',
  'nve-media-time-range',
  'nve-media-volume-range',
  'nve-viewport-minimap',
  'nve-viewport-zoom-range'
]);
