// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { resolve } from 'node:path';
import process from 'node:process';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import {
  WEBGPU_BUFFER_USAGE,
  WebGPUTestRunner,
  assertNativeWebGPUAdapter,
  collectWebGPUMemorySnapshot,
  delay,
  getCurrentWebGPUTextures,
  getWebGPUTestMode,
  getWebGPUWrites,
  median,
  positiveEnvironmentInteger,
  summarizeWebGPUResources,
  summarizeWebGPUWrites
} from '@internals/vite/webgpu';
import type {
  WebGPUObserverSnapshot,
  WebGPUProductionBoundary,
  WebGPUTestEnvironment,
  WebGPUTestSession
} from '@internals/vite/webgpu';

type ProfileName = 'required' | 'stress-dpr2' | 'stress-million-points' | 'stress-translucent';

interface WorkloadProfile {
  readonly dpr: number;
  readonly expectedDynamicBytesPerSecond: number;
  readonly lineVertexCount: number;
  readonly markerCommitBytes: number;
  readonly markerCommitCount: number;
  readonly markerCommitsPerSecond: number;
  readonly markerCount: number;
  readonly markerStride: number;
  readonly name: ProfileName;
  readonly pointCount: number;
  readonly pointStride: number;
  readonly pointUpdateBytes: number;
  readonly pointUpdatesPerSecond: number;
  readonly translucent: boolean;
  readonly triangleVertexCount: number;
}

interface LatencySummary {
  readonly available: boolean;
  readonly count: number;
  readonly missed: number;
  readonly missedPercent: number;
  readonly p50: number | null;
  readonly p95: number | null;
  readonly p99: number | null;
}

interface WorkloadMetrics {
  readonly elapsedMs: number;
  readonly expectedDynamicBytesPerSecond: number;
  readonly frameIntervals: LatencySummary;
  readonly initialization: { readonly readyMs: number; readonly workloadPreparationMs: number };
  readonly longTasks: {
    readonly available: boolean;
    readonly count: number;
    readonly maxMs: number;
    readonly totalMs: number;
  };
  readonly markerCommitLatency: LatencySummary;
  readonly pickLatency: LatencySummary;
  readonly pointUpdateLatency: LatencySummary;
  readonly rejectedPickCount: number;
  readonly updateCounts: { readonly marker: number; readonly pick: number; readonly point: number };
}

interface MeasurementRun {
  readonly budget: { readonly long: number; readonly p50: number; readonly p95: number };
  readonly checks: { readonly longFrames: boolean; readonly p50: boolean; readonly p95: boolean };
  readonly metrics: WorkloadMetrics;
  readonly run: number;
}

const mode = getWebGPUTestMode();
const profiles: readonly ProfileName[] = ['required', 'stress-dpr2', 'stress-million-points', 'stress-translucent'];
const oitUsage = 0x14;
const runner = new WebGPUTestRunner({ projectRoot: resolve(import.meta.dirname, '..') });
let boundary: WebGPUProductionBoundary;
let report: unknown;

beforeAll(async () => {
  boundary = await runner.inspectProductionBoundary({
    forbiddenSourcePatterns: [
      {
        message: 'imports the standalone performance example',
        pattern: /(?:performance\.examples|Elements\/Scene\/Performance)/u
      }
    ],
    forbiddenTokens: [
      'nve.scene.tick-performance',
      'getPerformanceSnapshot',
      'getSceneInstanceUploadCount',
      'getSceneMeshUploadSnapshot',
      'getScenePickPerformanceSnapshot',
      'latestPointLatencyMs',
      'reportValidationErrors',
      'Scene WebGPU validation error'
    ],
    isAllowedFile: isStandalonePerformanceExample,
    isForbiddenFile: file => /(?:performance|\.test\.bench)\./u.test(fileName(file))
  });
  await runner.open();
});

afterAll(async () => {
  try {
    if (report) {
      const reportPath = await runner.writeReport(mode, report);
      process.stdout.write(`Scene WebGPU ${mode} report: ${reportPath}\n`);
    }
  } finally {
    await runner.close();
  }
});

