// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { property } from 'lit/decorators/property.js';
import { useStyles } from '@nvidia-elements/core/internal';
import { StreamingLayerElement } from '../internal/streaming-layer-element.js';
import { LINE_VERTEX } from '../internal/layouts/built-ins.js';
import {
  getStreamingLineTopology,
  getStreamingLineWidthUnit,
  setStreamingLineTopology,
  setStreamingLineWidthUnit
} from '../internal/streaming-layer-state.js';
import {
  normalizeLineTopology,
  normalizeLineWidthUnit,
  type LineTopology,
  type LineWidthUnit
} from '../internal/line-data.js';
import styles from './lines.css?inline';

const topologyConverter = { fromAttribute: normalizeLineTopology };
const widthUnitConverter = { fromAttribute: normalizeLineWidthUnit };

/**
 * @element nve-scene-lines
 * @description Renders streamed pixel- or world-width paths from nve.line-vertex records.
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/scene/lines
 * @stable false
 */
export class SceneLines extends StreamingLayerElement {
  static styles = useStyles([styles]);

  static readonly layout = LINE_VERTEX;

  static readonly metadata = {
    tag: 'nve-scene-lines',
    version: '0.0.0'
  };

  /** Vertex connectivity used to form line segments. */
  @property({ converter: topologyConverter })
  get topology(): LineTopology {
    return getStreamingLineTopology(this);
  }

  set topology(value: LineTopology) {
    const previous = this.topology;
    const next = normalizeLineTopology(value);
    if (next !== previous) {
      setStreamingLineTopology(this, next);
      this.requestUpdate('topology', previous);
    }
  }

  /** Unit used by record width, dash, and gap values. Defaults to world units. */
  @property({ attribute: 'width-unit', converter: widthUnitConverter })
  get widthUnit(): LineWidthUnit {
    return getStreamingLineWidthUnit(this);
  }

  set widthUnit(value: LineWidthUnit) {
    const previous = this.widthUnit;
    const next = normalizeLineWidthUnit(value);
    if (next !== previous) {
      setStreamingLineWidthUnit(this, next);
      this.requestUpdate('widthUnit', previous);
    }
  }

  constructor() {
    super('line', LINE_VERTEX, { allowChildren: false, topology: 'strip', widthUnit: 'world' });
  }

  /** Alias for the vertex-oriented public API. */
  get vertices(): ArrayBufferView | null {
    return this.instances;
  }

  set vertices(value: ArrayBufferView | null) {
    this.instances = value;
  }
}
