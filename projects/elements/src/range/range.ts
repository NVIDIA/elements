import { appendRootNodeStyle, getElementUpdate, useStyles } from '@elements/elements/internal';
import { Control } from '@elements/elements/forms';
import globalStyles from './range.global.css?inline';
import styles from './range.css?inline';
import { PropertyValues } from 'lit';

/**
 * @alpha
 * @element mlv-range
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
