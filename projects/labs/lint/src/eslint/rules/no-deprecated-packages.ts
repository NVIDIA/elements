const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow usage of deprecated packages.',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [],
    messages: {
      ['unexpected-deprecated-package']: 'Use of deprecated package {{package}}, upgrade to {{alternative}} instead.'
    }
  },
  create(context) {
    return {
      Document(node) {
        if (context.filename.includes('package.json')) {
          const packageJson = JSON.parse(context.getSourceCode().getText());
          const dependencies = Object.keys(packageJson.dependencies ?? {});
          const devDependencies = Object.keys(packageJson.devDependencies ?? {});
          const peerDependencies = Object.keys(packageJson.peerDependencies ?? {});
          const hasDeprecatedDevDependencies = devDependencies.find(dependency => dependency === '@mlv/elements');
          const hasDeprecatedDependencies = dependencies.find(dependency => dependency === '@mlv/elements');
          const hasDeprecatedPeerDependencies = peerDependencies.find(dependency => dependency === '@mlv/elements');

          if (hasDeprecatedPeerDependencies || hasDeprecatedDependencies || hasDeprecatedDevDependencies) {
            context.report({
              messageId: 'unexpected-deprecated-package',
              loc: node.loc,
              data: {
                package: '@mlv/elements',
                alternative: '@nvidia-elements/core'
              }
            });
          }
        }
      }
    };
  }
} as const;

export default rule;
