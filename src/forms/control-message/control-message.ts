import { LitElement, html } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@elements/elements/internal';
import styles from './control-message.css?inline';

const alertStatus = {
  error: 'danger',
  warning: 'warning',
  success: 'success',
  disabled: 'muted'
};

/**
 * @alpha
 * @element nve-control-message
 */
export class ControlMessage extends LitElement {
  @property({ type: String, reflect: true }) status: 'warning' | 'error' | 'success' | 'disabled';

  /**
   * @type badInput | customError | patternMismatch | rangeOverflow | rangeUnderflow | stepMismatch | tooLong | tooShort | typeMismatch | valid | valueMissing
   * https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
   */
  @property({ type: String }) error: keyof ValidityState = null;

  static styles = useStyles([styles]);

  render() {
    return html`
      <div internal-host>
        <nve-alert .status=${alertStatus[this.status]}>
          <slot></slot>
        </nve-alert>
      </div>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.slot = 'messages';
  }
}
