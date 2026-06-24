// @ts-check
/* eslint-env node */
/* global process */

import { PlaygroundService } from '@internals/tools/playground';
import { renderGlobalsScript } from '../_11ty/layouts/common.js';
import { siteData } from '../index.11tydata.js';
import { getSiteUrl } from '../_11ty/utils/site-url.js';

const { BASE_URL, examples } = siteData;

function escapeAttr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getPatternName(example) {
  return example.entrypoint?.match(/^@internals\/patterns\/([^/]+)\.examples\.json$/)?.[1] ?? null;
}

export function getCanonicalPath(example) {
  const patternName = getPatternName(example);

  if (patternName) return `/docs/patterns/${patternName}/`;
  if (example.elementName) return `/docs/elements/${example.elementName}/examples/`;

  return '/examples/';
}

export function getDocumentationPath(example) {
  const patternName = getPatternName(example);

  if (patternName) return `/docs/patterns/${patternName}/`;
  if (example.elementName) return `/docs/elements/${example.elementName}/`;

  return '/examples/';
}

export function getCanonicalUrl(example) {
  return getSiteUrl(getCanonicalPath(example));
}

export const data = {
  title: 'Examples',
  pagination: {
    data: 'examples',
    size: 1,
    alias: 'example'
  },
  examples,
  permalink: data => `examples/${data.example.permalink}`
};

export async function render(data) {
  return this.renderTemplate(
    /* html */ `
<!DOCTYPE HTML>
<html lang="en" nve-theme="dark">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex,follow">
    <meta name="description" content="${escapeAttr(data.example.summary || data.example.description || `${data.example.name} example for NVIDIA Elements.`)}">
    <link rel="canonical" href="${getCanonicalUrl(data.example)}">
    <base href="${BASE_URL}" />
    <title data-pagefind-meta="title">${escapeAttr(data.example.name)} example | NVIDIA Elements</title>
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
      ${process.env.ELEVENTY_RUN_MODE === 'serve' ? 'container.setHTMLUnsafe(example.template);' : ''}
    </script>
  </head>
  <body data-pagefind-ignore="all">
    <div id="iframe-links" nve-layout="row gap:sm align:right" hidden>
      <a href="${await PlaygroundService.create({ template: data.example.template, name: data.example.id })}" target="_blank" nve-text="link body sm">playground &#8599;</a>
      <a href="${getDocumentationPath(data.example)}" target="_blank" nve-text="link body sm">documentation &#8599;</a>
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
