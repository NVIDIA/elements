// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { SceneColor } from '../../color/types.js';
import type { ScenePrimitiveType } from '../../math/primitive-geometry.js';
import type { Quaternion, Vec3 } from '../../math/types.js';
import type { SceneMeshGeometry } from '../mesh/types.js';

/** A local translation, XYZW rotation, and nonzero scale; omitted fields use identity. */
export interface SceneBodyTransform {
  readonly position?: Readonly<Vec3>;
  readonly orientation?: Readonly<Quaternion>;
  readonly scale?: Readonly<Vec3>;
}

interface NamedNode {
  /** Descriptive name; names need not be unique. */
  readonly name?: string;
}

/** One primitive surface with a local transform and base color. */
export type SceneBodyPrimitiveNode = NamedNode &
  SceneBodyTransform & {
    readonly type: ScenePrimitiveType;
    readonly color?: SceneColor;
    readonly geometry?: never;
    readonly children?: never;
  };

/** One triangle mesh with a local transform and base color. */
export type SceneBodyMeshNode = NamedNode &
  SceneBodyTransform & {
    readonly geometry: SceneMeshGeometry;
    readonly color?: SceneColor;
    readonly type?: never;
    readonly children?: never;
  };

/** A named transform shared by its child nodes. */
export type SceneBodyGroupNode = NamedNode &
  SceneBodyTransform & {
    readonly children: SceneBodyGeometry;
    readonly type?: never;
    readonly geometry?: never;
  };

/** Hierarchical body data shared by authored geometry and file decoders. */
export type SceneBodyNode = SceneBodyPrimitiveNode | SceneBodyMeshNode | SceneBodyGroupNode;

/** Root nodes of one body, independent of its instance placements. */
export type SceneBodyGeometry = readonly SceneBodyNode[];
