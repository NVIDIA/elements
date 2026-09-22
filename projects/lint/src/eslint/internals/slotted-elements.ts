// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Allowed direct element children declared by production component
 * `metadata.children` contracts.
 */
export const SLOTTED_ELEMENT_CONTRACTS = {
  'nve-accordion': ['nve-accordion-header', 'nve-accordion-content', 'nve-icon-button'],
  'nve-accordion-group': ['nve-accordion'],
  'nve-alert-group': ['nve-alert'],
  'nve-button-group': [
    'nve-button',
    'nve-icon-button',
    'nve-divider',
    'nve-media-seek-button',
    'nve-media-pause-button'
  ],
  'nve-checkbox': ['label', 'input', 'nve-control-message'],
  'nve-checkbox-group': ['label', 'nve-control-message', 'nve-checkbox'],
  'nve-dropdown-group': ['nve-dropdown'],
  'nve-grid': ['nve-grid-row', 'nve-grid-header', 'nve-grid-footer', 'nve-grid-placeholder'],
  'nve-grid-header': ['nve-grid-column'],
  'nve-grid-row': ['nve-grid-cell'],
  'nve-menu': ['nve-menu-item', 'nve-divider'],
  'nve-notification-group': ['nve-notification'],
  'nve-radio': ['label', 'input', 'nve-control-message'],
  'nve-radio-group': ['label', 'nve-control-message', 'nve-radio'],
  'nve-steps': ['nve-steps-item'],
  'nve-switch': ['label', 'input', 'nve-control-message'],
  'nve-switch-group': ['label', 'nve-control-message', 'nve-switch'],
  'nve-tabs': ['nve-tabs-item'],
  'nve-tabs-group': ['nve-tabs'],
  'nve-tree': ['nve-tree-node']
} as const satisfies Readonly<Record<string, readonly string[]>>;

export function getAllowedSlottedElements(tagName: string): readonly string[] | undefined {
  return SLOTTED_ELEMENT_CONTRACTS[tagName as keyof typeof SLOTTED_ELEMENT_CONTRACTS];
}
