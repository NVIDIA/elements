import type { PropertyValues } from 'lit';
import { LitElement, html } from 'lit';
import { attachInternals, I18nController, useStyles } from '@nvidia-elements/core/internal';
import styles from './preferences-input.css?inline';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import type { IconName } from '@nvidia-elements/core/icon';
import { Control } from '@nvidia-elements/core/forms';
import { Divider } from '@nvidia-elements/core/divider';
import { Menu, MenuItem } from '@nvidia-elements/core/menu';
import { Switch } from '@nvidia-elements/core/switch';

export type ColorScheme = 'auto' | 'light' | 'dark' | 'high-contrast';
export type Scale = 'default' | 'compact' | 'relaxed';
export type Variant = 'reduced-motion';

const colorSchemes: ColorScheme[] = ['auto', 'light', 'dark', 'high-contrast'];
const scales: Scale[] = ['default', 'compact'];
const colorSchemesIcons = {
  auto: 'computer',
  light: 'sun',
  dark: 'moon',
  'high-contrast': 'circle-half'
} satisfies Record<ColorScheme, IconName>;

function getActivePreferences(element = globalThis.document.documentElement) {
  const computedStyle = getComputedStyle(element);

  return {
    light: computedStyle.getPropertyValue('--nve-config-color-scheme-light') === 'true',
    dark: computedStyle.getPropertyValue('--nve-config-color-scheme-dark') === 'true',
    'high-contrast': computedStyle.getPropertyValue('--nve-config-color-scheme-high-contrast') === 'true',
    compact: computedStyle.getPropertyValue('--nve-config-scale-compact') === 'true',
    'reduced-motion': computedStyle.getPropertyValue('--nve-config-reduced-motion') === 'true'
  } satisfies Partial<Record<ColorScheme | Scale | Variant, boolean>>;
}

/**
 * @element nve-preferences-input
 * @description A preferences input is a widget for controlling apperance. Stylesheets register to the preferences input by including a css-property, see Standard for an example.
 * @since 1.23.7
 * @entrypoint \@nvidia-elements/core/preferences-input
 * @event input emits when the value has changed
 * @event change emits when the value has changed
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-preferences-input-documentation--docs
 * @figma TODO::https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=3689-87177&t=znx8f5Hs8oD2ySWm-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
 * @stable false
 */
export class PreferencesInput extends LitElement {
  /**
   * The name for the preference settings, required to associate it with a form.
   */
  @property({ type: String }) name: string;

  #value = new FormData();

  /**
   * The current preferences settings.
   */
  @property({ type: Object })
  get value(): Object {
    return this.#value;
  }
  set value(value: Object) {
    let previousValue = this.#value;

    if (value instanceof FormData) {
      this.#value = this.#ensureFormValue(value);
    } else {
      this.#value = this.#parseFormValue(value);
    }

    this.#updateFormValue();
    this.requestUpdate('value', previousValue);
  }

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Enables internal string values to be updated for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  get form() {
    return this._internals.form;
  }

  get type() {
    return this.localName;
  }

  get validity() {
    return this._internals.validity;
  }

  get validationMessage() {
    return this._internals.validationMessage;
  }

  get willValidate() {
    return this._internals.willValidate;
  }

  static formAssociated = true;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-preferences-input',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Control.metadata.tag]: Control,
    [Divider.metadata.tag]: Divider,
    [Menu.metadata.tag]: Menu,
    [MenuItem.metadata.tag]: MenuItem,
    [Switch.metadata.tag]: Switch
  };

  /** @private */
  declare _internals: ElementInternals;

  @state() private activePreferences: ReturnType<typeof getActivePreferences> = {
    light: false,
    dark: false,
    'high-contrast': false,
    compact: false,
    'reduced-motion': false
  };

  constructor() {
    super();
    this.#value.set('color-scheme', 'auto');
    this.#value.set('scale', 'default');
    this.#value.set('reduced-motion', 'false');
    attachInternals(this);
  }

  render() {
    return html`
      <div internal-host>
        <nve-control>
          <label>${this.i18n.colorScheme}</label>
          <nve-menu nve-control>
          ${colorSchemes.map(
            value => html`
            <nve-menu-item
              .selected=${this.#value.get('color-scheme') === value}
              .value=${value}
              @click=${() => this.#setColorScheme(value)}
            >
              <nve-icon name=${colorSchemesIcons[value]}></nve-icon> ${value}
            </nve-menu-item>
            `
          )}
          </nve-menu>
        </nve-control>
        ${
          this.activePreferences['compact']
            ? html`
        <nve-divider></nve-divider>
        <nve-control>
          <label>${this.i18n.scale}</label>
          <nve-menu nve-control>
          ${scales.map(
            value => html`
            <nve-menu-item
              .selected=${this.#value.get('scale') === value}
              .value=${value}
              @click=${() => this.#setScale(value)}
            >
              ${value}
            </nve-menu-item>
            `
          )}
          </nve-menu>
        </nve-control>
          `
            : ''
        }
        ${
          this.activePreferences['reduced-motion']
            ? html`
        <nve-divider></nve-divider>
        <nve-switch>
          <label>${this.i18n.reducedMotion}</label>
          <input
            type="checkbox"
            value="reduced-motion"
            .checked=${this.#value.get('reduced-motion') === 'true'}
            @change=${(e: { target: HTMLInputElement }) => this.#setReducedMotion(e.target.checked)}
          />
        </nve-switch>`
            : ''
        }
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('nve-control', '');
  }

  updated(props: PropertyValues<this>) {
    super.updated(props);
    this.#updatePreferences();
  }

  checkValidity() {
    this._internals.checkValidity();
  }

  reportValidity() {
    this._internals.reportValidity();
  }

  #updatePreferences() {
    const preferences = getActivePreferences();
    if (JSON.stringify(this.activePreferences) !== JSON.stringify(preferences)) {
      this.activePreferences = preferences;
    }
  }

  #ensureFormValue(value: FormData) {
    value.set('color-scheme', value.get('color-scheme') ?? 'auto');
    value.set('scale', value.get('scale') ?? 'default');
    value.set('reduced-motion', value.get('reduced-motion') ?? 'false');

    return value;
  }

  #parseFormValue(value: Object) {
    const parsedValueAsFormData = new FormData();

    parsedValueAsFormData.set('color-scheme', value['color-scheme'] ?? 'auto');
    parsedValueAsFormData.set('scale', value['scale'] ?? 'default');
    parsedValueAsFormData.set('reduced-motion', value['reduced-motion'] ?? 'false');

    return parsedValueAsFormData;
  }

  #setColorScheme(value: ColorScheme) {
    this.#value.set('color-scheme', value);
    this.#update();
  }

  #setScale(value: Scale) {
    this.#value.set('scale', value);
    this.#update();
  }

  #setReducedMotion(value: boolean) {
    this.#value.set('reduced-motion', String(value));
    this.#update();
  }

  #update() {
    this.requestUpdate();
    this.#updateFormValue();
    this.dispatchEvent(new CustomEvent('change', { bubbles: true }));
    this.dispatchEvent(new CustomEvent('input', { bubbles: true }));
  }

  #updateFormValue() {
    const formData = new FormData();

    formData.append(`${this.name}-color-scheme`, this.#value.get('color-scheme'));
    formData.append(`${this.name}-scale`, this.#value.get('scale'));
    formData.append(`${this.name}-reduced-motion`, this.#value.get('reduced-motion'));

    this._internals.setFormValue(formData);
  }
}
