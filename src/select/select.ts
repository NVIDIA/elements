import { html, PropertyValues } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import styles from './select.css?inline';

/**
 * @alpha
 * @element nve-select
 * @cssprop --padding
 * @cssprop --font-size
 * @cssprop --height
 * @cssprop --background
 * @cssprop --border-radius
 * @cssprop --border
 */
export class Select extends Control {
  static styles = useStyles([...Control.styles, styles]);

  protected get suffixContent() {
    return this.input?.multiple ? html`` : html`<nve-icon-button icon-name="chevron-down" interaction="ghost" readonly></nve-icon-button>`;
  }
}
