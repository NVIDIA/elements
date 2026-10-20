// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { getFrameReference, setFrameReference } from '../internal/composition/frame/state.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { createCSSColorConverter, normalizeCSSColor, type CSSColor } from '../internal/color/color.js';
import {
  connectHeightfieldLayer,
  disconnectHeightfieldLayer,
  getHeightfieldLayerSampler,
  registerHeightfieldLayer,
  setHeightfieldLayerColor,
  setHeightfieldLayerGrid
} from '../internal/layers/heightfield/layer-state.js';
import {
  drape,
  drapeToSurface,
  heightAt,
  normalAt,
  slopeAt,
  surfaceHeightAt,
  surfaceNormalAt,
  surfaceSlopeAt
} from '../internal/layers/heightfield/query.js';
import type { Vec3 } from '../internal/math/types.js';
import type { HeightfieldGrid } from '../internal/layers/heightfield/types.js';
import type { SceneInteractionTarget } from '../internal/interaction/target.js';
import {
  getLayerInteractive,
  registerInteractiveLayer,
  setLayerInteractive
} from '../internal/interaction/layer-state.js';
import styles from '../internal/dom/host.css?inline';
import {
  getElementFeatureId,
  registerElementFeatureId,
  sceneFeatureIdConverter,
  setElementFeatureId
} from '../internal/interaction/element-feature-id.js';

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
 * @event {SceneClick} nve-scene-click - Dispatched when pointer activation resolves to this layer.
 * @event {ScenePointerEnter} nve-scene-pointerenter - Dispatched when the pointer enters this layer.
 * @event {ScenePointerLeave} nve-scene-pointerleave - Dispatched when the pointer leaves this layer.
 * @stable false
 */
export class SceneHeightfield extends LitElement implements SceneInteractionTarget {
  /** Names the owning coordinate frame; an omitted value uses DOM ancestry. */
  @property({ type: String })
  get frame(): string | null {
    return getFrameReference(this);
  }

  set frame(value: string | null) {
    const previous = this.frame;
    setFrameReference(this, value);
    this.requestUpdate('frame', previous);
  }

  static styles = useStyles([styles]);
  static readonly metadata = { tag: 'nve-scene-heightfield', version: '0.0.0' };

  #color = DEFAULT_COLOR.source;
  #grid: HeightfieldGrid | null = null;

  /** Stable application identity returned when picking this heightfield. */
  @property({ attribute: 'feature-id', converter: sceneFeatureIdConverter })
  get featureId(): number | undefined {
    return getElementFeatureId(this);
  }

  set featureId(value: number | undefined) {
    setElementFeatureId(this, value);
  }

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
  @property({ converter: colorConverter })
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
    registerElementFeatureId(this);
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

  /** Return the bilinearly interpolated terrain elevation at frame-local xy. */
  heightAt(x: number, y: number): number | undefined {
    return heightAt(getHeightfieldLayerSampler(this), x, y);
  }

  /** Return the unit normal of the bilinear terrain surface at frame-local xy. */
  normalAt(x: number, y: number): Vec3 | undefined {
    return normalAt(getHeightfieldLayerSampler(this), x, y);
  }

  /** Return terrain inclination in radians from horizontal at frame-local xy. */
  slopeAt(x: number, y: number): number | undefined {
    return slopeAt(getHeightfieldLayerSampler(this), x, y);
  }

  /** Return the rendered triangle-surface elevation at frame-local xy. */
  surfaceHeightAt(x: number, y: number): number | undefined {
    return surfaceHeightAt(getHeightfieldLayerSampler(this), x, y);
  }

  /** Return the unit normal of the rendered terrain triangle at frame-local xy. */
  surfaceNormalAt(x: number, y: number): Vec3 | undefined {
    return surfaceNormalAt(getHeightfieldLayerSampler(this), x, y);
  }

  /** Return rendered triangle inclination in radians from horizontal at frame-local xy. */
  surfaceSlopeAt(x: number, y: number): number | undefined {
    return surfaceSlopeAt(getHeightfieldLayerSampler(this), x, y);
  }

  /** Copy xyz points and move in-bounds points to terrain elevation plus lift. */
  drape(points: Float32Array, lift?: number): Float32Array {
    return drape(getHeightfieldLayerSampler(this), points, lift);
  }

  /** Copy xyz points and move in-bounds points to the rendered triangle surface plus lift. */
  drapeToSurface(points: Float32Array, lift?: number): Float32Array {
    return drapeToSurface(getHeightfieldLayerSampler(this), points, lift);
  }
}
