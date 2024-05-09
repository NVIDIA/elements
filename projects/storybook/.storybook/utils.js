
const camelCase = str => str.replace(/\s*-\s*\w/g, parts => parts[parts.length-1].toUpperCase());

const pascalCase = str => camelCase(str).replace(/^\w/, s => s.toUpperCase());

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function updateScope(source, config) {
  const { scope, sourceType } = config;

  return source
    .replaceAll(/(nve-[\w-]*|nve-[\w-]*)/g, (_, value) => {
      const isElement = !value.includes('nve-layout') && !value.includes('nve-text');
      const isReact = sourceType === 'react';
      value = isElement ? value.replaceAll('mlv', scope).replaceAll('nve', scope) : value;
      value = isReact && isElement ? pascalCase(value) : value;
      return value;
    })
    .replaceAll(/(Mlv[\w-]*|Nve[\w-]*)/g, (_, value) => {
      return value.replaceAll('Mlv', capitalize(scope)).replaceAll('Nve', capitalize(scope));
    })
    .replaceAll(/(@elements\/[\w-]*|@nve\/[\w-]*)/g, (_, value) => {
      const scopeImports = {
        'mlv': '@elements',
        'nve': '@nve'
      };

      value = value.replaceAll('@elements', scopeImports[scope]).replaceAll('@nve', scopeImports[scope]);
      return value;
    });
}
