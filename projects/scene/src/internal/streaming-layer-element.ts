// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import type { LayoutDescriptor } from './layouts/define-layout.js';
import type { LineTopology, LineWidthUnit } from './lines/data.js';
import {
  commitStreamingLayer,
  connectStreamingLayer,
  disconnectStreamingLayer,
  getStreamingLayerCount,
  getStreamingLayerSource,
  registerStreamingLayer,
  setStreamingLayerCount,
  setStreamingLayerSource,
  type StreamingLayerKind,
  type StreamingLayerSource
} from './streaming-layer-state.js';
import { notifyOwningScene } from './label/notifications.js';
import type { SceneInteractionTarget } from './interaction.js';

/**
 * Shared Lit host for streamed point, line, and triangle layers.
 *
 * @event {PickHit} nve-scene-click - Dispatched when pointer activation resolves to this layer.
 * @event {PickHit} nve-scene-pointerenter - Dispatched when the pointer enters this layer.
 * @event {PickHit} nve-scene-pointerleave - Dispatched when the pointer leaves this layer.
 */
export abstract class StreamingLayerElement<Source extends StreamingLayerSource = ArrayBufferView>
  extends LitElement
  implements SceneInteractionTarget
{
  #interactive = false;

  protected constructor(
    kind: StreamingLayerKind | 'triangles',
    layout: LayoutDescriptor,
    options: { allowChildren: boolean; topology?: LineTopology; widthUnit?: LineWidthUnit }
  ) {
    super();
    registerStreamingLayer(this, {
      allowChildren: options.allowChildren,
      countDivisor: kind === 'triangles' ? 3 : undefined,
      kind: kind === 'triangles' ? 'triangle' : kind,
      layout,
      topology: options.topology,
      widthUnit: options.widthUnit
    });
  }

  /** Replaces the streamed records or renders nothing when null. */
  get instances(): Source | null {
    return getStreamingLayerSource(this) as Source | null;
  }

  set instances(value: Source | null) {
    setStreamingLayerSource(this, value);
  }

  /** Limits how many records render; undefined renders the complete source. */
  get count(): number | undefined {
    return getStreamingLayerCount(this);
  }

  set count(value: number | undefined) {
    setStreamingLayerCount(this, value);
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
    commitStreamingLayer(this, start, count);
  }

  /** Internal renderer seam; it drains pending upload ranges. */
  render() {
    return html`<slot></slot>`;
  }

  protected override updated(): void {
    notifyOwningScene(this);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    connectStreamingLayer(this);
  }

  override disconnectedCallback(): void {
    disconnectStreamingLayer(this);
    super.disconnectedCallback();
  }
}
