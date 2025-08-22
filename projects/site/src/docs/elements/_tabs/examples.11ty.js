// @ts-check

import markdownIt from 'markdown-it';
import { siteData } from '../../../index.11tydata.js';

const { stories } = siteData;

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
    return `/docs/${dir}/${data.component.fileSlug}/examples/`;
  }
};

/**
 * Renders the examples documentation page for a component.
 * Currently a placeholder that will be expanded to show component examples.
 *
 * @param {Object} data - The page data object from 11ty
 * @returns {string} HTML string containing the examples documentation
 */
export function render(data) {
  // Extract component metadata from the frontmatter
  const componentData = data.component.data;
  data.tag = componentData.tag;
  data.title = componentData.title;
  data.page.fileSlug = componentData.page.fileSlug;

  // Create a JSON string of all story templates for JavaScript to cycle through
  const storyTemplates = stories
    .filter(story => story.element === componentData.tag)
    .map(story => ({
      ...story,
      template: md.utils.escapeHtml(story.template),
      slug: story.id
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/\s+/g, '-')
        .toLowerCase()
    }));

  return /* html */ `
    <style>
      nve-menu {
        max-height: 500px;
        overflow: auto;
        overflow-x: hidden;
      }
    </style>
  
    <h2 nve-text="heading xl mkd">${componentData.title} Examples</h2>

    <!-- Triggers element loader -->
     <template>
      ${stories.filter(story => story.element === componentData.tag).find(s => s.id === 'Default')?.template}
     </template>

    <div nve-layout="row gap:lg align:stretch">
      ${
        storyTemplates.length > 1
          ? `
          <nve-menu id="example-selector">
            ${storyTemplates
              .map(
                (story, index) => `
              <nve-menu-item value="${index}" ${index === 0 ? 'selected' : ''}>${story.id.split(/(?=[A-Z])/).join(' ')}</nve-menu-item>
            `
              )
              .join('')}
          </nve-menu>
        `
          : ''
      }
    
      <nvd-canvas-editable id="cycling-example" source="${storyTemplates[0]?.template || ''}"  tag="${componentData.tag}" horizontal-layout></nvd-canvas-editable>
    </div>

    ${storyTemplates
      .map(
        (story, index) => /* html */ `
        <div class="story-example">
          <h3 nve-text="heading lg mkd" id="${story.slug}">${story.id.split(/(?=[A-Z])/).join(' ')}</h3>
          <nvd-canvas-editable source="${story.template}" tag="${componentData.tag}" readonly>
            <nve-button container="flat" slot="suffix" value="${index}">Edit</nve-button>
          </nvd-canvas-editable>
        </div>
      `
      )
      .join('\n')}

    

    <script type="module">
      const cyclingExample = document.querySelector('#cycling-example');
      const exampleSelector = document.querySelector('#example-selector');
      const storyTemplates = ${JSON.stringify(storyTemplates)};
      
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
      import '/_internal/canvas-editable/canvas-editable.js';
    </script>
  `;
}
