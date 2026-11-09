import { statSync } from 'node:fs';
import { basename } from 'node:path';

function getVariable(node, sourceCode) {
  for (let scope = sourceCode.getScope(node); scope; scope = scope.upper) {
    const variable = scope.set.get(node.name);
    if (variable) {
      return variable;
    }
  }
}

function isStaticData(node, sourceCode) {
  if (!node) {
    return false;
  }

  switch (node.type) {
    case 'Literal':
      return true;
    case 'TemplateLiteral':
      return node.expressions.length === 0;
    case 'TSAsExpression':
    case 'TSTypeAssertion':
    case 'TSSatisfiesExpression':
      return isStaticData(node.expression, sourceCode);
    case 'UnaryExpression':
      return ['+', '-'].includes(node.operator) && node.argument.type === 'Literal';
    case 'ArrayExpression':
      return node.elements.every(element => element === null || isStaticData(element, sourceCode));
    case 'SpreadElement':
      // Treat imported lists as data without following imports across files.
      return (
        node.argument.type === 'Identifier' &&
        getVariable(node.argument, sourceCode)?.defs.some(
          definition => definition.type === 'ImportBinding' && definition.node.type !== 'ImportNamespaceSpecifier'
        )
      );
    case 'NewExpression':
      return (
        node.callee.type === 'Identifier' &&
        ['Set', 'Map'].includes(node.callee.name) &&
        !getVariable(node.callee, sourceCode)?.defs.length &&
        (node.arguments.length === 0 ||
          (node.arguments.length === 1 &&
            node.arguments[0].type === 'ArrayExpression' &&
            isStaticData(node.arguments[0], sourceCode)))
      );
    case 'ObjectExpression':
      return node.properties.every(
        property =>
          property.type === 'Property' &&
          property.kind === 'init' &&
          !property.method &&
          !property.computed &&
          isStaticData(property.value, sourceCode)
      );
    default:
      return false;
  }
}

function isDeclarationOrData(node, sourceCode) {
  if (node.type === 'ExportNamedDeclaration') {
    return !node.declaration || isDeclarationOrData(node.declaration, sourceCode);
  }

  if (node.type === 'ExportDefaultDeclaration') {
    return node.declaration.type === 'TSInterfaceDeclaration' || isStaticData(node.declaration, sourceCode);
  }

  if (node.type === 'VariableDeclaration' && node.kind === 'const') {
    return (
      node.declare === true ||
      node.declarations.every(
        declaration => declaration.id.type === 'Identifier' && isStaticData(declaration.init, sourceCode)
      )
    );
  }

  return (
    node.type === 'ImportDeclaration' ||
    node.type === 'ExportAllDeclaration' ||
    node.type === 'TSInterfaceDeclaration' ||
    node.type === 'TSTypeAliasDeclaration' ||
    node.type === 'TSDeclareFunction' ||
    node.declare === true
  );
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: 'problem',
    name: 'require-unit-test',
    docs: {
      description: 'Requires TypeScript implementation files to have a sibling unit test file.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [],
    messages: {
      'missing-unit-test': 'Source file `{{sourceFile}}` is missing a sibling unit test file: `{{testFile}}`.'
    }
  },
  create(context) {
    const filename = context.filename;
    const cwd = context.cwd.replace(/[/\\]+$/, '');
    const projectFilename =
      filename.startsWith(`${cwd}/`) || filename.startsWith(`${cwd}\\`) ? filename.slice(cwd.length + 1) : filename;
    if (
      !filename.endsWith('.ts') ||
      /\.(?:d|test(?:\.[^.]+)?|examples)\.ts$/.test(filename) ||
      /(?:^|[/\\])(?:test|tests|__tests__)(?:[/\\])/.test(projectFilename) ||
      /(?:^|[/\\])src[/\\]scripts[/\\]/.test(projectFilename) ||
      ['define.ts', 'bundle.ts'].includes(basename(filename))
    ) {
      return {};
    }

    return {
      Program(node) {
        if (node.body.every(statement => isDeclarationOrData(statement, context.sourceCode))) {
          return;
        }

        const testFilename = filename.slice(0, -3) + '.test.ts';
        if (statSync(testFilename, { throwIfNoEntry: false })?.isFile()) {
          return;
        }

        context.report({
          node,
          messageId: 'missing-unit-test',
          data: { sourceFile: basename(filename), testFile: basename(testFilename) }
        });
      }
    };
  }
};
