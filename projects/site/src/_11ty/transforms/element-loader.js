import { MetadataService, getElementImports } from '@internals/metadata';

const metadata = await MetadataService.getMetadata();

/** based on element tags found, inline the imports for the elements */
export async function elementLoaderTransform(content) {
  const lazy = content.includes('<!-- ELEMENT_LOADER_LAZY -->');
  const imports = getElementImports(content, metadata, lazy).join('');
  return content.replace(
    '<head>',
    `<head><script type="module">import '@lit-labs/ssr-client/lit-element-hydrate-support.js';\n${imports}</script>`.replace(
      /\n/g,
      ''
    )
  );
}
