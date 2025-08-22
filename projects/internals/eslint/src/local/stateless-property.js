const props = new Map();
const mutations = new Map();

/** https://github.com/stencil-community/stencil-eslint/blob/main/src/rules/strict-mutable.ts */
export default {
  meta: {
    docs: {
      description: 'Prevent stateful mutations on public API properties',
      category: 'Possible Errors'
    },
    schema: [],
    type: 'problem'
  },
  create(context) {
    function getProps(node) {
      const varName = node.parent.key.name;
      props.set(varName, node);
    }

    function checkAssigment(node) {
      const propName = node.left.property.name;
      mutations.set(propName, node);
    }

    return {
      'PropertyDefinition > Decorator[expression.callee.name=property]': getProps,
      'AssignmentExpression[left.object.type=ThisExpression][left.property.type=Identifier]': checkAssigment,
      'ClassDeclaration:exit': () => {
        mutations.forEach((node, name) => {
          const noExceptions = !['hidden', 'value'].find(i => i === name); // native overrides like input value are by default stateful in browser
          if (noExceptions && props.has(name)) {
            context.report({
              node: node.parent,
              message: `Public API "${name}" should not be stateful or stateful behavior must be opt-in. https://NVIDIA.github.io/elements/docs/api-design/stateless/`
            });
          }
        });
        props.clear();
        mutations.clear();
      }
    };
  }
};
