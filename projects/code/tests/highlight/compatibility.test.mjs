// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import test from 'node:test';
import { goProfile } from '../../build/highlight/profiles/go-profile.mjs';
import { bashProfile, shellProfile } from '../../build/highlight/profiles/bash-profile.mjs';
import { bashCases, shellCases } from './fixtures/bash-corpus.mjs';
import { cssProfile } from '../../build/highlight/profiles/css-profile.mjs';
import { markupProfile } from '../../build/highlight/profiles/markup-profile.mjs';
import { compileGrammar, loadGrammar } from '../../build/highlight/compile.mjs';
import { categories } from '../../src/internal/highlight/categories.mjs';
import { scriptCases, yamlCases, tomlCases, pythonCases, cssCases, markupCases, goCases } from './fixtures/corpus.mjs';
import { createDocument, editDocument } from '../../src/code-textarea/internal/incremental.mjs';
import { createScanner } from '../../src/internal/highlight/scanner.mjs';
import { pythonProfile } from '../../build/highlight/profiles/python-profile.mjs';
import { scriptProfile } from '../../build/highlight/profiles/script-profile.mjs';
import { compactRules } from '../../build/highlight/optimizations/compact-rules.mjs';

const scanners = {};
const compactScanners = {};
function addScanner(language, machine) {
  scanners[language] = createScanner(machine);
  compactScanners[language] = createScanner(compactRules(machine));
}
for (const language of ['javascript', 'typescript', 'tsx', 'yaml', 'toml', 'python']) {
  const grammar = await loadGrammar(`@shikijs/langs/${language}`);
  addScanner(
    language,
    compileGrammar(
      ['javascript', 'typescript', 'tsx'].includes(language)
        ? scriptProfile(grammar, language)
        : language === 'python'
          ? pythonProfile(grammar, true)
          : grammar
    )
  );
}

const css = cssProfile(await loadGrammar('@shikijs/langs/css'));
const javascriptSource = await loadGrammar('@shikijs/langs/javascript');
const javascriptProfile = { ...scriptProfile(javascriptSource, 'javascript'), scopeName: javascriptSource.scopeName };
const xml = await loadGrammar('@shikijs/langs/xml');
const bash = bashProfile(await loadGrammar('@shikijs/langs/bash'));
const shell = shellProfile(await loadGrammar('@shikijs/langs/shellsession'));
addScanner('bash', compileGrammar(bash));
addScanner('shell', compileGrammar(shell, [shell, bash]));
addScanner('go', compileGrammar(goProfile(await loadGrammar('@shikijs/langs/go'), 'compact')));
addScanner('css', compileGrammar(css));
for (const language of ['html', 'xml']) {
  const source = language === 'xml' ? xml : await loadGrammar('@shikijs/langs/html');
  const profile = markupProfile(source, xml);
  addScanner(language, compileGrammar(profile, [profile, javascriptProfile, css]));
}

for (const sample of [
  ...scriptCases,
  ...yamlCases,
  ...tomlCases,
  ...pythonCases,
  ...cssCases,
  ...markupCases,
  ...goCases,
  ...bashCases,
  ...shellCases
]) {
  test(`${sample.name} produces ordered semantic ranges`, () => {
    assert.deepEqual(compactScanners[sample.language](sample.text), scanners[sample.language](sample.text));
    let previousEnd = 0;
    for (const [start, end, kind] of scanners[sample.language](sample.text)) {
      assert.ok(start >= previousEnd && end > start && end <= sample.text.length);
      assert.ok(categories[kind], `Unknown category ${kind}`);
      previousEnd = end;
    }
  });
  test(`${sample.name} keeps incremental and full ranges identical`, () => {
    const scan = scanners[sample.language];
    let document = createDocument(scan, sample.text, 2);
    let seed = 314159;
    const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
    const pieces = ['\n', '}', '"', '`', '42', '/*', '', '# comment'];
    for (let i = 0; i < 30; i++) {
      const start = Math.floor(random() * (document.text.length + 1));
      const end = Math.min(document.text.length, start + Math.floor(random() * 3));
      document = editDocument(scan, document, start, end, pieces[Math.floor(random() * pieces.length)]);
      assert.deepEqual(document.ranges, scan(document.text));
    }
  });
  test(`${sample.name} keeps compacted edits and checkpoint resumes identical`, () => {
    const scan = compactScanners[sample.language];
    const checkpoints = [];
    const expected = scanners[sample.language](sample.text);
    assert.deepEqual(scan(sample.text, undefined, checkpoints), expected);
    for (const checkpoint of checkpoints) {
      assert.deepEqual(
        scan(sample.text, checkpoint),
        expected
          .filter(([, end]) => end > checkpoint[0])
          .map(([start, end, kind]) => [Math.max(start, checkpoint[0]), end, kind])
      );
    }
    let document = createDocument(scan, sample.text, 2);
    let seed = 271828;
    const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
    const pieces = ['\n', '}', '"', '`', '42', '/*', '', '# comment'];
    for (let i = 0; i < 30; i++) {
      const start = Math.floor(random() * (document.text.length + 1));
      const end = Math.min(document.text.length, start + Math.floor(random() * 3));
      document = editDocument(scan, document, start, end, pieces[Math.floor(random() * pieces.length)]);
      assert.deepEqual(document.ranges, scanners[sample.language](document.text));
    }
  });
}

