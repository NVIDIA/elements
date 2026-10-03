// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { category, compileGrammar, loadGrammar } from '../../../build/highlight/compile.mjs';
import { categories } from './categories.mjs';
import { createDocument, editDocument } from '../../code-textarea/internal/incremental.mjs';
import { markdownFenceProfile } from '../../../build/highlight/profiles/markdown-profile.mjs';
import { createScanner } from './scanner.mjs';
import { scriptProfile } from '../../../build/highlight/profiles/script-profile.mjs';
import { cssProfile } from '../../../build/highlight/profiles/css-profile.mjs';
import { markupProfile } from '../../../build/highlight/profiles/markup-profile.mjs';
import { bashProfile, shellProfile } from '../../../build/highlight/profiles/bash-profile.mjs';
import { compactRules } from '../../../build/highlight/optimizations/compact-rules.mjs';

const grammar = JSON.parse(
  await readFile(new URL('../../../tests/highlight/fixtures/grammar.json', import.meta.url), 'utf8')
);
const scan = createScanner(compileGrammar(grammar));

test('shares transitions with relative captures while preserving stream priority', () => {
  const source = {
    patterns: [
      {
        begin: 'BEGIN',
        end: 'END',
        patterns: [
          { match: '(x)(y)', captures: { 1: { name: 'number' }, 2: { name: 'string' } } },
          { match: '\\Gxy', name: 'keyword' }
        ]
      },
      { match: '\\Gxy', name: 'keyword' },
      { match: 'other', name: 'comment' },
      { match: '(x)(y)', captures: { 1: { name: 'number' }, 2: { name: 'string' } } }
    ]
  };
  for (const shared of [false, true]) {
    const original = compileGrammar(source, undefined, { shared });
    const before = JSON.stringify(original);
    const compact = compactRules(original);
    assert.equal(JSON.stringify(original), before);
    assert.ok(compact.rules.length < original.rules.length);
    assert.throws(() => compactRules(compact), /already compacted/);
    const text = 'xy BEGINxyEND xy other xy';
    assert.deepEqual(createScanner(compact)(text), createScanner(original)(text));
    assert.deepEqual(
      createScanner(compact)(text).map(([start, end, kind]) => [text.slice(start, end), kind]),
      [
        ['xy', 1],
        ['x', 4],
        ['y', 2],
        ['x', 4],
        ['y', 2],
        ['other', 3],
        ['x', 4],
        ['y', 2]
      ]
    );
  }
});

test('preserves zero-width progress when equivalent regions refer back to the root', () => {
  const source = {
    patterns: [
      { begin: '(?=x)', end: 'END', name: 'string', patterns: [{ include: '$base' }] },
      { match: '42', name: 'number' }
    ]
  };
  const original = compileGrammar(source, undefined, { shared: true });
  const compact = compactRules(original);
  const text = 'x tail END after\n42 END plain';
  assert.deepEqual(createScanner(compact)(text), createScanner(original)(text));
});

test('compiles includes, captures, nested regions, and dynamic end references', () => {
  const text = 'const a = { nested: { value: "hello\\\"world" } }; // comment';
  const spans = scan(text);
  const segment = (value, kind) =>
    spans.some(([start, end, category]) => text.slice(start, end) === value && category === kind);
  assert.ok(segment('const', 1));
  assert.ok(segment('{', 5));
  assert.ok(segment('\\"', 7));
  assert.ok(spans.some(([start, end, kind]) => kind === 2 && text.slice(start, end).includes('hello')));
  assert.ok(segment('// comment', 3));
  assert.ok(segment('}', 5));
});

test('uses a bounded JavaScript call stack for deep regions', () => {
  assert.ok(scan(`${'{'.repeat(5000)}42${'}'.repeat(5000)}`).some(([, , kind]) => kind === 4));
});

test('relocates numeric backreferences inside combined rule alternatives', () => {
  const backreference = {
    patterns: [
      { match: 'foo', name: 'keyword' },
      { match: '([a-z])\\1', name: 'string' }
    ]
  };
  assert.deepEqual(createScanner(compileGrammar(backreference))('foo aa'), [
    [0, 3, 1],
    [4, 6, 2]
  ]);
});

test('preserves atomic alternatives, repetition, and original capture indexes', () => {
  const atomic = createScanner(
    compileGrammar({
      patterns: [
        { match: '(?>a|ab)c', name: 'keyword' },
        { match: '(x)(?>a+)(b)\\1', captures: { 1: { name: 'keyword' }, 2: { name: 'string' } } },
        { match: '(?>a|b)+c', name: 'number' }
      ]
    })
  );
  assert.deepEqual(atomic('abc'), [[0, 3, 4]]);
  assert.deepEqual(atomic('xacx'), [[1, 3, 1]]);
  assert.deepEqual(atomic('xaabx'), [
    [0, 1, 1],
    [3, 4, 2]
  ]);
  assert.deepEqual(atomic('abababc'), [[0, 7, 4]]);
  const noBacktrack = createScanner(compileGrammar({ patterns: [{ match: '(?>a+)a', name: 'keyword' }] }));
  assert.deepEqual(noBacktrack('aaaa'), []);
  assert.throws(() => compileGrammar({ patterns: [{ match: '(?<=(?>a+))b' }] }), /inside lookbehind/);
});

test('relocates dynamic end references after an atomic begin group', () => {
  const atomic = createScanner(
    compileGrammar({
      patterns: [
        {
          begin: '(?>BEGIN)([A-Z]+)',
          end: '\\1',
          name: 'string'
        },
        { match: 'after', name: 'keyword' }
      ]
    })
  );
  assert.deepEqual(atomic('BEGINX content X after'), [
    [0, 16, 2],
    [17, 22, 1]
  ]);
});

test('adapts Unicode POSIX classes and first-position closing brackets', () => {
  const unicode = createScanner(
    compileGrammar({
      patterns: [
        { match: '[[:alpha:]_][[:alnum:]_]*', name: 'keyword' },
        { match: '[]][^]a]*', name: 'string' }
      ]
    })
  );
  assert.deepEqual(unicode('π٢ 𐐀2 ]bc'), [
    [0, 2, 1],
    [3, 6, 1],
    [7, 10, 2]
  ]);
  const upper = createScanner(compileGrammar({ patterns: [{ match: '\\p{upper}[[:upper:]]*', name: 'keyword' }] }));
  assert.deepEqual(upper('ÉΩ𐐀'), [[0, 4, 1]]);
  const point = createScanner(compileGrammar({ patterns: [{ match: '\\u{10400}', name: 'keyword' }] }));
  assert.deepEqual(point('𐐀'), [[0, 2, 1]]);
});

