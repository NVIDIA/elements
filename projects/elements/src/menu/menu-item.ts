import { html } from 'lit';
import { useStyles, MlvBaseButton } from '@elements/elements/internal';
import styles from './menu-item.css?inline';

/**
 * @element nve-menu-item
 * @since 0.11.0
 * @slot - default slot for content
 * @cssprop --background
 * @cssprop --border-radius
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
export class MenuItem extends MlvBaseButton {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-menu-item',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = { };

  render() {
    return html`
      <div internal-host interaction-state focus-within part="internal">
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this._internals.role = 'menuitem';
    this.type = 'button';
  }
}
