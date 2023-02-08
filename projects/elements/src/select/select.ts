import { html } from 'lit';
import { appendRootNodeStyle, useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import globalStyles from './select.global.css?inline';
import styles from './select.css?inline';

/**
 * @alpha
 * @element mlv-select
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
    return (this.input?.multiple || this.input?.size) ? html`` : html`<mlv-icon name="chevron-down"></mlv-icon>`;
  }

  connectedCallback() {
    super.connectedCallback();
    appendRootNodeStyle(this, globalStyles);
  }
}