describe.runIf(mode === 'check')('Scene WebGPU resource budgets', () => {
  let environment: WebGPUTestEnvironment;
  let session: WebGPUTestSession;
  let workload: WorkloadProfile;
  const checks: Record<string, unknown> = {};

  beforeAll(async () => {
    session = await runner.load({ observeWebGPU: true, profile: 'required' });
    await session.call('pause');
    workload = await session.call<WorkloadProfile>('getProfile');
    environment = await runner.environmentReport(session);
  });

  afterAll(async () => {
    report = {
      boundary,
      checks,
      environment,
      measurementBoundary: 'external WebGPU call observer; timing budgets not measured',
      workload
    };
    await session.close();
  });

  test('skips picking work when no layer opts into interaction', async () => {
    await session.call('setInteraction', false);
    await session.resetObserver();
    await session.call('triggerAutomaticPointer');
    const snapshot = await session.snapshotObserver();
    checks.interactionDisabled = summarizeWebGPUResources(snapshot);

    expect(snapshot.renderPasses).toHaveLength(0);
    expect(snapshot.textureCopies).toHaveLength(0);
  });

  test('uses one scoped ID pass for opted-in interaction', async () => {
    await session.call('setInteraction', true);
    await session.resetObserver();
    await session.call('triggerAutomaticPointer');
    const snapshot = await session.snapshotObserver();
    await session.call('setInteraction', false);
    checks.interactionEnabled = summarizeWebGPUResources(snapshot);

    expect(snapshot.renderPasses.length).toBeGreaterThanOrEqual(1);
    expect(snapshot.textureCopies).toHaveLength(2);
    expect(snapshot.scissors).toContainEqual(expect.objectContaining({ height: 1, width: 1 }));
  });

  test('uploads one full point replacement', async () => {
    await session.resetObserver();
    await session.call('triggerPointUpdate');
    const writes = getWebGPUWrites(await session.snapshotObserver(), WEBGPU_BUFFER_USAGE.storage);
    checks.pointReplacementWrites = writes;

    expect(writes).toHaveLength(1);
    expect(writes[0]?.size).toBe(workload.pointCount * workload.pointStride);
  });

  test('uploads only the committed marker range', async () => {
    await session.resetObserver();
    await session.call('triggerMarkerCommit');
    const writes = getWebGPUWrites(await session.snapshotObserver(), WEBGPU_BUFFER_USAGE.storage);
    checks.markerRangeWrites = writes;

    expect(writes).toHaveLength(1);
    expect(writes[0]?.size).toBe(workload.markerCommitCount * workload.markerStride);
  });

  test('shares one cacheable GPU payload across scene fan-out', async () => {
    const snapshot = await session.call<WebGPUObserverSnapshot>('fanoutProbe');
    const expectedBytes = 12_345 * workload.pointStride;
    const buffers = snapshot.buffers.filter(
      buffer =>
        buffer.epoch === snapshot.epoch &&
        (buffer.usage & WEBGPU_BUFFER_USAGE.storage) !== 0 &&
        buffer.size === expectedBytes
    );
    const writes = getWebGPUWrites(snapshot, WEBGPU_BUFFER_USAGE.storage).filter(write => write.size === expectedBytes);
    checks.fanout = { buffers: buffers.length, writes: writes.length };

    expect(buffers).toHaveLength(1);
    expect(writes).toHaveLength(1);
  });

  test('keeps uniform traffic independent of record count', async () => {
    const small = summarizeWebGPUWrites(
      getWebGPUWrites(
        await session.call<WebGPUObserverSnapshot>('uniformTrafficProbe', 10),
        WEBGPU_BUFFER_USAGE.uniform,
        WEBGPU_BUFFER_USAGE.storage
      )
    );
    const large = summarizeWebGPUWrites(
      getWebGPUWrites(
        await session.call<WebGPUObserverSnapshot>('uniformTrafficProbe', 10_000),
        WEBGPU_BUFFER_USAGE.uniform,
        WEBGPU_BUFFER_USAGE.storage
      )
    );
    checks.uniformTraffic = { large, small };

    expect(large).toEqual(small);
  });

  test('allocates transparency targets only for translucent work', async () => {
    await session.call('setOpaque');
    await session.resetObserver();
    await session.call('resize', 1100, 620);
    const opaque = getCurrentWebGPUTextures(await session.snapshotObserver()).filter(
      texture => texture.usage === oitUsage
    );
    await session.resetObserver();
    await session.call('setTranslucent');
    const translucent = getCurrentWebGPUTextures(await session.snapshotObserver()).filter(
      texture => texture.usage === oitUsage
    );
    checks.opaqueOitTargets = opaque.length;
    checks.translucentOitTargets = translucent;

    expect(opaque).toHaveLength(0);
    expect(translucent).toHaveLength(2);
  });

  test('resizes and releases superseded render targets', async () => {
    await session.resetObserver();
    const canvas = await session.call<{ readonly height: number; readonly width: number }>('resize', 640, 360);
    const snapshot = await session.snapshotObserver();
    const targets = getCurrentWebGPUTextures(snapshot).filter(texture => texture.usage === oitUsage);
    checks.resizedOitTargets = targets;

    expect(targets).toHaveLength(2);
    expect(targets.every(texture => texture.width === canvas.width && texture.height === canvas.height)).toBe(true);
    expect(snapshot.destroys.filter(resource => resource.kind === 'texture').length).toBeGreaterThanOrEqual(3);
  });

  test('destroys observed resources and reports no page errors', async () => {
    await session.call('teardown');
    const snapshot = await session.snapshotObserver();
    checks.cleanup = summarizeWebGPUResources(snapshot);
    checks.sourceModes = {
      fanout: 'cacheable versioned source shared across two scenes',
      pointReplacement: 'raw mutable source with per-layer staging and GPU copy'
    };

    expect(snapshot.buffers.every(buffer => buffer.destroyed)).toBe(true);
    expect(snapshot.textures.every(texture => texture.destroyed)).toBe(true);
    expect(session.errors).toEqual([]);
  });
});

