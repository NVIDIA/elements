// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneLabelAnchor } from '../../label/label.js';
import type { Mat4, Vec3 } from '../types.js';

interface LabelProjection {
  readonly depth: number;
  readonly visible: boolean;
  readonly x: number;
  readonly y: number;
}

/** Projects a world-space label point into canvas-local CSS pixels. */
export function projectLabel(options: {
  readonly anchor: SceneLabelAnchor;
  readonly offset: readonly [number, number];
  readonly position: Readonly<Vec3>;
  readonly size: { readonly height: number; readonly width: number };
  readonly viewProjection: Mat4;
  readonly viewport: { readonly height: number; readonly width: number };
}): LabelProjection {
  const [clipX, clipY, clipZ, clipW] = getClipPosition(options.viewProjection, options.position);
  if (isBehindOrBeyondDepth(clipZ, clipW)) {
    return { depth: 0, visible: false, x: 0, y: 0 };
  }

  const x = ((clipX / clipW) * 0.5 + 0.5) * options.viewport.width;
  const y = (0.5 - (clipY / clipW) * 0.5) * options.viewport.height;
  const anchor = getAnchorFraction(options.anchor);
  const labelX = x - options.size.width * anchor.x + options.offset[0];
  const labelY = y - options.size.height * anchor.y + options.offset[1];
  return {
    depth: clipZ / clipW,
    visible: intersectsViewport({ x: labelX, y: labelY }, options.size, options.viewport),
    x: labelX,
    y: labelY
  };
}

function getClipPosition(matrix: Mat4, position: Readonly<Vec3>): [number, number, number, number] {
  return [0, 1, 2, 3].map(row => {
    const offset = row;
    return (
      (matrix[offset] ?? 0) * position[0] +
      (matrix[offset + 4] ?? 0) * position[1] +
      (matrix[offset + 8] ?? 0) * position[2] +
      (matrix[offset + 12] ?? 0)
    );
  }) as [number, number, number, number];
}

function isBehindOrBeyondDepth(z: number, w: number): boolean {
  if (!Number.isFinite(w) || w <= 0) return true;
  return z < 0 || z > w;
}

function intersectsViewport(
  position: { readonly x: number; readonly y: number },
  size: { readonly height: number; readonly width: number },
  viewport: { readonly height: number; readonly width: number }
): boolean {
  return (
    position.x + size.width >= 0 &&
    position.x <= viewport.width &&
    position.y + size.height >= 0 &&
    position.y <= viewport.height
  );
}

function getAnchorFraction(anchor: SceneLabelAnchor): { readonly x: number; readonly y: number } {
  switch (anchor) {
    case 'top-left':
      return { x: 0, y: 0 };
    case 'top':
      return { x: 0.5, y: 0 };
    case 'top-right':
      return { x: 1, y: 0 };
    case 'left':
      return { x: 0, y: 0.5 };
    case 'center':
      return { x: 0.5, y: 0.5 };
    case 'right':
      return { x: 1, y: 0.5 };
    case 'bottom-left':
      return { x: 0, y: 1 };
    case 'bottom':
      return { x: 0.5, y: 1 };
    case 'bottom-right':
      return { x: 1, y: 1 };
  }
}
