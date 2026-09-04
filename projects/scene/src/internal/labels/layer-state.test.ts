// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { LABEL } from '../layouts/built-ins.js';
import { LabelBuffer } from './buffer.js';
import { publishLabelLayer, registerLabelLayer, setLabelLayerSource, takeLabelLayerRenderData } from './layer-state.js';

describe('label layer state', () => {
  it('publishes numeric and text changes through independent versions', () => {
    const layer = document.createElement('nve-scene-labels');
    const labels = new LabelBuffer({ capacity: 2 });
    const first = labels.add({ position: [0, 0, 0], text: 'first' });
    registerLabelLayer(layer);
    setLabelLayerSource(layer, labels);

    const initial = takeLabelLayerRenderData(layer);
    expect(initial).toMatchObject({ count: 1, hasVisibleText: true, pickable: true, transparent: true });
    expect(initial.uploadRanges).toEqual([{ offset: 0, size: LABEL.stride * 2 }]);

    first.position.x = 4;
    publishLabelLayer(layer, { count: 1, start: 0 });
    const numeric = takeLabelLayerRenderData(layer);
    expect(numeric.textVersion).toBe(initial.textVersion);
    expect(numeric.uploadRanges).toEqual([{ offset: 0, size: LABEL.stride }]);

    first.text = 'updated';
    publishLabelLayer(layer, { count: 1, start: 0 });
    const text = takeLabelLayerRenderData(layer);
    expect(text.textVersion).toBe(initial.textVersion + 1);
    expect(text.texts[0]).toBe('updated');
  });

  it('skips transparent and picking passes when the active labels contain only whitespace', () => {
    const layer = document.createElement('nve-scene-labels');
    const labels = new LabelBuffer({ capacity: 2 });
    labels.add({ text: ' \t\n' });
    labels.add({ text: 'visible' });
    registerLabelLayer(layer);
    setLabelLayerSource(layer, labels);

    const visible = takeLabelLayerRenderData(layer);
    expect(visible).toMatchObject({ count: 2, hasVisibleText: true, pickable: true, transparent: true });

    labels.setCount(1);
    publishLabelLayer(layer, { activeCount: 1, count: 0, start: 1 });
    expect(takeLabelLayerRenderData(layer)).toMatchObject({
      count: 1,
      hasVisibleText: false,
      pickable: false,
      transparent: false
    });
  });
});
