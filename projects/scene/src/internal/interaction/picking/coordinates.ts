// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { multiplyMat4Vec4 } from '../../math/mat4.js';
import type { Matrix4, Vec3 } from '../../math/types.js';

/** Maps a client point to the device pixel, returning a miss outside the canvas. */
export function mapClientToDevicePixel(options: {
  readonly clientX: number;
  readonly clientY: number;
  readonly rect: Pick<DOMRect, 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height'>;
  readonly size: { readonly width: number; readonly height: number };
}): { readonly x: number; readonly y: number } | undefined {
  const { clientX, clientY, rect, size } = options;
  if (
    rect.width <= 0 ||
    rect.height <= 0 ||
    clientX < rect.left ||
    clientX >= rect.right ||
    clientY < rect.top ||
    clientY >= rect.bottom
  ) {
    return undefined;
  }
  return {
    x: Math.floor(((clientX - rect.left) / rect.width) * size.width),
    y: Math.floor(((clientY - rect.top) / rect.height) * size.height)
  };
}

/** Reconstructs a world point at the center of the copied ID-pass pixel. */
export function reconstructWorldPosition(options: {
  readonly depth: number;
  readonly inverseViewProjection: Matrix4;
  readonly pixel: { readonly x: number; readonly y: number };
  readonly size: { readonly height: number; readonly width: number };
}): Vec3 {
  const { depth, inverseViewProjection, pixel, size } = options;
  const x = ((pixel.x + 0.5) / size.width) * 2 - 1;
  const y = 1 - ((pixel.y + 0.5) / size.height) * 2;
  const transformed = multiplyMat4Vec4(inverseViewProjection, [x, y, depth, 1]);
  const inverseW = transformed[3] === 0 ? 1 : 1 / transformed[3];
  return [transformed[0] * inverseW, transformed[1] * inverseW, transformed[2] * inverseW];
}
