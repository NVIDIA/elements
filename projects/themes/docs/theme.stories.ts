import { html, css, LitElement, unsafeCSS } from 'lit';
import layout from '../../styles/dist/layout.css?inline';
import typography from '../../styles/dist/typography.css?inline';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/color/define.js';
import '@nvidia-elements/core/range/define.js';
import '@nvidia-elements/core/radio/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/textarea/define.js';
import '@nvidia-elements/core/date/define.js';
import '@nvidia-elements/core/switch/define.js';
import '@nvidia-elements/core/search/define.js';
import '@nvidia-elements/core/password/define.js';
import '@nvidia-elements/core/progress-ring/define.js';
import '@nvidia-elements/core/dot/define.js';
import '@nvidia-elements/core/page/define.js';
import '@nvidia-elements/core/page-header/define.js';
import '@nvidia-elements/core/logo/define.js';

export default {
  title: 'Foundations/Themes/Examples'
};

export const Default = {
  render: () => getThemeDemo('light')
}

export const Dark = {
  render: () => getThemeDemo('dark')
}

export const DefaultDebug = {
  render: () => getThemeDemo('light debug')
}

export const DarkDebug = {
  render: () => getThemeDemo('dark debug')
}

export const HighContrast = {
  render: () => getThemeDemo('high-contrast')
}

export const ReducedMotion = {
  render: () => html`
<style>
  @keyframes slide-demo {
    0% {
      left: 0;
    }

    50% {
      left: calc(100% - 25px);
    }

    100% {
      left: 0;
    }
  }

  .animation,
  .animation[nve-theme] {
    width: 150px;
    height: 50px;
    border: 1px solid #ccc;
    position: relative;
    padding: 0;
  }

  .animation div {
    width: 20px;
    height: 50px;
    background-color: #ccc;
    animation: slide-demo var(--nve-ref-animation-duration-400);
    animation-timing-function: var(--nve-ref-animation-easing-100);
    animation-iteration-count: infinite;
    animation-delay: 500ms;
    width: 25px;
    height: 50px;
    position: absolute;
    left: 0;
  }
</style>
<div nve-layout="row gap:md">
  <section nve-layout="column gap:sm">
    <code>nve-theme=""</code>
    <div class="animation" nve-theme="">
      <div></div>
    </div>
  </section>
  <section nve-layout="column gap:sm">
    <code>nve-theme="reduced-motion"</code>
    <div class="animation" nve-theme="reduced-motion">
      <div></div>
    </div>
  </section>
</div>`
}

function getThemeDemo(theme) {
  return html`
    <div nve-theme="root ${theme}" nve-layout="grid span-items:6 gap:md pad:md">
      <nve-card>${getThemeContent()}</nve-card>
      ${getThemeContent()}
    </div>
  `;
}

function getThemeContent() {
  return html`
    <div style="display: flex; flex-direction: column; gap: 24px; padding: 24px">
    <div nve-layout="row gap:sm">
        <nve-icon-button icon-name="person"></nve-icon-button>
        <nve-icon-button icon-name="person" interaction="emphasis"></nve-icon-button>
        <nve-icon-button icon-name="person" interaction="destructive"></nve-icon-button>
        <nve-icon-button icon-name="person" container="flat"></nve-icon-button>
        <nve-icon-button icon-name="person" disabled></nve-icon-button>
      </div>
      <div nve-layout="row gap:sm">
        <nve-icon name="person"></nve-icon>
        <nve-icon name="person" status="accent"></nve-icon>
        <nve-icon name="person" status="success"></nve-icon>
        <nve-icon name="person" status="warning"></nve-icon>
        <nve-icon name="person" status="danger"></nve-icon>
      </div>
      <div nve-layout="row gap:sm">
        <nve-button>default</nve-button>
        <nve-button interaction="emphasis">emphasis</nve-button>
        <nve-button interaction="destructive">destructive</nve-button>
        <nve-button disabled="">disabled</nve-button>
      </div>
      <div nve-layout="column gap:md">
        <nve-input>
          <label>label</label>
          <input type="text" value="text">
          <nve-control-message>message</nve-control-message>
        </nve-input>
        <nve-select>
          <label>label</label>
          <select>
            <option value="1">option 1</option>
            <option value="2">option 2</option>
            <option value="3">option 3</option>
          </select>
          <nve-control-message>message</nve-control-message>
        </nve-select>
      </div>
      <div nve-layout="column gap:md">
        <nve-alert>default</nve-alert>
        <nve-alert status="accent">accent</nve-alert>
        <nve-alert status="warning">warning</nve-alert>
        <nve-alert status="success">success</nve-alert>
        <nve-alert status="danger">danger</nve-alert>
      </div>
      <div nve-layout="column gap:md">
        <nve-alert-group>
          <nve-alert>default</nve-alert>
          <nve-alert>default</nve-alert>
        </nve-alert-group>

        <nve-alert-group status="accent">
          <nve-alert>accent</nve-alert>
          <nve-alert>accent</nve-alert>
        </nve-alert-group>

        <nve-alert-group status="warning">
          <nve-alert>warning</nve-alert>
          <nve-alert>warning</nve-alert>
        </nve-alert-group>

        <nve-alert-group status="success">
          <nve-alert>success</nve-alert>
          <nve-alert>success</nve-alert>
        </nve-alert-group>

        <nve-alert-group status="danger">
          <nve-alert>danger</nve-alert>
          <nve-alert>danger</nve-alert>
        </nve-alert-group>
      </div>
    </div>
    `;
}

