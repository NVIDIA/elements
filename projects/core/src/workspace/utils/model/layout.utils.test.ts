// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { getPanelIds, normalizeLayout } from './layout.utils.js';

import type { WorkspaceGroup, WorkspaceNode } from './layout.utils.js';

const group = (id: string): WorkspaceGroup => ({ type: 'group', panels: [id], active: id });

describe('workspace layout', () => {
  it('lists retained panel IDs in structural order without filtering', () => {
    const retained: WorkspaceGroup = { type: 'group', panels: ['b', 'closed', 'missing'], active: 'b' };
    const root: WorkspaceNode = {
      type: 'split',
      axis: 'horizontal',
      weights: [1, 1],
      children: [group('a'), { type: 'split', axis: 'vertical', weights: [1, 1], children: [retained, group('c')] }]
    };
    expect(getPanelIds(root)).toEqual(['a', 'b', 'closed', 'missing', 'c']);
    expect(getPanelIds(null)).toEqual([]);
  });

  it('copies caller-owned records and arrays even when proportions already sum to one', () => {
    const first = group('a');
    const root: WorkspaceNode = {
      type: 'split',
      axis: 'horizontal',
      children: [first, group('b')],
      weights: [0.5, 0.5]
    };
    const normalized = normalizeLayout(root);
    if (normalized.type !== 'split') throw new Error('Expected split');
    expect(normalized).not.toBe(root);
    expect(normalized.children).not.toBe(root.children);
    expect(normalized.weights).not.toBe(root.weights);
    const child = normalized.children[0];
    if (child?.type !== 'group') throw new Error('Expected group');
    expect(child).not.toBe(first);
    expect(child.panels).not.toBe(first.panels);
    child.panels.push('changed');
    expect(first.panels).toEqual(['a']);
  });

  it('normalizes binary encoding to three siblings with equivalent proportions', () => {
    const result = normalizeLayout({
      type: 'split',
      axis: 'horizontal',
      weights: [1, 2],
      children: [group('a'), { type: 'split', axis: 'horizontal', weights: [1, 1], children: [group('b'), group('c')] }]
    });
    expect(result).toEqual({
      type: 'split',
      axis: 'horizontal',
      weights: [1 / 3, 1 / 3, 1 / 3],
      children: [group('a'), group('b'), group('c')]
    });
  });
});
