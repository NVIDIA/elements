// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Turn section/key capture grammars into normal nested regions. Value rules
// stay source-derived, including cursor anchoring, arrays, and inline tables.
export function adaptToml(grammar) {
  const { groups, key_pair: keys } = grammar.repository;
  const quoted = keys.patterns[1].captures[3].patterns;
  if (
    groups.patterns.length !== 2 ||
    keys.patterns.length !== 4 ||
    quoted.length !== 3 ||
    groups.patterns.some(
      rule => rule.captures[2].patterns.length !== 1 || rule.captures[2].patterns[0].match !== '[^.\\s]+'
    )
  ) {
    throw new Error('TOML capture source changed');
  }
  const punctuation = { name: 'punctuation.definition.variable.toml' };
  const basicKey = {
    begin: '"',
    end: '"',
    name: 'meta.property-name.toml',
    beginCaptures: { 0: punctuation },
    endCaptures: { 0: punctuation },
    patterns: quoted.slice(0, 2)
  };
  const literalKey = {
    begin: "'",
    end: "'",
    name: 'meta.property-name.toml',
    beginCaptures: { 0: punctuation },
    endCaptures: { 0: punctuation }
  };
  const unit = `(?:[-0-9A-Z_a-z]+|"(?:[^"\\\\]|\\\\.)*"|'[^']*')`;
  const header = {
    begin: `(?=${unit}(?:\\s*\\.\\s*${unit})*\\s*=)`,
    end: '=\\s*',
    endCaptures: { 0: { name: 'punctuation.separator.key-value.toml' } },
    patterns: [
      basicKey,
      literalKey,
      { match: '[-0-9A-Z_a-z]+', name: 'meta.property-name.toml' },
      { match: '\\.', name: 'punctuation.separator.variable.toml' }
    ]
  };
  return {
    ...grammar,
    repository: {
      ...grammar.repository,
      groups: {
        patterns: groups.patterns.map((rule, index) => ({
          begin: index ? '^\\s*(\\[\\[)' : '^\\s*(\\[)(?!\\[)',
          end: index ? ']]' : ']',
          beginCaptures: { 1: rule.captures[1] },
          endCaptures: { 0: rule.captures[3] },
          patterns: rule.captures[2].patterns.map(pattern => ({ ...pattern, match: '[^.\\s\\]]+' }))
        }))
      },
      key_pair: {
        patterns: [
          {
            begin: header.begin,
            end: keys.patterns[0].end,
            applyEndPatternLast: true,
            patterns: [header, ...keys.patterns[0].patterns]
          }
        ]
      }
    }
  };
}
