// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';

const observerSource = readFileSync(new URL('./webgpu-observer.js', import.meta.url), 'utf8');

async function createObservedDevice() {
  const nativeSubmits = [];

  class FakeBuffer {
    destroy() {}
  }

  class FakeQueue {
    submit(commandBuffers) {
      nativeSubmits.push(commandBuffers);
    }

    writeBuffer() {}
  }

  class FakeDevice {
    constructor() {
      this.queue = new FakeQueue();
    }

    createBuffer() {
      return new FakeBuffer();
    }
  }

  class FakeAdapter {
    async requestDevice() {
      return new FakeDevice();
    }
  }

  class FakeGPU {
    async requestAdapter() {
      return new FakeAdapter();
    }
  }

  const context = { iterations: 0, navigator: { gpu: new FakeGPU() } };
  runInNewContext(observerSource, context);
  const adapter = await context.navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();
  return { context, device, nativeSubmits };
}

test('WebGPU observer records writeBuffer sizes in bytes', async () => {
  const { context, device } = await createObservedDevice();
  const buffer = device.createBuffer({ size: 64, usage: 1 });
  const typedArray = runInNewContext('new Uint16Array(8)', context);
  const arrayBuffer = runInNewContext('new ArrayBuffer(16)', context);
  const dataView = runInNewContext('new DataView(new ArrayBuffer(16))', context);

  device.queue.writeBuffer(buffer, 0, typedArray, 2, 3);
  device.queue.writeBuffer(buffer, 0, typedArray, 2);
  device.queue.writeBuffer(buffer, 0, arrayBuffer, 2, 3);
  device.queue.writeBuffer(buffer, 0, dataView, 2);

  assert.deepEqual(
    [...context.__webgpuTestObserver.snapshot().writes].map(write => write.size),
    [6, 12, 3, 14]
  );
});

test('WebGPU observer materializes submitted iterables once', async () => {
  const { context, device, nativeSubmits } = await createObservedDevice();
  const commandBuffers = runInNewContext(
    '(function* () { globalThis.iterations += 1; yield "first"; yield "second"; })()',
    context
  );

  device.queue.submit(commandBuffers);

  assert.equal(context.iterations, 1);
  assert.deepEqual([...nativeSubmits[0]], ['first', 'second']);
  assert.equal(context.__webgpuTestObserver.snapshot().submits[0].count, 2);
});
