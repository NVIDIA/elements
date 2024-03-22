import { gzipSync } from 'fflate';
import { html } from 'lit';
import format from 'html-format';
import packageFile from '../package.json';
import { ELEMENTS_VERSION } from './version.js';
import metrics from 'build/metadata.json';

// const prettier = await import('prettier/esm/standalone.mjs');
const parserHTML = await import('prettier/esm/parser-html.mjs');

export function playground(Story, context) {
  const story = Story();
  // if story is using lit dynamic templating and or args skip generating playground url
  const usesDynamicArgs = Object.keys(context.unmappedArgs).length && story.values?.length;
  if (usesDynamicArgs || context.viewMode === 'story' || context.id === 'internal-integration--empty' || context.id.includes('metrics') || context.id.includes('foundations-tokens') || context.id.includes('foundations-i18n') || context.id.includes('elements-data-grid-examples--performance')) {
    return story;
  } else {
    const source = getRenderString(story);
    
    // prettier 3.0 is async and Storybook decorators cannot be async, temporary workaround using html-format package https://github.com/storybookjs/storybook/issues/10467
    // const formattedSource = prettier.default.format(source.replaceAll(' mlv-theme="dark"', '').replaceAll(' mlv-theme="light"', '').replaceAll(' mlv-theme="root"', ''), { parser: 'html', plugins: [parserHTML.default], singleAttributePerLine: false, printWidth: 120 });
    const formattedSource = format(source.replaceAll(' mlv-theme="dark"', '').replaceAll(' mlv-theme="light"', '').replaceAll(' mlv-theme="root"', ''), ' '.repeat(2), 120);

    const files = serialize(addCssContent(createDefaultFiles(formattedSource, context.id), context.id));
    const url = `https://elements-stage.nvidia.com/ui/elements-playground/?theme=${context.globals.theme}&story=${context.id}&files=${files}&version=1`;
    return html`${story} <nve-button class="playground-btn" size="sm"><a href="${url}" target="_blank">Playground</a></nve-button>`;
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
  const CDN_MODULES_URL = `https://https://esm.sh`;

  return {
    'index.html': {
      content: `<!doctype html>
<html mlv-theme="dark">
<head>
  <link rel="stylesheet" href="@elements/elements/dist/index.css" />
  <link rel="stylesheet" href="@elements/elements/dist/inter.css" />
  <script type="module" src="./index.js"></script>
  ${storyId.includes('foundations-layout') ? `<link rel="stylesheet" href="./index.css">` : ''}
</head>
<body mlv-layout="${content.split('\n')[0].includes('full') ? '' : 'pad:lg'}">

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
    .filter(e => packageFile.exports[`./${e.name.replace('mlv-', '')}/define.js`])
    .map(e => `import '@elements/elements/${e.name.replace('mlv-', '')}/define.js';`)
    .join('\n');
}

function addCssContent(defaultFiles, storyId) {
  if (storyId.includes('foundations-layout')) {
    defaultFiles['index.css'] = {
      content:
`section.layout-example {
  background-color: var(--mlv-sys-interaction-background);
  border: var(--mlv-ref-border-width-lg) solid var(--mlv-ref-border-color-emphasis);
  margin-block: var(--mlv-ref-space-sm) var(--mlv-ref-space-xl) !important;
  min-height: 200px !important;
}

section.layout-example[mlv-layout~='column'] {
  height: 400px;
}

section.layout-example > mlv-card {
  min-width: 60px !important;
  min-height: 60px !important;
  --background: var(--mlv-sys-layer-overlay-color);
}`
    }
    return defaultFiles;
  }
  else {
    return defaultFiles;
  }
}