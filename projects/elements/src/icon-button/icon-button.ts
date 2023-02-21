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
  @property({ type: String, attribute: 'icon-name' }) iconName: IconNames;

  static styles = useStyles([...Button.styles, styles]);

  static readonly metadata = {
    tag: 'nve-icon-button',
    version: 'PACKAGE_VERSION'
  };

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
