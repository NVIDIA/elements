import { beforeEach, describe, expect, it } from 'vitest';
import { type LighthouseScores, generateLighthouseReport, getLighthouseReport } from './lighthouse.utils.js';

/**
 * While we don't generate the lighthouse reports, we can still test the output lighthouse returns
 * to ensure downstream consumers are working as expected.
 */
describe('Lighthouse Metadata', () => {
  let summary: LighthouseScores;

  beforeEach(async () => {
    summary = await getLighthouseReport();
  });

  it('should return the metadata json', async () => {
    expect(summary).toBeDefined();
    expect(summary.created).toBeDefined();
    expect(summary.created.length).toBeGreaterThan(0);
    expect(summary['@nvidia-elements/core']).toBeDefined();
    expect(summary['@nvidia-elements/code']).toBeDefined();
  });

  it('should return a element report', async () => {
    expect(summary['@nvidia-elements/core']).toBeDefined();
    expect(summary['@nvidia-elements/core']['nve-dot'].name).toBeDefined();
    expect(summary['@nvidia-elements/core']['nve-dot'].payload).toBeDefined();
    expect(summary['@nvidia-elements/core']['nve-dot'].scores).toBeDefined();
    expect(summary['@nvidia-elements/core']['nve-dot'].scores.performance).toBeDefined();
    expect(summary['@nvidia-elements/core']['nve-dot'].scores.accessibility).toBeDefined();
    expect(summary['@nvidia-elements/core']['nve-dot'].scores.bestPractices).toBeDefined();
    expect(summary['@nvidia-elements/core']['nve-dot'].payload.javascript).toBeDefined();
    expect(summary['@nvidia-elements/core']['nve-dot'].payload.javascript.kb).toBeDefined();
    expect(summary['@nvidia-elements/core']['nve-dot'].payload.javascript.requests).toBeDefined();
    expect(summary['@nvidia-elements/core']['nve-dot'].payload.css).toBeDefined();
    expect(summary['@nvidia-elements/core']['nve-dot'].payload.css.kb).toBeDefined();
    expect(summary['@nvidia-elements/core']['nve-dot'].payload.css.requests).toBeDefined();
  });

  it('should return created date', async () => {
    const report = await generateLighthouseReport();
    expect(report.created).toBeDefined();
    expect(report['@nvidia-elements/core']).not.toBe(undefined);
  });
});
