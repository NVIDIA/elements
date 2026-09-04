// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LitElement, nothing, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { createCSSColorConverter, normalizeCSSColor, type CSSColor } from '../internal/color.js';
import {
  connectHeightfieldLayer,
  disconnectHeightfieldLayer,
  getHeightfieldLayerGrid,
  registerHeightfieldLayer,
  setHeightfieldLayerColor,
  setHeightfieldLayerGrid
} from '../internal/heightfield/layer-state.js';
import {
  drape,
  drapeToSurface,
  heightAt,
  normalAt,
  slopeAt,
  surfaceHeightAt,
  surfaceNormalAt,
  surfaceSlopeAt
} from '../internal/heightfield/query.js';
import type { Vec3 } from '../internal/types.js';
import type { HeightfieldGrid } from '../internal/heightfield/types.js';
import type { SceneInteractionTarget } from '../internal/interaction.js';
import {
  getLayerInteractive,
  registerInteractiveLayer,
  setLayerInteractive
} from '../internal/interactive-layer-state.js';
import styles from '../internal/host.css?inline';

const DEFAULT_COLOR = {
  rgba: [128 / 255, 128 / 255, 128 / 255, 1],
  source: '#808080'
} satisfies CSSColor;

const colorConverter = createCSSColorConverter(DEFAULT_COLOR);

/**
 * @element nve-scene-heightfield
 * @description A frame-local, smooth-shaded terrain compiled from a uniform elevation grid.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/heightfield
 * @event {ScenePickHit} nve-scene-click - Dispatched when pointer activation resolves to this layer.
 * @event {ScenePickHit} nve-scene-pointerenter - Dispatched when the pointer enters this layer.
 * @event {ScenePickHit} nve-scene-pointerleave - Dispatched when the pointer leaves this layer.
 * @stable false
 */
export class SceneHeightfield extends LitElement implements SceneInteractionTarget {
  static styles = useStyles([styles]);
  static readonly metadata = { tag: 'nve-scene-heightfield', version: '0.0.0' };

  #color = DEFAULT_COLOR.source;
  #grid: HeightfieldGrid | null = null;

  /** Enables automatic pointer hit testing and routed interaction events for this layer. */
  @property({ type: Boolean })
  get interactive(): boolean {
    return getLayerInteractive(this);
  }

  set interactive(value: boolean) {
    setLayerInteractive(this, value);
  }

  /**
   * The uniformly spaced elevation data to compile, or null to render nothing.
   * The setter snapshots typed arrays and origin coordinates immediately, so
   * later in-place edits take effect only after reassigning `grid` again.
   */
  @property({ attribute: false })
  get grid(): HeightfieldGrid | null {
    return this.#grid;
  }

  set grid(value: HeightfieldGrid | null) {
    const previous = this.#grid;
    this.#grid = value;
    setHeightfieldLayerGrid(this, value);
    this.requestUpdate('grid', previous);
  }

  /** CSS base color multiplied by optional per-sample colors. */
  @property({ converter: colorConverter, reflect: true })
  get color(): string {
    return this.#color;
  }

  set color(value: string) {
    const next = normalizeCSSColor(value, DEFAULT_COLOR);
    const previous = this.#color;
    if (next.source === previous) return;
    this.#color = next.source;
    setHeightfieldLayerColor(this, next.rgba);
    this.requestUpdate('color', previous);
  }

  constructor() {
    super();
    registerInteractiveLayer(this);
    registerHeightfieldLayer(this, DEFAULT_COLOR.rgba);
  }

  render() {
    return nothing;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    connectHeightfieldLayer(this);
  }

  override disconnectedCallback(): void {
    disconnectHeightfieldLayer(this);
    super.disconnectedCallback();
  }

  override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === 'color') this.#normalizeColorAttribute();
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('color')) this.#normalizeColorAttribute();
  }

  /** Return the bilinearly interpolated terrain elevation at frame-local xy. */
  heightAt(x: number, y: number): number | undefined {
    return heightAt(getHeightfieldLayerGrid(this), x, y);
  }

  /** Return the unit normal of the bilinear terrain surface at frame-local xy. */
  normalAt(x: number, y: number): Vec3 | undefined {
    return normalAt(getHeightfieldLayerGrid(this), x, y);
  }

  /** Return terrain inclination in radians from horizontal at frame-local xy. */
  slopeAt(x: number, y: number): number | undefined {
    return slopeAt(getHeightfieldLayerGrid(this), x, y);
  }

  /** Return the rendered triangle-surface elevation at frame-local xy. */
  surfaceHeightAt(x: number, y: number): number | undefined {
    return surfaceHeightAt(getHeightfieldLayerGrid(this), x, y);
  }

  /** Return the unit normal of the rendered terrain triangle at frame-local xy. */
  surfaceNormalAt(x: number, y: number): Vec3 | undefined {
    return surfaceNormalAt(getHeightfieldLayerGrid(this), x, y);
  }

  /** Return rendered triangle inclination in radians from horizontal at frame-local xy. */
  surfaceSlopeAt(x: number, y: number): number | undefined {
    return surfaceSlopeAt(getHeightfieldLayerGrid(this), x, y);
  }

  /** Copy xyz points and move in-bounds points to terrain elevation plus lift. */
  drape(points: Float32Array, lift?: number): Float32Array {
    return drape(getHeightfieldLayerGrid(this), points, lift);
  }

  /** Copy xyz points and move in-bounds points to the rendered triangle surface plus lift. */
  drapeToSurface(points: Float32Array, lift?: number): Float32Array {
    return drapeToSurface(getHeightfieldLayerGrid(this), points, lift);
  }

  #normalizeColorAttribute(): void {
    if (this.getAttribute('color') !== this.color) this.setAttribute('color', this.color);
  }
}
