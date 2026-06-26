// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readdir, readFile } from 'node:fs/promises';
import type {
  AdoptionCdnStats,
  AdoptionDailyCount,
  AdoptionGitHubMetrics,
  AdoptionGitHubStargazerMonth,
  AdoptionNpmDownloads,
  AdoptionPackage,
  AdoptionPublishDate,
  AdoptionSource,
  AdoptionSourceError,
  AdoptionSummary,
  AdoptionTopCdnVersion
} from '../types.js';

interface WorkspacePackage {
  name: string;
  workspaceVersion: string;
}

interface NpmRegistryMetadata {
  latestVersion: string | null;
  publishedAt: string | null;
  versionCount: number;
  publishDates: AdoptionPublishDate[];
}

interface GitHubRepositoryMetrics {
  stars: number;
  forks: number;
  subscribers: number;
}

interface GitHubStargazersResult {
  data: unknown[];
  errors: AdoptionSourceError[];
}

type PublicJsonResult =
  | {
      ok: true;
      data: unknown;
      headers: Headers;
    }
  | {
      ok: false;
      error: AdoptionSourceError;
    };

type UnknownRecord = Record<string, unknown>;

const repository = 'NVIDIA/elements';
const period = 'last-month';
const githubHeaders = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28'
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isWorkspacePackage(value: WorkspacePackage | null): value is WorkspacePackage {
  return value !== null;
}

function getRecord(value: unknown, key: string): UnknownRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  const property = value[key];
  return isRecord(property) ? property : null;
}

function getString(value: unknown, key: string): string | null {
  if (!isRecord(value)) {
    return null;
  }

  const property = value[key];
  return typeof property === 'string' ? property : null;
}

function getNumber(value: unknown, key: string): number | null {
  if (!isRecord(value)) {
    return null;
  }

  const property = value[key];
  return typeof property === 'number' && Number.isFinite(property) ? property : null;
}

function getArray(value: unknown, key: string): unknown[] {
  if (!isRecord(value)) {
    return [];
  }

  const property = value[key];
  return Array.isArray(property) ? property : [];
}

function roundPercentage(value: number): number {
  return Number(value.toFixed(2));
}

function getDateRecordCounts(dates: UnknownRecord | null): AdoptionDailyCount[] {
  return Object.entries(dates ?? {})
    .filter((entry): entry is [string, number] => typeof entry[1] === 'number' && Number.isFinite(entry[1]))
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function createEmptyNpmDownloads(): AdoptionNpmDownloads {
  return {
    start: '',
    end: '',
    total: 0,
    daily: []
  };
}

function createEmptyCdnStats(): AdoptionCdnStats {
  return {
    rank: null,
    typeRank: null,
    total: 0,
    daily: [],
    versions: [],
    topVersion: null,
    latestVersionShare: 0
  };
}

function getSourceError(source: AdoptionSource, status: number | null, message: string): AdoptionSourceError {
  return {
    source,
    status,
    message
  };
}

async function getPackageFile(directoryUrl: URL): Promise<WorkspacePackage | null> {
  try {
    const packageJson: unknown = JSON.parse(await readFile(new URL('package.json', directoryUrl), 'utf8'));
    const name = getString(packageJson, 'name');
    const workspaceVersion = getString(packageJson, 'version');
    const isPrivate = isRecord(packageJson) && packageJson.private === true;

    if (!name?.startsWith('@nvidia-elements/') || !workspaceVersion || isPrivate) {
      return null;
    }

    return {
      name,
      workspaceVersion
    };
  } catch {
    // Not every projects directory entry is an npm package.
    return null;
  }
}

export async function getWorkspacePackages(
  projectsRoot = new URL('../../../../', import.meta.url)
): Promise<WorkspacePackage[]> {
  const entries = await readdir(projectsRoot, { withFileTypes: true });
  const packages = await Promise.all(
    entries.filter(entry => entry.isDirectory()).map(entry => getPackageFile(new URL(`${entry.name}/`, projectsRoot)))
  );

  return packages.filter(isWorkspacePackage).sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchPublicJson(
  url: string,
  source: AdoptionSource,
  headers: Record<string, string> = {}
): Promise<PublicJsonResult> {
  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      const statusText = response.statusText.trim();
      return {
        ok: false,
        error: getSourceError(
          source,
          response.status,
          statusText ? `${response.status} ${statusText}` : `HTTP ${response.status}`
        )
      };
    }

    return {
      ok: true,
      data: await response.json(),
      headers: response.headers
    };
  } catch (error) {
    // Network endpoints can fail independently of the generator process.
    return {
      ok: false,
      error: getSourceError(source, null, error instanceof Error ? error.message : 'unknown network error')
    };
  }
}

export function parseNpmDownloads(data: unknown): AdoptionNpmDownloads {
  const daily = getArray(data, 'downloads')
    .filter(isRecord)
    .map(download => ({
      date: getString(download, 'day') ?? '',
      count: getNumber(download, 'downloads') ?? 0
    }))
    .filter(download => download.date !== '')
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    start: getString(data, 'start') ?? daily[0]?.date ?? '',
    end: getString(data, 'end') ?? daily.at(-1)?.date ?? '',
    total: daily.reduce((total, day) => total + day.count, 0),
    daily
  };
}

