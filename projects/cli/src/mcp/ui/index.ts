// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import coreBundle from '@nvidia-elements/core/bundles/index.js?raw';
import codeBundle from '@nvidia-elements/code/bundles/index.js?raw';
import themesIndexCss from '@nvidia-elements/themes/index.css?raw';
import themesDarkCss from '@nvidia-elements/themes/dark.css?raw';
import themesHighContrastCss from '@nvidia-elements/themes/high-contrast.css?raw';
import stylesTypographyCss from '@nvidia-elements/styles/typography.css?raw';
import stylesLayoutCss from '@nvidia-elements/styles/layout.css?raw';
import clientScript from './client.js?raw';
import iconsListScript from './api-icons-list.js?raw';
import tokensListScript from './api-tokens-list.js?raw';
import examplesRenderScript from './examples-render.js?raw';

export interface UIResource {
  name: string;
  mimeType: string;
  resourceUri: string;
  description: string;
  getHtml: () => string;
}

interface UIBundles {
  code?: boolean;
}

export const MCP_UI_MIME_TYPE = 'text/html;profile=mcp-app';

export const examplesRenderResource: UIResource = {
  name: 'nve-mcp-examples-render',
  mimeType: MCP_UI_MIME_TYPE,
  resourceUri: 'ui://elements/example-preview',
  description: 'Renders Elements component examples in a sandboxed iframe.',
  getHtml: () =>
    buildUIResourceHtml({
      title: 'Elements Example Preview',
      script: examplesRenderScript
    })
};

export const iconsListResource: UIResource = {
  name: 'nve-mcp-api-icons-list',
  mimeType: MCP_UI_MIME_TYPE,
  resourceUri: 'ui://elements/icons-list',
  description: 'Renders available Elements icons with copyable source markup.',
  getHtml: () =>
    buildUIResourceHtml({
      title: 'Elements Icons List',
      script: iconsListScript
    })
};

export const tokensListResource: UIResource = {
  name: 'nve-mcp-api-tokens-list',
  mimeType: MCP_UI_MIME_TYPE,
  resourceUri: 'ui://elements/tokens-list',
  description: 'Renders Elements design tokens with visual previews and copyable CSS references.',
  getHtml: () =>
    buildUIResourceHtml({
      title: 'Elements Token Explorer',
      script: tokensListScript
    })
};

export const uiResources: UIResource[] = [examplesRenderResource, iconsListResource, tokensListResource];

const getBundles = ({ code = false }: UIBundles = {}): string => {
  const scripts = code ? [coreBundle, codeBundle] : [coreBundle];
  return scripts.map(script => /* html */ `<script type="module">${script}</script>`).join('\n');
};

export function buildUIResourceHtml({
  title,
  bundles,
  script
}: {
  title: string;
  script: string;
  bundles?: UIBundles;
}): string {
  return /* html */ `<!doctype html>
<html lang="en" nve-theme="">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
    ${[themesIndexCss, themesDarkCss, themesHighContrastCss, stylesTypographyCss, stylesLayoutCss].join('\n')}
    :root[nve-theme=""] { color-scheme: light dark; }
    body:not(:has(nve-page)) { padding: var(--nve-ref-space-sm); }
    </style>
  </head>
  <body>
    ${getBundles(bundles)}
    <script type="module">
      ${clientScript}
      ${script}
    </script>
  </body>
</html>`;
}
