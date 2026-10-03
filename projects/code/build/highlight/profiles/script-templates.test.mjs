// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import test from 'node:test';
import { loadScript } from '../loaders/load-script.mjs';
import { compileGrammar } from '../compile.mjs';
import { createScanner } from '../../../src/internal/highlight/scanner.mjs';
import { categories } from '../../../src/internal/highlight/categories.mjs';
import { createDocument, editDocument } from '../../../src/code-textarea/internal/incremental.mjs';
import { guardTemplateRegex } from './script-templates.mjs';
import { adaptRegex } from '../adapters/regex-adapter.mjs';
import { loadMarkdown } from '../loaders/load-markdown.mjs';

const cases = [
  {
    name: 'quoted attributes suspend markup through nested expressions',
    text: 'const view = html`<div class="before ${ {value: `nested ${42}`} } after" data-x=${true}>text</div>`; const tail = 9;',
    checks: [
      ['div', 'tag'],
      ['class', 'attribute'],
      ['before ', 'string'],
      ['value:', 'property', 5],
      ['nested ', 'string'],
      ['42', 'number'],
      [' after"', 'string'],
      ['data-x', 'attribute'],
      ['true', 'literal'],
      ['9', 'number']
    ]
  },
  {
    name: 'unquoted values cannot swallow interpolation',
    text: 'const view = html`<a href=prefix${42}suffix title="${false}tail">done</a>`;',
    checks: [
      ['href', 'attribute'],
      ['prefix', 'string'],
      ['42', 'number'],
      ['suffix', 'string'],
      ['false', 'literal'],
      ['tail"', 'string']
    ]
  },
  {
    name: 'CSS strings and functions resume after interpolation',
    text: 'const style = css`div { content: "before${ {x: 42}.x }after"; width: calc(${42} + 2px); color: ${true ? "red" : "blue"}; }`;',
    checks: [
      ['div', 'tag'],
      ['content', 'property'],
      ['before', 'string'],
      ['x:', 'property', 1],
      ['42', 'number'],
      ['after', 'string'],
      ['width', 'property'],
      ['calc', 'function'],
      ['2', 'number'],
      ['color', 'property'],
      ['true', 'literal']
    ]
  },
  {
    name: 'nested tagged templates keep independent embedded stacks',
    text: 'const view = html`<p title="outer ${css`a { content: "inner ${42} tail"; }`} after">end</p>`;',
    checks: [
      ['p ', 'tag', 1],
      ['title', 'attribute'],
      ['outer ', 'string'],
      ['content', 'property'],
      ['inner ', 'string'],
      ['42', 'number'],
      [' tail', 'string'],
      [' after', 'string']
    ]
  },
  {
    name: 'outer backticks recover unfinished embedded regions',
    text: 'const a = html`<div title="unfinished`; const b = css`a { content: "unfinished`; const tail = 42;',
    checks: [
      ['unfinished', 'string'],
      ['const b', 'keyword', 5],
      ['content', 'property'],
      ['const tail', 'keyword', 5],
      ['42', 'number']
    ]
  },
  {
    name: 'outer escapes protect delimiters inside embedded strings',
    text: String.raw`const a = html` + '`<p title="one \\` two \\${plain} ${42} three">end</p>`;',
    checks: [
      ['one ', 'string'],
      ['\\`', 'escape'],
      ['\\$', 'escape'],
      ['42', 'number'],
      [' three', 'string']
    ]
  },
  {
    name: 'HTML script and style boundaries stay dormant inside interpolation',
    text: 'const view = html`<script>const v = ${"</script>"}; const n = 42;</script><style>a { content: ${"</style>"}; color: red; }</style>`;',
    checks: [
      ['const v', 'keyword', 5],
      ['"</script>"', 'string'],
      ['const n', 'keyword', 5],
      ['42', 'number'],
      ['content', 'property'],
      ['"</style>"', 'string'],
      ['color', 'property'],
      ['red', 'literal']
    ]
  },
  {
    name: 'multiline interpolation preserves an open attribute and comment',
    text: 'const view = html`<p title="before ${\n {value: 42, nested: html`<i>${false}</i>`}\n} after">end</p>`;\nconst style = css`a { /* before ${\n42\n} after */ color: red; }`;',
    checks: [
      ['title', 'attribute'],
      ['value:', 'property', 5],
      ['42', 'number'],
      ['i>', 'tag', 1],
      ['false', 'literal'],
      [' after"', 'string'],
      ['/* before ', 'comment'],
      ['color', 'property']
    ]
  }
];

