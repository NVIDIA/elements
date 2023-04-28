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
 * @element nve-control-message
 * @package true
 * @storybook http://localhost:7789/?path=/story/foundations-forms-validation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-43&t=iOYah8Uct8CFd69k-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
 */
export class ControlMessage extends LitElement {
  @property({ type: String, reflect: true }) status: 'warning' | 'error' | 'success' | 'disabled';

  /**
   * @type badInput | customError | patternMismatch | rangeOverflow | rangeUnderflow | stepMismatch | tooLong | tooShort | typeMismatch | valid | valueMissing
   * https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
   */
  @property({ type: String }) error: keyof ValidityState = null;

  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-control-message',
    version: 'PACKAGE_VERSION'
  };

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
    'nve-alert': Alert
  }

  render() {
    return html`
      <div internal-host>
        <nve-alert .status=${this.alertStatus}>
          <slot></slot>
        </nve-alert>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.slot = 'messages';
  }
}