test('advances zero-width and delayed transitions over whole Unicode characters', () => {
  const empty = createScanner(compileGrammar({ patterns: [{ match: '(?=.)', name: 'keyword' }] }));
  assert.deepEqual(empty('𐐀x'), []);
  const delayed = createScanner(compileGrammar({ patterns: [{ begin: 'BEGIN', end: '(?!\\G)', name: 'string' }] }));
  assert.deepEqual(delayed('BEGIN𐐀x'), [[0, 7, 2]]);
});

test('compiles full TypeScript and JavaScript grammars and resumes their line states', async () => {
  for (const language of ['typescript', 'javascript']) {
    const compiled = compileGrammar(await loadGrammar(`@shikijs/langs/${language}`));
    const scanner = createScanner(compiled);
    const text = 'function getTime(): number {\n  return new Date().getTime();\n}';
    const document = createDocument(scanner, text);
    assert.ok(
      document.ranges.some(([from, to, kind]) => text.slice(from, to) === 'return' && kind === category('keyword'))
    );
    const start = text.indexOf('Date');
    const edited = editDocument(scanner, document, start, start + 4, 'Map');
    assert.deepEqual(edited.ranges, scanner(edited.text));
  }
});

test('keeps lexical script profiles nested with independent expression categories', async () => {
  for (const language of ['typescript', 'javascript']) {
    const scanner = createScanner(
      compileGrammar(scriptProfile(await loadGrammar(`@shikijs/langs/${language}`), language))
    );
    const text = 'const π = `outer ${ {value: `inner ${42}`} } end`; // comment';
    const document = createDocument(scanner, text);
    const kinds = Array(text.length).fill(0);
    for (const [start, end, kind] of document.ranges) kinds.fill(kind, start, end);
    assert.equal(kinds[text.indexOf('outer')], category('string'));
    assert.equal(kinds[text.indexOf('value')], category('meta.property-name'));
    assert.equal(kinds[text.indexOf('inner')], category('string'));
    assert.equal(kinds[text.indexOf('42')], category('number'));
    assert.equal(kinds[text.indexOf('end')], category('string'));
    assert.equal(kinds[text.indexOf('//')], category('comment'));
    const regexp = 'const re = /a[\\/]b+/gi;';
    assert.ok(
      scanner(regexp).some(
        ([from, to, kind]) => regexp.slice(from, to) === '/a[\\/]b+/gi' && kind === category('regex')
      )
    );
    const start = text.indexOf('42');
    const edited = editDocument(scanner, document, start, start + 2, '43\n + 1');
    assert.deepEqual(edited.ranges, scanner(edited.text));
  }
});

test('clears inherited category inside an explicitly embedded grammar region', () => {
  const scanner = createScanner(
    compileGrammar({
      patterns: [
        {
          begin: '`',
          end: '`',
          name: 'string',
          patterns: [
            {
              begin: '\\$\\{',
              end: '}',
              contentName: 'meta.embedded.line',
              patterns: [{ match: '42', name: 'constant.numeric' }]
            }
          ]
        }
      ]
    })
  );
  assert.deepEqual(scanner('`outer ${value 42} end`'), [
    [0, 9, 2],
    [15, 17, 4],
    [18, 23, 2]
  ]);
});

test('resolves external grammar includes and their local repositories at compile time', () => {
  const external = {
    scopeName: 'source.embedded',
    repository: { words: { patterns: [{ match: 'hello', name: 'string.quoted' }] } }
  };
  const root = {
    scopeName: 'source.root',
    patterns: [{ include: 'source.embedded#words' }]
  };
  assert.deepEqual(createScanner(compileGrammar(root, [root, external]))('hello'), [[0, 5, 2]]);
});

test('lets a nested capture override the full-match capture', () => {
  const nested = {
    patterns: [
      {
        match: '(a)(b)',
        captures: {
          0: { name: 'string.quoted' },
          2: { name: 'keyword.control' }
        }
      }
    ]
  };
  assert.deepEqual(createScanner(compileGrammar(nested))('ab'), [
    [0, 1, 2],
    [1, 2, 1]
  ]);
});

test('compiles static end priority into branch order without runtime flags', () => {
  const region = { begin: '<', end: '>', name: 'string', patterns: [{ match: '>(?=keep)', name: 'keyword' }] };
  assert.deepEqual(createScanner(compileGrammar({ patterns: [region] }))('<>keep>x'), [[0, 2, 2]]);
  assert.deepEqual(
    createScanner(compileGrammar({ patterns: [{ ...region, applyEndPatternLast: true }] }))('<>keep>x'),
    [
      [0, 1, 2],
      [1, 2, 1],
      [2, 7, 2]
    ]
  );
});

test('emits a match and pops its frame through one transition opcode', () => {
  const scanner = createScanner(
    compileGrammar({
      patterns: [
        { begin: '<', end: '>', name: 'string', patterns: [{ match: 'x', name: 'keyword', pop: true }] },
        { match: 'y', name: 'constant.numeric' }
      ]
    })
  );
  assert.deepEqual(scanner('<xy'), [
    [0, 1, 2],
    [1, 2, 1],
    [2, 3, 4]
  ]);
});

test('compiles leading \\G rules into a sticky combined expression with source order priority', () => {
  const anchored = createScanner(
    compileGrammar({
      patterns: [
        { match: '\\Gfoo', name: 'keyword' },
        { match: 'foo', name: 'string' }
      ]
    })
  );
  assert.deepEqual(anchored('foofoo'), [[0, 6, 1]]);
  assert.deepEqual(anchored(' foo'), [[1, 4, 2]]);
});

test('compiles an exact negative cursor end into a delayed scanner transition', () => {
  const source = 'package example\nafter';
  const scanner = createScanner(
    compileGrammar({
      patterns: [
        {
          begin: 'package\\s+',
          end: '(?!\\G)',
          patterns: [{ match: '\\w+', name: 'entity.name.type' }]
        },
        { match: 'after', name: 'keyword.control' }
      ]
    })
  );
  const spans = scanner(source);
  assert.ok(spans.some(([start, end, kind]) => source.slice(start, end) === 'example' && kind === 6));
  assert.ok(spans.some(([start, end, kind]) => source.slice(start, end) === 'after' && kind === 1));
});

