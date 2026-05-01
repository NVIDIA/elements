// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import type { HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;
export const DEPRECATED_PACKAGES: Record<string, string> = {
  '@nve/elements': '@nvidia-elements/core',
  '@nve/styles': '@nvidia-elements/styles',
  '@nve/themes': '@nvidia-elements/themes',
  '@nve/monaco': '@nvidia-elements/monaco',
  '@nve-labs/forms': '@nvidia-elements/forms',
  '@nve-labs/cli': '@nvidia-elements/cli',
  '@nve-labs/code': '@nvidia-elements/code',
  '@nve-labs/create': '@nvidia-elements/create',
  '@nve-labs/markdown': '@nvidia-elements/markdown',
  '@nve-labs/media': '@nvidia-elements/media',
  '@nve-labs/lint': '@nvidia-elements/lint',
  '@maglev/elements': '@nvidia-elements/core + @nvidia-elements/themes + @nvidia-elements/styles',
  '@mlv/elements': '@nvidia-elements/core',
  '@nve/testing': 'project-supported test utilities'
};

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow usage of deprecated packages.',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [],
    messages: {
      ['unexpected-deprecated-package']: 'Use of deprecated package {{package}}, upgrade to {{alternative}} instead.'
    }
  },
  create(context: Rule.RuleContext) {
    return {
      Document(node: HtmlTagNode) {
        if (context.filename.includes('package.json')) {
          const packageJson = JSON.parse(context.sourceCode.getText());
          const dependencies = Object.keys(packageJson.dependencies ?? {});
          const devDependencies = Object.keys(packageJson.devDependencies ?? {});
          const peerDependencies = Object.keys(packageJson.peerDependencies ?? {});
          const deprecatedDependencies = [...dependencies, ...devDependencies, ...peerDependencies].filter(
            dependency => dependency in DEPRECATED_PACKAGES
          );

          deprecatedDependencies.forEach(dependency => {
            context.report({
              messageId: 'unexpected-deprecated-package',
              loc: node.loc!,
              data: {
                package: dependency,
                alternative: DEPRECATED_PACKAGES[dependency]
              }
            });
          });
        }
      }
    };
  }
} as const;

export default rule;
