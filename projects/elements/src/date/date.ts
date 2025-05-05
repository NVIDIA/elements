import { html } from 'lit';
import { useStyles } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import { inputStyles } from '@nvidia-elements/core/input';
import { IconButton } from '@nvidia-elements/core/icon-button';
import styles from './date.css?inline';

/**
 * @element nve-date
 * @description A date picker is a control that enables users to choose a date value.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/date
 * @storybook https://NVIDIA.github.io/elements/docs/elements/date/
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=30-38&t=CAAM7yEBvG18tRRa-0
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date
 * @themes false
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
    return html`<nve-icon-button .ariaLabel=${this.i18n.expand} icon-name="calendar" container="inline" @click=${this.showPicker}></nve-icon-button>`;
  }
}
