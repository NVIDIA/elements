import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { hasMatchingChild, hasTemplateSyntax } from '../internals/utils.js';

const REQUIRED_SLOTTED_ELEMENTS = {
  'nve-input': {
    required: ['input']
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
  'nve-password': {
    required: ['input[type="password"]']
  },
  'nve-color': {
    required: ['input[type="color"]']
  },
  'nve-checkbox-group': {
    required: ['nve-checkbox']
  },
  'nve-radio': {
    required: ['input[type="radio"]']
  },
  'nve-checkbox': {
    required: ['input[type="checkbox"]']
  },
  'nve-range': {
    required: ['input[type="range"]']
  },
  'nve-switch': {
    required: ['input[type="checkbox"]']
  }
};

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow use of missing slotted elements.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [{ type: 'object' }],
    messages: {
      ['unexpected-missing-slotted-element']: 'Unexpected use of missing slotted element <{{element}}>'
    }
  },
  create(context) {
    return createVisitors(context, {
      Tag(node) {
        const options = context.options[0] ?? {};
        const tagName = node.name.toLowerCase();

        const additionalRequirements = options[tagName]?.required ?? [];
        const required = [...(REQUIRED_SLOTTED_ELEMENTS[tagName]?.required ?? []), ...additionalRequirements];

        if (!required.length) {
          return;
        }

        if (hasTemplateSyntax(node)) {
          return;
        }

        // Check each required element
        for (const requiredSelector of required) {
          const hasRequiredElement = hasMatchingChild(node, requiredSelector);

          if (!hasRequiredElement) {
            context.report({
              node: node,
              messageId: 'unexpected-missing-slotted-element',
              data: {
                element: requiredSelector
              }
            });
          }
        }
      }
    });
  }
} as const;

export default rule;
