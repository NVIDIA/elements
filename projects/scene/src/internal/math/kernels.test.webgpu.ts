// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { getWebGPUTestMode, WebGPUTestRunner, type WebGPUTestSession } from '@internals/vite/webgpu';
import { decodeSrgbChannel, SRGB_TO_LINEAR_WGSL } from '../color/transfer.js';
import { readRGBA8, UNPACK_RGBA8_WGSL } from '../color/rgba8.js';
import { GRID_GRADIENT_WGSL, writeGridNormal } from './grid-gradient.js';
import { normalizeQuaternion, ROTATE_BY_QUATERNION_WGSL, rotateVectorByQuaternion } from './quaternion.js';
import type { Vec3 } from './types.js';
import { POLYLINE_WGSL } from './polyline.js';
import type { Point2 } from './geometry-2d.js';

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

  test('normalizes polyline directions and suppresses repeated or sub-threshold segments', async () => {
    const fixtures = [
      { delta: [0, 0, 0], expected: [0, 0, 0, 0, 0] },
      { delta: [0.00099, 0, 0], expected: [0, 0, 0, 0, 0] },
      { delta: [0.00101, 0, 0], expected: [1, 0, 1, 0, 0] },
      { delta: [3, 4, 0], expected: [0.6, 0.8, 0.6, 0.8, 0] },
      { delta: [0, 0, 5], expected: [0, 0, 0, 0, 1] },
      { delta: [2, -3, 6], expected: [2 / Math.sqrt(13), -3 / Math.sqrt(13), 2 / 7, -3 / 7, 6 / 7] }
    ];
    const code = /* wgsl */ `${bindings}
${POLYLINE_WGSL}
@compute @workgroup_size(1) fn main(@builtin(global_invocation_id) id: vec3u) {
  let start = id.x * 3u;
  let delta = vec3f(input[start], input[start + 1u], input[start + 2u]);
  let direction2 = nve_polyline_direction2(vec2f(0.0), delta.xy);
  let direction3 = nve_polyline_direction3(vec3f(0.0), delta);
  let resultOffset = id.x * 5u;
  output[resultOffset] = direction2.x;
  output[resultOffset + 1u] = direction2.y;
  output[resultOffset + 2u] = direction3.x;
  output[resultOffset + 3u] = direction3.y;
  output[resultOffset + 4u] = direction3.z;
}`;
    const actual = await executeKernel(session, {
      code,
      inputs: Float32Array.from(fixtures.flatMap(fixture => fixture.delta)),
      outputLength: fixtures.length * 5,
      workgroups: fixtures.length
    });
    expectCloseTo(
      actual,
      fixtures.flatMap(fixture => fixture.expected)
    );
    expect(session.errors).toEqual([]);
  });

  test('constructs screen joins with ordered outer edges, unequal widths, and bounded miter tips', async () => {
    const fixtures = screenJoinFixtures();
    const code = /* wgsl */ `${bindings}
${POLYLINE_WGSL}
@compute @workgroup_size(1) fn main(@builtin(global_invocation_id) id: vec3u) {
  let start = (id.x / 6u) * 6u;
  let incoming = nve_polyline_direction2(vec2f(0.0), vec2f(input[start], input[start + 1u]));
  let outgoing = nve_polyline_direction2(vec2f(0.0), vec2f(input[start + 2u], input[start + 3u]));
  let join = nve_polyline_join2(incoming, outgoing, vec2f(input[start + 4u], input[start + 5u]), id.x % 6u);
  let resultOffset = id.x * 3u;
  output[resultOffset] = join.offset.x;
  output[resultOffset + 1u] = join.offset.y;
  output[resultOffset + 2u] = select(0.0, 1.0, join.valid);
}`;
    const actual = await executeKernel(session, {
      code,
      inputs: Float32Array.from(
        fixtures.flatMap(fixture => [...fixture.incoming, ...fixture.outgoing, ...fixture.halfWidths])
      ),
      outputLength: fixtures.length * 18,
      workgroups: fixtures.length * 6
    });
    for (const [index, fixture] of fixtures.entries()) {
      const expected = expectedJoinVertices(fixture.offsets, 2);
      expect(actual.slice(index * 18, index * 18 + 18), fixture.name).toEqual(
        expected.map(value => expect.closeTo(value, 5))
      );
    }
    expect(session.errors).toEqual([]);
  });

  test('constructs frame-local joins using adjacent normals and suppresses degenerate planes', async () => {
    const fixtures = worldJoinFixtures();
    const code = /* wgsl */ `${bindings}
${POLYLINE_WGSL}
@compute @workgroup_size(1) fn main(@builtin(global_invocation_id) id: vec3u) {
  let start = (id.x / 6u) * 14u;
  let incoming = nve_polyline_direction3(vec3f(0.0), vec3f(input[start], input[start + 1u], input[start + 2u]));
  let outgoing = nve_polyline_direction3(vec3f(0.0), vec3f(input[start + 3u], input[start + 4u], input[start + 5u]));
  let firstNormal = vec3f(input[start + 6u], input[start + 7u], input[start + 8u]);
  let secondNormal = vec3f(input[start + 9u], input[start + 10u], input[start + 11u]);
  let join = nve_polyline_join3(incoming, outgoing, firstNormal, secondNormal, vec2f(input[start + 12u], input[start + 13u]), id.x % 6u);
  let resultOffset = id.x * 4u;
  output[resultOffset] = join.offset.x;
  output[resultOffset + 1u] = join.offset.y;
  output[resultOffset + 2u] = join.offset.z;
  output[resultOffset + 3u] = select(0.0, 1.0, join.valid);
}`;
    const actual = await executeKernel(session, {
      code,
      inputs: Float32Array.from(
        fixtures.flatMap(fixture => [
          ...fixture.incoming,
          ...fixture.outgoing,
          ...fixture.firstNormal,
          ...fixture.secondNormal,
          ...fixture.halfWidths
        ])
      ),
      outputLength: fixtures.length * 24,
      workgroups: fixtures.length * 6
    });
    for (const [index, fixture] of fixtures.entries()) {
      const expected = expectedJoinVertices(fixture.offsets, 3);
      expect(actual.slice(index * 24, index * 24 + 24), fixture.name).toEqual(
        expected.map(value => expect.closeTo(value, 5))
      );
    }
    expect(session.errors).toEqual([]);
  });

  test('keeps the miter limit inclusive and defines bevel tips for cancelling side vectors', async () => {
    const fixtures = [
      {
        first: [1, 0],
        second: [-0.875, Math.sqrt(15) / 8],
        expected: [
          [1, Math.sqrt(15)],
          [1, 0],
          [-0.875, Math.sqrt(15) / 8]
        ]
      },
      {
        first: [0, 1],
        second: [0, -1],
        expected: [
          [0, 0],
          [0, 1],
          [0, -1]
        ]
      }
    ];
    const code = /* wgsl */ `${bindings}
${POLYLINE_WGSL}
@compute @workgroup_size(1) fn main(@builtin(global_invocation_id) id: vec3u) {
  let start = (id.x / 3u) * 4u;
  let first = vec2f(input[start], input[start + 1u]);
  let second = vec2f(input[start + 2u], input[start + 3u]);
  let offset2 = nve_polyline_offset2(first, second, vec2f(1.0), 1.0, id.x % 3u);
  let offset3 = nve_polyline_offset3(vec3f(first, 0.0), vec3f(second, 0.0), vec2f(1.0), 1.0, id.x % 3u);
  let resultOffset = id.x * 5u;
  output[resultOffset] = offset2.x;
  output[resultOffset + 1u] = offset2.y;
  output[resultOffset + 2u] = offset3.x;
  output[resultOffset + 3u] = offset3.y;
  output[resultOffset + 4u] = offset3.z;
}`;
    const actual = await executeKernel(session, {
      code,
      inputs: Float32Array.from(fixtures.flatMap(fixture => [...fixture.first, ...fixture.second])),
      outputLength: fixtures.length * 15,
      workgroups: fixtures.length * 3
    });
    expectCloseTo(
      actual,
      fixtures.flatMap(fixture => fixture.expected.flatMap(([x, y]) => [x!, y!, x!, y!, 0]))
    );
    expect(session.errors).toEqual([]);
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

  test('decodes packed RGBA8 words against the CPU kernel across every byte value and both word endpoints', async () => {
    const count = 258;
    const bytes = new Uint8Array(count * 4);
    for (let byte = 0; byte < 256; byte += 1) {
      bytes.set([byte, 255 - byte, (byte * 17) % 256, (byte * 29) % 256], byte * 4);
    }
    bytes.fill(255, (count - 1) * 4);
    const view = new DataView(bytes.buffer);
    const expected = Array.from({ length: count }, (_, index) => readRGBA8(view, index * 4)).flat();
    const code = /* wgsl */ `${bindings}
${UNPACK_RGBA8_WGSL}
@compute @workgroup_size(1) fn main(@builtin(global_invocation_id) id: vec3u) {
  let start = id.x * 4u;
  let word = u32(input[start]) | (u32(input[start + 1u]) << 8u) |
    (u32(input[start + 2u]) << 16u) | (u32(input[start + 3u]) << 24u);
  let color = nve_unpack_unorm8x4(word);
  output[start] = color.r;
  output[start + 1u] = color.g;
  output[start + 2u] = color.b;
  output[start + 3u] = color.a;
}`;
    const actual = await executeKernel(session, {
      code,
      inputs: Float32Array.from(bytes),
      outputLength: bytes.length,
      workgroups: count
    });
    expectCloseTo(actual, expected);
    expect(session.errors).toEqual([]);
  });
});

