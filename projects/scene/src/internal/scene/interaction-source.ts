// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ScenePickHit } from '../pick/types.js';
import type { Vec3 } from '../types.js';

const SOURCE_SIZE = 1;

interface ProjectedClientPoint {
  readonly clientX: number;
  readonly clientY: number;
  readonly visibility: 'clipped' | 'visible';
}

/** Maintains the scene-owned DOM source for the latest routed click. */
export class SceneInteractionSource {
  #element?: HTMLElement;
  readonly #getContainerRect: () => DOMRect;
  readonly #project: (worldPosition: Readonly<Vec3>) => ProjectedClientPoint | null;
  #worldPosition: Readonly<Vec3> | null = null;

  constructor(options: {
    readonly getContainerRect: () => DOMRect;
    readonly project: (worldPosition: Readonly<Vec3>) => ProjectedClientPoint | null;
  }) {
    this.#getContainerRect = options.getContainerRect;
    this.#project = options.project;
  }

  bind(element: HTMLElement): void {
    this.#element = element;
  }

  unbind(): void {
    this.#element = undefined;
  }

  update(hit: ScenePickHit | null): HTMLElement {
    const element = this.#requireElement();
    if (!hit) {
      this.#worldPosition = null;
      element.hidden = true;
      element.style.removeProperty('transform');
      return element;
    }
    const worldPosition: Vec3 = [hit.worldPosition[0], hit.worldPosition[1], hit.worldPosition[2]];
    this.#worldPosition = Object.freeze(worldPosition);
    this.#position(element, hit.clientX, hit.clientY);
    return element;
  }

  refresh(): void {
    if (!this.#worldPosition) return;
    const point = this.#project(this.#worldPosition);
    if (!point || point.visibility !== 'visible') return;
    this.#position(this.#requireElement(), point.clientX, point.clientY);
  }

  #position(element: HTMLElement, clientX: number, clientY: number): void {
    const rect = this.#getContainerRect();
    const x = clientX - rect.left - SOURCE_SIZE / 2;
    const y = clientY - rect.top - SOURCE_SIZE / 2;
    element.style.transform = `translate(${x}px, ${y}px)`;
    element.hidden = false;
  }

  #requireElement(): HTMLElement {
    if (!this.#element) throw new DOMException('The scene interaction source is unavailable.', 'InvalidStateError');
    return this.#element;
  }
}