class ThemeGeneratorDemo extends LitElement {
  static styles = [unsafeCSS(layout), unsafeCSS(typography), css`
    :host {
      display: contents;
    }
  `];

  static properties = {
    formValues: {
      state: {
        'sys-accent-primary-background': '#63a600',
        'sys-accent-secondary-background': '#006adc',
        'ref-scale-border-radius': 1,
        'ref-scale-border-width': 1,
        'ref-scale-space': 1,
        'ref-scale-size': 1,
        'ref-scale-text': 1,
      }
    }
  }

  formValues = {
    state: {
      'sys-accent-primary-background': '#63a600',
      'sys-accent-secondary-background': '#006adc',
      'ref-scale-border-radius': 1,
      'ref-scale-border-width': 1,
      'ref-scale-space': 1,
      'ref-scale-size': 1,
      'ref-scale-text': 1,
    }
  }

  render() {
    return html`
<nve-page>
  <nve-page-header slot="header">
    <nve-logo slot="prefix" size="sm"></nve-logo>
    <h2 slot="prefix">Infrastructure</h2>
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
          <input type="range" name="ref-scale-space" .value=${this.formValues['ref-space-scale']} min="0.5" max="2" step="0.1" />
        </nve-range>

        <nve-range>
          <label>Size Scale</label>
          <input type="range" name="ref-scale-size" .value=${this.formValues['ref-size-scale']} min="0.5" max="1.5" step="0.1" />
        </nve-range>

        <nve-range>
          <label>Text Scale</label>
          <input type="range" name="ref-scale-text" .value=${this.formValues['ref-text-scale']} min="0.5" max="1.5" step="0.1" />
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
          <div slot="title">Title</div>
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
    const values = Object.fromEntries(new FormData(form as any)) as any;
    this.#setFormValues(values);
  }

  #random() {
    const color = getRandomColor();
    this.#setFormValues({
      'sys-accent-primary-background': color,
      'sys-accent-secondary-background': color,
      'sys-support-accent-emphasis-color': color,
      'ref-scale-border-radius': getRandomDecimal(0, 1.5, 2),
      'ref-scale-border-width': getRandomDecimal(1, 3, 0),
      'ref-scale-space': getRandomDecimal(0.8, 1.5, 2),
      'ref-scale-size': getRandomDecimal(0.9, 1.5, 2),
      'ref-scale-text': getRandomDecimal(0.9, 1.5, 2),
    });
  }

  #setFormValues(formValues) {
    this.formValues = {
      ...formValues,
      'sys-support-accent-emphasis-color': formValues['sys-accent-secondary-background']
    };

    Object.keys(this.formValues).forEach(prop => {
      document.documentElement.style.setProperty(`--nve-${prop}`, this.formValues[prop]);
    });
  }
}

function getRandomColor() {
  const hue = getRandomDecimal(0, 100, 0);
  const saturation = getRandomDecimal(0, 100, 0);
  const lightness = getRandomDecimal(0, 100, 0);
  return hsltohex(hue, saturation, lightness);
}

function hsltohex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function getRandomDecimal(min, max, decimalPlaces) {
  const rand = Math.random() * (max - min) + min;
  const power = Math.pow(10, decimalPlaces);
  return Math.floor(rand * power) / power;
}

customElements.get('nve-demo-theme-generator') || customElements.define('nve-demo-theme-generator', ThemeGeneratorDemo);

export const ThemeGenerator = {
  render: () => html`
  <style>
    body,
    #storybook-root,
    #root-inner {
      padding: 0 !important;
      height: 100% !important;
    }
  </style>
  <div nve-theme="root">
    <nve-demo-theme-generator></nve-demo-theme-generator>
  </div>
  `
}
