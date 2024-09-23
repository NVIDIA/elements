import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('dialog visual', () => {
  test('dialog should match visual baseline', async () => {
    const report = await visualRunner.render('dialog', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('dialog should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('dialog.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('dialog should position within a shadow root', async () => {
    const report = await visualRunner.render('dialog.shadow-root', shadowRoot());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <style>
    body {
      min-width: 1024px;
      min-height: 780px;
    }
  </style>
  <script type="module">
    import '@nvidia-elements/core/dialog/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <nve-dialog closable>
    <nve-dialog-header>
      •︎•︎•
    </nve-dialog-header>
    •︎•︎•︎
    <nve-dialog-footer>
      •︎•︎•︎
    </nve-dialog-footer>
  </nve-dialog>
  `;
}

function shadowRoot() {
  return /* html */ `
  <dialog-test-shadow-root></dialog-test-shadow-root>
  <script type="module">
    import '@nvidia-elements/core/dialog/define.js';
    document.documentElement.setAttribute('nve-theme', 'dark');
    customElements.define('dialog-test-shadow-root', class DialogTestShadowRoot extends HTMLElement {
      constructor() {
        super();
        this._shadow = this.attachShadow({mode: 'open'});

        const template = document.createElement('template');
        template.innerHTML = \`
          <style>:host { box-sizing: border-box; min-width: 100vw; min-height: 100vh; display: block; width: 100vw; height: 100vh; }</style>
          <nve-dialog size="sm">•︎•︎••︎•︎•</nve-dialog>

          <nve-dialog size="sm" position="top">•︎•︎••︎•︎•</nve-dialog>
          <nve-dialog size="sm" position="top" alignment="start">•︎•︎••︎•︎•</nve-dialog>
          <nve-dialog size="sm" position="top" alignment="end">•︎•︎••︎•︎•</nve-dialog>

          <nve-dialog size="sm" position="right" alignment="start">•︎•︎••︎•︎•</nve-dialog>
          <nve-dialog size="sm" position="right">•︎•︎••︎•︎•</nve-dialog>
          <nve-dialog size="sm" position="right" alignment="end">•︎•︎••︎•︎•</nve-dialog>

          <nve-dialog size="sm" position="bottom" alignment="start">•︎•︎••︎•︎•</nve-dialog>
          <nve-dialog size="sm" position="bottom">•︎•︎••︎•︎•</nve-dialog>
          <nve-dialog size="sm" position="bottom" alignment="end">•︎•︎••︎•︎•</nve-dialog>

          <nve-dialog size="sm" position="left" alignment="start">•︎•︎••︎•︎•</nve-dialog>
          <nve-dialog size="sm" position="left">•︎•︎••︎•︎•</nve-dialog>
          <nve-dialog size="sm" position="left" alignment="end">•︎•︎••︎•︎•</nve-dialog>
        \`;
        this._shadow.appendChild(template.content);
      }
    });
  </script>
  `;
}
