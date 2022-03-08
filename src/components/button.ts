import { html, css, LitElement } from 'lit';
import { property, state, customElement } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { IconNames } from './svg-icon';

export const BUTTON_VARIANTS = ['primary', 'secondary', 'destructive'];
export type ButtonVariants = typeof BUTTON_VARIANTS[number];

@customElement('mlv-button')
export class Button extends LitElement {
  /**  Label txt for the button */
  @property({ type: String}) label = 'button';
  /** If 'disabled' attribute present on element, set disabled state on button */
  @property({ type: Boolean }) disabled = false;
  /** Color Variant of the Button */
  @property({ type: String, reflect: true }) variant: ButtonVariants = 'primary';
  /** If present use icon for name of icon to show */
  @property() icon: IconNames;
  /** If 'prefixicon' attribute present on element, show icon on left */
  @property({ type: Boolean }) prefixIcon = false;

  @state() private _hover = false; // No longer used but left for testing/demoing private field exclusion from Storybook API Docs

  static styles = [
    css`
      button {
        display: inline-flex;
        align-items: center;
        appearance: none;
        border: 4px solid transparent;
        cursor: pointer;
        background-color: var(--mlv-system-color-interactive-primary);
        border-radius: var(--mlv-radius-full);
        color: var(--mlv-color-neutral-50);
        font-size: var(--mlv-font-size-75);
        font-weight: var(--mlv-font-weight-semi-bold);
        gap: var(--mlv-spacing-2);
        padding: var(--mlv-spacing-2) var(--mlv-spacing-4);
        line-height: var(--mlv-font-size-200);
      }

      :host([prefixIcon]) button {
        flex-direction: row-reverse;
      }

      button:focus-visible {
        border-color: var(--mlv-system-color-interactive-secondary);
      }

      button:active {
        filter: contrast(1.25) brightness(1.1);
      }

      :host([variant="primary"]) button {
        background-color: var(--mlv-system-color-interactive-primary);
      }

      :host([variant="primary"]) button:hover {
        background-color: var(--mlv-system-color-interactive-primary-hover);
      }
      :host([variant="destructive"]) button {
        background-color: var(--mlv-system-color-interactive-destructive);
      }

      :host([variant="destructive"]) button:hover {
        background-color: var(--mlv-system-color-interactive-destructive-hover);
      }

      :host([variant="secondary"]) button {
        color: var(--mlv-system-color-interactive-neutral-hover);
        background-color: var(--mlv-system-color-interactive-neutral);
      }

      :host([variant="secondary"]) button:hover {
        color: var(--mlv-system-color-interactive-neutral);
        background-color: var(--mlv-system-color-interactive-neutral-hover);
      }

      :host button:disabled {
        background-color: var(--mlv-system-color-interactive-disabled);
        opacity: 40%;
        color: var(--mlv-system-color-interactive-on-disabled);
        cursor: not-allowed;
      }
    `
  ];

  render() {
    return html`
      <button ?disabled=${this.disabled}>
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