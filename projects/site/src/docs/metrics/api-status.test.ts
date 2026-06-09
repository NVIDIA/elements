import { describe, expect, it, vi } from 'vitest';

vi.mock('../../index.11tydata.js', () => ({
  siteData: {
    elements: [],
    tests: {
      created: '2026-06-23T00:00:00.000Z',
      projects: {}
    }
  }
}));

const { getAssertionResult, getCoverageResult, getLighthouseResult } = await import('./api-status.11ty.js');

describe('API status metric matching', () => {
  it('should match assertion results by exact element name', () => {
    const results = [
      {
        assertionResults: [
          { fullName: 'nve-format-datetime should pass axe check', status: 'passed' },
          { fullName: 'nve-format-number should pass axe check', status: 'passed' }
        ]
      }
    ];

    expect(getAssertionResult(results, 'nve-format-number')).toBe(results[0].assertionResults[1]);
  });

  it('should match subcomponent test results from their source test suite', () => {
    const results = [
      {
        name: '/projects/core/src/accordion/accordion.test.ssr.ts',
        assertionResults: [{ fullName: 'nve-accordion should pass baseline ssr check', status: 'passed' }]
      }
    ];

    expect(getAssertionResult(results, 'nve-accordion-header', '/src/accordion/accordion.js', '.test.ssr.ts')).toBe(
      results[0].assertionResults[0]
    );
  });

  it('should match coverage results by manifest source path', () => {
    const results = [{ file: 'grid/cell/cell.ts', branches: { pct: 100 } }];

    expect(getCoverageResult(results, 'nve-grid-cell', '/src/grid/cell/cell.js')).toBe(results[0]);
  });

  it('should prefer implementation coverage over define entrypoints', () => {
    const results = [
      { file: 'format-number/define.ts', branches: { pct: 100 } },
      { file: 'format-number/format-number.ts', branches: { pct: 95.83 } }
    ];

    expect(getCoverageResult(results, 'nve-format-number')).toBe(results[1]);
  });

  it('should only use parent lighthouse reports for child components', () => {
    const results = [{ name: 'nve-format-datetime' }, { name: 'nve-toggletip' }];

    expect(getLighthouseResult(results, 'nve-format-number')).toBeUndefined();
    expect(getLighthouseResult(results, 'nve-toggletip-header')).toBe(results[1]);
  });
});
