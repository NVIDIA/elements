// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LABEL } from '../layouts/built-ins.js';
import { getFieldOffset } from '../layouts/define-layout.js';

export type LabelScaleUnit = 'pixel' | 'world';

const SCALE_OFFSET = getFieldOffset(LABEL, 'scale');

export function normalizeLabelScaleUnit(value: unknown): LabelScaleUnit {
  return value === 'world' ? 'world' : 'pixel';
}

export function labelRecordIsValid(records: DataView, byteOffset: number): boolean {
  const scale = records.getFloat32(byteOffset + SCALE_OFFSET, true);
  return Number.isFinite(scale) && scale > 0;
}

export function hasVisibleLabelText(text: string): boolean {
  for (const character of text) {
    if (character !== ' ' && character !== '\t' && character !== '\r' && character !== '\n') return true;
  }
  return false;
}
