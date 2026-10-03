// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import hljs from 'highlight.js/lib/core';
import go from 'highlight.js/lib/languages/go';

// Preserve established lexical rules, lowering signature/type capture grammars
// into ordinary regions. Scope strings and all adaptation stay in the compiler.
export function goProfile(grammar, numericSource = 'textmate') {
  const source = grammar.repository;
  const id = '[_\\p{L}][_\\p{L}\\p{Nd}]*';
  const punctuation = { name: 'punctuation.go' };
  const token = (match, name) => ({ match, name });
  const merge = (rules, name) => ({
    patterns: [token(rules.map(rule => `(?:${rule.match})`).join('|'), name)]
  });
  const legacyOctal = '(?!0[0-7_]*[89][0-9_]*(?![\\w.]))';
  const region = (begin, end, patterns) => ({
    begin,
    end,
    beginCaptures: { 0: punctuation },
    endCaptures: { 0: punctuation },
    patterns
  });
  const include = name => ({ include: `#${name}` });
  const lexical = ['comments', 'string_literals', 'raw_string_literals', 'runes', 'numbers'].map(include);
  const vocabulary = [include('keywords'), include('storage_types'), include('language_constants')];
  const operators = [include('operators'), include('delimiters')];
  const types = [
    ...lexical,
    ...vocabulary,
    include('type-round'),
    include('type-square'),
    include('type-body'),
    token(`${id}(?=\\s*\\()`, 'entity.name.function.go'),
    ...operators,
    token(id, 'entity.name.type.go')
  ];
  const parameters = [
    token(`${id}(?=\\s*(?:,\\s*${id}\\s*)*\\s+(?:${id}|\\*|\\[|\\.\\.\\.|<-))`, 'variable.parameter.go'),
    ...types
  ];
  const fields = [
    token(`${id}(?=\\s*(?:,\\s*${id}\\s*)*\\s+(?:${id}|\\*|\\[|<-))`, 'variable.other.property.go'),
    ...types
  ];
  const signature = {
    end: '(?=\\{)|$',
    patterns: [include('parameters'), include('type-square'), ...types]
  };
  const typeBody = { end: ';|$', patterns: types };
  const validators = source.numeric_literals.captures[0].patterns[0].patterns.slice(0, 2);
  const numbers = validators.map(rule =>
    token(rule.match.replace(/^\\G/, '').replaceAll('(?:\\n|$)', ''), 'constant.numeric.go')
  );
  if (numericSource === 'compact') {
    const definition = go(hljs).contains.find(rule => rule.className === 'number');
    if (!definition?.variants) throw new Error('Missing Go numeric source');
    numbers.length = 0;
    for (const rule of definition.variants) {
      const match = rule.match instanceof RegExp ? rule.match.source : rule.match;
      numbers.push(
        token(
          match.replace(/^-\?/, '').replace('(_?[0-7])*', '(_?[0-7])+').replace('(_?[01])*', '(_?[01])+'),
          'constant.numeric.go'
        )
      );
    }
  } else if (numericSource !== 'textmate') throw new Error(`Unknown Go numeric profile: ${numericSource}`);
  const validNumbers = merge(numbers, 'constant.numeric.go');
  validNumbers.patterns[0].match = `${legacyOctal}(?:${validNumbers.patterns[0].match})(?![_\\p{L}\\p{Nd}.])`;
  numbers.push(token(source.numeric_literals.match, 'invalid.illegal.constant.numeric.go'));
  const string = source.string_literals.patterns[0];
  const rune = source.runes.patterns[0];
  const builtins = source.built_in_functions.patterns;
  const builtin = `${builtins[0].match.replace(/\(\?=\\\(\)$/, '')}|\\b(?:${builtins
    .slice(1)
    .map(rule => rule.begin.match(/\((\w+)\)/)[1])
    .join('|')})\\b`;
  return {
    scopeName: grammar.scopeName,
    patterns: [
      ...lexical,
      {
        begin: '\\b(func)(?=\\s*\\()',
        beginCaptures: { 1: { name: 'keyword.function.go' } },
        ...signature
      },
      {
        begin: '\\b(func)\\b',
        beginCaptures: { 1: { name: 'keyword.function.go' } },
        end: id,
        endCaptures: { 0: { name: 'entity.name.function.go' } },
        patterns: [include('comments'), include('parameters')],
        endState: signature
      },
      {
        begin: `\\b(type)\\s+(${id})`,
        beginCaptures: { 1: { name: 'keyword.type.go' }, 2: { name: 'entity.name.type.go' } },
        ...typeBody
      },
      {
        begin: `\\b(var)\\s+(${id})\\s+(?=${id}|\\*|\\[|<-)`,
        beginCaptures: { 1: { name: 'keyword.var.go' }, 2: { name: 'variable.other.go' } },
        end: '(?==|;|$)',
        patterns: types,
        endState: { end: ';|$', patterns: [{ include: '$self' }] }
      },
      {
        begin: '\\b(type)\\s*(\\()',
        end: '\\)',
        beginCaptures: { 1: { name: 'keyword.type.go' }, 2: punctuation },
        endCaptures: { 0: punctuation },
        patterns: [
          include('comments'),
          { begin: `^[\\t ]*(${id})`, beginCaptures: { 1: { name: 'entity.name.type.go' } }, ...typeBody }
        ]
      },
      {
        match: `\\b(package)\\s+(${id})`,
        captures: { 1: { name: 'keyword.package.go' }, 2: { name: 'entity.name.type.package.go' } }
      },
      {
        begin: '\\b(new|make)\\s*(\\()',
        beginCaptures: { 1: { name: 'support.function.builtin.go' }, 2: punctuation },
        end: '(?=,|\\))',
        patterns: types,
        endState: { end: '\\)', endCaptures: { 0: punctuation }, patterns: [{ include: '$self' }] }
      },
      { match: `(?:${builtin})(?=\\s*\\()`, name: 'support.function.builtin.go' },
      ...vocabulary,
      { match: `\\.(${id})(?=\\s*\\()`, captures: { 0: punctuation, 1: { name: 'entity.name.function.go' } } },
      { match: `\\.(${id})`, captures: { 0: punctuation, 1: { name: 'variable.other.property.go' } } },
      token(`${id}(?=\\s*\\()`, 'entity.name.function.go'),
      include('round'),
      include('square'),
      include('curly'),
      ...operators,
      token(';', 'punctuation.go'),
      token(id, 'variable.other.go')
    ],
    repository: {
      comments: source.comments,
      string_literals: { ...string, end: '"|(?=\\r?$)' },
      raw_string_literals: source.raw_string_literals,
      runes: {
        ...rune,
        end: "'|(?=\\r?$)",
        patterns: [
          token(`\\G(?:${source.string_escaped_char.patterns[0].match})(?=')`, 'constant.character.escape.go'),
          token("\\G[^'\\\\\\r\\n](?=')", 'string.quoted.rune.go'),
          token("[^'\\r\\n]+", 'invalid.illegal.unknown-rune.go')
        ]
      },
      string_escaped_char: {
        patterns: [...source.string_escaped_char.patterns, token('\\\\.', 'invalid.illegal.unknown-escape.go')]
      },
      string_placeholder: {
        patterns: source.string_placeholder.patterns.map(rule => ({ ...rule, name: 'meta.directive.format.go' }))
      },
      numbers: { patterns: [...validNumbers.patterns, numbers.at(-1)] },
      keywords: merge(source.keywords.patterns, 'keyword.go'),
      storage_types: merge(source.storage_types.patterns, 'entity.name.type.go'),
      language_constants: token(source.language_constants.match, 'constant.language.go'),
      operators: merge(source.operators.patterns, 'keyword.operator.go'),
      delimiters: merge(source.delimiters.patterns, 'punctuation.go'),
      round: region('\\(', '\\)', [{ include: '$self' }]),
      square: region('\\[', ']', [{ include: '$self' }]),
      curly: region('\\{', '}', [{ include: '$self' }]),
      parameters: region('\\(', '\\)', parameters),
      'type-round': region('\\(', '\\)', parameters),
      'type-square': region('\\[', ']', types),
      'type-body': region('\\{', '}', fields)
    }
  };
}
