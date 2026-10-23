// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expectTypeOf, it } from 'vitest';
import type { SceneGPUDevice, SceneGPURenderPass } from '../../gpu/platform.js';
import type { MeshGPUState } from './gpu.js';
import type { ProcessedMeshGeometry } from './processing.js';
import type {
  CPUMeshLayerResources,
  HeightfieldLayerResources,
  MeshAttributeUploadOptions,
  MeshGeometryPass,
  MeshInstanceSource,
  MeshLayerResources,
  MeshRendererDevice,
  RenderableMeshResources
} from './renderer-types.js';

describe('mesh renderer types', () => {
  it('separates CPU-processed geometry from computed GPU geometry', () => {
    expectTypeOf<CPUMeshLayerResources['processed']>().toEqualTypeOf<ProcessedMeshGeometry>();
    expectTypeOf<CPUMeshLayerResources['computation']>().toEqualTypeOf<undefined>();
    expectTypeOf<Extract<MeshLayerResources, { computation: MeshGPUState }>['processed']>().toEqualTypeOf<undefined>();
    expectTypeOf<CPUMeshLayerResources & { computation: MeshGPUState }>().toEqualTypeOf<never>();
    expectTypeOf<RenderableMeshResources>().toEqualTypeOf<MeshLayerResources | HeightfieldLayerResources>();
  });

  it('extends the scene GPU boundary with required mesh rendering operations', () => {
    expectTypeOf<MeshRendererDevice>().toExtend<SceneGPUDevice>();
    expectTypeOf<MeshGeometryPass>().toExtend<SceneGPURenderPass>();
    expectTypeOf<MeshRendererDevice['createRenderPipeline']>().toBeFunction();
    expectTypeOf<MeshRendererDevice['queue']['writeTexture']>().toBeFunction();
    expectTypeOf<Parameters<MeshGeometryPass['setIndexBuffer']>[1]>().toEqualTypeOf<'uint32'>();
  });

  it('keeps instance upload ranges in bytes and index data out of attribute uploads', () => {
    expectTypeOf<MeshInstanceSource['bytes']>().toEqualTypeOf<Uint8Array>();
    expectTypeOf<MeshInstanceSource['ranges']>().toEqualTypeOf<
      readonly { readonly offset: number; readonly size: number }[]
    >();
    expectTypeOf<MeshAttributeUploadOptions['values']>().toEqualTypeOf<Float32Array>();
    expectTypeOf<'indices'>().not.toExtend<MeshAttributeUploadOptions['attribute']>();
  });
});
