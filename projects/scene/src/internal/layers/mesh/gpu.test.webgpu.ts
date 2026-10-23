// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import {
  assertNativeWebGPUAdapter,
  getWebGPUTestMode,
  WebGPUTestRunner,
  type WebGPUTestSession
} from '@internals/vite/webgpu';
import { processMeshGeometry } from './processing.js';

const mode = getWebGPUTestMode();
const runner = new WebGPUTestRunner({
  projectRoot: resolve(import.meta.dirname, '../../../..'),
  harnessPath: 'performance/mesh-preprocessing.html',
  mode
});
const measurements: unknown[] = [];
let boundary: unknown;

beforeAll(async () => {
  if (mode === 'check' || mode === 'measure') {
    boundary = await runner.inspectProductionBoundary({
      forbiddenTokens: ['__webgpuTestWorkload', 'mesh-preprocessing.html'],
      isForbiddenFile: file => /\.test\./u.test(file)
    });
    await runner.open();
  }
});
afterAll(async () => {
  if (measurements.length > 0)
    await runner.writeReport('mesh-preprocessing', {
      boundary,
      timingBoundary:
        'Publication to frame submission and queue completion. Includes animation-frame scheduling; these are not GPU timer measurements.',
      measurements
    });
  await runner.close();
});

interface GeometrySource {
  readonly positions: number[];
  readonly indices?: number[];
  readonly colors?: number[];
  readonly uvs?: number[];
}

async function expectGeometry(session: WebGPUTestSession): Promise<void> {
  expect(session.errors).toEqual([]);
  const source = await session.call<GeometrySource>('getSource');
  const reference = processMeshGeometry({
    positions: Float32Array.from(source.positions),
    indices: source.indices ? Uint32Array.from(source.indices) : null,
    colors: source.colors ? Float32Array.from(source.colors) : null,
    uvs: source.uvs ? Float32Array.from(source.uvs) : null,
    normals: null
  });
  if (!reference) throw new Error('The mesh reference is empty.');
  const expected = [reference.positions, reference.normals, reference.uploadUvs, reference.uploadColors];
  const comparison = await session.call<Array<{ length: number; maxError: number; nonfinite: number }>>(
    'compareGeometry',
    expected.map(values => Array.from(values))
  );
  for (let index = 0; index < expected.length; index++) {
    expect(comparison[index]?.length).toBe(expected[index]!.length);
    expect(comparison[index]?.nonfinite).toBe(0);
    expect(comparison[index]!.maxError, JSON.stringify({ index, comparison })).toBeLessThanOrEqual(
      index === 1 ? 0.00001 : 0
    );
  }
}

describe.runIf(mode === 'check')('GPU mesh preprocessing through the production renderer', () => {
  test('matches CPU attributes after initial preparation, partial edits, and full updates, with stable picking', async () => {
    const session = await runner.load({ profile: 'check-64', observeWebGPU: true });
    try {
      await expectGeometry(session);
      expect(await session.call('pick')).toEqual({ layer: true, kind: 'instance' });
      for (const fraction of [1 / 4_096, 0.01, 1]) {
        await session.resetObserver();
        const result = await session.call<{ uploadedBytes: number; allocatedBytes: number }>('update', fraction);
        expect(result.uploadedBytes).toBe(Math.max(1, Math.floor(4_096 * fraction)) * 12);
        expect(result.allocatedBytes).toBe(0);
        await expectGeometry(session);
      }
      expect(session.errors).toEqual([]);
    } finally {
      await session.close();
    }
  });

  test('matches winding, degenerate normals, UVs, colors, and nonindexed topology', async () => {
    const session = await runner.load({ profile: 'check-64' });
    try {
      const positions = [0, 0, 0, 1, 0, 0.5, 0, 1, 0, 0, 0, 0];
      const colors = [1, 0, 0, 1, 0, 1, 0, 0.5, 0, 0, 1, 0, 1, 1, 1, 1];
      const uvs = [0, 0, 1, 0, 0, 1, 1, 1];
      const indices = Array.from({ length: 18_000 }, (_, index) => [0, 1, 2, 0, 2, 1, 3, 3, 3][index % 9]!);
      await session.call('setGeometry', { positions, colors, uvs, indices });
      await expectGeometry(session);
      const colorUpdate = await session.call<UpdateMeasurement>('updateColor');
      expect(colorUpdate.uploadedBytes).toBe(16);
      expect(colorUpdate.allocatedBytes).toBe(0);
      await expectGeometry(session);
      const expanded = indices.flatMap(index => positions.slice(index * 3, index * 3 + 3));
      await session.call('setGeometry', { positions: expanded });
      await expectGeometry(session);
      expect(session.errors).toEqual([]);
    } finally {
      await session.close();
    }
  });

  test('preserves CPU precision for extreme and tiny coordinates', async () => {
    const session = await runner.load({ profile: 'check-64' });
    try {
      for (const scale of [3.4028234663852886e38, 1e-20]) {
        const positions = [-scale, 0, 0, scale, 0, scale, 0, scale, 0];
        const indices = Array.from({ length: 18_000 }, (_, index) => index % 3);
        await session.call('setGeometry', { positions, indices });
        await expectGeometry(session);
      }
      expect(session.errors).toEqual([]);
    } finally {
      await session.close();
    }
  });
});

interface UpdateMeasurement {
  readonly publicationToSubmitMs: number;
  readonly publicationToCompletionMs: number;
  readonly uploadedBytes: number;
  readonly allocatedBytes: number;
}

describe.runIf(mode === 'measure')('native mesh preprocessing comparison', () => {
  test.each([32, 64, 128, 256])('compares CPU and GPU preparation for a grid with side %s', async side => {
    await comparePreparation(side, 'indexed');
  });
  test.each([64, 256])('compares CPU and GPU preparation for a nonindexed grid with side %s', async side => {
    await comparePreparation(side, 'nonindexed');
  });
});

async function comparePreparation(side: number, topology: string): Promise<void> {
  for (let run = 0; run < 3; run++) {
    for (const backend of run % 2 === 0 ? ['cpu', 'gpu'] : ['gpu', 'cpu']) {
      const session = await runner.load({ profile: `${backend}-${side}-${topology}` });
      try {
        assertNativeWebGPUAdapter(session.adapter);
        const environment = await runner.environmentReport(session);
        const profile = await session.call<{ readonly vertices: number }>('getProfile');
        await measureUpdates(session, { backend, environment, profile, run, side, vertices: profile.vertices });
        expect(session.errors).toEqual([]);
      } finally {
        await session.close();
      }
    }
  }
}

async function measureUpdates(
  session: WebGPUTestSession,
  context: {
    readonly backend: string;
    readonly environment: unknown;
    readonly profile: unknown;
    readonly run: number;
    readonly side: number;
    readonly vertices: number;
  }
): Promise<void> {
  for (const fraction of [1 / context.vertices, 0.01, 1]) {
    for (let warmup = 0; warmup < 3; warmup++) await session.call('update', fraction);
    const samples: UpdateMeasurement[] = [];
    for (let sample = 0; sample < 15; sample++) samples.push(await session.call('update', fraction));
    measurements.push({ ...context, fraction, samples });
  }
}
