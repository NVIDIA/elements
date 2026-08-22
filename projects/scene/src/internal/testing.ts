// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { sharedDeviceManager } from './gpu/device-manager.js';
import { getFrameStateSnapshot, getNamedSceneFrame } from './frame/state.js';
import { FRAME_SAMPLE_MAX_COUNT, FRAME_SAMPLE_MAX_SPAN_MS } from './frame/transform-buffer.js';
import { restoreScenePlatform, scenePlatform, type ScenePlatform } from './gpu/platform.js';
import {
  getSceneInstanceUploadCount,
  getSceneMeshUploadSnapshot,
  getScenePickPerformanceSnapshot,
  type ScenePickPerformanceSnapshot
} from '../scene/rendering/renderer.js';
import type { LabelCaptureCapabilities } from './label/capture.js';
import type { ScenePickDriver } from './pick/routing.js';

interface SceneLabelTestingOptions {
  readonly captureCapabilities?: LabelCaptureCapabilities;
  readonly copy?: (options: {
    readonly slot: HTMLSlotElement;
    readonly size: { readonly height: number; readonly width: number };
  }) => void;
  readonly getGeometryPixel?: (
    pixelX: number,
    pixelY: number
  ) => { readonly depth: number; readonly id: number } | undefined;
  readonly prefetchGeometryPixel?: (pixelX: number, pixelY: number) => void;
}

const LABEL_TESTING = Symbol.for('nve.scene.label-testing');
const LABEL_CAPTURE_RESET = Symbol.for('nve.scene.label-capture.reset');
const PICK_DRIVER_SET = Symbol.for('nve.scene.pick-driver.set');
const TICK_PERFORMANCE = Symbol.for('nve.scene.tick-performance');

export interface SceneTickPerformanceSnapshot {
  readonly animationFrameRequests: number;
  readonly backgroundSamples: number;
  readonly cameraScans: number;
  readonly frameScans: number;
  readonly layerScans: number;
  readonly parked: boolean;
  readonly ticks: number;
}

export { FRAME_SAMPLE_MAX_COUNT, FRAME_SAMPLE_MAX_SPAN_MS };

export type { SceneGPUCanvasContext, SceneGPUDevice, SceneGPUDeviceLostInfo, ScenePlatform } from './gpu/platform.js';

export function configureSceneTesting(overrides: Partial<ScenePlatform> = {}): void {
  sharedDeviceManager.reset();
  restoreScenePlatform();
  Object.assign(scenePlatform, overrides);
}

export function resetSceneTesting(): void {
  sharedDeviceManager.reset();
  restoreScenePlatform();
}

export function getSceneTestingSnapshot(): {
  requestDeviceCount: number;
  hasDevice: boolean;
  recoveryBlocked: boolean;
} {
  return sharedDeviceManager.getSnapshot();
}

export function getFrameTestingSnapshot(frame: HTMLElement): {
  readonly sampleCount: number;
  readonly oldestStamp?: number;
  readonly newestStamp?: number;
  readonly staticTransform: boolean;
} {
  return getFrameStateSnapshot(frame);
}

export function getNamedSceneFrameForTesting(scene: HTMLElement, name: string): HTMLElement | undefined {
  return getNamedSceneFrame(scene, name);
}

export function getSceneInstanceUploadCountForTesting(scene: HTMLElement): number {
  return getSceneInstanceUploadCount(scene);
}

export function getSceneMeshUploadSnapshotForTesting(scene: HTMLElement): {
  rebuilds: number;
  uploads: number;
} {
  return getSceneMeshUploadSnapshot(scene);
}

export function getScenePickPerformanceSnapshotForTesting(scene: HTMLElement): ScenePickPerformanceSnapshot {
  return getScenePickPerformanceSnapshot(scene);
}

export function getSceneTickPerformanceSnapshotForTesting(scene: HTMLElement): SceneTickPerformanceSnapshot {
  const snapshot = Reflect.get(scene, TICK_PERFORMANCE) as SceneTickPerformanceSnapshot | undefined;
  return (
    snapshot ?? {
      animationFrameRequests: 0,
      backgroundSamples: 0,
      cameraScans: 0,
      frameScans: 0,
      layerScans: 0,
      parked: true,
      ticks: 0
    }
  );
}

/** Installs an isolated label-capture seam used only by Scene tests. */
export function configureSceneLabelTesting(scene: HTMLElement, options: SceneLabelTestingOptions | undefined): void {
  if (options) Reflect.set(scene, LABEL_TESTING, options);
  else Reflect.deleteProperty(scene, LABEL_TESTING);
}

/** Clears the label capture cache between isolated tests. */
export function resetLabelCaptureCapabilitiesForTesting(): void {
  const reset = Reflect.get(globalThis, LABEL_CAPTURE_RESET);
  if (typeof reset === 'function') Reflect.apply(reset, globalThis, []);
}

/** Installs an isolated pick-driver seam used by deterministic interaction tests. */
export function setScenePickDriverForTesting(scene: HTMLElement, driver: ScenePickDriver | undefined): void {
  const set = Reflect.get(globalThis, PICK_DRIVER_SET);
  if (typeof set === 'function') Reflect.apply(set, globalThis, [scene, driver]);
}
