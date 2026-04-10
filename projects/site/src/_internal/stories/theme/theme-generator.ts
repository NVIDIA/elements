// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, unsafeCSS, css } from 'lit';
import { state } from 'lit/decorators/state.js';
import { customElement } from 'lit/decorators/custom-element.js';

/* eslint-disable no-inline-css/no-restricted-imports */
import layout from '@nvidia-elements/styles/layout.css?inline';
import typography from '@nvidia-elements/styles/typography.css?inline';

import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/switch/define.js';
import '@nvidia-elements/core/radio/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/textarea/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/password/define.js';
import '@nvidia-elements/core/range/define.js';
import '@nvidia-elements/core/color/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/progress-ring/define.js';
import '@nvidia-elements/core/dot/define.js';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/logo/define.js';

interface ThemeValues {
  'sys-accent-primary-background': string;
  'sys-accent-secondary-background': string;
  'sys-support-accent-emphasis-color'?: string;
  'ref-scale-border-radius': number;
  'ref-scale-border-width': number;
  'ref-scale-space': number;
  'ref-scale-size': number;
  'ref-scale-text': number;
  [key: string]: string | number | undefined;
}

@customElement('theme-generator-demo')
export class ThemeGeneratorDemo extends LitElement {
  static styles = [
    unsafeCSS(layout),
    unsafeCSS(typography),
    css`
      :host {
        display: contents;
      }
    `
  ];

  @state() private formValues: ThemeValues = {
    'sys-accent-primary-background': '#63a600',
    'sys-accent-secondary-background': '#006adc',
    'ref-scale-border-radius': 1,
    'ref-scale-border-width': 1,
    'ref-scale-space': 1,
    'ref-scale-size': 1,
    'ref-scale-text': 1
  };

  render() {
    return html`
      <nve-page>
        <nve-page-header slot="header">
          <nve-logo slot="prefix" size="sm"></nve-logo>
          <h2 nve-text="heading" slot="prefix">Infrastructure</h2>
          <nve-button selected container="flat">Link 1</nve-button>
          <nve-button container="flat">Link 2</nve-button>
          <nve-icon-button interaction="emphasis" slot="suffix" size="sm">EL</nve-icon-button>
        </nve-page-header>

        <nve-alert-group slot="header" status="accent" prominence="emphasis" container="full">
          <nve-alert closable>banner message</nve-alert>
        </nve-alert-group>

        <nve-page-panel slot="left" expanded size="sm">
          <nve-page-panel-header>
            <h3 nve-text="heading medium sm">Theme Options</h3>
          </nve-page-panel-header>
          <nve-page-panel-content>
            <form @input=${this.#input} nve-layout="column gap:lg">
              <nve-color>
                <label>Color</label>
                <input type="color" name="sys-accent-secondary-background" .value=${this.formValues['sys-accent-secondary-background']} />
              </nve-color>

              <nve-range>
                <label>Space Scale</label>
                <input type="range" name="ref-scale-space" .value=${this.formValues['ref-scale-space']} min="0.5" max="2" step="0.1" />
              </nve-range>

              <nve-range>
                <label>Size Scale</label>
                <input type="range" name="ref-scale-size" .value=${this.formValues['ref-scale-size']} min="0.5" max="1.5" step="0.1" />
              </nve-range>

              <nve-range>
                <label>Text Scale</label>
                <input type="range" name="ref-scale-text" .value=${this.formValues['ref-scale-text']} min="0.5" max="1.5" step="0.1" />
              </nve-range>

              <nve-range>
                <label>Border Radius Scale</label>
                <input type="range" name="ref-scale-border-radius" .value=${this.formValues['ref-scale-border-radius']} min="0" max="1.5" step="0.1" />
              </nve-range>

              <nve-range>
                <label>Border Width Scale</label>
                <input type="range" name="ref-scale-border-width" .value=${this.formValues['ref-scale-border-width']} min="0.5" max="3" step="0.5" />
              </nve-range>

              <nve-button type="button" @click=${this.#random} style="position: fixed; bottom: 24px;">random</nve-button>
            </form>
          </nve-page-panel-content>
        </nve-page-panel>

        <main nve-layout="column gap:lg pad:lg full align:horizontal-stretch">
          <nve-card>
            <nve-card-header>
              <h2 nve-text="heading sm medium">Title</h2>
            </nve-card-header>
            <nve-card-content>
              <div nve-layout="column gap:lg">
                <div nve-layout="row gap:lg align:vertical-center">
                  <nve-alert status="accent">alert message</nve-alert>
                  <nve-icon status="accent" name="person"></nve-icon>
                  <nve-dot status="accent"></nve-dot>
                  <nve-progress-ring status="accent" size="sm"></nve-progress-ring>
                </div>
                <nve-input layout="horizontal-inline">
                  <label>text label</label>
                  <input />
                  <nve-control-message>message</nve-control-message>
                </nve-input>

                <nve-password layout="horizontal-inline">
                  <label>password label</label>
                  <input type="password" value="123456" autocomplete="off" />
                  <nve-control-message>message</nve-control-message>
                </nve-password>

                <nve-select layout="horizontal-inline">
                  <label>select label</label>
                  <select>
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                    <option value="3">Option 3</option>
                  </select>
                  <nve-control-message>message</nve-control-message>
                </nve-select>

                <nve-checkbox-group layout="horizontal-inline">
                  <label>checkbox group label</label>
                  <nve-checkbox>
                    <label>checkbox 1</label>
                    <input type="checkbox" checked />
                  </nve-checkbox>

                  <nve-checkbox>
                    <label>checkbox 2</label>
                    <input type="checkbox" />
                  </nve-checkbox>

                  <nve-checkbox>
                    <label>checkbox 3</label>
                    <input type="checkbox" />
                  </nve-checkbox>
                </nve-checkbox-group>

                <nve-radio-group layout="horizontal-inline">
                  <label>radio group label</label>
                  <nve-radio>
                    <label>radio 1</label>
                    <input type="radio" checked />
                  </nve-radio>

                  <nve-radio>
                    <label>radio 2</label>
                    <input type="radio" />
                  </nve-radio>

                  <nve-radio>
                    <label>radio 3</label>
                    <input type="radio" />
                  </nve-radio>
                </nve-radio-group>

                <nve-switch-group layout="horizontal-inline">
                  <label>switch group label</label>
                  <nve-switch>
                    <label>switch 1</label>
                    <input type="checkbox" />
                  </nve-switch>

                  <nve-switch>
                    <label>switch 2</label>
                    <input type="checkbox" checked />
                  </nve-switch>
                </nve-switch-group>

                <nve-textarea layout="horizontal-inline">
                  <label>textarea label</label>
                  <textarea></textarea>
                  <nve-control-message>message</nve-control-message>
                </nve-textarea>
              </div>
            </nve-card-content>
            <nve-card-footer>
              <div nve-layout="row gap:xs full">
                <nve-button style="margin-left: auto">button</nve-button>
              </div>
            </nve-card-footer>
          </nve-card>
        </main>
      </nve-page>
    `;
  }

