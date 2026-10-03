// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Select only fenced languages that the caller can supply to the compiler.
// The TextMate wrapper consumes its first code line. The outer fence already
// has the closing rule, so compile its embedded include directly into that
// region and mark its end as a boundary for nested embedded grammar frames.
export function markdownFenceProfile(markdown, languages) {
  const selected = new Set(
    languages.map(language => `#fenced_code_block_${{ javascript: 'js', typescript: 'ts' }[language] ?? language}`)
  );
  const patterns = [];
  const found = new Set();
  for (const entry of markdown.repository.fenced_code_block.patterns) {
    if (!selected.has(entry.include)) continue;
    if (entry.include === '#fenced_code_block_shell') continue;
    const fence = markdown.repository[entry.include.slice(1)];
    const wrapper = fence.patterns?.[0];
    if (wrapper?.begin !== '(^|\\G)(\\s*)(.*)' || !wrapper.while || wrapper.patterns?.length !== 1) {
      throw new Error(`Unsupported fenced grammar wrapper: ${entry.include}`);
    }
    patterns.push({ ...fence, patterns: wrapper.patterns, hardEnd: true });
    found.add(entry.include);
  }
  // Specialize the generic boundary while preserving its dynamic closure.
  // Codeblock's `shell` means a transcript; its Bash language is separate.
  for (const [language, scope, aliases = [language]] of [
    ['toml', 'source.toml'],
    ['html', 'text.html.basic'],
    ['bash', 'source.shell', ['bash', 'sh', 'zsh']],
    ['shell', 'text.shell-session', ['shell', 'console', 'shellsession']]
  ]) {
    if (!selected.has(`#fenced_code_block_${language}`) || found.has(`#fenced_code_block_${language}`)) continue;
    const fence = markdown.repository.fenced_code_block_unknown;
    const tail = '(?=([^`]*)?$)';
    if (!fence.begin.endsWith(tail)) throw new Error('Unknown fence source changed');
    patterns.push({
      ...fence,
      begin: fence.begin.slice(0, -tail.length) + `(?=((?i:${aliases.join('|')})(?:\\s+[^\x60]*)?)$)`,
      patterns: [{ include: scope }],
      hardEnd: true
    });
  }
  if (patterns.length !== selected.size) throw new Error('Unknown fenced language in Markdown profile');
  patterns.push(markdown.repository.fenced_code_block_unknown);
  return { scopeName: 'text.html.markdown.profile', patterns };
}

