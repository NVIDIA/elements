import { html, isServer, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { I18nController, scopedRegistry, useStyles } from '@nvidia-elements/core/internal';
import { state } from 'lit/decorators/state.js';
import { FormControlMixin } from '@nvidia-elements/forms/mixin';
import { type IconName, Icon } from '@nvidia-elements/core/icon';
import { Control } from '@nvidia-elements/core/forms';
import { Divider } from '@nvidia-elements/core/divider';
import { Menu, MenuItem } from '@nvidia-elements/core/menu';
import { Switch } from '@nvidia-elements/core/switch';
import styles from './preferences-input.css?inline';

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
 * @event input - Dispatched when the value has changed
 * @event change - Dispatched when the value has changed
 * @cssprop --color
 * @cssprop --width
 * @csspart control - The control wrapper elements that contain the labels and menus
 * @csspart menu - The menu elements that display color scheme and scale options
 * @csspart menu-item - The individual menu item elements for each selectable option
 * @csspart icon - The icon element displayed next to color scheme options
 * @csspart divider - The divider elements that separate preference sections
 * @csspart switch - The switch element for the reduced motion toggle
 *
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
 *
 */
@scopedRegistry()
export class PreferencesInput extends FormControlMixin<typeof LitElement, PreferencesInputValue>(LitElement) {
  #i18nController: I18nController<this> = new I18nController<this>(this);

  /**
   * Enables updating internal string values for internationalization.
   */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-preferences-input',
    version: '0.0.0',
    valueSchema: {
      type: 'object' as const,
      properties: {
        'color-scheme': { type: 'string' as const },
        scale: { type: 'string' as const },
        'reduced-motion': { type: 'boolean' as const }
      }
    }
  };

  static elementDefinitions = {
    [Control.metadata.tag]: Control,
    [Divider.metadata.tag]: Divider,
    [Icon.metadata.tag]: Icon,
    [Menu.metadata.tag]: Menu,
    [MenuItem.metadata.tag]: MenuItem,
    [Switch.metadata.tag]: Switch
  };

  @state() private activePreferences: ReturnType<typeof getActivePreferences> = {
    light: false,
    dark: false,
    'high-contrast': false,
    compact: false,
    'reduced-motion': false
  };

  render() {
    return html`
      <div internal-host>
        <nve-control part="control">
          <label>${this.i18n.colorScheme}</label>
          <nve-menu part="menu" nve-control>
          ${colorSchemes.map(
            value => html`
            <nve-menu-item part="menu-item"
              .selected=${this.value?.['color-scheme'] === value}
              .value=${value}
              @click=${() => this.#setColorScheme(value)}
            >
              <nve-icon part="icon" name=${colorSchemesIcons[value]}></nve-icon> ${value}
            </nve-menu-item>
            `
          )}
          </nve-menu>
        </nve-control>
        ${
          this.activePreferences['compact']
            ? html`
        <nve-divider part="divider"></nve-divider>
        <nve-control part="control">
          <label>${this.i18n.scale}</label>
          <nve-menu part="menu" nve-control>
          ${scales.map(
            value => html`
            <nve-menu-item part="menu-item"
              .selected=${this.value?.['scale'] === value}
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
        <nve-divider part="divider"></nve-divider>
        <nve-switch part="switch">
          <label>${this.i18n.reducedMotion}</label>
          <input
            type="checkbox"
            value="reduced-motion"
            .checked=${this.value?.['reduced-motion']}
            @change=${(e: { target: HTMLInputElement }) => this.#setReducedMotion(e.target.checked)}
          />
        </nve-switch>`
            : ''
        }
      </div>
    `;
  }

  constructor() {
    super();
    this.value = {
      'color-scheme': 'auto',
      'reduced-motion': false,
      scale: 'default'
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('nve-control', '');
    this.#updatePreferences();
  }

  /** @private */
  updateValue(value: PreferencesInputValue) {
    super.updateValue({ ...this.value, ...value });
    this.#updatePreferences();
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
