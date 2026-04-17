// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Attribute, Element, Token } from '@internals/metadata';

export interface PartialAPIResult {
  name: string;
  description: string;
  behavior: string;
}

export function distillElements(elements: Element[]): PartialAPIResult[] {
  return elements
    .filter(e => !e.manifest?.deprecated && e.manifest?.description)
    .map(e => ({ name: e.name, description: e.manifest!.description, behavior: e.manifest!.metadata?.behavior ?? '' }));
}

export function distillAttributes(attributes: Attribute[]): PartialAPIResult[] {
  return attributes
    .filter(a => a.description && a.example)
    .map(a => ({ name: a.name, description: a.description, behavior: 'attribute' }));
}

const complexTokenPatterns = [
  'nve-config-',
  'ref-color',
  'ref-scale',
  'ref-opacity',
  'ref-outline',
  'ref-font-family-',
  'sys-color-scheme',
  'sys-contrast',
  'line-height',
  'ratio',
  '-xxx',
  '-xx'
];

/**
 * Filters out noisy/complex tokens and sorts alphabetically. Tokens at the
 * edges of scales or with low usage frequency create context noise for agents.
 */
export function distillTokens(tokens: Token[]): Token[] {
  return tokens
    .filter(token => !complexTokenPatterns.some(pattern => token.name.includes(pattern)))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function distillAttributeValues<T extends { name: string }>(values: T[]): T[] {
  return values.filter(v => !isComplexAttributeValue(v.name));
}

/**
 * Strips context noise from a search result. Removes changelog, internal
 * markdown, and complex attribute values from element/attribute results.
 */
export function distillSearchResult(result: Element | Attribute): Element | Attribute {
  const el = result as Element;
  if (el.manifest) {
    el.changelog = undefined;
    el.manifest.metadata.markdown = '';
  }

  const attr = result as Attribute;
  if (attr.values) {
    attr.values = distillAttributeValues(attr.values);
  }

  return result;
}

/**
 * Values of low frequency, unreliable naming, or at the edges of scales
 * create significant context noise for agents.
 */
export function isComplexAttributeValue(value: string) {
  return [
    // system
    'debug',
    'mkd',
    'md',
    // layout
    '|',
    '@',
    '&',
    'xx', // excessive scale boundary
    ':none', // ambiguous override
    // typography (non-semantic)
    'display',
    'eyebrow',
    'white',
    'black',
    // typography (visually ambiguous)
    'line-height-',
    'tight',
    'snug',
    'moderate',
    'relaxed',
    'loose',
    'flat'
  ].some(p => value.includes(p));
}
