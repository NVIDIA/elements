import { elementTable } from '../../../_11ty/templates/api.js';

export const data = {
  layout: 'docs.11ty.js',
  pagination: {
    data: 'collections.componentDocs',
    size: 1,
    alias: 'component',
    addAllPagesToCollections: true
  },
  permalink: data => `/docs/elements/${data.component.fileSlug}/api/`
};

export function render(data) {
  // Get the component tag from the frontmatter
  const componentData = data.component.data;
  data.tag = componentData.tag;
  data.title = componentData.title;
  data.page.fileSlug = componentData.page.fileSlug;

  return `
    ${elementTable(componentData.tag)}

    ${componentData.associatedElements?.length ? componentData.associatedElements.map(tag => elementTable(tag)).join('') : ''}
  `;
}
