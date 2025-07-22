// @ts-check

import markdown from 'markdown-it';
import { ESM_ELEMENTS_VERSION } from '../utils/version.js';
import { siteData } from '../../index.11tydata.js';

const { elements } = siteData;

// Base URL for package releases
const PACKAGE_URL = 'https://github.com/NVIDIA/elements/-/releases';

// Initialize markdown parser and metadata service
const md = markdown();

/**
 * Generates a summary section for a component including description, status badges, and metadata links
 * @param {string} tag - The component tag name
 * @returns {string} HTML string containing the component summary
 */
export function elementSummary(tag) {
  const element = elements.find(d => d.name === tag);

  return /* html */ `<section nve-layout="column gap:md align:stretch margin-top:md">
  ${element.manifest.description ? md.render(element.manifest.description).replace('<p>', '<p nve-text="heading muted sm">') : ''}

  <div nve-layout="row gap:xs align:center align:space-between align:wrap">
    <div nve-layout="row gap:xs align:center">
      ${badgeStatus(element.manifest.metadata.status, '', ESM_ELEMENTS_VERSION)}
      ${badgeCoverage(element.tests.unit.coverageTotal, '', 'Coverage:&nbsp;')}
      ${badgeBundle(element.tests.lighthouse?.payload?.javascript?.kb?.toFixed(2), '', 'Bundle:&nbsp;')}
      ${badgeLighthouse(element.tests.lighthouse?.scores, '', 'Lighthouse:&nbsp;')}
      ${badgeAxe(element.manifest.metadata.axe, '')}
    </div>

    <div nve-layout="row gap:xs align:center">
      ${element.manifest.metadata.behavior === 'form' ? /* html */ `<nve-button size="sm"><nve-icon name="checklist" size="sm"></nve-icon><a href="./docs/foundations/forms/controls/#form-associated-elements" target="_blank">Form Control</a></nve-button>` : ''}
      
      <nve-button size="sm" style="margin-left: auto"><nve-icon name="group" size="sm"></nve-icon><a href="${element.manifest.metadata.aria}" target="_blank">ARIA Spec</a></nve-button>

      ${element.manifest.metadata.figma ? /* html */ `<nve-button size="sm"><nve-icon name="shapes" size="sm"></nve-icon><a href="${element.manifest.metadata.figma}" target="_blank">Figma</a></nve-button>` : ''}
      
      <nve-button size="sm"><nve-icon name="merge" size="sm"></nve-icon><a href="${PACKAGE_URL}" target="_blank">Released: ${element.manifest.metadata.since}</a></nve-button>
    </div>
  </div>
</section>`;
}

/**
 * Generates a status badge with appropriate color based on component status
 * @param {string} status - Component status (pre-release, beta, stable)
 * @param {string} container - Container class for the badge
 * @param {string} content - Additional content to display
 * @returns {string} HTML string for the status badge
 */
export function badgeStatus(status, container = '', content = '') {
  const statuses = {
    'pre-release': 'warning',
    beta: 'accent',
    stable: 'success',
    undefined: 'unknown'
  };

  return /* html */ `
  <nve-badge container="${container}" status="${statuses[status]}">
    ${status ? status : 'unknown'}: &nbsp;${content}
  </nve-badge>
  `;
}

/**
 * Generates a coverage badge with color based on test coverage percentage
 * @param {number} value - Test coverage percentage
 * @param {string} container - Container class for the badge
 * @param {string} content - Additional content to display
 * @returns {string} HTML string for the coverage badge
 */
export function badgeCoverage(value, container = '', content = '') {
  let status = 'unknown';
  let formattedValue = value
    ? new Intl.NumberFormat('default', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value / 100)
    : null;

  if (value !== undefined) {
    if (value >= 90) {
      status = 'success';
    } else if (value >= 70) {
      status = 'warning';
    } else {
      status = 'danger';
    }
  }

  return /* html */ `
  <nve-badge container="${container}" status="${status}">${content}${formattedValue}</nve-badge>
  `;
}

/**
 * Generates a bundle size badge with color based on JavaScript bundle size
 * @param {number} value - Bundle size in KB
 * @param {string} container - Container class for the badge
 * @param {string} content - Additional content to display
 * @returns {string} HTML string for the bundle size badge
 */
