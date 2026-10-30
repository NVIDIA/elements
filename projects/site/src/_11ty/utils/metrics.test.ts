import { describe, expect, it } from 'vitest';
import { getPackageCount, getPatternCount, getTotalTests } from './metrics.js';

describe('getPackageCount', () => {
  it('counts distinct public toolkit packages', () => {
    const projects = [
      { name: '@nvidia-elements/core', version: '2.0.0' },
      { name: '@nvidia-elements/core', version: '2.0.0' },
      { name: '@nvidia-elements/cli', version: '1.0.0' },
      { name: '@nvidia-elements/plot', version: '1.0.0', private: true },
      { name: '@nvidia-elements/future', version: '0.0.0' },
      { name: '@internals/tools', version: '1.0.0' },
      { name: 'starter-react', version: '1.0.0' }
    ];
    expect(getPackageCount(projects)).toBe(2);
  });

  it('returns zero for an empty catalog', () => {
    expect(getPackageCount([])).toBe(0);
  });
});

describe('getPatternCount', () => {
  it.each(['test-case', 'performance', 'template'])(
    'excludes examples tagged %s even when also tagged pattern',
    tag => {
      expect(
        getPatternCount([
          { id: 'excluded', entrypoint: '@internals/patterns/chat.examples.json', tags: ['pattern', tag] },
          { id: 'included', entrypoint: '@internals/patterns/chat.examples.json', tags: ['pattern'] }
        ])
      ).toBe(1);
    }
  );

  it('counts distinct eligible examples from the patterns package', () => {
    expect(
      getPatternCount([
        { id: 'pattern-chat', entrypoint: '@internals/patterns/chat.examples.json' },
        { id: 'pattern-chat', entrypoint: '@internals/patterns/chat.examples.json' },
        { id: 'template-dashboard', entrypoint: '@internals/patterns/templates.examples.json', tags: ['template'] },
        { id: 'old-pattern', entrypoint: '@internals/patterns/chat.examples.json', deprecated: true },
        { id: 'button-pattern', entrypoint: '@nvidia-elements/core/button/button.examples.json' },
        { id: 'other-package', entrypoint: '@internals/patterns-other/chat.examples.json' },
        { id: 'unknown' }
      ])
    ).toBe(1);
  });

  it('returns zero for an empty catalog', () => {
    expect(getPatternCount([])).toBe(0);
  });
});

describe('getTotalTests', () => {
  it('sums passing results and Lighthouse checks, including internal projects', () => {
    const report = {
      unit: { numPassedTests: 10, numTotalTests: 15, numFailedTests: 2, numPendingTests: 3 },
      axe: { numPassedTests: 2 },
      visual: { numPassedTests: 3 },
      ssr: { numPassedTests: 4 },
      lighthouse: { testResults: [{}, {}] }
    };
    expect(getTotalTests({ '@nvidia-elements/core': report, '@internals/tools': report })).toBe(42);
  });

  it('returns zero for an empty report', () => {
    expect(getTotalTests({})).toBe(0);
  });
});
