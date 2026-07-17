// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  generateTestSummary,
  getCoverageResults,
  getCoverageTotal,
  normalizePath,
  normalizeTestResults
} from './tests.utils.js';
import type { CoverageResult } from '../types.js';
import type { ProjectsTestSummary } from '../utils/reports.js';

const completeCoverage: CoverageResult = {
  lines: { total: 1, covered: 1, skipped: 0, pct: 100 },
  statements: { total: 2, covered: 2, skipped: 0, pct: 100 },
  branches: { total: 3, covered: 3, skipped: 0, pct: 100 },
  functions: { total: 4, covered: 4, skipped: 0, pct: 100 }
};

const partialCoverage: CoverageResult = {
  lines: { total: 2, covered: 1, skipped: 0, pct: 50 },
  statements: { total: 4, covered: 2, skipped: 0, pct: 50 },
  branches: { total: 6, covered: 3, skipped: 0, pct: 50 },
  functions: { total: 8, covered: 4, skipped: 0, pct: 50 }
};

describe('normalizePath', () => {
  it('should normalize absolute path to start at /projects', () => {
    const input = '/topic-branch/projects/internals/tools/src/utils.ts';
    const expected = '/projects/internals/tools/src/utils.ts';
    expect(normalizePath(input)).toBe(expected);
  });

  it('should normalize path that already starts with /projects', () => {
    const input = '/projects/internals/tools/src/utils.ts';
    expect(normalizePath(input)).toBe(input);
  });

  it('should handle path with /projects in the middle', () => {
    const input = '/home/user/workspace/projects/core/src/button/button.ts';
    const expected = '/projects/core/src/button/button.ts';
    expect(normalizePath(input)).toBe(expected);
  });

  it('should return original path if /projects is not found', () => {
    const input = '/some/other/path/file.ts';
    expect(normalizePath(input)).toBe(input);
  });

  it('should handle empty string', () => {
    expect(normalizePath('')).toBe('');
  });
});