test('splits a leading line-or-cursor anchor without losing its capture index', () => {
  const scanAnchors = createScanner(
    compileGrammar({
      patterns: [
        { match: 'x', name: 'variable.other' },
        { match: '(^|\\G)(foo)', name: 'keyword.control', captures: { 2: { name: 'string.quoted' } } }
      ]
    })
  );
  const input = 'xfoo\nfoo';
  assert.deepEqual(
    scanAnchors(input)
      .filter(([, , kind]) => kind === 2)
      .map(([start, end]) => input.slice(start, end)),
    ['foo', 'foo']
  );
});

test('adapts the TextMate line-start anchor for line-oriented scanning', () => {
  const lineStart = createScanner(compileGrammar({ patterns: [{ match: '\\Afoo', name: 'keyword' }] }));
  assert.deepEqual(lineStart('foo\nfoo'), [
    [0, 3, 1],
    [4, 7, 1]
  ]);
});

test('continues a region by line and pops it when a compiled while test fails', () => {
  const lineScan = createScanner(
    compileGrammar({
      patterns: [
        {
          begin: '^([#])',
          while: '(^|\\G)\\1',
          name: 'comment.line',
          patterns: [{ match: '[a-z]+', name: 'keyword.control' }]
        },
        { match: '^plain', name: 'string.quoted' }
      ]
    })
  );
  const input = '#first\n#second\nplain';
  const spans = lineScan(input);
  assert.ok(spans.some(([start, end, kind]) => input.slice(start, end) === 'first' && kind === 1));
  assert.ok(spans.some(([start, end, kind]) => input.slice(start, end) === 'second' && kind === 1));
  assert.ok(spans.some(([start, end, kind]) => input.slice(start, end) === 'plain' && kind === 2));
});

test('nests an externally included grammar inside a fenced region with a dynamic end', () => {
  const markdown = {
    scopeName: 'text.markdown.fixture',
    patterns: [
      {
        begin: '^(`{3,})js$',
        end: '^\\1$',
        patterns: [{ include: 'source.js.fixture#code' }]
      },
      { match: '^after$', name: 'string.quoted' }
    ]
  };
  const embedded = {
    scopeName: 'source.js.fixture',
    repository: {
      code: { patterns: [{ match: '\\bconst\\b', name: 'keyword.control' }] }
    }
  };
  const input = '```js\nconst value = 1\n```\nafter';
  const spans = createScanner(compileGrammar(markdown, [markdown, embedded]))(input);
  assert.ok(spans.some(([start, end, kind]) => input.slice(start, end) === 'const' && kind === 1));
  assert.ok(spans.some(([start, end, kind]) => input.slice(start, end) === 'after' && kind === 2));
});

test('compiles the real Markdown fallback fence rule with a dynamic cursor-aware end', async () => {
  const source = await loadGrammar('@shikijs/langs/markdown');
  const profile = {
    scopeName: 'text.markdown.profile',
    patterns: [source.repository.fenced_code_block_unknown, { match: 'after', name: 'string.quoted' }]
  };
  const scanMarkdown = createScanner(compileGrammar(profile));
  const input = '````other\ninside\n````\nafter';
  const spans = scanMarkdown(input);
  assert.ok(spans.some(([start, end, kind]) => input.slice(start, end) === 'after' && kind === 2));
  assert.ok(spans.some(([start, end, kind]) => input.slice(start, end) === '````' && kind === 5));
});

test('specializes the real Markdown JSON fence to color its first line and preserve its closing rule', async () => {
  const markdown = await loadGrammar('@shikijs/langs/markdown');
  const json = await loadGrammar('@shikijs/langs/json');
  const profile = markdownFenceProfile(markdown, ['json']);
  const scanMarkdown = createScanner(compileGrammar(profile, [profile, json]));
  const input = '````JSON\n{"first":1}\n{"second":42}\n````\nafter';
  const spans = scanMarkdown(input);
  assert.ok(spans.some(([start, end, kind]) => input.slice(start, end) === '1' && kind === 4));
  assert.ok(spans.some(([start, end, kind]) => input.slice(start, end) === '42' && kind === 4));
  assert.equal(spans.filter(([start, end, kind]) => input.slice(start, end) === '````' && kind === 5).length, 2);
  assert.equal(
    scanMarkdown('```unknown\n{"value":1}\n```').some(([, , kind]) => kind === 4),
    false
  );
  const incomplete = '```json\n{"open":"unterminated\n```\n```json\n{"next":1}\n```';
  const recovered = scanMarkdown(incomplete);
  assert.ok(recovered.some(([start, end, kind]) => incomplete.slice(start, end) === '1' && kind === 4));
});

test('compiles JSON and YAML fences with block scalar continuation', async () => {
  const markdown = await loadGrammar('@shikijs/langs/markdown');
  const json = await loadGrammar('@shikijs/langs/json');
  const yaml = await loadGrammar('@shikijs/langs/yaml');
  const profile = markdownFenceProfile(markdown, ['json', 'yaml']);
  const scanMarkdown = createScanner(compileGrammar(profile, [profile, json, yaml]));
  const source = '```yaml\nkey: |\n  first\n  second\n```\n```json\n{"n":2}\n```\n';
  const spans = scanMarkdown(source);
  assert.ok(spans.some(([start, end, kind]) => source.slice(start, end).endsWith('  first\n  second\n') && kind === 2));
  assert.ok(spans.some(([start, end, kind]) => source.slice(start, end) === 'key' && kind === 12));
  assert.ok(spans.some(([start, end, kind]) => source.slice(start, end) === '2' && kind === 4));
  for (const closing of [source.indexOf('```\n```json'), source.lastIndexOf('```')]) {
    assert.ok(spans.some(([start, end, kind]) => start === closing && end === closing + 3 && kind === 5));
  }
});

test('rechecks embedded YAML state after edits in a mixed Markdown profile', async () => {
  const markdown = await loadGrammar('@shikijs/langs/markdown');
  const json = await loadGrammar('@shikijs/langs/json');
  const yaml = await loadGrammar('@shikijs/langs/yaml');
  const profile = markdownFenceProfile(markdown, ['json', 'yaml']);
  const scanMarkdown = createScanner(compileGrammar(profile, [profile, json, yaml]));
  let document = createDocument(scanMarkdown, '```yaml\nkey: |\n  first\n  second\n```\n```json\n{"n":2}\n```\n', 4);
  const changes = [
    () => [document.text.indexOf('  second'), document.text.indexOf('  second') + 8, 'second'],
    () => [document.text.indexOf('yaml'), document.text.indexOf('yaml') + 4, 'json'],
    () => [document.text.lastIndexOf('2'), document.text.lastIndexOf('2') + 1, '42']
  ];
  for (const change of changes) {
    const [start, end, insertion] = change();
    document = editDocument(scanMarkdown, document, start, end, insertion);
    assert.deepEqual(document.ranges, createDocument(scanMarkdown, document.text).ranges);
  }
});

