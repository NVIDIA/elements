import { describe, expect, it } from 'vitest';
import type { MetadataSummary } from '@nve-internals/metadata';
import { getElementImports, searchPackageNames, getCoverageSummaries, getPackageNames } from './utils.js';

describe('getElementImports', () => {
  const metadata = {
    projects: {
      '@nvidia-elements/core': {
        elements: [
          { name: 'nve-button', manifest: { metadata: { entrypoint: '@nvidia-elements/core/button' } } },
          { name: 'nve-badge', manifest: { metadata: { entrypoint: '@nvidia-elements/core/badge' } } }
        ]
      },
      '@nvidia-elements/monaco': {
        elements: [{ name: 'nve-monaco-input', manifest: { metadata: { entrypoint: '@nvidia-elements/monaco/input' } } }]
      }
    }
  } as unknown as MetadataSummary;

  it('should get element imports', () => {
    const html = '<nve-button></nve-button>';
    const imports = getElementImports(html, metadata);
    expect(imports[0]).toBe(`import '@nvidia-elements/core/button/define.js';`);
  });

  it('should get multiple element imports', () => {
    const html = '<nve-button></nve-button> <nve-badge></nve-badge>';
    const imports = getElementImports(html, metadata);
    expect(imports[0]).toBe(`import '@nvidia-elements/core/button/define.js';`);
    expect(imports[1]).toBe(`import '@nvidia-elements/core/badge/define.js';`);
  });

  it('should get monaco imports', () => {
    const html = '<nve-monaco-input></nve-monaco-input>';
    const imports = getElementImports(html, metadata);
    expect(imports[0]).toBe(`import '@nvidia-elements/monaco/input/define.js';`);
  });

  it('should get codeblock imports', () => {
    const html = '<nve-codeblock></nve-codeblock>';
    const imports = getElementImports(html, metadata);
    expect(imports[0]).toBe(`import '@nvidia-elements/code/codeblock/languages/html.js';`);
    expect(imports[1]).toBe(`import '@nvidia-elements/code/codeblock/languages/css.js';`);
    expect(imports[2]).toBe(`import '@nvidia-elements/code/codeblock/languages/json.js';`);
    expect(imports[3]).toBe(`import '@nvidia-elements/code/codeblock/languages/javascript.js';`);
    expect(imports[4]).toBe(`import '@nvidia-elements/code/codeblock/languages/typescript.js';`);
    expect(imports[5]).toBe(`import '@nvidia-elements/code/codeblock/define.js';`);
  });

  it('should get lazy element imports', () => {
    const html = '<nve-button></nve-button>';
    const imports = getElementImports(html, metadata, true);
    expect(imports[0]).toBe(`import('@nvidia-elements/core/button/define.js');`);
  });
});

describe('getPackageNames', () => {
  const metadata = {
    projects: {
      '@nvidia-elements/core': {},
      '@nvidia-elements/monaco': {},
      '@nvidia-elements/code': {},
      '@nve-internals/metadata': {}
    }
  } as unknown as MetadataSummary;

  it('should return package names', () => {
    expect(getPackageNames(metadata)).toEqual([
      '@nvidia-elements/core',
      '@nvidia-elements/monaco',
      '@nvidia-elements/code',
      '@nve-internals/metadata'
    ]);
  });
});

describe('searchPackageNames', () => {
  const metadata = {
    projects: {
      '@nvidia-elements/core': {},
      '@nvidia-elements/monaco': {},
      '@nvidia-elements/code': {}
    }
  } as unknown as MetadataSummary;

  it('should search package names', () => {
    expect(searchPackageNames('elements', metadata)).toEqual(['@nvidia-elements/core']);
    expect(searchPackageNames('monaco', metadata)).toEqual(['@nvidia-elements/monaco']);
    expect(searchPackageNames('code', metadata)).toEqual(['@nvidia-elements/code']);
    expect(searchPackageNames('@nvidia-elements/core', metadata)).toEqual(['@nvidia-elements/core']);
    expect(searchPackageNames('@nvidia-elements/monaco', metadata)).toEqual(['@nvidia-elements/monaco']);
    expect(searchPackageNames('@nvidia-elements/code', metadata)).toEqual(['@nvidia-elements/code']);
    expect(searchPackageNames('elements monaco code', metadata)).toEqual([
      '@nvidia-elements/core',
      '@nvidia-elements/monaco',
      '@nvidia-elements/code'
    ]);
  });
});

describe('getCoverageSummaries', () => {
  const metadata = {
    projects: {
      '@nvidia-elements/core': {
        tests: {
          coverageTotal: {
            branches: { pct: 100 },
            lines: { pct: 100 },
            statements: { pct: 100 },
            functions: { pct: 100 }
          }
        }
      },
      '@nvidia-elements/monaco': {
        tests: {
          coverageTotal: {
            branches: { pct: 100 },
            lines: { pct: 100 },
            statements: { pct: 100 },
            functions: { pct: 100 }
          }
        }
      },
      '@nvidia-elements/code': {
        tests: {
          coverageTotal: {
            branches: { pct: 100 },
            lines: { pct: 100 },
            statements: { pct: 100 },
            functions: { pct: 100 }
          }
        }
      }
    }
  } as unknown as MetadataSummary;

  it('should get coverage summaries', () => {
    expect(getCoverageSummaries(metadata)).toEqual({
      '@nvidia-elements/core': { branches: 100, lines: 100, statements: 100, functions: 100, total: 100 },
      '@nvidia-elements/monaco': { branches: 100, lines: 100, statements: 100, functions: 100, total: 100 },
      '@nvidia-elements/code': { branches: 100, lines: 100, statements: 100, functions: 100, total: 100 }
    });
  });
});
