import { html, isServer } from 'lit';
import { property } from 'lit/decorators/property.js';
import { BaseFormAssociatedElement, useStyles } from '@nvidia-elements/core/internal';
import styles from './preferences-input.css?inline';
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

export interface PreferencesInputValue {
  'color-scheme'?: ColorScheme | string;
  scale?: Scale | string;
  'reduced-motion'?: boolean;
}

/**
 * @element nve-preferences-input
 * @description A preferences input is a widget for controlling apperance. Stylesheets register to the preferences input by including a css-property, see Standard for an example.
 * @since 1.23.7
 * @entrypoint \@nvidia-elements/core/preferences-input
 * @event input emits when the value has changed
 * @event change emits when the value has changed
 * @storybook https://NVIDIA.github.io/elements/docs/elements/preferences-input/
 * @figma TODO::https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=3689-87177&t=znx8f5Hs8oD2ySWm-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
 * @stable false
 */
export class PreferencesInput extends BaseFormAssociatedElement<PreferencesInputValue> {
  static styles = useStyles([styles]);

  #value: PreferencesInputValue;

  @property({ type: Object })
  get value() {
    return this.#value;
  }

  set value(value) {
    if (JSON.stringify(this.#value) !== JSON.stringify(value)) {
      this.#value = { ...this.#value, ...value };
      this.setFormValue();
      this.#updatePreferences();
    }
  }

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
    this.value = {
      'color-scheme': 'auto',
      'reduced-motion': false,
      scale: 'default'
    };
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
              .selected=${this.value['color-scheme'] === value}
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
              .selected=${this.value['scale'] === value}
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
            .checked=${this.value['reduced-motion']}
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

  #updatePreferences() {
    if (!isServer) {
      const preferences = getActivePreferences();
      if (JSON.stringify(this.activePreferences) !== JSON.stringify(preferences)) {
        this.activePreferences = preferences;
      }
    }
  }

  #setColorScheme(value: ColorScheme) {
    this.value = { ...this.value, 'color-scheme': value };
    this.#update();
  }

  #setScale(value: Scale) {
    this.value = { ...this.value, scale: value };
    this.#update();
  }

  #setReducedMotion(value: boolean) {
    this.value = { ...this.value, 'reduced-motion': value };
    this.#update();
  }

  #update() {
    this.dispatchInputEvent();
    this.dispatchChangeEvent();
  }
}
