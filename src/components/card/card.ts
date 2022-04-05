import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import styleSheet from './card.css';


const componentStyling = new CSSStyleSheet();
componentStyling.replace(styleSheet);


/**
 * @slot default/unnamed - This is a default/unnamed slot for card content
 * @slot image - HTML elements slotted here for image header
 * @slot footer - HTML elements slotted here for card footer
*/

@customElement('nve-card')
export class Card extends LitElement {
  static styles = componentStyling;


  /**  If present render a title in the header */
  @property({ type: String}) title: string;
  /**  If present render a subTitle in the header */
  @property({ type: String}) subtitle: string;

  render() {
    return html`
      ${when(this.title, () => html`
        <header>
          <div id="header-titles">
            <h1>${this.title}</h1>
            <h2>${this.subtitle}</h2>
          </div>

          <slot name="header-actions"></slot>
        </header>
      `)}

      <main>
        <slot></slot>
      </main>

      <footer>
        <slot name="footer"></slot>
      </footer>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nve-card': Card;
  }
}