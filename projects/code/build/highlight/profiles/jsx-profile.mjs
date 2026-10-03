// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import javascript from '@shikijs/langs/javascript';
import { adaptRegex } from '../adapters/regex-adapter.mjs';
import { compactCaptures } from '../optimizations/compact-captures.mjs';

const source = javascript.find(grammar => grammar.scopeName === 'source.js');

// Reuse the established JSX subtree for JS and TSX. Only expression bodies and
// type arguments use the selected lexical vocabulary. No JSX runtime machinery.
export function jsxProfile(repository, language, options = {}) {
  for (const [name, rule] of Object.entries(source.repository))
    if (name.startsWith('jsx')) repository[name] = structuredClone(rule);
  repository['jsx-evaluated-code'].patterns = [{ include: '#braces' }, { include: '$self' }];
  repository['jsx-entities'].patterns = repository['jsx-entities'].patterns.map(rule => ({
    match: rule.match,
    name: 'constant.character.escape.entity.js'
  }));
  repository['jsx-type-arguments'] = {
    ...repository['type-arguments'],
    patterns: [
      { include: '#comment' },
      { include: '#qstring-single' },
      { include: '#qstring-double' },
      { include: '#numeric-literal' },
      { include: '#type-primitive' },
      { include: '#jsx-type-arguments' },
      { match: '(?<![$_[:alnum:]])(?:extends|keyof|typeof|in|out|const)(?![$_[:alnum:]])', name: 'keyword.control' },
      { match: '[$_[:alpha:]][$_[:alnum:]]*', name: 'entity.name.type' }
    ]
  };
  repository['jsx-tag'].patterns[0].patterns = repository['jsx-tag'].patterns[0].patterns.map(rule =>
    rule.include === '#type-arguments' ? { include: '#jsx-type-arguments' } : rule
  );
  if (language === 'tsx') {
    const identifier = '[$_[:alpha:]][$_[:alnum:]]*';
    // A comma, default, or constraint cannot start a JSX attribute.
    const guard = `(?!<\\s*${identifier}\\s*(?:[,=]|extends\\b))`;
    for (const name of ['jsx-tag-in-expression', 'jsx-tag-without-attributes-in-expression'])
      repository[name].begin = repository[name].begin.replace('\\s*', `\\s*${guard}`);
  }
  if (!options.jsxWrappers)
    repository.jsx.patterns = repository.jsx.patterns.map(({ include }) => {
      const wrapper = repository[include.slice(1)];
      const tag = repository[wrapper.patterns[0].include.slice(1)];
      const boundary = wrapper.begin.lastIndexOf('(?=(<)');
      if (boundary < 0) throw new Error('JSX expression context source changed');
      // Fuse the transparent expression wrapper into its tag's begin. Its
      // lookahead and negative-lookahead end duplicated the entire header.
      // Context captures are unused; erase them before the tag's captures.
      const context = compactCaptures(adaptRegex(wrapper.begin.slice(0, boundary)), []).source;
      return { ...tag, begin: context + tag.begin };
    });
}
