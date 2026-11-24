// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, isServer, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { Color, SupportStatus } from '@nvidia-elements/core/internal';
import { colorStateStyles } from '@nvidia-elements/core/internal';
import { attachInternals } from '@nvidia-elements/foundations/internal/a11y';
import { useStyles } from '@nvidia-elements/foundations/internal/styles';
import { getMeterRange } from './meter-range.js';
import styles from './meter.css?inline';

/**
 * @element nve-meter
 * @description A meter displays a named scalar measurement within a known range. Compose direct meter children inside `nve-meter-group` for a segmented track.
 * @documentation https://nvidia.github.io/elements/docs/elements/meter/
 * @since 2.28.0
 * @entrypoint \@nvidia-elements/core/meter
 * @cssprop --accent-color - Fill override, taking precedence over color and status.
 * @cssprop --background - Track background.
 * @cssprop --height - Track height. Set on the group for segmented tracks.
 * @aria https://www.w3.org/WAI/ARIA/apg/patterns/meter/
 * @stable false
 */
export class Meter extends LitElement {
  static styles = useStyles([colorStateStyles, styles]);

  static readonly metadata = { tag: 'nve-meter', version: '0.0.0' };

  /** @private */
  declare _internals: ElementInternals;

  /** Current measurement. Effective values clamp to the bounds; non-finite values resolve to the effective minimum. */
  @property({ type: Number }) value = 0;

  /** Lower bound. Non-finite inputs resolve to zero without changing the supplied property. */
  @property({ type: Number }) min = 0;

  /** Upper bound. Non-finite inputs resolve to 100, then clamp up to the effective minimum. Collapsed ranges display an empty fill. */
  @property({ type: Number }) max = 100;

  /** Palette variant for the fill, matching badges and tags. Takes precedence over status. */
  @property({ type: String, reflect: true }) color?: Color;

  /** Explicit semantic fill treatment. Communicate its meaning through visible text or an accessible description. */
  @property({ type: String, reflect: true }) status?: SupportStatus;

  willUpdate() {
    if (isServer) {
      // SSR cannot inspect the group's light DOM or run its updated() sizing.
      const style = this.getAttribute('style') ?? '';
      this.setAttribute('style', `${style}; --_meter-segment-size: ${getMeterRange(this).fraction * 100}%;`);
    }
  }

  render() {
    const { fraction } = getMeterRange(this);
    return html`
      <div internal-host aria-hidden="true">
        <div class="fill" style=${styleMap({ inlineSize: `var(--_meter-fill-size, ${fraction * 100}%)` })}></div>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'meter';
  }

  updated() {
    const { min, max, value } = getMeterRange(this);
    this._internals.ariaValueMin = String(min);
    this._internals.ariaValueMax = String(max);
    this._internals.ariaValueNow = String(value);
  }
}
