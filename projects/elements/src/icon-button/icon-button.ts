import { html } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@elements/elements/internal';
import { Button } from '@elements/elements/button';
import { Icon, IconNames } from '@elements/elements/icon';
import styles from './icon-button.css?inline';

/**
 * @element mlv-icon-button
 * @cssprop --border-radius
 * @cssprop --padding
 * @cssprop --line-height
 */
export class IconButton extends Button {
  @property({ type: String, attribute: 'icon-name' }) iconName: IconNames;

  /**
   * Sets the direction of the icon.
   * Only supported by expand-panel/collapse-panel (horizontal axis) and arrow/caret/chevron icons (4-directions)
   */
  @property({ type: String, reflect: true }) direction: 'up' | 'down' | 'left' | 'right';

  static styles = useStyles([...Button.styles, styles]);

  static readonly metadata = {
    tag: 'mlv-icon-button',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'mlv-icon': Icon
  }

  render() {
    return html`
      <div internal-host interaction-state focus-within>
        <mlv-icon name=${this.iconName} direction=${this.direction}></mlv-icon>
        <slot></slot>
      </div>
    `;
  }
}
