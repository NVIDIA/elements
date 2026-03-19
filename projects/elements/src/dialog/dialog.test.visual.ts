// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

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

  test('dialog should vertically grow to its main content slot height', async () => {
    const report = await visualRunner.render('dialog.height', height());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('dialog should limit content to scroll container based on dialog height', async () => {
    const report = await visualRunner.render('dialog.scroll-height', scrollHeight());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('dialog should apply container padding conditionally to the header and footer components', async () => {
    const report = await visualRunner.render('dialog.container', container());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('dialog should center to the viewport regardless of the body height', async () => {
    const report = await visualRunner.render('dialog.center-alignment', centerAlignment());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <div style="width: 100vw; height: 100vh"></div>
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

function height() {
  return /* html */ `
  <style>
    body {
      min-width: 100vw;
      min-height: 100vh;
      overflow-x: hidden;
    }
  </style>
  <script type="module">
    import '@nvidia-elements/core/dialog/define.js';
    document.documentElement.setAttribute('nve-theme', 'dark');
  </script>
  <nve-dialog id="dialog" modal closable>
    <nve-dialog-header>
      <h3 nve-text="heading semibold">•︎•︎••︎•︎•</h3>
    </nve-dialog-header>
    <p nve-text="body" style="min-height: 400px">
      •︎•︎••︎•︎•
    </p>
    <nve-dialog-footer>
      <nve-button id="cancel-btn">•︎•︎••︎•︎•</nve-button>
    </nve-dialog-footer>
  </nve-dialog>
  `;
}

function scrollHeight() {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/dialog/define.js';
    document.documentElement.setAttribute('nve-theme', 'dark');
  </script>
  <div style="width: 100vw; height: 100vh"></div>
  <nve-dialog id="dialog" modal closable style="height: 400px">
    <nve-dialog-header>
      <h3 nve-text="heading semibold">•︎•︎••︎•︎•</h3>
    </nve-dialog-header>
    <!-- scroll style will not be visible in snapshot but should see that the content is limited to the dialog height -->
    <p nve-text="body" style="height: 600px; outline: 1px solid #ccc">
      •︎•︎••︎•︎•
    </p>
    <nve-dialog-footer>
      <nve-button id="cancel-btn">•︎•︎••︎•︎•</nve-button>
    </nve-dialog-footer>
  </nve-dialog>
  `;
}

function container() {
  return /* html */ `
<script type="module">
  import '@nvidia-elements/core/dialog/define.js';
  document.documentElement.setAttribute('nve-theme', 'dark');
</script>
<div style="width: 100vw; height: 100vh"></div>
<nve-dialog size="sm" closable popover="manual" position="top">
  <nve-dialog-header>
    <h3 nve-text="heading semibold">•︎•︎••︎•︎•</h3>
  </nve-dialog-header>
  <p nve-text="body">•︎•︎••︎•︎• •︎•︎••︎•︎• •︎•︎••︎•︎• •︎•︎••︎•︎• •︎•︎••︎•︎•</p>
  <nve-dialog-footer>
    <nve-button>•︎•︎••︎•︎•</nve-button>
  </nve-dialog-footer>
</nve-dialog>

<nve-dialog size="sm" closable popover="manual" position="right">
  <h3 nve-text="heading semibold">•︎•︎••︎•︎•</h3>
  <p nve-text="body">•︎•︎••︎•︎• •︎•︎••︎•︎• •︎•︎••︎•︎• •︎•︎••︎•︎• •︎•︎••︎•︎•</p>
  <nve-button>•︎•︎••︎•︎•</nve-button>
</nve-dialog>

<nve-dialog size="sm" closable style="--padding: 0" position="bottom">
  <h3 nve-text="heading semibold">•︎•︎••︎•︎•</h3>
  <p nve-text="body">•︎•︎••︎•︎• •︎•︎••︎•︎• •︎•︎••︎•︎• •︎•︎••︎•︎• •︎•︎••︎•︎•</p>
  <nve-button>•︎•︎••︎•︎•</nve-button>
</nve-dialog>

<nve-dialog size="sm" closable style="--padding: 48px;" position="left">
  <nve-dialog-header>
    <h3 nve-text="heading semibold">•︎•︎••︎•︎•</h3>
  </nve-dialog-header>
  <p nve-text="body">•︎•︎••︎•︎• •︎•︎••︎•︎• •︎•︎••︎•︎• •︎•︎••︎•︎• •︎•︎••︎•︎•</p>
  <nve-dialog-footer>
    <nve-button>•︎•︎••︎•︎•</nve-button>
  </nve-dialog-footer>
</nve-dialog>
`;
}

function centerAlignment() {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/dialog/define.js';
    document.documentElement.setAttribute('nve-theme', 'dark');
  </script>
  <style>
    body {
      height: 200vh;
    }
  </style>
  <!-- if the dialog is not center within the red div the dialog is not centered to the viewport but likely incorrectly centered to the body -->
  <div style="width: 100vw; height: 100vh; background: red;"></div>
  <nve-dialog id="center-alignment-dialog" size="sm" closable popover="manual" position="center" alignment="center">
    <nve-dialog-header>
      <h3 nve-text="heading semibold">•︎•︎••︎•︎•</h3>
    </nve-dialog-header>
  </nve-dialog>
`;
}
