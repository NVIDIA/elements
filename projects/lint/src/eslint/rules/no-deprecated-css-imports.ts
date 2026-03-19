// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import type { CssAtRuleNode } from '../rule-types.js';

const deprecatedImports: Record<string, string> = {
  '@nvidia-elements/core/index.css': `@import '@nvidia-elements/themes/fonts/inter.css';\n@import '@nvidia-elements/themes/index.css';\n@import '@nvidia-elements/themes/dark.css';\n@import '@nvidia-elements/styles/typography.css';\n@import '@nvidia-elements/styles/layout.css';`,
  '@nvidia-elements/core/css/module.layout.css': `@import '@nvidia-elements/styles/layout.css';`,
  '@nvidia-elements/core/css/module.typography.css': `@import '@nvidia-elements/styles/typography.css';`,
  '@maglev/elements/index.css': `@import '@nvidia-elements/themes/fonts/inter.css';\n@import '@nvidia-elements/themes/index.css';\n@import '@nvidia-elements/themes/dark.css';\n@import '@nvidia-elements/styles/typography.css';\n@import '@nvidia-elements/styles/layout.css';`,
  '@maglev/elements/css/module.layout.css': `@import '@nvidia-elements/styles/layout.css';`,
  '@maglev/elements/css/module.typography.css': `@import '@nvidia-elements/styles/typography.css';`
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
  create(context: Rule.RuleContext) {
    return {
      Atrule(node: CssAtRuleNode) {
        if (node.name !== 'import') {
          return;
        }

        const prelude = node.prelude;
        if (!prelude) {
          return;
        }

        const sourceCode = context.sourceCode || context.getSourceCode();
        const preludeText = sourceCode.getText(prelude as unknown as Rule.Node).trim();

        const importPath = preludeText.replace(/^['"]|['"]$/g, '').trim();

        if (importPath in deprecatedImports) {
          context.report({
            node: node as unknown as Rule.Node,
            messageId: 'deprecated-css-import',
            data: {
              value: importPath,
              alternative: deprecatedImports[importPath]
            },
            fix: (fixer: Rule.RuleFixer) =>
              fixer.replaceText(node as unknown as Rule.Node, deprecatedImports[importPath]!)
          });
        }
      }
    };
  }
} as const;

export default rule;
