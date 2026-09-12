// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// utilities
export { LABEL, LINE_VERTEX, MARKER, POINT, TRIANGLE_VERTEX } from './internal/layouts/built-ins.js';
export { LabelBuffer } from './internal/labels/buffer.js';
export { LineVertexBuffer } from './internal/lines/buffer.js';
export { MarkerBuffer } from './internal/markers/buffer.js';
export { PointBuffer } from './internal/points/buffer.js';
export { TriangleVertexBuffer } from './internal/triangles/buffer.js';

// types
export type { FieldSpec, FieldType, LayoutDescriptor } from './internal/layouts/define-layout.js';
export type { Marker, MarkerInit, MarkerSource } from './internal/markers/buffer.js';
export type { Label, LabelInit, LabelSource } from './internal/labels/buffer.js';
export type { LineVertex, LineVertexInit, LineVertexSource, LineVertexStyle } from './internal/lines/buffer.js';
export type { Point, PointInit, PointSource } from './internal/points/buffer.js';
export type {
  MutableQuaternion,
  MutableVector3,
  RecordBufferOptions,
  SceneColor
} from './internal/packed-record-buffer.js';
export type { ScenePublishOptions } from './internal/packed-record-source.js';
export type { TriangleVertex, TriangleVertexInit, TriangleVertexSource } from './internal/triangles/buffer.js';
export type { ScenePickHit, ScenePickTarget } from './internal/pick/routing.js';
export type { SceneInteractionTarget } from './internal/interaction.js';
export type { SceneFeatureIdMap, SceneFeatureIds } from './internal/feature-ids.js';
export type { SceneErrorCode, SceneErrorDetail } from './errors.js';
export type {
  SceneCameraChangeSource,
  SceneCameraProjection,
  SceneCameraState,
  SceneCameraChangeDetail
} from './internal/math/camera.js';
export type { Mat4, Quaternion, RGBA, ScenePose, Vec3 } from './internal/types.js';

export const VERSION = '0.0.0';
