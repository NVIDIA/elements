import { html } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles, BaseButton } from '@nvidia-elements/core/internal';
import styles from './menu-item.css?inline';

/**
 * @element nve-menu-item
 * @since 0.11.0
 * @slot - default slot for content
 * @slot suffix - slot for suffix icon
 * @cssprop --background
 * @cssprop --border-radius
 * @cssprop --border-background
 * @cssprop --font-size
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --gap
 * @cssprop --width
 * @cssprop --min-height
 * @cssprop --line-height
 * @cssprop --cursor
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-menu-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-11&t=DjsMr3p502i01oCU-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 */
export class MenuItem extends BaseButton {
  static styles = useStyles([styles]);

  @property({ type: String, reflect: true }) status: 'danger';

  static readonly metadata = {
    tag: 'nve-menu-item',
    version: '0.0.0'
  };

  static elementDefinitions = {};

  render() {
    return html`
      <div internal-host interaction-state focus-within part="internal">
        <slot></slot>
        <slot name="suffix"></slot>
      </div>
    `;
  }

  constructor() {
    super();
    this.type = 'button';
  }

  connectedCallback() {
    super.connectedCallback();
    this._internals.role = 'menuitem';
  }
}