test('rejects reachable nested captures, injections, and dynamic end priority overrides', () => {
  assert.throws(
    () => compileGrammar({ patterns: [{ match: '(x)', captures: { 1: { patterns: [{ match: 'x' }] } } }] }),
    /Nested capture/
  );
  assert.throws(() => compileGrammar({ injectionSelector: 'L:source', patterns: [] }), /Injection/);
  assert.throws(
    () => compileGrammar({ patterns: [{ begin: '(x)', end: '\\1', applyEndPatternLast: true }] }),
    /end priority/
  );
  // Unreachable repository entries do not add browser machinery or block compilation.
  assert.doesNotThrow(() =>
    compileGrammar({ patterns: [], repository: { unused: { match: '(x)', captures: { 1: { patterns: [] } } } } })
  );
});

test('lowers YAML scalar capture parsing without mutating the established source', async () => {
  const grammar = await loadGrammar('@shikijs/langs/yaml');
  const before = JSON.stringify(grammar);
  compileGrammar(grammar);
  assert.equal(JSON.stringify(grammar), before);
  assert.ok(grammar.repository['block-scalar'].beginCaptures[5].patterns);
});

// Expectations name language concepts directly; they do not depend on a second
// highlighter's scope choices or on colors shared by several categories.
const semantics = [
  [
    'Declarations and builtins',
    [
      ['interface', 'keyword'],
      ['Person', 'type'],
      ['Pair', 'type'],
      ['string', 'type'],
      ['boolean', 'type'],
      ['true', 'literal'],
      ['PersonImpl', 'class'],
      ['Map', 'builtin']
    ]
  ],
  [
    'Substitution vocabulary and inherited colors',
    [
      ['const', 'keyword'],
      ['console', 'variable'],
      ['value', ''],
      ['Date', 'builtin'],
      ['class', 'property'],
      ['1', 'number']
    ]
  ],
  [
    'Arrow and async functions',
    [
      ['string =>', 'type', 6],
      ['Hello', 'string'],
      ['name}', '', 4],
      ['read', 'function'],
      ['await', 'keyword']
    ]
  ],
  [
    'Decorators and types',
    [
      ['@sealed', 'meta'],
      ['Service', 'class'],
      ['string', 'type'],
      ['private', 'keyword'],
      ['0', 'number']
    ]
  ],
  [
    'Regex division and properties',
    [
      ['/a[\\/]b+/gi', 'regex'],
      [' / right', '', 3],
      ['const;', 'property', 5],
      ['2', 'number']
    ]
  ],
  [
    'Documentation parameters and multiline types',
    [
      ['Array<', 'type'],
      ['string>', 'type'],
      ['name -', 'variable', 4],
      ['value -', 'variable', 5],
      ['description', 'comment']
    ]
  ],
  [
    'Template nesting',
    [
      ['outer', 'string'],
      ['x:', 'property', 1],
      ['inner', 'string'],
      ['42', 'number'],
      ['tail', 'string']
    ]
  ],
  [
    'Unfinished regions',
    [
      ['open', 'string'],
      ['partial', 'string'],
      ['// still', 'comment'],
      ['42', 'number']
    ]
  ],
  [
    'Tagged templates',
    [
      ['<div', 'string'],
      ['value}', '', 5],
      ['color: red', 'string']
    ]
  ],
  [
    'YAML scalar headers',
    [
      ['|', 'string'],
      ['2-', 'number', 1],
      ['# comment', 'comment'],
      ['first', 'string'],
      ['true', 'literal'],
      ['words', 'string']
    ]
  ],
  [
    'YAML values and Unicode comments',
    [
      ['name:', 'property', 4],
      ['42', 'number'],
      ['# π', 'comment'],
      ['&', 'meta'],
      ['&base', 'variable', 5, 1],
      ['*base', 'variable', 5, 1]
    ]
  ],
  [
    'TOML sections and inline values',
    [
      ['test', 'meta'],
      ['na', 'property'],
      ['\\u006d', 'escape'],
      ['part', 'property'],
      ['42', 'number'],
      ['true', 'literal'],
      ['products', 'meta'],
      ['# note', 'comment']
    ]
  ],
  [
    'TOML multiline strings and arrays',
    [
      ['first', 'string'],
      ['second', 'string'],
      ['\\n', 'escape'],
      ['# item', 'comment'],
      ['count', 'property'],
      ['\\q', 'invalid'],
      ['false', 'literal']
    ]
  ],
  [
    'TOML quoted keys and dates',
    [
      ['literal.key', 'property'],
      ['1979-05-27T07:32:00Z', 'literal'],
      ['with=equals', 'property'],
      ['0xFF', 'number'],
      ['\\q', 'invalid']
    ]
  ],
  [
    'Python declarations and interpolated strings',
    [
      ['def', 'keyword'],
      ['read', 'function'],
      ['name:', 'variable', 4],
      ['str', 'type'],
      ['hello', 'string'],
      ['name.upper', 'variable', 4],
      ['{name', 'punctuation', 1],
      ['42', 'number'],
      ['return', 'keyword'],
      ['# comment', 'comment'],
      ['Reader', 'class']
    ]
  ],
  [
    'Python raw and multiline strings',
    [
      ['[a-z]+', 'string'],
      ['\\d', 'string'],
      ['first', 'string'],
      ['second', 'string'],
      ['42', 'number'],
      ['# type', 'comment']
    ]
  ],
  [
    'Python line continuation and unfinished strings',
    [
      ['first', 'string'],
      ['second', 'string'],
      ['True', 'literal'],
      ['42', 'number'],
      ['# still', 'string']
    ]
  ],
  [
    'CSS selectors and nested values',
    [
      ['/* theme */', 'comment'],
      ['nve-card', 'tag'],
      ['#main', 'selector'],
      ['.item', 'selector'],
      ['href', 'attribute'],
      ['https', 'string'],
      ['--size:', 'property', 6],
      ['2', 'number'],
      ['RED', 'literal'],
      ['calc', 'function'],
      ['--size)', 'variable', 6],
      ['icons/a', 'string']
    ]
  ],
  [
    'CSS at rules and nesting',
    [
      ['@media', 'keyword'],
      ['screen', 'literal'],
      ['min-width', 'property'],
      ['article', 'tag'],
      [':has', 'selector'],
      ['content', 'property'],
      ['"{"', 'string'],
      ['padding', 'property'],
      ['50', 'number'],
      ['display', 'property']
    ]
  ],
  [
    'CSS continuation and Unicode selectors',
    [
      ['.π', 'selector'],
      ['.emoji😀', 'selector'],
      ['data-kind', 'attribute'],
      ['fast', 'string'],
      ['first', 'string'],
      ['second', 'string'],
      ['--config', 'property'],
      ['42', 'number'],
      ['ff00ff', 'literal']
    ]
  ],
  [
    'HTML attributes and entities',
    [
      ['DOCTYPE', 'keyword'],
      ['nve-card', 'tag'],
      ['disabled', 'attribute'],
      ['data-name', 'attribute'],
      ['H100', 'string'],
      ['&amp;', 'escape'],
      ['hello', 'string'],
      ['comment', 'comment'],
      ['svg:path', 'tag'],
      ['ns:attr', 'attribute']
    ]
  ],
  [
    'XML declarations and CDATA',
    [
      ['xml', 'tag'],
      ['version', 'attribute'],
      ['1.0', 'string'],
      ['ENTITY', 'keyword'],
      ['note', 'comment'],
      ['ns:root', 'tag'],
      ['&name;', 'escape'],
      ['π', 'tag'],
      ['<raw>', 'string']
    ]
  ],
  [
    'HTML inline embedded recovery',
    [
      ['src', 'attribute'],
      ['"</script>"', 'string'],
      ['const', 'keyword'],
      ['"open ', 'string'],
      ['<p>', 'tag', 2, 1],
      ['after', ''],
      ['color', 'property'],
      ['red', 'literal'],
      ['<i>', 'tag', 2, 1],
      ['done', '']
    ]
  ],
  [
    'Markup embedded nesting and end names',
    [
      ['outer', 'string'],
      ['inner', 'string'],
      ['42', 'number'],
      ['</scriptx>', 'string'],
      ['/* open ', 'comment'],
      ['<p>', 'tag', 2, 1],
      ['tail', ''],
      ['width', 'property'],
      ['calc', 'function'],
      ['blue', 'literal']
    ]
  ],
  [
    'Go generic declarations and methods',
    [
      ['package', 'keyword'],
      ['main', 'type'],
      ['fmt"', 'string', 3],
      ['Pair', 'type'],
      ['any', 'type'],
      ['value T', 'property', 5],
      ['string', 'type'],
      ['json:', 'string'],
      ['Number', 'type'],
      ['interface', 'keyword'],
      ['Callback', 'type'],
      ['Read', 'function'],
      ['p *', 'variable', 1],
      ['x, y', 'variable', 1],
      ['Minimum', 'function'],
      ['nil', 'literal'],
      ['new', 'builtin'],
      ['make', 'builtin'],
      ['count', 'variable'],
      ['Println', 'function'],
      ['clear', 'builtin'],
      ['min(', 'builtin', 3],
      ['42', 'number']
    ]
  ],
  [
    'Go numeric forms and literal escapes',
    [
      ['complex128', 'type'],
      ['1_000', 'number'],
      ['0b_1010', 'number'],
      ['0o755', 'number'],
      ['0755', 'number'],
      ['0x_FF', 'number'],
      ['.5', 'number'],
      ['1.', 'number'],
      ['1e-3', 'number'],
      ['0x1.fp+2', 'number'],
      ['0x.8p-1', 'number'],
      ['2i', 'number'],
      ['0b11i', 'number'],
      ['0b102', 'invalid'],
      ['0xZ', 'invalid'],
      ['1__2', 'invalid'],
      ['42abc', 'invalid'],
      ["'π'", 'string'],
      ["'😀'", 'string'],
      ['ab', 'invalid'],
      [String.raw`\u03c0`, 'escape'],
      [String.raw`\x41`, 'escape'],
      [String.raw`\U0001F600`, 'escape'],
      [String.raw`\q`, 'invalid'],
      ['%02d', 'meta'],
      ['first', 'string'],
      [String.raw`\n`, 'string'],
      ['%s', 'meta'],
      ['Unicode name', 'comment'],
      ['β42 :=', 'variable', 3],
      ['true', 'literal']
    ]
  ],
  [
    'Go multiline signatures and unfinished regions',
    [
      ['Transform', 'function'],
      ['values []', 'variable', 6],
      ['visit func', 'variable', 5],
      ['item T', 'variable', 4],
      ['append', 'builtin'],
      ['Custom', 'type'],
      ['Receiver', 'function'],
      ['map', 'keyword'],
      ['println', 'builtin'],
      ['unfinished', 'string'],
      ['next', 'variable'],
      ['42', 'number'],
      ['unfinished comment', 'comment'],
      ['return value', 'comment']
    ]
  ]
];
for (const [name, checks] of semantics) {
  test(`${name} classifies independent language concepts`, () => {
    const sample = [
      ...scriptCases,
      ...yamlCases,
      ...tomlCases,
      ...pythonCases,
      ...cssCases,
      ...markupCases,
      ...goCases
    ].find(sample => sample.name === name);
    const kinds = Array(sample.text.length).fill('');
    for (const [start, end, kind] of scanners[sample.language](sample.text)) kinds.fill(categories[kind], start, end);
    for (const [needle, expected, length = needle.length, skip = 0] of checks) {
      const start = sample.text.indexOf(needle) + skip;
      assert.ok(start >= skip, `Missing fixture ${needle}`);
      assert.deepEqual(kinds.slice(start, start + length - skip), Array(length - skip).fill(expected), needle);
    }
  });
}

