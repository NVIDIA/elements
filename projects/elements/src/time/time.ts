import { html } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { inputStyles } from '@elements/elements/input';
import styles from './time.css?inline';

/**
 * @element mlv-time
 * @description A time picker is a control that enables users to choose a time value.
 * @since 0.3.0
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-time-documentation--docs
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/time
 * @vqa false
 */
export class Time extends Control {
  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'mlv-time',
    version: 'PACKAGE_VERSION'
  };

  protected get suffixContent() {
    return html`<mlv-icon-button .ariaLabel=${this.i18n.expand} icon-name="schedule" interaction="flat" @click=${this.showPicker}></mlv-icon-button>`;
  }
}
