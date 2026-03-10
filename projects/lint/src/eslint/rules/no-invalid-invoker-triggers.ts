import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import { isNVElement } from '../internals/utils.js';
import type { HtmlTagNode } from '../rule-types.js';

/**
 * Invoker attributes that apply only to button-type elements.
 */
const INVOKER_ATTRIBUTES = ['popovertarget', 'commandfor', 'interestfor'] as const;

/**
 * NVE elements that are button-type and can validly use invoker attributes.
 */
const BUTTON_TYPE_ELEMENTS = [
  'nve-button',
  'nve-icon-button',
  'nve-menu-item',
  'nve-sort-button',
  'nve-tabs-item',
  'nve-tag',
  'nve-steps-item',
  'nve-copy-button'
] as const;

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow use of invoker trigger attributes on non-button nve-* elements.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [],
    messages: {
      ['no-invalid-invoker-triggers']:
        'Unexpected use of "{{attribute}}" on <{{element}}>. Invoker attributes are only valid on button-type elements: {{validElements}}.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const tagName = node.name.toLowerCase();

        if (!isNVElement(tagName)) {
          return;
        }

        if (BUTTON_TYPE_ELEMENTS.includes(tagName as (typeof BUTTON_TYPE_ELEMENTS)[number])) {
          return;
        }

        for (const attribute of INVOKER_ATTRIBUTES) {
          const attr = findAttr(node, attribute);
          if (attr) {
            context.report({
              messageId: 'no-invalid-invoker-triggers',
              node: attr,
              data: {
                attribute,
                element: tagName,
                validElements: BUTTON_TYPE_ELEMENTS.join(', ')
              }
            });
          }
        }
      }
    });
  }
} as const;

export default rule;
