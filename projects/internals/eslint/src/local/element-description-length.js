import { parseComment } from 'eslint-plugin-jsdoc/iterateJsdoc.js';

const elementTags = new Set(['element', 'customElement', 'customelement', 'tag', 'tagname']);
const min = 100;
const max = 250;

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require custom element JSDoc descriptions to contain 100 to 250 characters.'
    },
    schema: [],
    messages: {
      'missing-description': 'Add an @description with {{min}} to {{max}} characters.',
      'description-length': 'Element @description has {{length}} characters. Use {{min}} to {{max}} characters.'
    }
  },
  create(context) {
    const { sourceCode } = context;

    return {
      ClassDeclaration(node) {
        const { parent } = node;
        const declaration =
          parent.type === 'ExportNamedDeclaration' || parent.type === 'ExportDefaultDeclaration' ? parent : node;
        const firstDecorator = node.decorators?.[0];
        const start = firstDecorator && firstDecorator.range[0] < declaration.range[0] ? firstDecorator : declaration;
        const tags = sourceCode
          .getCommentsBefore(start)
          .filter(
            comment => comment.type === 'Block' && comment.value.startsWith('*') && !comment.value.startsWith('**')
          )
          .flatMap(comment => {
            const { tags } = parseComment(comment, '');
            return tags.map(tag => ({ ...tag, comment }));
          });
        const element = tags.find(({ tag }) => elementTags.has(tag));
        if (!element) {
          return;
        }

        const description = tags.findLast(({ tag }) => tag === 'description');
        if (!description) {
          context.report({ loc: element.comment.loc, messageId: 'missing-description', data: { min, max } });
          return;
        }

        const length = [...description.description.replace(/\s+/gu, ' ').trim()].length;
        if (length < min || length > max) {
          context.report({
            loc: description.comment.loc,
            messageId: 'description-length',
            data: { min, max, length }
          });
        }
      }
    };
  }
};
