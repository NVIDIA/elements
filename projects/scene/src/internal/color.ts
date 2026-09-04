// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { RGBA } from './types.js';

let colorContext: CanvasRenderingContext2D | null | undefined;

export function parseCSSColor(source: string): RGBA | null {
  if (source.includes('var(') || !globalThis.CSS?.supports('color', source)) {
    return null;
  }
  colorContext ??= createColorContext();
  if (!colorContext) {
    return null;
  }
  colorContext.clearRect(0, 0, 1, 1);
  colorContext.fillStyle = source;
  colorContext.fillRect(0, 0, 1, 1);
  const pixels = colorContext.getImageData(0, 0, 1, 1).data;
  const red = pixels[0] as number;
  const green = pixels[1] as number;
  const blue = pixels[2] as number;
  const alpha = pixels[3] as number;
  return [red / 255, green / 255, blue / 255, alpha / 255];
}

export function srgbToLinear(channel: number): number {
  if (!Number.isFinite(channel)) {
    throw new RangeError('Color channels must be finite.');
  }
  const clamped = Math.min(1, Math.max(0, channel));
  return clamped <= 0.04045 ? clamped / 12.92 : ((clamped + 0.055) / 1.055) ** 2.4;
}

function createColorContext(): CanvasRenderingContext2D | null {
  const canvas = globalThis.document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.getContext('2d', { willReadFrequently: true });
}