test('keeps compact Python literals, declarations, and nested expression categories', async () => {
  const grammar = await loadGrammar('@shikijs/langs/python');
  const scan = createScanner(compileGrammar(pythonProfile(grammar, true)));
  for (const sample of pythonCases) {
    let document = createDocument(scan, sample.text, 2);
    for (const [needle, insertion] of [
      ['42', '987'],
      ['str', 'int'],
      ['"', '\n'],
      ['#', '']
    ]) {
      const start = document.text.indexOf(needle);
      if (start < 0) continue;
      document = editDocument(scan, document, start, start + needle.length, insertion);
      assert.deepEqual(document.ranges, scan(document.text));
    }
  }
  const text =
    'from pathlib import Path as File\nclass Reader(object):\n    def read(name: str):\n        value = f"hello {name.upper()} {42}"\n        pattern = r"[a-z]+\\d*"\n        return lambda x: x + len(name)';
  const kinds = Array(text.length).fill('');
  for (const [start, end, kind] of scan(text)) kinds.fill(categories[kind], start, end);
  for (const [needle, kind] of [
    ['from', 'keyword'],
    ['import', 'keyword'],
    ['Reader', 'class'],
    ['read', 'function'],
    ['str', 'type'],
    ['hello', 'string'],
    ['name.upper', 'variable'],
    ['upper', 'function'],
    ['42', 'number'],
    ['[a-z]+', 'string'],
    ['lambda', 'keyword'],
    ['len', 'builtin']
  ]) {
    assert.equal(kinds[text.indexOf(needle)], kind, needle);
  }
});

