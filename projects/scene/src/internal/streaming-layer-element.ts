// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
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
  type StreamingLayerKind
} from './streaming-layer-state.js';
import { notifyOwningScene } from './label/notifications.js';

/** Shared Lit host for streamed point, line, and triangle layers. */
export abstract class StreamingLayerElement extends LitElement {
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

  get instances(): ArrayBufferView | null {
    return getStreamingLayerSource(this);
  }

  set instances(value: ArrayBufferView | null) {
    setStreamingLayerSource(this, value);
  }

  get count(): number | undefined {
    return getStreamingLayerCount(this);
  }

  set count(value: number | undefined) {
    setStreamingLayerCount(this, value);
  }

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
