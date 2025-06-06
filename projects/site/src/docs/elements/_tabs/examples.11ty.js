export const data = {
  layout: 'docs.11ty.js',
  pagination: {
    data: 'collections.componentDocs',
    size: 1,
    alias: 'component',
    addAllPagesToCollections: true
  },
  permalink: data => `/docs/elements/${data.component.fileSlug}/examples/`
};

export function render(data) {
  // Get the component tag from the frontmatter
  const componentData = data.component.data;
  data.tag = componentData.tag;
  data.title = componentData.title;
  data.page.fileSlug = componentData.page.fileSlug;

  return `
    <h2 nve-text="heading xl mkd">${componentData.title} Examples</h2>

    <p nve-text="body trim:none">Todo: Render examples for ${componentData.tag}</p>
  `;
}
