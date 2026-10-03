// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export const jsxCases = [
  {
    name: 'components, attributes, nested tags and expressions',
    text: 'const view = <Widget title="GPU" enabled={true}><span>{42}</span></Widget>; const tail = 7;',
    checks: [
      ['Widget', 'builtin'],
      ['title', 'attribute'],
      ['"GPU"', 'string'],
      ['enabled', 'attribute'],
      ['true', 'literal'],
      ['span', 'tag'],
      ['42', 'number'],
      ['const tail', 'keyword', 5],
      ['7', 'number']
    ]
  },
  {
    name: 'fragments keep child text separate from script vocabulary',
    text: 'return <>true 42 const &amp; &#x1F600; <Panel /> text <i>{false}</i></>;',
    checks: [
      ['true', ''],
      ['42', ''],
      ['const', ''],
      ['&amp;', 'escape'],
      ['&#x1F600;', 'escape'],
      ['Panel', 'builtin'],
      ['i>', 'tag', 1],
      ['false', 'literal']
    ]
  },
  {
    name: 'spread props and callback expressions suspend the tag header',
    text: 'const v = <Button {...props} onClick={() => { const n = {count: 42}; return <Icon enabled={false} />; }} />; const tail = true;',
    checks: [
      ['Button', 'builtin'],
      ['onClick', 'attribute'],
      ['const n', 'keyword', 5],
      ['count:', 'property', 5],
      ['42', 'number'],
      ['Icon', 'builtin'],
      ['enabled', 'attribute'],
      ['false', 'literal'],
      ['const tail', 'keyword', 5],
      ['true', 'literal']
    ]
  },
  {
    name: 'namespaced and member tags preserve source captures',
    text: 'const v = <svg:path ns:role="GPU"><UI.Item data-x={42} /></svg:path>;',
    checks: [
      ['svg:', 'tag', 3],
      ['path', 'tag'],
      ['ns:', 'attribute', 2],
      ['role', 'attribute'],
      ['UI.Item', 'builtin'],
      ['data-x', 'attribute'],
      ['42', 'number']
    ]
  },
  {
    name: 'multiline headers, comments and nested expressions retain line state',
    text: 'const view = <Widget\n title="one &amp; 😀"\n enabled={\n /* before */ {nested: {count: 42}, render: <span>{true}</span>}\n }\n>plain\n<em>{false}</em>\n</Widget>;\nconst tail = 9;',
    checks: [
      ['Widget', 'builtin'],
      ['title', 'attribute'],
      ['&amp;', 'escape'],
      ['😀', 'string'],
      ['enabled', 'attribute'],
      ['/* before */', 'comment'],
      ['nested:', 'property', 6],
      ['count:', 'property', 5],
      ['42', 'number'],
      ['span', 'tag'],
      ['true', 'literal'],
      ['plain', ''],
      ['em>', 'tag', 2],
      ['false', 'literal'],
      ['const tail', 'keyword', 5],
      ['9', 'number']
    ]
  },
  {
    name: 'nested type arguments in component headers',
    languages: ['tsx'],
    text: 'const view = <List<Map<string, Array<number>>> value={42} render={(v: number) => <span>{true}</span>} />;',
    checks: [
      ['List', 'builtin'],
      ['Map', 'type'],
      ['string', 'type'],
      ['Array', 'type'],
      ['number', 'type'],
      ['value', 'attribute'],
      ['42', 'number'],
      ['render', 'attribute'],
      ['span', 'tag'],
      ['true', 'literal']
    ]
  },
  {
    name: 'JSX expressions can contain tagged templates and nested JSX',
    text: 'const view = <Widget title={html`<p data-x="${42}">${<i>{false}</i>}</p>`} />;',
    checks: [
      ['Widget', 'builtin'],
      ['title', 'attribute'],
      ['p ', 'tag', 1],
      ['data-x', 'attribute'],
      ['42', 'number'],
      ['i>', 'tag', 1],
      ['false', 'literal']
    ]
  },
  {
    name: 'parenthesized child text on the same line stays JSX',
    text: 'const view = <Widget>(label)</Widget>; const tail = 42;',
    checks: [
      ['Widget', 'builtin'],
      ['label', ''],
      ['const tail', 'keyword', 5],
      ['42', 'number']
    ]
  }
];

export const genericCases = [
  'const identity = <T>(value: T) => value;\nconst tail = 42;',
  'const identity = <T> (\n value: T\n) => value;\nconst tail = 42;',
  'const pair = <T, U>(a: T, b: U) => [a, b];\nconst tail = 42;',
  'const read = <T extends string>(value: T) => value;\nconst tail = 42;',
  'const read = <T = string>(value: T) => value;\nconst tail = 42;',
  'const value = factory<Array<Array<number>>>();\nconst tail = 42;',
  'const below = (left < right) && other > value;\nconst tail = 42;'
];
