import { html } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@elements/elements/internal';
import { Button } from '@elements/elements/button';
import { Icon, IconNames } from '@elements/elements/icon';
import styles from './icon-button.css?inline';

/**
 * @element nve-icon-button
 * @cssprop --border-radius
 * @cssprop --padding
 * @cssprop --line-height
 */
export class IconButton extends Button {
  static styles = useStyles([...Button.styles, styles]);

  @property({ type: String, attribute: 'icon-name' }) iconName: IconNames;

  static elementDefinitions = {
    'nve-icon': Icon
  }

  render() {
    return html`
      <div internal-host interaction-state focus-within>
        <nve-icon .name=${this.iconName}></nve-icon>
        <slot></slot>
      </div>
    `;
  }
}
