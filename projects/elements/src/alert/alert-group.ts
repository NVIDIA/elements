import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { queryAssignedElements } from 'lit/decorators/query-assigned-elements.js';
import { property } from 'lit/decorators/property.js';
import type { Container, Prominence, SupportStatus } from '@nvidia-elements/core/internal';
import { attachInternals, useStyles, supportStateStyles, audit } from '@nvidia-elements/core/internal';
import { Alert } from './alert.js';
import styles from './alert-group.css?inline';

/**
 * @element nve-alert-group
 * @description An alert group is an element that displays a group of related and important messages in a way that attracts the user's attention without interrupting the user's task.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/alert
 * @cssprop --gap
 * @cssprop --color
 * @cssprop --padding
 * @cssprop --font-size
 * @cssprop --background
 * @cssprop --border-radius
 * @slot - default slot for nve-alert
 * @storybook https://NVIDIA.github.io/elements/docs/elements/alert-group/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=2519-54572&t=CAAM7yEBvG18tRRa-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/alert/
 */
@audit()
export class AlertGroup extends LitElement {
  static styles = useStyles([supportStateStyles, styles]);

  static readonly metadata = {
    tag: 'nve-alert-group',
    version: '0.0.0',
    children: [Alert.metadata.tag]
  };

  /** Defines visual treatment to represent a ongoing task or support status. */
  @property({ type: String, reflect: true }) status?: SupportStatus;

  /** Determines the visual prominence or weight, emphasis is used for banner style alerts */
  @property({ type: String, reflect: true }) prominence?: Extract<Prominence, 'emphasis'>;

  /** Determines the container bounds of the element */
  @property({ type: String, reflect: true }) container?: Extract<Container, 'full'>;

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
    this.alerts.forEach(alert => (alert.status = this.status));
  }
}
