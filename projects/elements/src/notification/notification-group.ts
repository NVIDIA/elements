import { html, LitElement } from 'lit';
import { state } from 'lit/decorators/state.js';
import { property } from 'lit/decorators/property.js';
import { PopoverAlign, TypePopoverController, useStyles } from '@elements/elements/internal';
import styles from './notification-group.css?inline';


/**
 * @alpha
 * @element mlv-notification-group
 */
export class NotificationGroup extends LitElement {
  @property({ type: String }) anchor: string | HTMLElement;

  @property({ type: String, reflect: true }) position;

  @property({ type: String, reflect: true }) alignment: PopoverAlign;

  @state() private minHeight = 0;

  protected typePopoverController = new TypePopoverController<NotificationGroup>(this);

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'mlv-notification-group',
    version: 'PACKAGE_VERSION'
  };

  render() {
    return html`
    <div internal-host style="min-height: ${this.minHeight}px">
      <slot @slotchange=${this.#updateHeight}></slot>
    </div>
    `;
  }

  #updateHeight() {
    const currentHeight = this.getBoundingClientRect().height;
    if (currentHeight > this.minHeight) {
      this.minHeight = currentHeight;
    }
  }
}
