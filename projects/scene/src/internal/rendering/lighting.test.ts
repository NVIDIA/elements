// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import { DEFAULT_LIGHTING_WGSL } from './lighting.js';
import { createMeshShader } from '../layers/mesh/pipelines.js';
import { createMarkerShader } from '../layers/markers/pipelines.js';

describe('shared default lighting', () => {
  it('uses the same single lighting implementation in marker and mesh color shaders', () => {
    for (const code of [createMeshShader({ pass: 'color' }), createMarkerShader({ pass: 'color' })]) {
      expect(code).toContain(DEFAULT_LIGHTING_WGSL);
      expect(code.match(/fn nve_default_lighting\(/g)).toHaveLength(1);
      expect(code.match(/nve_default_lighting\(input.normal\)/g)?.length).toBeGreaterThan(0);
    }
  });
});
