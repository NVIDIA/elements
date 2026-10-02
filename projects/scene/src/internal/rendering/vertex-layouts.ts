// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneGPUVertexBufferLayout } from '../gpu/platform.js';

/** Interleaved primitive positions and normals used by marker color and pick passes. */
export const MARKER_VERTEX_LAYOUTS: readonly SceneGPUVertexBufferLayout[] = [
  {
    arrayStride: 24,
    attributes: [
      { shaderLocation: 0, offset: 0, format: 'float32x3' },
      { shaderLocation: 1, offset: 12, format: 'float32x3' }
    ]
  }
];

/** Planar mesh attributes used by mesh color and pick passes. */
export const MESH_VERTEX_LAYOUTS: readonly SceneGPUVertexBufferLayout[] = [
  { arrayStride: 12, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }] },
  { arrayStride: 12, attributes: [{ shaderLocation: 1, offset: 0, format: 'float32x3' }] },
  { arrayStride: 8, attributes: [{ shaderLocation: 2, offset: 0, format: 'float32x2' }] },
  { arrayStride: 16, attributes: [{ shaderLocation: 3, offset: 0, format: 'float32x4' }] }
];

/** Primitive edge positions used by outline color and pick passes. */
export const OUTLINE_VERTEX_LAYOUTS: readonly SceneGPUVertexBufferLayout[] = [
  { arrayStride: 12, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }] }
];
