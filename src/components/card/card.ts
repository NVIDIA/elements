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

@customElement('mlv-card')
export class Card extends LitElement {
  static styles = componentStyling;


  /**  If present render a title in the header */
  @property({ type: String}) title: string;
  /**  If present render a subTitle in the header */
  @property({ type: String}) subTitle: string;

  render() {
    return html`
      ${when(this.title, () => html`
      <div id="header">
       <h1 id="title">${this.title}</h1>

       <h2 id="subTitle">${this.subTitle}</h2>
      </div>`)}

      <slot name="image"></slot>

      <div id="content">
        <slot></slot>
      </div>

      <div id="footer">
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