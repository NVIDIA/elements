// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { compileShapes, MarkerBuffer, quaternionFromRpy } from '../dist/index.js';
import { CubeBuffer } from '../dist/cubes/index.js';
import '../dist/camera/define.js';
import '../dist/cubes/define.js';
import '../dist/frame/define.js';
import '../dist/mesh/define.js';
import '../dist/scene/define.js';

const kind = new URLSearchParams(location.search).get('profile') ?? 'marker';
const scene = document.createElement('nve-scene');
const camera = document.createElement('nve-scene-camera');
camera.behavior = 'orbit';
camera.target = [1_000_000, -2_000_000, 0];
camera.distance = 6;
camera.polarAngle = 0.9;
camera.azimuth = -0.65;
camera.near = 0.1;
camera.far = 100;
const frame = document.createElement('nve-scene-frame');
frame.position = [...camera.target];
const layer = document.createElement(kind === 'mesh' ? 'nve-scene-mesh' : 'nve-scene-cubes');
if (kind === 'mesh') layer.geometry = compileShapes([{ type: 'cube' }]);
const source =
  kind === 'mesh'
    ? new MarkerBuffer({ records: [{ scale: [1.8, 0.9, 1.4], featureId: 42 }] })
    : new CubeBuffer({ records: [{ size: [1.8, 0.9, 1.4], featureId: 42 }] });
layer.source = source;
frame.append(layer);
scene.append(camera, frame);
document.body.append(scene);

function waitFrames(count = 4) {
  return new Promise(resolve => {
    function next() {
      if (--count === 0) resolve();
      else requestAnimationFrame(next);
    }
    requestAnimationFrame(next);
  });
}

async function setPose(mode) {
  const angle = Math.PI / 3;
  frame.orientation = quaternionFromRpy([mode === 'frame' ? angle : mode === 'split' ? angle / 2 : 0, 0, 0]);
  source
    .at(0)
    .orientation.set(...quaternionFromRpy([mode === 'instance' ? angle : mode === 'split' ? angle / 2 : 0, 0, 0]));
  layer.publish();
  await waitFrames();
}

const ready = setPose('frame')
  .then(() => scene.ready)
  .then(() => waitFrames());
globalThis.__webgpuTestWorkload = {
  ready,
  getProfile: () => ({ kind }),
  pause() {},
  triggerUpdate: setPose,
  async pick() {
    const hit = await scene.pick(320, 240);
    return hit && { featureId: hit.featureId, kind: hit.target.kind };
  },
  teardown() {
    scene.remove();
  }
};
