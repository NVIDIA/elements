import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { waitForDebuggingPort } from './playwright.js';

async function createProfile(t) {
  const directory = await mkdtemp(join(tmpdir(), 'elements-chromium-port-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return { directory, portFile: join(directory, 'DevToolsActivePort') };
}

test('reads a ready Chromium debugging port', async t => {
  const { directory, portFile } = await createProfile(t);
  await writeFile(portFile, '43210\n/devtools/browser/test\n');

  assert.equal(await waitForDebuggingPort(directory), 43210);
});

test('waits for Chromium to create its debugging port file', async t => {
  const { directory, portFile } = await createProfile(t);
  const portPromise = waitForDebuggingPort(directory);
  await setTimeout(20);
  await writeFile(portFile, '43210\n/devtools/browser/test\n');

  assert.equal(await portPromise, 43210);
});

test('waits for an incomplete Chromium debugging port file', async t => {
  const { directory, portFile } = await createProfile(t);
  await writeFile(portFile, '432');
  const portPromise = waitForDebuggingPort(directory);
  await setTimeout(20);
  await writeFile(portFile, '43210\n/devtools/browser/test\n');

  assert.equal(await portPromise, 43210);
});

test('times out if Chromium never publishes a debugging port', async t => {
  const { directory } = await createProfile(t);

  await assert.rejects(waitForDebuggingPort(directory, { timeoutMs: 20 }), {
    message: /Timed out waiting for Chromium debugging port in .*DevToolsActivePort/
  });
});

test('rejects invalid Chromium debugging ports', async t => {
  const { directory, portFile } = await createProfile(t);
  await writeFile(portFile, '65536\n/devtools/browser/test\n');

  await assert.rejects(waitForDebuggingPort(directory, { timeoutMs: 20 }), /Timed out/);
});

test('preserves file errors unrelated to startup readiness', async t => {
  const { portFile } = await createProfile(t);
  await writeFile(portFile, 'not a directory');

  await assert.rejects(waitForDebuggingPort(portFile), { code: 'ENOTDIR' });
});
