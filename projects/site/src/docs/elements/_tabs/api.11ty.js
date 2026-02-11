import { renderAPITable, hasAPIData } from '../../../_11ty/shortcodes/api.js';
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

function renderAPISection(element, type, title, extraAttrs = '') {
  if (!hasAPIData(element, type)) return '';
  return `
<div nve-layout="column gap:md${type === 'css-part' ? ' pad-bottom:xxl' : ''}"${extraAttrs}>
  <h3 nve-text="heading lg mkd">${title}</h3>
  ${renderAPITable(element, type, { container: '' })}
</div>`;
}

function renderAllAPIs(element) {
  return `
<h2 nve-text="heading lg mkd" style="padding: 0 !important;">&lt;${element.name}&gt;</h2>
${renderAPISection(element, 'property', 'Properties')}
${renderAPISection(element, 'event', 'Events')}
${renderAPISection(element, 'slot', 'Slots')}
${renderAPISection(element, 'command', 'Invoker Commands')}
${renderAPISection(element, 'css-property', 'CSS Properties')}
${renderAPISection(element, 'css-part', 'CSS Parts', ' data-api-section="css-parts"')}`;
}
