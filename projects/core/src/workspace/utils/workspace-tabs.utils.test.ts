// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { WorkspaceNode } from './workspace-layout.utils.js';
import { presentedTabActive, tabInsertionIndex, tabStripMembership, tabStripIdentity } from './workspace-tabs.utils.js';

const root: WorkspaceNode = {
  type: 'split',
  axis: 'horizontal',
  weights: [1, 1],
  children: [
    { type: 'group', panels: ['a', 'companion'], active: 'a' },
    { type: 'group', panels: ['b', 'closed', 'b2'], active: 'b2' }
  ]
};

describe('workspace tab presentation', () => {
  it('keeps singleton presentation through proposed tab joins', () => {
    const singleton: WorkspaceNode = { type: 'group', panels: ['b'], active: 'b' };
    const visible = ['a', 'b'];
    expect(tabStripMembership({ root: singleton, members: ['b'], source: [], visible, width: 28 })).toEqual({
      tabbed: false,
      gripWidth: 0
    });
    expect(tabStripMembership({ root: singleton, members: ['b', 'a'], source: ['a'], visible, width: 28 })).toEqual({
      tabbed: false,
      gripWidth: 0
    });
  });

  it('derives tab semantics and grips from visible committed members', () => {
    expect(tabStripMembership({ root, members: ['b'], source: [], visible: ['b'], width: 28 })).toEqual({
      tabbed: false,
      gripWidth: 0
    });
    expect(tabStripMembership({ root, members: ['b', 'b2'], source: [], visible: ['b', 'b2'], width: 28 })).toEqual({
      tabbed: true,
      gripWidth: 28
    });
    expect(tabStripMembership({ root, members: ['b', 'b2'], source: [], visible: ['b', 'b2'], width: 0 })).toEqual({
      tabbed: true,
      gripWidth: 0
    });
    expect(
      tabStripMembership({ root, members: ['companion'], source: ['a'], visible: ['a', 'companion'], width: 28 })
    ).toEqual({ tabbed: true, gripWidth: 28 });
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
