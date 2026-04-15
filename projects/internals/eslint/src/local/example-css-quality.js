import { findHtmlTemplate, hasTag, getTemplateText } from './example-helpers.js';

const MAX_CSS_CHARACTER_RATIO = 0.1;
const INLINE_STYLE_VALUE_PATTERN = /\bstyle\s*=\s*("([^"]*)"|'([^']*)')/gi;
const STYLE_TAG_PATTERN = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
const EXCLUDED_SIZING_DECLARATION_PATTERN =
  /(^|[;{])(?:object-fit|(?:--)?(?:min-|max-)?(?:width|height)):[^;}]*(?=[;}]|$)/gi;

function countCharacters(text) {
  const compact = text
    // exclude whitespace
    .replace(/\s+/g, '');

  const withoutExcludedDeclarations = compact.replace(
    // remove full declarations for layout sizing styles while preserving delimiters
    EXCLUDED_SIZING_DECLARATION_PATTERN,
    '$1'
  );

  return withoutExcludedDeclarations.length;
}

/**
 * ESLint rule that detects excessive custom CSS in example templates. Excessive
 * customization reduces system and context quality and consistency for AI agent consumption.
 *
 * Flags templates where CSS character density is too high relative to template size.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
export default {
  meta: {
    type: 'suggestion',
    name: 'example-css-quality',
    docs: {
      description: 'Detect excessive custom CSS in example templates that reduces quality for AI agent consumption.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [],
    messages: {
      'excessive-custom-styles':
        'Example `{{name}}` has excessive CSS customization ({{percent}}% of template). Keep CSS under 10% of template or use `@tags test-case` or `@tags theme` to exclude from agent context.'
    }
  },
  create(context) {
    return {
      ExportNamedDeclaration(node) {
        if (!node.declaration || node.declaration.type !== 'VariableDeclaration') {
          return;
        }

        const declarator = node.declaration.declarations[0];
        if (!declarator || declarator.id.type !== 'Identifier') {
          return;
        }

        if (hasTag(context, node, 'test-case') || hasTag(context, node, 'theme') || hasTag(context, node, 'pattern')) {
          return;
        }

        const name = declarator.id.name;
        const template = findHtmlTemplate(declarator.init);
        if (!template) {
          return;
        }

        const templateText = getTemplateText(template);
        const templateCharacterLength = templateText.length;
        if (templateCharacterLength === 0) {
          return;
        }

        const styleAttributeValues = [...templateText.matchAll(INLINE_STYLE_VALUE_PATTERN)].map(match =>
          (match[2] ?? match[3] ?? '').trim()
        );
        const inlineStyleCssCharacters = styleAttributeValues.reduce(
          (total, value) => total + countCharacters(value),
          0
        );

        let styleTagCssCharacters = 0;
        const styleTags = templateText.matchAll(STYLE_TAG_PATTERN);
        for (const styleTag of styleTags) {
          styleTagCssCharacters += countCharacters(styleTag[1] ?? '');
        }

        const totalCssCharacters = inlineStyleCssCharacters + styleTagCssCharacters;
        const cssCharacterRatio = totalCssCharacters / templateCharacterLength;

        if (cssCharacterRatio > MAX_CSS_CHARACTER_RATIO) {
          context.report({
            node,
            messageId: 'excessive-custom-styles',
            data: {
              name,
              percent: (cssCharacterRatio * 100).toFixed(1)
            }
          });
        }
      }
    };
  }
};
