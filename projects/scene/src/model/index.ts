// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export { compileParts, type ModelPart } from '../internal/layers/model/compile.js';
export type { ScenePrimitiveKind } from '../internal/geometry/primitives.js';
export { SceneModel, type ModelInstanceSource } from './model.js';
export { ScenePart } from './part.js';
export type {
  SceneModelGeometry,
  SceneModelNode,
  SceneModelTransform,
  SceneModelPrimitiveNode,
  SceneModelMeshNode,
  SceneModelGroupNode
} from '../internal/layers/model/types.js';
export {
  loadModel,
  decodeModel,
  type SceneModelFormat,
  type LoadModelOptions,
  type DecodeModelOptions
} from './load.js';
