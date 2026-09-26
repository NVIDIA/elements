// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { useStyles } from '@nvidia-elements/core/internal';
import { customElement } from 'lit/decorators/custom-element.js';
import type { PreferencesInputValue } from '@nvidia-elements/core/preferences-input';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/switch/define.js';
import '@nvidia-elements/core/tooltip/define.js';
import '@nvidia-elements/core/toggletip/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/preferences-input/define.js';
import styles from './system-settings.css?inline';

@customElement('nvd-system-settings')
export class SystemSettings extends LitElement {
  get #globals() {
    return {
      theme: 'dark',
      font: '',
      scale: '',
      debug: '',
      classic: '',
      animation: '',
      layer: '',
      sourceType: 'html',
      showAdvancedApi: '',
      ...JSON.parse(localStorage.getItem('elements-sb-globals') ?? '{}')
    };
  }

  set #globals(globals: Record<string, string>) {
    try {
      localStorage.setItem('elements-sb-globals', JSON.stringify({ ...this.#globals, ...globals }));
    } catch (error) {
      console.error('Could not store globals in local storage:', error);
    }
  }

  static styles = useStyles([styles]);

  #updatePreferences(event: Event) {
    const preferences = (event.target as unknown as { value: FormData }).value as PreferencesInputValue;
    this.#writeGlobals({
      theme: preferences['color-scheme'] as string,
      scale: preferences['scale'] === 'default' ? '' : (preferences['scale'] as string),
      animation: preferences['reduced-motion'] ? 'reduced-motion' : ''
    });
  }

  render() {
    return html`
      <form internal-host>
        <nve-preferences-input
          @change=${(e: Event) => this.#updatePreferences(e)}
          .value=${{
            'color-scheme': this.#globals.theme,
            'reduced-motion': this.#globals.animation === 'reduced-motion',
            scale: this.#globals.scale === '' ? 'default' : this.#globals.scale
          }}></nve-preferences-input>
        <div nve-layout="row align:vertical-center gap:xs">
          <nve-switch>
            <label>Classic</label>
            <input type="checkbox" value="classic" .checked=${this.#globals.classic === 'classic'} @change=${(e: { target: HTMLInputElement }) => this.#writeGlobals({ classic: e.target.checked ? 'classic' : '' })} />
          </nve-switch>
          <nve-icon-button type="button" popovertarget="classic-theme-toggletip" size="sm" container="inline" icon-name="information-circle" aria-label="About the classic theme"></nve-icon-button>
        </div>
        <nve-divider></nve-divider>
        <nve-select container="flat" style="--border-bottom: 0; --min-width: 170px">
          <label>Layer Background</label>
          <nve-icon-button slot="label" popovertarget="demo-layer-tooltip" size="sm" container="flat" icon-name="information-circle" style="--height: 12px"></nve-icon-button>
          <select size="3" @change=${(e: { target: HTMLInputElement }) => this.#writeGlobals({ layer: e.target.value })}>
            <option ?selected=${this.#globals.layer === ''} value="">Canvas</option>
            <option ?selected=${this.#globals.layer === 'container'} value="container">Container</option>
          </select>
        </nve-select>
        <nve-divider></nve-divider>
        <nve-switch-group>
          <label>Variants</label>
          <nve-switch>
            <label>Debug</label>
            <input type="checkbox" value="debug" .checked=${this.#globals.debug === 'debug'} @change=${(e: { target: HTMLInputElement }) => this.#writeGlobals({ debug: e.target.checked ? 'debug' : '' })} />
          </nve-switch>
          <nve-switch>
            <label>Show Advanced API</label>
            <input type="checkbox" value="show-advanced-api" .checked=${this.#globals.showAdvancedApi === 'show-advanced-api'} @change=${(e: { target: HTMLInputElement }) => this.#writeGlobals({ showAdvancedApi: e.target.checked ? 'show-advanced-api' : '' })} />
          </nve-switch>
        </nve-switch-group>
      </form>
      <nve-tooltip id="demo-layer-tooltip" position="left">The background layer color for examples and how they are displayed in the browser.</nve-tooltip>
      <nve-toggletip id="classic-theme-toggletip" position="left">
        Learn about the <a href="/docs/foundations/themes/custom/#classic-theme" nve-text="link">classic theme</a>.
      </nve-toggletip>
    `;
  }

  #writeGlobals(update: Record<string, string>) {
    const globals = { ...this.#globals, ...update };
    const colorScheme =
      globals.theme === 'auto'
        ? globalThis.matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'dark'
        : globals.theme;
    const themes = [
      colorScheme,
      globals.classic === 'classic' ? (colorScheme === 'dark' ? 'classic-dark' : 'classic') : '',
      globals.font,
      globals.scale,
      globals.debug,
      globals.animation,
      globals.experimental,
      globals.systemOptions
    ]
      .filter(i => i !== '')
      .join(' ')
      .trim();
    this.requestUpdate();

    this.#globals = globals;
    const classicStylesheet = globalThis.document.querySelector<HTMLLinkElement>('#classic-theme-stylesheet');
    if (globals.classic === 'classic' && !classicStylesheet) {
      const link = globalThis.document.createElement('link');
      link.id = 'classic-theme-stylesheet';
      link.rel = 'stylesheet';
      link.href = new URL('static/themes/classic.css', globalThis.document.baseURI).href;
      globalThis.document.head.append(link);
    } else if (globals.classic !== 'classic') {
      classicStylesheet?.remove();
    }
    globalThis.document.documentElement.setAttribute('nve-theme', themes);
    globalThis.document.documentElement.setAttribute('nve-layer', globals.layer);
    globalThis.document.documentElement.setAttribute('show-advanced-api', globals.showAdvancedApi);
    globalThis.document.dispatchEvent(new CustomEvent('nve-theme-change', { detail: { theme: themes } }));
    globalThis.document.querySelectorAll('iframe').forEach(iframe => {
      iframe.contentWindow?.document.documentElement.setAttribute('nve-theme', themes);
      iframe.contentWindow?.document.documentElement.setAttribute('nve-layer', globals.layer);
      iframe.contentWindow?.document.documentElement.setAttribute('show-advanced-api', globals.showAdvancedApi);
    });
  }
}
