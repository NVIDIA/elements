import { MetadataService } from '@internals/metadata';
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
  const stories = element.stories || [];

  // Create a JSON string of all story templates for JavaScript to cycle through
  const storyTemplates = stories.map(story => ({
    id: story.id,
    template: md.utils.escapeHtml(story.template)
  }));

  return `
    <h2 nve-text="heading xl mkd">${componentData.title} Examples</h2>

    <!-- Triggers element loader -->
    <div style="display: none">
      ${element.stories.find(s => s.id === 'Default')?.template}
    </div>

    <nve-select>
      ${
        stories.length > 1
          ? `
      <select id="example-selector">
        ${stories
          .map(
            (story, index) => `
          <option value="${index}" ${index === 0 ? 'selected' : ''}>${story.id.split(/(?=[A-Z])/).join(' ')}</option>
        `
          )
          .join('')}
      </select>
      `
          : ''
      }
    </nve-select>
  
    <nvd-canvas-editable id="cycling-example" source="${md.utils.escapeHtml(stories[0]?.template || '')}"></nvd-canvas-editable>

    <script type="module">
      (function() {
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
          
          exampleSelector.addEventListener('change', (event) => {
            const selectedIndex = parseInt(event.target.value);
            const story = storyTemplates[selectedIndex];
            if (story) {
              cyclingExample.setAttribute('source', unescapeHtml(story.template));
            }
          });
        }
      })();
    </script>

    <script type="module">
      import '/_internal/canvas-editable/canvas-editable.js';
    </script>
  `;
}
