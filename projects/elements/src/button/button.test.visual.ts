import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('button visual', () => {
  test('button should match visual baseline', async () => {
    const report = await visualRunner.render('button', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('button should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('button.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/button/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <div nve-layout="row gap:xs">
    <nve-button>•︎•︎•︎•︎•︎•︎</nve-button>
    <nve-button interaction="emphasis">•︎•︎•︎•︎•︎•︎</nve-button>
    <nve-button interaction="destructive">•︎•︎•︎•︎•︎•︎</nve-button>
    <nve-button disabled>•︎•︎•︎•︎•︎•︎</nve-button>
  </div>
  <div nve-layout="row gap:xs">
    <nve-button container="flat">•︎•︎•︎•︎•︎•︎</nve-button>
    <nve-button container="flat" interaction="emphasis">•︎•︎•︎•︎•︎•︎</nve-button>
    <nve-button container="flat" interaction="destructive">•︎•︎•︎•︎•︎•︎</nve-button>
    <nve-button container="flat" disabled>•︎•︎•︎•︎•︎•︎</nve-button>
  </div>
  <div style="line-height: 1; font-size: 14px">
    •︎•︎•︎•︎•︎•︎
    <nve-button container="inline">•︎•︎•︎•︎•︎•︎</nve-button>
    <nve-button container="inline" interaction="emphasis">•︎•︎•︎•︎•︎•︎</nve-button>
    <nve-button container="inline" interaction="destructive">•︎•︎•︎•︎•︎•︎</nve-button>
    <nve-button container="inline" disabled>•︎•︎•︎•︎•︎•︎</nve-button>
    •︎•︎•︎•︎•︎•︎
  </div>
  <div nve-layout="row gap:xs">
    <nve-button size="sm">•︎•︎•︎•︎•︎•︎</nve-button>
    <nve-button>•︎•︎•︎•︎•︎•︎</nve-button>
    <nve-button size="lg">•︎•︎•︎•︎•︎•︎</nve-button>
  </div>
  <div>
    <nve-button pressed>•︎•︎•︎•︎•︎•︎</nve-button>
    <nve-button>•︎•︎•︎•︎•︎•︎</nve-button>
  </div>
  <div>
    <nve-button selected container="flat">•︎•︎•︎•︎•︎•︎</nve-button>
    <nve-button container="flat">•︎•︎•︎•︎•︎•︎</nve-button>
  </div>
  `;
}
