const PACKAGE_SCOPE = '@nvidia-elements/';

function getMember(object, name) {
  return object?.members.find(member => member.name.value === name);
}

function getContributions(root) {
  const contributes = getMember(root, 'contributes')?.value;
  const html = contributes?.type === 'Object' ? getMember(contributes, 'html')?.value : undefined;

  return html?.type === 'Object' ? getMember(html, 'customData') : undefined;
}

function isPackageRelativePath(packagePath) {
  return packagePath.startsWith('./') && !packagePath.split('/').includes('..');
}

function getExportTargetPattern(target) {
  return `^${target
    .split('*')
    .map(segment => segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*')}$`;
}

function matchesExportTarget(target, path) {
  if (target.type === 'String') {
    return new RegExp(getExportTargetPattern(target.value)).test(path);
  }

  if (target.type === 'Array') {
    return target.elements.some(element => matchesExportTarget(element.value, path));
  }

  return target.type === 'Object' && target.members.some(member => matchesExportTarget(member.value, path));
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    name: 'require-html-custom-data-contract',
    messages: {
      'invalid-contribution': 'contributes.html.customData must be a non-empty array of package-relative paths.',
      'missing-export': 'contributes.html.customData path "{{path}}" must be exposed by a package export.'
    }
  },
  create(context) {
    return {
      Document(node) {
        const root = node.body;
        if (root.type !== 'Object') return;

        const packageName = getMember(root, 'name')?.value;
        if (packageName?.type !== 'String' || !packageName.value.startsWith(PACKAGE_SCOPE)) return;

        const contributions = getContributions(root);
        if (!contributions) return;

        const exports = getMember(root, 'exports')?.value;
        if (
          contributions.value.type !== 'Array' ||
          contributions.value.elements.length === 0 ||
          contributions.value.elements.some(
            element => element?.value?.type !== 'String' || !isPackageRelativePath(element.value.value)
          )
        ) {
          context.report({ node: contributions.value, messageId: 'invalid-contribution' });
          return;
        }

        for (const element of contributions.value.elements) {
          const isExported =
            exports?.type === 'Object' &&
            exports.members.some(member => matchesExportTarget(member.value, element.value.value));
          if (!isExported) {
            context.report({
              node: element.value,
              messageId: 'missing-export',
              data: { path: element.value.value }
            });
          }
        }
      }
    };
  }
};
