// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createAdoptionSummary,
  fetchPublicJson,
  getGitHubMetrics,
  getPackageAdoptionData,
  getWorkspacePackages,
  parseGitHubPaginationTotal,
  parseGitHubRepository,
  parseGitHubStargazers,
  parseJsDelivrStats,
  parseNpmDownloads,
  parseNpmRegistry
} from './adoption.utils.ts';

const npmDownloadsFixture = {
  start: '2026-06-01',
  end: '2026-06-03',
  package: '@nvidia-elements/core',
  downloads: [
    { downloads: 4, day: '2026-06-01' },
    { downloads: 0, day: '2026-06-02' },
    { downloads: 9, day: '2026-06-03' }
  ]
};

const npmRegistryFixture = {
  name: '@nvidia-elements/core',
  'dist-tags': {
    latest: '2.0.2'
  },
  versions: {
    '2.0.1': {},
    '2.0.2': {}
  },
  time: {
    created: '2026-05-01T00:00:00.000Z',
    modified: '2026-06-23T00:00:00.000Z',
    '2.0.1': '2026-06-10T00:00:00.000Z',
    '2.0.2': '2026-06-23T00:00:00.000Z'
  }
};

const jsDelivrFixture = {
  rank: 40357,
  typeRank: 18103,
  total: 100,
  versions: {
    '2.0.1': {
      total: 70,
      dates: {
        '2026-06-01': 30,
        '2026-06-02': 40
      }
    },
    '2.0.2': {
      total: 30,
      dates: {
        '2026-06-01': 10,
        '2026-06-02': 20
      }
    }
  },
  commits: {},
  branches: {}
};

const githubRepositoryFixture = {
  stargazers_count: 23,
  forks_count: 4,
  subscribers_count: 3
};

const githubStargazersFixture = [
  { starred_at: '2026-03-19T17:13:15Z', user: { login: 'one' } },
  { starred_at: '2026-03-20T08:45:43Z', user: { login: 'two' } },
  { starred_at: '2026-04-01T08:45:43Z', user: { login: 'three' } }
];

function jsonResponse(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json');

  return new Response(JSON.stringify(data), {
    ...init,
    status: init.status ?? 200,
    headers
  });
}

