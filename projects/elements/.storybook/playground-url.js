import { gzipSync } from 'fflate';
import { html } from 'lit';
import packageFile from '../package.json';
import metrics from 'build/metadata.json';

const prettier = await import('prettier/esm/standalone.mjs');
const parserHTML = await import('prettier/esm/parser-html.mjs');

export function playground(Story, context) {
  const story = Story();
  // if story is using lit dynamic templating and or args skip generating playground url
  const usesDynamicArgs = Object.keys(context.unmappedArgs).length && story.values?.length;
  if (usesDynamicArgs || context.viewMode === 'story' || context.id === 'internal-integration--empty' || context.id.includes('metrics') || context.id.includes('foundations-tokens') || context.id.includes('foundations-i18n') || context.id.includes('elements-data-grid-examples--performance')) {
    return story;
  } else {
    const source = getRenderString(story);
    const formattedSource = prettier.default.format(source.replaceAll(' nve-theme="dark"', '').replaceAll(' nve-theme="light"', '').replaceAll(' nve-theme="root"', ''), { parser: 'html', plugins: [parserHTML.default], singleAttributePerLine: false, printWidth: 120 });
    const files = serialize(addCssContent(createDefaultFiles(formattedSource, context.id), context.id));
    const url = `https://elements-stage.nvidia.com/ui/elements-playground/?theme=${context.globals.theme}&story=${context.id}&files=${files}&version=1`;
    return html`${story} <nve-button class="playground-btn"><a href="${url}" target="_blank">Playground</a></nve-button>`;
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
  const CDN_MODULES_URL = `https://esm.nvidia.com`;

  return {
    'index.html': {
      content: `<!doctype html>
<html nve-theme="dark">
<head>
  <link rel="stylesheet" href="@elements/elements/dist/index.css" />
  <link rel="stylesheet" href="@elements/elements/dist/inter.css" />
  <script type="module" src="./index.js"></script>
  ${storyId.includes('foundations-layout') ? `<link rel="stylesheet" href="./index.css">` : ''}
</head>
<body nve-layout="${content.split('\n')[0].includes('full') ? '' : 'pad:lg'}">

${content}

</body>
</html>`
    },
    'index.ts': {
      content: `${getImports(content)}`
    },
    'importmap.json': {
      content: `{
  "imports": {
    "@elements/elements": "${CDN_MODULES_URL}/@elements/elements@${ELEMENTS_VERSION}",
    "@elements/elements/": "${CDN_MODULES_URL}/@elements/elements@${ELEMENTS_VERSION}/"
  }
}
`
    }
  };
}

function getImports() {
  return metrics.elements
    .filter(e => packageFile.exports[`./${e.name.replace('nve-', '')}/define.js`])
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