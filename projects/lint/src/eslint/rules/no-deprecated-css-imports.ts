// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import { defineRuleDocumentation } from '../rule-documentation.js';
import type { CssAtRuleNode } from '../rule-types.js';

const themeAndStyleImports = `@import '@nvidia-elements/themes/fonts/inter.css';
@import '@nvidia-elements/themes/index.css';
@import '@nvidia-elements/themes/high-contrast.css';
@import '@nvidia-elements/themes/reduced-motion.css';
@import '@nvidia-elements/themes/compact.css';
@import '@nvidia-elements/themes/dark.css';
@import '@nvidia-elements/themes/debug.css';
@import '@nvidia-elements/styles/typography.css';
@import '@nvidia-elements/styles/layout.css';
@import '@nvidia-elements/styles/view-transitions.css';`;

export const deprecatedImports: Record<string, string> = {
  '@nvidia-elements/core/index.css': themeAndStyleImports,
  '@nvidia-elements/core/css/module.layout.css': `@import '@nvidia-elements/styles/layout.css';`,
  '@nvidia-elements/core/css/module.typography.css': `@import '@nvidia-elements/styles/typography.css';`,
  '@maglev/elements/index.css': themeAndStyleImports,
  '@maglev/elements/inter.css': `@import '@nvidia-elements/themes/fonts/inter.css';`,
  '@maglev/elements/css/module.layout.css': `@import '@nvidia-elements/styles/layout.css';`,
  '@maglev/elements/css/module.typography.css': `@import '@nvidia-elements/styles/typography.css';`
};

const rule = {
  meta: {
    type: 'problem' as const,
    docs: defineRuleDocumentation({
      name: 'no-deprecated-css-imports',
      description: 'Disallow use of deprecated CSS import paths.',
      category: 'Best Practice',
      recommended: true,
      examples: {
        language: 'css',
        valid: "@import '@nvidia-elements/themes/fonts/inter.css';",
        invalid: "@import '@maglev/elements/index.css';"
      }
    }),
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

        const sourceCode = context.sourceCode;
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