function hasUrlHostname(url: string, hostname: string): boolean {
  return new URL(url).hostname === hostname;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('adoption utilities', () => {
  it('should parse npm downloads totals', () => {
    const downloads = parseNpmDownloads(npmDownloadsFixture);

    expect(downloads).toEqual({
      start: '2026-06-01',
      end: '2026-06-03',
      total: 13,
      daily: [
        { date: '2026-06-01', count: 4 },
        { date: '2026-06-02', count: 0 },
        { date: '2026-06-03', count: 9 }
      ]
    });
  });

  it('should parse npm registry publish metadata', () => {
    const registry = parseNpmRegistry(npmRegistryFixture);

    expect(registry).toEqual({
      latestVersion: '2.0.2',
      publishedAt: '2026-06-23T00:00:00.000Z',
      versionCount: 2,
      publishDates: [
        { version: '2.0.1', date: '2026-06-10T00:00:00.000Z' },
        { version: '2.0.2', date: '2026-06-23T00:00:00.000Z' }
      ]
    });
  });

  it('should parse jsDelivr totals and latest version share', () => {
    const cdn = parseJsDelivrStats(jsDelivrFixture, '2.0.2');

    expect(cdn.total).toBe(100);
    expect(cdn.topVersion).toEqual({ version: '2.0.1', total: 70, share: 70 });
    expect(cdn.latestVersionShare).toBe(30);
    expect(cdn.daily).toEqual([
      { date: '2026-06-01', count: 40 },
      { date: '2026-06-02', count: 60 }
    ]);
  });

  it('should parse GitHub public interest metadata', () => {
    expect(parseGitHubRepository(githubRepositoryFixture)).toEqual({
      stars: 23,
      forks: 4,
      subscribers: 3
    });
    expect(
      parseGitHubPaginationTotal('<https://api.github.com/repositories/1/releases?per_page=1&page=68>; rel="last"', 1)
    ).toBe(68);
    expect(parseGitHubStargazers(githubStargazersFixture)).toEqual([
      { month: '2026-03', stars: 2, cumulativeStars: 2 },
      { month: '2026-04', stars: 1, cumulativeStars: 3 }
    ]);
  });

  it('should read workspace packages from project package files', async () => {
    const root = await mkdtemp(join(tmpdir(), 'metadata-adoption-'));

    await Promise.all([
      mkdir(join(root, 'core')),
      mkdir(join(root, 'private-project')),
      mkdir(join(root, 'site')),
      mkdir(join(root, 'notes'))
    ]);
    await Promise.all([
      writeFile(
        join(root, 'core', 'package.json'),
        JSON.stringify({ name: '@nvidia-elements/core', version: '2.0.2' })
      ),
      writeFile(
        join(root, 'private-project', 'package.json'),
        JSON.stringify({ name: '@nvidia-elements/private', version: '0.0.0', private: true })
      ),
      writeFile(join(root, 'site', 'package.json'), JSON.stringify({ name: 'site', version: '0.0.0' }))
    ]);

    const packages = await getWorkspacePackages(pathToFileURL(`${root}/`));

    expect(packages).toEqual([{ name: '@nvidia-elements/core', workspaceVersion: '2.0.2' }]);
    await rm(root, { recursive: true, force: true });
  });

  it('should capture fetch failures without throwing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 503, statusText: 'Service Unavailable' }))
    );

    const result = await fetchPublicJson('https://example.test/error', 'npm-registry');

    expect(result).toEqual({
      ok: false,
      error: {
        source: 'npm-registry',
        status: 503,
        message: '503 Service Unavailable'
      }
    });
  });

  it('should mark unpublished packages unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (hasUrlHostname(url, 'api.npmjs.org')) {
          return jsonResponse(npmDownloadsFixture);
        }

        if (hasUrlHostname(url, 'data.jsdelivr.com')) {
          return jsonResponse(jsDelivrFixture);
        }

        return new Response('', { status: 404, statusText: 'Not Found' });
      })
    );

    const packageData = await getPackageAdoptionData({
      name: '@nvidia-elements/media',
      workspaceVersion: '0.0.0'
    });

    expect(packageData.status).toBe('unavailable');
    expect(packageData.latestVersion).toBeNull();
    expect(packageData.npm.total).toBe(13);
    expect(packageData.cdn.total).toBe(100);
    expect(packageData.errors.map(error => error.source)).toEqual(['npm-registry']);
  });

  it('should preserve available package data when one source fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (hasUrlHostname(url, 'registry.npmjs.org')) {
          return jsonResponse(npmRegistryFixture);
        }

        if (hasUrlHostname(url, 'api.npmjs.org')) {
          return new Response('', { status: 500, statusText: 'Internal Server Error' });
        }

        return jsonResponse(jsDelivrFixture);
      })
    );

    const packageData = await getPackageAdoptionData({
      name: '@nvidia-elements/core',
      workspaceVersion: '2.0.2'
    });

    expect(packageData.status).toBe('partial');
    expect(packageData.latestVersion).toBe('2.0.2');
    expect(packageData.npm.total).toBe(0);
    expect(packageData.cdn.total).toBe(100);
    expect(packageData.errors).toEqual([
      {
        source: 'npm-downloads',
        status: 500,
        message: '500 Internal Server Error'
      }
    ]);
  });

  it('should parse GitHub metrics from public endpoints', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.endsWith('/stargazers?per_page=100')) {
          return jsonResponse(githubStargazersFixture.slice(0, 2), {
            headers: {
              link: '<https://api.github.com/repositories/1/stargazers?per_page=100&page=2>; rel="last"'
            }
          });
        }

        if (url.endsWith('/stargazers?per_page=100&page=2')) {
          return jsonResponse(githubStargazersFixture.slice(2));
        }

        if (url.endsWith('/contributors?per_page=1')) {
          return jsonResponse([{ login: 'contributor' }], {
            headers: {
              link: '<https://api.github.com/repositories/1/contributors?per_page=1&page=15>; rel="last"'
            }
          });
        }

        if (url.endsWith('/releases?per_page=1')) {
          return jsonResponse([{ tag_name: '@nvidia-elements/core-v2.0.2' }], {
            headers: {
              link: '<https://api.github.com/repositories/1/releases?per_page=1&page=68>; rel="last"'
            }
          });
        }

        return jsonResponse(githubRepositoryFixture);
      })
    );

    const metrics = await getGitHubMetrics();

    expect(metrics).toMatchObject({
      repository: 'NVIDIA/elements',
      stars: 23,
      forks: 4,
      subscribers: 3,
      contributors: 15,
      releases: 68,
      errors: []
    });
    expect(metrics.stargazers).toHaveLength(2);
  });

  it('should create adoption totals without counting unavailable packages as published', () => {
    const github = {
      repository: 'NVIDIA/elements',
      stars: 23,
      forks: 4,
      subscribers: 3,
      contributors: 15,
      releases: 68,
      stargazers: [],
      errors: []
    };
    const summary = createAdoptionSummary(
      [
        {
          name: '@nvidia-elements/core',
          workspaceVersion: '2.0.2',
          status: 'published',
          latestVersion: '2.0.2',
          publishedAt: '2026-06-23T00:00:00.000Z',
          versionCount: 2,
          publishDates: [],
          npm: { start: '2026-06-01', end: '2026-06-03', total: 13, daily: [] },
          cdn: { ...parseJsDelivrStats(jsDelivrFixture, '2.0.2'), total: 100 },
          errors: []
        },
        {
          name: '@nvidia-elements/code',
          workspaceVersion: '2.0.1',
          status: 'partial',
          latestVersion: '2.0.1',
          publishedAt: '2026-06-20T00:00:00.000Z',
          versionCount: 1,
          publishDates: [],
          npm: { start: '2026-06-01', end: '2026-06-03', total: 7, daily: [] },
          cdn: { ...parseJsDelivrStats({}, '2.0.1'), total: 10 },
          errors: []
        },
        {
          name: '@nvidia-elements/media',
          workspaceVersion: '0.0.0',
          status: 'unavailable',
          latestVersion: null,
          publishedAt: null,
          versionCount: 0,
          publishDates: [],
          npm: { start: '', end: '', total: 0, daily: [] },
          cdn: parseJsDelivrStats({}, null),
          errors: []
        }
      ],
      github
    );

    expect(summary.totals).toEqual({
      packages: 3,
      publishedPackages: 1,
      partialPackages: 1,
      unavailablePackages: 1,
      npmDownloads: 20,
      cdnRequests: 110
    });
  });
});
