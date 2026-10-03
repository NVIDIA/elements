// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { adaptToml } from './toml-adapter.mjs';

// Lower source-specific capture grammars into ordinary states and captures.
// The generic scanner never interprets or re-tokenizes a capture grammar.
export function adaptGrammar(grammar) {
  if (grammar.scopeName === 'source.toml') return adaptToml(grammar);
  if (grammar.scopeName === 'source.python') {
    const continuation = grammar.repository['line-continuation'];
    // This end test already succeeds at every non-quote position before EOL.
    // It cannot first arrive at EOL by searching ahead, so its EOL guard can
    // be native `$`; only a test at the current cursor can reach that guard.
    return {
      ...grammar,
      repository: {
        ...grammar.repository,
        ...Object.fromEntries(
          ['fstring-single-brace', 'fstring-multi-brace'].map(name => [
            name,
            {
              ...grammar.repository[name],
              contentName: 'meta.embedded.line',
              beginCaptures: { 0: { name: 'punctuation.definition.template-expression.python' } },
              endCaptures: { 0: { name: 'punctuation.definition.template-expression.python' } }
            }
          ])
        ),
        'line-continuation': {
          ...continuation,
          patterns: continuation.patterns.map(rule => {
            if (!rule.end?.includes('\\G()$')) return rule;
            return { ...rule, end: rule.end.replace('\\G()$', '()$') };
          })
        }
      }
    };
  }
  if (grammar.scopeName !== 'source.yaml') return grammar;
  const scalar = grammar.repository?.['block-scalar'];
  if (!scalar?.beginCaptures?.[5]?.patterns) return grammar;
  const tail = '(.*\\n?)';
  const nested = scalar.beginCaptures[5].patterns;
  if (
    !scalar.begin.endsWith(tail) ||
    nested.length !== 2 ||
    nested[0].include !== '#comment' ||
    nested[1].match !== '.+' ||
    scalar.patterns?.length !== 1
  ) {
    throw new Error('YAML block scalar capture needs an adapter');
  }
  const prefix = scalar.begin.slice(0, -tail.length);
  const marker = { name: 'string.unquoted.block.yaml' };
  const binding = { name: 'variable.other.yaml' };
  const meta = { name: 'meta.directive.yaml' };
  const property = grammar.repository.property;
  const alias = grammar.repository['flow-alias'];
  return {
    ...grammar,
    repository: {
      ...grammar.repository,
      'block-scalar': {
        ...scalar,
        begin: `${prefix}([ \\t]*)(?:(#[^\\r\\n]*)|([^\\r\\n]*))(\\r?\\n)?`,
        beginCaptures: {
          1: marker,
          2: marker,
          3: scalar.beginCaptures[3],
          4: scalar.beginCaptures[4],
          6: { name: 'comment.line.number-sign.yaml' },
          7: { name: 'invalid.illegal.expected-comment-or-newline.yaml' }
        }
      },
      property: {
        ...property,
        patterns: property.patterns.map((rule, index) =>
          index
            ? rule
            : {
                ...rule,
                captures: { ...rule.captures, 1: meta, 2: meta, 3: binding }
              }
        )
      },
      'flow-alias': { ...alias, captures: { ...alias.captures, 1: meta, 2: meta, 3: binding } }
    }
  };
}
