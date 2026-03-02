import { createVisitors } from '@html-eslint/eslint-plugin/lib/rules/utils/visitors.js';

/**
 * ESLint rule that ensures components using other `nve-*` elements in templates
 * declare them in `static elementDefinitions` for scoped registration.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
export default {
  meta: {
    type: 'problem',
    name: 'require-element-definitions',
    docs: {
      description: 'Ensures nve-* elements used in templates are declared in static elementDefinitions.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [],
    messages: {
      'missing-element-definition':
        '`<{{tagName}}>` is used in the template but not declared in `static elementDefinitions`. Add it to `elementDefinitions` for scoped registration.'
    }
  },
  create(context) {
    let classNode = null;
    let definedTags = new Set();
    let templateTags = new Set();
    let templateTagNodes = new Map();

    return {
      ClassDeclaration(node) {
        if (!node.superClass) {
          return;
        }

        classNode = node;
        definedTags = new Set();
        templateTags = new Set();
        templateTagNodes = new Map();

        // Collect tags from static elementDefinitions
        const elementDefsProp = node.body.body.find(
          member =>
            member.type === 'PropertyDefinition' &&
            member.static &&
            member.key.type === 'Identifier' &&
            member.key.name === 'elementDefinitions'
        );

        if (elementDefsProp && elementDefsProp.value && elementDefsProp.value.type === 'ObjectExpression') {
          for (const prop of elementDefsProp.value.properties) {
            if (prop.type === 'Property' && prop.key.type === 'Literal' && typeof prop.key.value === 'string') {
              definedTags.add(prop.key.value);
            } else if (prop.type === 'Property' && prop.key.type === 'Identifier') {
              definedTags.add(prop.key.name);
            } else if (prop.type === 'Property' && prop.computed) {
              // Handle computed keys like [Icon.metadata.tag]: Icon
              // Derive tag from the class name: Icon → nve-icon, IconButton → nve-icon-button
              const className = resolveComputedMetadataTag(prop.key);
              if (className) {
                const tag =
                  'nve-' +
                  className
                    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
                    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
                    .toLowerCase();
                definedTags.add(tag);
              }
            }
          }
        }
      },
      'ClassDeclaration:exit'(node) {
        if (node !== classNode) {
          return;
        }

        // Get the component's own tag name from metadata to exclude self-references
        let ownTag = null;
        const metadataProp = node.body.body.find(
          member =>
            member.type === 'PropertyDefinition' &&
            member.static &&
            member.key.type === 'Identifier' &&
            member.key.name === 'metadata'
        );
        if (metadataProp && metadataProp.value && metadataProp.value.type === 'ObjectExpression') {
          const tagProp = metadataProp.value.properties.find(
            p => p.type === 'Property' && p.key.type === 'Identifier' && p.key.name === 'tag'
          );
          if (tagProp && tagProp.value.type === 'Literal') {
            ownTag = tagProp.value.value;
          }
        }

        for (const tagName of templateTags) {
          if (tagName === ownTag) {
            continue;
          }
          if (!definedTags.has(tagName)) {
            const reportNode = templateTagNodes.get(tagName) || node;
            context.report({
              node: reportNode,
              messageId: 'missing-element-definition',
              data: { tagName }
            });
          }
        }

        classNode = null;
      },
      ...createVisitors(context, {
        Tag(node) {
          if (!classNode) {
            return;
          }
          const tagName = node.name;
          if (tagName && tagName.startsWith('nve-')) {
            templateTags.add(tagName);
            if (!templateTagNodes.has(tagName)) {
              templateTagNodes.set(tagName, node);
            }
          }
        }
      })
    };
  }
};

/**
 * Resolve computed key `ClassName.metadata.tag` to the class name.
 * Returns the class name identifier or null if the pattern doesn't match.
 */
function resolveComputedMetadataTag(keyNode) {
  // Pattern: ClassName.metadata.tag
  if (
    keyNode.type === 'MemberExpression' &&
    keyNode.property.type === 'Identifier' &&
    keyNode.property.name === 'tag' &&
    keyNode.object.type === 'MemberExpression' &&
    keyNode.object.property.type === 'Identifier' &&
    keyNode.object.property.name === 'metadata' &&
    keyNode.object.object.type === 'Identifier'
  ) {
    return keyNode.object.object.name;
  }
  return null;
}
