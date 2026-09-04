// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { SceneContent } from './content.js';
import { invalidateFrameTransform } from '../frame/state.js';
import '@nvidia-elements/scene/cubes/define.js';
import '@nvidia-elements/scene/frame/define.js';
import '@nvidia-elements/scene/heightfield/define.js';
import '@nvidia-elements/scene/mesh/define.js';
import '@nvidia-elements/scene/model/define.js';
import '@nvidia-elements/scene/points/define.js';
import '@nvidia-elements/scene/polygon/define.js';

describe(SceneContent.name, () => {
  it('ignores hidden and unregistered renderable layers', () => {
    const host = document.createElement('nve-scene');
    const hidden = document.createElement('nve-scene-cubes');
    hidden.hidden = true;
    const unregisteredHeightfield = document.createElementNS('urn:nvidia-elements:test', 'nve-scene-heightfield');
    const unregisteredCubes = document.createElementNS('urn:nvidia-elements:test', 'nve-scene-cubes');
    const unregisteredMesh = document.createElementNS('urn:nvidia-elements:test', 'nve-scene-mesh');
    const unregisteredModel = document.createElementNS('urn:nvidia-elements:test', 'nve-scene-model');
    const unregisteredPolygon = document.createElementNS('urn:nvidia-elements:test', 'nve-scene-polygon');
    host.append(
      hidden,
      unregisteredHeightfield,
      unregisteredCubes,
      unregisteredMesh,
      unregisteredModel,
      unregisteredPolygon
    );
    const content = new SceneContent(host);

    content.refresh();

    expect(content.compileRenderItems()).toEqual([]);
    hidden.remove();
    content.refresh();
    expect(content.trackChanges()).toBe(false);
  });

  it('tracks ownership for elements, text nodes, and unrelated nodes', () => {
    const host = document.createElement('nve-scene');
    const child = document.createElement('span');
    const text = document.createTextNode('content');
    const outside = document.createElement('div');
    host.append(child, text);
    const content = new SceneContent(host);

    expect(content.ownsNode(child)).toBe(true);
    expect(content.ownsNode(text)).toBe(true);
    expect(content.ownsNode(outside)).toBe(false);
  });

  it('reports no changes when no registered frames or layers exist', () => {
    const content = new SceneContent(document.createElement('nve-scene'));

    content.refresh();

    expect(content.trackChanges()).toBe(false);
    content.resolveFrames();
  });

  it('tracks registered marker and streaming layers until their versions settle', () => {
    const host = document.createElement('nve-scene');
    const cubes = document.createElement('nve-scene-cubes');
    const points = document.createElement('nve-scene-points');
    cubes.interactive = true;
    host.append(cubes, points);
    const content = new SceneContent(host);

    content.refresh();

    expect(content.trackChanges()).toBe(true);
    expect(content.trackChanges()).toBe(false);
    expect(content.compileRenderItems().map(item => item.interactive)).toEqual([true, false]);
  });

  it('tracks only owned, visible, frame-valid interactive targets', () => {
    const host = document.createElement('nve-scene');
    const layer = document.createElement('nve-scene-cubes');
    const hidden = document.createElement('nve-scene-points');
    const innerScene = document.createElement('nve-scene');
    const nested = document.createElement('nve-scene-cubes');
    layer.interactive = true;
    hidden.interactive = true;
    hidden.hidden = true;
    nested.interactive = true;
    innerScene.append(nested);
    host.append(layer, hidden, innerScene);
    const content = new SceneContent(host);

    content.refresh();
    expect(content.hasInteractiveTargets()).toBe(true);
    layer.remove();
    content.refresh();
    expect(content.hasInteractiveTargets()).toBe(false);
    hidden.hidden = false;
    expect(content.hasInteractiveTargets()).toBe(true);
  });

  it.each(['nve-scene-heightfield', 'nve-scene-mesh', 'nve-scene-model', 'nve-scene-polygon'] as const)(
    'recognizes an interactive %s as a pick target',
    tag => {
      const host = document.createElement('nve-scene');
      const layer = document.createElement(tag);
      layer.interactive = true;
      host.append(layer);
      const content = new SceneContent(host);

      content.refresh();

      expect(content.hasInteractiveTargets()).toBe(true);
    }
  );

  it('suppresses renderable layers beneath an invalid frame without suppressing valid duplicate-name subtrees', () => {
    const host = document.createElement('nve-scene');
    const first = document.createElement('nve-scene-frame');
    const second = document.createElement('nve-scene-frame');
    const firstLayer = document.createElement('nve-scene-cubes');
    const secondLayer = document.createElement('nve-scene-cubes');
    first.name = 'duplicate';
    second.name = 'duplicate';
    first.append(firstLayer);
    second.append(secondLayer);
    host.append(first, second);
    const content = new SceneContent(host);

    content.refresh();
    content.resolveFrames();

    expect(content.compileRenderItems().map(item => item.layer)).toEqual([firstLayer, secondLayer]);

    invalidateFrameTransform(first);

    expect(content.compileRenderItems().map(item => item.layer)).toEqual([secondLayer]);
  });
});