test('preserves CSS vocabulary boundaries, prefixes, fonts, and case after prefix sharing', () => {
  const values = [
    'RED',
    'currentColor',
    'rebeccapurple',
    'serif',
    'block',
    'block-axis',
    'auto-fit',
    'WindowFrame',
    '-webkit-something',
    'Arial'
  ];
  const text = `.x{${values.map((value, i) => `p${i}:${value};`).join('')}other:redder}`;
  const kinds = Array(text.length).fill(0);
  for (const [start, end, kind] of scanners.css(text)) kinds.fill(kind, start, end);
  for (const value of values) {
    const start = text.indexOf(value);
    assert.ok(
      kinds.slice(start, start + value.length).every(kind => kind === categories.indexOf('literal')),
      value
    );
  }
  assert.equal(kinds[text.indexOf('redder')], 0);
});

test('keeps compact Go numeric rules consistent with semantic source cases', async () => {
  const grammar = await loadGrammar('@shikijs/langs/go');
  const before = JSON.stringify(grammar);
  const textmate = createScanner(compileGrammar(goProfile(grammar)));
  for (const sample of goCases) assert.deepEqual(scanners.go(sample.text), textmate(sample.text), sample.name);
  assert.equal(JSON.stringify(grammar), before);
});

test('keeps an indented Go function literal in its parameter and result type context', () => {
  const text = 'Register(\n  func (value Custom) Custom { return value },\n)';
  const kinds = Array(text.length).fill('');
  for (const [start, end, kind] of scanners.go(text)) kinds.fill(categories[kind], start, end);
  assert.equal(kinds[text.indexOf('Register')], 'function');
  assert.equal(kinds[text.indexOf('value')], 'variable');
  for (const match of text.matchAll(/Custom/g)) assert.equal(kinds[match.index], 'type');
  assert.equal(kinds[text.indexOf('return')], 'keyword');
});

