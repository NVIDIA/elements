// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import {
  getPanelMembershipKey,
  getTabInsertionIndex,
  getWorkspacePanelSource,
  preservesGroupMembership,
  samePanelMembership
} from './membership.utils.js';

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

  it('keeps membership keys independent of order and unambiguous for arbitrary ID contents', () => {
    const ids = ['a:b', '"', '\\', '\u0000', '🧪'];
    const original = [...ids];
    expect(getPanelMembershipKey(ids)).toBe(getPanelMembershipKey([...ids].reverse()));
    expect(ids).toEqual(original);
    expect(getPanelMembershipKey(['a:b', 'c'])).not.toBe(getPanelMembershipKey(['a', 'b:c']));
    expect(getPanelMembershipKey([])).not.toBe(getPanelMembershipKey(['']));
  });

  it('compares unique panel membership without depending on order or encoding ID contents', () => {
    expect(samePanelMembership([], [])).toBe(true);
    expect(samePanelMembership(['a', 'b'], ['b', 'a'])).toBe(true);
    expect(samePanelMembership(['a', 'b'], ['a'])).toBe(false);
    expect(samePanelMembership(['a', 'b'], ['a', 'c'])).toBe(false);
    expect(samePanelMembership(['a:b', 'c'], ['a', 'b:c'])).toBe(false);
    const ids = ['a', 'b'];
    expect(samePanelMembership(ids, ids)).toBe(true);
    ids[0] = 'c';
    expect(samePanelMembership(ids, ids)).toBe(true);
    expect(samePanelMembership(ids, ['a', 'b'])).toBe(false);
  });

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
