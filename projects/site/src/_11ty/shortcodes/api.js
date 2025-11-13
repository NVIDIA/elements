// @ts-check

import markdown from '../libraries/markdown.js';
import { siteData } from '../../index.11tydata.js';

const { elements } = siteData;

const typeAliasMap = {
  description: 'description',
  event: 'events',
  property: 'members',
  slot: 'slots',
  'css-property': 'cssProperties',
  'css-part': 'cssParts'
};

export async function apiShortcode(tag, type, value = null) {
  const element = elements.find(d => d.name === tag);

  if (element?.manifest) {
    if (type === 'description') {
      return markdown
        .render(element.manifest.description ?? '')
        .trim()
        .replaceAll('<p>', '<p class="api-description" nve-text="body relaxed mkd">');
    }

    let apiItem = element.manifest[typeAliasMap[type]]?.find(m => m.name === value);

    return /* html */ `<div class="api-shortcode" nve-layout="column gap:sm">
    ${apiItem && value !== null ? renderAPIValueTable(apiItem) : renderAPITable(element, type)}
</div>`.replaceAll('\n', '');
  }

  return '';
}

export function renderAPIValueTable(apiValue) {
  const values = apiValue.type?.values ?? [];
  return /* html */ `
  <div class="api-value-table" nve-layout="column gap:sm full">
    ${
      values.length
        ? /* html */ `
    ${markdown
      .render(apiValue.descriptionText ?? apiValue.description ?? '')
      .trim()
      .replaceAll('<p>', '<p nve-text="body relaxed">')}
    <nve-grid container="flat">
      <nve-grid-header>
        <nve-grid-column width="200px">${apiValue.name.charAt(0).toUpperCase() + apiValue.name.slice(1)}</nve-grid-column>
        <nve-grid-column>Description</nve-grid-column>
      </nve-grid-header>
      ${values
        .filter(i => !i.deprecated)
        .map(
          i => /* html */ `<nve-grid-row>
        <nve-grid-cell><span nve-text="code nowrap">${i.value}</span></nve-grid-cell>
        <nve-grid-cell>${i.description ?? ''}</nve-grid-cell>
      </nve-grid-row>`
        )
        .join('')}
    </nve-grid>`
        : markdown
            .render(apiValue.description ?? '')
            .trim()
            .replaceAll('nve-text', 'class="api-value-table-description" nve-text')
    }
  </div>`;
}

export function renderAPITable(element, type, options = { container: 'flat' }) {
  const items = element.manifest[typeAliasMap[type]]?.filter(i => !i.deprecated) ?? [];
  const noItems = items.length === 0;
  return /* html */ `
  <div class="api-table" nve-layout="column gap:sm full">
    <nve-grid container="${options.container}" style="min-height: 100px">
      <nve-grid-header>
        <nve-grid-column>${type.charAt(0).toUpperCase() + type.slice(1)}</nve-grid-column>
        ${type === 'property' ? '<nve-grid-column>Attribute</nve-grid-column>' : ''}
        <nve-grid-column>Description</nve-grid-column>
        ${type === 'property' ? '<nve-grid-column>Values</nve-grid-column>' : ''}
      </nve-grid-header>
      ${items
        .map(i => {
          const rawDescription = i.descriptionText ?? i.description;
          const description = rawDescription
            ? markdown
                .render(rawDescription)
                .trim()
                .replaceAll('<p', '<p nve-text="body relaxed sm"')
                .replaceAll('<code', '<code nve-text="code nowrap"')
            : '';
          return /* html */ `<nve-grid-row>
        <nve-grid-cell><span nve-text="code nowrap">${i.name === '' ? 'default' : i.name}</span></nve-grid-cell>
        ${type === 'property' ? /* html */ `<nve-grid-cell><span nve-text="code nowrap">${i.attribute ?? 'none'}</span></nve-grid-cell>` : ''}
        <nve-grid-cell>${description}</nve-grid-cell>
        ${
          type === 'property'
            ? /* html */ `<nve-grid-cell>
          <div nve-layout="row gap:xxs align:wrap">${(i.type?.values ?? []).map(v => /* html */ `<span nve-text="code nowrap">${v.value}</span>`).join('')}</div>
        </nve-grid-cell>`
            : ''
        }
      </nve-grid-row>`;
        })
        .join('')}
      ${
        noItems
          ? /* html */ `<nve-grid-placeholder>
        <p nve-text="body relaxed sm">No ${type}s found</p>
      </nve-grid-placeholder>`
          : ''
      }
    </nve-grid>
  </div>`;
}
