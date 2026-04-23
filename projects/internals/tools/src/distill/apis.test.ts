// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { Attribute, Element, Token } from '@internals/metadata';
import {
  distillElements,
  distillAttributes,
  distillTokens,
  distillAttributeValues,
  distillSearchResult,
  isComplexAttributeValue,
  type PartialAPIResult
} from './apis.js';

describe('distillElements', () => {
  it('should filter out deprecated elements', () => {
    const elements = [
      { name: 'nve-button', manifest: { description: 'button description', metadata: { behavior: 'button' } } },
      { name: 'nve-deprecated', manifest: { description: 'deprecated', deprecated: 'true' } }
    ] as Element[];

    const result = distillElements(elements);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('nve-button');
  });

  it('should filter out elements without descriptions', () => {
    const elements = [
      { name: 'nve-button', manifest: { description: 'button description', metadata: { behavior: 'button' } } },
      { name: 'nve-no-description', manifest: {} }
    ] as Element[];

    const result = distillElements(elements);
    expect(result).toHaveLength(1);
  });

  it('should map to PartialAPIResult with behavior', () => {
    const elements = [
      { name: 'nve-button', manifest: { description: 'button description', metadata: { behavior: 'button' } } }
    ] as Element[];

    const result = distillElements(elements);
    expect(result[0]).toEqual({ name: 'nve-button', description: 'button description', behavior: 'button' });
  });

  it('should default behavior to empty string', () => {
    const elements = [{ name: 'nve-badge', manifest: { description: 'badge description' } }] as Element[];

    const result = distillElements(elements);
    expect(result[0].behavior).toBe('');
  });

  it('should return empty array for empty input', () => {
    expect(distillElements([])).toEqual([]);
  });
});

describe('distillAttributes', () => {
  it('should keep attributes with description and example', () => {
    const attributes = [{ name: 'nve-layout', description: 'Layout utility' }] as PartialAPIResult[];

    const result = distillAttributes(attributes);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ name: 'nve-layout', description: 'Layout utility', behavior: 'attribute' });
  });

  it('should filter out attributes without description', () => {
    const attributes = [{ name: 'nve-layout' }] as PartialAPIResult[];
    expect(distillAttributes(attributes)).toEqual([]);
  });

  it('should return empty array for empty input', () => {
    expect(distillAttributes([])).toEqual([]);
  });

  it('should only allow nve-text and nve-layout attributes due to context limitations', () => {
    const attributes = [
      { name: 'nve-text', description: 'Text utility' },
      { name: 'nve-layout', description: 'Layout utility' },
      { name: 'nve-color', description: 'Color utility' }
    ] as PartialAPIResult[];
    expect(distillAttributes(attributes)).toEqual([
      { name: 'nve-text', description: 'Text utility', behavior: 'attribute' },
      { name: 'nve-layout', description: 'Layout utility', behavior: 'attribute' }
    ]);
  });
});

describe('distillTokens', () => {
  const createToken = (name: string, value = '#000', description = ''): Token => ({ name, value, description });

  it('should filter out nve-config- tokens', () => {
    const tokens = [createToken('nve-config-test'), createToken('sys-color-primary')];
    const result = distillTokens(tokens);
    expect(result.some(t => t.name.includes('nve-config-'))).toBe(false);
    expect(result).toHaveLength(1);
  });

  it('should filter out ref-color tokens', () => {
    const tokens = [createToken('ref-color-blue'), createToken('sys-color-primary')];
    expect(distillTokens(tokens)).toHaveLength(1);
  });

  it('should filter out ref-scale tokens', () => {
    const tokens = [createToken('ref-scale-100'), createToken('sys-spacing-md')];
    expect(distillTokens(tokens)).toHaveLength(1);
  });

  it('should filter out ref-opacity tokens', () => {
    const tokens = [createToken('ref-opacity-50'), createToken('sys-opacity-md')];
    expect(distillTokens(tokens)).toHaveLength(1);
  });

  it('should filter out ref-outline tokens', () => {
    const tokens = [createToken('ref-outline-width'), createToken('sys-outline-default')];
    expect(distillTokens(tokens)).toHaveLength(1);
  });

  it('should filter out ref-font-family- tokens', () => {
    const tokens = [createToken('ref-font-family-mono'), createToken('sys-font-body')];
    expect(distillTokens(tokens)).toHaveLength(1);
  });

  it('should filter out sys-color-scheme tokens', () => {
    const tokens = [createToken('sys-color-scheme-dark'), createToken('sys-color-primary')];
    expect(distillTokens(tokens)).toHaveLength(1);
  });

  it('should filter out sys-contrast tokens', () => {
    const tokens = [createToken('sys-contrast-high'), createToken('sys-color-primary')];
    expect(distillTokens(tokens)).toHaveLength(1);
  });

  it('should filter out line-height tokens', () => {
    const tokens = [createToken('sys-line-height-lg'), createToken('sys-font-size-lg')];
    expect(distillTokens(tokens)).toHaveLength(1);
  });

  it('should filter out ratio tokens', () => {
    const tokens = [createToken('sys-ratio-wide'), createToken('sys-spacing-md')];
    expect(distillTokens(tokens)).toHaveLength(1);
  });

  it('should filter out -xxx tokens', () => {
    const tokens = [createToken('sys-size-xxxl'), createToken('sys-size-lg')];
    expect(distillTokens(tokens)).toHaveLength(1);
  });

  it('should filter out -xx tokens', () => {
    const tokens = [createToken('sys-size-xxl'), createToken('sys-size-lg')];
    expect(distillTokens(tokens)).toHaveLength(1);
  });

  it('should keep valid semantic tokens', () => {
    const tokens = [createToken('sys-color-primary'), createToken('sys-spacing-md'), createToken('sys-font-size-lg')];
    expect(distillTokens(tokens)).toHaveLength(3);
  });

  it('should sort tokens alphabetically by name', () => {
    const tokens = [createToken('sys-z-index'), createToken('sys-alpha'), createToken('sys-medium')];
    const result = distillTokens(tokens);
    expect(result[0].name).toBe('sys-alpha');
    expect(result[1].name).toBe('sys-medium');
    expect(result[2].name).toBe('sys-z-index');
  });

  it('should return empty array for empty input', () => {
    expect(distillTokens([])).toEqual([]);
  });
});

