// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { IconSVG } from './icons.js';

export class IconRegistry {
  icons: Record<string, IconSVG> = Object.create(null);
  #aliases = new Map<string, string>();
  // Eager readers keep imported SVG bindings live while split chunks initialize.
  #strings = new Map<string, string | (() => string)>();
  #pending = new Map<string, Promise<string>>();
  #catalog?: Promise<Record<string, IconSVG>>;
  #providers = new Set<IconRegistry>();
  #importer: () => Promise<Record<string, IconSVG>>;

  constructor(importer: () => Promise<Record<string, IconSVG>> = () => import('./icons.js').then(m => m.ICON_IMPORTS)) {
    this.#importer = importer;
  }

  add(name: string, icon: IconSVG, svg?: string | (() => string)) {
    this.#aliases.delete(name);
    this.icons[name] = icon;
    this.#strings.delete(name);
    this.#pending.delete(name);
    if (svg !== undefined) this.#strings.set(name, svg);
    this.#notify(name);
  }

  alias(name: string, target: string) {
    this.#aliases.set(name, target);
    this.icons[name] = { svg: () => this.resolve(name) };
    this.#notify(name);
  }

  #target(input: string) {
    let name = input;
    const visited = new Set<string>();
    while (this.#aliases.has(name)) {
      if (visited.has(name)) return undefined;
      visited.add(name);
      const target = this.#aliases.get(name);
      if (!target) return undefined;
      name = target;
    }
    return name;
  }

  sync(name: string): string | undefined {
    const target = this.#target(name);
    const value = target ? this.#strings.get(target) : undefined;
    return typeof value === 'function' ? value() : value;
  }

  #notify(name: string, visited = new Set<string>()) {
    if (visited.has(name)) return;
    visited.add(name);
    globalThis.document?.dispatchEvent(new CustomEvent(`nve-icon-${name}`, { detail: this.icons[name] }));
    for (const [alias, target] of this.#aliases) {
      if (target === name) this.#notify(alias, visited);
    }
  }

  aliasEntries() {
    return this.#aliases.entries();
  }

  merge(other: IconRegistry) {
    if (other === this || this.#providers.has(other)) return;
    this.#providers.add(other);
    const aliases = new Map(other.aliasEntries());
    for (const [name, icon] of Object.entries(other.icons)) {
      if (!this.icons[name] && !aliases.has(name)) this.add(name, icon, other.sync(name));
    }
    for (const [name, target] of aliases) {
      if (!this.icons[name]) this.alias(name, target);
    }
  }

  loadCatalog(): Promise<Record<string, IconSVG>> {
    return (this.#catalog ??= this.#importer().catch(error => {
      this.#catalog = undefined;
      throw error;
    }));
  }

  async resolve(input: string): Promise<string> {
    const name = this.#target(input);
    if (!name) return '';
    const cached = this.sync(name);
    if (cached !== undefined) return cached;
    const existing = this.#pending.get(name);
    if (existing) return existing;
    const icon = this.icons[name];
    const promise = (async () => {
      let provider = icon;
      if (!provider) {
        for (const registry of [this, ...this.#providers]) {
          provider = (await registry.loadCatalog())[name];
          if (provider) break;
        }
      }
      const loaded = provider ? await provider.svg() : '';
      if (this.icons[name] !== icon) return this.resolve(name);
      const svg = this.sync(name) ?? loaded;
      if (provider && typeof svg === 'string') this.#strings.set(name, svg);
      return svg;
    })();
    this.#pending.set(name, promise);
    try {
      return await promise;
    } finally {
      if (this.#pending.get(name) === promise) this.#pending.delete(name);
    }
  }
}

export const iconRegistry = new IconRegistry();

function hasRegistry(value: unknown): value is { _registry: IconRegistry } {
  return typeof value === 'function' && '_registry' in value;
}

export function getIconRegistry() {
  const registered = globalThis.customElements?.get('nve-icon');
  const active = hasRegistry(registered) ? registered._registry : iconRegistry;
  active.merge(iconRegistry);
  return active;
}

/**
 * Registers an SVG from a generated icon entrypoint.
 * @internal
 */
export function registerIcon(name: string, svg: string | (() => string)) {
  const registry = getIconRegistry();
  const read = typeof svg === 'function' ? svg : () => svg;
  if (!registry.icons[name]) registry.add(name, { svg: read }, read);
  const registered = globalThis.customElements?.get('nve-icon');
  if (
    registered &&
    !hasRegistry(registered) &&
    '_icons' in registered &&
    registered._icons &&
    typeof registered._icons === 'object' &&
    !(name in registered._icons)
  ) {
    Reflect.set(registered._icons, name, { svg: read });
  }
}
