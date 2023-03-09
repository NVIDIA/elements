import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { Icon } from '@elements/elements/icon';
import { TaskStatus, SupportStatus, useStyles, statusIcons, TrendStatus, statusStateStyles, supportStateStyles } from '@elements/elements/internal';
import styles from './badge.css?inline';

/**
 * @alpha
 * @element nve-badge
 * @slot - default slot for content
 * @cssprop --background
 * @cssprop --gap
 * @cssprop --font-size
 * @cssprop --status-color
 * @cssprop --padding
 * @cssprop --border-radius
 * @cssprop --font-weight
 */
export class Badge extends LitElement {
  /** visual treatment to represent a ongoing task status */
  @property({ type: String, reflect: true }) status: TaskStatus | SupportStatus | TrendStatus;

  static styles = useStyles([styles, statusStateStyles, supportStateStyles]);

  static readonly metadata = {
    tag: 'nve-badge',
    version: 'PACKAGE_VERSION'
  };

  static elementDefinitions = {
    'nve-icon': Icon
  };

  render() {
    return html`
      <div internal-host>
        <slot></slot>
        <slot name="suffix-icon">
          ${this.status?.includes('trend') ? html`<nve-icon .name=${statusIcons[this.status] as any}></nve-icon>` : ''}
        </slot>
      </div>
    `;
  }
}
