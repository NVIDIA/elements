// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type { ScenePrimitiveType } from '../internal/math/primitive-geometry.js';
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
