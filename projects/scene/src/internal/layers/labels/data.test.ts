// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import { hasVisibleLabelText, labelRecordIsValid, normalizeLabelScaleUnit } from './data.js';
import { LABEL } from '../../records/layouts/built-ins.js';

describe('label data validation', () => {
  it('validates the selected record and rejects nonpositive scale and invalid color modes', () => {
    const bytes = new Uint8Array(LABEL.stride * 2);
    const view = new DataView(bytes.buffer);
    view.setFloat32(LABEL.stride + LABEL.fields.scale!.offset, 2, true);
    view.setUint32(LABEL.stride + LABEL.fields['use-current-color']!.offset, 1, true);
    expect(labelRecordIsValid(view, LABEL.stride)).toBe(true);
    expect(labelRecordIsValid(view, 0)).toBe(false);
    for (const scale of [0, -1, Infinity, NaN]) {
      view.setFloat32(LABEL.stride + LABEL.fields.scale!.offset, scale, true);
      expect(labelRecordIsValid(view, LABEL.stride)).toBe(false);
    }
    view.setFloat32(LABEL.stride + LABEL.fields.scale!.offset, 1, true);
    view.setUint32(LABEL.stride + LABEL.fields['use-current-color']!.offset, 2, true);
    expect(labelRecordIsValid(view, LABEL.stride)).toBe(false);
  });

  it('hides empty ASCII whitespace while preserving visible Unicode text', () => {
    for (const text of ['', ' \t\r\n']) expect(hasVisibleLabelText(text)).toBe(false);
    for (const text of [' label ', '机器人', '🚀']) expect(hasVisibleLabelText(text)).toBe(true);
  });

  it('defaults unrecognized scale units to pixels', () => {
    expect(normalizeLabelScaleUnit('world')).toBe('world');
    for (const unit of [undefined, null, 'WORLD', 'pixel', 1]) expect(normalizeLabelScaleUnit(unit)).toBe('pixel');
  });
});
