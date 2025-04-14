import { css, html, LitElement } from 'lit';
import type { PropertyValues } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { property } from 'lit/decorators/property.js';
import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/button-group/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/checkbox/define.js';
import '@nvidia-elements/core/color/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/progress-bar/define.js';
import '@nvidia-elements/core/progress-ring/define.js';
import '@nvidia-elements/core/range/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/switch/define.js';
import '@nvidia-elements/core/tabs/define.js';

export interface ThemePreviewSettings {
  'color-scheme': 'dark' | 'light' | 'high-contrast';
  'ref-scale-border-radius': string;
  'ref-scale-border-width': string;
  'ref-scale-size': string;
  'ref-scale-space': string;
  'ref-scale-text': string;
  'sys-support-accent-color': string;
  'rounded-buttons': 'on' | undefined;
}

function isCSSStyleRule(rule: CSSRule): rule is CSSStyleRule {
  return rule.constructor.name === 'CSSStyleRule';
}

function getAllRootCSSCustomProperties() {
  const customProperties = new Map<string, string>();
  for (const sheet of globalThis.document.styleSheets) {
    for (const rule of sheet.cssRules) {
      if (isCSSStyleRule(rule)) {
        for (const propName of rule.style) {
          if (propName.startsWith('--')) {
            const value = rule.style.getPropertyValue(propName).trim();
            customProperties.set(propName, value);
          }
        }
      }
    }
  }
  return Object.fromEntries(customProperties);
}

@customElement('nvd-theme-preview')
export class ThemePreview extends LitElement {
  static styles = [
    css`
      /* NOTE: using light DOM, so scope all styles under this element to avoid conflicts with the global styles */
      nvd-theme-preview {
        width: 100%;

        .scalable-content {
          min-width: min-content !important;
          transform-origin: 0 0;
          padding: var(--nve-ref-space-xxl) var(--nve-ref-space-lg);

          .box{
          --border-radius:var(--nve-ref-border-radius-sm);
        --box-shadow:none;
      }

          .bento-box-row {
            display: flex;
            flex-direction: row;
            gap: var(--nve-ref-space-md);
            justify-content: center;

            &:first-of-type {
              align-items: end;
            }
          }

          .bento-box-column {
            display: flex;
            flex-direction: column;
            gap: var(--nve-ref-space-md);
            align-items:stretch;
          }
          nve-button,
          nve-button-group {
            --border-radius: var(--nvd-button-border-radius);
          }
        }
      }
    `
  ];

  @property({ type: Object })
  settings: ThemePreviewSettings = {
    'color-scheme': 'dark',
    'ref-scale-border-radius': '1',
    'ref-scale-border-width': '1',
    'ref-scale-size': '1',
    'ref-scale-space': '1',
    'ref-scale-text': '1',
    'sys-support-accent-color': '#0a71f0',
    'rounded-buttons': 'on'
  };

