// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { expect, test, describe } from 'vitest';
import { visualRunner } from '@internals/vite';

function head(theme: '' | 'dark' = '') {
  return /* html */ `
  <script type="module">
    import '@nvidia-elements/core/grid/define.js';
    import '@nvidia-elements/core/checkbox/define.js';
    import '@nvidia-elements/core/radio/define.js';
    import '@nvidia-elements/core/icon-button/define.js';
    document.documentElement.setAttribute('nve-theme', '${theme}');
  </script>
  <style>
    nve-grid-row {
      content-visibility: visible !important;
    }
  </style>`;
}

function template(theme: '' | 'dark' = '') {
  return /* html */ `
  ${head(theme)}
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
  </nve-grid>`;
}

function multiSelect(theme: '' | 'dark' = '') {
  return /* html */ `
  ${head(theme)}
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
  </nve-grid>`;
}

function singleSelect(theme: '' | 'dark' = '') {
  return /* html */ `
  ${head(theme)}
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
  </nve-grid>`;
}

function rowAction(theme: '' | 'dark' = '') {
  return /* html */ `
  ${head(theme)}
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
  </nve-grid>`;
}

function footerScrollHeight(theme: '' | 'dark' = '') {
  return /* html */ `
  ${head(theme)}
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
  </nve-grid>`;
}

function columnWidth(theme: '' | 'dark' = '') {
  return /* html */ `
  ${head(theme)}
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
  </nve-grid>`;
}

function columnFixed(theme: '' | 'dark' = '') {
  return /* html */ `
  ${head(theme)}
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
  </nve-grid>`;
}

function columnMultiFixed(theme: '' | 'dark' = '') {
  return /* html */ `
  ${head(theme)}
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
  </nve-grid>`;
}

function columnStackedFixed(theme: '' | 'dark' = '') {
  return /* html */ `
  ${head(theme)}
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
  </nve-grid>`;
}

function stripe(theme: '' | 'dark' = '') {
  return /* html */ `
  ${head(theme)}
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
  </nve-grid>`;
}

function placeholder(theme: '' | 'dark' = '') {
  return /* html */ `
  ${head(theme)}
  <nve-grid style="min-height: 300px">
    <nve-grid-header>
      <nve-grid-column></nve-grid-column>
    </nve-grid-header>
    <nve-grid-placeholder>
      •︎•︎•︎•︎•︎•︎
    </nve-grid-placeholder>
  </nve-grid>`;
}

function contentWrap(theme: '' | 'dark' = '') {
  return /* html */ `
  ${head(theme)}
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
  </nve-grid>`;
}

function columnAlignCenter(theme: '' | 'dark' = '') {
  return /* html */ `
  ${head(theme)}
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
  </nve-grid>`;
}

function columnAlignEnd(theme: '' | 'dark' = '') {
  return /* html */ `
  ${head(theme)}
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
  </nve-grid>`;
}

function containerFull(theme: '' | 'dark' = '') {
  return /* html */ `
  ${head(theme)}
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
  </nve-grid>`;
}

function containerFlat(theme: '' | 'dark' = '') {
  return /* html */ `
  ${head(theme)}
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
  </nve-grid>`;
}

describe('grid visual', () => {
  test('grid should match visual baseline', async () => {
    const report = await visualRunner.render('grid', template());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('grid.dark', template('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid multi select should match visual baseline', async () => {
    const report = await visualRunner.render('grid.multi-select', multiSelect());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid multi select should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('grid.multi-select.dark', multiSelect('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid single select should match visual baseline', async () => {
    const report = await visualRunner.render('grid.single-select', singleSelect());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid single select should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('grid.single-select.dark', singleSelect('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid row action should match visual baseline', async () => {
    const report = await visualRunner.render('grid.row-action', rowAction());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid row action should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('grid.row-action.dark', rowAction('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid footer scroll height should match visual baseline', async () => {
    const report = await visualRunner.render('grid.footer-scroll-height', footerScrollHeight());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid footer scroll height should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('grid.footer-scroll-height.dark', footerScrollHeight('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid column width should match visual baseline', async () => {
    const report = await visualRunner.render('grid.column-width', columnWidth());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid column width should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('grid.column-width.dark', columnWidth('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid column fixed should match visual baseline', async () => {
    const report = await visualRunner.render('grid.column-fixed', columnFixed());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid column fixed should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('grid.column-fixed.dark', columnFixed('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid column multi fixed should match visual baseline', async () => {
    const report = await visualRunner.render('grid.column-multi-fixed', columnMultiFixed());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid column multi fixed should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('grid.column-multi-fixed.dark', columnMultiFixed('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid column stacked fixed should match visual baseline', async () => {
    const report = await visualRunner.render('grid.column-stacked-fixed', columnStackedFixed());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid column stacked fixed should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('grid.column-stacked-fixed.dark', columnStackedFixed('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid stripe should match visual baseline', async () => {
    const report = await visualRunner.render('grid.stripe', stripe());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid stripe should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('grid.stripe.dark', stripe('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid placeholder should match visual baseline', async () => {
    const report = await visualRunner.render('grid.placeholder', placeholder());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid placeholder should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('grid.placeholder.dark', placeholder('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid content wrap should match visual baseline', async () => {
    const report = await visualRunner.render('grid.content-wrap', contentWrap());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid content wrap should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('grid.content-wrap.dark', contentWrap('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid column align center should match visual baseline', async () => {
    const report = await visualRunner.render('grid.column-align-center', columnAlignCenter());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid column align center should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('grid.column-align-center.dark', columnAlignCenter('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid column align end should match visual baseline', async () => {
    const report = await visualRunner.render('grid.column-align-end', columnAlignEnd());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid column align end should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('grid.column-align-end.dark', columnAlignEnd('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid container full should match visual baseline', async () => {
    const report = await visualRunner.render('grid.container-full', containerFull());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid container full should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('grid.container-full.dark', containerFull('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid container flat should match visual baseline', async () => {
    const report = await visualRunner.render('grid.container-flat', containerFlat());
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });

  test('grid container flat should match visual baseline dark theme', async () => {
    const report = await visualRunner.render('grid.container-flat.dark', containerFlat('dark'));
    expect(report.maxDiffPercentage).toBeLessThan(1);
  });
});
