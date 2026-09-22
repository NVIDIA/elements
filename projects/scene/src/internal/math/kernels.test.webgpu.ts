// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { getWebGPUTestMode, WebGPUTestRunner, type WebGPUTestSession } from '@internals/vite/webgpu';
import { decodeSrgbChannel, SRGB_TO_LINEAR_WGSL } from '../color/transfer.js';
import { GRID_GRADIENT_WGSL, writeGridNormal } from './grid-gradient.js';
import { normalizeQuaternion, ROTATE_BY_QUATERNION_WGSL, rotateVectorByQuaternion } from './quaternion.js';
import type { Vec3 } from './types.js';

const bindings = /* wgsl */ `
@group(0) @binding(0) var<storage, read> input: array<f32>;
@group(0) @binding(1) var<storage, read_write> output: array<f32>;
`;

describe.runIf(getWebGPUTestMode() === 'check')('shared numeric shader kernels', () => {
  const runner = new WebGPUTestRunner({ projectRoot: resolve(import.meta.dirname, '../../..'), mode: 'check' });
  let session: WebGPUTestSession;

  beforeAll(async () => {
    await runner.open();
    session = await runner.load();
    await session.call('pause');
  });

  afterAll(async () => {
    await runner.close();
  });

  test('executes quaternion rotation against the CPU kernel', async () => {
    const count = 32;
    const inputs = new Float32Array(count * 8);
    const expected: number[] = [];
    for (let index = 0; index < count; index += 1) {
      const q = normalizeQuaternion([(index % 7) - 3, (index % 5) - 2, (index % 3) - 1, 1]);
      const vector: Vec3 = [index / 8, -2, index % 5];
      inputs.set([...q, ...vector, 0], index * 8);
      expected.push(...rotateVectorByQuaternion(vector, q), 0);
    }
    const code = /* wgsl */ `${bindings}
${ROTATE_BY_QUATERNION_WGSL}
@compute @workgroup_size(1) fn main(@builtin(global_invocation_id) id: vec3u) {
  let start = id.x * 8u;
  let q = vec4f(input[start], input[start + 1u], input[start + 2u], input[start + 3u]);
  let value = vec3f(input[start + 4u], input[start + 5u], input[start + 6u]);
  let rotated = rotateByQuaternion(q, value);
  output[id.x * 4u] = rotated.x;
  output[id.x * 4u + 1u] = rotated.y;
  output[id.x * 4u + 2u] = rotated.z;
}`;
    const actual = await executeKernel(session, { code, inputs, outputLength: count * 4, workgroups: count });
    expectCloseTo(actual, expected);
    expect(session.errors).toEqual([]);
  });

  test('executes grid differences at corners, boundaries, and interior samples', async () => {
    for (const [columns, rows] of [
      [2, 2],
      [5, 3],
      [4, 7]
    ] as const) {
      const values = Float32Array.from(
        { length: rows * columns },
        (_, index) => (index % columns) ** 2 / 4 - Math.floor(index / columns) ** 2 / 8
      );
      const spacing = 0.5;
      const expected = new Float32Array(values.length * 3);
      for (let index = 0; index < values.length; index += 1) {
        writeGridNormal({ values, columns, rows, spacing }, expected, Math.floor(index / columns), index % columns);
      }
      const code = /* wgsl */ `${bindings}
${GRID_GRADIENT_WGSL}
@compute @workgroup_size(1) fn main(@builtin(global_invocation_id) id: vec3u) {
  let gradient = nve_grid_gradient(&input, vec2u(${columns}u, ${rows}u), 0.5, id.x);
  let normal = normalize(vec3f(-gradient.x, -gradient.y, 1.0));
  output[id.x * 3u] = normal.x;
  output[id.x * 3u + 1u] = normal.y;
  output[id.x * 3u + 2u] = normal.z;
}`;
      const actual = await executeKernel(session, {
        code,
        inputs: values,
        outputLength: expected.length,
        workgroups: values.length
      });
      expectCloseTo(actual, Array.from(expected));
    }
    expect(session.errors).toEqual([]);
  });

  test('executes the shader sRGB transfer at the threshold and across the channel range', async () => {
    const inputs = new Float32Array([0, 0.04045, 0.040451, 0.01, 0.5, 1]);
    const code = /* wgsl */ `${bindings}
${SRGB_TO_LINEAR_WGSL}
@compute @workgroup_size(1) fn main(@builtin(global_invocation_id) id: vec3u) {
  output[id.x] = srgbToLinear(vec3f(input[id.x])).x;
}`;
    const actual = await executeKernel(session, {
      code,
      inputs,
      outputLength: inputs.length,
      workgroups: inputs.length
    });
    expectCloseTo(actual, Array.from(inputs, decodeSrgbChannel));
    expect(session.errors).toEqual([]);
  });
});

function expectCloseTo(actual: readonly number[], expected: readonly number[]): void {
  expect(actual).toHaveLength(expected.length);
  actual.forEach((value, index) => expect(value).toBeCloseTo(expected[index]!, 5));
}

async function executeKernel(
  session: WebGPUTestSession,
  options: {
    readonly code: string;
    readonly inputs: Float32Array;
    readonly outputLength: number;
    readonly workgroups: number;
  }
): Promise<number[]> {
  // eslint-disable-next-line max-statements -- A real dispatch and mapped readback share one device lifetime.
  return session.page.evaluate(
    async ({ code, inputs, outputLength, workgroups }) => {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) throw new Error('A WebGPU adapter is required for numeric kernel tests.');
      const device = await adapter.requestDevice();
      const data = new Float32Array(inputs);
      const source = device.createBuffer({ size: data.byteLength, usage: 0x88 });
      const output = device.createBuffer({ size: outputLength * 4, usage: 0x84 });
      const readback = device.createBuffer({ size: outputLength * 4, usage: 0x09 });
      try {
        device.queue.writeBuffer(source, 0, data);
        const pipeline = device.createComputePipeline({
          layout: 'auto',
          compute: { module: device.createShaderModule({ code }), entryPoint: 'main' }
        });
        const group = device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: { buffer: source } },
            { binding: 1, resource: { buffer: output } }
          ]
        });
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginComputePass();
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, group);
        pass.dispatchWorkgroups(workgroups);
        pass.end();
        encoder.copyBufferToBuffer(output, 0, readback, 0, outputLength * 4);
        device.queue.submit([encoder.finish()]);
        await readback.mapAsync(1);
        return Array.from(new Float32Array(readback.getMappedRange()));
      } finally {
        readback.destroy();
        output.destroy();
        source.destroy();
        device.destroy();
      }
    },
    { ...options, inputs: Array.from(options.inputs) }
  );
}
