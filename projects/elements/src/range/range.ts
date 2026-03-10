import { appendRootNodeStyle, getElementUpdate, useStyles } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import globalStyles from './range.global.css?inline';
import styles from './range.css?inline';
import type { PropertyValues } from 'lit';
import { html, nothing, isServer } from 'lit';
/**
 * @element nve-range
 * @description A range slider is a control that enables users to choose a value from a continuous range of values.
 * @since 0.3.0
 * @entrypoint \@nvidia-elements/core/range
 * @cssprop --background
 * @cssprop --control-height
 * @cssprop --cursor
 * @cssprop --track-width
 * @cssprop --track-height
 * @cssprop --track-border-radius
 * @cssprop --thumb-width
 * @cssprop --thumb-height
 * @cssprop --thumb-background
 * @cssprop --thumb-border
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
    getElementUpdate(this.input, 'value', (value: unknown) => this.#setTrackWidth(value as number));
  }

  #setTrackWidth(val?: number) {
    const value = val ?? this.input.valueAsNumber;
    const min = this.input.min ? parseFloat(this.input.min) : 0;
    const max = this.input.max ? parseFloat(this.input.max) : 100;
    this.style.setProperty('--track-width', `${Math.floor(((value - min) / (max - min)) * 100) / 100}`);
  }

  protected get suffixContent() {
    const datalist = !isServer ? this.querySelector<HTMLDataListElement>('datalist') : null;
    if (datalist) {
      const options = Array.from(datalist?.options ?? []);
      const min = this.input?.min ? parseFloat(this.input?.min) : 0;
      const max = this.input?.max ? parseFloat(this.input?.max) : 100;

      return html`<div class="datalist-labels">
        ${options.map(option => {
          const value = parseFloat(option.value);
          const position = ((value - min) / (max - min)) * 100;
          const style = `left: ${position}%; transform: translateX(-${position}%)`;
          const template = html`<span class="datalist-tick" style=${style}>${option.textContent || value}</span>`;
          return template;
        })}
      </div>`;
    } else {
      return nothing;
    }
  }
}
