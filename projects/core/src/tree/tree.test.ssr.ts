// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { ssrRunner } from '@internals/vite';
import { Tree } from '@nvidia-elements/core/tree';
import '@nvidia-elements/core/tree/define.js';

describe(Tree.metadata.tag, () => {
  it('should pass baseline ssr check', async () => {
    const result = await ssrRunner.render(html`
    <nve-tree>
      <nve-tree-node expanded>
        node 1
        <nve-tree-node>node 1-1</nve-tree-node>
        <nve-tree-node>node 1-2</nve-tree-node>
        <nve-tree-node>node 1-3</nve-tree-node>
      </nve-tree-node>
      <nve-tree-node>
        node 2
        <nve-tree-node>node 2-1</nve-tree-node>
        <nve-tree-node>node 2-2</nve-tree-node>
        <nve-tree-node>node 2-3</nve-tree-node>
      </nve-tree-node>
    </nve-tree>`);
    expect(result.includes('nve-tree')).toBe(true);
    expect(result.includes('nve-tree-node')).toBe(true);
    expect(result.includes('shadowroot="open"')).toBe(true);
  });
});
