// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneColor } from '../../color/types.js';
import type { ScenePrimitiveKind } from '../../math/primitive-geometry.js';
import type { Mat4, Quaternion, Vec3 } from '../../math/types.js';
import type { SceneMeshGeometry } from '../mesh/types.js';

/** A local affine matrix or a local translation, rotation, and scale. */
export type SceneModelTransform =
  | { readonly matrix: Mat4; readonly position?: never; readonly orientation?: never; readonly scale?: never }
  | {
      readonly matrix?: never;
      readonly position?: Readonly<Vec3>;
      readonly orientation?: Readonly<Quaternion>;
      readonly scale?: Readonly<Vec3>;
    };

interface NamedNode {
  /** Descriptive name; names need not be unique. */
  readonly name?: string;
}

/** One primitive surface with a local transform and base color. */
export type SceneModelPrimitiveNode = NamedNode &
  SceneModelTransform & {
    readonly shape: ScenePrimitiveKind;
    readonly color?: SceneColor;
    readonly geometry?: never;
    readonly children?: never;
  };

/** One triangle mesh with a local transform and base color. */
export type SceneModelMeshNode = NamedNode &
  SceneModelTransform & {
    readonly geometry: SceneMeshGeometry;
    readonly color?: SceneColor;
    readonly shape?: never;
    readonly children?: never;
  };

/** A named transform shared by its child nodes. */
export type SceneModelGroupNode = NamedNode &
  SceneModelTransform & {
    readonly children: SceneModelGeometry;
    readonly shape?: never;
    readonly geometry?: never;
  };

/** Hierarchical model data shared by authored geometry and file decoders. */
export type SceneModelNode = SceneModelPrimitiveNode | SceneModelMeshNode | SceneModelGroupNode;

/** Root nodes of one model, independent of its instance placements. */
export type SceneModelGeometry = readonly SceneModelNode[];
