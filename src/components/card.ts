import { html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

/**
 * @slot default/unnamed - This is a default/unnamed slot for card content
 * @slot image - HTML elements slotted here for image header
 * @slot footer - HTML elements slotted here for card footer
*/

@customElement('mlv-card')
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
        border-radius: var(--mlv-radius-lg);
        box-shadow: var(--shadow);
      }

      ::slotted(img) {
        width: 100%;
      }

      .content {
        padding: var(--mlv-spacing-4);
      }

      .footer ::slotted(*) {
        padding: var(--mlv-spacing-5);
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
    'mlv-card': Card;
  }
}
