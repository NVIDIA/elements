// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import { getLabelSourceTexts, registerLabelSourceTexts } from './source.js';

describe('label source texts', () => {
  it('keeps producer text ownership and distinguishes otherwise identical source objects', () => {
    const source = Object.freeze({});
    const unrelated = Object.freeze({});
    const texts = ['one', 'two'];
    registerLabelSourceTexts(source, texts);
    expect(getLabelSourceTexts(source)).toBe(texts);
    expect(getLabelSourceTexts(unrelated)).toBeUndefined();
    registerLabelSourceTexts(source, []);
    expect(getLabelSourceTexts(source)).toEqual([]);
    expect(texts).toEqual(['one', 'two']);
  });
});
