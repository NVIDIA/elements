import { html, css, LitElement } from 'lit';
import { when } from 'lit/directives/when.js';
import { property, customElement } from 'lit/decorators.js';
import { IconNames } from './svg-icon';

@customElement('nve-button')
export class Button extends LitElement {
  /**  Label txt for the button */
  @property({ type: String, reflect: true }) label = 'button';
  /** If 'disabled' attribute present on element, set disabled state on button */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** If present use icon for name of icon to show */
  @property({ reflect: true}) icon: IconNames;
  /** If 'prefixicon' attribute present on element, show icon on left */
  @property({ type: Boolean, reflect: true }) prefixIcon = false;


  static styles = [
    css`
      button {
        display: inline-flex;
        align-items: center;
        appearance: none;
        border: none;
        cursor: pointer;

        background-color: var(--nve-color-brand-500);
        border-radius: var(--nve-radius-full);
        color: var(--nve-color-neutral-50);
        font-size: var(--nve-font-size-200);
        gap: var(--nve-spacing-2);
        padding: var(--nve-spacing-2) var(--nve-spacing-4);
      }

      button:disabled {
        background-color: var(--nve-color-neutral-500);
        cursor: auto;
      }

      :host([prefixIcon]) button {
        flex-direction: row-reverse;
      }
    `
  ];

  render() {
    console.log(this.icon);
    return html`
      <button part="base" ?disabled=${this.disabled}>
        ${this.label}
        <slot></slot>
        ${when(this.icon, () => html`<nve-svg-icon variant="current" .name="${this.icon}"></nve-svg-icon>`)}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nve-button': Button,
  }
}