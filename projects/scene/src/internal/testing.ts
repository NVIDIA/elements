// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { sharedDeviceService } from './services/shared-device.service.js';
import { getNamedSceneFrame } from './frame/state.js';
import { restoreScenePlatform, scenePlatform, type ScenePlatform } from './gpu/platform.js';
export type { SceneGPUCanvasContext, SceneGPUDevice, SceneGPUDeviceLostInfo, ScenePlatform } from './gpu/platform.js';

export function configureSceneTesting(overrides: Partial<ScenePlatform> = {}): void {
  sharedDeviceService.reset();
  restoreScenePlatform();
  Object.assign(scenePlatform, overrides);
}

export function resetSceneTesting(): void {
  sharedDeviceService.reset();
  restoreScenePlatform();
}

export function getNamedSceneFrameForTesting(scene: HTMLElement, name: string): HTMLElement | undefined {
  return getNamedSceneFrame(scene, name);
}
