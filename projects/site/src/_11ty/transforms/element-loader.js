// @ts-check

import { ApiService } from '@internals/metadata';
import { getElementImports } from '@internals/tools';
import { parse } from 'parse5';
import { ICON_NAMES, ICON_NAMES_SOLID } from '@nvidia-elements/core/icon';

const apis = await ApiService.getData();

const iconNames = new Set([...ICON_NAMES, ...ICON_NAMES_SOLID.map(name => `${name}-solid`)]);

/**
 * Register statically named icons before defining their host elements.
 * @param {string} content
 */
export function getIconImports(content) {
  const names = new Set();
  /** @param {import('parse5').DefaultTreeAdapterMap['node']} node */
  function visit(node) {
    if ('tagName' in node && (node.tagName === 'nve-icon' || node.tagName === 'nve-icon-button')) {
      const attribute = node.tagName === 'nve-icon' ? 'name' : 'icon-name';
      const name = node.attrs.find(attr => attr.name === attribute)?.value;
      if (name && iconNames.has(name)) {
        names.add(name);
        if (
          node.attrs.some(attr => attr.name === 'appearance' && attr.value === 'solid') &&
          iconNames.has(`${name}-solid`)
        ) {
          names.add(`${name}-solid`);
        }
      }
    }
    if ('childNodes' in node) node.childNodes.forEach(visit);
  }
  visit(parse(content));
  return [...names].map(name => `import '@nvidia-elements/core/icon/icons/${name}.js';`);
}

/**
 * Based on element tags found, inline the imports for the elements.
 * @param {string} content
 */
export async function elementLoaderTransform(content) {
  const lazy = content.includes('<!-- ELEMENT_LOADER_LAZY -->');
  const imports = [...getIconImports(content), ...getElementImports(content, apis.data.elements, lazy)].join('');
  return content.replace(
    '<head>',
    `<head><script type="module">import '@lit-labs/ssr-client/lit-element-hydrate-support.js';\n${imports}</script>`.replace(
      /\n/g,
      ''
    )
  );
}
