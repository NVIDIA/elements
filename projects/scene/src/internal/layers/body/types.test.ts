// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expectTypeOf, it } from 'vitest';
import type { SceneMeshGeometry } from '../mesh/types.js';
import type {
  SceneBodyGeometry,
  SceneBodyGroupNode,
  SceneBodyMeshNode,
  SceneBodyNode,
  SceneBodyPrimitiveNode,
  SceneBodyTransform
} from './types.js';

describe('body geometry types', () => {
  it('accepts primitive, mesh, and recursive group nodes', () => {
    expectTypeOf<{ type: 'cube' }>().toExtend<SceneBodyPrimitiveNode>();
    expectTypeOf<{ geometry: SceneMeshGeometry }>().toExtend<SceneBodyMeshNode>();
    expectTypeOf<{ children: SceneBodyGeometry }>().toExtend<SceneBodyGroupNode>();
    expectTypeOf<SceneBodyGeometry>().toEqualTypeOf<readonly SceneBodyNode[]>();
    expectTypeOf<SceneBodyNode>().toEqualTypeOf<SceneBodyPrimitiveNode | SceneBodyMeshNode | SceneBodyGroupNode>();
  });

  it('rejects nodes combining primitive, mesh, or group payloads', () => {
    expectTypeOf<{ type: 'cube'; geometry: SceneMeshGeometry }>().not.toExtend<SceneBodyNode>();
    expectTypeOf<{ type: 'cube'; children: SceneBodyGeometry }>().not.toExtend<SceneBodyNode>();
    expectTypeOf<{ geometry: SceneMeshGeometry; children: SceneBodyGeometry }>().not.toExtend<SceneBodyNode>();
    expectTypeOf<{ name: string }>().not.toExtend<SceneBodyNode>();
  });

  it('allows partial transforms with readonly vector and quaternion inputs', () => {
    expectTypeOf<SceneBodyTransform['position']>().toEqualTypeOf<readonly [number, number, number] | undefined>();
    expectTypeOf<SceneBodyTransform['orientation']>().toEqualTypeOf<
      readonly [number, number, number, number] | undefined
    >();
    expectTypeOf<SceneBodyTransform['scale']>().toEqualTypeOf<readonly [number, number, number] | undefined>();
  });
});
