import { gzipSync } from 'fflate';
import { html } from 'lit';
import format from 'html-format';
import packageFile from '@nvidia-elements/core/package.json';
import { ELEMENTS_VERSION } from './version.js';
import { SCOPE } from '@nvidia-elements/core';
import metrics from '../../internals/metadata/metadata.json';

export function playground(Story, context) {
  const story = Story();
  // if story is using lit dynamic templating and or args skip generating playground url
  const usesDynamicArgs = Object.keys(context.unmappedArgs).length && story.values?.length;
  if (usesDynamicArgs || context.viewMode === 'story' || context.id === 'internal-integration--empty' || context.id.includes('metrics') || context.id.includes('foundations-tokens') || context.id.includes('foundations-i18n') || context.id.includes('foundations-typography') ||context.id.includes('elements-data-grid-examples--performance')) {
    return story;
  } else {
    let source = story;

    try {
      source = getRenderString(story);
      // prettier 3.0 is async and Storybook decorators cannot be async, temporary workaround using html-format package https://github.com/storybookjs/storybook/issues/10467
      // const formattedSource = prettier.default.format(source.replaceAll(' nve-theme="dark"', '').replaceAll(' nve-theme="light"', '').replaceAll(' nve-theme="root"', ''), { parser: 'html', plugins: [parserHTML.default], singleAttributePerLine: false, printWidth: 120 });
      const formattedSource = format(source.replaceAll(' nve-theme="dark"', '').replaceAll(' nve-theme="light"', '').replaceAll(' nve-theme="root"', ''), ' '.repeat(2), 120);
      const files = serialize(addCssContent(createDefaultFiles(formattedSource, context), context));
      const url = `https://elements-stage.nvidia.com/ui/elements-playground/?story=${context.id}&files=${files}&version=1`;
      return html`${story} <nve-button class="playground-btn" size="sm"><a href="${url}" target="_blank">Playground</a></nve-button>`;
    } catch {
      return source;
    }
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

function createDefaultFiles(content, context) {
  const CDN_MODULES_URL = `https://esm.nvidia.com`;
  const { globals } = context;
  const themes = [globals.theme, globals.scale, globals.debug, globals.animation, globals.experimental, globals.systemOptions].filter(i => i !== '').join(' ').trim();

  return {
    'index.html': {
      content: `<!doctype html>
<html nve-theme="${themes}">
<head>
  <link rel="stylesheet" href="${SCOPE}/elements/dist/index.css" />
  <link rel="stylesheet" href="${SCOPE}/elements/dist/inter.css" />
  <script type="module" src="./index.js"></script>
  ${context.id.includes('foundations-layout') ? `<link rel="stylesheet" href="./index.css">` : ''}
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
    "${SCOPE}/elements": "${CDN_MODULES_URL}/${SCOPE}/elements@${ELEMENTS_VERSION}",
    "${SCOPE}/elements/": "${CDN_MODULES_URL}/${SCOPE}/elements@${ELEMENTS_VERSION}/"
  }
}
`
    }
  };
}

function getImports() {
  return metrics['@nvidia-elements/core'].elements
    .filter(e => packageFile.exports[`./${e.name.replace('nve-', '')}/define.js`])
    .map(e => `import '${SCOPE}/elements/${e.name.replace('nve-', '')}/define.js';`)
    .join('\n');
}

function addCssContent(defaultFiles, context) {
  if (context.id.includes('foundations-layout')) {
    defaultFiles['index.css'] = {
      content:
`section.layout-example {
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
  --background: var(--nve-sys-layer-overlay-background);
}`
    }
    return defaultFiles;
  }
  else {
    return defaultFiles;
  }
}