test('resumes a Markdown fence from a saved line state after content and boundary edits', async () => {
  const markdown = await loadGrammar('@shikijs/langs/markdown');
  const json = await loadGrammar('@shikijs/langs/json');
  const profile = markdownFenceProfile(markdown, ['json']);
  const scanMarkdown = createScanner(compileGrammar(profile, [profile, json]));
  const source = '````JSON\n{"first":1}\n{"second":42}\n````\n';
  const checkpoints = [];
  scanMarkdown(source, undefined, checkpoints);
  const content = checkpoints.find(([offset]) => offset === source.indexOf('{"second"'));
  const boundary = checkpoints.find(([offset]) => offset === source.lastIndexOf('````'));
  assert.ok(content);
  assert.ok(boundary);
  assert.equal(content[3].length, 1);
  assert.equal(checkpoints.at(-1)[0], source.length);

  const colors = (text, ranges) => {
    const output = new Uint8Array(text.length);
    for (const [start, end, kind] of ranges) output.fill(kind, start, end);
    return output;
  };
  for (const [edited, checkpoint] of [
    [source.replace('42', '987'), content],
    [source.replace('{"second":42}\n', '{"second":42}\n{"third":3}\n'), content],
    [source.replace('````\n', '~~~~\n'), boundary]
  ]) {
    const full = colors(edited, scanMarkdown(edited));
    const resumed = colors(edited, scanMarkdown(edited, checkpoint));
    assert.deepEqual(resumed.slice(checkpoint[0]), full.slice(checkpoint[0]));
  }
  assert.equal(content[3].length, 1);
  assert.throws(() => scanMarkdown(source, [1, 0, 0, []]), /line boundary/);
});

test('rechecks a while continuation on the resumed line', () => {
  const continued = createScanner(
    compileGrammar({
      patterns: [
        {
          begin: '^#',
          while: '^#',
          name: 'comment.line',
          patterns: [{ match: '[a-z]+', name: 'keyword.control' }]
        },
        { match: '^plain', name: 'string.quoted' }
      ]
    })
  );
  const source = '#first\n#second\nplain';
  const checkpoints = [];
  continued(source, undefined, checkpoints);
  const second = checkpoints[1];
  const edited = '#first\nplain\nplain';
  assert.deepEqual(
    continued(edited, second),
    continued(edited).filter(([start]) => start >= second[0])
  );
  const prior = createDocument(continued, source);
  const updated = editDocument(continued, prior, second[0], second[0] + '#second'.length, 'plain');
  assert.deepEqual(updated.ranges, createDocument(continued, edited).ranges);
});

test('reuses ranges after the Markdown line state converges', async () => {
  const markdown = await loadGrammar('@shikijs/langs/markdown');
  const json = await loadGrammar('@shikijs/langs/json');
  const profile = markdownFenceProfile(markdown, ['json']);
  const scanMarkdown = createScanner(compileGrammar(profile, [profile, json]));
  let document = createDocument(scanMarkdown, '```json\n{"first":1}\n{"second":42}\n```\nafter');
  const edits = [
    { change: () => [document.text.indexOf('42'), document.text.indexOf('42') + 2, '987'], converges: true },
    {
      change: () => [document.text.indexOf('{"second"'), document.text.indexOf('{"second"'), '{"added":3}\n'],
      converges: true
    },
    { change: () => [document.text.indexOf('json'), document.text.indexOf('json') + 4, 'unknown'], converges: true },
    {
      change: () => [document.text.indexOf('```\nafter'), document.text.indexOf('```\nafter') + 4, ''],
      converges: false
    }
  ];
  for (const { change, converges } of edits) {
    const [start, end, inserted] = change();
    const prior = document;
    const before = prior.ranges.map(range => [...range]);
    document = editDocument(scanMarkdown, document, start, end, inserted);
    const full = createDocument(scanMarkdown, document.text);
    assert.deepEqual(document.ranges, full.ranges);
    assert.deepEqual(
      document.checkpoints.map(([offset, state, category, stack]) => [offset, state, category, stack.length]),
      full.checkpoints.map(([offset, state, category, stack]) => [offset, state, category, stack.length])
    );
    assert.deepEqual(prior.ranges, before);
    assert.equal(document.reusedFrom !== null, converges);
  }
});

test('reconciles a range crossing the edited line boundary', () => {
  const scanRegion = createScanner(
    compileGrammar({ patterns: [{ begin: '^BEGIN', end: '^END', name: 'string.quoted' }] })
  );
  const document = createDocument(scanRegion, 'BEGIN\nalpha\nbeta\nEND\n');
  const start = document.text.indexOf('beta');
  const edited = editDocument(scanRegion, document, start, start + 4, 'gamma');
  assert.deepEqual(edited.ranges, createDocument(scanRegion, edited.text).ranges);
  assert.ok(edited.reusedFrom !== null);
});

test('keeps cached ranges aligned through varied sequential Markdown edits', async () => {
  const markdown = await loadGrammar('@shikijs/langs/markdown');
  const json = await loadGrammar('@shikijs/langs/json');
  const profile = markdownFenceProfile(markdown, ['json']);
  const scanMarkdown = createScanner(compileGrammar(profile, [profile, json]));
  let document = createDocument(
    scanMarkdown,
    Array.from({ length: 30 }, (_, index) => `\`\`\`json\n{"n":${index}}\n\`\`\`\n`).join('')
  );
  let seed = 1234567;
  const next = () => (seed = (Math.imul(1664525, seed) + 1013904223) >>> 0) / 4294967296;
  const pieces = ['7', '"x"', '\n', '```', '~~~~', '', ':', '{', '}'];
  const states = result =>
    result.checkpoints.map(([offset, state, category, stack]) => [offset, state, category, stack.length]);
  for (let i = 0; i < 100; i++) {
    const start = Math.floor(next() * (document.text.length + 1));
    const end = Math.min(document.text.length, start + Math.floor(next() * 4));
    const inserted = pieces[Math.floor(next() * pieces.length)];
    document = editDocument(scanMarkdown, document, start, end, inserted);
    const full = createDocument(scanMarkdown, document.text);
    assert.deepEqual(document.ranges, full.ranges);
    assert.deepEqual(states(document), states(full));
  }
});

