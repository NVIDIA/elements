// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { categories } from '../../src/internal/highlight/categories.mjs';
import { compactCaptures } from './optimizations/compact-captures.mjs';
import { adaptRegex } from './adapters/regex-adapter.mjs';
import { adaptGrammar } from './adapters/grammar-adapters.mjs';
import { asciiRegex } from './adapters/ascii-regex.mjs';
import { compactRules } from './optimizations/compact-rules.mjs';

const categoryId = Object.fromEntries(categories.map((name, index) => [name, index]));
const relatedByRoot = new WeakMap();

export function category(scope = '') {
  if (/invalid|illegal/.test(scope)) return categoryId.invalid;
  if (/comment/.test(scope)) return categoryId.comment;
  if (/punctuation\.definition\.string/.test(scope)) return categoryId.string;
  if (/escape/.test(scope)) return categoryId.escape;
  if (/regexp|regex/.test(scope)) return categoryId.regex;
  if (/(?:^|[.\s])(?:numeric|number)(?:[.\s]|$)/.test(scope)) return categoryId.number;
  if (/property-name|meta\.property-name|variable\.other\.property/.test(scope)) return categoryId.property;
  if (/meta\.attribute-selector|selector\.attribute/.test(scope)) return categoryId['selector-attribute'];
  if (/attribute-name|entity\.name\.attribute/.test(scope)) return categoryId.attribute;
  if (/entity\.name\.tag\.yaml/.test(scope)) return categoryId.property;
  if (/entity\.name\.tag/.test(scope)) return categoryId.tag;
  if (/selector/.test(scope)) return categoryId.selector;
  if (/support\.function\.builtin/.test(scope)) return categoryId.builtin;
  if (/entity\.name\.function|support\.function/.test(scope)) return categoryId.function;
  if (/entity\.name\.(?:type\.)?class/.test(scope)) return categoryId.class;
  if (
    /storage\.modifier|storage\.type\.(?:class|interface|enum|function|type|namespace|var|let|const)(?:\.|$)/.test(
      scope
    )
  )
    return categoryId.keyword;
  if (/storage\.type\.string/.test(scope)) return categoryId.string;
  if (/storage\.type\.format/.test(scope)) return categoryId.meta;
  if (/storage\.type|entity\.name\.type|support\.type/.test(scope)) return categoryId.type;
  if (/support\.(?:constant|variable)|support\.class/.test(scope)) return categoryId.builtin;
  if (/(?:^|\s)variable(?:\.|$)/.test(scope)) return categoryId.variable;
  if (/constant\.language|constant\.other|boolean|null|undefined/.test(scope)) return categoryId.literal;
  if (/keyword/.test(scope)) return categoryId.keyword;
  if (/markup\.inserted|markup\.addition/.test(scope)) return categoryId.addition;
  if (/markup\.deleted|markup\.deletion/.test(scope)) return categoryId.deletion;
  if (/markup\.underline\.link|string\.other\.link/.test(scope)) return categoryId.link;
  if (/markup\.raw/.test(scope)) return categoryId.string;
  if (/markup\.heading|punctuation\.definition\.list/.test(scope)) return categoryId.keyword;
  if (/markup\.quote/.test(scope)) return categoryId.comment;
  if (/meta\.(?:preprocessor|directive|shebang|prompt)|entity\.name\.section/.test(scope)) return categoryId.meta;
  if (/string|quoted/.test(scope)) return categoryId.string;
  if (/punctuation/.test(scope)) return categoryId.punctuation;
  return 0;
}

