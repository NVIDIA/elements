// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { WorkspaceNode } from './workspace-layout.utils.js';
import { presentedTabActive, tabInsertionIndex, tabStripGripWidth, tabStripIdentity } from './workspace-tabs.utils.js';

const root: WorkspaceNode = {
  type: 'split',
  axis: 'horizontal',
  weights: [1, 1],
  children: [
    { type: 'pane', panels: ['a', 'companion'], active: 'a' },
    { type: 'pane', panels: ['b', 'closed', 'b2'], active: 'b2' }
  ]
};

describe('workspace tab presentation', () => {
  it('uses committed membership for grip width, including closed members and proposed tab insertion', () => {
    const singleton: WorkspaceNode = { type: 'pane', panels: ['b'], active: 'b' };
    expect(tabStripGripWidth({ root: singleton, members: ['b'], source: [], width: 28 })).toBe(0);
    expect(tabStripGripWidth({ root: singleton, members: ['b', 'a'], source: ['a'], width: 28 })).toBe(0);
    expect(tabStripGripWidth({ root, members: ['b'], source: [], width: 28 })).toBe(28);
    expect(tabStripGripWidth({ root, members: ['companion'], source: ['a'], width: 28 })).toBe(28);
  });

  it('keeps recipient identity through carried insertion and original source extraction', () => {
    expect(tabStripIdentity(root, ['b', 'b2', 'a'], ['a'])).toBe(tabStripIdentity(root, ['b', 'b2'], []));
    expect(tabStripIdentity(root, ['companion'], ['a'])).toBe(tabStripIdentity(root, ['a', 'companion'], []));
    expect(tabStripIdentity(root, ['a'], ['a'])).toBe(tabStripIdentity(root, ['a', 'companion'], []));
  });

  it('preserves the recipient original nonfirst active body while carried content remains absent', () => {
    expect(presentedTabActive({ root, members: ['a', 'b', 'b2'], source: ['a'], active: 'a' })).toBe('b2');
    expect(presentedTabActive({ root, members: ['a', 'companion'], source: ['a'], active: 'a' })).toBe('companion');
    expect(presentedTabActive({ root, members: ['a', 'companion'], source: ['companion'], active: 'a' })).toBe('a');
  });

  it('maps visible neighbors through closed identities rather than projected indices', () => {
    expect(tabInsertionIndex(['b', 'closed', 'b2'], 'b2')).toBe(2);
    expect(tabInsertionIndex(['b', 'closed', 'b2'], undefined)).toBe(3);
  });
});
