// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadGrammar } from '../compile.mjs';
import { markdownFenceProfile, markdownProfile } from '../profiles/markdown-profile.mjs';
import { goProfile } from '../profiles/go-profile.mjs';
import { cssProfile } from '../profiles/css-profile.mjs';
import { markupProfile } from '../profiles/markup-profile.mjs';
import { scriptProfile } from '../profiles/script-profile.mjs';
import { bashProfile, shellProfile } from '../profiles/bash-profile.mjs';
import { scriptTemplateProfiles } from '../profiles/script-templates.mjs';
import { pythonProfile } from '../profiles/python-profile.mjs';

// Build-only dependency closure shared by generation, corpus, and probes.
export async function loadMarkdown(languages = [], full = false) {
  const markdown = await loadGrammar('@shikijs/langs/markdown');
  const required = new Set(languages);
  if (languages.includes('shell')) required.add('bash');
  if (full || languages.some(language => ['html', 'xml', 'javascript', 'typescript', 'tsx'].includes(language))) {
    for (const language of ['html', 'xml', 'javascript', 'css']) required.add(language);
  }
  if (full) required.add('yaml');
  required.delete('markdown');
  const sources = new Map(
    await Promise.all(
      [...required].map(async language => [
        language,
        await loadGrammar(`@shikijs/langs/${language === 'shell' ? 'shellsession' : language}`)
      ])
    )
  );
  let related = [...sources].map(([language, source]) => {
    if (language === 'bash') return bashProfile(source);
    if (language === 'shell') return shellProfile(source);
    if (language === 'go') return goProfile(source, 'compact');
    if (language === 'python') return pythonProfile(source, true);
    if (language === 'css') return cssProfile(source);
    if (language === 'html' || language === 'xml') return markupProfile(source, sources.get('xml'));
    if (['javascript', 'typescript', 'tsx'].includes(language))
      return { ...scriptProfile(source, language), scopeName: source.scopeName };
    return source;
  });
  if (required.has('javascript')) related = scriptTemplateProfiles(related);
  const grammar = full ? markdownProfile(markdown, languages) : markdownFenceProfile(markdown, languages);
  if (full) {
    const html = related.find(source => source.scopeName === 'text.html.basic');
    related.push({ ...html, scopeName: 'text.html.derivative' });
  }
  return { grammar, related: [grammar, ...related], languages: [...required, 'markdown'] };
}
