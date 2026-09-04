// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import {
  commitLayerInstances,
  connectMarkerLayer,
  disconnectMarkerLayer,
  getLayerCount,
  getLayerInstances,
  registerMarkerLayer,
  setLayerCount,
  setLayerInstances
} from './layer-state.js';
import type { PrimitiveKind } from '../primitive-geometry.js';
import type { MarkerInstanceSource } from './buffer.js';
import { notifyOwningScene } from '../label/notifications.js';
import type { SceneInteractionTarget } from '../interaction.js';

/**
 * @event {PickHit} nve-scene-click - Dispatched when pointer activation resolves to this layer.
 * @event {PickHit} nve-scene-pointerenter - Dispatched when the pointer enters this layer.
 * @event {PickHit} nve-scene-pointerleave - Dispatched when the pointer leaves this layer.
 */
export abstract class MarkerLayerElement extends LitElement implements SceneInteractionTarget {
  #interactive = false;

  protected constructor(kind: PrimitiveKind) {
    super();
    registerMarkerLayer(this, kind);
  }

  /** Replaces the streamed marker records or selects declarative marker children when null. */
  get instances(): MarkerInstanceSource | null {
    return getLayerInstances(this);
  }

  set instances(value: MarkerInstanceSource | null) {
    setLayerInstances(this, value);
  }

  /** Limits how many records render; undefined renders the complete source. */
  get count(): number | undefined {
    return getLayerCount(this);
  }

  set count(value: number | undefined) {
    setLayerCount(this, value);
  }

  /** Enables automatic pointer hit testing and routed interaction events for this layer. */
  @property({ type: Boolean })
  get interactive(): boolean {
    return this.#interactive;
  }

  set interactive(value: boolean) {
    const previous = this.#interactive;
    const next = value;
    if (next === previous) return;
    this.#interactive = next;
    notifyOwningScene(this);
    this.requestUpdate('interactive', previous);
  }

  /** Schedules a ranged upload after in-place mutation of the streamed source. */
  commit(start = 0, count?: number): void {
    commitLayerInstances(this, start, count);
  }

  render() {
    return html`<slot></slot>`;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    connectMarkerLayer(this);
  }

  override disconnectedCallback(): void {
    disconnectMarkerLayer(this);
    super.disconnectedCallback();
  }
}
