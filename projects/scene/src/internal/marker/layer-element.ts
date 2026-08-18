// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
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

export abstract class MarkerLayerElement extends LitElement {
  protected constructor(kind: PrimitiveKind) {
    super();
    registerMarkerLayer(this, kind);
  }

  /** Replaces the streamed marker records or selects declarative marker children when null. */
  get instances(): ArrayBufferView | null {
    return getLayerInstances(this);
  }

  set instances(value: ArrayBufferView | null) {
    setLayerInstances(this, value);
  }

  /** Limits how many records render; undefined renders the complete source. */
  get count(): number | undefined {
    return getLayerCount(this);
  }

  set count(value: number | undefined) {
    setLayerCount(this, value);
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