function foldInlineCase(source) {
  if (source.startsWith('(?i)')) source = `(?i:${source.slice(4)})`;
  let output = '';
  const groups = [false];
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (source.startsWith('(?i:', i)) {
      output += '(?:';
      groups.push(true);
      i += 3;
    } else if (char === '\\') {
      output += char + (source[++i] ?? '');
    } else if (char === '[') {
      const start = i;
      do {
        if (source[i] === '\\') i++;
        i++;
      } while (i < source.length && source[i] !== ']');
      const characterClass = source.slice(start, i + 1);
      if (groups[groups.length - 1]) {
        let extra = '';
        for (let j = 1; j < characterClass.length - 1; j++) {
          const char = characterClass[j];
          if (char === '\\') {
            const escape = characterClass
              .slice(j)
              .match(/^\\(?:[pPu]\{[^}]+\}|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|.)/)?.[0];
            if (!escape) throw new Error(`Unclosed case-fold class: ${characterClass}`);
            if (/^\\[pPu]|^\\x/.test(escape))
              throw new Error(`Case-insensitive escaped class needs an adapter: ${characterClass}`);
            j += escape.length - 1;
          } else if (/[A-Za-z]/.test(char)) {
            const flipped = value => (value === value.toUpperCase() ? value.toLowerCase() : value.toUpperCase());
            if (characterClass[j + 1] === '-' && /[A-Za-z]/.test(characterClass[j + 2] ?? '')) {
              if ((char === char.toUpperCase()) !== (characterClass[j + 2] === characterClass[j + 2].toUpperCase()))
                throw new Error(`Mixed-case class range needs an adapter: ${characterClass}`);
              extra += `${flipped(char)}-${flipped(characterClass[j + 2])}`;
              j += 2;
            } else extra += flipped(char);
          }
        }
        output += characterClass.slice(0, -1) + extra + ']';
      } else output += characterClass;
    } else if (char === '(') {
      output += char;
      groups.push(groups[groups.length - 1]);
    } else if (char === ')') {
      output += char;
      groups.pop();
    } else if (groups[groups.length - 1] && /[A-Za-z]/.test(char)) {
      output += `[${char.toLowerCase()}${char.toUpperCase()}]`;
    } else {
      output += char;
    }
  }
  return output;
}

function normalize(source, nativeCase = false) {
  if (/\(\?x\)/.test(source)) {
    source = source.replace(/\(\?x\)/g, '');
    let compact = '';
    let escaped = false;
    let inClass = false;
    let comment = false;
    for (const char of source) {
      if (comment) {
        if (char === '\n') comment = false;
        continue;
      }
      if (escaped) {
        compact += `\\${char}`;
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '[') {
        inClass = true;
        compact += char;
      } else if (char === ']') {
        inClass = false;
        compact += char;
      } else if (!inClass && char === '#') {
        comment = true;
      } else if (inClass || !/\s/.test(char)) {
        compact += char;
      }
    }
    source = compact;
  }
  source = nativeCase ? (source.startsWith('(?i)') ? `(?i:${source.slice(4)})` : source) : foldInlineCase(source);
  let adapted = '';
  let inClass = false;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === '\\') {
      const next = source[i + 1];
      if (next === 'h') {
        adapted += inClass ? '0-9A-Fa-f' : '[0-9A-Fa-f]';
      } else if (next === 'H' && !inClass) {
        adapted += '[^0-9A-Fa-f]';
      } else if (next === 'A' && !inClass) {
        adapted += '^';
      } else {
        adapted += char + (next ?? '');
      }
      i++;
    } else {
      if (char === '[') inClass = true;
      if (char === ']') inClass = false;
      adapted += char;
    }
  }
  source = adapted;
  const checked = nativeCase ? source.replace(/\(\?-?i:/g, '(?:') : source;
  if (/\\[AGKzRh]/.test(source) || /\(\?[^:=!<>]/.test(checked)) {
    throw new Error(`Oniguruma-only regex needs an adapter: ${source}`);
  }
  return adaptRegex(source);
}

export async function loadGrammar(input) {
  if (input.startsWith('@shikijs/langs/')) {
    const grammars = (await import(input)).default;
    const name = input.slice(input.lastIndexOf('/') + 1);
    const grammar = Array.isArray(grammars)
      ? (grammars.find(candidate => candidate.name === name) ?? (grammars.length === 1 ? grammars[0] : undefined))
      : undefined;
    if (!grammar) throw new Error(`No root grammar named ${name} in ${input}`);
    relatedByRoot.set(grammar, grammars);
    return grammar;
  }
  return JSON.parse(await readFile(input, 'utf8'));
}

// Count capturing groups and relocate numeric backreferences when a rule is wrapped
// as one alternative in a combined RegExp. TextMate's numeric captures stay local.
function combineSource(source, outer) {
  let groups = 0;
  let rewritten = '';
  let inClass = false;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === '\\') {
      const next = source[i + 1];
      if (!inClass && next && /[1-9]/.test(next)) {
        let end = i + 2;
        while (/[0-9]/.test(source[end] ?? '')) end++;
        rewritten += `\\${outer + Number(source.slice(i + 1, end))}`;
        i = end - 1;
      } else {
        rewritten += char + (next ?? '');
        i++;
      }
    } else {
      if (char === '[') inClass = true;
      if (char === ']') inClass = false;
      if (char === '(' && !inClass && source[i + 1] !== '?') groups++;
      rewritten += char;
    }
  }
  return [rewritten, groups];
}

