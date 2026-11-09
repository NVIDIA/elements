// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { getRegionCornerStyle, shouldEmphasizeReservedDestination } from './preview.utils.js';

import type { WorkspaceDragPreview } from '../interaction/drag-preview.utils.js';

const recipient = { x: 0, y: 0, width: 200, height: 120 };
const regions = [{ key: 'root', node: { type: 'group' as const, panels: ['a'], active: 'a' }, rect: recipient }];

describe('workspace preview corners', () => {
  it('inherits all corners when the cue follows the complete group', () => {
    expect(getRegionCornerStyle(recipient, regions)).toBe('border-radius:var(--_workspace-border-radius)');
  });

  it.each([
    { side: 'left', rect: { x: 0, y: 0, width: 100, height: 120 }, square: ['top-right', 'bottom-right'] },
    { side: 'right', rect: { x: 100, y: 0, width: 100, height: 120 }, square: ['top-left', 'bottom-left'] },
    { side: 'top', rect: { x: 0, y: 0, width: 200, height: 60 }, square: ['bottom-right', 'bottom-left'] },
    { side: 'bottom', rect: { x: 0, y: 60, width: 200, height: 60 }, square: ['top-left', 'top-right'] }
  ])('keeps the $side split cut square', ({ rect, square }) => {
    expect(getRegionCornerStyle(rect, regions)).toBe(
      ['border-radius:var(--_workspace-border-radius)', ...square.map(corner => `border-${corner}-radius:0px`)].join(
        ';'
      )
    );
  });
});

describe('workspace reserved destination emphasis', () => {
  const preview: WorkspaceDragPreview = {
    phase: 'detached',
    source: ['a'],
    blocked: false,
    allocation: 'reserved',
    layout: { version: 1, closed: [], root: null },
    intent: { kind: 'insert', destination: { target: 'b', position: 'left' } },
    cue: { kind: 'group', rect: recipient }
  };

  it('emphasizes a feasible reserved insertion or peer order', () => {
    expect(shouldEmphasizeReservedDestination(preview)).toBe(true);
    expect(
      shouldEmphasizeReservedDestination({
        ...preview,
        intent: { kind: 'order', destination: { target: 'b', position: 'left' } }
      })
    ).toBe(true);
    expect(shouldEmphasizeReservedDestination({ ...preview, blocked: true })).toBe(false);
    expect(shouldEmphasizeReservedDestination({ ...preview, allocation: 'overlay' })).toBe(false);
  });

  it('does not emphasize split overlays or tab reservations', () => {
    expect(
      shouldEmphasizeReservedDestination({
        ...preview,
        intent: { kind: 'split', destination: { target: 'b', position: 'left' } }
      })
    ).toBe(false);
    expect(
      shouldEmphasizeReservedDestination({
        ...preview,
        intent: { kind: 'tab', destination: { target: 'b', position: 'tab' } }
      })
    ).toBe(false);
  });

  it('retains a detached group reservation while distinguishing tab and return cues', () => {
    const invalid = { ...preview, intent: { kind: 'invalid' as const } };
    expect(shouldEmphasizeReservedDestination(invalid)).toBe(true);
    expect(shouldEmphasizeReservedDestination({ ...invalid, cue: { kind: 'tab', rect: recipient } })).toBe(false);
    expect(shouldEmphasizeReservedDestination({ ...invalid, phase: 'returning-detached', blocked: false })).toBe(false);
  });
});