export function parseNpmRegistry(data: unknown): NpmRegistryMetadata | null {
  const distTags = getRecord(data, 'dist-tags');
  const latestVersion = getString(distTags, 'latest');
  const versions = getRecord(data, 'versions');
  const time = getRecord(data, 'time');

  if (!latestVersion || !versions || !time) {
    return null;
  }

  const publishDates = Object.keys(versions)
    .map(version => ({
      version,
      date: typeof time[version] === 'string' ? time[version] : ''
    }))
    .filter(publishDate => publishDate.date !== '')
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    latestVersion,
    publishedAt: typeof time[latestVersion] === 'string' ? time[latestVersion] : null,
    versionCount: Object.keys(versions).length,
    publishDates
  };
}

export function parseJsDelivrStats(data: unknown, latestVersion: string | null): AdoptionCdnStats {
  const total = getNumber(data, 'total') ?? 0;
  const versions = Object.entries(getRecord(data, 'versions') ?? {})
    .filter((entry): entry is [string, UnknownRecord] => isRecord(entry[1]))
    .map(([version, versionData]) => {
      const versionTotal = getNumber(versionData, 'total') ?? 0;

      return {
        version,
        total: versionTotal,
        share: total > 0 ? roundPercentage((versionTotal / total) * 100) : 0,
        daily: getDateRecordCounts(getRecord(versionData, 'dates'))
      };
    })
    .sort((a, b) => b.total - a.total);
  const dailyByDate = new Map<string, number>();

  versions
    .flatMap(version => version.daily)
    .forEach(day => {
      dailyByDate.set(day.date, (dailyByDate.get(day.date) ?? 0) + day.count);
    });

  const topVersionData = versions[0];
  const topVersion: AdoptionTopCdnVersion | null = topVersionData
    ? {
        version: topVersionData.version,
        total: topVersionData.total,
        share: topVersionData.share
      }
    : null;
  const latestVersionStats = latestVersion ? versions.find(version => version.version === latestVersion) : undefined;

  return {
    rank: getNumber(data, 'rank'),
    typeRank: getNumber(data, 'typeRank'),
    total,
    daily: [...dailyByDate.entries()]
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    versions,
    topVersion,
    latestVersionShare: latestVersionStats?.share ?? 0
  };
}

export function parseGitHubRepository(data: unknown): GitHubRepositoryMetrics {
  return {
    stars: getNumber(data, 'stargazers_count') ?? 0,
    forks: getNumber(data, 'forks_count') ?? 0,
    subscribers: getNumber(data, 'subscribers_count') ?? 0
  };
}

export function parseGitHubPaginationTotal(linkHeader: string | null, fallbackTotal: number): number {
  const pageMatch = linkHeader?.match(/[?&]page=(\d+)>;\s*rel="last"/);
  return pageMatch?.[1] ? Number(pageMatch[1]) : fallbackTotal;
}

export function parseGitHubStargazers(data: unknown): AdoptionGitHubStargazerMonth[] {
  const monthCounts = new Map<string, number>();

  (Array.isArray(data) ? data : [])
    .filter(isRecord)
    .map(stargazer => getString(stargazer, 'starred_at'))
    .filter((starredAt): starredAt is string => starredAt !== null)
    .map(starredAt => starredAt.slice(0, 7))
    .forEach(month => {
      monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1);
    });

  let cumulativeStars = 0;
  return [...monthCounts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, stars]) => {
      cumulativeStars += stars;

      return {
        month,
        stars,
        cumulativeStars
      };
    });
}

async function getGitHubStargazerData(headers: Record<string, string>): Promise<GitHubStargazersResult> {
  const firstPage = await fetchPublicJson(
    `https://api.github.com/repos/${repository}/stargazers?per_page=100`,
    'github',
    {
      ...headers,
      Accept: 'application/vnd.github.star+json'
    }
  );

  if (!firstPage.ok) {
    return {
      data: [],
      errors: [firstPage.error]
    };
  }

  const totalPages = parseGitHubPaginationTotal(firstPage.headers.get('link'), 1);
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) =>
      fetchPublicJson(
        `https://api.github.com/repos/${repository}/stargazers?per_page=100&page=${index + 2}`,
        'github',
        {
          ...headers,
          Accept: 'application/vnd.github.star+json'
        }
      )
    )
  );

  return {
    data: [firstPage, ...remainingPages].flatMap(result =>
      result.ok && Array.isArray(result.data) ? result.data : []
    ),
    errors: remainingPages.flatMap(result => (result.ok ? [] : [result.error]))
  };
}

