// @ts-check

import { ApiService } from '@internals/metadata';
import { getElementImports } from '@internals/tools';

const apis = await ApiService.getData();

/**
 * Based on element tags found, inline the imports for the elements.
 * @param {string} content
 */
export async function elementLoaderTransform(content) {
  const lazy = content.includes('<!-- ELEMENT_LOADER_LAZY -->');
  const imports = getElementImports(content, apis.data.elements, lazy).join('');
  return content.replace(
    '<head>',
    `<head><script type="module">import '@lit-labs/ssr-client/lit-element-hydrate-support.js';\n${imports}</script>`.replace(
      /\n/g,
      ''
    )
  );
}
