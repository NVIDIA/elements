import { gzipSync } from 'fflate';
import { html, nothing } from 'lit';
import packageFile from '../package.json';
import metrics from 'build/metadata.json';
import importmap from '@elements/elements/importmap.cdn.json';

const prettier = await import('prettier/esm/standalone.mjs');
const parserHTML = await import('prettier/esm/parser-html.mjs');

export function playground(Story, context) {
  if (context.viewMode === 'story' || Object.keys(context.unmappedArgs).length || context.id === 'internal-integration--empty' || context.id.includes('metrics') || context.id.includes('foundations-tokens') || context.id.includes('foundations-i18n') || context.id.includes('elements-data-grid-examples--performance')) {
    return Story();
  } else {
    const hasRoot = i => i.match(/nve-theme="root"/g)?.length > 1;
    const src = getRenderString(Story());
    const lines = src.trim().split('\n').filter(i => !hasRoot(i));
    const source = (hasRoot(src) ? lines.slice(0, -1).join('\n') : lines.join('\n')).replaceAll('nve-theme="root ', 'nve-theme="');
    const formattedSource = prettier.default.format(source.replaceAll(' nve-theme="dark"', '').replaceAll(' nve-theme="light"', '').replaceAll(' nve-theme="root"', ''), { parser: 'html', plugins: [parserHTML.default], singleAttributePerLine: false, printWidth: 120 });

    const files = serialize(addCssContent(createDefaultFiles(formattedSource, context.id), context.id));
    const url = `https://elements-stage.nvidia.com/ui/elements-playground/?theme=${context.globals.theme}&story=${context.id}&files=${files}`;
    const playgroundButton = Object.keys(context.unmappedArgs).length ? nothing : html`<nve-button class="playground-btn"><a href="${url}" target="_blank">Playground</a></nve-button>`;
    return html`${Story()} ${playgroundButton}`;
  }
}

// https://stackoverflow.com/questions/70657298/render-lit-lit-html-templateresult-as-string
function getRenderString(data) {
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

function serialize(data, compress = true) {
  const json = JSON.stringify(data);
  const encoded = new TextEncoder().encode(json);
  const array = compress ? gzipSync(encoded) : encoded;
  const base64 = window.btoa(String.fromCharCode(...array));
  return encodeURIComponent(base64);
}

function createDefaultFiles(content, storyId) {
  const ELEMENTS_VERSION = packageFile.version;
  const CDN_MODULES_URL = `https://https://esm.sh`;
  getImports(content);
  return {
    'index.html': {
      content: prettier.default.format(`<!doctype html>
<html nve-theme="dark">
<head>
  <link rel="stylesheet" href="${CDN_MODULES_URL}/@elements/elements@${ELEMENTS_VERSION}/dist/index.css" />
  <link rel="stylesheet" href="${CDN_MODULES_URL}/@elements/elements@${ELEMENTS_VERSION}/dist/inter.css" />
  <script type="importmap">
    ${JSON.stringify(importmap)}
  </script>
  <script type="module">
    ${getImports(content)}
  </script>
  ${storyId.includes('foundations-layout') ? `<link rel="stylesheet" href="./index.css">` : ''}
</head>
<body nve-layout="column gap:lg pad:lg full">
  ${content}
</body>
</html>`, { parser: 'html', plugins: [parserHTML.default], singleAttributePerLine: false, printWidth: 120, singleQuote: true })
    }
  };
}


function getImports(content) {
  return metrics.elements
    .filter(e => content.includes(e.name) && packageFile.exports[`./${e.name.replace('nve-', '')}/define.js`])
    .map(e => `import '@elements/elements/${e.name.replace('nve-', '')}/define.js';`)
    .join('\n');
}

function addCssContent(defaultFiles, storyId) {
  if (storyId.includes('foundations-layout')) {
    defaultFiles['index.css'] = {
      content:
`section.layout-example {
  background-color: var(--nve-sys-interaction-background);
  border: var(--nve-ref-border-width-lg) solid var(--nve-ref-border-color-emphasis);
  margin-block: var(--nve-ref-space-sm) var(--nve-ref-space-xl) !important;
  min-height: 200px !important;
}

section.layout-example[nve-layout~='column'] {
  height: 400px;
}

section.layout-example > nve-card {
  min-width: 60px !important;
  min-height: 60px !important;
  --background: var(--nve-sys-layer-overlay-color);
}`
    }
    return defaultFiles;
  }
  else {
    return defaultFiles;
  }
}