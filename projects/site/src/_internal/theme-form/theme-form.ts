import { html, LitElement, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';

/* eslint-disable no-inline-css/no-restricted-imports */
import layout from '@nvidia-elements/styles/layout.css?inline';
import typography from '@nvidia-elements/styles/typography.css?inline';
import responsive from '@nvidia-elements/styles/responsive.css?inline';

import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/color/define.js';
import '@nvidia-elements/core/range/define.js';
import '@nvidia-elements/core/switch/define.js';

import type { ThemePreviewSettings } from '../theme-preview/theme-preview.js';

@customElement('nvd-theme-form')
export class ThemeForm extends LitElement {
  static styles = [unsafeCSS(layout), unsafeCSS(typography), unsafeCSS(responsive)];

  @property({ type: Object })
  value: ThemePreviewSettings = {
    'color-scheme': 'dark',
    'ref-scale-border-radius': '1',
    'ref-scale-border-width': '1',
    'ref-scale-size': '1',
    'ref-scale-space': '1',
    'ref-scale-text': '1',
    'sys-support-accent-color': '#0a71f0',
    'rounded-buttons': 'on'
  };

  render() {
    return html`
      <form @input=${this.#input} nve-layout="column gap:lg align:stretch">
        <nve-select layout="horizontal" style="--label-width: 50%;">
          <label>Color Scheme</label>
          <select name="color-scheme">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="high-contrast">High Contrast</option>
          </select>
        </nve-select>
        <div nve-layout="row gap:md pad-bottom:lg">
          <nve-color layout="horizontal" style="--label-width: 50%;">
          <label>Accent Color</label>
          <input type="color" name="sys-support-accent-color" .value=${this.value['sys-support-accent-color']} />
          </nve-color>
        </div>
        <nve-range>
            <label>Text Scale</label>
            <input type="range" name="ref-scale-text" .value=${this.value['ref-scale-text']} min="0.5" max="1.5" step="0.05" />
        </nve-range>
        <div nve-layout="row gap:md">
          <nve-range>
            <label>Space Scale</label>
            <input type="range" name="ref-scale-space" .value=${this.value['ref-scale-space']} min="0.5" max="1.5" step="0.05" />
          </nve-range>

          <nve-range>
            <label>Size Scale</label>
            <input type="range" name="ref-scale-size" .value=${this.value['ref-scale-size']} min="0.5" max="1.5" step="0.05" />
          </nve-range>
        </div>
        <div nve-layout="row gap:md">
          <nve-range>
            <label>Border Radius Scale</label>
            <input type="range" name="ref-scale-border-radius" .value=${this.value['ref-scale-border-radius']} min="0" max="2" step="0.1" />
          </nve-range>

          <nve-range>
            <label>Border Width Scale</label>
            <input type="range" name="ref-scale-border-width" .value=${this.value['ref-scale-border-width']} min="0.5" max="2" step="0.5" />
          </nve-range>
        </div>
        <nve-switch>
          <label>Fully-Rounded Buttons</label>
          <input type="checkbox" name="rounded-buttons" checked />
        </nve-switch>
      </form>
    `;
  }

  #input() {
    const form = this.shadowRoot?.querySelector<HTMLFormElement>('form')!;
    this.value = Object.fromEntries(new FormData(form)) as unknown as ThemePreviewSettings;
    this.dispatchEvent(new CustomEvent('input', { detail: this.value }));
  }
}
