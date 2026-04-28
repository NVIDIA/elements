// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import type { ToolMethod } from '../internal/tools.js';
import { PackagesService } from './service.js';

vi.mock('../api/utils.js', async importOriginal => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    getLatestPublishedVersions: vi.fn().mockResolvedValue({
      '@nvidia-elements/core': '1.0.0',
      '@nvidia-elements/themes': '1.0.0'
    })
  };
});

describe('PackagesService', () => {
  it('should provide list tool', async () => {
    const result = await PackagesService.list();
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result).toContain('@nvidia-elements/core');
    expect((PackagesService.list as ToolMethod<unknown>).metadata.name).toBe('list');
    expect((PackagesService.list as ToolMethod<unknown>).metadata.command).toBe('list');
    expect((PackagesService.list as ToolMethod<unknown>).metadata.summary).toBe(
      'Get latest published versions of all Elements packages.'
    );
  });

  it('should provide get tool', async () => {
    const result = await PackagesService.get({ name: '@nvidia-elements/core' });
    expect(result).toBeDefined();
    expect(result).toContain('@nvidia-elements/core');
    expect((PackagesService.get as ToolMethod<unknown>).metadata.name).toBe('get');
    expect((PackagesService.get as ToolMethod<unknown>).metadata.command).toBe('get');
    expect((PackagesService.get as ToolMethod<unknown>).metadata.summary).toBe(
      'Get details for a specific Elements package.'
    );
  });

  it('should throw error for unknown package in get tool', async () => {
    await expect(PackagesService.get({ name: 'unknown-package' })).rejects.toThrow(
      'No package found for "unknown-package"'
    );
  });

  it('should provide changelogs get tool', async () => {
    const result = await PackagesService.changelogsGet({ name: '@nvidia-elements/core', format: 'markdown' });
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result).toContain('## ');
    expect((PackagesService.changelogsGet as ToolMethod<unknown>).metadata.name).toBe('changelogsGet');
    expect((PackagesService.changelogsGet as ToolMethod<unknown>).metadata.command).toBe('changelogs.get');
    expect((PackagesService.changelogsGet as ToolMethod<unknown>).metadata.summary).toBe(
      'Retrieve changelog details by package name.'
    );
  });

  it('should return changelog as json when format is json', async () => {
    const result = await PackagesService.changelogsGet({ name: '@nvidia-elements/core', format: 'json' });
    expect(typeof result).toBe('object');
    expect((result as { [key: string]: string })['@nvidia-elements/core']).toBeDefined();
  });

  it('should return changelog as markdown when format is undefined', async () => {
    const result = await PackagesService.changelogsGet({ name: '@nvidia-elements/core' });
    expect(typeof result).toBe('string');
  });

  it('should reject unknown package names with the canonical list in the error', async () => {
    await expect(PackagesService.changelogsGet({ name: 'no-match', format: 'markdown' })).rejects.toThrow(
      /Unknown package "no-match"[\s\S]*Available packages:/
    );
  });

  it('should reject names that only fuzzily resemble a real package', async () => {
    await expect(PackagesService.changelogsGet({ name: '@nve/elements' })).rejects.toThrow(
      'Unknown package "@nve/elements"'
    );
  });

  it('should apply default limit to changelog versions', async () => {
    const result = await PackagesService.changelogsGet({ name: '@nvidia-elements/core' });
    expect(typeof result).toBe('string');
    const versionCount = ((result as string).match(/^## /gm) ?? []).length;
    expect(versionCount).toBeGreaterThan(0);
    expect(versionCount).toBeLessThanOrEqual(10);
  });

  it('should limit changelog versions when explicit limit is provided', async () => {
    const full = await PackagesService.changelogsGet({ name: '@nvidia-elements/core', limit: 999 });
    const limited = await PackagesService.changelogsGet({ name: '@nvidia-elements/core', limit: 1 });
    expect((limited as string).length).toBeLessThanOrEqual((full as string).length);
  });

  it('should expose the same package set in list and changelogs-unknown-package error', async () => {
    const list = (await PackagesService.list()) as string;
    const listSet = new Set(Array.from(list.matchAll(/^## (\S+) v/gm), m => m[1]));

    const error = await PackagesService.changelogsGet({ name: 'does-not-exist', format: 'markdown' }).catch(
      e => e as Error
    );
    const available = error.message.split('Available packages:')[1] ?? '';
    const errSet = new Set(Array.from(available.matchAll(/"([^"]+)"/g), m => m[1]));

    expect(listSet.size).toBeGreaterThan(0);
    expect(errSet).toEqual(listSet);
  });

  it('should provide versions method', async () => {
    const result = await PackagesService.versions();
    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
    expect(result['@nvidia-elements/core']).toBe('1.0.0');
  });
});
