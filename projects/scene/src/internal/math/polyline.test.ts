// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { LINE_PICK_SHADER } from '../rendering/stream-pipelines.js';
import { POLYLINE_JOIN_VERTEX_COUNT, POLYLINE_MITER_LIMIT, POLYLINE_WGSL } from './polyline.js';

describe('polyline shader contract', () => {
  it('shares the miter limit between host configuration and the shader', () => {
    expect(POLYLINE_MITER_LIMIT).toBe(4);
    expect(POLYLINE_WGSL).toContain(`const NVE_POLYLINE_MITER_LIMIT = ${POLYLINE_MITER_LIMIT}.0;`);
    expect(
      POLYLINE_WGSL.match(/miterLength <= max\(halfWidths.x, halfWidths.y\) \* NVE_POLYLINE_MITER_LIMIT/g)
    ).toHaveLength(2);
  });

  it('uses six vertices per join in the picking draw layout', () => {
    expect(POLYLINE_JOIN_VERTEX_COUNT).toBe(6);
    expect(LINE_PICK_SHADER).toContain(`(index - segmentVertices) / ${POLYLINE_JOIN_VERTEX_COUNT}u`);
    expect(LINE_PICK_SHADER).toContain(`(index-segmentVertices)%${POLYLINE_JOIN_VERTEX_COUNT}u`);
    expect(LINE_PICK_SHADER.split(POLYLINE_WGSL)).toHaveLength(2);
  });
});
