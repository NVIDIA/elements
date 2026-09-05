// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { WebGPUTestRunner, WebGPUTestSession } from './webgpu.js';

async function withTemporaryProject(run) {
  const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'elements-webgpu-test-'));
  try {
    return await run(projectRoot);
  } finally {
    await rm(projectRoot, { force: true, recursive: true });
  }
}

test('WebGPUTestSession closes without an onClose callback', async () => {
  let closeCount = 0;
  const session = new WebGPUTestSession({
    context: { close: async () => (closeCount += 1) },
    errors: [],
    page: {}
  });

  await session.close();
  await session.close();

  assert.equal(closeCount, 1);
});

test('inspectProductionBoundary resets stateful forbidden patterns', async () => {
  await withTemporaryProject(async projectRoot => {
    const directory = path.join(projectRoot, 'dist');
    await mkdir(directory);
    await writeFile(path.join(directory, 'index.js'), 'forbidden();\n');
    const pattern = /forbidden/gu;
    pattern.lastIndex = 'forbidden'.length;
    const runner = new WebGPUTestRunner({ projectRoot });

    await assert.rejects(
      runner.inspectProductionBoundary({
        forbiddenSourcePatterns: [{ message: 'contains forbidden source', pattern }]
      }),
      /contains forbidden source/u
    );
  });
});

test('captureTrace preserves the workload error when trace finalization fails', async () => {
  const actionError = new Error('workload failed');
  const cdp = {
    async detach() {},
    once() {},
    async send(method) {
      if (method === 'Tracing.end') throw new Error('trace finalization failed');
    }
  };
  const runner = new WebGPUTestRunner();

  await assert.rejects(
    runner.captureTrace(
      { createCDPSession: async () => cdp },
      {
        finalizationTimeout: 5,
        run: async () => {
          throw actionError;
        }
      }
    ),
    error => error === actionError
  );
});

test('captureTrace writes a completed protocol stream', async () => {
  await withTemporaryProject(async projectRoot => {
    let traceComplete;
    const cdp = {
      async detach() {},
      once(event, callback) {
        if (event === 'Tracing.tracingComplete') traceComplete = callback;
      },
      async send(method) {
        if (method === 'Tracing.end') traceComplete({ stream: 'trace-stream' });
        if (method === 'IO.read') return { data: '{"traceEvents":[]}', eof: true };
      }
    };
    const runner = new WebGPUTestRunner({ outputRoot: 'reports', projectRoot });
    const tracePath = await runner.captureTrace(
      { createCDPSession: async () => cdp },
      { finalizationTimeout: 50, label: 'test', run: async () => {} }
    );

    assert.equal(await readFile(tracePath, 'utf8'), '{"traceEvents":[]}');
  });
});
