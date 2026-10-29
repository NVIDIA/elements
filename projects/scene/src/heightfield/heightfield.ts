// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { getFrameReference, setFrameReference } from '../internal/composition/frame/state.js';
import { useStyles } from '@nvidia-elements/foundations/internal/styles';
import { createCSSColorConverter, normalizeCSSColor, type CSSColor } from '../internal/color/color.js';
import {
  applyCapturedHeightfieldGrid,
  connectHeightfieldLayer,
  disconnectHeightfieldLayer,
  getHeightfieldLayerSampler,
  registerHeightfieldLayer,
  setHeightfieldLayerColor,
  setHeightfieldLayerGrid
} from '../internal/layers/heightfield/layer-state.js';
import { prepareHeightfieldCapture } from '../internal/layers/heightfield/capture.js';
import { SnapshotCapture, SynchronousCaptureLimitError } from '../internal/rendering/capture.js';
import { HEIGHTFIELD_GRID } from '../internal/diagnostics/errors.js';
import { diagnosticReporterService } from '../internal/diagnostics/reporter.service.js';
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
 * Queries use frame-local XY coordinates including grid origin and positive spacing;
 * out-of-grid queries return undefined. heightAt(), normalAt(), slopeAt(), and drape()
 * describe the continuous bilinear field. The surface variants follow the visible mesh's
 * two planar triangles per cell, for geometry that must lie on the rendered terrain.
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
  readonly #capture = new SnapshotCapture(error =>
    diagnosticReporterService.update({
      active: true,
      code: HEIGHTFIELD_GRID,
      element: this,
      message: error instanceof Error ? error.message : String(error),
      severity: 'error'
    })
  );

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
   * The uniformly spaced elevation data to capture, or null to render nothing.
   * Keep input unchanged until loadComplete settles. Large captures yield between bounded
   * tasks and retain accepted terrain and queries until success. Reassign grid to publish edits.
   */
  @property({ attribute: false })
  get grid(): HeightfieldGrid | null {
    return this.#grid;
  }

  set grid(value: HeightfieldGrid | null) {
    const previous = this.#grid;
    try {
      setHeightfieldLayerGrid(this, value);
    } catch (error) {
      if (value === null || !(error instanceof SynchronousCaptureLimitError)) throw error;
      void this.#prepareGrid(value);
      return;
    }
    this.#capture.cancel();
    this.#grid = value;
    this.requestUpdate('grid', previous);
  }

  /** Resolves after current grid capture; rejects pending capture failures or cancellation. */
  get loadComplete(): Promise<void> {
    return this.#capture.complete;
  }

  #prepareGrid(value: HeightfieldGrid): Promise<void> {
    return this.#capture.run(async context => {
      const captured = await prepareHeightfieldCapture(value, context);
      if (!captured || !context.isCurrent()) return;
      const previous = this.#grid;
      applyCapturedHeightfieldGrid(this, captured);
      this.#grid = value;
      this.requestUpdate('grid', previous);
    });
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
    this.#capture.cancel();
    disconnectHeightfieldLayer(this);
    super.disconnectedCallback();
  }

  /** Returns bilinear elevation at frame-local XY, including grid origin and spacing, or undefined outside the grid. */
  heightAt(x: number, y: number): number | undefined {
    return heightAt(getHeightfieldLayerSampler(this), x, y);
  }

  /** Returns the continuous bilinear field's unit normal at frame-local XY, or undefined outside the grid. */
  normalAt(x: number, y: number): Vec3 | undefined {
    return normalAt(getHeightfieldLayerSampler(this), x, y);
  }

  /** Returns bilinear field inclination from horizontal in radians at frame-local XY, or undefined outside the grid. */
  slopeAt(x: number, y: number): number | undefined {
    return slopeAt(getHeightfieldLayerSampler(this), x, y);
  }

  /**
   * Returns rendered triangle elevation at frame-local XY, or undefined outside the grid.
   * The cell diagonal runs from top-right to bottom-left; points on it use the triangle
   * containing top-left. Outer-edge queries use the adjacent interior cell.
   */
  surfaceHeightAt(x: number, y: number): number | undefined {
    return surfaceHeightAt(getHeightfieldLayerSampler(this), x, y);
  }

  /**
   * Returns the rendered face's unit normal at frame-local XY, or undefined outside the
   * grid. Geometric face normals can change abruptly across cell edges and diagonals.
   */
  surfaceNormalAt(x: number, y: number): Vec3 | undefined {
    return surfaceNormalAt(getHeightfieldLayerSampler(this), x, y);
  }

  /**
   * Returns rendered face inclination from horizontal in radians at frame-local XY,
   * or undefined outside the grid. Slopes can change abruptly across edges and diagonals.
   */
  surfaceSlopeAt(x: number, y: number): number | undefined {
    return surfaceSlopeAt(getHeightfieldLayerSampler(this), x, y);
  }

  /**
   * Copies XYZ triples, replacing only in-bounds Z values with bilinear elevation plus
   * lift (default zero). Coordinates include grid origin and spacing; input remains unchanged.
   */
  drape(points: Float32Array, lift?: number): Float32Array {
    return drape(getHeightfieldLayerSampler(this), points, lift);
  }

  /**
   * Copies XYZ triples onto the visible triangle surface plus lift (default zero).
   * Only in-bounds Z values change; out-of-grid triples and the producer array remain unchanged.
   */
  drapeToSurface(points: Float32Array, lift?: number): Float32Array {
    return drapeToSurface(getHeightfieldLayerSampler(this), points, lift);
  }
}
