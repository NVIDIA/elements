// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { CubeBuffer } from '../dist/cubes/index.js';
import { TriangleVertexBuffer } from '../dist/triangles/index.js';
import '../dist/body/define.js';
import '../dist/camera/define.js';
import '../dist/cubes/define.js';
import '../dist/mesh/define.js';
import '../dist/scene/define.js';
import '../dist/triangles/define.js';

const kind = new URLSearchParams(location.search).get('profile') ?? 'mesh';
const scene = document.createElement('nve-scene');
const camera = document.createElement('nve-scene-camera');
camera.behavior = 'orbit';
camera.target = [0, 0, 0];
camera.distance = 7;
camera.polarAngle = 0.9;
camera.azimuth = -0.65;
camera.near = 0.1;
camera.far = 100;
scene.append(camera);
document.body.append(scene);
let layer;

const corners = [
  [-10, -10, 0],
  [10, -10, 0],
  [10, 10, 0],
  [-10, 10, 0]
];

function setAlpha(alpha) {
  if (layer) layer.remove();
  if (kind === 'mesh') {
    layer = document.createElement('nve-scene-mesh');
    layer.geometry = {
      positions: Float32Array.from(corners.flat()),
      normals: Float32Array.from(corners.flatMap(() => [0, 0, 1])),
      colors: Float32Array.from(corners.flatMap(() => [1, 1, 1, alpha])),
      indices: Uint32Array.from([0, 1, 2, 0, 2, 3])
    };
  } else if (kind === 'body') {
    layer = document.createElement('nve-scene-body');
    layer.geometry = [{ type: 'cube', scale: [8, 8, 1], color: `rgba(255,255,255,${alpha})` }];
  } else if (kind === 'cube') {
    layer = document.createElement('nve-scene-cubes');
    layer.source = new CubeBuffer({ records: [{ size: [8, 8, 1], color: [1, 1, 1, alpha] }] });
  } else if (kind === 'triangles') {
    layer = document.createElement('nve-scene-triangles');
    layer.source = new TriangleVertexBuffer({
      records: [0, 1, 2, 0, 2, 3].map(index => ({
        position: corners[index],
        color: [1, 1, 1, alpha]
      }))
    });
  } else throw new Error(`Unknown alpha coverage profile: ${kind}`);
  scene.append(layer);
}

function waitFrames(count = 4) {
  return new Promise(resolve => {
    function frame() {
      count -= 1;
      if (count <= 0) resolve();
      else requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
}

setAlpha(1);
const ready = Promise.all([scene.ready, layer.loadComplete]).then(() => waitFrames());

globalThis.__webgpuTestWorkload = {
  ready,
  getProfile: () => ({ kind }),
  pause() {},
  async triggerUpdate(alpha = 0.5) {
    setAlpha(alpha);
    if (layer.loadComplete) await layer.loadComplete;
    await waitFrames();
  },
  async teardown() {
    scene.remove();
    await waitFrames();
  }
};
