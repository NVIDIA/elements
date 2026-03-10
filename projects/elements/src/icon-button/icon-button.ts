import { html } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { Size } from '@nvidia-elements/core/internal';
import { removeEmptySlotWhitespace, scopedRegistry, useStyles } from '@nvidia-elements/core/internal';
import { Button } from '@nvidia-elements/core/button';
import type { IconName } from '@nvidia-elements/core/icon';
import { Icon } from '@nvidia-elements/core/icon';
import styles from './icon-button.css?inline';

/**
 * @element nve-icon-button
 * @description An icon button is a button that displays only an icon without a visual label.
 * @since 0.2.1
 * @entrypoint \@nvidia-elements/core/icon-button
 * @slot - default slot for custom icons
 * @cssprop --border-radius
 * @cssprop --padding
 * @cssprop --line-height
 * @cssprop --gap
 * @cssprop --height
 * @cssprop --width
 * @cssprop --font-size
 * @cssprop --color
 * @cssprop --background
 * @csspart icon - The icon element
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/button/
 */
@scopedRegistry()
export class IconButton extends Button {
  /**
   * Sets the icon name, which determines which icon to display.
   */
  @property({ type: String, attribute: 'icon-name' }) iconName: IconName;

  /**
   * Sets the direction of the icon.
   * Only supported by expand-panel/collapse-panel (horizontal axis) and arrow/caret/chevron icons (4-directions)
   */
  @property({ type: String, reflect: true }) direction: 'up' | 'down' | 'left' | 'right';

  /**
   * Sets size of the icon button.
   */
  @property({ type: String, reflect: true }) size?: Size;

  static styles = useStyles([...Button.styles, styles]);

  static readonly metadata = {
    tag: 'nve-icon-button',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [Icon.metadata.tag]: Icon
  };

  render() {
    return html`
      <div internal-host interaction-state focus-within aria-hidden="true">
        <slot @slotchange=${(e: Event) => removeEmptySlotWhitespace(e.target as HTMLSlotElement)}>
          <nve-icon .name=${this.iconName} .direction=${this.direction} .size=${this.size} aria-hidden="true" part="icon"></nve-icon>
        </slot>
      </div>
      <slot name="anchor"></slot>
    `;
  }
}
