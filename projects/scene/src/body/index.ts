// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export { compileShapes, type BodyShape } from '../internal/layers/body/compile.js';
export type { ScenePrimitiveKind } from '../internal/math/primitive-geometry.js';
export { SceneBody, type BodyInstanceSource } from './body.js';
export { SceneShape } from './shape.js';
export type {
  SceneBodyGeometry,
  SceneBodyNode,
  SceneBodyTransform,
  SceneBodyPrimitiveNode,
  SceneBodyMeshNode,
  SceneBodyGroupNode
} from '../internal/layers/body/types.js';
export {
  loadGeometry,
  decodeGeometry,
  registerGeometryDecoder,
  type GeometryDecoderLoader,
  type GeometryDecoderModule,
  type GeometryDecoderOptions,
  type SceneGeometryFormat,
  type LoadGeometryOptions,
  type DecodeGeometryOptions
} from './load.js';
