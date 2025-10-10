import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';

const DEPRECATED_SLOTS = {
  'nve-accordion-header': {
    slots: ['title', 'subtitle', 'actions']
  },
  'nve-card-header': {
    slots: ['title', 'subtitle', 'header-action']
  }
};

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow use of deprecated slot APIs.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [],
    messages: {
      ['unexpected-deprecated-slots']: 'Unexpected use of deprecated slot "{{slot}}"'
    }
  },
  create(context) {
    return createVisitors(context, {
      Tag(node) {
        const deprecatedSlotConfig = DEPRECATED_SLOTS[node.name];
        if (deprecatedSlotConfig && node.children) {
          node.children.forEach(child => {
            if (child.type === 'Tag') {
              const slotAttr = findAttr(child, 'slot');
              if (slotAttr && deprecatedSlotConfig.slots.includes(slotAttr.value.value)) {
                context.report({
                  node: slotAttr,
                  data: {
                    slot: slotAttr.value.value
                  },
                  messageId: 'unexpected-deprecated-slots'
                });
              }
            }
          });
        }
      }
    });
  }
} as const;

export default rule;
