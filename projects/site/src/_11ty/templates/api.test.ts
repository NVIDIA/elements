import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { LighthouseSummary } from '@internals/metadata';

const { reports } = vi.hoisted(() => {
  const lighthouseReports: LighthouseSummary['testResults'] = [];
  return { reports: lighthouseReports };
});

vi.mock('../../index.11tydata.js', () => ({
  siteData: {
    elements: ['nve-viewport', 'nve-viewport-minimap', 'nve-combobox'].map(name => ({ name, manifest: {} })),
    tests: {
      projects: {
        components: {
          coverage: { testResults: [] },
          lighthouse: { testResults: reports },
          axe: { testResults: [] }
        }
      }
    }
  }
}));

vi.resetModules();
const { elementSummary } = await import('./api.js');

describe('elementSummary Lighthouse badges', () => {
  beforeEach(() => {
    reports.length = 0;
  });

  it('uses the component payload and scores when a companion report comes first', () => {
    reports.push(
      createReport('nve-viewport-minimap', 34),
      createReport('nve-viewport', 21, { performance: 100, accessibility: 91, bestPractices: 100 })
    );

    const html = elementSummary('nve-viewport');

    expect(html).toContain('Bundle:&nbsp;21kb');
    expect(html).toContain('Lighthouse:&nbsp;97');
  });

  it('uses the same component payload and scores when the exact report comes first', () => {
    reports.push(
      createReport('nve-viewport', 21, { performance: 100, accessibility: 91, bestPractices: 100 }),
      createReport('nve-viewport-minimap', 34)
    );

    const html = elementSummary('nve-viewport');

    expect(html).toContain('Bundle:&nbsp;21kb');
    expect(html).toContain('Lighthouse:&nbsp;97');
  });

  it('uses the companion component report on its own summary', () => {
    reports.push(createReport('nve-viewport', 21), createReport('nve-viewport-minimap', 34));

    const html = elementSummary('nve-viewport-minimap');

    expect(html).toContain('Bundle:&nbsp;34kb');
    expect(html).toContain('Lighthouse:&nbsp;100');
  });

  it('uses the dedicated component report instead of a suffixed performance variant', () => {
    reports.push(
      createReport('nve-combobox-performance', 35),
      createReport('nve-combobox', 22, { performance: 90, accessibility: 90, bestPractices: 90 })
    );

    const html = elementSummary('nve-combobox');

    expect(html).toContain('Bundle:&nbsp;22kb');
    expect(html).toContain('Lighthouse:&nbsp;90');
  });

  it('keeps missing-report defaults when only a related component report exists', () => {
    reports.push(createReport('nve-viewport-minimap', 34, { performance: 80, accessibility: 80, bestPractices: 80 }));

    const html = elementSummary('nve-viewport');

    expect(html).toContain('Bundle:&nbsp;10kb');
    expect(html).toContain('Lighthouse:&nbsp;100');
  });

  it('keeps missing-report defaults when there are no Lighthouse reports', () => {
    const html = elementSummary('nve-viewport');

    expect(html).toContain('Bundle:&nbsp;10kb');
    expect(html).toContain('Lighthouse:&nbsp;100');
  });
});

function createReport(
  name: string,
  kb: number,
  scores = { performance: 100, accessibility: 100, bestPractices: 100 }
): LighthouseSummary['testResults'][number] {
  return {
    name,
    payload: {
      javascript: { kb, requests: {} },
      css: { kb: 0, requests: {} }
    },
    scores
  };
}