test('keeps sparse checkpoints correct through line and fence edits', async () => {
  const markdown = await loadGrammar('@shikijs/langs/markdown');
  const json = await loadGrammar('@shikijs/langs/json');
  const profile = markdownFenceProfile(markdown, ['json']);
  const scanMarkdown = createScanner(compileGrammar(profile, [profile, json]));
  let document = createDocument(
    scanMarkdown,
    Array.from({ length: 30 }, (_, index) => `\`\`\`json\n{"n":${index}}\n\`\`\`\n`).join(''),
    8
  );
  assert.ok(document.checkpoints.length < document.text.split('\n').length / 4);
  const edits = [
    () => [document.text.indexOf('{"n":15}'), document.text.indexOf('{"n":15}') + 8, '{"n":1500}'],
    () => [document.text.indexOf('{"n":1500}'), document.text.indexOf('{"n":1500}'), 'plain\n'],
    () => [
      document.text.indexOf('```json', document.text.length / 2) + 3,
      document.text.indexOf('```json', document.text.length / 2) + 7,
      'unknown'
    ],
    () => [document.text.lastIndexOf('```\n'), document.text.lastIndexOf('```\n') + 4, '']
  ];
  for (const edit of edits) {
    const [start, end, insertion] = edit();
    document = editDocument(scanMarkdown, document, start, end, insertion);
    assert.deepEqual(document.ranges, createDocument(scanMarkdown, document.text).ranges);
    assert.equal(document.checkpointStride, 8);
    for (const [offset, , , , lineNumber] of document.checkpoints) {
      assert.equal(lineNumber, document.text.slice(0, offset).split('\n').length - 1);
    }
  }
  let seed = 271828;
  const random = () => (seed = (Math.imul(1664525, seed) + 1013904223) >>> 0) / 4294967296;
  const pieces = ['7', '"x"', '\n', '```', '', ':', '{'];
  for (let i = 0; i < 100; i++) {
    const start = Math.floor(random() * (document.text.length + 1));
    const end = Math.min(document.text.length, start + Math.floor(random() * 4));
    const insertion = pieces[Math.floor(random() * pieces.length)];
    document = editDocument(scanMarkdown, document, start, end, insertion);
    assert.deepEqual(document.ranges, createDocument(scanMarkdown, document.text).ranges);
    for (const [offset, , , , lineNumber] of document.checkpoints) {
      assert.equal(lineNumber, document.text.slice(0, offset).split('\n').length - 1);
    }
  }
  assert.throws(() => createDocument(scanMarkdown, 'text', 0), /positive integer/);
});

test('rejects embedded \\G until its cursor semantics can be preserved', () => {
  assert.throws(() => compileGrammar({ patterns: [{ match: 'foo\\Gbar' }] }), /adapter/);
});

test('folds ASCII literals and classes while rejecting escaped case-fold classes', () => {
  const caseScan = createScanner(compileGrammar({ patterns: [{ match: '(?i:json[0-9])', name: 'keyword' }] }));
  assert.deepEqual(caseScan('JSON5 json5'), [
    [0, 5, 1],
    [6, 11, 1]
  ]);
  const folded = createScanner(compileGrammar({ patterns: [{ match: '(?i)[a-fx]+', name: 'keyword' }] }));
  assert.deepEqual(folded('ABC xdf'), [
    [0, 3, 1],
    [4, 7, 1]
  ]);
  assert.throws(() => compileGrammar({ patterns: [{ match: '(?i:[\\p{Uppercase}]+)' }] }), /escaped class/);
});

test('classifies the core semantic vocabulary at compile time', () => {
  const examples = {
    keyword: 'keyword.control.js',
    string: 'string.quoted.double.js',
    comment: 'comment.line.js',
    number: 'constant.numeric.js',
    literal: 'constant.language.boolean.js',
    function: 'entity.name.function.js',
    type: 'entity.name.type.js',
    variable: 'variable.other.js',
    property: 'support.type.property-name.css',
    tag: 'entity.name.tag.html',
    attribute: 'entity.other.attribute-name.html',
    regex: 'string.regexp.js',
    meta: 'meta.directive.yaml',
    class: 'entity.name.type.class.js',
    'selector-attribute': 'meta.attribute-selector.css'
  };
  for (const [expected, scope] of Object.entries(examples)) {
    assert.equal(categories[category(scope)], expected, scope);
  }
});

test('compiles the Shiki JSON grammar and adapts its hex-digit escape', async () => {
  const input = '{"value":"\\u00AF"}';
  const shiki = createScanner(compileGrammar(await loadGrammar('@shikijs/langs/json')));
  assert.ok(shiki(input).some(([start, end, kind]) => input.slice(start, end) === '\\u00AF' && kind === 7));
});

test('lowers possessive repeats without losing local captures or atomic choice', () => {
  const scan = createScanner(
    compileGrammar({
      patterns: [
        { match: '(a|aa)++(b)\\1', captures: { 1: { name: 'keyword' }, 2: { name: 'string' } } },
        { match: '\\x20*+X', name: 'number' },
        { match: '[[:alpha:]]++Y', name: 'comment' }
      ]
    })
  );
  assert.deepEqual(scan('aaba'), [
    [1, 2, category('keyword')],
    [2, 3, category('string')]
  ]);
  assert.deepEqual(scan('  X'), [[0, 3, category('number')]]);
  // Possessive consumption must not give the final Y back to a later atom.
  assert.deepEqual(scan('abcY'), []);
  assert.deepEqual(createScanner(compileGrammar({ patterns: [{ match: 'a*+a', name: 'keyword' }] }))('aaa'), []);
});

test('adapts negative newline and compound Unicode properties without adding captures', () => {
  const scan = createScanner(
    compileGrammar({
      patterns: [
        {
          match: '(\\N)(\\p{alnum})(\\p{word})',
          captures: { 1: { name: 'keyword' }, 2: { name: 'number' }, 3: { name: 'storage.type' } }
        },
        { match: '\\P{word}', name: 'comment' }
      ]
    })
  );
  assert.deepEqual(scan('!π_'), [
    [0, 1, category('keyword')],
    [1, 2, category('number')],
    [2, 3, category('storage.type')]
  ]);
  assert.deepEqual(scan('\n'), [[0, 1, category('comment')]]);
  assert.equal(category('punctuation.definition.variable'), category('punctuation'));
});

