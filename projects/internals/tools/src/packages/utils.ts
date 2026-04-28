// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ApiService, ProjectsService as PackageService, type Attribute, type Element } from '@internals/metadata';
import { type ElementVersions, getLatestPublishedVersions, getPublishedProjects } from '../api/utils.js';

const PLACEHOLDER_CHANGELOG_PATTERN = /^##\s+0\.0\.0\s*\n+\s*Initial release\.?\s*$/;

export function hasChangelogEntries(changelog: string | undefined): boolean {
  const trimmed = changelog?.trim() ?? '';
  if (!trimmed) return false;
  return !PLACEHOLDER_CHANGELOG_PATTERN.test(trimmed);
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
  return getPublishedProjects((await PackageService.getData())?.data ?? [])
    .sort((a, b) => scopeOrder(a.name) - scopeOrder(b.name) || a.name.localeCompare(b.name))
    .map(p => `## ${p.name} v${p.version}\n${p.description}`)
    .join('\n\n');
}

export function limitChangelogVersions(changelog: string, limit: number): string {
  const parts = changelog.split(/^(?=## )/m);
  const preamble = parts[0]?.startsWith('## ') ? '' : (parts.shift() ?? '');
  const sections = parts.slice(0, limit);
  return (preamble + sections.join('')).trimEnd();
}

export async function getPackage(name: string) {
  const available = getPublishedProjects((await PackageService.getData())?.data ?? []).sort(
    (a, b) => scopeOrder(a.name) - scopeOrder(b.name) || a.name.localeCompare(b.name)
  );

  const pkg = available.find(p => p.name === name);

  if (!pkg) {
    const names = available.map(p => `"${p.name}"`).join(', ');
    throw new Error(`No package found for "${name}".\n\nAvailable packages: ${names}`);
  }

  return `# ${pkg.name} v${pkg.version}\n\n${pkg.description}\n---\n${pkg.readme?.replace(/^.*\n/, '') ?? ''}`;
}
