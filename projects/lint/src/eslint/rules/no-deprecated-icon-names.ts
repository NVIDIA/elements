import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import type { HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;
const DEPRECATED_ICONS = {
  'chevron-right': 'chevron',
  'chevron-down': 'chevron',
  'chevron-left': 'chevron',
  'additional-actions': 'more-actions',
  analytics: 'pie-chart',
  annotation: 'transparent-box',
  'app-switcher': 'switch-apps',
  assist: 'chat-bubble',
  checkmark: 'check',
  date: 'calendar',
  docs: 'book',
  'expand-full-screen': 'maximize',
  'expand-panel': 'arrow-stop',
  'collapse-panel': 'arrow-stop',
  failed: 'x-circle',
  'favorite-filled': 'star',
  'favorite-outline': 'star-stroke',
  information: 'information-circle-stroke',
  maintenance: 'wrench',
  'navigate-to': 'arrow',
  'open-external-link': 'arrow-angle',
  location: 'map-pin',
  'pinned-1': 'pin',
  project: 'folder',
  settings: 'gear',
  user: 'person',
  'video-pause': 'pause',
  'video-play': 'play',
  'video-stop': 'stop',
  visible: 'eye',
  warning: 'exclamation-triangle'
};

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow use of deprecated icon names.',
      category: 'Best Practice',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [],
    messages: {
      ['unexpected-deprecated-icon-attribute']:
        'Unexpected use of deprecated icon name of {{deprecated}}. Use {{alternative}} instead.'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        if (node.name === 'nve-icon') {
          const attr = findAttr(node, 'name');
          if (attr) {
            const deprecated = ((attr.value && attr.value.value) || '').toLowerCase();
            const alternative = DEPRECATED_ICONS[deprecated as keyof typeof DEPRECATED_ICONS];

            if (alternative) {
              context.report({
                node: attr,
                data: {
                  alternative,
                  deprecated
                },
                messageId: 'unexpected-deprecated-icon-attribute'
              });
            }
          }
        }
      }
    });
  }
} as const;

export default rule;
