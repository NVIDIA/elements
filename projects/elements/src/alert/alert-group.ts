import { html, LitElement, PropertyValues } from 'lit';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import { property } from 'lit/decorators/property.js';
import { attachInternals, SupportStatus, useStyles } from '@elements/elements/internal';
import type { Alert } from './alert.js';
import styles from './alert-group.css?inline';

/**
 * @element mlv-alert-group
 * @description An alert group is an element that displays a group of related and important messages in a way that attracts the user's attention without interrupting the user's task.
 * @since 0.3.0
 * @cssprop --gap
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --font-size
 * @cssprop --background
 * @cssprop --border-radius
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-alert-group-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=2519-54572&t=CAAM7yEBvG18tRRa-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/alert/
 */
export class AlertGroup extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'mlv-alert-group',
    version: 'PACKAGE_VERSION'
  };

  /** Defines visual treatment to represent a ongoing task or support status. */
  @property({ type: String, reflect: true }) status: SupportStatus;

  /** @private */
  declare _internals: ElementInternals;

  @queryAssignedElements() private alerts!: Alert[];

  render() {
    return html`
      <div internal-host>
        <slot @slotchange=${() => this.#updateStatus()}></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'group';
  }

  updated(props: PropertyValues<this>) {
    super.updated(props);
    this.#updateStatus();
  }

  #updateStatus() {
    this.alerts.forEach(alert => alert.status = this.status);
  }
}
