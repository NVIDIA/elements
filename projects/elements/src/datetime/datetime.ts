import { html } from 'lit';
import { useStyles } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import { inputStyles } from '@nvidia-elements/core/input';
import { IconButton } from '@nvidia-elements/core/icon-button';
import styles from './datetime.css?inline';

/**
 * @element nve-datetime
 * @description A datetime picker is a control that enables users to choose a datetime value.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/datetime
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-datetime-documentation--docs
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/datetime-local
 * @themes false
 */
export class Datetime extends Control {
  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'nve-datetime',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton
  };

  protected get suffixContent() {
    return html`<nve-icon-button .ariaLabel=${this.i18n.expand} icon-name="calendar" container="inline" @click=${this.showPicker}></nve-icon-button>`;
  }
}
