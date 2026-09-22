// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { decodePickPixel } from './readback.js';
import { PICK_OUTPUT_WGSL } from './wgsl.js';

describe('pick ID protocol', () => {
  it('should keep GPU encoding aligned with little-endian CPU readback', () => {
    expect(PICK_OUTPUT_WGSL).toContain('vec4u(id & 255u, (id >> 8u) & 255u, (id >> 16u) & 255u, id >> 24u)');

    const bytes = new Uint8Array(512);
    bytes.set([0x78, 0x56, 0x34, 0x12]);
    new DataView(bytes.buffer).setFloat32(256, 0.25, true);

    expect(decodePickPixel(bytes)).toEqual({ depth: 0.25, id: 0x12345678 });
  });
});
