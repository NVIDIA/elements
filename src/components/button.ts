import { html, css, LitElement } from 'lit';
import { when } from 'lit/directives/when.js';
import { property, customElement } from 'lit/decorators.js';
import { IconNames } from './svg-icon';

@customElement('mlv-button')
export class Button extends LitElement {
  @property({ type: String, reflect: true }) label = 'button';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ reflect: true}) icon: IconNames;
  @property({ type: Boolean, reflect: true }) prefixIcon = false;

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