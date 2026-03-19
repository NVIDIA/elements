// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { updateNodeSelection } from './utils.js';

describe('updateNodeSelection', () => {
  it('should update to selected state if all child nodes are selected', () => {
    const node = {
      selected: false,
      indeterminate: true,
      nodes: [
        { selected: true, indeterminate: false, nodes: [] },
        { selected: true, indeterminate: false, nodes: [] },
        { selected: true, indeterminate: false, nodes: [] }
      ]
    };

    updateNodeSelection(node);
    expect(node.selected).toBe(true);
    expect(node.indeterminate).toBe(false);
  });

  it('should update to indeterminate state if some child nodes are selected', () => {
    const node = {
      selected: true,
      indeterminate: false,
      nodes: [
        { selected: true, indeterminate: false, nodes: [] },
        { selected: false, indeterminate: false, nodes: [] },
        { selected: false, indeterminate: false, nodes: [] }
      ]
    };

    updateNodeSelection(node);
    expect(node.selected).toBe(true);
    expect(node.indeterminate).toBe(true);
  });

  it('should remove selected or indeterminate states if no child nodes are selected', () => {
    const node = {
      selected: true,
      indeterminate: true,
      nodes: [
        { selected: false, indeterminate: false, nodes: [] },
        { selected: false, indeterminate: false, nodes: [] },
        { selected: false, indeterminate: false, nodes: [] }
      ]
    };

    updateNodeSelection(node);
    expect(node.selected).toBe(false);
    expect(node.indeterminate).toBe(false);
  });
});
