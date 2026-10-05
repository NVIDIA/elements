import path, { posix, win32 } from 'node:path';
import { getPackageName } from './utils.js';

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    name: 'no-internal-external-imports',
    docs: {
      description: 'Prevent internal implementation code from depending on public code in the same package.',
      recommended: true
    },
    schema: [],
    messages: {
      'outside-internal':
        'Internal code cannot import "{{source}}" outside its internal directory. Move shared code into internal to avoid circular dependencies.'
    }
  },
  create(context) {
    const physicalFilename = context.physicalFilename ?? context.filename;
    const paths = win32.isAbsolute(physicalFilename) && !posix.isAbsolute(physicalFilename) ? win32 : path;
    const filename = physicalFilename.replaceAll('\\', '/');
    const match = /^(.*\/src\/(?:internal|internals))(?:\/)/u.exec(filename);
    if (!match || /\.(?:test(?:\.[^.]+)?|examples)\.[cm]?[jt]sx?$/u.test(filename)) return {};

    const internalDirectory = match[1];
    const internalName = posix.basename(internalDirectory);
    const packageName = getPackageName(paths.dirname(physicalFilename));

    function checkSource(node) {
      const source = getStaticSource(node);
      if (source === undefined) return;
      const specifier = source.split(/[?#]/u)[0];
      let outside = false;

      if (specifier.startsWith('.') || paths.isAbsolute(specifier)) {
        const target = paths.resolve(paths.dirname(physicalFilename), specifier).replaceAll('\\', '/');
        outside = target !== internalDirectory && !target.startsWith(`${internalDirectory}/`);
      } else if (packageName && (specifier === packageName || specifier.startsWith(`${packageName}/`))) {
        const subpath = posix.normalize(specifier.slice(packageName.length + 1));
        outside = subpath !== internalName && !subpath.startsWith(`${internalName}/`);
      }

      if (outside) {
        context.report({ node, messageId: 'outside-internal', data: { source } });
      }
    }

    return {
      ImportDeclaration: node => checkSource(node.source),
      ExportNamedDeclaration: node => checkSource(node.source),
      ExportAllDeclaration: node => checkSource(node.source),
      ImportExpression: node => checkSource(node.source),
      TSImportType: node => checkSource(node.source),
      TSExternalModuleReference: node => checkSource(node.expression),
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'require' && node.arguments.length === 1) {
          checkSource(node.arguments[0]);
        }
      }
    };
  }
};

function getStaticSource(node) {
  if (node?.type === 'Literal' && typeof node.value === 'string') return node.value;
  if (node?.type === 'TemplateLiteral' && node.expressions.length === 0) return node.quasis[0].value.cooked;
  return undefined;
}
