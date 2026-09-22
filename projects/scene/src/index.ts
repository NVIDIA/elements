// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// utilities
export { LABEL, LINE_VERTEX, MARKER, POINT, TRIANGLE_VERTEX } from './internal/records/layouts/built-ins.js';
export { MarkerBuffer } from './internal/layers/markers/buffer.js';

// types
export type { FieldSpec, FieldType, LayoutDescriptor } from './internal/records/layouts/define-layout.js';
export type { Marker, MarkerInit, MarkerSource } from './internal/layers/markers/buffer.js';
export type { Label, LabelInit, LabelSource } from './internal/layers/labels/buffer.js';
export type { LineVertex, LineVertexInit, LineVertexSource, LineVertexStyle } from './internal/layers/lines/buffer.js';
export type { Point, PointInit, PointSource } from './internal/layers/points/buffer.js';
export type {
  MutableQuaternion,
  MutableVector3,
  RecordBufferOptions
} from './internal/records/packed-record-buffer.js';
export type { SceneColor } from './internal/color/types.js';
export type { ScenePublishOptions } from './internal/records/packed-record-source.js';
export type { TriangleVertex, TriangleVertexInit, TriangleVertexSource } from './internal/layers/triangles/buffer.js';
export type {
  SceneClick,
  ScenePickHit,
  ScenePickTarget,
  ScenePointerEnter,
  ScenePointerLeave
} from './internal/interaction/picking/routing.js';
export type { SceneInteractionTarget } from './internal/interaction/target.js';
export type { SceneFeatureIdMap, SceneFeatureIds } from './internal/interaction/feature-ids.js';
export type { SceneErrorCode, SceneErrorDetail } from './internal/diagnostics/errors.js';
export type {
  SceneCameraChangeSource,
  SceneCameraProjection,
  SceneCameraState,
  SceneCameraChangeDetail
} from './internal/composition/camera/math.js';
export type { Mat4, Quaternion, ScenePose, Vec3 } from './internal/math/types.js';
export type { SceneBounds } from './internal/math/bounds.js';
export type { SceneBoundsQueryOptions } from './internal/composition/scene/bounds.js';
export type { SceneCameraFitOptions } from './internal/composition/camera/fit.js';
export type { RGBA } from './internal/color/types.js';

export const VERSION = '0.0.0';
