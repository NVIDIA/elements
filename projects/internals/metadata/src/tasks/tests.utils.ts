// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { existsSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import type { ProjectTestSummary, CoverageResult } from '../types.js';
import type { ProjectsTestSummary } from '../utils/reports.js';

export function normalizePath(path: string): string {
  const projectsIndex = path.indexOf('/projects');
  if (projectsIndex !== -1) {
    return path.substring(projectsIndex);
  }
  return path;
}

export function normalizeTestResults<T extends Record<string, unknown>>(testResults: T[]): T[] {
  return testResults.map(result => {
    const normalized = { ...result };

    if ('name' in result && typeof result.name === 'string') {
      (normalized as Record<string, unknown>).name = normalizePath(result.name);
    }

    if ('assertionResults' in result && Array.isArray(result.assertionResults)) {
      (normalized as Record<string, unknown>).assertionResults = result.assertionResults.map(assertion => {
        const normalizedAssertion = { ...assertion } as Record<string, string[] | Record<string, string> | undefined>;

        normalizedAssertion.failureMessages = ((normalizedAssertion.failureMessages as string[] | undefined) ?? []).map(
          (message: string) => {
            return message.includes('@fs') ? '' : normalizePath(message);
          }
        );
        if (
          typeof assertion === 'object' &&
          assertion !== null &&
          'meta' in assertion &&
          typeof assertion.meta === 'object' &&
          assertion.meta !== null
        ) {
          const meta = assertion.meta as Record<string, string>;
          const normalizedMeta = { ...meta };

          if ('failScreenshotPath' in meta && typeof meta.failScreenshotPath === 'string') {
            normalizedMeta.failScreenshotPath = normalizePath(meta.failScreenshotPath);
          }

          normalizedAssertion.meta = normalizedMeta as Record<string, string>;
        }

        return normalizedAssertion;
      });
    }

    return normalized;
  });
}

export async function generateTestSummary(): Promise<ProjectsTestSummary> {
  return {
    created: new Date().toISOString(),
    projects: {
      '@nvidia-elements/core': await getTestReport('@nvidia-elements/core', '../../../../elements'),
      '@nvidia-elements/core-react': await getTestReport('@nvidia-elements/core-react', '../../../../elements-react'),
      '@nvidia-elements/styles': await getTestReport('@nvidia-elements/styles', '../../../../styles'),
      '@nvidia-elements/testing': await getTestReport('@nvidia-elements/testing', '../../../../testing'),
      '@nvidia-elements/themes': await getTestReport('@nvidia-elements/themes', '../../../../themes'),
      '@nvidia-elements/behaviors-alpine': await getTestReport(
        '@nvidia-elements/behaviors-alpine',
        '../../../../labs/behaviors-alpine'
      ),
      '@nvidia-elements/brand': await getTestReport('@nvidia-elements/brand', '../../../../labs/brand'),
      '@nvidia-elements/code': await getTestReport('@nvidia-elements/code', '../../../../code'),
      '@nvidia-elements/cli': await getTestReport('@nvidia-elements/cli', '../../../../cli'),
      '@nvidia-elements/lint': await getTestReport('@nvidia-elements/lint', '../../../../lint'),
      '@nvidia-elements/forms': await getTestReport('@nvidia-elements/forms', '../../../../forms'),
      '@nvidia-elements/markdown': await getTestReport('@nvidia-elements/markdown', '../../../../markdown'),
      '@nvidia-elements/playwright-screencast': await getTestReport(
        '@nvidia-elements/playwright-screencast',
        '../../../../labs/playwright-screencast'
      ),
      '@nvidia-elements/monaco': await getTestReport('@nvidia-elements/monaco', '../../../../monaco'),
      '@internals/metadata': await getTestReport('@internals/metadata', '../../../../internals/metadata'),
      '@internals/patterns': await getTestReport('@internals/patterns', '../../../../internals/patterns'),
      '@internals/tools': await getTestReport('@internals/tools', '../../../../internals/tools')
    }
  };
}

