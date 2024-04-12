import { html, css, LitElement, unsafeCSS } from 'lit';
import { state } from 'lit/decorators/state.js';
import layout from '@elements/elements/css/module.layout.css?inline';
import typography from '@elements/elements/css/module.typography.css?inline';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/icon/define.js';
import '@nvidia-elements/core/icon-button/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/app-header/define.js';
import '@nvidia-elements/core/panel/define.js';
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
  .animation[mlv-theme] {
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
    animation: slide-demo var(--mlv-ref-animation-duration-400);
    animation-timing-function: var(--mlv-ref-animation-easing-100);
    animation-iteration-count: infinite;
    animation-delay: 500ms;
    width: 25px;
    height: 50px;
    position: absolute;
    left: 0;
  }
</style>
<div mlv-layout="row gap:md">
  <section mlv-layout="column gap:sm">
    <code>mlv-theme=""</code>
    <div class="animation" mlv-theme="">
      <div></div>
    </div>
  </section>
  <section mlv-layout="column gap:sm">
    <code>mlv-theme="reduced-motion"</code>
    <div class="animation" mlv-theme="reduced-motion">
      <div></div>
    </div>
  </section>
</div>`
}

function getThemeDemo(theme) {
  return html`
    <div mlv-theme="root ${theme}" mlv-layout="grid span-items:6 gap:md pad:md">
      <mlv-card>${getThemeContent()}</mlv-card>
      ${getThemeContent()}
    </div>
  `;
}

function getThemeContent() {
  return html`
    <div style="display: flex; flex-direction: column; gap: 24px; padding: 24px">
    <div mlv-layout="row gap:sm">
        <mlv-icon-button icon-name="person"></mlv-icon-button>
        <mlv-icon-button icon-name="person" interaction="emphasis"></mlv-icon-button>
        <mlv-icon-button icon-name="person" interaction="destructive"></mlv-icon-button>
        <mlv-icon-button icon-name="person" container="flat"></mlv-icon-button>
        <mlv-icon-button icon-name="person" disabled></mlv-icon-button>
      </div>
      <div mlv-layout="row gap:sm">
        <mlv-icon name="person"></mlv-icon>
        <mlv-icon name="person" status="accent"></mlv-icon>
        <mlv-icon name="person" status="success"></mlv-icon>
        <mlv-icon name="person" status="warning"></mlv-icon>
        <mlv-icon name="person" status="danger"></mlv-icon>
      </div>
      <div mlv-layout="row gap:sm">
        <mlv-button>default</mlv-button>
        <mlv-button interaction="emphasis">emphasis</mlv-button>
        <mlv-button interaction="destructive">destructive</mlv-button>
        <mlv-button disabled="">disabled</mlv-button>
      </div>
      <div mlv-layout="column gap:md">
        <mlv-input>
          <label>label</label>
          <input type="text" value="text">
          <mlv-control-message>message</mlv-control-message>
        </mlv-input>
        <mlv-select>
          <label>label</label>
          <select>
            <option value="1">option 1</option>
            <option value="2">option 2</option>
            <option value="3">option 3</option>
          </select>
          <mlv-control-message>message</mlv-control-message>
        </mlv-select>
      </div>
      <div mlv-layout="column gap:md">
        <mlv-alert>default</mlv-alert>
        <mlv-alert status="accent">accent</mlv-alert>
        <mlv-alert status="warning">warning</mlv-alert>
        <mlv-alert status="success">success</mlv-alert>
        <mlv-alert status="danger">danger</mlv-alert>
      </div>
      <div mlv-layout="column gap:md">
        <mlv-alert-group>
          <mlv-alert>default</mlv-alert>
          <mlv-alert>default</mlv-alert>
        </mlv-alert-group>

        <mlv-alert-group status="accent">
          <mlv-alert>accent</mlv-alert>
          <mlv-alert>accent</mlv-alert>
        </mlv-alert-group>

        <mlv-alert-group status="warning">
          <mlv-alert>warning</mlv-alert>
          <mlv-alert>warning</mlv-alert>
        </mlv-alert-group>

        <mlv-alert-group status="success">
          <mlv-alert>success</mlv-alert>
          <mlv-alert>success</mlv-alert>
        </mlv-alert-group>

        <mlv-alert-group status="danger">
          <mlv-alert>danger</mlv-alert>
          <mlv-alert>danger</mlv-alert>
        </mlv-alert-group>
      </div>
    </div>
    `;
}

class ThemeGeneratorDemo extends LitElement {
  static styles = [unsafeCSS(layout), unsafeCSS(typography), css`
    :host {
      display: contents;
    }

    mlv-panel {
      min-width: 360px;
      z-index: 99;
      height: 100vh;
      position: sticky;
      top: 0;
    }
  `];

  @state() private formValues = {
    'sys-accent-primary-background': '#63a600',
    'sys-accent-secondary-background': '#006adc',
    'ref-scale-border-radius': 1,
    'ref-scale-border-width': 1,
    'ref-scale-space': 1,
    'ref-scale-size': 1,
    'ref-scale-text': 1,
  };

  render() {
    return html`