test('recognizes Go literal boundaries and malformed octal, exponent, and separator forms', async () => {
  const grammar = await loadGrammar('@shikijs/langs/go');
  for (const source of ['textmate', 'compact']) {
    const scan = createScanner(compileGrammar(goProfile(grammar, source)));
    for (const [expected, literals] of [
      [
        'number',
        [
          '0',
          '42',
          '0600',
          '0_600',
          '0o_600',
          '0B_1100',
          '0x_1FFFP-16',
          '.25',
          '1.',
          '08.0',
          '08e1',
          '08i',
          '1e+2',
          '1_2.3_4e-5_6i',
          '0X1.FP+2i'
        ]
      ],
      ['invalid', ['08', '0_8', '0b', '0o', '0x', '0b102', '0o778', '0x1.5', '1e+', '1__2', '42_', '0x_FF_', '0x1p_2']]
    ]) {
      for (const literal of literals) {
        const text = `var number = ${literal};`;
        const kinds = Array(text.length).fill('');
        for (const [start, end, kind] of scan(text)) kinds.fill(categories[kind], start, end);
        const start = text.indexOf(literal, 13);
        assert.deepEqual(
          kinds.slice(start, start + literal.length),
          Array(literal.length).fill(expected),
          `${source}: ${literal}`
        );
      }
    }
  }
});

