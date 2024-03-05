import { html } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { inputStyles } from '@elements/elements/input';
import { IconButton } from '@elements/elements/icon-button';
import styles from './month.css?inline';

/**
 * @element nve-month
 * @description A month picker is a control that enables users to choose a month value.
 * @since 0.3.0
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-month-documentation--docs
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/month
 * @vqa false
 */
export class Month extends Control {
  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'nve-month',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton
  };

  protected get suffixContent() {
    return html`<nve-icon-button .ariaLabel=${this.i18n.expand} icon-name="calendar" interaction="flat" @click=${this.showPicker}></nve-icon-button>`;
  }
}
