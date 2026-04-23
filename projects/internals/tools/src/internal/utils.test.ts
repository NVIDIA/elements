// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { ProjectElement } from '@internals/metadata';
import { getElementImports, getAvailableElementTags, wrapText } from './utils.js';

describe('getElementImports', () => {
  const elements: ProjectElement[] = [
    { name: 'nve-button', manifest: { metadata: { entrypoint: '@nvidia-elements/core/button' } } },
    { name: 'nve-badge', manifest: { metadata: { entrypoint: '@nvidia-elements/core/badge' } } },
    { name: 'nve-monaco-input', manifest: { metadata: { entrypoint: '@nvidia-elements/monaco/input' } } },
    { name: 'nve-deprecated', manifest: { deprecated: 'true', metadata: { entrypoint: '@nvidia-elements/core/deprecated' } } },
    { name: 'nve-no-entrypoint', manifest: { metadata: {} } }
  ] as ProjectElement[];

  it('should get element imports', () => {
    const html = '<nve-button></nve-button>';
    const imports = getElementImports(html, elements);
    expect(imports[0]).toBe(`import '@nvidia-elements/core/button/define.js';`);
  });

  it('should get multiple element imports', () => {
    const html = '<nve-button></nve-button> <nve-badge></nve-badge>';
    const imports = getElementImports(html, elements);
    expect(imports[0]).toBe(`import '@nvidia-elements/core/button/define.js';`);
    expect(imports[1]).toBe(`import '@nvidia-elements/core/badge/define.js';`);
  });

  it('should get monaco imports', () => {
    const html = '<nve-monaco-input></nve-monaco-input>';
    const imports = getElementImports(html, elements);
    expect(imports[0]).toBe(`import '@nvidia-elements/monaco/input/define.js';`);
  });

  it('should get codeblock imports', () => {
    const html = '<nve-codeblock></nve-codeblock>';
    const imports = getElementImports(html, elements);
    expect(imports[0]).toBe(`import '@nvidia-elements/code/codeblock/languages/html.js';`);
    expect(imports[1]).toBe(`import '@nvidia-elements/code/codeblock/languages/css.js';`);
    expect(imports[2]).toBe(`import '@nvidia-elements/code/codeblock/languages/json.js';`);
    expect(imports[3]).toBe(`import '@nvidia-elements/code/codeblock/languages/javascript.js';`);
    expect(imports[4]).toBe(`import '@nvidia-elements/code/codeblock/languages/typescript.js';`);
    expect(imports[5]).toBe(`import '@nvidia-elements/code/codeblock/define.js';`);
  });

  it('should get lazy element imports', () => {
    const html = '<nve-button></nve-button>';
    const imports = getElementImports(html, elements, true);
    expect(imports[0]).toBe(`import('@nvidia-elements/core/button/define.js');`);
  });

  it('should filter out deprecated elements', () => {
    const html = '<nve-deprecated></nve-deprecated>';
    const imports = getElementImports(html, elements);
    expect(imports).toHaveLength(0);
  });

  it('should filter out elements without entrypoint', () => {
    const html = '<nve-no-entrypoint></nve-no-entrypoint>';
    const imports = getElementImports(html, elements);
    expect(imports).toHaveLength(0);
  });

  it('should handle empty or undefined html', () => {
    const imports = getElementImports('', elements);
    expect(imports).toHaveLength(0);
  });

  it('should deduplicate imports when element appears multiple times', () => {
    const html = '<nve-button>one</nve-button> <nve-button>two</nve-button>';
    const imports = getElementImports(html, elements);
    expect(imports).toHaveLength(1);
    expect(imports[0]).toBe(`import '@nvidia-elements/core/button/define.js';`);
  });
});

describe('getAvailableElementTags', () => {
  it('should return non-deprecated element tags', () => {
    const elements = [
      { name: 'nve-button', manifest: {} },
      { name: 'nve-badge', manifest: { deprecated: 'true' } },
      { name: 'nve-input', manifest: {} }
    ] as ProjectElement[];
    const tags = getAvailableElementTags(elements);
    expect(tags).toEqual(['nve-button', 'nve-input']);
    expect(tags).not.toContain('nve-badge');
  });

  it('should handle elements without manifest', () => {
    const elements = [{ name: 'nve-button' }, { name: 'nve-input', manifest: {} }] as ProjectElement[];
    const tags = getAvailableElementTags(elements);
    expect(tags).toEqual(['nve-button', 'nve-input']);
  });
});

describe('wrapText', () => {
  it('should return text unchanged if under width', () => {
    const text = 'short text';
    expect(wrapText(text, 80)).toBe('short text');
  });

  it('should wrap long lines', () => {
    const text = 'this is a very long line that should be wrapped at the specified width limit';
    const result = wrapText(text, 40);
    expect(result.split('\n').every(line => line.length <= 40)).toBe(true);
  });

  it('should handle empty text', () => {
    expect(wrapText()).toBe('');
    expect(wrapText('')).toBe('');
  });

  it('should preserve existing newlines', () => {
    const text = 'line one\nline two';
    expect(wrapText(text, 80)).toBe('line one\nline two');
  });

  it('should handle words longer than width', () => {
    const text = 'superlongwordthatexceedswidth short';
    const result = wrapText(text, 10);
    expect(result).toContain('superlongwordthatexceedswidth');
  });
});
