// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import '../dist/camera/define.js';
import '../dist/mesh/define.js';
import '../dist/scene/define.js';

const [backend = 'gpu', sideText = '128', topology = 'indexed'] =
  new URL(location.href).searchParams.get('profile')?.split('-') ?? [];
const side = Number(sideText);
const readbackEnabled = backend === 'check';
let device;
let pending;
let uploaded = false;
let geometryBuffers = [];
let allocatedBytes = 0;
let uploadedBytes = 0;
let revision = 0;
let initializationMs = 0;
const requestDevice = GPUAdapter.prototype.requestDevice;

// This harness forces the existing fallback externally; production has no benchmark switches.
GPUAdapter.prototype.requestDevice = async function (...args) {
  device = await Reflect.apply(requestDevice, this, args);
  device.addEventListener('uncapturederror', event => console.error(event.error.message));
  if (backend === 'cpu') Object.defineProperty(device, 'createComputePipeline', { value: undefined });
  const createBuffer = device.createBuffer.bind(device);
  device.createBuffer = descriptor => {
    const vertex = (descriptor.usage & GPUBufferUsage.VERTEX) !== 0;
    const buffer = createBuffer({
      ...descriptor,
      usage: descriptor.usage | (readbackEnabled && vertex ? GPUBufferUsage.COPY_SRC : 0)
    });
    allocatedBytes += descriptor.size;
    if (vertex) geometryBuffers.push(buffer);
    return buffer;
  };
  const writeBuffer = device.queue.writeBuffer.bind(device.queue);
  device.queue.writeBuffer = (buffer, offset, data, ...rest) => {
    if ((buffer.usage & GPUBufferUsage.UNIFORM) === 0) {
      uploaded = true;
      uploadedBytes += data.byteLength;
    }
    return writeBuffer(buffer, offset, data, ...rest);
  };
  const submit = device.queue.submit.bind(device.queue);
  device.queue.submit = commands => {
    submit(commands);
    if (!pending || !uploaded) return;
    const submitted = performance.now();
    const operation = pending;
    pending = undefined;
    device.queue.onSubmittedWorkDone().then(() =>
      operation.resolve({
        publicationToSubmitMs: submitted - operation.start,
        publicationToCompletionMs: performance.now() - operation.start,
        uploadedBytes: uploadedBytes - operation.uploadedBytes,
        allocatedBytes: allocatedBytes - operation.allocatedBytes
      })
    );
  };
  return device;
};

const scene = document.createElement('nve-scene');
scene.setAttribute('aria-label', 'Mesh preprocessing workload');
scene.style.width = '640px';
scene.style.height = '480px';
const camera = document.createElement('nve-scene-camera');
camera.behavior = 'orbit';
camera.target = [0, 0, 0];
camera.distance = 4;
const mesh = document.createElement('nve-scene-mesh');
let source = grid(side);
if (topology === 'nonindexed') {
  const positions = new Float32Array(source.indices.length * 3);
  for (let corner = 0; corner < source.indices.length; corner++) {
    positions.set(source.positions.subarray(source.indices[corner] * 3, source.indices[corner] * 3 + 3), corner * 3);
  }
  source = { positions };
}
const initializationStart = performance.now();
mesh.geometry = source;
await mesh.loadComplete;
scene.append(camera, mesh);
document.body.append(scene);

function grid(size) {
  const positions = new Float32Array(size * size * 3);
  const indices = new Uint32Array((size - 1) ** 2 * 6);
  let offset = 0;
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      const vertex = row * size + column;
      positions[vertex * 3] = (column / (size - 1)) * 2 - 1;
      positions[vertex * 3 + 1] = (row / (size - 1)) * 2 - 1;
      if (row + 1 < size && column + 1 < size) {
        indices.set([vertex, vertex + 1, vertex + size, vertex + 1, vertex + size + 1, vertex + size], offset);
        offset += 6;
      }
    }
  }
  return { positions, indices };
}

async function operation(callback) {
  if (pending) throw new Error('A mesh operation is already pending.');
  uploaded = false;
  let timer;
  try {
    return await new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error('Mesh submission timed out.')), 10_000);
      pending = { resolve, start: performance.now(), uploadedBytes, allocatedBytes };
      Promise.resolve(callback()).catch(reject);
    });
  } finally {
    clearTimeout(timer);
    pending = undefined;
  }
}

function update(fraction = 1) {
  const count = Math.max(1, Math.floor((source.positions.length / 3) * fraction));
  const value = ++revision % 2 ? 0.125 : 0;
  return operation(() => {
    for (let vertex = 0; vertex < count; vertex++) source.positions[vertex * 3 + 2] = value;
    mesh.publishGeometry({ attribute: 'positions', source: source.positions, start: 0, count });
  });
}

async function readGeometry() {
  const buffers = geometryBuffers.slice(-4);
  const encoder = device.createCommandEncoder();
  const copies = buffers.map(buffer => {
    const copy = device.createBuffer({ size: buffer.size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
    encoder.copyBufferToBuffer(buffer, 0, copy, 0, buffer.size);
    return copy;
  });
  device.queue.submit([encoder.finish()]);
  try {
    return await Promise.all(
      copies.map(async buffer => {
        await buffer.mapAsync(GPUMapMode.READ);
        return Array.from(new Float32Array(buffer.getMappedRange()));
      })
    );
  } finally {
    copies.forEach(buffer => buffer.destroy());
  }
}

globalThis.__webgpuTestWorkload = {
  ready: scene.ready.then(async () => {
    await device.queue.onSubmittedWorkDone();
    initializationMs = performance.now() - initializationStart;
  }),
  pause() {},
  getProfile: () => ({
    backend,
    side,
    topology,
    vertices: source.positions.length / 3,
    triangles: (source.indices?.length ?? source.positions.length / 3) / 3,
    canvas: { width: 640, height: 480, devicePixelRatio: devicePixelRatio },
    allocatedBytes,
    initializationMs
  }),
  getSource: () => Object.fromEntries(Object.entries(source).map(([key, values]) => [key, Array.from(values)])),
  update,
  updateColor() {
    return operation(() => {
      source.colors[0] = source.colors[0] === 1 ? 0.25 : 1;
      mesh.publishGeometry({ attribute: 'colors', source: source.colors, start: 0, count: 1 });
    });
  },
  async compareGeometry(expected) {
    const actual = await readGeometry();
    return actual.map((values, attribute) => {
      let maxError = 0;
      let nonfinite = 0;
      for (let index = 0; index < values.length; index++) {
        if (!Number.isFinite(values[index])) nonfinite++;
        maxError = Math.max(maxError, Math.abs(values[index] - expected[attribute][index]));
      }
      return { length: values.length, maxError, nonfinite };
    });
  },
  async setGeometry(value) {
    geometryBuffers = [];
    source = {
      positions: Float32Array.from(value.positions),
      ...(value.indices ? { indices: Uint32Array.from(value.indices) } : {}),
      ...(value.colors ? { colors: Float32Array.from(value.colors) } : {}),
      ...(value.uvs ? { uvs: Float32Array.from(value.uvs) } : {})
    };
    return operation(() => {
      mesh.geometry = source;
      return mesh.loadComplete;
    });
  },
  async pick() {
    const point = scene.getClientPoint([0, 0, 0]);
    const hit = point && (await scene.pick(point.clientX, point.clientY));
    return hit ? { layer: hit.layer === mesh, kind: hit.target.kind } : null;
  },
  teardown() {
    scene.remove();
  }
};
