const DEFAULT_MAX_DEPTH = 2;
const DEFAULT_ALLOWED_ROOTS = ['HTMLElement', 'LitElement'];

/**
 * ESLint rule that limits class inheritance depth. The rule counts superclass
 * hops until it reaches a configured allowed root class so local wrappers around
 * platform/framework bases stay possible without allowing hierarchy creep.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
export default {
  meta: {
    type: 'problem',
    name: 'no-deep-class-inheritance',
    docs: {
      description: 'Disallows class inheritance chains deeper than the configured maximum.',
      category: 'Best Practice',
      recommended: true
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          maxDepth: {
            type: 'integer',
            minimum: 1
          },
          allowedRoots: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true
          }
        }
      }
    ],
    messages: {
      'too-deep':
        '`{{className}}` has inheritance depth {{depth}} (`{{chain}}`). Maximum allowed depth is {{maxDepth}}.'
    }
  },
  create(context) {
    const options = context.options[0] ?? {};
    const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
    const allowedRoots = new Set(options.allowedRoots ?? DEFAULT_ALLOWED_ROOTS);

    return {
      ClassDeclaration(node) {
        if (!node.superClass) {
          return;
        }

        const services = context.sourceCode.parserServices;
        if (!services?.program || !services.esTreeNodeToTSNodeMap) {
          return;
        }

        const superClass = services.esTreeNodeToTSNodeMap.get(node.superClass);
        const chain = getInheritanceChain(superClass, services.program.getTypeChecker(), allowedRoots);

        if (chain.length <= maxDepth) {
          return;
        }

        context.report({
          node,
          messageId: 'too-deep',
          data: {
            className: node.id?.name ?? '<anonymous>',
            depth: String(chain.length),
            maxDepth: String(maxDepth),
            chain: `${node.id?.name ?? '<anonymous>'} -> ${chain.join(' -> ')}`
          }
        });
      }
    };
  }
};

function getInheritanceChain(superClass, checker, allowedRoots) {
  const chain = [];
  const visited = new Set();
  let expression = superClass;

  while (expression) {
    const symbol = checker.getTypeAtLocation(expression).symbol;
    const className = symbol?.getName() ?? expression.getText();

    chain.push(className);

    if (allowedRoots.has(className)) {
      break;
    }

    const declaration = getClassDeclaration(symbol);
    if (!declaration || visited.has(declaration)) {
      break;
    }

    visited.add(declaration);
    expression = getExtendsExpression(declaration);
  }

  return chain;
}

function getClassDeclaration(symbol) {
  return symbol?.declarations?.find(declaration => Array.isArray(declaration.members)) ?? null;
}

function getExtendsExpression(classDeclaration) {
  const heritageClause = classDeclaration.heritageClauses?.find(clause => clause.getText().startsWith('extends '));
  return heritageClause?.types?.[0]?.expression ?? null;
}
