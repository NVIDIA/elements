import { html } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { inputStyles } from '@elements/elements/input';
import styles from './week.css?inline';

/**
 * @element nve-week
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-week-documentation--page
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/week
 */
export class Week extends Control {
  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'nve-week',
    version: 'PACKAGE_VERSION'
  };

  protected get suffixContent() {
    return html`<nve-icon-button icon-name="date" interaction="ghost" @click=${() => this.input.showPicker()}></nve-icon-button>`;
  }
}
