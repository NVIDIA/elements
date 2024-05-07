
const camelCase = str => str.replace(/\s*-\s*\w/g, parts => parts[parts.length-1].toUpperCase());

const pascalCase = str => camelCase(str).replace(/^\w/, s => s.toUpperCase());

export function updateScope(source, config) {
  const { scope, sourceType } = config;

  return source
    .replaceAll(/(mlv-[\w-]*|nve-[\w-]*)/g, (_, value) => {
      const isElement = !value.includes('mlv-layout') && !value.includes('mlv-text');
      const isReact = sourceType === 'react';
      value = isElement ? value.replaceAll('mlv', scope).replaceAll('nve', scope) : value;
      value = isReact && isElement ? pascalCase(value) : value;
      return value;
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
