import { html } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { Interaction, Inverse, FlatInteraction, Size } from '@nvidia-elements/core/internal';
import { BaseButton, useStyles } from '@nvidia-elements/core/internal';
import styles from './button.css?inline';

/**
 * @element nve-button
 * @description A button is a widget that enables users to trigger an action or event, such as submitting a form, opening a dialog, canceling an action, or performing a delete operation.
 * @since 0.1.3
 * @entrypoint \@nvidia-elements/core/button
 * @slot - slot for button text content or icon, icon placement determined by whether `icon` is inserted before or after text content.
 * @cssprop --color
 * @cssprop --background
 * @cssprop --padding
 * @cssprop --border
 * @cssprop --border-radius
 * @cssprop --font-weight
 * @cssprop --font-size
 * @cssprop --text-decoration
 * @cssprop --cursor
 * @cssprop --gap
 * @cssprop --height
 * @cssprop --text-transform
 * @cssprop --line-height
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-button-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-6&t=CAAM7yEBvG18tRRa-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/button/
 * @axe color-contrast
 */
export class Button extends BaseButton {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-button',
    version: '0.0.0'
  };

  /**
   * Determines the container of the button. Flat is used for nesting within other containers or more muted style. Inline is used for inline content such as text.
   */
  @property({ type: String, reflect: true }) container?: 'flat' | 'inline';

  /**
   * Determines size of the button.
   */
  @property({ type: String, reflect: true }) size?: Size;

  /**
   * The Interaction type provides a way to indicate the intended use case for a button or other interactive element. This can help users quickly understand what each interaction will do and reduce the potential for confusion or errors.
   */
  @property({ type: String, reflect: true }) interaction: Interaction | FlatInteraction | Inverse;

  render() {
    return html`
      <div internal-host interaction-state focus-within>
        <slot></slot>
      </div>
    `;
  }
}
