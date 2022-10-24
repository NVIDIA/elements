import { html } from 'lit';
import { property } from 'lit/decorators/property.js';
import { MlvBaseButton, useStyles, Interaction, GhostInteraction } from '@elements/elements/internal';
import styles from './button.css?inline';

/**
 * @element mlv-button
 * @slot Default - Default slot for button text content or icon, icon placement determined by whether <mlv-icon> is inserted before or after text content.
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
 */
export class Button extends MlvBaseButton {
  static styles = useStyles([styles]);

  @property({ type: String, reflect: true }) interaction: Interaction | GhostInteraction;

  render() {
    return html`
      <div internal-host>
        <slot></slot>
      </div>
    `;
  }
}
