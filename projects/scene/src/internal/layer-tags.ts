// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type SceneLayerKind =
  | 'label'
  | 'marker'
  | 'point'
  | 'line'
  | 'triangle'
  | 'mesh'
  | 'model'
  | 'polygon'
  | 'heightfield';

export type StreamSceneLayerKind = 'point' | 'line' | 'triangle';
export type MeshSceneLayerKind = 'mesh' | 'model' | 'polygon';

export type SceneLayerSpec =
  | { readonly family: 'label'; readonly kind: 'label'; readonly markerInstances: false; readonly tag: string }
  | { readonly family: 'marker'; readonly kind: 'marker'; readonly markerInstances: true; readonly tag: string }
  | {
      readonly family: 'stream';
      readonly kind: StreamSceneLayerKind;
      readonly markerInstances: false;
      readonly tag: string;
    }
  | {
      readonly family: 'mesh';
      readonly kind: MeshSceneLayerKind;
      readonly markerInstances: true;
      readonly tag: string;
    }
  | {
      readonly family: 'heightfield';
      readonly kind: 'heightfield';
      readonly markerInstances: false;
      readonly tag: string;
    };

export const SCENE_MARKER_TAG = 'nve-scene-marker';
export const SCENE_MODEL_TAG = 'nve-scene-model';
export const SCENE_PART_TAG = 'nve-scene-part';

const SCENE_LAYER_SPECS = [
  { family: 'label', kind: 'label', markerInstances: false, tag: 'nve-scene-labels' },
  { family: 'marker', kind: 'marker', markerInstances: true, tag: 'nve-scene-cones' },
  { family: 'marker', kind: 'marker', markerInstances: true, tag: 'nve-scene-cubes' },
  { family: 'marker', kind: 'marker', markerInstances: true, tag: 'nve-scene-cylinders' },
  { family: 'marker', kind: 'marker', markerInstances: true, tag: 'nve-scene-pyramids' },
  { family: 'marker', kind: 'marker', markerInstances: true, tag: 'nve-scene-spheres' },
  { family: 'stream', kind: 'line', markerInstances: false, tag: 'nve-scene-axes' },
  { family: 'stream', kind: 'line', markerInstances: false, tag: 'nve-scene-gridlines' },
  { family: 'stream', kind: 'line', markerInstances: false, tag: 'nve-scene-lines' },
  { family: 'stream', kind: 'point', markerInstances: false, tag: 'nve-scene-points' },
  { family: 'stream', kind: 'triangle', markerInstances: false, tag: 'nve-scene-triangles' },
  { family: 'mesh', kind: 'mesh', markerInstances: true, tag: 'nve-scene-mesh' },
  { family: 'mesh', kind: 'model', markerInstances: true, tag: SCENE_MODEL_TAG },
  { family: 'mesh', kind: 'polygon', markerInstances: true, tag: 'nve-scene-polygon' },
  { family: 'heightfield', kind: 'heightfield', markerInstances: false, tag: 'nve-scene-heightfield' }
] as const satisfies readonly SceneLayerSpec[];

const specsByTag: ReadonlyMap<string, SceneLayerSpec> = new Map(SCENE_LAYER_SPECS.map(spec => [spec.tag, spec]));

export const SCENE_LAYER_SELECTOR = SCENE_LAYER_SPECS.map(spec => spec.tag).join(',');

export function getSceneLayerSpec(tag: string): SceneLayerSpec | undefined {
  return specsByTag.get(tag);
}

export function isMarkerInstanceLayerTag(tag: string): boolean {
  return getSceneLayerSpec(tag)?.markerInstances === true;
}
