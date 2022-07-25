import { html, unsafeCSS, LitElement } from 'lit';
import cardStyleSheet from './card.css?inline';
import cardHeaderStyleSheet from './card-header.css?inline';
import cardFooterStyleSheet from './card-footer.css?inline';

const cardComponentStyling = unsafeCSS(cardStyleSheet);
const cardHeaderComponentStyling = unsafeCSS(cardHeaderStyleSheet);
const cardFooterComponentStyling = unsafeCSS(cardFooterStyleSheet);

/**
 * @element nve-card
 * @slot - This is a default/unnamed slot for card content
 * @slot header - header element
 */
export class Card extends LitElement {
  static styles = cardComponentStyling;

  render() {
    return html`
      <div internal-host>
        <slot name="header"></slot>

        <main>
          <slot></slot>
        </main>

        <slot name="footer"></slot>
      </div>
    `;
  }
}


/**
 * @element nve-card-header
 * @slot - This is a default/unnamed slot for card content
 * @slot title - Title Text
 * @slot subtitle - Subtitle Text
 * @slot header-action - Subtitle Text
 */
 export class CardHeader extends LitElement {
  static styles = cardHeaderComponentStyling;

  render() {
    return html`
      <header internal-host>
        <div>
          <slot name="title"></slot>
          <slot name="subtitle"></slot>
        </div>

        <slot name="header-action"></slot>
      </header>
    `;
  }

  connectedCallback() {
    super.connectedCallback(); // Do not override connectedCallback w/out supering
    this.slot = 'header';
  }
}



/**
 * @element nve-card-footer
 * @slot - This is a default/unnamed slot for card content
 */
 export class CardFooter extends LitElement {
  static styles = cardFooterComponentStyling;

  render() {
    return html`
      <footer internal-host>
        <slot></slot>
      </footer>
    `;
  }

  connectedCallback() {
    super.connectedCallback(); // Do not override connectedCallback w/out supering
    this.slot = 'footer';
  }
}