import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('card visual', () => {
  test('card should match visual baseline', async () => {
    const report = await visualRunner.render('card', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('card should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('card.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/card/define.js';
    import '@nvidia-elements/core/button/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <div nve-layout="column gap:md pad:sm">
    <nve-card style="width:400px; height:200px">
      <nve-card-header>
        <h2 nve-text="heading">•︎•︎•︎•︎•︎•︎</h2>
        <h3 nve-text="heading xs muted">•︎•︎•︎•︎•︎•︎</h3>
      </nve-card-header>
      <nve-card-content>
        •︎•︎•︎
      </nve-card-content>
      <nve-card-footer>
        <nve-button style="margin-left: auto">•︎•︎•︎</nve-button>
      </nve-card-footer>
    </nve-card>

    <nve-card container="flat" style="width:400px; height:200px">
      <nve-card-header>
        <h2 nve-text="heading">•︎•︎•︎•︎•︎•︎</h2>
        <h3 nve-text="heading xs muted">•︎•︎•︎•︎•︎•︎</h3>
      </nve-card-header>
      <nve-card-content>
        •︎•︎•︎
      </nve-card-content>
      <nve-card-footer>
        <nve-button container="flat" style="margin-left: auto">•︎•︎•︎</nve-button>
      </nve-card-footer>
    </nve-card>
  </div>
  `;
}
