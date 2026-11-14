// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import type { IconSVG } from './icons.js';
import { IconRegistry, iconRegistry, registerIcon } from './registry.js';

describe('IconRegistry', () => {
  it('resolves eager strings, live readers and alias chains without importing the catalog', async () => {
    const importer = vi.fn(async () => ({}));
    const registry = new IconRegistry(importer);
    let value = '<svg>first</svg>';
    registry.add('original', { svg: () => value }, () => value);
    registry.alias('alias', 'original');
    registry.alias('nested', 'alias');
    expect(registry.sync('nested')).toBe(value);
    value = '<svg>second</svg>';
    expect(await registry.resolve('nested')).toBe(value);
    expect(importer).not.toHaveBeenCalled();
  });

  it('deduplicates pending loads and caches resolved SVG strings', async () => {
    let finish: (value: string) => void = () => {};
    const svg = vi.fn(
      () =>
        new Promise<string>(resolve => {
          finish = resolve;
        })
    );
    const importer = vi.fn(async () => ({ example: { svg } }));
    const registry = new IconRegistry(importer);
    const first = registry.resolve('example');
    const second = registry.resolve('example');
    await vi.waitFor(() => expect(svg).toHaveBeenCalledTimes(1));
    finish('<svg>loaded</svg>');
    expect(await Promise.all([first, second])).toEqual(['<svg>loaded</svg>', '<svg>loaded</svg>']);
    expect(await registry.resolve('example')).toBe('<svg>loaded</svg>');
    expect(importer).toHaveBeenCalledTimes(1);
  });

  it('retries a failed catalog and terminates alias cycles', async () => {
    const importer = vi
      .fn<() => Promise<Record<string, { svg: () => string }>>>()
      .mockRejectedValueOnce(new Error('load failed'))
      .mockResolvedValue({ example: { svg: () => '<svg />' } });
    const registry = new IconRegistry(importer);
    await expect(registry.resolve('example')).rejects.toThrow('load failed');
    expect(await registry.resolve('example')).toBe('<svg />');
    registry.alias('a', 'b');
    registry.alias('b', 'a');
    expect(await registry.resolve('a')).toBe('');
  });

  it('merges provider catalogs without overwriting local icons', async () => {
    const local = new IconRegistry(async () => ({}));
    const provider = new IconRegistry(async () => ({ lazy: { svg: () => 'lazy' } }));
    local.add('shared', { svg: () => 'local' }, 'local');
    provider.add('shared', { svg: () => 'remote' }, 'remote');
    provider.add('other', { svg: () => 'other' }, 'other');
    provider.alias('alias', 'other');
    local.merge(provider);
    local.merge(provider);
    expect(await local.resolve('shared')).toBe('local');
    expect(await local.resolve('alias')).toBe('other');
    expect(await local.resolve('lazy')).toBe('lazy');
    expect(await local.resolve('unknown')).toBe('');
  });

  it('replaces a pending provider result with a newly registered icon', async () => {
    let finish: (value: string) => void = () => {};
    const registry = new IconRegistry(async () => ({}));
    registry.add('example', {
      svg: () =>
        new Promise<string>(resolve => {
          finish = resolve;
        })
    });
    const pending = registry.resolve('example');
    registry.add('example', { svg: () => 'new' }, 'new');
    finish('old');
    expect(await pending).toBe('new');
  });

  it('copies a string icon onto a legacy element that has no registry', () => {
    class LegacyIcon extends HTMLElement {
      static _icons: Record<string, IconSVG> = {};
    }

    const get = customElements.get.bind(customElements);
    const spy = vi.spyOn(customElements, 'get').mockImplementation(tag => (tag === 'nve-icon' ? LegacyIcon : get(tag)));

    try {
      registerIcon('legacy-mark', '<svg id="legacy"></svg>');
      expect(LegacyIcon._icons['legacy-mark']?.svg()).toBe('<svg id="legacy"></svg>');
      expect(iconRegistry.sync('legacy-mark')).toBe('<svg id="legacy"></svg>');
    } finally {
      delete iconRegistry.icons['legacy-mark'];
      spy.mockRestore();
    }
  });
});
