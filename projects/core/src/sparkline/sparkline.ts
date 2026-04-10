// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PropertyValues, SVGTemplateResult } from 'lit';
import { html, LitElement, nothing, svg } from 'lit';
import { property } from 'lit/decorators/property.js';
import { state } from 'lit/decorators/state.js';
import type {
  DataElement,
  Interpolation,
  Point,
  SizeExpanded,
  SparklineMark,
  SupportStatus,
  TaskStatus
} from '@nvidia-elements/core/internal';
import { attachInternals, statusStateStyles, supportStateStyles, useStyles } from '@nvidia-elements/core/internal';
import {
  calculateDomain,
  calculateSymbolIndices,
  calculateViewBox,
  PRECISION,
  toAreaPath,
  toColumnRects,
  toInterpolation,
  toLinePath,
  toPlotPoints,
  toValidData,
  toWinLossRects,
  valueToY,
  VIEW_HEIGHT
} from './sparkline.utils.js';
import styles from './sparkline.css?inline';

/**
 * @element nve-sparkline
 * @description A sparkline is a compact, word-sized chart with typographic scale, for data-dense layouts (text, tables, cards, dashboards).
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/core/sparkline
 * @cssprop --height - Height (defaults to 1em and scales with parent font-size).
 * @cssprop --line-color
 * @cssprop --line-width
 * @cssprop --fill-color - Color used by area and column marks.
 * @cssprop --gradient-max-color
 * @cssprop --gradient-min-color
 * @cssprop --zero-line-color
 * @cssprop --zero-line-width
 * @cssprop --win-color  Color used to represent positive values (wins).
 * @cssprop --loss-color Color used to represent negative values (losses).
 * @cssprop --draw-color Color used to represent zero values (draws / neutral outcomes).
 * @cssprop --symbol-color
 * @cssprop --symbol-border-color
 * @cssprop --symbol-border-width
 * @cssprop --symbol-radius - symbol circle radius in SVG units.
 * @aria https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img
 */
export class Sparkline extends LitElement implements DataElement<number[]> {
  static styles = useStyles([styles, statusStateStyles, supportStateStyles]);

  static readonly metadata = {
    tag: 'nve-sparkline',
    version: '0.0.0'
  };

  /** Numeric values representing a data series. */
  @property({ type: Array }) data: number[] = [];

  /** Controls the visual representation of data points. */
  @property({ type: String }) mark: SparklineMark = 'line';

  /** Controls how the chart connects intermediate values between points in a data series. Defaults to `linear`. */
  @property({ type: String }) interpolation: Interpolation = 'linear';

  /** Applies semantic status colors used across Elements status patterns. */
  @property({ type: String, reflect: true }) status?: TaskStatus | SupportStatus;

  /** Controls the sparkline size with explicit font-size tokens. Omit to auto-scale with parent font-size (1em). */
  @property({ type: String, reflect: true }) size?: SizeExpanded;

  /** Denotes the first data point by rendering a symbol at its position. */
  @property({ type: Boolean, attribute: 'denote-first', reflect: true })
  denoteFirst = false;

  /** Denotes the last data point by rendering a symbol at its position. */
  @property({ type: Boolean, attribute: 'denote-last', reflect: true })
  denoteLast = false;

  /** Denotes all minimum-value data points by rendering symbols at their positions. */
  @property({ type: Boolean, attribute: 'denote-min', reflect: true })
  denoteMin = false;

  /** Denotes all maximum-value data points by rendering symbols at their positions. */
  @property({ type: Boolean, attribute: 'denote-max', reflect: true })
  denoteMax = false;

  /** Controls spacing between points in a line, in em (1 = chart height). Defaults to `0.6`. */
  @property({ type: Number, attribute: 'interval-length' }) intervalLength = 0.6;

  /** Lower bound for the y-axis domain. When undefined, derives the bound from data. */
  @property({ type: Number }) min?: number;

  /** Upper bound for the y-axis domain. When undefined, derives the bound from data. */
  @property({ type: Number }) max?: number;

  /** Cached valid numeric values derived from data property. */
  @state() private validData: number[] = [];

  /** @private */
  declare _internals: ElementInternals;

