import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('skeleton visual', () => {
  test('skeleton should match visual baseline', async () => {
    const report = await visualRunner.render('skeleton', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('skeleton should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('skeleton.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/skeleton/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <div nve-layout="column gap:md">
    <div nve-layout="column gap:xs align:stretch">
      <nve-skeleton></nve-skeleton>
      <nve-skeleton style="width: 90%"></nve-skeleton>
      <nve-skeleton style="width: 80%"></nve-skeleton>
    </div>

    <div nve-layout="column gap:xs align:stretch">
      <nve-skeleton></nve-skeleton>
      <nve-skeleton effect="pulse"></nve-skeleton>
      <nve-skeleton effect="shimmer"></nve-skeleton>
    </div>

    <div nve-layout="column gap:xs align:stretch">
      <nve-skeleton></nve-skeleton>
      <nve-skeleton shape="pill"></nve-skeleton>
      <nve-skeleton shape="round" style="width: 40px; height: 40px;"></nve-skeleton>
    </div>

    <div nve-layout="column gap:xs align:stretch">
      <nve-skeleton></nve-skeleton>
      <nve-skeleton effect="shimmer">•︎•︎•︎•︎•︎•︎</nve-skeleton>
    </div>

    <div nve-layout="column gap:xs align:stretch">
      <nve-skeleton effect="shimmer" shape="pill"></nve-skeleton>
      <nve-skeleton effect="pulse" shape="pill"></nve-skeleton>
      <nve-skeleton effect="shimmer" shape="round" style="width: 60px; height: 60px;"></nve-skeleton>
      <nve-skeleton effect="pulse" shape="round" style="width: 60px; height: 60px;"></nve-skeleton>
    </div>
  </div>
  `;
}
