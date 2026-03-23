import { LitElement, html } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { Size, Color } from '@nvidia-elements/core/internal';
import { colorStateStyles } from '@nvidia-elements/core/internal';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './avatar.css?inline';

/**
 * @element nve-avatar
 * @description Avatar represents a user/bot within a UI. Typically with text or image content.
 * @since 1.20.0
 * @entrypoint \@nvidia-elements/core/avatar
 * @slot - default slot for content
 * @cssprop --background
 * @cssprop --color
 * @cssprop --border-radius
 * @cssprop --height
 * @cssprop --width
 * @cssprop --font-size
 * @cssprop --font-weight
 * @cssprop --border
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/alert/
 *
 */
export class Avatar extends LitElement {
  static styles = useStyles([styles, colorStateStyles]);

  static readonly metadata = {
    tag: 'nve-avatar',
    version: '0.0.0'
  };

  /** Sets size of the avatar component. Update size through the `width + height` css props as an alternative. */
  @property({ type: String, reflect: true }) size?: Size | 'xs';

  /** Sets the color of the avatar component. */
  @property({ type: String, reflect: true }) color: Color;

  render() {
    return html`
    <div internal-host>
        <slot></slot>
    </div>
  `;
  }
}
