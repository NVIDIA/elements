// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ApiService, ProjectsService as PackageService, type Attribute, type Element } from '@internals/metadata';
import { fuzzyMatch } from '../internal/search.js';
import { type ElementVersions, getLatestPublishedVersions } from '../api/utils.js';

export function searchChangelogs(query: string, changelogs: { [key: string]: string }) {
  if (!query) return undefined;

  const keys = Object.keys(changelogs);
  const match = keys.find(k => k === query) ?? keys.find(k => k.includes(query));
  if (match) return changelogs[match];

  const fuzzy = fuzzyMatch(query, keys);
  return fuzzy[0] !== undefined ? changelogs[fuzzy[0]] : undefined;
}

export async function findPublicAPIChangelog(name: string): Promise<string | undefined> {
  const data = await ApiService.search(name);
  const result = data.find((r: Element | Attribute) => r.name === name) as
    | Element
    | (Attribute & { changelog: string })
    | undefined;
  return result?.changelog ?? JSON.stringify(result, null, 2);
}

export function scopeOrder(name: string) {
  return name.startsWith('@nvidia-elements/') ? -1 : 0;
}

export async function getVersions(): Promise<ElementVersions> {
  const packages = (await PackageService.getData())?.data ?? [];
  return await getLatestPublishedVersions(packages);
}

export async function getAvailablePackages(): Promise<string> {
  const packages = (await PackageService.getData())?.data ?? [];
  const publicPackages = await getLatestPublishedVersions((await PackageService.getData())?.data ?? []);

  return packages
    .filter((p: { name: string }) => publicPackages[p.name as keyof ElementVersions] !== undefined)
    .sort(
      (a: { name: string }, b: { name: string }) =>
        scopeOrder(a.name) - scopeOrder(b.name) || a.name.localeCompare(b.name)
    )
    .map((p: { name: string; version: string; description: string }) => `## ${p.name} v${p.version}\n${p.description}`)
    .join('\n\n');
}

export function limitChangelogVersions(changelog: string, limit: number): string {
  const parts = changelog.split(/^(?=## )/m);
  const preamble = parts[0]?.startsWith('## ') ? '' : (parts.shift() ?? '');
  const sections = parts.slice(0, limit);
  return (preamble + sections.join('')).trimEnd();
}

export async function getPackage(name: string) {
  const packages = (await PackageService.getData())?.data ?? [];
  const publicPackages = await getLatestPublishedVersions((await PackageService.getData())?.data ?? []);

  const available = packages
    .filter((p: { name: string }) => publicPackages[p.name as keyof ElementVersions] !== undefined)
    .sort(
      (a: { name: string }, b: { name: string }) =>
        scopeOrder(a.name) - scopeOrder(b.name) || a.name.localeCompare(b.name)
    );

  const pkg = available.find((p: { name: string }) => p.name === name);

  if (!pkg) {
    const names = available.map((p: { name: string }) => `"${p.name}"`).join(', ');
    throw new Error(`No package found for "${name}".\n\nAvailable packages: ${names}`);
  }

  return `# ${pkg.name} v${pkg.version}\n\n${pkg.description}\n---\n${pkg.readme?.replace(/^.*\n/, '') ?? ''}`;
}
