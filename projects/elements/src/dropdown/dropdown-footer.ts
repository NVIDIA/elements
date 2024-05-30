import { html, LitElement } from 'lit';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './dropdown-footer.css?inline';

/**
 * @element mlv-dropdown-footer
 * @since 0.36.0
 * @slot - default slot for the dropdown footer
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-dialog-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-11&t=CAAM7yEBvG18tRRa-0
 */
export class DropdownFooter extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'mlv-dropdown-footer',
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
