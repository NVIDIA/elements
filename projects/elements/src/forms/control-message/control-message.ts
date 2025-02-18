import { LitElement, html } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import styles from './control-message.css?inline';

const statusIcons = {
  undefined: 'information-circle-stroke',
  disabled: 'information-circle-stroke',
  warning: 'exclamation-triangle',
  success: 'checkmark-circle',
  error: 'exclamation-circle'
} as const;

/**
 * @element nve-control-message
 * @description Defining a Validity State on a control-message will allow messages to be shown conditionally based on the current HTML5 validity state.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/forms
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
    version: '0.0.0'
  };

  render() {
    return html`
      <div internal-host>
        <nve-icon name=${statusIcons[this.status]}></nve-icon>
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.slot = 'messages';
  }
}
