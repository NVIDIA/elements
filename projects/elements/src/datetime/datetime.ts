import { html } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { inputStyles } from '@elements/elements/input';
import styles from './datetime.css?inline';

/**
 * @alpha
 * @element nve-datetime
 */
export class Datetime extends Control {
  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'nve-datetime',
    version: 'PACKAGE_VERSION'
  };

  protected get suffixContent() {
    return html`<nve-icon-button icon-name="date" interaction="ghost" @click=${() => this.input.showPicker()}></nve-icon-button>`;
  }
}