test('nests real Python and TOML fences and recovers from an unfinished embedded string', async () => {
  const markdown = await loadGrammar('@shikijs/langs/markdown');
  const python = await loadGrammar('@shikijs/langs/python');
  const toml = await loadGrammar('@shikijs/langs/toml');
  const profile = markdownFenceProfile(markdown, ['python', 'toml']);
  const scan = createScanner(compileGrammar(profile, [profile, python, toml]));
  const text =
    '```python\ndef read():\n    return 42\nopen = """unfinished\n```\n```toml\nname = "H100"\ncount = 2\n```\nafter';
  const kinds = Array(text.length).fill(0);
  for (const [start, end, kind] of scan(text)) kinds.fill(kind, start, end);
  assert.equal(kinds[text.indexOf('def')], category('keyword'));
  assert.equal(kinds[text.indexOf('read')], category('entity.name.function'));
  assert.equal(kinds[text.indexOf('42')], category('number'));
  assert.equal(kinds[text.indexOf('name =')], category('meta.property-name'));
  assert.equal(kinds[text.indexOf('H100')], category('string'));
  assert.equal(kinds[text.indexOf('after')], 0);
  let document = createDocument(scan, text, 2);
  for (const [needle, insert] of [
    ['42', '987'],
    ['python', 'unknown'],
    ['toml', 'python'],
    ['unfinished', 'done"""']
  ]) {
    const start = document.text.indexOf(needle);
    document = editDocument(scan, document, start, start + needle.length, insert);
    assert.deepEqual(document.ranges, scan(document.text));
  }
});

test('eliminates unused captures while retaining and relocating dynamic end and while references', () => {
  const machine = compileGrammar({
    patterns: [
      {
        begin: '(unused)?(x)',
        end: '\\2',
        name: 'string',
        beginCaptures: { 2: { name: 'keyword' } }
      }
    ]
  });
  assert.equal(new RegExp(machine.states[0][0], 'gdu').exec('unusedx').length, 3);
  const text = 'unusedx body x tail';
  assert.equal(createScanner(machine)(text).at(-1)[1], text.indexOf(' tail'));
  const whileScan = createScanner(
    compileGrammar({
      patterns: [
        {
          begin: '(unused)?( +)(x)',
          while: '^\\2',
          name: 'string'
        }
      ]
    })
  );
  const continued = 'unused  x\n  inside\nafter';
  assert.equal(whileScan(continued).at(-1)[1], continued.indexOf('after'));
  const document = createDocument(whileScan, continued);
  const start = continued.indexOf('  inside');
  const edited = editDocument(whileScan, document, start, start + 2, '');
  assert.deepEqual(edited.ranges, whileScan(edited.text));
});

test('changes a region phase without growing the stack or mutating saved checkpoints', () => {
  const source = {
    patterns: [
      {
        begin: '<',
        end: '>',
        beginCaptures: { 0: { name: 'punctuation' } },
        endCaptures: { 0: { name: 'punctuation' } },
        patterns: [{ match: '\\w+', name: 'entity.other.attribute-name' }],
        endState: {
          end: '</>',
          hardEnd: true,
          name: 'string',
          endCaptures: { 0: { name: 'punctuation' } },
          patterns: [{ begin: '"', end: '"', name: 'comment' }]
        }
      }
    ]
  };
  const scan = createScanner(compileGrammar(source));
  const text = '<\nattr\n>body\n"unfinished </>after';
  const checkpoints = [];
  const ranges = scan(text, undefined, checkpoints);
  assert.equal(checkpoints[1][3].length, 1);
  assert.equal(checkpoints[3][3].length, 1);
  assert.notEqual(checkpoints[1][3][0], checkpoints[3][3][0]);
  assert.equal(checkpoints[1][3][0][2], null);
  assert.equal(checkpoints[3][3][0][2].source, new RegExp('</>').source);
  assert.equal(ranges.at(-1)[2], category('punctuation'));
  assert.equal(ranges.at(-1)[1], text.indexOf('after'));
  for (const checkpoint of checkpoints.slice(1)) {
    assert.deepEqual(
      scan(text, checkpoint),
      ranges.filter(([start]) => start >= checkpoint[0])
    );
  }
  let document = createDocument(scan, text);
  for (const [needle, insert] of [
    ['attr', 'name'],
    ['>body', '\n>changed'],
    ['unfinished', 'fixed"']
  ]) {
    const start = document.text.indexOf(needle);
    document = editDocument(scan, document, start, start + needle.length, insert);
    assert.deepEqual(document.ranges, scan(document.text));
  }
  assert.throws(() => compileGrammar({ patterns: [{ ...source.patterns[0], begin: '(<)', end: '\\1' }] }), /End-state/);
  assert.throws(
    () => compileGrammar({ patterns: [{ ...source.patterns[0], endState: { end: '\\1' } }] }),
    /missing begin capture/
  );
});

test('defers dynamic region ends through a header phase and preserves checkpoint matchers', () => {
  const grammar = {
    patterns: [
      {
        begin: '(unused)?BEGIN(LABEL|END\\.\\*)',
        end: '\\n',
        patterns: [{ match: 'LABEL|END\\.\\*', name: 'keyword' }],
        endState: {
          end: '\\2',
          name: 'string',
          hardEnd: true,
          endCaptures: { 0: { name: 'meta.directive' } },
          patterns: [{ begin: '"', end: '"', name: 'comment' }]
        }
      }
    ]
  };
  for (const options of [{}, { shared: true }, { shared: true, ascii: true }]) {
    const scan = createScanner(compileGrammar(grammar, undefined, options));
    for (const label of ['LABEL', 'END.*']) {
      const text = `unusedBEGIN${label} ${label}\nbody "unfinished ${label} tail\nafter`;
      const checkpoints = [];
      const ranges = scan(text, undefined, checkpoints);
      const kindAt = offset => ranges.find(([start, end]) => start <= offset && end > offset)?.[2] ?? 0;
      assert.equal(kindAt(text.indexOf(` ${label}`) + 1), category('keyword'));
      assert.equal(kindAt(text.indexOf('body')), category('string'));
      assert.equal(kindAt(text.indexOf('tail')), 0);
      assert.equal(kindAt(text.indexOf('after')), 0);
      assert.equal(checkpoints[1][3].length, 1);
      assert.equal(checkpoints[1][3][0][2].source, `(?:${label.replace(/[.*]/g, '\\$&')})`);
      assert.deepEqual(
        scan(text, checkpoints[1]),
        ranges.filter(([start]) => start >= checkpoints[1][0])
      );
      let document = createDocument(scan, text, 2);
      for (const [needle, insert] of [
        [label, 'LABEL'],
        ['body', 'changed\nbody'],
        ['unfinished', 'closed"']
      ]) {
        const start = document.text.indexOf(needle);
        document = editDocument(scan, document, start, start + needle.length, insert);
        assert.deepEqual(document.ranges, scan(document.text));
      }
    }
  }
});

