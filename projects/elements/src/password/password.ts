import { html } from 'lit';
import { state } from 'lit/decorators/state.js';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { inputStyles } from '@elements/elements/input';
import styles from './password.css?inline';

/**
 * @element mlv-password
 * @description A password is a control that enables users to enter password text.
 * @since 0.3.0
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-password-documentation--docs
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/password
 */
export class Password extends Control {
  @state() private pressed = false;

  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'mlv-password',
    version: '0.0.0'
  };

  protected get suffixContent() {
    return html`<mlv-icon-button @click=${() => this.#toggleVisibility()} .pressed=${this.pressed} .iconName=${this.pressed ? 'hidden' : 'visible'} interaction="flat" .ariaLabel=${this.pressed ? this.i18n.hide : this.i18n.show}></mlv-icon-button>`;
  }

  #toggleVisibility() {
    this.pressed = !this.pressed;
    this.input.type = this.pressed ? 'text' : 'password';
  }
}
