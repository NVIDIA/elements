// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadGrammar } from '../compile.mjs';
import { loadScript } from './load-script.mjs';
import { loadMarkdown } from './load-markdown.mjs';
import { bashProfile, shellProfile } from '../profiles/bash-profile.mjs';
import { cssProfile } from '../profiles/css-profile.mjs';
import { goProfile } from '../profiles/go-profile.mjs';
import { pythonProfile } from '../profiles/python-profile.mjs';

export const languages = [
  'bash',
  'css',
  'go',
  'html',
  'javascript',
  'json',
  'markdown',
  'python',
  'shell',
  'toml',
  'tsx',
  'typescript',
  'xml',
  'yaml'
];

// Build-only selection. Generated modules never import this file.
export async function loadLanguage(language) {
  if (!languages.includes(language)) throw new Error(`Unknown language: ${language}`);
  if (language === 'markdown') return { ...(await loadMarkdown(languages, true)), profile: 'full-supported-fences' };
  if (['javascript', 'typescript', 'tsx', 'html', 'xml'].includes(language)) {
    const loaded = await loadScript(['typescript', 'tsx'].includes(language) ? language : 'javascript');
    const scope = (await loadGrammar(`@shikijs/langs/${language}`)).scopeName;
    return {
      ...loaded,
      grammar: loaded.related.find(grammar => grammar.scopeName === scope),
      profile:
        language === 'typescript'
          ? 'lexical-typescript-and-tagged-templates'
          : 'lexical-script-jsx-and-tagged-templates'
    };
  }
  const source = await loadGrammar(`@shikijs/langs/${language === 'shell' ? 'shellsession' : language}`);
  const grammar =
    language === 'bash'
      ? bashProfile(source)
      : language === 'shell'
        ? shellProfile(source)
        : language === 'css'
          ? cssProfile(source)
          : language === 'go'
            ? goProfile(source, 'compact')
            : language === 'python'
              ? pythonProfile(source, true)
              : source;
  return {
    grammar,
    related: language === 'shell' ? [grammar, bashProfile(await loadGrammar('@shikijs/langs/bash'))] : [grammar],
    languages: language === 'shell' ? ['bash', 'shell'] : [language],
    profile: ['json', 'yaml', 'toml'].includes(language) ? 'adapted-source' : 'selected-lexical'
  };
}
