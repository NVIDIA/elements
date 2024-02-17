import { html } from 'lit';
import { property } from 'lit/decorators/property.js';
import { MlvBaseButton, useStyles, Interaction, Inverse, FlatInteraction, Size } from '@elements/elements/internal';
import styles from './button.css?inline';

/**
 * @element mlv-button
 * @description A button is a widget that enables users to trigger an action or event, such as submitting a form, opening a dialog, canceling an action, or performing a delete operation.
 * @since 0.1.3
 * @slot - slot for button text content or icon, icon placement determined by whether `icon` is inserted before or after text content.
 * @cssprop --color
 * @cssprop --background
 * @cssprop --padding
 * @cssprop --border-radius
 * @cssprop --font-weight
 * @cssprop --font-size
 * @cssprop --text-decoration
 * @cssprop --cursor
 * @cssprop --gap
 * @cssprop --height
 * @cssprop --text-transform
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-button-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-6&t=CAAM7yEBvG18tRRa-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/button/
 * @axe color-contrast
 */
export class Button extends MlvBaseButton {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'mlv-button',
    version: 'PACKAGE_VERSION'
  };

  /**
   * Visual treatment to represent user interaction appearance.
   */
  @property({ type: String, reflect: true }) interaction: 'flat' | Interaction | FlatInteraction | Inverse;

  /**
   * Determines size of the button.
   */
  @property({ type: String, reflect: true }) size?: Size;

  render() {
    return html`
      <div internal-host interaction-state focus-within>
        <slot></slot>
      </div>
    `;
  }
}
