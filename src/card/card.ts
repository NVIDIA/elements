import { html, LitElement } from 'lit';
import { useStyles } from '@elements/elements/internal';
import cardStyleSheet from './card.css?inline';
import cardHeaderStyleSheet from './card-header.css?inline';
import cardFooterStyleSheet from './card-footer.css?inline';

/**
 * @element nve-card
 * @slot default - This is a default/unnamed slot for card content
 * @slot header - header element (Use <nve-card-header> or custom content)
 * @slot footer - footer element (Use <nve-card-footer> or custom content)
 * @cssprop --background
 * @cssprop --color
 * @cssprop --border-radius
 * @cssprop --box-shadow
 * @cssprop --padding
 */
export class Card extends LitElement {
  static styles = useStyles([cardStyleSheet]);

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
 * @slot title - Title Text
 * @slot subtitle - Subtitle Text
 * @slot header-action - Header Action Button
 * @cssprop --padding
 * @cssprop --border-bottom
 * @cssprop --line-height
 */
 export class CardHeader extends LitElement {
  static styles = useStyles([cardHeaderStyleSheet]);

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
 * @slot default - This is a default/unnamed slot for card footer content
 * @cssprop --padding
 */
 export class CardFooter extends LitElement {
  static styles = useStyles([cardFooterStyleSheet]);

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