// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { defineRuleDocumentation } from '../rule-documentation.js';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { hasMatchingChild, hasTemplateSyntax, hasUnslottedContent, parseSelector } from '../internals/utils.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import { getSlotAssignment } from '../internals/slots.js';
import type { HtmlTagNode } from '../rule-types.js';

interface RequiredSlotConfig {
  required?: string[];
  requiresDefaultSlotContent?: boolean;
  requiresSingleDefaultSlotItem?: string[];
}

const REQUIRED_SLOTTED_ELEMENTS: Record<string, RequiredSlotConfig> = {
  'nve-input': {
    required: ['input']
  },
  'nve-combobox': {
    required: ['input[type="search"]', 'datalist, select']
  },
  'nve-date': {
    required: ['input[type="date"]']
  },
  'nve-datetime': {
    required: ['input[type="datetime-local"]']
  },
  'nve-month': {
    required: ['input[type="month"]']
  },
  'nve-week': {
    required: ['input[type="week"]']
  },
  'nve-time': {
    required: ['input[type="time"]']
  },
  'nve-textarea': {
    required: ['textarea']
  },
  'nve-select': {
    required: ['select']
  },
  'nve-search': {
    required: ['input[type="search"]']
  },
  'nve-file': {
    required: ['input[type="file"]']
  },
  'nve-logo': {
    requiresDefaultSlotContent: true
  },
  'nve-password': {
    required: ['input[type="password"]']
  },
  'nve-color': {
    required: ['input[type="color"]']
  },
  'nve-radio': {
    required: ['input[type="radio"]']
  },
  'nve-radio-group': {
    required: ['nve-radio']
  },
  'nve-checkbox': {
    required: ['input[type="checkbox"]']
  },
  'nve-checkbox-group': {
    required: ['nve-checkbox']
  },
  'nve-range': {
    required: ['input[type="range"]']
  },
  'nve-switch': {
    required: ['input[type="checkbox"]']
  },
  'nve-switch-group': {
    required: ['nve-switch']
  },
  'nve-tabs-item-group': {
    requiresSingleDefaultSlotItem: ['nve-tabs-item']
  },
  'nve-tree-node': {
    requiresDefaultSlotContent: true
  }
};

const rule = {
  meta: {
    type: 'problem' as const,
    docs: defineRuleDocumentation({
      name: 'no-missing-slotted-elements',
      description: 'Disallow use of missing slotted elements.',
      category: 'Best Practice',
      recommended: true,
      examples: {
        language: 'html',
        valid: '<nve-input><label>Name</label><input type="text" /></nve-input>',
        invalid: '<nve-input></nve-input>'
      }
    }),
    schema: [{ type: 'object' }],
    messages: {
      ['unexpected-missing-slotted-element']: 'Unexpected use of missing slotted element {{selector}}',
      ['missing-default-slot-content']: 'Element <{{tagName}}> requires default slot content.',
      ['unexpected-slot-content']: '<{{tagName}}> requires only one default-slot child: {{required}}.'
    }
  },
  create(context: Rule.RuleContext) {
    function getRequirements(node: HtmlTagNode): {
      required: string[];
      requiresDefaultSlotContent: boolean;
      requiresSingleDefaultSlotItem: string[];
      tagName: string;
    } {
      const options = context.options[0] ?? {};
      const tagName = node.name.toLowerCase();
      const config = REQUIRED_SLOTTED_ELEMENTS[tagName];
      const required = [...(config?.required ?? []), ...(options[tagName]?.required ?? [])];
      const requiresDefaultSlotContent = config?.requiresDefaultSlotContent ?? false;
      const requiresSingleDefaultSlotItem = config?.requiresSingleDefaultSlotItem ?? [];
      return { required, requiresDefaultSlotContent, requiresSingleDefaultSlotItem, tagName };
    }

    function matchesSelector(node: HtmlTagNode, selector: string): boolean {
      const { tag, attrs } = parseSelector(selector);
      return (
        node.name.toLowerCase() === tag.toLowerCase() &&
        Object.entries(attrs ?? {}).every(([name, value]) => findAttr(node, name)?.value?.value === value)
      );
    }

    function getDefaultSlotElements(node: HtmlTagNode): HtmlTagNode[] | undefined {
      const elements = (node.children ?? []).filter(child => child.type === 'Tag');
      if (elements.some(child => getSlotAssignment(child).kind === 'dynamic')) return;
      return elements.filter(child => getSlotAssignment(child).kind === 'default');
    }

    function matchesAllowedSelectors(node: HtmlTagNode, allowed: string[]): boolean {
      return allowed.some(selector =>
        selector.split(',').some(alternative => matchesSelector(node, alternative.trim()))
      );
    }

    function hasDefaultSlotText(node: HtmlTagNode): boolean {
      return (node.children ?? []).some(child => child.type === 'Text' && child.value?.trim());
    }

    function checkSingleDefaultSlotItem(node: HtmlTagNode, tagName: string, allowed: string[]) {
      const items = getDefaultSlotElements(node);
      if (!items) return;

      const item = items[0];
      if (items.length !== 1 || !item || !matchesAllowedSelectors(item, allowed) || hasDefaultSlotText(node)) {
        context.report({
          node,
          messageId: 'unexpected-slot-content',
          data: { tagName, required: allowed.join(' or ') }
        });
      }
    }

    function checkRequiredSelectors(node: HtmlTagNode, required: string[]) {
      for (const requiredSelector of required) {
        const selectors = requiredSelector.split(',').map((s: string) => s.trim());
        const hasRequiredElement = selectors.some((sel: string) => hasMatchingChild(node, sel));

        if (!hasRequiredElement) {
          context.report({
            node: node,
            messageId: 'unexpected-missing-slotted-element',
            data: { selector: requiredSelector }
          });
        }
      }
    }

    function checkDefaultSlotContent(node: HtmlTagNode, tagName: string) {
      if (!hasUnslottedContent(node)) {
        context.report({
          node: node,
          messageId: 'missing-default-slot-content',
          data: { tagName }
        });
      }
    }

    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const { required, requiresDefaultSlotContent, requiresSingleDefaultSlotItem, tagName } = getRequirements(node);

        if (
          (!required.length && !requiresDefaultSlotContent && !requiresSingleDefaultSlotItem.length) ||
          hasTemplateSyntax(node)
        ) {
          return;
        }

        if (requiresSingleDefaultSlotItem.length) {
          checkSingleDefaultSlotItem(node, tagName, requiresSingleDefaultSlotItem);
        }
        if (requiresDefaultSlotContent) {
          checkDefaultSlotContent(node, tagName);
        }
        checkRequiredSelectors(node, required);
      }
    });
  }
} as const;

export default rule;
