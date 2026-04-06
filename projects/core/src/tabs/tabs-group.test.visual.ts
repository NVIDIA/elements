import { describe, expect, test } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('tabs-group visual', () => {
  test('tabs-group should match visual baseline', async () => {
    const report = await visualRunner.render('tabs-group', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('tabs-group should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('tabs-group.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/tabs/define.js';
    import '@nvidia-elements/core/button/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <div nve-layout="column gap:lg">
    <nve-tabs-group id="tab-group">
      <nve-tabs>
        <nve-tabs-item selected command="--toggle" commandfor="tab-group" value="overview">•︎•︎•︎•︎•︎•︎</nve-tabs-item>
        <nve-tabs-item command="--toggle" commandfor="tab-group" value="details">•︎•︎•︎•︎•︎•︎</nve-tabs-item>
        <nve-tabs-item command="--toggle" commandfor="tab-group" value="settings">•︎•︎•︎•︎•︎•︎</nve-tabs-item>
      </nve-tabs>
      <div slot="overview">•︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎</div>
      <div slot="details" hidden>•︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎</div>
      <div slot="settings" hidden>•︎•︎•︎•︎•︎•︎</div>
    </nve-tabs-group>

    <div nve-layout="row gap:xs">
      <nve-button command="--toggle" commandfor="tab-group" value="overview">•︎•︎•︎•︎</nve-button>
      <nve-button command="--toggle" commandfor="tab-group" value="details">•︎•︎•︎•︎</nve-button>
      <nve-button command="--toggle" commandfor="tab-group" value="settings">•︎•︎•︎•︎</nve-button>
    </div>
  </div>
  `;
}
