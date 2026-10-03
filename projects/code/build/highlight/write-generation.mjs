// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { createHash, randomUUID } from 'node:crypto';
import { lstat, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';

export const generator = 'nve-codeblock-indexed-scanner';
const hash = source => createHash('sha256').update(source).digest('hex');

function owned(source) {
  const manifest = JSON.parse(source);
  if (manifest.generator !== generator || manifest.format !== 1 || !Array.isArray(manifest.files))
    throw new Error('Output manifest belongs to a different generator');
  const files = new Map();
  for (const { name, sha256 } of manifest.files) {
    if (
      !/^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(name) ||
      name === 'manifest.json' ||
      !/^[a-f0-9]{64}$/.test(sha256) ||
      files.has(name)
    )
      throw new Error('Invalid generated file ownership');
    files.set(name, sha256);
  }
  return files;
}

async function existing(url) {
  try {
    if (!(await lstat(url)).isFile()) throw new Error(`Generated output must be a regular file: ${url}`);
    return await readFile(url, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

async function replace(url, source) {
  const temporary = new URL(`${url.pathname.split('/').at(-1)}.tmp-${randomUUID()}`, url);
  try {
    await writeFile(temporary, source, { flag: 'wx' });
    await rename(temporary, url);
  } finally {
    await rm(temporary, { force: true });
  }
}

// A build owns only manifest-listed files. Preflight all collisions before
// writing, replace individual files atomically, and commit the manifest last.
export async function writeGeneration(directory, files) {
  if (
    !(directory instanceof URL) ||
    directory.protocol !== 'file:' ||
    directory.search ||
    directory.hash ||
    !directory.pathname.endsWith('/')
  )
    throw new Error('Generation requires a file directory URL ending in /');
  const next = owned(files.get('manifest.json'));
  if (next.size + 1 !== files.size || [...next].some(([name, digest]) => hash(files.get(name) ?? '') !== digest))
    throw new Error('Generated output does not match its manifest');
  await mkdir(directory, { recursive: true });
  const bare = new URL(directory);
  bare.pathname = bare.pathname.slice(0, -1) || '/';
  if (!(await lstat(bare)).isDirectory()) throw new Error('Generated output directory must not be a symlink');
  const manifestURL = new URL('manifest.json', directory);
  const manifest = await existing(manifestURL);
  const previous = manifest === undefined ? new Map() : owned(manifest);
  const contents = new Map(
    await Promise.all(
      [...new Set([...previous.keys(), ...next.keys()])].map(async name => [
        name,
        await existing(new URL(name, directory))
      ])
    )
  );
  for (const [name, source] of contents) {
    if (source === undefined || source === files.get(name)) continue;
    if (!previous.has(name) || hash(source) !== previous.get(name))
      throw new Error(`Refusing to replace edited or unowned output: ${name}`);
  }
  const writes = await Promise.allSettled(
    [...next.keys()]
      .filter(name => contents.get(name) !== files.get(name))
      .map(name => replace(new URL(name, directory), files.get(name)))
  );
  const failed = writes.find(result => result.status === 'rejected');
  if (failed) throw failed.reason;
  await Promise.all(
    [...previous.keys()].filter(name => !next.has(name)).map(name => rm(new URL(name, directory), { force: true }))
  );
  if (manifest !== files.get('manifest.json')) await replace(manifestURL, files.get('manifest.json'));
}