test('shares expressions and region-end matchers without changing semantic or edited ranges', async () => {
  const sources = {
    javascript: javascriptProfile,
    typescript: scriptProfile(await loadGrammar('@shikijs/langs/typescript'), 'typescript'),
    tsx: scriptProfile(await loadGrammar('@shikijs/langs/tsx'), 'tsx'),
    yaml: await loadGrammar('@shikijs/langs/yaml'),
    toml: await loadGrammar('@shikijs/langs/toml'),
    python: pythonProfile(await loadGrammar('@shikijs/langs/python'), true),
    css,
    go: goProfile(await loadGrammar('@shikijs/langs/go'), 'compact'),
    html: markupProfile(await loadGrammar('@shikijs/langs/html'), xml),
    xml: markupProfile(xml),
    bash,
    shell
  };
  const shared = Object.fromEntries(
    Object.entries(sources).map(([language, source]) => [
      language,
      createScanner(compileGrammar(source, [source, javascriptProfile, css, bash], { shared: true, ascii: true }))
    ])
  );
  for (const sample of [
    ...scriptCases,
    ...yamlCases,
    ...tomlCases,
    ...pythonCases,
    ...cssCases,
    ...markupCases,
    ...goCases,
    ...bashCases,
    ...shellCases
  ]) {
    const scan = shared[sample.language];
    assert.deepEqual(scan(sample.text), scanners[sample.language](sample.text), sample.name);
    let document = createDocument(scan, sample.text, 2);
    for (const [needle, insert] of [
      ['"', '\n'],
      ['42', '987'],
      ['}', ''],
      ['\n', '\n// changed\n']
    ]) {
      const start = document.text.indexOf(needle);
      if (start < 0) continue;
      document = editDocument(scan, document, start, start + needle.length, insert);
      assert.deepEqual(document.ranges, scanners[sample.language](document.text), `${sample.name}: ${needle}`);
    }
  }
});

test('classifies Bash strings, expansions, arithmetic, declarations, and comments independently', () => {
  for (const [sample, expectations] of [
    [
      bashCases[0],
      [
        ['NAME=', 'variable'],
        ['greet', 'function'],
        ['local', 'builtin'],
        ['printf', 'builtin'],
        ['$1', 'variable'],
        ['16#ff', 'number'],
        ['3 +', 'number'],
        ['if [[', 'keyword'],
        ['^[A-Z]+$', 'regex'],
        ['/tmp/then', ''],
        ['after', '']
      ]
    ],
    [
      bashCases[1],
      [
        ['<<', 'keyword'],
        ['END.*', 'string'],
        ['| grep', 'keyword'],
        ['# header', 'comment'],
        ['Hello', 'string'],
        ['$USER', 'variable'],
        ['echo world', 'builtin'],
        ['"literal quote"', 'string'],
        ['END.* trailing', 'string'],
        ['echo after', 'builtin']
      ]
    ],
    [
      bashCases[2],
      [
        ['$USER', 'string'],
        ['$(echo literal)', 'string'],
        [' EOF', 'string'],
        ['echo after', 'builtin'],
        ['$USER `literal`', 'string'],
        ['echo final', 'builtin']
      ]
    ],
    [
      bashCases[3],
      [
        ["'$USER", 'string'],
        ['\\nhex', 'escape'],
        ['\\x41', 'escape'],
        ['\\u03c0', 'escape'],
        ['\\$USER', 'escape'],
        ['actual $USER', 'string'],
        ['items', 'variable'],
        ['2]', 'number'],
        ['value#suffix', ''],
        ['# comment', 'comment'],
        ['if false', 'string']
      ]
    ]
  ]) {
    const kinds = Array(sample.text.length).fill('');
    for (const [start, end, kind] of scanners.bash(sample.text)) kinds.fill(categories[kind], start, end);
    for (const [needle, expected] of expectations) {
      assert.notEqual(sample.text.indexOf(needle), -1);
      assert.equal(kinds[sample.text.indexOf(needle)], expected, `${sample.name}: ${needle}`);
    }
  }
});

