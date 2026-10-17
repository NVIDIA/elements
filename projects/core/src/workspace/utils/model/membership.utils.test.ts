// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { getTabInsertionIndex, getWorkspacePanelSource, preservesGroupMembership } from './membership.utils.js';

import type { WorkspaceNode } from './layout.utils.js';

describe('workspace group membership', () => {
  const root: WorkspaceNode = {
    type: 'split',
    axis: 'horizontal',
    weights: [1, 1],
    children: [
      { type: 'group', panels: ['a', 'companion'], active: 'a' },
      { type: 'group', panels: ['b'], active: 'b' }
    ]
  };

  it('allows ordering inside the original group but rejects joining another group', () => {
    expect(
      preservesGroupMembership({
        root,
        source: ['a'],
        intent: { kind: 'tab', destination: { target: 'companion', position: 'tab', index: 1 } }
      })
    ).toBe(true);
    expect(
      preservesGroupMembership({
        root,
        source: ['a', 'companion'],
        intent: { kind: 'tab', destination: { target: 'b', position: 'tab' } }
      })
    ).toBe(false);
  });

  it('allows moving complete groups but rejects extracting retained members', () => {
    const intent = { kind: 'split', destination: { target: 'b', position: 'left' } } as const;
    expect(preservesGroupMembership({ root, source: ['a', 'companion'], intent })).toBe(true);
    expect(preservesGroupMembership({ root, source: ['a'], intent })).toBe(false);
  });

  it('carries retained closed members when their only open companion is dragged', () => {
    expect(
      getWorkspacePanelSource({
        layout: { version: 1, root, closed: ['a'] },
        anchor: 'companion',
        available: ['a', 'companion', 'b']
      })
    ).toEqual(['a', 'companion']);
    expect(
      getWorkspacePanelSource({
        layout: { version: 1, root, closed: [] },
        anchor: 'companion',
        available: ['a', 'companion', 'b']
      })
    ).toEqual(['companion']);
  });

  it('maps visible neighbors through closed identities rather than projected indices', () => {
    expect(getTabInsertionIndex(['b', 'closed', 'b2'], 'b2')).toBe(2);
    expect(getTabInsertionIndex(['b', 'closed', 'b2'], undefined)).toBe(3);
  });
});
