const dependencyTypes = new Set(['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']);

const runtimeDependencyTypes = new Set(['dependencies', 'peerDependencies', 'optionalDependencies']);

function isVersionRange(version) {
  return version.startsWith('^') || version.startsWith('~');
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    name: 'no-unpinned-dependency-ranges',
    messages: {
      'unpinned-range': 'Dependency "{{name}}" has an invalid version specifier "{{version}}". {{reason}}'
    }
  },
  create(context) {
    return {
      Document(node) {
        const root = node.body;
        if (root.type !== 'Object') return;

        const isPrivate = root.members.some(
          m => m.name.value === 'private' && m.value.type === 'Boolean' && m.value.value === true
        );

        for (const member of root.members) {
          if (!dependencyTypes.has(member.name.value) || member.value.type !== 'Object') continue;
          const isRuntime = runtimeDependencyTypes.has(member.name.value);

          for (const dep of member.value.members) {
            if (dep.value.type !== 'String') continue;

            const name = dep.name.value;
            const version = dep.value.value;

            // Any catalog: reference (default or named catalog) resolves through pnpm to a
            // concrete version, so treat every catalog:* form as valid here.
            if (version.startsWith('catalog:')) continue;

            let reason;
            if (isPrivate) {
              if (isVersionRange(version)) {
                reason = 'Private packages must use pinned versions to ensure reproducible installs.';
              }
            } else if (isRuntime) {
              const hasRange =
                isVersionRange(version) || (version.startsWith('workspace:') && version !== 'workspace:*');
              if (!hasRange) {
                reason =
                  'Published runtime dependencies must use a range specifier (^ or ~) for downstream deduplication.';
              }
            } else if (isVersionRange(version)) {
              reason = 'Published devDependencies must use pinned versions for reproducible installs.';
            }

            if (reason) {
              context.report({
                node: dep.value,
                messageId: 'unpinned-range',
                data: { name, version, reason }
              });
            }
          }
        }
      }
    };
  }
};
