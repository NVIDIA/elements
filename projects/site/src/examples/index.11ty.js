// @ts-check
/* eslint-env node */
/* global process */

import { PlaygroundService } from '@nve-internals/tools/playground';
import { renderGlobalsScript } from '../_11ty/layouts/common.js';
import { siteData } from '../index.11tydata.js';

const { BASE_URL, stories } = siteData;

export const data = {
  title: 'Examples',
  pagination: {
    data: 'examples',
    size: 1,
    alias: 'example'
  },
  examples: stories,
  permalink: data => `examples/${data.example.permalink}/index.html`
};

export function render(data) {
  return this.renderTemplate(
    /* html */ `
<!DOCTYPE HTML>
<html lang="en" nve-theme="dark">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <base href="${BASE_URL}" />
    <title data-pagefind-meta="title">Story - ${data.example.permalink}</title>
    <style>
      @import '/examples/index.css';
    </style>
    <!-- ELEMENT_LOADER_LAZY -->
    ${renderGlobalsScript(data)}
    <script type="module">
      import '/examples/index.ts';
    </script>
    <script type="module">
      import examples from '${data.example.entrypoint}' with { type: 'json' };
      const container = document.querySelector('#example-container');
      const example = examples.items.find(s => s.id === '${data.example.id}');
      ${process.env.ELEVENTY_RUN_MODE === 'serve' ? 'container.innerHTML = example.template;' : ''}
    </script>
  </head>
  <body data-pagefind-ignore="all">
    <div id="iframe-links" nve-layout="row gap:sm align:right" hidden>
      <a href="${PlaygroundService.create({ template: data.example.template, name: `${data.example.entrypoint}_${data.example.title}` })}" target="_blank" nve-text="link body sm">playground &#8599;</a>
      <a href="docs/elements/${data.example.elementName}/" target="_blank" nve-text="link body sm">documentation &#8599;</a>
    </div>
    <div id="example-container" data-element="${data.example.id}">
      ${data.example.template}
    </div>
  </body>
</html>
`,
    'html'
  );
}
