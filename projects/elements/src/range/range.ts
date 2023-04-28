import { appendRootNodeStyle, getElementUpdate, useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import globalStyles from './range.global.css?inline';
import styles from './range.css?inline';
import { PropertyValues } from 'lit';

/**
 * @element mlv-range
 * @storybook https://elements.nvidia.com/ui/storybook/elements?path=/story/elements-range-documentation--page
 * @figma https://www.figma.com/file/vbcJuxNZO6t2KScQ8y5H7z/%F0%9F%93%9A-MagLev-Elements-Design-Catalog---WIP?node-id=29-25&t=iOYah8Uct8CFd69k-0
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/slider/
 */
export class Range extends Control {
  static styles = useStyles([...Control.styles, styles]);

  static readonly metadata = {
    tag: 'mlv-range',
    version: 'PACKAGE_VERSION'
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
    const min = this.input.min ? parseInt(this.input.min, 10) : 0;
    const max = this.input.max ? parseInt(this.input.max, 10) : 100;
    this.style.setProperty('--track-width', `${Math.floor(((value - min) / (max - min)) * 100)}%`);
  }
}
