// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Keep source lexical rules and vocabulary, using explicit declaration and
// bracket states instead of the source's selector-validation and cursor modes.
function wordsFromPattern(pattern) {
  const body =
    pattern.match(/^\(\?i\)\(\?<!\[-\\w\]\)(?:\((.*)\)|(.*))\(\?!\[-\\w\]\)$/) ??
    pattern.match(/^\(\?<!\[-\\w\]\)\(\?i:(.*)\)\(\?!\[-\\w\]\)$/);
  if (!body) return;
  const words = [];
  for (const branch of (body[1] ?? body[2]).split('|')) {
    let prefixes = [''];
    let cursor = 0;
    const atom = /[-A-Za-z0-9]|\[([A-Za-z0-9]+)\]/y;
    while (cursor < branch.length) {
      atom.lastIndex = cursor;
      const match = atom.exec(branch);
      if (!match) return;
      cursor = atom.lastIndex;
      const choices = match[1] ? [...new Set(match[1])] : [match[0]];
      // The source uses a lazy optional letter in "larger??". Its two literal
      // outcomes can share the same boundary test and semantic category.
      if (branch.slice(cursor, cursor + 2) === '??') {
        choices.unshift('');
        cursor += 2;
      }
      if (prefixes.length * choices.length > 128) return;
      prefixes = prefixes.flatMap(prefix => choices.map(choice => prefix + choice));
    }
    if (prefixes.includes('')) return;
    words.push(...prefixes);
  }
  return words;
}

export function cssProfile(grammar) {
  const source = grammar.repository;
  const id =
    '(?:[-A-Za-z_\\u0080-\\u{10FFFF}]|\\\\(?:[0-9A-Fa-f]{1,6}\\s?|[^\\r\\n]))(?:[-0-9A-Za-z_\\u0080-\\u{10FFFF}]|\\\\(?:[0-9A-Fa-f]{1,6}\\s?|[^\\r\\n]))*';
  const punctuation = { name: 'punctuation.css' };
  const token = (match, name) => ({ match, name });
  const lexical = [{ include: '#comment-block' }, { include: '#string' }, { include: '#escapes' }];
  const values = [
    token(`${id}(?=\\s*:)`, 'meta.property-name.css'),
    ...lexical,
    { include: '#url' },
    { include: '#function' },
    { include: '#numeric-values' },
    { include: '#unicode-range' },
    { include: '#value-vocabulary' },
    source['feature-query-operators'].patterns[0],
    token(`--${id}`, 'variable.css'),
    token('!\\s*important(?![-\\w])', 'keyword.other.important.css'),
    { include: '#value-parens' },
    { include: '#value-brackets' },
    { include: '#value-braces' },
    token('[,:]', 'punctuation.css')
  ];
  const selector = [
    ...lexical,
    token(`[.#]${id}`, 'meta.selector.css'),
    token(`::?${id}`, 'meta.selector.css'),
    { include: '#attribute-selector' },
    token(id, 'entity.name.tag.css'),
    token('[*>+~&,|]', 'punctuation.css')
  ];
  const region = (begin, end, patterns) => ({
    begin,
    end,
    beginCaptures: { 0: punctuation },
    endCaptures: { 0: punctuation },
    patterns
  });
  const root = [
    source['numeric-values'].patterns[1],
    ...lexical,
    { include: '#at-rule' },
    { include: '#block' },
    { include: '#selector-parens' },
    ...selector
  ];
  // Finite vocabulary branches share prefixes before case folding and scanner
  // capture allocation. Other regex-shaped vocabulary stays intact.
  const vocabulary = [];
  const words = new Set();
  for (const rule of [...source['property-keywords'].patterns, ...source['color-keywords'].patterns]) {
    const literals = !rule.captures && wordsFromPattern(rule.match);
    if (literals) for (const word of literals) words.add(word.toLowerCase());
    else vocabulary.push({ ...rule, name: 'constant.language.css' });
  }
  const trie = new Map();
  for (const word of words) {
    let node = trie;
    for (const char of word) {
      if (!node.has(char)) node.set(char, new Map());
      node = node.get(char);
    }
    node.set('', null);
  }
  const expression = node => {
    const branches = [...node].map(([char, child]) => char + (child ? expression(child) : ''));
    return branches.length === 1 ? branches[0] : `(?:${branches.join('|')})`;
  };
  vocabulary.unshift(token(`(?<![-\\w])(?i:${expression(trie)})(?![-\\w])`, 'constant.language.css'));
  const guard = `(?!(?:[^;"'\\r\\n{}]|"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')*\\{)`;
  const header = `(--${id}(?=\\s*:)|${id}(?=\\s*:\\s*${guard}))\\s*(:)\\s*`;
  const declaration = {
    begin: header,
    beginCaptures: { 1: { name: 'meta.property-name.css' }, 2: punctuation },
    end: ';|(?=[}])',
    endCaptures: { 0: punctuation },
    patterns: values
  };
  return {
    scopeName: 'source.css',
    patterns: root,
    repository: {
      'comment-block': source['comment-block'],
      escapes: { patterns: source.escapes.patterns.map(rule => (rule.begin ? token('\\\\\\r?\\n', rule.name) : rule)) },
      string: {
        patterns: source.string.patterns.map(rule => ({
          ...rule,
          patterns: rule.patterns.map(child =>
            child.begin ? { ...child, begin: child.begin.replace('(?:\\G|^)', '(?:^|\\G)') } : child
          )
        }))
      },
      'numeric-values': source['numeric-values'],
      'unicode-range': source['unicode-range'],
      'value-vocabulary': { patterns: vocabulary },
      url: { ...source.url, patterns: [token('(?:[^"\'()\\\\\\s]|\\\\.)+', 'string.unquoted.url.css'), ...lexical] },
      function: {
        begin: `(${id})(\\()`,
        end: '\\)',
        beginCaptures: { 1: { name: 'entity.name.function.css' }, 2: punctuation },
        endCaptures: { 0: punctuation },
        patterns: values
      },
      'value-parens': region('\\(', '\\)', values),
      'value-brackets': region('\\[', ']', values),
      'value-braces': region('\\{', '}', values),
      'selector-parens': region('\\(', '\\)', root),
      'attribute-selector': {
        ...region('\\[', ']', [
          ...lexical,
          {
            begin: '[$*^|~]?=\\s*',
            end: '(?<=\\S)(?=[\\s\\]])|(?=])',
            beginCaptures: { 0: { name: 'keyword.operator.pattern.css' } },
            patterns: [...lexical, token('[^\\]"\'\\s]+', 'string.unquoted.attribute-value.css')]
          },
          token('(?<=[\\s"\'])[iIsS](?=\\s*])', 'storage.modifier.css'),
          token(id, 'entity.other.attribute-name.css'),
          token('[$*^|~]?=', 'keyword.operator.pattern.css')
        ]),
        name: 'meta.attribute-selector.css'
      },
      'at-rule': {
        begin: `@${id}`,
        end: '(?=[{;])',
        beginCaptures: { 0: { name: 'keyword.control.at-rule.css' } },
        patterns: [
          ...values,
          source['media-types'],
          source['media-feature-keywords'],
          token(`(${id})(?=\\s*:)`, 'meta.property-name.css')
        ]
      },
      block: region('\\{', '}', [declaration, ...root, token(';', 'punctuation.css')])
    }
  };
}
