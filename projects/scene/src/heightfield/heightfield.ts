// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LitElement, nothing, type PropertyValues } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { parseCSSColor } from '../internal/color.js';
import {
  connectHeightfieldLayer,
  disconnectHeightfieldLayer,
  getHeightfieldLayerGrid,
  registerHeightfieldLayer,
  setHeightfieldLayerColor,
  setHeightfieldLayerGrid
} from '../internal/heightfield-layer-state.js';
import type { RGBA, Vec3 } from '../internal/types.js';
import type { HeightfieldGrid } from './heightfield-types.js';
import { drape, heightAt, normalAt, slopeAt } from './query.js';
import styles from './heightfield.css?inline';

const DEFAULT_COLOR = '#808080';
const DEFAULT_RGBA: RGBA = [128 / 255, 128 / 255, 128 / 255, 1];

const colorConverter = {
  fromAttribute(value: string | null): string {
    return normalizeColor(value ?? DEFAULT_COLOR).source;
  }
};

/**
 * @element nve-scene-heightfield
 * @description A frame-local, smooth-shaded terrain compiled from a uniform elevation grid.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/heightfield
 * @stable false
 */
export class SceneHeightfield extends LitElement {
  static styles = useStyles([styles]);
  static readonly metadata = { tag: 'nve-scene-heightfield', version: '0.0.0' };

  #color = DEFAULT_COLOR;
  #grid: HeightfieldGrid | null = null;

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
    const next = normalizeColor(value);
    const previous = this.#color;
    if (next.source === previous) return;
    this.#color = next.source;
    setHeightfieldLayerColor(this, next.rgba);
    this.requestUpdate('color', previous);
  }

  constructor() {
    super();
    registerHeightfieldLayer(this, DEFAULT_RGBA);
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

  /** Copy xyz points and move in-bounds points to terrain elevation plus lift. */
  drape(points: Float32Array, lift?: number): Float32Array {
    return drape(getHeightfieldLayerGrid(this), points, lift);
  }

  #normalizeColorAttribute(): void {
    if (this.getAttribute('color') !== this.color) this.setAttribute('color', this.color);
  }
}

function normalizeColor(value: string): { readonly rgba: RGBA; readonly source: string } {
  const rgba = parseCSSColor(value);
  return rgba ? { rgba, source: value } : { rgba: DEFAULT_RGBA, source: DEFAULT_COLOR };
}
