// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { getAllowedSlottedElements } from './slotted-elements.js';

describe('getAllowedSlottedElements', () => {
  it('allows media controls and dividers in button groups', () => {
    expect(getAllowedSlottedElements('nve-button-group')).toEqual(
      expect.arrayContaining([
        'nve-button',
        'nve-icon-button',
        'nve-divider',
        'nve-media-seek-button',
        'nve-media-pause-button'
      ])
    );
  });

  it('distinguishes tree roots from recursive tree nodes', () => {
    expect(getAllowedSlottedElements('nve-tree')).toEqual(['nve-tree-node']);
    expect(getAllowedSlottedElements('nve-tree-node')).toBeUndefined();
  });

  it('includes grid placeholders and separates header and row children', () => {
    expect(getAllowedSlottedElements('nve-grid')).toContain('nve-grid-placeholder');
    expect(getAllowedSlottedElements('nve-grid-header')).toEqual(['nve-grid-column']);
    expect(getAllowedSlottedElements('nve-grid-row')).toEqual(['nve-grid-cell']);
  });

  it('leaves unknown elements and components without contracts unchecked', () => {
    expect(getAllowedSlottedElements('nve-unknown')).toBeUndefined();
    expect(getAllowedSlottedElements('nve-button')).toBeUndefined();
  });
});
