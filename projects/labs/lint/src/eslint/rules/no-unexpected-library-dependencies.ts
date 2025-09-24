type Messages = 'unexpected-dependency-missing' | 'unexpected-dependency-pinned' | 'unexpected-dependency-type';

const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description: 'Disallow incorrect dependency usage of @nve packages in consuming libraries.',
      recommended: true,
      url: 'https://NVIDIA.github.io/elements/docs/lint/'
    },
    schema: [],
    messages: {
      ['unexpected-dependency-missing']: 'No @nve packages found in the project.',
      ['unexpected-dependency-pinned']: 'Libraries dependent on @nve packages must contain caret (^) prefix.',
      ['unexpected-dependency-type']: 'Libraries dependent on @nve packages must list them as peer dependencies.'
    }
  },
  create(context) {
    return {
      Document(node) {
        if (context.filename.includes('package.json')) {
          const packageJson = JSON.parse(context.getSourceCode().getText());
          const isLibrary = packageJson.exports !== undefined;
          const ownedPackage = packageJson.name && packageJson.name.startsWith('@nve');

          if (isLibrary && !ownedPackage) {
            const messageId = checkPeerDependencies(packageJson);
            if (messageId) {
              context.report({
                messageId,
                loc: node.loc
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
  const hasDevDependencies = devDependencies.some(dependency => dependency.includes('@nve'));
  const hasDependencies = dependencies.some(dependency => dependency.includes('@nve'));
  const hasPeerDependencies = peerDependencies.some(dependency => dependency.includes('@nve'));
  const hasPinnedVersion = peerDependencies.find(
    n =>
      n.startsWith('@nve') &&
      !packageJson.peerDependencies[n].startsWith('^') &&
      !packageJson.peerDependencies[n].startsWith('workspace:') &&
      !packageJson.peerDependencies[n].startsWith('catalog:')
  );

  if (!hasPeerDependencies && (hasDependencies || hasDevDependencies)) {
    return 'unexpected-dependency-type';
  } else if (!hasPeerDependencies) {
    return 'unexpected-dependency-missing';
  } else if (hasPinnedVersion) {
    return 'unexpected-dependency-pinned';
  }
}
