// @ts-check

import markdownIt from 'markdown-it';
import { siteData } from '../../../index.11tydata.js';
import { exampleShortcode, exampleTagsShortcode } from '../../../_11ty/shortcodes/example.js';
import { apiShortcode } from '../../../_11ty/shortcodes/api.js';

const { examples, elements } = siteData;

// Initialize markdown parser and metadata service
const md = markdownIt();

/**
 * Configuration object for the examples documentation template.
 * Sets up pagination to generate one page per component for examples.
 */
export const data = {
  // Use the main docs layout template
  layout: 'docs.11ty.js',
  // Configure pagination to process each component document
  pagination: {
    data: 'collections.componentDocs',
    size: 1,
    alias: 'component',
    addAllPagesToCollections: true
  },
  // Generate URLs in the format /docs/elements/{component-name}/examples/ or /docs/code/{component-name}/examples/ or /docs/monaco/{component-name}/examples/
  permalink: data => {
    const filePath = data.component.filePathStem;
    let dir = 'elements';
    if (filePath.includes('/code/')) dir = 'code';
    else if (filePath.includes('/monaco/')) dir = 'monaco';
    else if (filePath.includes('/markdown/')) dir = 'markdown';
    return `/docs/${dir}/${data.component.fileSlug}/examples/`;
  }
};

/**
 * Renders the examples documentation page for a component.
 * Currently a placeholder that will be expanded to show component examples.
 *
 * @param {Object} data - The page data object from 11ty
 * @returns {Promise<string>} HTML string containing the examples documentation
 */
export async function render(data) {
  const componentData = data.component.data;
  const element = elements.find(e => e.name === componentData.tag);
  const exampleTemplates = examples.filter(example => example.element === componentData.tag);
  const isPopover = [
    'popover',
    'dialog',
    'drawer',
    'dropdown',
    'notification',
    'toast',
    'toggletip',
    'tooltip'
  ].includes(componentData.tag.replace('nve-', ''));
  data.tag = componentData.tag;
  data.title = componentData.title;
  data.page.fileSlug = componentData.page.fileSlug;

  return /* html */ `
    <style scoped>
      .canvas-editable-container {
        min-height: 470px;
      }

      .example-selector {
        max-height: 500px;
        overflow: auto;
        overflow-x: hidden;
      }

      .story-example {
        padding-top: var(--nve-ref-space-lg);

        h3 {
          padding: 0;
        }
      }
    </style>
    <h2 nve-text="heading xl emphasis mkd">${componentData.title} Examples</h2>
    <div class="canvas-editable-container" nve-layout="row gap:lg align:stretch">
      ${
        exampleTemplates.length > 1
          ? /* html */ `
        <nve-menu id="example-selector" class="example-selector">
          ${exampleTemplates
            .map(
              example =>
                /* html */ `<nve-menu-item value="${example.id}">${example.name.split(/(?=[A-Z])/).join('')}</nve-menu-item>`
            )
            .join('')}
        </nve-menu>`
          : ''
      }
      <nvd-canvas-editable id="cycling-example" tag="${componentData.tag}" horizontal-layout></nvd-canvas-editable>
    </div>

    ${(
      await Promise.all(
        exampleTemplates.map(async example => {
          const member = element?.manifest?.members?.find(m => m.name.toLowerCase() === example.name.toLowerCase());
          return /* html */ `
        <div class="story-example" nve-layout="column gap:sm">
          <div nve-layout="row gap:sm align:wrap align:space-between full">
            <h3 nve-text="heading lg emphasis mkd" id="${example.id}">${example.name.split(/(?=[A-Z])/).join(' ')}</h3>
            ${await exampleTagsShortcode(example.entrypoint, example.name)}
          </div>
          ${example.name === 'Default' ? await apiShortcode(componentData.tag, 'description') : ''}
          ${example.name !== 'Default' && member ? await apiShortcode(componentData.tag, 'property', member.name) : ''}
          ${example.name.startsWith('Event') ? await apiShortcode(componentData.tag, 'event') : ''}
          ${example.entrypoint ? await exampleShortcode(example.entrypoint, example.name, { inline: !isPopover, height: isPopover ? '400px' : undefined }) : ''}
        </div>
      `;
        })
      )
    ).join('\n')}

    <script type="module">
      const params = new URLSearchParams(window.location.search);
      const cyclingExample = document.querySelector('#cycling-example');
      const exampleSelector = document.querySelector('.example-selector');
      const exampleSelectorItems = Array.from(exampleSelector.querySelectorAll('nve-menu-item'));
      const examples = ${JSON.stringify(exampleTemplates.map(i => ({ id: i.id, template: md.utils.escapeHtml(i.template) })))};
      const exampleId = params.get('example') ?? examples[0].id;
      const example = examples.find(e => e.id === exampleId);

      if (example) {
        cyclingExample.source = unescapeHtml(example.template);
        exampleSelectorItems.find(item => item.value === exampleId).selected = true;
      }

      exampleSelector.addEventListener('click', (event) => {
        const example = examples.find(e => e.id === event.target.value);
        if (example) {
          exampleSelectorItems.forEach(item => item.selected = false);
          event.target.selected = true;
          cyclingExample.source = unescapeHtml(example.template);
          updateExampleQueryParam(example.id);
        }
      });

      function unescapeHtml(html) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = html;
        return textarea.value;
      }

      function updateExampleQueryParam(id) {
        const url = new URL(window.location.href);
        if (id) {
          url.searchParams.set('example', id);
        } else {
          url.searchParams.delete('example');
        }
        window.history.replaceState({}, '', url.toString());
      }
    </script>
    <script type="module">
      import('/_internal/canvas-editable/canvas-editable.js');
    </script>
  `;
}
