const deprecatedImports: Record<string, string> = {
  '@nvidia-elements/core/index.css': `@import '@nvidia-elements/themes/fonts/inter.css';\n@import '@nvidia-elements/themes/index.css';\n@import '@nvidia-elements/themes/dark.css';\n@import '@nvidia-elements/styles/typography.css';\n@import '@nvidia-elements/styles/layout.css';`,
  '@nvidia-elements/core/css/module.layout.css': `@import '@nvidia-elements/styles/layout.css';`,
  '@nvidia-elements/core/css/module.typography.css': `@import '@nvidia-elements/styles/typography.css';`,
  '@elements/elements/index.css': `@import '@nvidia-elements/themes/fonts/inter.css';\n@import '@nvidia-elements/themes/index.css';\n@import '@nvidia-elements/themes/dark.css';\n@import '@nvidia-elements/styles/typography.css';\n@import '@nvidia-elements/styles/layout.css';`,
  '@elements/elements/css/module.layout.css': `@import '@nvidia-elements/styles/layout.css';`,
  '@elements/elements/css/module.typography.css': `@import '@nvidia-elements/styles/typography.css';`
};

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow use of deprecated CSS import paths.',
      category: 'Best Practice',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    fixable: 'code' as const,
    schema: [],
    messages: {
      ['deprecated-css-import']: 'Use of deprecated path {{value}}. Use {{alternative}} instead.'
    }
  },
  create(context) {
    return {
      Atrule(node) {
        // Check if this is an @import rule
        if (node.name !== 'import') {
          return;
        }

        // Extract the import path from the prelude
        const prelude = node.prelude;
        if (!prelude) {
          return;
        }

        // Get the text content of the prelude
        const sourceCode = context.sourceCode || context.getSourceCode();
        const preludeText = sourceCode.getText(prelude).trim();

        // Remove quotes and whitespace to get the actual path
        const importPath = preludeText.replace(/^['"]|['"]$/g, '').trim();

        // Check if this import path has a deprecated status
        if (importPath in deprecatedImports) {
          context.report({
            node,
            messageId: 'deprecated-css-import',
            data: {
              value: importPath,
              alternative: deprecatedImports[importPath]
            },
            fix: fixer => fixer.replaceText(node, deprecatedImports[importPath])
          });
        }
      }
    };
  }
} as const;

export default rule;
