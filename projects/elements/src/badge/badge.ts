import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { Icon } from '@elements/elements/icon';
import { TaskStatus, SupportStatus, useStyles, statusIcons, TrendStatus, statusStateStyles, supportStateStyles } from '@elements/elements/internal';
import styles from './badge.css?inline';

/**
 * @element nve-badge
 * @slot - default slot for content
 * @cssprop --background
 * @cssprop --gap
 * @cssprop --font-size
 * @cssprop --status-color
 * @cssprop --padding
 * @cssprop --border-radius
 * @cssprop --font-weight
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-badge-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=96-5042&t=UOtcGeukBSZqsnnO-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
 * @stable false
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
