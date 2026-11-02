// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement, nothing, render } from 'lit';
import type { BenchFnOptions, BenchRunOptions } from 'vitest';
import { describe, test } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Grid } from '@nvidia-elements/core/grid';
import type { VirtualList, VirtualRange } from '@nvidia-elements/foundations/virtual-list';
import '@nvidia-elements/core/grid/define.js';
import '@nvidia-elements/foundations/virtual-list/define.js';

const rows = Array.from(
  { length: 10_000 },
  (_, row) => html`<nve-grid-row>
  ${Array.from({ length: 4 }, (_, column) => html`<nve-grid-cell>${row}:${column}</nve-grid-cell>`)}
</nve-grid-row>`
);
const header = html`<nve-grid-header>${Array.from({ length: 4 }, (_, column) => html`<nve-grid-column width="25%">Column ${column}</nve-grid-column>`)}</nve-grid-header>`;
const runOptions = {
  iterations: 10,
  throws: true,
  time: 500,
  warmupIterations: 5,
  warmupTime: 100
} satisfies BenchRunOptions;

function draw(event: CustomEvent<VirtualRange>) {
  const list = event.target as VirtualList;
  const request = event.detail;
  if (request !== list.range) return;
  render(html`${rows.slice(request.start, request.end)}`, list);
}

async function stable(fixture: HTMLElement) {
  await elementIsStable(fixture.querySelector<Grid>('nve-grid')!);
  const elements = Array.from(fixture.querySelectorAll('*')).filter(
    (element): element is LitElement => element instanceof LitElement
  );
  await Promise.all(elements.map(element => elementIsStable(element)));
  await Promise.resolve();
  return fixture.querySelector('nve-grid')!.getBoundingClientRect().height;
}

describe(Grid.metadata.tag, () => {
  let fixture: HTMLElement;
  const options: BenchFnOptions = {
    async beforeAll() {
      fixture = await createFixture();
    },
    afterAll() {
      removeFixture(fixture);
    }
  };

  test('renders 1,000 ordinary rows with four cells', async ({ bench }) => {
    await bench('renders 1,000 ordinary rows with four cells', options, async () => {
      render(nothing, fixture);
      render(
        html`<nve-grid style="width:1024px; --scroll-height:400px">${header}${rows.slice(0, 1000)}</nve-grid>`,
        fixture
      );
      return stable(fixture);
    }).run(runOptions);
  });

  test('renders a 10,000-row dataset through a 400px viewport and buffer 2', async ({ bench }) => {
    await bench('renders a 10,000-row dataset through a 400px viewport and buffer 2', options, async () => {
      render(nothing, fixture);
      render(
        html`<nve-grid style="width:1024px">${header}
        <nve-virtual-list item-count="10000" item-height="44" item-buffer="2" style="--scroll-height:400px" @virtual-change=${draw}></nve-virtual-list>
      </nve-grid>`,
        fixture
      );
      return stable(fixture);
    }).run(runOptions);
  });
});
