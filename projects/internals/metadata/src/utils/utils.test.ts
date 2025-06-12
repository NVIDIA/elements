import { describe, expect, it } from 'vitest';
import {
  getElementImports,
  getPublishedPackageNames,
  searchPackageNames,
  searchTagNames,
  getChangelogs,
  getCoverageSummaries,
  elementMetadataToMarkdown,
  searchPublishedPackageNames,
  getPackageNames,
  searchChangelogs,
  getAvailableElementsAPIs
} from './utils.js';
import type { MetadataSummary } from '../types.js';

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
    expect(imports[3]).toBe(`import '@nvidia-elements/code/codeblock/languages/typescript.js';`);
    expect(imports[4]).toBe(`import '@nvidia-elements/code/codeblock/define.js';`);
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
      '@internals/metadata': {}
    }
  } as unknown as MetadataSummary;

  it('should return package names', () => {
    expect(getPackageNames(metadata)).toEqual([
      '@nvidia-elements/core',
      '@nvidia-elements/monaco',
      '@nvidia-elements/code',
      '@internals/metadata'
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

describe('searchPublishedPackageNames', () => {
  const metadata = {
    projects: {
      '@nvidia-elements/core': {},
      '@nvidia-elements/monaco': {},
      '@nvidia-elements/code': {},
      '@internals/metadata': {},
      '@nvidia-elements/forms': { version: '0.0.0' }
    }
  } as unknown as MetadataSummary;

  it('should search published package names', () => {
    expect(searchPublishedPackageNames('elements', metadata)).toEqual(['@nvidia-elements/core']);
    expect(searchPublishedPackageNames('monaco', metadata)).toEqual(['@nvidia-elements/monaco']);
    expect(searchPublishedPackageNames('code', metadata)).toEqual(['@nvidia-elements/code']);
    expect(searchPublishedPackageNames('@nvidia-elements/core', metadata)).toEqual(['@nvidia-elements/core']);
    expect(searchPublishedPackageNames('@nvidia-elements/monaco', metadata)).toEqual(['@nvidia-elements/monaco']);
    expect(searchPublishedPackageNames('@nvidia-elements/code', metadata)).toEqual(['@nvidia-elements/code']);
    expect(searchPublishedPackageNames('elements monaco code', metadata)).toEqual([
      '@nvidia-elements/core',
      '@nvidia-elements/monaco',
      '@nvidia-elements/code'
    ]);

    expect(searchPublishedPackageNames('forms', metadata)).toEqual(['@nvidia-elements/core', '@nvidia-elements/monaco', '@nvidia-elements/code']);

    expect(searchPublishedPackageNames('metadata', metadata)).toEqual([
      '@nvidia-elements/core',
      '@nvidia-elements/monaco',
      '@nvidia-elements/code'
    ]);
  });
});

describe('getPublishedPackageNames', () => {
  const metadata = {
    projects: {
      '@nvidia-elements/core': { version: '1.0.0' },
      '@nvidia-elements/monaco': { version: '1.0.0' },
      '@nvidia-elements/code': { version: '1.0.0' },
      '@internals/metadata': { version: '0.0.0' }
    }
  } as unknown as MetadataSummary;

  it('should get published package names', () => {
    expect(getPublishedPackageNames(metadata)).toEqual(['@nvidia-elements/core', '@nvidia-elements/monaco', '@nvidia-elements/code']);
  });
});

describe('getChangelogs', () => {
  const metadata = {
    projects: {
      '@nvidia-elements/core': { changelog: '1.0.0' },
      '@nvidia-elements/monaco': { changelog: '1.0.0' },
      '@nvidia-elements/code': { changelog: '1.0.0' }
    }
  } as unknown as MetadataSummary;

  it('should get changelogs', async () => {
    expect(getChangelogs(metadata)).toEqual({
      '@nvidia-elements/core': '1.0.0',
      '@nvidia-elements/monaco': '1.0.0',
      '@nvidia-elements/code': '1.0.0'
    });
  });
});

describe('searchChangelogs', () => {
  const metadata = {
    projects: {
      '@nvidia-elements/core': { changelog: '1.0.0' },
      '@nvidia-elements/monaco': { changelog: '1.0.0' },
      '@nvidia-elements/code': { changelog: '1.0.0' }
    }
  } as unknown as MetadataSummary;

  it('should search changelogs', () => {
    expect(searchChangelogs('monaco', metadata)).toEqual({ '@nvidia-elements/monaco': '1.0.0' });
    expect(searchChangelogs('elements', metadata)).toEqual({ '@nvidia-elements/core': '1.0.0' });
    expect(searchChangelogs('code', metadata)).toEqual({ '@nvidia-elements/code': '1.0.0' });
    expect(searchChangelogs('elements monaco', metadata)).toEqual({
      '@nvidia-elements/core': '1.0.0',
      '@nvidia-elements/monaco': '1.0.0'
    });
    expect(searchChangelogs('no-match', metadata)).toEqual({
      '@nvidia-elements/core': '1.0.0',
      '@nvidia-elements/monaco': '1.0.0',
      '@nvidia-elements/code': '1.0.0'
    });
  });
});

describe('getAvailableElementsAPIs', () => {
  const metadata = {
    projects: {
      '@nvidia-elements/core': {
        elements: [
          { name: 'nve-button', manifest: { description: 'button description' } },
          { name: 'nve-badge', manifest: { description: 'badge description' } },
          { name: 'nve-deprecated', manifest: { description: 'deprecated', deprecated: 'true' } },
          { name: 'nve-no-description', manifest: {} }
        ]
      }
    }
  } as unknown as MetadataSummary;

  it('should return list of available elements APIs', () => {
    const apis = getAvailableElementsAPIs(metadata);
    expect(apis.length).toEqual(2);
    expect(apis).toEqual([
      { name: 'nve-button', description: 'button description' },
      { name: 'nve-badge', description: 'badge description' }
    ]);
  });
});

describe('searchTagNames', () => {
  const metadata = {
    projects: {
      '@nvidia-elements/core': {
        elements: [{ name: 'nve-button' }, { name: 'nve-badge' }, { name: 'nve-grid' }, { name: 'nve-grid-cell' }]
      }
    }
  } as unknown as MetadataSummary;

  it('should search tag names', () => {
    expect(searchTagNames('nve-button', metadata)).toEqual(['nve-button']);
    expect(searchTagNames('nve-badge', metadata)).toEqual(['nve-badge']);
    expect(searchTagNames('nve-button and nve-badge', metadata)).toEqual(['nve-button', 'nve-badge']);
    expect(searchTagNames('nve-grid', metadata)).toEqual(['nve-grid', 'nve-grid-cell']);
    expect(searchTagNames('nve-grid-cell', metadata)).toEqual(['nve-grid', 'nve-grid-cell']);
    expect(searchTagNames('no-match', metadata)).toEqual([]);
    expect(searchTagNames('nve-no-match', metadata)).toEqual([]);
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

describe('elementMetadataToMarkdown', () => {
  const metadata = {
    projects: {
      '@nvidia-elements/core': {
        elements: [
          {
            name: 'nve-button',
            manifest: {
              tagName: 'nve-button',
              description: 'button description',
              slots: [{ name: 'slot', description: 'slot description' }],
              attributes: [
                { name: 'attribute', description: 'attribute description', type: { text: 'attribute type' } }
              ],
              members: [{ name: 'member', description: 'member description', type: { text: 'member type' } }],
              cssProperties: [
                { name: 'cssProperty', description: 'cssProperty description', type: { text: 'cssProperty type' } }
              ],
              events: [{ name: 'event', description: 'event description' }],
              metadata: {
                entrypoint: '@nvidia-elements/core/button',
                example: '<nve-button>Hello</nve-button>'
              }
            }
          },
          {
            name: 'nve-badge',
            manifest: {
              tagName: 'nve-badge',
              metadata: {
                entrypoint: '@nvidia-elements/core/badge'
              }
            }
          }
        ]
      }
    }
  } as unknown as MetadataSummary;

  it('should create CEM markdown', () => {
    const markdown = elementMetadataToMarkdown(metadata.projects['@nvidia-elements/core'].elements[0].manifest);
    expect(markdown.includes('## nve-button')).toBe(true);
    expect(markdown.includes('button description')).toBe(true);
    expect(markdown.includes('### Example')).toBe(true);
    expect(markdown.includes('<nve-button>Hello</nve-button>')).toBe(true);
    expect(markdown.includes('### Import')).toBe(true);
    expect(markdown.includes('@nvidia-elements/core/button')).toBe(true);
    expect(markdown.includes('### Slots')).toBe(true);
    expect(markdown.includes('| slot | slot description |')).toBe(true);
    expect(markdown.includes('### Attributes')).toBe(true);
    expect(markdown.includes('| attribute | `attribute type` | attribute description |')).toBe(true);
    expect(markdown.includes('### Properties')).toBe(true);
    expect(markdown.includes('| member | `member type` | member description |')).toBe(true);
    expect(markdown.includes('### Events')).toBe(true);
    expect(markdown.includes('| event | event description |')).toBe(true);
    expect(markdown.includes('### CSS Properties')).toBe(true);
    expect(markdown.includes('| cssProperty | cssProperty description |')).toBe(true);
  });

  it('should create CEM markdown with placeholders', () => {
    const markdown = elementMetadataToMarkdown(metadata.projects['@nvidia-elements/core'].elements[1].manifest);
    expect(markdown.includes('## nve-badge')).toBe(true);
    expect(markdown.includes('No example available.')).toBe(true);
    expect(markdown.includes('### Import')).toBe(true);
    expect(markdown.includes('@nvidia-elements/core/badge')).toBe(true);
    expect(markdown.includes('### Slots')).toBe(true);
    expect(markdown.includes('No slots available.')).toBe(true);
    expect(markdown.includes('### Attributes')).toBe(true);
    expect(markdown.includes('No Attributes available.')).toBe(true);
    expect(markdown.includes('### Properties')).toBe(true);
    expect(markdown.includes('No Properties available.')).toBe(true);
    expect(markdown.includes('### Events')).toBe(true);
    expect(markdown.includes('No Custom Events available.')).toBe(true);
    expect(markdown.includes('### CSS Properties')).toBe(true);
    expect(markdown.includes('No CSS Properties available.')).toBe(true);
  });
});
