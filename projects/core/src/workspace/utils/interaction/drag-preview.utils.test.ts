// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { clipCue, matchesPlacementIntent } from './drag-preview.utils.js';

import type { WorkspaceDropIntent } from './drag-preview.utils.js';

const rect = { x: 10, y: 20, width: 406, height: 206 };

describe('workspace placement intent equality', () => {
  const intent: WorkspaceDropIntent = {
    kind: 'order',
    destination: { target: 'a', region: 'root.1', position: 'left' }
  };

  it('matches independently created intents with the same operation and destination', () => {
    expect(matchesPlacementIntent(intent, { ...intent, destination: { ...intent.destination } })).toBe(true);
  });

  it.each([
    { field: 'kind', next: { ...intent, kind: 'insert' } },
    { field: 'target', next: { ...intent, destination: { ...intent.destination, target: 'b' } } },
    { field: 'region', next: { ...intent, destination: { ...intent.destination, region: 'root.2' } } },
    { field: 'side', next: { ...intent, destination: { ...intent.destination, position: 'right' } } }
  ] satisfies { field: string; next: WorkspaceDropIntent }[])('distinguishes a changed $field', ({ next }) => {
    expect(matchesPlacementIntent(intent, next)).toBe(false);
  });

  it('distinguishes insertion positions within the same tab group', () => {
    const tab: WorkspaceDropIntent = { kind: 'tab', destination: { target: 'a', position: 'tab', index: 1 } };
    expect(matchesPlacementIntent(tab, { ...tab, destination: { ...tab.destination } })).toBe(true);
    expect(matchesPlacementIntent(tab, { ...tab, destination: { ...tab.destination, index: 2 } })).toBe(false);
  });

  it('never acquires an invalid intent as a matching destination', () => {
    expect(matchesPlacementIntent(intent, { kind: 'invalid' })).toBe(false);
    expect(matchesPlacementIntent({ kind: 'invalid' }, intent)).toBe(false);
    expect(matchesPlacementIntent({ kind: 'invalid' }, { kind: 'invalid' })).toBe(false);
  });
});

describe('workspace preview clipping', () => {
  it('clips offers to the visible viewport including an overflowing canvas', () => {
    const bounds = { x: 30, y: 40, width: 100, height: 80 };
    expect(clipCue(rect, bounds)).toEqual(bounds);
    expect(clipCue({ x: 100, y: 100, width: 90, height: 90 }, bounds)).toEqual({
      x: 100,
      y: 100,
      width: 30,
      height: 20
    });
    expect(clipCue({ x: 200, y: 200, width: 90, height: 90 }, bounds)).toEqual({ x: 130, y: 120, width: 0, height: 0 });
  });
});
