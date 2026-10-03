// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import { codeTextareaBrowser, textareaFixture } from './textarea-browser.mjs';
import { memorySnapshot } from './memory-dump.mjs';

const runs = Number(process.argv[2] ?? 3);
if (!Number.isInteger(runs) || runs < 1) throw new Error('Usage: measure-code-textarea.mjs [runs]');
const source = JSON.stringify(
  Array.from({ length: 500 }, (_, index) => ({ index, value: 'first', enabled: true })),
  null,
  2
);
const records = [];
for (let run = 0; run < runs; run++) {
  for (const plain of run % 2 ? [false, true] : [true, false]) {
    const harness = await codeTextareaBrowser();
    try {
      const page = await harness.page();
      const loaded = await memorySnapshot(harness.browser, page);
      const mounted = await textareaFixture(page, { language: 'json', text: source, plain });
      const state = await page.evaluate(async () => {
        const { element, textarea } = window.textareaFixture;
        const start = textarea.value.indexOf('first', Math.floor(textarea.value.length / 2));
        const samples = [];
        for (let index = 0; index < 6; index++) {
          const begin = performance.now();
          const insertion = index % 2 ? 'first' : 'other';
          textarea.setRangeText(insertion, start, start + 5);
          textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
          await element.updateComplete;
          const registered = performance.now();
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          samples.push({ registrationMs: registered - begin, nextPaintOpportunityMs: performance.now() - begin });
        }
        const ranges = window.textareaProbe.ranges();
        return {
          samples,
          ranges: ranges.length,
          textareaNodes: textarea.childNodes.length,
          correct:
            element.localName === 'nve-textarea' ||
            JSON.stringify(ranges) === JSON.stringify(window.textareaProbe.scan(textarea.value, 'json'))
        };
      });
      assert.equal(state.correct, true);
      assert.equal(state.textareaNodes, 1);
      const active = await memorySnapshot(harness.browser, page);
      await page.evaluate(async () => {
        window.textareaFixture.form.remove();
        window.textareaFixture = null;
        await new Promise(resolve => requestAnimationFrame(resolve));
      });
      assert.equal(await page.evaluate(() => window.textareaProbe.ranges().length), 0);
      const released = await memorySnapshot(harness.browser, page);
      records.push({
        run,
        engine: plain ? 'plain' : 'opaque',
        browser: harness.version,
        characters: source.length,
        initialRegistrationMs: mounted.registrationMs,
        ...state,
        loaded,
        active,
        released
      });
    } finally {
      await harness.close();
    }
  }
}
console.log(
  JSON.stringify(
    {
      scope:
        'Built native textarea and opaque code textarea, same loaded grammar modules, theme, six local edits; native and JS memory after GC; timing includes setRangeText and range registration, double-rAF provides a paint opportunity, not measured compositor presentation.',
      records
    },
    null,
    2
  )
);
