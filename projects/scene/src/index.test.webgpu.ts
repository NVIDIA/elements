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

type ProfileName =
  | 'required'
  | 'stress-dpr2'
  | 'stress-million-points'
  | 'stress-translucent'
  | 'shader-coverage'
  | 'partitioned-storage'
  | 'mesh-updates'
  | 'labels-10k'
  | 'camera-composition'
  | 'model-edits'
  | 'layer-tracking'
  | 'lazy-recovery';

interface WorkloadProfile {
  readonly dpr: number;
  readonly expectedDynamicBytesPerSecond: number | null;
  readonly lineVertexCount: number;
  readonly mode: string;
  readonly markerPublishBytes: number;
  readonly markerPublishCount: number;
  readonly markerPublishesPerSecond: number;
  readonly markerCount: number;
  readonly markerStride: number;
  readonly name: ProfileName;
  readonly pointCount: number;
  readonly pointStride: number;
  readonly pointUpdateBytes: number;
  readonly pointUpdatesPerSecond: number;
  readonly translucent: boolean;
  readonly triangleVertexCount: number;
  readonly operations: readonly string[];
}

type ProfileProbeResult =
  | { readonly profile: 'shader-coverage'; readonly snapshot: WebGPUObserverSnapshot }
  | {
      readonly expectedPartialWriteBytes: number;
      readonly partitionEvidenceAvailable: false;
      readonly profile: 'partitioned-storage';
      readonly snapshot: WebGPUObserverSnapshot;
    }
  | {
      readonly expectedGeometryWriteBytes: readonly number[];
      readonly expectedInstanceWriteBytes: number;
      readonly profile: 'mesh-updates';
      readonly snapshot: WebGPUObserverSnapshot;
    }
  | {
      readonly expectedNumericWriteBytes: number;
      readonly profile: 'labels-10k';
      readonly snapshot: WebGPUObserverSnapshot;
    }
  | {
      readonly after: { readonly framePosition: readonly number[]; readonly orbitTheta: number };
      readonly before: { readonly framePosition: readonly number[]; readonly orbitTheta: number };
      readonly cameraCount: number;
      readonly followFrame: string;
      readonly profile: 'camera-composition';
      readonly snapshot: WebGPUObserverSnapshot;
    }
  | {
      readonly bulkPartCount: number;
      readonly declarativeChildPresent: boolean;
      readonly declarativeChildPresentDuringBulk: boolean;
      readonly declarativePosition: readonly number[];
      readonly profile: 'model-edits';
      readonly snapshot: WebGPUObserverSnapshot;
    }
  | {
      readonly layerCount: number;
      readonly profile: 'layer-tracking';
      readonly reconnected: boolean;
      readonly snapshot: WebGPUObserverSnapshot;
      readonly wasConnected: boolean;
    }
  | {
      readonly profile: 'lazy-recovery';
      readonly sceneConnected: boolean;
      readonly snapshot: WebGPUObserverSnapshot;
    };

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
  readonly expectedDynamicBytesPerSecond: number | null;
  readonly frameIntervals: LatencySummary;
  readonly initialization: { readonly readyMs: number; readonly workloadPreparationMs: number };
  readonly longTasks: {
    readonly available: boolean;
    readonly count: number;
    readonly maxMs: number;
    readonly totalMs: number;
  };
  readonly markerPublishLatency: LatencySummary;
  readonly pickLatency: LatencySummary;
  readonly pointUpdateLatency: LatencySummary;
  readonly profileOperationEvidence: Record<string, string>;
  readonly profileOperations: Record<string, { readonly count: number; readonly latency: LatencySummary }>;
  readonly rejectedPickCount: number;
  readonly updateCounts: { readonly marker: number; readonly pick: number; readonly point: number };
}

interface MeasurementRun {
  readonly budget: { readonly long: number; readonly p50: number; readonly p95: number };
  readonly checks: { readonly longFrames: boolean; readonly p50: boolean; readonly p95: boolean };
  readonly metrics: WorkloadMetrics;
  readonly run: number;
}

