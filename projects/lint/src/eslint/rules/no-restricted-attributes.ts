import type { Rule } from 'eslint';
import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';
import { findAttr } from '@html-eslint/eslint-plugin/lib/rules/utils/node.js';
import { getElementAttributeNames } from '../internals/element-attributes.js';
import type { HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;
const RESTRICTED_GLOBAL_ATTRIBUTES = ['nve-text', 'nve-layout', 'nve-text', 'nve-layout'];
const RESTRICTED_ELEMENT_API_ATTRIBUTES = ['variant'];

// External box-model attribute values that custom elements allow
function isExternalBoxModelValue(value: string) {
  return value
    .trim()
    .split(' ')
    .every(part => part.startsWith('span:') || part === 'full');
}

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow use of invalid API attributes or utility attributes on custom HTML element tags.',
      category: 'Best Practice',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [],
    messages: {
      ['no-restricted-attributes']:
        'Unexpected use of restricted attribute "{{attribute}}" on <{{element}}>. Remove the attribute.',
      ['no-restricted-attributes-with-supported']:
        'Unexpected use of restricted attribute "{{attribute}}" on <{{element}}>. Remove the attribute. Supported attributes: {{supportedAttributes}}'
    }
  },
  create(context: Rule.RuleContext) {
    return createVisitors(context, {
      Tag(node: HtmlTagNode) {
        RESTRICTED_GLOBAL_ATTRIBUTES.forEach(attribute => {
          const attr = findAttr(node, attribute);
          const isCustomElement = node.name.includes('-') && attr;

          if (isCustomElement) {
            // Allow external box-model values for layout attributes
            if (attribute === 'nve-layout' && attr.value?.value) {
              if (isExternalBoxModelValue(attr.value.value)) {
                return;
              }
            }

            reportRestricted(context, attr, attribute, node.name);
          }
        });

        RESTRICTED_ELEMENT_API_ATTRIBUTES.forEach(attribute => {
          const attr = findAttr(node, attribute);
          const isElementAPI = node.name.startsWith('nve-') && attr;
          if (isElementAPI) {
            reportRestricted(context, attr, attribute, node.name);
          }
        });
      }
    });
  }
} as const;

function reportRestricted(context: Rule.RuleContext, attr: Rule.Node, attribute: string, elementName: string) {
  const supported = getElementAttributeNames(elementName);
  if (supported.length > 0) {
    context.report({
      messageId: 'no-restricted-attributes-with-supported',
      node: attr,
      data: {
        attribute,
        element: elementName,
        supportedAttributes: supported.map(a => `"${a}"`).join(', ')
      }
    });
  } else {
    context.report({
      messageId: 'no-restricted-attributes',
      node: attr,
      data: {
        attribute,
        element: elementName
      }
    });
  }
}

export default rule;
