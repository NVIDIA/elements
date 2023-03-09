import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { statusStateStyles, supportStateStyles, SupportStatus, TaskStatus, useStyles } from '@elements/elements/internal';
import styles from './dot.css?inline';

/**
 * @alpha
 * @element nve-dot
 * @slot - This is a default/unnamed slot for content
 * @cssprop --background
 * @cssprop --color
 */
export class Dot extends LitElement {
  /** visual treatment to represent a ongoing task status */
  @property({ type: String, reflect: true }) status: SupportStatus | TaskStatus;

  static styles = useStyles([styles, statusStateStyles, supportStateStyles]);

  static readonly metadata = {
    tag: 'nve-dot',
    version: 'PACKAGE_VERSION'
  };

  #internals = this.attachInternals();

  render() {
    return html`
      <div internal-host>
        <slot @slotchange=${() => this.#updateSlot()}></slot>
      </div>
    `;
  }

  #updateSlot() {
    console.log(this.#internals)
    this.textContent.length ? this.#internals.states.add('--has-text') : this.#internals.states.delete('--has-text');
  }
}
