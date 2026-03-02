/**
 * ESLint rule that ensures component classes have `static readonly metadata = { tag: 'nve-*', version: '0.0.0' }`.
 * Missing metadata breaks registration, testing, and documentation.
 *
 * Exemptions:
 * - Classes in `/internal/` or `/polyfills/` paths
 * - Class names starting with `Base`
 * - Classes without a superclass (not components)
 *
 * @type {import('eslint').Rule.RuleModule}
 */
export default {
  meta: {
    type: 'problem',
    name: 'require-component-metadata',
    docs: {
      description: 'Ensures component classes have static metadata with tag and version properties.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [],
    messages: {
      'missing-metadata':
        "Component class `{{className}}` is missing `static readonly metadata = { tag: 'nve-*', version: '0.0.0' }`.",
      'missing-tag': 'Component metadata in `{{className}}` is missing the `tag` property.',
      'invalid-tag-prefix': 'Component metadata `tag` in `{{className}}` must start with `nve-`. Found: `{{tag}}`.',
      'missing-version': 'Component metadata in `{{className}}` is missing the `version` property.'
    }
  },
  create(context) {
    return {
      ClassDeclaration(node) {
        if (!node.superClass) {
          return;
        }

        const className = node.id ? node.id.name : '';

        if (className.startsWith('Base')) {
          return;
        }

        const filename = context.filename || context.getFilename();
        if (filename.includes('/internal/') || filename.includes('/polyfills/')) {
          return;
        }

        const metadataProp = node.body.body.find(
          member =>
            member.type === 'PropertyDefinition' &&
            member.static &&
            member.key.type === 'Identifier' &&
            member.key.name === 'metadata'
        );

        if (!metadataProp) {
          context.report({ node, messageId: 'missing-metadata', data: { className } });
          return;
        }

        const value = metadataProp.value;
        if (!value || value.type !== 'ObjectExpression') {
          context.report({ node, messageId: 'missing-metadata', data: { className } });
          return;
        }

        const tagProp = value.properties.find(
          p => p.type === 'Property' && p.key.type === 'Identifier' && p.key.name === 'tag'
        );

        const versionProp = value.properties.find(
          p => p.type === 'Property' && p.key.type === 'Identifier' && p.key.name === 'version'
        );

        if (!tagProp) {
          context.report({ node: metadataProp, messageId: 'missing-tag', data: { className } });
        } else if (tagProp.value.type === 'Literal' && typeof tagProp.value.value === 'string') {
          if (!tagProp.value.value.startsWith('nve-')) {
            context.report({
              node: tagProp,
              messageId: 'invalid-tag-prefix',
              data: { className, tag: tagProp.value.value }
            });
          }
        }

        if (!versionProp) {
          context.report({ node: metadataProp, messageId: 'missing-version', data: { className } });
        }
      }
    };
  }
};
