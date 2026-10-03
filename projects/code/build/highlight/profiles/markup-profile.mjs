// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import hljs from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';

// TextMate supplies comments, entities, CDATA, and DTD regions. The current
// grammar supplies Unicode tag/attribute names, without tag-validation lists.
export function markupProfile(grammar, xmlGrammar = grammar, embedded = ['javascript', 'css']) {
  const definition = xml(hljs);
  const nameRule = definition.contains.find(rule => rule.contains?.[0]?.className === 'name' && rule.contains[0].starts)
    ?.contains[0];
  const expression = value => (value instanceof RegExp ? value.source : value);
  if (!nameRule) throw new Error('Missing markup identifier source');
  const tagName = expression(nameRule.begin);
  const attributeName = expression(nameRule.starts.contains.find(rule => rule.className === 'attr').begin);
  const source = xmlGrammar.repository;
  const punctuation = { name: 'punctuation.tag.markup' };
  const entity = { match: source.entity.match, name: 'constant.character.escape.entity.markup' };
  const quotes = [source.doublequotedString, source.singlequotedString].map(rule => ({
    ...rule,
    patterns: [{ include: '#entity' }, { include: '#bare-ampersand' }]
  }));
  const unquoted = {
    begin: '(?=[^"\'`<=>\\s]|/(?!>))',
    end: '(?=\\s|/?>|$)',
    name: 'string.unquoted.markup',
    patterns: [
      entity,
      { include: '#bare-ampersand' },
      { match: '(?:[^&"\'/<=>`\\s]|/(?!>))+', name: 'string.unquoted.markup' }
    ]
  };
  const attributes = [
    {
      begin: '=\\s*',
      end: '(?<=\\S)(?<!=)|(?=/?>)',
      beginCaptures: { 0: punctuation },
      patterns: [...quotes, unquoted]
    },
    { match: attributeName, name: 'entity.other.attribute-name.markup' }
  ];
  const header = name => ({
    begin: `(<[/]?)(${name})(?=[\\s/>])`,
    end: '/?>',
    beginCaptures: { 1: punctuation, 2: { name: 'entity.name.tag.markup' } },
    endCaptures: { 0: punctuation },
    patterns: attributes
  });
  const modes = definition.contains.filter(
    rule => rule.starts?.subLanguage && embedded.includes(rule.starts.subLanguage)
  );
  const embeddedTags = modes.map(mode => {
    const name = mode.starts.subLanguage === 'css' ? 'style' : 'script';
    return {
      ...header(`(?i:${name})`),
      begin: `(<)((?i:${name}))(?=[\\s/>])`,
      end: '>',
      patterns: [{ match: '/>', captures: { 0: punctuation }, pop: true }, ...attributes],
      endState: {
        end: `(?=(?i:</${name})\\s*>)`,
        contentName: 'meta.embedded.line',
        hardEnd: true,
        patterns: [{ include: mode.starts.subLanguage === 'css' ? 'source.css' : 'source.js' }]
      }
    };
  });
  const normalComment = source.comments.patterns.find(rule => rule.begin === '<!--');
  const comment = grammar.repository.comment ?? {
    ...normalComment,
    patterns: normalComment.patterns.map(rule => ({ match: rule.begin, captures: rule.captures }))
  };
  const dtd = xmlGrammar.patterns.find(rule => rule.name === 'meta.tag.sgml.doctype.xml');
  const cdata = xmlGrammar.patterns.find(rule => rule.name === 'string.unquoted.cdata.xml');
  const processing = xmlGrammar.patterns.find(rule => rule.name === 'meta.tag.preprocessor.xml');
  if (!dtd || !cdata || !processing) throw new Error('Missing markup region source');
  return {
    scopeName: grammar.scopeName,
    patterns: [
      { ...processing, name: 'meta.directive.markup', patterns: attributes },
      comment,
      { ...dtd, name: 'meta.directive.doctype.markup' },
      cdata,
      ...embeddedTags,
      header(tagName),
      entity,
      { include: '#bare-ampersand' },
      { match: '<>|</>', name: 'punctuation.tag.fragment.markup' }
    ],
    repository: {
      entity,
      'bare-ampersand': source['bare-ampersand'],
      internalSubset: source.internalSubset,
      EntityDecl: source.EntityDecl,
      parameterEntity: source.parameterEntity,
      doublequotedString: quotes[0],
      singlequotedString: quotes[1],
      comments: { patterns: [comment] }
    }
  };
}
