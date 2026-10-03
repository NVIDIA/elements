// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { loadGrammar } from '../compile.mjs';
import { scriptProfile } from '../profiles/script-profile.mjs';
import { cssProfile } from '../profiles/css-profile.mjs';
import { markupProfile } from '../profiles/markup-profile.mjs';
import { scriptTemplateProfiles } from '../profiles/script-templates.mjs';

export async function loadScript(language = 'javascript', options = {}) {
  const names = ['javascript', 'html', 'xml', 'css', ...(['typescript', 'tsx'].includes(language) ? [language] : [])];
  const sources = new Map(
    await Promise.all(names.map(async name => [name, await loadGrammar(`@shikijs/langs/${name}`)]))
  );
  const related = scriptTemplateProfiles(
    names.map(name => {
      const source = sources.get(name);
      if (['javascript', 'typescript', 'tsx'].includes(name))
        return { ...scriptProfile(source, name, name === language ? options : {}), scopeName: source.scopeName };
      if (name === 'html' || name === 'xml') return markupProfile(source, sources.get('xml'));
      return cssProfile(source);
    })
  );
  return {
    grammar: related.find(profile => profile.scopeName === sources.get(language).scopeName),
    related,
    languages: names
  };
}
