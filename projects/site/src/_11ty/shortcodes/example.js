import markdownIt from 'markdown-it';
import { PlaygroundService } from '@internals/tools/playground';
import markdown from '../libraries/markdown.js';
import { siteData } from '../../index.11tydata.js';

const md = markdownIt();
const { examples } = siteData;

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
  userConfig = { inline: true, height: '95%', resizable: true, summary: true, align: 'start', layer: 'canvas' }
) {
  const example = findExample(ref, exampleName);

  // Return early if no example is found
  if (!example) {
    return '';
  }

  const defaultConfig = {
    inline: true,
    height: '95%',
    resizable: true,
    summary: true,
    align: 'start',
    layer: 'canvas',
    editAction: false
  };
  const config =
    typeof userConfig === 'string'
      ? { ...defaultConfig, ...JSON.parse(userConfig) }
      : { ...defaultConfig, ...userConfig };

  const canvasId = `${ref.replaceAll('/', '-').replaceAll('.', '-').replaceAll('@', '')}_${example.id}`;

  const playgroundURL = await PlaygroundService.create({
    template: example?.template ?? '',
    name: example.id
  });

  const playgroundButton =
    example && playgroundURL?.length > 0
      ? `<nve-button container="flat" slot="suffix"><a href="${playgroundURL}" target="_blank">Open in Playground</a></nve-button>`
      : '';

  const editButton =
    example && config.editAction
      ? `<nve-button container="flat" slot="suffix"><a href="?edit=true&example=${example.id
          .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
          .replace(/\s+/g, '-')
          .toLowerCase()}">Edit Example</a></nve-button>`
      : '';

  // replace all double newlines with single newlines in script tags only
  // https://github.com/markdown-it/markdown-it/issues/1056
  // https://spec.commonmark.org/0.31.2/#html-blocks
  const templateContent = example?.template.replace(/\n\n/g, '\n');
  const reload = globalThis.process.env.ELEVENTY_RUN_MODE === 'serve' ? reloadScript(example, canvasId) : '';
  const inlineTemplate = /* html */ `<div id="${canvasId}_content">${templateContent}</div>${reload}`;
  const iframeTemplate = /* html */ `<iframe loading="lazy" src="examples/${example?.permalink}index.html" style="height: 100%; width: 100%; border: none;"></iframe>`;
  const template = config.inline ? inlineTemplate : iframeTemplate;
  const summary = markdown
    .render(example.description || example.summary || '')
    .replace('nve-text', 'class="example-shortcode-summary" nve-text');

  // static canvas is used to ensure what is rendered is local sourced and not from the remote esm.sh
  // replace all double newlines with single newlines to prevent markdown from processing HTML content
  // https://github.com/markdown-it/markdown-it/issues/1056
  // https://spec.commonmark.org/0.31.2/#html-blocks
  return example
    ? /* html */ `
<div class="example-shortcode" nve-layout="column gap:sm">
${config.summary ? summary : ''}
<nvd-canvas id="${canvasId}" data-pagefind-ignore="all" style="--overflow: ${config.resizable ? 'auto' : 'visible'}; --height: ${config.height};" align="${config.align}" layer="${config.layer}">
  <template>${md.utils?.escapeHtml(templateContent)}</template>${template}${editButton}${playgroundButton}
</nvd-canvas>
</div>`
        .trim()
        .replace(/\n\n/g, '\n')
    : '';
}

export async function exampleTagsShortcode(ref, exampleName) {
  const example = findExample(ref, exampleName);
  const tagStatus = {
    pattern: 'blue-cobalt',
    performance: 'gree-grass',
    'test-case': 'yellow-amber',
    deprecated: 'yellow-amber',
    'anti-pattern': 'red-cardinal'
  };

  if (!example) {
    throw new Error(`Example not found: ${ref} ${exampleName}`);
  }

  return /* html */ `<div nve-layout="row gap:xs align:wrap">${example.tags.map(tag => /* html */ `<nve-tag readonly color="${tagStatus[tag]}">${tag}</nve-tag>`).join('')}</div>`;
}

/**
 * This function creates a development reload script for example shortcodes.
 * 11ty will not incrementally rebuild the pages when in dev mode.
 *
 * To bypass rebuilding the entire site with any example change we create a
 * dependency on the *.examples.json file of the given example so vite will rebuild
 * the JS and reload the page when in dev mode.
 *
 * Since 11ty will not rebuild the page static content we take the example content
 * and replace it with the new content from the newly built files from vite.
 */
function reloadScript(example, canvasId) {
  return /* html */ `
<script type="module">
  import examples from '${example.entrypoint}' with { type: 'json' };
  const rawTemplate = examples?.items?.find(s => s.id === '${example.id}')?.template ?? '';
  // remove any import statements that may be in the raw example template as these are replaced by vite
  const container = document.querySelector('#${canvasId}_content:not(:has(iframe))');
  if (container) {
    // parse the template to extract script tags since innerHTML does not execute scripts
    const template = rawTemplate.replace(/import\\s+(?:(?:\\{[^}]*\\}|\\w+)\\s+from\\s+)?['"][^'"]*['"];?/g, '');
    const parser = new DOMParser();
    const doc = parser.parseFromString('<body>' + template + '</body>', 'text/html');
    const scripts = doc.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    container.innerHTML = doc.body.innerHTML;
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      [...oldScript.attributes].forEach(attr => newScript.setAttribute(attr.name, attr.value));
      newScript.textContent = oldScript.textContent;
      container.appendChild(newScript);
    });
  }
</script>`.replace(/\n\n/g, '\n');
}

function findExample(ref, exampleName) {
  const example = ref.includes('.examples.json')
    ? examples.find(s => s.entrypoint?.includes(ref) && s.name === exampleName)
    : examples.find(s => s.element === ref && s.name === exampleName);

  if (!example) {
    throw new Error(`Example not found: ${ref} ${exampleName}`);
  }

  return example;
}