for (const [representation, options] of [
  ['inline', {}],
  ['shared', { shared: true }],
  ['ascii', { shared: true, ascii: true }]
]) {
  test(`recovers nested markup and script regions at their enclosing Markdown fence (${representation})`, async () => {
    const css = cssProfile(await loadGrammar('@shikijs/langs/css'));
    const js = await loadGrammar('@shikijs/langs/javascript');
    const javascript = { ...scriptProfile(js, 'javascript'), scopeName: js.scopeName };
    const xml = await loadGrammar('@shikijs/langs/xml');
    const html = markupProfile(await loadGrammar('@shikijs/langs/html'), xml);
    const xmlProfile = markupProfile(xml);
    const profile = markdownFenceProfile(await loadGrammar('@shikijs/langs/markdown'), ['html', 'xml', 'css']);
    const scan = createScanner(compileGrammar(profile, [profile, html, xmlProfile, javascript, css], options));
    const text =
      '```html\n<script\n title="</script>">const x="open\n```\nafter\n```xml\n<style>p{color:RED}/*open </style><p>end</p>\n```\n```css\np{width:2rem}\n```\nfinal';
    const ranges = scan(text);
    const kinds = Array(text.length).fill(0);
    for (const [start, end, kind] of ranges) kinds.fill(kind, start, end);
    assert.equal(kinds[text.indexOf('const')], category('keyword'));
    assert.equal(kinds[text.indexOf('after')], 0);
    assert.equal(kinds[text.indexOf('end</p>')], 0);
    assert.equal(kinds[text.indexOf('width')], category('meta.property-name'));
    assert.equal(kinds[text.indexOf('final')], 0);
    let document = createDocument(scan, text, 2);
    for (const [needle, insert] of [
      ['html', 'xml'],
      ['</script>', 'value'],
      ['const x=', 'let y='],
      ['```\nafter', '```\nplain']
    ]) {
      const start = document.text.indexOf(needle);
      document = editDocument(scan, document, start, start + needle.length, insert);
      assert.deepEqual(document.ranges, scan(document.text));
    }
  });

  test(`recovers Go signature, allocation, and raw-string states at a Markdown fence (${representation})`, async () => {
    const { goProfile } = await import('../../../build/highlight/profiles/go-profile.mjs');
    const go = goProfile(await loadGrammar('@shikijs/langs/go'), 'compact');
    const profile = markdownFenceProfile(await loadGrammar('@shikijs/langs/markdown'), ['go']);
    const scan = createScanner(compileGrammar(profile, [profile, go], options));
    const text =
      '```go\nfunc Read(x Custom) Custom { return x }\nvar value = make(map[string]Custom,\n```\nafter\n```go\nvar raw = `unfinished\n```\nfinal';
    const kinds = Array(text.length).fill(0);
    for (const [start, end, kind] of scan(text)) kinds.fill(kind, start, end);
    assert.equal(kinds[text.indexOf('Read')], category('entity.name.function'));
    assert.equal(kinds[text.indexOf('Custom')], category('entity.name.type'));
    assert.equal(kinds[text.indexOf('make')], category('support.function.builtin'));
    assert.equal(kinds[text.indexOf('after')], 0);
    assert.equal(kinds[text.indexOf('unfinished')], category('string'));
    assert.equal(kinds[text.indexOf('final')], 0);
    let document = createDocument(scan, text, 2);
    for (const [needle, insertion] of [
      ['Custom', 'Other'],
      ['string', 'int'],
      ['unfinished', 'closed`'],
      ['go', 'unknown']
    ]) {
      const start = document.text.indexOf(needle);
      document = editDocument(scan, document, start, start + needle.length, insertion);
      assert.deepEqual(document.ranges, scan(document.text));
    }
  });
}

test('preserves shared ends, capture indexes, cursor anchors, and end priority', () => {
  const source = {
    patterns: [
      { begin: '(BEGIN)([A-Z]+)', end: '\\2', name: 'string' },
      { begin: 'a', end: '(?>x|xy)(z)', endCaptures: { 1: { name: 'keyword' } }, name: 'string', patterns: [] },
      {
        begin: 'b',
        end: 'END',
        applyEndPatternLast: true,
        name: 'string',
        patterns: [{ match: 'END', name: 'number' }]
      },
      { begin: 'c', end: '(?x) ', name: 'string' },
      { begin: 'd', end: '(?!\\G)', name: 'string', patterns: [{ match: '\\Gx', name: 'keyword' }] },
      { begin: 'e', while: '^  ', name: 'string', patterns: [] },
      {
        begin: '\\(',
        end: '\\)',
        beginCaptures: { 0: { name: 'punctuation' } },
        endCaptures: { 0: { name: 'punctuation' } },
        patterns: [{ include: '$self' }]
      }
    ]
  };
  const inline = createScanner(compileGrammar(source));
  const machine = compileGrammar(source, undefined, { shared: true });
  const shared = createScanner(machine);
  for (const text of [
    'BEGINLABEL body LABEL tail',
    'axz tail',
    'axyz tail',
    'bEND END tail',
    'cx tail',
    'dxz',
    'e\n  yes\nafter',
    '(axz)(dxz)'
  ]) {
    assert.deepEqual(shared(text), inline(text), text);
  }
  assert.ok(machine.rules.some(rule => typeof rule[4] === 'number'));
  assert.ok(machine.states.every(state => typeof state[0] === 'number'));
  assert.ok(shared('axz').some(([a, b, kind]) => a === 2 && b === 3 && kind === category('keyword')));
});

