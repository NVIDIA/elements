// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { createMeshShader } from './pipelines.js';

describe(createMeshShader.name, () => {
  it('should compose every variant with the canonical color-space conversion', () => {
    for (const pass of ['color', 'pick'] as const) {
      const shader = createMeshShader({ pass });
      expect(shader.match(/fn srgbToLinear/g)).toHaveLength(1);
      expect(shader).toContain('srgbToLinear(input.color.rgb)');
      expect(shader).toContain('srgbToLinear(scene.baseColor.rgb)');
      expect(shader).toContain('srgbToLinear(marker.color.rgb)');
    }
  });
});
