// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { Size, SupportStatus } from '@nvidia-elements/core/internal';
import { attachInternals, I18nController, useStyles } from '@nvidia-elements/core/internal';
import styles from './gauge.css?inline';

const GAUGE_DASH_GAP = 200;
const GAUGE_DASH_SCALE = 100 / 110.93;

const GAUGE_GEOMETRY = {
  default: {
    center: 64,
    path: 'M 27.23 100.77 A 52 52 0 1 1 100.77 100.77',
    radius: 52,
    start: { x: 27.23, y: 100.77 },
    startAngle: 135,
    sweepAngle: 270,
    surfaceHeight: 128,
    viewBox: '8.53 8.53 110.93 95.7'
  },
  half: {
    center: 64,
    path: 'M 12 64 A 52 52 0 0 1 116 64',
    radius: 52,
    start: { x: 12, y: 64 },
    startAngle: 180,
    sweepAngle: 180,
    surfaceHeight: 64,
    viewBox: '8.53 8.53 110.93 58.93'
  }
} as const;

type GaugeGeometry = (typeof GAUGE_GEOMETRY)[keyof typeof GAUGE_GEOMETRY];

const fillMaskStyle = (progress: number) => ({
  '--_progress': progress,
  '--_dash-progress': `${progress * GAUGE_DASH_SCALE}cqw`,
  '--_dash-gap': `${GAUGE_DASH_GAP * GAUGE_DASH_SCALE}cqw`
});

const thumbStyle = (thumb: 'dot' | 'needle', progressAngle: number, geometry: GaugeGeometry) => ({
  [`--_${thumb}-angle`]: `${progressAngle}deg`,
  [`--_${thumb}-origin`]: `${geometry.center}px ${geometry.center}px`,
  [`--_${thumb}-start-angle`]: `${geometry.startAngle}deg`
});

/**
 * @element nve-gauge
 * @description Use a gauge to show system resource usage.
 * @documentation https://nvidia.github.io/elements/docs/elements/gauge/
 * @since 2.0.4
 * @entrypoint \@nvidia-elements/core/gauge
 * @slot - Content to display in the gauge center.
 * @cssprop --track-width
 * @cssprop --accent-color
 * @cssprop --background
 * @cssprop --needle-background
 * @cssprop --track-background
 * @cssprop --thumb-background
 * @cssprop --color
 * @cssprop --width
 * @cssprop --height
 * @cssprop --font-size
 * @cssprop --gap
 * @aria https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/progressbar_role
 * @stable false
 */
export class Gauge extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-gauge',
    version: '0.0.0'
  };

  /** @private */
  declare _internals: ElementInternals;

  /** The current `value` of the gauge. */
  @property({ type: Number }) value = 0;

  /** The `max` value of the gauge that the `value` is proportionally scaled to. */
  @property({ type: Number }) max? = 100;

  /** Four visual treatments represent the `status` of tasks. */
  @property({ type: String, reflect: true }) status?: SupportStatus | 'neutral' = 'neutral';

  /** Determines the gauge shape. Set `half` for a compact semi-circular arc. */
  @property({ type: String, reflect: true }) shape?: 'half';

  /** Controls the value indicator. Set `dot` for only the end dot or `needle` for a pointer. */
  @property({ type: String, reflect: true }) thumb: 'fill' | 'dot' | 'needle' = 'fill';

  /** T-shirt `size` of the gauge. */
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
    const geometry = this.#geometry();
    const { value, max } = this.#normalizedValues();
    const progress = (value / max) * 100;
    const thumb = this.#normalizedThumb();
    const progressAngle = this.#angleAtProgress(geometry, progress);
    const showFill = thumb === 'fill';
    const showDot = progress > 0 && (thumb === 'fill' || thumb === 'dot');

    return html`
      <div internal-host>
        <svg viewBox=${geometry.viewBox} role="presentation" aria-hidden="true">
          <defs>
            <mask id="background-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="128" height=${geometry.surfaceHeight}>
              <path pathLength="100" d=${geometry.path} class="background"></path>
            </mask>
            <mask id="fill-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="128" height=${geometry.surfaceHeight}>
              <path pathLength="100" d=${geometry.path} class="gauge"
                ?empty=${progress <= 0}
                style=${styleMap(fillMaskStyle(progress))}
                stroke-dasharray=${`${progress} ${GAUGE_DASH_GAP}`}>
              </path>
            </mask>
          </defs>
          <foreignObject width="128" height=${geometry.surfaceHeight} mask="url(#background-mask)">
            <div xmlns="http://www.w3.org/1999/xhtml" class="background-surface"></div>
          </foreignObject>
          <foreignObject class="fill-layer" width="128" height=${geometry.surfaceHeight} mask="url(#fill-mask)" ?hidden=${!showFill}>
            <div xmlns="http://www.w3.org/1999/xhtml" class="fill-surface"></div>
          </foreignObject>
          <circle class="fill-dot-start" cx=${geometry.start.x} cy=${geometry.start.y} ?hidden=${!(showFill && progress > 0)}></circle>
          <circle class="fill-dot-end" cx=${geometry.center + geometry.radius} cy=${geometry.center}
            ?hidden=${!showDot}
            style=${styleMap(thumbStyle('dot', progressAngle, geometry))}>
          </circle>
          <g class="needle"
            ?hidden=${thumb !== 'needle'}
            style=${styleMap(thumbStyle('needle', progressAngle, geometry))}>
            <line class="needle-line" x1=${geometry.center} y1=${geometry.center} x2=${geometry.center + 40} y2=${geometry.center}></line>
            <circle class="needle-hub" cx=${geometry.center} cy=${geometry.center}></circle>
          </g>
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
    const { status } = this;
    const statusLabel =
      status !== undefined && status !== 'neutral' && status !== 'accent' ? this.i18n[status] : undefined;
    this._internals.ariaLabel = statusLabel ?? this.i18n.information ?? null;
  }

  #angleAtProgress(geometry: GaugeGeometry, progress: number) {
    return geometry.startAngle + geometry.sweepAngle * (progress / 100);
  }

  #geometry() {
    return this.shape === 'half' ? GAUGE_GEOMETRY.half : GAUGE_GEOMETRY.default;
  }

  #normalizedThumb() {
    return this.thumb === 'dot' || this.thumb === 'needle' ? this.thumb : 'fill';
  }
}
