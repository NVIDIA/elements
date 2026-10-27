// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Direct parent contracts declared by component metadata, including layout-only contracts. */
export const PARENT_ELEMENT_CONTRACTS: Readonly<Record<string, readonly string[]>> = {
  'nve-card-content': ['nve-card'],
  'nve-card-footer': ['nve-card'],
  'nve-card-header': ['nve-card'],
  'nve-dialog-footer': ['nve-dialog'],
  'nve-dialog-header': ['nve-dialog'],
  'nve-drawer-content': ['nve-drawer'],
  'nve-drawer-footer': ['nve-drawer'],
  'nve-drawer-header': ['nve-drawer'],
  'nve-dropdown-footer': ['nve-dropdown'],
  'nve-dropdown-header': ['nve-dropdown'],
  'nve-menu-item': ['nve-menu'],
  'nve-page-panel': ['nve-page'],
  'nve-steps-item': ['nve-steps'],
  'nve-tabs-item': ['nve-tabs', 'nve-tabs-item-group'],
  'nve-tabs-item-group': ['nve-tabs'],
  'nve-toggletip-footer': ['nve-toggletip'],
  'nve-toggletip-header': ['nve-toggletip'],
  'nve-tree-node': ['nve-tree', 'nve-tree-node']
};
