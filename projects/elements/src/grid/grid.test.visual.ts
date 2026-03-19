// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

describe('grid visual', () => {
  test('grid should match visual baseline', async () => {
    const report = await visualRunner.render('grid', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('grid.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/grid/define.js';
    import '@nvidia-elements/core/checkbox/define.js';
    import '@nvidia-elements/core/radio/define.js';
    import '@nvidia-elements/core/icon-button/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <style>
    body {
      min-height: 4600px;
    }

    nve-grid-row {
      content-visibility: visible !important;
    }
  </style>
  <nve-grid>
    <nve-grid-header>
      ${Array(5)
        .fill('')
        .map(() => `<nve-grid-column>•︎•︎•︎•︎•︎•︎</nve-grid-column> `)
        .join('')}
    </nve-grid-header>
    ${Array(6)
      .fill('')
      .map(
        () => `
      <nve-grid-row>
        ${Array(5)
          .fill('')
          .map(() => `<nve-grid-cell>•︎•︎•︎•︎•︎•︎</nve-grid-cell> `)
          .join('')}
      </nve-grid-row>
    `
      )
      .join('')}
  </nve-grid>

  <!-- multi select -->
  <nve-grid>
    <nve-grid-header>
      <nve-grid-column width="max-content" position="fixed">
        <nve-checkbox>
          <input type="checkbox" aria-label="select all rows" />
        </nve-checkbox>
      </nve-grid-column>
      ${Array(5)
        .fill('')
        .map(() => `<nve-grid-column>•︎•︎•︎•︎•︎•︎</nve-grid-column> `)
        .join('')}
    </nve-grid-header>
    ${Array(6)
      .fill('')
      .map(
        (_, i) => `
      <nve-grid-row>
        <nve-grid-cell>
          <nve-checkbox>
            <input type="checkbox" aria-label="select row ${i}" />
          </nve-checkbox>
        </nve-grid-cell>
        ${Array(5)
          .fill('')
          .map(() => `<nve-grid-cell>•︎•︎•︎•︎•︎•︎</nve-grid-cell> `)
          .join('')}
      </nve-grid-row>
    `
      )
      .join('')}
  </nve-grid>

  <!-- single select -->
  <nve-grid>
    <nve-grid-header>
      <nve-grid-column width="max-content" position="fixed"></nve-grid-column>
      ${Array(5)
        .fill('')
        .map(() => `<nve-grid-column>•︎•︎•︎•︎•︎•︎</nve-grid-column> `)
        .join('')}
    </nve-grid-header>
    ${Array(6)
      .fill('')
      .map(
        (_, i) => `
      <nve-grid-row>
        <nve-grid-cell>
          <nve-radio>
            <input type="radio" name="single-select" value=${i} aria-label="select row ${i}" />
          </nve-radio>
        </nve-grid-cell>
        ${Array(5)
          .fill('')
          .map(() => `<nve-grid-cell>•︎•︎•︎•︎•︎•︎</nve-grid-cell> `)
          .join('')}
      </nve-grid-row>
    `
      )
      .join('')}
  </nve-grid>

  <!-- row action -->
  <nve-grid>
    <nve-grid-header>
      ${Array(5)
        .fill('')
        .map(() => `<nve-grid-column>•︎•︎•︎•︎•︎•︎</nve-grid-column> `)
        .join('')}
      <nve-grid-column width="max-content" aria-label="additonal actions" position="fixed"></nve-grid-column>
    </nve-grid-header>
    ${Array(6)
      .fill('')
      .map(
        (_, i) => `
      <nve-grid-row>
        ${Array(5)
          .fill('')
          .map(() => `<nve-grid-cell>•︎•︎•︎•︎•︎•︎</nve-grid-cell> `)
          .join('')}
        <nve-grid-cell>
          <nve-icon-button container="flat" icon-name="more-actions" aria-label="row ${i} actions"></nve-icon-button>
        </nve-grid-cell>
      </nve-grid-row>
    `
      )
      .join('')}
  </nve-grid>

  <!-- footer scroll height -->
  <nve-grid style="--scroll-height: 255px">
    <nve-grid-header>
      ${Array(5)
        .fill('')
        .map(() => `<nve-grid-column>•︎•︎•︎•︎•︎•︎</nve-grid-column>`)
        .join('')}
    </nve-grid-header>
    ${Array(14)
      .fill('')
      .map(
        () => `
      <nve-grid-row>
        ${Array(5)
          .fill('')
          .map(() => `<nve-grid-cell>•︎•︎•︎•︎•︎•︎</nve-grid-cell>`)
          .join('')}
      </nve-grid-row>
    `
      )
      .join('')}
    <nve-grid-footer>
      •︎•︎•︎•︎•︎•︎
    </nve-grid-footer>
  </nve-grid>

  <!-- column width -->
  <nve-grid>
    <nve-grid-header>
      <nve-grid-column width="80px">•︎•︎•︎•︎•︎•︎</nve-grid-column>
      <nve-grid-column>•︎•︎•︎•︎•︎•︎</nve-grid-column>
      <nve-grid-column>•︎•︎•︎•︎•︎•︎</nve-grid-column>
      <nve-grid-column>•︎•︎•︎•︎•︎•︎</nve-grid-column>
      <nve-grid-column>•︎•︎•︎•︎•︎•︎</nve-grid-column>
    </nve-grid-header>
    ${Array(6)
      .fill('')
      .map(
        () => `
      <nve-grid-row>
        ${Array(5)
          .fill('')
          .map(() => `<nve-grid-cell>•︎•︎•︎•︎•︎•︎</nve-grid-cell> `)
          .join('')}
      </nve-grid-row>
    `
      )
      .join('')}
  </nve-grid>

  <!-- column fixed -->
  <nve-grid>
    <nve-grid-header>
      ${Array(5)
        .fill('')
        .map(
          (_, i) =>
            `<nve-grid-column position="${i === 0 ? 'fixed' : ''}" width="200px">•︎•︎•︎•︎•︎•︎</nve-grid-column> `
        )
        .join('')}
    </nve-grid-header>
    ${Array(6)
      .fill('')
      .map(
        () => `
      <nve-grid-row>
        ${Array(5)
          .fill('')
          .map(() => `<nve-grid-cell>•︎•︎•︎•︎•︎•︎</nve-grid-cell> `)
          .join('')}
      </nve-grid-row>
    `
      )
      .join('')}
  </nve-grid>

  <!-- column multi fixed -->
  <nve-grid>
    <nve-grid-header>
      ${Array(5)
        .fill('')
        .map(
          (_, i) =>
            `<nve-grid-column position="${i === 0 || i === 4 ? 'fixed' : ''}" width="200px">•︎•︎•︎•︎•︎•︎</nve-grid-column> `
        )
        .join('')}
    </nve-grid-header>
    ${Array(6)
      .fill('')
      .map(
        () => `
      <nve-grid-row>
        ${Array(5)
          .fill('')
          .map(() => `<nve-grid-cell>•︎•︎•︎•︎•︎•︎</nve-grid-cell> `)
          .join('')}
      </nve-grid-row>
    `
      )
      .join('')}
  </nve-grid>

  <!-- column stacked fixed -->
  <nve-grid>
    <nve-grid-header>
      <nve-grid-column position="fixed" width="100px">•︎•︎•︎•︎•︎•︎</nve-grid-column>
      <nve-grid-column position="fixed" width="100px">•︎•︎•︎•︎•︎•︎</nve-grid-column>
      <nve-grid-column width="200px">•︎•︎•︎•︎•︎•︎</nve-grid-column>
      <nve-grid-column width="200px">•︎•︎•︎•︎•︎•︎</nve-grid-column>
      <nve-grid-column width="200px">•︎•︎•︎•︎•︎•︎</nve-grid-column>
      <nve-grid-column width="200px">•︎•︎•︎•︎•︎•︎</nve-grid-column>
      <nve-grid-column position="fixed" width="100px">•︎•︎•︎•︎•︎•︎</nve-grid-column>
      <nve-grid-column position="fixed" width="100px">•︎•︎•︎•︎•︎•︎</nve-grid-column>
    </nve-grid-header>
    ${Array(6)
      .fill('')
      .map(
        () => `
      <nve-grid-row>
        ${Array(8)
          .fill('')
          .map(() => `<nve-grid-cell>•︎•︎•︎•︎•︎•︎</nve-grid-cell> `)
          .join('')}
      </nve-grid-row>
    `
      )
      .join('')}
  </nve-grid>

  <!-- stripe -->
  <nve-grid stripe>
    <nve-grid-header>
      ${Array(5)
        .fill('')
        .map(() => `<nve-grid-column>•︎•︎•︎•︎•︎•︎</nve-grid-column> `)
        .join('')}
    </nve-grid-header>
    ${Array(6)
      .fill('')
      .map(
        () => `
      <nve-grid-row>
        ${Array(5)
          .fill('')
          .map(() => `<nve-grid-cell>•︎•︎•︎•︎•︎•︎</nve-grid-cell> `)
          .join('')}
      </nve-grid-row>
    `
      )
      .join('')}
  </nve-grid>

  <!-- placeholder -->
  <nve-grid style="min-height: 300px">
    <nve-grid-header>
      <nve-grid-column></nve-grid-column>
    </nve-grid-header>
    <nve-grid-placeholder>
      •︎•︎•︎•︎•︎•︎
    </nve-grid-placeholder>
  </nve-grid>

  <!-- content wrap -->
  <nve-grid>
    <nve-grid-header>
      ${Array(5)
        .fill('')
        .map(() => `<nve-grid-column>•︎•︎•︎•︎•︎•︎</nve-grid-column> `)
        .join('')}
    </nve-grid-header>
    ${Array(6)
      .fill('')
      .map(
        (_, ir) => `
      <nve-grid-row>
        ${Array(5)
          .fill('')
          .map(
            (_, ic) =>
              `<nve-grid-cell>${ir === 3 && ic === 2 ? `•︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎ •︎•︎•︎•︎•︎•︎` : '•︎•︎•︎•︎•︎•︎'}</nve-grid-cell> `
          )
          .join('')}
      </nve-grid-row>
    `
      )
      .join('')}
  </nve-grid>

  <!-- column align center -->
  <nve-grid>
    <nve-grid-header>
      ${Array(5)
        .fill('')
        .map(() => `<nve-grid-column column-align="center">•︎•︎•︎•︎•︎•︎</nve-grid-column> `)
        .join('')}
    </nve-grid-header>
    ${Array(6)
      .fill('')
      .map(
        () => `
      <nve-grid-row>
        ${Array(5)
          .fill('')
          .map(() => `<nve-grid-cell>•︎•︎•︎•︎•︎•︎</nve-grid-cell> `)
          .join('')}
      </nve-grid-row>
    `
      )
      .join('')}
  </nve-grid>

  <!-- column align end -->
  <nve-grid>
    <nve-grid-header>
      ${Array(5)
        .fill('')
        .map(() => `<nve-grid-column column-align="end">•︎•︎•︎•︎•︎•︎</nve-grid-column> `)
        .join('')}
    </nve-grid-header>
    ${Array(6)
      .fill('')
      .map(
        () => `
      <nve-grid-row>
        ${Array(5)
          .fill('')
          .map(() => `<nve-grid-cell>•︎•︎•︎•︎•︎•︎</nve-grid-cell> `)
          .join('')}
      </nve-grid-row>
    `
      )
      .join('')}
  </nve-grid>

  <!-- container full -->
  <nve-grid container="full">
    <nve-grid-header>
      ${Array(5)
        .fill('')
        .map(() => `<nve-grid-column>•︎•︎•︎•︎•︎•︎</nve-grid-column> `)
        .join('')}
    </nve-grid-header>
    ${Array(6)
      .fill('')
      .map(
        () => `
      <nve-grid-row>
        ${Array(5)
          .fill('')
          .map(() => `<nve-grid-cell>•︎•︎•︎•︎•︎•︎</nve-grid-cell> `)
          .join('')}
      </nve-grid-row>
    `
      )
      .join('')}
  </nve-grid>

  <!-- container flat -->
  <nve-grid container="flat">
    <nve-grid-header>
      ${Array(5)
        .fill('')
        .map(() => `<nve-grid-column>•︎•︎•︎•︎•︎•︎</nve-grid-column> `)
        .join('')}
    </nve-grid-header>
    ${Array(6)
      .fill('')
      .map(
        () => `
      <nve-grid-row>
        ${Array(5)
          .fill('')
          .map(() => `<nve-grid-cell>•︎•︎•︎•︎•︎•︎</nve-grid-cell> `)
          .join('')}
      </nve-grid-row>
    `
      )
      .join('')}
  </nve-grid>
  `;
}
