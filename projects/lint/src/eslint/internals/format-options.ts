// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import type { HtmlTagNode } from '../rule-types.js';
import { getLiteralFormatAttribute } from './format-input.js';

export function reportFormatOption(
  context: Rule.RuleContext,
  node: HtmlTagNode,
  problem: { attribute: string; reason: string }
) {
  const { attribute, reason } = problem;
  const option = getLiteralFormatAttribute(node, attribute);
  if (!option) return;
  context.report({
    node: option.node,
    messageId: 'invalid-option',
    data: { tagName: node.name, attribute, value: option.value, reason }
  });
}

export function checkFormatLocale(context: Rule.RuleContext, node: HtmlTagNode) {
  const locale = getLiteralFormatAttribute(node, 'locale');
  if (locale?.value === undefined) return;
  try {
    Intl.getCanonicalLocales(locale.value);
  } catch (error) {
    reportFormatOption(context, node, {
      attribute: 'locale',
      reason: error instanceof Error ? error.message : String(error)
    });
  }
}
