import { html } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { inputStyles } from '@elements/elements/input';
import styles from './time.css?inline';

/**
 * @alpha
 * @element mlv-time
 */
export class Time extends Control {
  static styles = useStyles([...Control.styles, inputStyles, styles]);

  protected get suffixContent() {
    return html`<mlv-icon-button icon-name="schedule" interaction="ghost" @click=${() => this.input.showPicker()}></mlv-icon-button>`;
  }
}
