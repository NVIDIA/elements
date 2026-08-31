// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { styleMap } from 'lit/directives/style-map.js';
import type { Size, SupportStatus } from '@nvidia-elements/core/internal';
import { attachInternals, I18nController, useStyles } from '@nvidia-elements/core/internal';
import styles from './gauge.css?inline';

const GAUGE_GEOMETRY = {
  default: {
    center: 64,
    path: 'M 27.23 100.77 A 52 52 0 1 1 100.77 100.77',
    radius: 52,
    startAngle: 135,
    sweepAngle: 270,
    surfaceHeight: 128,
    viewBox: '8.53 8.53 110.93 95.7'
  },
  half: {
    center: 64,
    path: 'M 12 64 A 52 52 0 0 1 116 64',
    radius: 52,
    startAngle: 180,
    sweepAngle: 180,
    surfaceHeight: 64,
    viewBox: '8.53 8.53 110.93 58.93'
  }
} as const;

type GaugeGeometry = (typeof GAUGE_GEOMETRY)[keyof typeof GAUGE_GEOMETRY];

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

  /** Progress the gauge paints, which eases toward the value instead of jumping to it. */
  #paintedProgress = 0;

  #progressAnimation?: Animation;

  #progressFrame = 0;

  #normalizedValues() {
    const sourceMax = this.max;
    const max = sourceMax !== undefined && Number.isFinite(sourceMax) && sourceMax > 0 ? sourceMax : 100;
    const value = Number.isFinite(this.value) ? Math.min(Math.max(this.value, 0), max) : 0;
    return { value, max };
  }

  render() {
    const geometry = this.#geometry();
    const progress = this.#paintedProgress;
    const thumb = this.#normalizedThumb();
    const progressAngle = this.#angleAtProgress(geometry, progress);
    const fillPath = this.#pathAtProgress(geometry, progress);
    const showFill = thumb === 'fill';
    const showDot = progress > 0 && (thumb === 'fill' || thumb === 'dot');

    return html`
      <div internal-host>
        <svg viewBox=${geometry.viewBox} role="presentation" aria-hidden="true">
          <defs>
            <mask id="background-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="128" height=${geometry.surfaceHeight}>
              <path d=${geometry.path} class="background"></path>
            </mask>
            <mask id="fill-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="128" height=${geometry.surfaceHeight}>
              <path d=${fillPath} class="gauge" ?empty=${progress <= 0}></path>
            </mask>
          </defs>
          <foreignObject width="128" height=${geometry.surfaceHeight} mask="url(#background-mask)">
            <div xmlns="http://www.w3.org/1999/xhtml" class="background-surface"></div>
          </foreignObject>
          <foreignObject class="fill-layer" width="128" height=${geometry.surfaceHeight} mask="url(#fill-mask)"
            ?hidden=${!showFill || progress <= 0}>
            <div xmlns="http://www.w3.org/1999/xhtml" class="fill-surface"></div>
          </foreignObject>
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

  disconnectedCallback() {
    super.disconnectedCallback();

    // settle the value, otherwise reattaching paints the frame where the animation stopped
    if (this.#progressAnimation) {
      this.#stopProgressAnimation();
      this.#paintedProgress = this.#targetProgress();
      this.requestUpdate();
    }
  }

  willUpdate(props: PropertyValues<this>) {
    super.willUpdate(props);

    if (props.has('value') || props.has('max')) {
      this.#animateProgress();
    }
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

  #targetProgress() {
    const { value, max } = this.#normalizedValues();
    return (value / max) * 100;
  }

  /**
   * Eases the painted progress toward the value with the duration and easing declared in css, so
   * that `prefers-reduced-motion` and a `--_animation-duration` override both settle immediately.
   */
  #animateProgress() {
    const target = this.#targetProgress();
    const timing = this.hasUpdated ? this.#animationTiming() : undefined;

    this.#stopProgressAnimation();

    if (!timing || target === this.#paintedProgress) {
      this.#paintedProgress = target;
      return;
    }

    const from = this.#paintedProgress;
    // keyframeless animations only keep time, leaving every painted frame to `render`
    const animation = this.animate(null, timing);
    const paint = (progress: number) => {
      this.#paintedProgress = from + (target - from) * progress;
      this.requestUpdate();
    };
    const paintFrame = () => {
      paint(animation.effect?.getComputedTiming().progress ?? 0);

      if (animation.playState === 'running') {
        this.#progressFrame = requestAnimationFrame(paintFrame);
      }
    };

    animation.finished.then(
      () => {
        // a value that changes on the frame this settles already started the next animation
        if (this.#progressAnimation === animation) {
          this.#stopProgressAnimation();
          paint(1);
        }
      },
      () => undefined
    );

    this.#progressAnimation = animation;
    this.#progressFrame = requestAnimationFrame(paintFrame);
  }

  #stopProgressAnimation() {
    // only a browser render starts an animation, so server rendering never reaches these apis
    if (this.#progressAnimation) {
      cancelAnimationFrame(this.#progressFrame);
      this.#progressAnimation.cancel();
      this.#progressAnimation = undefined;
    }
  }

  #animationTiming() {
    const gaugeStyles = getComputedStyle(this);
    const duration = gaugeStyles.getPropertyValue('--_animation-duration').trim();
    const milliseconds = parseFloat(duration) * (duration.endsWith('ms') ? 1 : 1000);
    const easing = gaugeStyles.getPropertyValue('--nve-ref-animation-easing-100').trim();

    return milliseconds > 0 ? { duration: milliseconds, easing: easing || 'linear' } : undefined;
  }

  #angleAtProgress(geometry: GaugeGeometry, progress: number) {
    return geometry.startAngle + geometry.sweepAngle * (progress / 100);
  }

  #pathAtProgress(geometry: GaugeGeometry, progress: number) {
    const start = this.#pointAtAngle(geometry, geometry.startAngle);
    const sweepAngle = geometry.sweepAngle * (progress / 100);
    const end = this.#pointAtAngle(geometry, geometry.startAngle + sweepAngle);
    const largeArcFlag = sweepAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${geometry.radius} ${geometry.radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  }

  #pointAtAngle(geometry: GaugeGeometry, angle: number) {
    const radians = (angle * Math.PI) / 180;
    return {
      x: geometry.center + geometry.radius * Math.cos(radians),
      y: geometry.center + geometry.radius * Math.sin(radians)
    };
  }

  #geometry() {
    return this.shape === 'half' ? GAUGE_GEOMETRY.half : GAUGE_GEOMETRY.default;
  }

  #normalizedThumb() {
    return this.thumb === 'dot' || this.thumb === 'needle' ? this.thumb : 'fill';
  }
}