interface MeasurementProfileResult {
  readonly failure?: string;
  readonly profile: ProfileName;
  readonly runMedians: Record<string, number | null>;
  readonly runs: MeasurementRun[];
}

interface MeasuredWorkloadRun {
  readonly errors: readonly string[];
  readonly run: MeasurementRun;
  readonly workload: WorkloadProfile;
}

const mode = getWebGPUTestMode();
const profiles: readonly ProfileName[] = [
  'required',
  'stress-dpr2',
  'stress-million-points',
  'stress-translucent',
  'shader-coverage',
  'partitioned-storage',
  'mesh-updates',
  'labels-10k',
  'camera-composition',
  'model-edits',
  'layer-tracking',
  'lazy-recovery'
];
const matrixProfiles: readonly ProfileName[] = profiles.slice(4);
const oitUsage = 0x14;
const baselineHarness = process.env.WEBGPU_TEST_BASELINE === '1';
const legacyBaselineHookTokens: readonly string[] = [
  'nve.scene.pick-driver.set',
  'nve.scene.label-testing',
  'nve.scene.label-capture.reset'
];
const productionBoundaryForbiddenTokens: string[] = [
  'nve.scene.tick-performance',
  'getPerformanceSnapshot',
  'getSceneInstanceUploadCount',
  'getSceneMeshUploadSnapshot',
  'getScenePickPerformanceSnapshot',
  'latestPointLatencyMs',
  ...legacyBaselineHookTokens,
  'reportValidationErrors',
  'Scene WebGPU validation error'
];
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
    forbiddenTokens: boundaryForbiddenTokens(baselineHarness),
    isAllowedFile: isStandalonePerformanceExample,
    isForbiddenFile: file => /(?:performance|\.test\.bench)\./u.test(fileName(file))
  });
  await runner.open();
});

