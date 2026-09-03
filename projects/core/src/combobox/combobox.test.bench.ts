// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import type { BenchFnOptions, BenchRunOptions } from 'vitest';
import { describe, test } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Combobox } from '@nvidia-elements/core/combobox';
import '@nvidia-elements/core/combobox/define.js';

const optionTemplates = Array.from({ length: 1_000 }, (_, index) => {
  const label = index === 0 ? 'target-a' : index === 1 ? 'target-b' : `${index % 2 ? 'odd' : 'even'} item ${index}`;
  return html`<option value=${label}>${label}</option>`;
});
const runOptions = {
  iterations: 10,
  throws: true,
  time: 500,
  warmupIterations: 5,
  warmupTime: 100
} satisfies BenchRunOptions;

describe(Combobox.metadata.tag, () => {
  let element: Combobox;
  let fixture: HTMLElement;
  let input: HTMLInputElement;
  let paritySearchIndex = 0;
  let targetSearchIndex = 0;

  const options: BenchFnOptions = {
    async beforeAll() {
      fixture = await createFixture(html`
        <nve-combobox>
          <label>Benchmark</label>
          <input type="search" />
          <datalist>${optionTemplates}</datalist>
        </nve-combobox>
      `);
      element = fixture.querySelector<Combobox>(Combobox.metadata.tag)!;
      input = fixture.querySelector<HTMLInputElement>('input')!;
      await elementIsStable(element);
    },
    afterAll() {
      removeFixture(fixture);
    }
  };

  test('filters 1,000 options to 499 matches', async ({ bench }) => {
    await bench('filters 1,000 options to 499 matches', options, async () => {
      input.value = paritySearchIndex++ % 2 ? 'even' : 'odd';
      input.dispatchEvent(new InputEvent('input', { bubbles: true }));
      await elementIsStable(element);
    }).run(runOptions);
  });

  test('filters 1,000 options to one match', async ({ bench }) => {
    await bench('filters 1,000 options to one match', options, async () => {
      input.value = targetSearchIndex++ % 2 ? 'target-a' : 'target-b';
      input.dispatchEvent(new InputEvent('input', { bubbles: true }));
      await elementIsStable(element);
    }).run(runOptions);
  });
});
