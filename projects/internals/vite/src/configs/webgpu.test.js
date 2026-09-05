// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import process from 'node:process';
import { after, test } from 'node:test';

const originalMode = process.env.WEBGPU_TEST_MODE;
let importIndex = 0;

after(() => {
  if (originalMode === undefined) delete process.env.WEBGPU_TEST_MODE;
  else process.env.WEBGPU_TEST_MODE = originalMode;
});

async function loadConfig(mode) {
  if (mode === undefined) delete process.env.WEBGPU_TEST_MODE;
  else process.env.WEBGPU_TEST_MODE = mode;
  importIndex += 1;
  return import(`./webgpu.js?test=${importIndex}`);
}

test('libraryWebGPUTestConfig preserves documented mode timeouts', async () => {
  const expected = new Map([
    [undefined, 60_000],
    ['check', 60_000],
    ['diagnostic', 120_000],
    ['lifecycle', 180_000],
    ['measure', 600_000]
  ]);

  for (const [mode, timeout] of expected) {
    const { libraryWebGPUTestConfig } = await loadConfig(mode);
    assert.equal(libraryWebGPUTestConfig.test.testTimeout, timeout);
  }
});

test('libraryWebGPUTestConfig rejects unsupported modes', async () => {
  await assert.rejects(loadConfig('unsupported'), /Unknown WebGPU test mode: unsupported/u);
});
