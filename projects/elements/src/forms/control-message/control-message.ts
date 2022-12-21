import { LitElement, html } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@elements/elements/internal';
import { Alert } from '@elements/elements/alert';
import styles from './control-message.css?inline';

const alertStatus: AlertStatus = {
  error: 'danger',
  warning: 'warning',
  success: 'success',
  disabled: 'muted'
};

interface AlertStatus {
  error: 'danger',
  warning: 'warning',
  success: 'success',
  disabled: 'muted'
}

/**
 * @alpha
 * @element mlv-control-message
 */
export class ControlMessage extends LitElement {
  @property({ type: String, reflect: true }) status: 'warning' | 'error' | 'success' | 'disabled';

  /**
   * @type badInput | customError | patternMismatch | rangeOverflow | rangeUnderflow | stepMismatch | tooLong | tooShort | typeMismatch | valid | valueMissing
   * https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
   */
  @property({ type: String }) error: keyof ValidityState = null;

  static styles = useStyles([styles]);

  get alertStatus(){
    if (this.status) {
      return alertStatus[this.status];
    } else if (this.error) {
      return alertStatus.error;
    } else {
      return 'muted';
    }
  }

  static elementDefinitions = {
    'mlv-alert': Alert
  }

  render() {
    return html`
      <div internal-host>
        <mlv-alert .status=${this.alertStatus}>
          <slot></slot>
        </mlv-alert>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.slot = 'messages';
  }
}
