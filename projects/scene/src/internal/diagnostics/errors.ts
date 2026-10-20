// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const WEBGPU_UNAVAILABLE = 'webgpu-unavailable';
export const DEVICE_LOST = 'device-lost';
export const FRAME_NAME_DUPLICATE = 'frame-name-duplicate';
export const FRAME_TRANSFORM = 'frame-transform';
export const LAYOUT_STRIDE_MISMATCH = 'layout-stride-mismatch';
export const LAYOUT_VALUE_INVALID = 'layout-value-invalid';
export const LAYER_CHILD = 'layer-child';
export const LAYER_SOURCE_INVALID = 'layer-source-invalid';
export const FEATURE_ID_MAP_INVALID = 'feature-id-map-invalid';
export const FEATURE_ID_INACTIVE = 'feature-id-inactive';
export const TRIANGLES_COUNT = 'triangles-count';
export const LINES_COUNT = 'lines-count';
export const MESH_GEOMETRY = 'mesh-geometry';
export const MESH_TEXTURE_WITHOUT_UVS = 'mesh-texture-without-uvs';
export const MESH_TEXTURE_CAPTURE = 'mesh-texture-capture';
export const HEIGHTFIELD_GRID = 'heightfield-grid';
export const POLYGON_GEOMETRY = 'polygon-geometry';
/** Reserved; assigned geometry currently overrides shape children without a diagnostic. */
export const BODY_DUAL_SOURCE = 'body-dual-source';
export const BODY_SRC = 'body-src';
export const SHAPE_KIND = 'shape-kind';
export const CAMERA_SLOT_CONFLICT = 'camera-slot-conflict';
export const CAMERA_RANGE = 'camera-range';
export const FRAME_UNRESOLVED = 'frame-unresolved';
export const CAMERA_PROPERTY_INACTIVE = 'camera-property-inactive';

export const JOINT_TYPE = 'joint-type';

export const JOINT_AXIS = 'joint-axis';

export const JOINT_VALUE = 'joint-value';

export const JOINT_LIMIT = 'joint-limit';

export const JOINT_MIMIC = 'joint-mimic';

export const FRAME_NAME = 'frame-name';

export const MODEL_JOINT = 'model-joint';

export const MODEL_NAME = 'model-name';

export type SceneErrorCode =
  | typeof MODEL_NAME
  | typeof MODEL_JOINT
  | typeof FRAME_NAME
  | typeof JOINT_MIMIC
  | typeof JOINT_LIMIT
  | typeof JOINT_VALUE
  | typeof JOINT_AXIS
  | typeof JOINT_TYPE
  | typeof FRAME_UNRESOLVED
  | typeof CAMERA_PROPERTY_INACTIVE
  | typeof CAMERA_RANGE
  | typeof CAMERA_SLOT_CONFLICT
  | typeof DEVICE_LOST
  | typeof FEATURE_ID_MAP_INVALID
  | typeof FEATURE_ID_INACTIVE
  | typeof FRAME_NAME_DUPLICATE
  | typeof FRAME_TRANSFORM
  | typeof HEIGHTFIELD_GRID
  | typeof LAYER_CHILD
  | typeof LAYER_SOURCE_INVALID
  | typeof LAYOUT_STRIDE_MISMATCH
  | typeof LAYOUT_VALUE_INVALID
  | typeof LINES_COUNT
  | typeof MESH_GEOMETRY
  | typeof MESH_TEXTURE_CAPTURE
  | typeof MESH_TEXTURE_WITHOUT_UVS
  | typeof BODY_DUAL_SOURCE
  | typeof BODY_SRC
  | typeof SHAPE_KIND
  | typeof POLYGON_GEOMETRY
  | typeof TRIANGLES_COUNT
  | typeof WEBGPU_UNAVAILABLE;

export interface SceneErrorDetail {
  readonly code: SceneErrorCode;
  readonly element: Element;
  readonly message: string;
  readonly severity: 'error' | 'warning';
}