function capturePairs(captures, outer, indexes) {
  return Object.entries(captures ?? {}).flatMap(([number, entry]) => {
    if (entry.patterns || entry.include) throw new Error('Nested capture grammar needs a build-time adapter');
    const mapped = category(entry.name) || (entry.name?.startsWith('meta.embedded.') ? -1 : 0);
    return mapped ? [outer + (indexes?.[Number(number)] ?? Number(number)), mapped] : [];
  });
}

function cursorVariants(entry) {
  const prefix = entry.source.startsWith('(^|\\G)')
    ? '(^|\\G)'
    : entry.source.startsWith('(?:^|\\G)')
      ? '(?:^|\\G)'
      : '';
  if (!prefix) return [entry];
  const capture = prefix[1] === '?' ? '(?:)' : '()';
  const rest = entry.source.slice(prefix.length);
  return [
    { ...entry, source: `${prefix[1] === '?' ? '(?:^)' : '(^)'}${rest}` },
    { ...entry, source: `\\G${capture}${rest}` }
  ];
}

function continuationSource(source, captures, norm = normalize) {
  source = source.replace(/\\([1-9][0-9]*)/g, (_, number) => `\\${captures[Number(number)] ?? number}`);
  if (source.startsWith('(^|\\G)')) source = `()${source.slice(6)}`;
  else if (source.startsWith('(?:^|\\G)')) source = `(?:)${source.slice(8)}`;
  else if (source.startsWith('\\G')) source = source.slice(2);
  return norm(source).source;
}

function dynamicEndSources(source, captures, norm = normalize) {
  if (source.includes('(?>')) throw new Error('Atomic dynamic end needs an adapter');
  source = source.replace(/\\([1-9][0-9]*)/g, (_, number) => `\\${captures[Number(number)] ?? number}`);
  const prefix = source.startsWith('(^|\\G)') ? '(^|\\G)' : source.startsWith('(?:^|\\G)') ? '(?:^|\\G)' : '';
  if (prefix) {
    const rest = source.slice(prefix.length);
    const capturing = prefix[1] !== '?';
    return [norm(`${capturing ? '(^)' : '(?:^)'}${rest}`).source, norm(`${capturing ? '()' : '(?:)'}${rest}`).source];
  }
  if (source.startsWith('\\G')) return ['', norm(source.slice(2)).source];
  return [norm(source).source, ''];
}