export function badgeBundle(value, container = '', content = '') {
  let status = 'unknown';
  if (value !== undefined) {
    if (value <= 25) {
      status = 'success';
    } else if (value <= 40) {
      status = 'warning';
    } else {
      status = 'danger';
    }
  }

  return /* html */ `
<nve-badge container="${container}" status="${status}">${content}${value}${value ? 'kb' : ''}</nve-badge>
  `;
}

/**
 * Generates a Lighthouse score badge with color based on average score
 * @param {Object} value - Lighthouse scores object
 * @param {string} container - Container class for the badge
 * @param {string} content - Additional content to display
 * @returns {string} HTML string for the Lighthouse score badge
 */
export function badgeLighthouse(value, container = '', content = '') {
  const values = Object.keys(value ?? {})
    .map(key => (value ?? {})[key])
    .filter(value => value !== undefined);
  const average = values.length ? Math.floor(values.reduce((prev, next) => prev + next, 0) / values.length) : null;

  let status = 'unknown';
  if (value !== null) {
    if (average && average > 95) {
      status = 'success';
    } else if (average && average > 80) {
      status = 'warning';
    } else {
      status = 'danger';
    }
  }

  return /* html */ `
  <nve-badge status="${status}" container="${container}" style="--text-transform: none">
    <a href="https://developer.chrome.com/docs/lighthouse/overview/" target="_blank">${content}${average}</a>
  </nve-badge>
  `;
}

/**
 * Generates an Axe accessibility badge with appropriate status
 * @param {string|boolean} value - Axe accessibility status
 * @param {string} container - Container class for the badge
 * @returns {string} HTML string for the Axe accessibility badge
 */
export function badgeAxe(value, container = '') {
  return /* html */ `
  ${value === undefined || value === '' ? /* html */ `<nve-badge container="${container}" status="success" style="--text-transform: none"><a href="https://github.com/dequelabs/axe-core" target="_blank">Axe Core</a></nve-badge>` : ''}
  ${value === false ? /* html */ `<nve-badge container="${container}" status="pending">Pending</nve-badge>` : ''}
  ${value ? /* html */ `<nve-badge container="${container}" status="warning" style="--text-transform: none"><a href="https://dequeuniversity.com/rules/axe/4.8/${value}?application=axeAPI" target="_blank">${value}</a></nve-badge>` : ''}
  `;
}

/**
 * Generates a detailed status section showing component development progress
 * @param {string} tag - The component tag name
 * @returns {string} HTML string containing the component status section
 */
export function elementStatus(tag) {
  const elementMetadata = elements.find(d => d.name === tag)?.manifest?.metadata;

  return /* html */ `
  <h2 nve-text="heading xl mkd" id="release-status">Release Status</h2>

  <div nve-layout="column gap:md">
    <p nve-text="body">All elements and features go through 3 phases of stability, pre-release, beta and stable.</p>

    <div nve-layout="column gap:sm">
      <nve-badge status="${elementMetadata.status === 'pre-release' ? 'warning' : 'pending'}">pre-release <nve-icon name="exclamation-triangle"></nve-icon></nve-badge>
      
      <div nve-layout="column gap:xs">
        <nve-alert status="${elementMetadata.figma ? 'finished' : 'pending'}">Published in <a href="http://nv/elements-figma">Figma</a></nve-alert>
        <nve-alert status="${elementMetadata.storybook ? 'finished' : 'pending'}">Docs Preview</nve-alert>
        <nve-alert status="${elementMetadata.storybook ? 'finished' : 'pending'}">API Documentation</nve-alert>
        <nve-alert status="${elementMetadata.themes ? 'finished' : 'pending'}">Fully Themeable</nve-alert>
      </div>
    </div>

    <div nve-layout="column gap:sm">
      <nve-badge status="${elementMetadata.status === 'beta' ? 'running' : 'pending'}">beta <nve-icon name="clock"></nve-icon></nve-badge>

      <div nve-layout="column gap:xs">
        <nve-alert status="${elementMetadata.unitTests ? 'finished' : 'pending'}">Robust unit test coverages</nve-alert>
        <nve-alert status="${elementMetadata.apiReview ? 'finished' : 'pending'}">Passed <a href="docs/api-design/">API Review</a></nve-alert>
        <nve-alert status="${elementMetadata.vqa ? 'finished' : 'pending'}">Passed Designer VQA Review</nve-alert>
        <nve-alert status="${elementMetadata.package ? 'finished' : 'pending'}">Included in <a href="http://nv/elements">library package</a></nve-alert>
      </div>
    </div>

    <div nve-layout="column gap:sm">
      <nve-badge status="${elementMetadata.status === 'stable' ? 'finished' : 'pending'}">stable <nve-icon name="checkmark-circle"></nve-icon></nve-badge>
      
      <div nve-layout="column gap:xs">
        <nve-alert status="${elementMetadata.aria ? 'finished' : 'pending'}">No known outstanding <a href="https://www.w3.org/WAI/ARIA/apg/">AA WCAG issues</a></nve-alert>
        <nve-alert status="${elementMetadata.performance ? 'finished' : 'pending'}">No known outstanding performance issues</nve-alert>
        <nve-alert status="${elementMetadata.responsive ? 'finished' : 'pending'}">Adapts to different screen/container sizes</nve-alert>
        <nve-alert status="${elementMetadata.stable ? 'finished' : 'pending'}">No breaking API changes for at least 90 days</nve-alert>
      </div>
    </div>
  </div>
  `;
}

