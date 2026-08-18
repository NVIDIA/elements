// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// components
export * from './arrows/index.js';
export * from './axes/index.js';
export * from './camera/index.js';
export * from './cones/index.js';
export * from './cubes/index.js';
export * from './cylinders/index.js';
export * from './frame/index.js';
export * from './gridlines/index.js';
export * from './heightfield/index.js';
export * from './label/index.js';
export * from './lines/index.js';
export * from './marker/index.js';
export * from './mesh/index.js';
export * from './model/index.js';
export * from './points/index.js';
export * from './pyramids/index.js';
export * from './scene/index.js';
export * from './spheres/index.js';
export * from './triangles/index.js';

// utilities
export { LINE_VERTEX, MARKER, POINT, TRI_VERTEX } from './internal/layouts/built-ins.js';
export { defineLayout } from './internal/layouts/define-layout.js';
export {
  readLineVertex,
  readMarker,
  readPoint,
  readTriVertex,
  writeLineVertex,
  writeMarker,
  writePoint,
  writeTriVertex
} from './internal/layouts/helpers.js';

// types
export type { FieldSpec, FieldType, LayoutDescriptor } from './internal/layouts/define-layout.js';
export type { LineVertexFields, MarkerFields, PointFields, TriVertexFields } from './internal/layouts/helpers.js';
export type { PickHit } from './scene/pick/types.js';
export type { SceneErrorDetail } from './errors.js';
export type {
  CameraChangeSource,
  CameraOffset,
  CameraProjection,
  CameraState,
  CameraTarget,
  SceneCameraChangeDetail
} from './internal/math/camera.js';
export type { Mat4, Quaternion, RGBA, Vec3 } from './internal/types.js';

export const VERSION = '0.0.0';
