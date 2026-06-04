// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import type { HtmlAttribute, HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;

interface DeprecatedAttributeConfig {
  replacement?: string;
  values?: readonly string[] | Record<string, string | undefined>;
}

interface DeprecatedAttributeReport {
  attr: HtmlAttribute;
  attribute: string;
  config: DeprecatedAttributeConfig;
}

function isDeprecatedAttributeValueMap(
  values: DeprecatedAttributeConfig['values']
): values is Record<string, string | undefined> {
  return !!values && !Array.isArray(values);
}

const DEPRECATED_BUTTON_INTERACTION_VALUES = {
  emphasize: 'interaction="emphasis"',
  inverse: undefined,
  flat: 'container="flat"',
  'flat-destructive': 'container="flat" interaction="destructive"',
  'flat-emphasis': 'container="flat" interaction="emphasis"',
  'flat-emphasize': 'container="flat" interaction="emphasis"'
} as const;

const DEPRECATED_ATTRIBUTES: Record<string, Record<string, DeprecatedAttributeConfig>> = {
  'nve-badge': {
    status: { values: ['trend-up', 'trend-down', 'trend-neutral'] }
  },
  'nve-button': {
    interaction: { values: DEPRECATED_BUTTON_INTERACTION_VALUES }
  },
  'nve-combobox': {
    notags: { replacement: 'tag-layout="hidden"' }
  },
  'nve-icon-button': {
    interaction: { values: DEPRECATED_BUTTON_INTERACTION_VALUES }
  },
  'nve-toast': {
    status: { values: { muted: 'prominence="muted"' } }
  }
};

function attributeValueIsDeprecated(config: DeprecatedAttributeConfig, value?: string) {
  if (!config.values) return true;
  if (!value) return false;
  return Array.isArray(config.values) ? config.values.includes(value) : Object.hasOwn(config.values, value);
}

export function attributeValueIsDeprecatedForTag(tagName: string, attribute: string, value?: string) {
  const config = DEPRECATED_ATTRIBUTES[tagName]?.[attribute];
  return !!config && attributeValueIsDeprecated(config, value);
}

function getDeprecatedAttributeReplacement(config: DeprecatedAttributeConfig, value?: string) {
  const values = config.values;
  if (!isDeprecatedAttributeValueMap(values) || !value || !Object.hasOwn(values, value)) {
    return config.replacement;
  }
  return values[value];
}

function reportDeprecatedAttribute(context: Rule.RuleContext, { attr, attribute, config }: DeprecatedAttributeReport) {
  const value = attr.value?.value;
  const replacement = getDeprecatedAttributeReplacement(config, value);
  const messageId = replacement
    ? config.values
      ? 'unexpected-deprecated-attribute-value-replacement'
      : 'unexpected-deprecated-attribute-replacement'
    : 'unexpected-deprecated-attribute';
  const report: Rule.ReportDescriptor = {
    node: attr,
    data: {
      attribute,
      replacement: replacement ?? '',
      value: value ?? ''
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
        'Unexpected use of deprecated attribute "{{attribute}}". Use {{replacement}} instead.',
      ['unexpected-deprecated-attribute-value-replacement']:
        'Unexpected use of deprecated value "{{value}}" in attribute "{{attribute}}". Use {{replacement}} instead.'
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
