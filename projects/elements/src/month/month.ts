import { html } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { inputStyles } from '@elements/elements/input';
import styles from './month.css?inline';

/**
 * @alpha
 * @element nve-month
 */
export class Month extends Control {
  static styles = useStyles([...Control.styles, inputStyles, styles]);

  protected get suffixContent() {
    return html`<nve-icon-button icon-name="date" interaction="ghost" @click=${() => this.input.showPicker()}></nve-icon-button>`;
  }
}
