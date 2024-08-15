import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('dot visual', () => {
  test('dot should match visual baseline', async () => {
    const report = await visualRunner.render('dot', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('dot should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('dot.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/dot/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <div nve-layout="row gap:md">
    <nve-dot status="scheduled"></nve-dot>
    <nve-dot status="queued"></nve-dot>
    <nve-dot status="pending"></nve-dot>
    <nve-dot status="starting"></nve-dot>
    <nve-dot status="running"></nve-dot>
    <nve-dot status="restarting"></nve-dot>
    <nve-dot status="stopping"></nve-dot>
    <nve-dot status="finished"></nve-dot>
    <nve-dot status="failed"></nve-dot>
    <nve-dot status="unknown"></nve-dot>
  </div>
  <div nve-layout="row gap:md">
    <nve-dot></nve-dot>
    <nve-dot status="accent"></nve-dot>
    <nve-dot status="warning"></nve-dot>
    <nve-dot status="success"></nve-dot>
    <nve-dot status="danger"></nve-dot>
  </div>
  `;
}
