import { html, LitElement } from 'lit';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './toggletip-footer.css?inline';

/**
 * @element nve-toggletip-footer
 * @since 0.38.0
 * @entrypoint \@nvidia-elements/core/toggletip
 * @slot - default slot for the toggletip footer
 * @cssprop --border-top
 * @cssprop --padding
 * @cssprop --gap
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-toggletip-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-11&t=CAAM7yEBvG18tRRa-0
 * @stable false
 */
export class ToggletipFooter extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-toggletip-footer',
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
