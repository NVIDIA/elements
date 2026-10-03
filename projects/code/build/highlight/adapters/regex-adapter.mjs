// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// Build-time dialect adapter. No part of this module ships with the scanner.
const properties = {
  alpha: '\\p{Alphabetic}',
  alnum: '\\p{Alphabetic}\\p{Decimal_Number}',
  word: '\\p{Alphabetic}\\p{Mark}\\p{Decimal_Number}\\p{Connector_Punctuation}',
  upper: '\\p{Uppercase}'
};

// Possessive repeats are atomic repeats. Lower them before assigning capture
// indexes so the existing atomic adapter also accounts for synthetic groups.
function lowerPossessive(source) {
  let output = '';
  let atom = -1;
  let inClass = false;
  let first = false;
  const groups = [];
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === '\\') {
      if (!inClass) atom = output.length;
      const escaped = source.slice(i).match(/^\\(?:[pPu]\{[^}]+\}|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|[1-9][0-9]*|.)/)?.[0];
      if (!escaped) throw new Error('Trailing regex escape');
      output += escaped;
      i += escaped.length - 1;
      first = false;
    } else if (inClass) {
      if (char === '[' && source[i + 1] === ':') {
        const end = source.indexOf(':]', i + 2);
        if (end < 0) throw new Error('Unclosed POSIX class');
        output += source.slice(i, end + 2);
        i = end + 1;
      } else {
        output += char;
        if (char === ']' && !first) inClass = false;
      }
      if (char !== '^' || !first) first = false;
    } else if (char === '[') {
      atom = output.length;
      inClass = first = true;
      output += char;
    } else if (char === '(') {
      groups.push(output.length);
      const prefix = source.slice(i).match(/^\(\?(?:[:=!>]|<[=!])/)?.[0] ?? '(';
      output += prefix;
      i += prefix.length - 1;
      atom = -1;
    } else if (char === ')') {
      output += char;
      atom = groups.pop() ?? -1;
    } else {
      const repeat = /[*+?]/.test(char) ? char : char === '{' ? source.slice(i).match(/^\{\d+(?:,\d*)?\}/)?.[0] : '';
      if (repeat && atom >= 0) {
        i += repeat.length - 1;
        if (source[i + 1] === '+') {
          output = `${output.slice(0, atom)}(?>${output.slice(atom)}${repeat})`;
          i++;
        } else {
          output += repeat;
          if (source[i + 1] === '?') {
            output += '?';
            i++;
          }
        }
      } else {
        atom = char === '|' || char === '^' || char === '$' ? -1 : output.length;
        output += char;
      }
    }
  }
  return output;
}

export function adaptRegex(source) {
  source = lowerPossessive(source);
  const captures = [0];
  const groups = [];
  const pieces = [];
  let count = 0;
  let original = 0;
  let inClass = false;
  let classStart = false;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === '\\') {
      const next = source[++i];
      if (!inClass && /[1-9]/.test(next ?? '')) {
        let number = next;
        while (/[0-9]/.test(source[i + 1] ?? '')) number += source[++i];
        pieces.push({ reference: Number(number) });
      } else if ((next === 'p' || next === 'P') && source[i + 1] === '{') {
        const end = source.indexOf('}', i + 2);
        const name = source.slice(i + 2, end);
        if (end < 0) throw new Error('Unclosed Unicode property');
        if (name === 'print') {
          if (inClass || next === 'P') throw new Error('Printable property in a class needs an adapter');
          pieces.push('(?:[^\\p{Control}\\p{Unassigned}\\p{Surrogate}\\p{White_Space}]|\\p{Space_Separator})');
        } else if (name === 'alnum' || name === 'word') {
          if (inClass && next === 'P') throw new Error('Negative compound property in a class needs an adapter');
          pieces.push(inClass ? properties[name] : `[${next === 'P' ? '^' : ''}${properties[name]}]`);
        } else {
          pieces.push(`\\${next}{${name === 'upper' ? 'Uppercase' : name}}`);
        }
        i = end;
      } else if (next === 'u' && source[i + 1] === '{') {
        const end = source.indexOf('}', i + 2);
        if (end < 0) throw new Error('Unclosed Unicode code point');
        pieces.push(source.slice(i - 1, end + 1));
        i = end;
      } else if (next && !/[A-Za-z0-9^$\\.*+?()[\]{}|/\-]/.test(next)) {
        // Unicode RegExp rejects identity escapes for punctuation such as \&.
        pieces.push(next);
      } else if (next === '-' && !inClass) {
        pieces.push('-');
      } else if (next === 'N' && !inClass) {
        pieces.push('[^\\n]');
      } else {
        pieces.push(`\\${next ?? ''}`);
      }
      classStart = false;
    } else if (inClass) {
      if (char === '[' && source[i + 1] === ':') {
        const end = source.indexOf(':]', i + 2);
        const name = source.slice(i + 2, end);
        if (end < 0 || !properties[name]) throw new Error(`Unsupported POSIX class: ${name}`);
        pieces.push(properties[name]);
        i = end + 1;
      } else if (char === ']' && !classStart) {
        pieces.push(char);
        inClass = false;
      } else if (char === ']') {
        // Oniguruma treats ] as a literal in the first class position.
        pieces.push('\\]');
      } else if (char === '[') {
        throw new Error('Nested character class needs an adapter');
      } else {
        pieces.push(char);
      }
      if (char !== '^' || !classStart) classStart = false;
    } else if (char === '[') {
      pieces.push(char);
      inClass = true;
      classStart = true;
    } else if (char === '(') {
      const atomic = source.startsWith('(?>', i);
      if (atomic) {
        if (groups.includes(-1)) throw new Error('Atomic group inside lookbehind needs an adapter');
        const capture = ++count;
        pieces.push('(?:(?=(');
        groups.push(capture);
        i += 2;
      } else {
        if (source[i + 1] !== '?') captures[++original] = ++count;
        if (source.startsWith('(?<', i) && !/[=!]/.test(source[i + 3] ?? '')) {
          throw new Error('Named capture needs an adapter');
        }
        pieces.push(char);
        groups.push(source.startsWith('(?<=', i) || source.startsWith('(?<!', i) ? -1 : 0);
      }
    } else if (char === ')') {
      const atomic = groups.pop();
      pieces.push(atomic > 0 ? `))\\${atomic})` : char);
    } else if (char === ']' || char === '}') {
      pieces.push(`\\${char}`);
    } else if (char === '{') {
      const quantifier = source.slice(i).match(/^\{\d+(?:,\d*)?\}/)?.[0];
      pieces.push(quantifier ?? '\\{');
      if (quantifier) i += quantifier.length - 1;
    } else {
      pieces.push(char);
    }
  }
  if (inClass || groups.length) throw new Error('Unclosed regex group or character class');
  return {
    source: pieces
      .map(piece => (typeof piece === 'string' ? piece : `\\${captures[piece.reference] ?? piece.reference}`))
      .join(''),
    captures
  };
}
