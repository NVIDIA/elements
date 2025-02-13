import { html } from 'lit';
import { state } from 'lit/decorators/state.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import { inputStyles } from '@nvidia-elements/core/input';
import { IconButton } from '@nvidia-elements/core/icon-button';
import styles from './password.css?inline';

/**
 * @element nve-password
 * @description A password is a control that enables users to enter password text.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/password
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-password-documentation--docs
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/password
 */
export class Password extends Control {
  @state() private pressed = false;

  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'nve-password',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton
  };

  protected get suffixContent() {
    return html`<nve-icon-button @click=${() => this.#toggleVisibility()} .pressed=${this.pressed} .iconName=${this.pressed ? 'eye-hidden' : 'eye'} container="inline" .ariaLabel=${this.pressed ? this.i18n.hide : this.i18n.show}></nve-icon-button>`;
  }

  #toggleVisibility() {
    this.pressed = !this.pressed;
    this.input.type = this.pressed ? 'text' : 'password';
  }
}