test('keeps every production-boundary token outside baseline mode', () => {
  expect(boundaryForbiddenTokens(false)).toEqual(productionBoundaryForbiddenTokens);
  expect(boundaryForbiddenTokens(true)).toEqual(
    productionBoundaryForbiddenTokens.filter(token => !legacyBaselineHookTokens.includes(token))
  );
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

  test('uploads only the published marker range', async () => {
    await session.resetObserver();
    await session.call('triggerMarkerPublish');
    const writes = getWebGPUWrites(await session.snapshotObserver(), WEBGPU_BUFFER_USAGE.storage);
    checks.markerRangeWrites = writes;

    expect(writes).toHaveLength(1);
    expect(writes[0]?.size).toBe(workload.markerPublishCount * workload.markerStride);
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

  test('keeps feature identity entirely outside WebGPU resources and frame work', async () => {
    const snapshots = await session.call<{
      readonly assigned: WebGPUObserverSnapshot;
      readonly baseline: WebGPUObserverSnapshot;
      readonly cleared: WebGPUObserverSnapshot;
    }>('featureIdentityProbe');
    const baseline = featureIdentityGPUActivity(snapshots.baseline);
    const assigned = featureIdentityGPUActivity(snapshots.assigned);
    const cleared = featureIdentityGPUActivity(snapshots.cleared);
    checks.featureIdentity = { assigned, baseline, cleared };

    expect(assigned).toEqual(baseline);
    expect(cleared).toEqual(baseline);
    expect(assigned.storageWrites).toBe(0);
    expect(assigned.createdBuffers).toBe(0);
    expect(assigned.createdTextures).toBe(0);
    expect(assigned.createdShaders).toBe(0);
    expect(assigned.createdPipelines).toBe(0);
  });

  test('creates explicit color and ID shader variants through browser WebGPU', async () => {
    const snapshot = await session.call<WebGPUObserverSnapshot>('shaderCoverageProbe');
    checks.shaderCoverage = summarizeWebGPUResources(snapshot);

    expect(snapshot.externalImageCopies).toHaveLength(1);
    expect(snapshot.draws.some(draw => draw.method === 'drawIndexedIndirect')).toBe(true);
    expect(snapshot.scissors).toContainEqual(expect.objectContaining({ height: 1, width: 1 }));
    expectShaderVariant(
      snapshot,
      'direct marker color',
      source =>
        source.includes('nve_load_marker(input.instanceIndex)') &&
        source.includes('marker.color.r') &&
        source.includes('fragmentOit') &&
        !source.includes('struct PickOutput')
    );
    expectShaderVariant(
      snapshot,
      'compacted marker color',
      source => source.includes('nve_compact_indices[input.instanceIndex]') && source.includes('fragmentOit')
    );
    expectShaderVariant(
      snapshot,
      'marker outline color',
      source =>
        source.includes('marker.outlineColor.r') &&
        source.includes('fragmentOit') &&
        !source.includes('struct PickOutput')
    );
    expectShaderVariant(
      snapshot,
      'point color',
      source => source.includes('fn pointOffset') && !source.includes('struct PickOutput')
    );
    expectShaderVariant(
      snapshot,
      'triangle color',
      source =>
        source.includes('nve_load_stream_vertex(index)') &&
        !source.includes('fn pointOffset') &&
        !source.includes('struct PickOutput')
    );
    expectShaderVariant(
      snapshot,
      'connected line color',
      source => source.includes('struct LineOutput') && !source.includes('struct PickOutput')
    );
    expectShaderVariant(
      snapshot,
      'textured mesh color',
      source => source.includes('var textureSampler: sampler') && !source.includes('struct PickOutput')
    );
    expectShaderVariant(
      snapshot,
      'marker ID/depth',
      source => source.includes('marker.color.r') && source.includes('struct PickOutput')
    );
    expectShaderVariant(
      snapshot,
      'outline ID/depth',
      source => source.includes('marker.outlineColor.r') && source.includes('struct PickOutput')
    );
    expectShaderVariant(
      snapshot,
      'point ID/depth',
      source => source.includes('fn pointOffset') && source.includes('struct PickOutput')
    );
    expectShaderVariant(
      snapshot,
      'triangle ID/depth',
      source =>
        source.includes('nve_load_stream_vertex(index)') &&
        !source.includes('fn pointOffset') &&
        source.includes('struct PickOutput')
    );
    expectShaderVariant(
      snapshot,
      'connected line ID/depth',
      source => source.includes('struct LineOutput') && source.includes('struct PickOutput')
    );
    expectShaderVariant(
      snapshot,
      'textured mesh ID/depth',
      source => source.includes('var textureSampler: sampler') && source.includes('struct PickOutput')
    );
    expect(session.errors).toEqual([]);
  });

  test.each(matrixProfiles)('observes the actual %s workload operation', async profileName => {
    const matrixSession = await runner.load({ observeWebGPU: true, profile: profileName });
    try {
      await matrixSession.call('pause');
      const matrixProfile = await matrixSession.call<WorkloadProfile>('getProfile');
      const probe = await matrixSession.call<ProfileProbeResult>('runProfileProbe');
      checks[`profile:${profileName}`] = { profile: matrixProfile, probe };
      expect(matrixProfile.name).toBe(profileName);
      expect(probe.profile).toBe(profileName);
      expect(matrixProfile.operations.length).toBeGreaterThan(0);
      expectMatrixProfileProbe(probe);
      expect(matrixSession.errors).toEqual([]);
    } finally {
      await matrixSession.call('teardown');
      await matrixSession.close();
    }
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
  const results: MeasurementProfileResult[] = [];
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

  async function measureWorkloadRun(options: {
    readonly durationMs: number;
    readonly profile: ProfileName;
    readonly run: number;
    readonly warmupMs: number;
  }): Promise<MeasuredWorkloadRun> {
    const session = await runner.load({
      deviceScaleFactor: options.profile === 'stress-dpr2' ? 2 : 1,
      profile: options.profile
    });
    try {
      assertNativeWebGPUAdapter(session.adapter);
      environment ??= await runner.environmentReport(session);
      const workload = await session.call<WorkloadProfile>('getProfile');
      await delay(options.warmupMs);
      await session.call('startMeasurement');
      await delay(options.durationMs);
      const metrics = await session.call<WorkloadMetrics>('stopMeasurement');
      const budget = frameBudgetFor(options.profile);
      return {
        errors: [...session.errors],
        run: { budget, checks: frameBudgetChecks(metrics, budget), metrics, run: options.run },
        workload
      };
    } finally {
      await session.close();
    }
  }

  test.each(profiles)('%s meets its frame-time budget', async profile => {
    const runs: MeasurementRun[] = [];
    let failure: string | undefined;
    try {
      for (let run = 1; run <= runCount; run += 1) {
        const measured = await measureWorkloadRun({ durationMs, profile, run, warmupMs });
        runs.push(measured.run);

        expect(measured.run.checks).toEqual({ longFrames: true, p50: true, p95: true });
        expectMeasuredOperations(measured.run.metrics, profile, measured.workload);
        expectTruthfulMatrixUpdateRates(measured.run.metrics, profile, measured.workload);
        expect(measured.errors).toEqual([]);
      }
    } catch (error) {
      failure = describeFailure(error);
      throw error;
    } finally {
      results.push(summarizeMeasurementProfile(profile, runs, failure));
    }
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

function boundaryForbiddenTokens(baseline: boolean): string[] {
  return baseline
    ? productionBoundaryForbiddenTokens.filter(token => !legacyBaselineHookTokens.includes(token))
    : productionBoundaryForbiddenTokens;
}

function fileName(file: string): string {
  return file.split('/').at(-1) ?? file;
}

function matrixProfileOperationCounts(metrics: WorkloadMetrics, workload: WorkloadProfile): number[] {
  return workload.operations.map(operation => metrics.profileOperations[operation]?.count ?? 0);
}

function expectMeasuredOperations(metrics: WorkloadMetrics, profile: ProfileName, workload: WorkloadProfile): void {
  if (!matrixProfiles.includes(profile)) return;
  expect(
    matrixProfileOperationCounts(metrics, workload).every(count => count > 0),
    `Expected ${profile} to execute each named operation during clean timing.`
  ).toBe(true);
}

function expectTruthfulMatrixUpdateRates(
  metrics: WorkloadMetrics,
  profile: ProfileName,
  workload: WorkloadProfile
): void {
  if (!matrixProfiles.includes(profile)) return;
  expect(workload.expectedDynamicBytesPerSecond).toBeNull();
  expect(metrics.expectedDynamicBytesPerSecond).toBeNull();
  expect(workload.markerPublishBytes).toBe(0);
  expect(workload.markerPublishesPerSecond).toBe(0);
  expect(workload.pointUpdateBytes).toBe(0);
  expect(workload.pointUpdatesPerSecond).toBe(0);
}

function frameBudgetFor(profile: ProfileName): MeasurementRun['budget'] {
  return profile === 'required' ? { long: 33.3, p50: 17.5, p95: 20 } : { long: 66.7, p50: 34, p95: 40 };
}

function frameBudgetChecks(metrics: WorkloadMetrics, budget: MeasurementRun['budget']): MeasurementRun['checks'] {
  const frameIntervals = metrics.frameIntervals;
  return {
    longFrames: frameIntervals.available && frameIntervals.missedPercent < 1,
    p50: frameIntervals.available && frameIntervals.p50 !== null && frameIntervals.p50 <= budget.p50,
    p95: frameIntervals.available && frameIntervals.p95 !== null && frameIntervals.p95 <= budget.p95
  };
}

function summarizeMeasurementProfile(
  profile: ProfileName,
  runs: readonly MeasurementRun[],
  failure: string | undefined
): MeasurementProfileResult {
  return {
    ...(failure ? { failure } : {}),
    profile,
    runMedians: {
      p50: median(runs.map(run => run.metrics.frameIntervals.p50)),
      p95: median(runs.map(run => run.metrics.frameIntervals.p95)),
      p99: median(runs.map(run => run.metrics.frameIntervals.p99))
    },
    runs: [...runs]
  };
}

function describeFailure(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}

function expectMatrixProfileProbe(probe: ProfileProbeResult): void {
  expect(probe.snapshot.renderPasses.length).toBeGreaterThan(0);
  expect(probe.snapshot.draws.length).toBeGreaterThan(0);

  switch (probe.profile) {
    case 'shader-coverage':
      expect(probe.snapshot.shaderModules.length).toBeGreaterThan(0);
      expect(probe.snapshot.externalImageCopies.length).toBeGreaterThan(0);
      return;
    case 'partitioned-storage': {
      const writes = getWebGPUWrites(probe.snapshot, WEBGPU_BUFFER_USAGE.storage);
      expect(probe.partitionEvidenceAvailable).toBe(false);
      expect(writes.some(write => write.size === probe.expectedPartialWriteBytes)).toBe(true);
      return;
    }
    case 'mesh-updates': {
      const writes = getWebGPUWrites(probe.snapshot, WEBGPU_BUFFER_USAGE.storage);
      expect(writes.some(write => write.size === probe.expectedInstanceWriteBytes)).toBe(true);
      expect(
        probe.expectedGeometryWriteBytes.every(size => probe.snapshot.writes.some(write => write.size === size))
      ).toBe(true);
      expect(probe.snapshot.externalImageCopies.length).toBeGreaterThan(0);
      return;
    }
    case 'labels-10k': {
      const writes = getWebGPUWrites(probe.snapshot, WEBGPU_BUFFER_USAGE.storage);
      expect(writes.some(write => write.size === probe.expectedNumericWriteBytes)).toBe(true);
      return;
    }
    case 'camera-composition':
      expect(probe.cameraCount).toBe(2);
      expect(probe.followFrame).toBe('workload-target');
      expect(probe.after.orbitTheta).not.toBe(probe.before.orbitTheta);
      expect(probe.after.framePosition).not.toEqual(probe.before.framePosition);
      return;
    case 'model-edits':
      expect(probe.declarativePosition).toEqual([1, 0, 0]);
      expect(probe.declarativeChildPresent).toBe(true);
      expect(probe.declarativeChildPresentDuringBulk).toBe(false);
      expect(probe.bulkPartCount).toBe(1);
      return;
    case 'layer-tracking':
      expect(probe.wasConnected).toBe(true);
      expect(probe.reconnected).toBe(true);
      expect(probe.layerCount).toBeGreaterThanOrEqual(12);
      return;
    case 'lazy-recovery':
      expect(probe.sceneConnected).toBe(true);
  }
}

function expectShaderVariant(
  snapshot: WebGPUObserverSnapshot,
  name: string,
  matches: (source: string) => boolean
): void {
  const module = snapshot.shaderModules.find(candidate => matches(candidate.code));
  expect(module, `Expected ${name} shader module`).toBeDefined();
  const entries = snapshot.renderPipelines
    .filter(pipeline => pipeline.shaderModuleId === module?.id)
    .flatMap(pipeline => [pipeline.vertexEntryPoint, pipeline.fragmentEntryPoint]);
  expect(entries, `Expected ${name} pipeline creation`).toContain('vertexMain');
  expect(entries, `Expected ${name} pipeline creation`).toContain('fragmentMain');
}

function featureIdentityGPUActivity(snapshot: WebGPUObserverSnapshot) {
  const inEpoch = <Entry extends { readonly epoch: number }>(entry: Entry) => entry.epoch === snapshot.epoch;
  return {
    createdBuffers: snapshot.buffers.filter(inEpoch).length,
    createdPipelines: snapshot.renderPipelines.filter(inEpoch).length,
    createdShaders: snapshot.shaderModules.filter(inEpoch).length,
    createdTextures: snapshot.textures.filter(inEpoch).length,
    destroys: snapshot.destroys.filter(inEpoch).length,
    draws: snapshot.draws.filter(inEpoch).length,
    renderPasses: snapshot.renderPasses.filter(inEpoch).length,
    storageWrites: getWebGPUWrites(snapshot, WEBGPU_BUFFER_USAGE.storage).length,
    submits: snapshot.submits.filter(inEpoch).length,
    textureCopies: snapshot.textureCopies.filter(inEpoch).length,
    writes: snapshot.writes.filter(inEpoch).map(write => ({ size: write.size, usage: write.usage }))
  };
}
