// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import type { HtmlAttribute, HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;

interface DeprecatedAttributeConfig {
  replacement?: string;
  values?: string[];
}

interface DeprecatedAttributeReport {
  attr: HtmlAttribute;
  attribute: string;
  config: DeprecatedAttributeConfig;
}

const DEPRECATED_ATTRIBUTES: Record<string, Record<string, DeprecatedAttributeConfig>> = {
  'nve-badge': {
    status: { values: ['trend-up', 'trend-down', 'trend-neutral'] }
  },
  'nve-combobox': {
    notags: { replacement: 'tag-layout="hidden"' }
  }
};

function attributeValueIsDeprecated(config: DeprecatedAttributeConfig, value?: string) {
  return !config.values || (!!value && config.values.includes(value));
}

function reportDeprecatedAttribute(context: Rule.RuleContext, { attr, attribute, config }: DeprecatedAttributeReport) {
  const replacement = config.replacement;
  const messageId = config.replacement
    ? 'unexpected-deprecated-attribute-replacement'
    : 'unexpected-deprecated-attribute';
  const report: Rule.ReportDescriptor = {
    node: attr,
    data: {
      attribute,
      replacement: config.replacement ?? '',
      value: attr.value?.value ?? ''
    },
    messageId
  };
  if (replacement) {
    report.fix = fixer => fixer.replaceText(attr, replacement);
  }
  context.report(report);
}

const rule = {
  meta: {
    type: 'problem' as const,
    fixable: 'code' as const,
    docs: {
      description: 'Disallow use of deprecated attributes in HTML.',
      category: 'Best Practice',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [],
    messages: {
      ['unexpected-deprecated-attribute']:
        'Unexpected use of deprecated value "{{value}}" in attribute "{{attribute}}"',
      ['unexpected-deprecated-attribute-replacement']:
        'Unexpected use of deprecated attribute "{{attribute}}". Use {{replacement}} instead.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const deprecatedAttributes: Record<string, DeprecatedAttributeConfig> | undefined =
          DEPRECATED_ATTRIBUTES[node.name as keyof typeof DEPRECATED_ATTRIBUTES];
        if (deprecatedAttributes) {
          Object.entries(deprecatedAttributes).forEach(([attribute, config]) => {
            const attr = findAttr(node, attribute);
            if (attr && attributeValueIsDeprecated(config, attr.value?.value)) {
              reportDeprecatedAttribute(context, { attr, attribute, config });
            }
          });
        }
      }
    });
  }
} as const;

export default rule;
