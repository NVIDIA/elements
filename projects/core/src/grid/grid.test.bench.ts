// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import type { BenchOptions } from 'vitest';
import { bench, describe } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Grid } from '@nvidia-elements/core/grid';
import { getFlattenedDOMTree, getNextKeyGridItem, KeynavCode } from '@nvidia-elements/core/internal';
import '@nvidia-elements/core/grid/define.js';

const columnCount = 20;
const rowCount = 100;

function createColumnTemplate(columnIndex: number) {
  return html`<nve-grid-column>Column ${columnIndex}</nve-grid-column>`;
}

function createCellTemplate(rowIndex: number, columnIndex: number) {
  return html`<nve-grid-cell>Cell ${rowIndex}-${columnIndex}</nve-grid-cell>`;
}

function createRowTemplate(rowIndex: number) {
  const cells = Array.from({ length: columnCount }, (_, columnIndex) => createCellTemplate(rowIndex, columnIndex));
  return html`<nve-grid-row>${cells}</nve-grid-row>`;
}

const columnTemplates = Array.from({ length: columnCount }, (_, columnIndex) => createColumnTemplate(columnIndex));
const rowTemplates = Array.from({ length: rowCount }, (_, rowIndex) => createRowTemplate(rowIndex));

describe(Grid.metadata.tag, () => {
  let cells: HTMLElement[];
  let element: Grid;
  let fixture: HTMLElement;
  let rows: HTMLElement[];

  const options: BenchOptions = {
    throws: true,
    async setup() {
      fixture = await createFixture(html`
        <nve-grid>
          <nve-grid-header>${columnTemplates}</nve-grid-header>
          ${rowTemplates}
        </nve-grid>
      `);
      element = fixture.querySelector<Grid>(Grid.metadata.tag)!;
      await elementIsStable(element);
      ({ cells, rows } = element.keynavGridConfig);
      cells.forEach(cell => (cell.tabIndex = -1));
      cells[Math.floor(cells.length / 2)]!.tabIndex = 0;
    },
    teardown() {
      removeFixture(fixture);
    }
  };

  describe('keyboard navigation', () => {
    bench(
      'finds the next cell in a 100 by 20 grid',
      () => {
        getNextKeyGridItem(cells, rows, {
          code: KeynavCode.ArrowDown,
          ctrlKey: false,
          dir: 'ltr'
        });
      },
      options
    );
  });

  describe('flattened dom traversal', () => {
    bench(
      'flattens a 100 by 20 grid',
      () => {
        getFlattenedDOMTree(element);
      },
      options
    );
  });
});
