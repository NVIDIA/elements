// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PropertyValues } from 'lit';
import { html, isServer, LitElement } from 'lit';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import type { Size } from '@nvidia-elements/core/internal';
import { attachInternals, parseVersion, useStyles } from '@nvidia-elements/core/internal';
import type { IconName, IconSVG } from './icons.js';
import { iconRegistry, getIconRegistry } from './registry.js';
import { ICON_NAMES_SOLID } from './names.js';
import styles from './icon.css?inline';

export type { IconName, IconSVG } from './icons.js';

declare global {
  var _NVE_SSR_ICON_REGISTRY: Record<string, string> | undefined;
}

/**
 * @element nve-icon
 * @since 0.1.3
 * @entrypoint \@nvidia-elements/core/icon
 * @description An icon is a graphic symbol designed to visually show the purpose of an interface element.
 * Import `@nvidia-elements/core/icon/icons/person.js` to register one SVG before rendering.
 * Import `person-solid.js` separately for solid appearance. Missing names load the built-in catalog on demand.
 * Explicit imports reduce initial loading in application builds; the full browser bundle remains a single file.
 * @documentation https://nvidia.github.io/elements/docs/elements/icon/
 * @cssprop --color
 * @cssprop --width
 * @cssprop --height
 * @slot - Custom SVG content to override the named icon
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
 */
export class Icon extends LitElement {
  /**
   * Visual treatment to represent current support status.
   */
  @property({ type: String, reflect: true }) status?: 'warning' | 'danger' | 'success' | 'accent';

  /**
   * Controls the bounding box size of the icon given a t-shirt style value.
   */
  @property({ type: String, reflect: true }) size?: Size | 'xs' | 'xl';

  /**
   * Sets the direction of the icon. Only supported by expand-panel/collapse-panel (horizontal axis) and arrow/caret/chevron icons (4-directions)
   */
  @property({ type: String, reflect: true }) direction?: 'up' | 'down' | 'left' | 'right';

  /**
   * Selects the outline or solid form of the named icon. Solid icons use an optional `-solid` asset and fall back to
   * the outline form when that asset is unavailable.
   */
  @property({ type: String }) appearance?: 'outline' | 'solid';

  /**
   * The name of the icon SVG sprite to render.
   */
  @property({ type: String, reflect: true }) name?: IconName;

  @state() private svg: string;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-icon',
    version: '0.0.0'
  };

  static _registry = iconRegistry;

  static get _icons() {
    return getIconRegistry().icons;
  }

  static set _icons(icons: Record<string, IconSVG>) {
    getIconRegistry().icons = icons;
  }

  /** @private */
  declare _internals: ElementInternals;

  get #resolvedIconName() {
    if (!this.name || this.name.endsWith('.svg') || this.appearance !== 'solid' || this.name.endsWith('-solid')) {
      return this.name;
    }

    const solidName = `${this.name}-solid`;
    return getIconRegistry().icons[solidName] ||
      ICON_NAMES_SOLID.includes(this.name as (typeof ICON_NAMES_SOLID)[number])
      ? solidName
      : this.name;
  }

  get #iconString() {
    const iconName = this.#resolvedIconName;
    if (!isServer || !iconName) return this.svg;
    const registry = getIconRegistry();
    return (
      registry.sync(iconName) ??
      globalThis._NVE_SSR_ICON_REGISTRY?.[iconName] ??
      (this.name ? (registry.sync(this.name) ?? globalThis._NVE_SSR_ICON_REGISTRY?.[this.name]) : undefined)
    );
  }

  #iconRegistryEventNames: string[] = [];

  #renderRequest = 0;

  #onIconRegistryUpdate = () => {
    if (this.isConnected) void this.#render();
  };

  render() {
    return html`
      <div internal-host aria-hidden="true"><slot>${unsafeSVG(this.#iconString)}</slot></div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'img';
    this.#addIconRegistryListener();
    if (this.hasUpdated) void this.#render();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#removeIconRegistryListener();
    this.#renderRequest++;
  }

  static async add(icons: { [key: string]: IconSVG }) {
    if (globalThis.customElements?.whenDefined) {
      await globalThis.customElements.whenDefined(Icon.metadata.tag);
      for (const [name, icon] of Object.entries(icons)) getIconRegistry().add(name, icon);
    }
  }

  static alias(aliases: { [key: string]: IconName | string }) {
    // whenDefined has no rejection state
    if (globalThis.customElements?.whenDefined) {
      /* eslint-disable @typescript-eslint/no-floating-promises */
      globalThis.customElements.whenDefined(Icon.metadata.tag).then(() => {
        for (const [name, target] of Object.entries(aliases)) getIconRegistry().alias(name, target);
      });
    }
  }

  async updated(props: PropertyValues<this>) {
    super.updated(props);
    if (props.has('name') || props.has('appearance')) {
      this.#removeIconRegistryListener();
      this.#addIconRegistryListener();
    }
    await this.#render();
  }

  #addIconRegistryListener() {
    if (!this.isConnected || !this.name || this.#iconRegistryEventNames.length) return;
    this.#iconRegistryEventNames = [this.name, `${this.name}-solid`].map(name => `nve-icon-${name}`);
    for (const name of this.#iconRegistryEventNames)
      globalThis.document.addEventListener(name, this.#onIconRegistryUpdate);
  }

  #removeIconRegistryListener() {
    for (const name of this.#iconRegistryEventNames)
      globalThis.document.removeEventListener(name, this.#onIconRegistryUpdate);
    this.#iconRegistryEventNames = [];
  }

  async #render() {
    const renderRequest = ++this.#renderRequest;
    const iconName = this.#resolvedIconName;
    if (isServer) return;
    try {
      const svg = !iconName
        ? ''
        : await (iconName.endsWith('.svg')
            ? fetch(iconName).then(res => res.text())
            : getIconRegistry().resolve(iconName));
      if (renderRequest === this.#renderRequest && this.isConnected) this.svg = svg;
    } catch {
      if (renderRequest === this.#renderRequest && this.isConnected) this.svg = '';
    }
  }
}

export function mergeIcons(RegisteredIcon: typeof Icon) {
  if (typeof globalThis.customElements?.get === 'function') {
    if (RegisteredIcon._registry === iconRegistry) return;
    const registered = parseVersion(RegisteredIcon.metadata.version);
    const current = parseVersion(Icon.metadata.version);
    const difference =
      current.major - registered.major || current.minor - registered.minor || current.patch - registered.patch;

    // A different compatible registry needs updated providers, cache invalidation, and render notifications.
    if (difference >= 0) {
      RegisteredIcon._registry?.merge(iconRegistry);
      void iconRegistry
        .loadCatalog()
        .then(icons => RegisteredIcon.add(icons))
        .catch(() => {});
    }
  }
}
