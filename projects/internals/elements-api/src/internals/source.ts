// https://stackoverflow.com/questions/70657298/render-lit-lit-html-templateresult-as-string
export function getRenderString(data) {
  const { strings, values } = data;
  const value_list = [...values, ''];
  let output = '';
  for (let i = 0; i < strings.length; i++) {
    let v = value_list[i];
    if (v._$litType$ !== undefined) {
      v = getRenderString(v);
    } else if (v instanceof Array) {
      let new_v = '';
      for (const inner_v of [...v]) {
        new_v += getRenderString(inner_v);
      }
      v = new_v;
    }
    output += strings[i] + v;
  }
  return output;
}

const camelCase = str => str.replace(/\s*-\s*\w/g, parts => parts[parts.length - 1].toUpperCase());

const pascalCase = str => camelCase(str).replace(/^\w/, s => s.toUpperCase());

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

export function setSourcePackageScope(source: string, config: { scope: string; sourceType: string }) {
  const { scope, sourceType } = config;

  if (
    source.includes('@nve-labs') ||
    source.includes('nve-codeblock') ||
    globalThis.location.href.includes('internal') ||
    globalThis.location.href.includes('migration')
  ) {
    return source;
  }

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
    .replaceAll(/(@elements\/elements\/[\w-]*|@nve\/elements\/[\w-]*)/g, (_, value) => {
      const scopeImports = {
        mlv: '@elements',
        nve: '@nve'
      };

      value = value.replaceAll('@elements', scopeImports[scope]).replaceAll('@nve', scopeImports[scope]);
      return value;
    });
}
