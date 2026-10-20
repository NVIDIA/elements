// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import { configureSceneTesting, getNamedSceneFrameForTesting, resetSceneTesting } from './scene.js';
import { scenePlatform } from '../gpu/platform.js';
import { sharedDeviceService } from '../gpu/shared-device.service.js';
import { updateFrameRegistry } from '../composition/frame/registry.js';
import { registerFrameState } from '../composition/frame/state.js';

describe('scene testing configuration', () => {
  afterEach(() => {
    resetSceneTesting();
    vi.restoreAllMocks();
  });

  it('restores previous overrides before each configuration and resets the shared device', async () => {
    const defaults = { ...scenePlatform };
    const reset = vi.spyOn(sharedDeviceService, 'reset');
    const requestAdapter = vi.fn(async () => null);
    configureSceneTesting({ now: () => 123, requestAdapter });
    expect(scenePlatform.now()).toBe(123);
    expect(await scenePlatform.requestAdapter()).toBeNull();
    expect(requestAdapter).toHaveBeenCalledOnce();
    configureSceneTesting({ now: () => 456 });
    expect(scenePlatform.now()).toBe(456);
    expect(scenePlatform.requestAdapter).toBe(defaults.requestAdapter);
    expect(reset).toHaveBeenCalledTimes(2);
    resetSceneTesting();
    expect(scenePlatform).toEqual(defaults);
    expect(reset).toHaveBeenCalledTimes(3);
  });

  it('looks up registered names without leaking between scenes', () => {
    const first = document.createElement('nve-scene');
    const second = document.createElement('nve-scene');
    const frame = document.createElement('nve-scene-frame');
    frame.setAttribute('name', 'tip');
    registerFrameState(frame);
    first.append(frame);
    updateFrameRegistry(first, [frame], []);
    expect(getNamedSceneFrameForTesting(first, ' tip ')).toBe(frame);
    expect(getNamedSceneFrameForTesting(second, 'tip')).toBeUndefined();
  });
});
