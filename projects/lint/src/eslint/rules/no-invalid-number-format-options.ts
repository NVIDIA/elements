// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { getLiteralFormatAttribute } from '../internals/format-input.js';
import { checkFormatLocale, reportFormatOption } from '../internals/format-options.js';
import { defineRuleDocumentation } from '../rule-documentation.js';
import type { HtmlTagNode } from '../rule-types.js';

const DIGIT_OPTIONS = [
  ['minimum-fraction-digits', 'minimumFractionDigits'],
  ['maximum-fraction-digits', 'maximumFractionDigits'],
  ['minimum-integer-digits', 'minimumIntegerDigits']
] as const;

function getFormatError(options: Intl.NumberFormatOptions): string | undefined {
  try {
    new Intl.NumberFormat('en', options);
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  return undefined;
}

function checkDigits(context: Rule.RuleContext, node: HtmlTagNode) {
  const options: Intl.NumberFormatOptions = {};
  for (const [attribute, property] of DIGIT_OPTIONS) {
    if (property === 'minimumIntegerDigits' && node.name === 'nve-format-bytes') continue;
    const option = getLiteralFormatAttribute(node, attribute);
    if (option?.value === undefined) continue;
    const value = Number(option.value);
    const error = getFormatError({ [property]: value });
    if (error) reportFormatOption(context, node, { attribute, reason: error });
    else options[property] = value;
  }

  checkDigitOrder(context, node, options);
}

function checkDigitOrder(context: Rule.RuleContext, node: HtmlTagNode, options: Intl.NumberFormatOptions) {
  // Intl applies numeric coercion and truncation before comparing the digit options.
  if (options.minimumFractionDigits === undefined || options.maximumFractionDigits === undefined) return;
  if (!getFormatError(options)) return;
  const maximum = getLiteralFormatAttribute(node, 'maximum-fraction-digits');
  if (maximum) context.report({ node: maximum.node, messageId: 'invalid-digit-order', data: { tagName: node.name } });
}

function checkStyleOption(context: Rule.RuleContext, node: HtmlTagNode, style: 'currency' | 'unit') {
  const option = getLiteralFormatAttribute(node, style);
  if (!option) return;
  if (option.value === undefined) {
    if (getLiteralFormatAttribute(node, 'format-style')?.value === style) {
      context.report({ node, messageId: 'missing-option', data: { option: style, tagName: node.name } });
    }
    return;
  }
  // Intl validates supplied currency and unit identifiers even with another style.
  const error = getFormatError({ style, [style]: option.value });
  if (error) reportFormatOption(context, node, { attribute: style, reason: error });
}

const rule = {
  meta: {
    type: 'problem' as const,
    docs: defineRuleDocumentation({
      name: 'no-invalid-number-format-options',
      description: 'Require valid number and byte formatting options.',
      category: 'Best Practice',
      recommended: true,
      examples: {
        language: 'html',
        valid: '<nve-format-number format-style="currency" currency="USD">1234.56</nve-format-number>',
        invalid: '<nve-format-number format-style="currency">1234.56</nve-format-number>'
      }
    }),
    schema: [],
    messages: {
      ['invalid-option']: 'Invalid {{attribute}} value "{{value}}" on <{{tagName}}>: {{reason}}',
      ['missing-option']: '<{{tagName}}> requires {{option}} when format-style="{{option}}".',
      ['invalid-digit-order']: '<{{tagName}}> requires minimum-fraction-digits to be at most maximum-fraction-digits.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        if (node.name !== 'nve-format-number' && node.name !== 'nve-format-bytes') return;
        checkFormatLocale(context, node);
        checkDigits(context, node);
        if (node.name === 'nve-format-number') {
          checkStyleOption(context, node, 'currency');
          checkStyleOption(context, node, 'unit');
        }
      }
    });
  }
} as const;

export default rule;
