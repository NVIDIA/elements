import { LitElement, html, PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
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
 * @element mlv-control-message
 */
export class ControlMessage extends LitElement {
  @property({ type: String, reflect: true }) status: 'warning' | 'error' | 'success' | 'disabled';

  /**
   * @type badInput | customError | patternMismatch | rangeOverflow | rangeUnderflow | stepMismatch | tooLong | tooShort | typeMismatch | valid | valueMissing
   * https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
   */
  @property({ type: String }) error: keyof ValidityState = null;

  @state() private alertStatus: string;

  static styles = useStyles([styles]);

  render() {
    return html`
      <div internal-host>
        <mlv-alert .status=${this.alertStatus}>
          <slot></slot>
        </mlv-alert>
      </div>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.slot = 'messages';
  }

  protected update(props: PropertyValues<this>) {
    super.update(props);
    if (props.has('status')) {
      this.alertStatus = alertStatus[this.status];
    }

    if (props.has('error') && this.error) {
      this.alertStatus = alertStatus.error;
    }
  }
}
