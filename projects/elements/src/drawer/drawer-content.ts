import { html, LitElement } from 'lit';
import { useStyles } from '@elements/elements/internal';
import styles from './drawer-content.css?inline';

/**
 * @element mlv-drawer-content
 * @since 0.16.0
 * @slot - default slot for the drawer content
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-drawer-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-39&t=CAAM7yEBvG18tRRa-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */
export class DrawerContent extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'mlv-drawer-content',
    version: 'PACKAGE_VERSION'
  };

  render() {
    return html`
      <div internal-host>
        <slot></slot>
      </div>
    `;
  }
}
