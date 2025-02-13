import { html, LitElement } from 'lit';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './drawer-header.css?inline';

/**
 * @element nve-drawer-header
 * @since 0.16.0
 * @entrypoint \@nvidia-elements/core/drawer
 * @slot - default slot for the drawer header
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-drawer-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=4152%3A86953&mode=dev
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */
export class DrawerHeader extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-drawer-header',
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
    this.slot = 'header';
  }
}
