import { html } from 'lit';
import { property } from 'lit/decorators/property.js';
import { MlvBaseButton, useStyles, Interaction, GhostInteraction, Inverse, FlatInteraction, Size } from '@elements/elements/internal';
import styles from './button.css?inline';

/**
 * @element nve-button
 * @slot - slot for button text content or icon, icon placement determined by whether <nve-icon> is inserted before or after text content.
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
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-button-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-6&t=CAAM7yEBvG18tRRa-0
 */
export class Button extends MlvBaseButton {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-button',
    version: 'PACKAGE_VERSION'
  };

  /**
   * Visual treatment to represent user interaction appearance
   */
  @property({ type: String, reflect: true }) interaction: Interaction | FlatInteraction | Inverse | GhostInteraction;

  /**
   * Determines size of button 
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
