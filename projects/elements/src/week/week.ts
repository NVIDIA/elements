import { html } from 'lit';
import { useStyles } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { inputStyles } from '@nvidia-elements/core/input';
import styles from './week.css?inline';

/**
 * @element nve-week
 * @description A week picker is a control that enables users to choose a week value.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/week
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-week-documentation--docs
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/week
 * @themes false
 */
export class Week extends Control {
  static styles = useStyles([...Control.styles, inputStyles, styles]);

  static readonly metadata = {
    tag: 'nve-week',
    version: '0.0.0'
  };

  static elementDefinitions = {
    [IconButton.metadata.tag]: IconButton
  };

  protected get suffixContent() {
    return html`<nve-icon-button .ariaLabel=${this.i18n.expand} icon-name="calendar" container="inline" @click=${this.showPicker}></nve-icon-button>`;
  }
}