describe('distillAttributeValues', () => {
  it('should filter out values with pipe character', () => {
    const values = [{ name: 'info' }, { name: 'error|danger' }, { name: 'success' }];
    const result = distillAttributeValues(values);
    expect(result).toEqual([{ name: 'info' }, { name: 'success' }]);
  });

  it('should filter out values with @ character', () => {
    const values = [{ name: 'active' }, { name: '@deprecated' }, { name: 'inactive' }];
    expect(distillAttributeValues(values)).toEqual([{ name: 'active' }, { name: 'inactive' }]);
  });

  it('should filter out values with & character', () => {
    const values = [{ name: 'left' }, { name: 'left&right' }, { name: 'right' }];
    expect(distillAttributeValues(values)).toEqual([{ name: 'left' }, { name: 'right' }]);
  });

  it('should return empty array when all values are filtered', () => {
    const values = [{ name: 'value|1' }, { name: '@deprecated' }, { name: 'test&value' }];
    expect(distillAttributeValues(values)).toEqual([]);
  });

  it('should return empty array for empty input', () => {
    expect(distillAttributeValues([])).toEqual([]);
  });
});

describe('isComplexAttributeValue', () => {
  it('should identify system values as complex', () => {
    expect(isComplexAttributeValue('debug')).toBe(true);
    expect(isComplexAttributeValue('mkd')).toBe(true);
    expect(isComplexAttributeValue('md')).toBe(true);
  });

  it('should identify layout special characters as complex', () => {
    expect(isComplexAttributeValue('row|column')).toBe(true);
    expect(isComplexAttributeValue('@media')).toBe(true);
    expect(isComplexAttributeValue('a&b')).toBe(true);
  });

  it('should identify scale boundary values as complex', () => {
    expect(isComplexAttributeValue('xxl')).toBe(true);
    expect(isComplexAttributeValue(':none')).toBe(true);
  });

  it('should identify non-semantic typography values as complex', () => {
    expect(isComplexAttributeValue('display')).toBe(true);
    expect(isComplexAttributeValue('eyebrow')).toBe(true);
    expect(isComplexAttributeValue('white')).toBe(true);
    expect(isComplexAttributeValue('black')).toBe(true);
  });

  it('should identify visually ambiguous typography values as complex', () => {
    expect(isComplexAttributeValue('line-height-md')).toBe(true);
    expect(isComplexAttributeValue('tight')).toBe(true);
    expect(isComplexAttributeValue('snug')).toBe(true);
    expect(isComplexAttributeValue('moderate')).toBe(true);
    expect(isComplexAttributeValue('relaxed')).toBe(true);
    expect(isComplexAttributeValue('loose')).toBe(true);
    expect(isComplexAttributeValue('flat')).toBe(true);
  });

  it('should not flag valid semantic values', () => {
    expect(isComplexAttributeValue('primary')).toBe(false);
    expect(isComplexAttributeValue('sm')).toBe(false);
    expect(isComplexAttributeValue('heading')).toBe(false);
    expect(isComplexAttributeValue('row')).toBe(false);
  });
});

describe('distillSearchResult', () => {
  it('should strip changelog and markdown from element results', () => {
    const el = {
      name: 'nve-button',
      manifest: { metadata: { markdown: 'some markdown' } },
      changelog: 'v1.0.0 changes'
    } as unknown as Element;

    const result = distillSearchResult(el) as Element;
    expect(result.changelog).toBeUndefined();
    expect(result.manifest!.metadata.markdown).toBe('');
  });

  it('should filter complex values from attribute results', () => {
    const attr = {
      name: 'nve-layout',
      values: [{ name: 'row' }, { name: 'row|column' }, { name: 'grid' }]
    } as unknown as Attribute;

    const result = distillSearchResult(attr) as Attribute;
    expect(result.values).toEqual([{ name: 'row' }, { name: 'grid' }]);
  });
});
