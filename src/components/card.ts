import { html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * @slot default/unnamed - This is a default/unnamed slot for card content
 * @slot image - HTML elements slotted here for image header
 * @slot footer - HTML elements slotted here for card footer
*/

@customElement('nve-card')
export class Card extends LitElement {
  static styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: start;
        overflow: hidden;

        background-color: var(--background-color);
        color: var(--text-color);
        border-radius: var(--nve-radius-lg);
        box-shadow: var(--shadow);
      }

      ::slotted(img) {
        width: 100%;
      }

      .content {
        padding: var(--nve-spacing-4);
      }

      .footer ::slotted(*) {
        padding: var(--nve-spacing-5);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    `,
  ];

  render() {
    return html`
      <slot name="image"></slot>
      <div class="content">
        <slot></slot>
      </div>
      <div class="footer">
        <slot name="footer"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nve-card': Card;
  }
}
