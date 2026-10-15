// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { RGBA } from './types.js';

/** Clamps a finite channel to [0, 1] and quantizes to a byte, rounding half upward. Callers validate finiteness. */
export function encodeUnorm8(channel: number): number {
  return Math.floor(Math.min(1, Math.max(0, channel)) * 255 + 0.5);
}

/** Decodes one unsigned normalized byte without validation, clamping, or a color-space transfer. */
export function decodeUnorm8(channel: number): number {
  return channel / 255;
}

/** Reads four consecutive RGBA bytes into independent, normalized, unpremultiplied storage. */
export function readRGBA8(view: DataView, offset: number): RGBA {
  return [
    decodeUnorm8(view.getUint8(offset)),
    decodeUnorm8(view.getUint8(offset + 1)),
    decodeUnorm8(view.getUint8(offset + 2)),
    decodeUnorm8(view.getUint8(offset + 3))
  ];
}

/** Writes four finite channels in RGBA byte order. Callers own validation and rejection or clamping policy. */
export function writeRGBA8(view: DataView, offset: number, color: Readonly<RGBA>): void {
  view.setUint8(offset, encodeUnorm8(color[0]));
  view.setUint8(offset + 1, encodeUnorm8(color[1]));
  view.setUint8(offset + 2, encodeUnorm8(color[2]));
  view.setUint8(offset + 3, encodeUnorm8(color[3]));
}

/** Decodes a little-endian RGBA word into normalized, unpremultiplied channels for Scene shaders. */
export const UNPACK_RGBA8_WGSL = /* wgsl */ `
fn nve_unpack_unorm8x4(word: u32) -> vec4f {
  let bytes = vec4u(word & 0xffu, (word >> 8u) & 0xffu, (word >> 16u) & 0xffu, (word >> 24u) & 0xffu);
  return vec4f(bytes) / 255.0;
}
`;
