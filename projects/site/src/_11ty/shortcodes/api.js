// @ts-check

import markdown from '../libraries/markdown.js';
import { siteData } from '../../index.11tydata.js';

const { elements } = siteData;

/**
 * @typedef {import('../types.js').ApiItem} ApiItem
 * @typedef {import('../types.js').ApiManifest} ApiManifest
 * @typedef {import('../types.js').ApiElement} ApiElement
 * @typedef {import('../types.js').ApiTableOptions} ApiTableOptions
 */

/**
 * @param {string} tag
 * @param {string} type
 * @param {string | null} [name]
 * @param {string | null} [value]
 */
export async function apiShortcode(tag, type, name = null, value = null) {
  const element = elements.find(d => d.name === tag);
  if (!element?.manifest) return '';

  if (type === 'description') {
    return markdown
      .render(element.manifest.description ?? '')
      .trim()
      .replaceAll('<p>', '<p class="api-description" nve-text="body relaxed mkd">');
  }

  let content;
  const items = getAPIItems(element, type);
  if (name !== null && !items.some(item => item.name === name)) return '';

  if (type === 'method') {
    content = renderAPITable(element, type, { container: 'flat', methodName: name });
  } else {
    const item = name === null ? undefined : items.find(item => item.name === name);
    if (!item) content = renderAPITable(element, type);
    else if (value === null) content = renderAPINameTable(item);
    else content = renderAPIValueDescription(item, value);
  }
  if (!content) return '';

  return `<div class="api-shortcode" nve-layout="column gap:sm">${content}</div>`.replaceAll('\n', '');
}

/**
 * @param {ApiItem} apiItem
 * @param {string} value
 */
function renderAPIValueDescription(apiItem, value) {
  const valueItem = apiItem.type?.values?.find(v => v.value === value);
  return /* html */ `${valueItem?.description ?? ''}`;
}

/** @param {ApiItem} apiValue */
export function renderAPINameTable(apiValue) {
  const values = apiValue.type?.values ?? [];
  const description = markdown
    .render(values.length ? (apiValue.descriptionText ?? apiValue.description ?? '') : (apiValue.description ?? ''))
    .trim();
  if (!description && !values.length) return '';

  return /* html */ `
  <div class="api-value-table" nve-layout="column gap:sm full">
    ${
      values.length
        ? /* html */ `
    ${description.replaceAll('<p>', '<p nve-text="body relaxed">')}
    <nve-grid role="grid" container="flat" aria-label="api options for '${apiValue.name}'">
      <nve-grid-header role="row">
        <nve-grid-column role="columnheader" width="200px">${apiValue.name.charAt(0).toUpperCase() + apiValue.name.slice(1)}</nve-grid-column>
        <nve-grid-column role="columnheader">Description</nve-grid-column>
      </nve-grid-header>
      ${values
        .filter(i => !i.deprecated)
        .map(
          i => /* html */ `<nve-grid-row role="row">
        <nve-grid-cell role="gridcell"><span nve-text="code nowrap">${escapeHtml(i.value)}</span></nve-grid-cell>
        <nve-grid-cell role="gridcell">${i.description ?? ''}</nve-grid-cell>
      </nve-grid-row>`
        )
        .join('')}
    </nve-grid>`
        : description.replaceAll('nve-text', 'class="api-value-table-description" nve-text')
    }
  </div>`;
}

/**
 * @param {ApiElement} element
 * @param {string} type
 */
export function hasAPIData(element, type) {
  return getAPIItems(element, type).length > 0;
}

/**
 * @param {ApiElement} element
 * @param {string} type
 * @returns {ApiItem[]}
 */
