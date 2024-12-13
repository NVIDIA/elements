import { expect, test, describe } from 'vitest';
import { lighthouseRunner } from '@nve-internals/vite';

describe('avatar lighthouse report', () => {
  test('avatar should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport(
      'nve-avatar',
      /* html */ `
      <nve-avatar>AV</nve-avatar>
      <script type="module">
        import '@nvidia-elements/core/avatar/define.js';
      </script>
    `
    );

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(13.5);
  });

  test('avatar-group should meet lighthouse benchmarks', async () => {
    const report = await lighthouseRunner.getReport(
      'nve-avatar-group',
      /* html */ `
      <nve-avatar-group>
        <nve-avatar color="red-cardinal">AV</nve-avatar>
        <nve-avatar color="blue-cobalt">AV</nve-avatar>
        <nve-avatar color="green-grass">AV</nve-avatar>
        <nve-avatar>+3</nve-avatar>
      </nve-avatar-group>
      <script type="module">
        import '@nvidia-elements/core/avatar/define.js';
      </script>
    `
    );

    expect(report.scores.performance).toBe(100);
    expect(report.scores.accessibility).toBe(100);
    expect(report.scores.bestPractices).toBe(100);
    expect(report.payload.javascript.kb).toBeLessThan(13.5);
  });
});