test('restricts Unicode properties to ASCII exactly, with Unicode line fallback', async () => {
  const { asciiRegex } = await import('../../../build/highlight/adapters/ascii-regex.mjs');
  const patterns = [
    '\\p{L}',
    '\\P{L}',
    '[^\\P{L}]',
    '[_\\p{L}\\p{Nd}]',
    '\\p{White_Space}',
    '\\P{ASCII}',
    '\\p{Script=Han}*',
    '[^\\p{Script=Han}]',
    '\\p{Emoji}',
    '😀?\\p{L}',
    '\\u{1F600}?\\p{L}',
    '\\uD83D\\uDE00?\\p{L}',
    '[\\P{L}\\p{Nd}]',
    String.raw`\\p\{L\}`
  ];
  for (const source of patterns) {
    const original = new RegExp(source, 'du');
    const restricted = new RegExp(asciiRegex(source), 'du');
    for (let code = 0; code < 128; code++) {
      const text = String.fromCharCode(code);
      assert.deepEqual(restricted.exec(text)?.indices, original.exec(text)?.indices, `${source}: ${code}`);
    }
  }
  const grammar = {
    patterns: [
      { match: '([_\\p{L}][_\\p{L}\\p{Nd}]*)', captures: { 1: { name: 'variable' } } },
      { match: '\\p{Nd}+', name: 'number' },
      { begin: '"', end: '"', name: 'string' }
    ]
  };
  const inline = createScanner(compileGrammar(grammar));
  const machine = compileGrammar(grammar, undefined, { shared: true, ascii: true });
  assert.ok(machine.expressions.some(entry => entry[2]));
  const scan = createScanner(machine);
  let document = createDocument(scan, 'value42 = 42\nπ42 = ４２\n"emoji😀"\n尾 = 3\n');
  assert.deepEqual(document.ranges, inline(document.text));
  for (const [needle, insert] of [
    ['π42', 'plain'],
    ['value42', '名前42'],
    ['尾', 'tail'],
    ['😀', 'ASCII']
  ]) {
    const start = document.text.indexOf(needle);
    document = editDocument(scan, document, start, start + needle.length, insert);
    assert.deepEqual(document.ranges, inline(document.text));
  }
});

test('retains root end transitions in shared machines', () => {
  const grammar = { end: 'END', endCaptures: { 0: { name: 'keyword' } }, patterns: [] };
  const inline = createScanner(compileGrammar(grammar));
  const shared = createScanner(compileGrammar(grammar, undefined, { shared: true }));
  assert.deepEqual(shared('before END after'), inline('before END after'));
  assert.equal(shared('END')[0][2], category('keyword'));
});

test('nests Bash heredocs and shell transcripts under resumable Markdown boundaries', async () => {
  const bash = bashProfile(await loadGrammar('@shikijs/langs/bash'));
  const shell = shellProfile(await loadGrammar('@shikijs/langs/shellsession'));
  const profile = markdownFenceProfile(await loadGrammar('@shikijs/langs/markdown'), ['bash', 'shell']);
  const text =
    '```bash\ncat <<END.* | cat\n$USER $(echo "unfinished\n```\nafter\n```shell\n$ echo "$USER" \\\n "continued"\noutput\n```\nfinal';
  const baseline = createScanner(compileGrammar(profile, [profile, bash, shell]));
  for (const options of [{}, { shared: true }, { shared: true, ascii: true }]) {
    const scan = createScanner(compileGrammar(profile, [profile, bash, shell], options));
    const ranges = scan(text);
    assert.deepEqual(ranges, baseline(text));
    const kinds = Array(text.length).fill('');
    for (const [start, end, kind] of ranges) kinds.fill(categories[kind], start, end);
    for (const [needle, expected] of [
      ['cat <<', 'builtin'],
      ['$USER', 'variable'],
      ['after', ''],
      ['$ echo', 'meta'],
      ['continued', 'string'],
      ['output', ''],
      ['final', '']
    ]) {
      assert.equal(kinds[text.indexOf(needle)], expected, needle);
    }
    const checkpoints = [];
    scan(text, undefined, checkpoints);
    for (const checkpoint of checkpoints.slice(1)) {
      assert.deepEqual(
        scan(text, checkpoint),
        ranges.filter(([start]) => start >= checkpoint[0])
      );
    }
    let document = createDocument(scan, text, 2);
    for (const [needle, insert] of [
      ['END.*', 'EOF'],
      ['bash', 'shell'],
      ['shell', 'unknown'],
      ['unfinished', 'closed"'],
      ['\\\n', '\n']
    ]) {
      const start = document.text.indexOf(needle);
      if (start < 0) continue;
      document = editDocument(scan, document, start, start + needle.length, insert);
      assert.deepEqual(document.ranges, baseline(document.text));
    }
  }
});

test('keeps first-line rules absolute through checkpoints and appends', () => {
  const grammar = {
    firstPatterns: [{ begin: '\\A(-{3})', end: '^\\1$', name: 'string' }],
    patterns: [{ match: 'true', name: 'constant.language' }]
  };
  for (const options of [{}, { shared: true }]) {
    const scan = createScanner(compileGrammar(grammar, undefined, options));
    assert.ok(scan('---\nbody\n---\ntrue').some(([, , kind]) => kind === category('string')));
    assert.equal(
      scan('\n---\nbody\n---\ntrue').some(([, , kind]) => kind === category('string')),
      false
    );
    let document = createDocument(scan, '\n', 2);
    document = editDocument(scan, document, 1, 1, '---\nbody\n---\ntrue');
    assert.deepEqual(document.ranges, scan(document.text));
    assert.equal(
      document.ranges.some(([, , kind]) => kind === category('string')),
      false
    );
    const checkpoints = [];
    const text = '---\nbody\n---\n---\nafter';
    const ranges = scan(text, undefined, checkpoints);
    for (const checkpoint of checkpoints.slice(1)) {
      assert.deepEqual(
        scan(text, checkpoint),
        ranges
          .filter(([, end]) => end > checkpoint[0])
          .map(([start, end, kind]) => [Math.max(start, checkpoint[0]), end, kind])
      );
    }
  }
});

test('keeps continuation prefixes in their parent category and applies shared captures', () => {
  const scan = createScanner(
    compileGrammar({
      patterns: [
        {
          begin: '(P)',
          while: '^(>)( )',
          captures: { 1: { name: 'punctuation' } },
          name: 'comment',
          patterns: [{ begin: '"', end: '"', name: 'string' }]
        }
      ]
    })
  );
  const text = 'P"open\n> still string\n> closed" after\nplain';
  const kinds = Array(text.length).fill('');
  for (const [start, end, kind] of scan(text)) kinds.fill(categories[kind], start, end);
  for (const match of text.matchAll(/> /g)) {
    assert.equal(kinds[match.index], 'punctuation');
    assert.equal(kinds[match.index + 1], 'comment');
    assert.equal(kinds[match.index + 2], 'string');
  }
  assert.equal(kinds[text.indexOf('plain')], '');
});

test('groups instantiated end backreferences before native repetition', () => {
  const scan = createScanner(compileGrammar({ patterns: [{ begin: '(XY)', end: '\\1+', name: 'string' }] }));
  const text = 'XYbodyXYXYtail';
  assert.equal(scan(text).at(-1)[1], text.indexOf('tail'));
});

test('does not classify structural list scopes as numbers', () => {
  assert.equal(category('markup.list.unnumbered.markdown'), 0);
  assert.equal(category('markup.list.numbered.markdown'), 0);
  assert.equal(category('constant.numeric.hex'), category('number'));
});
