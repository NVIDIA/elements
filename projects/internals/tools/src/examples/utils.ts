// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ExamplesService, type Example } from '@internals/metadata';
import { wrapText } from '../internal/utils.js';
import { distillExamples, isContextExample } from '../distill/examples.js';

export function getContextExamples(format: 'markdown' | 'json', examples: Partial<Example>[]) {
  const result = distillExamples(examples);
  return format === 'markdown'
    ? result
        .map(example => {
          return `\`${example.id}\`: ${getExampleSummaryMarkdown(example)}`;
        })
        .join('\n\n')
    : result;
}

export async function searchContextExamples(
  query: string,
  config: { format: 'markdown' | 'json'; limit?: number } = { format: 'markdown', limit: 100 }
): Promise<string | Example[]> {
  const data = (await ExamplesService.search(query)).filter(isContextExample);
  const result = data.slice(0, config.limit);

  if (result.length === 0) {
    const message = `No examples found matching "${query}".\n\nTip: Try searching for common patterns like "form", "validation", "layout", "navigation", "button", or specific component names like "nve-grid", "nve-dropdown".`;
    return config.format === 'markdown' ? message : result;
  }

  return config.format === 'markdown' ? result.map(e => renderExampleMarkdown(e)).join('\n') : result;
}

export function renderExampleMarkdown(example: Partial<Example>) {
  const template = example.template ? condenseTemplate(example.template.trim()) : '';
  return `${renderExampleHeaderMarkdown(example)}${template ? `\n\n` : ''}${template ? `\`\`\`html\n${template}\n\`\`\`` : ''}`;
}

export function renderExampleHeaderMarkdown(example: Partial<Example>) {
  const formattedContent = getExampleSummaryMarkdown(example);
  return `## ${(example.name ?? '').replace(/([A-Z])/g, ' $1').trim()} (${example.id})${formattedContent ? '\n\n' : ''}${formattedContent}`;
}

export function getExampleSummaryMarkdown(example: Partial<Example>) {
  const summary = (example.summary ?? example.description ?? '').replace(/\[(.*?)\]\(.*?\)/g, '$1');
  return wrapText(summary).trim();
}

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr'
]);

/**
 * Reduces repeated sibling elements in an HTML template to save tokens.
 * Groups of consecutive same-tag siblings exceeding `maxRepeat` are
 * truncated and replaced with an HTML comment indicating the omitted count.
 */
export function condenseTemplate(template: string, maxRepeat = 3): string {
  if (!template || maxRepeat < 1) {
    return template;
  }
  return condenseLines(template.split('\n'), maxRepeat).join('\n');
}

function collectSiblings(lines: string[], start: number, target: { indent: string; tag: string }) {
  const siblings: Array<{ start: number; end: number }> = [];
  let cursor = start;

  while (cursor < lines.length) {
    if (lines[cursor]?.trim() === '') {
      cursor++;
      continue;
    }

    const sibMatch = lines[cursor]!.match(/^(\s*)<([\w][\w-]*)([\s>/])/);
    if (sibMatch && sibMatch[1] === target.indent && sibMatch[2] === target.tag) {
      const sibEnd = findBlockEnd(lines, cursor, target.tag);
      siblings.push({ start: cursor, end: sibEnd });
      cursor = sibEnd + 1;
    } else {
      break;
    }
  }

  return { siblings, cursor };
}

function emitKeptSiblings(
  lines: string[],
  siblings: Array<{ start: number; end: number }>,
  maxRepeat: number
): string[] {
  const result: string[] = [];
  const kept = Math.min(siblings.length, maxRepeat);
  for (let k = 0; k < kept; k++) {
    const { start, end } = siblings[k]!;
    if (start === end) {
      result.push(lines[start]!);
    } else {
      result.push(lines[start]!);
      result.push(...condenseLines(lines.slice(start + 1, end), maxRepeat));
      result.push(lines[end]!);
    }
  }
  return result;
}

function condenseLines(lines: string[], maxRepeat: number): string[] {
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const currentLine = lines[i]!;
    const openMatch = currentLine.match(/^(\s*)<([\w][\w-]*)([\s>/])/);

    if (!openMatch || currentLine.trim() === '') {
      result.push(currentLine);
      i++;
      continue;
    }

    const indent = openMatch[1]!;
    const tag = openMatch[2]!;
    const { siblings, cursor } = collectSiblings(lines, i, { indent, tag });

    result.push(...emitKeptSiblings(lines, siblings, maxRepeat));

    if (siblings.length > maxRepeat) {
      const remaining = siblings.length - maxRepeat;
      result.push(`${indent}<!-- ... ${remaining} more <${tag}> elements ... -->`);
    }

    i = cursor;
  }

  return result;
}

function findBlockEnd(lines: string[], start: number, tag: string): number {
  const line = lines[start]!;

  if (line.trimEnd().endsWith('/>')) {
    return start;
  }

  if (line.includes(`</${tag}>`)) {
    return start;
  }

  if (VOID_ELEMENTS.has(tag.toLowerCase())) {
    return start;
  }

  let depth = 1;
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i]!;
    const opens = (l.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length;
    const selfCloses = (l.match(new RegExp(`<${tag}[^>]*/>`, 'g')) || []).length;
    const closes = (l.match(new RegExp(`</${tag}>`, 'g')) || []).length;
    depth += opens - selfCloses - closes;

    if (depth <= 0) {
      return i;
    }
  }

  return start;
}
