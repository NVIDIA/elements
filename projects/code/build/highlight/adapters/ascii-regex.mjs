// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// A Unicode property restricted to ASCII has a small, exact character set.
// Only select this compiled expression when every input code unit is ASCII.
const properties = new Map();
const character = code =>
  code < 32 || code > 126
    ? `\\x${code.toString(16).padStart(2, '0')}`
    : /[\[\]\\^-]/.test(String.fromCharCode(code))
      ? `\\${String.fromCharCode(code)}`
      : String.fromCharCode(code);
function property(source) {
  if (!properties.has(source)) {
    const regex = new RegExp(source, 'u');
    const ranges = [];
    for (let code = 0; code < 128; code++) {
      if (!regex.test(String.fromCharCode(code))) continue;
      const start = code;
      while (code + 1 < 128 && regex.test(String.fromCharCode(code + 1))) code++;
      ranges.push(
        code - start < 2
          ? character(start) + (code > start ? character(code) : '')
          : `${character(start)}-${character(code)}`
      );
    }
    properties.set(source, ranges.join(''));
  }
  return properties.get(source);
}
export function asciiRegex(source) {
  let output = '';
  let inClass = false;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === '\\') {
      const escape = source.slice(i).match(/^\\[pP]\{[^}]+\}/)?.[0];
      if (escape) {
        const chars = property(escape);
        output += inClass ? chars : `[${chars}]`;
        i += escape.length - 1;
      } else output += char + (source[++i] ?? '');
    } else {
      if (char === '[') inClass = true;
      if (char === ']') inClass = false;
      output += char;
    }
  }
  return output;
}
