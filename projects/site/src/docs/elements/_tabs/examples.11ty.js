import { MetadataService } from '@nve-internals/metadata';
import markdownIt from 'markdown-it';

// Initialize markdown parser and metadata service
const md = markdownIt();
const metadata = await MetadataService.getMetadata();
const elements = Object.keys(metadata.projects).flatMap(packageName => metadata.projects[packageName].elements ?? []);

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

  const element = elements.find(d => d.name === componentData.tag);
  const stories =
    element.stories.items
      .filter(s => !s.template?.includes('${'))
      .filter(s => !s.id.toLowerCase().includes('shadowroot')) || [];

  // Create a JSON string of all story templates for JavaScript to cycle through
  const storyTemplates = stories.map(story => ({
    id: story.id,
    template: md.utils.escapeHtml(story.template)
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
      ${element.stories.items.find(s => s.id === 'Default')?.template}
    </template>

    <div nve-layout="row gap:lg align:stretch">
      ${
        stories.length > 1
          ? `
          <nve-menu id="example-selector">
            ${stories
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
    
      <nvd-canvas-editable id="cycling-example" source="${md.utils.escapeHtml(stories[0]?.template || '')}"  tag="${componentData.tag}" show-source></nvd-canvas-editable>
    </div>

    ${stories
      .map(
        (story, index) => /* html */ `
        <div class="story-example">
          <h3 nve-text="heading lg mkd">${story.id.split(/(?=[A-Z])/).join(' ')}</h3>
          <nvd-canvas-editable source="${md.utils.escapeHtml(story.template)}" readonly tag="${componentData.tag}">
            <nve-button container="flat" slot="suffix" value="${index}">Edit</nve-button>
          </nvd-canvas-editable>
        </div>
      `
      )
      .join('\n')}

    

    <script type="module">
      const cyclingExample = document.querySelector('#cycling-example');
      const exampleSelector = document.querySelector('#example-selector');
      
      if (cyclingExample && exampleSelector) {
        const storyTemplates = ${JSON.stringify(storyTemplates)};
        
        // Function to unescape HTML entities
        function unescapeHtml(html) {
          const textarea = document.createElement('textarea');
          textarea.innerHTML = html;
          return textarea.value;
        }
        
        exampleSelector.addEventListener('click', (event) => {
          const selectedIndex = parseInt(event.target.value);
          const story = storyTemplates[selectedIndex];
          if (story) {
            cyclingExample.setAttribute('source', unescapeHtml(story.template));
            
            // Clear selection from all menu items
            const allItems = exampleSelector.querySelectorAll('nve-menu-item');
            allItems.forEach(item => item.selected = false);
            
            // Set selection on the clicked item
            event.target.selected = true;
          }
        });
      }

      // Add click event listeners to Edit buttons
      const editButtons = document.querySelectorAll('.story-example nve-button');
      editButtons.forEach(button => {
        button.addEventListener('click', (event) => {
          const parentCanvas = event.target.closest('nvd-canvas-editable');
          const source = parentCanvas.getAttribute('source');
          
          if (cyclingExample && source) {
            cyclingExample.setAttribute('source', source);
            
            // Clear selection from all menu items
            const allItems = exampleSelector.querySelectorAll('nve-menu-item');
            allItems.forEach(item => item.selected = false);

            // Find the corresponding nve-menu-item in exampleSelector and select it
            const value = event.target.value;
            const menuItem = exampleSelector.querySelector('nve-menu-item[value="' + value + '"]');
            if (menuItem) {
              menuItem.selected = true;
            }

            // Scroll to #example-browser
            var exampleBrowser = document.getElementById('${componentData.title.toLowerCase().replace(/\s+/g, '-')}-examples');
            if (exampleBrowser && exampleBrowser.scrollIntoView) {
              exampleBrowser.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        });
      });
    </script>

    <script type="module">
      import '/_internal/canvas-editable/canvas-editable.js';
    </script>
  `;
}
