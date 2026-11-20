// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ProjectElement } from '@internals/metadata';
import { getAvailableElementTags, getElementImports, isDebug, wrapText } from './utils.js';

describe('getElementImports', () => {
  const elements: ProjectElement[] = [
    { name: 'nve-button', manifest: { metadata: { entrypoint: '@nvidia-elements/core/button' } } },
    { name: 'nve-badge', manifest: { metadata: { entrypoint: '@nvidia-elements/core/badge' } } },
    { name: 'nve-code-block', manifest: { metadata: { entrypoint: '@nvidia-elements/code/code-block' } } },
    { name: 'nve-code-textarea', manifest: { metadata: { entrypoint: '@nvidia-elements/code/code-textarea' } } },
    { name: 'nve-monaco-input', manifest: { metadata: { entrypoint: '@nvidia-elements/monaco/input' } } },
    {
      name: 'nve-deprecated',
      manifest: { deprecated: 'true', metadata: { entrypoint: '@nvidia-elements/core/deprecated' } }
    },
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

  it.each(['nve-code-block', 'nve-codeblock'])('should get the definition for %s without metadata', tag => {
    const html = `<${tag}></${tag}>`;
    expect(getElementImports(html, [])).toEqual([`import '@nvidia-elements/code/code-block/define.js';`]);
  });

  it('should import each requested supported language once before defining code elements', () => {
    const html = `
      <nve-code-block LANGUAGE="MARKDOWN"></nve-code-block>
      <nve-code-textarea language="markdown"></nve-code-textarea>
      <nve-code-textarea language="tsx"></nve-code-textarea>
      <nve-code-block language="unsupported"></nve-code-block>
    `;

    expect(getElementImports(html, elements)).toEqual([
      `import '@nvidia-elements/code/languages/markdown.js';`,
      `import '@nvidia-elements/code/languages/tsx.js';`,
      `import '@nvidia-elements/code/code-block/define.js';`,
      `import '@nvidia-elements/code/code-textarea/define.js';`
    ]);
  });

  it.each(['title="a > b"', `title="example language='css'"`])(
    'should read the language after an attribute with %s',
    attribute => {
      const html = `<nve-code-block ${attribute} language="json"></nve-code-block>`;

      expect(getElementImports(html, elements)).toEqual([
        `import '@nvidia-elements/code/languages/json.js';`,
        `import '@nvidia-elements/code/code-block/define.js';`
      ]);
    }
  );

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

  it('should only match complete element tag names', () => {
    const imports = getElementImports('<nve-button-group></nve-button-group>', elements);

    expect(imports).toHaveLength(0);
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

  it('should handle a single word longer than width with nothing trailing', () => {
    const text = 'superlongwordthatexceedswidth';
    expect(wrapText(text, 10)).toBe('superlongwordthatexceedswidth');
  });
});

describe('isDebug', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should return true when debug is enabled outside of the mcp environment', () => {
    vi.stubEnv('ELEMENTS_DEBUG', 'true');
    vi.stubEnv('ELEMENTS_ENV', 'cli');
    expect(isDebug()).toBe(true);
  });

  it('should return false when debug is not enabled', () => {
    vi.stubEnv('ELEMENTS_DEBUG', 'false');
    vi.stubEnv('ELEMENTS_ENV', 'cli');
    expect(isDebug()).toBe(false);
  });

  it('should return false in the mcp environment even when debug is enabled', () => {
    vi.stubEnv('ELEMENTS_DEBUG', 'true');
    vi.stubEnv('ELEMENTS_ENV', 'mcp');
    expect(isDebug()).toBe(false);
  });
});
