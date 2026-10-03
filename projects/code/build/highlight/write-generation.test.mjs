// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm, stat, symlink, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import test, { after } from 'node:test';
import { generator, writeGeneration } from './write-generation.mjs';

const directories = [];
async function directory() {
  const path = await mkdtemp(join(tmpdir(), 'elements-output-'));
  directories.push(path);
  return pathToFileURL(`${path}/`);
}
after(async () => {
  await Promise.all(directories.map(path => rm(path, { recursive: true, force: true })));
});
function output(entries) {
  const files = new Map(entries);
  files.set(
    'manifest.json',
    JSON.stringify({
      generator,
      format: 1,
      files: entries.map(([name, source]) => ({ name, sha256: createHash('sha256').update(source).digest('hex') }))
    })
  );
  return files;
}

test('replaces changed files, removes only owned stale output, and preserves unrelated files', async () => {
  const url = await directory();
  await writeGeneration(
    url,
    output([
      ['a.mjs', 'old'],
      ['stale.mjs', 'stale']
    ])
  );
  await writeFile(new URL('notes.txt', url), 'keep');
  await writeGeneration(
    url,
    output([
      ['a.mjs', 'new'],
      ['b.mjs', 'added']
    ])
  );
  assert.deepEqual((await readdir(url)).sort(), ['a.mjs', 'b.mjs', 'manifest.json', 'notes.txt']);
  assert.equal(await readFile(new URL('a.mjs', url), 'utf8'), 'new');
  assert.equal(await readFile(new URL('notes.txt', url), 'utf8'), 'keep');
});

test('unchanged content and manifests keep their modification times', async () => {
  const url = await directory(),
    files = output([['a.mjs', 'source']]);
  await writeGeneration(url, files);
  const time = new Date(1000);
  for (const name of files.keys()) await utimes(new URL(name, url), time, time);
  await writeGeneration(url, files);
  for (const name of files.keys()) assert.equal((await stat(new URL(name, url))).mtimeMs, 1000);
});

test('rejects changed owned or colliding unowned files before modifying other outputs', async () => {
  const url = await directory(),
    old = output([
      ['a.mjs', 'old'],
      ['b.mjs', 'original']
    ]);
  await writeGeneration(url, old);
  await writeFile(new URL('b.mjs', url), 'manual');
  await assert.rejects(writeGeneration(url, output([['a.mjs', 'new']])), /edited or unowned/);
  assert.equal(await readFile(new URL('a.mjs', url), 'utf8'), 'old');
  assert.equal(await readFile(new URL('manifest.json', url), 'utf8'), old.get('manifest.json'));
  const fresh = await directory();
  await writeFile(new URL('a.mjs', fresh), 'unowned');
  await assert.rejects(writeGeneration(fresh, output([['a.mjs', 'new']])), /edited or unowned/);
  assert.deepEqual(await readdir(fresh), ['a.mjs']);
});

test('recovers when an interrupted generation has already written some incoming files', async () => {
  const url = await directory();
  await writeGeneration(
    url,
    output([
      ['a.mjs', 'old'],
      ['stale.mjs', 'stale']
    ])
  );
  await writeFile(new URL('a.mjs', url), 'new');
  await writeFile(new URL('b.mjs', url), 'added');
  const next = output([
    ['a.mjs', 'new'],
    ['b.mjs', 'added']
  ]);
  await writeGeneration(url, next);
  for (const [name, source] of next) assert.equal(await readFile(new URL(name, url), 'utf8'), source);
  assert.deepEqual((await readdir(url)).sort(), ['a.mjs', 'b.mjs', 'manifest.json']);
});

test('rejects malformed, foreign, traversal, duplicate and mismatched manifests', async () => {
  for (const manifest of [
    '{',
    JSON.stringify({ generator: 'other', format: 1, files: [] }),
    JSON.stringify({ generator, format: 1, files: [{ name: '../outside.mjs', sha256: '0'.repeat(64) }] }),
    JSON.stringify({
      generator,
      format: 1,
      files: [
        { name: 'a.mjs', sha256: '0'.repeat(64) },
        { name: 'a.mjs', sha256: '0'.repeat(64) }
      ]
    })
  ]) {
    const url = await directory();
    await writeFile(new URL('manifest.json', url), manifest);
    await assert.rejects(writeGeneration(url, output([['a.mjs', 'source']])));
    assert.deepEqual(await readdir(url), ['manifest.json']);
  }
  await assert.rejects(writeGeneration(await directory(), output([['../outside.mjs', 'bad']])), /ownership/);
  const files = output([['a.mjs', 'source']]);
  files.set('a.mjs', 'wrong');
  await assert.rejects(writeGeneration(await directory(), files), /does not match/);
});

test('rejects output symlinks and directory URLs without a trailing slash', async () => {
  const url = await directory(),
    target = new URL('target.txt', url);
  await writeFile(target, 'outside');
  await symlink(target, new URL('a.mjs', url));
  await assert.rejects(writeGeneration(url, output([['a.mjs', 'source']])), /regular file/);
  assert.equal(await readFile(target, 'utf8'), 'outside');
  const link = new URL('linked', url);
  await symlink(url, link);
  await assert.rejects(writeGeneration(new URL('linked/', url), output([])), /symlink/);
  await assert.rejects(writeGeneration(link, output([])), /ending in/);
});
