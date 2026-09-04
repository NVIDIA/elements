// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { identityMat4 } from '../math/mat4.js';
import { projectLabel } from './projection.js';

describe('label projection', () => {
  it('keeps a label visible when its offscreen anchor still leaves its quad in the viewport', () => {
    const projection = projectLabel({
      anchor: 'top-left',
      offset: [0, 0],
      position: [-1.1, 0, 0],
      size: { height: 10, width: 20 },
      viewProjection: identityMat4(),
      viewport: { height: 100, width: 100 }
    });

    expect(projection).toEqual({ depth: 0, visible: true, x: -5.000000000000004, y: 50 });
  });

  it('hides fully outside and behind-near label quads', () => {
    const options = {
      anchor: 'top-left' as const,
      offset: [0, 0] as const,
      size: { height: 10, width: 20 },
      viewProjection: identityMat4(),
      viewport: { height: 100, width: 100 }
    };

    expect(projectLabel({ ...options, position: [-2, 0, 0] }).visible).toBe(false);
    expect(projectLabel({ ...options, position: [0, 0, -1] }).visible).toBe(false);
  });

  it('fails closed when a malformed projection matrix has no finite clip w', () => {
    const projection = projectLabel({
      anchor: 'center',
      offset: [0, 0],
      position: [0, 0, 0],
      size: { height: 10, width: 20 },
      viewProjection: [] as unknown as ReturnType<typeof identityMat4>,
      viewport: { height: 100, width: 100 }
    });

    expect(projection).toEqual({ depth: 0, visible: false, x: 0, y: 0 });
  });

  it.each([
    ['top-left', 50, 50],
    ['top', 40, 50],
    ['top-right', 30, 50],
    ['left', 50, 45],
    ['center', 40, 45],
    ['right', 30, 45],
    ['bottom-left', 50, 40],
    ['bottom', 40, 40],
    ['bottom-right', 30, 40]
  ] as const)('applies the %s anchor and CSS-pixel offset', (anchor, x, y) => {
    const projection = projectLabel({
      anchor,
      offset: [3, -2],
      position: [0, 0, 0],
      size: { height: 10, width: 20 },
      viewProjection: identityMat4(),
      viewport: { height: 100, width: 100 }
    });

    expect(projection).toEqual({ depth: 0, visible: true, x: x + 3, y: y - 2 });
  });
});
