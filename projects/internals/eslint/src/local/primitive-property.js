const properties = new Map();

export default {
  meta: {
    docs: {
      description: 'Prevent complex types used on public API properties',
      category: 'Possible Errors'
    },
    schema: [],
    type: 'problem'
  },
  create(context) {
    function getProps(node) {
      properties.set(node.parent.key.name, node);
    }

    return {
      'PropertyDefinition > Decorator[expression.callee.name=property]': getProps,
      'ClassDeclaration:exit': () => {
        properties.forEach(node => {
          const props = node.expression.arguments.flatMap(args => args.properties);
          const propName = node.parent.key.name;
          const noExceptions = !['i18n', 'stepSizes'].find(i => i === propName);

          props.forEach(prop => {
            const propType = prop.value.name;

            if (noExceptions && prop.key.name === 'type' && (propType === 'Array' || propType === 'Object')) {
              context.report({
                node: node.parent,
                message: `Public API "${propName}" with type ${propType} must be a primitive type https://NVIDIA.github.io/elements/docs/api-design/properties-attributes/`
              });
            }
          });
        });
        properties.clear();
      }
    };
  }
};
