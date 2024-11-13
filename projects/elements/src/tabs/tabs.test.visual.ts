import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('tabs visual', () => {
  test('tabs should match visual baseline', async () => {
    const report = await visualRunner.render('tabs', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('tabs should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('tabs.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/tabs/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <nve-tabs>
    <nve-tabs-item selected>•︎•︎•︎•︎•︎•︎</nve-tabs-item>
    <nve-tabs-item>•︎•︎•︎•︎•︎•︎</nve-tabs-item>
    <nve-tabs-item>•︎•︎•︎•︎•︎•︎</nve-tabs-item>
    <nve-tabs-item disabled>•︎•︎•︎•︎•︎•︎</nve-tabs-item>
  </nve-tabs>

  <nve-tabs borderless>
    <nve-tabs-item selected>•︎•︎•︎•︎•︎•︎</nve-tabs-item>
    <nve-tabs-item>•︎•︎•︎•︎•︎•︎</nve-tabs-item>
    <nve-tabs-item>•︎•︎•︎•︎•︎•︎</nve-tabs-item>
    <nve-tabs-item disabled>•︎•︎•︎•︎•︎•︎</nve-tabs-item>
  </nve-tabs>

  <nve-tabs vertical style="width: 250px">
    <nve-tabs-item selected>•︎•︎•︎•︎•︎•︎</nve-tabs-item>
    <nve-tabs-item>•︎•︎•︎•︎•︎•︎</nve-tabs-item>
    <nve-tabs-item>•︎•︎•︎•︎•︎•︎</nve-tabs-item>
    <nve-tabs-item disabled>•︎•︎•︎•︎•︎•︎</nve-tabs-item>
  </nve-tabs>

  <nve-tabs vertical borderless style="width: 250px">
    <nve-tabs-item>
      <nve-icon name="gear"></nve-icon> •︎•︎•︎•︎•︎•︎
    </nve-tabs-item>
    <nve-tabs-item>
      <nve-icon name="person"></nve-icon> •︎•︎•︎•︎•︎•︎
    </nve-tabs-item>
    <nve-tabs-item selected>
      <nve-icon name="beaker"></nve-icon> •︎•︎•︎•︎•︎•︎
    </nve-tabs-item>
    <nve-tabs-item>
      <nve-icon name="add-grid"></nve-icon> •︎•︎•︎•︎•︎•︎
    </nve-tabs-item>
  </nve-tabs>

  <nve-tabs>
    <nve-tabs-item selected>
      <a href="#">•︎•︎•︎•︎•︎•︎</a>
    </nve-tabs-item>
    <nve-tabs-item>
      <a href="#">•︎•︎•︎•︎•︎•︎</a>
    </nve-tabs-item>
    <nve-tabs-item>
      <a href="#">•︎•︎•︎•︎•︎•︎</a>
    </nve-tabs-item>
  </nve-tabs>

  <nve-tabs>
    <nve-tabs-item selected style="--border-background: var(--nve-ref-color-brand-green-900);">
      <a href="#">•︎•︎•︎•︎•︎•︎</a>
    </nve-tabs-item>
    <nve-tabs-item>
      <a href="#">•︎•︎•︎•︎•︎•︎</a>
    </nve-tabs-item>
    <nve-tabs-item>
      <a href="#">•︎•︎•︎•︎•︎•︎</a>
    </nve-tabs-item>
  </nve-tabs>
  `;
}
