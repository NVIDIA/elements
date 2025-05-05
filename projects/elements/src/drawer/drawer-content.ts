import { html, LitElement } from 'lit';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './drawer-content.css?inline';

/**
 * @element nve-drawer-content
 * @since 0.16.0
 * @entrypoint \@nvidia-elements/core/drawer
 * @slot - default slot for the drawer content
 * @storybook https://NVIDIA.github.io/elements/docs/elements/drawer/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-39&t=CAAM7yEBvG18tRRa-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */
export class DrawerContent extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-drawer-content',
    version: '0.0.0'
  };

  render() {
    return html`
      <div internal-host>
        <slot></slot>
      </div>
    `;
  }
}
