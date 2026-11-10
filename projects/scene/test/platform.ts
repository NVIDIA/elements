// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { scenePlatform, type ScenePlatform } from '../src/internal/gpu/platform.js';
import { sharedDeviceService } from '../src/internal/gpu/shared-device.service.js';

const defaults: ScenePlatform = { ...scenePlatform };

export function restoreScenePlatform(): void {
  Object.assign(scenePlatform, defaults);
}

export function configureSceneTesting(overrides: Partial<ScenePlatform> = {}): void {
  sharedDeviceService.reset();
  restoreScenePlatform();
  Object.assign(scenePlatform, overrides);
}

export function resetSceneTesting(): void {
  sharedDeviceService.reset();
  restoreScenePlatform();
}