test('guards repeated consuming atoms without changing capture indexes', () => {
  const source = guardTemplateRegex('([^"\\\\]+)(\\$)?');
  const regex = new RegExp(source, 'dgu');
  const match = regex.exec('before${42}after');
  assert.equal(match[0], 'before');
  assert.equal(match[1], 'before');
  assert.equal(match[2], undefined);
  assert.deepEqual(match.indices[1], [0, 6]);
  assert.equal(new RegExp(adaptRegex(guardTemplateRegex('[[:alpha:]]+')).source, 'u').test('Alpha'), true);
});

for (const language of ['javascript', 'typescript']) {
  const { grammar, related } = await loadScript(language);
  const machines = [
    compileGrammar(grammar, related),
    compileGrammar(grammar, related, { shared: true }),
    compileGrammar(grammar, related, { shared: true, compact: true }),
    compileGrammar(grammar, related, { shared: true, ascii: true }),
    compileGrammar(grammar, related, { shared: true, compact: true, ascii: true })
  ];
  const scanners = machines.map(createScanner);
  for (const sample of cases) {
    test(`${language}: ${sample.name}`, () => {
      const expected = scanners[0](sample.text);
      const kinds = Array(sample.text.length).fill('');
      for (const [start, end, kind] of expected) kinds.fill(categories[kind], start, end);
      for (const [needle, kind, length = needle.length] of sample.checks) {
        const start = sample.text.indexOf(needle);
        assert.ok(start >= 0, needle);
        assert.deepEqual(kinds.slice(start, start + length), Array(length).fill(kind), needle);
      }
      for (const scan of scanners) {
        const checkpoints = [];
        assert.deepEqual(scan(sample.text, undefined, checkpoints), expected);
        for (const checkpoint of checkpoints) {
          assert.deepEqual(
            scan(sample.text, checkpoint),
            expected
              .filter(([, end]) => end > checkpoint[0])
              .map(([start, end, kind]) => [Math.max(start, checkpoint[0]), end, kind])
          );
        }
        let document = createDocument(scan, sample.text, 1);
        for (const [needle, insertion] of [
          ['42', '987'],
          ['${', '\n${'],
          ['"', ''],
          ['`', ''],
          ['}', '}\n']
        ]) {
          const start = document.text.indexOf(needle);
          if (start < 0) continue;
          document = editDocument(scan, document, start, start + needle.length, insertion);
          assert.deepEqual(document.ranges, scan(document.text));
        }
      }
    });
  }
}

test('Markdown closes fences around unfinished tagged-template states', async () => {
  const { grammar, related, languages } = await loadMarkdown(['typescript'], true);
  assert.ok(['javascript', 'html', 'xml', 'css', 'typescript'].every(language => languages.includes(language)));
  const scan = createScanner(compileGrammar(grammar, related, { shared: true, compact: true }));
  const text =
    '```typescript\nconst view = html`<p title="before ${\n42\n} after">end</p>`;\n```\n# tail\n```javascript\nconst open = css`a { content: "unfinished\n```\n# recovered\n';
  const kinds = Array(text.length).fill('');
  for (const [start, end, kind] of scan(text)) kinds.fill(categories[kind], start, end);
  for (const [needle, expected] of [
    ['title', 'attribute'],
    ['42', 'number'],
    ['# tail', 'keyword'],
    ['# recovered', 'keyword']
  ]) {
    const start = text.indexOf(needle);
    assert.deepEqual(kinds.slice(start, start + needle.length), Array(needle.length).fill(expected), needle);
  }
  let document = createDocument(scan, text, 1);
  const start = text.indexOf('42');
  document = editDocument(scan, document, start, start + 2, 'html`<i>${true}</i>`');
  assert.deepEqual(document.ranges, scan(document.text));
});

test('deep tagged-template nesting uses the explicit stack and resumes its state', async () => {
  const { grammar, related } = await loadScript();
  const scan = createScanner(compileGrammar(grammar, related, { shared: true, compact: true }));
  const text = 'html`<p title="${'.repeat(512) + '\n42\n' + '}">end</p>`'.repeat(512);
  const checkpoints = [];
  const expected = scan(text, undefined, checkpoints);
  assert.ok(checkpoints[1][3].length > 1500);
  assert.deepEqual(
    scan(text, checkpoints[1]),
    expected
      .filter(([, end]) => end > checkpoints[1][0])
      .map(([start, end, kind]) => [Math.max(start, checkpoints[1][0]), end, kind])
  );
  const offset = text.indexOf('42');
  assert.ok(
    expected.some(([start, end, kind]) => start <= offset && end >= offset + 2 && categories[kind] === 'number')
  );
});
