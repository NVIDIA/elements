// @ts-check

import markdown from '../libraries/markdown.js';
import { siteData } from '../../index.11tydata.js';

const { elements } = siteData;

const typeAliasMap = {
  command: 'commands',
  description: 'description',
  event: 'events',
  property: 'members',
  slot: 'slots',
  'css-property': 'cssProperties',
  'css-part': 'cssParts'
};

export async function apiShortcode(tag, type, name = null, value = null) {
  const element = elements.find(d => d.name === tag);

  if (element?.manifest) {
    if (type === 'description') {
      return markdown
        .render(element.manifest.description ?? '')
        .trim()
        .replaceAll('<p>', '<p class="api-description" nve-text="body relaxed mkd">');
    }

    const apiItem = element.manifest[typeAliasMap[type]]?.find(m => m.name === name);
    const shouldRenderAPINameTable = apiItem && name !== null && value === null;
    const shouldRenderAPIValueDescription = apiItem && name !== null && value !== null;

    return /* html */ `<div class="api-shortcode" nve-layout="column gap:sm">
      ${shouldRenderAPINameTable ? renderAPINameTable(apiItem) : ''}
      ${shouldRenderAPIValueDescription ? renderAPIValueDescription(apiItem, value) : ''}
      ${!shouldRenderAPINameTable && !shouldRenderAPIValueDescription ? renderAPITable(element, type) : ''}
    </div>`.replaceAll('\n', '');
  }

  return '';
}

function renderAPIValueDescription(apiItem, value) {
  const valueItem = apiItem.type?.values?.find(v => v.value === value);
  return /* html */ `${valueItem?.description ?? ''}`;
}

export function renderAPINameTable(apiValue) {
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

export function hasAPIData(element, type) {
  const items =
    element.manifest[typeAliasMap[type]]?.filter(
      i => !i.name?.startsWith?.('nve-') && i.privacy !== 'private' && i.privacy !== 'protected'
    ) ?? [];
  return items.length > 0;
}

export function renderAPITable(element, type, options = { container: 'flat' }) {
  const items =
    element.manifest[typeAliasMap[type]]
      ?.filter(i => !i.name?.startsWith?.('nve-') && i.privacy !== 'private' && i.privacy !== 'protected')
      ?.sort(i => (i.deprecated ? 1 : -1)) ?? [];
  const noItems = items.length === 0;
  return /* html */ `
  <div class="api-table" nve-layout="column gap:sm full">
    <nve-grid container="${options.container}" style="min-height: 100px">
      <nve-grid-header>
        <nve-grid-column width="200px">${type.charAt(0).toUpperCase() + type.slice(1)}</nve-grid-column>
        ${type === 'property' ? '<nve-grid-column width="200px">Attribute</nve-grid-column>' : ''}
        <nve-grid-column>Description</nve-grid-column>
        ${type === 'property' ? '<nve-grid-column>Values</nve-grid-column>' : ''}
      </nve-grid-header>
      ${items
        .map(i => {
          const rawDescription = i.deprecated ?? i.descriptionText ?? i.description;
          const description = rawDescription
            ? markdown
                .render(rawDescription)
                .trim()
                .replaceAll('<p', `<p nve-text="body relaxed sm${i.deprecated ? ' muted' : ''}"`)
                .replaceAll('<code', '<code nve-text="code nowrap"')
            : '';
          return /* html */ `<nve-grid-row>
        <nve-grid-cell><span nve-text="code nowrap">${i.name === '' ? 'default' : i.name}</span></nve-grid-cell>
        ${type === 'property' ? /* html */ `<nve-grid-cell><span nve-text="code nowrap">${i.attribute ?? 'none'}</span></nve-grid-cell>` : ''}
        <nve-grid-cell>
          <div nve-layout="column gap:xs">${i.deprecated ? '<nve-badge status="warning" container="flat">deprecated</nve-badge>' : ''}${description}</div>
        </nve-grid-cell>
        ${
          type === 'property'
            ? /* html */ `<nve-grid-cell>
          <div nve-layout="${i.type?.values?.some(v => v.description) ? 'column gap:xs' : 'row gap:xxs align:wrap'}">
          ${(i.type?.values ?? [])
            .map(
              v =>
                /* html */ `<div><span nve-text="code nowrap">${v.value}</span> ${v.description ? v.description : ''}</div>`
            )
            .join('')}
          </div>
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
