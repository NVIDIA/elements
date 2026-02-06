import { renderAPITable } from '../../../_11ty/shortcodes/api.js';
import { siteData } from '../../../index.11tydata.js';

const { elements } = siteData;

/**
 * Configuration object for the API documentation template.
 * Sets up pagination to generate one page per component.
 */
export const data = {
  layout: 'docs.11ty.js',
  pagination: {
    data: 'collections.componentDocs',
    size: 1,
    alias: 'component'
  },
  permalink: data => {
    const filePath = data.component.filePathStem;
    let dir = 'elements';
    if (filePath.includes('/code/')) dir = 'code';
    else if (filePath.includes('/monaco/')) dir = 'monaco';
    else if (filePath.includes('/markdown/')) dir = '';
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
  const componentData = data.component.data;
  data.tag = componentData.tag;
  data.title = componentData.title;
  data.page.fileSlug = componentData.page.fileSlug;
  data.hideExamplesTab = componentData.hideExamplesTab;

  const element = elements.find(d => d.name === componentData.tag);
  return element
    ? `
  ${renderAllAPIs(element)}
  ${componentData.associatedElements?.length ? componentData.associatedElements.map(tag => renderAllAPIs(elements.find(d => d.name === tag))).join('') : ''}
  `
    : '';
}

function renderAllAPIs(element) {
  return `
<h2 nve-text="heading lg mkd" style="padding: 0 !important;">&lt;${element.name}&gt;</h2>

<div nve-layout="column gap:md">
  <h3 nve-text="heading lg mkd">Properties</h3>
  ${renderAPITable(element, 'property', { container: '' })}
</div>

<div nve-layout="column gap:md">
  <h3 nve-text="heading lg mkd">Events</h3>
  ${renderAPITable(element, 'event', { container: '' })}
</div>

<div nve-layout="column gap:md">
  <h3 nve-text="heading lg mkd">Slots</h3>
  ${renderAPITable(element, 'slot', { container: '' })}
</div>

<div nve-layout="column gap:md">
  <h3 nve-text="heading lg mkd">Invoker Commands</h3>
  ${renderAPITable(element, 'command', { container: '' })}
</div>

<div nve-layout="column gap:md">
  <h3 nve-text="heading lg mkd">CSS Properties</h3>
  ${renderAPITable(element, 'css-property', { container: '' })}
</div>

<div nve-layout="column gap:md pad-bottom:xxl">
  <h3 nve-text="heading lg mkd">CSS Parts</h3>
  ${renderAPITable(element, 'css-part', { container: '' })}
</div>`;
}
