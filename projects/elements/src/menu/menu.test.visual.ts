import { expect, test, describe } from 'vitest';
import { visualRunner } from '@nve-internals/vite';

describe('menu visual', () => {
  test('menu should match visual baseline', async () => {
    const report = await visualRunner.render('menu', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('menu should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('menu.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <style>
    body {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 24px;
    }
  </style>
  <script type="module">
    import '@nvidia-elements/core/menu/define.js';
    import '@nvidia-elements/core/icon/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <nve-menu>
    <nve-menu-item>•︎•︎•</nve-menu-item>
    <nve-menu-item>•︎•︎•</nve-menu-item>
    <nve-menu-item>•︎•︎•</nve-menu-item>
    <nve-menu-item>•︎•︎•</nve-menu-item>
  </nve-menu>

  <nve-menu>
    <nve-menu-item>•︎•︎•</nve-menu-item>
    <nve-menu-item current="page">•︎•︎•</nve-menu-item>
    <nve-menu-item>•︎•︎•</nve-menu-item>
    <nve-menu-item>•︎•︎•</nve-menu-item>
  </nve-menu>

  <nve-menu>
    <nve-menu-item>•︎•︎•</nve-menu-item>
    <nve-menu-item selected>•︎•︎•</nve-menu-item>
    <nve-menu-item>•︎•︎•</nve-menu-item>
    <nve-menu-item>•︎•︎•</nve-menu-item>
  </nve-menu>

  <nve-menu>
    <nve-menu-item>•︎•︎•</nve-menu-item>
    <nve-menu-item disabled>•︎•︎•</nve-menu-item>
    <nve-menu-item>•︎•︎•</nve-menu-item>
    <nve-menu-item>•︎•︎•</nve-menu-item>
  </nve-menu>

  <nve-menu>
    <nve-menu-item><nve-icon name="person"></nve-icon> •︎•︎•</nve-menu-item>
    <nve-menu-item><nve-icon name="gear"></nve-icon> •︎•︎•</nve-menu-item>
    <nve-menu-item><nve-icon name="star"></nve-icon> •︎•︎•</nve-menu-item>
    <nve-menu-item><nve-icon name="logout"></nve-icon> •︎•︎•</nve-menu-item>
  </nve-menu>

  <nve-menu>
    <nve-menu-item><nve-icon name="person"></nve-icon><a href="#">•︎•︎•</a></nve-menu-item>
    <nve-menu-item><nve-icon name="gear"></nve-icon> <a href="#">•︎•︎•</a></nve-menu-item>
    <nve-menu-item><nve-icon name="star"></nve-icon> <a href="#">•︎•︎•</a></nve-menu-item>
    <nve-menu-item><nve-icon name="logout"></nve-icon> <a href="#">•︎•︎•</a></nve-menu-item>
  </nve-menu>

  <nve-menu>
    <nve-menu-item status="danger">•︎•︎•</nve-menu-item>
    <nve-menu-item status="danger" disabled>•︎•︎•</nve-menu-item>
    <nve-menu-item status="danger" selected>•︎•︎•</nve-menu-item>
    <nve-menu-item status="danger" current="page">•︎•︎•</nve-menu-item>
    <nve-menu-item status="danger"><nve-icon name="gear"></nve-icon> •︎•︎•</nve-menu-item>
    <nve-menu-item status="danger">•︎•︎• <nve-icon id="warning-icon" size="md" name="exclamation-triangle" style="margin-left: auto"></nve-icon></nve-menu-item>
  </nve-menu>

  <nve-menu>
    <nve-menu-item>•︎•︎•</nve-menu-item>
    <nve-menu-item current="page" style="--border-background: var(--nve-ref-color-brand-green-900);">•︎•︎•</nve-menu-item>
    <nve-menu-item>•︎•︎•</nve-menu-item>
    <nve-menu-item>•︎•︎•</nve-menu-item>
  </nve-menu>

  <nve-menu>
    <nve-menu-item><nve-icon name="person"></nve-icon> •︎•︎•</nve-menu-item>
    <nve-menu-item disabled><nve-icon name="gear"></nve-icon> •︎•︎•</nve-menu-item>
    <nve-menu-item current="page"><nve-icon name="star"></nve-icon> •︎•︎•</nve-menu-item>
    <nve-menu-item selected><nve-icon name="logout"></nve-icon> •︎•︎•</nve-menu-item>
  </nve-menu>
  `;
}
