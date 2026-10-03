// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Raw Python strings are string literals. The source's separate regexp parser
// interprets lowercase raw strings as regexes. Keep Python's source-derived
// raw string rules for every raw literal, independent of its contents.
export function pythonProfile(grammar, lexical = false) {
  if (!grammar.repository.regexp || !grammar.repository.string) throw new Error('Missing Python string sources');
  const repository = { ...grammar.repository, regexp: { include: '#string' } };
  // The source treats lowercase r/rb as regexes and uppercase R/RB as strings.
  // Once the regex branch disappears, both cases must enter raw string states.
  for (const name of [
    'string-raw-quoted-single-line',
    'string-raw-quoted-multi-line',
    'string-raw-bin-quoted-single-line',
    'string-raw-bin-quoted-multi-line'
  ]) {
    const rule = repository[name];
    if (!rule?.begin?.includes('R') || /\[Rr\]/.test(rule.begin))
      throw new Error(`Changed Python raw string source: ${name}`);
    repository[name] = { ...rule, begin: rule.begin.replace(/R/g, '[Rr]') };
  }
  // Python replacement fields can contain comments and newlines even when the
  // outer literal uses one quote. Ordinary stack nesting protects its quote.
  for (const name of ['fstring-single-brace', 'fstring-terminator-single-tail']) {
    const rule = repository[name];
    if (!rule?.end?.endsWith('|(?=\\n)')) throw new Error(`Changed Python replacement source: ${name}`);
    repository[name] = { ...rule, end: rule.end.slice(0, -'|(?=\\n)'.length) };
  }
  repository['fstring-illegal-single-brace'] = { include: '#fstring-single-brace' };
  repository['f-expression'] = { patterns: [{ include: '#comments' }, ...repository['f-expression'].patterns] };
  const id = '[_[:alpha:]]\\p{word}*';
  for (const name of ['function-def-name', 'class-name']) {
    repository[name] = {
      ...repository[name],
      patterns: repository[name].patterns.map(rule => (rule.match ? { ...rule, match: `(${id})` } : rule))
    };
  }
  repository['class-declaration'] = {
    ...repository['class-declaration'],
    patterns: repository['class-declaration'].patterns.map(rule => ({
      ...rule,
      begin: rule.begin.replace(/\\w/g, '\\p{word}')
    }))
  };
  repository['annotated-parameter'] = {
    ...repository['annotated-parameter'],
    begin: `(?<!\\p{word})(${id})\\s*(:)`
  };
  repository.parameters = {
    ...repository.parameters,
    patterns: repository.parameters.patterns.map(rule =>
      rule.match ? { ...rule, match: rule.match.replace(/\\w/g, '\\p{word}') } : rule
    )
  };
  if (!lexical) return { ...grammar, repository };
  // Retain source quote, interpolation, escape, continuation, and vocabulary
  // rules; replace expression prediction with ordinary bracket regions.
  repository['f-expression'] = { patterns: [{ include: '$self' }] };
  for (const name of ['round-braces', 'curly-braces', 'list'])
    repository[name] = { ...repository[name], patterns: [{ include: '$self' }] };
  repository.decorator = {
    ...repository.decorator,
    end: '$|(?=#)',
    patterns: [{ include: '#decorator-name' }, { include: '#round-braces' }]
  };
  const declarations = [
    [repository['function-declaration'], 'entity.name.function.python'],
    [repository['class-declaration'].patterns[0], 'entity.name.type.class.python']
  ].map(([rule, name]) => ({
    begin: rule.begin,
    beginCaptures: rule.beginCaptures,
    end: rule.end,
    patterns: [{ match: id, name, pop: true }]
  }));
  return {
    ...grammar,
    repository,
    patterns: [
      { include: '#comments' },
      { include: '#string' },
      { include: '#literal' },
      ...declarations,
      ...repository.import.patterns.map(rule => ({ match: rule.begin, captures: rule.beginCaptures })),
      ...repository.lambda.patterns
        .filter(rule => rule.begin)
        .map(rule => ({ match: rule.begin, captures: rule.beginCaptures })),
      { include: '#decorator' },
      { include: '#statement-keyword' },
      { include: '#builtin-functions' },
      { include: '#builtin-types' },
      { include: '#builtin-exceptions' },
      { include: '#magic-names' },
      { include: '#special-variables' },
      { include: '#operator' },
      { include: '#assignment-operator' },
      { include: '#line-continuation' },
      { include: '#round-braces' },
      { include: '#curly-braces' },
      { include: '#list' },
      { match: `\\.(${id})(?=\\s*\\()`, captures: { 0: { name: 'punctuation' }, 1: { name: 'entity.name.function' } } },
      { match: `\\.(${id})`, captures: { 0: { name: 'punctuation' }, 1: { name: 'variable.other.property' } } },
      { match: `${id}(?=\\s*\\()`, name: 'entity.name.function.python' },
      { match: id, name: 'variable.other.python' },
      { include: '#punctuation' }
    ]
  };
}
