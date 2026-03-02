/**
 * ESLint rule (CSS language) that disallows setting `margin` on `:host`.
 * External spacing is the consumer's responsibility, not the component's.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
export default {
  meta: {
    type: 'problem',
    name: 'no-host-margin',
    docs: {
      description: 'Disallows setting margin on :host in component styles.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [],
    fixable: 'code',
    messages: {
      'no-host-margin':
        "Do not set `{{property}}` on `:host`. External spacing (margin) is the consumer's responsibility. Use padding or internal layout instead."
    }
  },
  create(context) {
    return {
      Rule(node) {
        const selectorText = getSelectorText(node);
        if (!selectorText || !selectorText.includes(':host')) {
          return;
        }

        const block = node.block;
        if (!block || !block.children) {
          return;
        }

        for (const child of block.children) {
          if (child.type === 'Declaration' && isMarginProperty(child.property)) {
            context.report({
              node: child,
              messageId: 'no-host-margin',
              data: { property: child.property },
              fix(fixer) {
                return fixer.remove(child);
              }
            });
          }
        }
      }
    };
  }
};

function getSelectorText(ruleNode) {
  if (!ruleNode.prelude) {
    return null;
  }

  if (typeof ruleNode.prelude === 'string') {
    return ruleNode.prelude;
  }

  // CSS AST from @eslint/css may use different shapes
  if (ruleNode.prelude.type === 'SelectorList' || ruleNode.prelude.children) {
    return sourceText(ruleNode.prelude);
  }

  if (ruleNode.prelude.value) {
    return ruleNode.prelude.value;
  }

  return null;
}

function sourceText(node) {
  if (!node) {
    return '';
  }

  if (typeof node === 'string') {
    return node;
  }

  if (node.name) {
    return node.name;
  }

  if (node.value && typeof node.value === 'string') {
    return node.value;
  }

  if (node.children) {
    return node.children.map(sourceText).join('');
  }

  return '';
}

function isMarginProperty(prop) {
  return (
    prop === 'margin' ||
    prop === 'margin-top' ||
    prop === 'margin-right' ||
    prop === 'margin-bottom' ||
    prop === 'margin-left' ||
    prop === 'margin-block' ||
    prop === 'margin-block-start' ||
    prop === 'margin-block-end' ||
    prop === 'margin-inline' ||
    prop === 'margin-inline-start' ||
    prop === 'margin-inline-end'
  );
}
