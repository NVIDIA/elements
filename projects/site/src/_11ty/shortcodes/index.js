// @ts-check

import markdownIt from 'markdown-it';
import { PlaygroundService } from '@nve-internals/tools/playground';
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
  return element
    ? /* html */ `
\`\`\`typescript
import '${element.manifest.metadata.entrypoint}/define.js';
\`\`\`

\`\`\`html
${examples.find(s => s.id === 'Default' && s.element === tag)?.template}
\`\`\`
`
    : '';
}

/**
 * Shortcode for generating API documentation sections
 * Supports different types of documentation: description, event, property, slot, story
 * @param {string} tag - The component tag name
 * @param {string} type - The type of documentation to generate
 * @param {string} value - The specific value to document (e.g., event name, property name)
 * @returns {Promise<string>} HTML string containing the API documentation section
 */
export async function apiShortcode(tag, type, value) {
  const element = elements.find(d => d.name === tag);
  return element
    ? /* html */ `
  ${type === 'description' ? md.render(element.manifest.description ?? '') : ''}
  ${type === 'event' ? md.render(`\`${value}\`: ` + element.manifest.events?.find(m => m.name === value)?.description) : ''}
  ${type === 'property' ? md.render(element.manifest.members?.find(m => m.name === value)?.description ?? '') : ''}
  ${type === 'slot' ? md.render(element.manifest.slots?.find(m => m.name === value)?.description ?? '') : ''}
  ${type === 'story' ? md.render(element.stories?.items?.find(m => m.id === value)?.description ?? '') : ''}`
        .trim()
        .replaceAll('<p>', '<p nve-text="body relaxed mkd">')
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
export async function storyShortcode(
  ref,
  exampleName,
  userConfig = { inline: true, height: '95%', resizable: true, editable: false }
) {
  const config = typeof userConfig === 'string' ? JSON.parse(userConfig) : userConfig;
  const example = ref.includes('.stories.json')
    ? examples.find(s => s.entrypoint?.includes(ref) && s.id === exampleName)
    : examples.find(s => s.element === ref && s.id === exampleName);

  if (!example) {
    console.error('Story not found: ', ref, exampleName);
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

  const editButton = example
    ? `<nve-button container="flat" slot="suffix"><a href="./docs/elements/${ref.replace(/^nve-/, '')}/examples/?edit=true&example=${example.id
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/\s+/g, '-')
        .toLowerCase()}">Edit Example</a></nve-button>`
    : '';

  const template = config.inline
    ? /* html */ `<div id="${canvasId}_content">${example?.template?.replace(/\n\n/g, '\n')}</div>`
    : `<iframe loading="lazy" src="examples/${example?.permalink}index.html" style="height: ${config.height}; width: 100%; border: none;" />`;

  const source = md.utils?.escapeHtml(example?.template?.replace(/\n\n/g, '\n') ?? '');

  const reload =
    globalThis.process.env.ELEVENTY_RUN_MODE === 'serve' && config.inline && example && !ref.includes('.stories.json')
      ? reloadScript(example, canvasId)
      : '';

  return example
    ? config.editable
      ? /* html */ `
<nvd-canvas-editable 
  id="${canvasId}"
  style="--height: ${config.height}"
  source="${source}"
  tag="${example.element || ref}">
</nvd-canvas-editable>`
      : /* html */ `
${markdown.render(example.description ?? '')}
<nvd-canvas id="${canvasId}" style="--overflow: ${config.resizable ? 'auto' : 'visible'}">
  <template>${source}</template>${template}${editButton}${playgroundButton}
</nvd-canvas>${reload}`.trim()
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
