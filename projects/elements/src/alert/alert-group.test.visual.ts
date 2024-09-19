import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('alert-group visual', () => {
  test('alert-group should match visual baseline', async () => {
    const report = await visualRunner.render('alert-group', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('alert-group should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('alert-group.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/alert/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <div nve-layout="column gap:xs">
    <nve-alert-group>
      <nve-alert closable>•︎•︎•︎</nve-alert>
      <nve-alert closable>•︎•︎•︎</nve-alert>
    </nve-alert-group>

    <nve-alert-group status="accent">
      <nve-alert closable>•︎•︎•︎</nve-alert>
      <nve-alert closable>•︎•︎•︎</nve-alert>
    </nve-alert-group>

    <nve-alert-group status="warning">
      <nve-alert closable>•︎•︎•︎</nve-alert>
      <nve-alert closable>•︎•︎•︎</nve-alert>
    </nve-alert-group>

    <nve-alert-group status="success">
      <nve-alert closable>•︎•︎•︎</nve-alert>
      <nve-alert closable>•︎•︎•︎</nve-alert>
    </nve-alert-group>

    <nve-alert-group status="danger">
      <nve-alert closable>•︎•︎•︎</nve-alert>
      <nve-alert closable>•︎•︎•︎</nve-alert>
    </nve-alert-group>

    <nve-alert-group prominence="emphasis" container="full">
      <nve-alert closable><span slot="prefix">•︎•︎•︎•︎•︎•︎</span> •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ <a href="#" nve-text="link" slot="actions">•︎•︎•︎•︎•︎•︎</a></nve-alert>
    </nve-alert-group>

    <nve-alert-group status="accent" prominence="emphasis" container="full">
      <nve-alert closable><span slot="prefix">•︎•︎•︎•︎•︎•︎</span> •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ <a href="#" nve-text="link" slot="actions">•︎•︎•︎•︎•︎•︎</a></nve-alert>
    </nve-alert-group>

    <nve-alert-group status="warning" prominence="emphasis" container="full">
      <nve-alert closable><span slot="prefix">•︎•︎•︎•︎•︎•︎</span> •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ <a href="#" nve-text="link" slot="actions">•︎•︎•︎•︎•︎•︎</a></nve-alert>
    </nve-alert-group>

    <nve-alert-group status="success" prominence="emphasis" container="full">
      <nve-alert closable><span slot="prefix">•︎•︎•︎•︎•︎•︎</span> •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ <a href="#" nve-text="link" slot="actions">•︎•︎•︎•︎•︎•︎</a></nve-alert>
    </nve-alert-group>

    <nve-alert-group status="danger" prominence="emphasis" container="full">
      <nve-alert closable><span slot="prefix">•︎•︎•︎•︎•︎•︎</span> •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ <a href="#" nve-text="link" slot="actions">•︎•︎•︎•︎•︎•︎</a></nve-alert>
    </nve-alert-group>

    <nve-alert-group status="danger">
      <nve-alert>
        <p nve-text="body sm">•︎•︎•︎•︎•︎•︎</p>
        <div slot="content" nve-layout="column gap:sm align:stretch">
          <p nve-text="body sm">•︎•︎•︎•︎•︎•︎</p>
          <p nve-text="body sm">•︎•︎•︎•︎•︎•︎</p>
          <p nve-text="body sm">•︎•︎•︎•︎•︎•︎</p>
        </div>
      </nve-alert>
    </nve-alert-group>
  </div>
  `;
}
