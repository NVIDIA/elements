// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { getThemeSelector, validateTokenValue } from './style-dictionary.config.js';

function createToken({ filePath = 'src/index.json', name, type, value }) {
  return {
    filePath,
    name,
    original: { value },
    type,
    value
  };
}

describe('style dictionary config', () => {
  it('should reject raw semantic color values outside high contrast themes', () => {
    expect(() =>
      validateTokenValue(createToken({ name: 'nve-sys-text-color', type: 'color', value: 'oklch(100% 0 0)' }))
    ).toThrow('invalid color');
  });

  it('should allow reference, visualization, and high contrast color exceptions', () => {
    expect(
      validateTokenValue(createToken({ name: 'nve-sys-text-color', type: 'color', value: '{ref.color.white}' }))
    ).toBe('{ref.color.white}');
    expect(
      validateTokenValue(
        createToken({ name: 'nve-sys-visualization-blue', type: 'color', value: 'oklch(66% 0.18 250)' })
      )
    ).toBe('oklch(66% 0.18 250)');
    expect(
      validateTokenValue(
        createToken({
          filePath: 'src/high-contrast.json',
          name: 'nve-sys-text-color',
          type: 'color',
          value: 'CanvasText'
        })
      )
    ).toBe('CanvasText');
  });

  it('should reject raw px values outside reference size, space, border, or outline tokens', () => {
    expect(() =>
      validateTokenValue(createToken({ name: 'nve-sys-layout-gap', type: 'sizing', value: '12px' }))
    ).toThrow('invalid size or space value');
  });

  it('should allow raw px values for reference size, space, border, and outline tokens', () => {
    expect(validateTokenValue(createToken({ name: 'nve-ref-size-100', type: 'sizing', value: '4px' }))).toBe('4px');
    expect(validateTokenValue(createToken({ name: 'nve-ref-space-sm', type: 'spacing', value: '12px' }))).toBe('12px');
    expect(validateTokenValue(createToken({ name: 'nve-ref-border-width', type: 'borderWidth', value: '1px' }))).toBe(
      '1px'
    );
    expect(validateTokenValue(createToken({ name: 'nve-ref-outline-width', type: 'sizing', value: '2px' }))).toBe(
      '2px'
    );
  });

  it('should match theme tokens instead of substrings', () => {
    expect(getThemeSelector('index')).toBe(":root, [nve-theme~='light']");
    expect(getThemeSelector('dark')).toBe("[nve-theme~='dark']");
  });
});