  render() {
    return html`<div internal-host>${this.#renderChart()}</div>`;
  }

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
    this._internals.role = 'img';
  }

  willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties);

    if (changedProperties.has('data')) {
      this.validData = toValidData(this.data);
    }
  }

  #renderChart(): SVGTemplateResult | typeof nothing {
    const { width, height } = calculateViewBox(this.mark, this.validData.length, this.intervalLength);

    switch (this.mark) {
      case 'line':
      case 'area':
      case 'gradient':
        return this.#renderLineVariant(width, height);
      case 'column':
        return this.#renderColumn(width, height);
      case 'winloss':
        return this.#renderWinLoss(VIEW_HEIGHT / 2, width, height);
      default:
        const _exhaustiveCheck: never = this.mark;
        return nothing;
    }
  }

  updated(props: PropertyValues<this>) {
    super.updated(props);

    const { width, height } = calculateViewBox(this.mark, this.validData.length, this.intervalLength);
    const aspectRatio = width / height;
    const validAspectRatio = Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1;
    this.style.setProperty('--_aspect-ratio', validAspectRatio.toFixed(4));
  }

  #renderLineVariant(width: number, height: number) {
    const domain = calculateDomain(this.validData, this.min, this.max);
    if (!domain) return nothing;

    const baselineY = valueToY(0, domain.min, domain.max);
    const drawZeroLine = domain.min < 0 && domain.max > 0;

    const plotPoints = toPlotPoints(this.validData, domain.min, domain.max, width);
    const symbolIndices = calculateSymbolIndices(
      this.validData,
      this.denoteFirst,
      this.denoteLast,
      this.denoteMin,
      this.denoteMax
    );
    const interpolation = toInterpolation(this.interpolation);

    const linePath = toLinePath(plotPoints, interpolation, width);
    const drawArea = this.mark === 'area' || this.mark === 'gradient';
    const areaPath = drawArea ? toAreaPath(plotPoints, interpolation, VIEW_HEIGHT) : '';

    return svg`
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        ${this.mark === 'gradient' ? this.#renderGradientDef(height) : nothing}

        ${
          areaPath.length
            ? this.mark === 'gradient'
              ? svg`<path class="area" d=${areaPath} style="fill: url(#gradient)"></path>`
              : svg`<path class="area" d=${areaPath}></path>`
            : nothing
        }

        ${drawZeroLine ? this.#renderZeroLine(baselineY, width) : nothing}

        ${linePath ? svg`<path class="line" d=${linePath} vector-effect="non-scaling-stroke"></path>` : nothing}
      </svg>
      ${this.#renderAccents(plotPoints, symbolIndices)}
    `;
  }

  #renderGradientDef(height: number) {
    return svg`
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="${height}" gradientUnits="userSpaceOnUse">
          <stop offset="0%" style="stop-color: var(--gradient-max-color)"></stop>
          <stop offset="100%" style="stop-color: var(--gradient-min-color)"></stop>
        </linearGradient>
      </defs>
    `;
  }

  #renderZeroLine(position: number, width: number) {
    return svg`
      <line
        class="zero-line"
        vector-effect="non-scaling-stroke"
        x1="0"
        y1="${position.toFixed(PRECISION)}"
        x2="${width}"
        y2="${position.toFixed(PRECISION)}">
      </line>
    `;
  }

  #renderAccents(points: Point[], accentIndices: Set<number>) {
    if (points.length === 0 || accentIndices.size === 0) return nothing;

    return html`
      ${Array.from(accentIndices).map(index => {
        const point = points[index];
        if (!point) return nothing;

        const style = `--x: ${point.x.toFixed(PRECISION)}; --y: ${point.y.toFixed(PRECISION)}`;
        return html`
          <span style=${style} class="accent"></span>
        `;
      })}
    `;
  }

  #renderColumn(width: number, height: number) {
    const domain = calculateDomain(this.validData, this.min, this.max, true);
    if (!domain) return nothing;

    const baselineY = valueToY(0, domain.min, domain.max);
    const showZeroLine = domain.min < 0 && domain.max > 0;
    const plotPoints = toPlotPoints(this.validData, domain.min, domain.max, width);
    const rects = toColumnRects(plotPoints, baselineY, width);

    return svg`
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        ${showZeroLine ? this.#renderZeroLine(baselineY, width) : nothing}

        ${rects.map(rect => {
          return svg`<rect class="column" x="${rect.x.toFixed(PRECISION)}" y="${rect.y.toFixed(PRECISION)}" width="${rect.width.toFixed(PRECISION)}" height="${rect.height.toFixed(PRECISION)}"></rect>`;
        })}
      </svg>
    `;
  }

  #renderWinLoss(baselineY: number, width: number, height: number) {
    if (this.validData.length === 0) return nothing;

    const rects = toWinLossRects(this.validData, baselineY, width, height);

    return svg`
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        ${this.#renderZeroLine(baselineY, width)}

        ${rects.map(rect => {
          return svg`<rect class="${rect.className}" x="${rect.x.toFixed(PRECISION)}" y="${rect.y.toFixed(PRECISION)}" width="${rect.width.toFixed(PRECISION)}" height="${rect.height.toFixed(PRECISION)}"></rect>`;
        })}
      </svg>
    `;
  }
}
