// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import { html } from 'lit';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { IconSVG } from '@nvidia-elements/core/icon';
import { Icon, mergeIcons } from '@nvidia-elements/core/icon';
import '@nvidia-elements/core/icon/define.js';
import { IconRegistry, iconRegistry } from './registry.js';

describe(`${Icon.metadata.tag}: static`, () => {
  const originalVersion = Icon.metadata.version;

  afterEach(() => {
    Icon.metadata.version = originalVersion;
    vi.restoreAllMocks();
  });

  it.each([
    ['2.0.0', '1.9.0'],
    ['2.1.1', '2.1.0'],
    ['2.1.0', '2.1.0']
  ])('should refresh mounted icons when version %s merges into registry version %s', async (current, registered) => {
    Icon.metadata.version = current;
    const catalog = { book: { svg: () => '<svg id="new-book"></svg>' } };
    const loadCatalog = vi.spyOn(iconRegistry, 'loadCatalog').mockResolvedValue(catalog);

    class Registered extends Icon {
      static override readonly metadata = { ...Icon.metadata, version: registered };
      static override _registry = new IconRegistry();
    }

    Registered._registry.add('book', { svg: () => '<svg id="old-book"></svg>' });
    Registered._registry.add('custom-icon', { svg: () => '<svg id="custom-icon"></svg>' });
    const get = customElements.get.bind(customElements);
    vi.spyOn(customElements, 'get').mockImplementation(tag => (tag === Icon.metadata.tag ? Registered : get(tag)));

    const fixture = await createFixture(html`<nve-icon name="book"></nve-icon>`);
    const element = fixture.querySelector(Icon.metadata.tag);
    try {
      await elementIsStable(element);
      expect(element.shadowRoot.querySelector('svg')?.id).toBe('old-book');
      expect(Registered._registry.sync('book')).toContain('old-book');

      mergeIcons(Registered);
      await expect.poll(() => element.shadowRoot.querySelector('svg')?.id).toBe('new-book');

      expect(loadCatalog).toHaveBeenCalledOnce();
      expect(Registered._registry.icons.book).toBe(catalog.book);
      expect(Registered._registry.sync('book')).toContain('new-book');
      expect(await Registered._registry.resolve('custom-icon')).toContain('custom-icon');
    } finally {
      removeFixture(fixture);
    }
  });

  it.each([
    ['1.9.0', '2.0.0'],
    ['2.0.0', '2.0.1'],
    ['2.0.0', '2.1.0']
  ])('should keep registry version %s from replacing newer version %s', async (current, registered) => {
    Icon.metadata.version = current;
    const loadCatalog = vi.spyOn(iconRegistry, 'loadCatalog');
    class Registered extends Icon {
      static override readonly metadata = { ...Icon.metadata, version: registered };
      static override _registry = new IconRegistry();
    }
    Registered._registry.add('book', { svg: () => '<svg id="new-book"></svg>' });

    mergeIcons(Registered);

    expect(loadCatalog).not.toHaveBeenCalled();
    expect(await Registered._registry.resolve('book')).toContain('new-book');
  });

  it('should keep the catalog lazy when the registered component owns this registry', () => {
    const loadCatalog = vi.spyOn(iconRegistry, 'loadCatalog');

    mergeIcons(Icon);

    expect(loadCatalog).not.toHaveBeenCalled();
  });

  it.each(['0.0.0', '-2.-2.-2'])(
    'should update legacy icons and notify cached misses for version %s',
    async version => {
      const catalog = {
        book: { svg: () => '<svg id="new-book"></svg>' },
        'check-badge': { svg: () => '<svg id="new-check-badge"></svg>' }
      };
      vi.spyOn(iconRegistry, 'loadCatalog').mockResolvedValue(catalog);

      class Registered {
        static metadata = { version };

        static _icons: Record<string, IconSVG> = {
          book: { svg: () => '<svg id="old-book"></svg>' },
          'check-badge': { svg: () => '' },
          'custom-icon': { svg: () => '<svg id="custom-icon"></svg>' }
        };

        // Legacy add() replaces providers and notifies mounted icons to render again.
        static async add(icons: Record<string, IconSVG>) {
          this._icons = { ...this._icons, ...icons };
          for (const [name, icon] of Object.entries(icons)) {
            document.dispatchEvent(new CustomEvent(`nve-icon-${name}`, { detail: icon }));
          }
        }
      }

      const update = vi.fn();
      document.addEventListener('nve-icon-check-badge', update);
      try {
        mergeIcons(Registered as unknown as typeof Icon);
        await expect.poll(() => update.mock.calls.length).toBe(1);

        expect(Registered._icons.book).toBe(catalog.book);
        expect(await Registered._icons['check-badge'].svg()).toContain('new-check-badge');
        expect(await Registered._icons['custom-icon'].svg()).toContain('custom-icon');
        expect(update).toHaveBeenCalledWith(expect.objectContaining({ detail: catalog['check-badge'] }));
      } finally {
        document.removeEventListener('nve-icon-check-badge', update);
      }
    }
  );

  it('should not merge icons for newer registered versions', () => {
    class Registered {
      static metadata = {
        version: '1.0.0'
      };

      static _icons: Record<string, { svg: () => string }> = {};
    }

    mergeIcons(Registered as unknown as typeof Icon);

    expect(Registered._icons.book).toBeUndefined();
  });
});
