import { html } from 'lit';
import { state } from 'lit/decorators/state.js';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { inputStyles } from '@elements/elements/input';
import styles from './password.css?inline';

/**
 * @alpha
 * @element nve-password
 */
export class Password extends Control {
  @state() private pressed = false;

  static styles = useStyles([...Control.styles, inputStyles, styles]);

  protected get suffixContent() {
    return html`<nve-icon-button @click=${() => this.#toggleVisibility()} .pressed=${this.pressed} .iconName=${this.pressed ? 'eye-hidden' : 'eye'} interaction="ghost"></nve-icon-button>`;
  }

  #toggleVisibility() {
    this.pressed = !this.pressed;
    this.input.type = this.pressed ? 'text' : 'password';
  }
}
