// Import the elementTable function that generates API documentation tables
import { elementTable } from '../../../_11ty/templates/api.js';

/**
 * Configuration object for the API documentation template.
 * Sets up pagination to generate one page per component.
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
  // Generate URLs in the format /docs/elements/{component-name}/api/ or /docs/code/{component-name}/api/ or /docs/monaco/{component-name}/api/
  permalink: data => {
    const filePath = data.component.filePathStem;
    let dir = 'elements';
    if (filePath.includes('/code/')) dir = 'code';
    else if (filePath.includes('/monaco/')) dir = 'monaco';
    return `/docs/${dir}/${data.component.fileSlug}/api/`;
  }
};

/**
 * Renders the API documentation page for a component.
 * Generates API tables for both the main component and any associated elements.
 *
 * @param {Object} data - The page data object from 11ty
 * @returns {string} HTML string containing the API documentation
 */
export function render(data) {
  // Extract component metadata from the frontmatter
  const componentData = data.component.data;
  data.tag = componentData.tag;
  data.title = componentData.title;
  data.page.fileSlug = componentData.page.fileSlug;

  return `
    ${elementTable(componentData.tag)}

    ${componentData.associatedElements?.length ? componentData.associatedElements.map(tag => elementTable(tag)).join('') : ''}
  `;
}
