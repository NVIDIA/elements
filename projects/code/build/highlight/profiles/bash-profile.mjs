// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';

// Reuse established lexical rules and vocabulary, lowering capture grammars
// and command prediction into explicit regions. All adaptation is build-only.
export function bashProfile(grammar) {
  const source = grammar.repository;
  const definition = bash(hljs);
  const include = name => ({ include: `#${name}` });
  const token = (match, name) => ({ match, name });
  const punctuation = { name: 'punctuation.shell' };
  const embedded = 'meta.embedded.command.shell';
  const id = '[A-Za-z_][A-Za-z_0-9]*';
  const region = (begin, end, patterns, contentName = embedded) => ({
    begin,
    end,
    beginCaptures: { 0: punctuation },
    endCaptures: { 0: punctuation },
    contentName,
    patterns
  });
  const vocabulary = Object.entries(definition.keywords)
    .filter(([name]) => name !== '$pattern')
    .map(([name, words]) =>
      token(
        `(?<![\\w./-])(?:${words.join('|')})(?![\\w./-])`,
        name === 'keyword'
          ? 'keyword.control.shell'
          : name === 'literal'
            ? 'constant.language.shell'
            : 'support.function.builtin.shell'
      )
    );
  const strings = source.string.patterns.map(rule => {
    if (rule.begin !== "\\$'") return rule;
    return {
      ...rule,
      patterns: [
        token(
          String.raw`\\(?:['"\\abefnrtv]|[0-7]{1,3}|x[0-9a-fA-F]{1,2}|u[0-9a-fA-F]{1,4}|U[0-9a-fA-F]{1,8}|c.)`,
          'constant.character.escape.shell'
        )
      ]
    };
  });
  const expansion = [include('variable'), include('interpolation')];
  if (!source.comment.match.startsWith('(?:^|[\\t ]++)')) throw new Error('Shell comment source changed');
  const comment = token(source.comment.match.replace('(?:^|[\\t ]++)', '(?<=^|[\\t ])'), 'comment.line.shell');
  const arithmetic = region('\\$?\\(\\(', '\\)\\)', [include('math'), include('string')]);
  const command = region(source.subshell_dollar.patterns[0].begin, source.subshell_dollar.patterns[0].end, [
    include('initial_context')
  ]);
  const backtick = region('`', '`', [source.interpolation.patterns[2].patterns[0], include('initial_context')]);
  const variable = source.variable.patterns
    .filter(rule => rule.begin)
    .map(rule => ({
      ...rule,
      contentName: 'variable.other.shell',
      patterns: [...rule.patterns, include('interpolation')]
    }));
  variable.push(token(`\\$(?:${id}|[0-9]|[-!#$*@?_])`, 'variable.other.shell'));
  const math = source.math.patterns.map(rule =>
    rule.match ? { ...rule, match: rule.match.replace('|^|', '|\\^|') } : rule
  );
  math.unshift(include('interpolation'), region('\\(', '\\)', [include('math')]));
  const common = [
    comment,
    { match: source.function_definition.begin, captures: source.function_definition.beginCaptures },
    source.line_continuation,
    ...strings,
    ...expansion,
    token(`${id}(?=\\+?=)`, 'variable.other.shell'),
    ...vocabulary,
    token(source.numeric_literal.match, 'constant.numeric.shell'),
    token('(?<=^|[\\t ])--?[A-Za-z][\\w-]*', 'constant.other.option.shell'),
    token('(?:[\\w.-]*/)+[\\w.-]*', embedded),
    region(
      '=~[\\t ]*',
      '(?=\\s|\\]\\])',
      [
        token('\\\\.', 'constant.character.escape.shell'),
        region('\\[', '\\]', [token('\\\\.', 'constant.character.escape.shell')], 'string.regexp.shell')
      ],
      'string.regexp.shell'
    ),
    ...source.redirection.patterns.filter(rule => rule.match),
    region('[<>]\\(', '\\)', [include('initial_context')]),
    region('\\(', '\\)', [include('initial_context')]),
    region('\\{', '\\}', [include('initial_context')]),
    token('<<<|&&|\\|\\||[;|&=<>!]', 'keyword.operator.shell'),
    token('\\[\\[|\\]\\]|[\\[\\]]', 'punctuation.shell')
  ];
  const heredocs = source.heredoc.patterns.map(rule => {
    if (!rule.begin.endsWith('(.*)')) throw new Error('Shell heredoc header source changed');
    const quoted = Boolean(rule.beginCaptures[4]);
    const delimiter = quoted ? 3 : 2;
    const indent = rule.contentName.includes('.indent.');
    let begin = rule.begin.slice(0, -4);
    if (quoted) begin = begin.replace(String.raw`(["'])[\t ]*+`, String.raw`(["'])`);
    if (!quoted) begin = begin.replace('([^\\t "\']+)', '([^\\s"\';&|<>()]+)');
    begin = begin.replace(String.raw`(?=["\&';<\s])`, String.raw`(?=["\&';<\s]|$)`);
    const body = {
      end: `^${indent ? '\\t*' : ''}\\${delimiter}\\r?$`,
      endCaptures: rule.endCaptures,
      contentName: rule.contentName,
      hardEnd: true,
      patterns: quoted
        ? []
        : [
            { ...source.double_quote_escape_char, match: source.double_quote_escape_char.match.replace('"', '') },
            ...expansion
          ]
    };
    return {
      begin,
      beginCaptures: Object.fromEntries(Object.entries(rule.beginCaptures).filter(([, capture]) => !capture.patterns)),
      contentName: embedded,
      end: '(?<=(?:^|[^\\\\])(?:\\\\\\\\)*)(?:\\r?\\n|$)',
      patterns: common.map(pattern =>
        pattern === comment
          ? {
              match: '(?<=^|[\\t ])(#.*)(?:\\r?\\n|$)',
              captures: { 1: { name: 'comment.line.shell' } },
              endState: body
            }
          : pattern
      ),
      endState: body
    };
  });
  return {
    scopeName: grammar.scopeName,
    patterns: [include('initial_context')],
    repository: {
      initial_context: { patterns: [...heredocs, ...common] },
      comment,
      string: { patterns: strings },
      double_quote_escape_char: source.double_quote_escape_char,
      variable: { patterns: variable },
      special_expansion: source.special_expansion,
      array_access_inline: region(
        '\\[',
        '\\]',
        [include('math'), include('string'), include('special_expansion')],
        'variable.other.shell'
      ),
      interpolation: { patterns: [arithmetic, command, backtick] },
      math: { patterns: math }
    }
  };
}

// Split the established transcript's nested command capture into a region.
// A trailing unescaped newline ends the command; escaped newlines keep it open.
export function shellProfile(grammar) {
  const prompt = grammar.patterns[0];
  const tail = '(.*)$';
  if (!prompt.match?.endsWith(tail) || prompt.captures[3]?.patterns?.[0]?.include !== 'source.shell')
    throw new Error('Shell transcript command capture source changed');
  return {
    scopeName: grammar.scopeName,
    patterns: [
      {
        begin: prompt.match.slice(0, -tail.length).replace('\\p{Greek}', '\\p{Script=Greek}'),
        beginCaptures: { 0: { name: 'meta.prompt.shell-session' } },
        contentName: 'meta.embedded.command.shell',
        end: '(?<=(?:^|[^\\\\])(?:\\\\\\\\)*)(?=\\r?$)',
        hardEnd: true,
        patterns: [{ include: 'source.shell' }]
      }
    ]
  };
}
