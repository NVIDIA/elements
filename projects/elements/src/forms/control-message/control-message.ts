import { LitElement, html } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@elements/elements/internal';
import { Alert } from '@elements/elements/alert';
import styles from './control-message.css?inline';

const alertStatus: AlertStatus = {
  error: 'danger',
  warning: 'warning',
  success: 'success',
  disabled: undefined
};

interface AlertStatus {
  error: 'danger',
  warning: 'warning',
  success: 'success',
  disabled: undefined
}

/**
 * @element nve-control-message
 * @slot - default slot for content
 * @cssprop --color
 * @cssprop --font-weight
 * @cssprop --font-size
 * @storybook http://localhost:7789/?path=/docs/foundations-forms-validation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-43&t=iOYah8Uct8CFd69k-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals
 * @package true
 */
export class ControlMessage extends LitElement {
  /** 
   * Visual treatment for current form control validation status
   */
  @property({ type: String, reflect: true }) status?: 'warning' | 'error' | 'success' | 'disabled';

  /**
   * Validation error code for current form control
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
      return undefined;
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
