import { gzipSync } from 'fflate';
import format from 'html-format';
import { getElementImports } from '../utils/index.js';
import type { MetadataSummary } from '../types.js';

interface PlaygroundOptions {
  id: string;
  theme: string;
  referer?: string;
}

export function createPlaygroundURL(source: string, options: PlaygroundOptions, metadata: MetadataSummary) {
  const formattedSource = format(
    source.replaceAll(' nve-theme="dark"', '').replaceAll(' nve-theme="light"', '').replaceAll(' nve-theme="root"', ''),
    ' '.repeat(2),
    120
  );
  const files = serialize(createDefaultFiles(formattedSource, metadata, options));
  return `https://elements-stage.nvidia.com/ui/elements-playground/?story=${options.id}${options.referer ? `&ref=${options.referer}` : ''}&files=${files}&version=1`;
}

function serialize(data, compress = true) {
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const array = compress ? gzipSync(encoded) : encoded;
  const base64 = globalThis.btoa(String.fromCharCode(...array));
  return encodeURIComponent(base64);
}

function createDefaultFiles(content, metadata: MetadataSummary, options: PlaygroundOptions) {
  const CDN_MODULES_URL = `https://https://esm.sh`;

  const template = {
    'index.html': {
      content: `<!doctype html>
<html nve-theme="${options.theme ?? ''}">
<head>
  <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/fonts/inter.css" />
  <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/index.css" />
  <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/dark.css" />
  <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/high-contrast.css" />
  <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/reduced-motion.css" />
  <link rel="stylesheet" type="text/css" href="@nvidia-elements/themes/dist/compact.css" />
  <link rel="stylesheet" type="text/css" href="@nvidia-elements/styles/dist/typography.css" />
  <link rel="stylesheet" type="text/css" href="@nvidia-elements/styles/dist/layout.css" />
  <script type="module" src="./index.js"></script>
</head>
<body nve-text="body" nve-layout="${!content.includes('<nve-page') ? 'pad:md' : ''}">
  ${content.trim()}
</body>
</html>`
    },
    'index.ts': {
      content: `${getElementImports(content, metadata).join('\n')}`
    },
    'importmap.json': {
      content: `{
  "imports": {
    "@nvidia-elements/core": "${CDN_MODULES_URL}/@nvidia-elements/core@latest",
    "@nvidia-elements/core/": "${CDN_MODULES_URL}/@nvidia-elements/core@latest/",
    "@nvidia-elements/styles": "${CDN_MODULES_URL}/@nvidia-elements/styles@latest",
    "@nvidia-elements/styles/": "${CDN_MODULES_URL}/@nvidia-elements/styles@latest/",
    "@nvidia-elements/themes": "${CDN_MODULES_URL}/@nvidia-elements/themes@latest",
    "@nvidia-elements/themes/": "${CDN_MODULES_URL}/@nvidia-elements/themes@latest/",
    "@nvidia-elements/monaco": "${CDN_MODULES_URL}/@nvidia-elements/monaco@latest",
    "@nvidia-elements/monaco/": "${CDN_MODULES_URL}/@nvidia-elements/monaco@latest/",
    "@nvidia-elements/code": "${CDN_MODULES_URL}/@nvidia-elements/code@latest",
    "@nvidia-elements/code/": "${CDN_MODULES_URL}/@nvidia-elements/code@latest/",
    "@nvidia-elements/forms": "${CDN_MODULES_URL}/@nvidia-elements/forms@latest",
    "@nvidia-elements/forms/": "${CDN_MODULES_URL}/@nvidia-elements/forms@latest/"
  }
}`
    }
  };

  return template;
}
