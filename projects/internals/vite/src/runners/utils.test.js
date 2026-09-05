// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { withSoftwareWebGPUChromiumArgs } from './utils.js';

test('withSoftwareWebGPUChromiumArgs merges Chromium feature flags', () => {
  const result = withSoftwareWebGPUChromiumArgs([
    '--headless',
    '--enable-features=ExistingFeature,Vulkan',
    '--disable-gpu',
    '--enable-features=AnotherFeature',
    '--disable-software-rasterizer'
  ]);

  assert.equal(result.filter(argument => argument.startsWith('--enable-features=')).length, 1);
  assert.ok(result.includes('--enable-features=ExistingFeature,Vulkan,AnotherFeature'));
  assert.ok(result.includes('--headless'));
  assert.ok(!result.includes('--disable-gpu'));
  assert.ok(!result.includes('--disable-software-rasterizer'));
});
