// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, test } from 'vitest';
import type { BenchFnOptions, BenchRunOptions } from 'vitest';
import { elementIsStable } from '@internals/testing';
import { Textarea } from '@nvidia-elements/core/textarea';
import '@nvidia-elements/core/textarea/define.js';
import { CodeTextarea } from './code-textarea.js';
import '../languages/json.js';
import '../languages/markdown.js';
import './define.js';

const options = {
  throws: true,
  iterations: 10,
  time: 500,
  warmupIterations: 5,
  warmupTime: 100
} satisfies BenchRunOptions;

const jsonRecordCount = 500;
const markdownSectionCount = 50;
const workloads = [
  {
    language: 'json' as const,
    label: `${jsonRecordCount}-record JSON document`,
    text: JSON.stringify(
      Array.from({ length: jsonRecordCount }, (_, index) => ({ index, value: 'first', enabled: true })),
      null,
      2
    )
  },
  {
    language: 'markdown' as const,
    label: `${markdownSectionCount}-section Markdown document`,
    text: '# Title\n\n~~~typescript\nconst first = "value";\n~~~\n\n> quoted **text**\n\n'.repeat(markdownSectionCount)
  }
];

describe(CodeTextarea.metadata.tag, () => {
  for (const workload of workloads) {
    for (const mode of ['plain', 'incremental', 'rebuild']) {
      const label = `edits text in a ${workload.label} (${mode})`;
      test(label, async ({ bench }) => {
        let element: Textarea | CodeTextarea;
        let textarea: HTMLTextAreaElement;
        let edit: number;
        let forward = true;
        const setup: BenchFnOptions = {
          async beforeAll() {
            if (!('createValueRange' in HTMLTextAreaElement.prototype)) {
              throw new Error('Benchmark requires native opaque ranges');
            }
            element = mode === 'plain' ? new Textarea() : new CodeTextarea();
            if (element instanceof CodeTextarea) element.language = workload.language;
            textarea = document.createElement('textarea');
            textarea.value = workload.text;
            textarea.rows = 8;
            element.append(textarea);
            document.body.append(element);
            await elementIsStable(element);
            edit = workload.text.indexOf('first', Math.floor(workload.text.length / 2));
            if (edit < 0) throw new Error('Missing edit location');
          },
          afterAll() {
            element.remove();
          }
        };
        await bench(label, setup, async () => {
          const insertion = forward ? 'other' : 'first';
          forward = !forward;
          textarea.setRangeText(insertion, edit, edit + 5);
          textarea.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: insertion }));
          if (mode === 'rebuild' && element instanceof CodeTextarea) element.refreshHighlighting();
          await elementIsStable(element);
          // Include any pending layout in every benchmark mode.
          return textarea.offsetHeight;
        }).run(options);
      });
    }
  }
});