test('keeps shell output plain while continuing and recovering command regions', () => {
  for (const sample of shellCases) {
    const kinds = Array(sample.text.length).fill('');
    for (const [start, end, kind] of scanners.shell(sample.text)) kinds.fill(categories[kind], start, end);
    assert.equal(kinds[0], 'meta');
    for (const needle of ['output', 'file contents', 'plain output', 'after']) {
      const start = sample.text.indexOf(needle);
      if (start >= 0) assert.equal(kinds[start], '', `${sample.name}: ${needle}`);
    }
    const variable = sample.text.indexOf('$USER');
    if (variable >= 0) assert.equal(kinds[variable], 'variable');
  }
});

test('activates heredocs after continued headers and recovers from unfinished embedded commands', () => {
  for (const text of [
    'cat <<EOF \\\n | cat\nHello $USER\nEOF\necho after',
    'cat <<EOF # comment ending in \\\nHello $USER\nEOF\necho after',
    'cat <<EOF echo \\#literal \\\n | cat\nHello $USER\nEOF\necho after',
    'cat <<EOF\n$(echo "unfinished\nEOF\necho after',
    'cat <<EOF\n\tEOF\nEOF trailing\nEOF\necho after'
  ]) {
    const scan = scanners.bash;
    const kinds = Array(text.length).fill('');
    for (const [start, end, kind] of scan(text)) kinds.fill(categories[kind], start, end);
    assert.equal(kinds[text.indexOf('echo after')], 'builtin');
    for (const needle of ['| cat', 'Hello', '\tEOF', 'EOF trailing']) {
      const start = text.indexOf(needle);
      if (start >= 0) assert.equal(kinds[start], needle.startsWith('|') ? 'keyword' : 'string');
    }
    let document = createDocument(scan, text, 2);
    for (const [needle, insert] of [
      ['EOF', 'END.*'],
      ['\nEOF', '\nEND.*'],
      ['after', 'changed']
    ]) {
      const start = document.text.indexOf(needle);
      if (start < 0) continue;
      document = editDocument(scan, document, start, start + needle.length, insert);
      assert.deepEqual(document.ranges, scan(document.text));
    }
  }
});

test('preserves quoted delimiter spaces and recognizes unfinished heredoc headers', () => {
  const text = 'cat <<" EOF "\n$USER\nEOF\n EOF \necho after';
  const kinds = Array(text.length).fill('');
  for (const [start, end, kind] of scanners.bash(text)) kinds.fill(categories[kind], start, end);
  assert.equal(kinds[text.indexOf('$USER')], 'string');
  assert.equal(kinds[text.indexOf('\nEOF') + 1], 'string');
  assert.equal(kinds[text.indexOf('echo after')], 'builtin');
  let document = createDocument(scanners.bash, 'cat <<EOF');
  assert.equal(categories[document.ranges.at(-1)[2]], 'string');
  document = editDocument(
    scanners.bash,
    document,
    document.text.length,
    document.text.length,
    '\nHello $USER\nEOF\necho after'
  );
  assert.deepEqual(document.ranges, scanners.bash(document.text));
});

test('keeps Bash path fragments transparent to variable and quoted expansions', () => {
  const text = 'echo /tmp/$USER/"file name" /var/${NAME}/file';
  const kinds = Array(text.length).fill('');
  for (const [start, end, kind] of scanners.bash(text)) kinds.fill(categories[kind], start, end);
  for (const [needle, expected] of [
    ['/tmp/', ''],
    ['$USER', 'variable'],
    ['"file name"', 'string'],
    ['NAME', 'variable'],
    ['/file', '']
  ]) {
    assert.equal(kinds[text.indexOf(needle)], expected, needle);
  }
});