describe.runIf(mode === 'measure')('Scene native WebGPU performance', () => {
  const results: Array<{ profile: ProfileName; runMedians: Record<string, number | null>; runs: MeasurementRun[] }> =
    [];
  let environment: WebGPUTestEnvironment | undefined;
  const durationMs = positiveEnvironmentInteger('WEBGPU_TEST_DURATION_MS', 30_000);
  const runCount = positiveEnvironmentInteger('WEBGPU_TEST_RUNS', 3);
  const warmupMs = positiveEnvironmentInteger('WEBGPU_TEST_WARMUP_MS', 5_000);

  afterAll(() => {
    report = {
      boundary,
      environment,
      measurementAvailability: {
        frameCadence: true,
        gpuDuration: 'unavailable from the acceptance harness',
        longTasks: 'reported per run when PerformanceObserver supports longtask',
        memoryCategories: 'unavailable from the acceptance harness',
        presentationTiming: 'requestAnimationFrame interval and update-to-next-animation-frame proxies only'
      },
      provisionalReference: {
        label: 'Apple M5 Pro',
        matchesHost: environment?.host.cpu.includes('Apple M5 Pro') ?? false
      },
      results,
      runConfiguration: { durationMs, runCount, warmupMs }
    };
  });

  test.each(profiles)('%s meets its frame-time budget', async profile => {
    const runs: MeasurementRun[] = [];
    for (let run = 1; run <= runCount; run += 1) {
      const session = await runner.load({ deviceScaleFactor: profile === 'stress-dpr2' ? 2 : 1, profile });
      try {
        assertNativeWebGPUAdapter(session.adapter);
        environment ??= await runner.environmentReport(session);
        await delay(warmupMs);
        await session.call('startMeasurement');
        await delay(durationMs);
        const metrics = await session.call<WorkloadMetrics>('stopMeasurement');
        const budget = profile === 'required' ? { long: 33.3, p50: 17.5, p95: 20 } : { long: 66.7, p50: 34, p95: 40 };
        const checks = {
          longFrames: metrics.frameIntervals.available && metrics.frameIntervals.missedPercent < 1,
          p50:
            metrics.frameIntervals.available &&
            metrics.frameIntervals.p50 !== null &&
            metrics.frameIntervals.p50 <= budget.p50,
          p95:
            metrics.frameIntervals.available &&
            metrics.frameIntervals.p95 !== null &&
            metrics.frameIntervals.p95 <= budget.p95
        };
        runs.push({ budget, checks, metrics, run });

        expect(checks).toEqual({ longFrames: true, p50: true, p95: true });
        expect(session.errors).toEqual([]);
      } finally {
        await session.close();
      }
    }
    results.push({
      profile,
      runMedians: {
        p50: median(runs.map(run => run.metrics.frameIntervals.p50)),
        p95: median(runs.map(run => run.metrics.frameIntervals.p95)),
        p99: median(runs.map(run => run.metrics.frameIntervals.p99))
      },
      runs
    });
  });
});