export function compileGrammar(grammar, relatedGrammars = relatedByRoot.get(grammar) ?? [grammar], options = {}) {
  const norm = source => normalize(source, options.nativeCase);
  if (options.ascii && !options.shared) throw new Error('ASCII expressions require the shared representation');
  const root = grammar;
  grammar = adaptGrammar(root);
  relatedGrammars = relatedGrammars.map(related => (related === root ? grammar : adaptGrammar(related)));
  if (grammar.injections || grammar.injectionSelector) throw new Error('Injection grammar needs a build-time adapter');
  const states = [];
  const rules = [];
  const stateByRegion = new Map();
  const expressions = [];
  const expressionIds = new Map();
  const ends = new Map();
  function expression(source, sticky = 0) {
    if (!source) return -1;
    const key = `${sticky}:${source}`;
    if (!expressionIds.has(key)) {
      expressionIds.set(key, expressions.length);
      const ascii = options.ascii ? asciiRegex(source) : source;
      expressions.push([source, sticky, ...(ascii !== source ? [ascii] : [])]);
    }
    return expressionIds.get(key);
  }
  function separateEnd(region) {
    if (
      !options.shared ||
      region === grammar ||
      !region.end ||
      region.endState ||
      region.applyEndPatternLast ||
      /\\[1-9G]/.test(region.end)
    )
      return null;
    if (!ends.has(region)) {
      const original = norm(region.end);
      const captures = region.endCaptures ?? region.captures;
      const normalized = compactCaptures(
        original,
        capturePairs(captures, 0, original.captures).filter((_, i) => i % 2 === 0)
      );
      ends.set(region, { source: -expression(normalized.source || '(?:)') - 1, captures: normalized.captures });
    }
    return ends.get(region);
  }
  const byScope = new Map(relatedGrammars.map(related => [related.scopeName, related]));

  function expand(patterns, owner, seen = new Set()) {
    const result = [];
    for (const pattern of patterns ?? []) {
      if (!pattern.include) {
        result.push([pattern, owner]);
        continue;
      }
      const key = pattern.include;
      const [scopeName, repositoryName] = key.split('#');
      const target = key === '$base' ? grammar : key === '$self' || key[0] === '#' ? owner : byScope.get(scopeName);
      const included =
        key === '$base' || key === '$self' || (key[0] !== '#' && !repositoryName)
          ? target
          : target?.repository?.[repositoryName || key.slice(1)];
      if (!included) {
        throw new Error(`External or unknown include: ${key}`);
      }
      const identity = `${target.scopeName}:${key}`;
      if (seen.has(identity)) continue;
      const includedRules = included.match || included.begin ? [included] : included.patterns;
      result.push(...expand(includedRules ?? [], target, new Set([...seen, identity])));
    }
    return result;
  }

  function stateFor(region, owner) {
    if (region.endState && (region.while || /\\[1-9]/.test(region.end)))
      throw new Error('End-state continuation needs an adapter');
    if (region.applyEndPatternLast && /\\[1-9]/.test(region.end))
      throw new Error('Dynamic end priority override needs a build-time adapter');
    const pendingEnd = Boolean(region.endState && /\\[1-9]/.test(region.endState.end));
    if (region.endState?.endState || (pendingEnd && (region.hardEnd || region.endState.while)))
      throw new Error('Deferred end needs a single phase and no header boundary or body continuation');
    if (stateByRegion.has(region)) return stateByRegion.get(region);
    const id = states.length;
    stateByRegion.set(region, id);
    states.push(null);
    const entries = [];
    const endEntries = [];
    if (region.end && !/\\[1-9]/.test(region.end) && !separateEnd(region)) {
      // The YAML block scalar has one line-start end and one delayed cursor
      // end. Put them in separate scanner streams at compile time.
      const ends = region.end === '^(?=\\S)|(?!\\G)' ? ['^(?=\\S)', '(?!\\G)'] : [region.end];
      for (const source of ends) endEntries.push({ source, action: region.endState ? 4 : 2, region, owner });
    }
    if (!region.applyEndPatternLast) entries.push(...endEntries);
    for (const [pattern, patternOwner] of expand(region.patterns, owner)) {
      if (pattern.match) {
        if (pattern.endState && pattern.endState !== region.endState)
          throw new Error('Match phase must use its enclosing region phase');
        entries.push({
          source: pattern.match,
          action: pattern.endState ? 4 : pattern.pop ? 3 : 0,
          region: pattern,
          owner: patternOwner
        });
      } else if (pattern.begin && (pattern.end || pattern.while))
        entries.push({ source: pattern.begin, action: 1, region: pattern, owner: patternOwner });
      else throw new Error(`Unsupported TextMate rule: ${JSON.stringify(pattern)}`);
    }

    if (region.applyEndPatternLast) entries.push(...endEntries);
    const streams = [
      { source: '', groups: 0, branches: [] },
      { source: '', groups: 0, branches: [] },
      { source: '', groups: 0, branches: [] }
    ];
    const seenSources = new Set();
    for (const entry of entries.flatMap(cursorVariants)) {
      if (seenSources.has(entry.source)) continue;
      seenSources.add(entry.source);
      // A leading Oniguruma \G is a sticky match at the current cursor. Keep
      // those rules in a second combined expression; all other rules search ahead.
      // An exact negative cursor anchor searches only after the cursor.
      const delayed = entry.source === '(?!\\G)';
      const anchored = entry.source.startsWith('\\G');
      const stream = streams[delayed ? 2 : Number(anchored)];
      const outer = stream.groups + 1;
      const rule = entry.region;
      const captures =
        entry.action === 2 || entry.action === 4
          ? (rule.endCaptures ?? rule.captures)
          : entry.action === 1
            ? (rule.beginCaptures ?? rule.captures)
            : rule.captures;
      const original = norm(delayed ? '' : entry.source.slice(anchored ? 2 : 0));
      const needed = capturePairs(captures, 0, original.captures).filter((_, index) => index % 2 === 0);
      if (entry.action === 1) {
        for (const reference of `${rule.end ?? ''}|${rule.while ?? ''}|${rule.endState?.end ?? ''}`.matchAll(
          /\\([1-9][0-9]*)/g
        )) {
          const index = original.captures[Number(reference[1])];
          if (index === undefined)
            throw new Error(`Dynamic end or continuation references missing begin capture ${reference[1]}`);
          needed.push(index);
        }
      }
      const normalized = compactCaptures(original, needed);
      const [body, count] = combineSource(normalized.source, outer);
      stream.source += `${stream.source ? '|' : ''}(${body})`;
      stream.groups += count + 1;
      const destination = entry.action === 4 ? rule.endState : rule;
      if (entry.action === 4 && (!destination.end || destination.while)) {
        throw new Error('End-state transition requires an end without a continuation');
      }
      const child = entry.action === 1 || entry.action === 4 ? stateFor(destination, entry.owner) : -1;
      const endTemplate = pendingEnd && entry.action === 4 ? null : rule.endState?.end || rule.end;
      let [dynamicEnd, stickyEnd] =
        entry.action === 1 && /\\[1-9]/.test(endTemplate)
          ? dynamicEndSources(endTemplate, normalized.captures, norm)
          : ['', ''];
      if (entry.action === 4 && pendingEnd) dynamicEnd = 0;
      const separate = (entry.action === 1 || entry.action === 4) && separateEnd(destination);
      const boundary =
        !separate &&
        ((entry.action === 4 && !pendingEnd) || (entry.action === 1 && rule.hardEnd && !dynamicEnd && !stickyEnd))
          ? norm(destination.end)
          : null;
      if (boundary) dynamicEnd = boundary.source;
      if (separate) dynamicEnd = separate.source;
      if (boundary && /\\[1-9]/.test(boundary.source))
        throw new Error('Static boundary backreference needs an adapter');
      const continuation =
        entry.action === 1 && rule.while ? continuationSource(rule.while, normalized.captures, norm) : '';
      const ruleId =
        rules.push([
          entry.action,
          child,
          category(destination.contentName ?? destination.name) ||
            (destination.contentName?.startsWith('meta.embedded.') ? -1 : 0),
          capturePairs(captures, outer, normalized.captures),
          dynamicEnd,
          entry.action === 1 || entry.action === 4
            ? capturePairs(destination.endCaptures ?? destination.captures, 0, separate?.captures ?? boundary?.captures)
            : [],
          continuation,
          entry.action === 1 ? capturePairs(rule.whileCaptures ?? rule.captures, 0) : [],
          ...(stickyEnd || destination.hardEnd ? [stickyEnd, destination.hardEnd ? 1 : 0] : [])
        ]) - 1;
      stream.branches.push(outer, ruleId);
    }
    if (streams[0].source) new RegExp(streams[0].source, 'gdu');
    if (streams[1].source) new RegExp(streams[1].source, 'ydu');
    if (streams[2].source) new RegExp(streams[2].source, 'gdu');
    states[id] = [
      options.shared ? expression(streams[0].source) : streams[0].source,
      streams[0].branches,
      options.shared ? expression(streams[1].source, 1) : streams[1].source,
      streams[1].branches,
      ...(streams[2].source
        ? [options.shared ? expression(streams[2].source) : streams[2].source, streams[2].branches]
        : [])
    ];
    if (pendingEnd) {
      states[id][4] ??= options.shared ? -1 : '';
      states[id][5] ??= [];
      states[id][6] = 1;
    }
    return id;
  }

  stateFor(grammar, grammar);
  const firstState = grammar.firstPatterns?.length
    ? stateFor({ patterns: [...grammar.firstPatterns, ...grammar.patterns] }, grammar)
    : undefined;
  const machine = {
    states,
    rules,
    ...(options.shared ? { expressions } : {}),
    ...(firstState === undefined ? {} : { firstState })
  };
  return options.compact ? compactRules(machine) : machine;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const input = process.argv[2];
  const output = process.argv[3];
  const flags = process.argv.slice(4);
  if (flags.some(flag => !['--shared', '--ascii', '--compact'].includes(flag)))
    throw new Error('Unknown compiler option');
  if (!input || !output)
    throw new Error(
      'Usage: node compile.mjs input.tmLanguage.json|@shikijs/langs/name output.mjs [--shared|--ascii|--compact]'
    );
  const grammar = await loadGrammar(input);
  const compiled = compileGrammar(grammar, undefined, {
    shared: flags.length > 0,
    ascii: flags.includes('--ascii'),
    compact: flags.includes('--compact')
  });
  await writeFile(
    output,
    `// Generated from ${input}\n// prettier-ignore\nexport default ${JSON.stringify(compiled)};\n`
  );
  console.log(`Compiled ${compiled.states.length} states, ${compiled.rules.length} rules`);
}
