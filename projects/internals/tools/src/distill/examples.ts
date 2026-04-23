// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Example, ExampleTag } from '@internals/metadata';

const excludedIdPatterns = ['theme', 'internal'];
const excludedTags: ExampleTag[] = ['anti-pattern', 'performance', 'test-case', 'theme']; // these are examples with high noise to signal ratio for agents
const excludedElementPatterns = ['internal', 'responsive'];
const includedIdPatterns = [
  'default',
  'forms',
  'popover',
  'page',
  'grid',
  'invoker',
  'styles-typography',
  'styles-layout'
];

/**
 * Examples failing exclusion checks are not included in the context.
 * These are examples that are context noise for agents or bloat context memory.
 */
function passesExclusionChecks(example: Partial<Example>) {
  if (example.deprecated) {
    return false;
  }
  const id = example.id?.toLowerCase() ?? '';
  const tags = example.tags ?? [];
  const element = example.element ?? '';
  return (
    !excludedIdPatterns.some(p => id.includes(p)) &&
    !excludedTags.some(t => tags.includes(t)) &&
    !excludedElementPatterns.some(p => element.includes(p))
  );
}

function passesInclusionChecks(example: Partial<Example>) {
  if (example.composition) {
    return true;
  }
  const id = example.id ?? '';
  const tags = example.tags ?? [];
  return (
    (includedIdPatterns.some(p => id.includes(p)) || tags.includes('pattern')) && (example.summary?.length ?? 0) > 0
  );
}

export function isContextExample(example: Partial<Example>) {
  return passesExclusionChecks(example) && passesInclusionChecks(example);
}

export function rankExample(example: Partial<Example>) {
  const name = (example.id ?? '').replace('elements-', '');
  if (name.startsWith('pattern')) {
    return 0;
  }
  if (name.startsWith('page')) {
    return 1;
  }
  return 2;
}

/**
 * Filters, shapes, and ranks examples for agent context. Returns a pure data
 * array with no formatting applied.
 */
export function distillExamples(examples: Partial<Example>[]) {
  return examples
    .filter(isContextExample)
    .reverse()
    .map((s: Partial<Example>) => ({
      id: s.id ?? '',
      name: s.name ?? '',
      summary: distillExampleSummary(s.summary ?? s.description ?? ''),
      element: s.element ?? '',
      template: s.template ?? ''
    }))
    .sort((a, b) => rankExample(a) - rankExample(b) || (a.id ?? '').localeCompare(b.id ?? ''));
}

/**
 * Deduplicate boilerplate openers like "Basic" then capitalize the first letter.
 */
export function distillExampleSummary(summary: string) {
  const stripped = summary
    .replace(/^Basic\s+/, '')
    .replace(/^Default\s+/, '')
    .replace(/^Example\s+/, '')
    .replace(/^Simple\s+/, '')
    .replace(/^Use for\s+/, '')
    .replace(/^Use when\s+/, '');
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}