describe('normalizeTestResults', () => {
  it('should normalize name field in test results', () => {
    const input = [
      {
        name: '/Users/crylan/dev/Internal/elements/topic-build-metadata/projects/internals/tools/src/utils.test.ts',
        status: 'passed'
      }
    ];

    const result = normalizeTestResults(input);

    expect(result[0].name).toBe('/projects/internals/tools/src/utils.test.ts');
    expect(result[0].status).toBe('passed');
  });

  it('should remove failureMessages from assertionResults', () => {
    const input = [
      {
        name: '/Users/dev/projects/core/src/test.ts',
        assertionResults: [
          {
            title: 'test case',
            status: 'failed',
            failureMessages: ['Error: test failed', 'TypeError: something broke']
          }
        ]
      }
    ];

    const result = normalizeTestResults(input);

    expect(result[0].assertionResults[0]).toHaveProperty('failureMessages');
    expect(result[0].assertionResults[0].failureMessages).toHaveLength(2);
    expect(result[0].assertionResults[0].failureMessages[0]).toBe('Error: test failed');
    expect(result[0].assertionResults[0].failureMessages[1]).toBe('TypeError: something broke');
    expect(result[0].assertionResults[0].title).toBe('test case');
    expect(result[0].assertionResults[0].status).toBe('failed');
  });

  it('should normalize failScreenshotPath in meta', () => {
    const input = [
      {
        name: '/Users/dev/projects/core/src/test.ts',
        assertionResults: [
          {
            title: 'visual test',
            status: 'failed',
            meta: {
              failScreenshotPath: '/topic-branch/projects/markdown/screenshots/test.png'
            }
          }
        ]
      }
    ];

    const result = normalizeTestResults(input);

    expect(result[0].assertionResults[0].meta.failScreenshotPath).toBe('/projects/markdown/screenshots/test.png');
  });

  it('should handle test results without assertionResults', () => {
    const input = [
      {
        name: '/Users/dev/projects/core/src/test.ts',
        status: 'passed'
      }
    ];

    const result = normalizeTestResults(input);

    expect(result[0].name).toBe('/projects/core/src/test.ts');
    expect(result[0]).not.toHaveProperty('assertionResults');
  });

  it('should handle assertionResults without meta', () => {
    const input = [
      {
        name: '/Users/dev/projects/core/src/test.ts',
        assertionResults: [
          {
            title: 'test case',
            status: 'passed'
          }
        ]
      }
    ];

    const result = normalizeTestResults(input);

    expect(result[0].assertionResults[0].title).toBe('test case');
    expect(result[0].assertionResults[0].status).toBe('passed');
  });

  it('should handle multiple test results with mixed data', () => {
    const input = [
      {
        name: '/Users/dev/projects/core/src/button.test.ts',
        assertionResults: [
          {
            title: 'renders correctly',
            status: 'passed',
            failureMessages: []
          }
        ]
      },
      {
        name: '/Users/dev/projects/core/src/input.test.ts',
        assertionResults: [
          {
            title: 'visual regression',
            status: 'failed',
            failureMessages: ['Visual diff detected'],
            meta: {
              failScreenshotPath: '/Users/dev/projects/core/screenshots/input.png'
            }
          }
        ]
      }
    ];

    const result = normalizeTestResults(input);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('/projects/core/src/button.test.ts');
    expect(result[0].assertionResults[0]).toHaveProperty('failureMessages');
    expect(result[0].assertionResults[0].failureMessages).toHaveLength(0);
    expect(result[1].name).toBe('/projects/core/src/input.test.ts');
    expect(result[1].assertionResults[0]).toHaveProperty('failureMessages');
    expect(result[1].assertionResults[0].failureMessages).toHaveLength(1);
    expect(result[1].assertionResults[0].failureMessages[0]).toBe('Visual diff detected');

    const secondAssertion = result[1].assertionResults[0] as Record<string, unknown>;
    expect(secondAssertion.meta).toBeDefined();
    if (secondAssertion.meta && typeof secondAssertion.meta === 'object') {
      const meta = secondAssertion.meta as Record<string, unknown>;
      expect(meta.failScreenshotPath).toBe('/projects/core/screenshots/input.png');
    }
  });

  it('should handle empty array', () => {
    const result = normalizeTestResults([]);
    expect(result).toEqual([]);
  });

  it('should preserve all other properties', () => {
    const input = [
      {
        name: '/Users/dev/projects/test.ts',
        startTime: 1234567890,
        endTime: 1234567900,
        status: 'passed',
        message: 'All tests passed',
        customProperty: 'custom value'
      }
    ];

    const result = normalizeTestResults(input);

    expect(result[0].startTime).toBe(1234567890);
    expect(result[0].endTime).toBe(1234567900);
    expect(result[0].status).toBe('passed');
    expect(result[0].message).toBe('All tests passed');
    expect(result[0].customProperty).toBe('custom value');
  });
});

describe('getCoverageResults', () => {
  it('should remove stale coverage entries for deleted source files', () => {
    const existingPath = new URL('./tests.utils.ts', import.meta.url).pathname;
    const deletedPath = existingPath.replace('tests.utils.ts', 'deleted-source.ts');
    const coverage = {
      total: completeCoverage,
      [existingPath]: completeCoverage,
      [deletedPath]: partialCoverage
    };

    expect(getCoverageResults(coverage)).toEqual([
      {
        file: 'tasks/tests.utils.ts',
        ...completeCoverage
      }
    ]);
  });

  it('should preserve coverage entries outside source directories', () => {
    const coverage = {
      total: completeCoverage,
      'generated.css': partialCoverage
    };

    expect(getCoverageResults(coverage)).toEqual([
      {
        file: 'generated.css',
        ...partialCoverage
      }
    ]);
  });
});

describe('getCoverageTotal', () => {
  it('should calculate totals from filtered coverage entries', () => {
    expect(getCoverageTotal([completeCoverage, partialCoverage])).toEqual({
      lines: { total: 3, covered: 2, skipped: 0, pct: 66.67 },
      statements: { total: 6, covered: 4, skipped: 0, pct: 66.67 },
      branches: { total: 9, covered: 6, skipped: 0, pct: 66.67 },
      functions: { total: 12, covered: 8, skipped: 0, pct: 66.67 }
    });
  });

  it('should report complete percentages when there are no coverage entries', () => {
    expect(getCoverageTotal([])).toEqual({
      lines: { total: 0, covered: 0, skipped: 0, pct: 100 },
      statements: { total: 0, covered: 0, skipped: 0, pct: 100 },
      branches: { total: 0, covered: 0, skipped: 0, pct: 100 },
      functions: { total: 0, covered: 0, skipped: 0, pct: 100 }
    });
  });
});

