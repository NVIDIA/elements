import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { extractNpmPackages, main, npmVersionUrl, waitForNpmPackages } from './wait-npm-packages.js';

const manifest = {
  packages: [
    {
      registryType: 'npm',
      registryBaseUrl: 'https://registry.npmjs.org',
      identifier: '@nvidia-elements/cli',
      version: '2.2.3'
    },
    {
      registryType: 'pypi',
      identifier: 'ignored',
      version: '1.0.0'
    }
  ]
};

describe('wait-npm-packages', () => {
  it('encodes scoped package names for the npm registry', () => {
    assert.equal(
      npmVersionUrl({ identifier: '@nvidia-elements/cli', version: '2.2.3' }),
      'https://registry.npmjs.org/@nvidia-elements%2Fcli/2.2.3'
    );
  });

  it('extracts npm packages from a server manifest', () => {
    assert.deepEqual(extractNpmPackages(manifest), [
      {
        identifier: '@nvidia-elements/cli',
        version: '2.2.3',
        registryBaseUrl: 'https://registry.npmjs.org'
      }
    ]);
  });

  it('waits until a previously missing version returns HTTP 200', async () => {
    const statuses = [404, 404, 200];
    const urls = [];
    const fetchImpl = url => {
      urls.push(url);
      return Promise.resolve({ status: statuses.shift() ?? 200 });
    };
    const sleeps = [];

    await waitForNpmPackages(extractNpmPackages(manifest), {
      fetchImpl,
      sleep: ms => {
        sleeps.push(ms);
        return Promise.resolve();
      },
      timeoutMs: 30_000,
      intervalMs: 5_000,
      log() {}
    });

    assert.equal(urls.length, 3);
    assert.deepEqual(sleeps, [5_000, 5_000]);
  });

  it('times out when the npm version never appears', async () => {
    let now = 0;
    await assert.rejects(
      () =>
        waitForNpmPackages(extractNpmPackages(manifest), {
          fetchImpl: () => Promise.resolve({ status: 404 }),
          sleep: () => {
            now += 5_000;
            return Promise.resolve();
          },
          timeoutMs: 10_000,
          intervalMs: 5_000,
          now: () => now,
          log() {}
        }),
      /Timed out waiting for npm package @nvidia-elements\/cli@2.2.3/
    );
  });

  it('fails on unexpected npm registry status codes', async () => {
    await assert.rejects(
      () =>
        waitForNpmPackages(extractNpmPackages(manifest), {
          fetchImpl: () => Promise.resolve({ status: 401 }),
          log() {}
        }),
      /Unexpected npm registry response for @nvidia-elements\/cli@2.2.3: HTTP 401/
    );
  });

  it('reads npm packages from a server.json file', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'wait-npm-packages-'));
    const file = path.join(dir, 'server.json');
    await writeFile(file, JSON.stringify(manifest));
    const statuses = [404, 200];

    await main([file], {
      fetchImpl: () => Promise.resolve({ status: statuses.shift() }),
      sleep: () => Promise.resolve(),
      timeoutMs: 10_000,
      intervalMs: 1,
      log() {}
    });

    assert.equal(statuses.length, 0);
  });
});
