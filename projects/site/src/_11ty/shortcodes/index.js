// @ts-check

import markdownIt from 'markdown-it';
import { PlaygroundService } from '@internals/tools/playground';
import { siteData } from '../../index.11tydata.js';
import markdown from '../libraries/markdown.js';

const md = markdownIt();
const { stories, elements } = siteData;
const examples = stories;

/**
 * Shortcode for generating installation instructions for a component
 * Returns TypeScript import statement and example HTML usage
 * @param {string} tag - The component tag name
 * @returns {Promise<string>} HTML string containing installation instructions
 */
export async function installShortcode(tag) {
  const element = elements.find(d => d.name === tag);
  return element?.manifest?.metadata?.entrypoint
    ? /* html */ `
\`\`\`typescript
import '${element?.manifest?.metadata?.entrypoint}/define.js';
\`\`\`

\`\`\`html
${examples.find(s => s.id === 'Default' && s.element === tag)?.template}
\`\`\`
`
    : '';
}

/**
 * Shortcode for embedding component examples
 * Supports both inline and iframe rendering modes
 * @param {string} ref - The component tag name or example path
 * @param {string} exampleName - The name of the example to display
 * @param {Object|string} userConfig - Configuration options for the example display
 * @returns {Promise<string>} HTML string containing the embedded example
 */
export async function exampleShortcode(
  ref,
  exampleName,
  userConfig = { inline: true, height: '95%', resizable: true, summary: true }
) {
  const defaultConfig = { inline: true, height: '95%', resizable: true, summary: true };
  const config =
    typeof userConfig === 'string'
      ? { ...defaultConfig, ...JSON.parse(userConfig) }
      : { ...defaultConfig, ...userConfig };
  const example =
    ref.includes('.stories.json') || ref.includes('.examples.json')
      ? examples.find(s => s.entrypoint?.includes(ref) && s.id === exampleName)
      : examples.find(s => s.element === ref && s.id === exampleName);

  if (!example) {
    console.error('Example not found: ', ref, exampleName);
    return '';
  }

  const canvasId = `${ref.replaceAll('/', '-').replaceAll('.', '-').replaceAll('@', '')}_${example.id}`;

  const playgroundURL = await PlaygroundService.create({
    template: example?.template ?? '',
    name: `${example.entrypoint}_${exampleName}`
  });

  const playgroundButton = example
    ? `<nve-button container="flat" slot="suffix"><a href="${playgroundURL}" target="_blank">Open in Playground</a></nve-button>`
    : '';

  const editButton =
    example && ref.startsWith('nve-')
      ? `<nve-button container="flat" slot="suffix"><a href="./docs/elements/${ref.replace(/^nve-/, '')}/examples/?edit=true&example=${example.id
          .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
          .replace(/\s+/g, '-')
          .toLowerCase()}">Edit Example</a></nve-button>`
      : '';

  // replace all double newlines with single newlines in script tags only
  // https://github.com/markdown-it/markdown-it/issues/1056
  // https://spec.commonmark.org/0.31.2/#html-blocks
  const templateContent = example?.template.replace(/\n\n/g, '\n');

  const template = config.inline
    ? /* html */ `<div id="${canvasId}_content">${templateContent}</div>`
    : `<iframe loading="lazy" src="examples/${example?.permalink}index.html" style="height: ${config.height}; width: 100%; border: none;" />`;

  const reload =
    globalThis.process.env.ELEVENTY_RUN_MODE === 'serve' && config.inline && example && !ref.includes('.stories.json')
      ? reloadScript(example, canvasId)
      : '';

  // static canvas is used to ensure what is rendered is local sourced and not from the remote esm.sh
  return example
    ? /* html */ `
<div class="example-shortcode" nve-layout="column gap:sm">
${config.summary ? markdown.render(example.summary ? example.summary : (example.summary ?? '')).replace('nve-text', 'class="example-shortcode-summary" nve-text') : ''}
<nvd-canvas id="${canvasId}" style="--overflow: ${config.resizable ? 'auto' : 'visible'}">
  <template>${md.utils?.escapeHtml(templateContent)}</template>${template}${editButton}${playgroundButton}
</nvd-canvas>${reload}
</div>`.trim()
    : '';
}

function reloadScript(example, canvasId) {
  return /* html */ `
<script type="module">
  import examples from '${example.entrypoint}' with { type: 'json' };
  const rawTemplate = examples?.items?.find(s => s.id === '${example.id}')?.template ?? '';
  const template = rawTemplate.replace(/import\\s+(?:(?:\\{[^}]*\\}|\\w+)\\s+from\\s+)?['"][^'"]*['"];?/g, '');
  document.querySelector('#${canvasId}_content:not(:has(iframe))').innerHTML = template;
</script>`;
}

export async function doDontShortcode(content) {
  return /* html */ `
<div nve-layout="column gap:sm">
  <style scoped>
    .content > div, {
      justify-content: space-between;
      height: 100%;
    }
    .content > pre {
      width: 100%;
      display: block;
      margin: 0;
    }
  </style>
  <div nve-layout="grid gap:sm span-items:6">
    <nve-badge status="success">Do</nve-badge>
    <nve-badge status="danger">Don't</nve-badge>
  </div>
  <div class="content" nve-layout="grid gap:sm span-items:6">
    ${content}
  </div>
</div>`;
}

export async function splitShortcode(content) {
  return /* html */ `
<div class="split-shortcode" nve-layout="grid gap:lg span-items:12 &xl|span-items:6">
  ${content}
</div>`;
}
