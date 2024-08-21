import { gzipSync } from 'fflate';
import { html } from 'lit';
import format from 'html-format';
import packageFile from '@nvidia-elements/core/package.json';
import { ELEMENTS_VERSION } from './version.js';
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
  const CDN_MODULES_URL = `https://https://esm.sh`;
  const { globals } = context;
  const themes = [globals.theme, globals.scale, globals.debug, globals.animation, globals.experimental, globals.systemOptions].filter(i => i !== '').join(' ').trim();

  const mlvTemplate = {
    'index.html': {
      content: `<!doctype html>
<html nve-theme="${themes}">
<head>
  <link rel="stylesheet" href="@elements/elements/dist/index.css" />
  <link rel="stylesheet" href="@elements/elements/dist/inter.css" />
  <script type="module" src="./index.js"></script>${context.id.includes('foundations-layout') ? `\n<link rel="stylesheet" href="./index.css">` : ''}
</head>
<body nve-text="body" nve-layout="${content.split('\n')[0].includes('full') ? '' : 'pad:lg'}">

${content.replaceAll('nve-', 'nve-')}

</body>
</html>`
    },
    'index.ts': {
      content: `${getImports(globals.scope)}`
    },
    'importmap.json': {
      content: `{
  "imports": {
    "@elements/elements": "${CDN_MODULES_URL}/@elements/elements@0.41.0",
    "@elements/elements/": "${CDN_MODULES_URL}/@elements/elements@0.41.0/"
  }
}`
    }
  };

  const nveTemplate = {
    'index.html': {
      content: `<!doctype html>
<html nve-theme="${themes}">
<head>
  <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/fonts/inter.css" />
  <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/index.css" />
  <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/dark.css" />
  <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/high-contrast.css" />
  <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/reduced-motion.css" />
  <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/compact.css" />
  <link rel="stylesheet" type="text/css" href="@nvidia-elements/styles/dist/typography.css" />
  <link rel="stylesheet" type="text/css" href="@nvidia-elements/styles/dist/layout.css" />
  <script type="module" src="./index.js"></script>${context.id.includes('foundations-layout') ? `<link rel="stylesheet" href="./index.css">` : ''}
</head>
<body nve-text="body" nve-layout="${content.split('\n')[0].includes('full') ? '' : 'pad:lg'}">

${content}

</body>
</html>`
    },
    'index.ts': {
      content: `${getImports(globals.scope)}`
    },
    'importmap.json': {
      content: `{
  "imports": {
    "@nvidia-elements/core": "${CDN_MODULES_URL}/@nvidia-elements/core@${ELEMENTS_VERSION}",
    "@nvidia-elements/core/": "${CDN_MODULES_URL}/@nvidia-elements/core@${ELEMENTS_VERSION}/",
    "@nvidia-elements/styles/": "${CDN_MODULES_URL}/@nvidia-elements/styles@latest/",
    "@nvidia-elements/themes/": "${CDN_MODULES_URL}/@nvidia-elements/themes@latest/"
  }
}`
    }
  };

  return globals.scope === 'mlv' ? mlvTemplate : nveTemplate;
}

function getImports(scope) {
  return [...metrics['@nvidia-elements/core'].elements, { name: 'forms' }]
    .filter(e => packageFile.exports[`./${e.name.replace('nve-', '')}/define.js`])
    .filter(e => !e.name.includes('json-viewer'))
    .map(e => `import '${scope === 'mlv' ? '@elements' : '@nve'}/elements/${e.name.replace('nve-', '')}/define.js';`)
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