<div mlv-layout="column" style="height: 100%">
  <mlv-app-header>
    <mlv-logo></mlv-logo>
    <h2 slot="title">Theme Generator</h2>
    <mlv-button slot="nav-items" active>Link 1</mlv-button>
    <mlv-button slot="nav-items">Link 2</mlv-button>
    <mlv-icon-button icon-name="assist" slot="nav-actions"></mlv-icon-button>
    <mlv-icon-button icon-name="app-switcher" slot="nav-actions"></mlv-icon-button>
    <mlv-icon-button interaction="emphasis" slot="nav-actions" size="sm">EL</mlv-icon-button>
  </mlv-app-header>

  <mlv-alert-group status="accent" prominence="emphasis" container="full">
    <mlv-alert closable>banner message</mlv-alert>
  </mlv-alert-group>

  <div mlv-layout="row" style="width: 100%;">
    <mlv-panel expanded>
      <mlv-panel-header>
        <h2 slot="title">Theme Options</h2>
      </mlv-panel-header>
      <mlv-panel-content>
        <form @input=${this.#input} mlv-layout="column gap:lg">
          <mlv-color>
            <label>Color</label>
            <input type="color" name="sys-accent-secondary-background" .value=${this.formValues['sys-accent-secondary-background']} />
          </mlv-color>

          <mlv-range>
            <label>Space Scale</label>
            <input type="range" name="ref-scale-space" .value=${this.formValues['ref-space-scale']} min="0.5" max="2" step="0.1" />
          </mlv-range>

          <mlv-range>
            <label>Size Scale</label>
            <input type="range" name="ref-scale-size" .value=${this.formValues['ref-size-scale']} min="0.5" max="1.5" step="0.1" />
          </mlv-range>

          <mlv-range>
            <label>Text Scale</label>
            <input type="range" name="ref-scale-text" .value=${this.formValues['ref-text-scale']} min="0.5" max="1.5" step="0.1" />
          </mlv-range>

          <mlv-range>
            <label>Border Radius Scale</label>
            <input type="range" name="ref-scale-border-radius" .value=${this.formValues['ref-scale-border-radius']} min="0" max="1.5" step="0.1" />
          </mlv-range>

          <mlv-range>
            <label>Border Width Scale</label>
            <input type="range" name="ref-scale-border-width" .value=${this.formValues['ref-scale-border-width']} min="0.5" max="3" step="0.5" />
          </mlv-range>

          <mlv-button type="button" @click=${this.#random} style="position: fixed; bottom: 24px;">random</mlv-button>
        </form>
      </mlv-panel-content>
    </mlv-panel>

    <main mlv-layout="column gap:lg pad:lg full align:horizontal-stretch">
      <h1 mlv-text="heading lg">Heading</h1>
        <mlv-card>
          <mlv-card-header>
            <div slot="title">Title</div>
          </mlv-card-header>
          <mlv-card-content>
            <div mlv-layout="column gap:lg">
              <div mlv-layout="row gap:lg align:vertical-center">
                <mlv-alert status="accent">alert message</mlv-alert>
                <mlv-icon status="accent" name="person"></mlv-icon>
                <mlv-dot status="accent"></mlv-dot>
                <mlv-progress-ring status="accent" size="sm"></mlv-progress-ring>
              </div>
              <mlv-input layout="horizontal-inline">
                <label>text label</label>
                <input />
                <mlv-control-message>message</mlv-control-message>
              </mlv-input>

              <mlv-password layout="horizontal-inline">
                <label>password label</label>
                <input type="password" value="123456" autocomplete="off" />
                <mlv-control-message>message</mlv-control-message>
              </mlv-password>

              <mlv-select layout="horizontal-inline">
                <label>select label</label>
                <select>
                  <option value="1">Option 1</option>
                  <option value="2">Option 2</option>
                  <option value="3">Option 3</option>
                </select>
                <mlv-control-message>message</mlv-control-message>
              </mlv-select>

              <mlv-checkbox-group layout="horizontal-inline">
                <label>checkbox group label</label>
                <mlv-checkbox>
                  <label>checkbox 1</label>
                  <input type="checkbox" checked />
                </mlv-checkbox>

                <mlv-checkbox>
                  <label>checkbox 2</label>
                  <input type="checkbox" />
                </mlv-checkbox>

                <mlv-checkbox>
                  <label>checkbox 3</label>
                  <input type="checkbox" />
                </mlv-checkbox>
              </mlv-checkbox-group>

              <mlv-radio-group layout="horizontal-inline">
                <label>radio group label</label>
                <mlv-radio>
                  <label>radio 1</label>
                  <input type="radio" checked />
                </mlv-radio>

                <mlv-radio>
                  <label>radio 2</label>
                  <input type="radio" />
                </mlv-radio>

                <mlv-radio>
                  <label>radio 3</label>
                  <input type="radio" />
                </mlv-radio>
              </mlv-radio-group>

              <mlv-switch-group layout="horizontal-inline">
                <label>switch group label</label>
                <mlv-switch>
                  <label>switch 1</label>
                  <input type="checkbox" />
                </mlv-switch>

                <mlv-switch>
                  <label>switch 2</label>
                  <input type="checkbox" checked />
                </mlv-switch>
              </mlv-switch-group>

              <mlv-select layout="horizontal-inline">
                <label>select multiple label</label>
                <select multiple>
                  <option value="1">Option 1</option>
                  <option selected value="2">Option 2</option>
                  <option selected value="3">Option 3</option>
                  <option selected value="3">Option 3</option>
                  <option value="4">Option 4</option>
                  <option value="5">Option 5</option>
                </select>
                <mlv-control-message>message</mlv-control-message>
              </mlv-select>

              <mlv-textarea layout="horizontal-inline">
                <label>textarea label</label>
                <textarea></textarea>
                <mlv-control-message>message</mlv-control-message>
              </mlv-textarea>
            </div>
          </mlv-card-content>
          <mlv-card-footer>
            <div mlv-layout="row gap:xs full">
              <mlv-button style="margin-left: auto">button</mlv-button>
            </div>
          </mlv-card-footer>
        </mlv-card>
    </main>
  </div>
</div>
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

customElements.get('mlv-demo-theme-generator') || customElements.define('mlv-demo-theme-generator', ThemeGeneratorDemo);

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
  <div mlv-theme="root">
    <mlv-demo-theme-generator></mlv-demo-theme-generator>
  </div>
  `
}