// Lower capture recursion and transparent typography containers to regions.
// The original text remains intact; inline descendants still receive color.
export function markdownProfile(markdown, languages = []) {
  const source = markdown.repository;
  const punctuation = { name: 'punctuation.markdown' };
  const email = {
    ...source['link-email'],
    captures: { 1: punctuation, 2: source['link-email'].captures[2], 3: punctuation }
  };
  const reference = {
    ...source['link-def'],
    captures: {
      ...source['link-def'].captures,
      ...Object.fromEntries([9, 12, 15].map(index => [index, { name: 'string.quoted.title.markdown' }])),
      ...Object.fromEntries([10, 11, 13, 14, 16, 17].map(index => [index, punctuation]))
    }
  };
  const include = name => ({ include: `#${name}` });
  const html = { include: 'text.html.derivative' };
  const fence = markdownFenceProfile(markdown, languages);
  const fences = fence.patterns.map(rule => ({
    ...rule,
    begin: rule.begin.replace('(`{3,}|~{3,})', '(?=([`~]))(`{3,}|~{3,})') + '[^\\r\\n]*',
    beginCaptures: Object.fromEntries(
      Object.entries(rule.beginCaptures).map(([number, capture]) => [
        Number(number) > 2 ? Number(number) + 1 : number,
        capture
      ])
    ),
    end: rule.end.replace('\\3', '\\4\\3*'),
    hardEnd: true,
    contentName: rule.patterns?.length ? 'meta.embedded.fence.markdown' : 'markup.raw.block.markdown'
  }));
  const region = (begin, end, patterns, name) => ({
    begin,
    end,
    beginCaptures: { 0: punctuation },
    endCaptures: { 0: punctuation },
    patterns,
    name
  });
  const inline = ['escape', 'raw', 'link-email', 'link-inet', 'label'].map(include);
  inline.push(html);
  const urlBody = {
    end: '\\)',
    endCaptures: { 0: punctuation },
    name: 'markup.underline.link.markdown',
    patterns: [
      source.escape,
      include('url-round'),
      include('url-angle'),
      include('title-double'),
      include('title-single')
    ]
  };
  const labelBody = [source.escape, source.raw, include('nested-label'), email, source['link-inet'], html];
  const label = {
    begin: '!?\\[',
    beginCaptures: { 0: punctuation },
    end: '\\]\\(',
    endCaptures: { 0: punctuation },
    name: 'string.other.link.title.markdown',
    patterns: [
      {
        match: '(\\]) ?(\\[)([^]\\r\\n]*)(])',
        captures: {
          1: punctuation,
          2: punctuation,
          3: { name: 'constant.other.reference.link.markdown' },
          4: punctuation
        },
        pop: true
      },
      { match: '\\]', captures: { 0: punctuation }, pop: true },
      ...labelBody
    ],
    endState: urlBody
  };
  const heading = {
    begin: '(^|\\G) {0,3}(#{1,6})(?=[\\t ]|$)[\\t ]*',
    beginCaptures: { 2: { name: 'markup.heading.markdown' } },
    end: '\\r?\\n|$',
    name: 'markup.heading.markdown',
    patterns: [include('inline')],
    hardEnd: true
  };
  const lists = source.lists.patterns.map(rule => ({
    ...rule,
    while: '(^|\\G)(?: {2,4}|\\t|[\\t ]*$)',
    patterns: [include('block')]
  }));
  const blockHtml = source.html.patterns.slice(2).map(rule => {
    const prefix = '(?i)(^|\\G)';
    return {
      ...rule,
      begin: rule.begin.startsWith(prefix) ? `(^|\\G)(?i:${rule.begin.slice(prefix.length)})` : rule.begin,
      patterns: [html]
    };
  });
  const rawHtml = {
    begin: '(^|\\G) {0,3}(?=(?i:<(?:script|style|pre)(?:\\s|>|$)))',
    end: '(?i:(?<=</(?:script|style|pre)\\s*>))',
    patterns: [html]
  };
  const front = {
    begin: '\\A(-{3,})([^\\r\\n]*)',
    beginCaptures: { 1: punctuation, 2: { name: 'comment.frontmatter' } },
    end: '^(?: {0,3}\\1-*[\\t ]*|[\\t ]*\\.{3})\\r?$',
    endCaptures: { 0: punctuation },
    contentName: 'meta.embedded.frontmatter.markdown',
    hardEnd: true,
    patterns: [{ include: 'source.yaml' }]
  };
  return {
    scopeName: markdown.scopeName,
    firstPatterns: [front],
    patterns: [include('block')],
    repository: {
      block: {
        patterns: [
          source.separator,
          heading,
          source.blockquote,
          ...lists,
          ...fences,
          source.raw_block,
          reference,
          source.html.patterns[0],
          rawHtml,
          ...blockHtml,
          include('table'),
          include('paragraph')
        ]
      },
      inline: { patterns: inline },
      blockquote: source.blockquote,
      paragraph: {
        ...source.paragraph,
        patterns: [include('inline'), include('heading-setext')]
      },
      'heading-setext': source['heading-setext'],
      escape: source.escape,
      raw: source.raw,
      'link-email': email,
      'link-inet': source['link-inet'],
      label,
      'nested-label': region('\\[', '\\]', labelBody, 'string.other.link.title.markdown'),
      'url-round': region('\\(', '\\)', [include('url-round'), source.escape], 'markup.underline.link.markdown'),
      'url-angle': region('<', '>', [source.escape], 'markup.underline.link.markdown'),
      'title-double': region('"', '"', [source.escape], 'string.quoted.title.markdown'),
      'title-single': region("'", "'", [source.escape], 'string.quoted.title.markdown'),
      table: {
        ...source.table,
        patterns: [source.table.patterns[0], source.table.patterns[1], include('inline')]
      }
    }
  };
}