export async function getPackageAdoptionData(workspacePackage: WorkspacePackage): Promise<AdoptionPackage> {
  const encodedPackage = encodeURIComponent(workspacePackage.name);
  const [registryResult, downloadsResult, cdnResult] = await Promise.all([
    fetchPublicJson(`https://registry.npmjs.org/${encodedPackage}`, 'npm-registry'),
    fetchPublicJson(`https://api.npmjs.org/downloads/range/${period}/${encodedPackage}`, 'npm-downloads'),
    fetchPublicJson(`https://data.jsdelivr.com/v1/package/npm/${encodedPackage}/stats/month`, 'jsdelivr')
  ]);
  const errors = [registryResult, downloadsResult, cdnResult].flatMap(result => (result.ok ? [] : [result.error]));
  const registry = registryResult.ok ? parseNpmRegistry(registryResult.data) : null;

  if (!registry) {
    return {
      name: workspacePackage.name,
      workspaceVersion: workspacePackage.workspaceVersion,
      status: registryResult.ok ? 'partial' : 'unavailable',
      latestVersion: null,
      publishedAt: null,
      versionCount: 0,
      publishDates: [],
      npm: downloadsResult.ok ? parseNpmDownloads(downloadsResult.data) : createEmptyNpmDownloads(),
      cdn: cdnResult.ok ? parseJsDelivrStats(cdnResult.data, null) : createEmptyCdnStats(),
      errors
    };
  }

  return {
    name: workspacePackage.name,
    workspaceVersion: workspacePackage.workspaceVersion,
    status: errors.length === 0 ? 'published' : 'partial',
    latestVersion: registry.latestVersion,
    publishedAt: registry.publishedAt,
    versionCount: registry.versionCount,
    publishDates: registry.publishDates,
    npm: downloadsResult.ok ? parseNpmDownloads(downloadsResult.data) : createEmptyNpmDownloads(),
    cdn: cdnResult.ok ? parseJsDelivrStats(cdnResult.data, registry.latestVersion) : createEmptyCdnStats(),
    errors
  };
}

export async function getGitHubMetrics(): Promise<AdoptionGitHubMetrics> {
  const token = process.env.GITHUB_TOKEN;
  const authorizationHeaders = token ? { ...githubHeaders, Authorization: `Bearer ${token}` } : githubHeaders;
  const [repositoryResult, stargazersResult, contributorsResult, releasesResult] = await Promise.all([
    fetchPublicJson(`https://api.github.com/repos/${repository}`, 'github', authorizationHeaders),
    getGitHubStargazerData(authorizationHeaders),
    fetchPublicJson(
      `https://api.github.com/repos/${repository}/contributors?per_page=1`,
      'github',
      authorizationHeaders
    ),
    fetchPublicJson(`https://api.github.com/repos/${repository}/releases?per_page=1`, 'github', authorizationHeaders)
  ]);
  const errors = [repositoryResult, contributorsResult, releasesResult].flatMap(result =>
    result.ok ? [] : [result.error]
  );
  const repositoryMetrics = repositoryResult.ok
    ? parseGitHubRepository(repositoryResult.data)
    : parseGitHubRepository({});
  const contributorsFallback =
    contributorsResult.ok && Array.isArray(contributorsResult.data) ? contributorsResult.data.length : 0;
  const releasesFallback = releasesResult.ok && Array.isArray(releasesResult.data) ? releasesResult.data.length : 0;

  return {
    repository,
    stars: repositoryMetrics.stars,
    forks: repositoryMetrics.forks,
    subscribers: repositoryMetrics.subscribers,
    contributors: contributorsResult.ok
      ? parseGitHubPaginationTotal(contributorsResult.headers.get('link'), contributorsFallback)
      : 0,
    releases: releasesResult.ok ? parseGitHubPaginationTotal(releasesResult.headers.get('link'), releasesFallback) : 0,
    stargazers: parseGitHubStargazers(stargazersResult.data),
    errors: [...errors, ...stargazersResult.errors]
  };
}

export function createAdoptionSummary(packages: AdoptionPackage[], github: AdoptionGitHubMetrics): AdoptionSummary {
  return {
    created: new Date().toISOString(),
    period,
    sources: {
      npmDownloads: 'https://api.npmjs.org/downloads/',
      npmRegistry: 'https://registry.npmjs.org/',
      jsdelivr: 'https://data.jsdelivr.com/',
      github: 'https://api.github.com/repos/NVIDIA/elements'
    },
    totals: {
      packages: packages.length,
      publishedPackages: packages.filter(packageData => packageData.status === 'published').length,
      partialPackages: packages.filter(packageData => packageData.status === 'partial').length,
      unavailablePackages: packages.filter(packageData => packageData.status === 'unavailable').length,
      npmDownloads: packages.reduce((total, packageData) => total + packageData.npm.total, 0),
      cdnRequests: packages.reduce((total, packageData) => total + packageData.cdn.total, 0)
    },
    packages,
    github
  };
}

export async function getAdoptionData(): Promise<AdoptionSummary> {
  const packages = await getWorkspacePackages();
  const [packageData, github] = await Promise.all([
    Promise.all(packages.map(getPackageAdoptionData)),
    getGitHubMetrics()
  ]);

  return createAdoptionSummary(packageData, github);
}
