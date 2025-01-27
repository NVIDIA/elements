import { gzipSync } from 'fflate';
import format from 'html-format';
import packageFile from '@nvidia-elements/core/package.json';
import { ESM_ELEMENTS_VERSION } from '../internals/version.js';
import { MetadataService } from '../internals/metadata.service.js';

const metrics = await MetadataService.getMetadata();

export function createPlaygroundURLFromStorySource(
  source,
  context: {
    id: string;
    globals: {
      theme: string;
      scale: string;
      debug: string;
      animation: string;
      experimental: string;
      systemOptions: string;
    };
  }
) {
  const formattedSource = format(
    source.replaceAll(' nve-theme="dark"', '').replaceAll(' nve-theme="light"', '').replaceAll(' nve-theme="root"', ''),
    ' '.repeat(2),
    120
  );
  const files = serialize(addCssContent(createDefaultFiles(formattedSource, context), context));
  return `https://elements-stage.nvidia.com/ui/elements-playground/?story=${context.id}&files=${files}&version=1`;
}

function serialize(data, compress = true) {
  const json = JSON.stringify(data);
  const encoded = new TextEncoder().encode(json);
  const array = compress ? gzipSync(encoded) : encoded;
  const base64 = globalThis.btoa(String.fromCharCode(...array));
  return encodeURIComponent(base64);
}

function createDefaultFiles(content, context) {
  const CDN_MODULES_URL = `https://esm.nvidia.com`;
  const { globals } = context;
  const themes = [
    globals.theme,
    globals.scale,
    globals.debug,
    globals.animation,
    globals.experimental,
    globals.systemOptions
  ]
    .filter(i => i !== '')
    .join(' ')
    .trim();

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
<body nve-text="body" nve-layout="${content.split('\n')[0].includes('full') || content.includes('nve-page') ? '' : 'pad:lg'}">

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
    "@nvidia-elements/core": "${CDN_MODULES_URL}/@nvidia-elements/core@${ESM_ELEMENTS_VERSION}",
    "@nvidia-elements/core/": "${CDN_MODULES_URL}/@nvidia-elements/core@${ESM_ELEMENTS_VERSION}/",
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
      content: `section {
  height: 95vh;
  width: 95vw;

  nve-card {
    min-width: 60px;
    min-height: 60px;
  }
}`
    };
    return defaultFiles;
  } else {
    return defaultFiles;
  }
}
