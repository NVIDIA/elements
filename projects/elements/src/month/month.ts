import { html } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { inputStyles } from '@elements/elements/input';
import styles from './month.css?inline';

/**
 * @element mlv-month
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-month-documentation--page
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/month
 */
export class Month extends Control {
  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'mlv-month',
    version: 'PACKAGE_VERSION'
  };

  protected get suffixContent() {
    return html`<mlv-icon-button icon-name="date" interaction="ghost" @click=${() => this.input.showPicker()}></mlv-icon-button>`;
  }
}
