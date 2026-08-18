// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const WEBGPU_UNAVAILABLE = 'webgpu-unavailable';
export const DEVICE_LOST = 'device-lost';
export const FRAME_NAME_DUPLICATE = 'frame-name-duplicate';
export const FRAME_TRANSFORM = 'frame-transform';
export const LABEL_PARENT = 'label-parent';
export const LABEL_CHILD_COUNT = 'label-child-count';
export const LABEL_CHILD_BOXLESS = 'label-child-boxless';
export const LABEL_FRAME_UNRESOLVED = 'label-frame-unresolved';
export const LABEL_TEXTURE_FALLBACK = 'label-texture-fallback';
export const SCENE_STALE_AFTER = 'scene-stale-after';
export const MARKER_VALUE = 'marker-value';
export const LAYOUT_STRIDE_MISMATCH = 'layout-stride-mismatch';
export const LAYOUT_VALUE_INVALID = 'layout-value-invalid';
export const LAYER_DUAL_SOURCE = 'layer-dual-source';
export const LAYER_CHILD = 'layer-child';
export const MARKER_PARENT = 'marker-parent';
export const MARKER_ARROW_FORM = 'marker-arrow-form';
export const MARKER_ARROW_DEGENERATE = 'marker-arrow-degenerate';
export const TRIANGLES_COUNT = 'triangles-count';
export const LINES_COUNT = 'lines-count';
export const MESH_GEOMETRY = 'mesh-geometry';
export const MESH_TEXTURE_WITHOUT_UVS = 'mesh-texture-without-uvs';
export const HEIGHTFIELD_GRID = 'heightfield-grid';
export const MODEL_DUAL_SOURCE = 'model-dual-source';
export const PART_SHAPE = 'part-shape';
export const CAMERA_SLOT_CONFLICT = 'camera-slot-conflict';
export const CAMERA_RANGE = 'camera-range';
export const CAMERA_FRAME_UNRESOLVED = 'camera-frame-unresolved';

export interface SceneErrorDetail {
  code: string;
  message: string;
  element: Element;
  severity: 'error' | 'warning';
}