function getAPIItems(element, type) {
  const manifest = element.manifest ?? {};
  /** @type {ApiItem[] | undefined} */
  let items;
  switch (type) {
    case 'property':
      items = manifest.members?.filter(member => member.kind === 'field');
      break;
    case 'method':
      items = manifest.members?.filter(member => member.kind === 'method');
      break;
    case 'command':
      items = manifest.commands;
      break;
    case 'event':
      items = manifest.events;
      break;
    case 'slot':
      items = manifest.slots;
      break;
    case 'css-property':
      items = manifest.cssProperties;
      break;
    case 'css-part':
      items = manifest.cssParts;
      break;
    default:
      items = [];
  }
  return (items ?? [])
    .filter(item => !item.name?.startsWith?.('nve-') && item.privacy !== 'private' && item.privacy !== 'protected')
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** @param {ApiItem} method */
function formatMethodSignature(method) {
  const parameters = (method.parameters ?? [])
    .map(parameter => {
      const optional = parameter.optional || parameter.default !== undefined ? '?' : '';
      return `${parameter.name}${optional}: ${parameter.type?.text ?? 'unknown'}`;
    })
    .join(', ');
  return `${method.name}(${parameters}): ${method.return?.type?.text ?? 'unknown'}`;
}

/** @param {ApiItem[]} methods */
function groupMethods(methods) {
  /** @type {Map<string, ApiItem[]>} */
  const groups = new Map();
  for (const method of methods) {
    const group = groups.get(method.name) ?? [];
    group.push(method);
    groups.set(method.name, group);
  }
  return [...groups.values()].map(group => ({
    ...(group.find(method => method.description) ?? group[0]),
    signatures: [...new Set(group.map(formatMethodSignature))]
  }));
}

/**
 * @param {ApiElement} element
 * @param {string} type
 * @param {ApiTableOptions} [options]
 */
export function renderAPITable(element, type, options = { container: 'flat' }) {
  if (type === 'method') return renderMethodTable(element, options);

  const items = getAPIItems(element, type);
  const columns = [
    `<nve-grid-column role="columnheader" width="200px">${type.charAt(0).toUpperCase() + type.slice(1)}</nve-grid-column>`,
    ...(type === 'property' ? ['<nve-grid-column role="columnheader" width="200px">Attribute</nve-grid-column>'] : []),
    '<nve-grid-column role="columnheader">Description</nve-grid-column>',
    ...(type === 'property' ? ['<nve-grid-column role="columnheader">Values</nve-grid-column>'] : [])
  ];
  const rows = items.map(
    i => /* html */ `<nve-grid-row role="row">
      <nve-grid-cell role="gridcell"><span nve-text="code nowrap">${escapeHtml(i.name === '' ? 'default' : i.name)}</span></nve-grid-cell>
      ${type === 'property' ? /* html */ `<nve-grid-cell role="gridcell"><span nve-text="code nowrap">${escapeHtml(getMemberAttributeName(element.manifest, i) ?? 'none')}</span></nve-grid-cell>` : ''}
      <nve-grid-cell role="gridcell">${renderDescription(i)}</nve-grid-cell>
      ${type === 'property' ? renderPropertyValues(i) : ''}
    </nve-grid-row>`
  );

  return renderAPIGrid(type, columns, rows, options.container);
}

/**
 * @param {ApiElement} element
 * @param {ApiTableOptions} options
 */
function renderMethodTable(element, options) {
  const methods = groupMethods(
    getAPIItems(element, 'method').filter(method => options.methodName == null || method.name === options.methodName)
  );
  const columns = [
    '<nve-grid-column role="columnheader" width="200px">Method</nve-grid-column>',
    '<nve-grid-column role="columnheader">Signatures</nve-grid-column>',
    '<nve-grid-column role="columnheader">Description</nve-grid-column>'
  ];
  const rows = methods.map(
    method => /* html */ `<nve-grid-row role="row">
      <nve-grid-cell role="gridcell"><span nve-text="code nowrap">${escapeHtml(method.name)}</span></nve-grid-cell>
      <nve-grid-cell role="gridcell"><div nve-layout="column gap:xs">${method.signatures.map(signature => `<span nve-text="code">${escapeHtml(signature)}</span>`).join('')}</div></nve-grid-cell>
      <nve-grid-cell role="gridcell">${renderDescription(method)}</nve-grid-cell>
    </nve-grid-row>`
  );

  return renderAPIGrid('method', columns, rows, options.container);
}

/** @param {ApiItem} property */
function renderPropertyValues(property) {
  return /* html */ `<nve-grid-cell role="gridcell">
    <div nve-layout="${property.type?.values?.some(value => value.description) ? 'column gap:xs' : 'row gap:xxs align:wrap'}">
      ${(property.type?.values ?? [])
        .map(
          value =>
            /* html */ `<div><span nve-text="code nowrap">${escapeHtml(value.value)}</span> ${value.description ?? ''}</div>`
        )
        .join('')}
    </div>
  </nve-grid-cell>`;
}

/** @param {ApiItem} item */
function renderDescription(item) {
  const rawDescription =
    typeof item.deprecated === 'string' ? item.deprecated : (item.descriptionText ?? item.description);
  const description = rawDescription
    ? markdown
        .render(rawDescription)
        .trim()
        .replaceAll('<p', `<p nve-text="body relaxed sm${item.deprecated ? ' muted' : ''}"`)
        .replaceAll('<code', '<code nve-text="code nowrap"')
    : '';
  return `<div nve-layout="column gap:xs">${item.deprecated ? '<nve-badge status="warning" container="flat">deprecated</nve-badge>' : ''}${description}</div>`;
}

/**
 * @param {string} type
 * @param {string[]} columns
 * @param {string[]} rows
 * @param {string} container
 */
function renderAPIGrid(type, columns, rows, container) {
  return /* html */ `
  <div class="api-table" nve-layout="column gap:sm full">
    <nve-grid role="grid" aria-label="api ${type}" container="${container}" style="min-height: 100px">
      <nve-grid-header role="row">
        ${columns.join('')}
      </nve-grid-header>
      ${rows.join('')}
      ${
        rows.length === 0
          ? /* html */ `<nve-grid-placeholder>
        <p nve-text="body relaxed sm">No ${type}s found</p>
      </nve-grid-placeholder>`
          : ''
      }
    </nve-grid>
  </div>`;
}

/**
 * @param {ApiManifest | undefined} manifest
 * @param {ApiItem} member
 */
function getMemberAttributeName(manifest, member) {
  if (member.attribute) {
    return member.attribute;
  }

  const normalizedMemberName = member.name.toLowerCase();
  const attribute = manifest?.attributes?.find(
    attr =>
      attr.fieldName === member.name || attr.name === member.name || attr.name.toLowerCase() === normalizedMemberName
  );
  return attribute?.name;
}

/** @param {unknown} value */
function escapeHtml(value) {
  return markdown.utils.escapeHtml(`${value ?? ''}`);
}
