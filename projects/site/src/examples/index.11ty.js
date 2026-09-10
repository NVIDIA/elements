// @ts-check
/* eslint-env node */
/* global process */

import { renderGlobalsScript } from '../_11ty/layouts/common.js';
import { siteData } from '../index.11tydata.js';
import { getSiteUrl } from '../_11ty/utils/site-url.js';
import { ELEMENTS_PAGES_BASE_URL } from '../_11ty/utils/env.js';
import markdown from '../_11ty/libraries/markdown.js';

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
  const { elementName } = example;

  if (patternName) return `/docs/patterns/${patternName}/`;
  if (!elementName) return '/examples/';
  if (elementName.includes('media')) return `/docs/media/${elementName.replace('media-', '')}/`;
  if (elementName.includes('code')) return `/docs/code/${elementName.replace('code-', '')}/`;
  if (elementName.includes('monaco')) return `/docs/monaco/${elementName.replace('monaco-', '')}/`;
  if (elementName === 'plot') return '/docs/plot/';
  if (elementName.includes('plot')) return `/docs/plot/${elementName.replace('plot-', '')}/`;
  if (elementName === 'scene') return '/docs/scene/';
  if (elementName.includes('scene')) return `/docs/scene/${elementName.replace('scene-', '')}/`;

  return `/docs/elements/${elementName}/`;
}

export function getCanonicalUrl(example) {
  return getSiteUrl(getCanonicalPath(example));
}

export function renderServeExampleScript(example) {
  if (process.env.ELEVENTY_RUN_MODE !== 'serve') return '';

  return /* html */ `
    <script type="module">
      import examples from '${example.entrypoint}' with { type: 'json' };
      const container = document.querySelector('#example-container');
      const example = examples.items.find(s => s.id === '${example.id}');
      container.setHTMLUnsafe(example.template);
    </script>
  `;
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
    ${renderServeExampleScript(data.example)}
  </head>
  <body data-pagefind-ignore="all">
    <div class="visually-hidden" aria-hidden="true">${ELEMENTS_PAGES_BASE_URL}/llms.txt is available and optimized for AI and LLM tools.</div>
    <div id="example-container" data-element="${data.example.id}">${data.example.template}</div>
    <div id="iframe-links" nve-layout="row gap:sm align:right" hidden>
      <a href="${getDocumentationPath(data.example)}" target="_blank" nve-text="link body sm">documentation &#8599;</a>
    </div>
  </body>
</html>
`,
    'html'
  );
}
