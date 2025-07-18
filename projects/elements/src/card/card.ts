import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { ContainerElement } from '@nvidia-elements/core/internal';
import { audit, hostAttr, useStyles } from '@nvidia-elements/core/internal';
import cardStyleSheet from './card.css?inline';
import cardHeaderStyleSheet from './card-header.css?inline';
import cardContentStyleSheet from './card-content.css?inline';
import cardFooterStyleSheet from './card-footer.css?inline';

/**
 * @element nve-card
 * @description A container for content representing a single entity.
 * @since 0.1.3
 * @entrypoint \@nvidia-elements/core/card
 * @slot - This is a default/unnamed slot for card content
 * @slot header - header element (Use `card-header` or custom content)
 * @slot footer - footer element (Use `card-footer` or custom content)
 * @cssprop --background
 * @cssprop --color
 * @cssprop --border-radius
 * @cssprop --box-shadow
 * @storybook https://NVIDIA.github.io/elements/docs/elements/card/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-36&t=CAAM7yEBvG18tRRa-0
 * @aria https://github.com/w3c/aria-practices/issues
 */
@audit()
export class Card extends LitElement implements ContainerElement {
  /** flat (embed into parent container) or full (full parent container width) */
  @property({ type: String, reflect: true }) container?: 'flat' | 'full';

  static styles = useStyles([cardStyleSheet]);

  static readonly metadata = {
    tag: 'nve-card',
    version: '0.0.0'
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
 * @since 0.1.3
 * @entrypoint \@nvidia-elements/core/card
 * @slot - default slot
 * @slot title - (deprecated) Title Text
 * @slot subtitle - (deprecated) Subtitle Text
 * @slot header-action - (deprecated) Header Action Button
 * @cssprop --padding
 * @cssprop --border-bottom
 * @cssprop --line-height
 * @storybook https://NVIDIA.github.io/elements/docs/elements/card/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-36&t=CAAM7yEBvG18tRRa-0
 * @aria https://github.com/w3c/aria-practices/issues
 */
@audit()
export class CardHeader extends LitElement {
  static styles = useStyles([cardHeaderStyleSheet]);

  static readonly metadata = {
    tag: 'nve-card-header',
    version: '0.0.0',
    parents: ['nve-card']
  };

  @hostAttr() slot = 'header';

  render() {
    return html`
      <header internal-host>
        <div class="content">
          <slot name="title"></slot>
          <slot name="subtitle"></slot>
          <slot></slot>
        </div>

        <slot name="header-action"></slot>
      </header>
    `;
  }
}

/**
 * @element nve-card-content
 * @since 0.1.3
 * @entrypoint \@nvidia-elements/core/card
 * @slot - This is a default/unnamed slot for card content content
 * @cssprop --padding
 * @storybook https://NVIDIA.github.io/elements/docs/elements/card/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-36&t=CAAM7yEBvG18tRRa-0
 * @aria https://github.com/w3c/aria-practices/issues
 */
@audit()
export class CardContent extends LitElement {
  static styles = useStyles([cardContentStyleSheet]);

  static readonly metadata = {
    tag: 'nve-card-content',
    version: '0.0.0',
    parents: ['nve-card']
  };

  render() {
    return html`
      <slot></slot>
    `;
  }
}

/**
 * @element nve-card-footer
 * @since 0.1.3
 * @entrypoint \@nvidia-elements/core/card
 * @slot - This is a default/unnamed slot for card footer content
 * @cssprop --padding
 * @storybook https://NVIDIA.github.io/elements/docs/elements/card/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-36&t=CAAM7yEBvG18tRRa-0
 * @aria https://github.com/w3c/aria-practices/issues
 */
@audit()
export class CardFooter extends LitElement {
  static styles = useStyles([cardFooterStyleSheet]);

  static readonly metadata = {
    tag: 'nve-card-footer',
    version: '0.0.0',
    parents: ['nve-card']
  };

  @hostAttr() slot = 'footer';

  render() {
    return html`
      <footer internal-host>
        <slot></slot>
      </footer>
    `;
  }
}
