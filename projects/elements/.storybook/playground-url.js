import { gzipSync } from 'fflate';
import { html, nothing } from 'lit';

const prettier = await import('prettier/esm/standalone.mjs');
const parserHTML = await import('prettier/esm/parser-html.mjs');

export function playground(Story, context) {
  if (Object.keys(context.unmappedArgs).length || context.id === 'internal-integration--empty' || context.id.includes('foundations-tokens') || context.id.includes('foundations-i18n') || context.id.includes('elements-data-grid-examples--performance')) {
    return Story();
  } else {
    const hasRoot = i => i.match(/nve-theme="root"/g)?.length > 1;
    const src = getRenderString(Story());
    const lines = src.trim().split('\n').filter(i => !hasRoot(i));
    const source = (hasRoot(src) ? lines.slice(0, -1).join('\n') : lines.join('\n')).replaceAll('nve-theme="root ', 'nve-theme="');
    const formattedSource = prettier.default.format(source.replaceAll(' nve-theme="dark"', '').replaceAll(' nve-theme="light"', '').replaceAll(' nve-theme="root"', ''), { parser: 'html', plugins: [parserHTML.default], singleAttributePerLine: false, printWidth: 120 });

    const files = serialize(addCssContent(createDefaultFiles(formattedSource), context.id));
    const url = `https://elements-stage.nvidia.com/ui/elements-playground/?files=${files}&theme=${context.globals.theme}`;
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

function createDefaultFiles(content) {
  const ELEMENTS_VERSION = `0.11.2`;
  const CDN_ORIGIN = `https://cdn-stage.nvidia.com`;
  const CDN_MODULES_URL = `${CDN_ORIGIN}/assets/elements-playground/modules`;

  return {
    'index.html': {
      content: `<!doctype html>
<html nve-theme="dark">
<head>
  <link rel="stylesheet" type="text/css" href="${CDN_MODULES_URL}/@elements/elements@${ELEMENTS_VERSION}/dist/index.css" />
  <link rel="stylesheet" type="text/css" href="${CDN_MODULES_URL}/@elements/elements@${ELEMENTS_VERSION}/dist/inter.css" />
  <script type="importmap">
  {
    "imports": {
      "@elements/elements": "${CDN_MODULES_URL}/@elements/elements@${ELEMENTS_VERSION}/dist/"
      "@elements/elements/": "${CDN_MODULES_URL}/@elements/elements@${ELEMENTS_VERSION}/dist/"
    },
    "scopes": {
      "${CDN_ORIGIN}/": {
        "composed-offset-position": "${CDN_MODULES_URL}/composed-offset-position@0.0.4/dist/composed-offset-position.esm.js",
        "lit": "${CDN_MODULES_URL}/lit@2.7.4/index.js",
        "lit/": "${CDN_MODULES_URL}/lit@2.7.4/",
        "lit-element/lit-element.js": "${CDN_MODULES_URL}/lit-element@3.3.0/development/lit-element.js",
        "lit-html": "${CDN_MODULES_URL}/lit-html@2.7.4/development/lit-html.js",
        "lit-html/": "${CDN_MODULES_URL}/lit-html@2.7.4/development/",
        "@floating-ui/core": "${CDN_MODULES_URL}/@floating-ui/core@1.2.6/dist/floating-ui.core.esm.js",
        "@floating-ui/dom": "${CDN_MODULES_URL}/@floating-ui/dom@1.2.6/dist/floating-ui.dom.esm.js",
        "@lit/reactive-element": "${CDN_MODULES_URL}/@lit/reactive-element@1.6.1/development/reactive-element.js",
        "@lit/reactive-element/decorators/property.js": "${CDN_MODULES_URL}/@lit/reactive-element@1.6.1/development/decorators/property.js",
        "@lit/reactive-element/decorators/query.js": "${CDN_MODULES_URL}/@lit/reactive-element@1.6.1/development/decorators/query.js",
        "@lit/reactive-element/decorators/state.js": "${CDN_MODULES_URL}/@lit/reactive-element@1.6.1/development/decorators/state.js",
        "@lit-labs/motion": "${CDN_MODULES_URL}/@lit-labs/motion@1.0.3/index.js"
      }
    }
  }
  </script>
  <script type="module" src="./index.js"></script>
  <link rel="stylesheet" href="./index.css">
</head>
<body>

${content}
</body>
</html>`
    },
    'index.ts': {
      content: `import '@elements/elements/alert/define.js';
import '@elements/elements/app-header/define.js';
import '@elements/elements/badge/define.js';
import '@elements/elements/breadcrumb/define.js';
import '@elements/elements/bulk-actions/define.js';
import '@elements/elements/button/define.js';
import '@elements/elements/card/define.js';
import '@elements/elements/checkbox/define.js';
import '@elements/elements/color/define.js';
import '@elements/elements/date/define.js';
import '@elements/elements/datetime/define.js';
import '@elements/elements/dialog/define.js';
import '@elements/elements/divider/define.js';
import '@elements/elements/dot/define.js';
import '@elements/elements/dropdown/define.js';
import '@elements/elements/file/define.js';
import '@elements/elements/forms/define.js';
import '@elements/elements/grid/define.js';
import '@elements/elements/icon/define.js';
import '@elements/elements/icon-button/define.js';
import '@elements/elements/input/define.js';
import '@elements/elements/logo/define.js';
import '@elements/elements/menu/define.js';
import '@elements/elements/month/define.js';
import '@elements/elements/notification/define.js';
import '@elements/elements/pagination/define.js';
import '@elements/elements/panel/define.js';
import '@elements/elements/password/define.js';
import '@elements/elements/radio/define.js';
import '@elements/elements/range/define.js';
import '@elements/elements/search/define.js';
import '@elements/elements/select/define.js';
import '@elements/elements/sort-button/define.js';
import '@elements/elements/switch/define.js';
import '@elements/elements/tabs/define.js';
import '@elements/elements/tag/define.js';
import '@elements/elements/toast/define.js';
import '@elements/elements/time/define.js';
import '@elements/elements/textarea/define.js';
import '@elements/elements/tooltip/define.js';
import '@elements/elements/week/define.js';`
    }
  };
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