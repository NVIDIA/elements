import { html, css, LitElement } from 'lit';
import { property, state, customElement } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { classMap } from 'lit/directives/class-map.js';
import { IconNames } from './svg-icon';

@customElement('mlv-button')
export class Button extends LitElement {
  /**  Label txt for the button */
  @property({ type: String, reflect: true }) label = 'button';
  /** If 'disabled' attribute present on element, set disabled state on button */
  @property({ type: Boolean, reflect: true }) disabled = false;
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
        border: none;
        cursor: pointer;

        background-color: var(--mlv-color-brand-500);
        border-radius: var(--mlv-radius-full);
        color: var(--mlv-color-neutral-50);
        font-size: var(--mlv-font-size-200);
        gap: var(--mlv-spacing-2);
        padding: var(--mlv-spacing-2) var(--mlv-spacing-4);
      }

      button:disabled {
        background-color: var(--mlv-color-neutral-500);
        cursor: auto;
      }

      button.hover:not(:disabled) {
        background-color: var(--mlv-color-negative-500);
      }

      :host([prefixIcon]) button {
        flex-direction: row-reverse;
      }
    `
  ];

  render() {
    const classes = { hover: this._hover };

    return html`
      <button class=${classMap(classes)} @mouseover="${() => this._hover = true}" @mouseout="${() => this._hover = false}" ?disabled=${this.disabled}>
        ${this.label}
        <slot></slot>
        ${when(this.icon, () => html`<mlv-svg-icon variant="current" .name="${this.icon}"></mlv-svg-icon>`)}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mlv-button': Button,
  }
}