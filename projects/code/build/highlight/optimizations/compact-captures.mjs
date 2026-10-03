// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Captures used only to group a source regex need no /d result allocation.
// Keep semantic captures and every backreference, then relocate the indexes.
export function compactCaptures(normalized, needed) {
  const source = normalized.source;
  const keep = new Set(needed);
  let count = 0;
  let inClass = false;
  for (let i = 0; i < source.length; i++) {
    if (source[i] === '\\') {
      const reference = !inClass && source.slice(i).match(/^\\([1-9][0-9]*)/);
      if (reference) {
        keep.add(Number(reference[1]));
        i += reference[0].length - 1;
      } else i++;
    } else {
      if (source[i] === '[') inClass = true;
      if (source[i] === ']') inClass = false;
      if (!inClass && source[i] === '(' && source[i + 1] !== '?') count++;
    }
  }
  const indexes = [0];
  let next = 0;
  for (let i = 1; i <= count; i++) indexes[i] = keep.has(i) ? ++next : 0;
  let output = '';
  let group = 0;
  inClass = false;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === '\\') {
      const reference = !inClass && source.slice(i).match(/^\\([1-9][0-9]*)/);
      if (reference) {
        output += `\\${indexes[Number(reference[1])] ?? reference[1]}`;
        i += reference[0].length - 1;
      } else output += char + (source[++i] ?? '');
    } else {
      if (char === '[') inClass = true;
      if (char === ']') inClass = false;
      output += !inClass && char === '(' && source[i + 1] !== '?' && !indexes[++group] ? '(?:' : char;
    }
  }
  return { source: output, captures: normalized.captures.map(index => indexes[index] ?? index) };
}
