import { html, LitElement } from 'lit';
import { useStyles } from '@elements/elements/internal';
import styles from './dialog-header.css?inline';

/**
 * @element mlv-dialog-header
 * @since 0.6.0
 * @slot - default slot for the dialog header
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-dialog-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-39&t=CAAM7yEBvG18tRRa-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 */
export class DialogHeader extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'mlv-dialog-header',
    version: 'PACKAGE_VERSION'
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
