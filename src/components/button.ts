import { html, css, LitElement } from 'lit';
import { property, state, customElement } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { classMap } from 'lit/directives/class-map.js';
import { IconNames } from './svg-icon';

export const BUTTON_VARIANTS = ['primary', 'secondary', 'destructive'];
export type ButtonVariants = typeof BUTTON_VARIANTS[number];

@customElement('mlv-button')
export class Button extends LitElement {
  /**  Label txt for the button */
  @property({ type: String, reflect: true }) label = 'button';
  /** If 'disabled' attribute present on element, set disabled state on button */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Color Variant of the Button */
  @property({ type: String, reflect: true }) variant: ButtonVariants = 'primary';
  /** If present use icon for name of icon to show */
  @property({ reflect: true}) icon: IconNames;
  /** If 'prefixicon' attribute present on element, show icon on left */
  @property({ type: Boolean, reflect: true }) prefixIcon = false;

  @state() private _hover = false;

  static styles = [
    css`
      button {
        display: inline-flex;
        align-items: center;
        appearance: none;
        border: 4px solid transparent;
        cursor: pointer;

        border-radius: var(--mlv-radius-full);
        color: var(--mlv-color-neutral-50);
        font-size: var(--mlv-font-size-75);
        font-weight: var(--mlv-font-weight-semi-bold);
        gap: var(--mlv-spacing-2);
        padding: var(--mlv-spacing-2) var(--mlv-spacing-4);
      }

      :host([prefixIcon]) button {
        flex-direction: row-reverse;
      }

      button:focus-visible, button:active {
        border-color:var(--text-color);
      }

      button.primary {
        background-color: var(--mlv-system-color-interactive-primary);
      }

      button.primary.hover {
        background-color: var(--mlv-system-color-interactive-primary-hover);
      }
      button.destructive {
        background-color: var(--mlv-system-color-interactive-destructive);
      }

      button.destructive.hover {
        background-color: var(--mlv-system-color-interactive-destructive-hover);
      }

      button.secondary {
        color: var(--background-color);
        background-color: var(--text-color);
      }

      button.secondary.hover {
        background-color: var(--background-color);
        color: var(--text-color);
      }

      button:disabled {
        background-color: var(--mlv-system-color-interactive-disabled);
        color: var(--mlv-system-color-interactive-on-disabled);
        cursor: auto;
      }
    `
  ];

  render() {
    const classes = { hover: this._hover, primary: this.variant === 'primary' || !this.variant, secondary: this.variant === 'secondary', destructive: this.variant === 'destructive' };

    return html`
      <button class=${classMap(classes)} @mouseover="${() => this._hover = true}" @mouseout="${() => this._hover = false}" ?disabled=${this.disabled}>
        ${this.label}
        <slot></slot>
        ${when(this.icon, () => html`<mlv-svg-icon variant="current" name="${this.icon}"></mlv-svg-icon>`)}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mlv-button': Button,
  }
}