async function getTestReport(name: string, basePath: string): Promise<ProjectTestSummary> {
  const coveragePath = new URL(basePath + '/coverage/unit/coverage-summary.json', import.meta.url);
  const unitPath = new URL(basePath + '/coverage/unit/summary.json', import.meta.url);
  const axePath = new URL(basePath + '/coverage/axe/summary.json', import.meta.url);
  const visualPath = new URL(basePath + '/coverage/visual/summary.json', import.meta.url);
  const ssrPath = new URL(basePath + '/coverage/ssr/summary.json', import.meta.url);
  const lighthousePath = new URL('../../static/lighthouse.json', import.meta.url);
  const report: ProjectTestSummary = {
    coverage: {
      total: {
        lines: { total: 0, covered: 0, skipped: 0, pct: 0 },
        statements: { total: 0, covered: 0, skipped: 0, pct: 0 },
        branches: { total: 0, covered: 0, skipped: 0, pct: 0 },
        functions: { total: 0, covered: 0, skipped: 0, pct: 0 }
      },
      testResults: []
    },
    unit: {
      numTotalTestSuites: 0,
      numPassedTestSuites: 0,
      numFailedTestSuites: 0,
      numPendingTestSuites: 0,
      numTotalTests: 0,
      numPassedTests: 0,
      numFailedTests: 0,
      numPendingTests: 0,
      numTodoTests: 0,
      startTime: 0,
      success: true,
      testResults: []
    },
    axe: {
      numTotalTestSuites: 0,
      numPassedTestSuites: 0,
      numFailedTestSuites: 0,
      numPendingTestSuites: 0,
      numTotalTests: 0,
      numPassedTests: 0,
      numFailedTests: 0,
      numPendingTests: 0,
      numTodoTests: 0,
      startTime: 0,
      success: true,
      testResults: []
    },
    visual: {
      numTotalTestSuites: 0,
      numPassedTestSuites: 0,
      numFailedTestSuites: 0,
      numPendingTestSuites: 0,
      numTotalTests: 0,
      numPassedTests: 0,
      numFailedTests: 0,
      numPendingTests: 0,
      numTodoTests: 0,
      startTime: 0,
      success: true,
      testResults: []
    },
    ssr: {
      numTotalTestSuites: 0,
      numPassedTestSuites: 0,
      numFailedTestSuites: 0,
      numPendingTestSuites: 0,
      numTotalTests: 0,
      numPassedTests: 0,
      numFailedTests: 0,
      numPendingTests: 0,
      numTodoTests: 0,
      startTime: 0,
      success: true,
      testResults: []
    },
    lighthouse: { testResults: [] }
  };

  if (existsSync(unitPath)) {
    report.unit = JSON.parse(readFileSync(unitPath, 'utf8'));
    report.unit.coverageMap = undefined;
    if (report.unit.testResults) {
      report.unit.testResults = normalizeTestResults(report.unit.testResults);
    }
  }

  if (existsSync(axePath)) {
    report.axe = JSON.parse(readFileSync(axePath, 'utf8'));
    if (report.axe.testResults) {
      report.axe.testResults = normalizeTestResults(report.axe.testResults);
    }
  }

  if (existsSync(visualPath)) {
    report.visual = JSON.parse(readFileSync(visualPath, 'utf8'));
    if (report.visual.testResults) {
      report.visual.testResults = normalizeTestResults(report.visual.testResults);
    }
  }

  if (existsSync(ssrPath)) {
    report.ssr = JSON.parse(readFileSync(ssrPath, 'utf8'));
    if (report.ssr.testResults) {
      report.ssr.testResults = normalizeTestResults(report.ssr.testResults);
    }
  }

  if (existsSync(lighthousePath)) {
    const lighthouseResults = JSON.parse(readFileSync(lighthousePath, 'utf8'))[name];
    report.lighthouse = { testResults: lighthouseResults ? Object.values(lighthouseResults) : [] };
  }

  if (existsSync(coveragePath)) {
    const coverage = JSON.parse(readFileSync(coveragePath, 'utf8')) as Record<string, CoverageResult>;
    report.coverage.total = coverage.total!;
    report.coverage.testResults = Object.entries(coverage).map(([file, coverage]: [string, CoverageResult]) => ({
      file: file.includes('/src/') ? file.split('/src/')[1]! : file,
      ...coverage
    }));
  }

  return report;
}
