// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import type { BenchFnOptions, BenchRunOptions } from 'vitest';
import { describe, test } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Grid } from '@nvidia-elements/core/grid';
import '@nvidia-elements/core/grid/define.js';

const columnCount = 20;
const batchCount = 20;
const textBatchCount = 1_000;
const runOptions = {
  iterations: 10,
  throws: true,
  time: 500,
  warmupIterations: 5,
  warmupTime: 100
} satisfies BenchRunOptions;

describe(`${Grid.metadata.tag}: mutation handling`, () => {
  for (const rowCount of [25, 100]) {
    describe(`${rowCount * columnCount} cells`, () => {
      let fixture: HTMLElement;
      let element: Grid;
      let cells: HTMLElement[];
      let revision = 0;

      const options: BenchFnOptions = {
        async beforeAll() {
          fixture = await createFixture(html`
            <nve-grid>
              <nve-grid-header>
                ${Array.from({ length: columnCount }, (_, column) => html`<nve-grid-column>${column}</nve-grid-column>`)}
              </nve-grid-header>
              ${Array.from(
                { length: rowCount },
                () => html`
                <nve-grid-row>
                  ${Array.from({ length: columnCount }, (_, column) => html`<nve-grid-cell>${column}</nve-grid-cell>`)}
                </nve-grid-row>
              `
              )}
            </nve-grid>
          `);
          element = fixture.querySelector<Grid>(Grid.metadata.tag)!;
          await elementIsStable(element);
          cells = Array.from(element.querySelectorAll<HTMLElement>('nve-grid-cell'));
        },
        afterAll() {
          removeFixture(fixture);
        }
      };

      test('processes 1,000 cell text mutation batches', async ({ bench }) => {
        await bench('processes 1,000 cell text mutation batches', options, async () => {
          for (let batch = 0; batch < textBatchCount; batch++) {
            cells[batch % cells.length]!.textContent = `${revision++}`;
            await Promise.resolve();
            await Promise.resolve();
          }
          return cells[0]!.textContent;
        }).run(runOptions);
      });

      test('processes 20 cell selection mutation batches', async ({ bench }) => {
        await bench('processes 20 cell selection mutation batches', options, async () => {
          for (let batch = 0; batch < batchCount; batch++) {
            cells[batch]!.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, buttons: 1 }));
            await Promise.resolve();
            await Promise.resolve();
          }
          return cells[batchCount - 1]!.tabIndex;
        }).run(runOptions);
      });
    });
  }
});