describe.runIf(mode === 'diagnostic')('Scene WebGPU diagnostics', () => {
  test('captures an observed native workload trace', async () => {
    const session = await runner.load({ observeWebGPU: true, profile: 'required' });
    try {
      assertNativeWebGPUAdapter(session.adapter);
      await session.call('pause');
      await session.resetObserver();
      const tracePath = await runner.captureTrace(session, {
        run: async () => {
          await session.call('resume');
          await delay(positiveEnvironmentInteger('WEBGPU_TEST_TRACE_MS', 3_000));
          await session.call('pause');
        }
      });
      const calls = await session.snapshotObserver();
      const environment = await runner.environmentReport(session);
      await session.call('teardown');
      report = {
        boundary,
        environment,
        externalCalls: summarizeWebGPUResources(calls),
        gpuDuration: 'unavailable unless the captured DevTools trace exposes a GPU duration event',
        tracePath
      };

      expect(session.errors).toEqual([]);
    } finally {
      await session.close();
    }
  });
});

describe.runIf(mode === 'lifecycle')('Scene WebGPU lifecycle', () => {
  test('releases resources across reconnect and device recovery loops', async () => {
    const loops = positiveEnvironmentInteger('WEBGPU_TEST_LIFECYCLE_LOOPS', 20);
    const session = await runner.load({
      allowedConsoleErrors: ['[device-lost]'],
      observeWebGPU: true,
      profile: 'required'
    });
    const cdp = await session.createCDPSession();
    try {
      assertNativeWebGPUAdapter(session.adapter);
      await session.call('pause');
      await cdp.send('Performance.enable');
      await cdp.send('HeapProfiler.collectGarbage');
      const before = await collectWebGPUMemorySnapshot(cdp, session.page);
      await session.call('reconnectLoop', loops);
      await session.call('recoverDevice');
      const recoveredResources = await session.snapshotObserver();
      const firstDeviceId = Math.min(...recoveredResources.devices.map(device => device.deviceId));

      expect(recoveredResources.devices.length).toBeGreaterThan(1);
      expect(
        recoveredResources.buffers.filter(buffer => buffer.deviceId === firstDeviceId).every(buffer => buffer.destroyed)
      ).toBe(true);
      expect(
        recoveredResources.textures
          .filter(texture => texture.deviceId === firstDeviceId)
          .every(texture => texture.destroyed)
      ).toBe(true);

      await cdp.send('HeapProfiler.collectGarbage');
      const after = await collectWebGPUMemorySnapshot(cdp, session.page);
      await session.call('teardown');
      const resources = await session.snapshotObserver();
      const beforeHeap = before.cdp.JSHeapUsedSize;
      const afterHeap = after.cdp.JSHeapUsedSize;
      const heapBound = beforeHeap === undefined ? undefined : beforeHeap * 1.25 + 5 * 1024 * 1024;
      report = {
        boundary,
        environment: await runner.environmentReport(session),
        loops,
        memory: { after, before, cdpHeapBoundBytes: heapBound ?? 'unavailable' },
        recoveredDeviceResources: summarizeWebGPUResources(recoveredResources),
        resources: summarizeWebGPUResources(resources)
      };

      expect(resources.buffers.every(buffer => buffer.destroyed)).toBe(true);
      expect(resources.textures.every(texture => texture.destroyed)).toBe(true);
      if (afterHeap !== undefined && heapBound !== undefined) expect(afterHeap).toBeLessThanOrEqual(heapBound);
      expect(session.errors).toEqual([]);
    } finally {
      await cdp.detach().catch(() => undefined);
      await session.close();
    }
  });
});

function isStandalonePerformanceExample(file: string): boolean {
  return /^dist\/scene\/performance\.examples\.(?:js|js\.map|json)$/u.test(file);
}

function fileName(file: string): string {
  return file.split('/').at(-1) ?? file;
}
