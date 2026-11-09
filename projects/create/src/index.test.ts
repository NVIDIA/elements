// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mock, test } from 'node:test';
import type { SpawnOptions } from 'node:child_process';
import type * as Entry from './index.js';

void test('create wrapper delegates to the package manager and forwards exit status', async t => {
  const originalArgs = process.argv;
  const originalAgent = process.env.npm_config_user_agent;
  t.after(() => {
    process.argv = originalArgs;
    if (originalAgent === undefined) delete process.env.npm_config_user_agent;
    else process.env.npm_config_user_agent = originalAgent;
    mock.restoreAll();
  });
  const child = new EventEmitter();
  const spawn = mock.fn((_command: string, _args: string[], _options: SpawnOptions) => child);
  mock.module('node:child_process', { exports: { spawn } });
  const log = t.mock.method(console, 'log', () => {});
  const exit = t.mock.method(process, 'exit', (_code?: string | number | null): never => {
    throw new Error('exit');
  });
  process.argv = ['node', 'create-nve'];
  delete process.env.npm_config_user_agent;
  const entry: typeof Entry = await import(new URL('./index.ts', import.meta.url).href);
  assert.equal(spawn.mock.calls.length, 1, 'starts automatically when loaded');
  assert.deepEqual(spawn.mock.calls[0]?.arguments, [
    'npm',
    ['exec', '-y', '--package=@nvidia-elements/cli@latest', '--', 'nve', 'project.create', '--start'],
    { stdio: 'inherit' }
  ]);
  assert.match(String(log.mock.calls[0]?.arguments[0]), /Starting up Elements CLI/);

  for (const [agent, command, prefix] of [
    ['npm/12', 'npm', ['exec', '-y']],
    ['pnpm/12', 'pnpm', ['dlx']],
    ['yarn/4', 'yarn', ['dlx']],
    ['unknown', 'npm', ['exec', '-y']]
  ] as const) {
    child.removeAllListeners();
    process.env.npm_config_user_agent = agent;
    process.argv = ['node', 'create-nve', 'react'];
    await entry.main();
    assert.deepEqual(spawn.mock.calls.at(-1)?.arguments, [
      command,
      [...prefix, '--package=@nvidia-elements/cli@latest', '--', 'nve', 'project.create', '--start', '--type=react'],
      { stdio: 'inherit' }
    ]);
  }

  for (const [status, expected] of [
    [0, 0],
    [7, 7],
    [null, 0]
  ]) {
    assert.throws(() => child.emit('close', status), /exit/);
    assert.deepEqual(exit.mock.calls.at(-1)?.arguments, [expected]);
  }
});
