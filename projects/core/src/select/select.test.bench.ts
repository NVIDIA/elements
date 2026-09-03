// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import type { BenchFnOptions, BenchRunOptions } from 'vitest';
import { describe, test } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Select } from '@nvidia-elements/core/select';
import '@nvidia-elements/core/select/define.js';

const optionCount = 1_000;
const optionTemplates = Array.from(
  { length: optionCount },
  (_, index) => html`<option value=${`option-${index}`}>Option ${index}</option>`
);
const runOptions = {
  iterations: 10,
  throws: true,
  time: 500,
  warmupIterations: 5,
  warmupTime: 100
} satisfies BenchRunOptions;

describe(Select.metadata.tag, () => {
  let element: Select;
  let fixture: HTMLElement;
  let selectedIndex = 0;
  let select: HTMLSelectElement;

  const options: BenchFnOptions = {
    async beforeAll() {
      fixture = await createFixture(html`
        <nve-select>
          <label>Benchmark</label>
          <select>${optionTemplates}</select>
        </nve-select>
      `);
      element = fixture.querySelector<Select>(Select.metadata.tag)!;
      select = fixture.querySelector<HTMLSelectElement>('select')!;
      await elementIsStable(element);
    },
    afterAll() {
      removeFixture(fixture);
    }
  };

  test('synchronizes a value change across 1,000 options', async ({ bench }) => {
    await bench('synchronizes a value change across 1,000 options', options, async () => {
      select.value = `option-${selectedIndex++ % optionCount}`;
      await elementIsStable(element);
    }).run(runOptions);
  });
});
