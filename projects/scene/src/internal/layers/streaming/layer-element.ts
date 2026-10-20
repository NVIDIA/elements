// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators/property.js';
import { getFrameReference, setFrameReference } from '../../composition/frame/state.js';
import type { LayoutDescriptor } from '../../records/layouts/define-layout.js';
import type { LineTopology, LineWidthUnit } from '../lines/data.js';
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
} from './layer-state.js';
import { notifyOwningScene } from '../../composition/scene/notifications.js';
import type { SceneInteractionTarget } from '../../interaction/target.js';
import type { ScenePublishOptions } from '../../records/packed-record-source.js';
import { getLayerInteractive, registerInteractiveLayer, setLayerInteractive } from '../../interaction/layer-state.js';

/**
 * Shared Lit host for streamed point, line, and triangle layers.
 *
 * @event {SceneClick} nve-scene-click - Dispatched when pointer activation resolves to this layer.
 * @event {ScenePointerEnter} nve-scene-pointerenter - Dispatched when the pointer enters this layer.
 * @event {ScenePointerLeave} nve-scene-pointerleave - Dispatched when the pointer leaves this layer.
 */
export abstract class StreamingLayerElement<Source extends StreamingLayerSource>
  extends LitElement
  implements SceneInteractionTarget
{
  /**
   * Names the owning coordinate frame instead of the nearest DOM ancestor frame.
   * Resolves in the nearest model scope, then outward; qualified paths such as arm/tcp
   * address model members. Omit to use DOM ancestry. Missing, duplicate, cross-scene,
   * or cyclic references report frame-unresolved and suppress this contribution until
   * corrected. Hidden or invalid resolved ancestors also suppress it.
   */
  @property({ type: String })
  get frame(): string | null {
    return getFrameReference(this);
  }

  set frame(value: string | null) {
    const previous = this.frame;
    setFrameReference(this, value);
    this.requestUpdate('frame', previous);
  }

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

  /**
   * Enables automatic pointer hit testing and routed nve-scene-click, nve-scene-pointerenter,
   * and nve-scene-pointerleave events on this layer. Defaults to false, avoiding picking
   * work for decorative geometry. Read event.detail.target for source indices and
   * event.detail.featureId for application identity. Explicit scene.pick() ignores this setting.
   */
  @property({ type: Boolean })
  get interactive(): boolean {
    return getLayerInteractive(this);
  }

  set interactive(value: boolean) {
    setLayerInteractive(this, value);
  }

  /**
   * PointBuffer, LineVertexBuffer, TriangleVertexBuffer, or compatible external source;
   * null renders nothing. Capacity never resizes; count is the active prefix. Empty sources
   * are valid and skip GPU allocation. Edit records or mutableBytes, then publish() on each
   * consumer. Direct byte access disables prepared-source caching; record APIs advance version.
   */
  get source(): Source | null {
    return getStreamingLayerSource(this) as Source | null;
  }

  set source(value: Source | null) {
    setStreamingLayerSource(this, value);
  }

  /**
   * Limits rendered records independently of source count; undefined uses the complete
   * active prefix. Shrinking clamps effective draw count while preserving this authored
   * limit, so regrowing can restore records without rewriting it.
   */
  get countLimit(): number | undefined {
    return getStreamingLayerCount(this);
  }

  set countLimit(value: number | undefined) {
    setStreamingLayerCount(this, value);
  }

  /**
   * Synchronously validates and captures this layer's changed records. Options start and
   * count select records, not bytes; activeCount selects the complete active prefix. No
   * options uses the buffer's current count without activating unused capacity. A count-only
   * reduction can use count: 0; growth also captures newly exposed records outside the dirty range.
   * Each consumer owns its snapshot, including device recovery: publishing another layer
   * sharing this source never changes it. Invalid records, ranges, or line/triangle counts
   * make this contribution inert without partially publishing; a later valid call recovers it.
   */
  publish(options?: ScenePublishOptions): void {
    publishStreamingLayer(this, options);
  }

  /** Internal renderer seam; it drains pending upload ranges. */
  render(): TemplateResult<1> {
    return html`<slot @slotchange=${this.#handleSlotChange}></slot>`;
  }

  protected override updated(): void {
    notifyOwningScene(this);
  }

  #handleSlotChange(): void {
    reconcileStreamingLayerChildren(this);
  }
}
