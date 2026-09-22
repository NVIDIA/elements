// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import { SceneCubes } from '../../cubes/cubes.js';
import { SceneMesh } from '../../mesh/mesh.js';
import { SceneLines } from '../../lines/lines.js';
import { getSceneLayerSpec, SCENE_LAYER_SELECTOR, SCENE_PART_TAG } from './registry.js';

describe('scene layer registry', () => {
  it('classifies public component metadata and selects renderable layers without parts or unknown tags', () => {
    expect(getSceneLayerSpec(SceneCubes.metadata.tag)).toMatchObject({ family: 'marker', markerInstances: true });
    expect(getSceneLayerSpec(SceneMesh.metadata.tag)).toMatchObject({ family: 'mesh', markerInstances: true });
    expect(getSceneLayerSpec(SceneLines.metadata.tag)).toMatchObject({
      family: 'stream',
      kind: 'line',
      markerInstances: false
    });
    const host = document.createElement('div');
    host.append(
      document.createElement(SceneCubes.metadata.tag),
      document.createElement(SCENE_PART_TAG),
      document.createElement('nve-scene-unknown')
    );
    expect(host.querySelectorAll(SCENE_LAYER_SELECTOR)).toHaveLength(1);
    expect(getSceneLayerSpec(SCENE_PART_TAG)).toBeUndefined();
    expect(getSceneLayerSpec('nve-scene-unknown')).toBeUndefined();
    const tags = SCENE_LAYER_SELECTOR.split(',');
    expect(new Set(tags).size).toBe(tags.length);
  });
});
