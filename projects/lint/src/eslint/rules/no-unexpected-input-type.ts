import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import type { HtmlTagNode } from '../rule-types.js';
import type { HtmlNode } from '../internals/utils.js';

/**
 * Maps each nve-* component to the input types it accepts as slotted children.
 */
const componentToAllowedTypes: Record<string, string[]> = {
  'nve-input': ['text', 'email', 'number', 'tel', 'url'],
  'nve-password': ['password'],
  'nve-search': ['search'],
  'nve-date': ['date'],
  'nve-time': ['time'],
  'nve-week': ['week'],
  'nve-month': ['month'],
  'nve-datetime': ['datetime-local'],
  'nve-checkbox': ['checkbox'],
  'nve-radio': ['radio'],
  'nve-range': ['range'],
  'nve-file': ['file']
};

/**
 * Maps an input type to the nve-* component it should be slotted into.
 */
const inputTypeToComponent: Record<string, string> = {
  text: 'nve-input',
  email: 'nve-input',
  number: 'nve-input',
  tel: 'nve-input',
  url: 'nve-input',
  password: 'nve-password',
  search: 'nve-search',
  date: 'nve-date',
  time: 'nve-time',
  week: 'nve-week',
  month: 'nve-month',
  'datetime-local': 'nve-datetime',
  checkbox: 'nve-checkbox',
  radio: 'nve-radio',
  range: 'nve-range',
  file: 'nve-file'
};

/**
 * Find all descendant `<input>` elements within a node.
 */
function findInputs(node: HtmlNode): HtmlNode[] {
  const inputs: HtmlNode[] = [];

  if (!node.children || !Array.isArray(node.children)) {
    return inputs;
  }

  for (const child of node.children) {
    if (child.type === 'Tag' && child.name.toLowerCase() === 'input') {
      inputs.push(child);
    }

    inputs.push(...findInputs(child));
  }

  return inputs;
}

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow slotted <input> elements with a type that does not match the parent Elements component.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [],
    messages: {
      ['unexpected-input-type']:
        'Unexpected <input type="{{ type }}"> inside <{{ parent }}>. Use <{{ expected }}> instead.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        const tagName = node.name.toLowerCase();
        const allowedTypes = componentToAllowedTypes[tagName];

        if (!allowedTypes) {
          return;
        }

        const inputs = findInputs(node);

        for (const input of inputs) {
          const typeAttr = findAttr(input, 'type');
          const type = typeAttr?.value?.value ?? 'text';

          if (allowedTypes.includes(type)) {
            continue;
          }

          const expected = inputTypeToComponent[type];

          if (!expected) {
            continue;
          }

          context.report({
            node: typeAttr ?? input,
            messageId: 'unexpected-input-type',
            data: {
              type,
              parent: tagName,
              expected
            }
          });
        }
      }
    });
  }
} as const;

export default rule;