interface ScreenJoinFixture {
  readonly name: string;
  readonly incoming: Point2;
  readonly outgoing: Point2;
  readonly halfWidths: Point2;
  readonly offsets?: readonly Point2[];
}

function screenJoinFixtures(): readonly ScreenJoinFixture[] {
  const nearLimit = Math.sqrt(3);
  const bevelAngle = (160 * Math.PI) / 180;
  return [
    {
      name: 'left turn',
      incoming: [1, 0],
      outgoing: [0, 1],
      halfWidths: [1, 1],
      offsets: [
        [1, -1],
        [0, -1],
        [1, 0]
      ]
    },
    {
      name: 'right turn',
      incoming: [1, 0],
      outgoing: [0, -1],
      halfWidths: [1, 1],
      offsets: [
        [1, 1],
        [0, 1],
        [1, 0]
      ]
    },
    {
      name: 'rotated turn',
      incoming: [0, 1],
      outgoing: [-1, 0],
      halfWidths: [1, 1],
      offsets: [
        [1, 1],
        [1, 0],
        [0, 1]
      ]
    },
    {
      name: 'unequal widths use the average at the tip',
      incoming: [1, 0],
      outgoing: [0, 1],
      halfWidths: [1, 3],
      offsets: [
        [2, -2],
        [0, -1],
        [3, 0]
      ]
    },
    {
      name: 'miter below the limit',
      incoming: [1, 0],
      outgoing: [-nearLimit / 2, 0.5],
      halfWidths: [1, 1],
      offsets: [
        [2 + nearLimit, -1],
        [0, -1],
        [0.5, nearLimit / 2]
      ]
    },
    {
      name: 'unequal widths use the larger width for the limit',
      incoming: [1, 0],
      outgoing: [-nearLimit / 2, 0.5],
      halfWidths: [1, 3],
      offsets: [
        [2 * (2 + nearLimit), -2],
        [0, -1],
        [1.5, (3 * nearLimit) / 2]
      ]
    },
    {
      name: 'over-limit miter forms a bevel',
      incoming: [1, 0],
      outgoing: [Math.cos(bevelAngle), Math.sin(bevelAngle)],
      halfWidths: [1, 1],
      offsets: [
        [0, 0],
        [0, -1],
        [Math.sin(bevelAngle), -Math.cos(bevelAngle)]
      ]
    },
    {
      name: 'nearly reversing turn forms a bevel',
      incoming: [1, 0],
      outgoing: [-1, 0.000002],
      halfWidths: [1, 1],
      offsets: [
        [0, 0],
        [0, -1],
        [0.000002, 1]
      ]
    },
    {
      name: 'small turn above the tolerance',
      incoming: [1, 0],
      outgoing: [1, 0.000002],
      halfWidths: [1, 1],
      offsets: [
        [0.000001, -1],
        [0, -1],
        [0.000002, -1]
      ]
    },
    { name: 'straight', incoming: [1, 0], outgoing: [1, 0], halfWidths: [1, 1] },
    { name: 'reversal', incoming: [1, 0], outgoing: [-1, 0], halfWidths: [1, 1] },
    { name: 'repeated previous point', incoming: [0, 0], outgoing: [0, 1], halfWidths: [1, 1] },
    { name: 'repeated next point', incoming: [1, 0], outgoing: [0, 0], halfWidths: [1, 1] },
    { name: 'short segment', incoming: [0.00099, 0], outgoing: [0, 1], halfWidths: [1, 1] },
    { name: 'nearly straight', incoming: [1, 0], outgoing: [1, 0.0000005], halfWidths: [1, 1] }
  ];
}