  #input() {
    const form = this.shadowRoot?.querySelector('form');
    if (!form) return;

    const formData = new FormData(form as HTMLFormElement);
    const values: Record<string, string | number> = {};

    formData.forEach((value, key) => {
      if (typeof value !== 'string') return;
      const numValue = Number(value);
      values[key] = isNaN(numValue) ? value : numValue;
    });

    this.#setFormValues(values);
  }

  #random() {
    const color = this.#getRandomColor();
    this.#setFormValues({
      'sys-accent-primary-background': color,
      'sys-accent-secondary-background': color,
      'sys-support-accent-emphasis-color': color,
      'ref-scale-border-radius': this.#getRandomDecimal(0, 1.5, 2),
      'ref-scale-border-width': this.#getRandomDecimal(1, 3, 0),
      'ref-scale-space': this.#getRandomDecimal(0.8, 1.5, 2),
      'ref-scale-size': this.#getRandomDecimal(0.9, 1.5, 2),
      'ref-scale-text': this.#getRandomDecimal(0.9, 1.5, 2)
    });
  }

  #setFormValues(values: Record<string, string | number>) {
    this.formValues = {
      ...this.formValues,
      ...values,
      'sys-support-accent-emphasis-color': values['sys-accent-secondary-background']
    } as ThemeValues;

    Object.entries(this.formValues).forEach(([prop, value]) => {
      globalThis.document.documentElement.style.setProperty(`--nve-${prop}`, String(value));
    });
  }

  #getRandomColor(): string {
    const hue = this.#getRandomDecimal(0, 100, 0);
    const saturation = this.#getRandomDecimal(0, 100, 0);
    const lightness = this.#getRandomDecimal(0, 100, 0);
    return this.#hsltohex(hue, saturation, lightness);
  }

  #hsltohex(h: number, s: number, l: number): string {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  #getRandomDecimal(min: number, max: number, decimalPlaces: number): number {
    const rand = Math.random() * (max - min) + min;
    const power = Math.pow(10, decimalPlaces);
    return Math.floor(rand * power) / power;
  }
}
