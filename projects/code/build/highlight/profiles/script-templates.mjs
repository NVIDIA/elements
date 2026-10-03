// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { adaptRegex } from '../adapters/regex-adapter.mjs';

// Foreign syntax is a lexical boundary inside these build-time copies. Guard
// consuming atoms rather than letting a greedy embedded match swallow ${...}.
const guarded = new Map();
export function guardTemplateRegex(source) {
  if (source instanceof RegExp) return new RegExp(guardTemplateRegex(source.source), source.flags);
  if (typeof source !== 'string') throw new Error('Unsupported template regex source');
  if (guarded.has(source)) return guarded.get(source);
  let result = '';
  for (let i = 0; i < source.length; i++) {
    const start = i;
    const char = source[i];
    if (char === '[') {
      let first = true;
      for (++i; i < source.length; i++) {
        if (source[i] === '\\') i++;
        else if (source.startsWith('[:', i)) {
          const end = source.indexOf(':]', i + 2);
          if (end < 0) throw new Error('Unclosed template POSIX class');
          i = end + 1;
        } else if (source[i] === ']' && !first) break;
        if (source[i] !== '^' || !first) first = false;
      }
      if (i === source.length) throw new Error('Unclosed template character class');
    } else if (char === '\\') {
      const escape = source.slice(i).match(/^\\(?:[pPu]\{[^}]+\}|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|[1-9][0-9]*|.)/)?.[0];
      if (!escape) throw new Error('Trailing template regex escape');
      i += escape.length - 1;
    } else if (char !== '.' && char !== '`') {
      result += char;
      continue;
    }
    const atom = source.slice(start, i + 1);
    let guardedAtom = false;
    if (!/^\\(?:[1-9][0-9]*|[bBAzZG])$/.test(atom)) {
      let native;
      try {
        native = adaptRegex(atom.replace(/\\h/g, char === '[' ? '0-9A-Fa-f' : '[0-9A-Fa-f]')).source;
      } catch (cause) {
        throw new Error(`Unsupported template regex atom ${atom}`, { cause });
      }
      const regex = new RegExp(`^(?:${native})$`, 'u');
      guardedAtom = ['$', '`', '\\'].some(value => regex.test(value));
    }
    result += guardedAtom ? `(?:(?!\\$\\{|\u0060|\\\\)${atom})` : atom;
  }
  guarded.set(source, result);
  return result;
}

// Compile contextual template copies beside the ordinary language profiles.
// Interpolation PUSH/POP leaves the complete embedded stack intact. Backtick
// recovery uses ordinary zero-width POPs in embedded states, so nested JS
// templates inside an interpolation never see the outer template's boundary.
export function scriptTemplateProfiles(profiles) {
  const javascript = profiles.find(profile => profile.scopeName === 'source.js');
  const html = profiles.find(profile => profile.scopeName === 'text.html.basic');
  const css = profiles.find(profile => profile.scopeName === 'source.css');
  if (!javascript || !html || !css) throw new Error('Script templates require JavaScript, HTML, and CSS profiles');
  const related = [];
  const roots = profiles.map(profile => {
    if (!['source.js', 'source.ts', 'source.tsx'].includes(profile.scopeName)) return profile;
    const suffix = `.template.${profile.scopeName}`;
    const names = {
      html: `text.html${suffix}`,
      css: `source.css${suffix}`,
      style: `source.css.style${suffix}`,
      script: `source.js.script${suffix}`
    };
    const interpolation = {
      ...profile.repository['template-substitution-element'],
      patterns: [{ include: `${profile.scopeName}#braces` }, { include: profile.scopeName }]
    };
    const escape = { match: '\\\\(?:\\r?\\n|.)', name: 'constant.character.escape.js' };
    function contextual(source, scopeName, terminator = '') {
      const copies = new Map();
      const repository = {};
      const closing = `(?=\u0060)${terminator ? `|(?=${terminator})` : ''}`;
      function copy(value) {
        if (!value || typeof value !== 'object') return value;
        if (copies.has(value)) return copies.get(value);
        const result = Array.isArray(value) ? [] : {};
        copies.set(value, result);
        for (const [key, child] of Object.entries(value)) {
          if (key === 'repository') continue;
          result[key] = ['match', 'begin', 'end', 'while'].includes(key) ? guardTemplateRegex(child) : copy(child);
        }
        if (result.include?.startsWith('#')) {
          const name = result.include.slice(1);
          if (!(name in repository)) {
            repository[name] = null;
            repository[name] = copy(source.repository[name]);
          }
        }
        if (result.include === 'source.css') result.include = names.style;
        if (result.include === 'source.js') result.include = names.script;
        if (result.patterns && (value === source || result.begin || result.end)) {
          result.patterns = [escape, interpolation, ...result.patterns];
        }
        if (result.begin && result.end) {
          result.patterns ??= [escape, interpolation];
          result.end = `(?:${result.end})|${closing}`;
        }
        if (result.end && !result.begin) result.end = `(?:${result.end})|${closing}`;
        if (result.hardEnd) result.hardEnd = false;
        return result;
      }
      return { ...copy(source), scopeName, repository };
    }
    related.push(
      contextual(html, names.html),
      contextual(css, names.css),
      contextual(css, names.style, '(?i:</style)\\s*>'),
      contextual(javascript, names.script, '(?i:</script)\\s*>')
    );
    const template = profile.repository.template;
    return {
      ...profile,
      repository: {
        ...profile.repository,
        template: {
          ...template,
          patterns: [
            ...['html', 'css'].map(tag => ({
              begin: `(?<![$_[:alnum:]])(${tag})(\\s*)(\u0060)`,
              beginCaptures: { 1: { name: 'entity.name.function' }, 3: { name: 'string.template' } },
              end: '\u0060',
              endCaptures: { 0: { name: 'string.template' } },
              contentName: 'meta.embedded.line',
              patterns: [{ include: names[tag] }]
            })),
            ...template.patterns
          ]
        }
      }
    };
  });
  return [...roots, ...related];
}
