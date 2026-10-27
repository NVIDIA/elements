// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import { VALUE_BINDINGS } from './attributes.js';
import type { HtmlTagNode } from '../rule-types.js';

function hasDynamicInput(node: HtmlTagNode, attribute: string): boolean {
  const property = attribute.replaceAll('-', '');
  const bindings = [attribute, property].flatMap(name => [
    `.${name}`,
    `?${name}`,
    `:${name}`,
    `[${name}]`,
    `[attr.${name}]`,
    `v-bind:${name}`
  ]);
  return (node.attributes ?? []).some(attr => {
    const name = attr.key?.value?.toLowerCase() ?? '';
    return (
      name === 'v-bind' ||
      name.startsWith('v-bind:[') ||
      name.startsWith(':[') ||
      (property !== attribute && name === property) ||
      bindings.includes(name) ||
      VALUE_BINDINGS.some(binding => name.includes(binding))
    );
  });
}

function getTextInput(node: HtmlTagNode): string | undefined {
  const contentBindings = ['v-text', 'v-html', '.textcontent', '.innerhtml', '[textcontent]', '[innerhtml]'];
  if (node.attributes?.some(attr => contentBindings.includes(attr.key?.value?.toLowerCase() ?? ''))) return;
  if (node.children?.some(child => child.type !== 'Text' && child.type !== 'Comment')) return;

  return (node.children ?? [])
    .filter(child => child.type === 'Text')
    .map(child => child.value ?? '')
    .join('')
    .trim();
}

/** Returns a known attribute, including an absent value; skips dynamic and encoded attributes. */
export function getLiteralFormatAttribute(node: HtmlTagNode, attributeName: string) {
  if (hasDynamicInput(node, attributeName)) return;

  const attribute = findAttr(node, attributeName);
  const value = attribute ? (attribute.value?.value ?? '') : undefined;
  if (value !== undefined && (value.includes('&') || VALUE_BINDINGS.some(binding => value.includes(binding)))) return;

  return { node: attribute ?? node, value };
}

export function getLiteralFormatInput(node: HtmlTagNode, attributeName: string) {
  const attribute = getLiteralFormatAttribute(node, attributeName);
  if (!attribute) return;
  const value = attribute.value ?? getTextInput(node);

  // The parser preserves character references instead of decoding their text.
  if (value === undefined || value.includes('&') || VALUE_BINDINGS.some(binding => value.includes(binding))) return;

  return { node: attribute.node, value };
}
