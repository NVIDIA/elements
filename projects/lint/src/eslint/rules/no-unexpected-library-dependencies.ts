// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rule } from 'eslint';
import type { HtmlTagNode } from '../rule-types.js';

declare const __ELEMENTS_PAGES_BASE_URL__: string;
type Messages = 'unexpected-dependency-missing' | 'unexpected-dependency-pinned' | 'unexpected-dependency-type';

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow incorrect dependency usage of @nvidia-elements packages in consuming libraries.',
      recommended: true,
      url: `${__ELEMENTS_PAGES_BASE_URL__}/docs/lint/`
    },
    schema: [],
    messages: {
      ['unexpected-dependency-missing']: 'No @nvidia-elements packages found in the project.',
      ['unexpected-dependency-pinned']: 'Libraries dependent on @nvidia-elements packages must contain caret (^) prefix.',
      ['unexpected-dependency-type']: 'Libraries dependent on @nvidia-elements packages must list them as peer dependencies.'
    }
  },
  create(context: Rule.RuleContext) {
    return {
      Document(node: HtmlTagNode) {
        if (context.filename.includes('package.json')) {
          const packageJson = JSON.parse(context.getSourceCode().getText());
          const isLibrary = packageJson.exports !== undefined;
          const ownedPackage = packageJson.name && packageJson.name.startsWith('@nvidia-elements');

          if (isLibrary && !ownedPackage) {
            const messageId = checkPeerDependencies(packageJson);
            if (messageId) {
              context.report({
                messageId,
                loc: node.loc!
              });
            }
          }
        }
      }
    };
  }
} as const;

export default rule;

function checkPeerDependencies(packageJson: {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}): Messages | undefined {
  const dependencies = Object.keys(packageJson.dependencies ?? {});
  const devDependencies = Object.keys(packageJson.devDependencies ?? {});
  const peerDependencies = Object.keys(packageJson.peerDependencies ?? {});
  const hasDevDependencies = devDependencies.some(dependency => dependency.includes('@nvidia-elements'));
  const hasDependencies = dependencies.some(dependency => dependency.includes('@nvidia-elements'));
  const hasPeerDependencies = peerDependencies.some(dependency => dependency.includes('@nvidia-elements'));
  const peerDeps = packageJson.peerDependencies ?? {};
  const hasPinnedVersion = peerDependencies.find(
    n =>
      n.startsWith('@nvidia-elements') &&
      !peerDeps[n]?.startsWith('^') &&
      !peerDeps[n]?.startsWith('workspace:') &&
      !peerDeps[n]?.startsWith('catalog:')
  );

  if (!hasPeerDependencies && (hasDependencies || hasDevDependencies)) {
    return 'unexpected-dependency-type';
  } else if (!hasPeerDependencies) {
    return 'unexpected-dependency-missing';
  } else if (hasPinnedVersion) {
    return 'unexpected-dependency-pinned';
  }

  return undefined;
}
