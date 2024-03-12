import { html } from 'lit';
import { useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import { inputStyles } from '@elements/elements/input';
import { IconButton } from '@elements/elements/icon-button';
import styles from './date.css?inline';

/**
 * @element nve-date
 * @description A date picker is a control that enables users to choose a date value.
 * @since 0.3.0
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-date-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-38&t=CAAM7yEBvG18tRRa-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date
 * @vqa false
 */
export class Date extends Control {
  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'nve-date',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton
  };

  protected get suffixContent() {
    return html`<nve-icon-button .ariaLabel=${this.i18n.expand} icon-name="calendar" container="flat" @click=${this.showPicker}></nve-icon-button>`;
  }
}