  get #scalableContent() {
    return this.renderRoot?.querySelector<HTMLElement>('.scalable-content');
  }

  #resizeObserver?: ResizeObserver;

  connectedCallback(): void {
    super.connectedCallback();

    this.#resizeObserver = new ResizeObserver(() => {
      this.#scaleToFit();
    });
    this.#resizeObserver.observe(this);
  }

  // NOTE: intentionally using light DOM (rather than shadow DOM) to leverage global theme styles
  createRenderRoot() {
    return this;
  }

  #scaleToFit() {
    if (!this.#scalableContent) {
      return;
    }

    const scale = Math.min(this.clientWidth / this.#scalableContent.offsetWidth, 1);
    this.#scalableContent.style.transform = `scale(${scale})`;

    this.style.height = `${this.#scalableContent.offsetHeight * scale}px`;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    this.#resizeObserver?.unobserve(this);
  }

  render() {
    return html`
      <div class="scalable-content" nve-theme="root">
        <div class="bento-box-column">
          <div class="bento-box-row">
            <div class="bento-box-column">
              <nve-card class="box">
                <nve-card-content nve-layout="column align:center">
                  <nve-switch>
                    <input type="checkbox" checked />
                  </nve-switch>
                </nve-card-content>
              </nve-card>
              <nve-card class="box">
                <nve-card-content nve-layout="column gap:sm">
                  <label nve-text="label medium sm muted">Label</label>
                  <h3 nve-text="heading semibold lg">123,456</h3>
                </nve-card-content>
              </nve-card>
            </div>
            <div class="bento-box-column">
              <nve-card class="box">
                <nve-card-content>
                  <nve-tabs behavior-select>
                    <nve-tabs-item selected>Tab 1</nve-tabs-item>
                    <nve-tabs-item>Tab 2</nve-tabs-item>
                    <nve-tabs-item>Tab 3</nve-tabs-item>
                    <nve-tabs-item>Tab 4</nve-tabs-item>

                  </nve-tabs>
                </nve-card-content>
              </nve-card>
              <nve-card class="box">
                <nve-card-content nve-layout="row align:center">
                  <nve-button-group container="rounded" behavior-select="single">
                    <nve-button pressed>All Time</nve-button>
                    <nve-button>30 Days</nve-button>
                    <nve-button>90 Days</nve-button>
                  </nve-button-group>
                </nve-card-content>
              </nve-card>
            </div>
            <div class="bento-box-column">
              <nve-card class="box">
                <nve-card-content nve-layout="column align:center">
                  <nve-progress-ring status="accent" value="40" max="100"></nve-progress-ring>
                </nve-card-content>
              </nve-card>
              <nve-card class="box">
                <nve-card-content nve-layout="column align:center">
                  <nve-progress-bar status="accent" value="40" max="100" style="width: calc(var(--nve-ref-scale-size) * 40px + var(--nve-ref-scale-text) * 40px)"></nve-progress-bar>
                </nve-card-content>
              </nve-card>
            </div>
          </div>
          <div class="bento-box-row">
            <nve-alert-group status="accent" style="width: calc(var(--nve-ref-scale-size) * 256px + var(--nve-ref-scale-text) * 256px)">
                <nve-alert>Message</nve-alert>
              </nve-alert-group>
          </div>
          <div class="bento-box-row">
            <div class="bento-box-column">
              <nve-card>
                <img
                  src="https://cdn-stage.nvidia.com/assets/elements/test-image-2.webp"
                  alt="example visualization for media card demo"
                  loading="lazy"
                  style="width: calc(var(--nve-ref-scale-size) * 160px + var(--nve-ref-scale-text) * 160px); object-fit: cover; aspect-ratio: 16 / 9;" />

                <nve-card-content nve-layout="column gap:sm align:stretch align-items:stretch">
                  <div nve-text="label semibold md emphasis">Label</div>
                    <div nve-layout="row align:space-between">
                    <div nve-text="label medium muted sm">Created</div>
                    <div nve-text="label medium emphasis sm">03/14/2025</div>
                  </div>
                  <div nve-layout="row align:space-between">
                    <div nve-text="label medium muted sm">Modified</div>
                    <div nve-text="label medium emphasis sm">15m ago</div>
                  </div>
                </nve-card-content>
                <nve-card-footer>
                  <div nve-layout="row gap:sm align:stretch full">
                    <nve-button pressed>Button</nve-button>
                    <nve-button>Button</nve-button>
                  </div>
                </nve-card-footer>
              </nve-card>
            </div>
            <div class="bento-box-column">
              <nve-card class="box">
                <nve-card-content>
                  <nve-select>
                    <label>label</label>
                    <select>
                      <option value="1">Option 1</option>
                      <option value="2">Option 2</option>
                      <option value="3">Option 3</option>
                    </select>
                  </nve-select>
                </nve-card-content>
              </nve-card>
              <nve-card class="box">
                <nve-card-content>
                  <nve-checkbox-group>
                    <label>Label</label>
                    <nve-checkbox>
                      <label>Option 1</label>
                      <input type="checkbox" checked />
                    </nve-checkbox>

                    <nve-checkbox>
                      <label>Option 2</label>
                      <input type="checkbox" />
                    </nve-checkbox>

                    <nve-checkbox>
                      <label>Option 3</label>
                      <input type="checkbox" />
                    </nve-checkbox>
                  </nve-checkbox-group>
                </nve-card-content>
              </nve-card>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;
  }

  firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);

    // NOTE: manually applying <style> tags to root DOM
    const styleEl = globalThis.document.createElement('style');
    styleEl.textContent = ThemePreview.styles.map(s => s.cssText).join(' ');
    globalThis.document.head.prepend(styleEl);

    // NOTE: set clones of all the scale based token properties diectly on nvd-theme-preview
    const cssprops = getAllRootCSSCustomProperties();
    for (const [key, value] of Object.entries(cssprops)) {
      if (value.includes('scale')) {
        this.style.setProperty(key, value);
      }
    }
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('settings')) {
      for (const [prop, value] of Object.entries(this.settings)) {
        if (prop.startsWith('ref-') || prop.startsWith('sys-')) {
          this.style.setProperty(`--nve-${prop}`, value);
        }
      }
      this.style.setProperty('--nve-sys-support-accent-emphasis-color', this.settings['sys-support-accent-color']);
      this.style.setProperty('--nve-sys-accent-secondary-background', this.settings['sys-support-accent-color']);

      this.#applyColorScheme(this.settings['color-scheme']);
      this.#toggleRoundedButtons(this.settings['rounded-buttons'] === 'on');
    }

    this.#scaleToFit();
  }

  #applyColorScheme(value: 'light' | 'dark' | 'high-contrast') {
    switch (value) {
      case 'high-contrast':
        this.setAttribute('nve-theme', `root light ${value}`);
        break;
      default:
        this.setAttribute('nve-theme', `root ${value}`);
        break;
    }
  }

  #toggleRoundedButtons(value: boolean) {
    this.style.setProperty(
      '--nvd-button-border-radius',
      value ? 'var(--nve-ref-border-radius-full)' : 'var(--nve-ref-border-radius-sm)'
    );
  }
}
