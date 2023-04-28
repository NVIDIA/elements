import { html, LitElement } from 'lit';
import { useStyles } from '@elements/elements/internal';
import cardStyleSheet from './card.css?inline';
import cardHeaderStyleSheet from './card-header.css?inline';
import cardContentStyleSheet from './card-content.css?inline';
import cardFooterStyleSheet from './card-footer.css?inline';

/**
 * @element nve-card
 * @slot - This is a default/unnamed slot for card content
 * @slot header - header element (Use <nve-card-header> or custom content)
 * @slot content - content element (Use <nve-card-content> or custom content)
 * @slot footer - footer element (Use <nve-card-footer> or custom content)
 * @cssprop --background
 * @cssprop --color
 * @cssprop --border-radius
 * @cssprop --box-shadow
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-card-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-36&t=CAAM7yEBvG18tRRa-0
 * @aria https://github.com/w3c/aria-practices/issues
 */
export class Card extends LitElement {
  static styles = useStyles([cardStyleSheet]);

  static readonly metadata = {
    tag: 'nve-card',
    version: 'PACKAGE_VERSION'
  };

  render() {
    return html`
      <div internal-host>
        <slot name="header"></slot>

        <slot></slot>

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
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-card-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-36&t=CAAM7yEBvG18tRRa-0
 * @aria https://github.com/w3c/aria-practices/issues
 */
 export class CardHeader extends LitElement {
  static styles = useStyles([cardHeaderStyleSheet]);

  static readonly metadata = {
    tag: 'nve-card-header',
    version: 'PACKAGE_VERSION'
  };

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
 * @element nve-card-content
 * @slot - This is a default/unnamed slot for card content content
 * @cssprop --padding
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-card-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-36&t=CAAM7yEBvG18tRRa-0
 * @aria https://github.com/w3c/aria-practices/issues
 */
 export class CardContent extends LitElement {
  static styles = useStyles([cardContentStyleSheet]);

  static readonly metadata = {
    tag: 'nve-card-content',
    version: 'PACKAGE_VERSION'
  };

  render() {
    return html`
      <slot></slot>
    `;
  }
}

/**
 * @element nve-card-footer
 * @slot - This is a default/unnamed slot for card footer content
 * @cssprop --padding
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-card-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-36&t=CAAM7yEBvG18tRRa-0
 * @aria https://github.com/w3c/aria-practices/issues
 */
 export class CardFooter extends LitElement {
  static styles = useStyles([cardFooterStyleSheet]);

  static readonly metadata = {
    tag: 'nve-card-footer',
    version: 'PACKAGE_VERSION'
  };

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