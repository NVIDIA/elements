// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { styleMap } from 'lit/directives/style-map.js';
import { finiteOr, hostAttr, positiveFiniteOr, useStyles } from '@nvidia-elements/core/internal';
import styles from './viewport-gridlines.css?inline';
import {
  createGridlineCoverage,
  gridlineCoverageNeedsUpdate,
  selectGridlineInterval
} from './viewport-gridlines.utils.js';
import { Viewport } from './viewport.js';
import type { ViewportRect } from './viewport.types.js';

const DEFAULT_STEP = 10;
const DEFAULT_TARGET_SPACING = 64;

interface GridlineProjection {
  readonly coverage: ViewportRect;
  readonly interval: number;
}

interface ProjectionSyncOptions {
  readonly forceCoverage?: boolean;
  readonly resetInterval?: boolean;
}

/**
 * @element nve-viewport-gridlines
 * @description Renders origin-stable, zoom-adaptive gridlines behind viewport content.
 * @documentation https://nvidia.github.io/elements/docs/elements/viewport/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/core/viewport
 * @cssprop --color - Sets the gridline stroke color.
 * @cssprop --line-width - Sets the approximate stroke width in CSS pixels.
 */
export class ViewportGridlines extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-viewport-gridlines',
    version: '0.0.0'
  };

  /** @private */
  @hostAttr() slot = 'background';

  /** @private */
  @hostAttr({ attribute: 'aria-hidden' }) protected accessibilityHidden = 'true';

  #step = DEFAULT_STEP;
  #originX = 0;
  #originY = 0;
  #targetSpacing = DEFAULT_TARGET_SPACING;
  #viewport?: Viewport;
  #resizeObserver?: ResizeObserver;
  #projection?: GridlineProjection;

  /** Smallest gridline interval in content-space units. */
  @property({ type: Number, reflect: true })
  get step(): number {
    return this.#step;
  }

  set step(value: number) {
    const next = positiveFiniteOr(value, DEFAULT_STEP);
    if (next === this.#step) return;
    const previous = this.#step;
    this.#step = next;
    this.requestUpdate('step', previous);
  }

  /** Content-space x coordinate of the grid origin. */
  @property({ type: Number, attribute: 'origin-x', reflect: true })
  get originX(): number {
    return this.#originX;
  }

  set originX(value: number) {
    const next = finiteOr(value, 0);
    if (next === this.#originX) return;
    const previous = this.#originX;
    this.#originX = next;
    this.requestUpdate('originX', previous);
  }

  /** Content-space y coordinate of the grid origin. */
  @property({ type: Number, attribute: 'origin-y', reflect: true })
  get originY(): number {
    return this.#originY;
  }

  set originY(value: number) {
    const next = finiteOr(value, 0);
    if (next === this.#originY) return;
    const previous = this.#originY;
    this.#originY = next;
    this.requestUpdate('originY', previous);
  }

  /** Target on-screen separation used to choose the adaptive gridline interval, in CSS pixels. */
  @property({ type: Number, attribute: 'target-spacing', reflect: true })
  get targetSpacing(): number {
    return this.#targetSpacing;
  }

  set targetSpacing(value: number) {
    const next = positiveFiniteOr(value, DEFAULT_TARGET_SPACING);
    if (next === this.#targetSpacing) return;
    const previous = this.#targetSpacing;
    this.#targetSpacing = next;
    this.requestUpdate('targetSpacing', previous);
  }

  connectedCallback(): void {
    super.connectedCallback();
    const viewport = this.parentElement?.closest(Viewport.metadata.tag);
    if (!(viewport instanceof Viewport) || viewport !== this.parentElement) return;
    this.#viewport = viewport;
    this.style.setProperty('--_scale', `${viewport.scale}`);
    this.#viewport.addEventListener('viewportchange', this.#handleViewportChange);
    if (typeof ResizeObserver !== 'undefined') {
      this.#resizeObserver = new ResizeObserver(this.#handleViewportResize);
      this.#resizeObserver.observe(viewport);
    }
    this.#updateProjection({ forceCoverage: true, resetInterval: true });
  }

  disconnectedCallback(): void {
    if (this.#viewport) {
      this.#viewport.removeEventListener('viewportchange', this.#handleViewportChange);
    }
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = undefined;
    this.#viewport = undefined;
    this.#projection = undefined;
    super.disconnectedCallback();
  }

  protected willUpdate(changed: PropertyValues<this>): void {
    super.willUpdate(changed);
    if (changed.has('step') || changed.has('targetSpacing')) {
      this.#updateProjection({ forceCoverage: true, resetInterval: true });
    }
  }

  render() {
    const projection = this.#projection;
    if (!projection) return nothing;
    const { coverage, interval } = projection;
    return html`
      <svg
        internal-host
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="none"
        style=${styleMap(coverageStyles(coverage))}
        viewBox="${coverage.x} ${coverage.y} ${coverage.width} ${coverage.height}"
      >
        <defs>
          <pattern
            data-gridline-pattern
            id="gridlines"
            x=${this.#originX}
            y=${this.#originY}
            width=${interval}
            height=${interval}
            patternUnits="userSpaceOnUse"
          >
            <path d="M ${interval} 0 H 0 V ${interval}"></path>
          </pattern>
        </defs>
        <rect
          x=${coverage.x}
          y=${coverage.y}
          width=${coverage.width}
          height=${coverage.height}
          fill="url(#gridlines)"
        ></rect>
      </svg>
    `;
  }

  #handleViewportChange = (): void => {
    const viewport = this.#viewport;
    if (!viewport) return;
    this.style.setProperty('--_scale', `${viewport.scale}`);
    this.#requestProjectionUpdate();
  };

  #handleViewportResize = (): void => {
    this.#requestProjectionUpdate({ forceCoverage: true });
  };

  #requestProjectionUpdate(options: ProjectionSyncOptions = {}): void {
    if (this.#updateProjection(options)) this.requestUpdate();
  }

  #updateProjection(options: ProjectionSyncOptions = {}): boolean {
    const viewport = this.#viewport;
    if (!viewport) return false;
    const visible = viewport.getVisibleRect();
    if (visible.width <= 0 || visible.height <= 0) return false;
    const interval = selectGridlineInterval({
      current: options.resetInterval ? undefined : this.#projection?.interval,
      scale: viewport.scale,
      step: this.#step,
      targetSpacing: this.#targetSpacing
    });
    const projection = nextProjection({
      forceCoverage: options.forceCoverage === true,
      interval,
      previous: this.#projection,
      visible
    });
    if (!projection) return false;
    this.#projection = projection;
    return true;
  }
}

function nextProjection({
  forceCoverage,
  interval,
  previous,
  visible
}: {
  forceCoverage: boolean;
  interval: number;
  previous?: GridlineProjection;
  visible: ViewportRect;
}): GridlineProjection | undefined {
  const coverageChanged = forceCoverage || gridlineCoverageNeedsUpdate(previous?.coverage, visible);
  const intervalChanged = interval !== previous?.interval;
  if (!coverageChanged && !intervalChanged) return undefined;
  const coverage = coverageChanged || !previous ? createGridlineCoverage(visible) : previous.coverage;
  return { coverage, interval };
}

function coverageStyles(coverage: ViewportRect): Record<string, string> {
  return {
    height: `${coverage.height}px`,
    left: `${coverage.x}px`,
    top: `${coverage.y}px`,
    width: `${coverage.width}px`
  };
}
