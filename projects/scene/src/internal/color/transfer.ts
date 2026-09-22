// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Decodes a finite sRGB channel in [0, 1], without validation or clamping. */
export function decodeSrgbChannel(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

/** Encodes a finite linear-light channel in [0, 1], without validation or clamping. */
export function encodeSrgbChannel(channel: number): number {
  return channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;
}

/** Shared normalized vec3 sRGB transfer function for Scene shaders. */
export const SRGB_TO_LINEAR_WGSL = /* wgsl */ `
fn srgbToLinear(value: vec3f) -> vec3f {
  return select(
    pow((value + vec3f(0.055)) / vec3f(1.055), vec3f(2.4)),
    value / vec3f(12.92),
    value <= vec3f(0.04045)
  );
}
`;
