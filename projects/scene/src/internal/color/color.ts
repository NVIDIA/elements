// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { RGBA, SceneColor } from './types.js';
import { decodeSrgbChannel } from './transfer.js';
import { copyRGBA } from './rgba.js';
import { decodeUnorm8, writeRGBA8 } from './rgba8.js';

let colorContext: CanvasRenderingContext2D | null | undefined;

export interface CSSColor {
  readonly rgba: RGBA;
  readonly source: string;
}

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
  return [decodeUnorm8(red), decodeUnorm8(green), decodeUnorm8(blue), decodeUnorm8(alpha)];
}

/** Resolves supported CSS colors or captures a strictly normalized RGBA tuple. */
export function resolveSceneColor(value: SceneColor): RGBA {
  if (typeof value !== 'string') return copyRGBA(value);
  const color = parseCSSColor(value);
  if (!color) throw new TypeError(`Record color must be a supported CSS color: "${value}".`);
  return color;
}

/** Validates a Scene color before writing any RGBA8 channel. */
export function writePackedColor(view: DataView, offset: number, color: SceneColor): void {
  writeRGBA8(view, offset, resolveSceneColor(color));
}

/** Preserves a supported CSS color source or returns the supplied fallback. */
export function normalizeCSSColor(source: string, fallback: CSSColor): CSSColor {
  const rgba = parseCSSColor(source);
  return rgba ? { rgba, source } : { rgba: fallback.rgba, source: fallback.source };
}

/** Creates a Lit attribute converter that restores the supplied color for unsupported values. */
export function createCSSColorConverter(fallback: CSSColor) {
  return {
    fromAttribute(source: string | null): string {
      return normalizeCSSColor(source ?? fallback.source, fallback).source;
    }
  };
}

/** Converts one normalized sRGB channel to linear light. */
export function srgbToLinear(channel: number): number {
  if (!Number.isFinite(channel)) {
    throw new RangeError('Color channels must be finite.');
  }
  const clamped = Math.min(1, Math.max(0, channel));
  return decodeSrgbChannel(clamped);
}

/** Converts one byte-scale sRGB channel to linear light. */
export function srgbByteToLinear(channel: number): number {
  return srgbToLinear(decodeUnorm8(channel));
}

function createColorContext(): CanvasRenderingContext2D | null {
  const canvas = globalThis.document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.getContext('2d', { willReadFrequently: true });
}
