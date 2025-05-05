import fs from 'node:fs';

/** base on element tags found, inline the imports for the elements and elements-api */
export async function elementLoaderTransform(content) {
  const ELEMENTS_PACKAGE = JSON.parse(fs.readFileSync('../elements/package.json', 'utf8'));
  const ELEMENTS_API_PACKAGE = JSON.parse(fs.readFileSync('../internals/elements-api/package.json', 'utf8'));
  const MONACO_PACKAGE = JSON.parse(fs.readFileSync('../monaco/package.json', 'utf8'));

  const ELEMENTS_IMPORTS = Array.from(
    new Set(
      Object.keys(ELEMENTS_PACKAGE.exports)
        .filter(key => key.endsWith('define.js'))
        .map(key => key.replace('./', 'nve-').replace('/define.js', ''))
        .filter(tagName => content?.includes(`<${tagName}`))
    )
  )
    .map(tagName => `import '@nvidia-elements/core/${tagName.replace('nve-', '')}/define.js';`)
    .join('\n');

  const ELEMENTS_API_IMPORTS = Array.from(
    new Set(
      Object.keys(ELEMENTS_API_PACKAGE.exports)
        .filter(key => key.endsWith('define.js'))
        .map(key => key.replace('./', 'nve-api-').replace('/define.js', ''))
        .filter(tagName => content?.includes(`<${tagName}`))
    )
  )
    .map(tagName => `import '@nve-internals/elements-api/${tagName.replace('nve-api-', '')}/define.js';`)
    .join('\n');

  const MONACO_IMPORTS = Array.from(
    new Set(
      Object.keys(MONACO_PACKAGE.exports)
        .filter(key => key.endsWith('define.js'))
        .map(key => key.replace('./', 'nve-monaco-').replace('/define.js', ''))
        .filter(tagName => content?.includes(`<${tagName}`))
    )
  )
    .map(tagName => `import '@nvidia-elements/monaco/${tagName.replace('nve-monaco-', '')}/define.js';`)
    .join('\n');

  const ELEMENTS_CODE_IMPORTS = content.includes('<nve-codeblock')
    ? `
    import '@nvidia-elements/code/codeblock/languages/html.js';
    import '@nvidia-elements/code/codeblock/languages/css.js';
    import '@nvidia-elements/code/codeblock/languages/json.js';
    import '@nvidia-elements/code/codeblock/languages/typescript.js';
    import '@nvidia-elements/code/codeblock/define.js';`
    : '';

  return content.replace(
    '</head>',
    `<script type="module">import '@lit-labs/ssr-client/lit-element-hydrate-support.js';\n${ELEMENTS_IMPORTS}\n${ELEMENTS_API_IMPORTS}\n${ELEMENTS_CODE_IMPORTS}\n${MONACO_IMPORTS}</script>` +
      '</head>'
  );
}
