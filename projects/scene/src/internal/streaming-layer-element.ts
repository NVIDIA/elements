// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { LayoutDescriptor } from './layouts/define-layout.js';
import type { LineTopology, LineWidthUnit } from './lines/data.js';
import {
  getStreamingLayerCount,
  getStreamingLayerSource,
  publishStreamingLayer,
  reconcileStreamingLayerChildren,
  registerStreamingLayer,
  setStreamingLayerCount,
  setStreamingLayerSource,
  type StreamingLayerKind,
  type StreamingLayerSource
} from './streaming-layer-state.js';
import { notifyOwningScene } from './scene/notifications.js';
import type { SceneInteractionTarget } from './interaction.js';
import type { ScenePublishOptions } from './packed-record-source.js';
import { getLayerInteractive, registerInteractiveLayer, setLayerInteractive } from './interactive-layer-state.js';

/**
 * Shared Lit host for streamed point, line, and triangle layers.
 *
 * @event {ScenePickHit} nve-scene-click - Dispatched when pointer activation resolves to this layer.
 * @event {ScenePickHit} nve-scene-pointerenter - Dispatched when the pointer enters this layer.
 * @event {ScenePickHit} nve-scene-pointerleave - Dispatched when the pointer leaves this layer.
 */
export abstract class StreamingLayerElement<Source extends StreamingLayerSource>
  extends LitElement
  implements SceneInteractionTarget
{
  protected constructor(
    kind: StreamingLayerKind | 'triangles',
    layout: LayoutDescriptor,
    options: { topology?: LineTopology; widthUnit?: LineWidthUnit } = {}
  ) {
    super();
    registerInteractiveLayer(this);
    registerStreamingLayer(this, {
      countDivisor: kind === 'triangles' ? 3 : undefined,
      kind: kind === 'triangles' ? 'triangle' : kind,
      layout,
      topology: options.topology,
      widthUnit: options.widthUnit
    });
  }

  /** Enables automatic pointer hit testing and routed interaction events for this layer. */
  @property({ type: Boolean })
  get interactive(): boolean {
    return getLayerInteractive(this);
  }

  set interactive(value: boolean) {
    setLayerInteractive(this, value);
  }

  /** Replaces the streamed records or renders nothing when null. */
  get source(): Source | null {
    return getStreamingLayerSource(this) as Source | null;
  }

  set source(value: Source | null) {
    setStreamingLayerSource(this, value);
  }

  /** Limits how many records render; undefined renders the complete source. */
  get countLimit(): number | undefined {
    return getStreamingLayerCount(this);
  }

  set countLimit(value: number | undefined) {
    setStreamingLayerCount(this, value);
  }

  /** Captures changed records and publishes the selected active source prefix to this layer. */
  publish(options?: ScenePublishOptions): void {
    publishStreamingLayer(this, options);
  }

  /** Internal renderer seam; it drains pending upload ranges. */
  render() {
    return html`<slot @slotchange=${this.#handleSlotChange}></slot>`;
  }

  protected override updated(): void {
    notifyOwningScene(this);
  }

  #handleSlotChange(): void {
    reconcileStreamingLayerChildren(this);
  }
}
