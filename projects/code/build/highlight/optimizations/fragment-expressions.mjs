// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Build-only string factoring. Generated expressions use plain concatenation;
// the scanner still receives the exact original RegExp source strings.
export function fragmentExpressions(source, minimum = 128, limit = 256) {
  const strings = [...source.matchAll(/"(?:[^"\\]|\\[\s\S])*"/g)].map(match => ({
    start: match.index,
    end: match.index + match[0].length,
    parts: [JSON.parse(match[0])]
  }));
  const candidates = new Map();
  for (const {
    parts: [text]
  } of strings) {
    const stack = [];
    let inClass = false;
    for (let index = 0; index < text.length; index++) {
      const char = text[index];
      if (char === '\\') index++;
      else if (char === '[') inClass = true;
      else if (char === ']') inClass = false;
      else if (!inClass && char === '(') stack.push(index);
      else if (!inClass && char === ')' && stack.length) {
        const start = stack.pop();
        if (index - start + 1 < minimum) continue;
        const key = text.slice(start, index + 1);
        candidates.set(key, (candidates.get(key) ?? 0) + 1);
      }
    }
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
    fragments.push(text);
    strings.forEach((entry, index) => {
      entry.parts = next[index];
    });
  }
  if (!fragments.length) return source;
  const declarations = `const ${fragments.map((text, index) => `f${index}=${JSON.stringify(text)}`).join(',')};\n`;
  let output = declarations;
  let cursor = 0;
  for (const entry of strings) {
    output += source.slice(cursor, entry.start);
    const parts = entry.parts
      .filter(part => part !== '')
      .map(part => (typeof part === 'number' ? `f${part}` : JSON.stringify(part)));
    output += parts.length > 1 ? `(${parts.join('+')})` : (parts[0] ?? '""');
    cursor = entry.end;
  }
  return output + source.slice(cursor);
}
