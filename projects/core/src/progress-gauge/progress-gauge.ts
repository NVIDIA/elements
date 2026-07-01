// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { Size, SupportStatus } from '@nvidia-elements/core/internal';
import { attachInternals, I18nController, useStyles } from '@nvidia-elements/core/internal';
import styles from './progress-gauge.css?inline';

const GAUGE_GEOMETRY = {
  default: {
    path: 'M 27.23 100.77 A 52 52 0 1 1 100.77 100.77',
    viewBox: '0 0 128 128'
  },
  half: {
    path: 'M 12 64 A 52 52 0 0 1 116 64',
    viewBox: '0 0 128 64'
  }
} as const;

/**
 * @element nve-progress-gauge
 * @description Use progress gauge to show system resource usage.
 * @since 2.0.2
 * @entrypoint \@nvidia-elements/core/progress-gauge
 * @slot - Content to display in the gauge center.
 * @cssprop --gauge-width
 * @cssprop --accent-color
 * @cssprop --background
 * @cssprop --color
 * @cssprop --width
 * @cssprop --height
 * @cssprop --font-size
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/progressbar_role
 * @stable false
 */
export class ProgressGauge extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-progress-gauge',
    version: '0.0.0'
  };

  /** @private */
  declare _internals: ElementInternals;

  /** The current `value` of the progress gauge. */
  @property({ type: Number }) value = 0;

  /** The `max` value of the progress gauge that the `value` is proportionally scaled to. */
  @property({ type: Number }) max? = 100;

  /** Four visual treatments represent the `status` of tasks. */
  @property({ type: String, reflect: true }) status?: SupportStatus | 'neutral' = 'neutral';

  /** Determines the gauge container shape. Set `half` for a compact semi-circular arc. */
  @property({ type: String, reflect: true }) container?: 'half';

  /** T-shirt `size` of the progress indicator, used to scale the gauge. */
  @property({ type: String, reflect: true }) size?: Size;

  #i18nController: I18nController<this> = new I18nController<this>(this);

  /** Enables updating internal string values for internationalization. */
  @property({ type: Object }) i18n = this.#i18nController.i18n;

  #normalizedValues() {
    const sourceMax = this.max;
    const max = sourceMax !== undefined && Number.isFinite(sourceMax) && sourceMax > 0 ? sourceMax : 100;
    const value = Number.isFinite(this.value) ? Math.min(Math.max(this.value, 0), max) : 0;
    return { value, max };
  }

  render() {
    const geometry = GAUGE_GEOMETRY[this.container ?? 'default'];
    const { value, max } = this.#normalizedValues();
    const progress = (value / max) * 100;

    return html`
      <div internal-host>
        <svg viewBox=${geometry.viewBox} role="presentation" aria-hidden="true">
          <path pathLength="100" d=${geometry.path} class="background"></path>
          <path pathLength="100" d=${geometry.path} class="gauge"
            ?empty=${progress <= 0}
            style=${`--_progress: ${progress};`}
            stroke-dasharray=${`${progress} 100`}>
          </path>
        </svg>
        <slot></slot>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'progressbar';
  }

  updated(props: PropertyValues<this>) {
    super.updated(props);
    const { value, max } = this.#normalizedValues();
    this._internals.ariaValueNow = `${value}`;
    this._internals.ariaValueMax = `${max}`;
    const i18nRecord = this.i18n as Record<string, string | undefined>;
    this._internals.ariaLabel =
      (this.status && i18nRecord[this.status] && i18nRecord[this.status] !== 'neutral'
        ? i18nRecord[this.status]!
        : this.i18n.information) ?? null;
  }
}
