// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import {
  connectMarkerLayer,
  disconnectMarkerLayer,
  getLayerCount,
  getLayerInstances,
  registerMarkerLayer,
  publishLayerInstances,
  setLayerCount,
  setLayerInstances
} from './layer-state.js';
import type { PrimitiveKind } from '../primitive-geometry.js';
import type { MarkerSource } from './buffer.js';
import type { SceneInteractionTarget } from '../interaction.js';
import type { ScenePublishOptions } from '../packed-record-source.js';
import {
  getLayerFeatureIds,
  getLayerInteractive,
  registerFeatureIdentifiedLayer,
  setLayerFeatureIds,
  setLayerInteractive
} from '../interactive-layer-state.js';
import type { SceneFeatureIds } from '../feature-ids.js';

/**
 * @event {ScenePickHit} nve-scene-click - Dispatched when pointer activation resolves to this layer.
 * @event {ScenePickHit} nve-scene-pointerenter - Dispatched when the pointer enters this layer.
 * @event {ScenePickHit} nve-scene-pointerleave - Dispatched when the pointer leaves this layer.
 */
export abstract class MarkerLayerElement extends LitElement implements SceneInteractionTarget {
  protected constructor(kind: PrimitiveKind) {
    super();
    registerFeatureIdentifiedLayer(this);
    registerMarkerLayer(this, kind);
  }

  /** Stable uint32 identities for logical instances resolved by picking. */
  @property({ attribute: false })
  get featureIds(): SceneFeatureIds | null {
    return getLayerFeatureIds(this);
  }

  set featureIds(value: SceneFeatureIds | null) {
    setLayerFeatureIds(this, value);
  }

  /** Enables automatic pointer hit testing and routed interaction events for this layer. */
  @property({ type: Boolean })
  get interactive(): boolean {
    return getLayerInteractive(this);
  }

  set interactive(value: boolean) {
    setLayerInteractive(this, value);
  }

  /** Replaces the streamed marker records or selects declarative marker children when null. */
  get source(): MarkerSource | null {
    return getLayerInstances(this) as MarkerSource | null;
  }

  set source(value: MarkerSource | null) {
    setLayerInstances(this, value);
  }

  /** Limits how many records render; undefined renders the complete source. */
  get countLimit(): number | undefined {
    return getLayerCount(this);
  }

  set countLimit(value: number | undefined) {
    setLayerCount(this, value);
  }

  /** Captures changed records and publishes the selected active source prefix to this layer. */
  publish(options?: ScenePublishOptions): void {
    publishLayerInstances(this, options);
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