describe('generateTestSummary', () => {
  let summary: ProjectsTestSummary;
  const ssrSummaryPath = new URL('../../coverage/ssr/summary.json', import.meta.url);
  let removeSsrSummary = false;

  beforeAll(async () => {
    if (!existsSync(ssrSummaryPath)) {
      mkdirSync(new URL('.', ssrSummaryPath), { recursive: true });
      writeFileSync(ssrSummaryPath, JSON.stringify({ testResults: [] }));
      removeSsrSummary = true;
    }
    summary = await generateTestSummary();
  });

  afterAll(() => {
    if (removeSsrSummary) {
      unlinkSync(ssrSummaryPath);
    }
  });

  it('should return the metadata json', () => {
    expect(summary).toBeDefined();
  });

  it('should return the created date', () => {
    expect(summary.created).toBeDefined();
    expect(typeof summary.created).toBe('string');
  });

  it('should have ISO 8601 formatted created date', () => {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    expect(summary.created).toMatch(isoDateRegex);
  });

  it('should have projects object', () => {
    expect(summary.projects).toBeDefined();
    expect(typeof summary.projects).toBe('object');
  });

  it('should contain all expected projects', () => {
    const expectedProjects = [
      '@nvidia-elements/core',
      '@nvidia-elements/styles',
      '@nvidia-elements/themes',
      '@nvidia-elements/code',
      '@nvidia-elements/cli',
      '@nvidia-elements/lint',
      '@nvidia-elements/forms',
      '@nvidia-elements/markdown',
      '@nvidia-elements/media',
      '@nvidia-elements/monaco',
      '@internals/metadata',
      '@internals/patterns',
      '@internals/tools'
    ];

    expectedProjects.forEach(project => {
      expect(summary.projects).toHaveProperty(project);
    });
  });

  it('should have correct structure for each project', () => {
    const project = summary.projects['@internals/metadata'];

    expect(project).toHaveProperty('coverage');
    expect(project).toHaveProperty('unit');
    expect(project).toHaveProperty('axe');
    expect(project).toHaveProperty('visual');
    expect(project).toHaveProperty('ssr');
    expect(project).toHaveProperty('lighthouse');
  });

  it('should have correct coverage structure', () => {
    const project = summary.projects['@internals/metadata'];

    expect(project.coverage).toHaveProperty('total');
    expect(project.coverage).toHaveProperty('testResults');
    expect(project.coverage.total).toHaveProperty('lines');
    expect(project.coverage.total).toHaveProperty('statements');
    expect(project.coverage.total).toHaveProperty('branches');
    expect(project.coverage.total).toHaveProperty('functions');
  });

  it('should have correct test summary structure', () => {
    const project = summary.projects['@internals/metadata'];

    const testSummary = project.unit;
    expect(testSummary).toHaveProperty('numTotalTestSuites');
    expect(testSummary).toHaveProperty('numPassedTestSuites');
    expect(testSummary).toHaveProperty('numFailedTestSuites');
    expect(testSummary).toHaveProperty('numPendingTestSuites');
    expect(testSummary).toHaveProperty('numTotalTests');
    expect(testSummary).toHaveProperty('numPassedTests');
    expect(testSummary).toHaveProperty('numFailedTests');
    expect(testSummary).toHaveProperty('numPendingTests');
    expect(testSummary).toHaveProperty('numTodoTests');
    expect(testSummary).toHaveProperty('startTime');
    expect(testSummary).toHaveProperty('success');
    expect(testSummary).toHaveProperty('testResults');
  });

  it('should have normalized paths in test results', () => {
    const project = summary.projects['@internals/metadata'];

    if (project.unit.testResults && project.unit.testResults.length > 0) {
      const testResult = project.unit.testResults[0];
      if ('name' in testResult && typeof testResult.name === 'string') {
        expect(testResult.name).toMatch(/^\/projects\//);
      }
    }
  });

  it('should have coverageMap set to undefined in unit test results', () => {
    const project = summary.projects['@internals/metadata'];
    expect(project.unit.coverageMap).toBeUndefined();
  });
});
