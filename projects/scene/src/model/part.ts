// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LitElement, nothing } from 'lit';
import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { notifyOwningModelPart } from '../internal/model/layer-state.js';
import type { Quaternion, Vec3 } from '../internal/types.js';
import styles from './part.css?inline';

/**
 * @element nve-scene-part
 * @description One inert primitive declaration inside a scene model.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/model
 */
export class ScenePart extends LitElement {
  static styles = useStyles([styles]);
  static readonly metadata = { tag: 'nve-scene-part', version: '0.0.0' };

  /** Unit primitive shape. */
  @property({ type: String, noAccessor: true })
  get shape(): string {
    return this.#shape;
  }

  set shape(value: string) {
    this.#setPartProperty({ assign: next => (this.#shape = next), name: 'shape', previous: this.#shape, value });
  }

  #shape = 'cube';

  /** Model-local translation in x y z order. */
  @property({ type: Array, noAccessor: true })
  get position(): Vec3 {
    return this.#position;
  }

  set position(value: Vec3 | null) {
    const vector = value ?? [0, 0, 0];
    this.#setPartProperty({
      assign: next => (this.#position = next),
      name: 'position',
      previous: this.#position,
      value: vector
    });
  }

  #position: Vec3 = [0, 0, 0];

  /** Model-local orientation as an x y z w quaternion. */
  @property({ type: Array, noAccessor: true })
  get orientation(): Quaternion {
    return this.#orientation;
  }

  set orientation(value: Quaternion | null) {
    const vector = value ?? [0, 0, 0, 1];
    this.#setPartProperty({
      assign: next => (this.#orientation = next),
      name: 'orientation',
      previous: this.#orientation,
      value: vector
    });
  }

  #orientation: Quaternion = [0, 0, 0, 1];

  /** Nonzero model-local scale in x y z order. */
  @property({ type: Array, noAccessor: true })
  get scale(): Vec3 {
    return this.#scale;
  }

  set scale(value: Vec3 | null) {
    const vector = value ?? [1, 1, 1];
    this.#setPartProperty({
      assign: next => (this.#scale = next),
      name: 'scale',
      previous: this.#scale,
      value: vector
    });
  }

  #scale: Vec3 = [1, 1, 1];

  /** CSS part color. */
  @property({ type: String, noAccessor: true })
  get color(): string {
    return this.#color;
  }

  set color(value: string) {
    this.#setPartProperty({ assign: next => (this.#color = next), name: 'color', previous: this.#color, value });
  }

  #color = '#ffffff';

  render() {
    return nothing;
  }

  #setPartProperty<T extends string | Vec3 | Quaternion>(options: {
    readonly assign: (value: T) => void;
    readonly name: 'shape' | 'position' | 'orientation' | 'scale' | 'color';
    readonly previous: T;
    readonly value: T;
  }): void {
    if (partPropertyValuesEqual(options.value, options.previous)) return;
    options.assign(options.value);
    this.requestUpdate(options.name, options.previous);
    notifyOwningModelPart(this);
  }
}

function partPropertyValuesEqual(left: string | Vec3 | Quaternion, right: string | Vec3 | Quaternion): boolean {
  return Array.isArray(left) && Array.isArray(right)
    ? left.length === right.length && left.every((value, index) => value === right[index])
    : left === right;
}
