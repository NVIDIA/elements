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
import { ICON_IMPORTS } from './icons.js';
import styles from './icon.css?inline';

export type { IconName, IconNames, IconSVG } from './icons.js';

declare global {
  var _NVE_SSR_ICON_REGISTRY: Record<string, string> | undefined;
}

/**
 * @element nve-icon
 * @since 0.1.3
 * @entrypoint \@nvidia-elements/core/icon
 * @description An icon is a graphic symbol designed to visually show the purpose of an interface element.
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
   * The name of the icon SVG sprite to render.
   */
  @property({ type: String, reflect: true }) name?: IconName;

  @state() private svg: string;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-icon',
    version: '0.0.0'
  };

  static _icons: { [key: string]: IconSVG } = ICON_IMPORTS;

  // eslint-disable-next-line no-restricted-syntax
  private static get _iconsRegistry() {
    return this.registeredIcon?._icons ?? Icon._icons;
  }

  // eslint-disable-next-line no-restricted-syntax
  private static set _iconsRegistry(icons: { [key: string]: IconSVG }) {
    this.registeredIcon._icons = { ...Icon._iconsRegistry, ...icons };
  }

  // eslint-disable-next-line no-restricted-syntax
  private static get registeredIcon() {
    return customElements.get(Icon.metadata.tag) as typeof Icon;
  }

  /** @private */
  declare _internals: ElementInternals;

  get #iconString() {
    return isServer && globalThis._NVE_SSR_ICON_REGISTRY ? globalThis._NVE_SSR_ICON_REGISTRY[this.name!] : this.svg;
  }

  render() {
    return html`
      <div internal-host aria-hidden="true"><slot>${unsafeSVG(this.#iconString)}</slot></div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'img';
    globalThis?.document?.addEventListener(
      `${Icon.metadata.tag}-${this.name}`,
      this.#asyncRender.bind(this) as unknown as EventListener
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    globalThis?.document?.removeEventListener(
      `${Icon.metadata.tag}-${this.name}`,
      this.#asyncRender.bind(this) as unknown as EventListener
    );
  }

  static async add(icons: { [key: string]: IconSVG }) {
    if (globalThis.customElements?.whenDefined) {
      await globalThis.customElements.whenDefined(Icon.metadata.tag);
      Icon._iconsRegistry = icons;
      Object.keys(icons).forEach(name =>
        globalThis?.document?.dispatchEvent(new CustomEvent(`${Icon.metadata.tag}-${name}`, { detail: icons[name] }))
      );
    }
  }

  static alias(aliases: { [key: string]: IconName | string }) {
    // whenDefined has no rejection state
    if (globalThis.customElements?.whenDefined) {
      /* eslint-disable @typescript-eslint/no-floating-promises */
      globalThis.customElements.whenDefined(Icon.metadata.tag).then(() => {
        Object.keys(aliases).forEach(alias => {
          Icon._iconsRegistry[alias] = Icon._iconsRegistry[aliases[alias]!]!;
          globalThis?.document?.dispatchEvent(
            new CustomEvent(`${Icon.metadata.tag}-${alias}`, { detail: Icon._iconsRegistry[alias] })
          );
        });
      });
    }
  }

  async updated(props: PropertyValues<this>) {
    super.updated(props);
    await this.#render();
  }

  async #asyncRender(event: CustomEvent<IconSVG>) {
    if (this.isConnected && event.detail && this.svg !== (await event.detail.svg())) {
      this.#render();
    }
  }

  async #render() {
    if (!this.name) return;
    const svg = await (this.name.endsWith('.svg')
      ? fetch(this.name).then(res => res.text())
      : (Icon._iconsRegistry[this.name]?.svg() ?? Promise.resolve('')));
    Icon._iconsRegistry[this.name] = { svg: () => svg, ...Icon._iconsRegistry[this.name] };
    this.svg = svg;
  }
}

export function mergeIcons(RegisteredIcon: typeof Icon) {
  if (typeof globalThis.customElements?.get === 'function') {
    const registered = parseVersion(RegisteredIcon.metadata.version);
    const current = parseVersion('0.0.0');

    // determine if an older icon already registered and if so, merge the icons with the latest svgs
    if (registered.minor <= current.minor && registered.major <= current.major) {
      RegisteredIcon._icons = { ...RegisteredIcon._icons, ...ICON_IMPORTS };
    }
  }
}
