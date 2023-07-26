import { html } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { inputStyles } from '@elements/elements/input';
import styles from './datetime.css?inline';

/**
 * @element mlv-datetime
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-datetime-documentation--docs
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local
 * @vqa false
 */
export class Datetime extends Control {
  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'mlv-datetime',
    version: 'PACKAGE_VERSION'
  };

  protected get suffixContent() {
    return html`<mlv-icon-button icon-name="calendar" interaction="flat" @click=${this.showPicker}></mlv-icon-button>`;
  }
}
