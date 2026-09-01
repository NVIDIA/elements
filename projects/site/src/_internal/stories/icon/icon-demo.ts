// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, unsafeCSS } from 'lit';
import { state } from 'lit/decorators/state.js';
import { customElement } from 'lit/decorators/custom-element.js';

/* eslint-disable no-inline-css/no-restricted-imports */
import layout from '@nvidia-elements/styles/layout.css?inline';
import typography from '@nvidia-elements/styles/typography.css?inline';

import { ICON_NAMES, ICON_NAMES_SOLID } from '@nvidia-elements/core/icon';
import type { IconName } from '@nvidia-elements/core/icon';
import type { Size as IconSize } from '@nvidia-elements/core/internal';

import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/divider/define.js';
import '@nvidia-elements/core/notification/define.js';

@customElement('icon-demo')
export class IconDemo extends LitElement {
  static styles = [unsafeCSS(layout), unsafeCSS(typography)];

  @state() private iconSearchKey = '';

  render() {
    const iconNames = this.values.solid ? ICON_NAMES_SOLID : ICON_NAMES;

    return html`
    <style>
      :host {
        contain: initial;
      }

      nve-button {
        --border-radius: var(--nve-ref-border-radius-sm);
        --height: 100px;
      }
    </style>

    <nve-card>
      <nve-card-content>
        <div nve-layout="column gap:lg">
          <form @submit=${e => e.preventDefault()} @input=${this.#input} nve-layout="row gap:md align:vertical-center full">
            <nve-search style="width: 350px">
              <input type="search" @input=${e => (this.iconSearchKey = e.target.value)} aria-label="Search the Icon Catalog" placeholder="Search the Icon Catalog" />
            </nve-search>
            <nve-select style="--width: 90px; --text-transform: none">
              <select aria-label="size" .value=${this.values.size} name="size">
                <option value="xs">xs</option>
                <option value="sm">sm</option>
                <option value="">md</option>
                <option value="lg">lg</option>
                <option value="xl">xl</option>
              </select>
            </nve-select>
            <nve-select style="--width: 90px; --text-transform: none">
              <select aria-label="direction" .value=${this.values.direction} name="direction">
                <option value="">up</option>
                <option value="down">down</option>
                <option value="left">left</option>
                <option value="right">right</option>
              </select>
            </nve-select>
            <nve-checkbox>
              <label>solid icons</label>
              <input type="checkbox" .checked=${this.values.solid} name="solid" />
            </nve-checkbox>
            <nve-checkbox>
              <label>bounding box</label>
              <input type="checkbox" .checked=${this.values.outline} name="outline" />
            </nve-checkbox>
          </form>          

          <div nve-layout="grid gap:md span-items:2">
            ${iconNames
              .filter(iconName => iconName.includes(this.iconSearchKey))
              .map(
                iconName => html`
              <nve-button @click=${() => this.#copyIcon(iconName)} title="Copy '${iconName}' to clipboard." container="flat">
                <div nve-layout="column align:center gap:md">
                  <nve-icon ?outline=${this.values.outline} .appearance=${this.values.solid ? 'solid' : undefined} .size=${this.values.size as IconSize} .name=${iconName as IconName} .direction=${this.#getRotation(iconName, this.values.direction)}></nve-icon>
                  <h3 nve-text="label sm light muted">${iconName}</h3>
                </div>
              </nve-button>`
              )}
          </div>
        </div>
      </nve-card-content>
    </nve-card>
  `;
  }

  @state() values = { size: 'xl', outline: false, solid: false, direction: '' };

  get #form() {
    return this.shadowRoot.querySelector('form');
  }

  #getRotation(iconName, direction) {
    return iconName.includes('arrow') ||
      iconName.includes('chevron') ||
      iconName.includes('caret') ||
      iconName.includes('thumb')
      ? direction
      : '';
  }

  #input() {
    const form = this.#form;
    if (!form) return;

    const formData = new FormData(form);
    const size = formData.get('size');
    const direction = formData.get('direction');
    this.values = {
      size: typeof size === 'string' ? size : '',
      outline: formData.has('outline'),
      solid: formData.has('solid'),
      direction: typeof direction === 'string' ? direction : ''
    };
  }

  async #copyIcon(iconName: string) {
    const appearance = this.values.solid ? ' appearance="solid"' : '';
    const iconCode = `<nve-icon name="${iconName}"${appearance}></nve-icon>`;
    await navigator.clipboard.writeText(iconCode);

    const notification = globalThis.document.createElement('nve-notification');
    notification.closable = true;
    notification.closeTimeout = 2000;
    notification.innerHTML = `<h3 nve-text="label">Copied!</h3><p nve-text="body">${iconCode} icon code copied to clipboard.</p>`;
    notification.addEventListener('close', () => notification.remove(), { once: true });
    globalThis.document.querySelector('nve-notification-group')?.prepend(notification);
  }
}
