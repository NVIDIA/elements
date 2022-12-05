import { html } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@elements/elements/internal';
import { Button } from '@elements/elements/button';
import { IconNames } from '@elements/elements/icon';
import styles from './icon-button.css?inline';

/**
 * @element mlv-icon-button
 * @cssprop --border-radius
 * @cssprop --padding
 * @cssprop --line-height
 */
export class IconButton extends Button {
  static styles = useStyles([...Button.styles, styles]);

  @property({ type: String, attribute: 'icon-name' }) iconName: IconNames;

  render() {
    return html`
      <div internal-host interaction-state focus-within>
        <mlv-icon .name=${this.iconName}></mlv-icon>
        <slot></slot>
      </div>
    `;
  }
}
