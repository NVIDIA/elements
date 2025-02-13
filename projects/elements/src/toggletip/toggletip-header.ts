import { html, LitElement } from 'lit';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './toggletip-header.css?inline';

/**
 * @element nve-toggletip-header
 * @since 0.38.0
 * @entrypoint \@nvidia-elements/core/toggletip
 * @slot - default slot for the toggletip header
 * @cssprop --border-bottom
 * @cssprop --padding
 * @figma https://www.figma.com/design/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog?node-id=11271-137320&t=nq7LDEegFP41AilB-0
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-toggletip-documentation--docs
 * @stable false
 */
export class ToggletipHeader extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-toggletip-header',
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
