import { html, LitElement } from 'lit';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './dropdown-header.css?inline';

/**
 * @element nve-dropdown-header
 * @since 0.36.0
 * @entrypoint \@nvidia-elements/core/dropdown
 * @slot - default slot for the dropdown header
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-dropdown-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-11&t=CAAM7yEBvG18tRRa-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 */
export class DropdownHeader extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-dropdown-header',
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
