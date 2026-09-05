// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import path from 'node:path';

const manifest = JSON.parse(readFileSync('dist/custom-elements.json', 'utf8'));
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const declarations = manifest.modules.flatMap(module => module.declarations ?? []);

function declaration(tagName) {
  const result = declarations.find(item => item.tagName === tagName);
  assert.ok(result, `Missing manifest declaration for ${tagName}.`);
  return result;
}

function names(items) {
  return items?.map(item => item.name) ?? [];
}

function eventTypes(element) {
  return Object.fromEntries(element.events.map(event => [event.name, event.type?.text]));
}

describe('generated package artifacts', () => {
  it('should publish only public manifest modules', () => {
    assert.equal(
      manifest.modules.some(module => module.path.includes('/internal/')),
      false
    );
    assert.equal(
      manifest.modules.some(module => module.path === '/src/errors.js'),
      false
    );
  });

  it('should preserve inherited layer APIs with concrete source types', () => {
    const sourceTypes = new Map([
      ['nve-scene-lines', 'LineVertexInstanceSource | null'],
      ['nve-scene-points', 'PointInstanceSource | null'],
      ['nve-scene-triangles', 'TriangleVertexInstanceSource | null']
    ]);
    const layerTags = [
      'nve-scene-cones',
      'nve-scene-cubes',
      'nve-scene-cylinders',
      'nve-scene-lines',
      'nve-scene-mesh',
      'nve-scene-model',
      'nve-scene-points',
      'nve-scene-polygon',
      'nve-scene-pyramids',
      'nve-scene-spheres',
      'nve-scene-triangles'
    ];

    for (const tagName of layerTags) {
      const layer = declaration(tagName);
      assert.deepEqual(
        names(layer.members).filter(name => ['instances', 'count', 'interactive', 'commit'].includes(name)),
        ['instances', 'count', 'interactive', 'commit']
      );
      const instances = layer.members.find(member => member.name === 'instances');
      assert.equal(instances.type.text, sourceTypes.get(tagName) ?? 'MarkerInstanceSource | null');
    }
  });

  it('should publish routed interaction and scene lifecycle events', () => {
    const interactionEvents = ['nve-scene-click', 'nve-scene-pointerenter', 'nve-scene-pointerleave'];
    for (const tagName of ['nve-scene-heightfield', 'nve-scene-lines', 'nve-scene-mesh', 'nve-scene-points']) {
      const layer = declaration(tagName);
      assert.deepEqual(names(layer.events), interactionEvents);
      assert.deepEqual(eventTypes(layer), {
        'nve-scene-click': 'PickHit',
        'nve-scene-pointerenter': 'PickHit',
        'nve-scene-pointerleave': 'PickHit'
      });
    }

    const scene = declaration('nve-scene');
    assert.deepEqual(names(scene.events), ['nve-scene-ready', 'nve-scene-error', 'nve-scene-camerachange']);
    assert.deepEqual(eventTypes(scene), {
      'nve-scene-camerachange': 'SceneCameraChangeDetail',
      'nve-scene-error': 'SceneErrorDetail',
      'nve-scene-ready': 'void'
    });
  });

  it('should emit every declared root and component entrypoint', () => {
    for (const [entrypoint, target] of Object.entries(packageJson.exports)) {
      if (entrypoint.includes('*') || typeof target === 'string') continue;
      for (const artifact of Object.values(target)) {
        assert.equal(existsSync(path.resolve(artifact)), true, `Missing ${entrypoint} artifact ${artifact}.`);
      }
    }
  });
});