interface WorldJoinFixture {
  readonly name: string;
  readonly incoming: Readonly<Vec3>;
  readonly outgoing: Readonly<Vec3>;
  readonly firstNormal: Readonly<Vec3>;
  readonly secondNormal: Readonly<Vec3>;
  readonly halfWidths: Point2;
  readonly offsets?: readonly Readonly<Vec3>[];
}

function worldJoinFixtures(): readonly WorldJoinFixture[] {
  const planar: WorldJoinFixture[] = screenJoinFixtures().map(fixture => ({
    ...fixture,
    incoming: [...fixture.incoming, 0],
    outgoing: [...fixture.outgoing, 0],
    firstNormal: [0, 0, 1],
    secondNormal: [0, 0, 1],
    offsets: fixture.offsets?.map(([x, y]) => [x, y, 0])
  }));
  const rootHalf = Math.SQRT1_2;
  return [
    ...planar,
    {
      name: 'xz plane',
      incoming: [1, 0, 0],
      outgoing: [0, 0, 1],
      firstNormal: [0, 1, 0],
      secondNormal: [0, 1, 0],
      halfWidths: [1, 1],
      offsets: [
        [1, 0, -1],
        [0, 0, -1],
        [1, 0, 0]
      ]
    },
    {
      name: 'normal scale preserves the join',
      incoming: [1, 0, 0],
      outgoing: [0, 1, 0],
      firstNormal: [0, 0, 2],
      secondNormal: [0, 0, 5],
      halfWidths: [1, 1],
      offsets: [
        [1, -1, 0],
        [0, -1, 0],
        [1, 0, 0]
      ]
    },
    {
      name: 'reversed normals preserve the join',
      incoming: [1, 0, 0],
      outgoing: [0, 1, 0],
      firstNormal: [0, 0, -1],
      secondNormal: [0, 0, -1],
      halfWidths: [1, 1],
      offsets: [
        [1, -1, 0],
        [0, -1, 0],
        [1, 0, 0]
      ]
    },
    {
      name: 'different adjacent normals',
      incoming: [1, 0, 0],
      outgoing: [0, 1, 0],
      firstNormal: [0, 0, 1],
      secondNormal: [1, 0, 1],
      halfWidths: [1, 1],
      offsets: [
        [rootHalf, -1, -rootHalf],
        [0, -1, 0],
        [rootHalf, 0, -rootHalf]
      ]
    },
    {
      name: 'cancelling normals use the second plane normal',
      incoming: [1, 0, 0],
      outgoing: [0, 1, 0],
      firstNormal: [0, 0, 1],
      secondNormal: [0, 0, -1],
      halfWidths: [1, 1],
      offsets: [
        [1, 1, 0],
        [0, 1, 0],
        [1, 0, 0]
      ]
    },
    {
      name: 'incoming segment parallel to its normal',
      incoming: [1, 0, 0],
      outgoing: [0, 1, 0],
      firstNormal: [1, 0, 0],
      secondNormal: [0, 0, 1],
      halfWidths: [1, 1]
    },
    {
      name: 'outgoing segment parallel to its normal',
      incoming: [1, 0, 0],
      outgoing: [0, 1, 0],
      firstNormal: [0, 0, 1],
      secondNormal: [0, 1, 0],
      halfWidths: [1, 1]
    },
    {
      name: 'small side vector',
      incoming: [1, 0, 0],
      outgoing: [0, 1, 0],
      firstNormal: [0, 0, 0.0005],
      secondNormal: [0, 0, 1],
      halfWidths: [1, 1]
    }
  ];
}

function expectedJoinVertices(offsets: readonly (readonly number[])[] | undefined, dimension: 2 | 3): number[] {
  if (!offsets) return Array<number>(6 * (dimension + 1)).fill(0);
  const miter = offsets[0]!.some(value => value !== 0);
  const inner = miter ? [Array<number>(dimension).fill(0), offsets[2], offsets[1]] : [undefined, undefined, undefined];
  return [...offsets, ...inner].flatMap(offset => (offset ? [...offset, 1] : Array<number>(dimension + 1).fill(0)));
}

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
        const module = device.createShaderModule({ code });
        const compilation = await module.getCompilationInfo();
        const errors = compilation.messages.filter(message => message.type === 'error');
        if (errors.length > 0) throw new Error(errors.map(message => message.message).join('\n'));
        const pipeline = device.createComputePipeline({
          layout: 'auto',
          compute: { module, entryPoint: 'main' }
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
