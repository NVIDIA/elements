import { css, html, LitElement, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { state } from 'lit/decorators/state.js';

import layout from '@nvidia-elements/styles/layout.css?inline';
import typography from '@nvidia-elements/styles/typography.css?inline';
import responsive from '@nvidia-elements/styles/responsive.css?inline';

import '@nvidia-elements/core/alert/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/button-group/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/card/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/color/define.js';
import '@nvidia-elements/core/range/define.js';
import '@nvidia-elements/core/switch/define.js';
import '@nvidia-elements/core/progress-ring/define.js';
import '@nvidia-elements/core/logo/define.js';
import '@nvidia-elements/core/pulse/define.js';

@customElement('nvd-theme-gen')
export class ThemeGen extends LitElement {
  static styles = [
    unsafeCSS(layout),
    unsafeCSS(typography),
    unsafeCSS(responsive),
    css`
      /* Gradient Classes */
      .silver-gradient {
        background: linear-gradient(45deg, rgba(161, 161, 170, 0.5) 0%, #fff 50%, rgba(255, 255, 255, 0.6) 100%);
      }

      .blue-purple-gradient {
        background: linear-gradient(90deg, #a4c8ff 0%, #bfa9ff 100%);
      }

      .gradient-txt {
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    `
  ];

  @state() formValues = {
    'sys-support-accent-color': '#0a71f0',
    'sys-support-accent-muted-color': '#0f2f57',
    'ref-scale-border-radius': '1',
    'ref-scale-border-width': '1',
    'ref-scale-space': '1',
    'ref-scale-size': '1',
    'ref-scale-text': '1'
  };

  render() {
    return html`
      <section nve-layout="row column-reverse@xs row@xl pad-y:xxl gap:xxl">
        <!-- Left Column - Example UI -->
        <aside nve-layout="grid span-items:6 gap:md" nve-theme="root">
          <nve-alert-group status="accent" nve-layout="span:12">
            <nve-alert style="--icon-color: var(--nve-sys-support-accent-color)">Accent</nve-alert>
          </nve-alert-group>

          <div nve-layout="column gap:lg span:12 span@md:6">
            <nve-card>
              <img
                src="https://cdn-stage.nvidia.com/assets/elements/test-image-2.webp"
                alt="example visualization for media card demo"
                loading="lazy"
                style="width: 100%; height: 100%; object-fit: cover;" />

              <nve-card-content nve-layout="column gap:sm align:stretch align-items:stretch">
                <div nve-layout="column gap:sm align:stretch align-items:stretch">
                  <div nve-text="label semibold md emphasis">Session ID</div>
                  <div nve-layout="row align:space-between">
                    <div nve-text="label medium muted sm">Created</div>
                    <div nve-text="label medium emphasis sm">03/14/2025</div>
                  </div>

                  <div nve-layout="row align:space-between">
                    <div nve-text="label medium muted sm">Modified</div>
                    <div nve-text="label medium emphasis sm">15m ago</div>
                  </div>

                  <div nve-layout="row align:space-between">
                    <div nve-text="label medium muted sm">Validation</div>
                    <div nve-text="label medium emphasis sm">isKPI</div>
                  </div>
                </div>
              </nve-card-content>

              <nve-card-footer>
                <div nve-layout="grid span-items:12 gap:xs">
                  <nve-button pressed>Add to Dataset</nve-button>
                </div>
              </nve-card-footer>
            </nve-card>

            <div class="stat" nve-layout="column gap:xs">
              <div nve-layout="column gap:sm">
                <label nve-text="label medium sm muted">Label</label>
                <h3 nve-text="heading semibold lg">198,298</h3>
              </div>

              <div nve-layout="row gap:sm align:vertical-center">
                <label nve-text="label medium sm muted">Since last week</label>
                <nve-badge status="trend-up">+15%</nve-badge>
              </div>
            </div>

            <nve-select fit-text>
              <label>label</label>
              <select>
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
                <option value="3">Option 3</option>
              </select>

              <!-- <nve-control-message>message</nve-control-message> -->
            </nve-select>
          </div>

          <div nve-layout="column gap:lg align:center span:12 span@md:6">
            <nve-button-group container="rounded" behavior-select="single">
              <nve-button pressed>All Time</nve-button>
              <nve-button>30 Days</nve-button>
              <nve-button>90 Days</nve-button>
            </nve-button-group>

            <div nve-layout="row gap:sm align:vertical-center">
              <nve-progress-ring status="accent" size="xxs"></nve-progress-ring>

              <nve-progress-ring status="accent" size="xs"></nve-progress-ring>
              
              <nve-progress-ring status="accent" size="sm"></nve-progress-ring>

              <nve-progress-ring status="accent"></nve-progress-ring>

              <nve-progress-ring status="accent" size="lg"></nve-progress-ring>

              <nve-pulse size="lg" status="accent"></nve-pulse>
            </div>
          </div>
        </aside>

        <!-- Right Column - Content and Inputs -->
        <div nve-layout="column gap:lg align:center align:stretch">
          <!-- Title -->
          <div nve-text="semibold display md">
            <span class="silver-gradient gradient-txt"> Ready to use. </span>
            <br />
            <span>Ready to</span>
            <span class="blue-purple-gradient gradient-txt"> customize </span>
          </div>

          <!-- Subheading -->
          <div nve-text="muted md regular">
            Customize and adapt Elements to match your design system needs with our powerful theming engine.
          </div>

          <!--  Form -->
          <form @input=${this.#input} nve-layout="column gap:md align:stretch">
            <nve-color layout="horizontal">
              <label>System Accent Color</label>
              <input type="color" name="sys-support-accent-color" .value=${this.formValues['sys-support-accent-color']} />
            </nve-color>

            <nve-color layout="horizontal">
              <label>System Accent Muted Color</label>
              <input type="color" name="sys-support-accent-muted-color" .value=${this.formValues['sys-support-accent-muted-color']} />
            </nve-color>

            <nve-range>
              <label>Space Scale</label>
              <input type="range" name="ref-scale-space" .value=${this.formValues['ref-scale-space']} min="0.5" max="1.5" step="0.1" />
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
              <label>Border Radius</label>
              <input type="range" name="ref-scale-border-radius" .value=${this.formValues['ref-scale-border-radius']} min="0" max="2" step="0.1" />
            </nve-range>

            <nve-range>
              <label>Border Width</label>
              <input type="range" name="ref-scale-border-width" .value=${this.formValues['ref-scale-border-width']} min="0.5" max="6" step="0.5" />
            </nve-range>

            <!-- TODO - DETERMINE IF ROUNDED BUTTONS IS POSSIBLE -->
            <!-- <nve-switch>
              <label>Rounded Buttons</label>
              <input type="checkbox" />
            </nve-switch> -->
          </form>
        </div>
      </section>
    `;
  }

  #input() {
    const form = this.shadowRoot?.querySelector('form');
    const values = Object.fromEntries(new FormData(form as any)) as any;
    this.setFormValues(values);
  }

  firstUpdated(props) {
    super.firstUpdated(props);

    // set all the scale based tokens diectly on aside
    // this is a workaround due to how css custom properties inherit and resolve to the :root
    const cssprops = getAllRootCSSCustomProperties();
    Object.keys(cssprops)
      .filter(key => cssprops[key].includes('scale'))
      .map(key => [key, cssprops[key]])
      .forEach(([key, value]) => {
        this.shadowRoot?.querySelector('aside')?.style.setProperty(key, value);
      });
  }

  setFormValues(formValues) {
    this.formValues = {
      ...formValues,
      'sys-support-accent-emphasis-color': formValues['sys-support-accent-muted-color']
    };

    const asideElement = this.shadowRoot?.querySelector('aside');

    Object.keys(this.formValues).forEach(prop => {
      asideElement?.style.setProperty(`--nve-${prop}`, this.formValues[prop]);
    });
  }
}

function getAllRootCSSCustomProperties() {
  const customProperties = new Map();
  Array.from(document.styleSheets).forEach(sheet => {
    Array.from(sheet.cssRules)
      .filter(rule => rule.constructor.name === 'CSSStyleRule')
      .forEach((rule: CSSStyleRule) => {
        Array.from(rule.style)
          .filter(prop => prop.startsWith('--'))
          .forEach(propName => {
            const value = rule.style.getPropertyValue(propName).trim();
            customProperties.set(propName, value);
          });
      });
  });
  return Object.fromEntries(customProperties);
}
