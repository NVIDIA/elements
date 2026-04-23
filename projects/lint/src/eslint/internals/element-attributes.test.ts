// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, it, expect } from 'vitest';
import { getElementAttribute, getRecommendedValue } from './element-attributes.js';

describe('getElementAttribute', () => {
  it('should return null for unknown elements', () => {
    expect(getElementAttribute('nve-unknown-element', 'status')).toBeNull();
    expect(getElementAttribute('unknown-element', 'value')).toBeNull();
  });

  it('should return null for unknown attributes on known elements', () => {
    expect(getElementAttribute('nve-badge', 'unknown-attribute')).toBeNull();
    expect(getElementAttribute('nve-button', 'nonexistent')).toBeNull();
  });

  it('should return isEnum false for attributes with string type', () => {
    // anchor attribute has type "string | HTMLElement"
    const anchor = getElementAttribute('nve-tooltip', 'anchor');
    expect(anchor).not.toBeNull();
    expect(anchor?.isEnum).toBe(false);
    expect(anchor?.values).toEqual([]);
  });

  it('should return isEnum false for attributes with boolean type', () => {
    const pressed = getElementAttribute('nve-button', 'pressed');
    expect(pressed).not.toBeNull();
    expect(pressed?.isEnum).toBe(false);
  });

  it('should return isEnum false for attributes with number type', () => {
    const openDelay = getElementAttribute('nve-tooltip', 'open-delay');
    expect(openDelay).not.toBeNull();
    expect(openDelay?.isEnum).toBe(false);
  });

  it('should return isEnum true with values for enum attributes', () => {
    const status = getElementAttribute('nve-badge', 'status');
    expect(status).not.toBeNull();
    expect(status?.isEnum).toBe(true);
    expect(status?.values.length).toBeGreaterThan(0);
    expect(status?.values).toContain('accent');
  });

  it('should return isEnum false for array-typed attributes', () => {
    const data = getElementAttribute('nve-sparkline', 'data');
    expect(data).not.toBeNull();
    expect(data?.isEnum).toBe(false);
    expect(data?.values).toEqual([]);
  });

  it('should return attribute name correctly', () => {
    const status = getElementAttribute('nve-badge', 'status');
    expect(status?.name).toBe('status');
  });

  it('should include deprecated property in result', () => {
    const attr = getElementAttribute('nve-badge', 'status');
    expect(attr).not.toBeNull();
    expect(attr).toHaveProperty('deprecated');
  });
});

describe('getRecommendedValue', () => {
  it('should return null for empty validValues', () => {
    expect(getRecommendedValue('anything', [])).toBeNull();
  });

  it('should return the value if it is an exact match', () => {
    expect(getRecommendedValue('accent', ['accent', 'warning', 'success'])).toBe('accent');
    expect(getRecommendedValue('warning', ['accent', 'warning', 'success'])).toBe('warning');
  });

  it('should return case-insensitive match', () => {
    expect(getRecommendedValue('Accent', ['accent', 'warning', 'success'])).toBe('accent');
    expect(getRecommendedValue('WARNING', ['accent', 'warning', 'success'])).toBe('warning');
    expect(getRecommendedValue('SUCCESS', ['accent', 'warning', 'success'])).toBe('success');
  });

  it('should return partial match when value is substring of valid value', () => {
    expect(getRecommendedValue('warn', ['accent', 'warning', 'success'])).toBe('warning');
    expect(getRecommendedValue('succ', ['accent', 'warning', 'success'])).toBe('success');
  });

  it('should return partial match when valid value is substring of value', () => {
    expect(getRecommendedValue('accented', ['accent', 'warning', 'success'])).toBe('accent');
  });

  it('should return null if no match found', () => {
    expect(getRecommendedValue('invalid', ['accent', 'warning', 'success'])).toBeNull();
    expect(getRecommendedValue('xyz', ['accent', 'warning', 'success'])).toBeNull();
  });

  it('should prefer exact match over case-insensitive match', () => {
    expect(getRecommendedValue('accent', ['accent', 'Accent'])).toBe('accent');
  });
});
