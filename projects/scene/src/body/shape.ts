// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { notifyOwningBodyPart } from '../internal/layers/body/part-notifications.js';
import type { SceneColor } from '../internal/color/types.js';
import type { ScenePrimitiveType } from '../internal/math/primitive-geometry.js';
import type { Quaternion, Vec3 } from '../internal/math/types.js';
import styles from '../internal/dom/host.css?inline';

/**
 * @element nve-scene-shape
 * @description One inert primitive declaration inside a scene body.
 * Only direct nve-scene-body children contribute geometry. Shapes share the body's
 * picking identity, tint, and instance placements; they are not independent render layers.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/body
 */
export class SceneShape extends LitElement {
  static styles = useStyles([styles]);
  static readonly metadata = { tag: 'nve-scene-shape', version: '0.0.0' };

  /** Unit primitive type, default cube. Matches type in a body geometry node. */
  @property({ type: String, noAccessor: true })
  get type(): ScenePrimitiveType {
    return this.#type;
  }

  set type(value: ScenePrimitiveType) {
    this.#setShapeProperty({ assign: next => (this.#type = next), name: 'type', previous: this.#type, value });
  }

  #type: ScenePrimitiveType = 'cube';

  /** body-local translation in x y z order. */
  @property({ type: Array, noAccessor: true })
  get position(): Vec3 {
    return this.#position;
  }

  set position(value: Vec3 | null) {
    const vector = value ?? [0, 0, 0];
    this.#setShapeProperty({
      assign: next => (this.#position = next),
      name: 'position',
      previous: this.#position,
      value: vector
    });
  }

  #position: Vec3 = [0, 0, 0];

  /** Body-local orientation as an x y z w quaternion; null uses identity. */
  @property({ type: Array, noAccessor: true })
  get orientation(): Quaternion | null {
    return this.#orientation;
  }

  set orientation(value: Quaternion | null) {
    this.#setShapeProperty({
      assign: next => (this.#orientation = next),
      name: 'orientation',
      previous: this.#orientation,
      value: value ?? null
    });
  }

  #orientation: Quaternion | null = null;

  /** Nonzero body-local scale in x y z order. */
  @property({ type: Array, noAccessor: true })
  get scale(): Vec3 {
    return this.#scale;
  }

  set scale(value: Vec3 | null) {
    const vector = value ?? [1, 1, 1];
    this.#setShapeProperty({
      assign: next => (this.#scale = next),
      name: 'scale',
      previous: this.#scale,
      value: vector
    });
  }

  #scale: Vec3 = [1, 1, 1];

  /** CSS shape color. */
  @property({ type: String, noAccessor: true })
  get color(): SceneColor {
    return this.#color;
  }

  set color(value: SceneColor) {
    this.#setShapeProperty({ assign: next => (this.#color = next), name: 'color', previous: this.#color, value });
  }

  #color: SceneColor = '#ffffff';

  render() {
    return nothing;
  }

  #setShapeProperty<T extends ShapePropertyValue>(options: {
    readonly assign: (value: T) => void;
    readonly name: 'type' | 'position' | 'orientation' | 'scale' | 'color';
    readonly previous: T;
    readonly value: T;
  }): void {
    if (shapePropertyValuesEqual(options.value, options.previous)) return;
    options.assign(options.value);
    this.requestUpdate(options.name, options.previous);
    notifyOwningBodyPart(this);
  }
}

type ShapePropertyValue = SceneColor | ScenePrimitiveType | Vec3 | Quaternion | null;

function shapePropertyValuesEqual(left: ShapePropertyValue, right: ShapePropertyValue): boolean {
  return Array.isArray(left) && Array.isArray(right)
    ? left.length === right.length && left.every((value, index) => value === right[index])
    : left === right;
}
