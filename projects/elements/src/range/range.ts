import { appendRootNodeStyle, getElementUpdate, useStyles } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import globalStyles from './range.global.css?inline';
import styles from './range.css?inline';
import type { PropertyValues } from 'lit';

/**
 * @element nve-range
 * @description A range slider is a control that enables users to choose a value from a continuous range of values.
 * @since 0.3.0
 * @storybook https://NVIDIA.github.io/elements/api/?path=/docs/elements-range-documentation--docs
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-25&t=iOYah8Uct8CFd69k-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/slider/
 */
export class Range extends Control {
  static styles = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'nve-range',
    version: '0.0.0'
  };

  connectedCallback() {
    super.connectedCallback();
    appendRootNodeStyle(this, globalStyles);
  }

  firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    this.#setTrackWidth();
    this.input.addEventListener('input', () => this.#setTrackWidth());
    getElementUpdate(this.input, 'value', (value: number) => this.#setTrackWidth(value));
  }

  #setTrackWidth(val?: number) {
    const value = val ?? this.input.valueAsNumber;
    const min = this.input.min ? parseFloat(this.input.min) : 0;
    const max = this.input.max ? parseFloat(this.input.max) : 100;
    this.style.setProperty('--track-width', `${Math.floor(((value - min) / (max - min)) * 100)}%`);
  }
}
