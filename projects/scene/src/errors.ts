// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const WEBGPU_UNAVAILABLE = 'webgpu-unavailable';
export const DEVICE_LOST = 'device-lost';
export const FRAME_NAME_DUPLICATE = 'frame-name-duplicate';
export const FRAME_TRANSFORM = 'frame-transform';
export const MARKER_VALUE = 'marker-value';
export const LAYOUT_STRIDE_MISMATCH = 'layout-stride-mismatch';
export const LAYOUT_VALUE_INVALID = 'layout-value-invalid';
export const LAYER_DUAL_SOURCE = 'layer-dual-source';
export const LAYER_CHILD = 'layer-child';
export const FEATURE_ID_MAP_INVALID = 'feature-id-map-invalid';
export const MARKER_PARENT = 'marker-parent';
export const TRIANGLES_COUNT = 'triangles-count';
export const LINES_COUNT = 'lines-count';
export const MESH_GEOMETRY = 'mesh-geometry';
export const MESH_TEXTURE_WITHOUT_UVS = 'mesh-texture-without-uvs';
export const MESH_TEXTURE_CAPTURE = 'mesh-texture-capture';
export const HEIGHTFIELD_GRID = 'heightfield-grid';
export const POLYGON_GEOMETRY = 'polygon-geometry';
export const MODEL_DUAL_SOURCE = 'model-dual-source';
export const PART_SHAPE = 'part-shape';
export const CAMERA_SLOT_CONFLICT = 'camera-slot-conflict';
export const CAMERA_RANGE = 'camera-range';
export const CAMERA_FRAME_UNRESOLVED = 'camera-frame-unresolved';
export const CAMERA_PROPERTY_INACTIVE = 'camera-property-inactive';

export type SceneErrorCode =
  | typeof CAMERA_FRAME_UNRESOLVED
  | typeof CAMERA_PROPERTY_INACTIVE
  | typeof CAMERA_RANGE
  | typeof CAMERA_SLOT_CONFLICT
  | typeof DEVICE_LOST
  | typeof FEATURE_ID_MAP_INVALID
  | typeof FRAME_NAME_DUPLICATE
  | typeof FRAME_TRANSFORM
  | typeof HEIGHTFIELD_GRID
  | typeof LAYER_CHILD
  | typeof LAYER_DUAL_SOURCE
  | typeof LAYOUT_STRIDE_MISMATCH
  | typeof LAYOUT_VALUE_INVALID
  | typeof LINES_COUNT
  | typeof MARKER_PARENT
  | typeof MARKER_VALUE
  | typeof MESH_GEOMETRY
  | typeof MESH_TEXTURE_CAPTURE
  | typeof MESH_TEXTURE_WITHOUT_UVS
  | typeof MODEL_DUAL_SOURCE
  | typeof PART_SHAPE
  | typeof POLYGON_GEOMETRY
  | typeof TRIANGLES_COUNT
  | typeof WEBGPU_UNAVAILABLE;

export interface SceneErrorDetail {
  readonly code: SceneErrorCode;
  readonly element: Element;
  readonly message: string;
  readonly severity: 'error' | 'warning';
}