/**
 * Generates API documentation tables for a component
 * @param {string} tag - The component tag name
 * @param {string} type - The type of documentation to generate (all, properties, events, slots, css-properties)
 * @returns {string} HTML string containing the API documentation tables
 */
export function elementTable(tag, type = 'all') {
  const elementManifest = elements.find(d => d.name === tag)?.manifest;

  return elementManifest
    ? /* html */ `
    <h2 nve-text="heading xl mkd" id="${tag}"><code>&lt;${tag}&gt;</code></h2>
    ${type === 'properties' || type === 'all' ? renderProperties() : ''}
    ${type === 'events' || type === 'all' ? renderEvents() : ''}
    ${type === 'slots' || type === 'all' ? renderSlots() : ''}
    ${type === 'css-properties' || type === 'all' ? renderCssProperties() : ''}
  `
    : '';

  /**
   * Renders the properties table for the component
   * @returns {string} HTML string for the properties table
   */
  function renderProperties() {
    return /* html */ `
      <div nve-layout="column gap:md">
        ${type === 'all' ? /* html */ `<h3 nve-text="heading lg mkd">Properties</h3>` : ''}
        <!-- roles are temporary workaround due to lighthouse audits not understanding element internals role -->
        <nve-grid role="grid" style="min-height: 100px">
          <nve-grid-header role="row">
            <nve-grid-column role="columnheader" width="120px">Property</nve-grid-column>
            <nve-grid-column role="columnheader" width="180px">Attribute</nve-grid-column>
            <nve-grid-column role="columnheader">Description</nve-grid-column>
            <nve-grid-column role="columnheader">Type</nve-grid-column>
          </nve-grid-header>
          ${elementManifest.attributes
            ?.map(
              attr => /* html */ `
          <nve-grid-row role="row">
            <nve-grid-cell role="cell">${attr.fieldName}</nve-grid-cell>
            <nve-grid-cell role="cell">${attr.name}</nve-grid-cell>
            <nve-grid-cell role="cell">${md.render(attr.description ?? '')}</nve-grid-cell>
            <nve-grid-cell role="cell">
              <div nve-layout="row gap:xxs align:wrap">
                ${
                  attr.type?.text
                    ? /* html */ `${attr.type?.text
                        .split(' | ')
                        .map(
                          i =>
                            /* html */ `<nve-tag readonly color="gray-slate">${md.render(i.replaceAll("'", ''))}</nve-tag>`
                        )
                        .join('')}`
                    : ''
                }
                ${attr.enum ? /* html */ `${attr.enum.map(i => /* html */ `<nve-tag readonly color="gray-slate">${md.render(i.replaceAll("'", ''))}</nve-tag>`).join('')}` : ''}
                ${attr.type && !attr.type.text ? /* html */ `<nve-tag readonly color="gray-slate">${md.render(attr.type.replaceAll("'", '').join(''))}</nve-tag>` : ''}
              </div>
            </nve-grid-cell>
          </nve-grid-row>
          `
            )
            .join('')}
          ${!elementManifest.attributes?.length ? /* html */ `<nve-grid-placeholder role="row"><h4 nve-text="body">no properties</h4></nve-grid-placeholder>` : ''}
        </nve-grid>
      </div>
    `;
  }

  /**
   * Renders the events table for the component
   * @returns {string} HTML string for the events table
   */
  function renderEvents() {
    return /* html */ `
    <div nve-layout="column gap:md">
      ${type === 'all' ? /* html */ `<h3 nve-text="heading lg mkd">Events</h3>` : ''}
      <nve-grid role="grid" style="min-height: 100px">
        <nve-grid-header role="row">
          <nve-grid-column role="columnheader">Event</nve-grid-column>
          <nve-grid-column role="columnheader">Description</nve-grid-column>
        </nve-grid-header>
        ${elementManifest.events
          ?.map(
            event => /* html */ `
        <nve-grid-row role="row">
          <nve-grid-cell role="cell">${event.name}</nve-grid-cell>
          <nve-grid-cell role="cell">${md.render(event.description ?? '')}</nve-grid-cell>
        </nve-grid-row>`
          )
          .join('')}
        ${!elementManifest.events?.length ? /* html */ `<nve-grid-placeholder role="row"><h4 nve-text="body">no events</h4></nve-grid-placeholder>` : ''}
      </nve-grid>
    </div>
    `;
  }

  /**
   * Renders the slots table for the component
   * @returns {string} HTML string for the slots table
   */
  function renderSlots() {
    return /* html */ `
    <div nve-layout="column gap:md">
      ${type === 'all' ? /* html */ `<h3 nve-text="heading lg mkd">Slots</h3>` : ''}
      <nve-grid role="grid" style="min-height: 100px">
        <nve-grid-header role="row">
          <nve-grid-column role="columnheader">Slot</nve-grid-column>
          <nve-grid-column role="columnheader">Description</nve-grid-column>
        </nve-grid-header>
        ${elementManifest.slots
          ?.map(
            slot => /* html */ `
        <nve-grid-row role="row">
          <nve-grid-cell role="cell">${slot.name?.length ? slot.name : 'Default'}</nve-grid-cell>
          <nve-grid-cell role="cell">${md.render(slot.description ?? '')}</nve-grid-cell>
        </nve-grid-row>`
          )
          .join('')}
        ${!elementManifest.slots?.length ? /* html */ `<nve-grid-placeholder role="row"><h4 nve-text="body">no slots</h4></nve-grid-placeholder>` : ''}
      </nve-grid>
    </div>
    `;
  }

  /**
   * Renders the CSS properties table for the component
   * @returns {string} HTML string for the CSS properties table
   */
  function renderCssProperties() {
    return /* html */ `
    <div nve-layout="column gap:md">
      ${type === 'all' ? /* html */ `<h3 nve-text="heading lg mkd">CSS Properties</h3>` : ''}
      <nve-grid role="grid" style="min-height: 100px">
        <nve-grid-header role="row">
          <nve-grid-column role="columnheader">Name</nve-grid-column>
          <nve-grid-column role="columnheader">Description</nve-grid-column>
        </nve-grid-header>
        ${elementManifest.cssProperties
          ?.map(
            prop => /* html */ `
        <nve-grid-row role="row">
          <nve-grid-cell role="cell">${prop.name}</nve-grid-cell>
          <nve-grid-cell role="cell">
            ${
              !prop.name.includes('icon')
                ? /* html */ `<a href=${`https://developer.mozilla.org/en-US/docs/Web/CSS/${prop.name.replace('--', '')}`} target="_blank" rel="none">MDN Documentation</a>`
                : ''
            }
          </nve-grid-cell>
        </nve-grid-row>`
          )
          .join('')}
        ${!elementManifest.cssProperties?.length ? /* html */ `<nve-grid-placeholder role="row"><h4 nve-text="body">no css properties</h4></nve-grid-placeholder>` : ''}
      </nve-grid>
    </div>
    `;
  }
}
