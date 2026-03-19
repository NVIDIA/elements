// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { appendRootNodeStyle, getElementUpdate, useStyles } from '@nvidia-elements/core/internal';
import { Control } from '@nvidia-elements/core/forms';
import { property } from 'lit/decorators/property.js';
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

  /** Determines the orientation of the range slider. */
  @property({ type: String, reflect: true }) orientation: 'vertical' | 'horizontal' = 'horizontal';

  connectedCallback() {
    super.connectedCallback();
    appendRootNodeStyle(this, globalStyles);
    this._internals.ariaOrientation = this.orientation;
  }

  firstUpdated(props: PropertyValues<this>) {
    super.firstUpdated(props);
    this.#setTrackWidth();
    this.input.addEventListener('input', () => this.#setTrackWidth());
    getElementUpdate(this.input, 'value', (value: unknown) => this.#setTrackWidth(value as number));
  }

  updated(props: PropertyValues<this>) {
    super.updated(props);
    if (props.has('orientation')) {
      this._internals.ariaOrientation = this.orientation;
    }
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
          const style =
            this.orientation === 'vertical'
              ? `bottom: ${position}%; transform: translateY(${position}%)`
              : `left: ${position}%; transform: translateX(-${position}%)`;
          const template = html`<span class="datalist-tick" style=${style}>${option.textContent || value}</span>`;
          return template;
        })}
      </div>`;
    } else {
      return nothing;
    }
  }
}
