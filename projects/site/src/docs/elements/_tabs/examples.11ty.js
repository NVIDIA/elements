// @ts-check

import markdownIt from 'markdown-it';
import { siteData } from '../../../index.11tydata.js';
import { exampleShortcode, exampleTagsShortcode } from '../../../_11ty/shortcodes/example.js';
import { apiShortcode } from '../../../_11ty/shortcodes/api.js';

const { stories, elements } = siteData;
const examples = stories;

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

  const exampleTemplates = examples
    .filter(example => example.element === componentData.tag)
    .map(example => ({
      ...example,
      template: md.utils.escapeHtml(example.template),
      slug: example.id
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/\s+/g, '-')
        .toLowerCase()
    }));

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
              (example, index) => /* html */ `
            <nve-menu-item value="${index}" ${index === 0 ? 'selected' : ''}>${example.id.split(/(?=[A-Z])/).join(' ')}</nve-menu-item>
          `
            )
            .join('')}
        </nve-menu>`
          : ''
      }
      <nvd-canvas-editable id="cycling-example" source="${exampleTemplates[0]?.template || ''}"  tag="${componentData.tag}" horizontal-layout></nvd-canvas-editable>
    </div>

    ${(
      await Promise.all(
        exampleTemplates.map(async example => {
          const member = element?.manifest?.members?.find(m => m.name.toLowerCase() === example.id.toLowerCase());
          return /* html */ `
        <div class="story-example" nve-layout="column gap:sm">
          <div nve-layout="row gap:sm align:wrap align:space-between full">
            <h3 nve-text="heading lg emphasis mkd" id="${example.slug}">${example.id.split(/(?=[A-Z])/).join(' ')}</h3>
            ${await exampleTagsShortcode(example.entrypoint, example.id)}
          </div>
          ${example.id === 'Default' ? await apiShortcode(componentData.tag, 'description') : ''}
          ${example.id !== 'Default' && member ? await apiShortcode(componentData.tag, 'property', member.name) : ''}
          ${example.id.startsWith('Event') ? await apiShortcode(componentData.tag, 'event') : ''}
          ${example.entrypoint ? await exampleShortcode(example.entrypoint, example.id, { inline: !isPopover, height: isPopover ? '400px' : undefined }) : ''}
        </div>
      `;
        })
      )
    ).join('\n')}

    <script type="module">
      const cyclingExample = document.querySelector('#cycling-example');
      const exampleSelector = document.querySelector('#example-selector');
      const storyTemplates = ${JSON.stringify(exampleTemplates)};
      
      // Utility: unescape HTML entities
      function unescapeHtml(html) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = html;
        return textarea.value;
      }
      
      // Utility: update URL to reflect edit mode and selected story
      function updateUrlForEdit(slug) {
        const url = new URL(window.location.href);
        url.searchParams.set('edit', 'true');

        if (slug) {
          url.searchParams.set('example', slug);
        } else {
          url.searchParams.delete('example');
        }

        // Remove any existing hash
        url.hash = '';
        window.history.replaceState({}, '', url.toString());
      }
      
      // Utility: select a menu item by index (if menu is present)
      function selectMenuIndex(index) {
        if (!exampleSelector) return;

        const allItems = exampleSelector.querySelectorAll('nve-menu-item');
        allItems.forEach(item => item.selected = false);
        const menuItem = exampleSelector.querySelector('nve-menu-item[value="' + index + '"]');
        if (menuItem) menuItem.selected = true;
      }
      
      // Utility: load a story into the top editor by index
      function setEditorIndex(index, persistUrl = false) {
        if (!cyclingExample) return;

        const story = storyTemplates[index];
        if (!story) return;
        cyclingExample.setAttribute('source', unescapeHtml(story.template));
        if (persistUrl) updateUrlForEdit(story.slug);
      }
      
      if (cyclingExample) {
        // If edit mode is enabled via URL param, load the example from URL param into the top editor
        const params = new URLSearchParams(window.location.search);
        const isEditMode = params.get('edit') === 'true' || params.get('edit') === '1';
        const exampleId = params.get('example');

        if (isEditMode && exampleId) {
          const index = storyTemplates.findIndex(s => s.slug === exampleId);
          if (index >= 0) {
            setEditorIndex(index, false);
            selectMenuIndex(index);
            cyclingExample.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
        
        if (exampleSelector) {
          exampleSelector.addEventListener('click', (event) => {
            const selectedIndex = parseInt(event.target.value);
            if (Number.isFinite(selectedIndex)) {
              setEditorIndex(selectedIndex, true);
              selectMenuIndex(selectedIndex);
            }
          });
        }
      }

      // Add click event listeners to Edit buttons
      const editButtons = document.querySelectorAll('.story-example nve-button');
      editButtons.forEach(button => {
        button.addEventListener('click', (event) => {
          const value = parseInt(event.target.value);
          if (Number.isFinite(value)) {
            setEditorIndex(value, true);
            selectMenuIndex(value);
            cyclingExample.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        });
      });
    </script>

    <script type="module">
      import('/_internal/canvas-editable/canvas-editable.js');
    </script>
  `;
}
