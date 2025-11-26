import { describe, expect, it } from 'vitest';
import type { ProjectElement } from '@nve-internals/metadata';
import { getElementImports } from './utils.js';

describe('getElementImports', () => {
  const elements: ProjectElement[] = [
    { name: 'nve-button', manifest: { metadata: { entrypoint: '@nvidia-elements/core/button' } } },
    { name: 'nve-badge', manifest: { metadata: { entrypoint: '@nvidia-elements/core/badge' } } },
    { name: 'nve-monaco-input', manifest: { metadata: { entrypoint: '@nvidia-elements/monaco/input' } } }
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
});
