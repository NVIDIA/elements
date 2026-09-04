// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { sharedDeviceManager } from './gpu/device-manager.js';
import { getNamedSceneFrame } from './frame/state.js';
import { restoreScenePlatform, scenePlatform, type ScenePlatform } from './gpu/platform.js';
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

export function getNamedSceneFrameForTesting(scene: HTMLElement, name: string): HTMLElement | undefined {
  return getNamedSceneFrame(scene, name);
}
