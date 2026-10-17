// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { WorkspaceLayout } from './workspace-layout.utils.js';
import { projectLayout } from './workspace-operations.utils.js';
import { createWorkspaceLayoutProjector } from './workspace-projection.utils.js';

describe('workspace projection', () => {
  it('reuses equal visibility inputs and root identities within one evaluation', () => {
    const project = createWorkspaceLayoutProjector();
    const layout: WorkspaceLayout = {
      version: 1,
      root: { type: 'group', panels: ['a', 'b'], active: 'b' },
      closed: ['b']
    };
    const projected = project(layout, ['a', 'b']);
    expect(project({ ...layout, closed: ['b'] }, ['a', 'b'])).toBe(projected);
    expect(projected).toEqual(projectLayout(layout, ['a', 'b']));
    expect(projected.root).not.toBe(layout.root);
    expect(createWorkspaceLayoutProjector()(layout, ['a', 'b'])).not.toBe(projected);
  });

  it('distinguishes closed members, available members, candidate roots, and empty projections', () => {
    const project = createWorkspaceLayoutProjector();
    const layout: WorkspaceLayout = {
      version: 1,
      root: { type: 'group', panels: ['a', 'b'], active: 'b' },
      closed: []
    };
    const projected = project(layout, ['a', 'b']);
    const closed = project({ ...layout, closed: ['b'] }, ['a', 'b']);
    const otherClosed = project({ ...layout, closed: ['a'] }, ['a', 'b']);
    const missing = project(layout, ['b']);
    const otherMissing = project(layout, ['a']);
    const candidate = project({ ...layout, root: { type: 'group', panels: ['b', 'a'], active: 'a' } }, ['a', 'b']);
    expect(closed.root).toEqual({ type: 'group', panels: ['a'], active: 'a' });
    expect(otherClosed.root).toEqual({ type: 'group', panels: ['b'], active: 'b' });
    expect(missing.root).toEqual({ type: 'group', panels: ['b'], active: 'b' });
    expect(otherMissing.root).toEqual({ type: 'group', panels: ['a'], active: 'a' });
    expect(candidate.root).toEqual({ type: 'group', panels: ['b', 'a'], active: 'a' });
    expect(closed).not.toBe(projected);
    expect(missing).not.toBe(projected);
    expect(candidate).not.toBe(projected);
    const empty: WorkspaceLayout = { version: 1, root: null, closed: [] };
    expect(project(empty, ['a'])).toBe(project({ ...empty }, ['a']));
    expect(project(empty, ['a']).root).toBeNull();
  });
});
