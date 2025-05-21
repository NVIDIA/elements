import { MetadataService } from '@internals/metadata';

const metadata = await MetadataService.getMetadata();

/** based on element tags found, inline the imports for the elements */
export async function elementLoaderTransform(content) {
  const IMPORTS = [...metadata['@nvidia-elements/core'].elements, ...metadata['@nvidia-elements/monaco'].elements]
    .filter(element => content?.includes(`<${element.name}`))
    .filter(element => !element.deprecated && element.manifest.metadata.entrypoint)
    .map(element => {
      const path = `${element.manifest.metadata.entrypoint}/define.js`;
      const lazy = content.includes('<!-- ELEMENT_LOADER_LAZY -->');
      return lazy ? `import('${path}');` : `import '${path}';`;
    })
    .join('\n');

  const ELEMENTS_CODE_IMPORTS = content.includes('nve-codeblock')
    ? `
    import '@nvidia-elements/code/codeblock/languages/html.js';
    import '@nvidia-elements/code/codeblock/languages/css.js';
    import '@nvidia-elements/code/codeblock/languages/json.js';
    import '@nvidia-elements/code/codeblock/languages/typescript.js';
    import '@nvidia-elements/code/codeblock/define.js';`
    : '';

  return content.replace(
    '<head>',
    `<head><script type="module">import '@lit-labs/ssr-client/lit-element-hydrate-support.js';\n${IMPORTS}\n${ELEMENTS_CODE_IMPORTS}</script>`.replace(
      /\n/g,
      ''
    )
  );
}
