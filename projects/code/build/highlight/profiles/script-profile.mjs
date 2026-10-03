// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import { adaptRegex } from '../adapters/regex-adapter.mjs';
import { jsxProfile } from './jsx-profile.mjs';

function matchRule(mode) {
  const parts = Array.isArray(mode.match) ? mode.match : [mode.match];
  const captures = {};
  let groups = 0;
  const source = parts
    .map((part, index) => {
      const body = part instanceof RegExp ? part.source : part;
      if (typeof body !== 'string') throw new Error('Unsupported script match source');
      const scope = mode.className?.[index + 1];
      if (scope) captures[groups + 1] = { name: scope === 'keyword' ? 'keyword.control' : 'entity.name.function' };
      groups += adaptRegex(body).captures.length;
      return `(${body})`;
    })
    .join('');
  return { match: source, captures };
}

// A lexical comparison candidate, not a complete replacement grammar. Keep
// source string/number/regex rules and current keyword vocabulary, but omit
// the TextMate expression-prediction machinery. All adaptation is build-time.
export function scriptProfile(grammar, language, options = {}) {
  const jsx = options.jsx ?? language !== 'typescript';
  const definition = (['typescript', 'tsx'].includes(language) ? typescript : javascript)(hljs);
  const repository = structuredClone(grammar.repository);
  const required = [
    'comment',
    'qstring-single',
    'qstring-double',
    'template',
    'template-substitution-element',
    'regex',
    'numeric-literal'
  ];
  for (const name of required) if (!repository[name]) throw new Error(`Missing script profile source: ${name}`);

  const annotation = definition.contains.find(rule => rule.className === 'comment')?.variants?.[0]?.contains?.[0];
  if (annotation?.contains?.length !== 4) throw new Error('Missing current documentation-comment rules');
  const expression = value => (value instanceof RegExp ? value.source : value);
  const annotationRule = {
    begin: annotation.begin,
    end: '(?=)',
    applyEndPatternLast: true,
    patterns: [
      { match: annotation.contains[0].begin, name: 'comment.doctag' },
      {
        begin: annotation.contains[1].begin,
        end: `${annotation.contains[1].end}|(?=\\*/)`,
        name: 'storage.type',
        beginCaptures: { 0: { name: 'comment' } },
        endCaptures: { 0: { name: 'comment' } }
      },
      { match: annotation.contains[2].begin, name: 'variable.other', pop: true },
      { match: expression(annotation.contains[3].begin) }
    ]
  };
  repository.comment.patterns = repository.comment.patterns.map((rule, index) => ({
    ...rule,
    beginCaptures: rule.beginCaptures?.[1]?.name?.includes('whitespace')
      ? { 0: { name: 'comment.line' }, 1: { name: 'meta.embedded.line' } }
      : {},
    endCaptures: {},
    patterns: index === 0 ? [annotationRule] : []
  }));
  repository.template = { patterns: [repository.template.patterns.at(-1)] };
  repository['template-substitution-element'].patterns = [{ include: '#braces' }, { include: '$self' }];
  repository.braces = { begin: '\\{', end: '}', patterns: [{ include: '#braces' }, { include: '$self' }] };
  if (jsx) jsxProfile(repository, language, options);
  // The existing theme colors a regexp as one scope. Escape/class boundaries
  // still need to consume a slash inside a character class or after a backslash.
  repository.regex.patterns = repository.regex.patterns.map(rule => ({
    ...rule,
    // Both source rules search for a slash. Keep their context tests while
    // leaving skipped prefix whitespace outside the painted regexp region.
    begin: rule.begin.replace('\\s*(/)', '(/)').replace('))\\s*)/', ')))/'),
    beginCaptures: {},
    endCaptures: {},
    patterns: [
      { match: '\\\\.', name: 'string.regexp' },
      { begin: '\\[', end: ']', name: 'string.regexp', patterns: [{ match: '\\\\.' }] }
    ]
  }));
  const vocabulary = Object.entries(definition.keywords)
    .filter(([name]) => name !== '$pattern')
    .map(([name, words]) => {
      if (!Array.isArray(words)) throw new Error(`Unexpected script vocabulary: ${name}`);
      const names = words.map(word => word.split('|')[0]);
      const scope = {
        keyword: 'keyword.control',
        literal: 'constant.language',
        built_in: 'support.variable',
        'variable.language': 'variable.language'
      }[name];
      if (!scope) throw new Error(`Unknown script vocabulary category: ${name}`);
      return { match: `(?<![$_[:alnum:]])(?:${names.join('|')})(?![$_[:alnum:]])`, name: scope };
    });
  // Compile declaration headers without their expression-prediction bodies.
  const declarations = ['class-declaration', 'interface-declaration'].flatMap(name => {
    const rule = repository[name];
    return rule
      ? [
          {
            begin: rule.begin,
            beginCaptures: rule.beginCaptures,
            end: '(?=[{;])',
            patterns: [
              { include: '#comment' },
              {
                match: '[$_[:alpha:]][$_[:alnum:]]*',
                name: name === 'class-declaration' ? 'entity.name.class' : 'entity.name.type',
                pop: true
              }
            ]
          }
        ]
      : [];
  });
  for (const name of ['function-declaration', 'enum-declaration', 'type-alias-declaration']) {
    const rule = repository[name];
    if (rule) declarations.push({ match: rule.begin, captures: rule.beginCaptures });
  }
  return {
    scopeName: `${grammar.scopeName}.lexical-profile`,
    repository,
    patterns: [
      { include: '#comment' },
      { include: '#qstring-single' },
      { include: '#qstring-double' },
      { include: '#template' },
      { include: '#regex' },
      ...(jsx ? [{ include: '#jsx' }] : []),
      { include: '#numeric-literal' },
      ...definition.contains
        .filter(rule => rule.scope === 'attr')
        .map(rule => ({ match: rule.match, name: 'meta.property-name' })),
      {
        match: '\\.([A-Za-z$_][0-9A-Za-z$_]*)(?![0-9A-Za-z$_(])',
        captures: { 1: { name: 'variable.other.property' } }
      },
      ...definition.contains
        .filter(
          rule =>
            Array.isArray(rule.match) && rule.className?.[1] === 'keyword' && String(rule.match[0]) === '/get|set/'
        )
        .map(matchRule),
      { match: '@[A-Za-z$_][0-9A-Za-z$_]*', name: 'meta.directive' },
      ...declarations,
      ...(repository['type-primitive'] ? [repository['type-primitive']] : []),
      ...vocabulary
    ]
  };
}
