// @ts-check

import markdownIt from 'markdown-it';
import { PlaygroundService } from '@nve-internals/tools/playground';
import { siteData } from '../../index.11tydata.js';
import markdown from '../libraries/markdown.js';

const md = markdownIt();
const { stories, elements } = siteData;

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
${stories.find(s => s.id === 'Default' && s.element === tag)?.template}
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
 * Shortcode for embedding component stories/examples
 * Supports both inline and iframe rendering modes
 * @param {string} tag - The component tag name or story path
 * @param {string} storyName - The name of the story to display
 * @param {Object|string} userConfig - Configuration options for the story display
 * @returns {Promise<string>} HTML string containing the embedded story
 */
export async function storyShortcode(
  tag,
  storyName,
  userConfig = { inline: true, height: '95%', resizable: true, editable: false }
) {
  const element = elements.find(d => d.name === tag);
  const config = typeof userConfig === 'string' ? JSON.parse(userConfig) : userConfig;
  const story = tag.includes('.stories.json')
    ? stories.find(s => s.entrypoint.includes(tag) && s.id === storyName)
    : stories.find(s => s.element === tag && s.id === storyName);

  if (!story) {
    console.error('Story not found: ', tag, storyName);
    return '';
  }

  const playgroundURL = await PlaygroundService.create({
    template: story?.template ?? '',
    name: `${story.entrypoint}_${storyName}`
  });
  const playgroundButton = story
    ? `<nve-button container="flat" slot="suffix"><a href="${playgroundURL}" target="_blank">Open in Playground</a></nve-button>`
    : '';

  const editButton = story
    ? `<nve-button container="flat" slot="suffix"><a href="./docs/elements/${tag.replace(/^nve-/, '')}/examples/?edit=true&example=${story.id
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/\s+/g, '-')
        .toLowerCase()}">Edit Example</a></nve-button>`
    : '';

  const templateContent = config.inline
    ? story?.template?.replace(/\n\n/g, '\n')
    : `<iframe loading="lazy" src="stories/${story?.permalink}index.html" style="height: ${config.height}; width: 100%; border: none;" />`;

  const reload =
    // eslint-disable-next-line no-undef
    process.env.ELEVENTY_RUN_MODE === 'serve' && config.inline && story && !tag.includes('.stories.json')
      ? reloadScript(story, element ? editButton + playgroundButton : playgroundButton)
      : '';

  return story
    ? config.editable
      ? /* html */ `
<nvd-canvas-editable 
  id="${tag}_${story.id}"
  style="--height: ${config.height}"
  source="${md.utils.escapeHtml(story?.template?.replace(/\n\n/g, '\n') ?? '')}"
  tag="${story.element || tag}">
</nvd-canvas-editable>`
      : /* html */ `
${markdown.render(story.description ?? '')}
<nvd-canvas id="${tag}_${story.id}" style="--overflow: ${config.resizable ? 'auto' : 'visible'}">
  <template>${md.utils.escapeHtml(story?.template?.replace(/\n\n/g, '\n') ?? '')}</template>
  ${element ? editButton + playgroundButton : playgroundButton}
  ${templateContent}
</nvd-canvas>${reload}`
    : '';
}

function reloadScript(story, content) {
  return /* html */ `
<script type="module">
  import stories from '${story.entrypoint}' with { type: 'json' };
  const story = stories.items.find(s => s.id === '${story.id}');
  const canvas = document.getElementById(stories.element + '_' + story.id);
  const template = '${content}' + story.template.replace(/import\\s+(?:(?:\\{[^}]*\\}|\\w+)\\s+from\\s+)?['"][^'"]*['"];?/g, '');
  canvas.innerHTML = template;
  Array.from(canvas.querySelectorAll('script')).forEach(prev => {
    const next = document.createElement('script');
    Array.from(prev.attributes).forEach(attr => next.setAttribute(attr.name, attr.value));
    next.appendChild(document.createTextNode(prev.innerHTML));
    prev.parentNode.replaceChild(next, prev);
  });
</script>`;
}
