import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';

interface HtmlData {
  globalAttributes: {
    name: string;
    values: {
      name: string;
    }[];
  }[];
  version: number;
  $schema: string;
}

let htmlData = {
  globalAttributes: []
};

// try to get html schema from locally installed styles package, fallback to bundled version
try {
  htmlData = await import('@nvidia-elements/styles/data.html.json');
} catch {
  htmlData = (await import('../../../../../styles/dist/data.html.json?inline')) as unknown as HtmlData;
}

const EXCEPTIONS = ['debug', 'mkd', 'md']; // internal scopes

const VALID_NVE_TEXT_VALUES = new Set([
  ...htmlData.globalAttributes.find(attribute => attribute.name === 'nve-text').values.map(value => value.name),
  ...EXCEPTIONS
]);

const VALID_NVE_LAYOUT_VALUES = new Set([
  ...htmlData.globalAttributes.find(attribute => attribute.name === 'nve-layout').values.map(value => value.name),
  ...EXCEPTIONS
]);

const VALID_NVE_DISPLAY_VALUES = new Set([
  ...htmlData.globalAttributes.find(attribute => attribute.name === 'nve-display').values.map(value => value.name),
  ...EXCEPTIONS
]);

const VALUE_BINDINGS = ['${', '{', '{{', '{%'];

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow use of invalid attribute values in HTML.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [],
    messages: {
      ['unexpected-attribute-value']: 'Unexpected value "{{value}}" in "{{attribute}}" attribute'
    }
  },
  create(context) {
    return createVisitors(context, {
      Tag(node) {
        const textAttr = findAttr(node, 'nve-text');

        if (textAttr) {
          const value = textAttr.value.value.split(' ').find(value => !VALID_NVE_TEXT_VALUES.has(value));
          const isValueBinding = VALUE_BINDINGS.some(binding => value?.includes(binding));
          if (value && !isValueBinding) {
            context.report({
              node,
              data: {
                attribute: 'nve-text',
                value
              },
              messageId: 'unexpected-attribute-value'
            });
          }
        }

        const layoutAttr = findAttr(node, 'nve-layout');
        if (layoutAttr) {
          const value = layoutAttr.value.value.split(' ').find(value => !VALID_NVE_LAYOUT_VALUES.has(value));
          const isValueBinding = VALUE_BINDINGS.some(binding => value?.includes(binding));
          if (value && !isValueBinding) {
            context.report({
              node,
              data: {
                attribute: 'nve-layout',
                value
              },
              messageId: 'unexpected-attribute-value'
            });
          }
        }

        const displayAttr = findAttr(node, 'nve-display');
        if (displayAttr) {
          const value = displayAttr.value.value.split(' ').find(value => !VALID_NVE_DISPLAY_VALUES.has(value));
          const isValueBinding = VALUE_BINDINGS.some(binding => value?.includes(binding));
          if (value && !isValueBinding) {
            context.report({
              node,
              data: {
                attribute: 'nve-display',
                value
              },
              messageId: 'unexpected-attribute-value'
            });
          }
        }
      }
    });
  }
} as const;

export default rule;
