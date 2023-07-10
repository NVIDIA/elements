import { html } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { inputStyles } from '@elements/elements/input';
import styles from './week.css?inline';

/**
 * @element nve-week
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/docs/elements-week-documentation--docs
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/week
 * @vqa false
 */
export class Week extends Control {
  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'nve-week',
    version: 'PACKAGE_VERSION'
  };

  protected get suffixContent() {
    return html`<nve-icon-button icon-name="date" interaction="flat" @click=${this.showPicker}></nve-icon-button>`;
  }
}
