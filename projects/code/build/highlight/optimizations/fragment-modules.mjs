// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Build-only extension of fragment-expressions: share balanced string fragments
// across data modules while preserving their complete expression strings.
export function fragmentModules(files, minimum = 128, limit = 256, options = {}) {
  const modules = [...files].map(([name, source]) => ({
    name,
    source,
    strings: [...source.matchAll(/"(?:[^"\\]|\\[\s\S])*"/g)].map(match => ({
      start: match.index,
      end: match.index + match[0].length,
      parts: [JSON.parse(match[0])]
    }))
  }));
  const strings = modules.flatMap(module => module.strings);
  const candidates = new Map();
  for (const {
    parts: [text]
  } of strings) {
    const stack = [];
    let inClass = false;
    let branchStart = 0;
    const ranges = options.branches ? new Set() : null;
    const candidate = (start, end) => {
      if (end - start < minimum) return;
      const range = `${start}:${end}`;
      if (ranges?.has(range)) return;
      ranges?.add(range);
      const key = text.slice(start, end);
      candidates.set(key, (candidates.get(key) ?? 0) + 1);
    };
    for (let index = 0; index < text.length; index++) {
      const char = text[index];
      if (char === '\\') index++;
      else if (char === '[') inClass = true;
      else if (char === ']') inClass = false;
      else if (!inClass && char === '(') stack.push(index);
      else if (!inClass && char === ')' && stack.length) {
        const start = stack.pop();
        candidate(start, index + 1);
      } else if (options.branches && !inClass && char === '|' && !stack.length) {
        candidate(branchStart, index);
        branchStart = index + 1;
      }
    }
    if (options.branches) candidate(branchStart, text.length);
  }
  const score = ([text, count]) => (count - 1) * JSON.stringify(text).length - count * 12;
  const ordered = [...candidates]
    .filter(entry => score(entry) > 0)
    .sort((a, b) => score(b) - score(a) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .slice(0, limit);
  const fragments = [];
  for (const [text] of ordered) {
    let count = 0;
    const next = strings.map(entry =>
      entry.parts.flatMap(part => {
        if (typeof part !== 'string') return [part];
        const pieces = part.split(text);
        count += pieces.length - 1;
        return pieces.flatMap((piece, index) => (index ? [fragments.length, piece] : [piece]));
      })
    );
    if (score([text, count]) <= 0) continue;
    fragments.push({ text, owners: 0n });
    strings.forEach((entry, index) => {
      entry.parts = next[index];
    });
  }
  const declarations = new Map();
  modules.forEach((module, owner) => {
    for (const entry of module.strings)
      for (const part of entry.parts) if (typeof part === 'number') fragments[part].owners |= 1n << BigInt(owner);
  });
  for (const [index, fragment] of fragments.entries()) {
    const group = declarations.get(fragment.owners) ?? [];
    group.push(`f${index}=${JSON.stringify(fragment.text)}`);
    declarations.set(fragment.owners, group);
  }
  const output = new Map();
  for (const [owners, group] of declarations) {
    if (!(owners & (owners - 1n))) continue;
    output.set(`fragments-${owners.toString(16)}.mjs`, `export const ${group.join(',')};\n`);
  }
  modules.forEach((module, owner) => {
    const bit = 1n << BigInt(owner);
    let source = '';
    for (const [owners, group] of declarations) {
      if (!(owners & bit)) continue;
      if (!(owners & (owners - 1n))) source += `const ${group.join(',')};\n`;
      else {
        const names = group.map(declaration => declaration.slice(0, declaration.indexOf('=')));
        source += `import{${names.join(',')}}from'./fragments-${owners.toString(16)}.mjs';\n`;
      }
    }
    let cursor = 0;
    for (const entry of module.strings) {
      source += module.source.slice(cursor, entry.start);
      const parts = entry.parts
        .filter(part => part !== '')
        .map(part => (typeof part === 'number' ? `f${part}` : JSON.stringify(part)));
      source += parts.length > 1 ? `(${parts.join('+')})` : (parts[0] ?? '""');
      cursor = entry.end;
    }
    output.set(module.name, source + module.source.slice(cursor));
  });
  return output;
}
