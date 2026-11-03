// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('dropdown visual', () => {
  test('dropdown should match visual baseline', async () => {
    const report = await visualRunner.render('dropdown', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('dropdown should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('dropdown.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/button/define.js';
    import '@nvidia-elements/core/dropdown/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>

  <style>
    body {
      min-width: 1024px;
      min-height: 780px;
    }
  </style>

  <div><nve-button id="btn">•︎•︎•</nve-button></div>
  <nve-dropdown anchor="btn" closable style="--min-width: 250px">
    <nve-dropdown-header>
      •︎•︎••︎•︎••︎•︎•
    </nve-dropdown-header>
    •︎•︎••︎•︎••︎•︎•
    <nve-dropdown-footer>
      •︎•︎•︎•︎•︎••︎•︎•
    </nve-dropdown-footer>
  </nve-dropdown>
  `;
}

describe('dropdown arrow visual', () => {
  test('should match the arrow baseline', async () => {
    const report = await visualRunner.render('dropdown-arrows', arrowTemplate(), {
      waitFor: wait => wait(() => document.documentElement.dataset.ready === 'true')
    });
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('should match the arrow baseline in dark theme', async () => {
    const report = await visualRunner.render('dropdown-arrows.dark', arrowTemplate('dark'), {
      waitFor: wait => wait(() => document.documentElement.dataset.ready === 'true')
    });
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
  test('should match the arrow baseline in RTL', async () => {
    const report = await visualRunner.render('dropdown-arrows.rtl', arrowTemplate('', 'rtl'), {
      waitFor: wait => wait(() => document.documentElement.dataset.ready === 'true')
    });
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('should match the arrow baseline in RTL dark theme', async () => {
    const report = await visualRunner.render('dropdown-arrows.rtl.dark', arrowTemplate('dark', 'rtl'), {
      waitFor: wait => wait(() => document.documentElement.dataset.ready === 'true')
    });
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function arrowTemplate(theme: '' | 'dark' = '', direction: 'ltr' | 'rtl' = 'ltr') {
  return /* html */ `
    <script type="module">
      import '@nvidia-elements/core/button/define.js';
      import '@nvidia-elements/core/card/define.js';
      import '@nvidia-elements/core/dropdown/define.js';
      document.documentElement.setAttribute('nve-theme', '${theme}');
      document.documentElement.dir = '${direction}';
      await customElements.whenDefined('nve-dropdown');
      for (const dropdown of document.querySelectorAll('nve-dropdown')) {
        const anchor = document.getElementById(dropdown.getAttribute('anchor'));
        await anchor.updateComplete;
        dropdown.popoverType = 'manual';
        await dropdown.updateComplete;
        dropdown.showPopover({ source: anchor });
      }
      document.documentElement.dataset.ready = 'true';
    </script>
    <style>
      body { gap: 64px; width: 1180px; margin: 0; padding: 16px; }
    </style>
    <div nve-layout="row align:center" style="height: 420px; padding-block: 60px">
      <nve-dropdown anchor="card" position="top" alignment="start" arrow>•︎•︎•︎</nve-dropdown>
      <nve-dropdown anchor="card" position="top" alignment="center" arrow>•︎•︎•︎•︎•︎•︎</nve-dropdown>
      <nve-dropdown anchor="card" position="top" alignment="end" arrow>•︎•︎•︎•︎•︎•︎•︎•︎•︎</nve-dropdown>

      <nve-dropdown anchor="card" position="right" alignment="start" arrow>•︎•︎•︎</nve-dropdown>
      <nve-dropdown anchor="card" position="right" alignment="center" arrow>•︎•︎•︎•︎•︎•︎</nve-dropdown>
      <nve-dropdown anchor="card" position="right" alignment="end" arrow>•︎•︎•︎•︎•︎•︎•︎•︎•︎</nve-dropdown>

      <nve-dropdown anchor="card" position="bottom" alignment="start" arrow>•︎•︎•︎</nve-dropdown>
      <nve-dropdown anchor="card" position="bottom" alignment="center" arrow>•︎•︎•︎•︎•︎•︎</nve-dropdown>
      <nve-dropdown anchor="card" position="bottom" alignment="end" arrow>•︎•︎•︎•︎•︎•︎•︎•︎•︎</nve-dropdown>

      <nve-dropdown anchor="card" position="left" alignment="start" arrow>•︎•︎•︎</nve-dropdown>
      <nve-dropdown anchor="card" position="left" alignment="center" arrow>•︎•︎•︎•︎•︎•︎</nve-dropdown>
      <nve-dropdown anchor="card" position="left" alignment="end" arrow>•︎•︎•︎•︎•︎•︎•︎•︎•︎</nve-dropdown>
      <nve-card id="card" style="width: 400px; height: 300px"></nve-card>
    </div>
    <div nve-layout="row align:horizontal-center align:bottom" style="height: 92px; width: calc(100% - 240px); margin-inline: auto">
      <nve-dropdown anchor="btn1" position="top" alignment="start" arrow>•︎•︎•︎</nve-dropdown>
      <nve-button id="btn1" style="margin-inline-end: auto">•︎•︎•︎•︎•︎•︎</nve-button>
      <nve-dropdown anchor="btn2" position="top" alignment="center" arrow>•︎•︎•︎•︎•︎•︎</nve-dropdown>
      <nve-button id="btn2">•︎•︎•︎•︎•︎•︎</nve-button>
      <nve-dropdown anchor="btn3" position="top" alignment="end" arrow>•︎•︎•︎•︎•︎•︎•︎•︎•︎</nve-dropdown>
      <nve-button id="btn3" style="margin-inline-start: auto">•︎•︎•︎•︎•︎•︎</nve-button>
    </div>
  `;
}
