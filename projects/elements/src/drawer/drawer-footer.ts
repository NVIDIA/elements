import { html, LitElement } from 'lit';
import { useStyles } from '@elements/elements/internal';
import styles from './drawer-footer.css?inline';

/**
 * @element mlv-drawer-footer
 * @since 0.16.0
 * @slot - default slot for the drawer footer
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-drawer-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-39&t=CAAM7yEBvG18tRRa-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */
export class DrawerFooter extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'mlv-drawer-footer',
    version: '0.0.0'
  };

  render() {
    return html`
      <div internal-host>
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.slot = 'footer';
  }
}
