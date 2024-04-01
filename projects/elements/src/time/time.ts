import { html } from 'lit';
import { useStyles } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { inputStyles } from '@nvidia-elements/core/input';
import styles from './time.css?inline';

/**
 * @element mlv-time
 * @description A time picker is a control that enables users to choose a time value.
 * @since 0.3.0
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-time-documentation--docs
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/time
 * @themes false
 */
export class Time extends Control {
  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'mlv-time',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton
  };

  protected get suffixContent() {
    return html`<mlv-icon-button .ariaLabel=${this.i18n.expand} icon-name="clock" container="flat" @click=${this.showPicker}></mlv-icon-button>`;
  }
}
